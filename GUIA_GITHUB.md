# 📚 Guía Completa de GitHub - Paso a Paso

Esta guía te enseñará cómo subir tu código a GitHub por primera vez y cómo actualizarlo después.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Primera Vez: Subir Código a GitHub](#primera-vez-subir-código-a-github)
3. [Actualizar Código en GitHub](#actualizar-código-en-github)
4. [Comandos Útiles](#comandos-útiles)
5. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

### 1. Instalar Git

**Windows:**
1. Descarga Git desde: https://git-scm.com/download/win
2. Ejecuta el instalador
3. Usa las opciones por defecto (solo dale "Next" a todo)
4. Verifica la instalación abriendo PowerShell o CMD:
   ```bash
   git --version
   ```
   Deberías ver algo como: `git version 2.x.x`

### 2. Crear Cuenta en GitHub

1. Ve a: https://github.com/
2. Haz clic en **"Sign up"**
3. Completa el registro con:
   - Email
   - Contraseña
   - Nombre de usuario
4. Verifica tu email

### 3. Configurar Git (Solo la primera vez)

Abre PowerShell o CMD y ejecuta:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tuemail@ejemplo.com"
```

**Ejemplo:**
```bash
git config --global user.name "Edward Lemus"
git config --global user.email "edwardlemus840@gmail.com"
```

---

## 🚀 Primera Vez: Subir Código a GitHub

### Paso 1: Crear un Repositorio en GitHub

1. Ve a: https://github.com/
2. Haz clic en el botón **"+"** (arriba a la derecha)
3. Selecciona **"New repository"**
4. Completa el formulario:
   - **Repository name:** `saludclara-backend` (o el nombre que quieras)
   - **Description:** "Backend para SaludClara - Asistente médico con IA"
   - **Public** o **Private** (elige el que prefieras)
   - ❌ **NO marques** "Add a README file"
   - ❌ **NO marques** "Add .gitignore"
   - ❌ **NO marques** "Choose a license"
5. Haz clic en **"Create repository"**

GitHub te mostrará una página con instrucciones. **Copia la URL del repositorio**, se verá así:
```
https://github.com/TU_USUARIO/saludclara-backend.git
```

### Paso 2: Inicializar Git en tu Proyecto (Si no lo has hecho)

Abre PowerShell o CMD y navega a la carpeta de tu proyecto:

```bash
cd "c:\Users\edwar\Desktop\Proyectos wed - copia\saludclara"
```

Verifica si ya tienes Git inicializado:
```bash
git status
```

**Si ves un error** que dice "not a git repository", inicializa Git:
```bash
git init
```

**Si ya está inicializado**, verás información sobre archivos. ¡Perfecto! Continúa al siguiente paso.

### Paso 3: Crear el Archivo .gitignore

Este archivo le dice a Git qué archivos **NO subir** (como contraseñas, archivos temporales, etc.).

Crea un archivo llamado `.gitignore` en la raíz de tu proyecto con este contenido:

```
# Dependencias
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Variables de entorno (¡IMPORTANTE!)
.env
.env.local
.env.production

# Archivos del sistema
.DS_Store
Thumbs.db
desktop.ini

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Logs
logs/
*.log

# Archivos temporales
tmp/
temp/
*.tmp
```

### Paso 4: Agregar Archivos al Staging Area

```bash
git add .
```

Este comando agrega **todos** los archivos (excepto los del `.gitignore`) para ser incluidos en el commit.

**Verificar qué se agregó:**
```bash
git status
```

Verás en verde los archivos que se subirán.

### Paso 5: Hacer tu Primer Commit

Un "commit" es como una foto de tu código en ese momento.

```bash
git commit -m "Initial commit - SaludClara Backend"
```

**Explicación:**
- `git commit`: Crea el commit
- `-m "mensaje"`: El mensaje que describe qué cambios hiciste

### Paso 6: Conectar con GitHub (Agregar Remote)

Ahora conecta tu proyecto local con el repositorio de GitHub:

```bash
git remote add origin https://github.com/TU_USUARIO/saludclara-backend.git
```

**Reemplaza** `TU_USUARIO` y `saludclara-backend` con tu información.

**Ejemplo:**
```bash
git remote add origin https://github.com/edwardlemus840-cloud/saludclara-backend.git
```

**Verificar que se agregó correctamente:**
```bash
git remote -v
```

Deberías ver:
```
origin  https://github.com/TU_USUARIO/saludclara-backend.git (fetch)
origin  https://github.com/TU_USUARIO/saludclara-backend.git (push)
```

### Paso 7: Subir el Código a GitHub (Push)

```bash
git push -u origin master
```

**O si tu rama se llama "main":**
```bash
git push -u origin main
```

**Explicación:**
- `git push`: Sube el código
- `-u origin master`: Sube a la rama "master" del remote "origin" y la establece como predeterminada
- La próxima vez solo necesitarás hacer `git push`

**Si te pide autenticación:**
- **Usuario:** Tu nombre de usuario de GitHub
- **Contraseña:** Necesitas un **Personal Access Token** (no tu contraseña normal)

#### Crear un Personal Access Token:

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Dale un nombre: "SaludClara"
4. Marca el checkbox **"repo"** (para acceso completo a repositorios)
5. Click en **"Generate token"**
6. **¡COPIA EL TOKEN!** (solo se muestra una vez)
7. Usa este token como contraseña cuando Git te lo pida

### Paso 8: Verificar en GitHub

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/saludclara-backend`
2. ¡Deberías ver todos tus archivos! 🎉

---

## 🔄 Actualizar Código en GitHub

Una vez que ya subiste tu código por primera vez, actualizar es mucho más fácil.

### Flujo de Trabajo Diario

```
1. Hacer cambios en tu código
2. Agregar archivos modificados
3. Hacer commit
4. Subir a GitHub
```

### Paso 1: Verificar Qué Cambió

```bash
git status
```

Verás:
- **Rojo:** Archivos modificados que NO están en staging
- **Verde:** Archivos listos para commit

### Paso 2: Agregar Archivos Modificados

**Opción A: Agregar todos los archivos modificados**
```bash
git add .
```

**Opción B: Agregar archivos específicos**
```bash
git add archivo1.js archivo2.js
```

**Ejemplo:**
```bash
git add mi-backend/server.js
git add frontend/script.js
```

### Paso 3: Hacer Commit

```bash
git commit -m "Descripción de los cambios"
```

**Ejemplos de buenos mensajes:**
```bash
git commit -m "Agregar endpoint de citas médicas"
git commit -m "Corregir bug en autenticación de Google"
git commit -m "Actualizar diseño del formulario de citas"
git commit -m "Implementar envío de correos con Nodemailer"
```

### Paso 4: Subir a GitHub

```bash
git push
```

¡Eso es todo! Tus cambios ya están en GitHub.

### Paso 5: Verificar en GitHub

Ve a tu repositorio en GitHub y verás los cambios reflejados.

---

## 📝 Comandos Útiles

### Ver el Historial de Commits

```bash
git log
```

**Versión más compacta:**
```bash
git log --oneline
```

**Ver los últimos 5 commits:**
```bash
git log --oneline -5
```

### Ver Diferencias (Qué Cambió)

**Ver qué cambió en archivos no agregados:**
```bash
git diff
```

**Ver qué cambió en archivos agregados (staging):**
```bash
git diff --staged
```

### Deshacer Cambios

**Deshacer cambios en un archivo (antes de hacer commit):**
```bash
git checkout -- archivo.js
```

**Quitar un archivo del staging (pero mantener cambios):**
```bash
git reset archivo.js
```

**Deshacer el último commit (pero mantener cambios):**
```bash
git reset --soft HEAD~1
```

**Deshacer el último commit (y eliminar cambios):**
```bash
git reset --hard HEAD~1
```
⚠️ **¡CUIDADO!** Esto elimina los cambios permanentemente.

### Revertir un Commit (Crear un nuevo commit que deshace cambios)

```bash
git revert CODIGO_DEL_COMMIT
```

**Ejemplo:**
```bash
git log --oneline
# a1b2c3d Agregar feature X
# e4f5g6h Corregir bug Y

git revert a1b2c3d
```

### Ver Información del Remote

```bash
git remote -v
```

### Cambiar la URL del Remote

```bash
git remote set-url origin https://github.com/NUEVO_USUARIO/nuevo-repo.git
```

### Actualizar tu Código Local desde GitHub (Pull)

Si trabajas desde varias computadoras o con otras personas:

```bash
git pull
```

---

## 🌿 Trabajar con Ramas (Branches)

Las ramas te permiten trabajar en nuevas funcionalidades sin afectar el código principal.

### Crear una Nueva Rama

```bash
git branch nueva-funcionalidad
```

### Cambiar a una Rama

```bash
git checkout nueva-funcionalidad
```

**O crear y cambiar en un solo comando:**
```bash
git checkout -b nueva-funcionalidad
```

### Ver Todas las Ramas

```bash
git branch
```

La rama actual tendrá un `*` al lado.

### Subir una Rama a GitHub

```bash
git push -u origin nueva-funcionalidad
```

### Fusionar una Rama (Merge)

1. Cambia a la rama principal:
   ```bash
   git checkout master
   ```

2. Fusiona la otra rama:
   ```bash
   git merge nueva-funcionalidad
   ```

3. Sube los cambios:
   ```bash
   git push
   ```

### Eliminar una Rama

**Local:**
```bash
git branch -d nueva-funcionalidad
```

**En GitHub:**
```bash
git push origin --delete nueva-funcionalidad
```

---

## 🚨 Solución de Problemas

### Error: "fatal: not a git repository"

**Solución:**
```bash
git init
```

### Error: "fatal: remote origin already exists"

**Solución:**
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/tu-repo.git
```

### Error: "Updates were rejected because the remote contains work"

Esto pasa cuando el repositorio de GitHub tiene commits que no tienes localmente.

**Solución:**
```bash
git pull --rebase origin master
git push
```

### Error: "Permission denied (publickey)"

Necesitas configurar autenticación. Usa HTTPS en lugar de SSH:

```bash
git remote set-url origin https://github.com/TU_USUARIO/tu-repo.git
```

### Olvidé Agregar un Archivo al .gitignore y Ya lo Subí

**Solución:**
1. Agrega el archivo a `.gitignore`
2. Elimínalo del tracking de Git (pero no del disco):
   ```bash
   git rm --cached archivo.txt
   ```
3. Haz commit:
   ```bash
   git commit -m "Eliminar archivo del tracking"
   git push
   ```

### Subí mi Archivo .env con Contraseñas por Error

**⚠️ URGENTE - Sigue estos pasos:**

1. Agrega `.env` a `.gitignore`:
   ```
   .env
   ```

2. Elimínalo del repositorio:
   ```bash
   git rm --cached .env
   git commit -m "Eliminar .env del repositorio"
   git push
   ```

3. **IMPORTANTE:** Cambia todas las contraseñas y API keys que estaban en ese archivo, porque ya están expuestas en el historial de Git.

4. Para eliminar completamente del historial (avanzado):
   ```bash
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```

---

## 📊 Ejemplo Completo: Flujo de Trabajo Típico

```bash
# 1. Ver qué cambió
git status

# 2. Agregar archivos
git add .

# 3. Hacer commit
git commit -m "Agregar sistema de notificaciones por email"

# 4. Subir a GitHub
git push

# 5. Verificar en GitHub
# Ve a tu repositorio en el navegador
```

---

## 🎯 Resumen de Comandos Esenciales

| Comando | Descripción |
|---------|-------------|
| `git init` | Inicializar Git en un proyecto |
| `git status` | Ver estado de archivos |
| `git add .` | Agregar todos los archivos modificados |
| `git commit -m "mensaje"` | Crear un commit |
| `git push` | Subir cambios a GitHub |
| `git pull` | Descargar cambios de GitHub |
| `git log --oneline` | Ver historial de commits |
| `git remote -v` | Ver repositorios remotos |

---

## 📚 Recursos Adicionales

- **Documentación oficial de Git:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Visualizador de Git:** https://git-school.github.io/visualizing-git/
- **Cheat Sheet de Git:** https://education.github.com/git-cheat-sheet-education.pdf

---

## 💡 Consejos Finales

1. **Haz commits frecuentes** con mensajes descriptivos
2. **NUNCA subas archivos .env** con contraseñas
3. **Usa .gitignore** desde el principio
4. **Haz git pull** antes de empezar a trabajar si colaboras con otros
5. **Revisa git status** antes de hacer commit
6. **Usa ramas** para nuevas funcionalidades
7. **Escribe buenos mensajes de commit** (futuro tú te lo agradecerá)

---

✅ **¡Listo!** Ahora sabes cómo usar Git y GitHub como un profesional.

Si tienes dudas, revisa esta guía o busca en Google: "git [lo que quieres hacer]"
