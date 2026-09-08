import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  X,
  BookOpen,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { FilterDrillDownSheet } from './FilterDrillDownSheet';
import { Highlight } from './Highlight';
import { Chip } from './Chip';
import { ExerciseFilterBar, SortSelect } from './exerciseDatabase/ExerciseFilterBar';
import { ExerciseLibraryCard } from './exerciseDatabase/ExerciseLibraryCard';
import { ExerciseDetailModal } from './exerciseDatabase/ExerciseDetailModal';
import { ResultSortOrder } from './exerciseDatabase/types';
import {
  EXERCISE_DATABASE,
  loadExerciseDatabase,
  getAvailableCategories,
  getAvailableEquipment,
  getAvailableTargets,
  datasetToRoutineExercise,
  searchExercises,
  DATASET_GITHUB_REPO,
  translateCategory,
  translateEquipment,
  translateTarget,
  getExerciseImageUrl,
} from '../services/exerciseDatabaseService';
import { DatasetExercise } from '../types';
import { useApp } from '../context/useApp';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatNumber } from '../utils/format';
import { useIsMobile } from '../hooks/useIsMobile';

const PAGE_SIZE = 24;

interface ExerciseDatabaseViewProps {
  onSelectForRoutine?: (exercise: DatasetExercise, dayNumber: number) => void;
  isModalMode?: boolean;
  onCloseModal?: () => void;
  initialCategory?: string;
}

const FILTERS_STORAGE_KEY = 'fitai.exerciseFilters';
const SORT_STORAGE_KEY = 'fitai.exerciseSort';

// Filtros activos que sobreviven la navegación dentro de la sesión (no el texto
// de búsqueda), para que volver a la biblioteca no pierda la selección actual.
function readStoredFilters(): { category: string; equipment: string; target: string } {
  const fallback = { category: 'all', equipment: 'all', target: 'all' };
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return fallback;
  }
  try {
    const raw = window.sessionStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<{ category?: string; equipment?: string; target?: string }>;
    return {
      category: typeof parsed.category === 'string' ? parsed.category : 'all',
      equipment: typeof parsed.equipment === 'string' ? parsed.equipment : 'all',
      target: typeof parsed.target === 'string' ? parsed.target : 'all',
    };
  } catch {
    return fallback;
  }
}

function readStoredSort(): ResultSortOrder {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return 'relevance';
  }
  try {
    const raw = window.sessionStorage.getItem(SORT_STORAGE_KEY);
    return raw === 'name' || raw === 'name-desc' ? raw : 'relevance';
  } catch {
    return 'relevance';
  }
}

