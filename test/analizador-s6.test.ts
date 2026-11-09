// TRL6 A-01 §6: patrones nuevos y política de lectura del analizador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Patterns } from '../libs/common/src/patterns.ts';
import { filtrarLectura } from '../apps/ops/src/app-state/app-state.policy.ts';
import { docPartida } from '../apps/ops/src/analizador/partida-doc.ts';

test('patterns §6 existen', () => {
  assert.equal(Patterns.EVENTOS_LOTE, 'ops.eventos.lote');
  assert.equal(Patterns.ANALIZADOR_PANEL, 'ops.analizador.panel');
  assert.equal(Patterns.ANALIZADOR_PERSONA, 'ops.analizador.persona');
  assert.equal(Patterns.INFORMES_ANALIZADOR, 'ops.informes.analizador');
});

test('docPartida: idempotente por partidaId (colección partidas)', () => {
  const now = new Date('2026-11-08T22:00:00.000Z');
  const a = docPartida(
    { id: 'P-1', game: 'sudoku', startedAt: 1000, finishedAt: 2000, source: 'c3' },
    'pid-a',
    now,
  );
  const b = docPartida(
    { partidaId: 'P-1', game: 'sudoku', startedAt: 1000, finishedAt: 2000, source: 'c3' },
    'pid-a',
    now,
  );
  assert.equal(a.partidaId, 'P-1');
  assert.equal(a.id, 'P-1');
  assert.equal(a.pid, 'pid-a');
  assert.equal(a.durationMs, 1000);
  assert.equal(b.partidaId, a.partidaId);
});

test('experto sin analizadorByPid ni gameLogs; clínico con territorio', () => {
  const slices = {
    rules: { v: 1 },
    analizadorByPid: {
      a: { estado: 'estable', lecturas: 1 },
      b: { estado: 'cambio' },
    },
    gameLogs: {
      a: [{ id: 'p1' }],
      b: [{ id: 'p2' }],
    },
  };
  const ids = new Set(['a']);
  const e = filtrarLectura(slices, { id: 'e1', roleId: 'experto', terr: 'T' }, ids);
  assert.equal(e.analizadorByPid, undefined);
  assert.equal(e.gameLogs, undefined);
  const c = filtrarLectura(slices, { id: 'c1', roleId: 'clinico', terr: 'T' }, ids);
  assert.deepEqual(c.analizadorByPid, { a: { estado: 'estable', lecturas: 1 } });
  assert.deepEqual(c.gameLogs, { a: [{ id: 'p1' }] });
});
