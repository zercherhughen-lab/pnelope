import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, ChevronDown, ChevronRight, Save, Webhook, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export const Settings: React.FC = () => {
  // Collapsible categories state
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    notifications: true,
    docs: true,
  });

  const toggleCategory = (catKey: string) => {
    setOpenCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  // Settings form states
  const [webhookUrl, setWebhookUrl] = useState('https://discord.com/api/webhooks/12345/vauth-notify');
  const [notifyOnRedeem, setNotifyOnRedeem] = useState(true);
  const [notifyOnHwidReset, setNotifyOnHwidReset] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Configuración guardada correctamente');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="settings-page"
      className="space-y-8 font-sans max-w-4xl"
    >
      {/* Header */}
      <div className="pb-6 border-b border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs text-white font-semibold uppercase tracking-wider">
          <SettingsIcon className="w-4 h-4 text-white" />
          Ajustes del Sistema
        </div>
        <h1 className="text-[24px] font-medium sm:text-[38px] sm:font-semibold text-[#EEEEEC] tracking-tight">
          Configuración y Preferencias
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[#B5B3AD]">
          Administra las notificaciones, webhooks de Discord y acceso a la documentación del sistema.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Discord Bot & Developer Portal Integration */}
        <div className="border border-indigo-500/30 rounded-xl bg-[#111110] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCategory('discordBot')}
            className="w-full p-4 flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-900 transition-colors border-b border-white/10 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-[32px] items-center justify-center rounded-[8px] bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Bot Oficial de Discord (Developer Portal)</h3>
                <p className="text-xs text-zinc-400">Creación automática de licencias con 1 key por cuenta, rol exclusivo y auto-reset de HWID</p>
              </div>
            </div>
            {openCategories.discordBot ? (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            )}
          </button>

          {openCategories.discordBot && (
            <div className="p-5 space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-400">Regla 1: 1 Cuenta = 1 Key</span>
                  <p className="text-xs text-zinc-300 font-semibold">Límite Estricto por Usuario</p>
                  <p className="text-[11px] text-zinc-500">Bloquea reclamos adicionales para la misma cuenta de Discord.</p>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-400">Regla 2: Rol Obligatorio</span>
                  <p className="text-xs text-zinc-300 font-semibold">Verificación en Servidor</p>
                  <p className="text-[11px] text-zinc-500">Solo usuarios con el rol configurado pueden ejecutar /claim.</p>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Regla 3: Auto-Reset HWID</span>
                  <p className="text-xs text-zinc-300 font-semibold">Comando /resethwid</p>
                  <p className="text-[11px] text-zinc-500">Elimina el HWID vinculado para vincular una nueva PC.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950/80 border border-white/10 space-y-2 text-xs text-zinc-300">
                <span className="font-bold text-white uppercase text-[11px] tracking-wider">Pasos para activar en tu servidor:</span>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                  <li>Crea tu aplicación en <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-400 underline">discord.com/developers/applications</a> y copia tu <strong>Bot Token</strong>.</li>
                  <li>Activa <strong>Server Members Intent</strong> en la pestaña Bot de Discord Developer Portal.</li>
                  <li>Ingresa a tu servicio en la sección <strong>Services</strong> y pega tu Bot Token y el nombre de tu <strong>Rol Requerido</strong>.</li>
                  <li>Inicia el bot en tu servidor ejecutando <code className="text-emerald-400 font-mono">node discord_bot.js</code> o <code className="text-emerald-400 font-mono">python discord_bot.py</code>.</li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                <span>Endpoints de Discord: <code className="text-indigo-400 font-mono">/api/v1/discord/claim</code> y <code className="text-emerald-400 font-mono">/api/v1/discord/resethwid</code></span>
                <NavLink to="/docs" className="text-white hover:underline font-medium flex items-center gap-1">
                  Ver Guía Completa de Discord &rarr;
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Documentation & API Reference */}
        <div className="border border-white/10 rounded-xl bg-[#111110] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCategory('docs')}
            className="w-full p-4 flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-900 transition-colors border-b border-white/10 text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-semibold text-white text-sm">Documentación y Guías de API</h3>
                <p className="text-xs text-zinc-400">Ejemplos de integración para C#, C++, Python, Node.js y cURL</p>
              </div>
            </div>
            {openCategories.docs ? (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            )}
          </button>

          {openCategories.docs && (
            <div className="p-5 space-y-3 animate-in fade-in duration-200">
              <p className="text-xs text-zinc-300">
                Consulta los ejemplos interactivos, probador de API y código de cliente para conectar tu software.
              </p>
              <NavLink
                to="/docs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-semibold transition-colors"
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>Abrir Documentación Completa</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="bg-[#EEEEEC] hover:bg-white text-zinc-950 px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors duration-200 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Ajustes</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Settings;
