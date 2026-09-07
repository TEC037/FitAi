import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageLoader } from './PageLoader';

describe('PageLoader', () => {
  it('indica la carga del módulo', () => {
    render(<PageLoader />);

    expect(screen.getByText('Cargando módulo...')).toBeInTheDocument();
  });

  it('muestra la barra de progreso parcial animada', () => {
    const { container } = render(<PageLoader />);

    const fill = container.querySelector('div[style]') as HTMLElement | null;
    expect(fill?.style.width).toBe('40%');
    expect(fill?.className).toContain('animate-pulse');
  });

  it('renderiza el icono de pesa en su tarjeta', () => {
    const { container } = render(<PageLoader />);

    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });
});
