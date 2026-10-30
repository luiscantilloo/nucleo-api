// C1 · F1 Parienta: admin crea persona → crisis+GPS → clínico ve alerta en app-state.
// El vínculo cuidador→persona vía API queda asegurado en people.service (caregiverAccountId);
// hasta el deploy, Paso 2b prueba cuidador sobre ficha ya vinculada en Atlas.
const { test, expect } = require('@playwright/test');
const { PREFIJO, conCredenciales, sesionAPI, guardar } = require('./lib');

const creados = [];
let personaId = null;

test.describe.serial('F1 Parienta · crisis → clínico', () => {
  test('Paso 1 · admin crea persona de prueba', async () => {
    test.skip(!conCredenciales('admin'), 'Falta PASS_ADMIN');
    const admin = await sesionAPI('admin');
    const res = await admin.post('/api/people', {
      data: {
        name: `${PREFIJO}F1 Persona`,
        firstName: 'TRL',
        lastName: 'F1',
        terr: 'Todos',
      },
    });
    expect(res.ok(), `crear persona HTTP ${res.status()}`).toBeTruthy();
    const body = await res.json();
    personaId = body.person && body.person.id;
    expect(personaId).toBeTruthy();
    creados.push({ tipo: 'person', id: personaId });
    await admin.dispose();
  });

  test('Paso 2 · se reporta crisis + GPS (admin; alcance completo)', async () => {
    test.skip(!personaId || !conCredenciales('admin'), 'Sin persona o PASS_ADMIN');
    const admin = await sesionAPI('admin');
    const res = await admin.post('/api/alerts', {
      data: {
        pid: personaId,
        sev: 'crisis',
        name: `${PREFIJO}crisis`,
        what: 'TRL-QA crisis de prueba',
        source: 'trl-f1',
        loc: { lat: 4.711, lng: -74.072, accuracy: 15, at: Date.now() },
      },
    });
    const body = await res.json();
    expect(res.status(), `alerta: ${JSON.stringify(body).slice(0, 160)}`).toBeLessThan(300);
    expect(body.ok).toBeTruthy();
    creados.push({ tipo: 'alert', id: body.alert && body.alert.id, pid: personaId });
    await admin.dispose();
  });

  test('Paso 2b · cuidador puede alertar sobre persona ya vinculada', async () => {
    test.skip(!conCredenciales('cuidador'), 'Falta PASS_CUIDADOR');
    // Persona pre-vinculada en Atlas para TRL (caregiverAccountId = cuidador.prueba1).
    const pidVinculado = process.env.TRL_CUIDADOR_PID || 'pmvufvu59';
    const cuid = await sesionAPI('cuidador');
    const res = await cuid.post('/api/alerts', {
      data: {
        pid: pidVinculado,
        sev: 'crisis',
        name: `${PREFIJO}crisis-cuid`,
        what: 'TRL-QA crisis cuidador',
        source: 'cuidador-app',
        loc: { lat: 4.712, lng: -74.073, accuracy: 12, at: Date.now() },
      },
    });
    const body = await res.json();
    expect(res.status(), `alerta cuidador: ${JSON.stringify(body).slice(0, 160)}`).toBeLessThan(300);
    expect(body.ok).toBeTruthy();
    creados.push({ tipo: 'alert-cuidador', id: body.alert && body.alert.id, pid: pidVinculado });
    await cuid.dispose();
  });

  test('Paso 3 · clínico ve alerta en app-state', async () => {
    test.skip(!personaId || !conCredenciales('clinico'), 'Sin persona o PASS_CLINICO');
    const clin = await sesionAPI('clinico');
    const res = await clin.get('/api/app-state');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const alerts = (body.slices && body.slices.alerts) || [];
    const hit = alerts.find((a) => a && (a.pid === personaId || String(a.id || '').includes(personaId)));
    expect(hit, 'alerta del F1 visible para clínico').toBeTruthy();
    expect(hit.loc || hit.sev === 'crisis', 'alerta de crisis').toBeTruthy();
    await clin.dispose();
    guardar(`creados_${Date.now()}.json`, { prefijo: PREFIJO, creados, alerta: { id: hit.id, pid: hit.pid, sev: hit.sev } });
  });
});

test.afterAll(async () => {
  if (!creados.length) return;
  guardar(`creados_final_${Date.now()}.json`, { prefijo: PREFIJO, creados });
  if (personaId && conCredenciales('admin')) {
    try {
      const admin = await sesionAPI('admin');
      await admin.post(`/api/people/${personaId}/archive`, { data: { reason: `${PREFIJO}cleanup` } });
      await admin.dispose();
    } catch (_) { /* best-effort */ }
  }
});
