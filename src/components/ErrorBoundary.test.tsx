import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Good(): React.ReactElement {
  return <div>contenido ok</div>;
}

function Bad(): React.ReactElement {
  throw new Error('fallo simulado');
}

let shouldFail = true;

function Flaky(): React.ReactElement {
  if (shouldFail) throw new Error('fallo simulado');
  return <div>contenido ok</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldFail = true;
  });

  it('renderiza los hijos cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <Good />
      </ErrorBoundary>
    );
    expect(screen.getByText('contenido ok')).toBeInTheDocument();
  });

  it('muestra el estado de error cuando un hijo falla', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bad />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('se recupera al pulsar Reintentar cuando el hijo deja de fallar', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();

    shouldFail = false;
    fireEvent.click(screen.getByText('Reintentar'));

    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument();
    expect(screen.getByText('contenido ok')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('registra el error capturado en la consola del navegador', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bad />
      </ErrorBoundary>
    );

    expect(spy).toHaveBeenCalledWith('FitAI ErrorBoundary capturó un error:', expect.any(Error));
    spy.mockRestore();
  });

  it('vuelve a capturar el error si tras Reintentar el hijo continúa fallando', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bad />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Reintentar'));

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith('FitAI ErrorBoundary capturó un error:', expect.any(Error));
    spy.mockRestore();
  });
});
