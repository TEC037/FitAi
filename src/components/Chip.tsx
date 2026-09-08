import React from 'react';
import { X } from 'lucide-react';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  /** 'sm' = chips de filtros compactos; 'md' = chips resumen dentro del sheet. */
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({ label, onRemove, size = 'sm' }) => (
  <span
    className={`shrink-0 inline-flex items-center gap-1 font-bold px-2.5 rounded-full bg-[#C0FF00]/15 text-[#C0FF00] border border-[#C0FF00]/30 capitalize ${
      size === 'sm' ? 'text-[10px] py-1' : 'text-[11px] py-1.5'
    }`}
  >
    {label}
    {onRemove && (
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="hover:text-white transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </span>
);