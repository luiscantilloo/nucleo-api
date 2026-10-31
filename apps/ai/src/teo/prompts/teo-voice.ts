import { assistantBrand } from './assistant-brand';

/** Voz del acompañante del programa actual (Aurelia en Parienta, TEO en NARA). */
export function assistantVoice(): string {
  return assistantBrand().voice;
}

/**
 * Compat: no evaluar en import (getProgram necesita cwd/programs).
 * Preferir assistantVoice().
 */
export const TEO_VOICE = {
  toString() {
    return assistantVoice();
  },
  valueOf() {
    return assistantVoice();
  },
  [Symbol.toPrimitive]() {
    return assistantVoice();
  },
} as unknown as string;
