/**
 * Siembra cohorte demo QUINTIA + cuentas {rol}+prueba@quintia.com
 *
 * Uso (tras db:init:quintia):
 *   PROGRAM_ID=quintia node scripts/seed-quintia-demo.mjs
 *   PROGRAM_ID=quintia node scripts/seed-quintia-demo.mjs --purge   # borra solo documentos demoTag
 *
 * Variables:
 *   QUINTIA_MONGODB_URI | CONSCIENTE_MONGODB_URI | MONGODB_URI
 *   MONGODB_DB (default nucleo_consiente)
 *   SEED_QUINTIA_DEMO_PASSWORD o SEED_ADMIN_PASSWORD (≥12 caracteres)
 */
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  DEMO_TAG,
  TERRITORIES,
  EXPERTS,
  TRIAL_ACCOUNTS_SPEC,
  buildPeople,
  buildPatients,
  ernestoAnalyzerAviso,
} from '../programs/quintia/seed-demo-data.mjs';
import { prototypeSnapshot } from '../programs/quintia/prototype-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const programId = String(process.env.PROGRAM_ID || 'quintia').trim() || 'quintia';
config({ path: resolve(__dirname, '../.env') });

const uri =
  process.env[`${programId.toUpperCase()}_MONGODB_URI`] ||
  process.env.CONSIENTE_MONGODB_URI ||
  process.env.MONGODB_URI;
const dbName =
  process.env.MONGODB_DB ||
  process.env[`${programId.toUpperCase()}_MONGODB_DB`] ||
  'nucleo_consiente';

const purge = process.argv.includes('--purge');

const demoPassword =
  process.env.SEED_QUINTIA_DEMO_PASSWORD || process.env.SEED_ADMIN_PASSWORD || '';

if (!uri) {
  console.error('Falta MONGODB_URI / QUINTIA_MONGODB_URI');
  process.exit(1);
}
if (!demoPassword || demoPassword.length < 12) {
  console.error(
    'Falta SEED_QUINTIA_DEMO_PASSWORD o SEED_ADMIN_PASSWORD (12+ caracteres) para las cuentas de prueba.',
  );
  process.exit(1);
}

const PLATEADO_ROLES = [
  { id: 'admin', slug: 'admin', name: 'Administrador', href: '/inicio', nk: 'admin' },
  { id: 'gestor', slug: 'gestor', name: 'Gestor de campo', href: '/experto', nk: null, base: 'experto' },
  { id: 'experto', slug: 'experto', name: 'Gestor de campo', href: '/experto', nk: null },
  { id: 'clinico', slug: 'clinico', name: 'Clínica', href: '/clinico', nk: 'clin' },
  { id: 'observador', slug: 'observador', name: 'Observador', href: '/observador', nk: null },
  { id: 'persona', slug: 'persona', name: 'Persona acompañada', href: '/paciente', nk: null, base: 'paciente' },
  { id: 'paciente', slug: 'paciente', name: 'Persona acompañada', href: '/paciente', nk: null },
  {
    id: 'cuidador',
    slug: 'cuidador',
    name: 'Cuidadora / familiar',
    href: '/cuidador',
    nk: null,
    ve: ['resumen', 'citas', 'avisos'],
    no_ve: ['clinico'],
  },
];

