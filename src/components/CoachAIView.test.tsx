import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useApp } from '../context/useApp';
import { FREQUENT_COACH_QUESTIONS } from '../data/mockCoach';
import { CoachAIView } from './CoachAIView';

const { serverlessCoachReply } = vi.hoisted(() => ({ serverlessCoachReply: vi.fn() }));

vi.mock('../lib/serverlessCoach', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/serverlessCoach')>();
  return { ...actual, fetchServerlessCoachReply: serverlessCoachReply };
});

function CoachHarness() {
  const { currentScreen } = useApp();
  return (
    <>
      <CoachAIView />
      <span data-testid="harness-screen">{currentScreen}</span>
    </>
  );
}

function renderCoach() {
  return render(
    <AppProvider>
      <CoachAIView />
    </AppProvider>
  );
}

function renderCoachHarness() {
  return render(
    <AppProvider>
      <CoachHarness />
    </AppProvider>
  );
}

async function sendQuestion(question: string) {
  fireEvent.change(screen.getByPlaceholderText(/Escribe tu consulta/), {
    target: { value: question },
  });
  fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
  expect(await screen.findByText(question)).toBeInTheDocument();
}

describe('CoachAIView', () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = () => {};
    serverlessCoachReply.mockResolvedValue(null);
  });

  it('muestra el header del coach y las preguntas rápidas frecuentes', () => {
    renderCoach();

    expect(screen.getByText('FitAI Coach')).toBeInTheDocument();
    expect(screen.getByText('Preguntas Rápidas Frecuentes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escribe tu consulta/)).toBeInTheDocument();
  });

  it('envía un mensaje y recibe respuesta del motor local', async () => {
    renderCoach();

    await sendQuestion('¿Cómo mejoro mi sentadilla?');
    expect(screen.getByText('FitAI Coach analizando tu progreso...')).toBeInTheDocument();

    await waitForElementToBeRemoved(
      () => screen.queryByText('FitAI Coach analizando tu progreso...'),
      { timeout: 3000 }
    );
  });

  it('marca la respuesta local con el badge "mot. local"', async () => {
    renderCoach();

    await sendQuestion('¿Cómo mejoro mi sentadilla?');
    await waitForElementToBeRemoved(
      () => screen.queryByText('FitAI Coach analizando tu progreso...'),
      { timeout: 3000 }
    );

    expect(await screen.findByText('mot. local', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('muestra el badge "LLM" cuando la respuesta llega del LLM', async () => {
    serverlessCoachReply.mockResolvedValue({
      answer: 'Respuesta generada por el modelo de lenguaje.',
      source: 'llm',
    });
    renderCoach();

    await sendQuestion('Dame una rutina de espalda');
    expect(
      await screen.findByText(
        'Respuesta generada por el modelo de lenguaje.',
        {},
        { timeout: 3000 }
      )
    ).toBeInTheDocument();
    expect(await screen.findByText('LLM', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('muestra el badge "servidor" cuando responde el motor del servidor', async () => {
    serverlessCoachReply.mockResolvedValue({
      answer: 'Consejo servido por el motor desplazado en servidor.',
      source: 'engine',
    });
    renderCoach();

    await sendQuestion('Consejo para el press de banca');
    expect(
      await screen.findByText(
        'Consejo servido por el motor desplazado en servidor.',
        {},
        { timeout: 3000 }
      )
    ).toBeInTheDocument();
    expect(await screen.findByText('servidor', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('envía una pregunta rápida al pulsar su chip', async () => {
    const question = FREQUENT_COACH_QUESTIONS[0];
    renderCoach();

    fireEvent.click(screen.getByRole('button', { name: question }));
    expect(await screen.findAllByText(question)).toHaveLength(2);
  });

  it('no habilita el envío con el campo vacío', () => {
    renderCoach();

    const sendButton = screen.getByRole('button', { name: /enviar/i });
    expect(sendButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/Escribe tu consulta/), {
      target: { value: '¿Cómo caliento?' },
    });
    expect(sendButton).not.toBeDisabled();
  });

  it('navega a la rutina desde la acción sugerida del mensaje inicial', () => {
    renderCoachHarness();

    fireEvent.click(screen.getByRole('button', { name: /ver rutina de hoy/i }));
    expect(screen.getByTestId('harness-screen')).toHaveTextContent('routine');
  });
});

describe('CoachAIView (variante móvil)', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = () => {};
    serverlessCoachReply.mockResolvedValue(null);
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

  it('oculta la descripción del usuario y el label de preguntas en móvil', () => {
    mockMobileViewport();
    renderCoach();

    expect(screen.getByText('FitAI Coach')).toBeInTheDocument();
    expect(screen.queryByText(/Asistente de entrenamiento personal/)).not.toBeInTheDocument();
    expect(screen.queryByText('Preguntas Rápidas Frecuentes')).not.toBeInTheDocument();
    expect(FREQUENT_COACH_QUESTIONS[0]).toBeTruthy();
    expect(screen.getByPlaceholderText(/Escribe tu consulta/)).toBeInTheDocument();
  });
});
