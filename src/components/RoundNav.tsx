import React, { useState } from 'react';
import {
  Dumbbell,
  BookOpen,
  User,
  X,
  Play,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { AppScreen } from '../types';
import { useGuidanceStep } from '../hooks/useGuidanceStep';

const RING_RADIUS = 118;

interface RoundItem {
  id: AppScreen;
  label: string;
  icon: React.ElementType;
  angle: number;
}

const ROUND_ITEMS: RoundItem[] = [
  { id: 'routine', label: 'Rutina', icon: Dumbbell, angle: -90 },
  { id: 'exercises', label: 'Biblioteca', icon: BookOpen, angle: 30 },
  { id: 'profile', label: 'Perfil', icon: User, angle: 150 },
];

function radialStyle(angle: number, radius: number): React.CSSProperties {
  return {
    left: 0,
    top: 0,
    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${-radius}px) rotate(${-angle}deg)`,
  };
}

interface RoundNavProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Menú de navegación circular que despliega el botón superior. */
export const RoundNav: React.FC<RoundNavProps> = ({ isOpen, onClose }) => {
  const { currentScreen, navigateTo, user, isWorkoutActive, logout } = useApp();
  const guidance = useGuidanceStep();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  const handleItem = (id: AppScreen) => {
    onClose();
    navigateTo(id);
  };

  const handleCenter = () => {
    if (isWorkoutActive) {
      onClose();
      navigateTo('routine');
      return;
    }
    onClose();
  };

  const handleLogout = () => {
    if (showLogoutConfirm) {
      onClose();
      setShowLogoutConfirm(false);
      void logout();
      return;
    }
    setShowLogoutConfirm(true);
    setTimeout(() => setShowLogoutConfirm(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navegación">
      {/* Backdrop translúcido estilo Apple */}
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-xl animate-radar-fade"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Anillo central */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
        {/* Efecto radar sutil */}
        <div
          className="absolute animate-radar-fade pointer-events-none"
          style={{ width: 340, height: 340, left: -170, top: -170 }}
        >
          <div className="absolute rounded-full border border-amber-400/20" style={{ inset: 44 }} />
          <div className="absolute rounded-full border border-amber-400/15" style={{ inset: 92 }} />
          <div
            className="absolute animate-radar-sweep rounded-full"
            style={{
              inset: 44,
              background:
                'conic-gradient(from 0deg, rgba(229,170,45,0.10), rgba(229,170,45,0.02) 90deg, transparent 200deg)',
            }}
          />
        </div>

        {/* Ítems radiales */}
        {ROUND_ITEMS.map((item, index) => {
          const isActive = currentScreen === item.id;
          const isGuided = guidance.step === item.id;
          return (
            <button
              key={item.id}
              id={`roundnav-${item.id}`}
              type="button"
              onClick={() => handleItem(item.id)}
              aria-label={item.label}
              className={`pointer-events-auto animate-radar-deploy flex flex-col items-center gap-2 ${
                isGuided ? 'z-10' : ''
              }`}
              style={{
                ...radialStyle(item.angle, RING_RADIUS),
                '--a': `${item.angle}deg`,
                '--r': `${RING_RADIUS}px`,
                '--fx': '0px',
                '--fy': '-40px',
                animationDelay: `${index * 40}ms`,
              } as React.CSSProperties}
            >
              <span
                className={`relative w-14 h-14 rounded-full border flex items-center justify-center transition-transform active:scale-90 ${
                  isActive
                    ? 'bg-[#C0FF00] border-[#B3E600] text-black shadow-[0_0_20px_rgba(192,255,0,0.4)]'
                    : 'bg-white/80 border-white/90 text-slate-700 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.35)] backdrop-blur'
                } ${isGuided ? 'animate-gold-pulse border-amber-400/70' : ''}`}
              >
                <item.icon className="w-6 h-6" />
                {isGuided && (
                  <span
                    className="absolute -inset-1 rounded-full border-2 border-amber-400/60 animate-gold-ring"
                    aria-hidden="true"
                  />
                )}
              </span>
              <span
                className={`text-[11px] font-bold rounded-full px-3 py-1 shadow-md whitespace-nowrap ${
                  isGuided
                    ? 'bg-amber-400 text-black'
                    : 'bg-white/90 border border-black/10 text-slate-700'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Centro: avatar / cerrar / comienza la demo */}
        <div
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 pointer-events-auto"
        >
          <button
            id="roundnav-center"
            type="button"
            onClick={handleCenter}
            aria-label="Cerrar menú"
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-200 via-white to-slate-300 border border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_24px_-8px_rgba(15,23,42,0.35)] flex items-center justify-center text-slate-600 active:scale-90 transition-transform"
          >
            {isWorkoutActive ? (
              <Play className="w-6 h-6 fill-current text-[#5f8a00]" />
            ) : (
              <X className="w-6 h-6" />
            )}
          </button>
          <p className="text-xs font-bold text-slate-700 bg-white/80 border border-black/10 rounded-full px-3 py-1.5 shadow-sm">
            {user.name.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Mensaje de guía + cierre de sesión */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-full px-6">
        <div className="flex items-center gap-2 text-slate-700 bg-white/85 border border-amber-300/60 shadow-lg rounded-2xl px-4 py-2.5 max-w-sm text-sm font-semibold animate-sheet-fade">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-center">{guidance.message}</span>
        </div>
        <button
          id="roundnav-logout"
          type="button"
          onClick={handleLogout}
          className={`pointer-events-auto flex items-center gap-2 text-xs font-bold rounded-full px-4 py-2 transition-all ${
            showLogoutConfirm
              ? 'bg-red-500 text-white'
              : 'bg-white/70 text-slate-600 border border-black/10 hover:bg-white'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          {showLogoutConfirm ? '¿Seguro?' : 'Cerrar Sesión'}
        </button>
      </div>
    </div>
  );
};

export default RoundNav;