// ============================================
// CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'saludclara',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Probar conexión
pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error en la conexión a PostgreSQL:', err);
});

module.exports = pool;
