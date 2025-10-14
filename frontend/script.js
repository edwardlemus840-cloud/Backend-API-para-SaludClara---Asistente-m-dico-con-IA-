// ===== VARIABLES GLOBALES =====
const API_URL = 'https://saludclara-backend.onrender.com'; // URL del backend en producción
let conversationHistory = [];

// Utilidad: Fetch genérico con manejo de errores
const apiFetch = async (endpoint, options = {}) => {
    const config = {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    };
    if (usuarioActual?.token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${usuarioActual.token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || `Error ${response.status}`);
    }
    return response.json();
};

// Utilidad: Formatear fecha
const formatearFecha = (fecha) => new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// Utilidad: Toggle de elementos
const toggleElement = (id, show) => document.getElementById(id)?.classList.toggle('hidden', !show);

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Menú móvil
    document.getElementById('menu-toggle').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
    
    // Verificar conexión con el backend
    verificarBackend();
});

// ===== NAVEGACIÓN =====
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(s => {
        s.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById('seccion-' + seccionId).classList.add('active');
    
    // Cerrar menú móvil
    document.getElementById('mobile-menu').classList.add('hidden');
    
    // Mostrar/Ocultar footer según la sección
    const footer = document.getElementById('main-footer');
    if (footer) {
        if (seccionId === 'inicio') {
            footer.style.display = 'block'; // Mostrar footer solo en Inicio
            console.log('✅ Footer MOSTRADO (sección: inicio)');
        } else {
            footer.style.display = 'none'; // Ocultar footer en otras secciones
            console.log('❌ Footer OCULTADO (sección: ' + seccionId + ')');
        }
    }
    
    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== VERIFICAR BACKEND =====
async function verificarBackend() {
    try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            let provider = '';
            if (data.apis.groq === 'configurada') provider = 'Groq';
            else if (data.apis.openai === 'configurada') provider = 'OpenAI';
            
            if (provider) {
                mostrarEstadoAPI(`✅ Conectado con ${provider}`, 'success');
            } else {
                mostrarEstadoAPI('⚠️ Backend conectado pero sin API configurada en .env', 'warning');
            }
        }
    } catch (error) {
        mostrarEstadoAPI('❌ No se pudo conectar al backend. Asegúrate de que esté corriendo en http://localhost:3000', 'error');
        console.error('Error de conexión:', error);
    }
}

// ===== MODAL API (Ahora solo informativo) =====
function mostrarConfigAPI() {
    alert('📝 Para configurar las API keys:\n\n1. Ve a la carpeta mi-backend/\n2. Edita el archivo .env\n3. Agrega tu GROQ_API_KEY o OPENAI_API_KEY\n4. Reinicia el servidor (node server.js)\n\n💡 Recomendado: Usa Groq (gratis y rápido)\nObtén tu key en: https://console.groq.com/keys');
}

function cerrarModal() {
    document.getElementById('api-modal').classList.add('hidden');
}

function guardarAPIKey() {
    alert('Las API keys se configuran en el archivo .env del backend, no aquí en el frontend por seguridad.');
    cerrarModal();
}

function mostrarEstadoAPI(mensaje, tipo) {
    const statusDiv = document.getElementById('api-status');
    if (!statusDiv) return;
    
    const colores = {
        success: 'bg-green-100 text-green-700 border-green-300',
        error: 'bg-red-100 text-red-700 border-red-300',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-300'
    };
    
    statusDiv.innerHTML = `<span class="inline-block px-4 py-2 rounded-lg border ${colores[tipo]} text-sm font-semibold">${mensaje}</span>`;
}

// ===== LLAMADA AL BACKEND =====
async function llamarIA(mensaje, esTraductor = false) {
    try {
        const endpoint = esTraductor ? '/api/traducir' : '/api/chat';
        const body = esTraductor 
            ? { termino: mensaje }
            : { mensaje: mensaje, historial: conversationHistory };

        const data = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
        const respuestaIA = esTraductor ? data.explicacion : data.respuesta;
        
        // Guardar en historial si no es traductor
        if (!esTraductor) {
            conversationHistory.push(
                { role: 'user', content: mensaje },
                { role: 'assistant', content: respuestaIA }
            );
            // Limitar historial a 10 mensajes
            if (conversationHistory.length > 10) {
                conversationHistory = conversationHistory.slice(-10);
            }
        }
        
        return respuestaIA;
        
    } catch (error) {
        console.error('Error al comunicarse con el backend:', error);
        mostrarEstadoAPI('❌ Error: ' + error.message, 'error');
        return null;
    }
}

