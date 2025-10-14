# 📘 Guía Completa de Despliegue - SaludClara

## 🎯 Resumen del Proyecto

**SaludClara** es una aplicación web de asistencia médica con IA que consta de:
- **Backend**: API REST con Node.js + PostgreSQL
- **Frontend**: Aplicación web con HTML, CSS, JavaScript

---

## 📦 Repositorios en GitHub

- **Backend**: https://github.com/edwardlemus840-cloud/Backend-API-para-SaludClara---Asistente-m-dico-con-IA-
- **Frontend**: https://github.com/edwardlemus840-cloud/saludclara-frontend

---

# 🚀 PARTE 1: PREPARACIÓN DEL BACKEND

## Paso 1: Configurar Git Globalmente

```bash
git config --global user.name "edwardlemus840-cloud"
git config --global user.email "edwardlemus840@gmail.com"
```

## Paso 2: Crear Archivos Necesarios

### 2.1 Crear `.gitignore`
**Ubicación**: `mi-backend/.gitignore`

```gitignore
# Dependencias
node_modules/
package-lock.json

# Variables de entorno (NUNCA subir esto)
.env

# Logs
*.log
npm-debug.log*

# Sistema operativo
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo
```

### 2.2 Crear `.env.example`
**Ubicación**: `mi-backend/.env.example`

```env
# ===== CONFIGURACIÓN DEL SERVIDOR =====
PORT=3001
NODE_ENV=production

# ===== BASE DE DATOS POSTGRESQL =====
DATABASE_URL=postgresql://usuario:password@host:5432/nombre_db

# ===== SEGURIDAD =====
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# ===== API KEYS DE IA =====
GROQ_API_KEY=gsk_tu_groq_api_key_aqui
OPENAI_API_KEY=sk-tu_openai_api_key_aqui

# ===== GOOGLE OAUTH =====
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```

### 2.3 Crear `render.yaml`
**Ubicación**: `mi-backend/render.yaml`

```yaml
services:
  # Backend API
  - type: web
    name: saludclara-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DATABASE_URL
        fromDatabase:
          name: saludclara-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: GROQ_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false

  # Base de datos PostgreSQL
  - type: pserv
    name: saludclara-db
    plan: free
    databaseName: saludclara
    user: saludclara_user
```

### 2.4 Crear `README.md`
**Ubicación**: `mi-backend/README.md`

```markdown
# 🏥 SaludClara Backend

Backend API para SaludClara - Asistente médico con IA

## 🚀 Despliegue en Render
[Instrucciones completas de despliegue]

## 📝 Variables de Entorno Requeridas
- PORT, NODE_ENV, DATABASE_URL
- JWT_SECRET, GROQ_API_KEY
- GOOGLE_CLIENT_ID
```

### 2.5 Agregar Ruta Raíz en `server.js`

```javascript
// Agregar después de los middlewares
app.get('/', (req, res) => {
    res.json({
        mensaje: '🏥 SaludClara API - Backend funcionando correctamente',
        version: '1.0.0',
        endpoints: {
            autenticacion: [
                'POST /api/auth/registro',
                'POST /api/auth/login',
                'POST /api/auth/google',
                'GET /api/auth/me'
            ],
            servicios: [
                'POST /api/chat',
                'POST /api/citas',
                'GET /api/citas/:userId'
            ]
        },
        estado: 'online',
        timestamp: new Date().toISOString()
    });
});
```

## Paso 3: Inicializar Git y Subir a GitHub

```bash
# Navegar a la carpeta del backend
cd "c:\Users\edwar\Desktop\Proyectos wed - copia\saludclara\mi-backend"

# Inicializar repositorio Git
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - SaludClara Backend API"

# Conectar con GitHub (crear repo primero en github.com/new)
git remote add origin https://github.com/edwardlemus840-cloud/Backend-API-para-SaludClara---Asistente-m-dico-con-IA-.git

# Cambiar a rama main
git branch -M main

# Subir a GitHub
git push -u origin main
```

