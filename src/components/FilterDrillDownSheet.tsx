import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Crosshair, Dumbbell, RotateCcw, Search, Target, X } from 'lucide-react';
import {
  getFilterOptionPreview,
  searchExercises,
  ExerciseFilterKind,
} from '../services/exerciseDatabaseService';
import { formatNumber } from '../utils/format';
import { Highlight } from './Highlight';
import { Chip } from './Chip';

export interface FilterLevelOption {
  id: string;
  label: string;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const GROUP_EMOJIS: Record<string, string> = {
  chest: '🏋️',
  back: '🧗',
  'upper legs': '🦵',
  'lower legs': '🦵',
  shoulders: '💪',
  'upper arms': '💪',
  'lower arms': '✊',
  waist: '🔥',
  cardio: '❤️',
  neck: '🧘',
};

const EQUIPMENT_EMOJIS: Record<string, string> = {
  barbell: '🏋️',
  dumbbell: '💪',
  'body weight': '🧍',
  cable: '⚙️',
  smith: '🔧',
  band: '🌀',
  kettlebell: '🔔',
  roller: '🛼',
  'medicine ball': '⚽',
  'stability ball': '🏀',
  rope: '🪢',
};

const TARGET_EMOJIS: Record<string, string> = {
  pectorals: '🫀',
  lats: '🪽',
  delts: '💪',
  biceps: '💪',
  triceps: '💪',
  glutes: '🍑',
  quads: '🦵',
  hamstrings: '🦵',
  calves: '🦵',
  abs: '🔥',
  spine: '🦴',
  traps: '🧊',
  forearms: '✊',
};

function getRowEmoji(kind: ExerciseFilterKind, id: string): string {
  const table =
    kind === 'category' ? GROUP_EMOJIS : kind === 'equipment' ? EQUIPMENT_EMOJIS : TARGET_EMOJIS;
  return table[id.toLowerCase()] || '';
}

export interface FilterDrillDownSheetProps {
  open: boolean;
  categories: FilterLevelOption[];
  equipment: FilterLevelOption[];
  targets: FilterLevelOption[];
  selectedCategory: string;
  selectedEquipment: string;
  selectedTarget: string;
  filteredCount: number;
  onSelectCategory: (id: string) => void;
  onSelectEquipment: (id: string) => void;
  onSelectTarget: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const TABS: { kind: ExerciseFilterKind; label: string }[] = [
  { kind: 'category', label: 'Categoría' },
  { kind: 'equipment', label: 'Equipamiento' },
  { kind: 'target', label: 'Músculo' },
];

interface LevelState {
  kind: ExerciseFilterKind;
  title: string;
  options: FilterLevelOption[];
  selected: string;
  onSelect: (id: string) => void;
  allLabel: string;
}

export const FilterDrillDownSheet: React.FC<FilterDrillDownSheetProps> = ({
  open,
  categories,
  equipment,
  targets,
  selectedCategory,
  selectedEquipment,
  selectedTarget,
  filteredCount,
  onSelectCategory,
  onSelectEquipment,
  onSelectTarget,
  onReset,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ExerciseFilterKind>('category');
  const [query, setQuery] = useState('');
  const hasActive =
    selectedCategory !== 'all' || selectedEquipment !== 'all' || selectedTarget !== 'all';

  const levels: Record<ExerciseFilterKind, LevelState> = useMemo(
    () => ({
      category: {
        kind: 'category',
        title: 'Categoría',
        options: categories,
        selected: selectedCategory,
        onSelect: onSelectCategory,
        allLabel: 'Todos',
      },
      equipment: {
        kind: 'equipment',
        title: 'Equipamiento',
        options: equipment,
        selected: selectedEquipment,
        onSelect: onSelectEquipment,
        allLabel: 'Cualquiera',
      },
      target: {
        kind: 'target',
        title: 'Músculo',
        options: targets,
        selected: selectedTarget,
        onSelect: onSelectTarget,
        allLabel: 'Cualquiera',
      },
    }),
    [
      categories,
      equipment,
      targets,
      selectedCategory,
      selectedEquipment,
      selectedTarget,
      onSelectCategory,
      onSelectEquipment,
      onSelectTarget,
    ]
  );

  const handleSelection = (id: string, level: LevelState) => {
    level.onSelect(id);
  };

  // Conteo del chip "Todos/Cualquiera": bases de las otras dos dimensiones activas,
  // sin aplicar la dimensión actual. Muestra combinaciones viables, no solo el total.
  const activeExcludingCurrent = useMemo(
    () => ({
      category: activeTab === 'category' ? 'all' : selectedCategory,
      equipment: activeTab === 'equipment' ? 'all' : selectedEquipment,
      target: activeTab === 'target' ? 'all' : selectedTarget,
    }),
    [activeTab, selectedCategory, selectedEquipment, selectedTarget]
  );

  const filteredAllCount = useMemo(
    () =>
      searchExercises({
        category: activeExcludingCurrent.category,
        equipment: activeExcludingCurrent.equipment,
        target: activeExcludingCurrent.target,
        limit: 0,
      }).total,
    [activeExcludingCurrent.category, activeExcludingCurrent.equipment, activeExcludingCurrent.target]
  );

  const activeFilters = useMemo(
    () => ({ category: selectedCategory, equipment: selectedEquipment, target: selectedTarget }),
    [selectedCategory, selectedEquipment, selectedTarget]
  );

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setActiveTab(
        selectedCategory !== 'all'
          ? 'category'
          : selectedEquipment !== 'all'
            ? 'equipment'
            : selectedTarget !== 'all'
              ? 'target'
              : 'category'
      );
    }
  }

