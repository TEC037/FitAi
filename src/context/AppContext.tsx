import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppContext } from './useApp';
import {
  UserProfile,
  DailyRoutine,
  Exercise,
  WorkoutSessionLog,
  PersonalRecord,
  ChatMessage,
  AppScreen,
  LoggedSet,
} from '../types';
import { INITIAL_USER } from '../data/mockUser';
import { INITIAL_CHAT_MESSAGES } from '../data/mockCoach';
import { MOCK_ROUTINES } from '../data/mockRoutines';
import { MOCK_HISTORY, MOCK_PRS, MOCK_WEIGHT_HISTORY } from '../data/mockProgress';
import {
  calculateAllometricProfile,
  calculateAllometricWorkoutCalories,
  resolveActivityLevel,
  AllometricProfile,
} from '../services/allometricService';
import {
  COACH_THINKING_DELAY_MS,
  COMPLIANCE_INCREMENT_PER_WORKOUT,
  DEFAULT_AVERAGE_RPE,
  DEFAULT_REST_SECONDS,
  FALLBACK_TOTAL_SETS,
  FALLBACK_TOTAL_VOLUME_KG,
  FRESH_START_COMPLIANCE,
  MINUTES_PER_EXERCISE,
  MIN_ROUTINE_ESTIMATED_MINUTES,
  MIN_DURATION_REPORT_MIN,
  STORAGE_KEYS,
} from '../config/constants';
import { generateCoachReply, CoachContext } from '../ai/coachEngine';
import { buildServerlessPayload, fetchServerlessCoachReply } from '../lib/serverlessCoach';
import { withMinDelay } from '../utils/withMinDelay';
import { formatClock, getLocalDateStamp } from '../utils/format';
import { usePersistedState } from '../hooks/usePersistedState';

export interface AppContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  currentScreen: AppScreen;
  routines: DailyRoutine[];
  selectedDay: number;
  history: WorkoutSessionLog[];
  personalRecords: PersonalRecord[];
  weightHistory: { date: string; weight: number }[];
  chatMessages: ChatMessage[];
  isCoachTyping: boolean;

  // Biometría Alométrica (Escalas x^(3/4), x^(1/4), x^(2/3))
  allometricProfile: AllometricProfile;

  // Active workout state
  isWorkoutActive: boolean;
  activeRoutine: DailyRoutine | null;
  activeExerciseIndex: number;
  activeSetIndex: number;
  activeWorkoutSets: LoggedSet[];
  workoutElapsedTime: number; // in seconds
  restTimerSeconds: number;
  isRestTimerActive: boolean;

  // Actions
  navigateTo: (screen: AppScreen) => void;
  setSelectedDay: (day: number) => void;
  loginDemoUser: () => void;
  logout: () => void;
  resetToDemoData: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (newProfileData: Partial<UserProfile>) => void;

  // Workout Actions
  startWorkout: (routineDay?: number) => void;
  cancelWorkout: () => void;
  logActiveSet: (weightKg: number, reps: number, rpe: number, sensation: string) => void;
  goToNextExercise: () => void;
  goToPreviousExercise: () => void;
  startRestTimer: (seconds?: number) => void;
  pauseRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  finishWorkout: (
    notes: string,
    averageRpe: number,
    customAvgHr?: number,
    customMaxHr?: number
  ) => WorkoutSessionLog;

  // Routine Actions
  addExerciseToRoutine: (dayNumber: number, exercise: Exercise) => void;
  replaceRoutineExercise: (dayNumber: number, oldExerciseId: string, newExercise: Exercise) => void;
  removeExerciseFromRoutine: (dayNumber: number, exerciseId: string) => void;
  resetRoutines: () => void;

  // Coach AI Actions
  sendCoachMessage: (text: string) => void;
}

export interface PersistedWorkoutState {
  isWorkoutActive: boolean;
  activeRoutine: DailyRoutine | null;
  activeExerciseIndex: number;
  activeSetIndex: number;
  activeWorkoutSets: LoggedSet[];
  workoutStartedAt: number;
  restTimerDeadline: number;
  isRestTimerActive: boolean;
}

function loadWorkoutSnapshot(): PersistedWorkoutState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKOUT);
    return saved ? (JSON.parse(saved) as PersistedWorkoutState) : null;
  } catch {
    return null;
  }
}

