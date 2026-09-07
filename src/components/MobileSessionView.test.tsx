import React, { useState } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileSessionView } from './MobileSessionView';
import { Exercise, LoggedSet } from '../types';

const { useApp } = vi.hoisted(() => ({ useApp: vi.fn() }));

vi.mock('../context/useApp', () => ({
  useApp,
}));

const EXERCISE: Exercise = {
  id: 'e1',
  name: 'Press Banca',
  primaryMuscle: 'Pecho',
  targetMuscles: ['Pectoral', 'Tríceps'],
  sets: 2,
  reps: '8-10',
  suggestedWeightKg: 60,
  restSeconds: 60,
  rpe: 8,
  technicalCue: 'Empuja con control.',
  fullInstructions: [],
  commonMistakes: [],
  equipment: 'Barra',
  iconType: 'barbell',
  difficulty: 'intermedio',
};

function makeLoggedSet(setNumber: number): LoggedSet {
  return {
    exerciseId: 'e1',
    exerciseName: 'Press Banca',
    setNumber,
    weightKg: 60,
    reps: 8,
    rpe: 8,
    sensation: '',
    completedAt: '10:00',
  };
}

interface Initial {
  activeSetIndex?: number;
  activeWorkoutSets?: LoggedSet[];
  isRestTimerActive?: boolean;
  restTimerSeconds?: number;
}

function renderView(initial: Initial = {}) {
  const finishWorkout = vi.fn();
  const navigateTo = vi.fn();
  const cancelWorkout = vi.fn();
  finishWorkout.mockImplementation((notes: string, rpe: number) => ({
    routineName: 'Empuje',
    totalSets: 2,
    notes,
    averageRpe: rpe,
  }));

  function Harness() {
    const [activeSetIndex, setActiveSetIndex] = useState(initial.activeSetIndex ?? 1);
    const [activeWorkoutSets, setActiveWorkoutSets] = useState<LoggedSet[]>(
      initial.activeWorkoutSets ?? []
    );
    const [isRestTimerActive, setIsRestTimerActive] = useState(initial.isRestTimerActive ?? false);
    const [restTimerSeconds, setRestTimerSeconds] = useState(initial.restTimerSeconds ?? 0);

    useApp.mockReturnValue({
      allometricProfile: {
        allometricRestingHr: 62,
        heartRateReserve: 118,
        maxHeartRateBpm: 190,
      },
      activeRoutine: {
        dayNumber: 1,
        name: 'Empuje',
        focus: 'Pecho',
        estimatedMinutes: 20,
        targetMuscles: ['Pecho'],
        exercises: [EXERCISE],
      },
      activeExerciseIndex: 0,
      activeSetIndex,
      activeWorkoutSets,
      workoutElapsedTime: 120,
      restTimerSeconds,
      isRestTimerActive,
      logActiveSet: () => {
        setActiveWorkoutSets((prev) => [...prev, makeLoggedSet(activeSetIndex)]);
        setActiveSetIndex((prev) => prev + 1);
        setRestTimerSeconds(60);
        setIsRestTimerActive(true);
      },
      pauseRestTimer: () => {
        setIsRestTimerActive(false);
        setRestTimerSeconds(0);
      },
      finishWorkout,
      cancelWorkout,
      navigateTo,
    });

    return <MobileSessionView />;
  }

  render(<Harness />);
  return { finishWorkout, navigateTo, cancelWorkout };
}

describe('MobileSessionView (flujo 1 botón)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el ejercicio y UN botón principal para completar la serie', () => {
    renderView();

    expect(screen.getByText('Press Banca')).toBeInTheDocument();
    expect(screen.getByText('Serie 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /COMPLETAR SERIE/i })).toBeInTheDocument();
  });

  it('registra la serie con valores sugeridos y activa el descanso', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /COMPLETAR SERIE/i }));

    // Descanso automático: el único botón pasa a "CONTINUAR"
    expect(screen.getByRole('button', { name: /CONTINUAR/i })).toBeInTheDocument();

    // Al saltar el descanso se avanza de serie
    fireEvent.click(screen.getByRole('button', { name: /CONTINUAR/i }));

    expect(screen.getByText('Serie 2 de 2')).toBeInTheDocument();
    expect(screen.getByText(/1\/2 series completadas/)).toBeInTheDocument();
  });

  it('salta el descanso con el mismo botón', () => {
    renderView({ restTimerSeconds: 45, isRestTimerActive: true });

    fireEvent.click(screen.getByRole('button', { name: /CONTINUAR/i }));

    expect(screen.queryByText(/Descanso/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /COMPLETAR SERIE/i })).toBeInTheDocument();
  });

  it('muestra el countdown del descanso en grande y avisa al final', () => {
    renderView({ restTimerSeconds: 9, isRestTimerActive: true });

    expect(screen.getByText('Descanso')).toBeInTheDocument();
    expect(screen.getByText('00:09')).toBeInTheDocument();
    expect(screen.getByText('00:09').className).toContain('text-6xl');
  });

  it('al completar la última serie abre el modal final que solo pide RPE y notas', () => {
    renderView({ activeSetIndex: 3, activeWorkoutSets: [makeLoggedSet(1), makeLoggedSet(2)] });

    expect(screen.getByText('¿Finalizar Entrenamiento?')).toBeInTheDocument();
    expect(screen.getByText('RPE Promedio de la Sesión Completa (1 - 10)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Sesión' }));
    expect(screen.getAllByText(/Guardado en tu historial/).length).toBeGreaterThan(0);
  });

  it('tras finalizar navega al dashboard con el botón único', () => {
    const { navigateTo } = renderView({
      activeSetIndex: 3,
      activeWorkoutSets: [makeLoggedSet(1), makeLoggedSet(2)],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Sesión' }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver al Dashboard' }));

    expect(navigateTo).toHaveBeenCalledWith('dashboard');
  });
});