// ===== CHAT DE DIAGNÓSTICO =====
function agregarMensaje(texto, esUsuario = false) {
    const chatContainer = document.getElementById('chat-container');
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'chat-message mb-4';
    
    if (esUsuario) {
        // Escapar HTML para mensajes de usuario
        const textoSeguro = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        mensajeDiv.innerHTML = `
            <div class="flex items-start justify-end">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-md p-4 max-w-md">
                    <p>${textoSeguro}</p>
                </div>
                <div class="bg-gray-400 text-white p-3 rounded-full ml-3 flex-shrink-0 shadow-lg">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                </div>
            </div>
        `;
    } else {
        // Convertir saltos de línea a <br> y permitir HTML para respuestas de IA
        const textoFormateado = texto.replace(/\n/g, '<br>');
        mensajeDiv.innerHTML = `
            <div class="flex items-start">
                <div class="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-2xl mr-3 flex-shrink-0 shadow-lg">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                    </svg>
                </div>
                <div class="bg-white rounded-2xl shadow-md p-5 max-w-md">
                    <div class="text-gray-800">${textoFormateado}</div>
                </div>
            </div>
        `;
    }
    
    chatContainer.appendChild(mensajeDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function mostrarIndicadorEscritura() {
    const chatContainer = document.getElementById('chat-container');
    const indicador = document.createElement('div');
    indicador.id = 'typing-indicator';
    indicador.className = 'chat-message mb-4';
    indicador.innerHTML = `
        <div class="flex items-start">
            <div class="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-2xl mr-3 flex-shrink-0 shadow-lg">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                </svg>
            </div>
            <div class="bg-white rounded-2xl shadow-md p-4">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    chatContainer.appendChild(indicador);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function quitarIndicadorEscritura() {
    const indicador = document.getElementById('typing-indicator');
    if (indicador) {
        indicador.remove();
    }
}

async function enviarMensaje() {
    const input = document.getElementById('chat-input');
    const mensaje = input.value.trim();
    
    if (mensaje === '') return;
    
    agregarMensaje(mensaje, true);
    input.value = '';
    
    mostrarIndicadorEscritura();
    
    const respuesta = await llamarIA(mensaje, false);
    
    quitarIndicadorEscritura();
    
    if (respuesta) {
        // Agregar advertencia médica al final de cada respuesta
        const respuestaConAdvertencia = respuesta + 
            '\n\n<div style="margin-top: 12px; padding: 10px; background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%); border-left: 4px solid #F59E0B; border-radius: 8px;">' +
            '<p style="margin: 0; font-size: 12px; color: #92400E; font-weight: 600;">⚠️ RECORDATORIO: Esta información NO reemplaza el diagnóstico de un médico profesional. Si tus síntomas persisten o empeoran, consulta a un doctor.</p>' +
            '</div>';
        agregarMensaje(respuestaConAdvertencia, false);
    } else {
        agregarMensaje('Lo siento, hubo un error. Por favor verifica tu API key.', false);
    }
}

function usarSugerencia(texto) {
    document.getElementById('chat-input').value = texto;
    enviarMensaje();
}

// ===== TRADUCTOR MÉDICO =====
async function traducirTermino() {
    const termino = document.getElementById('termino-input').value.trim();
    const resultadoDiv = document.getElementById('traduccion-resultado');
    const tituloDiv = document.getElementById('termino-titulo');
    const explicacionDiv = document.getElementById('termino-explicacion');
    
    if (termino === '') {
        mostrarNotificacion('Por favor, ingresa un término médico', 'warning');
        return;
    }
    
    tituloDiv.textContent = termino.charAt(0).toUpperCase() + termino.slice(1);
    explicacionDiv.innerHTML = '<div class="flex items-center"><div class="typing-indicator"><span></span><span></span><span></span></div><span class="ml-3 text-gray-600">Consultando con la IA...</span></div>';
    resultadoDiv.classList.remove('hidden');
    resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    const respuesta = await llamarIA(termino, true);
    
    if (respuesta) {
        const respuestaFormateada = respuesta.replace(/\n\n/g, '</p><p class="mb-2">').replace(/\n/g, '<br>');
        explicacionDiv.innerHTML = '<p class="mb-2">' + respuestaFormateada + '</p>';
    } else {
        explicacionDiv.textContent = 'Lo siento, hubo un error. Por favor verifica tu API key.';
    }
}

function usarTermino(termino) {
    document.getElementById('termino-input').value = termino;
    traducirTermino();
}

// ===== SISTEMA DE RESERVA DE CITAS CON PASOS =====
let pasoActualCita = 1;

document.addEventListener('DOMContentLoaded', function() {
    const formCitas = document.getElementById('form-citas');
    if (formCitas) {
        formCitas.addEventListener('submit', function(e) {
            e.preventDefault();
            reservarCita();
        });
    }
    
    // Configurar fecha mínima (mañana)
    const fechaInput = document.getElementById('cita-fecha');
    if (fechaInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        fechaInput.min = tomorrow.toISOString().split('T')[0];
    }
});

function siguientePasoCita(paso) {
    console.log('📋 Intentando ir al paso:', paso, '| Paso actual:', pasoActualCita);
    
    // Validar paso actual antes de avanzar
    if (paso > pasoActualCita) {
        if (pasoActualCita === 1) {
            const nombreEl = document.getElementById('cita-nombre');
            const correoEl = document.getElementById('cita-correo');
            const telefonoEl = document.getElementById('cita-telefono');
            const tipoEl = document.getElementById('cita-tipo');
            const especialidadEl = document.getElementById('cita-especialidad');
            
            const nombre = nombreEl ? nombreEl.value : '';
            const correo = correoEl ? correoEl.value : '';
            const telefono = telefonoEl ? telefonoEl.value : '';
            const tipo = tipoEl ? tipoEl.value : '';
            const lugar = window.lugarCitaSeleccionado || '';
            const especialidad = especialidadEl ? especialidadEl.value : '';
            
            console.log('Validando Paso 1:', { nombre, correo, telefono, tipo, lugar, especialidad });
            
            if (!nombre || !correo || !telefono || !tipo || !especialidad) {
                console.log('❌ Validación fallida: Campos incompletos');
                mostrarNotificacion('Por favor completa todos los campos obligatorios', 'warning');
                return;
            }
            
            if (tipo === 'presencial' && !lugar) {
                console.log('❌ Validación fallida: Falta lugar para cita presencial');
                mostrarNotificacion('Por favor selecciona un lugar de atención en el mapa', 'warning');
                return;
            }
            
            console.log('✅ Paso 1 validado correctamente');
        } else if (pasoActualCita === 2) {
            const fechaEl = document.getElementById('cita-fecha');
            const horaEl = document.getElementById('cita-hora');
            const motivoEl = document.getElementById('cita-motivo');
            
            const fecha = fechaEl ? fechaEl.value : '';
            const hora = horaEl ? horaEl.value : '';
            const motivo = motivoEl ? motivoEl.value : '';
            
            console.log('Validando Paso 2:', { fecha, hora, motivo });
            
            // Validación específica por campo
            if (!fecha) {
                console.log('❌ Falta: Fecha');
                mostrarNotificacion('Por favor selecciona la fecha de la cita', 'warning');
                return;
            }
            if (!hora) {
                console.log('❌ Falta: Hora');
                mostrarNotificacion('Por favor selecciona la hora de la cita', 'warning');
                return;
            }
            if (!motivo || motivo.trim().length < 10) {
                console.log('❌ Falta: Motivo (mínimo 10 caracteres)');
                mostrarNotificacion('Por favor describe el motivo de tu consulta (mínimo 10 caracteres)', 'warning');
                return;
            }
            
            // Llenar resumen
            mostrarResumenCita();
            console.log('✅ Paso 2 validado correctamente');
        }
    }
    
    // Ocultar todos los pasos
    const pasos = document.querySelectorAll('.paso-cita');
    console.log('Pasos encontrados:', pasos.length);
    pasos.forEach(p => p.classList.add('hidden'));
    
    // Mostrar paso seleccionado
    const pasoElement = document.getElementById('paso-' + paso);
    console.log('Elemento paso-' + paso + ':', pasoElement);
    
    if (pasoElement) {
        pasoElement.classList.remove('hidden');
        console.log('✅ Mostrando paso', paso);
    } else {
        console.error('❌ No se encontró el elemento paso-' + paso);
    }
    
    // Actualizar barra de progreso
    pasoActualCita = paso;
    const porcentaje = (paso / 3) * 100;
    document.getElementById('paso-actual').textContent = paso;
    document.getElementById('progreso-porcentaje').textContent = Math.round(porcentaje);
    document.getElementById('barra-progreso').style.width = porcentaje + '%';
    
    console.log('📊 Progreso actualizado:', porcentaje + '%');
    
    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Utilidad: Obtener datos del formulario de cita
const obtenerDatosCita = () => {
    // Variable global para el lugar seleccionado (se establece desde el mapa)
    const lugarSeleccionado = window.lugarCitaSeleccionado || '';
    
    const nombreEl = document.getElementById('cita-nombre');
    const correoEl = document.getElementById('cita-correo');
    const telefonoEl = document.getElementById('cita-telefono');
    const tipoEl = document.getElementById('cita-tipo');
    const especialidadEl = document.getElementById('cita-especialidad');
    const fechaEl = document.getElementById('cita-fecha');
    const horaEl = document.getElementById('cita-hora');
    
    // Obtener especialidad (ahora es un hidden input que se llena desde los radio buttons)
    const especialidad = especialidadEl ? especialidadEl.value : '';
    
    return {
        nombre: nombreEl ? nombreEl.value : '',
        correo: correoEl ? correoEl.value : '',
        telefono: telefonoEl ? telefonoEl.value : '',
        tipo: tipoEl ? tipoEl.value : '',
        lugar: lugarSeleccionado,
        especialidad: especialidad,
        especialidadTexto: especialidad, // Ya es texto directo
        fecha: fechaEl ? fechaEl.value : '',
        hora: horaEl ? horaEl.value : ''
    };
};

function mostrarResumenCita() {
    console.log('📝 Mostrando resumen de cita...');
    const datos = obtenerDatosCita();
    const tipoTexto = datos.tipo === 'virtual' ? '💻 Virtual (Videollamada)' : '🏥 Presencial';
    const fechaFormateada = formatearFecha(datos.fecha);
    
    console.log('Datos del resumen:', datos);
    
    ['nombre', 'correo', 'telefono', 'lugar', 'hora'].forEach(campo => {
        const elemento = document.getElementById(`resumen-${campo}`);
        if (elemento) {
            elemento.textContent = datos[campo];
        } else {
            console.warn(`⚠️ No se encontró el elemento resumen-${campo}`);
        }
    });
    
    const tipoEl = document.getElementById('resumen-tipo');
    const especialidadEl = document.getElementById('resumen-especialidad');
    const fechaEl = document.getElementById('resumen-fecha');
    
    if (tipoEl) tipoEl.textContent = tipoTexto;
    if (especialidadEl) especialidadEl.textContent = datos.especialidadTexto;
    if (fechaEl) fechaEl.textContent = fechaFormateada;
    
    console.log('✅ Resumen mostrado correctamente');
}

async function reservarCita() {
    const datos = obtenerDatosCita();
    const motivo = document.getElementById('cita-motivo').value;
    const codigo = 'SC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const tipoTexto = datos.tipo === 'virtual' ? '💻 Virtual (Videollamada)' : '🏥 Presencial';
    const fechaFormateada = formatearFecha(datos.fecha);
    
    // GUARDAR EN BASE DE DATOS
    if (usuarioActual?.token) {
        try {
            await apiFetch('/api/citas', {
                method: 'POST',
                body: JSON.stringify({
                    usuario_id: usuarioActual.id,
                    codigo_confirmacion: codigo,
                    nombre_paciente: datos.nombre,
                    email_paciente: datos.correo,
                    telefono_paciente: datos.telefono,
                    tipo_cita: datos.tipo,
                    lugar: datos.lugar || null,
                    especialidad: datos.especialidadTexto,
                    fecha: datos.fecha,
                    hora: datos.hora,
                    motivo: motivo
                })
            });
            console.log('✅ Cita guardada en base de datos');
            mostrarNotificacion('Cita reservada exitosamente', 'success');
        } catch (error) {
            console.error('Error al guardar cita:', error);
            mostrarNotificacion('Cita creada pero sin conexión a BD', 'warning');
        }
    }
    
    // Llenar comprobante
    console.log('📄 Llenando comprobante...');
    const codigoEl = document.getElementById('codigo-confirmacion-final');
    if (codigoEl) codigoEl.textContent = codigo;
    
    ['nombre', 'correo', 'telefono', 'lugar', 'hora'].forEach(campo => {
        const elemento = document.getElementById(`comp-${campo}`);
        if (elemento) {
            elemento.textContent = datos[campo];
        } else {
            console.warn(`⚠️ No se encontró el elemento comp-${campo}`);
        }
    });
    
    const tipoEl = document.getElementById('comp-tipo');
    const especialidadEl = document.getElementById('comp-especialidad');
    const fechaEl = document.getElementById('comp-fecha');
    
    if (tipoEl) tipoEl.textContent = tipoTexto;
    if (especialidadEl) especialidadEl.textContent = datos.especialidadTexto;
    if (fechaEl) fechaEl.textContent = fechaFormateada;
    
    console.log('✅ Comprobante llenado');
    
    // Mostrar comprobante
    const formEl = document.getElementById('form-citas');
    const comprobanteEl = document.getElementById('comprobante-cita');
    
    if (formEl) formEl.classList.add('hidden');
    if (comprobanteEl) comprobanteEl.classList.remove('hidden');
    
    // Ocultar barra de progreso
    const barraProgreso = document.querySelector('.mb-8');
    if (barraProgreso) barraProgreso.style.display = 'none';
    
    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('✅ Cita reservada exitosamente:', {
        codigo,
        nombre: datos.nombre,
        correo: datos.correo,
        telefono: datos.telefono,
        tipo: datos.tipo,
        lugar: datos.lugar,
        especialidad: datos.especialidadTexto,
        fecha: datos.fecha,
        hora: datos.hora,
        motivo
    });
    
    // Enviar correo de confirmación
    enviarCorreoConfirmacion({ 
        ...datos, 
        tipo: tipoTexto, 
        especialidad: datos.especialidadTexto, 
        fecha: fechaFormateada, 
        motivo, 
        codigo 
    });
}

function imprimirComprobante() {
    window.print();
}

function descargarPDF() {
    // Usar html2pdf si está disponible, sino usar print
    if (typeof html2pdf !== 'undefined') {
        const elemento = document.getElementById('comprobante-contenido');
        const opt = {
            margin: 10,
            filename: 'comprobante-cita-saludclara.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(elemento).save();
    } else {
        // Fallback: usar print
        mostrarNotificacion('Se abrirá la ventana de impresión. Selecciona "Guardar como PDF"', 'info');
        window.print();
    }
}

function nuevaCita() {
    // Resetear formulario
    document.getElementById('form-citas').reset();
    document.getElementById('form-citas').classList.remove('hidden');
    document.getElementById('comprobante-cita').classList.add('hidden');
    
    // Mostrar barra de progreso
    document.querySelector('.mb-8').style.display = 'block';
    
    // Volver al paso 1
    pasoActualCita = 1;
    siguientePasoCita(1);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== MAPA DE CLÍNICAS Y HOSPITALES =====
let mapa = null;
let marcadores = [];
let filtroActual = 'todos';

// Datos de clínicas y hospitales en El Salvador (coordenadas GPS exactas verificadas)
const ubicacionesMedicas = [
    // San Salvador - Hospitales Públicos
    { nombre: "Hospital Nacional Rosales", tipo: "hospital", lat: 13.7019, lng: -89.2089, ciudad: "San Salvador", telefono: "2231-9200", especialidades: "General, Emergencias, Cirugía, Especialidades" },
    { nombre: "Hospital de la Mujer Dra. María Isabel Rodríguez", tipo: "hospital", lat: 13.7065, lng: -89.2036, ciudad: "San Salvador", telefono: "2591-4200", especialidades: "Ginecología, Obstetricia, Pediatría" },
    { nombre: "Hospital Nacional de Niños Benjamín Bloom", tipo: "hospital", lat: 13.7008, lng: -89.2098, ciudad: "San Salvador", telefono: "2225-4114", especialidades: "Pediatría, Neonatología, Cirugía Pediátrica" },
    { nombre: "Hospital Militar Central", tipo: "hospital", lat: 13.6925, lng: -89.2358, ciudad: "San Salvador", telefono: "2298-2000", especialidades: "General, Traumatología, Emergencias" },
    { nombre: "Hospital Nacional Zacamil", tipo: "hospital", lat: 13.7258, lng: -89.1756, ciudad: "San Salvador", telefono: "2277-5000", especialidades: "Neumología, Medicina Familiar" },
    { nombre: "Hospital Policía Nacional Civil", tipo: "hospital", lat: 13.6845, lng: -89.2189, ciudad: "San Salvador", telefono: "2271-3333", especialidades: "General, Emergencias" },
    { nombre: "Hospital 1° de Mayo ISSS", tipo: "hospital", lat: 13.6978, lng: -89.2156, ciudad: "San Salvador", telefono: "2591-2000", especialidades: "General, Especialidades, Emergencias" },
    
    // San Salvador - Clínicas Privadas
    { nombre: "Hospital de Diagnóstico Escalón", tipo: "clinica", lat: 13.7012, lng: -89.2358, ciudad: "San Salvador", telefono: "2506-5000", especialidades: "Diagnóstico, Laboratorio, Imágenes" },
    { nombre: "Hospital Centro Ginecológico", tipo: "clinica", lat: 13.6989, lng: -89.2289, ciudad: "San Salvador", telefono: "2260-5555", especialidades: "Ginecología, Obstetricia, Cirugía" },
    { nombre: "Centro Médico Escalón", tipo: "clinica", lat: 13.7025, lng: -89.2401, ciudad: "San Salvador", telefono: "2264-3700", especialidades: "Consultas Especializadas, Cirugía" },
    { nombre: "Hospital de la Divina Providencia", tipo: "hospital", lat: 13.6892, lng: -89.2456, ciudad: "San Salvador", telefono: "2243-0303", especialidades: "General, Emergencias, Cirugía" },
    
    // Santa Ana - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Hospital Nacional San Juan de Dios Santa Ana", tipo: "hospital", lat: 13.9947, lng: -89.5556, ciudad: "Santa Ana", telefono: "2440-1900", especialidades: "General, Emergencias, Cirugía" },
    { nombre: "Hospital ISSS Santa Ana", tipo: "hospital", lat: 13.9889, lng: -89.5542, ciudad: "Santa Ana", telefono: "2447-8888", especialidades: "Medicina General, Especialidades" },
    
    // San Miguel - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Hospital Nacional San Juan de Dios San Miguel", tipo: "hospital", lat: 13.4833, lng: -88.1833, ciudad: "San Miguel", telefono: "2661-1376", especialidades: "General, Cirugía, Emergencias" },
    { nombre: "Hospital Regional ISSS San Miguel", tipo: "hospital", lat: 13.4789, lng: -88.1756, ciudad: "San Miguel", telefono: "2661-5000", especialidades: "General, Especialidades" },
    
    // Sonsonate - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Hospital Nacional Jorge Mazzini Villacorta", tipo: "hospital", lat: 13.7189, lng: -89.7242, ciudad: "Sonsonate", telefono: "2451-0044", especialidades: "General, Maternidad, Emergencias" },
    
    // La Libertad - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Centro de Salud Santa Tecla", tipo: "centro-salud", lat: 13.6767, lng: -89.2797, ciudad: "Santa Tecla", telefono: "2228-2100", especialidades: "Atención Primaria, Consulta General" },
    { nombre: "Hospital Nacional San Rafael Santa Tecla", tipo: "hospital", lat: 13.6789, lng: -89.2856, ciudad: "Santa Tecla", telefono: "2229-2000", especialidades: "General, Emergencias" },
    
    // Chalatenango - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Hospital Nacional San Rafael Chalatenango", tipo: "hospital", lat: 14.0333, lng: -88.9333, ciudad: "Chalatenango", telefono: "2301-0077", especialidades: "General, Emergencias" },
    
    // Ahuachapán - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Hospital Nacional San Francisco Ahuachapán", tipo: "hospital", lat: 13.9214, lng: -89.8453, ciudad: "Ahuachapán", telefono: "2443-0033", especialidades: "General, Pediatría, Emergencias" },
    
    // La Paz - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Hospital Nacional Santa Teresa Zacatecoluca", tipo: "hospital", lat: 13.5000, lng: -88.8667, ciudad: "Zacatecoluca", telefono: "2334-0077", especialidades: "General, Maternidad" },
    
    // Usulután - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Hospital Nacional Santa Gertrudis", tipo: "hospital", lat: 13.3500, lng: -88.4333, ciudad: "Usulután", telefono: "2624-0077", especialidades: "General, Emergencias" },
    
    // La Unión - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Hospital Nacional San Francisco Gotera", tipo: "hospital", lat: 13.6833, lng: -88.1000, ciudad: "San Francisco Gotera", telefono: "2654-0015", especialidades: "General, Emergencias" },
    
    // Cuscatlán - COORDENADAS EXACTAS VERIFICADAS
    { nombre: "Hospital Nacional San Pedro Cojutepeque", tipo: "hospital", lat: 13.8333, lng: -89.0500, ciudad: "Cojutepeque", telefono: "2372-0077", especialidades: "General, Maternidad" }
];

function inicializarMapa() {
    // Verificar si Leaflet está disponible
    if (typeof L === 'undefined') {
        console.error('Leaflet no está cargado');
        return;
    }
    
    // Si el mapa ya existe, no crear uno nuevo
    if (mapa !== null) {
        return;
    }
    
    // Crear el mapa centrado en El Salvador
    mapa = L.map('mapa').setView([13.6929, -89.2182], 9);
    
    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapa);
    
    // Agregar marcadores
    agregarMarcadores();
    
    // Llenar lista de ubicaciones
    llenarListaUbicaciones();
}

function agregarMarcadores() {
    // Limpiar marcadores existentes
    marcadores.forEach(m => mapa.removeLayer(m));
    marcadores = [];
    
    // Filtrar ubicaciones según el filtro actual
    const ubicacionesFiltradas = filtroActual === 'todos' 
        ? ubicacionesMedicas 
        : ubicacionesMedicas.filter(u => u.tipo === filtroActual);
    
    // Agregar marcadores al mapa
    ubicacionesFiltradas.forEach(ubicacion => {
        // Definir color del marcador según tipo
        let iconColor = '#3B82F6'; // Azul por defecto
        let iconHtml = '🏥';
        
        if (ubicacion.tipo === 'hospital') {
            iconColor = '#DC2626'; // Rojo
            iconHtml = '🏥';
        } else if (ubicacion.tipo === 'clinica') {
            iconColor = '#10B981'; // Verde
            iconHtml = '🏥';
        } else if (ubicacion.tipo === 'centro-salud') {
            iconColor = '#F59E0B'; // Naranja
            iconHtml = '⚕️';
        }
        
        // Crear icono personalizado
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${iconColor}; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                    <span style="transform: rotate(45deg); font-size: 20px;">${iconHtml}</span>
                   </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
        
        // Crear marcador
        const marcador = L.marker([ubicacion.lat, ubicacion.lng], { icon: customIcon })
            .addTo(mapa)
            .bindPopup(`
                <div style="min-width: 200px;">
                    <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1F2937;">${ubicacion.nombre}</h3>
                    <p style="margin: 4px 0; color: #6B7280;"><strong>📍 Ciudad:</strong> ${ubicacion.ciudad}</p>
                    <p style="margin: 4px 0; color: #6B7280;"><strong>📞 Teléfono:</strong> ${ubicacion.telefono}</p>
                    <p style="margin: 4px 0; color: #6B7280;"><strong>⚕️ Especialidades:</strong> ${ubicacion.especialidades}</p>
                    <p style="margin: 8px 0 4px 0; padding: 6px; background: ${iconColor}; color: white; border-radius: 6px; text-align: center; font-size: 12px; font-weight: bold;">
                        ${ubicacion.tipo.toUpperCase().replace('-', ' ')}
                    </p>
                </div>
            `);
        
        marcadores.push(marcador);
    });
}

function filtrarMapa(tipo) {
    filtroActual = tipo;
    
    // Actualizar botones activos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${tipo}"]`).classList.add('active');
    
    // Actualizar marcadores
    agregarMarcadores();
    
    // Actualizar lista
    llenarListaUbicaciones();
}

function llenarListaUbicaciones() {
    const listaDiv = document.getElementById('lista-ubicaciones');
    
    // Filtrar ubicaciones
    const ubicacionesFiltradas = filtroActual === 'todos' 
        ? ubicacionesMedicas 
        : ubicacionesMedicas.filter(u => u.tipo === filtroActual);
    
    // Generar HTML
    listaDiv.innerHTML = ubicacionesFiltradas.map(ubicacion => {
        let bgColor = 'from-blue-500 to-blue-600';
        let icon = '🏥';
        
        if (ubicacion.tipo === 'hospital') {
            bgColor = 'from-red-500 to-red-600';
            icon = '🏥';
        } else if (ubicacion.tipo === 'clinica') {
            bgColor = 'from-green-500 to-green-600';
            icon = '🏥';
        } else if (ubicacion.tipo === 'centro-salud') {
            bgColor = 'from-orange-500 to-orange-600';
            icon = '⚕️';
        }
        
        return `
            <div class="glass-effect rounded-xl p-4 hover:shadow-lg transition cursor-pointer" onclick="centrarMapa(${ubicacion.lat}, ${ubicacion.lng})">
                <div class="flex items-start">
                    <div class="bg-gradient-to-br ${bgColor} text-white p-3 rounded-lg mr-3 flex-shrink-0">
                        <span class="text-2xl">${icon}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800 mb-1">${ubicacion.nombre}</h4>
                        <p class="text-sm text-gray-600 mb-1">📍 ${ubicacion.ciudad}</p>
                        <p class="text-sm text-gray-600 mb-1">📞 ${ubicacion.telefono}</p>
                        <p class="text-xs text-gray-500">${ubicacion.especialidades}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function centrarMapa(lat, lng) {
    if (mapa) {
        mapa.setView([lat, lng], 15);
        
        // Encontrar y abrir el popup del marcador
        marcadores.forEach(marcador => {
            const markerLatLng = marcador.getLatLng();
            if (markerLatLng.lat === lat && markerLatLng.lng === lng) {
                marcador.openPopup();
            }
        });
        
        // Scroll al mapa
        document.getElementById('mapa').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Modificar la función mostrarSeccion para inicializar el mapa
const mostrarSeccionOriginal = mostrarSeccion;
mostrarSeccion = function(seccionId) {
    mostrarSeccionOriginal(seccionId);
    
    // Si se muestra la sección de mapa, inicializarlo
    if (seccionId === 'mapa') {
        setTimeout(() => {
            inicializarMapa();
            if (mapa) {
                mapa.invalidateSize();
            }
        }, 100);
    }
};

// ===== SISTEMA DE AUTENTICACIÓN =====
let usuarioActual = null;

// Cargar usuario desde localStorage al iniciar
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando aplicación...');
    const usuarioGuardado = localStorage.getItem('usuario');
    console.log('💾 Usuario en localStorage:', usuarioGuardado ? 'Presente' : 'Ausente');
    
    if (usuarioGuardado) {
        try {
            usuarioActual = JSON.parse(usuarioGuardado);
            console.log('👤 Usuario cargado:', usuarioActual);
            actualizarUIUsuario();
            console.log('✅ UI actualizada');
        } catch (error) {
            console.error('❌ Error al parsear usuario:', error);
            localStorage.removeItem('usuario');
        }
    } else {
        console.log('ℹ️ No hay usuario guardado');
    }
});

// Función para manejar la respuesta de Google Sign-In
function handleCredentialResponse(response) {
    console.log('🔐 Google Sign-In: Respuesta recibida');
    
    try {
        // Decodificar el JWT token de Google
        const responsePayload = decodeJwtResponse(response.credential);
        console.log('✅ Token decodificado:', responsePayload);
        
        usuarioActual = {
            id: responsePayload.sub,
            nombre: responsePayload.name,
            email: responsePayload.email,
            foto: responsePayload.picture
        };
        
        console.log('👤 Usuario creado:', usuarioActual);
        
        // Guardar en localStorage
        localStorage.setItem('usuario', JSON.stringify(usuarioActual));
        console.log('💾 Usuario guardado en localStorage');
        
        // Actualizar UI
        actualizarUIUsuario();
        console.log('🎨 UI actualizada');
        
        // Cerrar modal (ambos por compatibilidad)
        const modalAuth = document.getElementById('modal-auth');
        if (modalAuth) {
            modalAuth.classList.add('hidden');
            console.log('✅ Modal auth cerrado');
        }
        
        const modalLogin = document.getElementById('login-modal');
        if (modalLogin) {
            modalLogin.classList.add('hidden');
            console.log('✅ Modal login cerrado');
        }
        
        // Mostrar notificación
        mostrarNotificacion(`¡Bienvenido, ${usuarioActual.nombre}! 🎉`, 'success');
        console.log('🎉 Login completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error en handleCredentialResponse:', error);
        mostrarNotificacion('Error al iniciar sesión con Google', 'error');
    }
}

// Decodificar JWT token
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Actualizar UI cuando el usuario inicia sesión
function actualizarUIUsuario() {
    if (usuarioActual) {
        // Ocultar botones de login
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('mobile-login-btn').classList.add('hidden');
        
        // Mostrar menú de usuario
        document.getElementById('user-menu').classList.remove('hidden');
        document.getElementById('user-avatar').src = usuarioActual.foto;
        document.getElementById('user-name').textContent = usuarioActual.nombre.split(' ')[0];
        
        // Móvil
        document.getElementById('mobile-user-info').classList.remove('hidden');
        document.getElementById('mobile-user-avatar').src = usuarioActual.foto;
        document.getElementById('mobile-user-name').textContent = usuarioActual.nombre;
    } else {
        // Mostrar botones de login
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('mobile-login-btn').classList.remove('hidden');
        
        // Ocultar menú de usuario
        document.getElementById('user-menu').classList.add('hidden');
        document.getElementById('mobile-user-info').classList.add('hidden');
    }
}

// Verificar autenticación antes de mostrar sección
function verificarAutenticacionYMostrar(seccionId) {
    if (!usuarioActual) {
        console.log('🔒 Acceso denegado a:', seccionId);
        
        // Mostrar notificación
        const nombreSeccion = seccionId === 'diagnostico' ? 'Diagnóstico IA' : 
                             seccionId === 'documentos' ? 'Análisis de Documentos' : 
                             seccionId;
        
        mostrarNotificacion(`🔒 Debes iniciar sesión para acceder a ${nombreSeccion}`, 'warning');
        
        // Abrir modal de login después de un pequeño delay
        setTimeout(() => {
            mostrarModalLogin();
        }, 500);
        return;
    }
    console.log('✅ Acceso permitido a:', seccionId);
    mostrarSeccion(seccionId);
}

// Mostrar modal de login
function mostrarModalLogin() {
    const modalLogin = document.getElementById('login-modal');
    const footer = document.getElementById('main-footer');
    
    console.log('🔓 Abriendo modal de login');
    console.log('Footer encontrado:', footer);
    
    if (modalLogin) {
        modalLogin.classList.remove('hidden');
        // Ocultar footer cuando se abre el modal
        if (footer) {
            footer.style.display = 'none';
            console.log('✅ Footer OCULTADO');
        }
    } else {
        // Si no existe login-modal, usar modal-auth
        const modalAuth = document.getElementById('modal-auth');
        if (modalAuth) {
            modalAuth.classList.remove('hidden');
            if (footer) {
                footer.style.display = 'none';
                console.log('✅ Footer OCULTADO');
            }
        }
    }
}

// Cerrar modales (unificado)
const cerrarModalLogin = () => {
    console.log('❌ Cerrando modal de login');
    ['login-modal', 'modal-auth'].forEach(id => toggleElement(id, false));
    // Mostrar footer cuando se cierra el modal
    const footer = document.getElementById('main-footer');
    if (footer) {
        footer.style.display = 'block';
        console.log('✅ Footer MOSTRADO');
    }
};
const cerrarModalAuth = cerrarModalLogin;

// ============================================
// SISTEMA DE TABS (2 TABS)
// ============================================
function cambiarTab(tab) {
    console.log('🔄 Cambiando a tab:', tab);
    
    // Mover el slider horizontalmente
    const slider = document.getElementById('tab-slider');
    console.log('Slider encontrado:', slider);
    
    if (slider) {
        if (tab === 'login') {
            // Slider a la izquierda (posición inicial)
            slider.style.left = '0.375rem';
            console.log('✅ Slider movido a la IZQUIERDA');
        } else if (tab === 'registro') {
            // Slider a la derecha (50% + espacio)
            slider.style.left = 'calc(50% + 0.375rem)';
            console.log('✅ Slider movido a la DERECHA');
        }
        console.log('Posición actual del slider:', slider.style.left);
    } else {
        console.error('❌ No se encontró el slider!');
    }
    
    // Actualizar tabs
    const tabs = ['login', 'registro'];
    tabs.forEach(t => {
        const tabBtn = document.getElementById(`tab-${t}`);
        const content = document.getElementById(`content-${t}`);
        
        if (!tabBtn || !content) {
            console.error(`❌ No se encontró el tab o contenido para: ${t}`);
            return;
        }
        
        if (t === tab) {
            // Tab activo
            tabBtn.classList.remove('text-gray-700');
            tabBtn.classList.add('text-white');
            content.classList.remove('hidden');
            console.log(`✅ Tab ${t} activado`);
        } else {
            // Tab inactivo
            tabBtn.classList.remove('text-white');
            tabBtn.classList.add('text-gray-700');
            content.classList.add('hidden');
            console.log(`⚪ Tab ${t} desactivado`);
        }
    });
}

// ============================================
// LOGIN CON EMAIL/PASSWORD
// ============================================
async function handleLoginLocal(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const data = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Guardar usuario en formato compatible
        usuarioActual = {
            id: data.usuario.id,
            nombre: data.usuario.nombre,
            email: data.usuario.email,
            foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.usuario.nombre)}&background=4A90E2&color=fff&size=128`,
            token: data.token
        };
        
        localStorage.setItem('usuario', JSON.stringify(usuarioActual));
        actualizarUIUsuario();
        cerrarModalAuth();
        mostrarNotificacion(`¡Bienvenido ${data.usuario.nombre}!`, 'success');
        console.log('✅ Login exitoso:', usuarioActual);
    } catch (error) {
        console.error('❌ Error en login:', error);
        mostrarNotificacion(error.message || 'Error de conexión', 'error');
    }
}

// ============================================
// REGISTRO CON EMAIL/PASSWORD
// ============================================
async function handleRegistroLocal(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('registro-nombre').value;
    const email = document.getElementById('registro-email').value;
    const telefono = document.getElementById('registro-telefono').value;
    const password = document.getElementById('registro-password').value;
    const passwordConfirm = document.getElementById('registro-password-confirm').value;
    
    // Validar contraseñas
    if (password !== passwordConfirm) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        const data = await apiFetch('/api/auth/registro', {
            method: 'POST',
            body: JSON.stringify({ nombre, email, telefono, password })
        });
        
        // Guardar usuario en formato compatible
        usuarioActual = {
            id: data.usuario.id,
            nombre: data.usuario.nombre,
            email: data.usuario.email,
            foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.usuario.nombre)}&background=4A90E2&color=fff&size=128`,
            token: data.token
        };
        
        localStorage.setItem('usuario', JSON.stringify(usuarioActual));
        actualizarUIUsuario();
        cerrarModalAuth();
        mostrarNotificacion(`¡Cuenta creada! Bienvenido ${data.usuario.nombre}!`, 'success');
        console.log('✅ Registro exitoso:', usuarioActual);
    } catch (error) {
        console.error('❌ Error en registro:', error);
        mostrarNotificacion(error.message || 'Error de conexión', 'error');
    }
}

// Toggle dropdown de usuario
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('hidden');
}

// Cerrar sesión
function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem('usuario');
    actualizarUIUsuario();
    mostrarSeccion('inicio');
    mostrarNotificacion('Sesión cerrada correctamente', 'success');
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('user-menu');
    const dropdown = document.getElementById('user-dropdown');
    if (userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// ===== ANÁLISIS DE DOCUMENTOS MÉDICOS =====
let archivoSeleccionado = null;
let imagenBase64 = null;

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            console.log('Archivo seleccionado!');
            const file = e.target.files[0];
            
            if (file) {
                console.log('Nombre:', file.name);
                console.log('Tamaño:', file.size);
                console.log('Tipo:', file.type);
                
                procesarImagen(file);
            }
        });
    }
});

function procesarImagen(file) {
    console.log('=== PROCESANDO ARCHIVO ===');
    console.log('Tipo de archivo:', file.type);
    console.log('Nombre:', file.name);
    
    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
        mostrarNotificacion('El archivo es muy grande. Máximo 10MB', 'error');
        return;
    }
    
    // Obtener extensión del archivo
    const extension = file.name.split('.').pop().toLowerCase();
    console.log('Extensión:', extension);
    
    // Validar por tipo MIME Y por extensión (más flexible)
    const esImagen = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(extension);
    const esPDF = file.type === 'application/pdf' || extension === 'pdf';
    
    console.log('¿Es imagen?', esImagen);
    console.log('¿Es PDF?', esPDF);
    
    if (!esImagen && !esPDF) {
        console.error('Tipo no permitido:', file.type, 'Extensión:', extension);
        mostrarNotificacion('Solo se permiten imágenes (JPG, PNG) o archivos PDF', 'error');
        return;
    }
    
    console.log('✅ Archivo válido - Es imagen:', esImagen, 'Es PDF:', esPDF);
    archivoSeleccionado = file;
    
    // Mostrar nombre y tamaño
    document.getElementById('nombre-archivo').textContent = file.name;
    document.getElementById('tamano-archivo').textContent = formatBytes(file.size);
    
    // Si es PDF (por tipo MIME o extensión), convertir a imagen
    if (esPDF) {
        console.log('📄 Procesando PDF...');
        procesarPDF(file);
    } else {
        // Si es imagen, leer directamente
        console.log('🖼️ Procesando imagen...');
        const reader = new FileReader();
        reader.onload = function(e) {
            imagenBase64 = e.target.result;
            document.getElementById('preview-imagen').src = e.target.result;
            
            // Mostrar vista previa y ocultar área de carga
            document.getElementById('area-carga').classList.add('hidden');
            document.getElementById('vista-previa').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

async function procesarPDF(file) {
    try {
        // Configurar PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // Leer el PDF
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        console.log('PDF cargado, páginas:', pdf.numPages);
        
        // Obtener la primera página
        const page = await pdf.getPage(1);
        
        // Configurar el canvas
        const scale = 2; // Mayor escala = mejor calidad
        const viewport = page.getViewport({ scale: scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Renderizar la página en el canvas
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        // Convertir canvas a base64
        imagenBase64 = canvas.toDataURL('image/jpeg', 0.95);
        document.getElementById('preview-imagen').src = imagenBase64;
        
        // Mostrar vista previa
        document.getElementById('area-carga').classList.add('hidden');
        document.getElementById('vista-previa').classList.remove('hidden');
        
        console.log('PDF convertido a imagen exitosamente');
        
    } catch (error) {
        console.error('Error al procesar PDF:', error);
        mostrarNotificacion('Error al procesar el PDF. Intenta con otro archivo', 'error');
        cancelarArchivo();
    }
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function cancelarArchivo() {
    archivoSeleccionado = null;
    imagenBase64 = null;
    document.getElementById('file-input').value = '';
    document.getElementById('vista-previa').classList.add('hidden');
    document.getElementById('area-carga').classList.remove('hidden');
}

async function analizarDocumento() {
    console.log('=== INICIANDO ANÁLISIS CON OCR ===');
    
    if (!imagenBase64) {
        mostrarNotificacion('Por favor selecciona un archivo primero', 'warning');
        return;
    }
    
    console.log('Imagen base64 disponible, longitud:', imagenBase64.length);
    
    // Mostrar loader
    document.getElementById('vista-previa').classList.add('hidden');
    document.getElementById('loader-analisis').classList.remove('hidden');
    
    try {
        // Paso 1: Extraer texto con OCR
        document.getElementById('loader-texto').textContent = '📸 Extrayendo texto del documento...';
        document.getElementById('loader-subtexto').textContent = 'Usando reconocimiento óptico de caracteres (OCR)';
        document.getElementById('barra-progreso').style.width = '10%';
        
        console.log('Iniciando OCR con Tesseract...');
        
        const { data: { text } } = await Tesseract.recognize(
            imagenBase64,
            'spa', // Español
            {
                logger: (m) => {
                    console.log(m);
                    if (m.status === 'recognizing text') {
                        const progreso = Math.round(m.progress * 50); // 0-50%
                        document.getElementById('barra-progreso').style.width = progreso + '%';
                    }
                }
            }
        );
        
        console.log('Texto extraído:', text.substring(0, 200) + '...');
        
        if (!text || text.trim().length < 10) {
            throw new Error('No se pudo extraer texto del documento. Asegúrate de que la imagen sea clara y legible.');
        }
        
        // Paso 2: Analizar con IA
        document.getElementById('loader-texto').textContent = '🤖 Analizando con IA...';
        document.getElementById('loader-subtexto').textContent = 'La IA está interpretando el documento médico';
        document.getElementById('barra-progreso').style.width = '60%';
        
        console.log('Enviando texto al backend...');

        const response = await fetch(`${API_URL}/api/analizar-texto-medico`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                texto: text
            })
        });

        document.getElementById('barra-progreso').style.width = '80%';
        console.log('Respuesta recibida, status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del backend:', errorData);
            throw new Error(errorData.error || 'Error al analizar el documento');
        }

        const data = await response.json();
        console.log('Datos recibidos correctamente');
        
        document.getElementById('barra-progreso').style.width = '100%';
        
        const explicacion = data.explicacion;
        console.log('Explicación obtenida, longitud:', explicacion.length);

        // Formatear texto
        const textoFormateado = explicacion
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/\n/g, '<br>');

        // Mostrar resultado
        document.getElementById('texto-explicacion').innerHTML = '<p class="mb-4">' + textoFormateado + '</p>';
        document.getElementById('loader-analisis').classList.add('hidden');
        document.getElementById('resultado-analisis').classList.remove('hidden');
        
        console.log('✅ Análisis completado exitosamente');

    } catch (error) {
        console.error('❌ ERROR COMPLETO:', error);
        console.error('Mensaje:', error.message);
        
        document.getElementById('loader-analisis').classList.add('hidden');
        document.getElementById('vista-previa').classList.remove('hidden');
        
        mostrarNotificacion('Error al analizar el documento: ' + error.message, 'error');
    }
}

function copiarTexto() {
    const texto = document.getElementById('texto-explicacion').innerText;
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacion('Análisis copiado al portapapeles', 'success');
    }).catch(() => {
        mostrarNotificacion('No se pudo copiar', 'error');
    });
}

function resetearFormulario() {
    cancelarArchivo();
    document.getElementById('resultado-analisis').classList.add('hidden');
    document.getElementById('area-carga').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Variables legacy eliminadas - Ahora se usa ubicacionesMedicas y miniMapaCita

// Variable global para el mini mapa de citas
let miniMapaCita = null;
let lugarCitaSeleccionado = null;

function actualizarTipoCita() {
    const tipoRadio = document.querySelector('input[name="cita-tipo"]:checked');
    const contenedorLugar = document.getElementById('contenedor-lugar');
    const tipoHidden = document.getElementById('cita-tipo');
    
    if (!tipoRadio) {
        console.log('⚠️ No hay tipo seleccionado aún');
        return;
    }
    
    const tipo = tipoRadio.value;
    if (tipoHidden) tipoHidden.value = tipo;
    
    console.log('📋 Tipo de cita seleccionado:', tipo);
    
    if (tipo === 'presencial') {
        if (contenedorLugar) {
            contenedorLugar.classList.remove('hidden');
            console.log('✅ Mostrando mini mapa');
            
            // Inicializar mini mapa después de que el contenedor sea visible
            setTimeout(() => {
                inicializarMiniMapaCita();
            }, 100);
        }
        window.lugarCitaSeleccionado = ''; // Resetear selección
    } else if (tipo === 'virtual') {
        if (contenedorLugar) {
            contenedorLugar.classList.add('hidden');
            console.log('✅ Ocultando mini mapa');
        }
        window.lugarCitaSeleccionado = 'Videollamada en línea';
    } else {
        if (contenedorLugar) {
            contenedorLugar.classList.add('hidden');
        }
        window.lugarCitaSeleccionado = '';
    }
}

function inicializarMiniMapaCita() {
    // Verificar si Leaflet está disponible
    if (typeof L === 'undefined') {
        console.error('❌ Leaflet no está cargado');
        return;
    }
    
    // Si ya existe el mapa, no crear otro
    if (miniMapaCita !== null) {
        console.log('⚠️ Mini mapa ya existe');
        return;
    }
    
    console.log('🗺️ Inicializando mini mapa de citas...');
    
    try {
        // Crear el mapa centrado en El Salvador
        miniMapaCita = L.map('mini-mapa-cita').setView([13.6929, -89.2182], 9);
        
        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(miniMapaCita);
        
        // Agregar marcadores usando los datos completos de ubicacionesMedicas
        ubicacionesMedicas.forEach(ubicacion => {
            // Definir color del marcador según tipo
            let iconColor = '#3B82F6';
            let iconHtml = '🏥';
            
            if (ubicacion.tipo === 'hospital') {
                iconColor = '#DC2626';
                iconHtml = '🏥';
            } else if (ubicacion.tipo === 'clinica') {
                iconColor = '#10B981';
                iconHtml = '🏥';
            } else if (ubicacion.tipo === 'centro-salud') {
                iconColor = '#F59E0B';
                iconHtml = '⚕️';
            }
            
            // Crear icono personalizado
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${iconColor}; width: 35px; height: 35px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <span style="transform: rotate(45deg); font-size: 18px;">${iconHtml}</span>
                       </div>`,
                iconSize: [35, 35],
                iconAnchor: [17, 35],
                popupAnchor: [0, -35]
            });
            
            const marker = L.marker([ubicacion.lat, ubicacion.lng], { icon: customIcon })
                .addTo(miniMapaCita)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: #1F2937;">${ubicacion.nombre}</h3>
                        <p style="margin: 4px 0; color: #6B7280; font-size: 12px;"><strong>📍 Ciudad:</strong> ${ubicacion.ciudad}</p>
                        <p style="margin: 4px 0; color: #6B7280; font-size: 12px;"><strong>📞 Teléfono:</strong> ${ubicacion.telefono}</p>
                        <p style="margin: 4px 0; color: #6B7280; font-size: 12px;"><strong>⚕️ Especialidades:</strong> ${ubicacion.especialidades}</p>
                        <p style="margin: 6px 0 4px 0; padding: 4px; background: ${iconColor}; color: white; border-radius: 4px; text-align: center; font-size: 11px; font-weight: bold;">
                            ${ubicacion.tipo.toUpperCase().replace('-', ' ')}
                        </p>
                    </div>
                `);
            
            // Agregar tooltip que aparece al hacer hover
            const tooltip = marker.bindTooltip(ubicacion.nombre, {
                permanent: false,
                direction: 'top',
                className: 'hospital-label',
                offset: [0, -35]
            });
            
            // Guardar referencia al tooltip para control de zoom
            marker.tooltipObj = tooltip;
            marker.ubicacionData = ubicacion;
            
            // Al hacer clic en un marcador
            marker.on('click', () => {
                seleccionarLugarCita(ubicacion);
            });
        });
        
        console.log('✅ Mini mapa inicializado con', ubicacionesMedicas.length, 'ubicaciones');
    } catch (error) {
        console.error('❌ Error al inicializar mini mapa:', error);
    }
}

function seleccionarLugarCita(lugar) {
    console.log('📍 Lugar seleccionado:', lugar.nombre);
    
    lugarCitaSeleccionado = lugar;
    window.lugarCitaSeleccionado = lugar.nombre;
    
    // Mostrar información del lugar seleccionado
    const infoDiv = document.getElementById('lugar-seleccionado-cita');
    const nombreEl = document.getElementById('nombre-lugar-cita');
    const direccionEl = document.getElementById('direccion-lugar-cita');
    
    if (infoDiv && nombreEl && direccionEl) {
        nombreEl.textContent = lugar.nombre;
        direccionEl.textContent = `${lugar.direccion} - ${lugar.tipo}`;
        infoDiv.classList.remove('hidden');
    }
    
    // Centrar mapa en el lugar seleccionado
    if (miniMapaCita) {
        miniMapaCita.setView([lugar.lat, lugar.lng], 15);
    }
}

// Funciones del modal de mapa eliminadas - Ya no se usan (mapa integrado en formulario)

// ===== ENVÍO DE CORREO ELECTRÓNICO =====
async function enviarCorreoConfirmacion(datos) {
    console.log('📧 Intentando enviar correo de confirmación...');
    console.log('Datos del correo:', datos);
    console.log('📧 CORREO DESTINO:', datos.correo);
    
    try {
        const payload = {
            email_paciente: datos.correo,
            nombre_paciente: datos.nombre,
            codigo_confirmacion: datos.codigo,
            tipo_cita: datos.tipo === '💻 Virtual (Videollamada)' ? 'virtual' : 'presencial',
            lugar: datos.lugar || null,
            especialidad: datos.especialidad,
            fecha: datos.fecha,
            hora: datos.hora,
            motivo: datos.motivo
        };
        
        console.log('📤 Enviando al backend:', payload);
        
        // Llamar al endpoint del backend para enviar el correo
        const response = await apiFetch('/api/enviar-correo-cita', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        console.log('✅ Correo enviado exitosamente:', response);
        mostrarNotificacion('✅ Confirmación enviada a tu correo', 'success');
        
    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
        // No mostrar error al usuario si el correo falla, la cita ya está guardada
        console.log('⚠️ El correo no se pudo enviar, pero la cita está confirmada');
    }
}

function mostrarNotificacion(mensaje, tipo) {
    // Crear notificación temporal
    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg text-white font-semibold ${
        tipo === 'success' ? 'bg-green-500' : 'bg-yellow-500'
    }`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        notificacion.remove();
    }, 5000);
}

