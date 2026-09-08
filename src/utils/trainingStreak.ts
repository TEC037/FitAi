import { parseIsoLocal } from './dashboardStats';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface TrainingStreak {
  currentWeeks: number;
  longestWeeks: number;
}

/** Devuelve el inicio de semana (lunes, medianoche local) de una fecha. */
function weekStart(date: Date): Date {
  const start = new Date(date);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Calcula la racha de constancia: semanas consecutivas (desde la semana de
 * `referenceDate` hacia atrás) con al menos una sesión, y la racha más larga
 * histórica. Descarta sesiones futuras respecto a la referencia.
 */
export function computeTrainingStreak(
  sessionDates: string[],
  referenceDate: Date = new Date()
): TrainingStreak {
  const weeks = new Set<number>();
  for (const date of sessionDates) {
    const parsed = parseIsoLocal(date);
    if (!parsed || parsed.getTime() > referenceDate.getTime()) continue;
    weeks.add(weekStart(parsed).getTime());
  }

  const refStart = weekStart(referenceDate).getTime();
  let currentWeeks = 0;
  let cursor = refStart;
  while (weeks.has(cursor)) {
    currentWeeks += 1;
    cursor -= WEEK_MS;
  }

  let longestRun = 0;
  let run = 0;
  let previous = Number.NaN;
  const sorted = [...weeks].sort((a, b) => a - b);
  for (const week of sorted) {
    run = previous === week - WEEK_MS ? run + 1 : 1;
    if (run > longestRun) longestRun = run;
    previous = week;
  }

  return { currentWeeks, longestWeeks: Math.max(longestRun, currentWeeks) };
}