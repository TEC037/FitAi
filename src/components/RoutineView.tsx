import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Layers,
  Plus,
  Dumbbell,
  ArrowRight,
  Copy,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { useGuidanceStep } from '../hooks/useGuidanceStep';
import { formatRoutineForSharing } from '../utils/routineShare';
import { ActiveWorkoutCard } from './routineView/ActiveWorkoutCard';
import { CoachPanel } from './routineView/CoachPanel';
import { RoutineExerciseRow } from './routineView/RoutineExerciseRow';

// --- Rutina unificada: rutina + entrenamiento activo + consejos de IA.
export const RoutineView: React.FC = () => {
  const {
    routines,
    selectedDay,
    setSelectedDay,
    startWorkout,
    navigateTo,
    removeExerciseFromRoutine,
    duplicateRoutineDay,
    isWorkoutActive,
  } = useApp();
  const guidance = useGuidanceStep();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShareRoutine = async () => {
    const text = formatRoutineForSharing(routines);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  // Entrenamiento activo tiene prioridad absoluta dentro de Rutina.
  if (isWorkoutActive) {
    return (
      <div className="mx-auto max-w-2xl pt-2">
        <ActiveWorkoutCard />
      </div>
    );
  }

  const hasExercises = routines.some((r) => r.exercises.length > 0);
  const currentRoutine = routines.find((r) => r.dayNumber === selectedDay) || routines[0];

  return (
    <div className="space-y-6 pt-1">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-black/10 text-[#547c08] text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Planificado por tu Coach IA
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-2">Mi Rutina</h1>
          <p className="text-sm text-slate-500 mt-1">
            Entrena, descansa y acumula consejos de IA en un solo paso.
          </p>
        </div>
        {hasExercises && (
          <button
            onClick={() => void handleShareRoutine()}
            aria-live="polite"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
              copied
                ? 'bg-lime-100 text-[#547c08] border-lime-200'
                : 'bg-white/70 text-slate-600 border-black/10 hover:bg-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            {copied ? '¡Rutina copiada!' : 'Compartir'}
          </button>
        )}
      </div>

      {/* Estado vacío (nuevo usuario) */}
      {!hasExercises ? (
        <div className="metal-card rounded-[28px] p-8 sm:p-10 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-slate-100 to-white border border-black/10 flex items-center justify-center">
            <Dumbbell className="w-7 h-7 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black">Tu rutina te está esperando</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Añade tu primer ejercicio desde la Biblioteca y comenzaremos a armar tu plan con
              series, descansos y consejos del Coach IA.
            </p>
          </div>
          <button
            onClick={() => navigateTo('exercises')}
            className="relative inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#C0FF00] text-black font-black text-sm hover:bg-[#aee600] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Ir a la Biblioteca
          </button>
          {guidance.step === 'exercises' && (
            <p className="text-xs font-bold text-amber-600 animate-sheet-fade">
              ✨ Pulso dorado: añade tu primer ejercicio
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Selector de días */}
          {routines.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {routines.map((r) => {
                const selected = r.dayNumber === selectedDay;
                return (
                  <button
                    key={r.dayNumber}
                    onClick={() => setSelectedDay(r.dayNumber)}
                    className={`px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all min-w-[140px] ${
                      selected
                        ? 'bg-[#C0FF00] text-black border-[#aee600] font-bold shadow-[0_8px_20px_-8px_rgba(112,160,20,0.5)]'
                        : 'bg-white/70 border-black/10 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase opacity-70">
                      Día {r.dayNumber}
                    </p>
                    <p className="text-sm font-extrabold truncate">{r.focus}</p>
                    <p className="text-[11px] opacity-70">
                      {r.exercises.length} ejercicios • {r.estimatedMinutes} min
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tarjeta del día */}
          {currentRoutine && (
            <div className="metal-card rounded-[28px] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                    Día {currentRoutine.dayNumber} • {currentRoutine.difficulty}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black mt-1">{currentRoutine.name}</h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    {currentRoutine.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentRoutine.targetMuscles.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-1 rounded-full bg-white/70 border border-black/5 text-[11px] font-bold text-slate-500"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {routines.length > 1 && (
                    <button
                      onClick={() => {
                        const newDay = duplicateRoutineDay(currentRoutine.dayNumber);
                        if (newDay) setSelectedDay(newDay);
                      }}
                      className="p-3.5 rounded-full bg-white/70 border border-black/10 text-slate-500 hover:text-[#547c08] hover:border-lime-300 transition-all flex items-center justify-center"
                      title="Duplicar este día de rutina"
                      aria-label="Duplicar este día de rutina"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => startWorkout(currentRoutine.dayNumber)}
                    className="relative inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#C0FF00] text-black font-black text-sm hover:bg-[#aee600] active:scale-95 transition-all"
                  >
                    {guidance.step === 'routine' && (
                      <span
                        className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-gold-ring"
                        aria-hidden="true"
                      />
                    )}
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar Entrenamiento
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de ejercicios */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Ejercicios ({currentRoutine?.exercises.length ?? 0})
              </h3>
              <button
                onClick={() => navigateTo('exercises')}
                className="text-xs font-bold text-[#547c08] hover:underline flex items-center gap-1"
              >
                Añadir <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentRoutine?.exercises.map((ex, idx) => (
              <RoutineExerciseRow
                key={ex.id}
                exercise={ex}
                index={idx}
                canRemove={currentRoutine.exercises.length > 1}
                isExpanded={expandedId === ex.id}
                onToggleExpand={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
                onRemove={() => removeExerciseFromRoutine(currentRoutine.dayNumber, ex.id)}
              />
            ))}

            <button
              onClick={() => navigateTo('exercises')}
              className="w-full py-4 px-6 border-2 border-dashed border-slate-300 rounded-[24px] bg-white/30 hover:bg-white/60 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-[#C0FF00] text-slate-400 group-hover:text-black flex items-center justify-center transition-all">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Añadir ejercicio al Día {currentRoutine?.dayNumber}</p>
                <p className="text-xs">Explora todos los ejercicios de la Biblioteca</p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Coach IA unificado */}
      <CoachPanel />
    </div>
  );
};

export default RoutineView;