---

# 🎨 PARTE 2: PREPARACIÓN DEL FRONTEND

## Paso 4: Crear Archivos Necesarios para Frontend

### 4.1 Crear `.gitignore`
**Ubicación**: `frontend/.gitignore`

```gitignore
# Logs
*.log
npm-debug.log*

# Sistema operativo
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Archivos temporales
*.tmp
.cache/
```

### 4.2 Crear `README.md`
**Ubicación**: `frontend/README.md`

```markdown
# 🏥 SaludClara Frontend

Interfaz web para SaludClara - Asistente médico con IA

## 🚀 Despliegue en Render

Desplegado como Static Site en Render.

## 🔗 Backend
Conectado a: https://saludclara-backend.onrender.com
```

### 4.3 Actualizar URL del Backend en `script.js`

**Ubicación**: `frontend/script.js` (línea 2)

```javascript
// Cambiar de:
const API_URL = 'http://localhost:3001';

// A:
const API_URL = 'https://saludclara-backend.onrender.com';
```

## Paso 5: Subir Frontend a GitHub

```bash
# Navegar a la carpeta del frontend
cd "c:\Users\edwar\Desktop\Proyectos wed - copia\saludclara\frontend"

# Inicializar repositorio Git
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - SaludClara Frontend"

# Conectar con GitHub (crear repo primero en github.com/new)
git remote add origin https://github.com/edwardlemus840-cloud/saludclara-frontend.git

# Cambiar a rama main
git branch -M main

# Subir a GitHub
git push -u origin main
```

---

# 🌐 PARTE 3: DESPLIEGUE EN RENDER

## Paso 6: Crear Base de Datos PostgreSQL

1. Ve a https://dashboard.render.com/
2. Click **"New +"** → **"PostgreSQL"**
3. Configuración:
   - **Name**: `saludclara-db`
   - **Database**: `saludclara`
   - **User**: `saludclara_user`
   - **Region**: Oregon (US West)
   - **Plan**: **Free**
4. Click **"Create Database"**
5. **IMPORTANTE**: Copia la **"Internal Database URL"**
   - Ejemplo: `postgresql://saludclara_user:password@dpg-xxx.oregon-postgres.render.com/saludclara`

## Paso 7: Desplegar Backend

1. En Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"** → Conecta tu GitHub
3. Selecciona: `Backend-API-para-SaludClara---Asistente-m-dico-con-IA-`
4. Configuración:
   - **Name**: `saludclara-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Variables de Entorno** (sección Environment):
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<pega_aqui_la_internal_database_url_del_paso_6>
   JWT_SECRET=<genera_uno_aleatorio_en_randomkeygen.com>
   GROQ_API_KEY=<tu_groq_api_key_de_console.groq.com>
   GOOGLE_CLIENT_ID=33448340879-gb25tjh34q6ji7m35tpf0ajq7rkpf0v4.apps.googleusercontent.com
   ```

6. Click **"Create Web Service"**
7. Espera 2-5 minutos a que despliegue
8. Tu API estará en: `https://saludclara-backend.onrender.com`

## Paso 8: Desplegar Frontend

1. En Render Dashboard, click **"New +"** → **"Static Site"**
2. Click **"Connect a repository"**
3. Selecciona: `saludclara-frontend`
4. Configuración:
   - **Name**: `saludclara-frontend`
   - **Branch**: `main`
   - **Build Command**: (déjalo vacío)
   - **Publish Directory**: `.` (punto)
   - **Auto-Deploy**: Yes

5. Click **"Create Static Site"**
6. Espera 1-2 minutos a que despliegue
7. Tu sitio estará en: `https://saludclara-frontend.onrender.com`

---

# ✅ VERIFICACIÓN FINAL

## URLs de tu Aplicación:

- **Backend API**: https://saludclara-backend.onrender.com
- **Frontend Web**: https://saludclara-frontend.onrender.com

## Pruebas:

