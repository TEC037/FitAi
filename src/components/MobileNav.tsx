import React, { useState } from 'react';

import { useApp } from '../context/useApp';

import { NAV_ROUTES } from '../config/navigation';
import { X, Plus, Play } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentScreen, navigateTo, isWorkoutActive } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = NAV_ROUTES.filter((route) => route.showInMobile).map((route) => ({
    id: route.id,
    label: route.id === 'workout' && isWorkoutActive ? 'En vivo' : route.mobileLabel || route.label,
    icon: route.icon,
    isAction: route.isMobileAction,
  }));

  const handleNavigate = (id: (typeof navItems)[number]['id']) => {
    setIsOpen(false);
    navigateTo(id);
  };

  return (
    <>
      {/* Backdrop para cerrar al tocar fuera (solo cuando el menú está abierto) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menú radial compacto */}
      {isOpen && (
        <div className="md:hidden fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 animate-fadeIn">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className="flex items-center gap-2"
              >
                <span className="text-[11px] font-bold bg-[#0A0A0A]/95 border border-white/10 rounded-full px-2.5 py-1 shadow-lg text-white">
                  {item.label}
                </span>
                <span
                  className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-lg ${
                    item.isAction
                      ? 'bg-[#C0FF00] border-[#C0FF00] text-black'
                      : isActive
                        ? 'bg-[#C0FF00]/15 border-[#C0FF00]/50 text-[#C0FF00]'
                        : 'bg-[#0A0A0A]/95 border-white/15 text-white/70'
                  }`}
                >
                  <item.icon
                    className={`${item.id === 'workout' ? 'w-5 h-5 fill-current' : 'w-5 h-5'}`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* EL BOTÓN ÚNICO: FAB */}
      <button
        id="mobile-nav-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
        className="md:hidden fixed bottom-5 right-4 z-50 w-16 h-16 rounded-full bg-[#C0FF00] text-black shadow-[0_0_30px_rgba(192,255,0,0.5)] active:scale-95 transition-transform flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : isWorkoutActive ? (
          <Play className="w-7 h-7 fill-current" />
        ) : (
          <Plus className="w-7 h-7" />
        )}
        {!isOpen && isWorkoutActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse border-2 border-[#050505]" />
        )}
      </button>
    </>
  );
};