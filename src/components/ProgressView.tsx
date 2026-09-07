import React, { useState } from 'react';
import {
  Activity,
  Trophy,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Heart,
  Flame,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { MOCK_WEEKLY_VOLUME } from '../data/mockProgress';
import { MAX_WEEKLY_VOLUME_REFERENCE } from '../config/constants';
import { formatNumber } from '../utils/format';
import { PersonalRecord } from '../types';
import { AllometricProfile, calculateAllometricStrengthScore } from '../services/allometricService';
import { useIsMobile } from '../hooks/useIsMobile';

export const ProgressView: React.FC = () => {
  const { user, personalRecords, weightHistory, history, allometricProfile } = useApp();
  const [timeFilter, setTimeFilter] = useState<'semana' | 'mes' | 'año'>('mes');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const isMobile = useIsMobile();

  const filteredPrs = personalRecords.filter((pr) => {
    if (categoryFilter === 'todos') return true;
    return pr.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  // Calculate high-level stats
  const totalVolumeAllHistory = history.reduce((sum, h) => sum + h.totalVolumeKg, 0);
  const totalHoursTrained = (history.reduce((sum, h) => sum + h.durationMinutes, 0) / 60).toFixed(
    1
  );

  if (isMobile) {
    return (
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-4 max-w-md mx-auto w-full">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Progreso</p>
          <h1 className="text-2xl font-black tracking-tight text-white">Mis Métricas</h1>
          <p className="text-xs text-white/50 mt-0.5">
            Evolución, constancia y récords actuales.
          </p>
        </div>

        <StatsKpiGrid
          compliance={user.weeklyCompliance}
          totalVolumeTonnes={(totalVolumeAllHistory / 1000).toFixed(1)}
          totalHoursTrained={totalHoursTrained}
          sessionCount={history.length}
          personalRecordsCount={personalRecords.length}
        />

        <WeightEvolutionChart weightHistory={weightHistory} currentWeight={user.weight} />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#C0FF00]" />
            <h3 className="text-sm font-black text-white">Récords Personales</h3>
          </div>
          {personalRecords.length === 0 ? (
            <p className="text-xs text-white/50 px-1">
              Aún no hay récords registrados.
            </p>
          ) : (
            personalRecords.map((pr) => (
              <div
                key={pr.id}
                className="p-4 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{pr.exerciseName}</p>
                  <p className="text-[10px] uppercase font-bold text-white/40">
                    {pr.category} • {pr.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-black text-[#C0FF00] font-mono">{pr.recordValue}</p>
                  <p className="text-[10px] font-bold text-emerald-400">+{pr.progressPercent}%</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full relative">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C0FF00]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C0FF00]/10 text-[#C0FF00] text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Métricas de Rendimiento y Biomecánica</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Seguimiento del Progreso</h1>
          <p className="text-sm text-white/60 mt-1">
            Visualiza tu sobrecarga progresiva, consistencia semanal y evolución biométrica.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 self-start md:self-auto">
          {(['semana', 'mes', 'año'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                timeFilter === t
                  ? 'bg-[#C0FF00] text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <StatsKpiGrid
        compliance={user.weeklyCompliance}
        totalVolumeTonnes={(totalVolumeAllHistory / 1000).toFixed(1)}
        totalHoursTrained={totalHoursTrained}
        sessionCount={history.length}
        personalRecordsCount={personalRecords.length}
      />

      {/* Main Charts Grid: Weight Evolution & Weekly Volume Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <WeightEvolutionChart weightHistory={weightHistory} currentWeight={user.weight} />

        {/* Weekly Volume Comparison (col-span-5) */}
        <div className="lg:col-span-5 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
              Comparativa Semanal
            </p>
            <h3 className="text-xl font-black text-white mb-1">Volumen Levantado (kg)</h3>
            <p className="text-xs text-white/50">Carga total calculada = Series × Reps × Peso</p>
          </div>

          <div className="space-y-4 my-6">
            {MOCK_WEEKLY_VOLUME.map((w, idx) => {
              const percent = (w.volumeKg / MAX_WEEKLY_VOLUME_REFERENCE) * 100;
              const isCurrent = idx === MOCK_WEEKLY_VOLUME.length - 1;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={isCurrent ? 'text-[#C0FF00] font-bold' : 'text-white/70'}>
                      {w.week} ({w.workouts} workouts)
                    </span>
                    <span className="font-mono text-white">{formatNumber(w.volumeKg)} kg</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCurrent ? 'bg-[#C0FF00] shadow-[0_0_10px_#C0FF00]' : 'bg-indigo-500/50'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-white/60">Sobrecarga progresiva:</span>
            <span className="text-[#C0FF00] font-bold">+15.2% vs Semana 1</span>
          </div>
        </div>
      </div>

      {/* Personal Records Showcase */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#C0FF00]" />
              <span>Récords Personales (Personal Records - PR)</span>
            </h3>
            <p className="text-xs text-white/50">
              Tus mejores marcas registradas validadas por el algoritmo
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {['todos', 'pecho', 'piernas', 'espalda', 'hombros'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  categoryFilter === cat
                    ? 'bg-white/15 text-[#C0FF00] border border-[#C0FF00]/40'
                    : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrs.map((pr) => (
            <PersonalRecordCard key={pr.id} pr={pr} />
          ))}
        </div>
      </div>

      {/* Panel Fisiológico Alométrico: Escalas x^(3/4), x^(-1/4), x^(2/3) */}
      <AllometricPanel userWeight={user.weight} allometricProfile={allometricProfile} />
    </div>
  );
};

// --- INLINED COMPONENTS ---

interface StatsKpiGridProps {
  compliance: number;
  totalVolumeTonnes: string;
  totalHoursTrained: string;
  sessionCount: number;
  personalRecordsCount: number;
}

export const StatsKpiGrid: React.FC<StatsKpiGridProps> = ({
  compliance,
  totalVolumeTonnes,
  totalHoursTrained,
  sessionCount,
  personalRecordsCount,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div className="bg-[#0A0A0A] p-5 rounded-[24px] border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-white/40 mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider">Cumplimiento</span>
          <Activity className="w-4 h-4 text-[#C0FF00]" />
        </div>
        <p className="text-3xl font-black text-white">{compliance}%</p>
        <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-[#C0FF00]" style={{ width: `${compliance}%` }} />
        </div>
      </div>

      <div className="bg-[#0A0A0A] p-5 rounded-[24px] border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-white/40 mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider">Volumen Acumulado</span>
          <TrendingUp className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-3xl font-black text-white">
          {totalVolumeTonnes} <span className="text-base text-white/40 font-normal">toneladas</span>
        </p>
        <p className="text-[10px] text-emerald-400 font-medium mt-2">+7.2% vs mes anterior</p>
      </div>

      <div className="bg-[#0A0A0A] p-5 rounded-[24px] border border-white/10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-white/40 mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider">Tiempo Entrenado</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-3xl font-black text-white">
          {totalHoursTrained} <span className="text-base text-white/40 font-normal">horas</span>
        </p>
        <p className="text-[10px] text-white/40 font-medium mt-2">
          {sessionCount} sesiones completadas
        </p>
      </div>

      <div className="bg-[#0A0A0A] p-5 rounded-[24px] border border-[#C0FF00]/30 bg-[#C0FF00]/5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#C0FF00] mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider">Récords (PRs)</span>
          <Trophy className="w-4 h-4" />
        </div>
        <p className="text-3xl font-black text-white">{personalRecordsCount}</p>
        <p className="text-[10px] text-[#C0FF00] font-medium mt-2">Último récord: Bench 95 kg</p>
      </div>
    </div>
  );
};

type WeightPoint = { date: string; weight: number };

interface WeightEvolutionChartProps {
  weightHistory: WeightPoint[];
  currentWeight: number;
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 180;
const PADDING_X = 40;
const PADDING_Y = 25;

export const WeightEvolutionChart: React.FC<WeightEvolutionChartProps> = ({
  weightHistory,
  currentWeight,
}) => {
  if (weightHistory.length < 2) {
    return (
      <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-xl">
        <p className="text-sm text-white/50">
          Aún no hay suficientes registros de peso para trazar la curva. Actualiza tu peso en el
          perfil para comenzar el seguimiento.
        </p>
      </div>
    );
  }

  const minWeight = Math.min(...weightHistory.map((w) => w.weight)) - 0.5;
  const maxWeight = Math.max(...weightHistory.map((w) => w.weight)) + 0.5;

  const points = weightHistory.map((item, idx) => {
    const x = PADDING_X + (idx / (weightHistory.length - 1)) * (SVG_WIDTH - PADDING_X * 2);
    const y =
      SVG_HEIGHT -
      PADDING_Y -
      ((item.weight - minWeight) / (maxWeight - minWeight)) * (SVG_HEIGHT - PADDING_Y * 2);
    return { x, y, ...item };
  });

  const svgPathString = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  return (
    <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#C0FF00] font-bold">
            Evolución Biométrica
          </p>
          <h3 className="text-xl font-black text-white">Curva de Peso Corporal (kg)</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-white">{currentWeight} kg</span>
          <p className="text-[10px] text-emerald-400 font-medium">Recomposición magra</p>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="w-full overflow-x-auto py-2">
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-44 text-[#C0FF00]">
          {/* Subtle Grid Lines */}
          <line
            x1={PADDING_X}
            y1={PADDING_Y}
            x2={SVG_WIDTH - PADDING_X}
            y2={PADDING_Y}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4"
          />
          <line
            x1={PADDING_X}
            y1={SVG_HEIGHT / 2}
            x2={SVG_WIDTH - PADDING_X}
            y2={SVG_HEIGHT / 2}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4"
          />
          <line
            x1={PADDING_X}
            y1={SVG_HEIGHT - PADDING_Y}
            x2={SVG_WIDTH - PADDING_X}
            y2={SVG_HEIGHT - PADDING_Y}
            stroke="rgba(255,255,255,0.1)"
          />

          {/* Area Gradient fill */}
          <defs>
            <linearGradient id="weightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C0FF00" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#C0FF00" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon
            points={`${points[0].x},${SVG_HEIGHT - PADDING_Y} ${points.map((p) => `${p.x},${p.y}`).join(' ')} ${points[points.length - 1].x},${SVG_HEIGHT - PADDING_Y}`}
            fill="url(#weightGrad)"
          />

          {/* Polyline line */}
          <path
            d={svgPathString}
            fill="none"
            stroke="#C0FF00"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={i === points.length - 1 ? '5' : '3.5'}
                className="fill-black stroke-[#C0FF00] stroke-[2.5]"
              />
              <text
                x={pt.x}
                y={SVG_HEIGHT - 6}
                textAnchor="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize="9"
                fontWeight="600"
              >
                {pt.date}
              </text>
              <text
                x={pt.x}
                y={pt.y - 8}
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="700"
              >
                {pt.weight}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="text-[11px] text-white/40 mt-3 pt-3 border-t border-white/5 italic">
        Tendencia descendente controlada (-1.3 kg en 8 semanas) manteniendo masa muscular según
        registros de sobrecarga.
      </p>
    </div>
  );
};

interface PersonalRecordCardProps {
  pr: PersonalRecord;
}

export const PersonalRecordCard: React.FC<PersonalRecordCardProps> = ({ pr }) => {
  return (
    <div className="p-5 rounded-[24px] bg-[#0A0A0A] border border-white/10 hover:border-[#C0FF00]/30 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs text-white/40 mb-2">
          <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-[10px] uppercase font-bold text-white/60">
            {pr.category}
          </span>
          <span className="font-mono text-[10px]">{pr.date}</span>
        </div>
        <h4 className="font-bold text-base text-white mb-2">{pr.exerciseName}</h4>
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-2xl font-black text-[#C0FF00]">{pr.recordValue}</p>
          {pr.allometricScore && (
            <span className="text-[11px] font-mono font-bold bg-[#C0FF00]/10 text-[#C0FF00] px-2 py-0.5 rounded border border-[#C0FF00]/20">
              S = {pr.allometricScore} (x^2/3)
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] text-white/50">
          <span>
            Marca anterior: <span className="line-through">{pr.previousValue}</span>
          </span>
          {pr.normalized70kgLoad && (
            <span className="text-cyan-400 font-mono">Eq. 70kg: {pr.normalized70kgLoad} kg</span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>+{pr.progressPercent}% de ganancia</span>
        </span>
        <span className="text-[10px] text-white/40 uppercase">Certificado</span>
      </div>
    </div>
  );
};

interface AllometricPanelProps {
  userWeight: number;
  allometricProfile: AllometricProfile;
}

export const AllometricPanel: React.FC<AllometricPanelProps> = ({
  userWeight,
  allometricProfile,
}) => {
  const [interactiveLiftWeight, setInteractiveLiftWeight] = useState<number>(100);
  const interactiveScore = calculateAllometricStrengthScore(interactiveLiftWeight, userWeight);

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/20">
            <Heart className="w-3.5 h-3.5" />
            <span>Biometría Alométrica Personalizada (M = {userWeight} kg)</span>
          </div>
          <h3 className="text-2xl font-black text-white">
            Modelado Biofísico: Escalas x^(3/4), x^(-1/4) y x^(2/3)
          </h3>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Las leyes de escala de Kleiber y West-Brown-Enquist corrigen las distorsiones lineales
            de cálculo para tu masa real.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10">
          <ShieldCheck className="w-4 h-4 text-[#C0FF00]" />
          <span className="text-xs text-white/80 font-mono">
            Factor Norm. 70kg:{' '}
            <strong className="text-[#C0FF00]">{allometricProfile.strengthScalingFactor}</strong>
          </span>
        </div>
      </div>

      {/* 3 Major Scaling Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Cardiac Quarter-Power Scaling */}
        <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                <Heart className="w-4 h-4" />
                <span>Dinámica Cardíaca (x^-1/4 y x^1/4)</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">West & Nielsen</span>
            </div>

            <div className="space-y-3">
              <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-xs text-white/70">RHR Basal Alométrico:</span>
                <span className="text-base font-black text-white font-mono">
                  {allometricProfile.allometricRestingHr}{' '}
                  <span className="text-[11px] text-white/40">BPM</span>
                </span>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-xs text-white/70">Duración del Ciclo Cardíaco τ:</span>
                <span className="text-base font-black text-cyan-400 font-mono">
                  {allometricProfile.cardiacCycleDurationSec}{' '}
                  <span className="text-[11px] text-white/40">s/latido</span>
                </span>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-xs text-white/70">Recuperación Post-Serie (t½):</span>
                <span className="text-base font-black text-[#C0FF00] font-mono">
                  {allometricProfile.cardiacRecoveryHalfLifeSec}{' '}
                  <span className="text-[11px] text-white/40">s (escala x^1/4)</span>
                </span>
              </div>
            </div>

            {/* Mini Zones Bar */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[10px] text-white/40 uppercase font-bold mb-2">
                5 Zonas Cardíacas Calibradas a tu Masa
              </p>
              <div className="space-y-1.5">
                {allometricProfile.zones.map((z, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
                      <span className="text-white/80 font-medium">{z.name.split(':')[0]}</span>
                    </div>
                    <span className="font-mono text-white/60">
                      {z.minBpm}-{z.maxBpm} bpm
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-white/40 italic">
            * f_HR ∝ M^(-1/4). A mayor masa, el gasto sistólico por latido es mayor y la frecuencia
            en reposo disminuye.
          </p>
        </div>

        {/* Module 2: Kleiber's Law Metabolism 3/4 */}
        <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[#C0FF00] font-bold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Metabolismo de Kleiber (x^3/4)</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">Ley de 1932</span>
            </div>

            <div className="space-y-3">
              <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-xs text-white/70">BMR Alométrico (70 × M^0.75):</span>
                <span className="text-base font-black text-[#C0FF00] font-mono">
                  {allometricProfile.kleiberBmrKcal}{' '}
                  <span className="text-[11px] text-white/40">kcal/día</span>
                </span>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-xs text-white/70">TDEE Alométrico Total:</span>
                <span className="text-base font-black text-white font-mono">
                  {allometricProfile.allometricTdeeKcal}{' '}
                  <span className="text-[11px] text-white/40">kcal/día</span>
                </span>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-xs text-white/70">Fórmula Lineal Convencional:</span>
                <span className="text-base font-black text-white/60 font-mono">
                  {allometricProfile.linearBmrComparisonKcal}{' '}
                  <span className="text-[11px] text-white/40">kcal</span>
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#C0FF00]/5 border border-[#C0FF00]/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Precisión Biofísica Kleiber:</span>
                <span className="font-mono font-bold text-[#C0FF00]">
                  {allometricProfile.bmrAllometricDeltaKcal > 0 ? '+' : ''}
                  {allometricProfile.bmrAllometricDeltaKcal} kcal/día
                </span>
              </div>
              <p className="text-[10px] text-white/50 mt-1 leading-relaxed">
                Las fórmulas lineales como Harris-Benedict distorsionan el consumo en pesos no
                promedio al ignorar la ramificación fractal del sistema vascular.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-white/40 italic">
            * Consumo calórico en sesión: P_metabólica ∝ M^(3/4) × MET × Tiempo.
          </p>
        </div>

        {/* Module 3: Geometric Strength Index 2/3 (Jaric-Siff) */}
        <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>Fuerza Jaric-Siff (x^2/3)</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">S = Load / M^(2/3)</span>
            </div>

            {/* Interactive Strength Evaluator */}
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/70">Simulador de Levantamiento:</span>
                <span className="font-mono font-black text-white text-sm">
                  {interactiveLiftWeight} kg
                </span>
              </div>

              <input
                type="range"
                min="20"
                max="240"
                step="2.5"
                value={interactiveLiftWeight}
                onChange={(e) => setInteractiveLiftWeight(Number(e.target.value))}
                className="w-full accent-[#C0FF00] h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />

              <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Índice Alométrico S:</span>
                  <span className="font-mono font-black text-[#C0FF00]">
                    {interactiveScore.allometricScore}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Equiv. Atleta de 70 kg:</span>
                  <span className="font-mono font-black text-cyan-300">
                    {interactiveScore.normalized70kgLoad} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Clasificación:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white">
                    {interactiveScore.classification}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-white/40 italic">
            * La fuerza muscular escala con el área transversal (L^2 = M^2/3), lo que permite
            comparar justamente el rendimiento entre categorías de peso.
          </p>
        </div>
      </div>
    </div>
  );
};
