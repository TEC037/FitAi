/**
 * Provider LLM opcional para el Coach IA (serverless).
 *
 * Sin configuración → devuelve `null` y el handler cae al motor rule-based
 * local (comportamiento idéntico al ciclo anterior). Compatible con endpoints
 * OpenAI-style de chat completions: basta apuntar `COACH_LLM_API_URL` a
 * cualquier implementación (OpenAI, OpenRouter, proxy propio...).
 *
 * Timeout de 6 s: si el LLM falla, se degrada al motor local sin encolar
 * latencia ni coste.
 */

import { CoachContext } from '../../src/ai/coachEngine';

export interface CoachLlmEnv {
  COACH_LLM_API_URL?: string;
  COACH_LLM_API_KEY?: string;
  COACH_LLM_MODEL?: string;
}

const LLM_TIMEOUT_MS = 6000;
const MAX_TOKENS = 220;
const DEFAULT_MODEL = 'gpt-4o-mini';

function buildCoachSystemPrompt(ctx: CoachContext): string {
  return [
    'Eres FitAI Coach, un entrenador personal científico y en español.',
    'Da respuestas breves y específicas, con la seguridad como prioridad.',
    'Contexto del usuario:',
    `- ${ctx.userWeight} kg, ${ctx.daysPerWeek} días/semana, objetivo ${ctx.primaryGoal}, nivel ${ctx.experience}, nombre ${ctx.name}.`,
    'Menciona la ley de Kleiber solo si pregunta por metabolismo o calorías.',
    'NUNCA des diagnóstico médico; ante riesgo, recomienda consultar a un profesional.',
  ].join('\n');
}

export async function fetchLlmReply(
  question: string,
  ctx: CoachContext,
  env?: CoachLlmEnv | null
): Promise<string | null> {
  const url = env?.COACH_LLM_API_URL?.trim();
  const key = env?.COACH_LLM_API_KEY?.trim();
  if (!url || !key) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: env?.COACH_LLM_MODEL?.trim() || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: buildCoachSystemPrompt(ctx) },
          { role: 'user', content: question },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.6,
      }),
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
