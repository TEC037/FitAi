import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Dumbbell, Sparkles, X } from 'lucide-react';
import {
  getFilterOptionPreview,
  searchExercises,
  ExerciseFilterKind,
} from '../services/exerciseDatabaseService';
import { formatNumber } from '../utils/format';

export interface IllustratedFilterRowProps {
  id: string;
  title: string;
  kind: ExerciseFilterKind;
  options: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  allLabel: string;
  /** Número máximo de opciones visibles antes del botón "Ver todas" (progressive disclosure). */
  visibleLimit?: number;
  /** Filtros activos de las demás dimensiones, para conteos cruzados en vivo. */
  activeCategory?: string;
  activeEquipment?: string;
  activeTarget?: string;
}

/**
 * Fila de filtros ilustrados: cada opción muestra la foto real de un ejercicio
 * representativo del dataset (p. ej. la máquina, la pelota fitball o la barra)
 * junto a su etiqueta y el número de ejercicios, para que se entienda y se
 * encuentre lo que se busca en el gimnasio sin leer catálogos.
 */
export const IllustratedFilterRow: React.FC<IllustratedFilterRowProps> = ({
  id,
  title,
  kind,
  options,
  selected,
  onSelect,
  allLabel,
  visibleLimit,
  activeCategory,
  activeEquipment,
  activeTarget,
}) => {
  const [showAll, setShowAll] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const handleRowKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = rowRef.current;
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll('button'));
    if (buttons.length === 0) return;
    const currentIndex = buttons.indexOf(e.target as HTMLButtonElement);
    if (currentIndex === -1) return;

    let nextIndex: number | undefined;
    switch (e.key) {
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        break;
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % buttons.length;
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
      target.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
  }, []);
  const previews = useMemo(() => {
    const map: Record<string, { imageUrl: string; count: number }> = {};
    const active = {
      category: activeCategory,
      equipment: activeEquipment,
      target: activeTarget,
    };
    for (const opt of options) {
      map[opt.id] = getFilterOptionPreview(kind, opt.id, active);
    }
    return map;
  }, [kind, options, activeCategory, activeEquipment, activeTarget]);

  // Total del chip "Todo": otras dimensiones activas con esta dimensión en "todas".
  const allCount = useMemo(
    () =>
      searchExercises({
        category: kind === 'category' ? 'all' : (activeCategory ?? 'all'),
        equipment: kind === 'equipment' ? 'all' : (activeEquipment ?? 'all'),
        target: kind === 'target' ? 'all' : (activeTarget ?? 'all'),
        limit: 0,
      }).total,
    [kind, activeCategory, activeEquipment, activeTarget]
  );

  const hasMore = typeof visibleLimit === 'number' && options.length > visibleLimit;
  const displayOptions = showAll || !hasMore ? options : options.slice(0, visibleLimit);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-white/40 font-bold">
          {title}
        </span>
        {selected !== 'all' && (
          <button
            type="button"
            onClick={() => onSelect('all')}
            aria-label={`Borrar filtro ${title}`}
            className="flex items-center gap-1 text-[10px] font-bold text-[#C0FF00] hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
            Quitar
          </button>
        )}
      </div>
      <div
        ref={rowRef}
        onKeyDown={handleRowKeyDown}
        className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1"
      >
        <button
          type="button"
          onClick={() => onSelect('all')}
          aria-label={`${allLabel} (${allCount} ejercicios)`}
          aria-pressed={selected === 'all'}
          className={`flex items-center gap-2.5 rounded-2xl p-2 pr-3 border shrink-0 transition-all ${
            selected === 'all'
              ? 'bg-[#C0FF00]/10 border-[#C0FF00] ring-1 ring-[#C0FF00]'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <span className="w-11 h-11 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#C0FF00]" />
          </span>
          <span className="flex flex-col text-left">
            <span className={`text-xs font-bold ${selected === 'all' ? 'text-[#C0FF00]' : 'text-white'}`}>
              Todo
            </span>
            <span className="text-[10px] text-white/40">
              {allCount} ejercicios
            </span>
          </span>
          {selected === 'all' && (
            <Check className="w-3.5 h-3.5 text-[#C0FF00] shrink-0" />
          )}
        </button>

        {displayOptions.map((opt) => {
            const preview = previews[opt.id];
            const isSelected = selected === opt.id;
            return (
              <button
                key={`${id}-${opt.id}`}
                type="button"
                onClick={() => onSelect(opt.id)}
                aria-label={opt.label}
                aria-pressed={isSelected}
                className={`flex items-center gap-2.5 rounded-2xl p-2 pr-3 border shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#C0FF00]/10 border-[#C0FF00] ring-1 ring-[#C0FF00]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="w-11 h-11 rounded-xl bg-[#121212] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  {preview.imageUrl ? (
                    <img
                      src={preview.imageUrl}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <Dumbbell className="w-4 h-4 text-white/30" />
                  )}
                </span>
                <span className="flex flex-col text-left">
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#C0FF00]' : 'text-white'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-white/40">{preview.count} ejercicios</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#C0FF00] shrink-0" />}
              </button>
            );
          })}

          {hasMore && (
            <button
              key={`${id}-toggle-disclosure`}
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              aria-expanded={showAll}
              className="flex items-center gap-2.5 rounded-2xl p-2 pr-3 border border-dashed border-white/15 bg-white/[0.03] hover:bg-white/10 text-white/70 hover:text-white shrink-0 transition-all"
            >
              <span className="flex flex-col text-left min-w-[84px]">
                <span className="text-xs font-bold flex items-center gap-1">
                  {showAll ? 'Ver menos' : 'Ver todas'}
                  {showAll ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
                <span className="text-[10px] text-white/40">
                  {showAll ? 'Ocultar opciones' : `${formatNumber(options.length - (visibleLimit ?? 0))} más`}
                </span>
              </span>
            </button>
          )}
        </div>
    </div>
  );
};