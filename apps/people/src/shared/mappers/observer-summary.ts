/**
 * H-004 (TRL 2026-10-10): lo único que recibe el observador sobre las personas.
 * Conteos por territorio, estado y nivel de riesgo; los grupos con menos de
 * MIN_GRUPO personas se devuelven como `null` para que no se pueda reidentificar a nadie.
 */
export const MIN_GRUPO = 5;

const RIESGO = ['Mínimo', 'Leve', 'Moderado', 'Moderado-severo', 'Severo'];

export function riskLevel(profile: unknown): string {
  const n = parseInt(String(profile || '').slice(1), 10);
  return Number.isFinite(n) && n >= 1 && n <= 15
    ? RIESGO[Math.floor((n - 1) / 3)]
    : 'Sin evaluación';
}

function contar(
  rows: Record<string, unknown>[],
  clave: (r: Record<string, unknown>) => string,
): Record<string, number | null> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = clave(r);
    m.set(k, (m.get(k) || 0) + 1);
  }
  const out: Record<string, number | null> = {};
  for (const [k, v] of [...m.entries()].sort((a, b) => b[1] - a[1])) {
    out[k] = v < MIN_GRUPO ? null : v;
  }
  return out;
}

const ESTADOS_AN: Record<string, string> = {
  base: 'En línea base',
  estable: 'Estables',
  mejorando: 'Mejorando',
  cambio: 'Cambio a revisar',
};

/** Agrega estados del analizador (OBS-*). Grupos &lt; MIN_GRUPO → null. */
export function contarAnalizador(
  byPid: Record<string, { estado?: string } | null | undefined> | null | undefined,
): Record<string, number | null> {
  const m = new Map<string, number>();
  for (const snap of Object.values(byPid || {})) {
    const k = ESTADOS_AN[String(snap?.estado || 'base')] || 'Sin estado';
    m.set(k, (m.get(k) || 0) + 1);
  }
  const out: Record<string, number | null> = {};
  for (const label of Object.values(ESTADOS_AN)) {
    const v = m.get(label) || 0;
    if (!v) continue;
    out[label] = v < MIN_GRUPO ? null : v;
  }
  return out;
}

export function observerSummary(
  rows: Record<string, unknown>[],
  analizadorByPid?: Record<string, { estado?: string } | null | undefined> | null,
) {
  return {
    total: rows.length,
    minGrupo: MIN_GRUPO,
    porTerritorio: contar(rows, (r) => String(r.terr || '') || 'Sin territorio'),
    porEstado: contar(rows, (r) => String(r.status || '') || 'Sin estado'),
    porRiesgo: contar(rows, (r) => riskLevel(r.profile)),
    porAnalizador: contarAnalizador(analizadorByPid),
  };
}
