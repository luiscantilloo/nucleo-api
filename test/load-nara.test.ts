import assert from 'node:assert/strict';
import test from 'node:test';
import { loadProgram, resetProgramCache, publicProgramView } from '../libs/program/src/load-program.ts';

test('loadProgram carga nara', () => {
  resetProgramCache();
  process.env.PROGRAM_ID = 'nara';
  const p = loadProgram('nara');
  assert.equal(p.id, 'nara');
  assert.equal(p.nombre, 'NARA');
  assert.ok(p.roles.some((r) => r.id === 'experto'));
  assert.ok(p.crisis?.categorias);
  const pub = publicProgramView(p);
  assert.equal(pub.id, 'nara');
});
