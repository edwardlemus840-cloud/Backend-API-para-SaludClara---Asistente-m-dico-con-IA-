// ============================================
// CONFIGURACIÓN DEL FRONTEND
// ============================================

// Configuración del Backend
// IMPORTANTE: Cambiar estas URLs según tu entorno

const CONFIG = {
    // URL del backend
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'  // Desarrollo local
        : 'https://saludclara-backend.onrender.com', // Producción en Render
    
    // Timeout para peticiones (en milisegundos)
    REQUEST_TIMEOUT: 30000,
    
    // Tamaño máximo de archivos (en bytes)
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    
    // Versión de la aplicación
    VERSION: '1.0.0'
};

// Exportar configuración
window.CONFIG = CONFIG;

console.log('🔧 Configuración cargada:', {
    API_URL: CONFIG.API_URL,
    Entorno: window.location.hostname === 'localhost' ? 'Desarrollo' : 'Producción'
});
