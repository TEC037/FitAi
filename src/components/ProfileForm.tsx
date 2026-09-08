import React, { useState } from 'react';
import { User, Bell, Save, Dumbbell, ChevronDown, RotateCcw, LogOut } from 'lucide-react';
import { useApp } from '../context/useApp';
import { FitnessGoal, ExperienceLevel } from '../types';
import { isValidEmail, sanitizeEmail } from '../utils/validation';

interface ProfileFormProps {
  variant: 'mobile' | 'desktop';
  onSaved: () => void;
}


const inputClass = {
  base: 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00]',
  compact:
    'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#C0FF00]',
};

interface FieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  step?: number;
  min?: number;
  max?: number;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, type = 'text', className = inputClass.base, step, min, max }) => (
  <div>
    <label className="block text-xs font-semibold text-white/70 mb-1.5">{label}</label>
    <input
      type={type}
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  </div>
);

const UnitPicker: React.FC<{ compact: boolean; value: 'metric' | 'imperial'; onChange: (v: 'metric' | 'imperial') => void }> = ({
  compact,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-xs font-semibold text-white/70 mb-1.5">Sistema de Unidades</label>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange('metric')}
        className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${
          value === 'metric' ? 'bg-[#C0FF00] text-black border-[#C0FF00]' : 'bg-white/5 text-white/60 border-white/10'
        }`}
      >
        {compact ? 'Métrico' : 'Métrico (kg / cm)'}
      </button>
      <button
        type="button"
        onClick={() => onChange('imperial')}
        className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${
          value === 'imperial' ? 'bg-[#C0FF00] text-black border-[#C0FF00]' : 'bg-white/5 text-white/60 border-white/10'
        }`}
      >
        {compact ? 'Imperial' : 'Imperial (lbs / in)'}
      </button>
    </div>
  </div>
);

const GoalSelect: React.FC<{ compact: boolean; value: FitnessGoal; onChange: (v: FitnessGoal) => void }> = ({
  compact,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-xs font-semibold text-white/70 mb-1.5">
      {compact ? 'Objetivo' : 'Objetivo Principal'}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FitnessGoal)}
      className={compact ? inputClass.compact : inputClass.base}
    >
      <option value="hipertrofia" className="bg-[#111]">
        {compact ? 'Hipertrofia' : 'Ganar Masa Muscular (Hipertrofia)'}
      </option>
      <option value="perdida_grasa" className="bg-[#111]">
        {compact ? 'Perder Grasa' : 'Perder Grasa / Definición'}
      </option>
      <option value="fuerza" className="bg-[#111]">
        {compact ? 'Fuerza Máxima' : 'Aumentar Fuerza Máxima'}
      </option>
      <option value="resistencia" className="bg-[#111]">
        {compact ? 'Resistencia' : 'Mejorar Resistencia Muscular'}
      </option>
      <option value="condicion_general" className="bg-[#111]">
        {compact ? 'Condición General' : 'Condición Física General'}
      </option>
    </select>
  </div>
);

const ToggleRow: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
    <span className="text-xs text-white/80">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-white/20 bg-white/10 text-[#C0FF00] focus:ring-0 w-4 h-4"
    />
  </label>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <h3 className="text-lg font-bold text-white flex items-center gap-2">
    {icon}
    <span>{children}</span>
  </h3>
);

