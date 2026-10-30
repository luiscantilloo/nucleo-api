/**
 * Válvula de escape del programa Plateado (arquitectura §4.2).
 * Cada línea aquí cuenta para la medición V9.
 * Meta: mantenerlo lo más pequeño posible.
 */
export type AjusteRutaCtx = {
  tieneCuidador: boolean;
  alertasAbiertas: string[];
  servicios: string[];
};

/** R5 y R6: se aplican también desde rutas.json; este hook es respaldo explícito. */
export function ajustarRuta(ctx: AjusteRutaCtx): string[] {
  let s = [...ctx.servicios];
  if (!ctx.tieneCuidador) {
    s = s.filter((x) => x !== 'orientacion_cuidador');
    if (!s.includes('llamada_acompanamiento')) s.push('llamada_acompanamiento');
  }
  if (ctx.alertasAbiertas.includes('abandono_maltrato')) {
    if (!s.includes('proteccion')) s.push('proteccion');
  }
  return s;
}

export function textoPersonalizado(_clave: string, _vars: Record<string, string>): string | null {
  return null;
}

export function validarEvaluacion(_respuestas: Record<string, unknown>): string | null {
  return null;
}
