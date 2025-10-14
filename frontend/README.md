# 🏥 SaludClara Frontend

Interfaz web para SaludClara - Asistente médico con IA

## 🚀 Despliegue en Render

### Características
- ✅ Asistente de diagnóstico con IA
- ✅ Traductor de términos médicos
- ✅ Sistema de reserva de citas
- ✅ Mapa interactivo de hospitales
- ✅ Análisis de documentos médicos (OCR)
- ✅ Autenticación con Google OAuth

### Tecnologías
- HTML5, CSS3, JavaScript (Vanilla)
- Tailwind CSS
- Leaflet.js (Mapas)
- Tesseract.js (OCR)
- EmailJS

## 📝 Configuración

### Actualizar URL del Backend
En `script.js`, actualiza la URL del backend:

```javascript
const API_URL = 'https://saludclara-backend.onrender.com';
```

### Google OAuth Client ID
En `index.html`, verifica que el Client ID esté configurado:

```html
data-client_id="33448340879-gb25tjh34q6ji7m35tpf0ajq7rkpf0v4.apps.googleusercontent.com"
```

## 🌐 Sitio Web

Desplegado en: `https://saludclara-frontend.onrender.com`

## 📚 Estructura

```
frontend/
├── index.html      # Página principal
├── script.js       # Lógica de la aplicación
├── styles.css      # Estilos personalizados
└── auth.js         # Autenticación (legacy)
```

## 🔗 Backend

Conectado a: https://saludclara-backend.onrender.com
