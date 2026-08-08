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
    toast.success('Code snippet copied to clipboard');
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
          <span>{copied ? 'Copied' : 'Copy'}</span>
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
    csharp: false,
    python: true,
    cpp: false,
    node: false,
    curl: false,
    create_python: true,
    create_node: false,
    create_csharp: false,
    create_curl: false,
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
      toast.success('Query executed successfully');
    } catch (err: any) {
      setTestResult(err.response?.data || { error: 'Error connecting to API' });
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

        // All 3 parameters are strictly required
        var jsonPayload = "{\\"api_key\\": \\"8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b\\", \\"secret_id\\": \\"sec_9a8b7c6d5e4f3a2b1c0d9e8f\\", \\"service\\": \\"Vape\\"}";
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(url, content);
        var resultJson = await response.Content.ReadAsStringAsync();

        Console.WriteLine(resultJson);
    }
}`;

  const pythonQueryExample = `import requests

url = "${origin}/api/v1/service/query"

# All 3 parameters are required to query users, licenses and hardware locks
payload = {
    "api_key": "8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b",
    "secret_id": "sec_9a8b7c6d5e4f3a2b1c0d9e8f",
    "service": "Vape"
}

response = requests.post(url, json=payload)
data = response.json()

users = data.get("users", [])
for user in users:
    print(f"User: {user['username']} | Key: {user['license_key']} | HWID: {user['hwid']} | Status: {user['status']} | Expires: {user['expires_at']}")`;

  const nodeQueryExample = `const fetch = require('node-fetch');

async function queryServiceData() {
  const res = await fetch('${origin}/api/v1/service/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: '8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b',
      secret_id: 'sec_9a8b7c6d5e4f3a2b1c0d9e8f',
      service: 'Vape'
    })
  });

  const data = await res.json();
  console.log(data);
}

queryServiceData();`;

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

  // Examples for external creation of licenses (/api/v1/license/create)
  const pythonCreateExample = `import requests

url = "${origin}/api/v1/license/create"

# 3 mandatory service credentials + new license options
payload = {
    "api_key": "8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b",
    "secret_id": "sec_9a8b7c6d5e4f3a2b1c0d9e8f",
    "service": "Vape",              # Exact service name or ID
    "username": "client_discord",   # Customer username or ID
    "duration": "30 Days",          # "30 Days", "Lifetime", "1 Year", "10 Seconds", etc.
    "rank": "VIP",                  # Assigned role/tier
    "notes": "Automated order via Webhook / Bot"
}

response = requests.post(url, json=payload)
data = response.json()

if data.get("success"):
    user = data.get("user")
    print(f"License Key Created: {user['license_key']}")
    print(f"User: {user['username']} | Expires: {user['expires_at']}")
else:
    print("Error:", data.get("detail"))`;

  const nodeCreateExample = `const fetch = require('node-fetch');

async function createExternalLicense() {
  const res = await fetch('${origin}/api/v1/license/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: '8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b',
      secret_id: 'sec_9a8b7c6d5e4f3a2b1c0d9e8f',
      service: 'Vape',
      username: 'buyer_auto',
      duration: '30 Days',
      rank: 'Default'
    })
  });

  const data = await res.json();
  console.log(data);
}

