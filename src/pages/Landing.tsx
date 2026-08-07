import React from 'react';
import { Link } from 'react-router-dom';
import { CodeXml, ArrowRight, KeyRound, Lock, Terminal, Layers } from 'lucide-react';
import { VapeLogo } from '../components/VapeLogo';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0b0a] text-zinc-100 flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <VapeLogo height={22} />
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            data-testid="landing-login-link"
            className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            to="/dashboard"
            data-testid="landing-register-link"
            className="bg-[#EEEEEC] hover:bg-white text-zinc-950 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
          >
            Open Panel
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-20 flex flex-col items-center justify-center text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-3xl leading-tight">
          Secure Service Credentials & API Key Provisioning
        </h1>

        <p className="text-zinc-400 text-lg max-w-2xl">
          Issue, verify, and rotate client keys, license tokens, and hardware-locked credentials with a high-performance developer auth platform.
        </p>

        <div className="flex items-center gap-4 pt-4">
          <Link
            to="/dashboard"
            data-testid="landing-cta-primary"
            className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-md font-medium flex items-center gap-2 transition-colors duration-200 shadow-lg text-sm"
          >
            Start Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            data-testid="landing-cta-secondary"
            className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 text-sm"
          >
            Open Dashboard Panel
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full text-left">
          <div
            className="rounded-[12px] border border-[#191918] bg-[#111110] p-[16px] text-left transition-colors hover:border-[#292927] hover:bg-[#161614] space-y-3"
            style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}
          >
            <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-lg text-[#EEEEEC]">Dynamic Key Generation</h3>
            <p className="text-sm text-[#B5B3AD]">
              Instantly create scoped API keys and client credentials with customizable prefixes and expiration policies.
            </p>
          </div>

          <div
            className="rounded-[12px] border border-[#191918] bg-[#111110] p-[16px] text-left transition-colors hover:border-[#292927] hover:bg-[#161614] space-y-3"
            style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}
          >
            <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-lg text-[#EEEEEC]">HWID & Rank Control</h3>
            <p className="text-sm text-[#B5B3AD]">
              Enforce strict hardware ID locking, role-based license ranks, and pause/ban states with zero friction.
            </p>
          </div>

          <div
            className="rounded-[12px] border border-[#191918] bg-[#111110] p-[16px] text-left transition-colors hover:border-[#292927] hover:bg-[#161614] space-y-3"
            style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}
          >
            <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-lg text-[#EEEEEC]">Universal Verification API</h3>
            <p className="text-sm text-[#B5B3AD]">
              Integrate with simple REST endpoints for Node.js, Python, or cURL to validate active tokens in milliseconds.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-zinc-500">
        &copy; 2026 Vape Platform. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
