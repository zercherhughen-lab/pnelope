import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Shield,
  Key,
  Bot,
  Zap,
  Lock,
  Layers,
  Sparkles,
  Server,
  FileCode,
  Globe,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { VapeLogo } from '../components/VapeLogo';
import { toast } from 'sonner';

export const Landing: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await demoLogin();
      toast.success('¡Autenticado con Google exitosamente!');
      navigate('/dashboard');
    } catch (e) {
      toast.error('Error al ingresar con Google');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0a] text-zinc-100 flex flex-col font-sans relative selection:bg-transparent overflow-x-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1e15_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1e15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-3">
          <VapeLogo height={26} />
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-[11px] text-zinc-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>API Online</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs text-zinc-400 font-medium">
          <Link to="/services" className="hover:text-white transition-colors">Servicios</Link>
          <Link to="/licenses" className="hover:text-white transition-colors">Licencias</Link>
          <Link to="/settings" className="hover:text-white transition-colors">Discord Bot</Link>
          <Link to="/docs" className="hover:text-white transition-colors">Documentación</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <span>Ir al Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs text-zinc-400 hover:text-white font-medium px-2 py-1.5 transition-colors hidden sm:inline-block"
              >
                Iniciar Sesión
              </Link>
              <button
                onClick={handleGoogleLogin}
                className="bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continuar con Google</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-16 pb-24 space-y-16 relative z-10">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-3xl mx-auto">
          {/* Cyber Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider">PROTECCIÓN SHA-256 • LICENCIAS CLOUD • DISCORD BOT</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            Cloud Licensing, HWID Lock & Bot Automation.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Protege tus loaders, aplicaciones y ejecutables con verificación en tiempo real, bloqueo de hardware SHA-256, auto-reset de HWID y conexión directa con tu bot oficial de Discord.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleGoogleLogin}
              className="bg-white text-zinc-950 hover:bg-zinc-200 px-7 py-3.5 rounded-xl font-bold flex items-center gap-2.5 transition-all text-xs shadow-xl active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continuar con Google</span>
            </button>

            <Link
              to="/dashboard"
              className="border border-white/15 bg-white/5 hover:bg-white/10 text-white px-7 py-3.5 rounded-xl font-bold transition-all text-xs flex items-center gap-2 active:scale-95 shadow-sm"
            >
              <span>Abrir Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Interactive Response Preview Box */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#111110] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-950/80 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-zinc-300 font-semibold">POST /api/verify</span>
              <span className="text-zinc-500">HTTP/2 200 OK • 24ms</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">SHA-256 Cryptography</span>
          </div>

          <pre className="p-5 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed bg-[#0c0c0b]">
            <code>{`{
  "valid": true,
  "service": "Vape",
  "user": {
    "username": "edgy",
    "rank": "Developer VIP",
    "status": "active"
  },
  "hardware": {
    "hwid": "HWID-8FA2-11C0-99E4",
    "lock": "VERIFIED_LOCKED"
  },
  "discord": {
    "bot_synced": true,
    "role": "Cliente"
  }
}`}</code>
          </pre>
        </div>

        {/* Feature Cards Grid (In Pure Black, White, and Sleek Gray with Improved Monochrome Icons) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-[#111110] p-6 space-y-3.5 hover:border-white/20 transition-colors">
            <div className="flex size-[40px] items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-white">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Hardware Lock (HWID)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Huella digital única por equipo que previene fugas de software y duplicación no autorizada.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111110] p-6 space-y-3.5 hover:border-white/20 transition-colors">
            <div className="flex size-[40px] items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Ecosistema Discord Bot</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Comandos <code className="text-white font-mono">/claim</code> y <code className="text-white font-mono">/resethwid</code> con límite de 1 cuenta y verificación de rol.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111110] p-6 space-y-3.5 hover:border-white/20 transition-colors">
            <div className="flex size-[40px] items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-white">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Serverless Instantáneo</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Respuestas instantáneas en Vercel Edge con tolerancia a fallos y sin tiempos de espera.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-zinc-500 relative z-10 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-4">
        <div className="flex items-center gap-2">
          <VapeLogo height={20} />
          <span>&copy; 2026 Vape Platform. Todos los derechos reservados.</span>
        </div>
        <div className="flex items-center gap-5 text-zinc-400">
          <Link to="/home" className="hover:text-white transition-colors">Inicio</Link>
          <Link to="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link>
          <Link to="/register" className="hover:text-white transition-colors">Crear Cuenta</Link>
          <Link to="/docs" className="hover:text-white transition-colors">Documentación</Link>
          <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
