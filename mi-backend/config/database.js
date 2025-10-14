// ============================================
// CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL
// ============================================
// Archivo: config/database.js

const { Pool } = require('pg');
require('dotenv').config();

// Detectar entorno
const isProduction = process.env.NODE_ENV === 'production';

// Configuración según el entorno
const config = isProduction
    ? {
        // ============================================
        // CONFIGURACIÓN PARA PRODUCCIÓN (RENDER)
        // ============================================
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Necesario para Render, Railway, etc.
        },
        // Configuración de pool optimizada para producción
        max: 20, // Máximo 20 conexiones
        idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
        connectionTimeoutMillis: 10000, // Timeout de 10s
    }
    : {
        // ============================================
        // CONFIGURACIÓN PARA DESARROLLO LOCAL
        // ============================================
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'saludclara',
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        // Configuración de pool para desarrollo
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    };

// Crear pool de conexiones
const pool = new Pool(config);

// ============================================
// EVENTOS DEL POOL (Monitoreo y debugging)
// ============================================

pool.on('connect', (client) => {
    if (!isProduction) {
        console.log('🔌 Nueva conexión establecida al pool de PostgreSQL');
    }
});

pool.on('acquire', (client) => {
    if (!isProduction) {
        console.log('📥 Cliente adquirido del pool');
    }
});

pool.on('remove', (client) => {
    if (!isProduction) {
        console.log('📤 Cliente removido del pool');
    }
});

pool.on('error', (err, client) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
    console.error('   Stack:', err.stack);
});

// ============================================
// FUNCIONES ÚTILES
// ============================================

/**
 * Verificar la conexión a la base de datos
 */
