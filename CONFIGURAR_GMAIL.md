# 📧 Configurar Gmail para Envío de Correos Automáticos

## ¿Qué hace esto?

Cuando un usuario reserva una cita en SaludClara, el sistema enviará automáticamente un correo electrónico al email que proporcionó con:
- ✅ Código de confirmación
- 📅 Detalles de la cita (fecha, hora, lugar, especialidad)
- ⚠️ Recordatorios importantes
- 🎨 Diseño profesional en HTML

---

## 📋 Requisitos Previos

1. Una cuenta de Gmail activa
2. Acceso a la configuración de seguridad de Google

---

## 🔧 Paso 1: Habilitar la Verificación en 2 Pasos

Para poder generar una contraseña de aplicación, primero debes tener habilitada la verificación en 2 pasos:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. En el menú izquierdo, selecciona **"Seguridad"**
3. Busca la sección **"Verificación en 2 pasos"**
4. Si no está activada, haz clic en **"Comenzar"** y sigue las instrucciones
5. Configura tu método de verificación (SMS, app Google Authenticator, etc.)

---

## 🔑 Paso 2: Generar una Contraseña de Aplicación

Una vez que tengas la verificación en 2 pasos activada:

1. Ve a: https://myaccount.google.com/apppasswords
   - O busca "Contraseñas de aplicaciones" en la configuración de seguridad

2. Es posible que te pida iniciar sesión nuevamente

3. En **"Selecciona la app"**, elige **"Correo"**

4. En **"Selecciona el dispositivo"**, elige **"Otro (nombre personalizado)"**
   - Escribe: `SaludClara Backend`

5. Haz clic en **"Generar"**

6. Google te mostrará una contraseña de 16 caracteres como esta:
   ```
   abcd efgh ijkl mnop
   ```

7. **¡IMPORTANTE!** Copia esta contraseña (sin espacios) y guárdala en un lugar seguro
   - La necesitarás para el siguiente paso
   - Esta contraseña solo se muestra una vez

---

## ⚙️ Paso 3: Configurar las Variables de Entorno

### **En Desarrollo Local:**

1. Ve a la carpeta `mi-backend/`

2. Abre el archivo `.env` (si no existe, créalo copiando `.env.example`)

3. Agrega estas dos líneas:
   ```env
   GMAIL_USER=tucorreo@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

   **Ejemplo real:**
   ```env
   GMAIL_USER=saludclara2024@gmail.com
   GMAIL_APP_PASSWORD=xyzw abcd efgh ijkl
   ```

4. Guarda el archivo

5. Reinicia el servidor backend:
   ```bash
   cd mi-backend
   npm start
   ```

---

### **En Producción (Render):**

1. Ve a tu dashboard de Render: https://dashboard.render.com/

2. Selecciona tu servicio de backend (saludclara-backend)

3. Ve a la pestaña **"Environment"**

4. Haz clic en **"Add Environment Variable"**

5. Agrega estas dos variables:

   **Variable 1:**
   - Key: `GMAIL_USER`
   - Value: `tucorreo@gmail.com`

   **Variable 2:**
   - Key: `GMAIL_APP_PASSWORD`
   - Value: `abcdefghijklmnop` (sin espacios)

6. Haz clic en **"Save Changes"**

7. Render reiniciará automáticamente tu servicio

---

## ✅ Paso 4: Verificar que Funciona

### **Prueba 1: Verificar configuración**

1. Abre tu navegador y ve a:
   ```
   https://saludclara-backend.onrender.com/api/health
   ```

2. Deberías ver algo como:
   ```json
   {
     "status": "ok",
     "message": "Servidor SaludClara funcionando",
     "apis": {
       "groq": "configurada",
       "openai": "no configurada"
     }
   }
   ```

### **Prueba 2: Reservar una cita de prueba**

1. Ve a tu aplicación SaludClara
2. Inicia sesión o regístrate
3. Ve a la sección **"Reservar Cita"**
4. Llena el formulario con tu correo real
5. Completa la reserva
6. **¡Revisa tu bandeja de entrada!** Deberías recibir un correo con el asunto:
   ```
   ✅ Cita Confirmada - SC-XXXXXX - SaludClara
   ```

---

## 🚨 Solución de Problemas

### ❌ Error: "Servicio de correo no configurado"

**Causa:** Las variables `GMAIL_USER` o `GMAIL_APP_PASSWORD` no están configuradas.

**Solución:**
1. Verifica que agregaste ambas variables en el archivo `.env` (local) o en Render (producción)
2. Asegúrate de que no haya espacios extra en las variables
3. Reinicia el servidor

---

### ❌ Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Causa:** La contraseña de aplicación es incorrecta o estás usando tu contraseña normal de Gmail.

**Solución:**
1. **NO uses tu contraseña normal de Gmail**
2. Genera una nueva contraseña de aplicación siguiendo el Paso 2
3. Asegúrate de copiar la contraseña sin espacios
4. Actualiza la variable `GMAIL_APP_PASSWORD`

---

### ❌ No recibo el correo

**Posibles causas y soluciones:**

1. **Revisa la carpeta de SPAM/Correo no deseado**
   - Los correos automáticos a veces caen ahí

2. **Verifica que el correo esté bien escrito**
   - Revisa que no haya errores de tipeo en el email

3. **Revisa los logs del backend**
   - En Render, ve a la pestaña "Logs"
   - Busca mensajes como "✅ Correo enviado exitosamente"

4. **Límites de Gmail**
   - Gmail tiene límites de envío:
     - 500 correos por día para cuentas gratuitas
     - 2000 correos por día para Google Workspace
   - Si superas el límite, espera 24 horas

---

## 🔒 Seguridad

### ✅ Buenas Prácticas:

1. **NUNCA compartas tu contraseña de aplicación**
   - Es como tu contraseña normal, mantenla segura

2. **NUNCA subas el archivo `.env` a GitHub**
   - Ya está en `.gitignore` por seguridad

3. **Usa una cuenta de Gmail dedicada**
   - Crea una cuenta específica para SaludClara (ej: `saludclara.notificaciones@gmail.com`)
   - No uses tu cuenta personal

4. **Revoca contraseñas no utilizadas**
   - Si cambias de cuenta o ya no usas una contraseña, revócala en:
     https://myaccount.google.com/apppasswords

---

## 📧 Personalizar el Correo

Si quieres cambiar el diseño o contenido del correo:

1. Abre el archivo: `mi-backend/server.js`

2. Busca la función con el comentario:
   ```javascript
   // ENDPOINT PARA ENVIAR CORREO DE CONFIRMACIÓN
   ```

3. Modifica la variable `htmlContent` con tu propio HTML

4. Guarda y reinicia el servidor

---

## 🆘 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. **Revisa los logs del backend** para ver errores específicos
2. **Verifica que todas las variables estén configuradas correctamente**
3. **Asegúrate de que la verificación en 2 pasos esté activada**
4. **Intenta generar una nueva contraseña de aplicación**

---

## 📚 Enlaces Útiles

- **Contraseñas de aplicación de Google:** https://support.google.com/accounts/answer/185833
- **Verificación en 2 pasos:** https://support.google.com/accounts/answer/185839
- **Documentación de Nodemailer:** https://nodemailer.com/
- **Dashboard de Render:** https://dashboard.render.com/

---

✅ **¡Listo!** Ahora tu aplicación SaludClara enviará correos automáticos a los pacientes cuando reserven una cita.