  const dialogRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const handleOptionsKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = optionsRef.current;
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll('button'));
    if (buttons.length === 0) return;
    const currentIndex = buttons.indexOf(e.target as HTMLButtonElement);
    if (currentIndex === -1) return;

    let nextIndex: number | undefined;
    switch (e.key) {
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % buttons.length;
        break;
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = buttons.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const target = buttons[nextIndex];
    target.focus();
    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus inicial en el elemento enfocable (activación sin pérdida de ubicación)
    const focusables = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []).filter(
        (el) => !el.hasAttribute('disabled')
      );

    const firstFocusable = focusables()[0];
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      // Trampa de foco: Tab envuelve entre el primer y último elemento del sheet
      if (event.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;

        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey) {
          if (active === first || !dialogRef.current?.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else if (active === last || !dialogRef.current?.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  // Búsqueda dentro de la lista del tab activo (equipamiento/músculo tienen 20+ opciones).
  const level = levels[activeTab];
  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return level.options;
    return level.options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    );
  }, [query, level.options]);

  if (!open) return null;

  const tabIcon = (kind: ExerciseFilterKind) =>
    kind === 'category' ? (
      <Target className="w-4 h-4" />
    ) : kind === 'equipment' ? (
      <Dumbbell className="w-4 h-4" />
    ) : (
      <Crosshair className="w-4 h-4" />
    );

  const activeSelections: { kind: ExerciseFilterKind; label: string }[] = [];
  if (selectedCategory !== 'all') {
    activeSelections.push({
      kind: 'category',
      label: categories.find((o) => o.id === selectedCategory)?.label ?? selectedCategory,
    });
  }
  if (selectedEquipment !== 'all') {
    activeSelections.push({
      kind: 'equipment',
      label: equipment.find((o) => o.id === selectedEquipment)?.label ?? selectedEquipment,
    });
  }
  if (selectedTarget !== 'all') {
    activeSelections.push({
      kind: 'target',
      label: targets.find((o) => o.id === selectedTarget)?.label ?? selectedTarget,
    });
  }

