import React from 'react';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Activity,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const { navigateTo, loginDemoUser } = useApp();

  return (
    <div className="min-h-screen bg-[#050505] text-[#F3F4F6] relative overflow-hidden flex flex-col">
      {/* Background glow auras */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#C0FF00]/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C0FF00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(192,255,0,0.3)]">
              <Zap className="w-6 h-6 text-black fill-current" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              FitAI <span className="text-[#C0FF00]">Coach</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="landing-btn-login"
              onClick={() => navigateTo('auth')}
              className="px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              Iniciar Sesión
            </button>
            <button
              id="landing-btn-demo"
              onClick={loginDemoUser}
              className="px-5 py-2.5 text-sm font-bold bg-white/10 text-[#C0FF00] border border-[#C0FF00]/30 hover:bg-[#C0FF00]/10 rounded-xl transition-all hidden sm:flex items-center gap-2"
            >
              <span>Demo Carlos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="landing-btn-register"
              onClick={() => navigateTo('onboarding')}
              className="px-6 py-2.5 text-sm font-black bg-[#C0FF00] text-black rounded-xl hover:bg-[#aee600] transition-transform hover:scale-105 shadow-[0_0_30px_rgba(192,255,0,0.3)]"
            >
              Comenzar Gratis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#C0FF00] mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Plataforma PaaS de Entrenamiento Inteligente</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl leading-[1.1] mb-6">
          Tu entrenador inteligente para <span className="text-[#C0FF00]">entrenar mejor</span>, medir tu progreso y alcanzar tus objetivos.
        </h1>

        <p className="text-lg sm:text-xl text-white/60 max-w-2xl font-normal leading-relaxed mb-10">
          Supera el estancamiento en el gimnasio con rutinas hiper-personalizadas por IA, cálculo dinámico de sobrecarga progresiva y un asistente virtual que adapta cada serie en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
          <button
            id="hero-btn-start"
            onClick={() => navigateTo('onboarding')}
            className="px-8 py-4 bg-[#C0FF00] text-black font-black text-base rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(192,255,0,0.35)] flex items-center justify-center gap-3"
          >
            <span>Crear Mi Rutina con IA</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            id="hero-btn-test-drive"
            onClick={loginDemoUser}
            className="px-8 py-4 bg-white/10 text-white border border-white/15 font-bold text-base rounded-2xl hover:bg-white/15 transition-all flex items-center justify-center gap-2"
          >
            <span>Explorar Prototipo (Carlos R.)</span>
          </button>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="w-full max-w-4xl bg-gradient-to-br from-white/10 to-transparent p-[1px] rounded-[32px] shadow-2xl">
          <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-[31px] p-6 sm:p-10 text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7">
              <span className="px-3 py-1 bg-[#C0FF00]/10 text-[#C0FF00] text-[11px] font-bold uppercase rounded-full tracking-wider">
                Rutina Generada por FitAI
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3 mb-2 italic">EMPUJE DINÁMICO</h2>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Diseñada específicamente para hipertrofia de pectoral y tríceps con protección del manguito rotador y descansos óptimos de 90s.
              </p>
              <div className="flex items-center gap-4 text-xs text-white/50">
                <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#C0FF00]" /> 6 Ejercicios</span>
                <span>•</span>
                <span>65 Minutos</span>
                <span>•</span>
                <span className="text-[#C0FF00] font-semibold">RPE 8 Óptimo</span>
              </div>
            </div>

            <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-white/40 uppercase tracking-wider font-semibold">Ejercicio Actual</span>
                <span className="text-[#C0FF00] font-bold">Serie 2 de 4</span>
              </div>
              <p className="font-bold text-base text-white">Press de Banca con Barra</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase">Carga Sugerida</p>
                  <p className="text-lg font-black text-white">82.5 kg</p>
                </div>
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase">Rango Objetivo</p>
                  <p className="text-lg font-black text-[#C0FF00]">8-10 reps</p>
                </div>
              </div>
              <p className="text-[11px] text-white/50 italic bg-white/5 p-2 rounded-lg">
                💡 "Ajuste de +2.5 kg aplicado por tu buen RPE de ayer."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C0FF00] font-bold mb-2">Paso a Paso</p>
          <h2 className="text-3xl sm:text-4xl font-black">¿Cómo funciona FitAI Coach?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[28px] p-8 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black text-[#C0FF00] mb-6">
              01
            </div>
            <h3 className="text-xl font-bold mb-3">1. Perfil & Objetivos</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Indica tu experiencia, días disponibles, equipo en tu gimnasio y si tienes limitaciones o lesiones previas para proteger tus articulaciones.
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-[28px] p-8 relative overflow-hidden group hover:border-[#C0FF00]/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#C0FF00]/10 flex items-center justify-center text-xl font-black text-[#C0FF00] mb-6">
              02
            </div>
            <h3 className="text-xl font-bold mb-3">2. Rutina Adaptativa con IA</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              El motor algorítmico genera una planificación balanceada con selección de ejercicios, repeticiones, pesos iniciales y tiempos de descanso óptimos.
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-[28px] p-8 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black text-[#C0FF00] mb-6">
              03
            </div>
            <h3 className="text-xl font-bold mb-3">3. Registro en Vivo & Feedback</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Usa el modo entrenamiento activo en el gimnasio. Registra series, usa el cronómetro de descanso y recibe ajustes inmediatos para la próxima sesión.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#C0FF00] font-bold mb-2">Ventajas Clave</p>
          <h2 className="text-3xl sm:text-4xl font-black">¿Por qué entrenar con FitAI Coach?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base mb-2">Sobrecarga Progresiva</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Cálculo automático de cuándo subir peso o repeticiones evitando el estancamiento muscular.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-[#C0FF00]/10 text-[#C0FF00] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base mb-2">Prevención de Lesiones</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Cues técnicos y alternativas inmediatas si sientes molestias articulares o fatiga extrema.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base mb-2">Métricas y Récords (PRs)</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Visualiza el volumen levantado, evolución de peso y récords históricos en gráficos limpios.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-[24px] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base mb-2">Coach en tu Bolsillo 24/7</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Pregunta dudas de biomecánica, tiempos o alternativas en el gimnasio sin esperar a nadie.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full text-center">
        <div className="bg-gradient-to-br from-white/10 via-[#0A0A0A] to-transparent p-10 sm:p-14 rounded-[36px] border border-white/15 relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            ¿Listo para llevar tu entrenamiento al siguiente nivel?
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Únete a la plataforma que combina la ciencia de la hipertrofia con la precisión de la inteligencia artificial.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('onboarding')}
              className="w-full sm:w-auto px-8 py-4 bg-[#C0FF00] text-black font-black text-base rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(192,255,0,0.3)]"
            >
              Comenzar Onboarding Gratis
            </button>
            <button
              onClick={loginDemoUser}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-bold text-base rounded-2xl hover:bg-white/20 transition-all"
            >
              Probar Prototipo con Datos Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 px-6 text-center text-xs text-white/40">
        <p>© 2026 FitAI Coach. Prototipo PaaS de entrenamiento con Inteligencia Artificial.</p>
        <p className="mt-1">
          Aviso: Las recomendaciones son orientativas y no reemplazan la valoración de un profesional de la salud.
        </p>
      </footer>
    </div>
  );
};
