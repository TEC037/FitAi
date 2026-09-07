import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { RoutineView } from './RoutineView';

function renderRoutine() {
  return render(
    <AppProvider>
      <RoutineView />
    </AppProvider>
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
