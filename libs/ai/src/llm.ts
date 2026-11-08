import { openaiComplete, isOpenAIConfigured } from './openai';

export type LlmCompleteOpts = {
  temperature?: number;
  maxTokens?: number;
  system?: string;
};

/**
 * TRL6 Quintia: TEJIVA usa solo OpenAI.
 * Gemini no se invoca (aunque exista GEMINI_API_KEY en el entorno).
 */
export function isLlmConfigured() {
  return isOpenAIConfigured();
}

export async function llmComplete(prompt: string, opts?: LlmCompleteOpts) {
  if (!isOpenAIConfigured()) {
    throw new Error('Falta OPENAI_API_KEY en el entorno.');
  }
  const r = await openaiComplete(prompt, opts);
  return { ...r, provider: 'openai' as const };
}
