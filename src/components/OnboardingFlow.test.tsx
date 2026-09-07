import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { OnboardingFlow } from './OnboardingFlow';

function renderOnboarding() {
  return render(
    <AppProvider>
      <OnboardingFlow />
    </AppProvider>
  );
}

describe('OnboardingFlow', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el paso 1 (nombre obligatorio) y el indicador de progreso', () => {
    renderOnboarding();

    expect(screen.getByText('¿Cómo te llamas?')).toBeInTheDocument();
    expect(screen.getByText('Paso 1 de 5')).toBeInTheDocument();
    expect(screen.getByLabelText('Estatura (cm)')).toBeInTheDocument();
    expect(screen.getByText('Datos opcionales')).toBeInTheDocument();
  });

  it('no avanza sin escribir el nombre y bloquea el botón de Siguiente', () => {
    renderOnboarding();

    const next = screen.getByRole('button', { name: /siguiente paso/i });
    expect(next).toBeDisabled();

    fireEvent.click(next);
    expect(screen.getByText('¿Cómo te llamas?')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu nombre para continuar.')).toBeInTheDocument();
  });

  it('avanza por el stepper hasta el paso de generación', () => {
    renderOnboarding();

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana Pérez' } });
    fireEvent.click(screen.getByRole('button', { name: /siguiente paso/i }));
    expect(screen.getByText('Nivel de entrenamiento y horarios')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /siguiente paso/i }));
    expect(screen.getByText('¿Cuál es tu objetivo principal?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /siguiente paso/i }));
    expect(screen.getByText('Equipo y restricciones físicas')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /generar mi rutina con ia/i }));
    expect(screen.getByText('Paso 5 de 5')).toBeInTheDocument();
    expect(screen.getByText(/Estamos preparando una rutina personalizada/i)).toBeInTheDocument();
  });

  it('vuelve al paso anterior con el botón Anterior', () => {
    renderOnboarding();

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana Pérez' } });
    fireEvent.click(screen.getByRole('button', { name: /siguiente paso/i }));
    expect(screen.getByText('Nivel de entrenamiento y horarios')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /anterior/i }));
    expect(screen.getByText('¿Cómo te llamas?')).toBeInTheDocument();
  });

  it('cambia el objetivo principal y alterna músculos priorizados', () => {
    const queryBiceps = () => screen.getByRole('button', { name: 'Glúteos' });
    renderOnboarding();

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana Pérez' } });
    fireEvent.click(screen.getByRole('button', { name: /siguiente paso/i }));
    fireEvent.click(screen.getByRole('button', { name: /siguiente paso/i }));

    fireEvent.click(queryBiceps());
    expect(queryBiceps().className).toContain('bg-[#C0FF00]');

    fireEvent.click(queryBiceps());
    expect(queryBiceps().className).not.toContain('bg-[#C0FF00]');

    const goalButton = screen.getByRole('button', { name: /perder grasa \/ definir/i });
    fireEvent.click(goalButton);
    expect(goalButton.className).toContain('border-[#C0FF00]');
    expect(screen.getByRole('button', { name: /ganar masa muscular/i }).className).not.toContain(
      'border-[#C0FF00]'
    );
  });

  it('completa la generación de la rutina hasta el cierre del onboarding', () => {
    vi.useFakeTimers();
    renderOnboarding();

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana Pérez' } });
    fireEvent.click(screen.getByRole('button', { name: /siguiente paso/i }));
    fireEvent.click(screen.getByRole('button', { name: /siguiente paso/i }));
    fireEvent.click(screen.getByRole('button', { name: /siguiente paso/i }));

    fireEvent.click(screen.getByRole('button', { name: /generar mi rutina con ia/i }));
    expect(screen.getByText(/Estamos preparando una rutina personalizada/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByText('Filtrando ejercicios contra lesiones señaladas...')
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
    expect(screen.getByText('Entrar a Mi Dashboard')).toBeInTheDocument();
  });
});
