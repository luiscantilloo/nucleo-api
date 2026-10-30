import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  crisisCheck,
  crisisPorIdeacion,
  detectarCrisis,
} from '../libs/crisis/src/detect.ts';
import type { ProgramCrisis } from '../libs/crisis/src/types.ts';

const crisis = JSON.parse(
  readFileSync(join(process.cwd(), 'programs/parienta/crisis.json'), 'utf8'),
) as ProgramCrisis;

test('Parienta: frases indirectas activan riesgo_suicida (R10)', () => {
  const hit = detectarCrisis('siento que soy una carga para mi familia', { crisis });
  assert.equal(hit?.categoria, 'riesgo_suicida');
  assert.ok(crisisCheck('ya no sirvo para nada', crisis));
});

test('Parienta: abandono / maltrato', () => {
  const hit = detectarCrisis('en la casa me pegan', { crisis });
  assert.equal(hit?.categoria, 'abandono_maltrato');
});

test('Parienta: urgencia médica por evento de caída', () => {
  const hit = detectarCrisis('', { evento: 'caida_reportada', crisis });
  assert.equal(hit?.categoria, 'urgencia_medica');
});

test('Parienta: ideación > 0 bloqueada', () => {
  assert.equal(crisisPorIdeacion(0), null);
  assert.equal(crisisPorIdeacion(1)?.categoria, 'riesgo_suicida');
});

test('texto normal no dispara crisis', () => {
  assert.equal(detectarCrisis('hoy dormí mejor, gracias', { crisis }), null);
});
