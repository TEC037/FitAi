// Constantes de dominio (FitAI Coach)

// Biomecánica (Jaric / Siff escala 2/3)
export const STRENGTH_REFERENCE_MASS_KG = 70;

// Valores por defecto de sesión
export const DEFAULT_REST_SECONDS = 90;
export const DEFAULT_SUGGESTED_WEIGHT_KG = 60;
export const DEFAULT_REPS = 10;
export const DEFAULT_AVERAGE_RPE = 8;
export const FALLBACK_TOTAL_SETS = 12;
export const FALLBACK_TOTAL_VOLUME_KG = 8400;
export const FRESH_START_COMPLIANCE = 25; // % al completar onboarding
export const MIN_DURATION_REPORT_MIN = 1;

// Rutinas (tiempo por ejercicio y piso estimado)
export const MINUTES_PER_EXERCISE = 10;
export const MIN_ROUTINE_ESTIMATED_MINUTES = 15;

// Cumplimiento semanal
export const COMPLIANCE_INCREMENT_PER_WORKOUT = 10;

// Retroalimentación visual del set completado (ms)
export const JUST_LOGGED_FEEDBACK_MS = 2000;

// Referencias de progreso
export const MAX_WEEKLY_VOLUME_REFERENCE = 13000;

// Coach IA
export const COACH_THINKING_DELAY_MS = 900; // latencia mínima de "pensando"

export const STORAGE_KEYS = {
  USER: 'fitai_user_v1',
  AUTH: 'fitai_auth_v1',
  HISTORY: 'fitai_history_v1',
  SCREEN: 'fitai_screen_v1',
  ROUTINES: 'fitai_routines_v2',
  CHAT: 'fitai_chat_v1',
  WORKOUT: 'fitai_workout_v1',
} as const;
