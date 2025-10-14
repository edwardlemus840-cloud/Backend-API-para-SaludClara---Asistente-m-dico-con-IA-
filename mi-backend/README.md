# 🏥 SaludClara Backend

Backend API para SaludClara - Asistente médico con IA

## 🚀 Despliegue en Render

### Paso 1: Preparar el Repositorio
1. Sube tu código a GitHub
2. Asegúrate de que `.env` NO esté en el repositorio (está en `.gitignore`)

### Paso 2: Crear Base de Datos en Render
1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New +" → "PostgreSQL"
3. Nombre: `saludclara-db`
4. Plan: Free
5. Click "Create Database"
6. **Guarda la URL de conexión** (Internal Database URL)

### Paso 3: Crear Web Service
1. Click en "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name**: `saludclara-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Paso 4: Configurar Variables de Entorno
En la sección "Environment" del Web Service, agrega:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=<URL_de_tu_base_de_datos_de_Render>
JWT_SECRET=<generar_uno_aleatorio>
GROQ_API_KEY=<tu_groq_api_key>
GOOGLE_CLIENT_ID=<tu_google_client_id>
```

### Paso 5: Deploy
1. Click "Create Web Service"
2. Render automáticamente desplegará tu aplicación
3. Tu API estará disponible en: `https://saludclara-backend.onrender.com`

## 📝 Variables de Entorno Requeridas

- `PORT`: Puerto del servidor (3001)
- `NODE_ENV`: Entorno (production)
- `DATABASE_URL`: URL de PostgreSQL
- `JWT_SECRET`: Secreto para tokens JWT
- `GROQ_API_KEY`: API key de Groq (IA)
- `GOOGLE_CLIENT_ID`: Client ID de Google OAuth

## 🔧 Desarrollo Local

```bash
npm install
npm run dev
```

## 📚 Endpoints Principales

- `POST /api/auth/registro` - Registro de usuarios
- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/google` - Login con Google
- `POST /api/chat` - Chat con IA
- `POST /api/citas` - Crear cita médica
- `GET /api/citas/:userId` - Obtener citas de usuario

## 🛡️ Seguridad

- Autenticación con JWT
- Contraseñas hasheadas con bcrypt
- CORS configurado
- Variables sensibles en `.env`
