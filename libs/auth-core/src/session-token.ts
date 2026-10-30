import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE = 'nara_sid';
// H-016 / T-04: 12 h. Son datos de salud mental; una sesión olvidada en un equipo compartido no debe durar días.
export const SESSION_MAX_AGE_SEC = 60 * 60 * 12;

function secret() {
  const program = currentProgramId();
  const byProgram =
    program === 'nara'
      ? process.env.NARA_AUTH_SECRET
      : program === 'parienta' || program === 'plateado'
        ? process.env.PARIENTA_AUTH_SECRET || process.env.PLATEADO_AUTH_SECRET
        : undefined;
  const s =
    process.env.AUTH_SECRET ||
    byProgram ||
    process.env.NARA_AUTH_SECRET ||
    process.env.PARIENTA_AUTH_SECRET ||
    process.env.PLATEADO_AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production')
      throw new Error(
        'Falta AUTH_SECRET (o NARA_AUTH_SECRET / PARIENTA_AUTH_SECRET)',
      );
    return 'nara-dev-auth-secret-change-me';
  }
  return s;
}

/** Tokens de 3 partes solo en desarrollo, o si AUTH_ALLOW_LEGACY_TOKENS=1. */
function allowLegacyTokens() {
  if (process.env.AUTH_ALLOW_LEGACY_TOKENS === '1') return true;
  if (process.env.AUTH_ALLOW_LEGACY_TOKENS === '0') return false;
  return process.env.NODE_ENV !== 'production';
}

function currentProgramId() {
  return String(process.env.PROGRAM_ID || 'parienta').trim() || 'parienta';
}

/**
 * Token de sesión.
 * Formato actual: accountId.exp.programId.sig
 * Formato legado (3 partes): accountId.exp.sig — solo en desarrollo o con AUTH_ALLOW_LEGACY_TOKENS=1.
 */
export function signSessionToken(
  accountId: string,
  maxAgeSec = SESSION_MAX_AGE_SEC,
  programId = currentProgramId(),
) {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const prog = String(programId || '').trim() || currentProgramId();
  const payload = `${accountId}.${exp}.${prog}`;
  const sig = createHmac('sha256', secret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(
  token: string | null | undefined,
): string | null {
  const parsed = parseSessionToken(token);
  return parsed?.accountId ?? null;
}

/** Verifica firma/expiración y que el programId del token coincida con el de esta instancia. */
export function parseSessionToken(
  token: string | null | undefined,
): { accountId: string; programId: string; exp: number } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3 && parts.length !== 4) return null;

  let accountId: string;
  let expStr: string;
  let programId: string;
  let sig: string;

  if (parts.length === 3) {
    if (!allowLegacyTokens()) return null;
    [accountId, expStr, sig] = parts as [string, string, string];
    programId = currentProgramId();
  } else {
    [accountId, expStr, programId, sig] = parts as [string, string, string, string];
  }

  if (!accountId || !expStr || !sig || !programId) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;

  const payload =
    parts.length === 3
      ? `${accountId}.${expStr}`
      : `${accountId}.${expStr}.${programId}`;
  const expected = createHmac('sha256', secret())
    .update(payload)
    .digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  if (programId !== currentProgramId()) return null;
  return { accountId, programId, exp };
}

/** Momento de emisión (segundos) de un token válido; null si no es válido. */
export function sessionIssuedAt(token: string | null | undefined): number | null {
  const parsed = parseSessionToken(token);
  if (!parsed) return null;
  return parsed.exp - SESSION_MAX_AGE_SEC;
}