// currentScreen se guarda como texto plano (no JSON.stringify). Funciones estables
// a nivel de módulo para que el efecto de persistencia no se re-ejecute por render.
function serializeScreen(screen: AppScreen): string {
  return screen;
}
function parseScreen(raw: string): AppScreen {
  return raw as AppScreen;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado persistido (hidrata desde localStorage al montar y escribe en cada cambio)
  const [user, setUser] = usePersistedState<UserProfile>(STORAGE_KEYS.USER, INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = usePersistedState<boolean>(STORAGE_KEYS.AUTH, true); // Default true: el prototipo se ve rico de inmediato
  const [currentScreen, setCurrentScreen] = usePersistedState<AppScreen>(
    STORAGE_KEYS.SCREEN,
    'dashboard',
    { serialize: serializeScreen, parse: parseScreen }
  );
  const [routines, setRoutines] = usePersistedState<DailyRoutine[]>(
    STORAGE_KEYS.ROUTINES,
    MOCK_ROUTINES
  );
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [history, setHistory] = usePersistedState<WorkoutSessionLog[]>(
    STORAGE_KEYS.HISTORY,
    MOCK_HISTORY
  );
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(MOCK_PRS);
  const [weightHistory, setWeightHistory] =
    useState<{ date: string; weight: number }[]>(MOCK_WEIGHT_HISTORY);
  const [chatMessages, setChatMessages] = usePersistedState<ChatMessage[]>(
    STORAGE_KEYS.CHAT,
    INITIAL_CHAT_MESSAGES
  );
  const [isCoachTyping, setIsCoachTyping] = useState<boolean>(false);

  // Active workout state (persistido para recuperar sesiones en curso tras recarga)
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(() => {
    const s = loadWorkoutSnapshot();
    return s?.isWorkoutActive ?? false;
  });
  const [activeRoutine, setActiveRoutine] = useState<DailyRoutine | null>(() => {
    const s = loadWorkoutSnapshot();
    return s?.isWorkoutActive ? s.activeRoutine : null;
  });
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(() => {
    const s = loadWorkoutSnapshot();
    return s?.isWorkoutActive ? s.activeExerciseIndex : 0;
  });
  const [activeSetIndex, setActiveSetIndex] = useState<number>(() => {
    const s = loadWorkoutSnapshot();
    return s?.isWorkoutActive ? s.activeSetIndex : 1;
  });
  const [activeWorkoutSets, setActiveWorkoutSets] = useState<LoggedSet[]>(() => {
    const s = loadWorkoutSnapshot();
    return s?.isWorkoutActive ? s.activeWorkoutSets : [];
  });
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number>(() => {
    const s = loadWorkoutSnapshot();
    return s?.isWorkoutActive && s.workoutStartedAt > 0 ? s.workoutStartedAt : 0;
  });
  const [workoutElapsedTime, setWorkoutElapsedTime] = useState<number>(() => {
    const s = loadWorkoutSnapshot();
    if (s?.isWorkoutActive && s.workoutStartedAt > 0) {
      return Math.floor((Date.now() - s.workoutStartedAt) / 1000);
    }
    return 0;
  });
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(() => {
    const s = loadWorkoutSnapshot();
    if (s?.isRestTimerActive && s.restTimerDeadline > 0) {
      return Math.max(0, Math.floor((s.restTimerDeadline - Date.now()) / 1000));
    }
    return 0;
  });
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(() => {
    const s = loadWorkoutSnapshot();
    if (!s?.isRestTimerActive) return false;
    return s.restTimerDeadline > Date.now();
  });

  // Workout snapshot persistido (estado compuesto con derivación al recargar)
  useEffect(() => {
    const snapshot: PersistedWorkoutState = {
      isWorkoutActive,
      activeRoutine,
      activeExerciseIndex,
      activeSetIndex,
      activeWorkoutSets,
      workoutStartedAt: isWorkoutActive ? workoutStartedAt : 0,
      restTimerDeadline: isRestTimerActive ? Date.now() + restTimerSeconds * 1000 : 0,
      isRestTimerActive,
    };
    localStorage.setItem(STORAGE_KEYS.WORKOUT, JSON.stringify(snapshot));
  }, [
    isWorkoutActive,
    activeRoutine,
    activeExerciseIndex,
    activeSetIndex,
    activeWorkoutSets,
    workoutStartedAt,
    restTimerSeconds,
    isRestTimerActive,
  ]);

  // Workout stopwatch ticker
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutActive]);

  // Rest countdown timer
  useEffect(() => {
    let restInterval: ReturnType<typeof setInterval> | null = null;
    if (isRestTimerActive && restTimerSeconds > 0) {
      restInterval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [isRestTimerActive, restTimerSeconds]);

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginDemoUser = () => {
    setUser(INITIAL_USER);
    setIsAuthenticated(true);
    navigateTo('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    navigateTo('landing');
  };

  const resetToDemoData = () => {
    setUser(INITIAL_USER);
    setHistory(MOCK_HISTORY);
    setWeightHistory(MOCK_WEIGHT_HISTORY);
    setPersonalRecords(MOCK_PRS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setRoutines(MOCK_ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.CHAT);
    localStorage.removeItem(STORAGE_KEYS.WORKOUT);
    setIsWorkoutActive(false);
    setActiveRoutine(null);
    setWorkoutElapsedTime(0);
    setWorkoutStartedAt(0);
    setRestTimerSeconds(0);
    setIsRestTimerActive(false);
    navigateTo('dashboard');
  };

  const addExerciseToRoutine = (dayNumber: number, exercise: Exercise) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.dayNumber === dayNumber) {
          return {
            ...r,
            exercises: [...r.exercises, exercise],
            estimatedMinutes: r.estimatedMinutes + MINUTES_PER_EXERCISE,
          };
        }
        return r;
      })
    );
  };

  const replaceRoutineExercise = (
    dayNumber: number,
    oldExerciseId: string,
    newExercise: Exercise
  ) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.dayNumber === dayNumber) {
          return {
            ...r,
            exercises: r.exercises.map((ex) => (ex.id === oldExerciseId ? newExercise : ex)),
          };
        }
        return r;
      })
    );
  };

  const removeExerciseFromRoutine = (dayNumber: number, exerciseId: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.dayNumber === dayNumber) {
          return {
            ...r,
            exercises: r.exercises.filter((ex) => ex.id !== exerciseId),
            estimatedMinutes: Math.max(
              MIN_ROUTINE_ESTIMATED_MINUTES,
              r.estimatedMinutes - MINUTES_PER_EXERCISE
            ),
          };
        }
        return r;
      })
    );
  };

  const resetRoutines = () => {
    setRoutines(MOCK_ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    if (updates.weight) {
      setWeightHistory((prev) => [
        ...prev,
        {
          date: 'Hoy',
          weight: updates.weight!,
        },
      ]);
    }
  };

  const completeOnboarding = (newProfileData: Partial<UserProfile>) => {
    const mergedUser: UserProfile = {
      ...user,
      ...newProfileData,
      weeklyCompliance: FRESH_START_COMPLIANCE,
    };
    setUser(mergedUser);
    setIsAuthenticated(true);
    navigateTo('dashboard');
  };

  // Workout management
  const startWorkout = (routineDay?: number) => {
    const day = routineDay !== undefined ? routineDay : selectedDay;
    const targetRoutine = routines.find((r) => r.dayNumber === day) || routines[0];
    setActiveRoutine(targetRoutine);
    setActiveExerciseIndex(0);
    setActiveSetIndex(1);
    setActiveWorkoutSets([]);
    setWorkoutElapsedTime(0);
    setWorkoutStartedAt(Date.now());
    setRestTimerSeconds(0);
    setIsRestTimerActive(false);
    setIsWorkoutActive(true);
    navigateTo('workout');
  };

  const cancelWorkout = () => {
    setIsWorkoutActive(false);
    setActiveRoutine(null);
    setWorkoutElapsedTime(0);
    setWorkoutStartedAt(0);
    setRestTimerSeconds(0);
    setIsRestTimerActive(false);
    navigateTo('dashboard');
  };

  const logActiveSet = (weightKg: number, reps: number, rpe: number, sensation: string) => {
    if (!activeRoutine) return;
    const currentEx = activeRoutine.exercises[activeExerciseIndex];
    if (!currentEx) return;

    const newSet: LoggedSet = {
      exerciseId: currentEx.id,
      exerciseName: currentEx.name,
      setNumber: activeSetIndex,
      weightKg,
      reps,
      rpe,
      sensation,
      completedAt: formatClock(new Date()),
    };

    setActiveWorkoutSets((prev) => [...prev, newSet]);

    // Advance set or exercise
    if (activeSetIndex < currentEx.sets) {
      setActiveSetIndex((prev) => prev + 1);
      // Trigger rest timer based on exercise recommendation
      startRestTimer(currentEx.restSeconds || DEFAULT_REST_SECONDS);
    } else {
      // Last set of exercise
      if (activeExerciseIndex < activeRoutine.exercises.length - 1) {
        setActiveExerciseIndex((prev) => prev + 1);
        setActiveSetIndex(1);
        startRestTimer(currentEx.restSeconds || DEFAULT_REST_SECONDS);
      }
    }
  };

  const goToNextExercise = () => {
    if (!activeRoutine) return;
    if (activeExerciseIndex < activeRoutine.exercises.length - 1) {
      setActiveExerciseIndex((prev) => prev + 1);
      setActiveSetIndex(1);
      setIsRestTimerActive(false);
      setRestTimerSeconds(0);
    }
  };

  const goToPreviousExercise = () => {
    if (activeExerciseIndex > 0) {
      setActiveExerciseIndex((prev) => prev - 1);
      setActiveSetIndex(1);
      setIsRestTimerActive(false);
      setRestTimerSeconds(0);
    }
  };

  const startRestTimer = (seconds: number = 90) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerActive(true);
  };

  const pauseRestTimer = () => {
    setIsRestTimerActive(false);
  };

  // Perfil Alométrico memoizado del usuario (PAL derivado de daysPerWeek + objetivo)
  const allometricProfile = useMemo(
    () =>
      calculateAllometricProfile(
        user.weight,
        user.age,
        user.height,
        user.gender,
        resolveActivityLevel(user.daysPerWeek, user.primaryGoal)
      ),
    [user.weight, user.age, user.height, user.gender, user.daysPerWeek, user.primaryGoal]
  );

  const adjustRestTimer = (deltaSeconds: number) => {
    setRestTimerSeconds((prev) => Math.max(0, prev + deltaSeconds));
  };

  const finishWorkout = (
    notes: string,
    averageRpe: number,
    customAvgHr?: number,
    customMaxHr?: number
  ): WorkoutSessionLog => {
    const routine = activeRoutine || routines[0];
    const durationMin = Math.max(MIN_DURATION_REPORT_MIN, Math.round(workoutElapsedTime / 60));

    // Calculate volume
    const totalVolume = activeWorkoutSets.reduce(
      (acc, s) => acc + (s.weightKg > 0 ? s.weightKg * s.reps : 0),
      0
    );

    // Cálculo Alométrico de Calorías y Potencia (Escala de 3/4 - Ley de Kleiber)
    const { allometricCalories, metabolicPowerWatts } = calculateAllometricWorkoutCalories(
      user.weight,
      durationMin,
      averageRpe || DEFAULT_AVERAGE_RPE,
      activeWorkoutSets.length || FALLBACK_TOTAL_SETS
    );

    // Ritmo Cardíaco Alométrico
    const finalAvgHr =
      customAvgHr ||
      Math.round(allometricProfile.allometricRestingHr + allometricProfile.heartRateReserve * 0.68);
    const finalMaxHr =
      customMaxHr ||
      Math.min(
        allometricProfile.maxHeartRateBpm,
        Math.round(
          allometricProfile.allometricRestingHr + allometricProfile.heartRateReserve * 0.92
        )
      );

    // AI feedback generator based on performance & allometric scaling
    let feedback = `¡Gran trabajo, ${user.name.split(' ')[0]}! Has completado ${activeWorkoutSets.length} series de ${routine?.focus ?? 'entrenamiento'}. `;
    feedback += `Gasto metabólico alométrico: ${allometricCalories} kcal (según escala M^(3/4) de Kleiber, ${metabolicPowerWatts} W de potencia media). `;
    feedback += `Tu ritmo cardíaco promedio fue de ${finalAvgHr} bpm (pico: ${finalMaxHr} bpm) calibrado con tu basal alométrico (${allometricProfile.allometricRestingHr} bpm). `;

    if (totalVolume > 10000) {
      feedback +=
        'Has movido un volumen extraordinario (>10 toneladas), excelente estímulo hipertrófico.';
    } else if (averageRpe >= 8.5) {
      feedback +=
        'La intensidad fue elevada (RPE > 8.5). Asegura al menos 2g/kg de proteína hoy y descanso de calidad.';
    } else {
      feedback += 'Sesión limpia y controlada con RPE adecuado para asimilar la técnica y fatiga.';
    }

    const newSession: WorkoutSessionLog = {
      id: `wlog_${Date.now()}`,
      date: getLocalDateStamp(new Date()),
      routineName: `${routine.name} (${routine.focus})`,
      durationMinutes: durationMin,
      totalVolumeKg: totalVolume || FALLBACK_TOTAL_VOLUME_KG,
      exercisesCompleted: activeExerciseIndex + 1,
      totalSets: activeWorkoutSets.length || FALLBACK_TOTAL_SETS,
      averageRpe: averageRpe || DEFAULT_AVERAGE_RPE,
      caloriesBurned: allometricCalories,
      averageHeartRate: finalAvgHr,
      peakHeartRate: finalMaxHr,
      allometricPowerWatts: metabolicPowerWatts,
      allometricCalories: allometricCalories,
      userObservations: notes || 'Sesión completada con éxito según lo planificado.',
      aiCoachFeedback: feedback,
      completedSets: activeWorkoutSets,
    };

    setHistory((prev) => [newSession, ...prev]);
    setIsWorkoutActive(false);
    setActiveRoutine(null);
    setWorkoutElapsedTime(0);
    setWorkoutStartedAt(0);
    setRestTimerSeconds(0);
    setIsRestTimerActive(false);

    // Increase compliance slightly
    setUser((prev) => ({
      ...prev,
      weeklyCompliance: Math.min(100, prev.weeklyCompliance + COMPLIANCE_INCREMENT_PER_WORKOUT),
    }));

    return newSession;
  };

  // AI Coach Simulator / Knowledge base
  // useCallback: el cierre captura el contexto del render actual (usuario +
  // perfil alométrico) para evitar estado stale en el flujo asíncrono.
  const sendCoachMessage = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}`,
        sender: 'user',
        text,
        timestamp: formatClock(new Date()),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setIsCoachTyping(true);

      const coachContext: CoachContext = {
        userWeight: user.weight,
        daysPerWeek: user.daysPerWeek,
        primaryGoal: user.primaryGoal,
        experience: user.experience,
        name: user.name,
        allometric: allometricProfile,
      };

      const localReply = generateCoachReply(text, coachContext);

      void (async () => {
        const coachReply = await withMinDelay(
          fetchServerlessCoachReply(buildServerlessPayload(text, coachContext)),
          COACH_THINKING_DELAY_MS
        );

        const coachMsg: ChatMessage = {
          id: `coach_${Date.now()}`,
          sender: 'coach',
          text: coachReply?.answer ?? localReply.text,
          timestamp: formatClock(new Date()),
          category: localReply.category,
          source: coachReply?.source ?? 'local',
        };

        setChatMessages((prev) => [...prev, coachMsg]);
        setIsCoachTyping(false);
      })();
    },
    [user, allometricProfile, setChatMessages]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        currentScreen,
        routines,
        selectedDay,
        history,
        personalRecords,
        weightHistory,
        chatMessages,
        isCoachTyping,

        allometricProfile,

        isWorkoutActive,
        activeRoutine,
        activeExerciseIndex,
        activeSetIndex,
        activeWorkoutSets,
        workoutElapsedTime,
        restTimerSeconds,
        isRestTimerActive,

        navigateTo,
        setSelectedDay,
        loginDemoUser,
        logout,
        resetToDemoData,
        updateUserProfile,
        completeOnboarding,

        startWorkout,
        cancelWorkout,
        logActiveSet,
        goToNextExercise,
        goToPreviousExercise,
        startRestTimer,
        pauseRestTimer,
        adjustRestTimer,
        finishWorkout,

        addExerciseToRoutine,
        replaceRoutineExercise,
        removeExerciseFromRoutine,
        resetRoutines,

        sendCoachMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
