// ============================================
// BACKEND SEGURO PARA SALUDCLARA
// ============================================
// Archivo: server.js

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
require('dotenv').config();

const { verificarToken, verificarTokenOpcional, generarToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

const { 
    pool, 
    verificarConexion, 
    inicializarTablas,
    cerrarPool,
    healthCheck 
} = require('./config/database');

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware CORS configurado para producción
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || '*' // En producción, especifica tu dominio de frontend
        : '*', // En desarrollo permite todo
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Aumentar límite para imágenes base64
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// RUTA RAÍZ - INFO DE LA API
// ============================================
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

// ============================================
// ENDPOINTS DE AUTENTICACIÓN
// ============================================

// REGISTRO LOCAL
app.post('/api/auth/registro', async (req, res) => {
    try {
        const { nombre, email, telefono, password } = req.body;

        // Validaciones
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar si el email ya existe
        const usuarioExistente = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email]
        );

        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario
        const resultado = await pool.query(
            `INSERT INTO usuarios (nombre, email, telefono, password_hash, tipo_auth) 
             VALUES ($1, $2, $3, $4, 'local') 
             RETURNING id, nombre, email, telefono, tipo_auth, fecha_registro`,
            [nombre, email, telefono || null, passwordHash]
        );

        const usuario = resultado.rows[0];

        // Generar token JWT
        const token = generarToken(usuario);

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                tipo_auth: usuario.tipo_auth
            }
        });

    } catch (error) {
        console.error('Error en /api/auth/registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// LOGIN LOCAL
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario
        const resultado = await pool.query(
            'SELECT id, nombre, email, telefono, password_hash, tipo_auth, activo FROM usuarios WHERE email = $1',
            [email]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const usuario = resultado.rows[0];

        if (!usuario.activo) {
            return res.status(401).json({ error: 'Usuario desactivado' });
        }

        if (usuario.tipo_auth !== 'local') {
            return res.status(400).json({ error: 'Esta cuenta usa inicio de sesión con Google' });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValido) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        // Actualizar último acceso
        await pool.query(
            'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
            [usuario.id]
        );

        // Generar token JWT
        const token = generarToken(usuario);

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                tipo_auth: usuario.tipo_auth
            }
        });

    } catch (error) {
        console.error('Error en /api/auth/login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// LOGIN CON GOOGLE (Simplificado - confía en el frontend)
app.post('/api/auth/google', async (req, res) => {
    try {
        const { googleId, nombre, email, foto } = req.body;

        // Validar que vengan los datos requeridos
        if (!googleId || !email || !nombre) {
            return res.status(400).json({ error: 'Datos de Google requeridos (googleId, email, nombre)' });
        }

        const googleIdFinal = googleId;
        const emailFinal = email;
        const nombreFinal = nombre;
        const fotoPerfil = foto;

        // Buscar si el usuario ya existe
        let resultado = await pool.query(
            'SELECT id, nombre, email, telefono, tipo_auth, activo FROM usuarios WHERE google_id = $1 OR email = $2',
            [googleIdFinal, emailFinal]
        );

        let usuario;

        if (resultado.rows.length === 0) {
            // Crear nuevo usuario
            resultado = await pool.query(
                `INSERT INTO usuarios (nombre, email, google_id, foto_perfil, tipo_auth) 
                 VALUES ($1, $2, $3, $4, 'google') 
                 RETURNING id, nombre, email, telefono, tipo_auth`,
                [nombreFinal, emailFinal, googleIdFinal, fotoPerfil]
            );
            usuario = resultado.rows[0];
        } else {
            usuario = resultado.rows[0];

            if (!usuario.activo) {
                return res.status(401).json({ error: 'Usuario desactivado' });
            }

            // Actualizar último acceso y foto de perfil
            await pool.query(
                'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP, foto_perfil = $1 WHERE id = $2',
                [fotoPerfil, usuario.id]
            );
        }

        // Generar token JWT
        const token = generarToken(usuario);

        res.json({
            mensaje: 'Inicio de sesión con Google exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                tipo_auth: usuario.tipo_auth,
                foto: fotoPerfil
            }
        });

    } catch (error) {
        console.error('Error en /api/auth/google:', error);
        res.status(500).json({ error: 'Error al autenticar con Google' });
    }
});

// VERIFICAR TOKEN (obtener datos del usuario actual)
app.get('/api/auth/me', verificarToken, async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT id, nombre, email, telefono, foto_perfil, tipo_auth, fecha_registro FROM usuarios WHERE id = $1',
            [req.usuario.id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ usuario: resultado.rows[0] });

    } catch (error) {
        console.error('Error en /api/auth/me:', error);
        res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }
});

