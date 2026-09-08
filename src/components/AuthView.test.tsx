import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useApp } from '../context/useApp';
import { AuthView } from './AuthView';

function Harness() {
  const { isAuthenticated, user, currentScreen } = useApp();
  return (
    <>
      <AuthView />
      <span data-testid="harness-is-auth">{String(isAuthenticated)}</span>
      <span data-testid="harness-user-name">{user?.name ?? ''}</span>
      <span data-testid="harness-screen">{currentScreen}</span>
    </>
  );
}

describe('AuthView', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
  });

  it('renderiza el formulario de inicio de sesión por defecto', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    expect(screen.getByText('FitAI Coach')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Iniciar Sesión' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Crear Cuenta' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Acceder con Carlos Ramírez \(Usuario Demo\)/ })
    ).toBeInTheDocument();
  });

  it('valida los campos requeridos en el inicio de sesión', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Iniciar Sesión' })[1]);

    expect(screen.getByText('Por favor ingresa tu correo y contraseña.')).toBeInTheDocument();
  });

  it('inicia sesión con credenciales y resuelve como usuario demo', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('carlos.ramirez@ejemplo.com'), {
      target: { value: 'carlos@fitai.example' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Iniciar Sesión' })[1]);

    expect(screen.getByTestId('harness-is-auth').textContent).toBe('true');
    expect(screen.getByTestId('harness-user-name').textContent).toBe('Carlos Ramírez');
  });

  it('inicia sesión con el acceso rápido del usuario demo', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Acceder con Carlos Ramírez \(Usuario Demo\)/ })
    );

    expect(screen.getByTestId('harness-is-auth').textContent).toBe('true');
    expect(screen.getByTestId('harness-user-name').textContent).toBe('Carlos Ramírez');
  });

  it('valida contraseña corta y registra un usuario válido', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Crear Cuenta' }));
    fireEvent.change(screen.getByPlaceholderText('Tu nombre y apellido'), {
      target: { value: 'Lucía Gómez' },
    });
    fireEvent.change(screen.getByPlaceholderText('tu.correo@ejemplo.com'), {
      target: { value: 'lucia@fitai.example' },
    });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), {
      target: { value: 'abc' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar al Onboarding/ }));

    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), {
      target: { value: 'Lucia.2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar al Onboarding/ }));

    expect(
      screen.queryByText('La contraseña debe contener al menos 6 caracteres.')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('harness-user-name').textContent).toBe('Lucía Gómez');
  });

  it('recupera la contraseña y muestra el enlace simulado enviado', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));
    fireEvent.click(screen.getByRole('button', { name: /Enviar Enlace de Recuperación/ }));

    expect(
      screen.getByText('Por favor ingresa tu correo electrónico registrado.')
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('tu.correo@ejemplo.com'), {
      target: { value: 'lucia@fitai.example' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar Enlace de Recuperación/ }));

    expect(screen.getByText('¡Enlace simulado enviado!')).toBeInTheDocument();
    expect(screen.getByText('lucia@fitai.example')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver al inicio de sesión' })).toBeInTheDocument();
  });

  it('alterna entre las pestañas de inicio de sesión y registro', () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    const registerTab = screen.getByRole('button', { name: 'Crear Cuenta' });
    fireEvent.click(registerTab);
    expect(registerTab.className).toContain('bg-[#C0FF00]');
    expect(screen.getByPlaceholderText('Tu nombre y apellido')).toBeInTheDocument();

    const loginTab = screen.getAllByRole('button', { name: 'Iniciar Sesión' })[0];
    fireEvent.click(loginTab);
    expect(loginTab.className).toContain('bg-[#C0FF00]');
    expect(registerTab.className).not.toContain('bg-[#C0FF00]');
    expect(screen.getByPlaceholderText('carlos.ramirez@ejemplo.com')).toBeInTheDocument();
  });
});
