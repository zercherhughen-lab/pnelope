import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CodeXml,
  ArrowRight,
  KeyRound,
  Lock,
  Terminal,
  Layers,
  Shield,
  Zap,
  Globe,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  Server,
  Sparkles,
  Bot,
} from 'lucide-react';
import { VapeLogo } from '../components/VapeLogo';
import { toast } from 'sonner';

export const Landing: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'cpp' | 'csharp' | 'python' | 'rust'>('cpp');
  const [copiedCode, setCopiedCode] = useState(false);
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await demoLogin();
      toast.success('¡Autenticado con Google!');
      navigate('/dashboard');
    } catch (e) {
      toast.error('Error al ingresar');
    }
  };

  const codeSnippets = {
    cpp: `// Vape VAuth C++ KeyAuth-Architecture SDK
#include <iostream>
#include "vauth.hpp"

using namespace VAuth;

std::string name = "Vape";
std::string ownerid = "sec_e7c1376ec414edc901bfbfc3";
std::string secret = "69415e37f9f2604ceb4852dc6b00ff1b";
std::string version = "1.0";
std::string url = "https://pnelope.vercel.app/api/verify";

api vAuthApp(name, ownerid, secret, version, url);

int main() {
    vAuthApp.init();
    std::cout << "Ingresa tu clave de licencia: ";
    std::string key;
    std::cin >> key;

    vAuthApp.license(key);
    if (!vAuthApp.data.success) {
        std::cout << "Error: " << vAuthApp.data.message << std::endl;
        return 1;
    }

    std::cout << "Autenticado con éxito! Bienvenido: " << vAuthApp.data.username << std::endl;
    std::cout << "Rango: " << vAuthApp.data.rank << " | HWID Vinculado: OK" << std::endl;
    return 0;
}`,
    csharp: `// Vape VAuth C# (.NET) Client
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

public class Program 
{
    static async Task Main() 
    {
        var client = new HttpClient();
        var json = @"{
            ""api_key"": ""69415e37f9f2604ceb4852dc6b00ff1b"",
            ""secret_id"": ""sec_e7c1376ec414edc901bfbfc3"",
            ""service"": ""Vape"",
            ""license_key"": ""VAP-XXXX-YYYY-ZZZZ""
        }";

        var res = await client.PostAsync("https://pnelope.vercel.app/api/verify", 
            new StringContent(json, Encoding.UTF8, "application/json"));
        var result = await res.Content.ReadAsStringAsync();

        Console.WriteLine("[+] Respuesta del Servidor: " + result);
    }
}`,
    python: `# Vape VAuth Python Client
import requests

url = "https://pnelope.vercel.app/api/verify"
payload = {
    "api_key": "69415e37f9f2604ceb4852dc6b00ff1b",
    "secret_id": "sec_e7c1376ec414edc901bfbfc3",
    "service": "Vape",
    "license_key": "VAP-A1B2-C3D4-E5F6"
}

res = requests.post(url, json=payload)
data = res.json()

if data.get("valid"):
    print(f"[✓] Licencia Válida! Usuario: {data['user']['username']}")
else:
    print(f"[X] Acceso Denegado: {data.get('detail')}")`,
    rust: `// Vape VAuth Rust Client
use reqwest::Client;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let res = client.post("https://pnelope.vercel.app/api/verify")
        .json(&json!({
            "api_key": "69415e37f9f2604ceb4852dc6b00ff1b",
            "secret_id": "sec_e7c1376ec414edc901bfbfc3",
            "service": "Vape",
            "license_key": "VAP-XXXX-YYYY"
        }))
        .send()
        .await?;

    println!("Estado: {:?}", res.status());
    Ok(())
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[selectedLang]);
    setCopiedCode(true);
    toast.success('Código copiado al portapapeles');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0a] text-zinc-100 flex flex-col font-sans relative selection:bg-transparent">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1e15_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1e15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation Bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-3">
          <VapeLogo height={24} />
          <span className="text-xs font-mono px-2 py-0.5 rounded border border-white/10 bg-white/5 text-zinc-400">
            v2.0
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Características</a>
          <a href="#code-terminal" className="hover:text-white transition-colors">SDKs & Integración</a>
          <Link to="/docs" className="hover:text-white transition-colors">Documentación</Link>
          <a href="#stats" className="hover:text-white transition-colors">Rendimiento</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-all"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Iniciar con Google</span>
          </button>

          <Link
            to="/login"
            className="bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Abrir Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-16 pb-24 space-y-16 relative z-10">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Cyber Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono uppercase tracking-wider">The Leading Open-Source Authentication System</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Cloud Licensing, HWID Lock & Bot Automation.
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Protege tus loaders, aplicaciones y ejecutables con verificación en tiempo real, bloqueo de hardware SHA-256, auto-reset de HWID y conexión directa con tu bot oficial de Discord.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGoogleLogin}
              className="bg-white text-zinc-950 hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2.5 transition-all text-xs shadow-lg active:scale-95"
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
              className="border border-white/15 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all text-xs flex items-center gap-2"
            >
              <span>Ingresar al Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Interactive Code Terminal (KeyAuth Style) */}
        <div id="code-terminal" className="max-w-4xl mx-auto rounded-2xl border border-white/15 bg-[#111110] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-950/80">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-zinc-400 ml-2">vauth_client_verify</span>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 p-1 rounded-lg">
              {(['cpp', 'csharp', 'python', 'rust'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    selectedLang === lang ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {lang === 'cpp' ? 'C++' : lang === 'csharp' ? 'C#' : lang === 'python' ? 'Python' : 'Rust'}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Copiar código"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <pre className="p-6 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed bg-[#0c0c0b]">
            <code>{codeSnippets[selectedLang]}</code>
          </pre>
        </div>

        {/* Feature Cards Grid (In Black, White, and Gray) */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="rounded-2xl border border-white/10 bg-[#111110] p-6 space-y-3 hover:border-white/20 transition-colors">
            <div className="flex size-[40px] items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-white">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Hardware Lock (HWID)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Huella digital única por equipo que previene fugas de software y duplicación no autorizada.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111110] p-6 space-y-3 hover:border-white/20 transition-colors">
            <div className="flex size-[40px] items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Ecosistema Discord Bot</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Comandos <code className="text-white font-mono">/claim</code> y <code className="text-white font-mono">/resethwid</code> con límite de 1 cuenta y verificación de rol.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111110] p-6 space-y-3 hover:border-white/20 transition-colors">
            <div className="flex size-[40px] items-center justify-center rounded-xl bg-zinc-900 border border-white/10 text-white">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Serverless Sub-35ms</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Respuestas instantáneas en Vercel Edge con tolerancia a fallos y sin tiempos de espera.
            </p>
          </div>
        </div>

        {/* Real-time Performance Metrics */}
        <div id="stats" className="rounded-2xl border border-white/10 bg-[#111110] p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white tracking-tight">99.99%</div>
            <div className="text-xs text-zinc-400 uppercase font-mono">Uptime Global</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white tracking-tight">&lt;35ms</div>
            <div className="text-xs text-zinc-400 uppercase font-mono">Latencia Media</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white tracking-tight">AES-256</div>
            <div className="text-xs text-zinc-400 uppercase font-mono">Criptografía</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white tracking-tight">100%</div>
            <div className="text-xs text-zinc-400 uppercase font-mono">Open Source</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-zinc-500 relative z-10 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-4">
        <div className="flex items-center gap-2">
          <VapeLogo height={20} />
          <span>&copy; 2026 Vape Architecture. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <Link to="/login" className="hover:text-white">Iniciar Sesión</Link>
          <Link to="/docs" className="hover:text-white">Documentación</Link>
          <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
