import type { Request, Response, NextFunction } from 'express';

/** Log JSON de cada HTTP en el gateway, siempre con programId. */
export function requestLog(req: Request, res: Response, next: NextFunction) {
  const programId = String(process.env.PROGRAM_ID || 'parienta').trim() || 'parienta';
  const started = Date.now();

  res.setHeader('X-Program-Id', programId);

  const clientProgram = String(
    req.headers['x-program-id'] || req.headers['x-nucleo-program'] || '',
  )
    .trim()
    .toLowerCase();

  res.on('finish', () => {
    const path = String(req.originalUrl || req.url || '').slice(0, 300);
    // No spamear health en consola
    if (path === '/api/health' || path.startsWith('/api/health?')) return;

    const row: Record<string, unknown> = {
      kind: 'http',
      programId,
      method: req.method,
      path,
      status: res.statusCode,
      ms: Date.now() - started,
      ip: clientIp(req),
    };
    if (clientProgram) {
      row.clientProgramId = clientProgram;
      if (clientProgram !== programId) row.programMismatch = true;
    }
    console.log(JSON.stringify(row));
  });

  next();
}

function clientIp(req: Request): string | null {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0]!.trim().slice(0, 64);
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).slice(0, 64);
  const ip = req.socket?.remoteAddress;
  return ip ? String(ip).slice(0, 64) : null;
}
