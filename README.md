# 🏥 SaludClara - Backend API

Backend API para SaludClara, un asistente médico inteligente con IA.

## 🚀 Características

- 🔐 **Autenticación JWT** - Login seguro con tokens
- 🤖 **Integración con IA** - Groq (Llama 3.3) y OpenAI
- 👤 **Google OAuth** - Inicio de sesión con Google
- 📅 **Sistema de Citas** - CRUD completo de citas médicas
- 🗄️ **PostgreSQL** - Base de datos robusta
- 🔒 **Seguridad** - Bcrypt, CORS, validaciones

## 🛠️ Tecnologías

- Node.js + Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- Google OAuth 2.0
- Groq API (Llama 3.3 70B)
- OpenAI API (opcional)

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/edwardlemus840-cloud/Backend-API-para-SaludClara---Asistente-m-dico-con-IA-.git
cd Backend-API-para-SaludClara---Asistente-m-dico-con-IA-
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar PostgreSQL

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE saludclara;
\c saludclara
\i database/schema.sql
\q
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz:

```env
# Puerto del servidor
PORT=3000

# API de IA (Groq - Gratis y recomendado)
GROQ_API_KEY=tu_groq_api_key_aqui

# Base de Datos PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=saludclara
DB_PASSWORD=tu_password_postgres
DB_PORT=5432

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_secreto_super_seguro_aqui

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
```

### 5. Obtener API Keys

#### Groq API (Recomendado - Gratis)

1. Ve a [console.groq.com](https://console.groq.com/)
2. Crea una cuenta
3. Ve a "API Keys"
4. Crea una nueva key
5. Cópiala al `.env`

#### OpenAI API (Opcional)

1. Ve a [platform.openai.com](https://platform.openai.com/)
2. Crea una cuenta
3. Ve a "API Keys"
4. Crea una nueva key
5. Agrégala al `.env` como `OPENAI_API_KEY`

#### Google OAuth (Opcional)

1. Ve a [console.cloud.google.com](https://console.cloud.google.com/)
2. Crea un proyecto
3. Habilita "Google+ API"
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:5500` a URIs autorizados
6. Copia el Client ID al `.env`

### 6. Iniciar servidor

```bash
# Modo producción
npm start

# Modo desarrollo (con nodemon)
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

## 📡 Endpoints

### Autenticación

```
POST /api/auth/registro       # Registrar usuario
POST /api/auth/login          # Login con email/password
POST /api/auth/google         # Login con Google
GET  /api/auth/me             # Obtener usuario actual (requiere token)
```

### IA y Chat

```
POST /api/chat                      # Chat de síntomas
POST /api/traducir                  # Traducir término médico
POST /api/analizar-documento        # Analizar documento (OpenAI Vision)
POST /api/analizar-texto-medico     # Analizar texto extraído (OCR)
```

### Citas

```
POST /api/citas                           # Crear cita
GET  /api/citas/usuario/:usuarioId        # Obtener citas del usuario
PUT  /api/citas/:codigo/cancelar          # Cancelar cita
GET  /api/citas/usuario/:usuarioId/estadisticas  # Estadísticas
```

### Sistema

```
GET  /api/health              # Estado del servidor
```

## 🧪 Probar la API

### Con cURL

```bash
# Verificar estado
curl http://localhost:3000/api/health

# Registrar usuario
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@test.com",
    "telefono": "7777-7777",
    "password": "123456"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@test.com",
    "password": "123456"
  }'

# Chat (requiere token)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "mensaje": "Tengo dolor de cabeza y fiebre"
  }'
```

### Con Postman

1. Importa la colección de endpoints
2. Configura el environment con `API_URL=http://localhost:3000`
3. Prueba los endpoints

## 🌐 Despliegue

### Render (Recomendado)

1. Crea una cuenta en [render.com](https://render.com/)
2. Crea un nuevo "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Agrega las variables de entorno desde el `.env`
6. Crea una base de datos PostgreSQL en Render
7. Conecta la base de datos al servicio
8. Despliega

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Desplegar
railway up
```

### Heroku

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create saludclara-backend

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurar variables
heroku config:set GROQ_API_KEY=tu_key
heroku config:set JWT_SECRET=tu_secret

# Desplegar
git push heroku main
```

## 📁 Estructura

```
mi-backend/
├── config/
│   └── database.js       # Configuración PostgreSQL
├── middleware/
│   └── auth.js           # Middleware JWT
├── server.js             # Servidor principal
├── package.json          # Dependencias
├── .env                  # Variables de entorno (no subir a Git)
├── .env.example          # Ejemplo de .env
├── .gitignore            # Archivos ignorados
└── README.md             # Este archivo
```

## 🔗 Frontend

Este backend funciona con el frontend de SaludClara:

👉 [Frontend Repository](https://github.com/edwardlemus840-cloud/saludclara-frontend)

## 🗄️ Base de Datos

El schema SQL está en el repositorio principal:

```sql
-- Tablas principales
usuarios            # Usuarios registrados
citas              # Citas médicas
historial_chat     # Conversaciones con IA
documentos_medicos # Documentos analizados
```

## ⚠️ Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ CORS configurado
- ✅ Validación de inputs
- ✅ Variables de entorno para secretos
- ⚠️ **NO subas el archivo `.env` a Git**

## 📝 Licencia

MIT License

## 👨‍💻 Autor

**Edward Lemus**
- GitHub: [@edwardlemus840-cloud](https://github.com/edwardlemus840-cloud)

## 🙏 Agradecimientos

- Groq por su API gratuita de IA
- OpenAI por GPT
- Google por OAuth
