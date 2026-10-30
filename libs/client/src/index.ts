/**
 * @nucleo/client — referencia del contrato hacia el núcleo.
 * En plateado-web la implementación runtime está en src/lib/nucleo/client.ts
 * (Turbopack no resuelve bien file: fuera del repo). Mantener ambas alineadas.
 */

export type ApiJson = Record<string, unknown> & {
  ok?: boolean;
  error?: string;
  status?: number;
};

export type PublicProgram = {
  id?: string;
  nombre?: string;
  version?: string;
  marca?: Record<string, unknown>;
  roles?: unknown[];
  herramientas?: unknown[];
  [key: string]: unknown;
};

function resolveApiPath(path: string) {
  if (path.startsWith('/api/')) return path;
  if (path.startsWith('/')) return `/api${path}`;
  return `/api/${path}`;
}

/** fetch hacia `/api/*` (en Next el rewrite apunta al gateway del núcleo). */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers({ Accept: 'application/json' });
  if (init.headers) {
    new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  }
  if (!headers.has('x-program-id')) {
    const pid = String(
      process.env.NEXT_PUBLIC_PROGRAM_ID || process.env.PROGRAM_ID || '',
    )
      .trim()
      .toLowerCase();
    if (pid) headers.set('x-program-id', pid);
  }
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(resolveApiPath(path), {
    ...init,
    credentials: init.credentials ?? 'same-origin',
    headers,
  });
}

export async function apiJson<T extends ApiJson = ApiJson>(
  path: string,
  init: RequestInit = {},
): Promise<{ res: Response; data: T }> {
  const res = await apiFetch(path, init);
  let data = {} as T;
  try {
    data = (await res.json()) as T;
  } catch {
    /* cuerpo vacío o no JSON */
  }
  return { res, data };
}

/** Configuración pública del programa activo en esta instancia del núcleo. */
export async function getProgram() {
  return apiJson<ApiJson & { program?: PublicProgram }>('/api/program');
}

/** Health del gateway (incluye programId). */
export async function getHealth() {
  return apiJson<ApiJson & { service?: string; programId?: string }>('/api/health');
}
