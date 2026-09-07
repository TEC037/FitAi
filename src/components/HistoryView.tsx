import React, { useState } from 'react';
import {
  History,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Dumbbell,
  MessageSquare,
  Heart,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { formatIsoDate } from '../utils/format';

const DEFAULT_AVERAGE_HR_BPM = 142;
const DEFAULT_PEAK_HR_BPM = 165;
const DEFAULT_ALLOMETRIC_POWER_W = 490;

export const HistoryView: React.FC = () => {
  const { history, startWorkout } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(history[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex-1 p-4 sm:p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full relative">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C0FF00]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C0FF00]/10 text-[#C0FF00] text-xs font-bold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Registro Cronológico de Sesiones</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Historial de Entrenamientos
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Revisa cada serie realizada, sensaciones registradas y los ajustes del Coach IA.
          </p>
        </div>

        <div className="text-xs text-white/50 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 self-start sm:self-auto">
          Total sesiones: <strong className="text-white">{history.length}</strong>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-12 text-center space-y-4">
            <Dumbbell className="w-12 h-12 text-white/30 mx-auto" />
            <h3 className="text-lg font-bold text-white">Aún no hay sesiones registradas</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              Inicia tu primera sesión hoy para que el Coach IA comience a almacenar tus métricas.
            </p>
            <button
              onClick={() => startWorkout(1)}
              className="px-6 py-3 bg-[#C0FF00] text-black font-black text-xs rounded-xl"
            >
              Comenzar Entrenamiento
            </button>
          </div>
        ) : (
          history.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                className="bg-[#0A0A0A] border border-white/10 rounded-[28px] overflow-hidden transition-all hover:border-white/20"
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-xs text-white/40">
                      <Calendar className="w-3.5 h-3.5 text-[#C0FF00]" />
                      <span className="font-mono">{formatIsoDate(log.date)}</span>
                      <span>•</span>
                      <span className="text-[#C0FF00] font-semibold">RPE {log.averageRpe}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{log.routineName}</h3>
                    <p className="text-xs text-white/50 mt-1 line-clamp-1">
                      {log.userObservations || 'Sesión completada con éxito.'}
                    </p>
                  </div>

                  {/* Badges & Expand toggle */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="grid grid-cols-4 gap-2 bg-white/5 p-2 rounded-xl border border-white/5 text-center text-xs">
                      <div className="px-2">
                        <span className="text-[9px] text-white/40 uppercase block">Duración</span>
                        <span className="font-black text-white">{log.durationMinutes}m</span>
                      </div>
                      <div className="px-2 border-x border-white/10">
                        <span className="text-[9px] text-white/40 uppercase block">Series</span>
                        <span className="font-black text-white">{log.totalSets}</span>
                      </div>
                      <div className="px-2 border-r border-white/10">
                        <span className="text-[9px] text-white/40 uppercase block">Volumen</span>
                        <span className="font-black text-[#C0FF00]">
                          {(log.totalVolumeKg / 1000).toFixed(1)}t
                        </span>
                      </div>
                      <div className="px-2">
                        <span className="text-[9px] text-red-400 uppercase block">Pulso</span>
                        <span className="font-black text-red-400 font-mono">
                          {log.averageHeartRate ?? DEFAULT_AVERAGE_HR_BPM}{' '}
                          <span className="text-[8px] font-normal text-white/40">bpm</span>
                        </span>
                      </div>
                    </div>

                    <button className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 pt-0 border-t border-white/5 space-y-5 animate-fadeIn">
                    {/* Allometric Telemetry Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 uppercase block font-bold">
                            Ritmo Cardíaco (M^-1/4)
                          </span>
                          <span className="font-mono font-black text-white text-sm">
                            {log.averageHeartRate ?? DEFAULT_AVERAGE_HR_BPM} bpm{' '}
                            <span className="text-[10px] text-white/40 font-normal">
                              (Pico: {log.peakHeartRate ?? DEFAULT_PEAK_HR_BPM})
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#C0FF00]/10 text-[#C0FF00]">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 uppercase block font-bold">
                            Calorías Kleiber (M^3/4)
                          </span>
                          <span className="font-mono font-black text-[#C0FF00] text-sm">
                            {log.allometricCalories ?? log.caloriesBurned} kcal
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 uppercase block font-bold">
                            Potencia Metabólica
                          </span>
                          <span className="font-mono font-black text-amber-400 text-sm">
                            {log.allometricPowerWatts ?? DEFAULT_ALLOMETRIC_POWER_W} W
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Coach Feedback Box */}
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                      <div className="flex items-center gap-2 mb-1.5 text-indigo-400 font-bold">
                        <Sparkles className="w-4 h-4" />
                        <span>Evaluación del Coach IA</span>
                      </div>
                      <p className="text-white/80 leading-relaxed italic">
                        "{log.aiCoachFeedback}"
                      </p>
                    </div>

                    {/* User Observations */}
                    {log.userObservations && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs">
                        <div className="flex items-center gap-2 mb-1 text-white/60 font-semibold">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Observaciones del atleta:</span>
                        </div>
                        <p className="text-white/80 leading-relaxed">"{log.userObservations}"</p>
                      </div>
                    )}

                    {/* Sets Log Table */}
                    {log.completedSets && log.completedSets.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                          Detalle de Series Registradas
                        </h4>
                        <div className="space-y-1.5">
                          {log.completedSets.map((s, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-white/80"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#C0FF00]/10 text-[#C0FF00] font-bold flex items-center justify-center text-[10px]">
                                  {s.setNumber}
                                </span>
                                <span className="font-semibold text-white">{s.exerciseName}</span>
                                <span className="text-white/40">•</span>
                                <span className="text-[#C0FF00] font-mono font-bold">
                                  {s.weightKg} kg × {s.reps} reps
                                </span>
                                <span className="text-white/40">(RPE {s.rpe})</span>
                              </div>
                              {s.sensation && (
                                <span className="text-[11px] text-white/50 italic truncate max-w-xs">
                                  "{s.sensation}"
                                </span>
                              )}
                              <span className="text-[10px] text-white/30 font-mono">
                                {s.completedAt}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
