// Orden TEJIVA: Gemini primero; OpenAI solo de respaldo.
import { test } from 'node:test';
import assert from 'node:assert/strict';

/** Copia de la preferencia de libs/ai/src/llm.ts (sin deps Nest). */
function pickProvider(hasGemini: boolean, hasOpenAI: boolean): 'gemini' | 'openai' | null {
  if (hasGemini) return 'gemini';
  if (hasOpenAI) return 'openai';
  return null;
}

test('con ambas keys elige Gemini', () => {
  assert.equal(pickProvider(true, true), 'gemini');
});

test('solo OpenAI elige OpenAI', () => {
  assert.equal(pickProvider(false, true), 'openai');
});

test('sin keys no hay proveedor', () => {
  assert.equal(pickProvider(false, false), null);
});
