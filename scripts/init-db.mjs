/**
 * Crea colecciones e índices en la DB del programa.
 * Uso:
 *   PROGRAM_ID=parienta MONGODB_DB=nucleo_parienta node scripts/init-db.mjs
 *   PROGRAM_ID=nara     MONGODB_DB=nucleo_nara     node scripts/init-db.mjs
 */
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const programId = String(process.env.PROGRAM_ID || 'parienta').trim() || 'parienta';
config({ path: resolve(__dirname, '../.env') });

const uri =
  process.env[`${programId.toUpperCase()}_MONGODB_URI`] ||
  process.env.MONGODB_URI;
const dbName =
  process.env.MONGODB_DB ||
  process.env[`${programId.toUpperCase()}_MONGODB_DB`] ||
  (programId === 'nara' ? 'nara' : 'nucleo_parienta');

if (!uri) {
  console.error('Falta MONGODB_URI en .env');
  process.exit(1);
}

/** @typedef {{ name: string, description?: string, indexes: Array<{ key: Record<string, 1|-1>, options?: object }> }} ColDef */

/** @type {ColDef[]} */
const COLLECTIONS = [
  // —— Núcleo operativo (compatibilidad con código heredado de NARA) ——
  {
    name: 'roles',
    description: 'Catálogo de roles Parienta',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'roles_id_unique' } },
      { key: { slug: 1 }, options: { unique: true, name: 'roles_slug_unique' } },
    ],
  },
  {
    name: 'accounts',
    description: 'Cuentas de acceso',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'accounts_id_unique' } },
      { key: { role: 1, status: 1 }, options: { name: 'accounts_role_status' } },
      { key: { roleId: 1 }, options: { name: 'accounts_roleId' } },
      { key: { email: 1 }, options: { unique: true, sparse: true, name: 'accounts_email_unique' } },
    ],
  },
  {
    name: 'territories',
    description: 'Territorios / municipios',
    indexes: [
      { key: { name: 1 }, options: { unique: true, name: 'territories_name_unique' } },
      { key: { dep: 1 }, options: { name: 'territories_dep' } },
    ],
  },
  {
    name: 'experts',
    description: 'Gestores de campo (equipos)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'experts_id_unique' } },
      { key: { terr: 1 }, options: { name: 'experts_terr' } },
      { key: { accountId: 1 }, options: { sparse: true, name: 'experts_account' } },
    ],
  },
  {
    name: 'people',
    description: 'Personas acompañadas (roster)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'people_id_unique' } },
      { key: { code: 1 }, options: { unique: true, sparse: true, name: 'people_code_unique' } },
      { key: { terr: 1 }, options: { name: 'people_terr' } },
      { key: { expertId: 1 }, options: { sparse: true, name: 'people_expert' } },
      { key: { profile: 1 }, options: { name: 'people_profile' } },
    ],
  },
  {
    name: 'patients',
    description: 'Ficha clínica / persona (instrumentos, plan, crisis)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'patients_id_unique' } },
      { key: { personId: 1 }, options: { sparse: true, name: 'patients_person' } },
      { key: { accountId: 1 }, options: { sparse: true, name: 'patients_account' } },
      { key: { caregiverId: 1 }, options: { sparse: true, name: 'patients_caregiver' } },
    ],
  },
  {
    name: 'assets',
    description: 'Activos del programa',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'assets_id_unique' } },
      { key: { type: 1, status: 1 }, options: { name: 'assets_type_status' } },
      { key: { assignedTo: 1 }, options: { sparse: true, name: 'assets_assigned' } },
    ],
  },
  {
    name: 'alerts',
    description: 'Alertas clínicas y operativas',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'alerts_id_unique' } },
      { key: { status: 1, sev: 1 }, options: { name: 'alerts_status_sev' } },
      { key: { expert: 1 }, options: { sparse: true, name: 'alerts_expert' } },
      { key: { at: -1 }, options: { name: 'alerts_at' } },
      { key: { categoria: 1, status: 1 }, options: { name: 'alerts_categoria_status' } },
    ],
  },
  {
    name: 'flags',
    description: 'Casos pendientes de revisión',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'flags_id_unique' } },
      { key: { expert: 1, status: 1 }, options: { name: 'flags_expert_status' } },
      { key: { at: -1 }, options: { name: 'flags_at' } },
    ],
  },
  {
    name: 'visits',
    description: 'Visitas domiciliarias',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'visits_id_unique' } },
      { key: { personId: 1, at: -1 }, options: { name: 'visits_person_at' } },
      { key: { expertId: 1, at: -1 }, options: { name: 'visits_expert_at' } },
    ],
  },
  {
    name: 'worklists',
    description: 'Listas de trabajo por gestor/día',
    indexes: [
      { key: { expertId: 1, date: 1 }, options: { name: 'worklists_expert_date' } },
      { key: { personId: 1 }, options: { sparse: true, name: 'worklists_person' } },
    ],
  },
  {
    name: 'worklist_items',
    description: 'Ítems de lista de trabajo',
    indexes: [
      { key: { id: 1 }, options: { unique: true, sparse: true, name: 'worklist_items_id_unique' } },
      { key: { expertId: 1, date: 1 }, options: { name: 'worklist_items_expert_date' } },
      { key: { personId: 1 }, options: { sparse: true, name: 'worklist_items_person' } },
      { key: { status: 1 }, options: { name: 'worklist_items_status' } },
    ],
  },
  {
    name: 'revisits',
    description: 'Revisitas programadas',
    indexes: [
      { key: { expertId: 1, when: 1 }, options: { name: 'revisits_expert_when' } },
      { key: { personId: 1 }, options: { sparse: true, name: 'revisits_person' } },
    ],
  },
  {
    name: 'group_sessions',
    description: 'Sesiones grupales / comunitarias',
    indexes: [
      { key: { expertId: 1, when: 1 }, options: { name: 'group_sessions_expert_when' } },
      { key: { terr: 1 }, options: { sparse: true, name: 'group_sessions_terr' } },
    ],
  },
  {
    name: 'referrals',
    description: 'Remisiones a salud / protección',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'referrals_id_unique' } },
      { key: { personId: 1 }, options: { name: 'referrals_person' } },
      { key: { institutionId: 1 }, options: { sparse: true, name: 'referrals_inst' } },
    ],
  },
  {
    name: 'consents',
    description: 'Consentimientos (persona + cuidador)',
    indexes: [
      { key: { personId: 1 }, options: { unique: true, name: 'consents_person_unique' } },
      { key: { caregiverId: 1 }, options: { sparse: true, name: 'consents_caregiver' } },
      { key: { at: -1 }, options: { name: 'consents_at' } },
    ],
  },
  {
    name: 'notes',
    description: 'Notas clínicas / de campo',
    indexes: [
      { key: { personId: 1, at: -1 }, options: { name: 'notes_person_at' } },
      { key: { authorId: 1 }, options: { sparse: true, name: 'notes_author' } },
    ],
  },
  {
    name: 'path_requests',
    description: 'Solicitudes de cambio de ruta',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'path_requests_id_unique' } },
      { key: { status: 1, at: -1 }, options: { name: 'path_requests_status_at' } },
    ],
  },
  {
    name: 'path_overrides',
    description: 'Overrides de rutas por perfil PL01–PL08',
    indexes: [
      { key: { code: 1 }, options: { unique: true, name: 'path_overrides_code_unique' } },
    ],
  },
  {
    name: 'caseload',
    description: 'Carga clínica asignada',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'caseload_id_unique' } },
      { key: { clinicianId: 1 }, options: { sparse: true, name: 'caseload_clinician' } },
    ],
  },
  {
    name: 'notifications',
    description: 'Notificaciones in-app',
    indexes: [
      { key: { inbox: 1, at: -1 }, options: { name: 'notifications_inbox_at' } },
      { key: { read: 1 }, options: { name: 'notifications_read' } },
    ],
  },
  {
    name: 'reports',
    description: 'Informes generados',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'reports_id_unique' } },
      { key: { kind: 1, at: -1 }, options: { name: 'reports_kind_at' } },
    ],
  },
  {
    name: 'custom_reports',
    description: 'Plantillas de informes',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'custom_reports_id_unique' } },
    ],
  },
  {
    name: 'schedules',
    description: 'Programación de envíos / informes',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'schedules_id_unique' } },
      { key: { nextAt: 1 }, options: { sparse: true, name: 'schedules_next' } },
    ],
  },
  {
    name: 'recursos',
    description: 'Recursos / materiales asignados',
    indexes: [
      { key: { personId: 1 }, options: { unique: true, sparse: true, name: 'recursos_person_unique' } },
      { key: { course: 1 }, options: { sparse: true, name: 'recursos_course' } },
    ],
  },
  {
    name: 'program_settings',
    description: 'Configuración global del programa',
    indexes: [
      { key: { key: 1 }, options: { unique: true, name: 'program_settings_key_unique' } },
    ],
  },
  {
    name: 'activity_log',
    description: 'Bitácora de actividad',
    indexes: [
      { key: { uid: 1, at: -1 }, options: { name: 'activity_uid_at' } },
      { key: { at: -1 }, options: { name: 'activity_at' } },
    ],
  },
  {
    name: 'access_log',
    description: 'Acceso a fichas / datos sensibles',
    indexes: [
      { key: { code: 1, at: -1 }, options: { name: 'access_code_at' } },
      { key: { at: -1 }, options: { name: 'access_at' } },
    ],
  },
  {
    name: 'agent_log',
    description: 'Historial del agente / TEO (UI)',
    indexes: [
      { key: { role: 1, at: -1 }, options: { name: 'agent_role_at' } },
      { key: { at: -1 }, options: { name: 'agent_at' } },
    ],
  },
  {
    name: 'ai_log',
    description: 'Log de interacciones IA',
    indexes: [
      { key: { pid: 1, at: -1 }, options: { name: 'ai_pid_at' } },
      { key: { at: -1 }, options: { name: 'ai_at' } },
    ],
  },
  {
    name: 'conversacion',
    description: 'Conversaciones TEO',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'conversacion_id_unique' } },
      { key: { accountId: 1, startedAt: -1 }, options: { name: 'conversacion_account_started' } },
      { key: { personId: 1, startedAt: -1 }, options: { sparse: true, name: 'conversacion_person_started' } },
    ],
  },
  {
    name: 'teo_conversations',
    description: 'Conversaciones TEO (legacy)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, sparse: true, name: 'teo_conversations_id_unique' } },
      { key: { accountId: 1 }, options: { sparse: true, name: 'teo_conversations_account' } },
    ],
  },
  {
    name: 'clin_citas',
    description: 'Citas clínicas',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'clin_citas_id_unique' } },
      { key: { patientId: 1, fecha: 1, hora: 1 }, options: { name: 'clin_citas_patient_fecha' } },
    ],
  },
  {
    name: 'clin_solicitudes',
    description: 'Solicitudes de cita clínica',
    indexes: [
      { key: { patientId: 1, estado: 1 }, options: { name: 'clin_solicitudes_patient_estado' } },
      { key: { at: 1 }, options: { name: 'clin_solicitudes_at' } },
    ],
  },

  // —— Dominio Plateado (Adenda A) ——
  {
    name: 'caregivers',
    description: 'Cuidadoras / familiares vinculados a la persona',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'caregivers_id_unique' } },
      { key: { personId: 1 }, options: { name: 'caregivers_person' } },
      { key: { accountId: 1 }, options: { sparse: true, name: 'caregivers_account' } },
      { key: { phone: 1 }, options: { sparse: true, name: 'caregivers_phone' } },
    ],
  },
  {
    name: 'evaluations',
    description: 'Aplicaciones de instrumentos (ánimo, autonomía, red, etc.)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'evaluations_id_unique' } },
      { key: { personId: 1, instrument: 1, at: -1 }, options: { name: 'evaluations_person_instrument_at' } },
      { key: { patientId: 1, at: -1 }, options: { sparse: true, name: 'evaluations_patient_at' } },
      { key: { instrument: 1, at: -1 }, options: { name: 'evaluations_instrument_at' } },
    ],
  },
  {
    name: 'crisis_events',
    description: 'Detecciones de crisis (3 categorías Plateado)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'crisis_events_id_unique' } },
      { key: { personId: 1, at: -1 }, options: { name: 'crisis_events_person_at' } },
      { key: { categoria: 1, status: 1 }, options: { name: 'crisis_events_categoria_status' } },
      { key: { at: -1 }, options: { name: 'crisis_events_at' } },
    ],
  },
  {
    name: 'protection_cases',
    description: 'Casos de protección (abandono / maltrato · R6)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'protection_cases_id_unique' } },
      { key: { personId: 1 }, options: { name: 'protection_cases_person' } },
      { key: { status: 1, openedAt: -1 }, options: { name: 'protection_cases_status_opened' } },
    ],
  },
  {
    name: 'call_jobs',
    description: 'Llamadas programadas (acompañamiento, inactividad 48h)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'call_jobs_id_unique' } },
      { key: { personId: 1, scheduledAt: 1 }, options: { name: 'call_jobs_person_scheduled' } },
      { key: { status: 1, scheduledAt: 1 }, options: { name: 'call_jobs_status_scheduled' } },
      { key: { reason: 1 }, options: { name: 'call_jobs_reason' } },
    ],
  },
  {
    name: 'inactivity_watch',
    description: 'Seguimiento de inactividad (48h → avisar gestor/cuidador)',
    indexes: [
      { key: { personId: 1 }, options: { unique: true, name: 'inactivity_watch_person_unique' } },
      { key: { lastActivityAt: 1 }, options: { name: 'inactivity_watch_last' } },
      { key: { status: 1 }, options: { name: 'inactivity_watch_status' } },
    ],
  },
  {
    name: 'whatsapp_messages',
    description: 'Mensajes WhatsApp (canal Plateado)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'whatsapp_messages_id_unique' } },
      { key: { personId: 1, at: -1 }, options: { name: 'whatsapp_messages_person_at' } },
      { key: { threadId: 1, at: -1 }, options: { sparse: true, name: 'whatsapp_messages_thread_at' } },
      { key: { waId: 1 }, options: { unique: true, sparse: true, name: 'whatsapp_messages_wa_unique' } },
    ],
  },
  {
    name: 'voice_sessions',
    description: 'Sesiones de voz (STT/TTS)',
    indexes: [
      { key: { id: 1 }, options: { unique: true, name: 'voice_sessions_id_unique' } },
      { key: { personId: 1, startedAt: -1 }, options: { name: 'voice_sessions_person_started' } },
      { key: { accountId: 1, startedAt: -1 }, options: { sparse: true, name: 'voice_sessions_account_started' } },
    ],
  },
  {
    name: 'care_paths',
    description: 'Ruta de cuidado activa por persona (servicios PL + R5/R6)',
    indexes: [
      { key: { personId: 1 }, options: { unique: true, name: 'care_paths_person_unique' } },
      { key: { profile: 1 }, options: { name: 'care_paths_profile' } },
      { key: { updatedAt: -1 }, options: { name: 'care_paths_updated' } },
    ],
  },
];