export const ProfileForm: React.FC<ProfileFormProps> = ({ variant, onSaved }) => {
  const { user, updateUserProfile, resetToDemoData, logout } = useApp();
  const isMobile = variant === 'mobile';

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeEmail(email);
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      window.alert('Por favor ingresa un correo electrónico válido.');
      return;
    }
    updateUserProfile({
      name,
      email: cleanEmail,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      experience,
      primaryGoal,
      daysPerWeek: Number(daysPerWeek),
      avgDuration: Number(avgDuration),
      injuries,
      unitSystem,
      notifications: { workoutReminders, coachTips, restTimerSound },
    });
    onSaved();
  };

  if (isMobile) {
    return (
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#C0FF00]" />
            Datos clave
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field
                label={`Peso Actual (${unitSystem === 'metric' ? 'kg' : 'lbs'})`}
                type="number"
                step={0.1}
                value={weight}
                onChange={(v) => setWeight(Number(v))}
              />
            </div>
            <GoalSelect compact value={primaryGoal} onChange={setPrimaryGoal} />
            <Field
              label="Días / Semana"
              type="number"
              min={2}
              max={6}
              className={inputClass.compact}
              value={daysPerWeek}
              onChange={(v) => setDaysPerWeek(Number(v))}
            />
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
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
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
              <Field label="Nombre Completo" value={name} onChange={setName} />
              <Field label="Correo Electrónico" type="email" value={email} onChange={setEmail} />
              <Field label="Edad (Años)" type="number" value={age} onChange={(v) => setAge(Number(v))} />
              <Field
                label={`Estatura (${unitSystem === 'metric' ? 'cm' : 'in'})`}
                type="number"
                value={height}
                onChange={(v) => setHeight(Number(v))}
              />
              <UnitPicker compact value={unitSystem} onChange={setUnitSystem} />
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C0FF00]" />
                Notificaciones y Sonidos
              </h3>
              <ToggleRow label="Recordatorios de entrenamiento" checked={workoutReminders} onChange={setWorkoutReminders} />
              <ToggleRow label="Consejos del Coach IA" checked={coachTips} onChange={setCoachTips} />
              <ToggleRow label="Sonido del temporizador de descanso" checked={restTimerSound} onChange={setRestTimerSound} />
            </div>
          </>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-4">
        <SectionTitle icon={<User className="w-5 h-5 text-[#C0FF00]" />}>Datos Biométricos</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Field label="Nombre Completo" value={name} onChange={setName} />
          <Field label="Correo Electrónico" type="email" value={email} onChange={setEmail} />
          <Field label="Edad (Años)" type="number" value={age} onChange={(v) => setAge(Number(v))} />
          <Field
            label={`Estatura (${unitSystem === 'metric' ? 'cm' : 'in'})`}
            type="number"
            value={height}
            onChange={(v) => setHeight(Number(v))}
          />
          <Field
            label={`Peso Actual (${unitSystem === 'metric' ? 'kg' : 'lbs'})`}
            type="number"
            step={0.1}
            value={weight}
            onChange={(v) => setWeight(Number(v))}
          />
          <UnitPicker compact={false} value={unitSystem} onChange={setUnitSystem} />
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-4">
        <SectionTitle icon={<Dumbbell className="w-5 h-5 text-[#C0FF00]" />}>Objetivos y Programación</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <GoalSelect compact={false} value={primaryGoal} onChange={setPrimaryGoal} />
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Nivel de Experiencia</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
              className={inputClass.base}
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
          <Field
            label="Días por Semana"
            type="number"
            min={2}
            max={6}
            value={daysPerWeek}
            onChange={(v) => setDaysPerWeek(Number(v))}
          />
          <Field
            label="Duración Sesión (min)"
            type="number"
            step={5}
            min={30}
            max={120}
            value={avgDuration}
            onChange={(v) => setAvgDuration(Number(v))}
          />
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

      <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-4">
        <SectionTitle icon={<Bell className="w-5 h-5 text-[#C0FF00]" />}>Notificaciones y Sonidos</SectionTitle>
        <div className="space-y-3 pt-2">
          <ToggleRow label="Recordatorios de días de entrenamiento" checked={workoutReminders} onChange={setWorkoutReminders} />
          <ToggleRow label="Consejos y adaptaciones del Coach IA" checked={coachTips} onChange={setCoachTips} />
          <ToggleRow
            label="Aviso sonoro al terminar el temporizador de descanso"
            checked={restTimerSound}
            onChange={setRestTimerSound}
          />
        </div>
      </div>

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
  );
};