// Encabezado x-nara-secret solo si N8N_WEBHOOK_SECRET está definido.
import { test } from 'node:test';
import assert from 'node:assert/strict';

/** Copia de la lógica de libs/ai/src/n8n-teo.ts (sin deps Nest) para node --test. */
function n8nTeoHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const secret = String(process.env.N8N_WEBHOOK_SECRET || '').trim();
  if (secret) {
    headers['x-nara-secret'] = secret;
  }
  return headers;
}

/** Misma regla que callN8nTeo: sin URL en env → no hay llamada. */
function n8nTeoUrl(): string {
  return String(process.env.N8N_TEO_WEBHOOK || '').trim();
}

test('sin secreto no envía x-nara-secret', () => {
  const prev = process.env.N8N_WEBHOOK_SECRET;
  delete process.env.N8N_WEBHOOK_SECRET;
  try {
    const h = n8nTeoHeaders();
    assert.equal(h['x-nara-secret'], undefined);
  } finally {
    if (prev === undefined) delete process.env.N8N_WEBHOOK_SECRET;
    else process.env.N8N_WEBHOOK_SECRET = prev;
  }
});

test('con secreto envía x-nara-secret', () => {
  const prev = process.env.N8N_WEBHOOK_SECRET;
  process.env.N8N_WEBHOOK_SECRET = 'test-secret-not-real';
  try {
    const h = n8nTeoHeaders();
    assert.equal(h['x-nara-secret'], 'test-secret-not-real');
  } finally {
    if (prev === undefined) delete process.env.N8N_WEBHOOK_SECRET;
    else process.env.N8N_WEBHOOK_SECRET = prev;
  }
});

test('sin N8N_TEO_WEBHOOK no hay URL (n8n apagado)', () => {
  const prev = process.env.N8N_TEO_WEBHOOK;
  delete process.env.N8N_TEO_WEBHOOK;
  try {
    assert.equal(n8nTeoUrl(), '');
  } finally {
    if (prev === undefined) delete process.env.N8N_TEO_WEBHOOK;
    else process.env.N8N_TEO_WEBHOOK = prev;
  }
});

test('N8N_TEO_WEBHOOK vacío o solo espacios → sin URL', () => {
  const prev = process.env.N8N_TEO_WEBHOOK;
  process.env.N8N_TEO_WEBHOOK = '   ';
  try {
    assert.equal(n8nTeoUrl(), '');
  } finally {
    if (prev === undefined) delete process.env.N8N_TEO_WEBHOOK;
    else process.env.N8N_TEO_WEBHOOK = prev;
  }
});
