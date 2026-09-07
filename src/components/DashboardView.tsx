import React, { useEffect, useState } from 'react';
import { Play, Dumbbell, ArrowUpRight, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { useApp } from '../context/useApp';
import { NAV_ROUTES } from '../config/navigation';
import {
  getExerciseImageUrl,
  EXERCISE_DATABASE,
  loadExerciseDatabase,
} from '../services/exerciseDatabaseService';
import { computeDashboardStats, stripReps } from '../utils/dashboardStats';
import { formatVolumeKg, formatNumber } from '../utils/format';
import { useIsMobile } from '../hooks/useIsMobile';

export const DashboardView: React.FC = () => {
  const { user, routines, startWorkout, navigateTo, history, personalRecords, weightHistory } =
    useApp();

  const [isLoadingDB, setIsLoadingDB] = useState(EXERCISE_DATABASE.length === 0);

  useEffect(() => {
    if (EXERCISE_DATABASE.length === 0) {
      loadExerciseDatabase()
        .then(() => setIsLoadingDB(false))
        .catch((err) => {
          console.error('Failed to load database:', err);
          setIsLoadingDB(false);
        });
    }
  }, []);

  const stats = computeDashboardStats(history, weightHistory, personalRecords);

  const maxBucketVolume = Math.max(...stats.weeklyBuckets.map((b) => b.volumeKg), 0);
  const latestActiveBucketIndex = stats.weeklyBuckets.reduce((latest, bucket, idx) => {
    return bucket.workouts > 0 ? idx : latest;
  }, -1);

  const barHeightPx = (volumeKg: number) =>
    volumeKg > 0 && maxBucketVolume > 0
      ? Math.max(6, Math.round((volumeKg / maxBucketVolume) * 42))
      : 0;

  const trendLabel =
    stats.weeklyVolumeTrendPercent !== null
      ? `${stats.weeklyVolumeTrendPercent >= 0 ? '+' : ''}${stats.weeklyVolumeTrendPercent.toFixed(1)}% vs prev`
      : 'sin datos previos';

  const weightLabel =
    stats.weightDeltaKg !== null
      ? `${stats.weightDeltaKg > 0 ? '+' : ''}${stats.weightDeltaKg.toFixed(1)} kg`
      : '—';

  const latestPr = stats.latestPersonalRecord;

  const isMobile = useIsMobile();

  const mobileSecondaryRoutes = NAV_ROUTES.filter((route) => route.isMobileSecondary);

  // Find Day 1 as today's routine (Empuje Dinámico)
  const todaysRoutine = routines.find((r) => r.dayNumber === 1) || routines[0];

  if (!todaysRoutine) {
    return (
      <div className="flex-1 p-4 sm:p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-12 text-center text-white/60">
          Aún no tienes rutinas generadas. Completa tu onboarding para personalizar tu plan.
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-5 relative overflow-hidden max-w-md mx-auto w-full">
        <div className="flex items-center justify-between relative z-10">
          <div className="min-w-0">
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
              Plan Activo • {user.primaryGoal.toUpperCase()}
            </p>
            <h1 className="text-xl font-black tracking-tight text-white truncate">
              ¡Hola, {user.name.split(' ')[0]}!
            </h1>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
              Cumplimiento
            </p>
            <p className="font-black text-lg text-[#C0FF00]">{user.weeklyCompliance}%</p>
          </div>
        </div>

        <button
          id="btn-mobile-start-workout"
          onClick={() => startWorkout(todaysRoutine.dayNumber)}
          className="w-full py-8 rounded-3xl font-black text-xl text-black bg-[#C0FF00] shadow-[0_0_40px_rgba(192,255,0,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
        >
          <Play className="w-7 h-7 fill-current" />
          ENTRENAR
        </button>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-5">
          <p className="text-[10px] text-[#C0FF00] uppercase font-bold tracking-wider mb-1">
            Siguiente Sesión · Día {todaysRoutine.dayNumber}
          </p>
          <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
            {todaysRoutine.name}
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {todaysRoutine.exercises.length} ejercicios • {todaysRoutine.estimatedMinutes} min •
            Enfoque: {todaysRoutine.focus}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {todaysRoutine.targetMuscles.map((m) => (
              <span
                key={m}
                className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/70 font-medium"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-3xl border border-white/10 p-5 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              PR Record
            </p>
            <p className="font-black text-base text-white">
              {latestPr
                ? `${latestPr.exerciseName} ${stripReps(latestPr.recordValue)}`
                : '—'}
            </p>
            <p className="text-[10px] text-[#C0FF00] font-medium">
              {latestPr ? `+${latestPr.progressPercent}% nuevo récord` : 'Registra tu primera marca'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold px-1">
            Explorar
          </p>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden">
            {mobileSecondaryRoutes.map((route) => (
              <button
                key={route.id}
                id={`mobile-quick-${route.id}`}
                onClick={() => navigateTo(route.id)}
                className="w-full p-4 flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.07] active:bg-white/10 transition-colors text-left"
              >
                <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <route.icon className="w-4 h-4 text-[#C0FF00]" />
                </span>
                <span className="flex-1 text-sm font-bold text-white">{route.label}</span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-8 flex flex-col gap-8 relative overflow-hidden max-w-[1600px] mx-auto w-full">
      {/* Background glow aura matching Immersive UI */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C0FF00]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-[#C0FF00]/10 text-[#C0FF00] text-[11px] font-bold tracking-wider uppercase">
              Plan Activo • {user.primaryGoal.toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
            ¡Hola de nuevo, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            Hoy toca machacar el{' '}
            <span className="text-white font-medium">{todaysRoutine.focus}</span>. ¿Listo para el
            progreso?
          </p>
        </div>

        <div className="text-left md:text-right bg-white/5 md:bg-transparent p-4 md:p-0 rounded-2xl border border-white/5 md:border-none">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1.5 font-bold">
            Cumplimiento Semanal
          </p>
          <div className="flex items-center gap-4">
            <div className="w-40 sm:w-48 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C0FF00] transition-all duration-500 rounded-full shadow-[0_0_10px_#C0FF00]"
                style={{ width: `${user.weeklyCompliance}%` }}
              />
            </div>
            <span className="font-black text-xl text-[#C0FF00]">{user.weeklyCompliance}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Hero Workout Card & Coach Sidecards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Big Hero Card (8 cols) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-white/10 to-transparent p-[1px] rounded-[32px] shadow-2xl">
          <div className="bg-[#0A0A0A]/90 backdrop-blur-xl h-full w-full rounded-[31px] p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <span className="px-3 py-1 bg-[#C0FF00]/10 text-[#C0FF00] text-[10px] font-bold uppercase rounded-full tracking-wider border border-[#C0FF00]/20">
                  Siguiente Sesión • Día {todaysRoutine.dayNumber}
                </span>
                <h2 className="text-3xl sm:text-5xl font-black mt-4 mb-2 italic tracking-tight uppercase">
                  {todaysRoutine.name}
                </h2>
                <p className="text-white/60 text-sm max-w-md leading-relaxed">
                  {todaysRoutine.exercises.length} ejercicios • {todaysRoutine.estimatedMinutes} min
                  • Alta Intensidad
                  <br />
                  <span className="text-white/40">
                    Enfoque: Hipertrofia y control de fase excéntrica.
                  </span>
                </p>

                {/* Target muscle tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {todaysRoutine.targetMuscles.map((m) => (
                    <span
                      key={m}
                      className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/70 font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-24 h-24 border-4 border-[#C0FF00]/20 rounded-full flex items-center justify-center relative shrink-0 self-center sm:self-start">
                <div className="absolute inset-0 border-4 border-[#C0FF00] rounded-full border-t-transparent animate-pulse"></div>
                <div className="text-center">
                  <span className="text-xl font-black italic text-white block">IA Opt</span>
                  <span className="text-[9px] text-[#C0FF00] font-bold tracking-wider uppercase">
                    Calibrado
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
              <button
                id="btn-start-workout-hero"
                onClick={() => startWorkout(todaysRoutine.dayNumber)}
                className="flex-1 py-4 sm:py-5 bg-[#C0FF00] text-black font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_40px_rgba(192,255,0,0.3)] flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>COMENZAR ENTRENAMIENTO</span>
              </button>
              <button
                id="btn-view-routine-details"
                onClick={() => navigateTo('routine')}
                className="px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                <span>Ver Rutina Completa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Column Cards (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: Coach AI Recommendation */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col justify-between group hover:border-[#C0FF00]/30 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="font-bold text-sm text-white">Recomendación del Coach</p>
                </div>
                <span className="text-[10px] text-[#C0FF00] font-mono font-bold">HOY</span>
              </div>
              <p className="text-sm text-white/70 italic leading-relaxed">
                "He ajustado el peso sugerido para tu Press de Banca un +2.5kg basándome en tu
                última sesión. Tus sensaciones de ayer indican que estás listo para sobrecarga
                progresiva."
              </p>
            </div>

            <button
              onClick={() => navigateTo('coach')}
              className="mt-4 pt-3 border-t border-white/5 text-xs text-[#C0FF00] font-bold flex items-center justify-between group-hover:translate-x-1 transition-transform"
            >
              <span>Preguntar al Coach IA</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Weekly Volume Bar Chart */}
          <div className="flex-1 bg-indigo-600/10 border border-indigo-500/20 rounded-[32px] p-6 relative group overflow-hidden flex flex-col justify-between">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                  Volumen Total Semanal
                </p>
                <span className="text-[10px] text-white/40 font-mono">{trendLabel}</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
                {formatVolumeKg(stats.latestWeekVolumeKg)}{' '}
                <span className="text-sm font-normal text-white/40">kg</span>
              </h3>
            </div>

            <div className="mt-4">
              <div className="flex gap-1.5 h-14">
                {stats.weeklyBuckets.map((bucket, idx) => {
                  const isActive = idx === latestActiveBucketIndex;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <div
                        className={`w-full rounded-sm ${
                          isActive
                            ? 'bg-[#C0FF00] shadow-[0_0_10px_rgba(192,255,0,0.5)]'
                            : 'bg-indigo-500/40'
                        }`}
                        style={{ height: `${barHeightPx(bucket.volumeKg)}px` }}
                      />
                      <span
                        className={`text-[9px] ${isActive ? 'text-[#C0FF00] font-bold' : 'text-white/30'}`}
                      >
                        {isActive ? 'Últ' : `S${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Bottom Metric Cards matching design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
        <div className="bg-white/5 p-5 rounded-[24px] border border-white/10 flex items-center gap-4 hover:border-white/20 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
            ⚖️
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              Peso Actual
            </p>
            <p className="font-black text-lg text-white">{user.weight} kg</p>
            <p className="text-[10px] text-emerald-400 font-medium">{weightLabel} este periodo</p>
          </div>
        </div>

        <div className="bg-white/5 p-5 rounded-[24px] border border-white/10 flex items-center gap-4 hover:border-white/20 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
            🔥
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              Workouts
            </p>
            <p className="font-black text-lg text-white">{stats.workoutsThisMonth} / Mes</p>
            <p className="text-[10px] text-[#C0FF00] font-medium">
              {stats.workoutsThisWeek} esta semana
            </p>
          </div>
        </div>

        <div className="bg-white/5 p-5 rounded-[24px] border border-white/10 flex items-center gap-4 hover:border-white/20 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
            ⏱️
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              Tiempo Total
            </p>
            <p className="font-black text-lg text-white">{stats.totalTrainingHours} hrs</p>
            <p className="text-[10px] text-white/40 font-medium">
              Promedio {stats.averageSessionMinutes} min/sesión
            </p>
          </div>
        </div>

        <div className="bg-[#C0FF00]/5 p-5 rounded-[24px] border border-[#C0FF00]/20 flex items-center gap-4 hover:border-[#C0FF00]/40 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#C0FF00]/10 flex items-center justify-center text-xl shrink-0">
            🏆
          </div>
          <div>
            <p className="text-[10px] text-[#C0FF00] uppercase font-bold tracking-wider">
              PR Record
            </p>
            <p className="font-black text-lg text-white">
              {latestPr ? `${latestPr.exerciseName} ${stripReps(latestPr.recordValue)}` : '—'}
            </p>
            <p className="text-[10px] text-[#C0FF00] font-medium">
              {latestPr
                ? `+${latestPr.progressPercent}% nuevo récord`
                : 'Registra tu primera marca'}
            </p>
          </div>
        </div>
      </div>

      {/* Exercises of the Day Preview Section */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#C0FF00]" />
              <span>Ejercicios Programados para Hoy</span>
            </h3>
            <p className="text-xs text-white/50">
              {todaysRoutine.name} • {todaysRoutine.exercises.length} ejercicios estructurados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('exercises')}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C0FF00]" />
              <span>
                Biblioteca ({isLoadingDB ? '...' : formatNumber(EXERCISE_DATABASE.length)})
              </span>
            </button>
            <button
              onClick={() => startWorkout(todaysRoutine.dayNumber)}
              className="px-5 py-2.5 bg-[#C0FF00] text-black font-black text-xs rounded-xl hover:bg-[#aee600] transition-colors flex items-center gap-2 self-start sm:self-auto shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar Rutina Ahora</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysRoutine.exercises.map((ex, idx) => (
            <div
              key={ex.id}
              onClick={() => navigateTo('routine')}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                  <span className="font-mono">#{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] uppercase font-bold text-[#C0FF00]">
                    {ex.primaryMuscle}
                  </span>
                </div>

                <div className="flex items-start gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {ex.image || ex.gifUrl ? (
                      <img
                        src={getExerciseImageUrl(ex.image || ex.gifUrl)}
                        alt={ex.name}
                        loading="lazy"
                        className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Dumbbell className="w-5 h-5 text-white/30" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white capitalize truncate group-hover:text-[#C0FF00] transition-colors">
                      {ex.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
                      <span>
                        <strong>{ex.sets}</strong> series
                      </span>
                      <span>•</span>
                      <span>
                        <strong>{ex.reps}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-[#C0FF00] font-semibold">
                        {ex.suggestedWeightKg} kg
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                  💡 {ex.technicalCue}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-white/40">Descanso: {ex.restSeconds}s</span>
                <span className="text-white/60 font-semibold">RPE {ex.rpe}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
