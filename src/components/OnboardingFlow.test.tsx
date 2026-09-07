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

  it('muestra el nombre como único dato obligatorio y el plan opcional plegado', () => {
    renderOnboarding();

    expect(screen.getByText('¿Cómo te llamas?')).toBeInTheDocument();
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /personalizar mi plan \(opcional\)/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /ganar masa/i })
    ).not.toBeInTheDocument();
  });

  it('no avanza sin nombre y bloquea el botón Comenzar', () => {
    renderOnboarding();

    const start = screen.getByRole('button', { name: /comenzar/i });
    expect(start).toBeDisabled();

    fireEvent.click(start);
    expect(screen.getByText('¿Cómo te llamas?')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu nombre para continuar.')).toBeInTheDocument();
  });

  it('expande y colapsa el panel opcional', () => {
    renderOnboarding();

    const toggle = screen.getByRole('button', { name: /personalizar mi plan \(opcional\)/i });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Objetivo principal')).toBeInTheDocument();
    expect(screen.getByText('Nivel de experiencia')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Objetivo principal')).not.toBeInTheDocument();
  });

  it('permite ajustar objetivo y alternar zonas priorizadas desde el panel opcional', () => {
    renderOnboarding();

    fireEvent.click(screen.getByRole('button', { name: /personalizar mi plan \(opcional\)/i }));

    const glutes = screen.getByRole('button', { name: /Glúteos/ });
    fireEvent.click(glutes);
    expect(glutes.className).toContain('bg-[#C0FF00]');
    fireEvent.click(glutes);
    expect(glutes.className).not.toContain('bg-[#C0FF00]');

    const goalButton = screen.getByRole('button', { name: /perder grasa/i });
    fireEvent.click(goalButton);
    expect(goalButton.className).toContain('border-[#C0FF00]');
  });

  it('completa con solo el nombre hasta el cierre del onboarding', () => {
    vi.useFakeTimers();
    renderOnboarding();

    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Ana Pérez' } });
    fireEvent.click(screen.getByRole('button', { name: /comenzar/i }));

    expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument();
    expect(screen.getByText(/Estamos preparando una rutina personalizada/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Filtrando ejercicios contra lesiones señaladas...')).toBeInTheDocument();

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