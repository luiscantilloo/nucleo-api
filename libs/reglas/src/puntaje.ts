export type Opcion = { v: number; label: string };
export type Pregunta = { i: number; texto: string; opciones: Opcion[] };
export type Corte = { max: number; nivel: string };
export type Instrumento = {
  id: string;
  preguntas: Pregunta[];
  cortes?: Corte[];
};

/** Suma de valores de respuestas { "1": 2, "2": 0, ... }. */
export function puntajeInstrumento(
  instrumento: Instrumento,
  respuestas: Record<string, number>,
): number {
  let total = 0;
  for (const p of instrumento.preguntas || []) {
    const v = respuestas[String(p.i)];
    if (typeof v === 'number' && Number.isFinite(v)) total += v;
  }
  return total;
}

export function nivelPorCortes(total: number, cortes: Corte[] = []): string {
  const ordered = [...cortes].sort((a, b) => a.max - b.max);
  for (const c of ordered) {
    if (total <= c.max) return c.nivel;
  }
  return ordered.length ? ordered[ordered.length - 1].nivel : 'desconocido';
}

export function evaluarInstrumento(
  instrumento: Instrumento,
  respuestas: Record<string, number>,
): { total: number; nivel: string } {
  const total = puntajeInstrumento(instrumento, respuestas);
  return { total, nivel: nivelPorCortes(total, instrumento.cortes) };
}
