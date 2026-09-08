import React, { useState } from 'react';
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/useApp';

export const AuthView: React.FC = () => {
  const { loginDemoUser, loginWithEmail, registerWithEmail } = useApp();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [recoverySent, setRecoverySent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const { error: authError } = await loginWithEmail(email, password);
    setIsSubmitting(false);
    if (authError) setError(authError);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Por favor completa todos los campos para registrarte.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe contener al menos 6 caracteres.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const { error: registerError } = await registerWithEmail(email, password, name);
    setIsSubmitting(false);
    if (registerError) setError(registerError);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor ingresa tu correo electrónico registrado.');
      return;
    }
    setError('');
    setRecoverySent(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-6 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background glow auras */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-amber-200/40 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-lime-200/40 blur-[130px] rounded-full pointer-events-none" />

      {/* Card container */}
      <div className="w-full max-w-md metal-card rounded-[32px] p-8 shadow-2xl relative z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-[#C0FF00] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(112,160,20,0.35)]">
            <Zap className="w-7 h-7 text-black fill-current" />
          </div>
          <h1 className="text-2xl font-black text-[#1d1d1f]">FitAI Coach</h1>
          <p className="text-xs text-slate-500 mt-1">
            Plataforma PaaS para entrenamiento inteligente
          </p>
        </div>

        {/* Tab switchers */}
        {tab !== 'forgot' && (
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mb-6">
            <button
              onClick={() => {
                setTab('login');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-[#C0FF00] text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setTab('register');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-[#C0FF00] text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos.ramirez@ejemplo.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/70">Contraseña</label>
                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot');
                    setError('');
                  }}
                  className="text-xs text-[#C0FF00] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-white/60">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#C0FF00] focus:ring-0"
                />
                <span>Recordarme en este dispositivo</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#C0FF00] text-black font-black text-sm rounded-xl hover:bg-[#aee600] transition-transform active:scale-[0.98] shadow-[0_0_25px_rgba(112,160,20,0.3)] mt-2 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Iniciar Sesión
            </button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10"></div>
              </div>
              <span className="relative px-3 bg-white text-[11px] text-slate-500 uppercase font-semibold">
                Acceso Rápido Prototipo
              </span>
            </div>

            <button
              type="button"
              onClick={loginDemoUser}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#C0FF00]" />
              <span>Acceder con Carlos Ramírez (Usuario Demo)</span>
            </button>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00] transition-colors"
                />
              </div>
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed">
              Al registrarte, pasarás al Onboarding de 5 pasos para calibrar tu rutina personalizada
              con el Coach IA.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#C0FF00] text-black font-black text-sm rounded-xl hover:bg-[#aee600] transition-transform active:scale-[0.98] shadow-[0_0_25px_rgba(112,160,20,0.3)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Continuar al Onboarding</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Recuperación de Contraseña</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Ingresa el correo asociado a tu cuenta y te enviaremos un enlace de restablecimiento
              seguro.
            </p>

            {recoverySent ? (
              <div className="p-4 rounded-2xl bg-[#C0FF00]/10 border border-[#C0FF00]/30 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#C0FF00] mx-auto" />
                <p className="text-xs font-bold text-white">¡Enlace simulado enviado!</p>
                <p className="text-[11px] text-white/70">
                  Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
                  <strong>{email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setTab('login');
                    setRecoverySent(false);
                  }}
                  className="mt-3 px-4 py-2 bg-[#C0FF00] text-black text-xs font-bold rounded-lg"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Correo Registrado
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu.correo@ejemplo.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#C0FF00] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#C0FF00] text-black font-black text-sm rounded-xl hover:bg-[#aee600] transition-transform active:scale-[0.98] shadow-[0_0_25px_rgba(192,255,0,0.3)]"
                >
                  Enviar Enlace de Recuperación
                </button>

                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="w-full py-2.5 text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancelar y volver
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
