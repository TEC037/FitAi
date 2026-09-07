import { DatasetExercise, Exercise } from '../types';
export const DATASET_GITHUB_REPO = 'https://github.com/hasaneyldrm/exercises-dataset';
export const DATASET_CDN_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/';
export const DATASET_RAW_BASE =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

export let EXERCISE_DATABASE: DatasetExercise[] = [];

export const setExerciseDatabase = (data: DatasetExercise[]) => {
  EXERCISE_DATABASE = data;
};

/**
 * Carga el dataset local `exercisesDatabase.json` (bundled en `public/`) y lo
 * activa en memoria. Resuelve con base relativa a `import.meta.env.BASE_URL`
 * para que funcione también desplegado en GitHub Pages bajo un subpath.
 */
export async function loadExerciseDatabase(): Promise<DatasetExercise[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}exercisesDatabase.json`);
  if (!res.ok) {
    throw new Error(`No se pudo cargar el dataset (HTTP ${res.status})`);
  }
  const data = (await res.json()) as DatasetExercise[];
  setExerciseDatabase(data);
  return data;
}

// Category translations
export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  'upper legs': 'Piernas (Cuádriceps e Isquios)',
  'lower legs': 'Pantorrillas',
  shoulders: 'Hombros',
  'upper arms': 'Brazos (Bíceps y Tríceps)',
  'lower arms': 'Antebrazos',
  waist: 'Cintura y Abdomen',
  cardio: 'Cardiovascular',
  neck: 'Cuello',
};

// Equipment translations
export const EQUIPMENT_TRANSLATIONS: Record<string, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  'body weight': 'Peso Corporal',
  cable: 'Poleas',
  'leverage machine': 'Máquina de Palanca',
  'smith machine': 'Máquina Multipower',
  band: 'Banda Elástica',
  'resistance band': 'Banda de Resistencia',
  kettlebell: 'Pesa Rusa (Kettlebell)',
  'ez barbell': 'Barra Z',
  roller: 'Rodillo (Foam Roller)',
  'medicine ball': 'Balón Medicinal',
  'stability ball': 'Pelota de Estabilidad (Fitball)',
  assisted: 'Asistido por Máquina',
  rope: 'Cuerda',
  'wheel roller': 'Rueda Abdominal',
  'stationary bike': 'Bicicleta Estática',
  'trap bar': 'Barra Hexagonal (Trap Bar)',
  'sled machine': 'Trineo de Empuje',
  'bosu ball': 'Bosu Ball',
  weighted: 'Con Lastre',
};

// Target muscle translations
export const TARGET_TRANSLATIONS: Record<string, string> = {
  pectorals: 'Pectorales',
  lats: 'Dorsal Ancho',
  delts: 'Deltoides',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  glutes: 'Glúteos',
  quads: 'Cuádriceps',
  hamstrings: 'Isquiotibiales',
  calves: 'Pantorrillas (Gemelos/Sóleo)',
  abs: 'Abdominales Rectos',
  spine: 'Erectores Espinales',
  traps: 'Trapecios',
  forearms: 'Antebrazos',
  'upper back': 'Espalda Alta / Romboides',
  'serratus anterior': 'Serrato Anterior',
  adductors: 'Aductores',
  abductors: 'Abductores',
  'levator scapulae': 'Elevador de la Escápula',
  'cardiovascular system': 'Sistema Cardiovascular',
};

export type ExerciseFilterKind = 'category' | 'equipment' | 'target';

/**
 * Devuelve la imagen representativa y el total de ejercicios para un valor de
 * filtro (categoría, equipamiento o músculo diana). Sirve para ilustrar los
 * filtros de la biblioteca con fotos reales del dataset (p. ej. "ver la
 * máquina" o "ver la pelota" antes de elegir).
 *
 * `active` permite mostrar conteos cruzados: cuando ya hay filtros activos en
 * otras dimensiones, el conteo refleja las combinaciones posibles (evita
 * callejones sin salida). La dimensión actual (`kind`) se excluye del cruce.
 */
export function getFilterOptionPreview(
  kind: ExerciseFilterKind,
  value: string,
  active?: { category?: string; equipment?: string; target?: string }
): { imageUrl: string; count: number } {
  const key = value.toLowerCase();
  let count = 0;
  let firstWithImage: DatasetExercise | undefined;
  for (const exercise of EXERCISE_DATABASE) {
    if (
      active?.category &&
      active.category !== 'all' &&
      kind !== 'category' &&
      !(exercise.category === active.category || exercise.body_part === active.category)
    ) {
      continue;
    }
    if (
      active?.equipment &&
      active.equipment !== 'all' &&
      kind !== 'equipment' &&
      exercise.equipment !== active.equipment
    ) {
      continue;
    }
    if (
      active?.target &&
      active.target !== 'all' &&
      kind !== 'target' &&
      exercise.target !== active.target
    ) {
      continue;
    }
    const raw = exercise[kind];
    if (!raw || String(raw).toLowerCase() !== key) continue;
    count += 1;
    if (!firstWithImage && exercise.image) firstWithImage = exercise;
  }
  return {
    imageUrl: firstWithImage ? getExerciseImageUrl(firstWithImage.image) : '',
    count,
  };
}

/**
 * Returns the CDN URL for the exercise 180x180 thumbnail image.
 */
export function getExerciseImageUrl(imagePath?: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${DATASET_CDN_BASE}${imagePath.replace(/^\//, '')}`;
}

/**
 * Returns the CDN URL for the animated GIF demonstrating the exercise.
 */
export function getExerciseGifUrl(gifPath?: string): string {
  if (!gifPath) return '';
  if (gifPath.startsWith('http')) return gifPath;
  return `${DATASET_CDN_BASE}${gifPath.replace(/^\//, '')}`;
}

