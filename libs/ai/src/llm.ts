import { geminiComplete, isGeminiConfigured } from './gemini';
import { openaiComplete, isOpenAIConfigured } from './openai';

export type LlmCompleteOpts = {
  temperature?: number;
  maxTokens?: number;
  system?: string;
};

/** Prefiere Gemini si hay key; si no (o si falla), OpenAI. */
export function isLlmConfigured() {
  return isGeminiConfigured() || isOpenAIConfigured();
}

export async function llmComplete(prompt: string, opts?: LlmCompleteOpts) {
  if (isGeminiConfigured()) {
    try {
      const r = await geminiComplete(prompt, {
        temperature: opts?.temperature,
        maxTokens: opts?.maxTokens,
        system: opts?.system,
      });
      return { ...r, provider: 'gemini' as const };
    } catch (err) {
      if (!isOpenAIConfigured()) throw err;
      const r = await openaiComplete(prompt, opts);
      return { ...r, provider: 'openai' as const };
    }
  }
  if (isOpenAIConfigured()) {
    const r = await openaiComplete(prompt, opts);
    return { ...r, provider: 'openai' as const };
  }
  throw new Error(
    'Falta OPENAI_API_KEY o GEMINI_API_KEY en el entorno de plateado-api.',
  );
}
