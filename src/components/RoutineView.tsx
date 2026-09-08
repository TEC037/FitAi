import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Layers,
  Plus,
  Dumbbell,
  Trash2,
  ChevronDown,
  Bot,
  Send,
  X,
  Timer,
  Pause,
  CheckCircle2,
  Flag,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { Exercise } from '../types';
import { useGuidanceStep } from '../hooks/useGuidanceStep';

// ---------------------------------------------------------------------------
// Mesa de set activo más descanso: "entrenamiento unificado" dentro de Rutina.
// ---------------------------------------------------------------------------
const ActiveWorkoutCard: React.FC = () => {
  const {
    activeRoutine,
    activeExerciseIndex,
    activeWorkoutSets,
    logActiveSet,
    goToNextExercise,
    goToPreviousExercise,
    restTimerSeconds,
    isRestTimerActive,
    pauseRestTimer,
    adjustRestTimer,
    startRestTimer,
    finishWorkout,
    cancelWorkout,
    user,
  } = useApp();

  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [rpe, setRpe] = useState<string>('8');
  const [showFinish, setShowFinish] = useState(false);
  const [notes, setNotes] = useState('');
  const [avgRpe, setAvgRpe] = useState<string>('8');
  const [completed, setCompleted] = useState<ReturnType<typeof finishWorkout> | null>(null);

  const current = activeRoutine?.exercises[activeExerciseIndex];
  const doneForExercise = activeWorkoutSets.filter((s) => s.exerciseId === current?.id);

  if (!activeRoutine || !current || completed) {
    return null;
  }

  const remainingSets = Math.max(0, current.sets - doneForExercise.length);

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    logActiveSet(
      Number(weight) || current.suggestedWeightKg,
      Number(reps) || 10,
      Number(rpe) || 8,
      'normal'
    );
    if (!weight) {
      const next = Number(current.suggestedWeightKg) || 0;
      setWeight(next > 0 ? String(next) : '');
    }
    setReps('');
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const session = finishWorkout(notes, Number(avgRpe) || 8);
    setCompleted(session);
  };

  const mmss = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="metal-card rounded-[28px] p-5 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 text-[#547c08] text-[10px] font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
            Entrenamiento en vivo
          </div>
          <h2 className="text-2xl font-black mt-1.5">
            {activeRoutine.name.split('(')[0].trim()}
          </h2>
          <p className="text-sm text-slate-500">
            Día {activeRoutine.dayNumber} • {activeRoutine.focus}
          </p>
        </div>
        <button
          onClick={() => setShowFinish((v) => !v)}
          className="px-4 py-2.5 rounded-full bg-[#C0FF00] text-black text-xs font-black hover:bg-[#aee600] active:scale-95 transition-all flex items-center gap-2"
        >
          <Flag className="w-4 h-4" />
          Finalizar
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        {activeRoutine.exercises.map((ex, i) => (
          <div key={ex.id} className="flex items-center gap-1.5 flex-1">
            <div
              className={`h-2 rounded-full flex-1 transition-colors ${
                i < activeExerciseIndex ? 'bg-lime-500' : i === activeExerciseIndex ? 'bg-amber-400' : 'bg-slate-200'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Ejercicio actual */}
      <div className="bg-white/70 border border-black/5 rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
          Ejercicio {activeExerciseIndex + 1} de {activeRoutine.exercises.length}
        </p>
        <h3 className="text-xl font-black capitalize mt-0.5">{current.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          <strong className="text-slate-700">{current.sets} series</strong> × {current.reps} reps •{' '}
          {current.suggestedWeightKg} kg • descanso {current.restSeconds}s
        </p>
        <p className="text-xs italic text-slate-500 mt-1.5">
          💡 {current.technicalCue}
        </p>
      </div>

      {/* Registrador de series */}
      <form onSubmit={handleLog} className="bg-white/70 border border-black/5 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-bold text-slate-600">
          Serie {doneForExercise.length + 1} de {current.sets}
          {remainingSets === 0 && (
            <span className="text-lime-600 font-bold"> — Serie final de la técnica ✓</span>
          )}
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          <label className="block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Peso (kg)</span>
            <input
              type="number"
              min={0}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={String(current.suggestedWeightKg)}
              className="w-full mt-1 rounded-xl bg-white border border-black/10 px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reps</span>
            <input
              type="number"
              min={1}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder={current.reps}
              className="w-full mt-1 rounded-xl bg-white border border-black/10 px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">RPE</span>
            <input
              type="number"
              min={1}
              max={10}
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className="w-full mt-1 rounded-xl bg-white border border-black/10 px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </label>
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-[#C0FF00] text-black font-black text-sm hover:bg-[#aee600] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Registrar Serie
        </button>
        <p className="text-[11px] text-slate-400 text-center">
          Series registradas hoy: {activeWorkoutSets.length} • Volumen total:{' '}
          {activeWorkoutSets.reduce((a, s) => a + s.weightKg * s.reps, 0).toLocaleString()} kg
        </p>
      </form>

      {/* Descanso */}
      <div className="bg-white/70 border border-black/5 rounded-2xl p-4 flex items-center gap-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-amber-300 text-lg font-black shrink-0 bg-white">
          {mmss(restTimerSeconds)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-700">Temporizador de descanso</p>
          {isRestTimerActive ? (
            <button
              onClick={pauseRestTimer}
              className="mt-2 px-3 py-1.5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" /> Pausar
            </button>
          ) : (
            <button
              onClick={() => startRestTimer(current.restSeconds || 90)}
              className="mt-2 px-3 py-1.5 rounded-full bg-amber-400 text-black text-xs font-black flex items-center gap-1.5"
            >
              <Timer className="w-3.5 h-3.5" /> Reiniciar 90s
            </button>
          )}
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => adjustRestTimer(-15)}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold"
            >
              −15s
            </button>
            <button
              onClick={() => adjustRestTimer(15)}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold"
            >
              +15s
            </button>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goToPreviousExercise}
          disabled={activeExerciseIndex === 0}
          className="px-4 py-2.5 rounded-full bg-white border border-black/10 text-slate-600 text-xs font-bold disabled:opacity-40"
        >
          ← Anterior
        </button>
        <button
          onClick={goToNextExercise}
          disabled={activeExerciseIndex === activeRoutine.exercises.length - 1}
          className="px-4 py-2.5 rounded-full bg-white border border-black/10 text-slate-600 text-xs font-bold disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>

      {/* Finalizar */}
      {showFinish && (
        <form onSubmit={handleFinish} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-sheet-fade">
          <p className="text-sm font-black text-slate-800">Resumen de la sesión</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Cómo te sentiste? (opcional)"
            rows={2}
            className="w-full rounded-xl bg-white border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <label className="block">
            <span className="text-[10px] font-bold text-slate-500 uppercase">RPE medio</span>
            <select
              value={avgRpe}
              onChange={(e) => setAvgRpe(e.target.value)}
              className="w-full mt-1 rounded-xl bg-white border border-black/10 px-3 py-2.5 text-sm font-bold"
            >
              {[6, 7, 8, 9, 10].map((v) => (
                <option key={v} value={v}>
                  {v} — {v === 6 ? 'Fácil' : v === 10 ? 'Máximo' : 'Moderado'}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-slate-800 text-white text-xs font-black hover:bg-slate-900 transition-colors"
          >
            Terminar y Guardar Sesión
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            Bien hecho, {user.name.split(' ')[0]}. {activeWorkoutSets.length} series completadas.
          </p>
        </form>
      )}

      <button
        onClick={cancelWorkout}
        className="w-full py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
      >
        Cancelar entrenamiento
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Panel Coach IA unificado en Rutina.
// ---------------------------------------------------------------------------
const FREQUENT_QUESTIONS = [
  '¿Cuántos días debo entrenar esta semana?',
  '¿Cómo evito el estancamiento en mis pesos?',
  '¿Qué hago si siento dolor en una articulación?',
];

const CoachPanel: React.FC = () => {
  const { chatMessages, sendCoachMessage, isCoachTyping, user } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full metal-card rounded-[24px] p-5 flex items-center justify-between gap-3 hover:scale-[1.005] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-lime-100 flex items-center justify-center text-[#547c08]">
            <Bot className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-sm font-black">Coach IA</p>
            <p className="text-xs text-slate-500">
              Consejos de técnica, series y descansos en un solo lugar.
            </p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-slate-400" />
      </button>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendCoachMessage(input.trim());
    setInput('');
  };

  return (
    <div className="metal-card rounded-[24px] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-lime-100 flex items-center justify-center text-[#547c08]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black">Coach IA</p>
            <p className="text-[11px] text-slate-500">Contexto: {user.name} · {user.primaryGoal}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-2 rounded-full bg-slate-100 text-slate-500"
          aria-label="Cerrar Coach IA"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FREQUENT_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendCoachMessage(q)}
            className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-[11px] font-bold text-slate-600 whitespace-nowrap hover:border-amber-300 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="bg-white/70 border border-black/5 rounded-2xl p-3 h-48 overflow-y-auto space-y-2">
        {chatMessages.length === 0 && (
          <p className="text-xs text-slate-400 text-center pt-6">
            Pregúntale al Coach IA lo que necesites sobre tu entrenamiento.
          </p>
        )}
        {chatMessages.slice(-20).map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#C0FF00] text-black font-semibold rounded-br-sm'
                  : 'bg-white border border-black/5 text-slate-700 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isCoachTyping && (
          <div className="text-xs text-slate-400 italic">El Coach IA está pensando…</div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          className="flex-1 rounded-full bg-white border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-full bg-[#C0FF00] text-black flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Enviar al Coach"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Rutina unificada: rutina + entrenamiento activo + consejos de IA.
// ---------------------------------------------------------------------------
export const RoutineView: React.FC = () => {
  const {
    routines,
    selectedDay,
    setSelectedDay,
    startWorkout,
    navigateTo,
    removeExerciseFromRoutine,
    isWorkoutActive,
  } = useApp();
  const guidance = useGuidanceStep();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

                <button
                  onClick={() => startWorkout(currentRoutine.dayNumber)}
                  className="relative shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#C0FF00] text-black font-black text-sm hover:bg-[#aee600] active:scale-95 transition-all"
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
                <p className="text-xs">Explora +1,324 ejercicios desde la Biblioteca</p>
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

// ---------------------------------------------------------------------------
// Fila de ejercicio: correcto y minimal, con detalles expandibles.
// ---------------------------------------------------------------------------
interface RoutineExerciseRowProps {
  exercise: Exercise;
  index: number;
  canRemove: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
}

const RoutineExerciseRow: React.FC<RoutineExerciseRowProps> = ({
  exercise: ex,
  index,
  canRemove,
  isExpanded,
  onToggleExpand,
  onRemove,
}) => {
  return (
    <div className="bg-white/70 border border-black/5 rounded-[20px] overflow-hidden">
      <div className="p-4 flex flex-wrap items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-black/5 flex items-center justify-center font-black text-xs text-amber-600 shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black capitalize truncate">{ex.name}</h4>
          <p className="text-[11px] text-slate-500">
            {ex.sets} × {ex.reps} • {ex.suggestedWeightKg} kg • descanso {ex.restSeconds}s •{' '}
            {ex.primaryMuscle}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleExpand}
            className="px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
          >
            Detalles
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {canRemove && (
            <button
              onClick={onRemove}
              className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Quitar de la rutina"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 animate-sheet-fade">
          <p className="text-xs bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-slate-700">
            <strong>Cue del Coach:</strong> "{ex.technicalCue}"
          </p>
          {ex.fullInstructions.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Cómo ejecutarlo
              </p>
              <ol className="space-y-1.5">
                {ex.fullInstructions.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black shrink-0 mt-px">
                      {i + 1}
                    </span>
                    {ins}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {ex.commonMistakes.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1.5">
                Errores a evitar
              </p>
              <ul className="space-y-1">
                {ex.commonMistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="text-red-400 font-bold">•</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoutineView;