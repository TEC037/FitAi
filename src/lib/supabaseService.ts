import { supabase } from './supabaseClient';
import {
  ChatMessage,
  DailyRoutine,
  PersonalRecord,
  UserProfile,
  WorkoutSessionLog,
} from '../types';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../config/constants';
import { INITIAL_USER } from '../data/mockUser';
import { MOCK_ROUTINES } from '../data/mockRoutines';
import { INITIAL_CHAT_MESSAGES } from '../data/mockCoach';
import { MOCK_HISTORY, MOCK_PRS, MOCK_WEIGHT_HISTORY } from '../data/mockProgress';

export interface HydratedData {
  profile: UserProfile | null;
  routines: DailyRoutine[];
  history: WorkoutSessionLog[];
  personalRecords: PersonalRecord[];
  weightHistory: { date: string; weight: number }[];
  chatMessages: ChatMessage[];
}

// ---------- Mappers ----------

function profileRowToUser(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? INITIAL_USER.name),
    email: String(row.email ?? ''),
    age: Number(row.age ?? INITIAL_USER.age),
    gender: row.gender ? String(row.gender) : INITIAL_USER.gender,
    height: Number(row.height ?? INITIAL_USER.height),
    weight: Number(row.weight ?? INITIAL_USER.weight),
    experience: (row.experience as UserProfile['experience']) || INITIAL_USER.experience,
    daysPerWeek: Number(row.days_per_week ?? INITIAL_USER.daysPerWeek),
    avgDuration: Number(row.avg_duration ?? INITIAL_USER.avgDuration),
    primaryGoal: (row.primary_goal as UserProfile['primaryGoal']) || INITIAL_USER.primaryGoal,
    targetMuscles: (row.target_muscles as string[]) || INITIAL_USER.targetMuscles,
    equipment: (row.equipment as string[]) || INITIAL_USER.equipment,
    injuries: String(row.injuries ?? ''),
    weeklyCompliance: Number(row.weekly_compliance ?? INITIAL_USER.weeklyCompliance),
    unitSystem: (row.unit_system as 'metric' | 'imperial') || 'metric',
    notifications: (row.notifications as UserProfile['notifications']) ||
      INITIAL_USER.notifications,
  };
}

function userToProfileRow(user: UserProfile) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    gender: user.gender,
    height: user.height,
    weight: user.weight,
    experience: user.experience,
    days_per_week: user.daysPerWeek,
    avg_duration: user.avgDuration,
    primary_goal: user.primaryGoal,
    target_muscles: user.targetMuscles,
    equipment: user.equipment,
    injuries: user.injuries,
    weekly_compliance: user.weeklyCompliance,
    unit_system: user.unitSystem,
    notifications: user.notifications,
  };
}

function routineRowToRoutine(row: Record<string, unknown>): DailyRoutine {
  return {
    dayNumber: Number(row.day_number ?? 1),
    name: String(row.name ?? ''),
    focus: String(row.focus ?? ''),
    description: String(row.description ?? ''),
    estimatedMinutes: Number(row.estimated_minutes ?? 0),
    difficulty: (row.difficulty as DailyRoutine['difficulty']) || 'principiante',
    targetMuscles: (row.target_muscles as string[]) || [],
    exercises: (row.exercises as DailyRoutine['exercises']) || [],
    isRestDay: Boolean(row.is_rest_day),
  };
}

function routineToRow(userId: string, r: DailyRoutine, position: number) {
  return {
    user_id: userId,
    day_number: r.dayNumber,
    name: r.name,
    focus: r.focus,
    description: r.description,
    estimated_minutes: r.estimatedMinutes,
    difficulty: r.difficulty,
    target_muscles: r.targetMuscles,
    exercises: r.exercises,
    is_rest_day: r.isRestDay ?? false,
    position,
  };
}

function sessionToRow(userId: string, s: WorkoutSessionLog) {
  return {
    id: s.id,
    user_id: userId,
    date: s.date,
    routine_name: s.routineName,
    duration_minutes: s.durationMinutes,
    total_volume_kg: s.totalVolumeKg,
    exercises_completed: s.exercisesCompleted,
    total_sets: s.totalSets,
    average_rpe: s.averageRpe,
    calories_burned: s.caloriesBurned,
    average_heart_rate: s.averageHeartRate ?? null,
    peak_heart_rate: s.peakHeartRate ?? null,
    allometric_power_watts: s.allometricPowerWatts ?? null,
    allometric_calories: s.allometricCalories ?? null,
    user_observations: s.userObservations,
    ai_coach_feedback: s.aiCoachFeedback,
    completed_sets: s.completedSets,
  };
}

