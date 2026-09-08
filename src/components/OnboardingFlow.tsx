import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BrainCircuit,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { ExperienceLevel, FitnessGoal } from '../types';
import { DailyRoutine } from '../types';
import { SURVEY_QUESTIONS, SurveyQuestion } from '../data/surveyQuestions';
import { EXERCISE_DATABASE } from '../services/exerciseDatabaseService';
import {
  SurveyAnswers,
  RoutineSummary,
  generateRoutineFromSurvey,
} from '../utils/routineGenerator';

const EQUIPMENT_LABELS: Record<string, string> = {
  gimnasio: 'Gimnasio completo',
  barras: 'Barras y discos',
  mancuernas: 'Mancuernas',
  maquinas: 'Máquinas guiadas',
  poleas: 'Poleas y cables',
  calistenia: 'Calistenia / peso corporal',
};

const LIMITATION_LABELS: Record<string, string> = {
  ninguna: '',
  rodillas: 'Rodillas',
  espalda: 'Zona lumbar',
  hombros: 'Hombros',
  cervical: 'Cervical',
};

type AnswerMap = Record<string, string[]>;

// --- Paso 1: Nombre (obligatorio) ---

const NameStep: React.FC<{
  name: string;
  onName: (v: string) => void;
  onContinue: () => void;
}> = ({ name, onName, onContinue }) => (
  <div className="space-y-6 animate-fadeIn">
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#C0FF00] font-bold mb-1">
        Paso 1 • Tu Nombre
      </p>
      <h2 className="text-2xl sm:text-3xl font-black">¿Cómo te llamas?</h2>
      <p className="text-xs text-white/50 mt-1 leading-relaxed">
        Enseguida te haremos una encuesta breve para entender tu punto de partida y tus
        necesidades. Tu plan se generará a partir de tus respuestas.
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

    <div className="flex justify-end">
      <button
        type="button"
        onClick={onContinue}
        disabled={!name.trim()}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black bg-[#C0FF00] text-black hover:bg-[#aee600] transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(192,255,0,0.3)] disabled:opacity-40 disabled:pointer-events-none"
      >
        <span>Comenzar</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// --- Paso: una pregunta de la encuesta ---

const SurveyStep: React.FC<{
  question: SurveyQuestion;
  value: string[];
  onSelect: (value: string[]) => void;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
}> = ({ question, value, onSelect, canGoBack, onBack, onNext }) => {
  const Icon = question.icon;
  const isSingle = question.type === 'single';

  const handleSelect = (optionValue: string) => {
    if (question.id === 'limitations') {
      if (optionValue === 'ninguna') {
        onSelect(['ninguna']);
        return;
      }
      const filtered = value.filter((v) => v !== 'ninguna');
      onSelect(
        filtered.includes(optionValue)
          ? filtered.filter((v) => v !== optionValue)
          : [...filtered, optionValue]
      );
      return;
    }
    if (isSingle) {
      onSelect(value[0] === optionValue ? [''] : [optionValue]);
      return;
    }
    onSelect(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    );
  };

  const isValid = isSingle ? Boolean(value[0]) : value.length >= 1;

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-[#C0FF00]/10 border border-[#C0FF00]/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#C0FF00]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black">{question.title}</h2>
      </div>
      {question.hint && <p className="text-xs text-white/50">{question.hint}</p>}

      <div className={`grid gap-2 ${question.options.length > 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-2'} grid-cols-1`}>
        {question.options.map((option) => {
          const selected = question.id === 'limitations'
            ? option.value === 'ninguna'
              ? value.includes('ninguna')
              : value.includes(option.value) && !value.includes('ninguna')
            : value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => handleSelect(option.value)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selected
                  ? 'bg-[#C0FF00]/10 border-[#C0FF00] text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              <p className={`text-sm font-bold ${selected ? 'text-[#C0FF00]' : ''}`}>
                {option.label}
              </p>
              {option.desc && <p className="text-[10px] text-white/40 mt-0.5">{option.desc}</p>}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-white/5 text-white/70 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-[#C0FF00] text-black hover:bg-[#aee600] transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          Siguiente
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- Paso: datos biométricos ---

const BiosStep: React.FC<{
  age: number;
  height: number;
  weight: number;
  gender: string;
  onAge: (v: number) => void;
  onHeight: (v: number) => void;
  onWeight: (v: number) => void;
  onGender: (v: string) => void;
  onBack: () => void;
  onGenerate: () => void;
}> = ({ age, height, weight, gender, onAge, onHeight, onWeight, onGender, onBack, onGenerate }) => (
  <div className="space-y-5 animate-fadeIn">
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#C0FF00] font-bold mb-1">Tu perfil</p>
      <h2 className="text-2xl sm:text-3xl font-black">Un par de datos biométricos</h2>
      <p className="text-xs text-white/50 mt-1">Para calibrar cargas iniciales razonables.</p>
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
        <option value="Masculino" className="bg-[#111]">Masculino</option>
        <option value="Femenino" className="bg-[#111]">Femenino</option>
        <option value="Otro" className="bg-[#111]">Prefiero no decir</option>
      </select>
    </div>

    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Atrás
      </button>
      <button
        type="button"
        onClick={onGenerate}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-[#C0FF00] text-black hover:bg-[#aee600] transition-colors"
      >
        Generar mi plan
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// --- Paso final: generación + resumen + bienvenida ---

interface GenerationStepProps {
  isGenerating: boolean;
  generationProgress: number;
  daysPerWeek: number;
  primaryGoal: FitnessGoal;
  name: string;
  avgDuration: number;
  summary: RoutineSummary | null;
  routines: DailyRoutine[];
  onFinish: () => void;
  onBack: () => void;
}

const GenerationStep: React.FC<GenerationStepProps> = ({
  isGenerating,
  generationProgress,
  daysPerWeek,
  primaryGoal,
  name,
  avgDuration,
  summary,
  routines,
  onFinish,
  onBack,
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
              Sincronizando {daysPerWeek} días de entrenamiento con enfoque en{' '}
              {primaryGoal.toUpperCase()} y adaptando cargas para {name}.
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
              {generationProgress < 40 && 'Analizando tu encuesta y volumen por grupo muscular...'}
              {generationProgress >= 40 && generationProgress < 80 &&
                'Filtrando ejercicios contra tu equipamiento y lesiones...'}
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
              Tu plan personalizado de <strong>{daysPerWeek} días</strong> para{' '}
              <strong>{primaryGoal}</strong> ha sido generado a partir de tus respuestas.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-2 text-xs">
            <div className="flex justify-between text-white/60">
              <span>Usuario:</span>
              <strong className="text-white">{name}</strong>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Enfoque:</span>
              <strong className="text-[#C0FF00] uppercase font-bold">{summary?.goalLabel ?? primaryGoal}</strong>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Estilo:</span>
              <strong className="text-white">{summary?.styleLabel}</strong>
            </div>
            <div className="flex justify-between text-white/60">
              <span>División:</span>
              <strong className="text-white">{daysPerWeek} días / {avgDuration} min sesión</strong>
            </div>
            {summary?.safetyNote && (
              <div className="flex justify-between text-amber-400">
                <span>Protección articular:</span>
                <strong className="max-w-[60%] text-right">{summary.safetyNote}</strong>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left max-w-lg mx-auto">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">
              Tu semana de entrenamiento
            </p>
            <ul className="space-y-1.5">
              {routines.map((r) => (
                <li key={r.dayNumber} className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-bold">Día {r.dayNumber} • {r.name}</span>
                  <span className="text-white/40">
                    {r.isRestDay ? 'recuperación' : `${r.exercises.length} ejercicios`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-4 rounded-2xl text-xs font-black bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </button>
            <button
              onClick={onFinish}
              className="flex-1 py-4 bg-[#C0FF00] text-black font-black text-base rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_35px_rgba(192,255,0,0.4)] flex items-center justify-center gap-3"
            >
              <span>Entrar a Mi Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Flujo completo ---

export const OnboardingFlow: React.FC = () => {
  const { user, completeOnboarding } = useApp();
  const totalSteps = SURVEY_QUESTIONS.length + 3;
  const [step, setStep] = useState<number>(1);

  const [name, setName] = useState('');
  const [age, setAge] = useState(user.age || 28);
  const [gender, setGender] = useState(user.gender || 'Masculino');
  const [height, setHeight] = useState(user.height || 178);
  const [weight, setWeight] = useState(user.weight || 78.2);

  const [answers, setAnswers] = useState<AnswerMap>(() =>
    Object.fromEntries(SURVEY_QUESTIONS.map((q) => [q.id, []]))
  );

  const surveyIndex = step >= 2 && step <= SURVEY_QUESTIONS.length + 1 ? step - 2 : -1;
  const biosStep = step === SURVEY_QUESTIONS.length + 2;
  const genStep = step === SURVEY_QUESTIONS.length + 3;

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generated, setGenerated] = useState<{ routines: DailyRoutine[]; summary: RoutineSummary } | null>(null);
  const generationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (generationTimer.current) clearInterval(generationTimer.current);
    };
  }, []);

  const surveyAnswers: SurveyAnswers = useMemo(() => {
    const pick = (id: string) => answers[id]?.[0];
    return {
      goal: (pick('goal') as FitnessGoal) || 'hipertrofia',
      experience: (pick('experience') as ExperienceLevel) || 'intermedio',
      daysPerWeek: Number(pick('days')) || 4,
      minutesPerSession: Number(pick('minutes')) || 60,
      equipment: answers.equipment ?? [],
      priorityMuscles: answers.muscles ?? [],
      limitations: answers.limitations ?? [],
      style: (pick('style') as SurveyAnswers['style']) || 'balanced',
    };
  }, [answers]);

  const goTo = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGeneration = () => {
    const result = generateRoutineFromSurvey(surveyAnswers, EXERCISE_DATABASE);
    setGenerated(result);
    goTo(totalSteps);
    setIsGenerating(true);
    setGenerationProgress(15);

    generationTimer.current = setInterval(() => {
      setGenerationProgress((p) => {
        if (p >= 100) {
          if (generationTimer.current) clearInterval(generationTimer.current);
          setIsGenerating(false);
          return 100;
        }
        return p + 20;
      });
    }, 500);
  };

  const handleFinishOnboarding = () => {
    if (!generated) return;
    const limitations = (answers.limitations ?? []).filter((l) => l !== 'ninguna');
    completeOnboarding(
      {
        name,
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        experience: surveyAnswers.experience,
        daysPerWeek: Number(surveyAnswers.daysPerWeek),
        avgDuration: Number(surveyAnswers.minutesPerSession),
        primaryGoal: surveyAnswers.goal,
        targetMuscles: surveyAnswers.priorityMuscles.length
          ? surveyAnswers.priorityMuscles
          : ['Pecho', 'Espalda', 'Hombros'],
        equipment: surveyAnswers.equipment.map((id) => EQUIPMENT_LABELS[id]).filter(Boolean),
        injuries: limitations.map((l) => LIMITATION_LABELS[l]).filter(Boolean).join(', '),
      },
      generated.routines
    );
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
        {step === 1 && <NameStep name={name} onName={setName} onContinue={() => goTo(2)} />}

        {surveyIndex >= 0 && (
          <SurveyStep
            question={SURVEY_QUESTIONS[surveyIndex]}
            value={answers[SURVEY_QUESTIONS[surveyIndex].id] ?? []}
            onSelect={(value) =>
              setAnswers((prev) => ({ ...prev, [SURVEY_QUESTIONS[surveyIndex].id]: value }))
            }
            canGoBack={surveyIndex > 0}
            onBack={() => goTo(step - 1)}
            onNext={() => goTo(step + 1)}
          />
        )}

        {biosStep && (
          <BiosStep
            age={age}
            height={height}
            weight={weight}
            gender={gender}
            onAge={setAge}
            onHeight={setHeight}
            onWeight={setWeight}
            onGender={setGender}
            onBack={() => goTo(step - 1)}
            onGenerate={handleStartGeneration}
          />
        )}

        {genStep && (
          <GenerationStep
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            daysPerWeek={Number(surveyAnswers.daysPerWeek)}
            primaryGoal={surveyAnswers.goal}
            name={name}
            avgDuration={Number(surveyAnswers.minutesPerSession)}
            summary={generated?.summary ?? null}
            routines={generated?.routines ?? []}
            onFinish={handleFinishOnboarding}
            onBack={() => goTo(totalSteps - 1)}
          />
        )}
      </main>

      {/* Safety Micro-notice */}
      <footer className="text-center text-[11px] text-white/40 mt-6 relative z-10">
        FitAI Coach • Algoritmos basados en ciencia del deporte y sobrecarga progresiva
      </footer>
    </div>
  );
};

export default OnboardingFlow;