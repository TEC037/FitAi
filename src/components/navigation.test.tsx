import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoundNav } from './RoundNav';
import { TopBar } from './TopBar';

const { useApp, useGuidanceStep } = vi.hoisted(() => ({
  useApp: vi.fn(),
  useGuidanceStep: vi.fn(),
}));

vi.mock('../context/useApp', () => ({ useApp }));
vi.mock('../hooks/useGuidanceStep', () => ({ useGuidanceStep }));

const user = {
  id: 'u1',
  name: 'Carlos Ramírez',
  email: 'carlos@fitai.app',
  experience: 'intermedio',
  weight: 82,
  height: 178,
  birthYear: 1990,
  fitnessGoal: 'hipertrofia-y-tonificacion' as const,
  weeklyCompliance: 80,
  primaryGoal: 'Hipertrofia',
  unit: 'metric' as const,
};

function mockApp(overrides: Record<string, unknown> = {}) {
  const base: Record<string, unknown> = {
    isAuthenticated: true,
    user,
    currentScreen: 'routine',
    navigateTo: vi.fn(),
    isWorkoutActive: false,
    logout: vi.fn(() => Promise.resolve()),
    isHydrating: false,
  };
  useApp.mockReturnValue({ ...base, ...overrides });
}

function mockGuidance(step: string) {
  useGuidanceStep.mockReturnValue({
    step,
    message: 'Mensaje guía',
  });
}

function renderNav(props: Partial<React.ComponentProps<typeof RoundNav>> = {}) {
  const onClose = props.onClose ?? vi.fn();
  return {
    onClose,
    ...render(<RoundNav isOpen onClose={onClose} {...props} />),
  };
}

describe('RoundNav (navegación circular)', () => {
  beforeEach(() => {
    mockApp();
    mockGuidance('routine');
  });

  it('no renderiza nada cuando está cerrado', () => {
    mockApp();
    render(<RoundNav isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navega a Rutina al pulsar el ítem radial', () => {
    const { onClose } = renderNav();
    fireEvent.click(screen.getByRole('button', { name: 'Rutina' }));
    expect(useApp().navigateTo).toHaveBeenCalledWith('routine');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navega a Biblioteca y Perfil', () => {
    renderNav();
    fireEvent.click(screen.getByRole('button', { name: 'Biblioteca' }));
    expect(useApp().navigateTo).toHaveBeenCalledWith('exercises');
    fireEvent.click(screen.getByRole('button', { name: 'Perfil' }));
    expect(useApp().navigateTo).toHaveBeenCalledWith('profile');
  });

  it('muestra el mensaje de guía del paso actual', () => {
    mockGuidance('exercises');
    renderNav();
    expect(screen.getByText('Mensaje guía')).toBeInTheDocument();
  });

  it('marca con pulse dorado el ítem guiado', () => {
    mockGuidance('profile');
    renderNav();
    const item = document.getElementById('roundnav-profile');
    expect(item?.className).toContain('z-10');
    expect(item?.querySelector('span')?.className).toContain('animate-gold-pulse');
  });

  it('el botón central navega a rutina cuando hay un entrenamiento activo', () => {
    mockApp({ isWorkoutActive: true });
    const { onClose } = renderNav();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));
    expect(useApp().navigateTo).toHaveBeenCalledWith('routine');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('abre un modal centrado al pulsar Cerrar Sesión', () => {
    renderNav();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/ }));
    expect(screen.getByRole('dialog', { name: /Cerrar sesión/ })).toBeInTheDocument();
  });

  it('confirma el logout desde el modal y cierra el menú', () => {
    const { onClose } = renderNav();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/ }));
    fireEvent.click(screen.getByRole('button', { name: /Sí, cerrar sesión/ }));
    expect(useApp().logout).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cancelar cierra el modal sin cerrar la sesión', () => {
    const { onClose } = renderNav();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(useApp().logout).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: /Cerrar sesión/ })).not.toBeInTheDocument();
  });
});

describe('TopBar (barra superior)', () => {
  beforeEach(() => {
    mockApp();
  });

  it('muestra el nombre del usuario autenticado y el avatar', () => {
    render(<TopBar onOpenNav={() => {}} />);
    expect(screen.getByText('Carlos Ramírez')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir menú de navegación' })).toBeInTheDocument();
  });

  it('sin sesión muestra "Iniciar Sesión" y el botón demo', () => {
    mockApp({ isAuthenticated: false, loginDemoUser: vi.fn(), navigateTo: vi.fn() });
    render(<TopBar onOpenNav={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    expect(useApp().navigateTo).toHaveBeenCalledWith('auth');
    expect(screen.getByRole('button', { name: 'Probar la demo' })).toBeInTheDocument();
  });

  it('abre la navegación al pulsar el avatar', () => {
    const onOpenNav = vi.fn();
    render(<TopBar onOpenNav={onOpenNav} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    expect(onOpenNav).toHaveBeenCalledTimes(1);
  });
});