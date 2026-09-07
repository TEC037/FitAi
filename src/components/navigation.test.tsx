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
const startWorkout = vi.fn();

function mockApp(overrides: Partial<Record<string, unknown>> = {}) {
  useApp.mockReturnValue({
    currentScreen: 'dashboard',
    navigateTo,
    logout,
    isWorkoutActive: false,
    user: { name: 'Carlos Test', experience: 'intermedio' },
    routines: [],
    startWorkout,
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
  });

  it('acerca absolutamente todo desde el único botón central', () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getAllByRole('button')).toHaveLength(9);
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
    fireEvent.click(screen.getByText('Biblioteca'));
    expect(navigateTo).toHaveBeenCalledWith('exercises');
    expect(screen.queryByText('Biblioteca')).not.toBeInTheDocument();
  });

  it('Entrenar abre las sub-selecciones de los días y arranca la sesión', () => {
    mockApp({
      routines: [
        { dayNumber: 1, focus: 'Empuje' },
        { dayNumber: 2, focus: 'Tirón' },
      ],
    });
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.queryByText('Empuje')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Entrenar' }));
    expect(screen.getByText('Empuje')).toBeInTheDocument();
    expect(screen.getByText('Tirón')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Empuje' }));
    expect(startWorkout).toHaveBeenCalledWith(1);
    expect(screen.queryByText('Empuje')).not.toBeInTheDocument();
  });

  it('alterna las sub-selecciones al tocar Entrenar de nuevo', () => {
    mockApp({ routines: [{ dayNumber: 1, focus: 'Empuje' }] });
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const entrenar = screen.getByRole('button', { name: 'Entrenar' });
    fireEvent.click(entrenar);
    expect(screen.getByText('Empuje')).toBeInTheDocument();

    fireEvent.click(entrenar);
    expect(screen.queryByText('Empuje')).not.toBeInTheDocument();
  });

  it('Entrenar navega directo cuando aún no hay días de rutina', () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByRole('button', { name: 'Entrenar' }));
    expect(navigateTo).toHaveBeenCalledWith('workout');
  });

  it('marca con aria-current el enlace activo', () => {
    mockApp({ currentScreen: 'exercises' });
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByText('Biblioteca').closest('button')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('cambia la etiqueta a "En vivo" durante una sesión activa', () => {
    mockApp({ isWorkoutActive: true });
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByText('En vivo')).toBeInTheDocument();
  });

  it('navega a Biblioteca desde el menú', () => {
    render(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByText('Biblioteca'));
    expect(navigateTo).toHaveBeenCalledWith('exercises');
  });
});
