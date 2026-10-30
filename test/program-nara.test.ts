import assert from 'node:assert/strict';
import test from 'node:test';
import { loadProgram, resetProgramCache } from '../libs/program/src/load-program.ts';

process.env.PROGRAM_ID = 'nara';

test('loadProgram carga nara', () => {
  resetProgramCache();
  const p = loadProgram('nara');
  assert.equal(p.id, 'nara');
  assert.equal(p.nombre, 'NARA');
  assert.ok(p.crisis?.categorias?.riesgo_suicida);
  const ids = p.roles.map((r) => r.id);
  assert.ok(ids.includes('experto'));
  assert.ok(ids.includes('paciente'));
  assert.ok(!ids.includes('gestor'));
});

test('perfiles NARA documentan P01–P15', () => {
  resetProgramCache();
  const p = loadProgram('nara');
  const codigos = (p.perfiles as { codigos?: Record<string, unknown> })?.codigos;
  assert.ok(codigos?.P01);
  assert.ok(codigos?.P15);
});
