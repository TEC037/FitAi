import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Test de integración: monta la app completa con lazy imports (toda la UI)
// y ejercicios cargados de forma asíncrona. Bajo carga de la suite completa
// el presupuesto por defecto (5s) resulta corto.
vi.setConfig({ testTimeout: 15000 });

async function mountApp() {
  render(<App />);
  expect(
    await screen.findByText('Recomendación del Coach', {}, { timeout: 5000 })
  ).toBeInTheDocument();
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renderiza el dashboard autenticado por defecto (lazy)', async () => {
    await mountApp();
  });

  it('navega a Mi Rutina desde la barra lateral', async () => {
    await mountApp();

    fireEvent.click(screen.getByRole('button', { name: 'Mi Rutina' }));
    expect(
      await screen.findByText('Mi Rutina Personalizada', {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('navega a Progreso y a Perfil desde la barra lateral', async () => {
    await mountApp();

    fireEvent.click(screen.getByRole('button', { name: 'Progreso' }));
    expect(
      await screen.findByText('Seguimiento del Progreso', {}, { timeout: 5000 })
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Perfil' })[0]);
    expect(
      await screen.findByText('Perfil y Preferencias', {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('navega a la Biblioteca de Ejercicios', async () => {
    await mountApp();

    fireEvent.click(screen.getByRole('button', { name: 'Biblioteca' }));
    expect(
      await screen.findByText('Biblioteca de Ejercicios', {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('navega a Entrenamiento (historial) desde la barra lateral', async () => {
    await mountApp();

    fireEvent.click(screen.getByRole('button', { name: 'Historial' }));
    expect(
      await screen.findByText('Historial de Entrenamientos', {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('navega al Coach IA y muestra el contexto del usuario', async () => {
    await mountApp();

    fireEvent.click(screen.getAllByRole('button', { name: 'Coach IA' })[0]);
    expect(
      await screen.findByText(/Asistente de entrenamiento personal/, {}, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Carlos Ramírez/).length).toBeGreaterThan(0);
  });

  it('vuelve al dashboard al pulsar el logo', async () => {
    await mountApp();

    fireEvent.click(screen.getByRole('button', { name: 'Biblioteca' }));
    await screen.findByText('Biblioteca de Ejercicios', {}, { timeout: 5000 });

    fireEvent.click(screen.getByText('FitAI'));
    expect(
      await screen.findByText('Recomendación del Coach', {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('explora el prototipo demo desde la landing no autenticada', async () => {
    await mountApp();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));
    await screen.findByText('¿Cómo funciona FitAI Coach?', {}, { timeout: 5000 });

    fireEvent.click(screen.getByRole('button', { name: 'Explorar Prototipo (Carlos R.)' }));
    expect(
      await screen.findByText('Recomendación del Coach', {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('inicia sesión desde la pantalla de autenticación', async () => {
    await mountApp();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));
    await screen.findByText('¿Cómo funciona FitAI Coach?', {}, { timeout: 5000 });

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    expect(
      await screen.findByRole('heading', { name: 'FitAI Coach' }, { timeout: 5000 })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Acceder con Carlos Ramírez (Usuario Demo)' })
    );
    expect(
      await screen.findByText('Recomendación del Coach', {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('abre el modal de seguridad desde la barra lateral', async () => {
    await mountApp();

    fireEvent.click(screen.getByRole('button', { name: 'Avisos Médicos y Seguridad' }));
    expect(
      await screen.findByText(/Recomendaciones orientativas:/, {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('cierra sesión y vuelve a la landing no autenticada', async () => {
    await mountApp();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));
    expect(
      await screen.findByText('¿Cómo funciona FitAI Coach?', {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });
});