createExternalLicense();`;

  const csharpCreateExample = `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program 
{
    static async Task Main() 
    {
        var client = new HttpClient();
        var url = "${origin}/api/v1/license/create";

        var json = @"{
            ""api_key"": ""8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b"",
            ""secret_id"": ""sec_9a8b7c6d5e4f3a2b1c0d9e8f"",
            ""service"": ""Vape"",
            ""username"": ""client_csharp"",
            ""duration"": ""Lifetime"",
            ""rank"": ""VIP""
        }";

        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync(url, content);
        var result = await response.Content.ReadAsStringAsync();

        Console.WriteLine(result);
    }
}`;

  const curlCreateExample = `curl -X POST "${origin}/api/v1/license/create" \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "8f2a91c4b7d3e05f6a8b9c0d1e2f3a4b",
    "secret_id": "sec_9a8b7c6d5e4f3a2b1c0d9e8f",
    "service": "Vape",
    "username": "new_client",
    "duration": "30 Days",
    "rank": "Default"
  }'`;

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
          Vape API External Integration Guide
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[#B5B3AD] mt-1">
          Learn how to connect external programs, Discord bots, loaders, and C#/C++/Python clients to the Vape API.
        </p>
      </div>

      {/* Mandatory Credentials Notice */}
      <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3 text-amber-200">
        <div className="flex items-center gap-2.5 text-amber-300 font-semibold text-base">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Mandatory Requirement: 3 Verification Parameters</span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-300">
          To make API queries and retrieve service data (users, keys, HWID, ban status, expiration, and ranks), your external client <strong className="text-white">MUST provide all 3 values</strong>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-black/40 p-3 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">1. Service Name</span>
            <p className="text-xs text-white font-mono font-medium">service: "Vape"</p>
            <p className="text-[11px] text-zinc-400">Exact name or ID of the registered service.</p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">2. API Key</span>
            <p className="text-xs text-white font-mono font-medium">api_key: "vk_live_..."</p>
            <p className="text-[11px] text-zinc-400">Found in your service application panel.</p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">3. Secret ID</span>
            <p className="text-xs text-white font-mono font-medium">secret_id: "sec_..."</p>
            <p className="text-[11px] text-zinc-400">Unique secret key for the service application.</p>
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 italic">
          * If any of these 3 parameters are missing or incorrect, the API will reject the request with HTTP 403 Forbidden.
        </p>
      </div>

      {/* Section 1: Service Query Endpoint */}
      <section className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">POST</span>
            <h2 className="text-xl font-semibold text-white">1. Query Service Licenses and Users</h2>
          </div>
          <p className="text-sm text-zinc-400">
            Send the 3 parameters to <code className="text-[#EEEEEC] bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">POST /api/v1/service/query</code> to fetch complete status for all service licenses.
          </p>
        </div>

        {/* Code Snippets Accordion Categories */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Expandable Code Examples by Language:</p>
          
          {/* C# */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('csharp')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-white">C# (.NET) Integration Example</span>
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
                <span className="text-xs font-semibold text-white">Python (requests) Integration Example</span>
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
                <span className="text-xs font-semibold text-white">C++ (libcurl / WinINet) Integration Example</span>
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
                <span className="text-xs font-semibold text-white">Node.js / JavaScript Integration Example</span>
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
                <span className="text-xs font-semibold text-white">cURL Command for Quick Testing</span>
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
          <h2 className="text-xl font-semibold text-white">Expected API Response (JSON)</h2>
          <p className="text-sm text-zinc-400">
            Upon supplying valid credentials, the API responds with all assigned users, active licenses, and lock states:
          </p>
        </div>
        <CodeBlock
          code={`{
  "users": [
    {
      "username": "Alex_Vape",
      "license_key": "VAPE-8F9A-2B3C-4D5E",
      "hwid": "HWID-9876-5432-1098",
      "status": "active",
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

      {/* Section 2: External License & User Creation Endpoint */}
      <section className="space-y-4 pt-6 border-t border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">POST</span>
            <h2 className="text-xl font-semibold text-white">2. External License & User Issuance (/api/v1/license/create)</h2>
          </div>
          <p className="text-sm text-zinc-400">
            Allows external software (Discord/Telegram bots, automated store webhooks, payment gateways) to generate licenses and assign user accounts dynamically.
          </p>
        </div>

        {/* Creation Snippets Accordion */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">External Issuance Snippets:</p>

          {/* Python Create */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('create_python')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Python Issuance Example (requests)</span>
              </div>
              {expandedSnippets.create_python ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            </button>
            {expandedSnippets.create_python && (
              <div className="p-3 border-t border-white/10">
                <CodeBlock code={pythonCreateExample} lang="python" />
              </div>
            )}
          </div>

          {/* Node.js Create */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('create_node')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-white">Node.js / JavaScript Issuance Example</span>
              </div>
              {expandedSnippets.create_node ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            </button>
            {expandedSnippets.create_node && (
              <div className="p-3 border-t border-white/10">
                <CodeBlock code={nodeCreateExample} lang="javascript" />
              </div>
            )}
          </div>

          {/* C# Create */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('create_csharp')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-white">C# (.NET) Issuance Example</span>
              </div>
              {expandedSnippets.create_csharp ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            </button>
            {expandedSnippets.create_csharp && (
              <div className="p-3 border-t border-white/10">
                <CodeBlock code={csharpCreateExample} lang="csharp" />
              </div>
            )}
          </div>

          {/* cURL Create */}
          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#111110]">
            <button
              type="button"
              onClick={() => toggleSnippet('create_curl')}
              className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-900 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold text-white">cURL Command for Key Issuance</span>
              </div>
              {expandedSnippets.create_curl ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
            </button>
            {expandedSnippets.create_curl && (
              <div className="p-3 border-t border-white/10">
                <CodeBlock code={curlCreateExample} lang="bash" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Discord Bot Official Integration */}
      <section className="space-y-4 pt-6 border-t border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30">DISCORD BOT</span>
            <h2 className="text-xl font-semibold text-white">3. Official Discord Bot (Slash Commands & Developer Portal)</h2>
          </div>
          <p className="text-sm text-zinc-400">
            Connect your custom Discord bot to allow verified users with a specific role to claim licenses and reset HWIDs automatically.
          </p>
        </div>

        {/* Discord Bot Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-white/10 bg-[#111110] space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-400">1. Strict Limit</span>
            <p className="text-xs text-white font-semibold">1 License per Discord Account</p>
            <p className="text-[11px] text-zinc-400">If the account already has an issued key, the bot denies further claims.</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-[#111110] space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">2. Exclusive Role</span>
            <p className="text-xs text-white font-semibold">Server Role Verification</p>
            <p className="text-[11px] text-zinc-400">Only users assigned the configured server role can execute /claim.</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-[#111110] space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400">3. HWID Self-Reset</span>
            <p className="text-xs text-white font-semibold">/resethwid Command</p>
            <p className="text-[11px] text-zinc-400">Clears bound hardware locks so customers can migrate to a new PC.</p>
          </div>
        </div>

        {/* Step-by-Step Setup Guide */}
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/60 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Discord Developer Portal Setup Steps:</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-300">
            <li>Visit <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-mono">discord.com/developers/applications</a> and click <strong>New Application</strong>.</li>
            <li>Go to the <strong>Bot</strong> tab, click <strong>Reset Token</strong>, and copy your <strong>Bot Token</strong>.</li>
            <li>Enable <strong>Privileged Gateway Intents</strong> (specifically <strong>Server Members Intent</strong>).</li>
            <li>Save your <strong>Bot Token</strong> and required <strong>Role Name</strong> in the service settings page.</li>
            <li>Launch the bot runner: <code className="text-emerald-400 font-mono">node discord_bot.js</code> or <code className="text-emerald-400 font-mono">python discord_bot.py</code>.</li>
          </ol>
        </div>

        {/* Endpoints Table */}
        <div className="p-4 rounded-xl border border-white/10 bg-[#111110] space-y-2">
          <span className="text-xs font-semibold text-white">Dedicated Discord Endpoints:</span>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
              <span className="text-indigo-400">POST /api/v1/discord/claim</span>
              <span className="text-zinc-400 text-[11px]">Creates user and license bound to the Discord account</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
              <span className="text-emerald-400">POST /api/v1/discord/resethwid</span>
              <span className="text-zinc-400 text-[11px]">Resets and unbinds HWID to allow binding a new device</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Verification Endpoint for Loaders */}
      <section className="space-y-4 pt-6 border-t border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">POST</span>
            <h2 className="text-xl font-semibold text-white">4. Loader / Executable License Verification (/api/verify)</h2>
          </div>
          <p className="text-sm text-zinc-400">
            Called by your game loader or software executable to validate single license keys and lock fingerprints prior to runtime access.
          </p>
        </div>
        <CodeBlock code={curlVerifyExample} lang="bash" />
      </section>

      {/* Section 5: Interactive Live API Tester */}
      <section className="space-y-4 pt-6 border-t border-white/10">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" /> Interactive Live API Playground
          </h2>
          <p className="text-sm text-zinc-400">
            Enter your 3 service parameters to test live API queries directly from your browser:
          </p>
        </div>

        <form onSubmit={handleTestQuery} className="p-6 rounded-xl border border-white/10 bg-[#111110] space-y-5">
          {/* List of existing services for quick selection */}
          <div className="space-y-2 p-4 rounded-lg bg-zinc-950/70 border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Available Services for Testing ({services.length}):
              </label>
              <span className="text-[10px] text-zinc-400">Click to autofill credentials</span>
            </div>

            {services.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-1">
                No services created yet. Create a service in "Services" to generate API Keys.
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
                        toast.success(`Credentials loaded for "${srv.name}"`);
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
                placeholder="e.g. Vape"
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
            {testing ? 'Executing Query...' : 'Run API Query'}
          </button>
        </form>

        {testResult && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">API Response:</h3>
            <CodeBlock code={JSON.stringify(testResult, null, 2)} lang="json" />
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default Docs;
