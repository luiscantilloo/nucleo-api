// H-001 (reporte TRL 2026-10-10, SPEC-001): crisis detector + escalado servidor.
// Detector desde libs/crisis; escalarCrisis se prueba con el mismo contrato que teo-crisis.ts
// (sin importar Nest/alias, para `node --test`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  crisisCheck,
  esRespuestaCrisis,
  textoDeCrisis as textoPlantilla,
} from '../libs/crisis/src/detect.ts';

function textoDeCrisis(nombre: string, escalada: boolean): string {
  const base = textoPlantilla(nombre, 'riesgo_suicida');
  if (!escalada) return base;
  return `${base} Voy a pausar esta conversación para que el equipo le contacte pronto.`;
}

async function escalarCrisis(
  db: ReturnType<typeof baseFalsa>,
  p: {
    patientId: string;
    patient: Record<string, any> | null;
    nombre: string;
    dicho: string;
    termino: string;
  },
): Promise<{ alertId: string; nueva: boolean }> {
  const now = new Date();
  const at = now.getTime();
  const alertId = `a-${p.patientId}`;
  const abierta = await db
    .collection('program_settings')
    .findOne({ key: 'app_state', 'alerts.id': alertId });
  await db.collection('patients').updateOne(
    { id: p.patientId },
    {
      $set: {
        status: 'Crisis',
        signal: 'Crisis',
        crisisLock: true,
        updatedAt: now,
      },
    },
  );
  await db
    .collection('people')
    .updateOne({ id: p.patientId }, { $set: { status: 'Crisis', updatedAt: now } });
  if (abierta) return { alertId, nueva: false };
  const alerta = {
    at,
    status: 'new',
    id: alertId,
    sev: 'crisis',
    pid: p.patientId,
    name: p.nombre,
    what: p.dicho,
    term: p.termino,
  };
  const evento = { at, type: 'created', alertId, pid: p.patientId, name: p.nombre };
  const aviso = { text: `Nueva alerta de crisis: ${p.patientId}`, at };
  await db.collection('program_settings').updateOne(
    { key: 'app_state' },
    {
      $push: {
        alerts: { $each: [alerta], $position: 0 },
        crisisLog: { $each: [evento], $position: 0 },
        'notifs.clin': { $each: [aviso], $position: 0 },
      },
    },
  );
  return { alertId, nueva: true };
}

/** Base en memoria con lo justo: findOne por clave y 'alerts.id', updateOne con $set y $push. */
function baseFalsa() {
  const cols: Record<string, Record<string, any>[]> = {
    program_settings: [{ key: 'app_state', alerts: [], crisisLog: [], notifs: {} }],
    patients: [
      {
        id: 'sm-7',
        name: 'Ana Prueba',
        age: 40,
        place: 'Cali, Valle',
        profile: 'P08',
        status: 'Activo',
      },
    ],
    people: [{ id: 'sm-7', status: 'Activo' }],
  };
  const coincide = (d: Record<string, any>, q: Record<string, unknown>) =>
    Object.entries(q).every(([k, v]) =>
      k === 'alerts.id'
        ? (d.alerts || []).some((a: any) => a.id === v)
        : d[k] === v,
    );
  return {
    cols,
    collection: (n: string) => ({
      findOne: async (q: Record<string, unknown>) =>
        (cols[n] || []).find((d) => coincide(d, q)) || null,
      updateOne: async (q: Record<string, unknown>, u: Record<string, any>) => {
        const d = (cols[n] || []).find((row) => coincide(row, q));
        if (!d) return;
        Object.assign(d, u.$set || {});
        for (const [k, v] of Object.entries<any>(u.$push || {})) {
          const [a, b] = k.split('.');
          const arr = b
            ? ((d[a] = d[a] || {})[b] = d[a][b] || [])
            : (d[a] = d[a] || []);
          arr.unshift(...v.$each);
        }
      },
    }),
  };
}

test('H-001: el clasificador local reconoce el texto de riesgo de la sesión TRL', () => {
  assert.ok(
    crisisCheck(
      'Últimamente pienso que todos estarían mejor sin mí y he pensado en hacerme daño.',
    ),
  );
  assert.equal(crisisCheck('AYUDA!'), 'AYUDA');
  assert.equal(crisisCheck('Hoy dormí mejor, gracias'), null);
});

test('H-001: «CRISIS.» del modelo se trata como crisis y no se muestra', () => {
  assert.ok(esRespuestaCrisis('CRISIS.'));
  assert.ok(esRespuestaCrisis(' crisis '));
  assert.ok(
    !esRespuestaCrisis('La crisis del sismo fue dura; respiremos juntas.'),
  );
});

test('H-001: el texto incluye las líneas 123 y 192, y solo promete la llamada si se escaló', () => {
  for (const escalada of [true, false]) {
    const t = textoDeCrisis('Ana', escalada);
    assert.match(t, /123/);
    assert.match(t, /192/);
    assert.equal(/Voy a pausar esta conversación/.test(t), escalada);
  }
});

test('H-001: el servidor crea la alerta, el evento y el aviso, y deja a la persona en Crisis', async () => {
  const db = baseFalsa();
  const r = await escalarCrisis(db, {
    patientId: 'sm-7',
    patient: db.cols.patients[0],
    nombre: 'Ana Prueba',
    dicho: 'quiero morir',
    termino: 'quiero morir',
  });
  assert.deepEqual(r, { alertId: 'a-sm-7', nueva: true });
  const st = db.cols.program_settings[0];
  assert.equal(st.alerts.length, 1);
  assert.equal(st.alerts[0].pid, 'sm-7');
  assert.equal(st.alerts[0].sev, 'crisis');
  assert.equal(st.alerts[0].status, 'new');
  assert.equal(st.crisisLog[0].type, 'created');
  assert.equal(st.notifs.clin.length, 1);
  assert.equal(db.cols.patients[0].status, 'Crisis');
  assert.equal(db.cols.people[0].status, 'Crisis');
});

test('H-001: un segundo mensaje de riesgo no abre otra alerta', async () => {
  const db = baseFalsa();
  const p = {
    patientId: 'sm-7',
    patient: db.cols.patients[0],
    nombre: 'Ana Prueba',
    dicho: 'quiero morir',
    termino: 'quiero morir',
  };
  await escalarCrisis(db, p);
  const r = await escalarCrisis(db, p);
  assert.equal(r.nueva, false);
  assert.equal(db.cols.program_settings[0].alerts.length, 1);
  assert.equal(db.cols.program_settings[0].crisisLog.length, 1);
});