async function verificarConexion() {
    let client;
    try {
        console.log('\n🔍 Verificando conexión a PostgreSQL...');
        
        client = await pool.connect();
        const result = await client.query('SELECT NOW() as tiempo, current_database() as db, version() as version');
        
        console.log('✅ Conexión a PostgreSQL exitosa');
        console.log(`   📊 Base de datos: ${result.rows[0].db}`);
        console.log(`   ⏰ Tiempo del servidor: ${result.rows[0].tiempo}`);
        console.log(`   📦 Versión: ${result.rows[0].version.split(',')[0]}`);
        console.log(`   🌍 Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
        
        return true;
    } catch (error) {
        console.error('\n❌ Error al conectar a PostgreSQL:');
        console.error(`   Mensaje: ${error.message}`);
        
        if (!isProduction) {
            console.error('\n   💡 Verifica que:');
            console.error('      1. PostgreSQL esté corriendo (services.msc en Windows)');
            console.error('      2. Las credenciales en .env sean correctas');
            console.error('      3. La base de datos exista en pgAdmin 4');
            console.error(`      4. DB_NAME: ${config.database || 'No configurado'}`);
            console.error(`      5. DB_USER: ${config.user || 'No configurado'}`);
            console.error(`      6. DB_HOST: ${config.host || 'No configurado'}`);
            console.error(`      7. DB_PORT: ${config.port || 'No configurado'}`);
        } else {
            console.error('   💡 Verifica que DATABASE_URL esté configurada en Render');
        }
        
        return false;
    } finally {
        if (client) {
            client.release();
        }
    }
}

/**
 * Cerrar todas las conexiones del pool (útil para shutdown)
 */
async function cerrarPool() {
    try {
        await pool.end();
        console.log('🔌 Pool de conexiones cerrado correctamente');
    } catch (error) {
        console.error('❌ Error al cerrar pool:', error.message);
    }
}

/**
 * Ejecutar query con logging mejorado (solo en desarrollo)
 */
async function query(text, params) {
    const start = Date.now();
    
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log detallado solo en desarrollo
        if (!isProduction && duration > 100) {
            console.log('⚠️  Query lenta detectada:');
            console.log(`   Duración: ${duration}ms`);
            console.log(`   Query: ${text.substring(0, 60)}...`);
            console.log(`   Filas: ${res.rowCount}`);
        }
        
        return res;
    } catch (error) {
        console.error('\n❌ Error en query:');
        console.error(`   Mensaje: ${error.message}`);
        console.error(`   Query: ${text.substring(0, 100)}...`);
        if (params) {
            console.error(`   Params: ${JSON.stringify(params)}`);
        }
        throw error;
    }
}

/**
 * Obtener un cliente del pool (para transacciones)
 */
async function getClient() {
    const client = await pool.connect();
    const release = client.release.bind(client);
    
    // Agregar timeout para detectar clientes no liberados
    const timeout = setTimeout(() => {
        console.error('⚠️  Cliente del pool retenido por más de 5 segundos');
        console.error('   Posible memory leak - asegúrate de llamar client.release()');
    }, 5000);
    
    // Override del release para limpiar el timeout
    client.release = () => {
        clearTimeout(timeout);
        return release();
    };
    
    return client;
}

/**
 * Ejecutar transacciones de forma segura
 */
async function transaction(callback) {
    const client = await getClient();
    
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Transacción revertida:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Inicializar tablas si no existen
 */
async function inicializarTablas() {
    const client = await getClient();
    
    try {
        console.log('\n🔧 Verificando/creando tablas...');
        
        // Crear tabla de usuarios
        await client.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                telefono VARCHAR(20),
                password_hash VARCHAR(255),
                google_id VARCHAR(100),
                foto_perfil TEXT,
                tipo_auth VARCHAR(20) DEFAULT 'local',
                activo BOOLEAN DEFAULT true,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ultimo_acceso TIMESTAMP
            )
        `);
        
        // Crear índice en email
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)
        `);
        
        // Crear tabla de citas
        await client.query(`
            CREATE TABLE IF NOT EXISTS citas (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                codigo_confirmacion VARCHAR(50) UNIQUE NOT NULL,
                nombre_paciente VARCHAR(100) NOT NULL,
                email_paciente VARCHAR(100) NOT NULL,
                telefono_paciente VARCHAR(20),
                tipo_cita VARCHAR(50) NOT NULL,
                lugar VARCHAR(200),
                especialidad VARCHAR(100) NOT NULL,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                motivo TEXT,
                estado VARCHAR(20) DEFAULT 'confirmada',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Crear índices para citas
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_citas_usuario ON citas(usuario_id)
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha)
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_citas_codigo ON citas(codigo_confirmacion)
        `);
        
        // Crear tabla de conversaciones
        await client.query(`
            CREATE TABLE IF NOT EXISTS conversaciones (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
                mensaje TEXT NOT NULL,
                respuesta TEXT NOT NULL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Crear índice para conversaciones
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_conversaciones_usuario ON conversaciones(usuario_id)
        `);
        
        console.log('✅ Tablas verificadas/creadas correctamente\n');
        
        // Mostrar estadísticas (solo en desarrollo)
        if (!isProduction) {
            const stats = await client.query(`
                SELECT 
                    (SELECT COUNT(*) FROM usuarios) as usuarios,
                    (SELECT COUNT(*) FROM citas) as citas,
                    (SELECT COUNT(*) FROM conversaciones) as conversaciones
            `);
            
            console.log('📊 Estadísticas de la base de datos:');
            console.log(`   👥 Usuarios: ${stats.rows[0].usuarios}`);
            console.log(`   📅 Citas: ${stats.rows[0].citas}`);
            console.log(`   💬 Conversaciones: ${stats.rows[0].conversaciones}\n`);
        }
        
    } catch (error) {
        console.error('❌ Error al inicializar tablas:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Healthcheck de la base de datos
 */
async function healthCheck() {
    try {
        const result = await pool.query('SELECT 1 as ok');
        return { ok: true, message: 'Base de datos operativa' };
    } catch (error) {
        return { ok: false, message: error.message };
    }
}

// ============================================
// EXPORTAR MÓDULO
// ============================================

module.exports = {
    pool,
    query,
    getClient,
    transaction,
    verificarConexion,
    cerrarPool,
    inicializarTablas,
    healthCheck,
    isProduction
};