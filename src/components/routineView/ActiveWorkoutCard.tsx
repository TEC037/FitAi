import React, { useState } from 'react';
import { Flag, Timer, Pause, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/useApp';

// --- Mesa de set activo más descanso: "entrenamiento unificado" dentro de Rutina.
export const ActiveWorkoutCard: React.FC = () => {
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