function rowToSession(row: Record<string, unknown>): WorkoutSessionLog {
  return {
    id: String(row.id ?? ''),
    date: String(row.date ?? ''),
    routineName: String(row.routine_name ?? ''),
    durationMinutes: Number(row.duration_minutes ?? 0),
    totalVolumeKg: Number(row.total_volume_kg ?? 0),
    exercisesCompleted: Number(row.exercises_completed ?? 0),
    totalSets: Number(row.total_sets ?? 0),
    averageRpe: Number(row.average_rpe ?? 0),
    caloriesBurned: Number(row.calories_burned ?? 0),
    averageHeartRate: row.average_heart_rate != null ? Number(row.average_heart_rate) : undefined,
    peakHeartRate: row.peak_heart_rate != null ? Number(row.peak_heart_rate) : undefined,
    allometricPowerWatts:
      row.allometric_power_watts != null ? Number(row.allometric_power_watts) : undefined,
    allometricCalories:
      row.allometric_calories != null ? Number(row.allometric_calories) : undefined,
    userObservations: String(row.user_observations ?? ''),
    aiCoachFeedback: String(row.ai_coach_feedback ?? ''),
    completedSets: (row.completed_sets as WorkoutSessionLog['completedSets']) || [],
  };
}

function prToRow(userId: string, pr: PersonalRecord) {
  return {
    id: pr.id,
    user_id: userId,
    exercise_name: pr.exerciseName,
    record_value: pr.recordValue,
    date: pr.date,
    category: pr.category,
    previous_value: pr.previousValue,
    progress_percent: pr.progressPercent,
    allometric_score: pr.allometricScore ?? null,
    normalized_70kg_load: pr.normalized70kgLoad ?? null,
  };
}

function rowToPr(row: Record<string, unknown>): PersonalRecord {
  return {
    id: String(row.id ?? ''),
    exerciseName: String(row.exercise_name ?? ''),
    recordValue: String(row.record_value ?? ''),
    date: String(row.date ?? ''),
    category: String(row.category ?? ''),
    previousValue: String(row.previous_value ?? ''),
    progressPercent: Number(row.progress_percent ?? 0),
    allometricScore: row.allometric_score != null ? Number(row.allometric_score) : undefined,
    normalized70kgLoad:
      row.normalized_70kg_load != null ? Number(row.normalized_70kg_load) : undefined,
  };
}

function chatToRow(userId: string, m: ChatMessage) {
  return {
    id: m.id,
    user_id: userId,
    sender: m.sender,
    text: m.text,
    timestamp: m.timestamp,
    category: m.category ?? null,
    source: m.source ?? null,
    suggested_action: m.suggestedAction ?? null,
  };
}

function rowToChat(row: Record<string, unknown>): ChatMessage {
  const suggested = row.suggested_action as ChatMessage['suggestedAction'] | null;
  return {
    id: String(row.id ?? ''),
    sender: (row.sender as ChatMessage['sender']) || 'coach',
    text: String(row.text ?? ''),
    timestamp: String(row.timestamp ?? ''),
    category: (row.category as ChatMessage['category']) || undefined,
    source: (row.source as ChatMessage['source']) || undefined,
    suggestedAction: suggested ?? undefined,
  };
}

function weightToRow(userId: string, w: { date: string; weight: number }) {
  return { user_id: userId, date: w.date, weight: w.weight };
}

// ---------- Auth ----------

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) return { error: 'Supabase no configurado' };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { userId: data.user?.id ?? null, error: error?.message ?? null };
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  if (!supabase) return { error: 'Supabase no configurado' };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: window.location.origin },
  });
  return {
    userId: data.user?.id ?? null,
    session: data.session,
    error: error?.message ?? null,
  };
}

export async function signInDemo() {
  if (!supabase) return { error: 'Supabase no configurado' };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (!error && data.user) {
    return { userId: data.user.id, error: null };
  }

  // La cuenta demo aún no existe: créala y reintenta.
  if (error?.message?.toLowerCase().includes('invalid login credentials')) {
    const { error: signUpError } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: { data: { name: 'Carlos Ramírez' } },
    });
    if (!signUpError) {
      const retry = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (retry.data.user) return { userId: retry.data.user.id, error: null };
      return { error: 'No se pudo crear la cuenta demo. Revisa la confirmación de email.' };
    }
  }

  return { userId: null, error: error?.message ?? null };
}

