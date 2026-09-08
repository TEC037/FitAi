import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { useEffect } from 'react';
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

/** Inicia sesión como demo una sola vez para llegar al Perfil autenticado. */
function LoginDemo({ children }: { children: React.ReactNode }) {
  const { loginDemoUser } = useApp();
  const booted = React.useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    void loginDemoUser();
  }, [loginDemoUser]);
  return <>{children}</>;
}

function AuthHarness({ onOpenSafetyModal = () => {} }: { onOpenSafetyModal?: () => void }) {
  const { isAuthenticated } = useApp();
  return (
    <>
      <ProfileView onOpenSafetyModal={onOpenSafetyModal} />
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

  it('cierra sesión desde el perfil', async () => {
    render(
      <AppProvider>
        <LoginDemo>
          <AuthHarness />
        </LoginDemo>
      </AppProvider>
    );

    await waitFor(() => expect(screen.getByTestId('harness-is-auth')).toHaveTextContent('true'));
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/ }));
    expect(screen.getByTestId('harness-is-auth')).toHaveTextContent('false');
  });
});

describe('ProfileView (variante móvil)', () => {
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

  it('muestra solo los datos clave y oculta los secciones avanzadas por defecto', () => {
    mockMobileViewport();
    render(
      <AppProvider>
        <ProfileView onOpenSafetyModal={() => {}} />
      </AppProvider>
    );

    expect(screen.getByText('Datos clave')).toBeInTheDocument();
    expect(screen.queryByText('Notificaciones y Sonidos')).not.toBeInTheDocument();
    expect(screen.queryByText('Datos Biométricos')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Carlos Ramírez' })).toBeInTheDocument();
  });

  it('despliega los ajustes avanzados al pulsar el toggle', () => {
    mockMobileViewport();
    render(
      <AppProvider>
        <ProfileView onOpenSafetyModal={() => {}} />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Ajustes avanzados/i }));
    expect(screen.getByText('Notificaciones y Sonidos')).toBeInTheDocument();
    expect(screen.getByText('Datos Biométricos')).toBeInTheDocument();
  });

  it('abre el modal médico y cierra sesión desde la vista móvil', async () => {
    const onOpenSafetyModal = vi.fn();
    mockMobileViewport();
    render(
      <AppProvider>
        <LoginDemo>
          <AuthHarness onOpenSafetyModal={onOpenSafetyModal} />
        </LoginDemo>
      </AppProvider>
    );

    await waitFor(() => expect(screen.getByTestId('harness-is-auth')).toHaveTextContent('true'));
    fireEvent.click(screen.getByRole('button', { name: /Avisos Médicos y Seguridad/ }));
    expect(onOpenSafetyModal).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/ }));
    expect(screen.getByTestId('harness-is-auth')).toHaveTextContent('false');
  });
});
