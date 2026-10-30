import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CrisisCategoria, ProgramCrisis } from './types';

export type { ProgramCrisis };

const norm = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export type CrisisHit = {
  categoria: string;
  frase: string | null;
  evento?: string;
};

function loadCrisisFromDisk(): ProgramCrisis {
  const id = process.env.PROGRAM_ID || 'parienta';
  const path = join(process.cwd(), 'programs', id, 'crisis.json');
  if (!existsSync(path)) {
    throw new Error(`[crisis] No se encontró ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as ProgramCrisis;
}

function crisisCfg(override?: ProgramCrisis): ProgramCrisis {
  return override || loadCrisisFromDisk();
}

/** Detector único del núcleo: frases por categoría del programa + AYUDA. */
export function detectarCrisis(
  text: string,
  opts?: { evento?: string; crisis?: ProgramCrisis },
): CrisisHit | null {
  const crisis = crisisCfg(opts?.crisis);
  if (opts?.evento) {
    for (const [cat, conf] of Object.entries(crisis.categorias) as [string, CrisisCategoria][]) {
      if ((conf.eventos || []).includes(opts.evento)) {
        return { categoria: cat, frase: null, evento: opts.evento };
      }
    }
  }
  const n = norm(String(text || ''));
  if (!n.trim()) return null;
  if (/^\s*ayuda\s*!*$/.test(n)) {
    return { categoria: 'riesgo_suicida', frase: 'AYUDA' };
  }
  for (const [cat, conf] of Object.entries(crisis.categorias) as [string, CrisisCategoria][]) {
    for (const frase of conf.frases || []) {
      if (n.includes(norm(frase))) {
        return { categoria: cat, frase };
      }
    }
  }
  return null;
}

/** Compatibilidad con el chequeo previo de NARA (término o null). */
export function crisisCheck(text: string, crisis?: ProgramCrisis): string | null {
  const hit = detectarCrisis(text, crisis ? { crisis } : undefined);
  return hit?.frase || (hit ? hit.categoria : null);
}

export function esRespuestaCrisis(text: string): boolean {
  return /^\W*crisis\W*$/i.test(String(text || '').trim());
}

export function textoDeCrisis(
  nombre: string,
  categoria = 'riesgo_suicida',
  crisis?: ProgramCrisis,
): string {
  const cfg = crisisCfg(crisis);
  const plantilla =
    cfg.texto[categoria] ||
    cfg.texto.riesgo_suicida ||
    '{trato}, gracias por decírmelo. Si está en peligro, llame al 123.';
  return plantilla.replace(/\{trato\}/g, nombre);
}

/** Regla bloqueada: respuesta estructurada de ideación > 0. */
export function crisisPorIdeacion(valor: number): CrisisHit | null {
  if (!(Number(valor) > 0)) return null;
  return { categoria: 'riesgo_suicida', frase: 'ideacion>0' };
}
