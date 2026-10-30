/**
 * Retira identificadores evidentes antes de enviar texto a la IA.
 * Parte del germen que hoy vive en apps/ai (staff-app-state / redact).
 */
export function redactTextForTeo(input: string): string {
  let t = String(input || '');
  // Correos
  t = t.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[correo]');
  // Teléfonos CO (10 dígitos que empiezan por 3) y genéricos
  t = t.replace(/\b3\d{9}\b/g, '[teléfono]');
  t = t.replace(/\b\d{7,15}\b/g, (m) => (m.length >= 7 ? '[número]' : m));
  // Cédulas típicas
  t = t.replace(/\b\d{6,10}\b/g, '[documento]');
  return t.trim();
}
