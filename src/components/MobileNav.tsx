import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import {
  X,
  Play,
  Radar,
  Dumbbell,
  BookOpen,
  LayoutDashboard,
  TrendingUp,
  Bot,
  History,
  User,
  CalendarDays,
} from 'lucide-react';
import { AppScreen, DailyRoutine } from '../types';

const RING_RADIUS = 112;
const CHILD_RADIUS = 64;
// El centro del anillo se eleva lo suficiente para que ningún ítem del punto
// inferior (ángulo 90°) quede cubierto por el FAB ni por el borde/gesto inferior.
// FAB: bottom 12px + 64px de alto => tope en 76px. Ítem inferior: centro a
// CENTER_BOTTOM - RING_RADIUS. Con 220: 220-112=108px, etiqueta ~86px >>> 76px.
const CENTER_BOTTOM = 220;

interface RadarChild {
  id: string;
  label: string;
  icon: React.ElementType;
  onSelect: () => void;
}

interface RadarItem {
  id: AppScreen;
  label: string;
  icon: React.ElementType;
  angle: number;
  isAction?: boolean;
  children?: RadarChild[];
}

function radialPosition(angle: number, radius: number): React.CSSProperties {
  return {
    left: 0,
    top: 0,
    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${-radius}px) rotate(${-angle}deg)`,
  };
}

// FAB: bottom 12px + 64px de alto => centro en 44px sobre el borde inferior.
// Los ítems "nacen" desde ese punto (offset -176px respecto al centro del anillo)
// y vuelan a su posición radial; así el botón se siente el origen del despliegue.
const FAB_CENTER_BOTTOM = 44;
const FROM_Y = CENTER_BOTTOM - FAB_CENTER_BOTTOM;

function radarDeployStyle(
  angle: number,
  radius: number,
  delay: number
): React.CSSProperties {
  return {
    ...radialPosition(angle, radius),
    '--a': `${angle}deg`,
    '--r': `${radius}px`,
    '--fx': '0px',
    '--fy': `${FROM_Y}px`,
    animationDelay: `${delay}ms`,
  } as React.CSSProperties;
}

export const MobileNav: React.FC = () => {
  const { currentScreen, navigateTo, isWorkoutActive, routines, startWorkout } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [openParentId, setOpenParentId] = useState<AppScreen | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    setOpenParentId(null);
  };

  const handleFABClick = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const routineChildren: RadarChild[] = (routines || []).map((day: DailyRoutine) => ({
    id: `workout-day-${day.dayNumber}`,
    label: day.focus || `Día ${day.dayNumber}`,
    icon: CalendarDays,
    onSelect: () => startWorkout(day.dayNumber),
  }));

  const MAIN_ITEMS: RadarItem[] = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, angle: -90 },
    { id: 'routine', label: 'Rutina', icon: Dumbbell, angle: -45 },
    {
      id: 'workout',
      label: 'Entrenar',
      icon: Play,
      angle: 0,
      isAction: true,
      children: routineChildren.length > 0 ? routineChildren : undefined,
    },
    { id: 'exercises', label: 'Biblioteca', icon: BookOpen, angle: 45 },
    { id: 'progress', label: 'Progreso', icon: TrendingUp, angle: 90 },
    { id: 'coach', label: 'Coach IA', icon: Bot, angle: 135 },
    { id: 'history', label: 'Historial', icon: History, angle: 180 },
    { id: 'profile', label: 'Perfil', icon: User, angle: 225 },
  ];

  const handleMainClick = (item: RadarItem) => {
    if (item.children) {
      setOpenParentId((prev) => (prev === item.id ? null : item.id));
      return;
    }
    handleClose();
    navigateTo(item.id);
  };

  const handleChildClick = (child: RadarChild) => {
    handleClose();
    child.onSelect();
  };

  const activeMain = MAIN_ITEMS.find((item) => item.id === openParentId);

  const renderItem = (item: RadarItem, index: number) => {
    const isActive = currentScreen === item.id;
    const hasSubmenu = Boolean(item.children);
    const isParentOpen = openParentId === item.id;
    const isDimmed = openParentId !== null && !isParentOpen;
    const label = item.id === 'workout' && isWorkoutActive ? 'En vivo' : item.label;
    return (
      <button
        key={item.id}
        id={`mobile-nav-${item.id}`}
        type="button"
        onClick={() => handleMainClick(item)}
        aria-label={label}
        aria-expanded={hasSubmenu ? isParentOpen : undefined}
        aria-current={isActive ? 'page' : undefined}
        className={`absolute pointer-events-auto animate-radar-deploy flex flex-col items-center gap-1.5 transition-opacity ${
          isDimmed ? 'opacity-30' : 'opacity-100'
        }`}
        style={radarDeployStyle(item.angle, RING_RADIUS, index * 30)}
      >
        <span
          className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-90 transition-transform ${
            isParentOpen
              ? 'bg-[#C0FF00] border-[#C0FF00] text-black'
              : item.isAction
                ? 'bg-[#C0FF00] border-[#C0FF00] text-black shadow-[0_0_25px_rgba(192,255,0,0.45)]'
                : isActive
                  ? 'bg-[#C0FF00]/15 border-[#C0FF00]/60 text-[#C0FF00]'
                  : 'bg-[#141414]/90 border-white/15 text-white/85 backdrop-blur-md'
          }`}
        >
          <item.icon className={`${item.id === 'workout' ? 'w-5 h-5 fill-current' : 'w-5 h-5'}`} />
        </span>
        <span
          className={`text-[11px] font-bold rounded-full px-2.5 py-1 shadow-lg whitespace-nowrap ${
            isParentOpen
              ? 'bg-[#C0FF00] text-black'
              : 'bg-[#0A0A0A]/90 border border-white/10 text-white backdrop-blur-md'
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Backdrop translúcido estilo iOS para cerrar al tocar fuera */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Anillo de elección: centrado sobre el botón, nada queda cortado por el borde */}
      <div
        className="md:hidden fixed left-1/2 z-50 -translate-x-1/2 w-0 h-0 pointer-events-none"
        style={{ bottom: CENTER_BOTTOM }}
      >
        {/* Efecto radar */}
        {isOpen && (
          <div
            className="absolute animate-radar-fade pointer-events-none"
            style={{ width: 300, height: 300, left: -150, top: -150 }}
          >
            <div
              className="absolute rounded-full border border-[#C0FF00]/10"
              style={{ inset: 44 }}
            />
            <div
              className="absolute rounded-full border border-[#C0FF00]/15"
              style={{ inset: 78 }}
            />
            <div
              className="absolute rounded-full border border-[#C0FF00]/10"
              style={{ inset: 108 }}
            />
            <div
              className="absolute animate-radar-sweep rounded-full"
              style={{
                inset: 44,
                background:
                  'conic-gradient(from 0deg, rgba(192,255,0,0.10), rgba(192,255,0,0.02) 90deg, transparent 190deg)',
              }}
            />
          </div>
        )}

        {/* Sub-selecciones (anillo interior) de la elección activa */}
        {isOpen &&
          activeMain?.children?.map((child, index) => {
            const angle = index * (360 / (activeMain.children?.length ?? 1)) - 90;
            return (
              <button
                key={child.id}
                id={`mobile-nav-${child.id}`}
                type="button"
                onClick={() => handleChildClick(child)}
                aria-label={child.label}
                className="absolute pointer-events-auto animate-radar-deploy flex flex-col items-center gap-1.5"
                style={radarDeployStyle(angle, CHILD_RADIUS, index * 25)}
              >
                <span className="w-11 h-11 rounded-full bg-[#C0FF00] border border-[#C0FF00] text-black flex items-center justify-center shadow-[0_0_20px_rgba(192,255,0,0.45)] active:scale-90 transition-transform">
                  <child.icon className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-bold bg-[#0A0A0A]/90 border border-white/10 rounded-full px-2 py-0.5 shadow-lg text-white whitespace-nowrap backdrop-blur-md">
                  {child.label}
                </span>
              </button>
            );
          })}

        {/* Opciones principales: las 8 rutas dividen la circunferencia 360° */}
        {isOpen &&
          MAIN_ITEMS.map((item, index) => {
            if (openParentId !== null && openParentId !== item.id) return null;
            return renderItem(item, index);
          })}
      </div>

      {/* EL ÚNICO BOTÓN CENTRAL */}
      <div className="md:hidden fixed bottom-3 left-1/2 z-[60] -translate-x-1/2 pointer-events-none">
        {isOpen && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#C0FF00]/20 animate-radar-pulse" />
        )}
        <button
          id="mobile-nav-fab"
          type="button"
          onClick={handleFABClick}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          className={`relative pointer-events-auto w-16 h-16 rounded-full bg-[#C0FF00] text-black shadow-[0_0_30px_rgba(192,255,0,0.5)] active:scale-90 transition-transform flex items-center justify-center ${
            isOpen ? 'scale-110' : ''
          }`}
        >
          <span
            className={`flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          >
            {isOpen ? (
              <X className="w-7 h-7" />
            ) : isWorkoutActive ? (
              <Play className="w-7 h-7 fill-current" />
            ) : (
              <Radar className="w-7 h-7" />
            )}
          </span>
          {!isOpen && isWorkoutActive && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse border-2 border-[#050505]" />
          )}
        </button>
      </div>
    </>
  );
};