import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ExerciseDatabaseView } from './ExerciseDatabaseView';
import { DatasetExercise } from '../types';
import { resetFavorites } from '../store/favoritesStore';

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
    categories: [
      { id: 'chest', label: 'Pecho' },
      { id: 'upper legs', label: 'Piernas (Cuádriceps e Isquios)' },
    ],
    equipment: [
      { id: 'barbell', label: 'Barra' },
      { id: 'dumbbell', label: 'Mancuernas' },
    ],
    targets: [
      { id: 'pectorals', label: 'Pectorales' },
      { id: 'quads', label: 'Cuádriceps' },
      { id: 'biceps', label: 'Bíceps' },
    ],
    translateCategory: (c: string) =>
      c === 'chest' ? 'Pecho' : c === 'upper legs' ? 'Piernas (Cuádriceps e Isquios)' : c,
    translateEquipment: (e: string) => (e === 'barbell' ? 'Barra' : e === 'dumbbell' ? 'Mancuernas' : e),
    translateTarget: (t: string) =>
      t === 'biceps' ? 'Bíceps' : t === 'pectorals' ? 'Pectorales' : t === 'quads' ? 'Cuádriceps' : t,
    searchExercises: (options: {
      query?: string;
      category?: string;
      equipment?: string;
      target?: string;
      sort?: 'name' | 'name-desc';
      limit?: number;
      offset?: number;
    }) => {
      const { query, category, equipment, target, sort, limit = 24, offset = 0 } = options;
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
      if (sort === 'name' || sort === 'name-desc') {
        const direction = sort === 'name' ? 1 : -1;
        results = [...results].sort((a, b) => a.name.localeCompare(b.name) * direction);
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
  getFilterOptionPreview: (
    kind: 'category' | 'equipment' | 'target',
    value: string,
    active?: { category?: string; equipment?: string; target?: string }
  ) => {
    const matching = exercises.filter((e) => {
      if (
        active?.category &&
        active.category !== 'all' &&
        kind !== 'category' &&
        !(e.category === active.category || e.body_part === active.category)
      ) {
        return false;
      }
      if (
        active?.equipment &&
        active.equipment !== 'all' &&
        kind !== 'equipment' &&
        e.equipment !== active.equipment
      ) {
        return false;
      }
      if (
        active?.target &&
        active.target !== 'all' &&
        kind !== 'target' &&
        e.target !== active.target
      ) {
        return false;
      }
      return String(e[kind]).toLowerCase() === value.toLowerCase();
    });
    return {
      imageUrl: matching.length > 0 ? '/mock.png' : '',
      count: matching.length,
    };
  },
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
    window.sessionStorage.clear();
    window.localStorage.clear();
    resetFavorites();
  });

  it('muestra el encabezado y el total de ejercicios', () => {
    renderView();

    expect(screen.getByText('Biblioteca de Ejercicios')).toBeInTheDocument();
    expect(screen.getAllByText('3 ejercicios').length).toBeGreaterThan(0);
  });

  it('expone el nombre accesible del buscador desktop', () => {
    renderView();
    expect(
      screen.getByRole('textbox', { name: 'Buscar por nombre, músculo o equipamiento' })
    ).toBeInTheDocument();
  });

  it('anuncia el conteo de resultados en el encabezado desktop', () => {
    renderView();

    const strongs = screen.getAllByText((content, el) => {
      if (el?.tagName !== 'STRONG' || !el.closest('span[aria-live="polite"]')) return false;
      return content === '3';
    });
    const counter = strongs[0].closest('span');
    expect(counter).not.toBeNull();
    expect(counter).toHaveAttribute('aria-live', 'polite');
    expect(counter).toHaveAttribute('aria-atomic', 'true');
  });

  it('ordena los resultados por nombre en desktop', () => {
    renderView();

    expect(screen.getAllByRole('heading', { level: 4 })[0]).toHaveTextContent('Bench Press');

    fireEvent.change(screen.getByLabelText('Ordenar resultados por'), {
      target: { value: 'name-desc' },
    });

    const headings = screen.getAllByRole('heading', { level: 4 });
    expect(headings[0]).toHaveTextContent('Squat');
    expect(headings[1]).toHaveTextContent('Dumbbell Curl');
    expect(headings[2]).toHaveTextContent('Bench Press');
  });

  it('marca con aria-pressed la opción seleccionada en las filas ilustradas', () => {
    renderView();

    const pecho = screen.getByRole('button', { name: 'Pecho' });
    expect(pecho).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Todos (3 ejercicios)' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    fireEvent.click(pecho);

    expect(screen.getByRole('button', { name: 'Pecho' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Todos (3 ejercicios)' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('desplaza a la vista el chip enfocado al navegar con flechas', () => {
    const original = Element.prototype.scrollIntoView;
    const spy = vi.fn(() => {});
    Element.prototype.scrollIntoView = spy as () => void;
    try {
      renderView();

      const barra = screen.getByRole('button', { name: 'Barra' });
      barra.focus();
      fireEvent.keyDown(barra, { key: 'ArrowRight' });

      expect(spy).toHaveBeenCalledWith({ inline: 'nearest', block: 'nearest' });
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it('navega con flechas entre las opciones de una fila ilustrada', () => {
    renderView();

    const barra = screen.getByRole('button', { name: 'Barra' });
    barra.focus();

    fireEvent.keyDown(barra, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'Mancuernas' })).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'Cualquier equipamiento (3 ejercicios)' })).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    expect(screen.getByRole('button', { name: 'Mancuernas' })).toHaveFocus();
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

  it('resalta el término buscado en el nombre de la tarjeta', async () => {
    renderView();

    const input = screen.getByPlaceholderText(/Buscar por nombre/);
    fireEvent.change(input, { target: { value: 'press' } });

    await waitFor(() => {
      const hl = screen.getByText('Press');
      expect(hl.className).toContain('text-[#C0FF00]');
    });
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

  it('hace visible el overlay de técnica con el foco de teclado', () => {
    renderView();

    const overlay = screen.getAllByRole('button', { name: /Ver Técnica/i })[0];
    expect(overlay.className).toContain('group-hover:opacity-100');
    expect(overlay.className).toContain('group-focus-within:opacity-100');
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
    expect(navigateTo).toHaveBeenCalledWith('routine');
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

  it('cruza los conteos de las filas de desktop con los filtros de otras dimensiones', () => {
    renderView();

    // Filtrar por categoría Pecho desde la fila ilustrada de desktop
    fireEvent.click(screen.getByRole('button', { name: 'Pecho' }));

    const barra = screen.getByRole('button', { name: 'Barra' });
    expect(within(barra).getByText('1 ejercicios')).toBeInTheDocument();

    const mancuernas = screen.getByRole('button', { name: 'Mancuernas' });
    expect(within(mancuernas).getByText('0 ejercicios')).toBeInTheDocument();

    // El chip "Todo" de equipamiento refleja la categoría activa (Pecho -> 1)
    const equipoTodo = screen.getByRole('button', { name: 'Cualquier equipamiento (1 ejercicios)' });
    expect(within(equipoTodo).getByText('1 ejercicios')).toBeInTheDocument();
  });

  it('quita el filtro de una sola dimensión desde su encabezado en desktop', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: 'Pecho' }));
    expect(screen.getByRole('button', { name: 'Borrar filtro Grupo Muscular / Región' })).toBeInTheDocument();

    // Al quitar la categoría, los conteos de equipamiento vuelven a las bases completas
    fireEvent.click(screen.getByRole('button', { name: 'Borrar filtro Grupo Muscular / Región' }));

    expect(
      screen.queryByRole('button', { name: 'Borrar filtro Grupo Muscular / Región' })
    ).not.toBeInTheDocument();
    const barra = screen.getByRole('button', { name: 'Barra' });
    expect(within(barra).getByText('2 ejercicios')).toBeInTheDocument();
  });

  it('mantiene los filtros entre montajes gracias a la sesión', () => {
    const view = renderView();

    fireEvent.click(screen.getByRole('button', { name: 'Pecho' }));
    const barra = screen.getByRole('button', { name: 'Barra' });
    expect(within(barra).getByText('1 ejercicios')).toBeInTheDocument();

    // Simula navegar a otra pantalla y volver: el estado local se pierde pero
    // la sesión rehidrata los filtros.
    view.unmount();
    renderView();

    const barra2 = screen.getByRole('button', { name: 'Barra' });
    expect(within(barra2).getByText('1 ejercicios')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Borrar filtro Grupo Muscular / Región' })).toBeInTheDocument();
  });

  it('mantiene el orden elegido entre montajes gracias a la sesión', () => {
    const view = renderView();

    fireEvent.change(screen.getByLabelText('Ordenar resultados por'), {
      target: { value: 'name-desc' },
    });
    expect(screen.getAllByRole('heading', { level: 4 })[0]).toHaveTextContent('Squat');

    view.unmount();
    renderView();

    expect(screen.getByLabelText('Ordenar resultados por')).toHaveValue('name-desc');
    expect(screen.getAllByRole('heading', { level: 4 })[0]).toHaveTextContent('Squat');
  });

  it('marca un ejercicio como favorito desde la tarjeta y lo persiste', () => {
    renderView();

    const star = screen.getAllByRole('button', { name: 'Añadir a favoritos' })[0];
    expect(star).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(star);

    expect(screen.getByRole('button', { name: 'Quitar de favoritos' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(window.localStorage.getItem('fitai.favoriteExercises')).toBe('["0001"]');
  });

  it('filtra la biblioteca a solo favoritos y muestra el contador', () => {
    renderView();

    fireEvent.click(screen.getAllByRole('button', { name: 'Añadir a favoritos' })[0]);
    const toggle = screen.getByRole('button', { name: /Favoritos/ });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(within(toggle).getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Curl')).not.toBeInTheDocument();
  });

  it('restaura la lista completa al desactivar el filtro de favoritos', () => {
    renderView();

    fireEvent.click(screen.getAllByRole('button', { name: 'Añadir a favoritos' })[0]);
    const toggle = screen.getByRole('button', { name: /Favoritos/ });
    fireEvent.click(toggle);
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText('Dumbbell Curl')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('ExerciseDatabaseView (variante móvil)', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    window.sessionStorage.clear();
    window.localStorage.clear();
    resetFavorites();
    mockMobileViewport();
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
    renderView();

    expect(screen.queryByText('Biblioteca de Ejercicios')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar ejercicio o músculo...')).toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Grupo Muscular / Región')).not.toBeInTheDocument();
  });

  it('expone el nombre accesible del buscador móvil', () => {
    renderView();
    expect(
      screen.getByRole('textbox', { name: 'Buscar ejercicio o músculo' })
    ).toBeInTheDocument();
  });

  it('ordena los resultados por nombre en móvil', () => {
    renderView();

    fireEvent.change(screen.getByLabelText('Ordenar resultados por'), {
      target: { value: 'name-desc' },
    });

    const rows = screen
      .getAllByRole('button')
      .filter((b) => /Cuádriceps|Pectorales|Bíceps/.test(b.textContent ?? ''));
    expect(rows[0]).toHaveTextContent('Squat');
    expect(rows[1]).toHaveTextContent('Dumbbell Curl');
    expect(rows[2]).toHaveTextContent('Bench Press');
  });

  it('resalta el término buscado en las filas móviles', async () => {
    renderView();

    const input = screen.getByPlaceholderText('Buscar ejercicio o músculo...');
    fireEvent.change(input, { target: { value: 'curl' } });

    await waitFor(() => {
      const hl = screen.getByText('Curl');
      expect(hl.className).toContain('text-[#C0FF00]');
    });
  });

  it('permite limpiar la búsqueda desde el chip sin volver al buscador', async () => {
    renderView();

    const input = screen.getByPlaceholderText('Buscar ejercicio o músculo...');
    fireEvent.change(input, { target: { value: 'curl' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Quitar filtro "curl"' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtro "curl"' }));

    expect(input).toHaveValue('');
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('abre la ficha del ejercicio al tocar una fila', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Squat/i }));
    expect(screen.getByText(/Flexiona las rodillas/)).toBeInTheDocument();
  });

  it('abre el sheet de filtros con tabs y lista las opciones de la categoría', () => {
    renderView();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('tab', { name: /Categoría/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('tab', { name: /Equipamiento/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('tab', { name: /Músculo/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Pecho' })).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Piernas (Cuádriceps e Isquios)' })
    ).toBeInTheDocument();
  });

  it('permite filtrar por equipamiento sin elegir categoría primero', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('tab', { name: /Equipamiento/i }));
    expect(within(dialog).getByRole('button', { name: 'Barra' })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Barra' }));
    fireEvent.click(within(dialog).getByRole('button', { name: /^Listo/ }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Curl')).not.toBeInTheDocument();
  });

  it('permite filtrar por músculo objetivo sin elegir categoría ni equipamiento', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('tab', { name: /Músculo/i }));
    expect(within(dialog).getByRole('button', { name: 'Bíceps' })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Bíceps' }));
    fireEvent.click(within(dialog).getByRole('button', { name: /^Listo/ }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Dumbbell Curl')).toBeInTheDocument();
    expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();
  });

  it('combina filtros de distintas dimensiones desde cualquier tab y los muestra en chips', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    // Categoría -> Pecho
    fireEvent.click(within(dialog).getByRole('button', { name: 'Pecho' }));
    // Salta al tab de equipamiento (sin drill-down) y elige Barra
    fireEvent.click(within(dialog).getByRole('tab', { name: /Equipamiento/i }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Barra' }));

    // Chips resumen con ambos filtros activos
    expect(within(dialog).getByRole('button', { name: 'Quitar filtro Pecho' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Quitar filtro Barra' })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /^Listo/ }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();
    expect(screen.queryByText('Dumbbell Curl')).not.toBeInTheDocument();
  });

  it('muestra los conteos reales de cada opción en la sheet', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getAllByText('1 ejercicios').length).toBeGreaterThanOrEqual(1);
    expect(within(dialog).getAllByText('3 ejercicios').length).toBeGreaterThanOrEqual(1);
  });

  it('recalcula los conteos de opciones según filtros activos de otras dimensiones', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    // Filtro de categoría: Pecho (solo Bench Press)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Pecho' }));

    // Al abrir el tab de equipamiento, los conteos se cruzan con la categoría activa
    fireEvent.click(within(dialog).getByRole('tab', { name: /Equipamiento/i }));

    const barra = within(dialog).getByRole('button', { name: 'Barra' });
    expect(within(barra).getByText('1 ejercicios')).toBeInTheDocument();

    const mancuernas = within(dialog).getByRole('button', { name: 'Mancuernas' });
    expect(within(mancuernas).getByText('0 ejercicios')).toBeInTheDocument();

    // "Cualquiera" muestra las bases de la categoría activa (Pecho -> 1)
    const cualquiera = within(dialog).getByRole('button', { name: 'Cualquiera' });
    expect(within(cualquiera).getByText('1 ejercicios')).toBeInTheDocument();
  });

  it('busca opciones dentro del tab activo del sheet', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('tab', { name: /Equipamiento/i }));
    expect(within(dialog).getByRole('button', { name: 'Barra' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Mancuernas' })).toBeInTheDocument();

    const input = within(dialog).getByPlaceholderText('Buscar en equipamiento...');
    fireEvent.change(input, { target: { value: 'man' } });

    expect(within(dialog).getByRole('button', { name: 'Mancuernas' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Barra' })).not.toBeInTheDocument();
  });

  it('marca con aria-pressed la opción seleccionada en el sheet', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    const pecho = within(dialog).getByRole('button', { name: 'Pecho' });
    expect(pecho).toHaveAttribute('aria-pressed', 'false');
    expect(within(dialog).getByRole('button', { name: 'Todos' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    fireEvent.click(pecho);

    expect(within(dialog).getByRole('button', { name: 'Pecho' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(dialog).getByRole('button', { name: 'Todos' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('resalta el término buscado dentro de las opciones del sheet', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('tab', { name: /Equipamiento/i }));
    fireEvent.change(within(dialog).getByPlaceholderText('Buscar en equipamiento...'), {
      target: { value: 'man' },
    });

    const option = within(dialog).getByRole('button', { name: 'Mancuernas' });
    const hl = within(option).getByText('Man');
    expect(hl.className).toContain('text-[#C0FF00]');
  });

  it('navega con flechas verticales entre las opciones del sheet', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    const pecho = within(dialog).getByRole('button', { name: 'Pecho' });
    pecho.focus();

    fireEvent.keyDown(pecho, { key: 'ArrowDown' });
    expect(
      within(dialog).getByRole('button', { name: 'Piernas (Cuádriceps e Isquios)' })
    ).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    expect(within(dialog).getByRole('button', { name: 'Todos' })).toHaveFocus();
  });

  it('descarta un filtro individual desde el chip resumen del sheet', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Pecho' }));
    expect(within(dialog).getByRole('button', { name: 'Quitar filtro Pecho' })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Quitar filtro Pecho' }));
    expect(
      within(dialog).queryByRole('button', { name: 'Quitar filtro Pecho' })
    ).not.toBeInTheDocument();

    // Se mantiene en el tab de categoría sin el filtro aplicado
    expect(within(dialog).getByRole('tab', { name: /Categoría/i })).toBeInTheDocument();
  });

  it('restablece todos los filtros desde la sheet', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Pecho' }));
    fireEvent.click(within(dialog).getByRole('button', { name: /Restablecer filtros/i }));

    expect(within(dialog).queryByRole('button', { name: 'Quitar filtro Pecho' })).not.toBeInTheDocument();
  });

  it('el chip resumen del encabezado permite quitar un filtro individual', () => {
    renderView();

    // Se selecciona categoría desde el sheet
    fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Pecho' })
    );
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^Listo/ }));

    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();

    // Se quita solo el filtro de categoría desde el chip del encabezado
    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtro Pecho' }));

    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText('Dumbbell Curl')).toBeInTheDocument();
  });

  it('mueve el foco al abrir el sheet y lo restaura con Escape', () => {
    renderView();

    const trigger = screen.getByRole('button', { name: /Filtros/i });
    trigger.focus();
    fireEvent.click(trigger);

    // El foco entra al diálogo al abrirse
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Escape cierra y restaura el foco al disparador
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});
