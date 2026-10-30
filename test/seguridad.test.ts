// Pruebas de las reglas de acceso de nara-api — SPEC-10 FR-10.2. Corren con `node --test` (Node 24 ejecuta TypeScript).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { andScope, inScope, terrFilter } from '../libs/common/src/scope.ts';
import { filtrarLectura, restringirEscritura } from '../apps/ops/src/app-state/app-state.policy.ts';
import {
  parseSessionToken,
  signSessionToken,
  verifySessionToken,
} from '../libs/auth-core/src/session-token.ts';
import { publicProgramView, loadProgram, resetProgramCache } from '../libs/program/src/load-program.ts';

const admin = { id: 'a', roleId: 'admin', terr: 'Todos' };
const experto = { id: 'e1', roleId: 'experto', terr: 'Bucaramanga' };
const gestor = { id: 'g1', roleId: 'gestor', terr: 'Bucaramanga', name: 'Gestor Uno' };
const clinico = { id: 'c1', roleId: 'clinico', terr: 'Bucaramanga' };
const observador = { id: 'o1', roleId: 'observador', terr: 'Bucaramanga' };
const paciente = { id: 'p1', roleId: 'paciente', patientId: 'sm-1' };
const persona = { id: 'per1', roleId: 'persona', patientId: 'sm-1' };

test('alcance: admin todo, experto/gestor y clínico su territorio, otros nada', () => {
  assert.deepEqual(terrFilter(admin), {});
  assert.deepEqual(terrFilter(experto), { terr: 'Bucaramanga' });
  assert.deepEqual(terrFilter(gestor), { terr: 'Bucaramanga' });
  assert.deepEqual(terrFilter(clinico), { terr: 'Bucaramanga' });
  assert.equal(terrFilter(observador), null);
  assert.equal(terrFilter(paciente), null);
  assert.equal(terrFilter(persona), null);
  assert.equal(terrFilter({ id: 'x', roleId: 'experto', terr: '' }), null);
});

test('alcance: el filtro del cliente solo reduce', () => {
  assert.deepEqual(andScope({ terr: 'Bucaramanga' }, { terr: 'Cali' }), { $and: [{ terr: 'Bucaramanga' }, { terr: 'Cali' }] });
  assert.ok(inScope(experto, { terr: 'Bucaramanga' }));
  assert.ok(!inScope(experto, { terr: 'Cali' }));
});

const slices = {
  rules: { v: 2 }, notes: [{ pid: 'sm-1' }, { pid: 'sm-9' }], alerts: [{ id: 'a-sm-1', pid: 'sm-1' }, { id: 'a-sm-9', pid: 'sm-9' }],
  accessLog: { x: [] }, consents: [{ personId: 'sm-1' }], notifs: { p1: ['hola'], otro: ['no'] },
};
const idsBuc = new Set(['sm-1']);

test('app-state lectura: paciente solo lo suyo, observador sin datos de personas', () => {
  const p = filtrarLectura(slices, paciente, null);
  assert.ok(!('notes' in p) && !('accessLog' in p));
  assert.deepEqual(p.consents, {}, 'P-01: ningún consentimiento ajeno');
  assert.deepEqual(p.alerts, [{ id: 'a-sm-1', pid: 'sm-1' }]);
  assert.deepEqual(p.notifs, { p1: ['hola'] });
  const o = filtrarLectura(slices, observador, null);
  assert.deepEqual(Object.keys(o), ['rules']);
});

test('app-state lectura: experto solo registros de su territorio y sin registros internos', () => {
  const e = filtrarLectura(slices, experto, idsBuc);
  assert.deepEqual(e.notes, [{ pid: 'sm-1' }]);
  assert.ok(!('accessLog' in e));
});

