import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoutineView } from './RoutineView';
import { DailyRoutine, Exercise, ExperienceLevel, WorkoutSessionLog } from '../types';

const { useAppMock } = vi.hoisted(() => ({ useAppMock: vi.fn() }));
vi.mock('../context/useApp', () => ({ useApp: useAppMock }));

const user = {
  id: 'u1',
  name: 'Carlos Ramírez',
  email: 'carlos@fitai.app',
  experience: 'intermedio' as const,
  weight: 82,
  height: 178,
  birthYear: 1990,
  fitnessGoal: 'hipertrofia-y-tonificacion' as const,
  weeklyCompliance: 80,
  primaryGoal: 'Hipertrofia',
  unit: 'metric' as const,
  notifications: { coachTips: true },
};

const exercise: Exercise = {
  id: 'e1',
  name: 'Press de Banca con Barra',
  primaryMuscle: 'Pecho',
  sets: 4,
  reps: '8-10',
  suggestedWeightKg: 80,
  restSeconds: 90,
  rpe: 8,
  targetMuscles: ['Pectoral'],
  technicalCue: 'Mantén los pies firmes y el pecho abierto',
  fullInstructions: ['Posición inicial en banco', 'Baja controlado hasta el pecho'],
  commonMistakes: ['Rebotar la barra en el pecho', 'Despegar los glúteos'],
  equipment: 'barra',
  difficulty: 'intermedio' as ExperienceLevel,
  iconType: 'barbell',
};

const routines: DailyRoutine[] = [
  {
    dayNumber: 1,
    focus: 'Pecho',
    name: 'Empuje Dinámico (Día 1)',
    difficulty: 'intermedio',
    description: 'Hipertrofia de pectoral y tríceps',
    targetMuscles: ['Pectoral', 'Tríceps'],
    estimatedMinutes: 45,
    exercises: [exercise],
  },
  {
    dayNumber: 2,
    focus: 'Espalda',
    name: 'Tirón Potente (Día 2)',
    difficulty: 'intermedio',
    description: 'Espalda y bíceps',
    targetMuscles: ['Dorsal'],
    estimatedMinutes: 45,
    exercises: [],
  },
];

function mockView(overrides: Record<string, unknown> = {}) {
  useAppMock.mockReturnValue({
    routines,
    selectedDay: 1,
    setSelectedDay: vi.fn(),
    startWorkout: vi.fn(),
    navigateTo: vi.fn(),
    removeExerciseFromRoutine: vi.fn(),
    duplicateRoutineDay: vi.fn(),
    importRoutines: vi.fn(),
    isWorkoutActive: false,
    user,
    chatMessages: [],
    sendCoachMessage: vi.fn(),
    isCoachTyping: false,
    ...overrides,
  });
}

