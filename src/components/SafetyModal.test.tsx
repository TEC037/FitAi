import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SafetyModal } from './SafetyModal';

describe('SafetyModal', () => {
  it('no renderiza nada cuando está cerrado', () => {
    render(<SafetyModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('expone role dialog con aria-labelledby y el título correcto', () => {
    render(<SafetyModal isOpen onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'safety-modal-title');
    expect(screen.getByText('Consideraciones de Seguridad y Salud')).toHaveAttribute(
      'id',
      'safety-modal-title'
    );
  });

  it('muestra el aviso médico y las recomendaciones', () => {
    render(<SafetyModal isOpen onClose={() => {}} />);
    expect(screen.getByText('Aviso Médico Importante')).toBeInTheDocument();
    expect(
      screen.getByText(/No sustituye en ningún caso la evaluación o criterio de un médico/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Entendido y Acepto las Condiciones' })
    ).toBeInTheDocument();
  });

  it('cierra con el botón de aceptar las condiciones', () => {
    const onClose = vi.fn();
    render(<SafetyModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entendido y Acepto las Condiciones' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra con el botón X (aria-label) y con Escape', () => {
    const onClose = vi.fn();
    render(<SafetyModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar avisos de seguridad' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('enfoque al abrir: primer elemento enfocable (botón de cierre)', () => {
    render(<SafetyModal isOpen onClose={() => {}} />);
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Cerrar avisos de seguridad' })
    );
  });

  it('mantiene la trampa de foco en Tab y Shift+Tab', () => {
    render(<SafetyModal isOpen onClose={() => {}} />);
    const closeBtn = screen.getByRole('button', { name: 'Cerrar avisos de seguridad' });
    const acceptBtn = screen.getByRole('button', { name: 'Entendido y Acepto las Condiciones' });

    closeBtn.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(acceptBtn);

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);
  });
});
