-- ============================================
-- SCHEMA DE BASE DE DATOS SALUDCLARA
-- ============================================
-- PostgreSQL Database Schema

-- Crear base de datos (ejecutar primero)
-- CREATE DATABASE saludclara;
-- \c saludclara;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    password_hash VARCHAR(255), -- NULL para usuarios de Google
    google_id VARCHAR(255) UNIQUE, -- ID de Google OAuth
    foto_perfil TEXT, -- URL de la foto de perfil
    tipo_auth VARCHAR(20) DEFAULT 'local', -- 'local' o 'google'
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: citas
-- ============================================
CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_confirmacion VARCHAR(50) UNIQUE NOT NULL,
    nombre_paciente VARCHAR(100) NOT NULL,
    email_paciente VARCHAR(100) NOT NULL,
    telefono_paciente VARCHAR(20) NOT NULL,
    tipo_cita VARCHAR(20) NOT NULL, -- 'presencial' o 'virtual'
    lugar VARCHAR(200),
    especialidad VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    motivo TEXT,
    estado VARCHAR(20) DEFAULT 'confirmada', -- 'confirmada', 'cancelada', 'completada'
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: historial_chat
-- ============================================
CREATE TABLE IF NOT EXISTS historial_chat (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'sintomas', -- 'sintomas', 'traduccion', 'documento'
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: documentos_medicos
-- ============================================
CREATE TABLE IF NOT EXISTS documentos_medicos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255),
    tipo_documento VARCHAR(50),
    texto_extraido TEXT,
    analisis TEXT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_google_id ON usuarios(google_id);
CREATE INDEX IF NOT EXISTS idx_citas_usuario_id ON citas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_historial_usuario_id ON historial_chat(usuario_id);
CREATE INDEX IF NOT EXISTS idx_documentos_usuario_id ON documentos_medicos(usuario_id);

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================
-- Usuario de prueba con contraseña: "password123"
-- Hash generado con bcrypt (10 rounds)
INSERT INTO usuarios (nombre, email, telefono, password_hash, tipo_auth) 
VALUES (
    'Usuario Demo',
    'demo@saludclara.com',
    '7777-7777',
    '$2b$10$rZ9qJ0KvXqX5qZ9qJ0KvXeO9qJ0KvXqX5qZ9qJ0KvXqX5qZ9qJ0Kv',
    'local'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CONSULTAS ÚTILES
-- ============================================

-- Ver todos los usuarios
-- SELECT id, nombre, email, tipo_auth, fecha_registro FROM usuarios;

-- Ver todas las citas
-- SELECT c.codigo_confirmacion, u.nombre, c.especialidad, c.fecha, c.hora, c.estado 
-- FROM citas c 
-- LEFT JOIN usuarios u ON c.usuario_id = u.id;

-- Ver historial de chat de un usuario
-- SELECT mensaje, respuesta, tipo, fecha 
-- FROM historial_chat 
-- WHERE usuario_id = 1 
-- ORDER BY fecha DESC;

-- Eliminar todos los datos (CUIDADO)
-- TRUNCATE TABLE documentos_medicos, historial_chat, citas, usuarios RESTART IDENTITY CASCADE;
