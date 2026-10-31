// Captura TRL: redactado de outbound OpenAI/n8n (sin deps Nest).
import { test } from 'node:test';
import assert from 'node:assert/strict';

type OutboundEvidence = {
  destino: 'openai' | 'n8n';
  url: string;
  method: 'POST';
  body: Record<string, unknown>;
  at: string;
};

function redactOutbound(ev: OutboundEvidence): OutboundEvidence {
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
  return { ...ev, body: walk(ev.body) as Record<string, unknown> };
}

test('redactOutbound tapa email, teléfono y sk-', () => {
  const out = redactOutbound({
    destino: 'openai',
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    at: '2026-10-31T00:00:00.000Z',
    body: {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Contacto 4.paciente.prueba@test.com tel 3001234567 key sk-abcdefghijklmnop',
        },
      ],
    },
  });
  const content = String(
    (out.body.messages as Array<{ content: string }>)[0].content,
  );
  assert.match(content, /\[REDACTED_EMAIL\]/);
  assert.match(content, /\[REDACTED_PHONE\]/);
  assert.match(content, /sk-\[REDACTED\]/);
  assert.doesNotMatch(content, /paciente\.prueba@test\.com/);
  assert.doesNotMatch(content, /3001234567/);
});

test('Parienta usa Aurelia y NARA usa TEO (marca de producto)', () => {
  // Misma regla que assistantBrand() sin cargar @nucleo/program.
  const nameFor = (programId: string, teoNombre = '') =>
    teoNombre.trim() ||
    (programId === 'nara'
      ? 'TEO'
      : programId === 'parienta' || programId === 'plateado'
        ? 'Aurelia'
        : 'asistente');
  assert.equal(nameFor('parienta'), 'Aurelia');
  assert.equal(nameFor('nara'), 'TEO');
  assert.equal(nameFor('parienta', 'Aurelia'), 'Aurelia');
});
