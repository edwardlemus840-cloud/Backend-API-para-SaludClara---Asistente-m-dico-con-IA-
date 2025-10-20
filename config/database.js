// ============================================
// CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

// Debug: Verificar qué configuración se está usando
console.log('🔍 DATABASE_URL presente:', !!process.env.DATABASE_URL);
console.log('🔍 Usando configuración:', process.env.DATABASE_URL ? 'Render (DATABASE_URL)' : 'Local (variables individuales)');

// Configuración para Render (usa DATABASE_URL) o local (usa variables individuales)
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        }
        : {
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'saludclara',
            password: process.env.DB_PASSWORD || 'postgres',
            port: process.env.DB_PORT || 5432,
        }
);

// Probar conexión
pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error en la conexión a PostgreSQL:', err);
});

module.exports = pool;
