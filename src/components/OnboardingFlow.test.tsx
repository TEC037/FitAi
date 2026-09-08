import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useApp } from '../context/useApp';
import { OnboardingFlow } from './OnboardingFlow';

const TOTAL_STEPS = 11;

function renderOnboarding() {
  return render(
    <AppProvider>
      <OnboardingFlow />
    </AppProvider>
  );
}

function renderOnboardingHarness() {
  let state: ReturnType<typeof useApp> | null = null;
  const Harness = () => {
    const app = useApp();
    state = app;
    return (
      <>
        <OnboardingFlow />
        <div data-testid="harness">
          auth={String(app.isAuthenticated)};routines={app.routines.length};
          day1={app.routines[0]?.name ?? 'none'};sets={app.routines[0]?.exercises[0]?.sets ?? 0}
        </div>
      </>
    );
  };
  const view = render(
    <AppProvider>
      <Harness />
    </AppProvider>
  );
  return { view, getState: () => state };
}

function expectStep(step: number) {
  expect(screen.getByText(`Paso ${step} de ${TOTAL_STEPS}`)).toBeInTheDocument();
}

function clickOption(label: RegExp) {
  fireEvent.click(screen.getByRole('button', { name: label }));
}

function answerSurveyStep(option: RegExp): void {
  const next = screen.getByRole('button', { name: /siguiente/i });
  expect(next).toBeDisabled();
  clickOption(option);
  expect(next).toBeEnabled();
  fireEvent.click(next);
}

describe('OnboardingFlow', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el nombre como único paso inicial y la encuesta plegada', () => {
    renderOnboarding();

    expect(screen.getByText('¿Cómo te llamas?')).toBeInTheDocument();
    expect(screen.getByText(`Paso 1 de ${TOTAL_STEPS}`)).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre *')).toBeInTheDocument();
    expect(screen.queryByText('¿Cuál es tu objetivo principal?')).not.toBeInTheDocument();
  });

  it('no avanza sin nombre y bloquea el botón Comenzar', () => {
    renderOnboarding();

    const start = screen.getByRole('button', { name: /comenzar/i });
    expect(start).toBeDisabled();

    fireEvent.click(start);
    expect(screen.getByText('¿Cómo te llamas?')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu nombre para continuar.')).toBeInTheDocument();
  });

  it('guía la encuesta paso a paso y permite volver atrás', () => {
    renderOnboarding();

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: /comenzar/i }));

    expectStep(2);
    expect(screen.getByText('¿Cuál es tu objetivo principal?')).toBeInTheDocument();

    answerSurveyStep(/ganar masa/i);
    expectStep(3);
    expect(screen.getByText('¿Cuál es tu nivel de experiencia?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /atrás/i }));
    expectStep(2);
    expect(screen.getByText('¿Cuál es tu objetivo principal?')).toBeInTheDocument();
  });

  it('permite selección múltiple en la encuesta (equipamiento)', () => {
    renderOnboarding();
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: /comenzar/i }));

    answerSurveyStep(/ganar masa/i);
    answerSurveyStep(/intermedio/i);
    answerSurveyStep(/4 días/i);
    answerSurveyStep(/60 min/i);

    expect(screen.getByText('¿Qué equipamiento tienes disponible?')).toBeInTheDocument();

    const dumbbells = screen.getByRole('button', { name: /mancuernas/i });
    const cables = screen.getByRole('button', { name: /poleas y cables/i });
    fireEvent.click(dumbbells);
    expect(dumbbells.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(cables);
    expect(cables.getAttribute('aria-pressed')).toBe('true');
    expect(dumbbells.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(dumbbells);
    expect(dumbbells.getAttribute('aria-pressed')).toBe('false');
  });

  it('la pregunta de lesiones trata "ninguna" como excluyente', () => {
    renderOnboarding();
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: /comenzar/i }));

    answerSurveyStep(/ganar masa/i);
    answerSurveyStep(/intermedio/i);
    answerSurveyStep(/4 días/i);
    answerSurveyStep(/60 min/i);
    answerSurveyStep(/gimnasio completo/i);
    answerSurveyStep(/pecho/i);
    answerSurveyStep(/ninguna/i);

    expect(screen.getByText('¿Qué estilo de entrenamiento prefieres?')).toBeInTheDocument();
  });

  it('completa el flujo completo y ensambla la rutina desde las respuestas', () => {
    vi.useFakeTimers();
    const { getState } = renderOnboardingHarness();

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana Pérez' } });
    fireEvent.click(screen.getByRole('button', { name: /comenzar/i }));

    answerSurveyStep(/ganar masa/i);
    answerSurveyStep(/intermedio/i);
    answerSurveyStep(/4 días/i);
    answerSurveyStep(/60 min/i);
    answerSurveyStep(/gimnasio completo/i);
    answerSurveyStep(/pecho/i);
    answerSurveyStep(/ninguna/i);
    answerSurveyStep(/mix equilibrado/i);

    expect(screen.getByText('Un par de datos biométricos')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /generar mi plan/i }));

    expectStep(TOTAL_STEPS);
    expect(screen.getByText(/Estamos preparando una rutina personalizada/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByText('Filtrando ejercicios contra tu equipamiento y lesiones...')
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(
      screen.getByText('Calculando cargas iniciales y descansos óptimos...')
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('¡Bienvenido a FitAI Coach, Ana Pérez!')).toBeInTheDocument();
    expect(screen.getByText('Día 1 • Parte Superior')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /entrar a mi dashboard/i }));

    const state = getState();
    expect(state?.isAuthenticated).toBe(true);
    expect(state?.routines).toHaveLength(4);
    expect(state?.routines[0].name).toBe('Parte Superior');
    expect(state?.routines[0].dayNumber).toBe(1);
    expect(state?.routines[0].exercises[0].sets).toBe(4);
    expect(state?.routines[0].exercises[0].reps).toBe('8-12');
  });
});