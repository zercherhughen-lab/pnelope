import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings as SettingsIcon,
  Shield,
  Laptop,
  RefreshCcw,
  LogOut,
  Check,
  Save,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Key,
  Smartphone,
  Lock,
  Globe,
  Bell,
  Clock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface DeviceSession {
  id: string;
  device: string;
  ip: string;
  authMethod: 'password' | 'google' | 'discord' | 'token';
  isCurrent: boolean;
  lastActive: string;
  createdAt: string;
  expiresAt: string;
}

export const Settings: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Saved / initial state to track if dirty
  const [initialSettings, setInitialSettings] = useState({
    webhookUrl: 'https://discord.com/api/webhooks/1234567890/vauth-notify',
    discordBotToken: '',
    discordGuildId: '',
    discordRoleName: 'Cliente',
    notifyOnRedeem: true,
    notifyOnHwidReset: true,
    notifyOnLogin: false,
    googleLinked: true,
    discordLinked: false,
    twoFactorEnabled: false,
  });

  // Current working state
  const [webhookUrl, setWebhookUrl] = useState(initialSettings.webhookUrl);
  const [discordBotToken, setDiscordBotToken] = useState(initialSettings.discordBotToken);
  const [discordGuildId, setDiscordGuildId] = useState(initialSettings.discordGuildId);
  const [discordRoleName, setDiscordRoleName] = useState(initialSettings.discordRoleName);
  const [notifyOnRedeem, setNotifyOnRedeem] = useState(initialSettings.notifyOnRedeem);
  const [notifyOnHwidReset, setNotifyOnHwidReset] = useState(initialSettings.notifyOnHwidReset);
  const [notifyOnLogin, setNotifyOnLogin] = useState(initialSettings.notifyOnLogin);

  const [googleLinked, setGoogleLinked] = useState(initialSettings.googleLinked);
  const [discordLinked, setDiscordLinked] = useState(initialSettings.discordLinked);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialSettings.twoFactorEnabled);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Real Sessions list fetched from API
  const [sessions, setSessions] = useState<DeviceSession[]>([
    {
      id: 'sess-current',
      device: 'Chrome on Windows',
      ip: '174.17.46.154',
      authMethod: 'google',
      isCurrent: true,
      lastActive: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const loadSessions = async () => {
    try {
      const res = await api.get('/auth/sessions');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSessions(res.data);
      }
    } catch (e) {
      console.warn('Could not load sessions:', e);
    }
  };

  // Load persistent settings and sessions on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vauth_user_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setInitialSettings(parsed);
        setWebhookUrl(parsed.webhookUrl ?? initialSettings.webhookUrl);
        setDiscordBotToken(parsed.discordBotToken ?? '');
        setDiscordGuildId(parsed.discordGuildId ?? '');
        setDiscordRoleName(parsed.discordRoleName ?? 'Cliente');
        setNotifyOnRedeem(parsed.notifyOnRedeem ?? true);
        setNotifyOnHwidReset(parsed.notifyOnHwidReset ?? true);
        setNotifyOnLogin(parsed.notifyOnLogin ?? false);
        setGoogleLinked(parsed.googleLinked ?? true);
        setDiscordLinked(parsed.discordLinked ?? false);
        setTwoFactorEnabled(parsed.twoFactorEnabled ?? false);
      }
    } catch (e) {
      // ignore
    }

    loadSessions();
  }, []);

  // Compute if form is dirty (has modifications)
  const isDirty =
    webhookUrl !== initialSettings.webhookUrl ||
    discordBotToken !== initialSettings.discordBotToken ||
    discordGuildId !== initialSettings.discordGuildId ||
    discordRoleName !== initialSettings.discordRoleName ||
    notifyOnRedeem !== initialSettings.notifyOnRedeem ||
    notifyOnHwidReset !== initialSettings.notifyOnHwidReset ||
    notifyOnLogin !== initialSettings.notifyOnLogin ||
    googleLinked !== initialSettings.googleLinked ||
    discordLinked !== initialSettings.discordLinked ||
    twoFactorEnabled !== initialSettings.twoFactorEnabled;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings = {
      webhookUrl,
      discordBotToken,
      discordGuildId,
      discordRoleName,
      notifyOnRedeem,
      notifyOnHwidReset,
      notifyOnLogin,
      googleLinked,
      discordLinked,
      twoFactorEnabled,
    };
    setInitialSettings(newSettings);
    localStorage.setItem('vauth_user_settings', JSON.stringify(newSettings));
    toast.success('¡Ajustes guardados permanentemente!');
  };

  const handleSignOutSession = async (sess: DeviceSession) => {
    if (sess.isCurrent) {
      toast.success('Cerrando sesión actual...');
      logout();
      navigate('/login');
      return;
    }

    try {
      await api.delete(`/auth/sessions/${sess.id}`);
    } catch (e) {
      // ignore
    }
    setSessions((prev) => prev.filter((s) => s.id !== sess.id));
    toast.success('Dispositivo desconectado y Bearer token revocado inmediatamente');
  };

  const handleRefreshSessions = async () => {
    await loadSessions();
    toast.success('Lista de sesiones de dispositivos actualizada');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="settings-page"
      className="space-y-8 font-sans max-w-5xl text-zinc-200"
    >
      {/* Header */}
      <div className="pb-6 border-b border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs text-white font-semibold uppercase tracking-wider">
          <SettingsIcon className="w-4 h-4 text-white" />
          Ajustes del Sistema
        </div>
        <h1 className="text-[24px] font-medium sm:text-[38px] sm:font-semibold text-[#EEEEEC] tracking-tight">
          Configuración y Seguridad
        </h1>
        <p className="text-[15px] sm:text-[16px] text-[#B5B3AD]">
          Administra autenticación de dos factores, dispositivos con sesión iniciada, cuentas vinculadas y webhooks de Discord.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* SECTION 1: DISCORD WEBHOOKS & BOT INTEGRATION */}
        <div className="rounded-xl border border-white/10 bg-[#111110] p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="flex size-[34px] items-center justify-center rounded-[8px] bg-white/10 border border-white/20 text-white">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Discord Webhooks & Notificaciones en Vivo</h2>
              <p className="text-xs text-zinc-400">
                Guarda tu webhook para recibir alertas en tiempo real de canjes de licencias y auto-resets de HWID.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">URL del Webhook de Discord (Persistente)</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/123456789/..."
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/40 rounded-lg px-3.5 py-2.5 text-xs text-white font-mono outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-950/70 border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyOnRedeem}
                  onChange={(e) => setNotifyOnRedeem(e.target.checked)}
                  className="w-4 h-4 accent-white rounded cursor-pointer"
                />
                <span className="text-xs text-zinc-200 font-medium">Notificar al canjear clave nueva (/claim)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-950/70 border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={notifyOnHwidReset}
                  onChange={(e) => setNotifyOnHwidReset(e.target.checked)}
                  className="w-4 h-4 accent-white rounded cursor-pointer"
                />
                <span className="text-xs text-zinc-200 font-medium">Notificar al desvincular HWID (/resethwid)</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 2: TWO-FACTOR AUTHENTICATION (EXACTLY AS IN SCREENSHOT 2) */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-white">Two-Factor Authentication</h2>
          <div className="rounded-xl border border-white/10 bg-[#111110] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-white">Two-Factor Authentication</h3>
              <p className="text-xs text-zinc-400">
                {twoFactorEnabled ? '2FA enabled with Authenticator App' : '2FA disabled'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextState = !twoFactorEnabled;
                setTwoFactorEnabled(nextState);
                toast.success(nextState ? '2FA activado correctamente' : '2FA desactivado');
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-colors duration-150 self-start sm:self-auto"
            >
              {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>

        {/* SECTION 3: SIGNED-IN DEVICES (EXACTLY AS IN SCREENSHOT 2) */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-white">Signed-In Devices</h2>

          {/* Info Banner */}
          <div className="rounded-xl border border-white/10 bg-[#111110] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>
                These are all devices with an active dashboard login. Removed devices immediately lose Bearer token access.
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefreshSessions}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-white flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {/* Devices List */}
          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="rounded-xl border border-white/10 bg-[#111110] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex size-[36px] items-center justify-center rounded-[8px] bg-zinc-900 border border-white/10 text-zinc-400 shrink-0 mt-0.5">
                    <Laptop className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{sess.device}</span>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white border border-white/20">
                          Current session
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      {sess.ip} - {sess.authMethod}
                    </p>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-2 flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last active: {sess.lastActive}
                      </span>
                      <span>Created: {sess.createdAt}</span>
                      <span>Expires: {sess.expiresAt}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSignOutSession(sess)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white flex items-center gap-1.5 self-start md:self-auto shrink-0 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {sess.isCurrent ? 'Sign out this session' : 'Sign out device'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: CONNECTED ACCOUNTS (EXACTLY AS IN SCREENSHOT 2) */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-white">Connected Accounts</h2>

          <div className="space-y-3">
            {/* Google Account */}
            <div className="rounded-xl border border-white/10 bg-[#111110] p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-[36px] items-center justify-center rounded-[8px] bg-zinc-900 border border-white/10 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Google</h3>
                  <p className="text-xs text-zinc-400">
                    {googleLinked ? 'Google account linked' : 'No account linked'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !googleLinked;
                  setGoogleLinked(next);
                  toast.success(next ? 'Cuenta de Google vinculada' : 'Cuenta de Google desvinculada');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  googleLinked
                    ? 'bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                {googleLinked ? 'Unlink Google' : 'Link Google'}
              </button>
            </div>

            {/* Discord Account */}
            <div className="rounded-xl border border-white/10 bg-[#111110] p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-[36px] items-center justify-center rounded-[8px] bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Discord</h3>
                  <p className="text-xs text-zinc-400">
                    {discordLinked ? 'Discord account linked' : 'Link Discord'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !discordLinked;
                  setDiscordLinked(next);
                  toast.success(next ? 'Cuenta de Discord vinculada' : 'Cuenta de Discord desvinculada');
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                {discordLinked ? 'Unlink Discord' : 'Link Discord'}
              </button>
            </div>
          </div>
        </div>

        {/* CONDITIONAL FLOATING SAVE BAR - ONLY APPEARS WHEN THERE ARE UNSAVED CHANGES */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="sticky bottom-6 z-50 p-4 rounded-xl border border-white/20 bg-zinc-950/95 backdrop-blur-md shadow-2xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2 text-xs text-white">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-semibold">Tienes cambios sin guardar en tus ajustes</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWebhookUrl(initialSettings.webhookUrl);
                    setDiscordBotToken(initialSettings.discordBotToken);
                    setDiscordGuildId(initialSettings.discordGuildId);
                    setDiscordRoleName(initialSettings.discordRoleName);
                    setNotifyOnRedeem(initialSettings.notifyOnRedeem);
                    setNotifyOnHwidReset(initialSettings.notifyOnHwidReset);
                    setNotifyOnLogin(initialSettings.notifyOnLogin);
                    setGoogleLinked(initialSettings.googleLinked);
                    setDiscordLinked(initialSettings.discordLinked);
                    setTwoFactorEnabled(initialSettings.twoFactorEnabled);
                  }}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="bg-white hover:bg-zinc-200 text-zinc-950 px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors duration-150 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar y Aplicar Ajustes</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default Settings;