// ============================================
// ENDPOINT PARA CHAT DE SÍNTOMAS
// ============================================
app.post('/api/chat', async (req, res) => {
    try {
        const { mensaje, historial } = req.body;

        if (!mensaje) {
            return res.status(400).json({ error: 'Mensaje requerido' });
        }

        // Determinar qué API usar según las variables de entorno
        const useGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== '';
        const useOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';

        if (!useGroq && !useOpenAI) {
            return res.status(500).json({ 
                error: 'No hay API configurada. Por favor configura GROQ_API_KEY o OPENAI_API_KEY en el archivo .env' 
            });
        }

        const systemPrompt = "Eres un asistente médico virtual llamado SaludClara. Responde de forma BREVE y CONCISA (máximo 1-2 párrafos cortos). IMPORTANTE: 1) NO eres médico, NO das diagnósticos definitivos. 2) Da información educativa simple. 3) SIEMPRE recuerda al usuario que debe consultar un profesional médico real para un diagnóstico adecuado. 4) Sé empático y usa lenguaje simple. 5) Si hay síntomas graves (dolor de pecho intenso, dificultad respiratoria, sangrado abundante), enfatiza URGENCIA MÉDICA INMEDIATA. Estructura tu respuesta así: posibles causas breves, recomendaciones básicas (4-5), cuándo consultar médico. NUNCA olvides mencionar que tu información NO reemplaza la consulta médica profesional.";

        let response;

        if (useGroq) {
            // Usar Groq API (RECOMENDADO - Gratis y rápido)
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...(historial || []),
                        { role: 'user', content: mensaje }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });
        } else if (useOpenAI) {
            // Usar OpenAI API
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...(historial || []),
                        { role: 'user', content: mensaje }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error en la API');
        }

        const data = await response.json();
        const respuestaIA = data.choices[0].message.content;

        res.json({ 
            respuesta: respuestaIA,
            provider: useGroq ? 'groq' : 'openai'
        });

    } catch (error) {
        console.error('Error en /api/chat:', error);
        res.status(500).json({ 
            error: 'Error al procesar la solicitud: ' + error.message 
        });
    }
});

// ============================================
// ENDPOINT PARA TRADUCTOR MÉDICO
// ============================================
app.post('/api/traducir', async (req, res) => {
    try {
        const { termino } = req.body;

        if (!termino) {
            return res.status(400).json({ error: 'Término requerido' });
        }

        const useGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== '';
        const useOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';

        if (!useGroq && !useOpenAI) {
            return res.status(500).json({ 
                error: 'No hay API configurada' 
            });
        }

        const systemPrompt = "Eres un traductor médico experto. Tu trabajo es explicar términos médicos en lenguaje simple y claro, como si le hablaras a alguien sin conocimientos médicos. Sé conciso, amable y educativo.";
        const prompt = `Explica el término médico "${termino}" en lenguaje simple y fácil de entender. Incluye: 1) Qué es, 2) Síntomas comunes (si aplica), 3) Causas principales, 4) Cuándo consultar un médico. Mantén la explicación concisa (máximo 150 palabras).`;

        let response;

        if (useGroq) {
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });
        } else if (useOpenAI) {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error en la API');
        }

        const data = await response.json();
        const explicacion = data.choices[0].message.content;

        res.json({ 
            explicacion: explicacion,
            provider: useGroq ? 'groq' : 'openai'
        });

    } catch (error) {
        console.error('Error en /api/traducir:', error);
        res.status(500).json({ 
            error: 'Error al procesar la solicitud: ' + error.message 
        });
    }
});

