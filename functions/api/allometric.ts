import {
  calculateAllometricProfile,
  resolveActivityLevel,
} from '../../src/services/allometricService';
import { FitnessGoal } from '../../src/types';
import { badRequest, json } from './shared';

const VALID_GOALS: FitnessGoal[] = [
  'hipertrofia',
  'perdida_grasa',
  'fuerza',
  'resistencia',
  'condicion_general',
];

export async function handle(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  try {
    const body: unknown = await request.json();
    const input = (body ?? {}) as Record<string, unknown>;
    const weight = typeof input.weight === 'number' ? input.weight : Number(input.w);
    if (!Number.isFinite(weight) || weight <= 0) return badRequest('invalid_weight');

    const days = typeof input.days === 'number' ? input.days : 3;
    const goal = VALID_GOALS.includes(input.goal as FitnessGoal)
      ? (input.goal as FitnessGoal)
      : 'hipertrofia';
    const age = typeof input.age === 'number' ? input.age : 28;
    const height = typeof input.height === 'number' ? input.height : 175;
    const gender = typeof input.gender === 'string' ? input.gender : 'Masculino';
    const activityLevel = resolveActivityLevel(days, goal);

    return json({
      profile: calculateAllometricProfile(weight, age, height, gender, activityLevel),
    });
  } catch {
    return badRequest('invalid_json');
  }
}

export const onRequestPost = (context: { request: Request }): Promise<Response> => handle(context.request);

export default {
  fetch: (request: Request): Promise<Response> => handle(request),
};
