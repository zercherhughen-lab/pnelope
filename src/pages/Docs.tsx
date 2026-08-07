import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, ShieldCheck, Key, Terminal, Code, Cpu, AlertTriangle, Send, Play, Boxes, Sparkles, KeyRound, ChevronDown, ChevronRight } from 'lucide-react';
import api, { formatErr } from '../lib/api';
import { useServices } from '../context/ServiceContext';
import { toast } from 'sonner';

const CodeBlock: React.FC<{ code: string; lang: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg border border-white/10 bg-[#111110] p-4 font-mono text-xs overflow-x-auto text-zinc-300">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-zinc-500 text-[10px] uppercase tracking-wider">
        <span className="text-zinc-400 font-semibold">{lang}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      <pre className="leading-relaxed whitespace-pre font-mono">{code}</pre>
    </div>
  );
};

export const Docs: React.FC = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vauth.dev';
  const { services } = useServices();

  // Collapsible Categories for code snippets
  const [expandedSnippets, setExpandedSnippets] = useState<{ [key: string]: boolean }>({
    csharp: true,
    python: false,
    cpp: false,
    node: false,
    curl: false,
  });

  const toggleSnippet = (key: string) => {
    setExpandedSnippets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Live tester state
  const [testApiKey, setTestApiKey] = useState('8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b');
  const [testSecretId, setTestSecretId] = useState('sec_9a8b7c6d5e4f3a2b1c0d9e8f');
  const [testService, setTestService] = useState('Vape');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/v1/service/query', {
        api_key: testApiKey,
        secret_id: testSecretId,
        service: testService,
      });
      setTestResult(res.data);
      toast.success('Consulta ejecutada con éxito');
    } catch (err: any) {
      setTestResult(err.response?.data || { error: 'Error al conectar con la API' });
      toast.error(formatErr(err.response?.data?.detail || err.message));
    } finally {
      setTesting(false);
    }
  };

  // Code examples for /api/v1/service/query
  const csharpQueryExample = `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program 
{
    static async Task Main() 
    {
        var client = new HttpClient();
        var url = "${origin}/api/v1/service/query";

        // Se requieren los 3 parametros SI O SI
        var jsonPayload = "{\\"api_key\\": \\"8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b\\", \\"secret_id\\": \\"sec_9a8b7c6d5e4f3a2b1c0d9e8f\\", \\"service\\": \\"Vape\\"}";
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(url, content);
        var resultJson = await response.Content.ReadAsStringAsync();

        Console.WriteLine(resultJson);
    }
}`;

  const pythonQueryExample = `import requests

url = "${origin}/api/v1/service/query"

# Los 3 parametros son obligatorios para obtener la informacion del servicio
payload = {
    "api_key": "8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b",
    "secret_id": "sec_9a8b7c6d5e4f3a2b1c0d9e8f",
    "service": "Vape"
}

response = requests.post(url, json=payload)
data = response.json()

if data.get("success"):
    print(f"Servicio: {data['service']['name']}")
    for lic in data.get("licenses", []):
        print(f"Usuario: {lic['username']} | Key: {lic['license_key']} | HWID: {lic['hwid']} | Status: {lic['status']} | Expira: {lic['expires_at']}")
else:
    print("Error de autenticación:", data.get("detail"))`;

  const nodeQueryExample = `const fetch = require('node-fetch');

async function consultarServicio() {
  const res = await fetch('${origin}/api/v1/service/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: '8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b',
      secret_id: 'sec_9a8b7c6d5e4f3a2b1c0d9e8f',
      service: 'Vape' // Nombre exacto del servicio
    })
  });

  const data = await res.json();
  console.log(data);
}

consultarServicio();`;

  const curlQueryExample = `curl -X POST "${origin}/api/v1/service/query" \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b",
    "secret_id": "sec_9a8b7c6d5e4f3a2b1c0d9e8f",
    "service": "Vape"
  }'`;

  const cppQueryExample = `#include <iostream>
#include <curl/curl.h>

int main() {
    CURL* curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, "${origin}/api/v1/service/query");
        
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        const char* json = "{\\"api_key\\":\\"8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b\\", \\"secret_id\\":\\"sec_9a8b7c6d5e4f3a2b1c0d9e8f\\", \\"service\\":\\"Vape\\"}";
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json);

        CURLcode res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
    }
    return 0;
}`;

  // Verification example for loaders
  const curlVerifyExample = `curl -X POST "${origin}/api/verify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b",
    "secret_id": "sec_9a8b7c6d5e4f3a2b1c0d9e8f",
    "service": "Vape",
    "key": "VAPE-8F9A-2B3C-4D5E",
    "hwid": "HWID-9876-5432-1098"
  }'`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="docs-page"
      className="space-y-8 font-sans max-w-5xl"
    >
      <div className="pb-6 border-b border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          API v1 Documentation
        </div>
        <h1 className="text-[24px] font-medium sm:text-[38px] sm:font-semibold text-[#EEEEEC] tracking-tight">
          Guía de Integración Externa Vape API
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[#B5B3AD] mt-1">
          Aprende a conectar programas externos, bots de Discord, loaders y software C#/C++/Python con la API de Vape.
        </p>
      </div>

      {/* Mandatory Credentials Notice */}
      <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3 text-amber-200">
        <div className="flex items-center gap-2.5 text-amber-300 font-semibold text-base">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Requisito Indispensable: 3 Parámetros Obligatorios</span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-300">
          Para realizar llamados a la API y obtener los datos de un servicio (sus usuarios, keys, HWID, status de baneado, caducidad y rango), el programa externo <strong className="text-white">DEBE proporcionar sí o sí los siguientes 3 valores</strong>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-black/40 p-3 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">1. Servicio Creado</span>
            <p className="text-xs text-white font-mono font-medium">service: "Vape"</p>
            <p className="text-[11px] text-zinc-400">Nombre exacto o ID del servicio.</p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">2. API Key</span>
            <p className="text-xs text-white font-mono font-medium">api_key: "vk_live_..."</p>
            <p className="text-[11px] text-zinc-400">Generado en el panel de servicios.</p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">3. Secret ID</span>
            <p className="text-xs text-white font-mono font-medium">secret_id: "sec_..."</p>
            <p className="text-[11px] text-zinc-400">Clave secreta única del servicio.</p>
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 italic">
          * Si falta cualquiera de estos 3 valores o no coinciden, la API rechazará la llamada y responderá con acceso denegado.
        </p>
      </div>

      {/* Section 1: Service Query Endpoint */}
      <section className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>
            <h2 className="text-xl font-semibold text-white">1. Consultar Licencias y Usuarios del Servicio</h2>
          </div>
          <p className="text-sm text-zinc-400">
            Envía los 3 valores al endpoint <code className="text-[#EEEEEC] bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">POST /api/v1/service/query</code> para recibir el estado completo de todas las licencias del servicio (keys, usuarios, HWID, status si está baneado o caducado, rango).
          </p>
        </div>

        {/* Code Snippets Accordion Categories */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Categorías Desplegables por Lenguaje:</p>
          
          {/* C# */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('csharp')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-white">Ejemplo de Integración C# (.NET)</span>
              </div>
              {expandedSnippets.csharp ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            </button>
            {expandedSnippets.csharp && (
              <div className="p-3 border-t border-white/10">
                <CodeBlock code={csharpQueryExample} lang="csharp" />
              </div>
            )}
          </div>

          {/* Python */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('python')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Ejemplo de Integración Python (requests)</span>
              </div>
              {expandedSnippets.python ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            </button>
            {expandedSnippets.python && (
              <div className="p-3 border-t border-white/10">
                <CodeBlock code={pythonQueryExample} lang="python" />
              </div>
            )}
          </div>

          {/* C++ */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('cpp')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Ejemplo de Integración C++ (libcurl / WinINet)</span>
              </div>
              {expandedSnippets.cpp ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            </button>
            {expandedSnippets.cpp && (
              <div className="p-3 border-t border-white/10">
                <CodeBlock code={cppQueryExample} lang="cpp" />
              </div>
            )}
          </div>

          {/* Node.js */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('node')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-white">Ejemplo de Integración Node.js / JavaScript</span>
              </div>
              {expandedSnippets.node ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            </button>
            {expandedSnippets.node && (
              <div className="p-3 border-t border-white/10">
                <CodeBlock code={nodeQueryExample} lang="javascript" />
              </div>
            )}
          </div>

          {/* cURL */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('curl')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold text-white">Comando cURL para Pruebas Rápidas</span>
              </div>
              {expandedSnippets.curl ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            </button>
            {expandedSnippets.curl && (
              <div className="p-3 border-t border-white/10">
                <CodeBlock code={curlQueryExample} lang="bash" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Response Payload Structure */}
      <section className="space-y-4 pt-6 border-t border-white/10">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">Respuesta Esperada de la API (JSON)</h2>
          <p className="text-sm text-zinc-400">
            Cuando la llamada proporciona los 3 datos correctos, la API devuelve únicamente la información requerida de las licencias. La cuenta regresiva del tiempo de caducidad de cada clave se activa en su <strong className="text-amber-300">primer uso / canje en un PC</strong>.
          </p>
        </div>
        <CodeBlock
          code={`{
  "success": true,
  "service": {
    "id": "srv-vape-default",
    "name": "Vape",
    "prefix": "VAPE",
    "description": "Vape Developer Service Scope",
    "total_keys": 2,
    "active_keys": 1,
    "banned_keys": 0,
    "expired_keys": 0
  },
  "licenses": [
    {
      "username": "Alex_Vape",
      "license_key": "VAPE-8F9A-2B3C-4D5E",
      "hwid": "HWID-9876-5432-1098",
      "status": "paused",
      "is_banned": false,
      "is_expired": false,
      "rank": "VIP",
      "duration": "Lifetime",
      "expires_at": "Lifetime"
    },
    {
      "username": "User_Gamer",
      "license_key": "VAPE-1122-3344-5566",
      "hwid": "HWID-7788-9900-1122",
      "status": "active",
      "is_banned": false,
      "is_expired": false,
      "rank": "Default",
      "duration": "30 Days",
      "expires_at": "2026-09-06T16:20:06.683Z"
    }
  ]
}`}
          lang="json"
        />
      </section>

      {/* Section 2: Verification Endpoint for Loaders */}
      <section className="space-y-4 pt-6 border-t border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">POST</span>
            <h2 className="text-xl font-semibold text-white">2. Validación de Key en Software / Loader (/api/verify)</h2>
          </div>
          <p className="text-sm text-zinc-400">
            Utilizado por el ejecutable/loader para validar una key individual antes de dar acceso al programa.
          </p>
        </div>
        <CodeBlock code={curlVerifyExample} lang="bash" />
      </section>

      {/* Section 3: Interactive Live API Tester */}
      <section className="space-y-4 pt-6 border-t border-white/10">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" /> Probador de API en Vivo (Playground)
          </h2>
          <p className="text-sm text-zinc-400">
            Ingresa los 3 parámetros de tu servicio para probar la consulta directamente desde el navegador:
          </p>
        </div>

        <form onSubmit={handleTestQuery} className="p-6 rounded-xl border border-white/10 bg-[#111110] space-y-5">
          {/* List of existing services for quick selection */}
          <div className="space-y-2 p-4 rounded-lg bg-zinc-950/70 border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Servicios Disponibles para Probar ({services.length}):
              </label>
              <span className="text-[10px] text-zinc-400">Haz clic en uno para autocompletar credenciales</span>
            </div>

            {services.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-1">
                No hay servicios creados aún. Crea un servicio en la sección "Services" para obtener tus API Keys.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {services.map((srv) => {
                  const isSelected = testService.toLowerCase() === srv.name.toLowerCase() && testApiKey === srv.api_key;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setTestService(srv.name);
                        setTestApiKey(srv.api_key);
                        setTestSecretId(srv.secret_id);
                        toast.success(`Credenciales de "${srv.name}" cargadas`);
                      }}
                      className={`text-left p-2.5 rounded-lg border transition-all duration-200 group relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-white/10 bg-[#181817] hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                          <Boxes className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400" />
                          {srv.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 font-mono">
                          {srv.prefix || 'SRV'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono truncate mt-1.5 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate">{srv.api_key}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">1. Service Name *</label>
              <input
                type="text"
                required
                value={testService}
                onChange={(e) => setTestService(e.target.value)}
                placeholder="ej. Vape"
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">2. API Key *</label>
              <input
                type="text"
                required
                value={testApiKey}
                onChange={(e) => setTestApiKey(e.target.value)}
                placeholder="vk_live_..."
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">3. Secret ID *</label>
              <input
                type="text"
                required
                value={testSecretId}
                onChange={(e) => setTestSecretId(e.target.value)}
                placeholder="sec_..."
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={testing}
            className="bg-[#EEEEEC] hover:bg-white text-zinc-950 px-5 py-2.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors duration-200"
          >
            <Play className="w-4 h-4 fill-current" />
            {testing ? 'Consultando API...' : 'Ejecutar Consulta API'}
          </button>
        </form>

        {testResult && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Resultado Devuelto por la API:</h3>
            <CodeBlock code={JSON.stringify(testResult, null, 2)} lang="json" />
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default Docs;