// ============================================
// ENDPOINT PARA ANALIZAR TEXTO MÉDICO (OCR + Groq)
// ============================================
app.post('/api/analizar-texto-medico', async (req, res) => {
    try {
        const { texto } = req.body;

        if (!texto) {
            return res.status(400).json({ error: 'Texto requerido' });
        }

        const useGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== '';
        const useOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';

        if (!useGroq && !useOpenAI) {
            return res.status(500).json({ 
                error: 'No hay API configurada. Por favor configura GROQ_API_KEY o OPENAI_API_KEY en el archivo .env' 
            });
        }

        const systemPrompt = "Eres un médico experto que explica documentos médicos en lenguaje simple y comprensible para pacientes.";
        
        const prompt = `Analiza el siguiente texto extraído de un documento médico y proporciona:

1. **Tipo de Documento**: Identifica qué tipo de documento es (informe médico, examen de laboratorio, receta, epicrisis, etc.)

2. **Resumen Simple**: Explica en 2-3 oraciones qué dice el documento en términos que cualquier persona pueda entender.

3. **Hallazgos Principales**: Lista los puntos más importantes del documento, explicando cada término médico en lenguaje simple.

4. **¿Está todo bien?**: Indica claramente si los resultados son normales, si hay algo que requiere atención, o si necesita consultar con un médico.

5. **Recomendaciones**: Sugiere los próximos pasos que debería tomar el paciente.

Por favor, usa un tono amable, tranquilizador y educativo. Evita jerga médica compleja y usa analogías cuando sea necesario.

TEXTO DEL DOCUMENTO:
${texto}`;

        let response;

        if (useGroq) {
            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 1500,
                    temperature: 0.7
                })
            });
        } else if (useOpenAI) {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 1500,
                    temperature: 0.7
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error en la API');
        }

        const data = await response.json();
        const explicacion = data.choices[0].message.content;

        res.json({ 
            explicacion: explicacion,
            provider: useGroq ? 'groq' : 'openai'
        });

    } catch (error) {
        console.error('Error en /api/analizar-texto-medico:', error);
        res.status(500).json({ 
            error: 'Error al analizar el documento: ' + error.message 
        });
    }
});

// ============================================
// ENDPOINT PARA ANALIZAR DOCUMENTOS MÉDICOS (OpenAI Vision - Opcional)
// ============================================
app.post('/api/analizar-documento', async (req, res) => {
    try {
        const { imagen } = req.body;

        if (!imagen) {
            return res.status(400).json({ error: 'Imagen requerida' });
        }

        // Solo OpenAI soporta análisis de imágenes con GPT-4 Vision
        const useOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';

        if (!useOpenAI) {
            return res.status(500).json({ 
                error: 'Se requiere OpenAI API Key para analizar documentos. Por favor configura OPENAI_API_KEY en el archivo .env' 
            });
        }

        const prompt = `Eres un médico experto que explica documentos médicos en lenguaje simple y comprensible para pacientes.

Analiza este documento médico y proporciona:

1. **Tipo de Documento**: Identifica qué tipo de documento es (informe médico, examen de laboratorio, receta, epicrisis, etc.)

2. **Resumen Simple**: Explica en 2-3 oraciones qué dice el documento en términos que cualquier persona pueda entender.

3. **Hallazgos Principales**: Lista los puntos más importantes del documento, explicando cada término médico en lenguaje simple.

4. **¿Está todo bien?**: Indica claramente si los resultados son normales, si hay algo que requiere atención, o si necesita consultar con un médico.

5. **Recomendaciones**: Sugiere los próximos pasos que debería tomar el paciente.

Por favor, usa un tono amable, tranquilizador y educativo. Evita jerga médica compleja y usa analogías cuando sea necesario.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: imagen } }
                    ]
                }],
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error en la API de OpenAI');
        }

        const data = await response.json();
        const explicacion = data.choices[0].message.content;

        res.json({ 
            explicacion: explicacion,
            provider: 'openai'
        });

    } catch (error) {
        console.error('Error en /api/analizar-documento:', error);
        res.status(500).json({ 
            error: 'Error al analizar el documento: ' + error.message 
        });
    }
});

// ============================================
// ENDPOINTS DE CITAS
// ============================================

// Crear nueva cita
app.post('/api/citas', verificarToken, async (req, res) => {
    try {
        const {
            usuario_id,
            codigo_confirmacion,
            nombre_paciente,
            email_paciente,
            telefono_paciente,
            tipo_cita,
            lugar,
            especialidad,
            fecha,
            hora,
            motivo
        } = req.body;

        // Verificar que el usuario solo pueda crear citas para sí mismo
        if (req.usuario.id !== parseInt(usuario_id)) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const result = await pool.query(
            `INSERT INTO citas (
                usuario_id, codigo_confirmacion, nombre_paciente, email_paciente,
                telefono_paciente, tipo_cita, lugar, especialidad, fecha, hora, motivo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [usuario_id, codigo_confirmacion, nombre_paciente, email_paciente,
             telefono_paciente, tipo_cita, lugar, especialidad, fecha, hora, motivo]
        );

        res.status(201).json({
            mensaje: 'Cita creada exitosamente',
            cita: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ error: 'Error al crear cita' });
    }
});

