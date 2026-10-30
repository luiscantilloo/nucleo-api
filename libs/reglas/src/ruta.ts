export type ReglaRuta = {
  id?: string;
  si: string;
  quitar?: string[];
  agregar?: string[];
  bloquear_quitar?: string[] | boolean;
};

export type AplicarRutaCtx = {
  servicios: string[];
  tieneCuidador: boolean;
  alertasAbiertas: string[];
  reglas: ReglaRuta[];
};

/** Aplica R5/R6 y reglas del programa sobre la ruta propuesta. */
export function aplicarReglasRuta(ctx: AplicarRutaCtx): {
  servicios: string[];
  bloqueados: string[];
} {
  let servicios = [...ctx.servicios];
  const bloqueados = new Set<string>();

  for (const r of ctx.reglas || []) {
    const ok =
      (r.si === 'sin_cuidador' && !ctx.tieneCuidador) ||
      (r.si.startsWith('alerta_abierta:') &&
        ctx.alertasAbiertas.includes(r.si.slice('alerta_abierta:'.length)));
    if (!ok) continue;
    for (const q of r.quitar || []) {
      servicios = servicios.filter((s) => s !== q);
    }
    for (const a of r.agregar || []) {
      if (!servicios.includes(a)) servicios.push(a);
    }
    if (r.bloquear_quitar === true) {
      for (const a of r.agregar || []) bloqueados.add(a);
    } else if (Array.isArray(r.bloquear_quitar)) {
      for (const b of r.bloquear_quitar) bloqueados.add(b);
    }
  }

  return { servicios, bloqueados: [...bloqueados] };
}
