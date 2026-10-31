/**
 * Captura temporal del payload saliente a OpenAI/n8n para evidencia TRL.
 * Solo se expone si TRL_CAPTURE_OUTBOUND=1.
 */

export type OutboundEvidence = {
  destino: 'openai' | 'n8n';
  url: string;
  method: 'POST';
  /** Cuerpo enviado (sin API keys). */
  body: Record<string, unknown>;
  at: string;
};

let last: OutboundEvidence | null = null;

export function recordOutbound(ev: Omit<OutboundEvidence, 'at'>) {
  last = { ...ev, at: new Date().toISOString() };
}

/** Devuelve y limpia el último outbound (o null). */
export function takeOutbound(): OutboundEvidence | null {
  const captured = last;
  last = null;
  return captured;
}

export function captureOutboundEnabled() {
  return String(process.env.TRL_CAPTURE_OUTBOUND || '').trim() === '1';
}

/** Redacta correos, teléfonos y posibles secretos en texto anidado. */
export function redactOutbound(ev: OutboundEvidence): OutboundEvidence {
  const scrub = (s: string) =>
    s
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
      .replace(/\b3\d{9}\b/g, '[REDACTED_PHONE]')
      .replace(/\b\d{10,}\b/g, '[REDACTED_NUM]')
      .replace(/(sk-|Bearer\s+)[A-Za-z0-9._-]{8,}/gi, '$1[REDACTED]');
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return scrub(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      const o: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        o[k] = walk(val);
      }
      return o;
    }
    return v;
  };
  return {
    ...ev,
    body: walk(ev.body) as Record<string, unknown>,
  };
}
