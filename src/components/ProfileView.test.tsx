import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useApp } from '../context/useApp';
import { STORAGE_KEYS } from '../config/constants';
import { UserProfile } from '../types';
import { ProfileView } from './ProfileView';

function readUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function AuthHarness() {
  const { isAuthenticated } = useApp();
  return (
    <>
      <ProfileView onOpenSafetyModal={() => {}} />
      <span data-testid="harness-is-auth">{String(isAuthenticated)}</span>
    </>
  );
}

describe('ProfileView', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
  });

  it('renderiza las secciones del perfil con los datos demo', () => {
    const onOpenSafetyModal = vi.fn();
    render(
      <AppProvider>
        <ProfileView onOpenSafetyModal={onOpenSafetyModal} />
      </AppProvider>
    );

    expect(screen.getByText('Perfil y Preferencias')).toBeInTheDocument();
    expect(screen.getByText('Datos Biométricos')).toBeInTheDocument();
    expect(screen.getByText('Objetivos y Programación')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones y Sonidos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Carlos Ramírez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('carlos.ramirez@fitai.example')).toBeInTheDocument();
  });

  it('guarda un cambio de nombre en localStorage y muestra el mensaje de éxito', async () => {
    render(
      <AppProvider>
        <ProfileView onOpenSafetyModal={() => {}} />
      </AppProvider>
    );

    fireEvent.change(screen.getByDisplayValue('Carlos Ramírez'), {
      target: { value: 'Ana Pérez' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios de Perfil/ }));

    expect(screen.getByText('¡Cambios guardados con éxito!')).toBeInTheDocument();

    await waitFor(() => {
      expect(readUser()?.name).toBe('Ana Pérez');
    });
  });

  it('persiste la desactivación de un recordatorio al guardar', async () => {
    render(
      <AppProvider>
        <ProfileView onOpenSafetyModal={() => {}} />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Consejos y adaptaciones del Coach IA' }));
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios de Perfil/ }));

    await waitFor(() => {
      expect(readUser()?.notifications.coachTips).toBe(false);
    });
  });

  it('abre el modal médico desde el banner de aviso', () => {
    const onOpenSafetyModal = vi.fn();
    render(
      <AppProvider>
        <ProfileView onOpenSafetyModal={onOpenSafetyModal} />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ver Normas Médicas' }));
    expect(onOpenSafetyModal).toHaveBeenCalledTimes(1);
  });

  it('restablece los datos demo al pulsar el botón de reset', async () => {
    render(
      <AppProvider>
        <ProfileView onOpenSafetyModal={() => {}} />
      </AppProvider>
    );

    fireEvent.change(screen.getByDisplayValue('Carlos Ramírez'), {
      target: { value: 'Ana Pérez' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios de Perfil/ }));
    await waitFor(() => expect(readUser()?.name).toBe('Ana Pérez'));

    fireEvent.click(screen.getByRole('button', { name: /Restablecer Datos Demo/ }));

    await waitFor(() => {
      expect(readUser()?.name).toBe('Carlos Ramírez');
    });
  });

  it('cambia el sistema de unidades a imperial y persiste al guardar', async () => {
    render(
      <AppProvider>
        <ProfileView onOpenSafetyModal={() => {}} />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Imperial \(lbs \/ in\)/ }));
    expect(screen.getByText('Estatura (in)')).toBeInTheDocument();
    expect(screen.getByText('Peso Actual (lbs)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios de Perfil/ }));

    await waitFor(() => {
      expect(readUser()?.unitSystem).toBe('imperial');
    });
  });

  it('guarda un nuevo peso biométrico', async () => {
    render(
      <AppProvider>
        <ProfileView onOpenSafetyModal={() => {}} />
      </AppProvider>
    );

    fireEvent.change(screen.getByDisplayValue('78.2'), {
      target: { value: '80' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios de Perfil/ }));

    await waitFor(() => {
      expect(readUser()?.weight).toBe(80);
    });
  });

  it('cierra sesión desde el perfil', () => {
    render(
      <AppProvider>
        <AuthHarness />
      </AppProvider>
    );

    expect(screen.getByTestId('harness-is-auth')).toHaveTextContent('true');
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/ }));
    expect(screen.getByTestId('harness-is-auth')).toHaveTextContent('false');
  });
});
