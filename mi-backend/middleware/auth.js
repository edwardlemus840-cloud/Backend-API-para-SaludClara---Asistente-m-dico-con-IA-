// ============================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ============================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambialo_en_produccion';

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded; // { id, email, nombre, tipo_auth }
        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

// Middleware opcional (permite acceso sin token)
const verificarTokenOpcional = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.usuario = decoded;
        }
        next();
    } catch (error) {
        // Si el token es inválido, simplemente continúa sin usuario
        next();
    }
};

// Generar token JWT
const generarToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            tipo_auth: usuario.tipo_auth
        },
        JWT_SECRET,
        { expiresIn: '7d' } // Token válido por 7 días
    );
};

module.exports = {
    verificarToken,
    verificarTokenOpcional,
    generarToken,
    JWT_SECRET
};