const PLATEADO_ROLES = [
  {
    id: 'admin',
    slug: 'admin',
    name: 'Administrador',
    description: 'Configura el programa Plateado.',
    href: '/inicio',
    nk: 'admin',
  },
  {
    id: 'gestor',
    slug: 'gestor',
    name: 'Gestor de campo',
    description: 'Visitas, captación y listas de trabajo. Base operativa: experto.',
    href: '/experto',
    nk: null,
    base: 'experto',
  },
  {
    id: 'experto',
    slug: 'experto',
    name: 'Gestor de campo',
    description: 'Alias de compatibilidad (mismo rol que gestor).',
    href: '/experto',
    nk: null,
  },
  {
    id: 'clinico',
    slug: 'clinico',
    name: 'Clínica',
    description: 'Casos clínicos, alertas y carga.',
    href: '/clinico',
    nk: 'clin',
  },
  {
    id: 'observador',
    slug: 'observador',
    name: 'Observador',
    description: 'Solo lectura agregada.',
    href: '/observador',
    nk: null,
  },
  {
    id: 'persona',
    slug: 'persona',
    name: 'Persona acompañada',
    description: 'App de la persona mayor. Base: paciente.',
    href: '/paciente',
    nk: null,
    base: 'paciente',
  },
  {
    id: 'paciente',
    slug: 'paciente',
    name: 'Persona acompañada',
    description: 'Alias de compatibilidad (mismo rol que persona).',
    href: '/paciente',
    nk: null,
  },
  {
    id: 'cuidador',
    slug: 'cuidador',
    name: 'Cuidadora / familiar',
    description: 'Ve resumen, citas y avisos; no ve lo clínico.',
    href: '/cuidador',
    nk: null,
    ve: ['resumen', 'citas', 'avisos'],
    no_ve: ['clinico'],
  },
];