  return (
    <div
      className="md:hidden fixed inset-0 z-[70] flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-fadeIn"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de la biblioteca"
        className="bg-[#0A0A0A] border border-white/10 border-b-0 rounded-t-[28px] shadow-2xl flex flex-col max-h-[85vh] animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + Header */}
        <div className="p-4 pb-0 flex flex-col gap-3">
          <div className="w-10 h-1.5 rounded-full bg-white/20 mx-auto" />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
                Filtrar por
              </p>
              <h2 className="text-lg font-black tracking-tight text-white">
                {level.title}
                <span className="ml-2 text-xs font-bold text-[#C0FF00]">
                  {formatNumber(filteredCount)} resultados
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar filtros"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs: acceso directo a cualquier dimensión, sin orden forzado */}
          <div
            role="tablist"
            aria-label="Dimensiones de filtro"
            className="grid grid-cols-3 gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.kind;
              const tabHasActive =
                (tab.kind === 'category' && selectedCategory !== 'all') ||
                (tab.kind === 'equipment' && selectedEquipment !== 'all') ||
                (tab.kind === 'target' && selectedTarget !== 'all');
              return (
                <button
                  key={tab.kind}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={tab.label}
                  onClick={() => setActiveTab(tab.kind)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#C0FF00] text-black shadow-[0_0_16px_rgba(192,255,0,0.25)]'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tabIcon(tab.kind)}
                  <span>{tab.label}</span>
                  {tabHasActive && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C0FF00]" />}
                </button>
              );
            })}
          </div>

          {/* Chips resumen de la selección activa con descarte individual */}
          {hasActive && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
              {activeSelections.map((sel) => (
                <Chip
                  key={sel.kind}
                  label={sel.label}
                  size="md"
                  onRemove={() => levels[sel.kind].onSelect('all')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Options list del tab activo */}
        <div role="tabpanel" className="flex-1 overflow-y-auto px-4 pb-2 pt-3 space-y-2 animate-sheet-fade">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Buscar en ${level.title.toLowerCase()}...`}
              aria-label={`Buscar en ${level.title.toLowerCase()}`}
              className="w-full pl-10 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#C0FF00] focus:ring-1 focus:ring-[#C0FF00] transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div ref={optionsRef} onKeyDown={handleOptionsKeyDown} className="space-y-2">
          <FilterRowButton
            emoji="✨"
            imageUrl=""
            label={level.allLabel}
            query={query}
            count={filteredAllCount}
            isSelected={level.selected === 'all'}
            onSelect={() => handleSelection('all', level)}
            allChip
          />
          {filteredOptions.length === 0 ? (
            <p className="text-center text-xs text-white/40 py-6">
              Sin opciones para "{query.trim()}"
            </p>
          ) : (
            filteredOptions.map((opt, idx) => {
              const preview = getFilterOptionPreview(level.kind, opt.id, activeFilters);
              const isSelected = level.selected === opt.id;
              return (
                <FilterRowButton
                  key={`${level.kind}-${opt.id}`}
                  emoji={getRowEmoji(level.kind, opt.id)}
                  imageUrl={preview.imageUrl}
                  label={opt.label}
                  query={query}
                  count={preview.count}
                  isSelected={isSelected}
                  onSelect={() => handleSelection(opt.id, level)}
                  style={{ animationDelay: `${idx * 25}ms` }}
                />
              );
            })
          )}
          </div>
        </div>

        {/* Footer: aplicar en cualquier dimensión o restablecer */}
        <div className="p-4 pt-3 border-t border-white/10 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#C0FF00] text-black text-sm font-black shadow-[0_0_20px_rgba(192,255,0,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Listo · {formatNumber(filteredCount)} ejercicios
          </button>
          <button
            onClick={onReset}
            disabled={!hasActive}
            className={`flex items-center justify-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
              hasActive ? 'bg-white/10 text-[#C0FF00]' : 'bg-white/5 text-white/30'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer filtros
          </button>
        </div>
      </div>
    </div>
  );
};

interface FilterRowButtonProps {
  emoji: string;
  imageUrl: string;
  label: string;
  query: string;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
  allChip?: boolean;
  style?: React.CSSProperties;
}

const FilterRowButton: React.FC<FilterRowButtonProps> = ({
  emoji,
  imageUrl,
  label,
  query,
  count,
  isSelected,
  onSelect,
  allChip,
  style,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={style}
      aria-label={label}
      aria-pressed={isSelected}
      className={`w-full flex items-center gap-3 p-2.5 pr-3 rounded-2xl border text-left transition-all animate-sheet-fade active:scale-[0.98] ${
        isSelected
          ? 'bg-[#C0FF00]/10 border-[#C0FF00] ring-1 ring-[#C0FF00]'
          : 'bg-white/[0.03] border-white/10'
      }`}
    >
      <span className="relative w-[52px] h-[52px] shrink-0 rounded-xl bg-[#121212] border border-white/10 overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <span className="text-2xl leading-none">{emoji}</span>
        )}
        {emoji && (
          <span className="absolute bottom-0.5 right-0.5 text-xs leading-none drop-shadow-md">
            {emoji}
          </span>
        )}
      </span>
      <span className="flex-1 flex flex-col min-w-0">
        <span
          className={`text-sm font-bold truncate ${
            isSelected ? 'text-[#C0FF00]' : allChip ? 'text-[#C0FF00]' : 'text-white'
          }`}
        >
          {allChip ? '✨ ' : ''}
          <Highlight text={label} query={query} />
        </span>
        <span className="text-[11px] text-white/45">{formatNumber(count)} ejercicios</span>
      </span>
      {isSelected && <Check className="w-5 h-5 text-[#C0FF00] shrink-0" />}
    </button>
  );
};