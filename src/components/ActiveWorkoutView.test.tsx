import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { ActiveWorkoutView } from './ActiveWorkoutView';

function renderActiveWorkout() {
  return render(
    <AppProvider>
      <ActiveWorkoutView />
    </AppProvider>
  );
}

describe('ActiveWorkoutView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    Element.prototype.scrollIntoView = () => {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra la sesión activa con el ejercicio por defecto', () => {
    renderActiveWorkout();

    expect(screen.getByText('Entrenamiento en Vivo')).toBeInTheDocument();
    expect(screen.getByText('Empuje Dinámico')).toBeInTheDocument();
    expect(screen.getByText('Press de Banca con Barra')).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('completa una serie y muestra la confirmación temporal', () => {
    renderActiveWorkout();

    fireEvent.click(screen.getByRole('button', { name: /COMPLETAR SERIE 1/ }));
    expect(screen.getByText('¡Serie Guardada! ✓')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2500));
    expect(screen.queryByText('¡Serie Guardada! ✓')).not.toBeInTheDocument();
  });

  it('abre el modal de finalización y confirma el resumen de la sesión', () => {
    renderActiveWorkout();

    fireEvent.click(screen.getByRole('button', { name: 'Finalizar Sesión' }));
    expect(screen.getByText('¿Finalizar Entrenamiento?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Sesión' }));
    expect(screen.getByText('Feedback del Coach IA y Biometría')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver en Historial' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver al Dashboard' })).toBeInTheDocument();
  });

  it('abre el modal de ciencia de escalas alométricas desde la telemetría', () => {
    renderActiveWorkout();

    fireEvent.click(screen.getByRole('button', { name: /Ciencia de Escalas/ }));
    expect(screen.getByText('Fisiología y Escalas Alométricas')).toBeInTheDocument();
  });
});
