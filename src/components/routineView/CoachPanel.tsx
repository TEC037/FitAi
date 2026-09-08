import React, { useState } from 'react';
import { Bot, ChevronDown, X, Send } from 'lucide-react';
import { useApp } from '../../context/useApp';

// --- Panel Coach IA unificado en Rutina.
const FREQUENT_QUESTIONS = [
  '¿Cuántos días debo entrenar esta semana?',
  '¿Cómo evito el estancamiento en mis pesos?',
  '¿Qué hago si siento dolor en una articulación?',
];

export const CoachPanel: React.FC = () => {
  const { chatMessages, sendCoachMessage, isCoachTyping, user } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full metal-card rounded-[24px] p-5 flex items-center justify-between gap-3 hover:scale-[1.005] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-lime-100 flex items-center justify-center text-[#547c08]">
            <Bot className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-sm font-black">Coach IA</p>
            <p className="text-xs text-slate-500">
              Consejos de técnica, series y descansos en un solo lugar.
            </p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-slate-400" />
      </button>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendCoachMessage(input.trim());
    setInput('');
  };

  return (
    <div className="metal-card rounded-[24px] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-lime-100 flex items-center justify-center text-[#547c08]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black">Coach IA</p>
            <p className="text-[11px] text-slate-500">Contexto: {user.name} · {user.primaryGoal}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-2 rounded-full bg-slate-100 text-slate-500"
          aria-label="Cerrar Coach IA"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FREQUENT_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendCoachMessage(q)}
            className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-[11px] font-bold text-slate-600 whitespace-nowrap hover:border-amber-300 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="bg-white/70 border border-black/5 rounded-2xl p-3 h-48 overflow-y-auto space-y-2">
        {chatMessages.length === 0 && (
          <p className="text-xs text-slate-400 text-center pt-6">
            Pregúntale al Coach IA lo que necesites sobre tu entrenamiento.
          </p>
        )}
        {chatMessages.slice(-20).map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#C0FF00] text-black font-semibold rounded-br-sm'
                  : 'bg-white border border-black/5 text-slate-700 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isCoachTyping && (
          <div className="text-xs text-slate-400 italic">El Coach IA está pensando…</div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          className="flex-1 rounded-full bg-white border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-full bg-[#C0FF00] text-black flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Enviar al Coach"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};