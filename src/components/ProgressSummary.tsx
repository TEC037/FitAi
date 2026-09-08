import React from 'react';
import { Activity, Trophy, TrendingUp, Clock, Flame, Scale, Dumbbell } from 'lucide-react';
import { useApp } from '../context/useApp';

/** Métricas de progreso integradas en el Perfil. */
export const ProgressSummary: React.FC = () => {
  const { user, personalRecords, weightHistory, history } = useApp();

  const totalVolumeTonnes = (history.reduce((s, h) => s + h.totalVolumeKg, 0) / 1000).toFixed(1);
  const totalHours = (history.reduce((s, h) => s + h.durationMinutes, 0) / 60).toFixed(1);

  const kpis = [
    { label: 'Constancia', value: `${user.weeklyCompliance}%`, icon: Activity, tone: 'text-lime-600 bg-lime-100' },
    { label: 'Volumen total', value: `${totalVolumeTonnes} t`, icon: Flame, tone: 'text-orange-500 bg-orange-100' },
    { label: 'Horas entrenadas', value: `${totalHours} h`, icon: Clock, tone: 'text-sky-600 bg-sky-100' },
    { label: 'Sesiones', value: String(history.length), icon: Dumbbell, tone: 'text-indigo-500 bg-indigo-100' },
  ];

  const latestWeight = weightHistory[weightHistory.length - 1];
  const weightChange =
    weightHistory.length >= 2
      ? weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
      : 0;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white/70 border border-black/5 rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${k.tone}`}>
              <k.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-black mt-2">{k.value}</p>
            <p className="text-[11px] text-slate-500 font-semibold">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Evolución de peso */}
        <div className="bg-white/70 border border-black/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-black">Evolución de peso</p>
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {weightHistory.slice(-12).map((w, i) => {
              const max = Math.max(...weightHistory.slice(-12).map((x) => x.weight), user.weight, 1);
              const height = Math.max(6, (w.weight / max) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className="rounded-t-lg bg-gradient-to-t from-lime-300 to-amber-300"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] font-bold">
            <span className="text-slate-400">{weightHistory[0]?.date ?? '—'}</span>
            <span className={weightChange <= 0 ? 'text-lime-600' : 'text-amber-600'}>
              {latestWeight ? `${latestWeight.weight} kg` : `${user.weight} kg`}
              {weightChange !== 0 && ` (${weightChange > 0 ? '+' : ''}${weightChange})`}
            </span>
          </div>
        </div>

        {/* Top récords */}
        <div className="bg-white/70 border border-black/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-black">Récords personales</p>
          </div>
          {personalRecords.length === 0 ? (
            <p className="text-xs text-slate-400">
              Entrena y registra tus mejores marcas: aparecerán aquí.
            </p>
          ) : (
            <ul className="space-y-2">
              {personalRecords.slice(0, 4).map((pr) => (
                <li
                  key={pr.id}
                  className="flex items-center justify-between gap-2 text-xs bg-white/60 border border-black/5 rounded-xl px-3 py-2"
                >
                  <span className="font-bold capitalize truncate">{pr.exerciseName}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500">{pr.recordValue}</span>
                    {pr.progressPercent > 0 && (
                      <span className="text-lime-600 font-black flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +{pr.progressPercent}%
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;