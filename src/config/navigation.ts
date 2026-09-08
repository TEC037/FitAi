import { Dumbbell, BookOpen, User, Play } from 'lucide-react';
import { AppScreen } from '../types';

export interface NavRoute {
  id: AppScreen;
  label: string;
  icon: React.ElementType;
  isAction?: boolean;
}

export const NAV_ROUTES: NavRoute[] = [
  {
    id: 'routine',
    label: 'Rutina',
    icon: Dumbbell,
  },
  { id: 'exercises', label: 'Biblioteca', icon: BookOpen },
  { id: 'profile', label: 'Perfil', icon: User },
];

/** Ítem reservado para lanzar el entrenamiento unificado dentro de Rutina. */
export const ROUTINE_ACTION: NavRoute = {
  id: 'routine',
  label: 'Comenzar Entrenamiento',
  icon: Play,
  isAction: true,
};