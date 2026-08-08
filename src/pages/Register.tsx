import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { formatErr } from '../lib/api';
import { VapeLogo } from '../components/VapeLogo';
import { ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password);
      toast.success('Developer account created successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      await demoLogin();
      toast.success('Registered & authenticated with Google!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Failed to register with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0a] text-zinc-100 flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1e15_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1e15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2 flex flex-col items-center">
          <VapeLogo height={36} />
          <h1 className="text-2xl font-bold tracking-tight text-white pt-2">Create developer account</h1>
          <p className="text-xs text-zinc-400 max-w-xs">
            Start issuing cloud licenses, enforcing HWID locks, and linking Discord bots.
          </p>
        </div>

        {/* Clean Register Container in Black, White, and Gray */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#111110]/95 backdrop-blur-xl shadow-2xl space-y-5">
          {/* Google 1-Click Register Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={googleLoading || loading}
            data-testid="google-register-btn"
            className="w-full py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.98] shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{googleLoading ? 'Connecting with Google...' : 'Sign up with Google'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Or with email</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <form data-testid="register-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Email Address</label>
              <input
                type="email"
                required
                data-testid="register-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.dev"
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              <input
                type="password"
                required
                minLength={6}
                data-testid="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              data-testid="register-submit"
              className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold text-zinc-950 transition-colors duration-150 shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" data-testid="register-to-login" className="text-zinc-300 hover:text-white font-medium underline underline-offset-2">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
