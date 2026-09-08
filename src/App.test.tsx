import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Test de integración: monta la app completa con lazy imports (toda la UI)
// y ejercicios cargados de forma asíncrona. Bajo carga de la suite completa
// el presupuesto por defecto (5s) resulta corto.
vi.setConfig({ testTimeout: 15000 });

async function mountLanding() {
  render(<App />);
  expect(
    await screen.findByText('¿Cómo funciona FitAI Coach?', {}, { timeout: 5000 })
  ).toBeInTheDocument();
}

/** Abre el menú circular y entra a una pantalla autenticada. */
async function openNavTo(label: string) {
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
  fireEvent.click(screen.getByRole('button', { name: label }));
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('muestra la landing no autenticada por defecto', async () => {
    await mountLanding();
    expect(
      screen.getByRole('heading', { level: 1, name: /Tu entrenador inteligente/ })
    ).toBeInTheDocument();
  });

  it('entra en la demo desde el botón circular de la barra superior y aterriza en Rutina', async () => {
    await mountLanding();

    fireEvent.click(screen.getByRole('button', { name: 'Probar la demo' }));
    expect(
      await screen.findByRole('heading', { name: 'Mi Rutina' }, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Carlos Ramírez/).length).toBeGreaterThan(0);
  });

  it('navega a Perfil y Progreso desde el menú circular', async () => {
    await mountLanding();
    fireEvent.click(screen.getByRole('button', { name: 'Probar la demo' }));
    await screen.findByRole('heading', { name: 'Mi Rutina' }, { timeout: 5000 });

    await openNavTo('Perfil');
    expect(
      await screen.findByRole('heading', { name: 'Perfil y Preferencias' }, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('navega a la Biblioteca de Ejercicios', async () => {
    await mountLanding();
    fireEvent.click(screen.getByRole('button', { name: 'Probar la demo' }));
    await screen.findByRole('heading', { name: 'Mi Rutina' }, { timeout: 5000 });

    await openNavTo('Biblioteca');
    expect(
      await screen.findByText('Biblioteca de Ejercicios', {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('abre el modal de seguridad desde el Perfil', async () => {
    await mountLanding();
    fireEvent.click(screen.getByRole('button', { name: 'Probar la demo' }));
    await screen.findByRole('heading', { name: 'Mi Rutina' }, { timeout: 5000 });

    await openNavTo('Perfil');
    await screen.findByRole('heading', { name: 'Perfil y Preferencias' }, { timeout: 5000 });

    fireEvent.click(screen.getByRole('button', { name: 'Ver Normas Médicas' }));
    expect(
      await screen.findByRole('heading', { name: 'Consideraciones de Seguridad y Salud' })
    ).toBeInTheDocument();
  });

  it('inicia sesión desde la pantalla de autenticación', async () => {
    await mountLanding();

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    expect(
      await screen.findByRole('heading', { name: 'FitAI Coach' }, { timeout: 5000 })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Acceder con Carlos Ramírez (Usuario Demo)' })
    );
    expect(
      await screen.findByRole('heading', { name: 'Mi Rutina' }, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('cierra sesión y vuelve a la landing', async () => {
    await mountLanding();
    fireEvent.click(screen.getByRole('button', { name: 'Probar la demo' }));
    await screen.findByRole('heading', { name: 'Mi Rutina' }, { timeout: 5000 });

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/ }));
    fireEvent.click(screen.getByRole('button', { name: /Sí, cerrar sesión/ }));

    await waitFor(
      () => expect(screen.getByText('¿Cómo funciona FitAI Coach?')).toBeInTheDocument(),
      { timeout: 5000 }
    );
  });
});