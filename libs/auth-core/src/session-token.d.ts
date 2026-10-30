export declare const SESSION_COOKIE = "nara_sid";
export declare const SESSION_MAX_AGE_SEC: number;
export declare function signSessionToken(
  accountId: string,
  maxAgeSec?: number,
  programId?: string,
): string;
export declare function verifySessionToken(
  token: string | null | undefined,
): string | null;
export declare function parseSessionToken(
  token: string | null | undefined,
): { accountId: string; programId: string; exp: number } | null;
export declare function sessionIssuedAt(
  token: string | null | undefined,
): number | null;
