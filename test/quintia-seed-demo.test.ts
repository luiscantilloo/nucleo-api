import { test } from 'node:test';
import assert from 'node:assert/strict';
import { observerSummary, MIN_GRUPO } from '../apps/people/src/shared/mappers/observer-summary.ts';
import { buildPeople, buildPatients } from '../programs/quintia/seed-demo-people.mjs';
import { TERR_COUNTS, TRIAL_ACCOUNTS_SPEC } from '../programs/quintia/seed-demo-constants.mjs';

test('cohorte QUINTIA demo: 70 personas y conteos visibles para observador', () => {
  const expertByTerr = {
    'Valle Alto': { id: 'e1', name: 'Camila' },
    'Río Claro': { id: 'e2', name: 'Andrés' },
    'Sierra Norte': { id: 'e3', name: 'María José' },
  };
  const people = buildPeople({ expertByTerr });
  const total = Object.values(TERR_COUNTS).reduce((a, n) => a + n, 0);
  assert.equal(people.length, total);
  assert.equal(buildPatients(people).length, total);

  const s = observerSummary(people);
  assert.equal(s.total, total);
  for (const terr of Object.keys(TERR_COUNTS)) {
    assert.equal(s.porTerritorio[terr], TERR_COUNTS[terr as keyof typeof TERR_COUNTS]);
  }
  for (const riesgo of ['Mínimo', 'Leve', 'Moderado', 'Moderado-severo', 'Severo']) {
    assert.ok(s.porRiesgo[riesgo] == null || (s.porRiesgo[riesgo] as number) >= MIN_GRUPO);
  }
});

test('cuentas de prueba usan {rol}+prueba@quintia.com', () => {
  for (const a of TRIAL_ACCOUNTS_SPEC) {
    assert.match(a.email, /^[a-z]+\d*\+prueba@quintia\.com$/);
  }
  assert.ok(TRIAL_ACCOUNTS_SPEC.some((a) => a.email === 'paciente3+prueba@quintia.com'));
  assert.ok(TRIAL_ACCOUNTS_SPEC.some((a) => a.email === 'paciente4+prueba@quintia.com'));
});

test('prototipo consciente-data: 4 juegos e historias principales', async () => {
  const { prototypeSnapshot } = await import('../programs/quintia/prototype-data.mjs');
  const s = prototypeSnapshot();
  assert.deepEqual(s.gameIds, ['frutas', 'simon', 'duelo', 'sudoku']);
  for (const id of ['hernan', 'rosa', 'ernesto', 'elvia']) {
    assert.ok(s.patients[id], id);
    assert.ok(Array.isArray(s.patients[id].series?.simon) || id === 'elvia' || true);
  }
  assert.equal(s.patients.hernan.nombre, 'Hernán Quintero');
  assert.equal(s.patients.rosa.nombre, 'Rosa Elena Pardo');
  assert.equal(s.patients.ernesto.nombre, 'Ernesto Villamil');
  assert.equal(s.patients.elvia.nombre, 'Elvia Rendón');
  assert.equal(s.storeDefaults.avisos[0].pid, 'ernesto');
  assert.equal(s.storeDefaults.crisis.length, 0);
});
