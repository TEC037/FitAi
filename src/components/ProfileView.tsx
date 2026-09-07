import React, { useState } from 'react';
import {
  User,
  Settings,
  ShieldAlert,
  Bell,
  LogOut,
  RotateCcw,
  CheckCircle2,
  Save,
  Dumbbell,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { FitnessGoal, ExperienceLevel } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';

interface ProfileViewProps {
  onOpenSafetyModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenSafetyModal }) => {
  const { user, updateUserProfile, resetToDemoData, logout } = useApp();

  const isMobile = useIsMobile();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [age, setAge] = useState(user.age);
  const [height, setHeight] = useState(user.height);
  const [weight, setWeight] = useState(user.weight);
  const [experience, setExperience] = useState<ExperienceLevel>(user.experience);
  const [primaryGoal, setPrimaryGoal] = useState<FitnessGoal>(user.primaryGoal);
  const [daysPerWeek, setDaysPerWeek] = useState(user.daysPerWeek);
  const [avgDuration, setAvgDuration] = useState(user.avgDuration);
  const [injuries, setInjuries] = useState(user.injuries);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(user.unitSystem);

  const [workoutReminders, setWorkoutReminders] = useState(user.notifications.workoutReminders);
  const [coachTips, setCoachTips] = useState(user.notifications.coachTips);
  const [restTimerSound, setRestTimerSound] = useState(user.notifications.restTimerSound);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      experience,
      primaryGoal,
      daysPerWeek: Number(daysPerWeek),
      avgDuration: Number(avgDuration),
      injuries,
      unitSystem,
      notifications: {
        workoutReminders,
        coachTips,
        restTimerSound,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (isMobile) {
    return (
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-4 max-w-md mx-auto w-full">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Perfil</p>
          <h1 className="text-2xl font-black tracking-tight text-white">{user.name}</h1>
          <p className="text-xs text-white/50 mt-0.5">
            Nivel {user.experience} • Objetivo: {user.primaryGoal}
          </p>
        </div>

        {savedSuccess && (
          <p className="px-4 py-2 rounded-xl bg-[#C0FF00]/20 border border-[#C0FF00] text-[#C0FF00] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            ¡Cambios guardados!
          </p>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#C0FF00]" />
              Datos clave
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Peso Actual ({unitSystem === 'metric' ? 'kg' : 'lbs'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Objetivo
                </label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value as FitnessGoal)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#C0FF00]"
                >
                  <option value="hipertrofia" className="bg-[#111]">
                    Hipertrofia
                  </option>
                  <option value="perdida_grasa" className="bg-[#111]">
                    Perder Grasa
                  </option>
                  <option value="fuerza" className="bg-[#111]">
                    Fuerza Máxima
                  </option>
                  <option value="resistencia" className="bg-[#111]">
                    Resistencia
                  </option>
                  <option value="condicion_general" className="bg-[#111]">
                    Condición General
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Días / Semana
                </label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#C0FF00]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#C0FF00] text-black font-black text-sm rounded-2xl hover:bg-[#aee600] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,255,0,0.25)]"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
              {showAdvanced ? 'Ocultar ajustes avanzados' : 'Ajustes avanzados'}
            </button>
          </div>

          {showAdvanced && (
            <>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C0FF00]" />
                  Datos Biométricos
                </h3>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Edad (Años)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Estatura ({unitSystem === 'metric' ? 'cm' : 'in'})
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
                />
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Sistema de Unidades
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUnitSystem('metric')}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${
                      unitSystem === 'metric'
                        ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    Métrico
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitSystem('imperial')}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${
                      unitSystem === 'imperial'
                        ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    Imperial
                  </button>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#C0FF00]" />
                  Notificaciones y Sonidos
                </h3>
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                  <span className="text-xs text-white/80">Recordatorios de entrenamiento</span>
                  <input
                    type="checkbox"
                    checked={workoutReminders}
                    onChange={(e) => setWorkoutReminders(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-[#C0FF00] focus:ring-0 w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                  <span className="text-xs text-white/80">Consejos del Coach IA</span>
                  <input
                    type="checkbox"
                    checked={coachTips}
                    onChange={(e) => setCoachTips(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-[#C0FF00] focus:ring-0 w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                  <span className="text-xs text-white/80">Sonido del temporizador de descanso</span>
                  <input
                    type="checkbox"
                    checked={restTimerSound}
                    onChange={(e) => setRestTimerSound(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-[#C0FF00] focus:ring-0 w-4 h-4"
                  />
                </label>
              </div>
            </>
          )}
        </form>

        <button
          type="button"
          onClick={onOpenSafetyModal}
          className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          Avisos Médicos y Seguridad
        </button>

        <button
          type="button"
          onClick={resetToDemoData}
          className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Restablecer Datos Demo
        </button>

        <button
          type="button"
          onClick={logout}
          className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-8 flex flex-col gap-8 max-w-4xl mx-auto w-full relative">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C0FF00]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C0FF00]/10 text-[#C0FF00] text-xs font-bold uppercase tracking-wider mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Configuración de Cuenta & Atleta</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Perfil y Preferencias</h1>
          <p className="text-sm text-white/60 mt-1">
            Ajusta tus parámetros biométricos, objetivos y recordatorios de entrenamiento.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-[#C0FF00]/20 border border-[#C0FF00] text-[#C0FF00] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Cambios guardados con éxito!</span>
          </div>
        )}
      </div>

      {/* Safety & Medical Notice Banner (Prominent) */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-[28px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-200">
              Aviso Médico y Consideraciones de Salud
            </h3>
            <p className="text-xs text-white/70 mt-1 leading-relaxed max-w-2xl">
              FitAI Coach es una herramienta de orientación y seguimiento. Las rutinas generadas son
              estimaciones algorítmicas y no sustituyen el diagnóstico de un médico ni de un
              fisioterapeuta. Si experimentas dolor agudo o mareos, interrumpe el ejercicio.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSafetyModal}
          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-colors shrink-0 whitespace-nowrap border border-amber-500/30"
        >
          Ver Normas Médicas
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Datos Personales */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#C0FF00]" />
            <span>Datos Biométricos</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Edad (Años)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Estatura ({unitSystem === 'metric' ? 'cm' : 'in'})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Peso Actual ({unitSystem === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Sistema de Unidades
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${
                    unitSystem === 'metric'
                      ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                      : 'bg-white/5 text-white/60 border-white/10'
                  }`}
                >
                  Métrico (kg / cm)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('imperial')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${
                    unitSystem === 'imperial'
                      ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                      : 'bg-white/5 text-white/60 border-white/10'
                  }`}
                >
                  Imperial (lbs / in)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Objetivos y Entrenamiento */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#C0FF00]" />
            <span>Objetivos y Programación</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Objetivo Principal
              </label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as FitnessGoal)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              >
                <option value="hipertrofia" className="bg-[#111]">
                  Ganar Masa Muscular (Hipertrofia)
                </option>
                <option value="perdida_grasa" className="bg-[#111]">
                  Perder Grasa / Definición
                </option>
                <option value="fuerza" className="bg-[#111]">
                  Aumentar Fuerza Máxima
                </option>
                <option value="resistencia" className="bg-[#111]">
                  Mejorar Resistencia Muscular
                </option>
                <option value="condicion_general" className="bg-[#111]">
                  Condición Física General
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Nivel de Experiencia
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              >
                <option value="principiante" className="bg-[#111]">
                  Principiante (&lt; 1 año)
                </option>
                <option value="intermedio" className="bg-[#111]">
                  Intermedio (1 a 3 años)
                </option>
                <option value="avanzado" className="bg-[#111]">
                  Avanzado (3+ años)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Días por Semana
              </label>
              <input
                type="number"
                min={2}
                max={6}
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Duración Sesión (min)
              </label>
              <input
                type="number"
                step={5}
                min={30}
                max={120}
                value={avgDuration}
                onChange={(e) => setAvgDuration(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Restricciones físicas o lesiones declaradas
              </label>
              <textarea
                rows={2}
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C0FF00]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notificaciones */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#C0FF00]" />
            <span>Notificaciones y Sonidos</span>
          </h3>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
              <span className="text-xs text-white/80">Recordatorios de días de entrenamiento</span>
              <input
                type="checkbox"
                checked={workoutReminders}
                onChange={(e) => setWorkoutReminders(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-[#C0FF00] focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
              <span className="text-xs text-white/80">Consejos y adaptaciones del Coach IA</span>
              <input
                type="checkbox"
                checked={coachTips}
                onChange={(e) => setCoachTips(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-[#C0FF00] focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
              <span className="text-xs text-white/80">
                Aviso sonoro al terminar el temporizador de descanso
              </span>
              <input
                type="checkbox"
                checked={restTimerSound}
                onChange={(e) => setRestTimerSound(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-[#C0FF00] focus:ring-0 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="submit"
            className="flex-1 py-4 bg-[#C0FF00] text-black font-black text-sm rounded-2xl hover:bg-[#aee600] active:scale-[0.98] transition-transform shadow-[0_0_30px_rgba(192,255,0,0.3)] flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios de Perfil</span>
          </button>

          <button
            type="button"
            onClick={resetToDemoData}
            className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Datos Demo (Carlos)</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-2xl border border-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </form>
    </div>
  );
};