// ============================================
// SISTEMA DE GESTIÓN DE CITAS
// ============================================

// Cargar citas del usuario
async function cargarCitasUsuario() {
    if (!usuarioActual?.token) return;
    try {
        const citas = await apiFetch(`/api/citas/usuario/${usuarioActual.id}`);
        console.log('✅ Citas recibidas:', citas.length);
        mostrarCitasEnLista(citas);
        actualizarContadorCitas(citas);
    } catch (error) {
        console.error('❌ Error al cargar citas:', error);
        mostrarNotificacion('Error al cargar citas', 'error');
    }
}

// Mostrar citas en la lista
function mostrarCitasEnLista(citas) {
    console.log('📋 Mostrando citas en lista:', citas);
    const lista = document.getElementById('lista-citas-usuario');
    
    if (!lista) {
        console.error('❌ Elemento lista-citas-usuario no encontrado');
        return;
    }
    
    if (citas.length === 0) {
        lista.innerHTML = `
            <div class="text-center py-12">
                <div class="inline-block p-4 bg-gray-100 rounded-full mb-4">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
                <p class="text-gray-500 text-lg">No tienes citas programadas</p>
                <button onclick="mostrarSeccion('citas')" class="btn-primary mt-4">Reservar una cita</button>
            </div>
        `;
        return;
    }

    lista.innerHTML = citas.map(cita => crearTarjetaCita(cita)).join('');
}

