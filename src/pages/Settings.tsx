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
        {/* Discord Webhooks & Notifications */}
        <div className="border border-white/10 rounded-xl bg-[#111110] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleCategory('notifications')}
            className="w-full p-4 flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-900 transition-colors border-b border-white/10 text-left"
          >
            <div className="flex items-center gap-3">
              <Webhook className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-semibold text-white text-sm">Notificaciones y Webhooks de Discord</h3>
                <p className="text-xs text-zinc-400">Alertas automáticas en canjes de licencias y desvinculaciones de HWID</p>
              </div>
            </div>
            {openCategories.notifications ? (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            )}
          </button>

          {openCategories.notifications && (
            <div className="p-5 space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">URL del Webhook de Discord</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-zinc-950 border border-white/15 focus:border-white/50 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-lg bg-zinc-950 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnRedeem}
                    onChange={(e) => setNotifyOnRedeem(e.target.checked)}
                    className="w-4 h-4 accent-white rounded"
                  />
                  <span className="text-xs text-zinc-200">Notificar al canjear clave nueva</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-lg bg-zinc-950 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnHwidReset}
                    onChange={(e) => setNotifyOnHwidReset(e.target.checked)}
                    className="w-4 h-4 accent-white rounded"
                  />
                  <span className="text-xs text-zinc-200">Notificar al desvincular HWID</span>
                </label>
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
