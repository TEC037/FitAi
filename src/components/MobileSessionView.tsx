import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Timer } from 'lucide-react';
import { useApp } from '../context/useApp';
import { Exercise, WorkoutSessionLog } from '../types';
import { getExerciseGifUrl } from '../services/exerciseDatabaseService';
import { formatTime } from '../utils/format';
import { FinishWorkoutModal } from './ActiveWorkoutView';

const DEFAULT_SESSION_RPE = 8;

interface RestTimerProps {
  restSeconds: number;
}

function RestTimer({ restSeconds }: RestTimerProps) {
  const isFinalCountdown = restSeconds <= 10;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        {/* Static ring base */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
          <circle
            cx="72"
            cy="72"
            r="64"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          <circle
            cx="72"
            cy="72"
            r="64"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="402"
            className={`text-[#C0FF00] ${
              isFinalCountdown ? 'animate-pulse' : ''
            }`}
          />
        </svg>
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center ${
            isFinalCountdown ? 'animate-pulse' : ''
          }`}
        >
          <Timer className={`w-6 h-6 mb-1 ${isFinalCountdown ? 'text-red-400' : 'text-[#C0FF00]/70'}`} />
          <span className="font-mono text-6xl font-black text-[#C0FF00] leading-none">
            {formatTime(restSeconds)}
          </span>
        </div>
      </div>
      <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Descanso</p>
    </div>
  );
}

/**
 * Flujo de entrenamiento en móvil: UN solo botón.
 * - Registra cada serie con los valores sugeridos del plan (sin formularios).
 * - Avanza solo entre series y ejercicios con descanso automático.
 * - Al terminar pide únicamente el RPE de la sesión y notas en el modal final.
 */
export const MobileSessionView: React.FC = () => {
  const {
    allometricProfile,
    activeRoutine,
    activeExerciseIndex,
    activeSetIndex,
    activeWorkoutSets,
    workoutElapsedTime,
    restTimerSeconds,
    isRestTimerActive,
    logActiveSet,
    pauseRestTimer,
    finishWorkout,
    cancelWorkout,
    navigateTo,
  } = useApp();

  const currentExercise: Exercise = activeRoutine?.exercises[activeExerciseIndex] || {
    id: 'ex_demo',
    name: 'Press de Banca con Barra',
    primaryMuscle: 'Pecho',
    targetMuscles: ['Pectoral', 'Tríceps'],
    sets: 4,
    reps: '8-10',
    suggestedWeightKg: 82.5,
    restSeconds: 90,
    rpe: 8,
    technicalCue: 'Retrae las escápulas y mantén los pies plantados con fuerza en el suelo.',
    fullInstructions: [],
    commonMistakes: [],
    equipment: 'Barra',
    iconType: 'barbell',
    difficulty: 'intermedio' as const,
  };

  const totalExercises = activeRoutine?.exercises.length || 6;
  const currentSetsOfExercise = activeWorkoutSets.filter((s) => s.exerciseId === currentExercise.id);

  const suggestedWeight = currentExercise.suggestedWeightKg || 60;
  const suggestedReps = parseInt(currentExercise.reps.split('-')[0], 10) || 10;

  const isLastExercise = activeExerciseIndex === totalExercises - 1;
  const isWorkoutComplete = isLastExercise && currentSetsOfExercise.length >= currentExercise.sets;

  const [showFinish, setShowFinish] = useState(false);
  const [finalNotes, setFinalNotes] = useState('');
  const [sessionRpe, setSessionRpe] = useState(DEFAULT_SESSION_RPE);
  const [summary, setSummary] = useState<WorkoutSessionLog | null>(null);

  useEffect(() => {
    if (isWorkoutComplete) setShowFinish(true);
  }, [isWorkoutComplete]);

  const handleMainButton = () => {
    if (isRestTimerActive) {
      pauseRestTimer();
      return;
    }
    logActiveSet(suggestedWeight, suggestedReps, DEFAULT_SESSION_RPE, '');
  };

  const handleConfirmFinish = () => {
    const avgHr = Math.round(
      allometricProfile.allometricRestingHr + allometricProfile.heartRateReserve * 0.68
    );
    const maxHr = Math.min(
      allometricProfile.maxHeartRateBpm,
      Math.round(allometricProfile.allometricRestingHr + allometricProfile.heartRateReserve * 0.92)
    );
    const session = finishWorkout(finalNotes, sessionRpe, avgHr, maxHr);
    setSummary(session);
  };

  const closeFinish = () => {
    setShowFinish(false);
    setSummary(null);
  };

  const isResting = isRestTimerActive || restTimerSeconds > 0;

  return (
    <div className="flex-1 h-full flex flex-col px-5 pt-5 pb-6 max-w-md mx-auto w-full relative">
      {/* Header compacto: nombre + tiempo + progreso */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
            En vivo · Día {activeRoutine?.dayNumber || 1}
          </p>
          <h2 className="text-sm font-black text-white truncate">
            {activeRoutine?.name || 'Empuje Dinámico'}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-lg font-black text-white">
            {formatTime(workoutElapsedTime)}
          </span>
          <button
            onClick={cancelWorkout}
            aria-label="Salir de la sesión"
            className="p-2 text-white/40 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dots de progreso por ejercicio */}
      <div className="flex gap-1.5 mt-3">
        {(activeRoutine?.exercises || []).map((ex, idx) => {
          const done = idx < activeExerciseIndex;
          const current = idx === activeExerciseIndex;
          return (
            <span
              key={ex.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                done ? 'bg-[#C0FF00]' : current ? 'bg-[#C0FF00]/50' : 'bg-white/10'
              }`}
            />
          );
        })}
      </div>

      {/* Zona central: ejercicio o descanso */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 min-h-0">
        {isResting && !isWorkoutComplete ? (
          <RestTimer restSeconds={restTimerSeconds} />
        ) : (
          <>
            <span className="text-xs text-[#C0FF00] font-bold uppercase tracking-wider">
              Ejercicio {activeExerciseIndex + 1} de {totalExercises}
            </span>
            <h1 className="text-2xl font-black text-white leading-tight">{currentExercise.name}</h1>

            <div className="w-full max-w-[220px] rounded-2xl overflow-hidden bg-[#121212] border border-white/10">
              {currentExercise.gifUrl || currentExercise.image ? (
                <img
                  src={getExerciseGifUrl(currentExercise.gifUrl || currentExercise.image)}
                  alt={currentExercise.name}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-contain p-1"
                />
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center text-4xl">
                  🏋️‍♂️
                </div>
              )}
            </div>

            <p className="text-sm text-white/70">
              <strong className="text-white">
                Serie {Math.min(activeSetIndex, currentExercise.sets)} de{' '}
                {currentExercise.sets}
              </strong>
              <span className="text-white/40"> · </span>
              {suggestedWeight} kg × {suggestedReps} reps
            </p>
            {currentSetsOfExercise.length > 0 && (
              <p className="text-[11px] text-[#C0FF00] font-semibold">
                {currentSetsOfExercise.length}/{currentExercise.sets} series completadas ✓
              </p>
            )}
          </>
        )}
      </div>

      {/* EL ÚNICO BOTÓN */}
      <button
        id="btn-mobile-complete-set"
        onClick={handleMainButton}
        disabled={isWorkoutComplete}
        className={`w-full py-6 rounded-3xl font-black text-lg text-black flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-[0_0_40px_rgba(192,255,0,0.35)] ${
          isResting ? 'bg-[#C0FF00]/90' : 'bg-[#C0FF00]'
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        <CheckCircle2 className="w-6 h-6 fill-current" />
        <span>
          {isWorkoutComplete ? 'Sesión completada' : isResting ? 'CONTINUAR' : 'COMPLETAR SERIE'}
        </span>
      </button>

      {/* Modal final: solo RPE + notas + confirmación, y resumen */}
      <FinishWorkoutModal
        isOpen={showFinish}
        hasSummary={summary !== null}
        summary={summary}
        totalSetsLogged={activeWorkoutSets.length}
        elapsedSeconds={workoutElapsedTime}
        notes={finalNotes}
        sessionRpe={sessionRpe}
        onNotesChange={setFinalNotes}
        onSessionRpeChange={setSessionRpe}
        onClose={closeFinish}
        onConfirm={handleConfirmFinish}
        onGoHistory={() => {
          closeFinish();
          navigateTo('history');
        }}
        onGoDashboard={() => {
          closeFinish();
          navigateTo('dashboard');
        }}
      />
    </div>
  );
};