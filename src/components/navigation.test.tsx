import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarNav } from './SidebarNav';
import { MobileNav } from './MobileNav';

const { useApp } = vi.hoisted(() => ({ useApp: vi.fn() }));

vi.mock('../context/useApp', () => ({
  useApp,
}));

const navigateTo = vi.fn();
const logout = vi.fn();

function mockApp(overrides: Partial<Record<string, unknown>> = {}) {
  useApp.mockReturnValue({
    currentScreen: 'dashboard',
    navigateTo,
    logout,
    isWorkoutActive: false,
    user: { name: 'Carlos Test', experience: 'intermedio' },
    ...overrides,
  });
}

describe('SidebarNav (navegación)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApp();
  });

  it('muestra las secciones principales', () => {
    render(<SidebarNav onOpenSafetyModal={() => {}} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Mi Rutina')).toBeInTheDocument();
    expect(screen.getByText('Biblioteca')).toBeInTheDocument();
    expect(screen.getByText('Entrenamiento')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
    expect(screen.getByText('Coach IA')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('navega al hacer clic en un enlace', () => {
    render(<SidebarNav onOpenSafetyModal={() => {}} />);

    fireEvent.click(screen.getByText('Mi Rutina'));
    expect(navigateTo).toHaveBeenCalledWith('routine');

    fireEvent.click(screen.getByText('Coach IA'));
    expect(navigateTo).toHaveBeenCalledWith('coach');
  });

  it('marca con aria-current el enlace activo', () => {
    mockApp({ currentScreen: 'progress' });
    render(<SidebarNav onOpenSafetyModal={() => {}} />);

    const active = screen.getByText('Progreso').closest('button');
    expect(active).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Dashboard').closest('button')).not.toHaveAttribute('aria-current');
  });

  it('muestra el badge EN VIVO durante una sesión activa', () => {
    mockApp({ isWorkoutActive: true });
    render(<SidebarNav onOpenSafetyModal={() => {}} />);

    expect(screen.getByText('EN VIVO')).toBeInTheDocument();
  });

  it('cierra sesión y abre el modal de seguridad', () => {
    const onOpenSafetyModal = vi.fn();
    render(<SidebarNav onOpenSafetyModal={onOpenSafetyModal} />);

    fireEvent.click(screen.getByText('Cerrar Sesión'));
    expect(logout).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Avisos Médicos y Seguridad'));
    expect(onOpenSafetyModal).toHaveBeenCalledTimes(1);
  });

  it('navega al dashboard al hacer clic en el logo', () => {
    render(<SidebarNav onOpenSafetyModal={() => {}} />);

    fireEvent.click(screen.getByText('FitAI'));
    expect(navigateTo).toHaveBeenCalledWith('dashboard');
  });

  it('muestra los badges de Biblioteca y Coach IA', () => {
    render(<SidebarNav onOpenSafetyModal={() => {}} />);

    expect(screen.getByText('1.3k')).toBeInTheDocument();
    expect(screen.getByText('IA')).toBeInTheDocument();
  });

  it('muestra el nombre y nivel del usuario en la tarjeta', () => {
    render(<SidebarNav onOpenSafetyModal={() => {}} />);

    expect(screen.getByText('Carlos Test')).toBeInTheDocument();
    expect(screen.getByText('Nivel intermedio')).toBeInTheDocument();
  });

  it('navega al perfil al hacer clic en la tarjeta de usuario', () => {
    render(<SidebarNav onOpenSafetyModal={() => {}} />);

    fireEvent.click(screen.getByText('Carlos Test'));
    expect(navigateTo).toHaveBeenCalledWith('profile');
  });
});

describe('MobileNav (navegación con 1 botón)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApp();
  });

  it('renderiza un único botón flotante y las secciones al abrirlo', () => {
    render(<MobileNav />);

    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument();
    expect(screen.queryByText('Inicio')).not.toBeInTheDocument();
    expect(screen.queryByText('Entrenar')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Rutina')).toBeInTheDocument();
    expect(screen.getByText('Entrenar')).toBeInTheDocument();
    expect(screen.getByText('Biblioteca')).toBeInTheDocument();
    expect(screen.getByText('Progreso')).toBeInTheDocument();
    expect(screen.getByText('Coach IA')).toBeInTheDocument();
    expect(screen.getByText('Historial')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('navega al hacer clic en un enlace y cierra el menú', () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByText('Rutina'));
    expect(navigateTo).toHaveBeenCalledWith('routine');

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByText('Coach IA'));
    expect(navigateTo).toHaveBeenCalledWith('coach');
    expect(screen.queryByText('Coach IA')).not.toBeInTheDocument();
  });

  it('marca con aria-current el enlace activo', () => {
    mockApp({ currentScreen: 'coach' });
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByText('Coach IA').closest('button')).toHaveAttribute('aria-current', 'page');
  });

  it('cambia la etiqueta a "En vivo" durante una sesión activa', () => {
    mockApp({ isWorkoutActive: true });
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByText('En vivo')).toBeInTheDocument();
  });

  it('el botón flotante navega a Entrenar como acción principal del menú', () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByText('Entrenar').closest('button')!);
    expect(navigateTo).toHaveBeenCalledWith('workout');
  });

  it('navega al perfil al hacer clic en Perfil', () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByText('Perfil'));
    expect(navigateTo).toHaveBeenCalledWith('profile');
  });
});