### 1. Verificar Backend:
Abre: https://saludclara-backend.onrender.com/

Deberías ver:
```json
{
  "mensaje": "🏥 SaludClara API - Backend funcionando correctamente",
  "version": "1.0.0",
  "estado": "online"
}
```

### 2. Verificar Frontend:
Abre: https://saludclara-frontend.onrender.com

Deberías ver la página principal de SaludClara.

### 3. Probar Funcionalidades:
- ✅ Registro de usuario
- ✅ Login con email/password
- ✅ Login con Google
- ✅ Chat de diagnóstico
- ✅ Traductor médico
- ✅ Reserva de citas
- ✅ Mapa de hospitales

---

# 🔧 COMANDOS ÚTILES

## Actualizar Backend:

```bash
cd "c:\Users\edwar\Desktop\Proyectos wed - copia\saludclara\mi-backend"
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Render detectará los cambios y redesplegará automáticamente.

## Actualizar Frontend:

```bash
cd "c:\Users\edwar\Desktop\Proyectos wed - copia\saludclara\frontend"
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Render detectará los cambios y redesplegará automáticamente.

---

# 📊 ESTRUCTURA FINAL DEL PROYECTO

```
saludclara/
├── mi-backend/                    # Backend API
│   ├── config/
│   │   └── database.js           # Configuración PostgreSQL
│   ├── middleware/
│   │   └── auth.js               # Autenticación JWT
│   ├── .env                      # Variables (NO subir a Git)
│   ├── .env.example              # Template de variables
│   ├── .gitignore                # Archivos a ignorar
│   ├── package.json              # Dependencias
│   ├── README.md                 # Documentación
│   ├── render.yaml               # Config de Render
│   └── server.js                 # Servidor principal
│
└── frontend/                      # Frontend Web
    ├── .gitignore                # Archivos a ignorar
    ├── auth.js                   # Auth legacy
    ├── index.html                # Página principal
    ├── README.md                 # Documentación
    ├── script.js                 # Lógica JavaScript
    └── styles.css                # Estilos CSS
```

---

# 🎓 CONCEPTOS IMPORTANTES

## Git y GitHub:
- **Git**: Sistema de control de versiones (guarda historial de cambios)
- **GitHub**: Plataforma para alojar repositorios Git en la nube
- **Commit**: Guardar cambios con un mensaje descriptivo
- **Push**: Subir commits locales a GitHub
- **Repository**: Carpeta de proyecto con historial Git

## Render:
- **Web Service**: Para aplicaciones backend (Node.js, Python, etc.)
- **Static Site**: Para sitios web estáticos (HTML, CSS, JS)
- **PostgreSQL**: Base de datos relacional
- **Free Tier**: Plan gratuito (se duerme después de 15 min sin uso)

## Variables de Entorno:
- Configuración sensible que NO se sube a GitHub
- Se configura en Render Dashboard
- Ejemplos: API keys, contraseñas, URLs de bases de datos

---

# 🆘 SOLUCIÓN DE PROBLEMAS

## Problema: "Not Found" en el backend
**Solución**: El servicio gratuito se durmió. Espera 30-60 segundos y recarga.

## Problema: Error de CORS en el frontend
**Solución**: Verifica que `FRONTEND_URL` esté configurado en las variables de entorno del backend.

## Problema: Base de datos no conecta
**Solución**: Verifica que `DATABASE_URL` en Render coincida con la Internal Database URL.

## Problema: Google Login no funciona
**Solución**: Verifica que `GOOGLE_CLIENT_ID` esté configurado correctamente.

---

# 📞 CONTACTO

**Desarrollador**: Edward Lemus
**Email**: edwardlemus840@gmail.com
**GitHub**: https://github.com/edwardlemus840-cloud

---

**Fecha de Despliegue**: Octubre 13, 2025
**Versión**: 1.0.0

---

¡Felicidades! 🎉 Tu aplicación SaludClara está completamente desplegada y funcionando en producción.
