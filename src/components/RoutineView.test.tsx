import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useApp } from '../context/useApp';
import { RoutineView } from './RoutineView';

function renderRoutine() {
  return render(
    <AppProvider>
      <RoutineView />
    </AppProvider>
  );
}

function Harness() {
  const { isWorkoutActive } = useApp();
  return (
    <>
      <RoutineView />
      <span data-testid="harness-workout">{String(isWorkoutActive)}</span>
    </>
  );
}

describe('RoutineView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra el plan semanal, las píldoras de día y la lista de ejercicios', () => {
    renderRoutine();

    expect(screen.getByText('Mi Rutina Personalizada')).toBeInTheDocument();
    expect(screen.getByText('Día 1')).toBeInTheDocument();
    expect(screen.getByText('Lista de Ejercicios', { exact: false })).toBeInTheDocument();
  });

  it('marca un ejercicio como completado y lo desmarca', () => {
    renderRoutine();

    const complete = screen.getAllByRole('button', { name: 'Marcar como completado' })[0];
    fireEvent.click(complete);

    expect(screen.getByText('Completado')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Desmarcar' })[0]);
    expect(screen.queryByText('Completado')).not.toBeInTheDocument();
  });

  it('abre la ficha técnica biomecánica desde los detalles del ejercicio', () => {
    renderRoutine();

    fireEvent.click(screen.getAllByTitle('Haz clic para ver animación GIF')[0]);

    expect(screen.getByText('Ficha Técnica Biomecánica')).toBeInTheDocument();
  });

  it('cambia de día seleccionando otra píldora del plan', () => {
    renderRoutine();

    const day2 = screen.getByRole('button', {
      name: (accessName) => /día 2/i.test(accessName ?? '') && /ejercicios/.test(accessName ?? ''),
    });
    expect(day2.className).not.toContain('bg-[#C0FF00]');

    fireEvent.click(day2);

    expect(
      screen.getByRole('button', {
        name: (accessName) =>
          /día 2/i.test(accessName ?? '') && /ejercicios/.test(accessName ?? ''),
      }).className
    ).toContain('bg-[#C0FF00]');
  });
});

describe('RoutineView (variante móvil)', () => {
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

  it('muestra solo la sesión de hoy con lista compacta y UN botón ENTRENAR', () => {
    mockMobileViewport();
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    expect(screen.queryByText('Mi Rutina Personalizada')).not.toBeInTheDocument();
    expect(screen.queryByText('Día 1')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrenar/i })).toBeInTheDocument();
    expect(screen.getByText('Press de Banca con Barra')).toBeInTheDocument();
  });

  it('inicia la sesión de hoy con el botón único', () => {
    mockMobileViewport();
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /entrenar/i }));
    expect(screen.getByTestId('harness-workout')).toHaveTextContent('true');
  });
});
