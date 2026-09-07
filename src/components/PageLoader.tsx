import React from 'react';
import { Dumbbell } from 'lucide-react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#050505]">
      <div className="w-12 h-12 rounded-2xl bg-[#C0FF00]/10 border border-[#C0FF00]/30 flex items-center justify-center animate-pulse">
        <Dumbbell className="w-6 h-6 text-[#C0FF00]" />
      </div>
      <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#C0FF00] rounded-full animate-pulse" style={{ width: '40%' }} />
      </div>
      <p className="text-xs text-white/50 font-semibold uppercase tracking-widest">
        Cargando módulo...
      </p>
    </div>
  );
};
