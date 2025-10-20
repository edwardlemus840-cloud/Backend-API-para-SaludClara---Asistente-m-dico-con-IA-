# 🏥 SaludClara - Frontend

Frontend de la aplicación SaludClara con IA médica.

## 📋 Requisitos Previos

- Backend corriendo (ver carpeta `mi-backend`)
- Navegador web moderno
- Servidor web local (Live Server, http-server, etc.)

## 🚀 Configuración Rápida

### 1. Configurar la URL del Backend

Edita el archivo `config.js` y cambia la URL del backend según tu entorno:

```javascript
const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'  // ← Cambiar puerto si es necesario
        : 'https://tu-backend.onrender.com', // ← Tu URL de producción
};
```

### 2. Iniciar el Backend

Primero asegúrate de que el backend esté corriendo:

```bash
cd ../mi-backend
npm install
node server.js
```

Deberías ver:
```
✅ Servidor corriendo en http://localhost:3001
✅ Base de datos conectada
```

### 3. Abrir el Frontend

Opción A - Con Live Server (VS Code):
- Instala la extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

Opción B - Con http-server:
```bash
npx http-server -p 8080
```

Opción C - Abrir directamente:
- Abre `index.html` en tu navegador
- **Nota:** Algunas funciones pueden no funcionar por CORS

## 🔧 Solución de Problemas

### ❌ Error: "No se pudo conectar al backend"

**Causa:** El backend no está corriendo o la URL es incorrecta.

**Solución:**
1. Verifica que el backend esté corriendo en el puerto correcto
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que `config.js` tenga la URL correcta
4. Prueba acceder directamente a: `http://localhost:3001/api/health`

### ❌ Error: "Backend conectado pero sin API configurada"

**Causa:** Falta configurar las API keys en el backend.

**Solución:**
1. Ve a la carpeta `mi-backend`
2. Copia `.env.example` a `.env`
3. Agrega tu `GROQ_API_KEY` (gratis en https://console.groq.com/keys)
4. Reinicia el servidor backend

### ❌ Error de CORS

**Causa:** El frontend está abierto directamente sin servidor web.

**Solución:**
- Usa Live Server o http-server (ver paso 3)
- No abras el HTML directamente con `file://`

## 📁 Estructura de Archivos

```
frontend/
├── index.html          # Página principal
├── config.js          # ⚙️ CONFIGURACIÓN DEL BACKEND
├── script.js          # Lógica principal
├── auth.js            # Autenticación
├── styles.css         # Estilos
└── README.md          # Este archivo
```

## 🌐 Despliegue en Producción

### Render (Recomendado)

1. Sube el frontend a GitHub
2. Conecta con Render como "Static Site"
3. Actualiza `config.js` con la URL de tu backend en producción

### Netlify / Vercel

1. Conecta tu repositorio
2. Configura la variable de entorno `API_URL`
3. Despliega

## 📱 Características

✅ Responsive (móvil y desktop)
✅ Chatbot de diagnóstico con IA
✅ Traductor médico
✅ Sistema de citas
✅ Análisis de documentos médicos (OCR)
✅ Mapa de hospitales
✅ Autenticación con Google

## 🔗 Enlaces Útiles

- Backend: `../mi-backend/`
- Documentación completa: `../GUIA_GITHUB.md`
- Groq API Keys: https://console.groq.com/keys
- OpenAI API Keys: https://platform.openai.com/api-keys

## 💡 Notas Importantes

1. **Seguridad:** Las API keys NUNCA deben estar en el frontend, solo en el backend
2. **CORS:** El backend ya tiene CORS configurado para desarrollo y producción
3. **Puerto:** Por defecto el backend usa el puerto 3001
4. **Base de datos:** El backend necesita PostgreSQL configurado

## 🆘 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que el backend esté corriendo
3. Comprueba que `config.js` tenga la URL correcta
4. Asegúrate de tener las API keys configuradas en el backend