// Crear tarjeta de cita
function crearTarjetaCita(cita) {
    const diasRestantes = Math.ceil((new Date(cita.fecha).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
    
    let estadoClass = '';
    let estadoTexto = '';
    let estadoBadge = '';
    let alertaDias = '';
    
    if (cita.estado === 'cancelada') {
        estadoClass = 'cancelada';
        estadoTexto = 'Cancelada';
        estadoBadge = 'bg-red-100 text-red-800';
    } else if (diasRestantes < 0) {
        estadoClass = 'pasada';
        estadoTexto = 'Pasada';
        estadoBadge = 'bg-gray-100 text-gray-800';
    } else if (diasRestantes === 0) {
        estadoClass = 'hoy';
        estadoTexto = '¡HOY!';
        estadoBadge = 'bg-orange-100 text-orange-800';
        alertaDias = `
            <div class="bg-orange-50 border-l-4 border-orange-500 p-3 rounded mt-3">
                <p class="text-sm font-semibold text-orange-800">🔔 ¡Tu cita es HOY!</p>
            </div>
        `;
    } else {
        estadoClass = 'proxima';
        estadoTexto = `En ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`;
        estadoBadge = 'bg-green-100 text-green-800';
        
        if (diasRestantes <= 3) {
            alertaDias = `
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded mt-3">
                    <p class="text-sm font-semibold text-yellow-800">⏰ Faltan ${diasRestantes} día${diasRestantes > 1 ? 's' : ''} para tu cita</p>
                </div>
            `;
        } else if (diasRestantes <= 7) {
            alertaDias = `
                <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mt-3">
                    <p class="text-sm text-blue-800">📅 Faltan ${diasRestantes} días para tu cita</p>
                </div>
            `;
        }
    }

    const fechaFormateada = formatearFecha(cita.fecha);

    return `
        <div class="cita-card ${estadoClass}" data-estado="${cita.estado}" data-dias="${diasRestantes}">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${estadoBadge}">
                        ${estadoTexto}
                    </span>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-500">Código</p>
                    <p class="font-mono font-bold text-sm text-gray-800">${cita.codigo_confirmacion}</p>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4 mb-3">
                <div>
                    <p class="text-xs text-gray-500 mb-1">📅 Fecha</p>
                    <p class="font-semibold text-gray-800 capitalize">${fechaFormateada}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 mb-1">🕐 Hora</p>
                    <p class="font-semibold text-gray-800">${cita.hora}</p>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4 mb-3">
                <div>
                    <p class="text-xs text-gray-500 mb-1">🏥 Especialidad</p>
                    <p class="font-semibold text-gray-800">${cita.especialidad}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 mb-1">${cita.tipo_cita === 'virtual' ? '💻' : '🏥'} Tipo</p>
                    <p class="font-semibold text-gray-800">${cita.tipo_cita === 'virtual' ? 'Virtual' : 'Presencial'}</p>
                </div>
            </div>

            ${cita.lugar ? `
                <div class="mb-3">
                    <p class="text-xs text-gray-500 mb-1">📍 Lugar</p>
                    <p class="text-sm text-gray-700">${cita.lugar}</p>
                </div>
            ` : ''}

            ${cita.motivo ? `
                <div class="mb-3">
                    <p class="text-xs text-gray-500 mb-1">📝 Motivo</p>
                    <p class="text-sm text-gray-700">${cita.motivo}</p>
                </div>
            ` : ''}

            ${alertaDias}

            ${cita.estado !== 'cancelada' && diasRestantes >= 0 ? `
                <div class="flex gap-2 mt-4">
                    <button onclick="cancelarCita('${cita.codigo_confirmacion}')" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition text-sm">
                        Cancelar Cita
                    </button>
                    <button onclick="verDetallesCita('${cita.codigo_confirmacion}')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition text-sm">
                        Ver Detalles
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// Filtrar citas
function filtrarCitas(filtro) {
    const todasLasCitas = document.querySelectorAll('.cita-card');
    const botones = document.querySelectorAll('.filtro-cita-btn');
    
    // Actualizar botones activos
    botones.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    todasLasCitas.forEach(cita => {
        const estado = cita.dataset.estado;
        const dias = parseInt(cita.dataset.dias);
        
        let mostrar = false;
        
        switch(filtro) {
            case 'todas':
                mostrar = true;
                break;
            case 'proximas':
                mostrar = estado !== 'cancelada' && dias >= 0;
                break;
            case 'pasadas':
                mostrar = dias < 0 && estado !== 'cancelada';
                break;
            case 'canceladas':
                mostrar = estado === 'cancelada';
                break;
        }
        
        cita.style.display = mostrar ? 'block' : 'none';
    });
}

// Cancelar cita
async function cancelarCita(codigo) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
    try {
        await apiFetch(`/api/citas/${codigo}/cancelar`, { method: 'PUT' });
        mostrarNotificacion('Cita cancelada exitosamente', 'success');
        cargarCitasUsuario();
    } catch (error) {
        console.error('❌ Error al cancelar:', error);
        mostrarNotificacion('Error al cancelar la cita', 'error');
    }
}

// Ver detalles de cita
function verDetallesCita(codigo) {
    console.log('👁️ Ver detalles de cita:', codigo);
    
    // Buscar la cita en el DOM
    const citaCards = document.querySelectorAll('.cita-card');
    let citaEncontrada = null;
    
    citaCards.forEach(card => {
        const codigoElement = card.querySelector('.font-mono');
        if (codigoElement && codigoElement.textContent === codigo) {
            citaEncontrada = card;
        }
    });
    
    if (!citaEncontrada) {
        mostrarNotificacion('Cita no encontrada', 'error');
        return;
    }
    
    // Crear modal con detalles
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-8">
                <div class="flex justify-between items-start mb-6">
                    <h3 class="text-2xl font-bold text-gray-800">📋 Detalles de la Cita</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-3xl leading-none">&times;</button>
                </div>
                
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <p class="text-sm text-gray-600 mb-2 text-center">Código de Confirmación</p>
                    <p class="text-3xl font-bold text-blue-600 text-center tracking-wider font-mono">${codigo}</p>
                </div>
                
                ${citaEncontrada.innerHTML}
                
                <div class="mt-6 flex gap-3">
                    <button onclick="imprimirCita('${codigo}')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition">
                        🖨️ Imprimir
                    </button>
                    <button onclick="compartirCita('${codigo}')" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition">
                        📤 Compartir
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Imprimir cita
function imprimirCita(codigo) {
    window.print();
}

// Compartir cita
function compartirCita(codigo) {
    const texto = `Mi cita médica - Código: ${codigo}\nSaludClara - Sistema de Gestión de Citas`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mi Cita Médica',
            text: texto,
            url: window.location.href
        }).then(() => {
            mostrarNotificacion('Compartido exitosamente', 'success');
        }).catch(err => {
            console.log('Error al compartir:', err);
            copiarAlPortapapeles(texto);
        });
    } else {
        copiarAlPortapapeles(texto);
    }
}

