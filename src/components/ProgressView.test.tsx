import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

describe('ProgressView (variante móvil)', () => {
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

  it('muestra métricas, curva de peso y récords en una vista compacta', () => {
    mockMobileViewport();
    render(
      <AppProvider>
        <ProgressView />
      </AppProvider>
    );

    expect(screen.getByText('Mis Métricas')).toBeInTheDocument();
    expect(screen.getByText('Récords Personales')).toBeInTheDocument();
    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument();
    expect(screen.queryByText('Biometría Alométrica Personalizada')).not.toBeInTheDocument();
    expect(screen.queryByText('Comparativa Semanal')).not.toBeInTheDocument();
  });

  it('navega sin filtros: la vista móvil no ofrece el selector de categorías', () => {
    mockMobileViewport();
    render(
      <AppProvider>
        <ProgressView />
      </AppProvider>
    );

    expect(screen.queryByRole('button', { name: 'piernas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'semana' })).not.toBeInTheDocument();
  });
});