test('app-state lectura/escritura: alias gestor ≡ experto y persona ≡ paciente', () => {
  const g = filtrarLectura(slices, gestor, idsBuc);
  assert.deepEqual(g.notes, [{ pid: 'sm-1' }]);
  assert.ok(!('accessLog' in g));
  const per = filtrarLectura(slices, persona, null);
  assert.ok(!('notes' in per) && !('accessLog' in per));
  assert.deepEqual(per.alerts, [{ id: 'a-sm-1', pid: 'sm-1' }]);
  const gWrite = restringirEscritura(
    { rules: { v: 9 }, notes: [{ pid: 'sm-1', t: 'nueva' }] },
    slices,
    gestor,
    idsBuc,
  );
  assert.ok(!('rules' in gWrite));
  assert.deepEqual(gWrite.notes, [{ pid: 'sm-9' }, { pid: 'sm-1', t: 'nueva' }]);
  const perWrite = restringirEscritura(
    { rules: { v: 9 }, notes: [], alerts: [{ id: 'a-sm-1', pid: 'sm-1' }, { id: 'a-sm-9', pid: 'sm-9' }] },
    slices,
    persona,
    null,
  );
  assert.deepEqual(Object.keys(perWrite), ['alerts']);
  assert.deepEqual(perWrite.alerts, [{ id: 'a-sm-1', pid: 'sm-1' }]);
});

test('app-state escritura: paciente no escribe reglas ni notas; experto no borra otros territorios', () => {
  const p = restringirEscritura({ rules: { v: 9 }, notes: [], alerts: [{ id: 'a-sm-1', pid: 'sm-1' }, { id: 'a-sm-9', pid: 'sm-9' }] }, slices, paciente, null);
  assert.deepEqual(Object.keys(p), ['alerts']);
  assert.deepEqual(p.alerts, [{ id: 'a-sm-1', pid: 'sm-1' }]);
  const e = restringirEscritura({ rules: { v: 9 }, notes: [{ pid: 'sm-1', t: 'nueva' }] }, slices, experto, idsBuc);
  assert.ok(!('rules' in e));
  assert.deepEqual(e.notes, [{ pid: 'sm-9' }, { pid: 'sm-1', t: 'nueva' }]);
});

test('sesión: token firmado, vencido o manipulado', () => {
  process.env.AUTH_SECRET = 'secreto-de-prueba-largo';
  process.env.PROGRAM_ID = 'parienta';
  delete process.env.AUTH_ALLOW_LEGACY_TOKENS;
  const t = signSessionToken('u-1');
  assert.equal(verifySessionToken(t), 'u-1');
  assert.equal(verifySessionToken(t.replace('u-1', 'u-2')), null);
  assert.equal(verifySessionToken(signSessionToken('u-1', -10)), null);
  assert.equal(verifySessionToken('basura'), null);
  // Token de otro programa no sirve en esta instancia
  const other = signSessionToken('u-1', undefined, 'nara');
  assert.equal(verifySessionToken(other), null);
});

test('sesión: tokens legado de 3 partes se rechazan en producción', () => {
  process.env.AUTH_SECRET = 'secreto-de-prueba-largo';
  process.env.PROGRAM_ID = 'parienta';
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const payload = `u-legacy.${exp}`;
  const sig = createHmac('sha256', process.env.AUTH_SECRET)
    .update(payload)
    .digest('base64url');
  const legacy = `${payload}.${sig}`;
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  process.env.AUTH_ALLOW_LEGACY_TOKENS = '0';
  assert.equal(parseSessionToken(legacy), null);
  process.env.AUTH_ALLOW_LEGACY_TOKENS = '1';
  assert.equal(parseSessionToken(legacy)?.accountId, 'u-legacy');
  process.env.NODE_ENV = prev;
  delete process.env.AUTH_ALLOW_LEGACY_TOKENS;
});

test('GET /api/program público no expone instrumentos ni perfiles', () => {
  resetProgramCache();
  process.env.PROGRAM_ID = 'nara';
  const pub = publicProgramView(loadProgram('nara'));
  assert.equal(pub.id, 'nara');
  assert.ok(!('instrumentos' in pub));
  assert.ok(!('perfiles' in pub));
  assert.ok(!('servicios' in pub));
  assert.ok(Array.isArray(pub.roles));
  assert.ok(pub.roles.every((r: { id: string; nombre: string }) => r.id && r.nombre));
});