// Obtener citas de un usuario
app.get('/api/citas/usuario/:usuarioId', verificarToken, async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        // Verificar que el usuario solo pueda ver sus propias citas
        if (req.usuario.id !== parseInt(usuarioId)) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const result = await pool.query(
            `SELECT * FROM citas 
             WHERE usuario_id = $1 
             ORDER BY fecha DESC, hora DESC`,
            [usuarioId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ error: 'Error al obtener citas' });
    }
});

// Cancelar una cita
app.put('/api/citas/:codigo/cancelar', verificarToken, async (req, res) => {
    try {
        const { codigo } = req.params;

        // Verificar que la cita pertenece al usuario
        const citaResult = await pool.query(
            'SELECT * FROM citas WHERE codigo_confirmacion = $1',
            [codigo]
        );

        if (citaResult.rows.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        const cita = citaResult.rows[0];
        if (cita.usuario_id !== req.usuario.id) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        // Actualizar estado a cancelada
        await pool.query(
            'UPDATE citas SET estado = $1 WHERE codigo_confirmacion = $2',
            ['cancelada', codigo]
        );

        res.json({ mensaje: 'Cita cancelada exitosamente' });
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({ error: 'Error al cancelar cita' });
    }
});

// Obtener estadísticas de citas del usuario
app.get('/api/citas/usuario/:usuarioId/estadisticas', verificarToken, async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        if (req.usuario.id !== parseInt(usuarioId)) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const result = await pool.query(
            `SELECT 
                COUNT(*) FILTER (WHERE estado = 'confirmada' AND fecha >= CURRENT_DATE) as proximas,
                COUNT(*) FILTER (WHERE estado = 'cancelada') as canceladas,
                COUNT(*) FILTER (WHERE fecha < CURRENT_DATE AND estado != 'cancelada') as pasadas,
                COUNT(*) as total
             FROM citas 
             WHERE usuario_id = $1`,
            [usuarioId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// ============================================
// ENDPOINT PARA ENVIAR CORREO DE CONFIRMACIÓN
// ============================================
app.post('/api/enviar-correo-cita', async (req, res) => {
    try {
        const {
            email_paciente,
            nombre_paciente,
            codigo_confirmacion,
            tipo_cita,
            lugar,
            especialidad,
            fecha,
            hora,
            motivo
        } = req.body;

        // Validar que vengan los datos requeridos
        if (!email_paciente || !nombre_paciente || !codigo_confirmacion) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // Verificar que las credenciales de Gmail estén configuradas
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            console.error('❌ Credenciales de Gmail no configuradas');
            return res.status(500).json({ 
                error: 'Servicio de correo no configurado. Contacta al administrador.' 
            });
        }

        // Configurar el transporter de nodemailer con Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        // Formatear la fecha
        const fechaFormateada = new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Contenido del correo en HTML
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #667eea; }
        .codigo { background: #667eea; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0; letter-spacing: 2px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 SaludClara</h1>
            <h2>Confirmación de Cita Médica</h2>
        </div>
        <div class="content">
            <p>Hola <strong>${nombre_paciente}</strong>,</p>
            <p>Tu cita médica ha sido confirmada exitosamente. A continuación encontrarás los detalles:</p>
            
            <div class="codigo">
                📋 ${codigo_confirmacion}
            </div>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">📅 Detalles de la Cita</h3>
                <div class="info-row">
                    <span class="label">Tipo de Cita:</span> ${tipo_cita === 'virtual' ? '💻 Virtual (Videollamada)' : '🏥 Presencial'}
                </div>
                ${lugar ? `<div class="info-row"><span class="label">Lugar:</span> ${lugar}</div>` : ''}
                <div class="info-row">
                    <span class="label">Especialidad:</span> ${especialidad}
                </div>
                <div class="info-row">
                    <span class="label">Fecha:</span> ${fechaFormateada}
                </div>
                <div class="info-row">
                    <span class="label">Hora:</span> ${hora}
                </div>
                ${motivo ? `<div class="info-row"><span class="label">Motivo:</span> ${motivo}</div>` : ''}
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0;">
                    <li>Llega 15 minutos antes de tu cita</li>
                    <li>Trae tu documento de identidad</li>
                    ${tipo_cita === 'virtual' ? '<li>Asegúrate de tener buena conexión a internet</li>' : '<li>Trae tu carnet de seguro (si aplica)</li>'}
                    <li>Guarda este correo como comprobante</li>
                </ul>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
                <strong>¿Necesitas cancelar o reprogramar?</strong><br>
                Ingresa a tu cuenta en SaludClara con el código: <strong>${codigo_confirmacion}</strong>
            </p>
        </div>
        <div class="footer">
            <p><strong>SaludClara</strong> - Tu salud, nuestra prioridad</p>
            <p>Este es un correo automático, por favor no responder.</p>
            <p>© ${new Date().getFullYear()} SaludClara. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
        `;

        // Opciones del correo
        const mailOptions = {
            from: `"SaludClara 🏥" <${process.env.GMAIL_USER}>`,
            to: email_paciente,
            subject: `✅ Cita Confirmada - ${codigo_confirmacion} - SaludClara`,
            html: htmlContent
        };

        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Correo enviado exitosamente:', info.messageId);
        
        res.json({ 
            mensaje: 'Correo enviado exitosamente',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
        res.status(500).json({ 
            error: 'Error al enviar correo: ' + error.message 
        });
    }
});

// ============================================
// ENDPOINT DE PRUEBA
// ============================================
app.get('/api/health', (req, res) => {
    const groqConfigured = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== '';
    const openaiConfigured = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';
    
    res.json({ 
        status: 'ok',
        message: 'Servidor SaludClara funcionando',
        apis: {
            groq: groqConfigured ? 'configurada' : 'no configurada',
            openai: openaiConfigured ? 'configurada' : 'no configurada'
        },
        google_client_id: process.env.GOOGLE_CLIENT_ID || null
    });
});

// ============================================
// INICIALIZACIÓN Y ARRANQUE
// ============================================

async function iniciarServidor() {
    try {
        // 1. Verificar conexión a BD
        const conexionOK = await verificarConexion();
        
        if (!conexionOK) {
            console.error('❌ No se pudo conectar a la base de datos');
            console.error('   El servidor NO se iniciará');
            process.exit(1);
        }
        
        // 2. Inicializar tablas
        await inicializarTablas();
        
        // 3. Iniciar servidor Express
        const server = app.listen(PORT, () => {
            console.log('\n🏥 ═══════════════════════════════════════════');
            console.log('   SERVIDOR SALUDCLARA INICIADO');
            console.log('   ═══════════════════════════════════════════');
            console.log(`\n   🌐 URL: http://localhost:${PORT}`);
            console.log(`   📦 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n   📡 Endpoints principales:');
            console.log('      • POST /api/auth/registro');
            console.log('      • POST /api/auth/login');
            console.log('      • POST /api/auth/google');
            console.log('      • POST /api/chat');
            console.log('      • POST /api/citas');
            console.log('      • GET  /api/health');
            
            const groqConfigured = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== '';
            const openaiConfigured = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';
            
            console.log('\n   🔑 APIs configuradas:');
            if (groqConfigured) console.log('      ✅ Groq');
            if (openaiConfigured) console.log('      ✅ OpenAI');
            if (!groqConfigured && !openaiConfigured) {
                console.log('      ⚠️  Ninguna (configura GROQ_API_KEY)');
            }
            
            console.log('\n   🚀 Listo para recibir peticiones');
            console.log('   ═══════════════════════════════════════════\n');
        });
        
        // Manejo de cierre graceful
        process.on('SIGTERM', async () => {
            console.log('\n⚠️  SIGTERM recibido. Cerrando servidor...');
            server.close(async () => {
                await cerrarPool();
                process.exit(0);
            });
        });
        
        process.on('SIGINT', async () => {
            console.log('\n⚠️  SIGINT recibido (Ctrl+C). Cerrando servidor...');
            server.close(async () => {
                await cerrarPool();
                process.exit(0);
            });
        });
        
    } catch (error) {
        console.error('\n❌ Error fatal al iniciar servidor:', error);
        process.exit(1);
    }
}

// Iniciar servidor
iniciarServidor();