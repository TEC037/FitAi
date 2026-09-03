import React from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  Play,
  TrendingUp,
  Bot,
  User,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppScreen } from '../types';

export const MobileNav: React.FC = () => {
  const { currentScreen, navigateTo, isWorkoutActive } = useApp();

  const navItems: { id: AppScreen; label: string; icon: React.ReactNode; isAction?: boolean }[] = [
    { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'routine', label: 'Rutina', icon: <Dumbbell className="w-5 h-5" /> },
    {
      id: 'workout',
      label: isWorkoutActive ? 'En vivo' : 'Entrenar',
      icon: <Play className="w-6 h-6 fill-current" />,
      isAction: true,
    },
    { id: 'exercises', label: 'Biblioteca', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'coach', label: 'Coach IA', icon: <Bot className="w-5 h-5" /> },
    { id: 'profile', label: 'Perfil', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around safe-area-bottom">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        if (item.isAction) {
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => navigateTo(item.id)}
              className="relative -top-4 flex flex-col items-center justify-center p-3 rounded-full bg-[#C0FF00] text-black shadow-[0_0_25px_rgba(192,255,0,0.5)] active:scale-95 transition-transform"
            >
              {item.icon}
              <span className="sr-only">{item.label}</span>
            </button>
          );
        }
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => navigateTo(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-xs transition-colors min-w-[52px] ${
              isActive ? 'text-[#C0FF00] font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