function defaultProgramSettings() {
  return {
    key: 'main',
    programId,
    v: 1,
    rules: {
      perfiles: ['PL01', 'PL02', 'PL03', 'PL04', 'PL05', 'PL06', 'PL07', 'PL08'],
      ejes: ['riesgo_emocional', 'autonomia', 'red_apoyo'],
      instrumentos: [
        'animo',
        'autonomia',
        'cognicion',
        'digital',
        'ideacion',
        'red',
        'soledad',
      ],
      crisis: {
        categorias: ['riesgo_suicida', 'abandono_maltrato', 'urgencia_medica'],
      },
      inactividad: { horas: 48, avisar: ['gestor', 'cuidador'], accion: 'llamada_programada' },
      auto: { expert: 'vereda', clin: 'carga', review: 'Cada 4 semanas' },
      pending: null,
      versions: [
        {
          v: 1,
          by: 'Sistema',
          at: Date.now(),
          what: `Esquema inicial ${programId} en ${dbName} (colecciones vacías + roles).`,
        },
      ],
    },
    weekBase: {},
    rejected: {},
    pendingSync: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function main() {
  const client = new MongoClient(uri);
  console.log('Conectando a', dbName, '…');
  await client.connect();
  const db = client.db(dbName);
  await db.command({ ping: 1 });
  console.log('Ping OK\n');

  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));
  let indexCount = 0;
  let created = 0;

  for (const col of COLLECTIONS) {
    if (!existing.has(col.name)) {
      await db.createCollection(col.name);
      console.log('  + colección', col.name);
      created += 1;
    } else {
      console.log('  · existe', col.name);
    }
    const collection = db.collection(col.name);
    for (const idx of col.indexes) {
      await collection.createIndex(idx.key, idx.options || {});
      indexCount += 1;
    }
  }

  const rolesCol = db.collection('roles');
  for (const role of PLATEADO_ROLES) {
    await rolesCol.updateOne(
      { id: role.id },
      { $set: { ...role, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }
  console.log('\n  · roles sembrados:', PLATEADO_ROLES.map((r) => r.id).join(', '));

  const settings = db.collection('program_settings');
  const mainDoc = await settings.findOne({ key: 'main' });
  if (!mainDoc) {
    await settings.insertOne(defaultProgramSettings());
    console.log('  + program_settings.main');
  } else {
    await settings.updateOne(
      { key: 'main' },
      { $set: { programId, updatedAt: new Date() } },
    );
    console.log(`  · program_settings.main ya existe (programId=${programId})`);
  }

  const appState = await settings.findOne({ key: 'app_state' });
  if (!appState) {
    await settings.insertOne({
      key: 'app_state',
      programId,
      alerts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('  + program_settings.app_state');
  }

  const finalCols = (await db.listCollections().toArray()).map((c) => c.name).sort();
  console.log('\nListo:');
  console.log('  db:', dbName);
  console.log('  colecciones nuevas:', created);
  console.log('  total colecciones:', finalCols.length);
  console.log('  índices aplicados:', indexCount);
  console.log('  nombres:', finalCols.join(', '));

  await client.close();
}

main().catch((err) => {
  console.error('Error init DB:', err.message || err);
  process.exit(1);
});
