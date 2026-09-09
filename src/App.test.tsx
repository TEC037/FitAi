import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App (Punto Fuerte)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.print = vi.fn();
  });

  it('muestra la marca Punto Fuerte en el header', () => {
    render(<App />);
    expect(screen.getByText('Punto Fuerte')).toBeInTheDocument();
  });

  it('abre por defecto en la pestaña Hoy', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /¡A por ello, Carlos!/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hoy/i })).toHaveAttribute('aria-current', 'page');
  });

  it('navega por las pestañas inferiores', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Entrenar/i }));
    expect(screen.getByText(/En Vivo/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Rutinas/i }));
    expect(
      screen.getByPlaceholderText(/Buscar por ejercicio, músculo o rutina/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Progreso/i }));
    expect(screen.getByRole('heading', { name: /Progreso/i })).toBeInTheDocument();
  });

  it('abre el modal de notificaciones desde el header', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    expect(screen.getByRole('heading', { name: /Notificaciones/i })).toBeInTheDocument();
  });

  it('abre el perfil desde el header', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Perfil de usuario' }));
    expect(screen.getByText('Perfil de Atleta')).toBeInTheDocument();
  });

  it('abre el modal de peso desde la acción rápida de Hoy', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Registrar peso/i }));
    expect(screen.getByRole('heading', { name: /Registrar Peso/i })).toBeInTheDocument();
  });
});