export const ExerciseDatabaseView: React.FC<ExerciseDatabaseViewProps> = ({
  onSelectForRoutine,
  isModalMode = false,
  onCloseModal,
  initialCategory,
}) => {
  const { routines, addExerciseToRoutine, sendCoachMessage, navigateTo } = useApp();

  const isMobile = useIsMobile();

  // Filters state
  const storedFilters = useMemo(() => readStoredFilters(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory && initialCategory !== 'all' ? initialCategory : storedFilters.category
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string>(storedFilters.equipment);
  const [selectedTarget, setSelectedTarget] = useState<string>(storedFilters.target);
  const [displayCount, setDisplayCount] = useState<number>(PAGE_SIZE);
  const storedSort = useMemo(() => readStoredSort(), []);
  const [sortOrder, setSortOrder] = useState<'relevance' | 'name' | 'name-desc'>(storedSort);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Persiste los filtros al cambiar para rehidratarlos al volver a la vista.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({
          category: selectedCategory,
          equipment: selectedEquipment,
          target: selectedTarget,
        })
      );
    } catch {
      // Almacenamiento no disponible: se ignora y se sigue sin persistencia.
    }
  }, [selectedCategory, selectedEquipment, selectedTarget]);

  // Debounced search: filtra los ejercicios tras pausa de tipeo
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250);

  // Modal / Detail state
  const [selectedExercise, setSelectedExercise] = useState<DatasetExercise | null>(null);

  const [isLoadingDB, setIsLoadingDB] = useState(EXERCISE_DATABASE.length === 0);

  useEffect(() => {
    if (EXERCISE_DATABASE.length === 0) {
      loadExerciseDatabase()
        .then(() => setIsLoadingDB(false))
        .catch((err) => {
          console.error('Failed to load database:', err);
          setIsLoadingDB(false);
        });
    }
  }, []);

  // Persiste el orden preferido para rehidratarlo al volver a la vista.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') return;
    try {
      window.sessionStorage.setItem(SORT_STORAGE_KEY, sortOrder);
    } catch {
      // Almacenamiento no disponible: se ignora y se sigue sin persistencia.
    }
  }, [sortOrder]);

  const categories = useMemo(() => (isLoadingDB ? [] : getAvailableCategories()), [isLoadingDB]);
  const equipmentList = useMemo(() => (isLoadingDB ? [] : getAvailableEquipment()), [isLoadingDB]);
  const targets = useMemo(() => (isLoadingDB ? [] : getAvailableTargets()), [isLoadingDB]);

  // Búsqueda + filtros delegados al servicio (fuente única de verdad).
  // isLoadingDB se lee en el cuerpo para forzar la re-evaluación cuando
  // termina la carga asíncrona del dataset (el módulo se muta fuera de React).
  const { items: visibleExercises, total: filteredCount } = useMemo(() => {
    if (isLoadingDB) {
      return { items: [] as DatasetExercise[], total: 0 };
    }
    return searchExercises({
      query: debouncedSearchQuery,
      category: selectedCategory,
      equipment: selectedEquipment,
      target: selectedTarget,
      sort: sortOrder === 'relevance' ? undefined : sortOrder,
      limit: displayCount,
    });
  }, [
    debouncedSearchQuery,
    selectedCategory,
    selectedEquipment,
    selectedTarget,
    sortOrder,
    displayCount,
    isLoadingDB,
  ]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setDisplayCount(PAGE_SIZE);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setDisplayCount(PAGE_SIZE);
  };

  const handleEquipmentChange = (equipment: string) => {
    setSelectedEquipment(equipment);
    setDisplayCount(PAGE_SIZE);
  };

  const handleTargetChange = (target: string) => {
    setSelectedTarget(target);
    setDisplayCount(PAGE_SIZE);
  };

  const handleSortChange = (sort: 'relevance' | 'name' | 'name-desc') => {
    setSortOrder(sort);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedEquipment('all');
    setSelectedTarget('all');
    setDisplayCount(PAGE_SIZE);
  };

  const handleAddToRoutine = (exercise: DatasetExercise, dayNumber: number) => {
    setSelectedExercise(null);
    setDisplayCount(PAGE_SIZE);

    if (onSelectForRoutine) {
      onSelectForRoutine(exercise, dayNumber);
    } else {
      const routineExercise = datasetToRoutineExercise(exercise);
      addExerciseToRoutine(dayNumber, routineExercise);
    }
  };

  const handleConsultCoach = (exercise: DatasetExercise) => {
    setSelectedExercise(null);
    if (onCloseModal) onCloseModal();
    sendCoachMessage(
      `¿Cómo debo ejecutar correctamente "${exercise.name}" y qué consejos biomecánicos me das para evitar lesiones?`
    );
    navigateTo('routine');
  };

  if (isMobile && !isModalMode) {
    return (
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-4 max-w-md mx-auto w-full">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Biblioteca</p>
          <h1 className="text-2xl font-black tracking-tight text-white">Ejercicios</h1>
          <div className="flex items-center justify-between gap-3 mt-0.5">
          <p className="text-xs text-white/50" aria-live="polite" aria-atomic="true">
            {isLoadingDB
              ? 'Cargando...'
              : searchQuery ||
                  selectedCategory !== 'all' ||
                  selectedEquipment !== 'all' ||
                  selectedTarget !== 'all'
                ? `${formatNumber(filteredCount)} resultados`
                : `${formatNumber(EXERCISE_DATABASE.length)} ejercicios`}
          </p>
          <SortSelect sortOrder={sortOrder} onSortChange={handleSortChange} compact />
        </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            id="exercise-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar ejercicio o músculo..."
            aria-label="Buscar ejercicio o músculo"
            className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isLoadingDB ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-[#C0FF00] animate-spin" />
          </div>
        ) : (
          <>
            {/* Botón que abre el drill-down de filtros ilustrados (1 tap por renglón) */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowFilterSheet(true)}
                aria-haspopup="dialog"
                aria-expanded={showFilterSheet}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <span className="flex items-center gap-2 text-xs font-bold text-[#C0FF00]">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                  {(selectedCategory !== 'all' ||
                    selectedEquipment !== 'all' ||
                    selectedTarget !== 'all') && (
                    <span className="w-5 h-5 rounded-full bg-[#C0FF00] text-black text-[10px] font-black flex items-center justify-center">
                      {(selectedCategory !== 'all' ? 1 : 0) +
                        (selectedEquipment !== 'all' ? 1 : 0) +
                        (selectedTarget !== 'all' ? 1 : 0)}
                    </span>
                  )}
                </span>
                <ChevronDown className="w-4 h-4 text-white/50" />
              </button>

              {/* Mini-chips de la selección activa para lectura rápida */}
              {(selectedCategory !== 'all' ||
                selectedEquipment !== 'all' ||
                selectedTarget !== 'all' ||
                !!searchQuery) && (
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none px-4 pb-3 border-t border-white/5 pt-2">
                  {!!searchQuery && (
                    <Chip label={`"${searchQuery}"`} onRemove={() => handleSearchChange('')} />
                  )}
                  {selectedCategory !== 'all' && (
                    <Chip
                      label={translateCategory(selectedCategory)}
                      onRemove={() => handleCategoryChange('all')}
                    />
                  )}
                  {selectedEquipment !== 'all' && (
                    <Chip
                      label={translateEquipment(selectedEquipment)}
                      onRemove={() => handleEquipmentChange('all')}
                    />
                  )}
                  {selectedTarget !== 'all' && (
                    <Chip
                      label={translateTarget(selectedTarget)}
                      onRemove={() => handleTargetChange('all')}
                    />
                  )}
                  <button
                    onClick={handleResetFilters}
                    className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full text-white/40 hover:text-white"
                  >
                    Limpiar
                  </button>
                </div>
              )}
            </div>

            {visibleExercises.length === 0 ? (
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                  <Search className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No se encontraron ejercicios</h3>
                  <p className="text-xs text-white/50 mt-1 max-w-xs">
                    Quita algún filtro o busca términos como "press", "curl", "sentadilla" o
                    "deltoides".
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-[#C0FF00] text-black text-xs font-black rounded-xl hover:bg-[#aee600] transition-colors"
                >
                  Ver Todos los Ejercicios
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {visibleExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  className="flex items-center gap-3 bg-[#0A0A0A] border border-white/10 rounded-2xl px-3 py-2.5 text-left active:border-[#C0FF00]/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={getExerciseImageUrl(exercise.image)}
                      alt={exercise.name}
                      loading="lazy"
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white capitalize truncate">
                    <Highlight text={exercise.name} query={debouncedSearchQuery} />
                  </p>
                    <p className="text-[11px] text-white/50">{translateTarget(exercise.target)}</p>
                  </div>
                </button>
              ))}
            </div>

            {visibleExercises.length < filteredCount && (
              <button
                onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-transform active:scale-[0.98]"
              >
                Cargar Más (+{Math.min(PAGE_SIZE, filteredCount - visibleExercises.length)})
              </button>
            )}
          </>
        )}
        </>
      )}

        {/* Drill-down de filtros ilustrados (1 tap por renglón) */}
        <FilterDrillDownSheet
          open={showFilterSheet}
          categories={categories}
          equipment={equipmentList}
          targets={targets}
          selectedCategory={selectedCategory}
          selectedEquipment={selectedEquipment}
          selectedTarget={selectedTarget}
          filteredCount={filteredCount}
          onSelectCategory={handleCategoryChange}
          onSelectEquipment={handleEquipmentChange}
          onSelectTarget={handleTargetChange}
          onReset={handleResetFilters}
          onClose={() => setShowFilterSheet(false)}
        />

        {selectedExercise && (
          <ExerciseDetailModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onConsultCoach={handleConsultCoach}
            onAddToRoutine={() => {
              handleAddToRoutine(selectedExercise, 1);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-6 w-full ${isModalMode ? 'p-2' : 'p-4 sm:p-8 max-w-[1600px] mx-auto'}`}
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C0FF00]/10 text-[#C0FF00] text-xs font-bold uppercase tracking-wider mb-2 border border-[#C0FF00]/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dataset hasaneyldrm/exercises-dataset</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
            <span>Biblioteca de Ejercicios</span>
            <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full bg-white/10 text-[#C0FF00]">
              {isLoadingDB ? 'Cargando...' : `${formatNumber(EXERCISE_DATABASE.length)} ejercicios`}
            </span>
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-3xl leading-relaxed">
            Explora la base de datos completa de GitHub con animaciones GIF, objetivos musculares,
            tipo de equipamiento e instrucciones técnicas en español.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={DATASET_GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <span>Ver en GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C0FF00]" />
          </a>

          {isModalMode && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <ExerciseFilterBar
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedEquipment={selectedEquipment}
        selectedTarget={selectedTarget}
        categories={categories}
        equipmentList={equipmentList}
        targets={targets}
        visibleCount={visibleExercises.length}
        filteredCount={filteredCount}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onEquipmentChange={handleEquipmentChange}
        onTargetChange={handleTargetChange}
        onReset={handleResetFilters}
      />

      {/* Exercises Grid */}
      {isLoadingDB ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 text-[#C0FF00] animate-spin" />
        </div>
      ) : visibleExercises.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">No se encontraron ejercicios</h3>
            <p className="text-sm text-white/50 max-w-md mt-1">
              Prueba cambiando los términos de búsqueda o restableciendo los filtros de región y
              equipamiento.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-[#C0FF00] text-black text-xs font-black rounded-xl hover:bg-[#aee600] transition-colors"
          >
            Ver Todos los {formatNumber(EXERCISE_DATABASE.length)} Ejercicios
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleExercises.map((exercise) => (
            <ExerciseLibraryCard
              key={exercise.id}
              exercise={exercise}
              routines={routines}
              searchQuery={debouncedSearchQuery}
              onInspect={setSelectedExercise}
              onAddToRoutine={handleAddToRoutine}
            />
          ))}
        </div>
      )}

      {/* Pagination / Load More */}
      {visibleExercises.length < filteredCount && (
        <div className="flex justify-center pt-6 pb-8">
          <button
            onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
            className="px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
          >
            <span>Cargar Más Ejercicios</span>
            <span className="px-2 py-0.5 bg-[#C0FF00] text-black rounded-full font-mono text-xs font-black">
              +{Math.min(PAGE_SIZE, filteredCount - visibleExercises.length)}
            </span>
          </button>
        </div>
      )}

      {/* Biomechanics & Details Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onConsultCoach={handleConsultCoach}
          onAddToRoutine={() => {
            handleAddToRoutine(selectedExercise, 1);
          }}
        />
      )}
    </div>
  );
};
