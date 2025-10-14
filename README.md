# 🏥 SaludClara - Asistente Médico Inteligente

Sistema completo de salud con IA, autenticación dual (Google + Local), gestión de citas y análisis de documentos médicos.

## ✨ Características

### 🔐 Sistema de Autenticación
- ✅ Registro e inicio de sesión con email/contraseña
- ✅ Inicio de sesión con Google OAuth
- ✅ Tokens JWT con expiración de 7 días
- ✅ Protección de rutas sensibles
- ✅ Gestión de sesiones persistentes

### 🤖 Asistente de IA
- ✅ Chat de diagnóstico de síntomas (Groq/OpenAI)
- ✅ Traductor de términos médicos
- ✅ Análisis de documentos médicos con OCR
- ✅ Historial de conversaciones por usuario

### 📅 Sistema de Citas
- ✅ Reserva de citas médicas
- ✅ Selección de ubicación en mapa interactivo
- ✅ Citas presenciales y virtuales
- ✅ Confirmación por email (EmailJS)
- ✅ Código de confirmación único

### 🗺️ Mapa Interactivo
- ✅ Hospitales y clínicas de El Salvador
- ✅ Filtros por tipo de centro médico
- ✅ Integración con Leaflet.js

### 📄 Gestión de Documentos
- ✅ Subida de imágenes y PDFs
- ✅ OCR con Tesseract.js
- ✅ Análisis con IA
- ✅ Almacenamiento en base de datos

## 🛠️ Tecnologías

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** (base de datos)
- **JWT** (autenticación)
- **bcryptjs** (encriptación de contraseñas)
- **Google OAuth 2.0**
- **Groq API** (IA - Llama 3.3 70B)

### Frontend
- **HTML5** + **TailwindCSS**
- **JavaScript Vanilla**
- **Leaflet.js** (mapas)
- **Tesseract.js** (OCR)
- **PDF.js** (lectura de PDFs)
- **EmailJS** (envío de correos)
- **Google Sign-In**

## 📁 Estructura del Proyecto

```
saludclara/
├── mi-backend/
│   ├── config/
│   │   └── database.js          # Configuración PostgreSQL
│   ├── middleware/
│   │   └── auth.js              # Middleware JWT
│   ├── server.js                # Servidor principal
│   ├── package.json
│   └── .env                     # Variables de entorno
├── frontend/
│   ├── index.html               # Página principal
│   ├── script.js                # Lógica principal
│   ├── auth.js                  # Sistema de autenticación
│   └── styles.css               # Estilos
├── database/
│   └── schema.sql               # Schema de PostgreSQL
├── INSTRUCCIONES_SETUP.md       # 📖 Guía de configuración
├── INSTRUCCIONES_EMAILJS.md     # 📧 Configurar emails
└── README.md                    # Este archivo
```

## 🚀 Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone <tu-repo>
cd saludclara
```

### 2. Configurar Base de Datos
```bash
# Crear base de datos en PostgreSQL
psql -U postgres
CREATE DATABASE saludclara;
\c saludclara
\i database/schema.sql
\q
```

### 3. Configurar Backend
```bash
cd mi-backend
npm install

# Editar .env con tus credenciales:
# - DB_PASSWORD (PostgreSQL)
# - GOOGLE_CLIENT_ID (Google OAuth)
# - JWT_SECRET (secreto para tokens)
```

### 4. Ejecutar Backend
```bash
npm start
# Servidor en http://localhost:3000
```

### 5. Ejecutar Frontend
```bash
cd ../frontend
# Opción 1: Live Server (VS Code)
# Opción 2: python -m http.server 5500
# Opción 3: npx http-server -p 5500
```

### 6. Abrir en Navegador
```
http://localhost:5500
```

## 📖 Documentación Completa

Para instrucciones detalladas paso a paso, consulta:
- **[INSTRUCCIONES_SETUP.md](./INSTRUCCIONES_SETUP.md)** - Configuración completa del sistema
- **[INSTRUCCIONES_EMAILJS.md](./INSTRUCCIONES_EMAILJS.md)** - Configurar envío de correos

## 🔑 Variables de Entorno (.env)

```env
# Puerto del servidor
PORT=3000

# API de IA (Groq - Gratis)
GROQ_API_KEY=tu_groq_api_key

# Base de Datos PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=saludclara
DB_PASSWORD=tu_password
DB_PORT=5432

# JWT Secret (cámbialo en producción)
JWT_SECRET=tu_secreto_super_seguro

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
```

## 📊 Base de Datos

### Tablas Principales

**usuarios**
- Almacena usuarios registrados (local + Google)
- Campos: id, nombre, email, password_hash, google_id, foto_perfil, tipo_auth

**citas**
- Almacena citas médicas reservadas
- Campos: id, usuario_id, codigo_confirmacion, fecha, hora, especialidad, lugar, tipo_cita

**historial_chat**
- Almacena conversaciones con la IA
- Campos: id, usuario_id, mensaje, respuesta, tipo, fecha

**documentos_medicos**
- Almacena documentos subidos y analizados
- Campos: id, usuario_id, nombre_archivo, texto_extraido, analisis

## 🔐 Endpoints de API

### Autenticación
```
POST /api/auth/registro       # Registrar usuario
POST /api/auth/login          # Login con email/password
POST /api/auth/google         # Login con Google
GET  /api/auth/me             # Obtener usuario actual (requiere token)
```

### IA y Chat
```
POST /api/chat                # Chat de síntomas
POST /api/traducir            # Traducir término médico
POST /api/analizar-documento  # Analizar documento médico
POST /api/analizar-texto-medico # Analizar texto extraído (OCR)
```

### Sistema
```
GET  /api/health              # Estado del servidor
```

## 🧪 Probar el Sistema

### 1. Crear Usuario
```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@test.com",
    "telefono": "7777-7777",
    "password": "123456"
  }'
```

### 2. Iniciar Sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@test.com",
    "password": "123456"
  }'
```

### 3. Usar el Token
```bash
# Copia el token de la respuesta anterior
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🎨 Capturas de Pantalla

### Página de Inicio
![Inicio](docs/screenshots/inicio.png)

### Sistema de Login
![Login](docs/screenshots/login.png)

### Chat de Diagnóstico
![Chat](docs/screenshots/chat.png)

### Reserva de Citas
![Citas](docs/screenshots/citas.png)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**SaludClara Team**
- Email: contacto@saludclara.com
- GitHub: [@saludclara](https://github.com/saludclara)

## 🙏 Agradecimientos

- **Groq** por su API gratuita de IA
- **Google** por Google OAuth
- **Leaflet** por los mapas interactivos
- **Tesseract.js** por el OCR
- **EmailJS** por el envío de correos

## 📞 Soporte

¿Problemas? Abre un [issue](https://github.com/tu-usuario/saludclara/issues) o consulta la [documentación](./INSTRUCCIONES_SETUP.md).

---

⚠️ **IMPORTANTE:** Este sistema NO reemplaza la consulta médica profesional. Siempre consulta con un médico certificado para diagnósticos y tratamientos.
