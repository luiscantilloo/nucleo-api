import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { ProgramConfig, ProgramCrisis, ProgramRole } from './types';

const FALLBACK_ROLES: ProgramRole[] = [
  { id: 'admin', nombre: 'Administrador' },
  { id: 'gestor', nombre: 'Gestor de campo', base: 'experto' },
  { id: 'clinico', nombre: 'Clínica' },
  { id: 'observador', nombre: 'Observador' },
  { id: 'persona', nombre: 'Persona acompañada', base: 'paciente' },
  { id: 'cuidador', nombre: 'Cuidadora / familiar' },
];

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function readText(path: string): string {
  return readFileSync(path, 'utf8');
}

/** Parsea el bloque `roles:` de program.yaml (YAML mínimo, sin dependencia). */
function parseRolesFromYaml(raw: string): ProgramRole[] {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((l) => /^roles:\s*$/.test(l));
  if (start < 0) return [];
  const roles: ProgramRole[] = [];
  let current: ProgramRole | null = null;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^[a-zA-Z_]/.test(line) && !/^\s/.test(line)) break;
    const idM = line.match(/^\s+-\s+id:\s*(.+)\s*$/);
    if (idM) {
      if (current) roles.push(current);
      current = { id: idM[1]!.trim(), nombre: idM[1]!.trim() };
      continue;
    }
    if (!current) continue;
    const nombreM = line.match(/^\s+nombre:\s*(.+)\s*$/);
    if (nombreM) {
      current.nombre = nombreM[1]!.trim();
      continue;
    }
    const baseM = line.match(/^\s+base:\s*(.+)\s*$/);
    if (baseM) {
      current.base = baseM[1]!.trim();
      continue;
    }
    const veM = line.match(/^\s+ve:\s*\[([^\]]*)\]\s*$/);
    if (veM) {
      current.ve = veM[1]!
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      continue;
    }
    const noVeM = line.match(/^\s+no_ve:\s*\[([^\]]*)\]\s*$/);
    if (noVeM) {
      current.no_ve = noVeM[1]!
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    }
  }
  if (current) roles.push(current);
  return roles;
}

/** Carga programs/${PROGRAM_ID}/. Si falta o es inválido, lanza (el proceso no debe arrancar a ciegas). */
export function loadProgram(programId = process.env.PROGRAM_ID || 'parienta'): ProgramConfig {
  const id = String(programId || '').trim() || 'parienta';
  const rootDir = join(process.cwd(), 'programs', id);
  if (!existsSync(join(rootDir, 'crisis.json'))) {
    throw new Error(
      `[program] No se encontró programs/${id}/crisis.json (cwd=${process.cwd()}). Defina PROGRAM_ID y ejecute desde la raíz del repo.`,
    );
  }

  const crisis = readJson<ProgramCrisis>(join(rootDir, 'crisis.json'));
  if (!crisis?.categorias || !crisis?.bloqueadas) {
    throw new Error(`[program] crisis.json de ${id} es inválido.`);
  }

  const programMetaPath = join(rootDir, 'program.yaml');
  let nombre = id;
  let version = '0.0.0';
  let roles: ProgramRole[] = FALLBACK_ROLES.map((r) => ({ ...r }));
  if (existsSync(programMetaPath)) {
    const raw = readText(programMetaPath);
    const mName = raw.match(/^nombre:\s*(.+)$/m);
    const mVer = raw.match(/^version:\s*(.+)$/m);
    if (mName) nombre = mName[1]!.trim();
    if (mVer) version = mVer[1]!.trim();
    const parsed = parseRolesFromYaml(raw);
    if (parsed.length) roles = parsed;
  }

  const instrumentosDir = join(rootDir, 'instrumentos');
  const instrumentos: Record<string, unknown> = {};
  if (existsSync(instrumentosDir)) {
    for (const f of readdirSync(instrumentosDir)) {
      if (!f.endsWith('.json')) continue;
      const key = f.replace(/\.json$/, '');
      instrumentos[key] = readJson(join(instrumentosDir, f));
    }
  }

  const promptPath = join(rootDir, 'prompts', 'teo.md');
  const textosPath = join(rootDir, 'textos', 'es.json');

  return {
    id,
    nombre,
    version,
    crisis,
    roles,
    perfiles: existsSync(join(rootDir, 'perfiles.json'))
      ? readJson(join(rootDir, 'perfiles.json'))
      : {},
    rutas: existsSync(join(rootDir, 'rutas.json'))
      ? readJson(join(rootDir, 'rutas.json'))
      : {},
    servicios: existsSync(join(rootDir, 'servicios.json'))
      ? readJson(join(rootDir, 'servicios.json'))
      : {},
    marca: existsSync(join(rootDir, 'marca.json'))
      ? readJson(join(rootDir, 'marca.json'))
      : {},
    textos: existsSync(textosPath) ? readJson(textosPath) : {},
    instrumentos,
    promptTeo: existsSync(promptPath) ? readText(promptPath) : '',
    rootDir,
  };
}

let cached: ProgramConfig | null = null;

export function getProgram(): ProgramConfig {
  if (!cached) cached = loadProgram();
  return cached;
}

export function resetProgramCache(): void {
  cached = null;
}

/** Parte pública para GET /api/program: marca/textos/roles visibles; sin instrumentos ni perfiles clínicos. */
export function publicProgramView(p: ProgramConfig = getProgram()) {
  return {
    id: p.id,
    nombre: p.nombre,
    version: p.version,
    marca: p.marca,
    textos: p.textos,
    roles: p.roles.map(({ id, nombre, base }) => ({
      id,
      nombre,
      ...(base ? { base } : {}),
    })),
    accountRoleLabels: p.roles.map((r) => r.nombre),
    herramientas: ['app', 'whatsapp', 'voz', 'llamada', 'impreso'],
  };
}