async function purgeDemo(db) {
  const filter = { demoTag: DEMO_TAG };
  const ids = TRIAL_ACCOUNTS_SPEC.map((a) => a.id);
  for (const col of ['people', 'patients', 'experts', 'territories', 'accounts', 'alerts']) {
    const r = await db.collection(col).deleteMany(col === 'accounts' ? { $or: [filter, { id: { $in: ids } }] } : filter);
    if (r.deletedCount) console.log(`  - ${col}: ${r.deletedCount} borrados`);
  }
  const st = await db.collection('program_settings').findOne({ key: 'app_state' });
  if (st?.alerts?.length) {
    const alerts = st.alerts.filter((a) => a.demoTag !== DEMO_TAG);
    await db.collection('program_settings').updateOne(
      { key: 'app_state' },
      { $set: { alerts, updatedAt: new Date() } },
    );
  }
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log('QUINTIA seed demo · DB:', dbName);

  if (purge) {
    console.log('\n--purge: limpiando documentos con demoTag…');
    await purgeDemo(db);
  }

  const now = new Date();
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const rolesCol = db.collection('roles');
  for (const role of PLATEADO_ROLES) {
    await rolesCol.updateOne(
      { id: role.id },
      { $set: { ...role, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
  }

  for (const t of TERRITORIES) {
    await db.collection('territories').updateOne(
      { name: t.name },
      {
        $set: { ...t, demoTag: DEMO_TAG, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }
  console.log('  territorios:', TERRITORIES.map((t) => t.name).join(', '));

  for (const ex of EXPERTS) {
    await db.collection('experts').updateOne(
      { id: ex.id },
      { $set: { ...ex, updatedAt: now }, $setOnInsert: { createdAt: now, isNew: false } },
      { upsert: true },
    );
  }

  const expertByTerr = Object.fromEntries(EXPERTS.map((e) => [e.terr, { id: e.id, name: e.name }]));
  const people = buildPeople({ expertByTerr });
  const patients = buildPatients(people);

  for (const p of people) {
    await db.collection('people').updateOne(
      { id: p.id },
      { $set: { ...p, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
  }
  for (const pat of patients) {
    await db.collection('patients').updateOne(
      { id: pat.id },
      { $set: { ...pat, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
  }
  console.log(
    '  personas:',
    people.length,
    '(featured: Hernán Quintero, Rosa Elena Pardo, Ernesto Villamil, Elvia Rendón + clínicas del prototipo)',
  );

  const accountLinks = [
    ['qdemo-p-hernan', 'qdemo-paciente'],
    ['qdemo-p-ernesto', 'qdemo-paciente2'],
    ['qdemo-p-rosa', 'qdemo-paciente3'],
    ['qdemo-p-elvia', 'qdemo-paciente4'],
  ];
  for (const [pid, aid] of accountLinks) {
    await db.collection('people').updateOne({ id: pid }, { $set: { accountId: aid, updatedAt: now } });
    await db.collection('patients').updateOne({ id: pid }, { $set: { accountId: aid } });
  }
  await db.collection('people').updateOne(
    { id: 'qdemo-p-rosa' },
    {
      $set: {
        caregiverAccountId: 'qdemo-cuidador',
        caregiverName: 'Gloria Pardo',
        tieneCuidador: true,
        updatedAt: now,
      },
    },
  );

  for (const a of TRIAL_ACCOUNTS_SPEC) {
    await db.collection('accounts').updateOne(
      { id: a.id },
      {
        $set: {
          ...a,
          email: a.email,
          contact: a.email,
          status: 'Activo',
          passwordHash,
          demoTag: DEMO_TAG,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }
  console.log('  cuentas prueba:', TRIAL_ACCOUNTS_SPEC.length);

  const aviso = ernestoAnalyzerAviso();
  const demo = prototypeSnapshot();
  const settings = db.collection('program_settings');
  let appState = await settings.findOne({ key: 'app_state' });
  const patch = {
    alerts: [aviso],
    crisisLog: [],
    quintiaDemo: demo,
    avisosAnalizador: demo.storeDefaults.avisos,
    gameCfg: demo.storeDefaults.gameCfg,
    anCfg: demo.storeDefaults.anCfg,
    matrix: demo.storeDefaults.matrix,
    updatedAt: now,
  };
  if (!appState) {
    await settings.insertOne({
      key: 'app_state',
      programId,
      ...patch,
      notifs: { clin: [], admin: [] },
      createdAt: now,
    });
  } else {
    const alerts = Array.isArray(appState.alerts)
      ? appState.alerts.filter((x) => x.demoTag !== DEMO_TAG && x.id !== 'qdemo-alert-ernesto')
      : [];
    alerts.unshift(aviso);
    await settings.updateOne(
      { key: 'app_state' },
      {
        $set: {
          ...patch,
          alerts,
        },
      },
    );
  }
  console.log('  aviso analizador abierto: Ernesto · Simón dice (sin crisis)');
  console.log('  quintiaDemo: juegos', demo.gameIds.join(', '), '· pacientes prototipo', Object.keys(demo.patients).length);

  console.log('\nListo. Contraseña compartida: variable SEED_QUINTIA_DEMO_PASSWORD o SEED_ADMIN_PASSWORD (no se imprime).');
  console.log('Correos:');
  for (const a of TRIAL_ACCOUNTS_SPEC) console.log(' ', a.email);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
