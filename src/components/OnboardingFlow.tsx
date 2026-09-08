import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  BrainCircuit,
  ChevronDown,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { ExperienceLevel, FitnessGoal } from '../types';

const EXPERIENCE_OPTIONS = [
  { id: 'principiante', label: 'Principiante', desc: '< 1 año' },
  { id: 'intermedio', label: 'Intermedio', desc: '1 a 3 años' },
  { id: 'avanzado', label: 'Avanzado', desc: '3+ años' },
] as const;

const GOAL_OPTIONS: { id: FitnessGoal; title: string; desc: string }[] = [
  { id: 'hipertrofia', title: 'Ganar Masa', desc: '8-12 reps' },
  { id: 'perdida_grasa', title: 'Perder Grasa', desc: 'déficit y densidad' },
  { id: 'fuerza', title: 'Fuerza Máxima', desc: '3-6 reps' },
  { id: 'resistencia', title: 'Resistencia', desc: '15+ reps' },
  { id: 'condicion_general', title: 'Condición General', desc: 'salud y tono' },
];

const MUSCLES = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas', 'Glúteos', 'Abdomen y Core'];

const EQUIPMENT_OPTIONS = [
  'Gimnasio completo',
  'Barras y discos olímpicos',
  'Mancuernas',
  'Poleas y cables',
  'Máquinas guiadas',
  'Calistenia / Peso corporal',
];

