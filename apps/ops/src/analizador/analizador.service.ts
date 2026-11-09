import { Injectable } from '@nestjs/common';
import { APP_STATE_KEY, isGestorRoleId, pickAppStateSlices } from '@nara/common';
import { MongoStore } from '@nara/database';
import { SessionService } from '@nara/auth-core';
import { requireRoles } from '../shared/require-roles';
import { idsDelTerritorio, type PolicyUser } from '../app-state/app-state.policy';
import { docPartida } from './partida-doc';

const MIN_GRUPO = 5;
const ESTADOS_AN: Record<string, string> = {
  base: 'En línea base',
  estable: 'Estables',
  mejorando: 'Mejorando',
  cambio: 'Cambio a revisar',
};

function esMapa(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function contarEstados(byPid: Record<string, { estado?: string } | null | undefined>) {
  const m = new Map<string, number>();
  for (const snap of Object.values(byPid || {})) {
    const k = ESTADOS_AN[String(snap?.estado || 'base')] || 'Sin estado';
    m.set(k, (m.get(k) || 0) + 1);
  }
  const out: Record<string, number | null> = {};
  for (const label of Object.values(ESTADOS_AN)) {
    const v = m.get(label) || 0;
    if (!v) continue;
    out[label] = v < MIN_GRUPO ? null : v;
  }
  return out;
}

@Injectable()
export class AnalizadorService {
  private partidasIdx: Promise<void> | null = null;

  constructor(
    private readonly mongo: MongoStore,
    private readonly sessions: SessionService,
  ) {}

  private async ensurePartidasIndexes(
    col: { createIndex: (keys: Record<string, 1 | -1>, opts?: { unique?: boolean }) => Promise<unknown> },
  ) {
    if (!this.partidasIdx) {
      this.partidasIdx = Promise.all([
        col.createIndex({ partidaId: 1 }, { unique: true }),
        col.createIndex({ pid: 1, startedAt: -1 }),
        col.createIndex({ source: 1 }),
      ]).then(
        () => undefined,
        () => undefined,
      );
    }
    await this.partidasIdx;
  }

  private async slices() {
    const db = await this.mongo.db();
    const doc = await db.collection('program_settings').findOne({ key: APP_STATE_KEY });
    return doc ? pickAppStateSlices(doc as Record<string, unknown>) : {};
  }

  private async alcance(user: PolicyUser): Promise<Set<string> | null> {
    if (user.roleId === 'admin') return null;
    if (isGestorRoleId(user.roleId) || user.roleId === 'clinico' || user.roleId === 'experto') {
      const db = await this.mongo.db();
      return idsDelTerritorio(db, String(user.terr || ''));
    }
    return new Set();
  }

  private filtrarMapa(
    map: Record<string, unknown> | undefined,
    ids: Set<string> | null,
  ): Record<string, unknown> {
    if (!esMapa(map)) return {};
    if (!ids) return { ...map };
    return Object.fromEntries(Object.entries(map).filter(([pid]) => ids.has(pid)));
  }

  /** GET /api/analizador/panel — clínico / experto / admin. */
  async panel(token: string | null) {
    const auth = await requireRoles(this.sessions, token, [
      'admin',
      'clinico',
      'experto',
      'gestor',
    ]);
    if ('error' in auth) return auth.error;
    const all = await this.slices();
    const ids = await this.alcance(auth.user);
    const byPid = this.filtrarMapa(
      all.analizadorByPid as Record<string, unknown> | undefined,
      ids,
    ) as Record<string, { estado?: string }>;
    return {
      ok: true,
      status: 200,
      panel: {
        total: Object.keys(byPid).length,
        byPid,
        porEstado: contarEstados(byPid),
      },
    };
  }

  /** GET /api/analizador/personas/:id */
  async persona(token: string | null, id: string) {
    const auth = await requireRoles(this.sessions, token, [
      'admin',
      'clinico',
      'experto',
      'gestor',
    ]);
    if ('error' in auth) return auth.error;
    const pid = String(id || '').trim();
    if (!pid) return { ok: false, status: 400, error: 'Falta id de persona.' };
    const ids = await this.alcance(auth.user);
    if (ids && !ids.has(pid)) {
      return { ok: false, status: 404, error: 'Persona no encontrada.' };
    }
    const all = await this.slices();
    const map = esMapa(all.analizadorByPid) ? (all.analizadorByPid as Record<string, unknown>) : {};
    const snap = map[pid];
    if (snap === undefined) {
      return { ok: false, status: 404, error: 'Sin datos del analizador para esta persona.' };
    }
    return { ok: true, status: 200, persona: { id: pid, ...((snap && typeof snap === 'object') ? snap : { valor: snap }) } };
  }

  /** GET /api/informes/analizador — observador / admin (agregados, min grupo). */
  async informe(token: string | null) {
    const auth = await requireRoles(this.sessions, token, ['admin', 'observador']);
    if ('error' in auth) return auth.error;
    const all = await this.slices();
    const byPid = (esMapa(all.analizadorByPid) ? all.analizadorByPid : {}) as Record<
      string,
      { estado?: string }
    >;
    return {
      ok: true,
      status: 200,
      informe: {
        totalPersonas: Object.keys(byPid).length,
        minGrupo: MIN_GRUPO,
        porEstado: contarEstados(byPid),
      },
    };
  }

  /**
   * POST /api/eventos/lote — ingesta de partidas (paciente / admin).
   * Cada partida → documento propio en `partidas` (idempotente por `partidaId`).
   * Evita fila sobre un único `program_settings` (RNF-01 / C3 p95).
   * Cuerpo: `{ eventos: [ { pid, id|partidaId, game, startedAt|inicio, finishedAt|fin, ... } ] }`
   */
  async eventosLote(token: string | null, body: Record<string, unknown>) {
    const auth = await requireRoles(this.sessions, token, [
      'admin',
      'paciente',
      'persona',
    ]);
    if ('error' in auth) return auth.error;
    const raw = body?.eventos ?? body?.events ?? body?.lote;
    if (!Array.isArray(raw) || !raw.length) {
      return { ok: false, status: 400, error: 'eventos debe ser una lista no vacía.' };
    }

    const suyas = new Set(
      [auth.user.id, auth.user.patientId].filter(Boolean).map(String),
    );
    const esAdmin = auth.user.roleId === 'admin';
    const db = await this.mongo.db();
    const col = db.collection('partidas');
    await this.ensurePartidasIndexes(col);

    let aceptados = 0;
    const rechazados: Array<{ i: number; error: string }> = [];
    const ops: Array<{
      updateOne: {
        filter: { partidaId: string };
        update: { $set: Record<string, unknown>; $setOnInsert: Record<string, unknown> };
        upsert: true;
      };
    }> = [];

    for (let i = 0; i < raw.length; i += 1) {
      const ev = raw[i];
      if (!ev || typeof ev !== 'object' || Array.isArray(ev)) {
        rechazados.push({ i, error: 'evento inválido' });
        continue;
      }
      const row = ev as Record<string, unknown>;
      const pid = String(row.pid || row.patientId || row.personId || auth.user.patientId || '');
      if (!pid) {
        rechazados.push({ i, error: 'falta pid' });
        continue;
      }
      const target = esAdmin ? pid : String(auth.user.patientId || auth.user.id);
      if (!esAdmin && !suyas.has(pid) && target !== pid) {
        rechazados.push({ i, error: 'sin permiso sobre este pid' });
        continue;
      }
      const now = new Date();
      const doc = docPartida(row, target, now);
      const partidaId = String(doc.partidaId);
      ops.push({
        updateOne: {
          filter: { partidaId },
          update: {
            $set: doc,
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      });
      aceptados += 1;
    }

    if (!aceptados) {
      return { ok: false, status: 400, error: 'Ningún evento aceptado.', rechazados };
    }

    await col.bulkWrite(ops, { ordered: false });

    return {
      ok: true,
      status: 200,
      aceptados,
      rechazados: rechazados.slice(0, 50),
    };
  }
}
