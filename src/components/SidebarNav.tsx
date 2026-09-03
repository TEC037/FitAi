import React from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  Play,
  TrendingUp,
  Bot,
  History,
  User,
  Zap,
  ShieldAlert,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppScreen } from '../types';

interface SidebarNavProps {
  onOpenSafetyModal: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ onOpenSafetyModal }) => {
  const { currentScreen, navigateTo, user, logout, isWorkoutActive } = useApp();

  const navItems: { id: AppScreen; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'routine',
      label: 'Mi Rutina',
      icon: <Dumbbell className="w-5 h-5" />,
    },
    {
      id: 'exercises',
      label: 'Biblioteca',
      icon: <BookOpen className="w-5 h-5" />,
      badge: '1.3k',
    },
    {
      id: 'workout',
      label: 'Entrenamiento',
      icon: <Play className="w-5 h-5 fill-current" />,
      badge: isWorkoutActive ? 'EN VIVO' : undefined,
    },
    {
      id: 'progress',
      label: 'Progreso',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: 'coach',
      label: 'Coach IA',
      icon: <Bot className="w-5 h-5" />,
      badge: 'IA',
    },
    {
      id: 'history',
      label: 'Historial',
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col p-6 h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Brand Logo */}
      <div
        id="brand-logo"
        onClick={() => navigateTo('dashboard')}
        className="flex items-center gap-3 mb-8 cursor-pointer group"
      >
        <div className="w-10 h-10 bg-[#C0FF00] rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_20px_rgba(192,255,0,0.3)]">
          <Zap className="w-6 h-6 text-black fill-current" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            FitAI <span className="text-[#C0FF00]">Coach</span>
          </span>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">PaaS Gym AI</p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-medium text-sm transition-all duration-200 text-left ${
                isActive
                  ? 'bg-white/10 text-[#C0FF00] shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className={isActive ? 'text-[#C0FF00]' : 'text-white/50'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    item.badge === 'EN VIVO'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                      : 'bg-[#C0FF00]/20 text-[#C0FF00]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Safety Disclaimer Button */}
        <button
          id="btn-safety-modal"
          onClick={onOpenSafetyModal}
          className="w-full mt-4 flex items-center gap-3 p-3 rounded-xl text-xs text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors text-left"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400/80 shrink-0" />
          <span>Avisos Médicos y Seguridad</span>
        </button>
      </div>

      {/* User Card */}
      <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
        <div
          onClick={() => navigateTo('profile')}
          className="flex items-center gap-3 mb-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center font-bold text-sm text-white shadow-inner group-hover:ring-2 group-hover:ring-[#C0FF00]/50 transition-all">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate group-hover:text-[#C0FF00] transition-colors">
              {user.name}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
              Nivel {user.experience}
            </p>
          </div>
        </div>
        <button
          id="btn-logout-sidebar"
          onClick={logout}
          className="w-full py-2 px-3 text-xs text-white/70 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};