interface ProfileStepProps {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  experience: ExperienceLevel;
  daysPerWeek: number;
  avgDuration: number;
  primaryGoal: FitnessGoal;
  targetMuscles: string[];
  equipment: string[];
  injuries: string;
  showAdvanced: boolean;
  onName: (v: string) => void;
  onAge: (v: number) => void;
  onGender: (v: string) => void;
  onHeight: (v: number) => void;
  onWeight: (v: number) => void;
  onExperience: (v: ExperienceLevel) => void;
  onDaysPerWeek: (v: number) => void;
  onAvgDuration: (v: number) => void;
  onPrimaryGoal: (v: FitnessGoal) => void;
  onToggleMuscle: (m: string) => void;
  onToggleEquipment: (item: string) => void;
  onInjuries: (v: string) => void;
  onToggleAdvanced: () => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({
  name,
  age,
  gender,
  height,
  weight,
  experience,
  daysPerWeek,
  avgDuration,
  primaryGoal,
  targetMuscles,
  equipment,
  injuries,
  showAdvanced,
  onName,
  onAge,
  onGender,
  onHeight,
  onWeight,
  onExperience,
  onDaysPerWeek,
  onAvgDuration,
  onPrimaryGoal,
  onToggleMuscle,
  onToggleEquipment,
  onInjuries,
  onToggleAdvanced,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#C0FF00] font-bold mb-1">
          Paso 1 • Tu Nombre
        </p>
        <h2 className="text-2xl sm:text-3xl font-black">¿Cómo te llamas?</h2>
        <p className="text-xs text-white/50 mt-1">
          Solo necesitamos tu nombre para personalizar tu plan. El resto de datos es opcional y
          puedes ajustarlos después desde tu perfil.
        </p>
      </div>

      <div>
        <label
          htmlFor="onboarding-name"
          className="block text-xs font-semibold text-white/70 mb-1.5"
        >
          Nombre <span className="text-[#C0FF00]">*</span>
        </label>
        <input
          id="onboarding-name"
          type="text"
          value={name}
          onChange={(e) => onName(e.target.value)}
          autoFocus
          placeholder="Escribe tu nombre aquí..."
          className={`w-full bg-white/5 border rounded-xl px-4 py-4 text-base text-white focus:outline-none focus:border-[#C0FF00] ${
            name.trim() ? 'border-white/10' : 'border-[#C0FF00]/50'
          }`}
        />
        {!name.trim() && (
          <p className="text-[11px] text-amber-400 mt-1.5">Ingresa tu nombre para continuar.</p>
        )}
      </div>

      {/* Configuración opcional (plegada por defecto) */}
      <div className="pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={onToggleAdvanced}
          aria-expanded={showAdvanced}
          className="w-full flex items-center justify-between gap-3 py-2.5 text-left"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-[#C0FF00]">
            <SlidersHorizontal className="w-4 h-4" />
            Personalizar mi plan (opcional)
          </span>
          <ChevronDown
            className={`w-4 h-4 text-white/50 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          />
        </button>

        {showAdvanced && (
          <div className="space-y-5 pt-4 pb-2 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">
                Objetivo principal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => onPrimaryGoal(goal.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      primaryGoal === goal.id
                        ? 'bg-[#C0FF00]/10 border-[#C0FF00] text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <p
                      className={`text-xs font-bold ${primaryGoal === goal.id ? 'text-[#C0FF00]' : ''}`}
                    >
                      {goal.title}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">{goal.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">
                Nivel de experiencia
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EXPERIENCE_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onExperience(item.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      experience === item.id
                        ? 'bg-[#C0FF00]/10 border-[#C0FF00] text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <p className={`text-xs font-bold ${experience === item.id ? 'text-[#C0FF00]' : ''}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white/70">Días por semana</label>
                <span className="text-xs font-black text-[#C0FF00]">{daysPerWeek} días</span>
              </div>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onDaysPerWeek(d)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      daysPerWeek === d
                        ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white/70">Duración por sesión</label>
                <span className="text-xs font-black text-[#C0FF00]">{avgDuration} min</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[45, 60, 75, 90].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => onAvgDuration(dur)}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      avgDuration === dur
                        ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {dur} min
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">
                Zonas a priorizar
              </label>
              <div className="flex flex-wrap gap-2">
                {MUSCLES.map((muscle) => {
                  const isSelected = targetMuscles.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => onToggleMuscle(muscle)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#C0FF00] text-black shadow-md'
                          : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">
                Equipamiento disponible
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EQUIPMENT_OPTIONS.map((item) => {
                  const isSelected = equipment.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onToggleEquipment(item)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#C0FF00]/10 border-[#C0FF00] text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <span>{item}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#C0FF00]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <label htmlFor="onboarding-injuries" className="text-xs font-semibold text-white/80">
                  Lesiones o limitaciones físicas
                </label>
              </div>
              <textarea
                id="onboarding-injuries"
                value={injuries}
                onChange={(e) => onInjuries(e.target.value)}
                rows={2}
                placeholder="Ej. Molestia en rodilla derecha... (deja vacío si no tienes)"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C0FF00] placeholder:text-white/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="onboarding-age" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Edad
                </label>
                <input
                  id="onboarding-age"
                  type="number"
                  value={age}
                  onChange={(e) => onAge(Number(e.target.value))}
                  min={14}
                  max={90}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
              </div>
              <div>
                <label htmlFor="onboarding-height" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Estatura (cm)
                </label>
                <input
                  id="onboarding-height"
                  type="number"
                  value={height}
                  onChange={(e) => onHeight(Number(e.target.value))}
                  min={120}
                  max={230}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
              </div>
              <div>
                <label htmlFor="onboarding-weight" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Peso (kg)
                </label>
                <input
                  id="onboarding-weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => onWeight(Number(e.target.value))}
                  min={35}
                  max={200}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="onboarding-gender" className="block text-xs font-semibold text-white/70 mb-1.5">
                Género
              </label>
              <select
                id="onboarding-gender"
                value={gender}
                onChange={(e) => onGender(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              >
                <option value="Masculino" className="bg-[#111]">
                  Masculino
                </option>
                <option value="Femenino" className="bg-[#111]">
                  Femenino
                </option>
                <option value="Otro" className="bg-[#111]">
                  Prefiero no decir
                </option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface GenerationStepProps {
  isGenerating: boolean;
  generationProgress: number;
  daysPerWeek: number;
  primaryGoal: FitnessGoal;
  name: string;
  experience: ExperienceLevel;
  avgDuration: number;
  onFinish: () => void;
}

const GenerationStep: React.FC<GenerationStepProps> = ({
  isGenerating,
  generationProgress,
  daysPerWeek,
  primaryGoal,
  name,
  experience,
  avgDuration,
  onFinish,
}) => {
  return (
    <div className="py-8 text-center space-y-6 animate-fadeIn">
      {isGenerating ? (
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#C0FF00]/10 border-2 border-[#C0FF00] flex items-center justify-center relative animate-pulse shadow-[0_0_50px_rgba(192,255,0,0.3)]">
            <BrainCircuit className="w-10 h-10 text-[#C0FF00] animate-spin" />
          </div>
          <div>
            <span className="px-3 py-1 bg-white/10 text-[#C0FF00] text-[10px] font-bold uppercase tracking-widest rounded-full">
              FitAI Engine • Procesando
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-3">
              Estamos preparando una rutina personalizada para ti...
            </h2>
            <p className="text-xs text-white/60 max-w-md mx-auto mt-2 leading-relaxed">
              Sincronizando {daysPerWeek} días de entrenamiento con enfoque en {primaryGoal.toUpperCase()}{' '}
              y adaptando cargas para {name}.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C0FF00] transition-all duration-300 rounded-full"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-white/40 font-mono">
              {generationProgress < 40 && 'Analizando volumen por grupo muscular...'}
              {generationProgress >= 40 && generationProgress < 80 &&
                'Filtrando ejercicios contra lesiones señaladas...'}
              {generationProgress >= 80 && 'Calculando cargas iniciales y descansos óptimos...'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#C0FF00] flex items-center justify-center shadow-[0_0_40px_rgba(192,255,0,0.5)]">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>

          <div>
            <span className="px-3 py-1 bg-[#C0FF00]/20 text-[#C0FF00] text-[11px] font-bold uppercase tracking-wider rounded-full">
              ¡Rutina Lista y Calibrada!
            </span>
            <h2 className="text-3xl font-black mt-3">¡Bienvenido a FitAI Coach, {name}!</h2>
            <p className="text-sm text-white/70 max-w-lg mx-auto mt-2 leading-relaxed">
              Tu plan personalizado de <strong>{daysPerWeek} días</strong> para <strong>{primaryGoal}</strong>{' '}
              ha sido configurado. Tu primera sesión programada es <strong>Empuje Dinámico (Pecho y Tríceps)</strong>.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-2 text-xs">
            <div className="flex justify-between text-white/60">
              <span>Usuario:</span>
              <strong className="text-white">{name}</strong>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Nivel inicial:</span>
              <strong className="text-[#C0FF00] uppercase font-bold">{experience}</strong>
            </div>
            <div className="flex justify-between text-white/60">
              <span>División de entreno:</span>
              <strong className="text-white">{daysPerWeek} días / {avgDuration} min sesión</strong>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Protección articular:</span>
              <strong className="text-amber-400">Filtro de seguridad activo</strong>
            </div>
          </div>

          <button
            onClick={onFinish}
            className="w-full max-w-lg mx-auto py-4 bg-[#C0FF00] text-black font-black text-base rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_35px_rgba(192,255,0,0.4)] flex items-center justify-center gap-3"
          >
            <span>Entrar a Mi Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const OnboardingFlow: React.FC = () => {
  const { user, completeOnboarding } = useApp();
  const [step, setStep] = useState<number>(1);
  const totalSteps = 2;
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Onboarding local form states (solo el nombre es obligatorio)
  const [name, setName] = useState('');
  const [age, setAge] = useState(user.age || 28);
  const [gender, setGender] = useState(user.gender || 'Masculino');
  const [height, setHeight] = useState(user.height || 178);
  const [weight, setWeight] = useState(user.weight || 78.2);

  const [experience, setExperience] = useState<ExperienceLevel>(user.experience || 'intermedio');
  const [daysPerWeek, setDaysPerWeek] = useState(user.daysPerWeek || 4);
  const [avgDuration, setAvgDuration] = useState(user.avgDuration || 60);

  const [primaryGoal, setPrimaryGoal] = useState<FitnessGoal>(user.primaryGoal || 'hipertrofia');
  const [targetMuscles, setTargetMuscles] = useState<string[]>(
    user.targetMuscles || ['Pecho', 'Espalda', 'Hombros']
  );

  const [equipment, setEquipment] = useState<string[]>(
    user.equipment || ['Gimnasio completo', 'Barras y discos', 'Mancuernas']
  );
  const [injuries, setInjuries] = useState(user.injuries || '');

  // Generation step animation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleToggleMuscle = (muscle: string) => {
    setTargetMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const handleToggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const handleStart = () => {
    if (!name.trim()) return;
    // Trigger Step 2 (AI Generation Simulation)
    setStep(2);
    setIsGenerating(true);
    setGenerationProgress(15);

    const interval = setInterval(() => {
      setGenerationProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return p + 20;
      });
    }, 500);
  };

  const handleFinishOnboarding = () => {
    completeOnboarding({
      name,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      experience,
      daysPerWeek: Number(daysPerWeek),
      avgDuration: Number(avgDuration),
      primaryGoal,
      targetMuscles,
      equipment,
      injuries,
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F3F4F6] flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background auras */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C0FF00]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <header className="max-w-2xl w-full mx-auto mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C0FF00] rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
            <span className="font-bold text-white text-sm">FitAI Coach • Onboarding</span>
          </div>
          <span className="text-xs font-bold text-[#C0FF00] uppercase tracking-wider">
            Paso {step} de {totalSteps}
          </span>
        </div>

        {/* Progress meter */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C0FF00] transition-all duration-500 rounded-full shadow-[0_0_15px_#C0FF00]"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full mx-auto bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl relative z-10 my-auto">
        {/* STEP 1: Nombre (obligatorio) + configuración opcional */}
        {step === 1 && (
          <ProfileStep
            name={name}
            age={age}
            gender={gender}
            height={height}
            weight={weight}
            experience={experience}
            daysPerWeek={daysPerWeek}
            avgDuration={avgDuration}
            primaryGoal={primaryGoal}
            targetMuscles={targetMuscles}
            equipment={equipment}
            injuries={injuries}
            showAdvanced={showAdvanced}
            onName={setName}
            onAge={setAge}
            onGender={setGender}
            onHeight={setHeight}
            onWeight={setWeight}
            onExperience={setExperience}
            onDaysPerWeek={setDaysPerWeek}
            onAvgDuration={setAvgDuration}
            onPrimaryGoal={setPrimaryGoal}
            onToggleMuscle={handleToggleMuscle}
            onToggleEquipment={handleToggleEquipment}
            onInjuries={setInjuries}
            onToggleAdvanced={() => setShowAdvanced((prev) => !prev)}
          />
        )}

        {/* STEP 2: AI Generating Custom Routine */}
        {step === 2 && (
          <GenerationStep
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            daysPerWeek={daysPerWeek}
            primaryGoal={primaryGoal}
            name={name}
            experience={experience}
            avgDuration={avgDuration}
            onFinish={handleFinishOnboarding}
          />
        )}

        {/* Step 1 Actions */}
        {step === 1 && (
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={handleStart}
              disabled={!name.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black bg-[#C0FF00] text-black hover:bg-[#aee600] transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(192,255,0,0.3)] disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>Comenzar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Safety Micro-notice */}
      <footer className="text-center text-[11px] text-white/40 mt-6 relative z-10">
        FitAI Coach • Algoritmos basados en ciencia del deporte y sobrecarga progresiva
      </footer>
    </div>
  );
};