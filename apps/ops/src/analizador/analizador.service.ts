import { Injectable } from '@nestjs/common';
import { APP_STATE_KEY, isGestorRoleId, pickAppStateSlices } from '@nara/common';
import { MongoStore } from '@nara/database';
import { SessionService } from '@nara/auth-core';
import { requireRoles } from '../shared/require-roles';
import { idsDelTerritorio, type PolicyUser } from '../app-state/app-state.policy';

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
  constructor(
    private readonly mongo: MongoStore,
    private readonly sessions: SessionService,
  ) {}

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
   * Cuerpo: `{ eventos: [ { pid, id, game, startedAt|inicio, finishedAt|fin, ... } ] }`
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
    const existing = await db.collection('program_settings').findOne({ key: APP_STATE_KEY });
    const prevLogs = esMapa(existing?.gameLogs)
      ? { ...(existing!.gameLogs as Record<string, unknown>) }
      : {};

    let aceptados = 0;
    const rechazados: Array<{ i: number; error: string }> = [];

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
      if (!esAdmin && !suyas.has(pid) && !suyas.has(String(auth.user.id))) {
        // paciente solo escribe su historial
        if (!suyas.has(pid)) {
          rechazados.push({ i, error: 'sin permiso sobre este pid' });
          continue;
        }
      }
      const writePid = esAdmin ? pid : String(auth.user.patientId || auth.user.id);
      if (!esAdmin && writePid !== pid && !suyas.has(pid)) {
        rechazados.push({ i, error: 'pid ajeno' });
        continue;
      }
      const target = esAdmin ? pid : String(auth.user.patientId || auth.user.id);
      const inicio = Number(row.startedAt ?? row.inicio ?? row.at) || Date.now();
      const fin = Number(row.finishedAt ?? row.fin ?? row.completedAt) || inicio;
      const id = String(row.id || `EVT-${target}-${inicio}`);
      const entry = {
        ...row,
        id,
        pid: target,
        type: row.type || 'juego',
        k: row.k || 'juego',
        game: row.game || 'sudoku',
        status: row.status || (row.completo === false ? 'abandoned' : 'done'),
        startedAt: inicio,
        inicio,
        finishedAt: fin,
        fin,
        durationMs: Number(row.durationMs ?? row.durMs) || Math.max(0, fin - inicio),
        source: row.source || 'eventos.lote',
      };
      const prev = Array.isArray(prevLogs[target]) ? [...(prevLogs[target] as unknown[])] : [];
      const idx = prev.findIndex(
        (x) => x && typeof x === 'object' && String((x as { id?: unknown }).id || '') === id,
      );
      if (idx >= 0) prev[idx] = entry;
      else prev.push(entry);
      prevLogs[target] = prev;
      aceptados += 1;
    }

    if (!aceptados) {
      return { ok: false, status: 400, error: 'Ningún evento aceptado.', rechazados };
    }

    const now = new Date();
    await db.collection('program_settings').updateOne(
      { key: APP_STATE_KEY },
      {
        $set: { gameLogs: prevLogs, key: APP_STATE_KEY, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    return {
      ok: true,
      status: 200,
      aceptados,
      rechazados: rechazados.slice(0, 50),
    };
  }
}
