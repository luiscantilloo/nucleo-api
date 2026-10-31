import { Injectable } from '@nestjs/common';
import { MongoStore } from '@nara/database';
import { SessionService } from '@nara/auth-core';
import {
  llmComplete,
  isLlmConfigured,
  takeOutbound,
  captureOutboundEnabled,
  redactOutbound,
} from '@nara/ai';
import { requireRoles } from '../../shared/require-roles';
import { buildContext } from '../context/context.builder';
import { teoRateLimitError, teoRateLimitOk } from '../rate-limit';
import { assistantBrand, staffAskSystem } from '../prompts/assistant-brand';

/** Saludos / presentación — no pasar por el rechazo de tema. */
function greetingReply(question: string): string | null {
  const brand = assistantBrand();
  const { assistantName, programName } = brand;
  const alias =
    assistantName.toLowerCase() === 'teo'
      ? 'teo|nara'
      : `${assistantName.toLowerCase()}|parienta|teo`;
  const t = question
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[¡!¿?.,;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t || t.length > 56) return null;
  const greeting = new RegExp(
    `^(hola|holi|hey|hi|hello|buenas|buenos dias|buenas tardes|buenas noches|saludos)(\\s+(${alias}))?(\\s+(como estas|que tal|que hay))?$`,
  ).test(t);
  const who = new RegExp(
    `^(quien eres|quien es ${assistantName.toLowerCase()}|quien es teo|quien es aurelia|que eres|que haces|como te llamas|presentate|que puedes hacer|en que me puedes ayudar)$`,
  ).test(t);
  const thanks = /^(gracias|muchas gracias|ok gracias|perfecto gracias)$/.test(
    t,
  );
  if (greeting) {
    return `¡Hola! Soy ${assistantName}. Pregúnteme por captación, personas, rutas, territorios, crisis o lo que necesite del programa.`;
  }
  if (who) {
    return `Soy ${assistantName}, su asistente en ${programName}. Puedo orientarle con los datos del programa: personas, pacientes, territorios, equipos, rutas, crisis y operaciones. ¿Qué necesita?`;
  }
  if (thanks) {
    return 'Con gusto. Cuando quiera, pregunte otra vez.';
  }
  return null;
}

@Injectable()
export class TeoAskService {
  constructor(
    private readonly mongo: MongoStore,
    private readonly sessions: SessionService,
  ) {}

  async ask(data: {
    token: string | null;
    question?: string;
    text?: string;
    role?: string;
  }) {
    const auth = await requireRoles(this.sessions, data.token, [
      'admin',
      'experto',
      'clinico',
      'observador',
      'paciente',
    ]);
    if ('error' in auth) return auth.error;
    if (!teoRateLimitOk(auth.user.id)) return teoRateLimitError(auth.user.id);

    const brand = assistantBrand();
    const question = String(data.question || data.text || '').trim();
    if (!question)
      return { ok: false, status: 400, error: 'Escriba una pregunta.' };

    const hello = greetingReply(question);
    if (hello) {
      return {
        ok: true,
        status: 200,
        text: hello,
        model: 'local',
        provider: 'teo',
        assistant: brand.assistantName,
        program: brand.programName,
      };
    }

    if (!isLlmConfigured()) {
      return {
        ok: false,
        status: 503,
        error: `${brand.assistantName} aún no está configurado. Agregue OPENAI_API_KEY (o GEMINI_API_KEY) y reinicie el servicio ai.`,
      };
    }

    try {
      const context = await buildContext(
        this.mongo,
        auth.user.roleId,
        question,
        auth.user.id,
      );
      const prompt = `CONTEXTO DEL PROGRAMA (use solo esto; no mencione sistemas técnicos):
${context}

PREGUNTA de ${auth.user.role || auth.user.roleId}:
${question}

Responda como ${brand.assistantName} de ${brand.programName}: natural, coherente, con los datos del contexto. Sin jerga técnica. No diga que es TEO ni el asistente de NARA salvo que el programa sea NARA.`;
      const { text, model, provider } = await llmComplete(prompt, {
        system: staffAskSystem(brand),
        temperature: 0.4,
        maxTokens: 2200,
      });
      const clean = text
        .replace(
          /\b(en la base( de datos)?|en la base de datos|MongoDB|Mongo|API|colección|query)\b/gi,
          '',
        )
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+([.,;:])/g, '$1')
        .trim();
      const out: Record<string, unknown> = {
        ok: true,
        status: 200,
        text: clean || text,
        model,
        provider,
        assistant: brand.assistantName,
        program: brand.programName,
      };
      if (captureOutboundEnabled()) {
        const raw = takeOutbound();
        if (raw) out.outbound = redactOutbound(raw);
      }
      return out;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error en ${brand.assistantName}`;
      return {
        ok: false,
        status: 503,
        error: message.includes('saturado')
          ? message
          : `No pude consultar al modelo ahora: ${message}. Intente de nuevo en unos segundos.`,
      };
    }
  }
}
