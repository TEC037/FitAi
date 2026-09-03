import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Dumbbell,
  Target,
  Clock,
  ShieldAlert,
  CheckCircle2,
  BrainCircuit,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExperienceLevel, FitnessGoal } from '../types';

export const OnboardingFlow: React.FC = () => {
  const { user, completeOnboarding } = useApp();
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Onboarding local form states
  const [name, setName] = useState(user.name || 'Carlos Ramírez');
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
  const [injuries, setInjuries] = useState(
    user.injuries || 'Molestia leve ocasional en manguito rotador derecho al hacer press militar muy pesado.'
  );

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

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 4) {
      // Trigger Step 5 (AI Generation Simulation)
      setStep(5);
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
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

      {/* Header bar with progress */}
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
        {/* STEP 1: Datos Físicos */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C0FF00] font-bold mb-1">
                Paso 1 • Perfil Biométrico
              </p>
              <h2 className="text-2xl sm:text-3xl font-black">Cuéntanos sobre ti</h2>
              <p className="text-xs text-white/50 mt-1">
                La IA necesita estos datos para calcular gasto calórico, volumen base y sobrecarga adecuada.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Edad (Años)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={14}
                  max={90}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Género (Opcional)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                >
                  <option value="Masculino" className="bg-[#111]">Masculino</option>
                  <option value="Femenino" className="bg-[#111]">Femenino</option>
                  <option value="Otro" className="bg-[#111]">Prefiero no decir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Estatura (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min={120}
                  max={230}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">Peso Corporal Actual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min={35}
                  max={200}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Nivel y Disponibilidad */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C0FF00] font-bold mb-1">
                Paso 2 • Experiencia y Tiempo
              </p>
              <h2 className="text-2xl sm:text-3xl font-black">Nivel de entrenamiento y horarios</h2>
              <p className="text-xs text-white/50 mt-1">
                Ajustamos la densidad de volumen según tu capacidad de recuperación semanal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">Nivel de Experiencia</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'principiante', label: 'Principiante', desc: '< 1 año en gym' },
                  { id: 'intermedio', label: 'Intermedio', desc: '1 a 3 años consistentes' },
                  { id: 'avanzado', label: 'Avanzado', desc: '3+ años de sobrecarga' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExperience(item.id as ExperienceLevel)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      experience === item.id
                        ? 'bg-[#C0FF00]/10 border-[#C0FF00] text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <p className={`text-sm font-bold ${experience === item.id ? 'text-[#C0FF00]' : ''}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white/70">Días disponibles por semana</label>
                <span className="text-sm font-black text-[#C0FF00]">{daysPerWeek} días</span>
              </div>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysPerWeek(d)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${
                      daysPerWeek === d
                        ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {d} d
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white/70">Duración promedio de cada sesión</label>
                <span className="text-sm font-black text-[#C0FF00]">{avgDuration} minutos</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[45, 60, 75, 90].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setAvgDuration(dur)}
                    className={`py-3 rounded-xl font-bold text-xs border transition-all ${
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
          </div>
        )}

        {/* STEP 3: Objetivos y Zonas */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C0FF00] font-bold mb-1">
                Paso 3 • Metas y Prioridades
              </p>
              <h2 className="text-2xl sm:text-3xl font-black">¿Cuál es tu objetivo principal?</h2>
              <p className="text-xs text-white/50 mt-1">
                El algoritmo modulará el rango de repeticiones y la intensidad de descanso.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'hipertrofia', title: 'Ganar Masa Muscular', desc: '8-12 reps, máxima hipertrofia' },
                { id: 'perdida_grasa', title: 'Perder Grasa / Definir', desc: 'Déficit controlado y densidad' },
                { id: 'fuerza', title: 'Aumentar Fuerza Máxima', desc: '3-6 reps, ejercicios compuestos' },
                { id: 'resistencia', title: 'Mejorar Resistencia', desc: '15+ reps y alta cadencia' },
                { id: 'condicion_general', title: 'Condición Física General', desc: 'Salud articular, movilidad y tono' },
              ].map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setPrimaryGoal(goal.id as FitnessGoal)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    primaryGoal === goal.id
                      ? 'bg-[#C0FF00]/10 border-[#C0FF00] text-white ring-1 ring-[#C0FF00]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <p className={`text-sm font-bold ${primaryGoal === goal.id ? 'text-[#C0FF00]' : ''}`}>
                    {goal.title}
                  </p>
                  <p className="text-[11px] text-white/40 mt-1">{goal.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">
                Zonas del cuerpo que deseas priorizar (Selecciona una o más)
              </label>
              <div className="flex flex-wrap gap-2">
                {['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas', 'Glúteos', 'Abdomen y Core'].map((muscle) => {
                  const isSelected = targetMuscles.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => handleToggleMuscle(muscle)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#C0FF00] text-black shadow-md'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Equipamiento y Limitaciones */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C0FF00] font-bold mb-1">
                Paso 4 • Equipamiento y Salud
              </p>
              <h2 className="text-2xl sm:text-3xl font-black">Equipo y restricciones físicas</h2>
              <p className="text-xs text-white/50 mt-1">
                La seguridad es lo primero. Evitaremos ejercicios lesivos según tu historial articular.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2">
                Equipamiento disponible en tu lugar de entrenamiento
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'Gimnasio completo',
                  'Barras y discos olímpicos',
                  'Mancuernas',
                  'Poleas y cables',
                  'Máquinas guiadas',
                  'Calistenia / Peso corporal',
                ].map((item) => {
                  const isSelected = equipment.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleToggleEquipment(item)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#C0FF00]/10 border-[#C0FF00] text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <span>{item}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#C0FF00]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <label className="text-xs font-semibold text-white/80">
                  Lesiones, restricciones o limitaciones físicas
                </label>
              </div>
              <textarea
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                rows={3}
                placeholder="Ej. Molestia en rodilla derecha en sentadilla profunda, dolor lumbar al hacer peso muerto..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C0FF00] placeholder:text-white/30 resize-none"
              />
              <p className="text-[10px] text-white/40 mt-1">
                Si no tienes ninguna molestia, puedes dejar este campo vacío o poner "Ninguna".
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: AI Generating Custom Routine */}
        {step === 5 && (
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
                    Sincronizando {daysPerWeek} días de entrenamiento con enfoque en {primaryGoal.toUpperCase()} y adaptando cargas para {name}.
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
                    {generationProgress >= 40 && generationProgress < 80 && 'Filtrando ejercicios contra lesiones señaladas...'}
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
                    Tu plan personalizado de <strong>{daysPerWeek} días</strong> para <strong>{primaryGoal}</strong> ha sido configurado. Tu primera sesión programada es <strong>Empuje Dinámico (Pecho y Tríceps)</strong>.
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
                  onClick={handleFinishOnboarding}
                  className="w-full max-w-lg mx-auto py-4 bg-[#C0FF00] text-black font-black text-base rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_35px_rgba(192,255,0,0.4)] flex items-center justify-center gap-3"
                >
                  <span>Entrar a Mi Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom Stepper Actions (Steps 1-4) */}
        {step < 5 && (
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black bg-[#C0FF00] text-black hover:bg-[#aee600] transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(192,255,0,0.3)]"
            >
              <span>{step === 4 ? 'Generar Mi Rutina con IA' : 'Siguiente Paso'}</span>
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
