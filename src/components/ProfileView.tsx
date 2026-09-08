import React, { useState } from 'react';
import { Settings, ShieldAlert, RotateCcw, LogOut, CheckCircle2, TrendingUp } from 'lucide-react';
import { useApp } from '../context/useApp';
import { useIsMobile } from '../hooks/useIsMobile';
import { ProgressSummary } from './ProgressSummary';
import { ProfileForm } from './ProfileForm';

interface ProfileViewProps {
  onOpenSafetyModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenSafetyModal }) => {
  const { user, resetToDemoData, logout } = useApp();

  const isMobile = useIsMobile();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaved = () => {
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

        <ProgressSummary />

        {savedSuccess && (
          <p className="px-4 py-2 rounded-xl bg-[#C0FF00]/20 border border-[#C0FF00] text-[#C0FF00] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            ¡Cambios guardados!
          </p>
        )}

        <ProfileForm variant="mobile" onSaved={handleSaved} />

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

      {/* Progreso unificado dentro del Perfil */}
      <section aria-label="Mi progreso">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-black/10 text-amber-600 text-[10px] font-black uppercase tracking-wider mb-4">
          <TrendingUp className="w-3.5 h-3.5" />
          Mis Métricas
        </div>
        <ProgressSummary />
      </section>

      <ProfileForm variant="desktop" onSaved={handleSaved} />
    </div>
  );
};