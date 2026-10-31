import { assistantBrand } from './assistant-brand';

const OVERVIEW_NARA = `
NARA es el programa de acompañamiento en salud mental tras el sismo (Eje Cafetero, Colombia).

Quiénes usan la plataforma:
- Administrador: territorios, captación, rutas, equipos, usuarios, activos, informes.
- Experto de campo: visitas, evaluaciones, cola de trabajo, banderas de calidad.
- Clínico: aprobaciones (evaluaciones, rutas, reglas), crisis, caseload de pacientes.
- Paciente: app con módulos de su ruta (ánimo, TEO, técnicas, biblioteca) cuando está Activo.
- Observador: solo mira avances agregados, sin datos personales.

Estados de personas/pacientes (use estos nombres al hablar):
- Sin evaluación, Por aprobar, Activo, Inactivo, Crisis, Rechazado, Terminado blanco, Terminado negro.

Rutas: perfiles P01–P15 (riesgo × capacidad digital). Incluyen servicios y umbral de inactividad.
Inactividad: si tras estar Activo la persona no usa la app el tiempo del perfil, pasa a Inactivo; con «Volví» vuelve a Activo.
Crisis: la persona pide ayuda en la app; el clínico atiende; se cierra cuando confirma «estoy bien».

Hable siempre en lenguaje cotidiano del programa. No diga Mongo, API, base de datos, colección ni jerga técnica.
`.trim();

const OVERVIEW_PARIENTA = `
Parienta es el programa de acompañamiento para personas mayores en Colombia (plataforma Nucleo Care).
El asistente del programa se llama Aurelia (no TEO; TEO es solo de NARA).

Quiénes usan la plataforma:
- Administrador: territorios, captación, rutas, equipos, usuarios, activos, informes.
- Gestor / experto de campo: visitas, evaluaciones, cola de trabajo.
- Clínico: aprobaciones, crisis, caseload.
- Persona acompañada (paciente): app con módulos de su ruta cuando está Activo.
- Cuidador: reporta crisis/GPS de personas vinculadas.
- Observador: solo avances agregados, sin datos personales.

Estados de personas/pacientes (use estos nombres al hablar):
- Sin evaluación, Por aprobar, Activo, Inactivo, Crisis, Rechazado, Terminado blanco, Terminado negro.

Crisis: la persona o el cuidador pide ayuda; el clínico atiende; se cierra cuando confirma «estoy bien».

Hable siempre en lenguaje cotidiano del programa Parienta. No diga Mongo, API, base de datos, colección ni jerga técnica.
No diga que el programa es NARA ni que el asistente es TEO.
`.trim();

/** Resumen del programa actual para el contexto de Aurelia/TEO. */
export function appOverview(): string {
  const { programId } = assistantBrand();
  return programId === 'nara' ? OVERVIEW_NARA : OVERVIEW_PARIENTA;
}

/** @deprecated Preferir appOverview() — evita overview NARA en Parienta. */
export const APP_OVERVIEW = {
  toString() {
    return appOverview();
  },
  valueOf() {
    return appOverview();
  },
  [Symbol.toPrimitive]() {
    return appOverview();
  },
} as unknown as string;
