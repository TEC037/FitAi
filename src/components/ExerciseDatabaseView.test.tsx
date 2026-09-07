import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExerciseDatabaseView } from './ExerciseDatabaseView';
import { DatasetExercise } from '../types';

const { useApp } = vi.hoisted(() => ({ useApp: vi.fn() }));

const {
  repository,
  categories,
  equipment,
  targets,
  translateCategory,
  translateEquipment,
  translateTarget,
  searchExercises,
  exercises,
} = vi.hoisted(() => {
  const items: DatasetExercise[] = [
    {
      id: '0001',
      name: 'Bench Press',
      category: 'chest',
      body_part: 'chest',
      equipment: 'barbell',
      target: 'pectorals',
      secondary_muscles: ['triceps'],
      steps_es: ['Empuja la barra hacia arriba.'],
      steps_en: ['Push the bar up.'],
      image: '/0001.png',
      gif_url: '/0001.gif',
    },
    {
      id: '0002',
      name: 'Squat',
      category: 'upper legs',
      body_part: 'upper legs',
      equipment: 'barbell',
      target: 'quads',
      secondary_muscles: ['glutes'],
      steps_es: ['Flexiona las rodillas.'],
      steps_en: ['Bend your knees.'],
      image: '/0002.png',
      gif_url: '/0002.gif',
    },
    {
      id: '0003',
      name: 'Dumbbell Curl',
      category: 'upper arms',
      body_part: 'upper arms',
      equipment: 'dumbbell',
      target: 'biceps',
      secondary_muscles: ['forearms'],
      steps_es: ['Sube la mancuerna.'],
      steps_en: ['Curl the dumbbell.'],
      image: '/0003.png',
      gif_url: '/0003.gif',
    },
  ];

  return {
    exercises: items,
    repository: 'https://github.com/hasaneyldrm/exercises-dataset',
    categories: [{ id: 'chest', label: 'Pecho' }],
    equipment: [{ id: 'barbell', label: 'Barra' }],
    targets: [{ id: 'biceps', label: 'Bíceps' }],
    translateCategory: (c: string) => (c === 'chest' ? 'Pecho' : c),
    translateEquipment: (e: string) => (e === 'barbell' ? 'Barra' : e),
    translateTarget: (t: string) => (t === 'biceps' ? 'Bíceps' : t),
    searchExercises: (options: {
      query?: string;
      category?: string;
      equipment?: string;
      target?: string;
      limit?: number;
      offset?: number;
    }) => {
      const { query, category, equipment, target, limit = 24, offset = 0 } = options;
      let results = exercises;
      if (category && category !== 'all') {
        results = results.filter((e) => e.category === category || e.body_part === category);
      }
      if (equipment && equipment !== 'all') {
        results = results.filter((e) => e.equipment === equipment);
      }
      if (target && target !== 'all') {
        results = results.filter((e) => e.target === target);
      }
      if (query && query.trim()) {
        const q = query.toLowerCase().trim();
        results = results.filter((e) => {
          const translates = [
            e.name,
            e.category,
            e.equipment,
            e.target,
            ...(e.secondary_muscles || []),
          ];
          return translates.some((s) => s.toLowerCase().includes(q));
        });
      }
      return { items: results.slice(offset, offset + limit), total: results.length };
    },
  };
});

vi.mock('../services/exerciseDatabaseService', async () => ({
  DATASET_GITHUB_REPO: repository,
  EXERCISE_DATABASE: exercises,
  loadExerciseDatabase: vi.fn(),
  getAvailableCategories: () => categories,
  getAvailableEquipment: () => equipment,
  getAvailableTargets: () => targets,
  translateCategory,
  translateEquipment,
  translateTarget,
  searchExercises,
  getExerciseImageUrl: () => '/mock.png',
  getExerciseGifUrl: () => '/mock.gif',
  datasetToRoutineExercise: (item: DatasetExercise) => ({
    id: `custom_${item.id}`,
    name: item.name,
    primaryMuscle: translateCategory(item.category),
    sets: 3,
    reps: '10-12',
    suggestedWeightKg: 20,
    restSeconds: 60,
    rpe: 8,
    targetMuscles: [translateTarget(item.target)],
    technicalCue: item.steps_es[0],
    equipment: translateEquipment(item.equipment),
    difficulty: 'intermedio',
    iconType: 'barbell' as const,
  }),
}));

