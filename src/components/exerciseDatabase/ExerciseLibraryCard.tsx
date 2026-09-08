import React, { useState } from 'react';
import { Play, Info, Plus, Check, Star } from 'lucide-react';
import { DatasetExercise, DailyRoutine } from '../../types';
import { useFavorites } from '../../hooks/useFavorites';
import {
  getExerciseGifUrl,
  getExerciseImageUrl,
  translateTarget,
  translateCategory,
  translateEquipment,
} from '../../services/exerciseDatabaseService';
import { Highlight } from '../Highlight';

interface ExerciseLibraryCardProps {
  exercise: DatasetExercise;
  routines: DailyRoutine[];
  searchQuery: string;
  onInspect: (exercise: DatasetExercise) => void;
  onAddToRoutine: (exercise: DatasetExercise, dayNumber: number) => void;
}

export const ExerciseLibraryCard: React.FC<ExerciseLibraryCardProps> = ({
  exercise,
  routines,
  searchQuery,
  onInspect,
  onAddToRoutine,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [wasJustAdded, setWasJustAdded] = useState<boolean>(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const fav = isFavorite(exercise.id);

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

        {/* Favorito */}
        <button
          onClick={() => toggleFavorite(exercise.id)}
          aria-pressed={fav}
          aria-label={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          title={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-colors"
        >
          <Star className={`w-4 h-4 ${fav ? 'fill-amber-300 text-amber-300' : 'text-white/70'}`} />
        </button>

        {/* Quick inspect button */}
        <button
          onClick={() => onInspect(exercise)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
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
            <Highlight text={exercise.name} query={searchQuery} />
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