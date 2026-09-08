import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { Exercise } from '../../types';

// --- Fila de ejercicio: correcto y minimal, con detalles expandibles.
export interface RoutineExerciseRowProps {
  exercise: Exercise;
  index: number;
  canRemove: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
}

export const RoutineExerciseRow: React.FC<RoutineExerciseRowProps> = ({
  exercise: ex,
  index,
  canRemove,
  isExpanded,
  onToggleExpand,
  onRemove,
}) => {
  return (
    <div className="bg-white/70 border border-black/5 rounded-[20px] overflow-hidden">
      <div className="p-4 flex flex-wrap items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-black/5 flex items-center justify-center font-black text-xs text-amber-600 shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black capitalize truncate">{ex.name}</h4>
          <p className="text-[11px] text-slate-500">
            {ex.sets} × {ex.reps} • {ex.suggestedWeightKg} kg • descanso {ex.restSeconds}s •{' '}
            {ex.primaryMuscle}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleExpand}
            className="px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
          >
            Detalles
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {canRemove && (
            <button
              onClick={onRemove}
              className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Quitar de la rutina"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 animate-sheet-fade">
          <p className="text-xs bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-slate-700">
            <strong>Cue del Coach:</strong> "{ex.technicalCue}"
          </p>
          {ex.fullInstructions.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Cómo ejecutarlo
              </p>
              <ol className="space-y-1.5">
                {ex.fullInstructions.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black shrink-0 mt-px">
                      {i + 1}
                    </span>
                    {ins}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {ex.commonMistakes.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1.5">
                Errores a evitar
              </p>
              <ul className="space-y-1">
                {ex.commonMistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="text-red-400 font-bold">•</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};