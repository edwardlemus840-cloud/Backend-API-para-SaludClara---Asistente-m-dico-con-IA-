-- ============================================
-- DATOS DE PRUEBA PARA SALUDCLARA
-- ============================================
-- Ejecuta este archivo DESPUÉS de schema.sql

-- ============================================
-- USUARIOS DE PRUEBA
-- ============================================

-- Usuario 1: Local (password: "demo123")
-- Hash generado con bcrypt (10 rounds)
INSERT INTO usuarios (nombre, email, telefono, password_hash, tipo_auth) 
VALUES (
    'Juan Pérez',
    'juan@demo.com',
    '7777-7777',
    '$2b$10$K8qvXqX5qZ9qJ0KvXqX5qeO9qJ0KvXqX5qZ9qJ0KvXqX5qZ9qJ0Kv',
    'local'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 2: Local (password: "maria456")
INSERT INTO usuarios (nombre, email, telefono, password_hash, tipo_auth) 
VALUES (
    'María García',
    'maria@demo.com',
    '7888-8888',
    '$2b$10$L9rvYrY6rA0rK1LwYrY6rfP0rK1LwYrY6rA0rK1LwYrY6rA0rK1Lw',
    'local'
) ON CONFLICT (email) DO NOTHING;

-- Usuario 3: Google (simulado)
INSERT INTO usuarios (nombre, email, google_id, foto_perfil, tipo_auth) 
VALUES (
    'Carlos Rodríguez',
    'carlos@gmail.com',
    'google_123456789',
    'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=4A90E2&color=fff',
    'google'
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CITAS DE PRUEBA
-- ============================================

-- Cita 1: Juan Pérez - Cardiología
INSERT INTO citas (
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
    motivo, 
    estado
) VALUES (
    1,
    'SC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
    'Juan Pérez',
    'juan@demo.com',
    '7777-7777',
    'presencial',
    'Hospital Nacional Rosales',
    'Cardiología',
    CURRENT_DATE + INTERVAL '3 days',
    '10:00:00',
    'Dolor en el pecho al hacer ejercicio',
    'confirmada'
);

-- Cita 2: María García - Pediatría (Virtual)
INSERT INTO citas (
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
    motivo, 
    estado
) VALUES (
    2,
    'SC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
    'María García',
    'maria@demo.com',
    '7888-8888',
    'virtual',
    'Videollamada en línea',
    'Pediatría',
    CURRENT_DATE + INTERVAL '5 days',
    '15:30:00',
    'Consulta de control para mi hijo de 5 años',
    'confirmada'
);

-- Cita 3: Carlos Rodríguez - Dermatología
INSERT INTO citas (
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
    motivo, 
    estado
) VALUES (
    3,
    'SC-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
    'Carlos Rodríguez',
    'carlos@gmail.com',
    '7999-9999',
    'presencial',
    'Hospital de Diagnóstico',
    'Dermatología',
    CURRENT_DATE + INTERVAL '7 days',
    '09:00:00',
    'Manchas en la piel que me preocupan',
    'confirmada'
);

-- ============================================
-- HISTORIAL DE CHAT DE PRUEBA
-- ============================================

-- Chat 1: Juan pregunta sobre dolor de cabeza
INSERT INTO historial_chat (usuario_id, mensaje, respuesta, tipo) VALUES (
    1,
    'Tengo dolor de cabeza fuerte desde hace 2 días',
    'El dolor de cabeza puede tener múltiples causas. Las más comunes incluyen: tensión muscular, deshidratación, falta de sueño, estrés, o migraña. 

Recomendaciones básicas:
• Descansa en un lugar oscuro y silencioso
• Mantente hidratado (bebe agua)
• Aplica compresas frías en la frente
• Evita pantallas y luces brillantes
• Considera un analgésico de venta libre (paracetamol o ibuprofeno)

⚠️ Consulta un médico si:
- El dolor es muy intenso o repentino
- Viene acompañado de fiebre, rigidez de cuello, confusión o vómitos
- Dura más de 3 días
- Empeora progresivamente

IMPORTANTE: Esta información es educativa y NO reemplaza la consulta médica profesional.',
    'sintomas'
);

-- Chat 2: María pregunta sobre fiebre en niños
INSERT INTO historial_chat (usuario_id, mensaje, respuesta, tipo) VALUES (
    2,
    'Mi hijo de 5 años tiene fiebre de 38.5°C',
    'La fiebre en niños es una respuesta natural del cuerpo ante infecciones. A 38.5°C es una fiebre moderada.

Recomendaciones:
• Dale líquidos frecuentemente para evitar deshidratación
• Vístelo con ropa ligera
• Mantén la habitación fresca
• Puedes darle paracetamol o ibuprofeno infantil (según peso y edad)
• Monitorea la temperatura cada 2-3 horas

⚠️ URGENTE - Ve al médico si:
- La fiebre supera 39°C
- Tiene dificultad para respirar
- Está muy decaído o no responde
- Tiene convulsiones
- La fiebre dura más de 3 días
- Es menor de 3 meses

IMPORTANTE: Esta información NO reemplaza la evaluación médica. Ante dudas, consulta con un pediatra.',
    'sintomas'
);

-- Chat 3: Carlos pregunta término médico
INSERT INTO historial_chat (usuario_id, mensaje, respuesta, tipo) VALUES (
    3,
    'Qué es dermatitis atópica',
    'La **dermatitis atópica** (también llamada eczema atópico) es una condición crónica de la piel que causa:

**¿Qué es?**
Una inflamación de la piel que hace que se vuelva roja, seca, con picazón y a veces con pequeñas ampollas.

**Síntomas comunes:**
• Piel muy seca y escamosa
• Picazón intensa (especialmente de noche)
• Manchas rojas o marrones
• Piel agrietada o engrosada
• Aparece comúnmente en codos, rodillas, manos y cara

**Causas principales:**
• Predisposición genética
• Sistema inmunológico sensible
• Factores ambientales (clima seco, irritantes)
• Alergias

**Cuándo consultar un médico:**
• Si la picazón interfiere con tu sueño o actividades diarias
• Si la piel se infecta (pus, costras amarillas)
• Si los síntomas empeoran o no mejoran con cuidados básicos

Un dermatólogo puede recetar cremas especiales y tratamientos para controlar los brotes.',
    'traduccion'
);

-- ============================================
-- DOCUMENTOS MÉDICOS DE PRUEBA
-- ============================================

INSERT INTO documentos_medicos (
    usuario_id, 
    nombre_archivo, 
    tipo_documento, 
    texto_extraido, 
    analisis
) VALUES (
    1,
    'examen_sangre_2025.pdf',
    'Examen de Laboratorio',
    'EXAMEN DE SANGRE COMPLETO
Paciente: Juan Pérez
Fecha: 15/01/2025

Hemoglobina: 14.5 g/dL (Normal: 13-17)
Leucocitos: 7,200/mm³ (Normal: 4,000-11,000)
Plaquetas: 250,000/mm³ (Normal: 150,000-400,000)
Glucosa: 95 mg/dL (Normal: 70-100)
Colesterol Total: 185 mg/dL (Normal: <200)
Triglicéridos: 120 mg/dL (Normal: <150)',
    '**Tipo de Documento:** Examen de Laboratorio - Análisis de Sangre Completo

**Resumen Simple:**
Tus resultados de sangre están dentro de los rangos normales. No hay señales de alerta en ninguno de los valores analizados.

**Hallazgos Principales:**
• **Hemoglobina (14.5 g/dL):** Normal. Significa que no tienes anemia y tu sangre transporta oxígeno correctamente.
• **Leucocitos (7,200):** Normal. Tu sistema inmunológico está funcionando bien, sin señales de infección.
• **Plaquetas (250,000):** Normal. Tu sangre coagula correctamente.
• **Glucosa (95 mg/dL):** Normal. No hay señales de diabetes.
• **Colesterol (185 mg/dL):** Excelente. Está por debajo del límite recomendado.
• **Triglicéridos (120 mg/dL):** Normal. Buen control de grasas en sangre.

**¿Está todo bien?**
✅ Sí, todos tus valores están en rangos saludables. No hay nada que requiera atención médica inmediata.

**Recomendaciones:**
• Mantén tu estilo de vida actual (dieta y ejercicio)
• Continúa con chequeos anuales de rutina
• Si tienes síntomas nuevos, consulta con tu médico aunque los exámenes estén normales'
);

-- ============================================
-- CONSULTAS ÚTILES PARA VERIFICAR
-- ============================================

-- Ver todos los usuarios
-- SELECT id, nombre, email, tipo_auth, fecha_registro FROM usuarios;

-- Ver todas las citas
-- SELECT c.codigo_confirmacion, u.nombre, c.especialidad, c.fecha, c.hora, c.estado 
-- FROM citas c 
-- LEFT JOIN usuarios u ON c.usuario_id = u.id;

-- Ver historial de chat
-- SELECT u.nombre, h.mensaje, h.tipo, h.fecha 
-- FROM historial_chat h 
-- JOIN usuarios u ON h.usuario_id = u.id 
-- ORDER BY h.fecha DESC;

-- Ver documentos
-- SELECT u.nombre, d.nombre_archivo, d.tipo_documento, d.fecha_subida 
-- FROM documentos_medicos d 
-- JOIN usuarios u ON d.usuario_id = u.id;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- Los passwords de los usuarios de prueba son:
-- juan@demo.com -> demo123
-- maria@demo.com -> maria456

-- Para generar nuevos hashes de contraseñas en Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('tu_password', 10);
-- console.log(hash);
