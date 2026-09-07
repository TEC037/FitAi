import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Layers,
  Plus,
  Dumbbell,
  Info,
  ArrowLeftRight,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { Exercise, DatasetExercise } from '../types';
import {
  datasetToRoutineExercise,
  getExerciseImageUrl,
  getExerciseGifUrl,
} from '../services/exerciseDatabaseService';
import { ExerciseDatabaseView } from './ExerciseDatabaseView';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { useIsMobile } from '../hooks/useIsMobile';

interface RoutineExerciseRowProps {
  exercise: Exercise;
  index: number;
  isDone: boolean;
  canRemove: boolean;
  onToggleComplete: () => void;
  onShowDetails: () => void;
  onSwap: () => void;
  onRemove: () => void;
}

export const RoutineExerciseRow: React.FC<RoutineExerciseRowProps> = ({
  exercise: ex,
  index,
  isDone,
  canRemove,
  onToggleComplete,
  onShowDetails,
  onSwap,
  onRemove,
}) => {
  const imageUrl = getExerciseImageUrl(ex.image || ex.gifUrl);
  const gifUrl = getExerciseGifUrl(ex.gifUrl || ex.image);

  return (
    <div
      className={`p-5 rounded-[24px] border transition-all ${
        isDone
          ? 'bg-white/5 border-[#C0FF00]/40 opacity-75'
          : 'bg-[#0A0A0A] border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Column: Index, Media Thumbnail, Name, Technical Cue */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-[#C0FF00] shrink-0">
            {index + 1}
          </div>

          {/* Dataset visual thumbnail */}
          <div
            onClick={onShowDetails}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer group hover:border-[#C0FF00]/50 transition-colors"
            title="Haz clic para ver animación GIF"
          >
            {ex.image || ex.gifUrl ? (
              <img
                src={imageUrl}
                alt={ex.name}
                loading="lazy"
                className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform"
                onError={(e) => {
                  if (ex.gifUrl && e.currentTarget.src !== gifUrl) {
                    e.currentTarget.src = gifUrl;
                  }
                }}
              />
            ) : (
              <Dumbbell className="w-6 h-6 text-white/40" />
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Play className="w-4 h-4 text-[#C0FF00] fill-current" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-base sm:text-lg font-bold text-white capitalize truncate">
                {ex.name}
              </h4>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] uppercase font-bold text-white/60 shrink-0">
                {ex.primaryMuscle}
              </span>
              {isDone && (
                <span className="px-2 py-0.5 rounded bg-[#C0FF00]/10 text-[#C0FF00] text-[10px] font-bold shrink-0">
                  Completado
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
              <strong className="text-white/80">Cue:</strong> {ex.technicalCue}
            </p>
          </div>
        </div>

        {/* Middle specs: Series, Reps, Weight, Rest */}
        <div className="grid grid-cols-4 gap-2 bg-white/5 p-3 rounded-2xl border border-white/5 text-center shrink-0">
          <div className="px-2">
            <p className="text-[9px] uppercase text-white/40 font-bold">Series</p>
            <p className="text-sm sm:text-base font-black text-white">{ex.sets}</p>
          </div>
          <div className="px-2">
            <p className="text-[9px] uppercase text-white/40 font-bold">Reps</p>
            <p className="text-sm sm:text-base font-black text-white">{ex.reps}</p>
          </div>
          <div className="px-2">
            <p className="text-[9px] uppercase text-white/40 font-bold">Carga</p>
            <p className="text-sm sm:text-base font-black text-[#C0FF00]">
              {ex.suggestedWeightKg} kg
            </p>
          </div>
          <div className="px-2">
            <p className="text-[9px] uppercase text-white/40 font-bold">Descanso</p>
            <p className="text-sm sm:text-base font-black text-white">{ex.restSeconds}s</p>
          </div>
        </div>

        {/* Right Actions: Details, Swap, Remove, Complete */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button
            onClick={onShowDetails}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 transition-colors flex items-center gap-1"
            title="Ver ficha biomecánica y animación GIF"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Detalles</span>
          </button>

          <button
            onClick={onSwap}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-[#C0FF00] text-xs font-semibold text-white/70 transition-colors flex items-center gap-1 border border-white/5"
            title="Sustituir por otro ejercicio del dataset"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sustituir</span>
          </button>

          {canRemove && (
            <button
              onClick={onRemove}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors border border-white/5"
              title="Quitar de la rutina"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onToggleComplete}
            className={`p-2 rounded-xl border transition-colors ${
              isDone
                ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
            }`}
            title={isDone ? 'Desmarcar' : 'Marcar como completado'}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface RoutineExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
  onAskCoach: () => void;
  onStartWorkout: () => void;
}

export const RoutineExerciseDetailModal: React.FC<RoutineExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onAskCoach,
  onStartWorkout,
}) => {
  const { dialogRef, handleBackdropClick } = useModalAccessibility(true, onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="routine-exercise-modal-title"
        className="bg-[#0A0A0A] border border-white/15 rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar ficha del ejercicio"
          className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="px-3 py-1 bg-[#C0FF00]/10 text-[#C0FF00] text-[10px] font-bold uppercase rounded-full tracking-wider border border-[#C0FF00]/20">
            Ficha Técnica Biomecánica
          </span>
          <h3
            id="routine-exercise-modal-title"
            className="text-2xl font-black text-white mt-2 capitalize"
          >
            {exercise.name}
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Equipo requerido: <span className="text-white/80">{exercise.equipment}</span> •
            Dificultad: <span className="capitalize text-white/80">{exercise.difficulty}</span>
          </p>
        </div>

        {/* Visual Animated GIF Demo Player */}
        {(exercise.gifUrl || exercise.image) && (
          <div className="relative w-full bg-[#121212] border border-white/10 rounded-2xl overflow-hidden mb-6 flex items-center justify-center min-h-[220px] max-h-[320px]">
            <img
              src={getExerciseGifUrl(exercise.gifUrl || exercise.image)}
              alt={exercise.name}
              className="w-full h-full max-h-[320px] object-contain p-2"
            />
            <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-white/70 flex items-center gap-1.5">
              <Play className="w-3 h-3 text-[#C0FF00] fill-current" />
              <span>Demostración técnica en bucle</span>
            </div>
          </div>
        )}

        {/* Target & Cue highlight */}
        <div className="p-4 rounded-2xl bg-[#C0FF00]/5 border border-[#C0FF00]/20 mb-6">
          <p className="text-[11px] uppercase tracking-wider font-bold text-[#C0FF00] mb-1">
            Cue del Coach IA
          </p>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            "{exercise.technicalCue}"
          </p>
        </div>

        {/* Step-by-step instructions */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
            Instrucciones Paso a Paso
          </h4>
          <div className="space-y-2.5">
            {exercise.fullInstructions.map((instruction, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-white/70">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {idx + 1}
                </span>
                <p className="pt-0.5">{instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>Errores Comunes a Evitar</span>
          </h4>
          <ul className="space-y-2">
            {exercise.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-white/60">
                <span className="text-red-400 font-bold">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Attribution footer */}
        <div className="text-[11px] text-white/40 border-t border-white/10 pt-3 mb-2 flex items-center justify-between">
          <span>
            {exercise.attribution ||
              '© Gym visual — Distribuido con licencia MIT en hasaneyldrm/exercises-dataset'}
          </span>
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onAskCoach}
            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-[#C0FF00]" />
            <span>Consultar Dudas con el Coach IA</span>
          </button>
          <button
            onClick={onStartWorkout}
            className="flex-1 py-3 px-4 bg-[#C0FF00] text-black text-xs font-black rounded-xl hover:bg-[#aee600] transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Entrenar Este Ejercicio Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface DatasetPickerModalProps {
  badge: string;
  title: string;
  subtitle: string;
  onClose: () => void;
  onSelect: (item: DatasetExercise) => void;
}

export const DatasetPickerModal: React.FC<DatasetPickerModalProps> = ({
  badge,
  title,
  subtitle,
  onClose,
  onSelect,
}) => {
  const { dialogRef, handleBackdropClick } = useModalAccessibility(true, onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dataset-picker-modal-title"
        className="bg-[#0A0A0A] border border-white/15 rounded-[32px] max-w-6xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative"
      >
        <div className="flex items-center justify-between p-3 border-b border-white/10 mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C0FF00] px-2.5 py-1 rounded bg-[#C0FF00]/10 border border-[#C0FF00]/20">
              {badge}
            </span>
            <h3
              id="dataset-picker-modal-title"
              className="text-xl sm:text-2xl font-black text-white mt-1"
            >
              {title}
            </h3>
            <p className="text-xs text-white/50">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ExerciseDatabaseView isModalMode onCloseModal={onClose} onSelectForRoutine={onSelect} />
      </div>
    </div>
  );
};

export const RoutineView: React.FC = () => {
  const {
    routines,
    selectedDay,
    setSelectedDay,
    startWorkout,
    navigateTo,
    sendCoachMessage,
    replaceRoutineExercise,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
  } = useApp();

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  // Dataset swap / add modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [exerciseToSwap, setExerciseToSwap] = useState<Exercise | null>(null);

  const currentRoutine = routines.find((r) => r.dayNumber === selectedDay) || routines[0];

  const isMobile = useIsMobile();

  if (!currentRoutine) {
    return (
      <div className="flex-1 p-4 sm:p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-12 text-center text-white/60">
          Aún no tienes rutinas generadas. Completa tu onboarding para personalizar tu plan.
        </div>
      </div>
    );
  }

  if (isMobile) {
    const todayRoutine = routines.find((r) => r.dayNumber === 1) || currentRoutine;

    return (
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-4 max-w-md mx-auto w-full">
        <div className="relative z-10">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
            Mi Rutina • Día {todayRoutine.dayNumber} • {todayRoutine.focus.toUpperCase()}
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white">{todayRoutine.name}</h1>
          <p className="text-xs text-white/50 mt-0.5">
            {todayRoutine.exercises.length} ejercicios • {todayRoutine.estimatedMinutes} min
          </p>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          {todayRoutine.exercises.map((ex, idx) => (
            <div
              key={ex.id}
              className="flex items-center gap-3 bg-[#0A0A0A] border border-white/10 rounded-2xl px-4 py-3"
            >
              <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-[#C0FF00] shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white capitalize truncate">{ex.name}</p>
                <p className="text-[11px] text-white/50">
                  {ex.sets} × {ex.reps} • {ex.suggestedWeightKg} kg • descanso {ex.restSeconds}s
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] uppercase font-bold text-white/50 shrink-0">
                {ex.primaryMuscle}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <button
          id="btn-mobile-routine-start"
          onClick={() => startWorkout(todayRoutine.dayNumber)}
          className="w-full py-6 rounded-3xl font-black text-lg text-black bg-[#C0FF00] shadow-[0_0_40px_rgba(192,255,0,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 fill-current" />
          ENTRENAR
        </button>
      </div>
    );
  }

  const toggleComplete = (exId: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exId]: !prev[exId],
    }));
  };

  const handleAskCoachAboutExercise = (ex: Exercise) => {
    sendCoachMessage(`¿Cómo puedo optimizar mi técnica y rango de movimiento en ${ex.name}?`);
    setSelectedExercise(null);
    navigateTo('coach');
  };

  const handleSelectSwap = (datasetItem: DatasetExercise) => {
    if (!exerciseToSwap) return;
    const newEx = datasetToRoutineExercise(datasetItem, {
      sets: exerciseToSwap.sets,
      reps: exerciseToSwap.reps,
      suggestedWeightKg: exerciseToSwap.suggestedWeightKg,
      restSeconds: exerciseToSwap.restSeconds,
    });
    replaceRoutineExercise(currentRoutine.dayNumber, exerciseToSwap.id, newEx);
    setExerciseToSwap(null);
  };

  const handleSelectAdd = (datasetItem: DatasetExercise) => {
    const newEx = datasetToRoutineExercise(datasetItem);
    addExerciseToRoutine(currentRoutine.dayNumber, newEx);
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full relative">
      {/* Top Banner & Day selector tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C0FF00]/10 text-[#C0FF00] text-xs font-bold uppercase tracking-wider mb-2 border border-[#C0FF00]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan Semanal Hipertrofia & Rendimiento</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Mi Rutina Personalizada</h1>
          <p className="text-sm text-white/60 mt-1">
            Programación periodizada por el Coach IA con descansos calculados y sobrecarga técnica.
          </p>
        </div>

        <button
          onClick={() => startWorkout(currentRoutine.dayNumber)}
          className="px-6 py-3.5 bg-[#C0FF00] text-black font-black text-sm rounded-xl hover:bg-[#aee600] transition-transform hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(192,255,0,0.3)] flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Iniciar Esta Rutina Ahora</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {routines.map((r) => {
          const isSelected = r.dayNumber === selectedDay;
          return (
            <button
              key={r.dayNumber}
              onClick={() => setSelectedDay(r.dayNumber)}
              className={`px-4 py-3 rounded-2xl border text-left shrink-0 transition-all min-w-[170px] ${
                isSelected
                  ? 'bg-[#C0FF00] text-black border-[#C0FF00] shadow-[0_0_20px_rgba(192,255,0,0.25)] font-bold'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span
                  className={
                    isSelected
                      ? 'text-black font-black uppercase text-[10px]'
                      : 'text-white/40 uppercase text-[10px]'
                  }
                >
                  Día {r.dayNumber}
                </span>
                {r.isRestDay && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-white/50'}`}
                  >
                    Movilidad
                  </span>
                )}
              </div>
              <p className="text-sm font-extrabold truncate">{r.focus}</p>
              <p
                className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-black/80 font-medium' : 'text-white/40'}`}
              >
                {r.exercises.length} ejercicios • {r.estimatedMinutes} min
              </p>
            </button>
          );
        })}
      </div>

      {/* Routine Overview Header Card */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[#C0FF00] font-bold uppercase tracking-wider">
                Día {currentRoutine.dayNumber} • {currentRoutine.difficulty}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white">{currentRoutine.name}</h2>
            <p className="text-sm text-white/60 max-w-2xl mt-1 leading-relaxed">
              {currentRoutine.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {currentRoutine.targetMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 font-medium"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 shrink-0 self-start lg:self-auto">
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-[10px] uppercase text-white/40 font-bold">Tiempo</p>
              <p className="text-xl font-black text-white">{currentRoutine.estimatedMinutes} min</p>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-[10px] uppercase text-white/40 font-bold">Ejercicios</p>
              <p className="text-xl font-black text-white">{currentRoutine.exercises.length}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] uppercase text-white/40 font-bold">Intensidad</p>
              <p className="text-xl font-black text-[#C0FF00]">RPE 8-9</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C0FF00]" />
            <span>Lista de Ejercicios ({currentRoutine.exercises.length})</span>
          </h3>
          <span className="text-xs text-white/50">
            Haz clic en "Ver Detalles" para consejos técnicos y biomecánica
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {currentRoutine.exercises.map((ex, index) => (
            <RoutineExerciseRow
              key={ex.id}
              exercise={ex}
              index={index}
              isDone={!!completedExercises[ex.id]}
              canRemove={currentRoutine.exercises.length > 1}
              onToggleComplete={() => toggleComplete(ex.id)}
              onShowDetails={() => setSelectedExercise(ex)}
              onSwap={() => setExerciseToSwap(ex)}
              onRemove={() => removeExerciseFromRoutine(currentRoutine.dayNumber, ex.id)}
            />
          ))}
        </div>

        {/* Add Exercise from 1,324 Dataset Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-4 px-6 border-2 border-dashed border-white/15 hover:border-[#C0FF00]/60 rounded-[24px] bg-white/[0.02] hover:bg-white/[0.06] text-white transition-all flex items-center justify-center gap-3 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-[#C0FF00] text-white/70 group-hover:text-black flex items-center justify-center transition-all">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white group-hover:text-[#C0FF00] transition-colors flex items-center gap-2">
              <span>Añadir Ejercicio al Día {currentRoutine.dayNumber}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#C0FF00]/10 text-[#C0FF00] text-[10px] font-mono font-black border border-[#C0FF00]/20">
                +1,324 Ejercicios
              </span>
            </p>
            <p className="text-xs text-white/50">
              Explora y añade variantes desde la base de datos hasaneyldrm/exercises-dataset
            </p>
          </div>
        </button>
      </div>

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <RoutineExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onAskCoach={() => handleAskCoachAboutExercise(selectedExercise)}
          onStartWorkout={() => {
            setSelectedExercise(null);
            startWorkout(currentRoutine.dayNumber);
          }}
        />
      )}

      {/* Modal to Swap Exercise */}
      {exerciseToSwap && (
        <DatasetPickerModal
          badge="Sustituir Ejercicio"
          title={`Reemplazar "${exerciseToSwap.name}"`}
          subtitle={`Selecciona cualquier ejercicio de la base de datos para sustituirlo en tu Día ${currentRoutine.dayNumber}.`}
          onClose={() => setExerciseToSwap(null)}
          onSelect={handleSelectSwap}
        />
      )}

      {/* Modal to Add Exercise to Routine */}
      {isAddModalOpen && (
        <DatasetPickerModal
          badge="Añadir a Rutina"
          title={`Añadir Ejercicio al Día ${currentRoutine.dayNumber} (${currentRoutine.focus})`}
          subtitle="Elige entre los 1,324 ejercicios con técnica e ilustraciones para agregar a tu rutina."
          onClose={() => setIsAddModalOpen(false)}
          onSelect={handleSelectAdd}
        />
      )}
    </div>
  );
};
