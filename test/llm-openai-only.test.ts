// TRL6: llmComplete solo OpenAI; Gemini no se usa.
import { test } from 'node:test';
import assert from 'node:assert/strict';

/** Misma regla que libs/ai/src/llm.ts (sin deps Nest). */
function pickProvider(hasOpenAI: boolean, hasGemini: boolean): 'openai' | null {
  void hasGemini; // ignorado a propósito
  if (hasOpenAI) return 'openai';
  return null;
}

test('con OpenAI y Gemini elige solo OpenAI', () => {
  assert.equal(pickProvider(true, true), 'openai');
});

test('sin OpenAI no hay proveedor aunque haya Gemini', () => {
  assert.equal(pickProvider(false, true), null);
});

test('sin keys no hay proveedor', () => {
  assert.equal(pickProvider(false, false), null);
});
