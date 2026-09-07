import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { AppProvider } from '../context/AppContext';
import { useApp } from '../context/useApp';
import { EXERCISE_DATABASE, setExerciseDatabase } from '../services/exerciseDatabaseService';
import { formatNumber } from '../utils/format';
import { DashboardView } from './DashboardView';

function Harness() {
  const { currentScreen, isWorkoutActive } = useApp();
  return (
    <>
      <DashboardView />
      <span data-testid="harness-screen">{currentScreen}</span>
      <span data-testid="harness-workout">{String(isWorkoutActive)}</span>
    </>
  );
}

function renderDashboard() {
  return render(
    <AppProvider>
      <Harness />
    </AppProvider>
  );
}

describe('DashboardView (KPIs dinámicos)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deriva tiempo total, promedio por sesión y delta de peso del historial real', () => {
    renderDashboard();

    expect(screen.getByText('4 hrs')).toBeInTheDocument();
    expect(screen.getByText('Promedio 60 min/sesión')).toBeInTheDocument();
    expect(screen.getByText('-1.3 kg este periodo')).toBeInTheDocument();
  });

  it('muestra el PR más reciente por fecha real en vez de texto hardcodeado', () => {
    renderDashboard();

    expect(screen.getByText('Peso Muerto Rumano 125 kg')).toBeInTheDocument();
    expect(screen.getByText('+4.1% nuevo récord')).toBeInTheDocument();
  });

  it('muestra el contador de la biblioteca derivado del dataset real', () => {
    // Seed sincrónico desde el JSON local (mismo dataset que sirve la app via fetch en runtime).
    const jsonPath = resolve(__dirname, '../../public/exercisesDatabase.json');
    setExerciseDatabase(JSON.parse(readFileSync(jsonPath, 'utf-8')));

    renderDashboard();

    expect(
      screen.getByText(`Biblioteca (${formatNumber(EXERCISE_DATABASE.length)})`)
    ).toBeInTheDocument();
  });

  it('inicia el entrenamiento del día con el botón hero', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /comenzar entrenamiento/i }));
    expect(screen.getByTestId('harness-workout')).toHaveTextContent('true');
    expect(screen.getByTestId('harness-screen')).toHaveTextContent('workout');
  });

  it('inicia la rutina desde la sección de ejercicios del día', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /iniciar rutina ahora/i }));
    expect(screen.getByTestId('harness-workout')).toHaveTextContent('true');
  });

  it('navega a la rutina completa y al coach desde las tarjetas', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /ver rutina completa/i }));
    expect(screen.getByTestId('harness-screen')).toHaveTextContent('routine');

    fireEvent.click(screen.getByRole('button', { name: /preguntar al coach ia/i }));
    expect(screen.getByTestId('harness-screen')).toHaveTextContent('coach');
  });
});

describe('DashboardView (variante móvil)', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
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

  it('muestra UN botón principal de entrenar y oculta el detalle desktop', () => {
    mockMobileViewport();
    renderDashboard();

    expect(screen.getByRole('button', { name: /entrenar/i })).toBeInTheDocument();
    expect(screen.getByText('¡Hola, Carlos!')).toBeInTheDocument();
    expect(screen.queryByText('Ejercicios Programados para Hoy')).not.toBeInTheDocument();
  });

  it('inicia el entrenamiento del día con el botón único', () => {
    mockMobileViewport();
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /entrenar/i }));
    expect(screen.getByTestId('harness-workout')).toHaveTextContent('true');
    expect(screen.getByTestId('harness-screen')).toHaveTextContent('workout');
  });

  it('muestra los accesos rápidos secundarios y navega a ellos', () => {
    mockMobileViewport();
    renderDashboard();

    expect(screen.getByText('Explorar')).toBeInTheDocument();
    expect(screen.getByText('Progreso')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
    expect(screen.getByText('Coach IA')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Historial'));
    expect(screen.getByTestId('harness-screen')).toHaveTextContent('history');

    fireEvent.click(screen.getByText('Perfil'));
    expect(screen.getByTestId('harness-screen')).toHaveTextContent('profile');
  });
});