describe('RoutineView (vista unificada)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el encabezado Mi Rutina, el selector de días y el botón de entrenar', () => {
    mockView();
    render(<RoutineView />);

    expect(screen.getByRole('heading', { name: 'Mi Rutina' })).toBeInTheDocument();
    expect(screen.getByText('Día 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Entrenamiento/ })).toBeInTheDocument();
    expect(screen.getByText(/Press de Banca con Barra/)).toBeInTheDocument();
  });

  it('muestra el estado vacío con CTA a Biblioteca cuando no hay ejercicios', () => {
    mockView({ routines: [] });
    render(<RoutineView />);

    expect(screen.getByText('Tu rutina te está esperando')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ir a la Biblioteca/ }));
    expect(useAppMock().navigateTo).toHaveBeenCalledWith('exercises');
  });

  it('inicia el entrenamiento del día seleccionado', () => {
    mockView();
    render(<RoutineView />);

    fireEvent.click(screen.getByRole('button', { name: /Iniciar Entrenamiento/ }));
    expect(useAppMock().startWorkout).toHaveBeenCalledWith(1);
  });

  it('cambia de día con el selector', () => {
    mockView();
    render(<RoutineView />);

    fireEvent.click(screen.getByRole('button', { name: /Día 2/ }));
    expect(useAppMock().setSelectedDay).toHaveBeenCalledWith(2);
  });

  it('expande los detalles técnicos del ejercicio', () => {
    mockView();
    render(<RoutineView />);

    fireEvent.click(screen.getByRole('button', { name: /Detalles/ }));
    expect(screen.getByText(/Cue del Coach/)).toBeInTheDocument();
    expect(screen.getByText('Baja controlado hasta el pecho')).toBeInTheDocument();
    expect(screen.getByText('Rebotar la barra en el pecho')).toBeInTheDocument();
  });

  it('quita un ejercicio de la rutina', () => {
    mockView({ routines: [{ ...routines[0], exercises: [exercise, { ...exercise, id: 'e2' }] }] });
    render(<RoutineView />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar de la rutina' })[0]);
    expect(useAppMock().removeExerciseFromRoutine).toHaveBeenCalledWith(1, 'e1');
  });

  it('duplica el día de rutina y selecciona la copia', () => {
    const setSelectedDay = vi.fn();
    mockView({ setSelectedDay });
    useAppMock().duplicateRoutineDay.mockReturnValue(3);
    render(<RoutineView />);

    fireEvent.click(screen.getByRole('button', { name: 'Duplicar este día de rutina' }));
    expect(useAppMock().duplicateRoutineDay).toHaveBeenCalledWith(1);
    expect(setSelectedDay).toHaveBeenCalledWith(3);
  });

  it('comparte la rutina y muestra la confirmación copiada', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    mockView();
    render(<RoutineView />);

    fireEvent.click(screen.getByRole('button', { name: /Compartir/ }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
      expect(screen.getByText('¡Rutina copiada!')).toBeInTheDocument();
    });
  });

  it('importa una rutina pegada desde texto', () => {
    const importRoutines = vi.fn();
    mockView({ importRoutines });
    render(<RoutineView />);

    fireEvent.click(screen.getByRole('button', { name: /Cargar rutina/ }));
    fireEvent.change(screen.getByLabelText('Texto de la rutina compartida'), {
      target: {
        value:
          'Mi Rutina FitAI\n' +
          '==============\n' +
          '\n' +
          'Día 1 - Empuje Dinámico (Día 1)\n' +
          '  Enfoque: Pecho y Tríceps\n' +
          '  Dificultad: intermedio • ~45 min\n' +
          '  1. Press de Banca con Barra\n' +
          '     - 4 x 8-10 @ 80 kg\n' +
          '     - Descanso: 2 min',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));

    expect(importRoutines).toHaveBeenCalledTimes(1);
    expect(importRoutines).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Empuje Dinámico' })])
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rechaza texto sin una rutina válida y no importa nada', () => {
    const importRoutines = vi.fn();
    mockView({ importRoutines });
    render(<RoutineView />);

    fireEvent.click(screen.getByRole('button', { name: /Cargar rutina/ }));
    fireEvent.change(screen.getByLabelText('Texto de la rutina compartida'), {
      target: { value: 'esto no es una rutina válida' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/No se reconoció una rutina válida/);
    expect(importRoutines).not.toHaveBeenCalled();
  });

  it('abre el Coach IA y envía una pregunta', () => {
    mockView();
    render(<RoutineView />);

    fireEvent.click(screen.getByRole('button', { name: /Consejos de técnica/i }));
    fireEvent.change(screen.getByPlaceholderText('Escribe tu pregunta…'), {
      target: { value: '¿Cómo mejoro mi press?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar al Coach/ }));

    expect(useAppMock().sendCoachMessage).toHaveBeenCalledWith('¿Cómo mejoro mi press?');
  });

  it('renderiza el entrenamiento en vivo cuando está activo', () => {
    mockView({
      isWorkoutActive: true,
      activeRoutine: routines[0],
      activeExerciseIndex: 0,
      activeSetIndex: 0,
      activeWorkoutSets: [],
      logActiveSet: vi.fn(),
      goToNextExercise: vi.fn(),
      goToPreviousExercise: vi.fn(),
      restTimerSeconds: 90,
      isRestTimerActive: false,
      pauseRestTimer: vi.fn(),
      adjustRestTimer: vi.fn(),
      startRestTimer: vi.fn(),
      finishWorkout: vi.fn((): WorkoutSessionLog => ({
          id: 's1',
          date: '2026-09-08',
          routineName: 'Empuje Dinámico',
          durationMinutes: 45,
          totalVolumeKg: 2560,
          exercisesCompleted: 1,
          totalSets: 4,
          averageRpe: 8,
          caloriesBurned: 260,
          userObservations: 'bien',
          aiCoachFeedback: 'Buen trabajo.',
          completedSets: [],
        })
      ),
      cancelWorkout: vi.fn(),
    });
    render(<RoutineView />);

    expect(screen.getByText('Entrenamiento en vivo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar Serie/ })).toBeInTheDocument();
    expect(screen.getByText('Temporizador de descanso')).toBeInTheDocument();
  });
});