import React, { useState } from 'react';
import { X, Play, Sparkles, Plus, ExternalLink } from 'lucide-react';
import { DatasetExercise } from '../../types';
import {
  getExerciseGifUrl,
  translateTarget,
  translateCategory,
  translateEquipment,
  DATASET_GITHUB_REPO,
} from '../../services/exerciseDatabaseService';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

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
            <div className="text-xs text-white/50 mt-1 space-y-0.5">
              <p>
                Región corporal:{' '}
                <span className="text-white/80 font-medium capitalize">
                  {translateCategory(exercise.body_part)}
                </span>
              </p>
              <p>
                Equipamiento:{' '}
                <span className="text-white/80 font-medium">
                  {translateEquipment(exercise.equipment)}
                </span>
              </p>
            </div>
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