export async function signOutSession() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSessionUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export function onAuthStateChange(cb: (userId: string | null) => void): (() => void) | null {
  if (!supabase) return null;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user?.id ?? null);
  });
  return () => data.subscription.unsubscribe();
}

// ---------- Datos ----------

export async function hydrateAll(userId: string): Promise<HydratedData> {
  const empty: HydratedData = {
    profile: null,
    routines: [],
    history: [],
    personalRecords: [],
    weightHistory: [],
    chatMessages: [],
  };
  if (!supabase) return empty;

  const [profileRes, routinesRes, sessionsRes, prsRes, weightRes, chatRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('routines').select('*').eq('user_id', userId).order('day_number'),
    supabase.from('workout_sessions').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('personal_records').select('*').eq('user_id', userId),
    supabase.from('weight_history').select('*').eq('user_id', userId).order('date'),
    supabase.from('chat_messages').select('*').eq('user_id', userId).order('timestamp'),
  ]);

  return {
    profile: profileRes.data ? profileRowToUser(profileRes.data) : null,
    routines: (routinesRes.data as Record<string, unknown>[])?.map(routineRowToRoutine).sort(
      (a, b) => a.dayNumber - b.dayNumber
    ) ?? [],
    history: (sessionsRes.data as Record<string, unknown>[])?.map(rowToSession).reverse() ?? [],
    personalRecords: (prsRes.data as Record<string, unknown>[])?.map(rowToPr) ?? [],
    weightHistory: (weightRes.data as { date: string; weight: number }[]) ?? [],
    chatMessages: (chatRes.data as Record<string, unknown>[])?.map(rowToChat) ?? [],
  };
}

export async function persistProfile(user: UserProfile) {
  if (!supabase) return;
  await supabase.from('profiles').upsert(userToProfileRow(user), { onConflict: 'id' });
}

export async function persistRoutines(userId: string, routines: DailyRoutine[]) {
  if (!supabase) return;
  await supabase.from('routines').delete().eq('user_id', userId);
  if (routines.length === 0) return;
  const rows = routines.map((r, i) => routineToRow(userId, r, i));
  await supabase.from('routines').insert(rows);
}

export async function persistHistory(userId: string, history: WorkoutSessionLog[]) {
  if (!supabase) return;
  await supabase.from('workout_sessions').delete().eq('user_id', userId);
  if (history.length === 0) return;
  await supabase.from('workout_sessions').insert(history.map((s) => sessionToRow(userId, s)));
}

export async function persistRecords(userId: string, prs: PersonalRecord[]) {
  if (!supabase) return;
  await supabase.from('personal_records').delete().eq('user_id', userId);
  if (prs.length === 0) return;
  await supabase.from('personal_records').insert(prs.map((pr) => prToRow(userId, pr)));
}

export async function persistWeightHistory(
  userId: string,
  weightHistory: { date: string; weight: number }[]
) {
  if (!supabase) return;
  await supabase.from('weight_history').delete().eq('user_id', userId);
  if (weightHistory.length === 0) return;
  await supabase.from('weight_history').insert(weightHistory.map((w) => weightToRow(userId, w)));
}

export async function persistChat(userId: string, messages: ChatMessage[]) {
  if (!supabase) return;
  await supabase.from('chat_messages').delete().eq('user_id', userId);
  if (messages.length === 0) return;
  await supabase.from('chat_messages').insert(messages.map((m) => chatToRow(userId, m)));
}

/** Si el usuario (típicamente la demo) no tiene rutinas, sembra los datos demo. */
export async function ensureDemoData(userId: string) {
  if (!supabase) return;
  const { data } = await supabase.from('routines').select('day_number').eq('user_id', userId);
  if (data && data.length > 0) return;
  await persistRoutines(userId, MOCK_ROUTINES);
  await persistHistory(userId, MOCK_HISTORY);
  await persistRecords(userId, MOCK_PRS);
  await persistWeightHistory(userId, MOCK_WEIGHT_HISTORY);
  await persistChat(userId, INITIAL_CHAT_MESSAGES);
}