/**
 * Translates a category identifier to Spanish.
 */
export function translateCategory(cat: string): string {
  return CATEGORY_TRANSLATIONS[cat.toLowerCase()] || cat;
}

/**
 * Translates equipment to Spanish.
 */
export function translateEquipment(eq: string): string {
  return EQUIPMENT_TRANSLATIONS[eq.toLowerCase()] || eq;
}

/**
 * Translates target muscle to Spanish.
 */
export function translateTarget(target: string): string {
  return TARGET_TRANSLATIONS[target.toLowerCase()] || target;
}

/**
 * Get all available categories.
 */
export function getAvailableCategories(): { id: string; label: string }[] {
  const cats = Array.from(new Set(EXERCISE_DATABASE.map((e) => e.category))).filter(Boolean);
  return cats.map((cat) => ({
    id: cat,
    label: translateCategory(cat),
  }));
}

/**
 * Get all available equipment types.
 */
export function getAvailableEquipment(): { id: string; label: string }[] {
  const eq = Array.from(new Set(EXERCISE_DATABASE.map((e) => e.equipment))).filter(Boolean);
  return eq.map((item) => ({
    id: item,
    label: translateEquipment(item),
  }));
}

/**
 * Get all available target muscles.
 */
export function getAvailableTargets(): { id: string; label: string }[] {
  const targets = Array.from(new Set(EXERCISE_DATABASE.map((e) => e.target))).filter(Boolean);
  return targets.map((t) => ({
    id: t,
    label: translateTarget(t),
  }));
}

/**
 * Search and filter exercises from the 1,324 dataset.
 */
export function searchExercises(options: {
  query?: string;
  category?: string;
  equipment?: string;
  target?: string;
  sort?: 'name' | 'name-desc';
  limit?: number;
  offset?: number;
}): { items: DatasetExercise[]; total: number } {
  const { query, category, equipment, target, sort, limit = 24, offset = 0 } = options;

  let results = EXERCISE_DATABASE;

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
      const nameMatch = e.name.toLowerCase().includes(q);
      const catMatch =
        translateCategory(e.category).toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);
      const eqMatch =
        translateEquipment(e.equipment).toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q);
      const targetMatch =
        translateTarget(e.target).toLowerCase().includes(q) || e.target.toLowerCase().includes(q);
      const secMatch = e.secondary_muscles?.some((m) => m.toLowerCase().includes(q));
      return nameMatch || catMatch || eqMatch || targetMatch || secMatch;
    });
  }

  if (sort === 'name' || sort === 'name-desc') {
    const direction = sort === 'name' ? 1 : -1;
    results = [...results].sort((a, b) => a.name.localeCompare(b.name) * direction);
  }

  const total = results.length;
  const items = results.slice(offset, offset + limit);

  return { items, total };
}

/**
 * Get an exercise by its unique dataset ID (e.g. "0025")
 */
export function getDatasetExerciseById(id: string): DatasetExercise | undefined {
  return EXERCISE_DATABASE.find((e) => e.id === id);
}

/**
 * Map an exercise from hasaneyldrm/exercises-dataset into the app's Routine Exercise format.
 */
export function datasetToRoutineExercise(
  item: DatasetExercise,
  overrides?: Partial<Exercise>
): Exercise {
  const spanishSteps = item.steps_es && item.steps_es.length > 0 ? item.steps_es : item.steps_en;
  const capitalizedName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
  const targetLabel = translateTarget(item.target);
  const primaryMuscle = translateCategory(item.category);

  // Derive default sets & reps based on target muscle and category
  let defaultSets = 3;
  let defaultReps = '10-12';
  let defaultRest = 60;
  let suggestedWeight = 20;

  if (item.category === 'chest' || item.category === 'back' || item.category === 'upper legs') {
    defaultSets = 4;
    defaultReps = '8-10';
    defaultRest = 90;
    suggestedWeight = item.equipment.includes('barbell')
      ? 60
      : item.equipment.includes('dumbbell')
        ? 22
        : 40;
  } else if (item.equipment === 'body weight') {
    suggestedWeight = 0;
    defaultReps = '12-15';
  }

  const iconType: 'barbell' | 'dumbbell' | 'bodyweight' | 'cable' | 'machine' =
    item.equipment.includes('barbell')
      ? 'barbell'
      : item.equipment.includes('dumbbell')
        ? 'dumbbell'
        : item.equipment.includes('cable')
          ? 'cable'
          : item.equipment.includes('machine') || item.equipment.includes('lever')
            ? 'machine'
            : 'bodyweight';

  return {
    id: `custom_${item.id}_${Date.now()}`,
    datasetId: item.id,
    name: capitalizedName,
    primaryMuscle,
    targetMuscles: [targetLabel, ...(item.secondary_muscles || []).map(translateTarget)],
    sets: defaultSets,
    reps: defaultReps,
    suggestedWeightKg: suggestedWeight,
    restSeconds: defaultRest,
    rpe: 8,
    technicalCue:
      spanishSteps[0] || 'Mantén el control en la fase excéntrica y conecta mente-músculo.',
    fullInstructions: spanishSteps,
    commonMistakes: [
      'Acelerar la fase descendente perdiendo la tensión mecánica.',
      'Compensar la postura con la zona lumbar o balancear el torso.',
      'No completar el rango de movimiento articular recomendado.',
    ],
    equipment: translateEquipment(item.equipment),
    difficulty: 'intermedio',
    iconType,
    image: item.image,
    gifUrl: item.gif_url,
    attribution: item.attribution || '© Gym visual — https://gymvisual.com/',
    ...overrides,
  };
}
