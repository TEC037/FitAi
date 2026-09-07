import {
  LayoutDashboard,
  Dumbbell,
  Play,
  TrendingUp,
  Bot,
  History,
  User,
  BookOpen,
} from 'lucide-react';
import { AppScreen } from '../types';

export interface NavRoute {
  id: AppScreen;
  label: string;
  mobileLabel?: string;
  icon: React.ElementType;
  badge?: string;
  isMobileAction?: boolean;
  showInMobile?: boolean;
  isMobileSecondary?: boolean;
}

export const NAV_ROUTES: NavRoute[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    mobileLabel: 'Inicio',
    icon: LayoutDashboard,
    showInMobile: true,
  },
  { id: 'routine', label: 'Mi Rutina', mobileLabel: 'Rutina', icon: Dumbbell, showInMobile: true },
  { id: 'exercises', label: 'Biblioteca', icon: BookOpen, badge: '1.3k', showInMobile: true },
  {
    id: 'workout',
    label: 'Entrenamiento',
    mobileLabel: 'Entrenar',
    icon: Play,
    isMobileAction: true,
    showInMobile: true,
  },
  { id: 'progress', label: 'Progreso', mobileLabel: 'Progreso', icon: TrendingUp, isMobileSecondary: true },
  { id: 'coach', label: 'Coach IA', icon: Bot, badge: 'IA', isMobileSecondary: true },
  { id: 'history', label: 'Historial', mobileLabel: 'Historial', icon: History, isMobileSecondary: true },
  { id: 'profile', label: 'Perfil', icon: User, isMobileSecondary: true },
];
