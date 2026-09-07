import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useApp } from '../context/useApp';
import { LandingPage } from './LandingPage';

function Harness() {
  const { currentScreen, isAuthenticated, user } = useApp();
  return (
    <>
      <LandingPage />
      <span data-testid="harness-screen">{currentScreen}</span>
      <span data-testid="harness-is-auth">{String(isAuthenticated)}</span>
      <span data-testid="harness-user-name">{user?.name ?? ''}</span>
    </>
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
  });

  it('renderiza hero, secciones y pie con el mensaje de aviso', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /Tu entrenador inteligente/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '¿Cómo funciona FitAI Coach?' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '¿Por qué entrenar con FitAI Coach?' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no reemplazan la valoración de un profesional de la salud/)
    ).toBeInTheDocument();
  });

  it('navega al login desde el enlace del navbar', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    expect(screen.getByTestId('harness-screen').textContent).toBe('auth');
  });

  it('arranca el onboarding desde el navbar y desde el hero', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Comenzar Gratis' }));
    expect(screen.getByTestId('harness-screen').textContent).toBe('onboarding');

    fireEvent.click(screen.getByRole('button', { name: 'Crear Mi Rutina con IA' }));
    expect(screen.getByTestId('harness-screen').textContent).toBe('onboarding');
  });

  it('inicia la demo desde los accesos directos', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Demo Carlos' }));
    expect(screen.getByTestId('harness-is-auth').textContent).toBe('true');
    expect(screen.getByTestId('harness-user-name').textContent).toBe('Carlos Ramírez');

    fireEvent.click(screen.getByRole('button', { name: 'Explorar Prototipo (Carlos R.)' }));
    expect(screen.getByTestId('harness-screen').textContent).toBe('dashboard');
  });

  it('acepta el CTA final de onboarding y la demo final', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Comenzar Onboarding Gratis' }));
    expect(screen.getByTestId('harness-screen').textContent).toBe('onboarding');

    fireEvent.click(screen.getByRole('button', { name: 'Probar Prototipo con Datos Demo' }));
    expect(screen.getByTestId('harness-is-auth').textContent).toBe('true');
    expect(screen.getByTestId('harness-screen').textContent).toBe('dashboard');
  });
});
