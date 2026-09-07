import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/useApp';
import { FREQUENT_COACH_QUESTIONS } from '../data/mockCoach';

export const CoachAIView: React.FC = () => {
  const { chatMessages, sendCoachMessage, isCoachTyping, navigateTo, user } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isCoachTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendCoachMessage(inputText.trim());
    setInputText('');
  };

  const handleChipClick = (question: string) => {
    sendCoachMessage(question);
  };

  return (
    <div className="flex-1 p-4 sm:p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full h-[calc(100vh-2rem)] relative">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C0FF00]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header Card */}
      <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-[28px] flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C0FF00] flex items-center justify-center text-black shadow-[0_0_20px_rgba(192,255,0,0.3)]">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">FitAI Coach</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#C0FF00]/20 text-[#C0FF00] text-[10px] font-bold">
                Online
              </span>
            </div>
            <p className="text-xs text-white/50">
              Asistente de entrenamiento personal • Contexto: {user.name} ({user.primaryGoal})
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-[#C0FF00]" />
          <span>Consejos basados en hipertrofia y seguridad</span>
        </div>
      </div>

      {/* Suggestions / Prompt Chips Bar */}
      <div className="shrink-0 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-1">
          Preguntas Rápidas Frecuentes
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FREQUENT_COACH_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(q)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/80 border border-white/10 shrink-0 whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C0FF00]" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xl">
        {chatMessages.map((msg) => {
          const isCoach = msg.sender === 'coach';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {isCoach ? (
                <div className="w-8 h-8 rounded-xl bg-[#C0FF00] text-black flex items-center justify-center shrink-0 text-sm font-black mt-1">
                  AI
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                  CR
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isCoach
                    ? 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                    : 'bg-[#C0FF00] text-black font-semibold rounded-tr-sm shadow-md'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.suggestedAction && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => navigateTo(msg.suggestedAction!.screen)}
                      className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#C0FF00] font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <span
                  className={`text-[9px] block mt-1 text-right ${
                    isCoach ? 'text-white/30' : 'text-black/50'
                  }`}
                >
                  {msg.timestamp}
                </span>

                {isCoach && msg.source && (
                  <span
                    className="text-[9px] block mt-0.5 text-right text-white/25"
                    title="Origen de la respuesta"
                  >
                    {msg.source === 'llm'
                      ? 'LLM'
                      : msg.source === 'engine'
                        ? 'servidor'
                        : 'mot. local'}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isCoachTyping && (
          <div className="flex gap-3 mr-auto max-w-[80%] items-center animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-[#C0FF00] text-black flex items-center justify-center text-sm font-black">
              AI
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C0FF00] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#C0FF00] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#C0FF00] animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-white/40 ml-1">
                FitAI Coach analizando tu progreso...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="shrink-0 flex items-center gap-2 bg-[#0A0A0A] border border-white/10 p-2 sm:p-2.5 rounded-2xl shadow-2xl"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe tu consulta sobre técnica, pesos o adaptación de rutina..."
          className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none placeholder:text-white/30"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isCoachTyping}
          className="px-4 py-3 bg-[#C0FF00] text-black font-black rounded-xl hover:bg-[#aee600] transition-transform active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center gap-1.5 text-xs shadow-md"
        >
          <span className="hidden sm:inline">Enviar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
