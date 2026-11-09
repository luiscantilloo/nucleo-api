import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docPartida } from './partida-doc.ts';

test('docPartida usa partidaId estable para upsert idempotente', () => {
  const now = new Date('2026-11-08T22:00:00.000Z');
  const doc = docPartida(
    { id: 'ABC', startedAt: 10, finishedAt: 40, game: 'simon', source: 't' },
    'pid-x',
    now,
  );
  assert.equal(doc.partidaId, 'ABC');
  assert.equal(doc.pid, 'pid-x');
  assert.equal(doc.durationMs, 30);
  assert.equal(doc.game, 'simon');
});