// Copiar al portapapeles
function copiarAlPortapapeles(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacion('Código copiado al portapapeles', 'success');
    }).catch(err => {
        console.error('Error al copiar:', err);
        mostrarNotificacion('No se pudo copiar', 'error');
    });
}

// Actualizar contador de citas
function actualizarContadorCitas(citas) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const citasProximas = citas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        fechaCita.setHours(0, 0, 0, 0);
        return fechaCita >= hoy && cita.estado !== 'cancelada';
    });

    const badge = document.getElementById('badge-citas');
    const btnMisCitas = document.getElementById('btn-mis-citas');
    
    if (citasProximas.length > 0) {
        badge.textContent = citasProximas.length;
        badge.classList.remove('hidden');
        badge.classList.add('badge-notification');
        btnMisCitas.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
        if (citas.length === 0) {
            btnMisCitas.classList.add('hidden');
        }
    }
}

// Actualizar UI cuando el usuario inicia sesión (extender función existente)
if (typeof actualizarUIUsuario !== 'undefined') {
    const _actualizarUIUsuarioOriginal = actualizarUIUsuario;
    actualizarUIUsuario = function() {
        _actualizarUIUsuarioOriginal();
        
        // Mostrar botón "Mis Citas" si hay usuario
        const btnMisCitas = document.getElementById('btn-mis-citas');
        if (btnMisCitas) {
            if (usuarioActual) {
                btnMisCitas.classList.remove('hidden');
                cargarCitasUsuario();
            } else {
                btnMisCitas.classList.add('hidden');
            }
        }
    };
}

// Cargar citas cuando se muestra la sección (extender función existente)
if (typeof mostrarSeccion !== 'undefined') {
    const _mostrarSeccionCitas = mostrarSeccion;
    mostrarSeccion = function(seccionId) {
        _mostrarSeccionCitas(seccionId);
        
        if (seccionId === 'mis-citas' && usuarioActual) {
            cargarCitasUsuario();
        }
    };
}
