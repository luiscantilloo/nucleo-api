/**
 * Válvula de escape del programa QUINTIA (arquitectura §4.2).
 * Cada línea aquí cuenta para la medición V9.
 * Meta: mantenerlo lo más pequeño posible.
 */
export type AjusteRutaCtx = {
  tieneCuidador: boolean;
  alertasAbiertas: string[];
  servicios: string[];
};

/** QUINTIA: la matriz P01–P15 vive en rutas.json; aquí solo se pasan los servicios. */
export function ajustarRuta(ctx: AjusteRutaCtx): string[] {
  return [...ctx.servicios];
}

export function textoPersonalizado(_clave: string, _vars: Record<string, string>): string | null {
  return null;
}

export function validarEvaluacion(_respuestas: Record<string, unknown>): string | null {
  return null;
}
