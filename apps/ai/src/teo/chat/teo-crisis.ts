import {
  crisisCheck as crisisCheckNucleo,
  esRespuestaCrisis as esRespuestaCrisisNucleo,
  textoDeCrisis as textoPlantilla,
} from '@nucleo/crisis';
import { assistantBrand } from '../prompts/assistant-brand';

// Igual que APP_STATE_KEY de @nara/common (patterns.ts).
const APP_STATE_KEY = 'app_state';

/**
 * H-001: la crisis que detecta TEO se escala en el servidor.
 * Frases y categorías: programs/parienta/crisis.json vía libs/crisis.
 */

/** @deprecated Preferir configuración en programs/<id>/crisis.json vía @nucleo/crisis */
export const CRISIS_TERMS: string[] = [];

/** Término o categoría de riesgo (libs/crisis + programs/parienta). */
export function crisisCheck(text: string): string | null {
  return crisisCheckNucleo(text);
}

export function esRespuestaCrisis(text: string): boolean {
  return esRespuestaCrisisNucleo(text);
}

/** Texto fijo del programa. `escalada` mantiene la firma usada por teo-chat. */
export function textoDeCrisis(nombre: string, escalada: boolean): string {
  const base = textoPlantilla(nombre, 'riesgo_suicida');
  if (!escalada) return base;
  return `${base} Voy a pausar esta conversación para que el equipo le contacte pronto.`;
}

type Db = {
  collection: (name: string) => {
    findOne: (q: Record<string, unknown>, o?: Record<string, unknown>) => Promise<Record<string, any> | null>;
    updateOne: (q: Record<string, unknown>, u: Record<string, unknown>, o?: Record<string, unknown>) => Promise<unknown>;
  };
};

/**
 * Crea la alerta de crisis (`a-<patientId>`), el evento `created` de crisisLog y el aviso al clínico,
 * y deja a la persona en Crisis. Si ya hay una alerta abierta para ese paciente, no crea otra.
 */
export async function escalarCrisis(
  db: Db,
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
    .findOne({ key: APP_STATE_KEY, 'alerts.id': alertId }, { projection: { _id: 1 } });

  // Estado Crisis, igual que «Estoy en crisis» del paciente (people.service.ts).
  await db.collection('patients').updateOne(
    { id: p.patientId },
    {
      $set: {
        status: 'Crisis',
        signal: 'Crisis',
        crisisLock: true,
        inactiveLock: false,
        crisisAttendedAt: null,
        crisisAttendedOutcome: null,
        crisisBtnReady: false,
        updatedAt: now,
      },
    },
  );
  await db
    .collection('people')
    .updateOne({ id: p.patientId }, { $set: { status: 'Crisis', inactiveLock: false, updatedAt: now } });
  if (abierta) return { alertId, nueva: false };

  const pa = p.patient || {};
  const place = String(pa.place || '').split(',')[0];
  const assistantName = assistantBrand().assistantName || 'Aurelia';
  const what = `Escribió a ${assistantName}: «${p.dicho.slice(0, 280)}». ${assistantName} le dio la línea 123, pausó la conversación y levantó la alerta.`;
  const alerta = {
    at,
    status: 'new',
    id: alertId,
    sev: 'crisis',
    pid: p.patientId,
    name: p.nombre,
    age: pa.age,
    place,
    profile: pa.profile || '',
    what,
    term: p.termino,
    source: `Conversación con ${assistantName}`,
    phone: pa.phone || '',
    createdBy: `${assistantName} (servidor)`,
    createdByRole: 'sistema',
  };
  const evento = {
    id: `cl${at}${Math.random().toString(36).slice(2, 6)}`,
    at,
    type: 'created',
    alertId,
    pid: p.patientId,
    name: p.nombre,
    age: pa.age,
    place,
    profile: pa.profile || '',
    by: `${assistantName} (servidor)`,
    byRole: 'sistema',
    source: alerta.source,
    what,
    detail: alerta.phone ? `Teléfono: ${alerta.phone}` : '',
    status: 'new',
  };
  const codeLabel = String(
    (p.patient as { code?: string } | null)?.code || p.patientId || 'sin-código',
  );
  const aviso = {
    id: `n${at}${Math.random().toString(36).slice(2, 5)}`,
    text: `Nueva alerta de crisis: ${codeLabel}`,
    link: '/clinico/crisis',
    at,
    read: false,
    pid: p.patientId,
  };
  await db.collection('program_settings').updateOne(
    { key: APP_STATE_KEY },
    {
      $push: {
        alerts: { $each: [alerta], $position: 0 },
        crisisLog: { $each: [evento], $position: 0, $slice: 800 },
        'notifs.clin': { $each: [aviso], $position: 0 },
      },
      $set: { updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
  return { alertId, nueva: true };
}
