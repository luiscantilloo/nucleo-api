/** Normaliza un evento de lote a documento de la colección `partidas`. */
export function docPartida(
  row: Record<string, unknown>,
  targetPid: string,
  now = new Date(),
): Record<string, unknown> {
  const inicio = Number(row.startedAt ?? row.inicio ?? row.at) || now.getTime();
  const fin = Number(row.finishedAt ?? row.fin ?? row.completedAt) || inicio;
  const partidaId = String(row.partidaId || row.id || `EVT-${targetPid}-${inicio}`);
  return {
    ...row,
    partidaId,
    id: partidaId,
    pid: targetPid,
    type: row.type || 'juego',
    k: row.k || 'juego',
    game: row.game || 'sudoku',
    status: row.status || (row.completo === false ? 'abandoned' : 'done'),
    startedAt: inicio,
    inicio,
    finishedAt: fin,
    fin,
    durationMs: Number(row.durationMs ?? row.durMs) || Math.max(0, fin - inicio),
    source: row.source || 'eventos.lote',
    updatedAt: now,
  };
}
