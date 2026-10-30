# Aprobación del flujo de datos con el proveedor de IA

**Sistema:** NucleoCare (nucleo-api dual) · Documento para firma · Versión `1` · Fecha: `2026-10-30`

Describe qué datos se envían al proveedor de inteligencia artificial, para qué y cómo se tratan. Al firmarlo, el responsable aprueba ese flujo. **Si cambia el proveedor, el modelo o los datos enviados, se vuelve a elaborar y firmar.**

## 1. Dónde se usa la IA

| Función | Quién la usa | Ruta de la API | Proveedor y modelo | ¿Pasa por un intermediario (por ejemplo, n8n)? |
|---|---|---|---|---|
| TEO / asistente | Paciente, clínico, admin (según módulo) | `/api/teo/ask`, `/api/teo/chat` | Gemini (`GEMINI_MODEL`) y/o OpenAI (`OPENAI_MODEL`) | Opcional: webhook n8n (`N8N_TEO_WEBHOOK`) |
| Herramientas clínicas (si habilitadas en front) | Clínico | Rutas del front / API | OpenAI / Gemini | No necesariamente |

## 2. Qué datos se envían

| Dato | TEO chat | Herramientas clínicas |
|---|---|---|
| Nombre | ☐ (evitar) | ☐ |
| Documento de identidad | ☐ | ☐ |
| Edad o fecha de nacimiento | ☐ | ☐ |
| Teléfono o correo | ☐ | ☐ |
| Ubicación | ☐ | ☐ |
| Datos sensibles (salud) | ☒ texto clínico filtrado / contexto de sesión | ☒ posible |
| Texto libre del usuario, filtrado | ☒ | ☒ |
| Historial de la conversación, filtrado | ☒ | ☐ |
| Datos agregados, sin identificar personas | ☒ preferente | ☒ |
| Audio | ☐ | ☐ |

**Medidas para reducir los datos enviados**, con la prueba que lo demuestra (`herramientas/ia/`):
- No enviar cédulas, teléfonos ni ids de WhatsApp al proveedor.
- Contexto limitado a lo que el rol puede ver.
- La IA no ejecuta acciones irreversibles (cerrar crisis, borrar cuentas) sin confirmación humana en UI.
- Evidencia S15: corrida adversarial + captura de payload redactado (sin secretos).

## 3. Cómo tratan los datos los proveedores

| Pregunta | Gemini / Google | OpenAI | n8n (si aplica) |
|---|---|---|---|
| Plan o contrato | API key de proyecto | API key de proyecto | Cloud n8n Polaria |
| Dónde se procesan | Según región del proveedor | Según región del proveedor | Declarar región del workspace |
| Tiempo de retención | Según términos del plan | Según términos del plan | Logs del workflow |
| ¿Se usan para entrenar modelos? | Verificar términos del plan activo | Verificar opt-out / plan | N/A |
| ¿Hay acuerdo de procesamiento? | Pendiente adjuntar | Pendiente adjuntar | Interno |
| Condiciones revisadas | Fecha al firmar | Fecha al firmar | — |
| Control de acceso | Claves en env Render | Claves en env Render | Secreto webhook |

## 4. Base legal (Ley 1581 de 2012 · Colombia)

| Punto | Respuesta |
|---|---|
| ¿El consentimiento cubre el envío a un proveedor de IA? | Declarar según política NARA/Parienta de tratamiento de datos |
| ¿Hay transferencia internacional? | Sí, probable (EE. UU. / proveedores cloud) |
| Fundamento | Autorización / cláusulas contractuales — completar al firmar |
| Datos sensibles de salud | Minimización + solo TRL-QA en pruebas |

## 5. Salvaguardas

- ☒ Los protocolos críticos **no dependen de la IA** (crisis, login, alertas siguen sin TEO).
- ☒ La IA no toma decisiones clínicas finales: las toma una persona.
- ☒ Si el proveedor falla, el resto de la plataforma sigue (R3).
- ☒ Las claves están en variables de entorno, no en el código.
- ☐ Los registros no guardan el texto completo — **verificar en corrida S15**.
- ☐ Tope de gasto — **configurar / declarar al firmar**.

## 6. Aprobación

| | Nombre | Fecha | Firma |
|---|---|---|---|
| **Responsable técnico** | Luis Cantillo (Daniiel) | 2026-10-30 | Aprobado |
| **Responsable del proyecto** | Luis Cantillo (Daniiel) — dueño | 2026-10-30 | Aprobado («yo soy el dueño», 2026-10-29) |
