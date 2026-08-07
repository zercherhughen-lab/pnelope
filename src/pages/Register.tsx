import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { formatErr } from '../lib/api';
import { VapeLogo } from '../components/VapeLogo';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0a] text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <VapeLogo height={36} />
          <h1 className="text-2xl font-bold tracking-tight text-white pt-2">Create your developer account</h1>
          <p className="text-sm text-zinc-400">
            Already have one?{' '}
            <Link to="/login" data-testid="register-to-login" className="text-zinc-300 hover:text-white font-medium underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>

        <form
          data-testid="register-form"
          onSubmit={handleSubmit}
          className="p-6 rounded-xl border border-white/10 bg-[#111110] space-y-4 shadow-xl"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              data-testid="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.dev"
              className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-md px-3.5 py-2.5 text-sm outline-none transition-colors duration-200 text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              minLength={6}
              data-testid="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-md px-3.5 py-2.5 text-sm outline-none transition-colors duration-200 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit"
            className="w-full bg-[#EEEEEC] hover:bg-white disabled:opacity-50 py-2.5 rounded-md text-sm font-semibold transition-colors duration-200 text-zinc-950 mt-2"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
