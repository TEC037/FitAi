import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  X,
  BookOpen,
  Loader2,
  Play,
  Sparkles,
  Plus,
  Info,
  Check,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import {
  EXERCISE_DATABASE,
  loadExerciseDatabase,
  getAvailableCategories,
  getAvailableEquipment,
  getAvailableTargets,
  datasetToRoutineExercise,
  searchExercises,
  DATASET_GITHUB_REPO,
  getExerciseGifUrl,
  translateCategory,
  translateEquipment,
  translateTarget,
  getExerciseImageUrl,
} from '../services/exerciseDatabaseService';
import { DatasetExercise, DailyRoutine } from '../types';
import { useApp } from '../context/useApp';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { formatNumber } from '../utils/format';
import { useIsMobile } from '../hooks/useIsMobile';

const PAGE_SIZE = 24;

interface ExerciseDatabaseViewProps {
  onSelectForRoutine?: (exercise: DatasetExercise, dayNumber: number) => void;
  isModalMode?: boolean;
  onCloseModal?: () => void;
  initialCategory?: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState<number>(PAGE_SIZE);

  // Debounced search: filtra 1,324 ejercicios tras pausa de tipeo
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
      limit: displayCount,
    });
  }, [
    debouncedSearchQuery,
    selectedCategory,
    selectedEquipment,
    selectedTarget,
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
    navigateTo('coach');
  };

  if (isMobile && !isModalMode) {
    return (
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-4 max-w-md mx-auto w-full">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Biblioteca</p>
          <h1 className="text-2xl font-black tracking-tight text-white">Ejercicios</h1>
          <p className="text-xs text-white/50 mt-0.5">
            {isLoadingDB ? 'Cargando...' : `${formatNumber(EXERCISE_DATABASE.length)} ejercicios`}
          </p>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            id="exercise-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar ejercicio o músculo..."
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
        ) : visibleExercises.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No se encontraron ejercicios</h3>
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
                      {exercise.name}
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
        totalCount={EXERCISE_DATABASE.length}
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

// --- Inlined Components ---

type ExerciseMeta = { id: string; label: string };

interface ExerciseFilterBarProps {
  searchQuery: string;
  selectedCategory: string;
  selectedEquipment: string;
  selectedTarget: string;
  categories: ExerciseMeta[];
  equipmentList: ExerciseMeta[];
  targets: ExerciseMeta[];
  visibleCount: number;
  filteredCount: number;
  totalCount: number;
  onSearchChange: (q: string) => void;
  onCategoryChange: (category: string) => void;
  onEquipmentChange: (equipment: string) => void;
  onTargetChange: (target: string) => void;
  onReset: () => void;
}

export const ExerciseFilterBar: React.FC<ExerciseFilterBarProps> = ({
  searchQuery,
  selectedCategory,
  selectedEquipment,
  selectedTarget,
  categories,
  equipmentList,
  targets,
  visibleCount,
  filteredCount,
  totalCount,
  onSearchChange,
  onCategoryChange,
  onEquipmentChange,
  onTargetChange,
  onReset,
}) => {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-[28px] p-5 sm:p-6 shadow-xl space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          id="exercise-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre, músculo o equipamiento (ej. bench press, sentadilla, deltoides, mancuerna)..."
          className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-white/40 font-bold">
            Grupo Muscular / Región
          </span>
          {(selectedCategory !== 'all' ||
            selectedEquipment !== 'all' ||
            selectedTarget !== 'all' ||
            searchQuery) && (
            <button
              onClick={onReset}
              className="text-xs text-[#C0FF00] hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer Filtros</span>
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#C0FF00] text-black shadow-[0_0_15px_rgba(192,255,0,0.3)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Todos ({totalCount})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#C0FF00] text-black shadow-[0_0_15px_rgba(192,255,0,0.3)]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filters (Equipment & Target Muscle) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
        {/* Equipment Dropdown */}
        <div>
          <label
            htmlFor="exercise-filter-equipment"
            className="text-[10px] uppercase text-white/40 font-bold block mb-1.5"
          >
            Equipamiento Disponible
          </label>
          <div className="relative">
            <select
              id="exercise-filter-equipment"
              value={selectedEquipment}
              onChange={(e) => onEquipmentChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#C0FF00] appearance-none pr-8 cursor-pointer"
            >
              <option value="all" className="bg-[#121212] text-white">
                Cualquier equipamiento ({equipmentList.length} tipos)
              </option>
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id} className="bg-[#121212] text-white">
                  {eq.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Target Muscle Dropdown */}
        <div>
          <label
            htmlFor="exercise-filter-target"
            className="text-[10px] uppercase text-white/40 font-bold block mb-1.5"
          >
            Músculo Diana Específico
          </label>
          <div className="relative">
            <select
              id="exercise-filter-target"
              value={selectedTarget}
              onChange={(e) => onTargetChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#C0FF00] appearance-none pr-8 cursor-pointer"
            >
              <option value="all" className="bg-[#121212] text-white">
                Cualquier músculo diana ({targets.length} músculos)
              </option>
              {targets.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#121212] text-white">
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-white/50 pt-1">
        <span>
          Mostrando <strong>{visibleCount}</strong> de <strong>{filteredCount}</strong> ejercicios
          encontrados
        </span>
        <span className="text-[11px] text-white/40 hidden sm:inline">
          Pasa el cursor sobre una tarjeta para ver la animación en GIF
        </span>
      </div>
    </div>
  );
};

interface ExerciseLibraryCardProps {
  exercise: DatasetExercise;
  routines: DailyRoutine[];
  onInspect: (exercise: DatasetExercise) => void;
  onAddToRoutine: (exercise: DatasetExercise, dayNumber: number) => void;
}

export const ExerciseLibraryCard: React.FC<ExerciseLibraryCardProps> = ({
  exercise,
  routines,
  onInspect,
  onAddToRoutine,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [wasJustAdded, setWasJustAdded] = useState<boolean>(false);

  const imageUrl = getExerciseImageUrl(exercise.image);
  const gifUrl = getExerciseGifUrl(exercise.gif_url);

  const handleAddToRoutine = (dayNumber: number) => {
    onAddToRoutine(exercise, dayNumber);
    setIsAdding(false);
    setWasJustAdded(true);
    setTimeout(() => setWasJustAdded(false), 2500);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#0A0A0A] border border-white/10 hover:border-[#C0FF00]/50 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(192,255,0,0.15)]"
    >
      {/* Visual Media Thumbnail / Animated GIF */}
      <div className="relative w-full aspect-square bg-[#121212] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
        <img
          src={isHovered ? gifUrl : imageUrl}
          alt={exercise.name}
          loading="lazy"
          className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== gifUrl) {
              target.src = gifUrl;
            }
          }}
        />

        {/* ID & GIF live badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white/70 border border-white/10">
            #{exercise.id}
          </span>
          {isHovered && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#C0FF00] text-black animate-pulse">
              GIF
            </span>
          )}
        </div>

        {/* Quick inspect button */}
        <button
          onClick={() => onInspect(exercise)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
          title="Ver técnica detallada"
        >
          <span className="px-3.5 py-2 rounded-xl bg-black/90 text-[#C0FF00] text-xs font-bold border border-[#C0FF00]/30 shadow-lg flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Ver Técnica</span>
          </span>
        </button>
      </div>

      {/* Content info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-[#C0FF00]/10 text-[#C0FF00] text-[10px] font-bold uppercase tracking-wider">
              {translateTarget(exercise.target)}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/60 text-[10px] font-medium">
              {translateCategory(exercise.category)}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white capitalize line-clamp-2 title-case group-hover:text-[#C0FF00] transition-colors">
            {exercise.name}
          </h4>

          <p className="text-[11px] text-white/40 mt-1">
            Equipo:{' '}
            <span className="text-white/70 font-medium">
              {translateEquipment(exercise.equipment)}
            </span>
          </p>
        </div>

        {/* Card Bottom Actions */}
        <div className="pt-3 border-t border-white/5 flex items-center gap-2 mt-2">
          <button
            onClick={() => onInspect(exercise)}
            className="flex-1 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <Info className="w-3.5 h-3.5 text-white/50" />
            <span>Detalles</span>
          </button>

          {/* Add to Routine button & Day Picker popover */}
          <div className="relative">
            <button
              onClick={() => setIsAdding((prev) => !prev)}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
                wasJustAdded
                  ? 'bg-[#C0FF00] text-black border-[#C0FF00]'
                  : 'bg-white/5 hover:bg-white/10 text-[#C0FF00] border-white/10 hover:border-[#C0FF00]/30'
              }`}
              title="Añadir a un día de mi rutina"
            >
              {wasJustAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            {/* Day selection popover */}
            {isAdding && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#121212] border border-white/15 rounded-2xl p-2 shadow-2xl z-20 animate-fadeIn">
                <p className="text-[10px] uppercase font-bold text-white/50 px-2 py-1">
                  Añadir al día:
                </p>
                <div className="space-y-1">
                  {routines.map((r) => (
                    <button
                      key={r.dayNumber}
                      onClick={() => handleAddToRoutine(r.dayNumber)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-semibold text-white/90 hover:text-[#C0FF00] flex items-center justify-between transition-colors"
                    >
                      <span>Día {r.dayNumber}</span>
                      <span className="text-[10px] text-white/40 truncate max-w-[90px]">
                        {r.focus}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExerciseDetailModalProps {
  exercise: DatasetExercise;
  onClose: () => void;
  onConsultCoach: (exercise: DatasetExercise) => void;
  onAddToRoutine: (exercise: DatasetExercise) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onConsultCoach,
  onAddToRoutine,
}) => {
  const [instructionLang, setInstructionLang] = useState<'es' | 'en'>('es');
  const { dialogRef, handleBackdropClick } = useModalAccessibility(true, onClose);

  const instructionSteps: string[] =
    instructionLang === 'es' && exercise.steps_es && exercise.steps_es.length > 0
      ? exercise.steps_es
      : exercise.steps_en || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-detail-modal-title"
        className="bg-[#0A0A0A] border border-white/15 rounded-[32px] max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col gap-6"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="px-3 py-1 bg-[#C0FF00]/10 text-[#C0FF00] text-[10px] font-bold uppercase rounded-full tracking-wider border border-[#C0FF00]/20">
              {translateTarget(exercise.target)}
            </span>
            <span className="px-3 py-1 bg-white/10 text-white/70 text-[10px] font-semibold rounded-full">
              {translateCategory(exercise.category)}
            </span>
            <span className="text-[10px] font-mono text-white/40">ID: #{exercise.id}</span>
          </div>
          <h2
            id="exercise-detail-modal-title"
            className="text-2xl sm:text-3xl font-black text-white capitalize"
          >
            {exercise.name}
          </h2>
        </div>

        {/* Animated GIF Player & Video Display */}
        <div className="relative w-full bg-[#121212] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center min-h-[280px] max-h-[380px]">
          <img
            src={getExerciseGifUrl(exercise.gif_url)}
            alt={exercise.name}
            className="w-full h-full max-h-[380px] object-contain p-4"
          />
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] text-white/70 flex items-center gap-1.5">
            <Play className="w-3 h-3 text-[#C0FF00] fill-current" />
            <span>Demostración técnica en bucle</span>
          </div>
        </div>

        {/* Target & Synergist Muscles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#C0FF00] mb-1">
              Músculo Diana Principal
            </p>
            <p className="text-sm font-bold text-white capitalize">
              {translateTarget(exercise.target)} ({exercise.target})
            </p>
            <p className="text-xs text-white/50 mt-1">
              Equipamiento: {translateEquipment(exercise.equipment)}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-white/40 mb-1">
              Músculos Secundarios / Sinergistas
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 ? (
                exercise.secondary_muscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[11px] font-medium capitalize"
                  >
                    {translateTarget(muscle)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-white/40">Aislamiento directo</span>
              )}
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">
              Instrucciones Paso a Paso
            </h4>
            {exercise.steps_en && exercise.steps_en.length > 0 && (
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setInstructionLang('es')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    instructionLang === 'es' ? 'bg-[#C0FF00] text-black' : 'text-white/60'
                  }`}
                >
                  Español
                </button>
                <button
                  onClick={() => setInstructionLang('en')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    instructionLang === 'en' ? 'bg-[#C0FF00] text-black' : 'text-white/60'
                  }`}
                >
                  English
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {instructionSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-xs text-white/80 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5"
              >
                <span className="w-5 h-5 rounded-full bg-[#C0FF00]/15 text-[#C0FF00] font-bold flex items-center justify-center text-[10px] shrink-0 border border-[#C0FF00]/30">
                  {idx + 1}
                </span>
                <p className="pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attribution note */}
        <div className="text-[11px] text-white/40 border-t border-white/10 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            {exercise.attribution || '© Gym visual — Distribuido bajo MIT con fines educativos.'}
          </span>
          <a
            href={DATASET_GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C0FF00] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Fuente: hasaneyldrm/exercises-dataset</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onConsultCoach(exercise)}
            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <Sparkles className="w-4 h-4 text-[#C0FF00]" />
            <span>Consultar Dudas con Coach IA</span>
          </button>

          <div className="flex-1 flex gap-2">
            <button
              onClick={() => onAddToRoutine(exercise)}
              className="flex-1 py-3 px-4 bg-[#C0FF00] text-black text-xs font-black rounded-xl hover:bg-[#aee600] transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,255,0,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir a mi Rutina</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
