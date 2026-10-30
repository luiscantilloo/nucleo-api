/**
 * H-002 (reporte TRL 2026-10-10, SPEC-002 FR-002): `POST /api/alerts` guarda una alerta al momento, sin
 * esperar a que se guarde la visita ni a que la persona ya sea paciente. Lo usan la pregunta 9 del PHQ-9
 * (experto) y la app del paciente.
 */
import type { Db } from 'mongodb';
import type { PolicyUser } from './app-state.policy';

// Igual que APP_STATE_KEY de @nara/common. Sin alias para que `node --test` cargue este archivo.
const APP_STATE_KEY = 'app_state';
const SEV = ['crisis', 'alta', 'media', 'baja', 'info', 'open'];
const texto = (v: unknown, max = 500) => String(v ?? '').trim().slice(0, max);
const esPersona = (r: string) => r === 'paciente' || r === 'persona';
const esGestor = (r: string) => r === 'experto' || r === 'gestor';

export async function guardarAlerta(db: Db, body: Record<string, unknown>, user: PolicyUser, ids: Set<string> | null) {
  const pid = texto(body.pid, 80);
  const sev = texto(body.sev, 20) || 'crisis';
  if (!pid) return { ok: false, status: 400, error: 'Falta la persona (pid).' };
  if (!SEV.includes(sev)) return { ok: false, status: 400, error: 'Severidad no válida.' };
  const ownIds = new Set(
    [user.id, user.patientId].filter(Boolean).map(String),
  );
  let permitido =
    user.roleId === 'admin' ||
    (esPersona(user.roleId) && ownIds.has(pid)) ||
    ((esGestor(user.roleId) || user.roleId === 'clinico') &&
      !!ids &&
      ids.has(pid));
  // Paciente: ficha vinculada por accountId (pid de ficha ≠ patientId de sesión).
  if (!permitido && esPersona(user.roleId) && user.id) {
    const linked =
      (await db.collection('patients').findOne({
        id: pid,
        accountId: user.id,
      })) ||
      (await db.collection('people').findOne({
        id: pid,
        accountId: user.id,
      }));
    permitido = !!linked;
  }
  // Cuidadora: solo personas vinculadas (caregiverId / caregiverAccountId / lista).
  if (!permitido && user.roleId === 'cuidador') {
    const cuidFilter = {
      id: pid,
      $or: [
        { caregiverId: user.id },
        { caregiverAccountId: user.id },
        { cuidadorId: user.id },
        { cuidadoraId: user.id },
        { caregivers: user.id },
        { 'caregivers.id': user.id },
        { 'caregivers.accountId': user.id },
        { 'caregivers.caregiverId': user.id },
      ],
    };
    const linked =
      (await db.collection('people').findOne(cuidFilter)) ||
      (await db.collection('patients').findOne(cuidFilter));
    permitido = !!linked;
  }
  if (!permitido) return { ok: false, status: 403, error: 'La persona no está en su alcance.' };

  const now = new Date();
  const at = now.getTime();
  const id = texto(body.id, 80) || `a-${pid}`;
  const locBody =
    body.loc && typeof body.loc === 'object' && !Array.isArray(body.loc)
      ? (body.loc as Record<string, unknown>)
      : null;
  const locLat = locBody ? Number(locBody.lat) : NaN;
  const locLng = locBody ? Number(locBody.lng) : NaN;
  const loc =
    locBody && Number.isFinite(locLat) && Number.isFinite(locLng)
      ? {
          lat: locLat,
          lng: locLng,
          at: Number(locBody.at) || at,
          until: Number(locBody.until) || at + 24 * 60 * 60 * 1000,
          ...(Number.isFinite(Number(locBody.accuracy))
            ? { accuracy: Number(locBody.accuracy) }
            : {}),
        }
      : undefined;
  const alerta = {
    at,
    status: sev === 'crisis' ? 'new' : 'open',
    id,
    sev,
    pid,
    name: texto(body.name, 120),
    age: body.age ?? null,
    place: texto(body.place, 120),
    profile: texto(body.profile, 10),
    what: texto(body.what),
    term: texto(body.term, 120),
    source: texto(body.source, 120),
    phone: texto(body.phone, 20),
    expert: texto(body.expert, 80) || undefined,
    createdBy: user.id,
    createdByRole: user.roleId,
    ...(loc ? { loc } : {}),
  };
  const marcarFichaCrisis = async () => {
    if (sev !== 'crisis') return;
    const crisisPatch = {
      status: 'Crisis',
      signal: 'Crisis',
      crisisLock: true,
      crisisAttendedAt: null,
      crisisAttendedOutcome: null,
      crisisBtnReady: false,
      crisisPromptAt: null,
      updatedAt: now,
    };
    await db
      .collection('people')
      .updateOne({ id: pid }, { $set: { status: 'Crisis', updatedAt: now } });
    // Por id de ficha, por accountId, o persona cuyo accountId sea el pid.
    const patientFilter = {
      $or: [{ id: pid }, { accountId: pid }, { code: pid }],
    };
    const updated = await db
      .collection('patients')
      .updateMany(patientFilter, { $set: crisisPatch });
    // Si no hubo ficha patients, buscar la ligada desde people.accountId.
    if (!updated.matchedCount) {
      const person = await db.collection('people').findOne({ id: pid });
      const acc = person?.accountId ? String(person.accountId) : '';
      if (acc) {
        await db
          .collection('patients')
          .updateMany(
            { $or: [{ id: acc }, { accountId: acc }, { id: pid }] },
            { $set: crisisPatch },
          );
      }
    }
  };

  const col = db.collection('program_settings');
  const ya = await col.findOne({ key: APP_STATE_KEY, 'alerts.id': id }, { projection: { _id: 1 } });
  if (ya) {
    // Misma alerta ya en cola: igual forzar Crisis en la ficha (sync pudo haberla dejado Activo).
    // Si viene GPS (p. ej. cuidador actualizando), refrescar loc.
    await marcarFichaCrisis();
    if (loc) {
      await col.updateOne(
        { key: APP_STATE_KEY, 'alerts.id': id },
        { $set: { 'alerts.$.loc': loc, updatedAt: now } },
      );
    }
    return {
      ok: true,
      status: 200,
      alert: { ...alerta, ...(loc ? { loc } : {}) },
      nueva: false,
    };
  }

  const push: Record<string, any> = { alerts: { $each: [alerta], $position: 0 } };
  if (sev === 'crisis') {
    push.crisisLog = {
      $each: [{
        id: `cl${at}${Math.random().toString(36).slice(2, 6)}`,
        at,
        type: 'created',
        alertId: id,
        pid,
        name: alerta.name || 'Sin nombre',
        age: alerta.age,
        place: alerta.place,
        profile: alerta.profile,
        by: user.id,
        byRole: user.roleId,
        source: alerta.source,
        what: alerta.what || 'Alerta de crisis creada',
        detail: alerta.phone ? `Teléfono: ${alerta.phone}` : '',
        status: 'new',
      }],
      $position: 0,
      $slice: 800,
    };
    push['notifs.clin'] = {
      $each: [{ id: `n${at}${Math.random().toString(36).slice(2, 5)}`, text: `Nueva alerta de crisis: ${alerta.name || pid}`, link: '/clinico/crisis', at, read: false }],
      $position: 0,
    };
  }
  await col.updateOne(
    { key: APP_STATE_KEY },
    { $push: push, $set: { updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );
  await marcarFichaCrisis();
  return { ok: true, status: 201, alert: alerta, nueva: true };
}
