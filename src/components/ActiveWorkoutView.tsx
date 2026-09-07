import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Flame,
  Heart,
  Scale,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Pause,
  Play,
  Timer,
  CheckCircle2,
  Minus,
  Plus,
  Info,
  Zap,
} from 'lucide-react';
import {
  AllometricProfile,
  computeDynamicHeartRate,
  calculateAllometricWorkoutCalories,
  calculateAllometricStrengthScore,
} from '../services/allometricService';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { LoggedSet, WorkoutSessionLog, Exercise } from '../types';
import { getExerciseGifUrl } from '../services/exerciseDatabaseService';
import { formatTime, formatVolumeKg } from '../utils/format';
import { useApp } from '../context/useApp';
import { useIsMobile } from '../hooks/useIsMobile';
import { MobileSessionView } from './MobileSessionView';

interface AllometricInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  weightKg: number;
  allometricProfile: AllometricProfile;
}

export const AllometricInfoModal: React.FC<AllometricInfoModalProps> = ({
  isOpen,
  onClose,
  weightKg,
  allometricProfile,
}) => {
  const { dialogRef, handleBackdropClick } = useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="allometric-modal-title"
        className="bg-[#0D0D0D] border border-white/15 rounded-[28px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#C0FF00]/10 text-[#C0FF00] border border-[#C0FF00]/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 id="allometric-modal-title" className="text-lg font-black text-white">
                Fisiología y Escalas Alométricas
              </h3>
              <p className="text-xs text-white/50">
                Leyes de escala biológica aplicadas a tu masa ({weightKg} kg)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
              <Heart className="w-4 h-4" />
              <span>1. Ritmo Cardíaco & Ciclo: Escalas x^(-1/4) y x^(1/4)</span>
            </div>
            <span className="font-mono text-xs text-white/40">West & Schmidt-Nielsen</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            En biología de sistemas, la frecuencia cardíaca de reposo disminuye con la masa corporal
            siguiendo la ley de cuarto de potencia:{' '}
            <strong className="text-white font-mono">f_HR ∝ M^(-1/4)</strong>. Paralelamente, la
            duración del ciclo cardíaco y la constante de recuperación post-esfuerzo escalan con{' '}
            <strong className="text-white font-mono">τ ∝ M^(1/4)</strong>.
          </p>
          <div className="bg-black/50 p-2.5 rounded-xl text-[11px] font-mono text-[#C0FF00] flex justify-between">
            <span>Tu RHR Alométrico: {allometricProfile.allometricRestingHr} bpm</span>
            <span>Ciclo τ: {allometricProfile.cardiacCycleDurationSec} s</span>
            <span>Recup. t½: {allometricProfile.cardiacRecoveryHalfLifeSec} s</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C0FF00] text-xs font-bold uppercase">
              <Flame className="w-4 h-4" />
              <span>2. Gasto Energético: Ley de Kleiber (x^3/4)</span>
            </div>
            <span className="font-mono text-xs text-white/40">Max Kleiber (1932)</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            El gasto metabólico basal y activo no escala linealmente (M^1) ni con la superficie
            (M^2/3), sino con <strong className="text-white font-mono">BMR ∝ M^(3/4)</strong>,
            debido a las restricciones hidrodinámicas de las redes capilares fractales. Esto permite
            una estimación calórica mucho más precisa durante las series.
          </p>
          <div className="bg-black/50 p-2.5 rounded-xl text-[11px] font-mono text-cyan-300 flex justify-between">
            <span>BMR Kleiber: {allometricProfile.kleiberBmrKcal} kcal/día</span>
            <span>TDEE Alométrico: {allometricProfile.allometricTdeeKcal} kcal/día</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase">
              <Scale className="w-4 h-4" />
              <span>3. Fuerza Alométrica Relativa: Escala x^(2/3)</span>
            </div>
            <span className="font-mono text-xs text-white/40">Jaric & Siff</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            La fuerza muscular máxima está determinada por el área de sección transversal del
            músculo (L^2), mientras que la masa corporal depende del volumen (L^3). Por tanto, la
            fuerza relativa biológicamente justa se normaliza mediante el índice{' '}
            <strong className="text-white font-mono">S = Carga / (M^(2/3))</strong>.
          </p>
          <div className="bg-black/50 p-2.5 rounded-xl text-[11px] font-mono text-indigo-300 flex justify-between">
            <span>Factor norm. 70kg: {allometricProfile.strengthScalingFactor}</span>
            <span>Cálculo: (70 / {weightKg})^(2/3)</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#C0FF00] text-black font-black text-xs rounded-xl hover:bg-[#aee600] transition-colors uppercase tracking-wider"
        >
          Entendido, volver a mi entrenamiento
        </button>
      </div>
    </div>
  );
};

export interface StrengthScoreData {
  allometricScore: number;
  normalized70kgLoad: number;
  classification: string;
}

