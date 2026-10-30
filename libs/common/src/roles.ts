/**
 * Catálogo de roles Parienta (programa id técnico: plateado).
 * Los ids `experto` / `paciente` se conservan como base operativa (permisos, rutas
 * heredadas); las etiquetas visibles son las de Parienta. `gestor` / `persona` son
 * alias de configuración (program.yaml) que resuelven a esa base.
 */

export const PROGRAM_ORG = 'Programa Parienta';

export const NARA_ROLES = [
  {
    id: 'admin',
    slug: 'admin',
    name: 'Administrador',
    href: '/inicio',
    nk: 'admin',
  },
  {
    id: 'experto',
    slug: 'experto',
    name: 'Gestor de campo',
    href: '/experto',
    nk: null,
  },
  {
    id: 'gestor',
    slug: 'gestor',
    name: 'Gestor de campo',
    href: '/experto',
    nk: null,
    base: 'experto',
  },
  {
    id: 'clinico',
    slug: 'clinico',
    name: 'Clínica',
    href: '/clinico',
    nk: 'clin',
  },
  {
    id: 'paciente',
    slug: 'paciente',
    name: 'Persona acompañada',
    href: '/paciente',
    nk: null,
  },
  {
    id: 'persona',
    slug: 'persona',
    name: 'Persona acompañada',
    href: '/paciente',
    nk: null,
    base: 'paciente',
  },
  {
    id: 'observador',
    slug: 'observador',
    name: 'Observador',
    href: '/observador',
    nk: null,
  },
  {
    id: 'cuidador',
    slug: 'cuidador',
    name: 'Cuidadora / familiar',
    href: '/cuidador',
    nk: null,
  },
] as const;

/** Roles que el admin puede asignar al crear cuentas (sin aliases internos).
 *  Cuidador no se crea aquí: solo desde la ficha de persona acompañada. */
export const ACCOUNT_ROLE_LABELS = [
  'Administrador',
  'Gestor de campo',
  'Clínica',
  'Observador',
  'Persona acompañada',
] as const;

export type NaraRoleId = (typeof NARA_ROLES)[number]['id'];

export const ROLE_LABEL_TO_ID: Record<string, NaraRoleId> = {
  Administrador: 'admin',
  Administradora: 'admin',
  'Gestor de campo': 'experto',
  Gestor: 'experto',
  'Experto de campo': 'experto',
  'Experta de campo': 'experto',
  Clínico: 'clinico',
  Clínica: 'clinico',
  Observador: 'observador',
  'Persona acompañada': 'paciente',
  Persona: 'paciente',
  Paciente: 'paciente',
  'Cuidadora / familiar': 'cuidador',
  Cuidadora: 'cuidador',
  Cuidador: 'cuidador',
};

/** Roles públicos del programa (sin aliases internos experto/paciente). */
const PUBLIC_ROLE_IDS = [
  'admin',
  'gestor',
  'clinico',
  'observador',
  'persona',
  'cuidador',
] as const;

export const PROGRAM_PUBLIC_ROLES = PUBLIC_ROLE_IDS.map(
  (id) => NARA_ROLES.find((r) => r.id === id)!,
);

export const PATIENT_MODULE_IDS = [
  'mood',
  'ia',
  'videos',
  'wa',
  'call',
  'group',
  'social',
  'clin',
  'bracelet',
  'hist',
  'juegos',
] as const;

export type PatientModuleId = (typeof PATIENT_MODULE_IDS)[number];

/** Servicios de ruta activos por defecto en la app de la persona. */
export const DEFAULT_PATIENT_MODULES: PatientModuleId[] = [
  'mood',
  'clin',
  'ia',
  'juegos',
];

const ALLOWED_MODULES = new Set<string>(PATIENT_MODULE_IDS);

export function normalizeModuleIds(
  raw: unknown,
  fallback: readonly PatientModuleId[] = DEFAULT_PATIENT_MODULES,
): PatientModuleId[] {
  if (!Array.isArray(raw)) return fallback.slice();
  const out = raw
    .map(String)
    .filter((id): id is PatientModuleId => ALLOWED_MODULES.has(id));
  return Array.from(new Set(out));
}

/** Resuelve alias de config (gestor/persona) a la base operativa. */
export function baseRoleId(roleId?: string | null): string {
  if (!roleId) return '';
  const role = NARA_ROLES.find((r) => r.id === roleId);
  if (role && 'base' in role && typeof role.base === 'string') return role.base;
  return roleId;
}

/** ¿El roleId del usuario cubre alguno de los roles permitidos (incluye base/alias)? */
export function roleAllowed(roleId: string, allowed: readonly string[]): boolean {
  if (!allowed.length) return true;
  if (allowed.includes(roleId)) return true;
  const base = baseRoleId(roleId);
  if (base && allowed.includes(base)) return true;
  // Cuentas antiguas / alias inverso
  if (roleId === 'experto' && (allowed.includes('gestor') || allowed.includes('experto')))
    return true;
  if (roleId === 'paciente' && (allowed.includes('persona') || allowed.includes('paciente')))
    return true;
  if (roleId === 'gestor' && allowed.includes('experto')) return true;
  if (roleId === 'persona' && allowed.includes('paciente')) return true;
  return false;
}

export function isGestorRoleId(roleId?: string | null) {
  const b = baseRoleId(roleId);
  return b === 'experto' || roleId === 'gestor' || roleId === 'experto';
}

export function isPersonaRoleId(roleId?: string | null) {
  const b = baseRoleId(roleId);
  return b === 'paciente' || roleId === 'persona' || roleId === 'paciente';
}

export function hrefForRoleId(roleId?: string | null) {
  const id = roleId || '';
  const direct = NARA_ROLES.find((r) => r.id === id);
  if (direct) return direct.href;
  const base = baseRoleId(id);
  return NARA_ROLES.find((r) => r.id === base)?.href || '/ingreso';
}

export function resolveNotifKey(
  roleId: string | null | undefined,
  accountId: string,
) {
  const id = baseRoleId(roleId) || roleId;
  const role = NARA_ROLES.find((r) => r.id === id) || NARA_ROLES.find((r) => r.id === roleId);
  if (!role) return accountId;
  if (role.nk) return role.nk;
  return accountId;
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  terr: string;
  org: string;
  contact: string;
  status: string;
  href: string;
  nk: string | null;
  patientId?: string;
  /** SPEC-01: true hasta que la persona cree su clave nueva. */
  mustChangePassword?: boolean;
  /** @deprecated Observador ya no usa tipos; se ignora al guardar. */
  orgType?: string;
  modules?: string[];
};
