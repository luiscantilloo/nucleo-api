import { PROGRAM_ORG } from './roles';

export type CaregiverInput = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  birthDate?: string;
  age?: number;
  genero?: string;
  estadoCivil?: string;
  estrato?: string;
  place?: string;
};

export function parseCaregiverFlag(raw: unknown): boolean {
  if (raw === true || raw === 1) return true;
  const s = String(raw || '')
    .trim()
    .toLowerCase();
  return s === 'si' || s === 'sí' || s === 'yes' || s === 'true' || s === '1';
}

function ageFromBirth(iso: string, hoy = new Date()): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '').trim());
  if (!m) return 0;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (Number.isNaN(d.getTime())) return 0;
  let age = hoy.getUTCFullYear() - d.getUTCFullYear();
  if (
    hoy.getUTCMonth() < d.getUTCMonth() ||
    (hoy.getUTCMonth() === d.getUTCMonth() && hoy.getUTCDate() < d.getUTCDate())
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function normalizeCaregiverInput(
  body: Record<string, unknown>,
): CaregiverInput | null {
  const nested =
    body.caregiver && typeof body.caregiver === 'object' && !Array.isArray(body.caregiver)
      ? (body.caregiver as Record<string, unknown>)
      : null;
  const firstName = String(
    nested?.firstName || body.caregiverFirstName || '',
  ).trim();
  const lastName = String(
    nested?.lastName || body.caregiverLastName || '',
  ).trim();
  const name =
    [firstName, lastName].filter(Boolean).join(' ') ||
    String(nested?.name || body.caregiverName || body.cuidadorName || '').trim();
  const email = String(
    nested?.email || body.caregiverEmail || body.cuidadorEmail || '',
  )
    .trim()
    .toLowerCase();
  const phone = String(
    nested?.phone || body.caregiverPhone || body.cuidadorPhone || '',
  ).trim();
  const password = String(
    nested?.password || body.caregiverPassword || body.cuidadorPassword || '',
  ).trim();
  const birthDate = String(
    nested?.birthDate || body.caregiverBirthDate || '',
  ).trim();
  const age =
    Number(nested?.age) ||
    Number(body.caregiverAge) ||
    (birthDate ? ageFromBirth(birthDate) : 0);
  const genero = String(nested?.genero || body.caregiverGenero || '').trim();
  const estadoCivil = String(
    nested?.estadoCivil || body.caregiverEstadoCivil || '',
  ).trim();
  const estrato = String(
    nested?.estrato || body.caregiverEstrato || '',
  ).trim();
  const place = String(nested?.place || body.caregiverPlace || '').trim();
  if (!name && !email && !firstName) return null;
  return {
    firstName: firstName || name.split(/\s+/)[0] || '',
    lastName: lastName || name.split(/\s+/).slice(1).join(' ') || '',
    name,
    email,
    phone,
    password,
    birthDate,
    age,
    genero,
    estadoCivil,
    estrato,
    place,
  };
}

/** Documento de cuenta cuidador. Sin `createdAt` (va en $setOnInsert para evitar conflicto). */
export function caregiverAccountDoc(input: {
  id: string;
  name: string;
  email: string;
  phone: string;
  terr: string;
  passwordHash: string;
  now: Date;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  age?: number;
  genero?: string;
  estadoCivil?: string;
  estrato?: string;
  place?: string;
}) {
  return {
    id: input.id,
    name: input.name,
    firstName: input.firstName || '',
    lastName: input.lastName || '',
    email: input.email,
    contact: input.email,
    phone: input.phone,
    birthDate: input.birthDate || '',
    age: input.age || 0,
    genero: input.genero || '',
    estadoCivil: input.estadoCivil || '',
    estrato: input.estrato || '',
    place: input.place || '',
    role: 'Cuidadora / familiar',
    roleId: 'cuidador',
    terr: input.terr || 'Todos',
    org: PROGRAM_ORG,
    status: 'Activo',
    passwordHash: input.passwordHash,
    mustChangePassword: true,
    updatedAt: input.now,
    created: true,
  };
}

/** Edad del cuidador (familiares adultos; no aplica el mínimo 60 de la persona acompañada). */
export function errorEdadCuidador(age: number): string | null {
  if (!(age >= 18 && age <= 110)) {
    return 'La edad del cuidador debe estar entre 18 y 110 años.';
  }
  return null;
}
