import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import {
  INITIAL_USER,
  MOCK_ROUTINES,
  MOCK_HISTORY,
  MOCK_PRS,
  MOCK_WEIGHT_HISTORY,
  INITIAL_CHAT_MESSAGES,
} from '../data/mockData';
import {
  calculateAllometricProfile,
  calculateAllometricWorkoutCalories,
  AllometricProfile,
} from '../services/allometricService';

interface AppContextType {
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

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'fitai_user_v1',
  AUTH: 'fitai_auth_v1',
  HISTORY: 'fitai_history_v1',
  SCREEN: 'fitai_screen_v1',
  ROUTINES: 'fitai_routines_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence initialization
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      return saved !== null ? JSON.parse(saved) : true; // Default to true so user immediately sees rich prototype
    } catch {
      return true;
    }
  });

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCREEN);
      return (saved as AppScreen) || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [routines, setRoutines] = useState<DailyRoutine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      return saved ? JSON.parse(saved) : MOCK_ROUTINES;
    } catch {
      return MOCK_ROUTINES;
    }
  });
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [history, setHistory] = useState<WorkoutSessionLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : MOCK_HISTORY;
    } catch {
      return MOCK_HISTORY;
    }
  });
  const [personalRecords] = useState<PersonalRecord[]>(MOCK_PRS);
  const [weightHistory, setWeightHistory] = useState(MOCK_WEIGHT_HISTORY);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isCoachTyping, setIsCoachTyping] = useState<boolean>(false);

  // Active workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [activeRoutine, setActiveRoutine] = useState<DailyRoutine | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [activeSetIndex, setActiveSetIndex] = useState<number>(1);
  const [activeWorkoutSets, setActiveWorkoutSets] = useState<LoggedSet[]>([]);
  const [workoutElapsedTime, setWorkoutElapsedTime] = useState<number>(0);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCREEN, currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  }, [routines]);

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
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setRoutines(MOCK_ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    setIsWorkoutActive(false);
    setActiveRoutine(null);
    navigateTo('dashboard');
  };

  const addExerciseToRoutine = (dayNumber: number, exercise: Exercise) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.dayNumber === dayNumber) {
          return {
            ...r,
            exercises: [...r.exercises, exercise],
            estimatedMinutes: r.estimatedMinutes + 10,
          };
        }
        return r;
      })
    );
  };

  const replaceRoutineExercise = (dayNumber: number, oldExerciseId: string, newExercise: Exercise) => {
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
            estimatedMinutes: Math.max(15, r.estimatedMinutes - 10),
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
      weeklyCompliance: 25, // Fresh start indicator
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
    setRestTimerSeconds(0);
    setIsRestTimerActive(false);
    setIsWorkoutActive(true);
    navigateTo('workout');
  };

  const cancelWorkout = () => {
    setIsWorkoutActive(false);
    setActiveRoutine(null);
    setWorkoutElapsedTime(0);
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
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveWorkoutSets((prev) => [...prev, newSet]);

    // Advance set or exercise
    if (activeSetIndex < currentEx.sets) {
      setActiveSetIndex((prev) => prev + 1);
      // Trigger rest timer based on exercise recommendation
      startRestTimer(currentEx.restSeconds || 90);
    } else {
      // Last set of exercise
      if (activeExerciseIndex < activeRoutine.exercises.length - 1) {
        setActiveExerciseIndex((prev) => prev + 1);
        setActiveSetIndex(1);
        startRestTimer(currentEx.restSeconds || 90);
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

  // Perfil Alométrico memoizado del usuario
  const allometricProfile = useMemo(
    () => calculateAllometricProfile(user.weight, user.age, user.height, user.gender),
    [user.weight, user.age, user.height, user.gender]
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
    const durationMin = Math.max(1, Math.round(workoutElapsedTime / 60));

    // Calculate volume
    const totalVolume = activeWorkoutSets.reduce(
      (acc, s) => acc + (s.weightKg > 0 ? s.weightKg * s.reps : 0),
      0
    );

    // Cálculo Alométrico de Calorías y Potencia (Escala de 3/4 - Ley de Kleiber)
    const { allometricCalories, metabolicPowerWatts } = calculateAllometricWorkoutCalories(
      user.weight,
      durationMin,
      averageRpe || 8,
      activeWorkoutSets.length || 12
    );

    // Ritmo Cardíaco Alométrico
    const finalAvgHr =
      customAvgHr ||
      Math.round(allometricProfile.allometricRestingHr + allometricProfile.heartRateReserve * 0.68);
    const finalMaxHr =
      customMaxHr ||
      Math.min(
        allometricProfile.maxHeartRateBpm,
        Math.round(allometricProfile.allometricRestingHr + allometricProfile.heartRateReserve * 0.92)
      );

    // AI feedback generator based on performance & allometric scaling
    let feedback = `¡Gran trabajo, ${user.name.split(' ')[0]}! Has completado ${activeWorkoutSets.length} series de ${routine.focus}. `;
    feedback += `Gasto metabólico alométrico: ${allometricCalories} kcal (según escala M^(3/4) de Kleiber, ${metabolicPowerWatts} W de potencia media). `;
    feedback += `Tu ritmo cardíaco promedio fue de ${finalAvgHr} bpm (pico: ${finalMaxHr} bpm) calibrado con tu basal alométrico (${allometricProfile.allometricRestingHr} bpm). `;

    if (totalVolume > 10000) {
      feedback += 'Has movido un volumen extraordinario (>10 toneladas), excelente estímulo hipertrófico.';
    } else if (averageRpe >= 8.5) {
      feedback += 'La intensidad fue elevada (RPE > 8.5). Asegura al menos 2g/kg de proteína hoy y descanso de calidad.';
    } else {
      feedback += 'Sesión limpia y controlada con RPE adecuado para asimilar la técnica y fatiga.';
    }

    const newSession: WorkoutSessionLog = {
      id: `wlog_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      routineName: `${routine.name} (${routine.focus})`,
      durationMinutes: durationMin,
      totalVolumeKg: totalVolume || 8400,
      exercisesCompleted: activeExerciseIndex + 1,
      totalSets: activeWorkoutSets.length || 12,
      averageRpe: averageRpe || 8,
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

    // Increase compliance slightly
    setUser((prev) => ({
      ...prev,
      weeklyCompliance: Math.min(100, prev.weeklyCompliance + 10),
    }));

    return newSession;
  };

  // AI Coach Simulator / Knowledge base
  const sendCoachMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsCoachTyping(true);

    // Simulate smart AI response in Spanish
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('ritmo') || lower.includes('cardiac') || lower.includes('1/4') || lower.includes('corazon') || lower.includes('pulso')) {
        reply = `**Frecuencia Cardíaca y Escala Alométrica (x^(-1/4) y x^(1/4))**:\n\nEn biología de sistemas (West, Brown & Enquist / Schmidt-Nielsen), la frecuencia cardíaca de los mamíferos escala con la masa corporal elevada a la **-1/4**: **f_HR ∝ M^(-1/4)**.\n\nPara tus **${user.weight} kg**:\n- **Frecuencia en reposo alométrica**: **${allometricProfile.allometricRestingHr} bpm** (derivada de 68 × (M/70)^(-0.25)).\n- **Duración del ciclo cardíaco**: **${allometricProfile.cardiacCycleDurationSec} s** por latido (escala x^(1/4)).\n- **Constante de recuperación cardíaca**: **${allometricProfile.cardiacRecoveryHalfLifeSec} s** (el tiempo que tarda tu pulso en recuperar el 50% post-serie).\n- **HR Máxima teórica**: **${allometricProfile.maxHeartRateBpm} bpm**.\n\nEsto garantiza que tus zonas de entrenamiento cardiovascular (Z1 a Z5) sean exactas para tu masa biológica real.`;
      } else if (lower.includes('kleiber') || lower.includes('3/4') || lower.includes('caloria') || lower.includes('metabol')) {
        reply = `**Ley de Kleiber y Gasto Metabólico (x^(3/4))**:\n\nMax Kleiber demostró en 1932 que la tasa metabólica no es proporcional a la masa lineal (x^1) ni a la superficie corporal (x^2/3), sino que escala con **M^(3/4)** debido a la geometría fractal de las redes capilares sanguíneas.\n\nEn tu perfil (${user.weight} kg):\n- **BMR según Ley de Kleiber**: **${allometricProfile.kleiberBmrKcal} kcal/día** (70 × ${user.weight}^0.75).\n- **TDEE Alométrico**: **${allometricProfile.allometricTdeeKcal} kcal/día** (con factor de actividad ${user.daysPerWeek} días/sem).\n- **Precisión vs Fórmula lineal**: El cálculo alométrico evita sobrestimar el gasto en personas pesadas o subestimarlo en ligeras (diferencia de ${allometricProfile.bmrAllometricDeltaKcal > 0 ? '+' : ''}${allometricProfile.bmrAllometricDeltaKcal} kcal respecto a Harris-Benedict).\n\nEn cada sesión, calculamos tus calorías activas integrando la potencia metabólica según esta ley de 3/4.`;
      } else if (lower.includes('fuerza alometrica') || lower.includes('2/3') || lower.includes('jaric') || lower.includes('relativa')) {
        reply = `**Índice de Fuerza Alométrica (x^(2/3) - Jaric/Siff)**:\n\nAl comparar levantadores, dividir el peso levantado entre el peso corporal (fuerza lineal) perjudica injustamente a quienes tienen mayor masa. La fuerza muscular depende del área de sección transversal del músculo, que escala geométricamente como **M^(2/3)**.\n\n- **Fórmula de Fuerza Alométrica**: **S = Carga / (M^(2/3))**.\n- Para normalizar cualquier levantamiento a un estándar de 70 kg usamos el factor **(70 / ${user.weight})^(2/3) = ${allometricProfile.strengthScalingFactor}**.\n\nPor ejemplo, tu press de banca de 95 kg equivale a **${(95 * allometricProfile.strengthScalingFactor).toFixed(1)} kg** para un atleta de 70 kg (un índice de fuerza de 5.19: Avanzado).`;
      } else if (lower.includes('sentadilla') || lower.includes('squat')) {
        reply = `Para mejorar tu sentadilla trasera:\n1. **Estabilidad del pie**: Imagina un trípode (talón, base del pulgar y meñique) empujando el suelo con fuerza constante.\n2. **Maniobra de Valsalva**: Inhala hondo diafragmáticamente y tensa el abdomen antes de descender.\n3. **Profundidad**: Busca romper el paralelo manteniendo la curvatura lumbar neutra.\n\n¿Quieres que adaptemos las repeticiones del día de piernas a 6-8 con mayor pausa abajo?`;
      } else if (lower.includes('tiempo') || lower.includes('poco tiempo') || lower.includes('rapido')) {
        reply = `¡No te preocupes! La consistencia supera a la perfección.\n\n**Estrategia Exprés (30 min)**:\n- Haz series efectivas en biseries (ej. Press de Banca alternado con Remo con mancuerna).\n- Reduce los descansos a 60 segundos.\n- Prioriza solo los dos ejercicios compuestos principales de hoy.\n\n¿Quieres que active el modo exprés para tu sesión?`;
      } else if (lower.includes('aumentar') || lower.includes('peso') || lower.includes('sobrecarga')) {
        reply = `Tu progreso reciente indica que completaste las series objetivo con un RPE de 8.\n\n**Regla del 2 por 2**: Si puedes completar 2 repeticiones extra en la última serie durante 2 entrenamientos seguidos, aumenta:\n- **+1.25 kg a +2.5 kg** en tren superior (presses y remos).\n- **+2.5 kg a +5 kg** en tren inferior (sentadilla y peso muerto).\n\n¡La técnica siempre debe ser innegociable antes de subir carga!`;
      } else if (lower.includes('reemplazo') || lower.includes('banca') || lower.includes('alternativa')) {
        reply = `Excelentes alternativas al press de banca plano con barra según disponibilidad o molestias:\n\n1. **Press con mancuernas en banco plano**: Mayor rango de estiramiento y menor estrés en muñecas.\n2. **Press en máquina convergente**: Estabilidad guiada ideal para fatiga alta o sin spotter.\n3. **Fondos en paralelas con ligera inclinación al frente**: Gran reclutamiento de pectoral inferior y deltoides anterior.`;
      } else if (lower.includes('cansado') || lower.includes('fatiga') || lower.includes('dolor')) {
        reply = `Escuchar a tu cuerpo es de atletas inteligentes.\n\nSi tu fatiga es muscular general:\n- Reduce 1 serie de cada ejercicio hoy (ej. de 4 series a 3).\n- Mantén el peso pero deja 2-3 repeticiones en recámara (RIR 2-3).\n\nSi sientes molestia en articulaciones o tendones, te recomiendo cambiar la sesión por el Día 3 de Movilidad y Recuperación Activa.`;
      } else if (lower.includes('calentamiento') || lower.includes('hombro') || lower.includes('rotador')) {
        reply = `Dado que tienes historial de molestia en manguito rotador:\n1. 2 series de 15 reps de rotaciones externas en polea o con mancuerna ligera.\n2. 10 dislocaciones de hombro con banda elástica.\n3. Series de aproximación progresivas (vacío, 50%, 70% de carga) antes de tu primera serie efectiva de press.`;
      } else {
        reply = `Entendido, Carlos. Como tu entrenador virtual, evalué tu perfil (${user.primaryGoal.toUpperCase()}, nivel ${user.experience}, ${user.daysPerWeek} días/sem) con biometría alométrica calibrada (escala x^(3/4) de Kleiber y x^(-1/4) cardíaca).\n\nPara maximizar tus resultados, recuerda que la tensión mecánica y el descanso recuperativo entre sesiones son los dos pilares de tu hipertrofia. ¿Deseas que analicemos algún ejercicio específico de tu rutina de hoy?`;
      }

      const coachMsg: ChatMessage = {
        id: `coach_${Date.now()}`,
        sender: 'coach',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'technique',
      };

      setChatMessages((prev) => [...prev, coachMsg]);
      setIsCoachTyping(false);
    }, 900);
  };

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

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
