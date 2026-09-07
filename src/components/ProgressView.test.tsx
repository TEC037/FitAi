import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { ProgressView } from './ProgressView';

function renderProgress() {
  return render(
    <AppProvider>
      <ProgressView />
    </AppProvider>
  );
}

describe('ProgressView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra el seguimiento del progreso y sus métricas', () => {
    renderProgress();

    expect(screen.getByText('Seguimiento del Progreso')).toBeInTheDocument();
    expect(screen.getByText('Métricas de Rendimiento y Biomecánica')).toBeInTheDocument();
  });

  it('filtra los récords personales por categoría', () => {
    renderProgress();

    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument();
    expect(screen.getByText('Sentadilla Trasera')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'piernas' }));

    expect(screen.getByText('Sentadilla Trasera')).toBeInTheDocument();
    expect(screen.queryByText('Press de Banca Plano')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'todos' }));

    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument();
  });

  it('cambia el filtro temporal del panel', () => {
    renderProgress();

    fireEvent.click(screen.getByRole('button', { name: 'semana' }));
    expect(screen.getByRole('button', { name: 'semana' }).className).toContain('bg-[#C0FF00]');
    expect(screen.getByRole('button', { name: 'mes' }).className).not.toContain('bg-[#C0FF00]');

    fireEvent.click(screen.getByRole('button', { name: 'año' }));
    expect(screen.getByRole('button', { name: 'año' }).className).toContain('bg-[#C0FF00]');
  });
});
