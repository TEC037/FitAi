import React from 'react';
import { Zap, LogIn, Play } from 'lucide-react';
import { useApp } from '../context/useApp';

interface TopBarProps {
  onOpenNav: () => void;
}

/** Barra superior clara metalizada: logo, usuario arriba y botón circular de menú/demo. */
export const TopBar: React.FC<TopBarProps> = ({ onOpenNav }) => {
  const { user, isAuthenticated, loginDemoUser, navigateTo } = useApp();
  const initials = user.name.trim().slice(0, 2).toUpperCase() || '??';

  return (
    <header className="metal-surface sticky top-0 z-40 border-b border-black/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <button
          onClick={() => navigateTo(isAuthenticated ? 'routine' : 'landing')}
          className="flex items-center gap-2.5 group"
          aria-label="FitAI Coach"
        >
          <div className="w-9 h-9 rounded-[10px] bg-[#C0FF00] flex items-center justify-center shadow-[0_0_18px_rgba(192,255,0,0.35)] group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-black fill-current" />
          </div>
          <div className="text-left leading-tight">
            <span className="block text-[15px] font-black tracking-tight text-[#1d1d1f]">
              FitAI <span className="text-[#5f8a00]">Coach</span>
            </span>
            <span className="hidden sm:block text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
              PaaS Gym AI
            </span>
          </div>
        </button>

        {/* Zona derecha */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-sm font-bold text-[#1d1d1f] truncate max-w-[160px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Nivel {user.experience}
                </p>
              </div>
              <button
                id="topbar-avatar"
                onClick={onOpenNav}
                className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-slate-200 via-white to-slate-300 border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_-4px_rgba(15,23,42,0.25)] flex items-center justify-center font-black text-[13px] text-slate-700 active:scale-95 transition-transform"
                aria-label="Abrir menú de navegación"
              >
                {initials}
                {isAuthenticated && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#f2f4f7] bg-emerald-400" />
                )}
              </button>
            </>
          ) : (
            <>
              <button
                id="topbar-btn-login"
                onClick={() => navigateTo('auth')}
                className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 bg-white/70 border border-black/10 hover:bg-white active:scale-[0.97] transition-all"
              >
                Iniciar Sesión
              </button>
              <button
                id="topbar-btn-demo"
                onClick={() => {
                  void loginDemoUser();
                  onOpenNav();
                }}
                className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-slate-200 via-white to-slate-300 border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_-4px_rgba(15,23,42,0.25)] flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
                aria-label="Probar la demo"
                title="Probar la demo"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export const LoginPill = LogIn;

export default TopBar;