vi.mock('../context/useApp', () => ({
  useApp,
}));

function renderView(props: Partial<React.ComponentProps<typeof ExerciseDatabaseView>> = {}) {
  useApp.mockReturnValue({
    routines: [
      { dayNumber: 1, focus: 'Pecho' },
      { dayNumber: 2, focus: 'Espalda' },
    ],
    addExerciseToRoutine: vi.fn(),
    sendCoachMessage: vi.fn(),
    navigateTo: vi.fn(),
  });
  return render(<ExerciseDatabaseView {...props} />);
}

describe('ExerciseDatabaseView (DOM)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it('muestra el encabezado y el total de ejercicios', () => {
    renderView();

    expect(screen.getByText('Biblioteca de Ejercicios')).toBeInTheDocument();
    expect(screen.getByText('3 ejercicios')).toBeInTheDocument();
  });

  it('filtra por término de búsqueda', async () => {
    renderView();

    const input = screen.getByPlaceholderText(/Buscar por nombre/);
    fireEvent.change(input, { target: { value: 'squat' } });

    await waitFor(() => {
      expect(screen.queryByText(/^Bench Press$/i)).not.toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
    });
    expect(screen.getByText(/squat/i)).toBeInTheDocument();
  });

  it('muestra el mensaje de "sin resultados" y permite restablecer', async () => {
    renderView();

    const input = screen.getByPlaceholderText(/Buscar por nombre/);
    fireEvent.change(input, { target: { value: 'zzz-no-existe' } });

    await waitFor(() => {
      expect(screen.getByText('No se encontraron ejercicios')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Ver Todos los 3 Ejercicios/i }));

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });
  });

  it('agrega un ejercicio a la rutina del día seleccionado', () => {
    const onSelectForRoutine = vi.fn();
    renderView({ onSelectForRoutine });

    fireEvent.click(screen.getAllByTitle('Añadir a un día de mi rutina')[0]);
    fireEvent.click(screen.getByText('Día 1'));

    expect(onSelectForRoutine).toHaveBeenCalledTimes(1);
    expect(onSelectForRoutine).toHaveBeenCalledWith(exercises[0], 1);
  });

  it('abre el modal de técnica detallada', () => {
    renderView();

    fireEvent.click(screen.getAllByText('Detalles')[1]);

    expect(screen.getByText(/Flexiona las rodillas/)).toBeInTheDocument();
  });

  it('filtra por grupo muscular desde el chip de categoría', async () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: 'Pecho' }));

    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.queryByText('Squat')).not.toBeInTheDocument();
      expect(screen.queryByText('Dumbbell Curl')).not.toBeInTheDocument();
    });
  });

  it('consulta al coach desde el modal de detalle', () => {
    renderView();
    const { navigateTo, sendCoachMessage } = useApp();

    fireEvent.click(screen.getAllByText('Detalles')[1]);
    fireEvent.click(screen.getByRole('button', { name: /Consultar Dudas con Coach IA/i }));

    expect(sendCoachMessage).toHaveBeenCalledTimes(1);
    expect(sendCoachMessage).toHaveBeenCalledWith(expect.stringContaining('Squat'));
    expect(navigateTo).toHaveBeenCalledWith('coach');
  });

  it('agrega la rutina desde el modal sin callback externo', () => {
    renderView();
    const { addExerciseToRoutine } = useApp();

    fireEvent.click(screen.getAllByText('Detalles')[1]);
    fireEvent.click(screen.getByRole('button', { name: /Añadir a mi Rutina/i }));

    expect(addExerciseToRoutine).toHaveBeenCalledTimes(1);
    expect(addExerciseToRoutine).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Squat' })
    );
  });
});

describe('ExerciseDatabaseView (variante móvil)', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
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

  it('muestra solo buscador y lista sencilla, sin filtros densos', () => {
    mockMobileViewport();
    renderView();

    expect(screen.queryByText('Biblioteca de Ejercicios')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar ejercicio o músculo...')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Grupo Muscular / Región')).not.toBeInTheDocument();
  });

  it('abre la ficha del ejercicio al tocar una fila', () => {
    mockMobileViewport();
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Squat/i }));
    expect(screen.getByText(/Flexiona las rodillas/)).toBeInTheDocument();
  });
});