interface ExerciseCardProps extends Omit<SetLoggerProps, 'hasNextExercise'> {
  exerciseIndex: number;
  totalExercises: number;
  loggedSets: LoggedSet[];
  onPrevExercise: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  totalExercises,
  activeSetIndex,
  loggedSets,
  currentWeight,
  currentReps,
  currentRpe,
  currentSensation,
  justLogged,
  strengthScore,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onSensationChange,
  onCompleteSet,
  onNextExercise,
  onPrevExercise,
}) => {
  const currentSetsOfExercise = loggedSets.filter((s) => s.exerciseId === exercise.id);
  const hasNextExercise = exerciseIndex < totalExercises - 1;

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#C0FF00] font-bold uppercase tracking-wider">
            Ejercicio {exerciseIndex + 1} de {totalExercises}
          </span>
          <span className="text-white/20">•</span>
          <span className="text-xs text-white/40 uppercase">{exercise.primaryMuscle}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevExercise}
            disabled={exerciseIndex === 0}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Ejercicio anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextExercise}
            disabled={!hasNextExercise}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Siguiente ejercicio"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
        <div className="md:col-span-8">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            {exercise.name}
          </h1>
          <p className="text-xs sm:text-sm text-white/70 bg-white/5 border border-white/5 p-3.5 rounded-2xl leading-relaxed">
            💡 <strong className="text-white">Indicación técnica:</strong> {exercise.technicalCue}
          </p>
        </div>

        <div className="md:col-span-4 bg-[#121212] rounded-2xl p-3 border border-white/10 text-center">
          {exercise.gifUrl || exercise.image ? (
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/50 flex items-center justify-center mb-2 border border-white/5">
              <img
                src={getExerciseGifUrl(exercise.gifUrl || exercise.image)}
                alt={exercise.name}
                loading="lazy"
                className="w-full h-full object-contain p-1"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 border border-[#C0FF00]/30 text-[9px] font-bold text-[#C0FF00]">
                GIF TÉCNICO
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#C0FF00]/10 text-[#C0FF00] mx-auto flex items-center justify-center mb-2 text-xl font-bold">
              🏋️‍♂️
            </div>
          )}
          <p className="text-[10px] text-white/40 uppercase font-semibold">Meta de la sesión</p>
          <p className="text-sm font-black text-white">
            {exercise.sets} series × {exercise.reps} reps
          </p>
          <p className="text-[11px] text-[#C0FF00] font-mono mt-0.5">
            Carga base: {exercise.suggestedWeightKg} kg
          </p>
        </div>
      </div>

      <SetLogger
        exercise={exercise}
        activeSetIndex={activeSetIndex}
        currentWeight={currentWeight}
        currentReps={currentReps}
        currentRpe={currentRpe}
        currentSensation={currentSensation}
        justLogged={justLogged}
        strengthScore={strengthScore}
        hasNextExercise={hasNextExercise}
        onWeightChange={onWeightChange}
        onRepsChange={onRepsChange}
        onRpeChange={onRpeChange}
        onSensationChange={onSensationChange}
        onCompleteSet={onCompleteSet}
        onNextExercise={onNextExercise}
      />

      {currentSetsOfExercise.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
            Series Registradas en este Ejercicio ({currentSetsOfExercise.length})
          </h4>

          <div className="space-y-2">
            {currentSetsOfExercise.map((set: LoggedSet, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#C0FF00]/10 text-[#C0FF00] font-bold flex items-center justify-center text-[10px]">
                    {set.setNumber}
                  </span>
                  <span>
                    <strong>{set.weightKg} kg</strong> × {set.reps} reps
                  </span>
                  <span className="text-white/40">• RPE {set.rpe}</span>
                </div>
                {set.sensation && (
                  <span className="text-[11px] text-white/50 italic truncate max-w-xs">
                    "{set.sensation}"
                  </span>
                )}
                <span className="text-[10px] text-white/30 font-mono">{set.completedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DEFAULT_AVERAGE_HR_BPM = 142;
const DEFAULT_PEAK_HR_BPM = 165;
const DEFAULT_ALLOMETRIC_POWER_W = 490;

const SESSION_RPE_VALUES = [6, 7, 7.5, 8, 8.5, 9, 10];

interface FinishWorkoutModalProps {
  isOpen: boolean;
  hasSummary: boolean;
  summary: WorkoutSessionLog | null;
  totalSetsLogged: number;
  elapsedSeconds: number;
  notes: string;
  sessionRpe: number;
  onNotesChange: (notes: string) => void;
  onSessionRpeChange: (rpe: number) => void;
  onClose: () => void;
  onConfirm: () => void;
  onGoHistory: () => void;
  onGoDashboard: () => void;
}

export const FinishWorkoutModal: React.FC<FinishWorkoutModalProps> = ({
  isOpen,
  hasSummary,
  summary,
  totalSetsLogged,
  elapsedSeconds,
  notes,
  sessionRpe,
  onNotesChange,
  onSessionRpeChange,
  onClose,
  onConfirm,
  onGoHistory,
  onGoDashboard,
}) => {
  const { dialogRef, handleBackdropClick } = useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasSummary ? 'finish-workout-summary-title' : 'finish-workout-modal-title'}
        className="bg-[#0A0A0A] border border-white/15 rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {!hasSummary ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C0FF00]/10 text-[#C0FF00] flex items-center justify-center font-bold text-xl">
                🏁
              </div>
              <div>
                <h3 id="finish-workout-modal-title" className="text-2xl font-black text-white">
                  ¿Finalizar Entrenamiento?
                </h3>
                <p className="text-xs text-white/50">
                  Has registrado {totalSetsLogged} series en {formatTime(elapsedSeconds)}.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">
                RPE Promedio de la Sesión Completa (1 - 10)
              </label>
              <div className="flex gap-2">
                {SESSION_RPE_VALUES.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onSessionRpeChange(val)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      sessionRpe === val
                        ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Observaciones o cómo te sentiste en general
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Ej. Sentí buena congestión pectoral, mantuve los descansos y no hubo dolor en hombro..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C0FF00] resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white/5 text-white/70 font-semibold text-xs rounded-xl hover:bg-white/10"
              >
                Seguir Entrenando
              </button>
              <button
                id="btn-confirm-finish-workout"
                onClick={onConfirm}
                className="flex-1 py-3.5 bg-[#C0FF00] text-black font-black text-xs sm:text-sm rounded-xl hover:bg-[#aee600] shadow-[0_0_20px_rgba(192,255,0,0.3)]"
              >
                Guardar Sesión
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-[#C0FF00] text-black flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(192,255,0,0.5)]">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-[#C0FF00]/10 text-[#C0FF00] text-[10px] font-bold uppercase rounded-full tracking-wider">
                ¡Entrenamiento Completado!
              </span>
              <h3 id="finish-workout-summary-title" className="text-3xl font-black text-white mt-2">
                {summary?.routineName}
              </h3>
              <p className="text-xs text-white/50 mt-1">Guardado en tu historial de progreso.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-bold">Duración</p>
                <p className="text-lg font-black text-white">{summary?.durationMinutes} min</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-bold">Series Totales</p>
                <p className="text-lg font-black text-white">{summary?.totalSets}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-bold">Volumen Total</p>
                <p className="text-lg font-black text-[#C0FF00]">
                  {summary?.totalVolumeKg ? formatVolumeKg(summary.totalVolumeKg) : '—'} kg
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-bold">
                  Calorías (Kleiber x^3/4)
                </p>
                <p className="text-lg font-black text-white">
                  {summary?.allometricCalories ?? summary?.caloriesBurned} kcal
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-bold">Ritmo Cardíaco</p>
                <p className="text-lg font-black text-red-400">
                  {summary?.averageHeartRate ?? DEFAULT_AVERAGE_HR_BPM}{' '}
                  <span className="text-xs text-white/40">BPM</span>
                </p>
                <p className="text-[10px] text-white/40">
                  Pico: {summary?.peakHeartRate ?? DEFAULT_PEAK_HR_BPM} BPM
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-bold">Potencia Media</p>
                <p className="text-lg font-black text-amber-400 font-mono">
                  {summary?.allometricPowerWatts ?? DEFAULT_ALLOMETRIC_POWER_W} W
                </p>
                <p className="text-[10px] text-white/40">Trabajo Metabólico</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-left">
              <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Feedback del Coach IA y Biometría</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed italic">
                "{summary?.aiCoachFeedback}"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onGoHistory}
                className="flex-1 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Ver en Historial
              </button>
              <button
                onClick={onGoDashboard}
                className="flex-1 py-3.5 bg-[#C0FF00] text-black font-black text-xs rounded-xl hover:bg-[#aee600] shadow-md"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface RestTimerBannerProps {
  isRestTimerActive: boolean;
  restTimerSeconds: number;
  onAdjust: (deltaSeconds: number) => void;
  onPause: () => void;
  onResume: () => void;
}

export const RestTimerBanner: React.FC<RestTimerBannerProps> = ({
  isRestTimerActive,
  restTimerSeconds,
  onAdjust,
  onPause,
  onResume,
}) => {
  if (!isRestTimerActive && restTimerSeconds <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#C0FF00]/15 via-black to-[#C0FF00]/10 border border-[#C0FF00]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#C0FF00] flex items-center justify-center text-black font-black">
          ⏱️
        </div>
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-wider">
            Temporizador de Descanso
          </p>
          <p className="text-[11px] text-white/60">
            Recuperación muscular sugerida para la siguiente serie.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-3xl font-black text-[#C0FF00]">
          {formatTime(restTimerSeconds)}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAdjust(30)}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white"
          >
            +30s
          </button>
          {isRestTimerActive ? (
            <button
              onClick={onPause}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              title="Pausar"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onResume}
              className="p-2 bg-[#C0FF00] text-black rounded-lg font-bold"
              title="Reanudar"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}
          <button
            onClick={() => onAdjust(-restTimerSeconds)}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white/60 hover:text-white"
          >
            Omitir
          </button>
        </div>
      </div>
    </div>
  );
};

interface SessionHeaderProps {
  routineName: string;
  dayNumber: number;
  elapsedSeconds: number;
  onFinish: () => void;
  onCancel: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  routineName,
  dayNumber,
  elapsedSeconds,
  onFinish,
  onCancel,
}) => {
  const timeText = formatTime(elapsedSeconds);

  return (
    <div className="flex items-center justify-between bg-[#0A0A0A] border border-white/10 p-4 sm:p-5 rounded-[24px]">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
              Entrenamiento en Vivo
            </span>
            <span className="text-[10px] bg-[#C0FF00]/10 text-[#C0FF00] px-2 py-0.5 rounded font-mono font-bold">
              Día {dayNumber}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white truncate">{routineName}</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-center">
          <Timer className="w-4 h-4 text-[#C0FF00]" />
          <span className="font-mono text-lg font-black text-white">{timeText}</span>
        </div>

        <button
          onClick={onFinish}
          className="px-4 py-2.5 bg-[#C0FF00] text-black font-black text-xs sm:text-sm rounded-xl hover:bg-[#aee600] transition-transform active:scale-95 shadow-[0_0_20px_rgba(192,255,0,0.3)]"
        >
          Finalizar Sesión
        </button>

        <button
          onClick={onCancel}
          className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title="Cancelar o salir"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const RPE_VALUES = [5, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export interface SetLoggerProps {
  exercise: Exercise;
  activeSetIndex: number;
  currentWeight: number;
  currentReps: number;
  currentRpe: number;
  currentSensation: string;
  justLogged: boolean;
  strengthScore: StrengthScoreData;
  hasNextExercise: boolean;
  onWeightChange: (weightKg: number) => void;
  onRepsChange: (reps: number) => void;
  onRpeChange: (rpe: number) => void;
  onSensationChange: (sensation: string) => void;
  onCompleteSet: () => void;
  onNextExercise: () => void;
}

export const SetLogger: React.FC<SetLoggerProps> = ({
  exercise,
  activeSetIndex,
  currentWeight,
  currentReps,
  currentRpe,
  currentSensation,
  justLogged,
  strengthScore,
  hasNextExercise,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onSensationChange,
  onCompleteSet,
  onNextExercise,
}) => {
  const rpeHint =
    currentRpe >= 9
      ? 'Cerca del fallo (0-1 rep en recámara)'
      : currentRpe >= 8
        ? 'Exigente (2 reps en recámara)'
        : 'Moderado (3+ reps en recámara)';

  return (
    <div className="bg-gradient-to-br from-white/5 to-transparent p-6 rounded-[28px] border border-white/10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#C0FF00] font-bold">
            Serie Actual
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Serie {activeSetIndex} <span className="text-sm text-white/40">de {exercise.sets}</span>
          </h3>
        </div>

        {justLogged && (
          <span className="px-3 py-1 bg-[#C0FF00] text-black font-bold text-xs rounded-full animate-bounce">
            ¡Serie Guardada! ✓
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#050505] p-4 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center text-xs text-white/50 mb-2">
            <span className="font-semibold uppercase tracking-wider">Peso Utilizado</span>
            <span className="text-[11px] text-[#C0FF00]">Kg</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              <button
                onClick={() => onWeightChange(Math.max(0, Number((currentWeight - 5).toFixed(1))))}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 text-xs font-bold transition-colors"
              >
                -5
              </button>
              <button
                onClick={() =>
                  onWeightChange(Math.max(0, Number((currentWeight - 2.5).toFixed(1))))
                }
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 text-xs font-bold transition-colors"
              >
                -2.5
              </button>
            </div>

            <input
              type="number"
              step="0.5"
              value={currentWeight}
              onChange={(e) => onWeightChange(Number(e.target.value))}
              className="w-24 text-center font-black text-2xl text-white bg-transparent focus:outline-none"
            />

            <div className="flex gap-1.5">
              <button
                onClick={() => onWeightChange(Number((currentWeight + 2.5).toFixed(1)))}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 text-xs font-bold transition-colors"
              >
                +2.5
              </button>
              <button
                onClick={() => onWeightChange(Number((currentWeight + 5).toFixed(1)))}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 text-xs font-bold transition-colors"
              >
                +5
              </button>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-white/60">
              <Scale className="w-3.5 h-3.5 text-[#C0FF00]" />
              <span>Índice Alométrico S (x^2/3):</span>
              <span className="font-mono font-bold text-white">
                {strengthScore.allometricScore}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">
                Eq. 70kg:{' '}
                <strong className="text-[#C0FF00] font-mono">
                  {strengthScore.normalized70kgLoad} kg
                </strong>
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-white/70 border border-white/10">
                {strengthScore.classification}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#050505] p-4 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center text-xs text-white/50 mb-2">
            <span className="font-semibold uppercase tracking-wider">Repeticiones Hechas</span>
            <span className="text-[11px] text-[#C0FF00]">Reps</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onRepsChange(Math.max(1, currentReps - 1))}
              aria-label="Disminuir repeticiones"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="number"
              value={currentReps}
              onChange={(e) => onRepsChange(Number(e.target.value))}
              className="w-20 text-center font-black text-2xl text-white bg-transparent focus:outline-none"
            />

            <button
              onClick={() => onRepsChange(currentReps + 1)}
              aria-label="Aumentar repeticiones"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-semibold text-white/70">
            Esfuerzo Percibido (RPE 1-10):{' '}
            <strong className="text-[#C0FF00] font-black">{currentRpe}</strong>
          </span>
          <span className="text-[11px] text-white/40">{rpeHint}</span>
        </div>

        <div className="flex gap-1 sm:gap-2">
          {RPE_VALUES.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onRpeChange(val)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                currentRpe === val
                  ? 'bg-[#C0FF00] text-black border-[#C0FF00] shadow-[0_0_10px_rgba(192,255,0,0.4)]'
                  : 'bg-[#050505] text-white/60 border-white/10 hover:bg-white/10'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1.5">
          Sensaciones o notas de la serie (Opcional)
        </label>
        <input
          type="text"
          value={currentSensation}
          onChange={(e) => onSensationChange(e.target.value)}
          placeholder="Ej. Buena congestión, velocidad de barra óptima, sin molestia articular..."
          className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C0FF00] placeholder:text-white/30"
        />
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          id="btn-complete-active-set"
          onClick={onCompleteSet}
          className="flex-1 py-4 bg-[#C0FF00] text-black font-black text-base rounded-2xl hover:bg-[#aee600] active:scale-[0.98] transition-transform shadow-[0_0_30px_rgba(192,255,0,0.3)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>COMPLETAR SERIE {activeSetIndex}</span>
        </button>

        {hasNextExercise && (
          <button
            onClick={onNextExercise}
            className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <span>Siguiente Ejercicio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export interface LiveCaloriesData {
  allometricCalories: number;
  metabolicPowerWatts: number;
}

interface TelemetryPanelProps {
  weightKg: number;
  allometricProfile: AllometricProfile;
  dynamicTelemetry: ReturnType<typeof computeDynamicHeartRate>;
  liveCaloriesData: LiveCaloriesData;
  onShowInfo: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  weightKg,
  allometricProfile,
  dynamicTelemetry,
  liveCaloriesData,
  onShowInfo,
}) => {
  const hrrPercent = Math.round(
    ((dynamicTelemetry.currentBpm - allometricProfile.allometricRestingHr) /
      allometricProfile.heartRateReserve) *
      100
  );

  return (
    <div className="bg-gradient-to-r from-[#0E0E0E] via-[#0A0A0A] to-[#121212] border border-white/10 rounded-[24px] p-4 sm:p-5 shadow-xl relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Telemetría Alométrica en Vivo
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono font-bold">
                Escala M^(-1/4) & M^(3/4)
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Fisiología calculada para {weightKg} kg • RHR basal:{' '}
              {allometricProfile.allometricRestingHr} bpm
            </p>
          </div>
        </div>

        <button
          onClick={onShowInfo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#C0FF00] transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Ciencia de Escalas (x^3/4 & x^1/4)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        <div className="bg-black/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/30 bg-red-500/10"
                style={{
                  animation: `pulse ${Math.max(0.4, 60 / dynamicTelemetry.currentBpm)}s infinite ease-in-out`,
                }}
              >
                <Heart className="w-5 h-5 fill-red-500/80 text-red-400" />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                Ritmo Cardíaco Dinámico
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white font-mono">
                  {dynamicTelemetry.currentBpm}
                </span>
                <span className="text-xs text-white/50 font-bold">BPM</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-black uppercase"
              style={{ backgroundColor: dynamicTelemetry.zone.color }}
            >
              {dynamicTelemetry.zone.name.split(':')[0]}
            </span>
            <p className="text-[10px] text-white/50 mt-1">{hrrPercent}% HRR</p>
          </div>
        </div>

        <div className="bg-black/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#C0FF00] border border-[#C0FF00]/30 bg-[#C0FF00]/10">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                Gasto Energético Kleiber (x^3/4)
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#C0FF00] font-mono">
                  {liveCaloriesData.allometricCalories}
                </span>
                <span className="text-xs text-white/50 font-bold">kcal</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-black text-amber-400">
              {liveCaloriesData.metabolicPowerWatts} W
            </span>
            <p className="text-[10px] text-white/50 mt-0.5">Potencia Media</p>
          </div>
        </div>

        <div className="bg-black/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-400/30 bg-cyan-400/10">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                Ciclo Cardíaco τ (x^1/4)
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white font-mono">
                  {allometricProfile.cardiacCycleDurationSec}
                </span>
                <span className="text-xs text-white/50 font-bold">s / latido</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-cyan-300">
              t½ {allometricProfile.cardiacRecoveryHalfLifeSec}s
            </span>
            <p className="text-[10px] text-white/50 mt-0.5">Recup. 50%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ActiveWorkoutView: React.FC = () => {
  const {
    user,
    allometricProfile,
    activeRoutine,
    activeExerciseIndex,
    activeSetIndex,
    activeWorkoutSets,
    workoutElapsedTime,
    restTimerSeconds,
    isRestTimerActive,
    logActiveSet,
    goToNextExercise,
    goToPreviousExercise,
    startRestTimer,
    pauseRestTimer,
    adjustRestTimer,
    finishWorkout,
    cancelWorkout,
    navigateTo,
  } = useApp();

  const isMobile = useIsMobile();

  // Current exercise fallback
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

  // Local set input states initialized from suggested values
  const [currentWeight, setCurrentWeight] = useState<number>(
    currentExercise.suggestedWeightKg || 80
  );
  const [currentReps, setCurrentReps] = useState<number>(8);
  const [currentRpe, setCurrentRpe] = useState<number>(8);
  const [currentSensation, setCurrentSensation] = useState<string>('');
  const [justLogged, setJustLogged] = useState<boolean>(false);

  // Allometric Heart Rate & Telemetry dynamic states
  const [lastPeakBpm, setLastPeakBpm] = useState<number>(158);
  const [sessionPeakBpm, setSessionPeakBpm] = useState<number>(164);
  const [bpmReadings, setBpmReadings] = useState<number[]>([]);
  const [showAllometricInfoModal, setShowAllometricInfoModal] = useState<boolean>(false);

  // Summary finish modal state
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<WorkoutSessionLog | null>(null);
  const [finalNotes, setFinalNotes] = useState<string>('');
  const [sessionRpe, setSessionRpe] = useState<number>(8);

  // Sync state when exercise changes
  useEffect(() => {
    if (currentExercise) {
      setCurrentWeight(currentExercise.suggestedWeightKg || 60);
      const parsedReps = parseInt(currentExercise.reps.split('-')[0]) || 10;
      setCurrentReps(parsedReps);
      setCurrentRpe(currentExercise.rpe || 8);
      setCurrentSensation('');
    }
  }, [activeExerciseIndex, currentExercise]);

  // Dynamic Heart Rate Telemetry calculated using allometric scaling
  const dynamicTelemetry = useMemo(() => {
    const elapsedRest = isRestTimerActive ? 90 - restTimerSeconds : 0;
    return computeDynamicHeartRate(
      allometricProfile,
      isRestTimerActive,
      currentRpe,
      Math.max(0, elapsedRest),
      currentExercise.primaryMuscle,
      lastPeakBpm
    );
  }, [
    allometricProfile,
    isRestTimerActive,
    currentRpe,
    restTimerSeconds,
    currentExercise.primaryMuscle,
    lastPeakBpm,
  ]);

  // Track peak HR and average HR periodically
  useEffect(() => {
    const currentBpm = dynamicTelemetry.currentBpm;
    setBpmReadings((prev) => [...prev.slice(-60), currentBpm]);
    if (currentBpm > sessionPeakBpm) {
      setSessionPeakBpm(currentBpm);
    }
    if (!isRestTimerActive && currentBpm > lastPeakBpm) {
      setLastPeakBpm(currentBpm);
    }
  }, [dynamicTelemetry.currentBpm, isRestTimerActive, lastPeakBpm, sessionPeakBpm]);

  // Live Allometric Calories (Kleiber's Law M^(3/4))
  const liveCaloriesData = useMemo(() => {
    const durationMin = Math.max(1, Math.round(workoutElapsedTime / 60));
    return calculateAllometricWorkoutCalories(
      user.weight,
      durationMin,
      currentRpe,
      activeWorkoutSets.length
    );
  }, [user.weight, workoutElapsedTime, currentRpe, activeWorkoutSets.length]);

  // Real-time Allometric Strength Score for the current weight
  const currentStrengthScore = useMemo(() => {
    return calculateAllometricStrengthScore(currentWeight, user.weight);
  }, [currentWeight, user.weight]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    logActiveSet(currentWeight, currentReps, currentRpe, currentSensation);
    setJustLogged(true);
    setCurrentSensation('');
    setTimeout(() => setJustLogged(false), 2000);
  };

  const handleOpenFinishModal = () => {
    setShowSummaryModal(true);
  };

  const handleConfirmFinish = () => {
    const avgHr =
      bpmReadings.length > 0
        ? Math.round(bpmReadings.reduce((a, b) => a + b, 0) / bpmReadings.length)
        : Math.round(
            allometricProfile.allometricRestingHr + allometricProfile.heartRateReserve * 0.68
          );
    const maxHr = Math.max(sessionPeakBpm, dynamicTelemetry.currentBpm);

    const session = finishWorkout(finalNotes, sessionRpe, avgHr, maxHr);
    setSummaryData(session);
  };

  const totalExercises = activeRoutine?.exercises.length || 6;
  const currentSetsOfExercise = activeWorkoutSets.filter(
    (s) => s.exerciseId === currentExercise.id
  );

  // En móvil (gimnasio): flujo con UN solo botón.
  if (isMobile) {
    return <MobileSessionView />;
  }

  return (
    <div className="flex-1 p-4 sm:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full relative">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C0FF00]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Session Bar: Timer, Routine Name, Cancel / Finish */}
      <div className="flex items-center justify-between bg-[#0A0A0A] border border-white/10 p-4 sm:p-5 rounded-[24px]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                Entrenamiento en Vivo
              </span>
              <span className="text-[10px] bg-[#C0FF00]/10 text-[#C0FF00] px-2 py-0.5 rounded font-mono font-bold">
                Día {activeRoutine?.dayNumber || 1}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white truncate">
              {activeRoutine?.name || 'Empuje Dinámico'}
            </h2>
          </div>
        </div>

        {/* Stopwatch Timer */}
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-center">
            <Timer className="w-4 h-4 text-[#C0FF00]" />
            <span className="font-mono text-lg font-black text-white">
              {formatTime(workoutElapsedTime)}
            </span>
          </div>

          <button
            onClick={handleOpenFinishModal}
            className="px-4 py-2.5 bg-[#C0FF00] text-black font-black text-xs sm:text-sm rounded-xl hover:bg-[#aee600] transition-transform active:scale-95 shadow-[0_0_20px_rgba(192,255,0,0.3)]"
          >
            Finalizar Sesión
          </button>

          <button
            onClick={cancelWorkout}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Cancelar o salir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Telemetría Fisiológica Alométrica en Vivo (Escala x^(3/4), x^(-1/4) y x^(1/4)) */}
      <div className="bg-gradient-to-r from-[#0E0E0E] via-[#0A0A0A] to-[#121212] border border-white/10 rounded-[24px] p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Telemetría Alométrica en Vivo
                </span>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono font-bold">
                  Escala M^(-1/4) & M^(3/4)
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Fisiología calculada para {user.weight} kg • RHR basal:{' '}
                {allometricProfile.allometricRestingHr} bpm
              </p>
            </div>
          </div>

          {/* Botón info de escalas */}
          <button
            onClick={() => setShowAllometricInfoModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#C0FF00] transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Ciencia de Escalas (x^3/4 & x^1/4)</span>
          </button>
        </div>

        {/* 3 Live Telemetry Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          {/* Card 1: Dynamic Heart Rate & Zone */}
          <div className="bg-black/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/30 bg-red-500/10"
                  style={{
                    animation: `pulse ${Math.max(0.4, 60 / dynamicTelemetry.currentBpm)}s infinite ease-in-out`,
                  }}
                >
                  <Heart className="w-5 h-5 fill-red-500/80 text-red-400" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  Ritmo Cardíaco Dinámico
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono">
                    {dynamicTelemetry.currentBpm}
                  </span>
                  <span className="text-xs text-white/50 font-bold">BPM</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-black uppercase"
                style={{ backgroundColor: dynamicTelemetry.zone.color }}
              >
                {dynamicTelemetry.zone.name.split(':')[0]}
              </span>
              <p className="text-[10px] text-white/50 mt-1">
                {Math.round(
                  ((dynamicTelemetry.currentBpm - allometricProfile.allometricRestingHr) /
                    allometricProfile.heartRateReserve) *
                    100
                )}
                % HRR
              </p>
            </div>
          </div>

          {/* Card 2: Kleiber's Law Calories & Power */}
          <div className="bg-black/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#C0FF00] border border-[#C0FF00]/30 bg-[#C0FF00]/10">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  Gasto Energético Kleiber (x^3/4)
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#C0FF00] font-mono">
                    {liveCaloriesData.allometricCalories}
                  </span>
                  <span className="text-xs text-white/50 font-bold">kcal</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-black text-amber-400">
                {liveCaloriesData.metabolicPowerWatts} W
              </span>
              <p className="text-[10px] text-white/50 mt-0.5">Potencia Media</p>
            </div>
          </div>

          {/* Card 3: Cardiac Cycle & Recovery Half-life */}
          <div className="bg-black/60 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-400/30 bg-cyan-400/10">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  Ciclo Cardíaco τ (x^1/4)
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white font-mono">
                    {allometricProfile.cardiacCycleDurationSec}
                  </span>
                  <span className="text-xs text-white/50 font-bold">s / latido</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyan-300">
                t½ {allometricProfile.cardiacRecoveryHalfLifeSec}s
              </span>
              <p className="text-[10px] text-white/50 mt-0.5">Recup. 50%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rest Timer Banner (shows when active or resting) */}
      {(isRestTimerActive || restTimerSeconds > 0) && (
        <div className="bg-gradient-to-r from-[#C0FF00]/15 via-black to-[#C0FF00]/10 border border-[#C0FF00]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C0FF00] flex items-center justify-center text-black font-black">
              ⏱️
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Temporizador de Descanso
              </p>
              <p className="text-[11px] text-white/60">
                Recuperación muscular sugerida para la siguiente serie.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-3xl font-black text-[#C0FF00]">
              {formatTime(restTimerSeconds)}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustRestTimer(30)}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white"
              >
                +30s
              </button>
              {isRestTimerActive ? (
                <button
                  onClick={pauseRestTimer}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                  title="Pausar"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => startRestTimer(restTimerSeconds || 60)}
                  className="p-2 bg-[#C0FF00] text-black rounded-lg font-bold"
                  title="Reanudar"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              )}
              <button
                onClick={() => adjustRestTimer(-restTimerSeconds)}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white/60 hover:text-white"
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Focus Exercise Card */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#C0FF00] font-bold uppercase tracking-wider">
              Ejercicio {activeExerciseIndex + 1} de {totalExercises}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/40 uppercase">{currentExercise.primaryMuscle}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousExercise}
              disabled={activeExerciseIndex === 0}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Ejercicio anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextExercise}
              disabled={activeExerciseIndex >= totalExercises - 1}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Siguiente ejercicio"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exercise Visual Title & Cue */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
          <div className="md:col-span-8">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              {currentExercise.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 bg-white/5 border border-white/5 p-3.5 rounded-2xl leading-relaxed">
              💡 <strong className="text-white">Indicación técnica:</strong>{' '}
              {currentExercise.technicalCue}
            </p>
          </div>

          <div className="md:col-span-4 bg-[#121212] rounded-2xl p-3 border border-white/10 text-center">
            {currentExercise.gifUrl || currentExercise.image ? (
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/50 flex items-center justify-center mb-2 border border-white/5">
                <img
                  src={getExerciseGifUrl(currentExercise.gifUrl || currentExercise.image)}
                  alt={currentExercise.name}
                  className="w-full h-full object-contain p-1"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 border border-[#C0FF00]/30 text-[9px] font-bold text-[#C0FF00]">
                  GIF TÉCNICO
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#C0FF00]/10 text-[#C0FF00] mx-auto flex items-center justify-center mb-2 text-xl font-bold">
                🏋️‍♂️
              </div>
            )}
            <p className="text-[10px] text-white/40 uppercase font-semibold">Meta de la sesión</p>
            <p className="text-sm font-black text-white">
              {currentExercise.sets} series × {currentExercise.reps} reps
            </p>
            <p className="text-[11px] text-[#C0FF00] font-mono mt-0.5">
              Carga base: {currentExercise.suggestedWeightKg} kg
            </p>
          </div>
        </div>

        {/* ACTIVE SET LOGGING CONTROLS */}
        <div className="bg-gradient-to-br from-white/5 to-transparent p-6 rounded-[28px] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#C0FF00] font-bold">
                Serie Actual
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Serie {activeSetIndex}{' '}
                <span className="text-sm text-white/40">de {currentExercise.sets}</span>
              </h3>
            </div>

            {justLogged && (
              <span className="px-3 py-1 bg-[#C0FF00] text-black font-bold text-xs rounded-full animate-bounce">
                ¡Serie Guardada! ✓
              </span>
            )}
          </div>

          {/* Steppers for Weight & Reps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weight Stepper */}
            <div className="bg-[#050505] p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center text-xs text-white/50 mb-2">
                <span className="font-semibold uppercase tracking-wider">Peso Utilizado</span>
                <span className="text-[11px] text-[#C0FF00]">Kg</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentWeight((w) => Math.max(0, Number((w - 5).toFixed(1))))}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 text-xs font-bold transition-colors"
                  >
                    -5
                  </button>
                  <button
                    onClick={() =>
                      setCurrentWeight((w) => Math.max(0, Number((w - 2.5).toFixed(1))))
                    }
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 text-xs font-bold transition-colors"
                  >
                    -2.5
                  </button>
                </div>

                <input
                  type="number"
                  step="0.5"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Number(e.target.value))}
                  className="w-24 text-center font-black text-2xl text-white bg-transparent focus:outline-none"
                />

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentWeight((w) => Number((w + 2.5).toFixed(1)))}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 text-xs font-bold transition-colors"
                  >
                    +2.5
                  </button>
                  <button
                    onClick={() => setCurrentWeight((w) => Number((w + 5).toFixed(1)))}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 text-xs font-bold transition-colors"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Indicador Alométrico de Fuerza en Tiempo Real */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Scale className="w-3.5 h-3.5 text-[#C0FF00]" />
                  <span>Índice Alométrico S (x^2/3):</span>
                  <span className="font-mono font-bold text-white">
                    {currentStrengthScore.allometricScore}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40">
                    Eq. 70kg:{' '}
                    <strong className="text-[#C0FF00] font-mono">
                      {currentStrengthScore.normalized70kgLoad} kg
                    </strong>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-white/70 border border-white/10">
                    {currentStrengthScore.classification}
                  </span>
                </div>
              </div>
            </div>

            {/* Reps Stepper */}
            <div className="bg-[#050505] p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between items-center text-xs text-white/50 mb-2">
                <span className="font-semibold uppercase tracking-wider">Repeticiones Hechas</span>
                <span className="text-[11px] text-[#C0FF00]">Reps</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentReps((r) => Math.max(1, r - 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(Number(e.target.value))}
                  className="w-20 text-center font-black text-2xl text-white bg-transparent focus:outline-none"
                />

                <button
                  onClick={() => setCurrentReps((r) => r + 1)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RPE Selector (1-10) */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-white/70">
                Esfuerzo Percibido (RPE 1-10):{' '}
                <strong className="text-[#C0FF00] font-black">{currentRpe}</strong>
              </span>
              <span className="text-[11px] text-white/40">
                {currentRpe >= 9
                  ? 'Cerca del fallo (0-1 rep en recámara)'
                  : currentRpe >= 8
                    ? 'Exigente (2 reps en recámara)'
                    : 'Moderado (3+ reps en recámara)'}
              </span>
            </div>

            <div className="flex gap-1 sm:gap-2">
              {[5, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCurrentRpe(val)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    currentRpe === val
                      ? 'bg-[#C0FF00] text-black border-[#C0FF00] shadow-[0_0_10px_rgba(192,255,0,0.4)]'
                      : 'bg-[#050505] text-white/60 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Sensation / Notes field */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Sensaciones o notas de la serie (Opcional)
            </label>
            <input
              type="text"
              value={currentSensation}
              onChange={(e) => setCurrentSensation(e.target.value)}
              placeholder="Ej. Buena congestión, velocidad de barra óptima, sin molestia articular..."
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C0FF00] placeholder:text-white/30"
            />
          </div>

          {/* Log Set Primary Button */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              id="btn-complete-active-set"
              onClick={handleCompleteSet}
              className="flex-1 py-4 bg-[#C0FF00] text-black font-black text-base rounded-2xl hover:bg-[#aee600] active:scale-[0.98] transition-transform shadow-[0_0_30px_rgba(192,255,0,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>COMPLETAR SERIE {activeSetIndex}</span>
            </button>

            {activeExerciseIndex < totalExercises - 1 && (
              <button
                onClick={goToNextExercise}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <span>Siguiente Ejercicio</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Previous Completed Sets for this exercise */}
        {currentSetsOfExercise.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
              Series Registradas en este Ejercicio ({currentSetsOfExercise.length})
            </h4>

            <div className="space-y-2">
              {currentSetsOfExercise.map((set: LoggedSet, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#C0FF00]/10 text-[#C0FF00] font-bold flex items-center justify-center text-[10px]">
                      {set.setNumber}
                    </span>
                    <span>
                      <strong>{set.weightKg} kg</strong> × {set.reps} reps
                    </span>
                    <span className="text-white/40">• RPE {set.rpe}</span>
                  </div>
                  {set.sensation && (
                    <span className="text-[11px] text-white/50 italic truncate max-w-xs">
                      "{set.sensation}"
                    </span>
                  )}
                  <span className="text-[10px] text-white/30 font-mono">{set.completedAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FINISH WORKOUT CONFIRMATION & SUMMARY MODAL */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {!summaryData ? (
              // Step 1: Pre-finish Form
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#C0FF00]/10 text-[#C0FF00] flex items-center justify-center font-bold text-xl">
                    🏁
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">¿Finalizar Entrenamiento?</h3>
                    <p className="text-xs text-white/50">
                      Has registrado {activeWorkoutSets.length} series en{' '}
                      {formatTime(workoutElapsedTime)}.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">
                    RPE Promedio de la Sesión Completa (1 - 10)
                  </label>
                  <div className="flex gap-2">
                    {[6, 7, 7.5, 8, 8.5, 9, 10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSessionRpe(val)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          sessionRpe === val
                            ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                            : 'bg-white/5 text-white/60 border-white/10'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Observaciones o cómo te sentiste en general
                  </label>
                  <textarea
                    rows={3}
                    value={finalNotes}
                    onChange={(e) => setFinalNotes(e.target.value)}
                    placeholder="Ej. Sentí buena congestión pectoral, mantuve los descansos y no hubo dolor en hombro..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C0FF00] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowSummaryModal(false)}
                    className="flex-1 py-3 bg-white/5 text-white/70 font-semibold text-xs rounded-xl hover:bg-white/10"
                  >
                    Seguir Entrenando
                  </button>
                  <button
                    id="btn-confirm-finish-workout"
                    onClick={handleConfirmFinish}
                    className="flex-1 py-3.5 bg-[#C0FF00] text-black font-black text-xs sm:text-sm rounded-xl hover:bg-[#aee600] shadow-[0_0_20px_rgba(192,255,0,0.3)]"
                  >
                    Guardar Sesión
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: Post-workout Summary Card & AI Coach Feedback
              <div className="space-y-6 text-center animate-fadeIn">
                <div className="w-16 h-16 rounded-3xl bg-[#C0FF00] text-black flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(192,255,0,0.5)]">
                  <Trophy className="w-8 h-8" />
                </div>

                <div>
                  <span className="px-3 py-1 bg-[#C0FF00]/10 text-[#C0FF00] text-[10px] font-bold uppercase rounded-full tracking-wider">
                    ¡Entrenamiento Completado!
                  </span>
                  <h3 className="text-3xl font-black text-white mt-2">{summaryData.routineName}</h3>
                  <p className="text-xs text-white/50 mt-1">
                    Guardado en tu historial de progreso.
                  </p>
                </div>

                {/* 6 Summary Stat Boxes with Allometric Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold">Duración</p>
                    <p className="text-lg font-black text-white">
                      {summaryData.durationMinutes} min
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold">Series Totales</p>
                    <p className="text-lg font-black text-white">{summaryData.totalSets}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold">Volumen Total</p>
                    <p className="text-lg font-black text-[#C0FF00]">
                      {summaryData.totalVolumeKg.toLocaleString()} kg
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold">
                      Calorías (Kleiber x^3/4)
                    </p>
                    <p className="text-lg font-black text-white">
                      {summaryData.allometricCalories || summaryData.caloriesBurned} kcal
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold">Ritmo Cardíaco</p>
                    <p className="text-lg font-black text-red-400">
                      {summaryData.averageHeartRate || 142}{' '}
                      <span className="text-xs text-white/40">BPM</span>
                    </p>
                    <p className="text-[10px] text-white/40">
                      Pico: {summaryData.peakHeartRate || 165} BPM
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold">Potencia Media</p>
                    <p className="text-lg font-black text-amber-400 font-mono">
                      {summaryData.allometricPowerWatts || 490} W
                    </p>
                    <p className="text-[10px] text-white/40">Trabajo Metabólico</p>
                  </div>
                </div>

                {/* AI Coach Feedback Quote */}
                <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-left">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Feedback del Coach IA y Biometría</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed italic">
                    "{summaryData.aiCoachFeedback}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowSummaryModal(false);
                      setSummaryData(null);
                      navigateTo('history');
                    }}
                    className="flex-1 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Ver en Historial
                  </button>
                  <button
                    onClick={() => {
                      setShowSummaryModal(false);
                      setSummaryData(null);
                      navigateTo('dashboard');
                    }}
                    className="flex-1 py-3.5 bg-[#C0FF00] text-black font-black text-xs rounded-xl hover:bg-[#aee600] shadow-md"
                  >
                    Volver al Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Didáctico: Fundamentos de Escalas Alométricas (x^3/4, x^1/4, x^2/3) */}
      {showAllometricInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-[28px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#C0FF00]/10 text-[#C0FF00] border border-[#C0FF00]/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Fisiología y Escalas Alométricas
                  </h3>
                  <p className="text-xs text-white/50">
                    Leyes de escala biológica aplicadas a tu masa ({user.weight} kg)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAllometricInfoModal(false)}
                className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scale 1: Quarter-power law for heart rate */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
                  <Heart className="w-4 h-4" />
                  <span>1. Ritmo Cardíaco & Ciclo: Escalas x^(-1/4) y x^(1/4)</span>
                </div>
                <span className="font-mono text-xs text-white/40">West & Schmidt-Nielsen</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                En biología de sistemas, la frecuencia cardíaca de reposo disminuye con la masa
                corporal siguiendo la ley de cuarto de potencia:{' '}
                <strong className="text-white font-mono">f_HR ∝ M^(-1/4)</strong>. Paralelamente, la
                duración del ciclo cardíaco y la constante de recuperación post-esfuerzo escalan con{' '}
                <strong className="text-white font-mono">τ ∝ M^(1/4)</strong>.
              </p>
              <div className="bg-black/50 p-2.5 rounded-xl text-[11px] font-mono text-[#C0FF00] flex justify-between">
                <span>Tu RHR Alométrico: {allometricProfile.allometricRestingHr} bpm</span>
                <span>Ciclo τ: {allometricProfile.cardiacCycleDurationSec} s</span>
                <span>Recup. t½: {allometricProfile.cardiacRecoveryHalfLifeSec} s</span>
              </div>
            </div>

            {/* Scale 2: Kleiber's Law 3/4 */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#C0FF00] text-xs font-bold uppercase">
                  <Flame className="w-4 h-4" />
                  <span>2. Gasto Energético: Ley de Kleiber (x^3/4)</span>
                </div>
                <span className="font-mono text-xs text-white/40">Max Kleiber (1932)</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                El gasto metabólico basal y activo no escala linealmente (M^1) ni con la superficie
                (M^2/3), sino con <strong className="text-white font-mono">BMR ∝ M^(3/4)</strong>,
                debido a las restricciones hidrodinámicas de las redes capilares fractales. Esto
                permite una estimación calórica mucho más precisa durante las series.
              </p>
              <div className="bg-black/50 p-2.5 rounded-xl text-[11px] font-mono text-cyan-300 flex justify-between">
                <span>BMR Kleiber: {allometricProfile.kleiberBmrKcal} kcal/día</span>
                <span>TDEE Alométrico: {allometricProfile.allometricTdeeKcal} kcal/día</span>
              </div>
            </div>

            {/* Scale 3: Geometric 2/3 for strength */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase">
                  <Scale className="w-4 h-4" />
                  <span>3. Fuerza Alométrica Relativa: Escala x^(2/3)</span>
                </div>
                <span className="font-mono text-xs text-white/40">Jaric & Siff</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                La fuerza muscular máxima está determinada por el área de sección transversal del
                músculo (L^2), mientras que la masa corporal depende del volumen (L^3). Por tanto,
                la fuerza relativa biológicamente justa se normaliza mediante el índice{' '}
                <strong className="text-white font-mono">S = Carga / (M^(2/3))</strong>.
              </p>
              <div className="bg-black/50 p-2.5 rounded-xl text-[11px] font-mono text-indigo-300 flex justify-between">
                <span>Factor norm. 70kg: {allometricProfile.strengthScalingFactor}</span>
                <span>Cálculo: (70 / {user.weight})^(2/3)</span>
              </div>
            </div>

            <button
              onClick={() => setShowAllometricInfoModal(false)}
              className="w-full py-3 bg-[#C0FF00] text-black font-black text-xs rounded-xl hover:bg-[#aee600] transition-colors uppercase tracking-wider"
            >
              Entendido, volver a mi entrenamiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
