import React from 'react';
import { ShieldAlert, X, AlertTriangle, HeartPulse, CheckCircle2 } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0A0A0A] border border-white/15 rounded-[28px] max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Consideraciones de Seguridad y Salud</h3>
            <p className="text-xs text-white/50">FitAI Coach • Responsabilidad Médica y Deportiva</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-white/70 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200 text-xs uppercase tracking-wider mb-1">
                Aviso Médico Importante
              </p>
              <p className="text-xs text-amber-100/80">
                FitAI Coach es una herramienta de orientación y seguimiento deportivo. No sustituye en ningún caso la evaluación o criterio de un médico, fisioterapeuta, cardiólogo o entrenador presencial certificado.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#C0FF00] shrink-0 mt-1" />
              <p className="text-xs">
                <strong className="text-white">Recomendaciones orientativas:</strong> Todas las sugerencias de cargas, descansos y ejercicios son estimaciones basadas en algoritmos deportivos y deben adaptarse a tu capacidad real del día.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <HeartPulse className="w-4 h-4 text-red-400 shrink-0 mt-1" />
              <p className="text-xs">
                <strong className="text-white">Detente ante el dolor o malestar:</strong> Si experimentas dolor agudo, pinchazos articulares, mareo, opresión torácica o falta de aire, interrumpe el ejercicio de forma inmediata.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#C0FF00] shrink-0 mt-1" />
              <p className="text-xs">
                <strong className="text-white">Condiciones previas o lesiones:</strong> Si tienes historial de hernias, tendinopatías, hipertensión o cirugías recientes, consulta con tu especialista antes de realizar sobrecarga progresiva.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#C0FF00] shrink-0 mt-1" />
              <p className="text-xs">
                <strong className="text-white">Criterio con la IA:</strong> La información generada por modelos de inteligencia artificial debe revisarse siempre con sentido común y prudencia biomecánica.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#C0FF00] text-black font-bold text-sm rounded-xl hover:bg-[#aee600] transition-colors shadow-lg"
          >
            Entendido y Acepto las Condiciones
          </button>
        </div>
      </div>
    </div>
  );
};
