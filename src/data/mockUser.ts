import { UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_carlos_01',
  name: 'Carlos Ramírez',
  email: 'carlos.ramirez@fitai.example',
  age: 28,
  gender: 'Masculino',
  height: 178,
  weight: 78.2,
  experience: 'intermedio',
  daysPerWeek: 4,
  avgDuration: 60,
  primaryGoal: 'hipertrofia',
  targetMuscles: ['Pecho', 'Espalda', 'Hombros', 'Piernas', 'Brazos'],
  equipment: ['Gimnasio completo', 'Barras y discos', 'Mancuernas', 'Poleas', 'Máquinas'],
  injuries:
    'Molestia ocasional en manguito rotador derecho si se sobrecarga el press militar detrás de la cabeza.',
  weeklyCompliance: 75,
  unitSystem: 'metric',
  notifications: {
    workoutReminders: true,
    coachTips: true,
    restTimerSound: true,
  },
};
