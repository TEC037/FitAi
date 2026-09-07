import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useApp } from '../context/useApp';
import { STORAGE_KEYS } from '../config/constants';
import { WorkoutSessionLog } from '../types';
import { HistoryView } from './HistoryView';

const LOG_WITHOUT_TELEMETRY: WorkoutSessionLog = {
  id: 'wlog_x',
  date: '2026-09-04',
  routineName: 'Pierna Completa',
  durationMinutes: 55,
  totalVolumeKg: 10500,
  exercisesCompleted: 5,
  totalSets: 15,
  averageRpe: 8,
  caloriesBurned: 400,
  userObservations: 'Sensación fuerte en cuádriceps.',
  aiCoachFeedback: 'Buena sesión, mantén el ritmo.',
  completedSets: [],
};

function HistoryHarness() {
  const { isWorkoutActive, currentScreen } = useApp();
  return (
    <>
      <HistoryView />
      <span data-testid="harness-workout">{String(isWorkoutActive)}</span>
      <span data-testid="harness-screen">{currentScreen}</span>
    </>
  );
}

describe('HistoryView', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
  });

  it('renderiza el historial demo con fecha formateada y RPE', () => {
    render(
      <AppProvider>
        <HistoryView />
      </AppProvider>
    );

    expect(screen.getByText('Historial de Entrenamientos')).toBeInTheDocument();
    expect(screen.getByText('02 sep 2026')).toBeInTheDocument();
    expect(screen.getByText('Empuje Dinámico (Pecho y Tríceps)')).toBeInTheDocument();
    expect(screen.getByText('RPE 8.2')).toBeInTheDocument();
  });

  it('expande y colapsa el detalle de una sesión', () => {
    render(
      <AppProvider>
        <HistoryView />
      </AppProvider>
    );

    expect(screen.getByText('Detalle de Series Registradas')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Empuje Dinámico (Pecho y Tríceps)'));
    expect(screen.queryByText('Detalle de Series Registradas')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Empuje Dinámico (Pecho y Tríceps)'));
    expect(screen.getByText('Detalle de Series Registradas')).toBeInTheDocument();
  });

  it('muestra fallbacks de telemetría cuando la sesión no registra datos', () => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([LOG_WITHOUT_TELEMETRY]));

    render(
      <AppProvider>
        <HistoryView />
      </AppProvider>
    );

    expect(screen.getByText('142 bpm')).toBeInTheDocument();
    expect(screen.getByText(/Pico: 165/)).toBeInTheDocument();
    expect(screen.getByText('400 kcal')).toBeInTheDocument();
    expect(screen.getByText('490 W')).toBeInTheDocument();
  });

  it('muestra el estado vacío con botón para comenzar', () => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, '[]');

    render(
      <AppProvider>
        <HistoryView />
      </AppProvider>
    );

    expect(screen.getByText('Aún no hay sesiones registradas')).toBeInTheDocument();
    expect(screen.getByText('Comenzar Entrenamiento')).toBeInTheDocument();
  });

  it('inicia el entrenamiento desde el estado vacío', () => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, '[]');

    render(
      <AppProvider>
        <HistoryHarness />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /comenzar entrenamiento/i }));
    expect(screen.getByTestId('harness-workout')).toHaveTextContent('true');
    expect(screen.getByTestId('harness-screen')).toHaveTextContent('workout');
  });

  it('abre la siguiente sesión y colapsa la expandida', () => {
    render(
      <AppProvider>
        <HistoryView />
      </AppProvider>
    );

    expect(screen.getAllByText('Press de Banca con Barra').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Tracción & Espalda Fuerte'));
    expect(screen.queryAllByText('Press de Banca con Barra').length).toBe(0);
    expect(screen.getByText('Jalón al Pecho en Polea Alta')).toBeInTheDocument();
  });
});

describe('HistoryView (variante móvil)', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
  });

  afterEach(() => {
    if (originalMatchMedia === undefined) {
      delete (window as unknown as { matchMedia?: unknown }).matchMedia;
    } else {
      window.matchMedia = originalMatchMedia;
    }
  });

  function mockMobileViewport() {
    window.matchMedia = vi.fn(() => ({
      matches: true,
      media: '(max-width: 768px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof matchMedia;
  }

  it('muestra el historial en filas compactas con la fecha y las métricas clave', () => {
    mockMobileViewport();
    render(
      <AppProvider>
        <HistoryView />
      </AppProvider>
    );

    expect(screen.getByText('Mis Sesiones')).toBeInTheDocument();
    expect(screen.getByText('Empuje Dinámico (Pecho y Tríceps)')).toBeInTheDocument();
  });

  it('expande una sesión compacta para ver la evaluación y las series', () => {
    mockMobileViewport();
    render(
      <AppProvider>
        <HistoryView />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('Tracción & Espalda Fuerte'));
    expect(screen.getByText('Jalón al Pecho en Polea Alta')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Tracción & Espalda Fuerte'));
    expect(screen.queryByText('Jalón al Pecho en Polea Alta')).not.toBeInTheDocument();
  });

  it('muestra el estado vacío con botón para comenzar en móvil', () => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, '[]');
    mockMobileViewport();
    render(
      <AppProvider>
        <HistoryView />
      </AppProvider>
    );

    expect(screen.getByText('Aún no hay sesiones registradas')).toBeInTheDocument();
    expect(screen.getByText('Comenzar Entrenamiento')).toBeInTheDocument();
  });
});
