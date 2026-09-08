import React from 'react';
import { Search, X, RotateCcw, ArrowUpDown, Star } from 'lucide-react';
import { IllustratedFilterRow } from '../IllustratedFilter';
import { ExerciseMeta, ResultSortOrder } from './types';

export const SortSelect: React.FC<{
  sortOrder: ResultSortOrder;
  onSortChange: (sort: ResultSortOrder) => void;
  compact?: boolean;
}> = ({ sortOrder, onSortChange, compact }) => (
  <label className="flex items-center gap-1.5 shrink-0">
    <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
    <select
      aria-label="Ordenar resultados por"
      value={sortOrder}
      onChange={(e) => onSortChange(e.target.value as ResultSortOrder)}
      className="bg-[#0A0A0A] border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C0FF00] transition-colors cursor-pointer"
    >
      <option value="relevance">Relevancia</option>
      <option value="name">{compact ? 'A-Z' : 'Nombre (A-Z)'}</option>
      <option value="name-desc">{compact ? 'Z-A' : 'Nombre (Z-A)'}</option>
    </select>
  </label>
);

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
  sortOrder: ResultSortOrder;
  favoritesActive: boolean;
  favoriteCount: number;
  onToggleFavorites: () => void;
  onSortChange: (sort: ResultSortOrder) => void;
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
  sortOrder,
  favoritesActive,
  favoriteCount,
  onToggleFavorites,
  onSortChange,
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
          aria-label="Buscar por nombre, músculo o equipamiento"
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

      {/* Filtros ilustrados con foto real del ejercicio representativo */}
      <IllustratedFilterRow
        id="filter-category"
        title="Grupo Muscular / Región"
        kind="category"
        options={categories}
        selected={selectedCategory}
        onSelect={onCategoryChange}
        allLabel="Todos"
        activeCategory={selectedCategory}
        activeEquipment={selectedEquipment}
        activeTarget={selectedTarget}
      />

      <div className="flex flex-col gap-4 pt-2 border-t border-white/5">
        <IllustratedFilterRow
          id="filter-equipment"
          title="Equipamiento Disponible"
          kind="equipment"
          options={equipmentList}
          selected={selectedEquipment}
          onSelect={onEquipmentChange}
          allLabel="Cualquier equipamiento"
          activeCategory={selectedCategory}
          activeEquipment={selectedEquipment}
          activeTarget={selectedTarget}
          visibleLimit={9}
        />

        <IllustratedFilterRow
          id="filter-target"
          title="Músculo Objetivo"
          kind="target"
          options={targets}
          selected={selectedTarget}
          onSelect={onTargetChange}
          allLabel="Cualquier músculo"
          activeCategory={selectedCategory}
          activeEquipment={selectedEquipment}
          activeTarget={selectedTarget}
          visibleLimit={9}
        />
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between gap-3 text-xs text-white/50 pt-1 flex-wrap">
        <span aria-live="polite" aria-atomic="true">
          Mostrando <strong>{visibleCount}</strong> de <strong>{filteredCount}</strong> ejercicios
          encontrados
        </span>
        <span className="flex items-center gap-3">
          {(selectedCategory !== 'all' ||
            selectedEquipment !== 'all' ||
            selectedTarget !== 'all' ||
            searchQuery) && (
            <button
              onClick={onReset}
              className="text-[#C0FF00] hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer Filtros
            </button>
          )}
          <button
            onClick={onToggleFavorites}
            aria-pressed={favoritesActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              favoritesActive
                ? 'bg-amber-300/15 text-amber-200 border-amber-300/40'
                : 'text-white/70 border-white/10 hover:bg-white/5'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${favoritesActive ? 'fill-amber-300 text-amber-200' : ''}`}
            />
            Favoritos
            {favoriteCount > 0 && (
              <span className="px-1.5 rounded-full bg-amber-300/20 text-amber-200 text-[10px] font-black">
                {favoriteCount}
              </span>
            )}
          </button>
          <SortSelect sortOrder={sortOrder} onSortChange={onSortChange} />
          <span className="text-[11px] text-white/40 hidden lg:inline">
            Pasa el cursor sobre una tarjeta para ver la animación en GIF
          </span>
        </span>
      </div>
    </div>
  );
};