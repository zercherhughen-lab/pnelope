import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api, { formatErr } from '../lib/api';
import { Service, License, Rank, SecretRevealData } from '../types';
import SecretRevealDialog from '../components/SecretRevealDialog';
import ConfirmModal from '../components/ConfirmModal';
import ExpirationCountdown from '../components/ExpirationCountdown';
import {
  ArrowLeft,
  KeyRound,
  Plus,
  RefreshCcw,
  Copy,
  Check,
  Trash2,
  Tag,
  Shield,
  Ban,
  Pause,
  Play,
  Key,
  RotateCcw,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Unlink,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

// Hover-to-reveal Credential Card component
const CredentialCard: React.FC<{ label: string; value: string; testid?: string }> = ({ label, value, testid }) => {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedValue = value
    ? value.length > 8
      ? `${value.substring(0, 6)}${'•'.repeat(Math.max(12, value.length - 6))}`
      : '••••••••••••••••'
    : '••••••••••••••••';

  return (
    <div
      data-testid={testid}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setHovered(!hovered)}
      className="p-4 rounded-xl border border-white/10 bg-[#111110] space-y-1.5 hover:border-white/20 transition-colors duration-200 cursor-pointer group relative"
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-[9px] text-zinc-400 font-normal flex items-center gap-1">
            {hovered ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-zinc-500" />}
            {hovered ? 'Revealed' : 'Hover to reveal'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition-colors duration-150"
          title={`Copy ${label}`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="font-mono text-xs text-[#EEEEEC] truncate select-none tracking-wider">
        {hovered ? value : maskedValue}
      </div>
    </div>
  );
};

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [showLicenseForm, setShowLicenseForm] = useState(false);
  const [username, setUsername] = useState('');
  
  // Custom Duration State
  const [durationMode, setDurationMode] = useState<'preset' | 'custom'>('preset');
  const [presetDuration, setPresetDuration] = useState('30 Days');
  const [customValue, setCustomValue] = useState('10');
  const [customUnit, setCustomUnit] = useState<string>('Seconds');
  const [exactDate, setExactDate] = useState('');

  const [rank, setRank] = useState('Default');
  const [hwid, setHwid] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingLicense, setSubmittingLicense] = useState(false);

  const [showRankForm, setShowRankForm] = useState(false);
  const [rankName, setRankName] = useState('');
  const [rankColor, setRankColor] = useState('#fc0e0e');
  const [submittingRank, setSubmittingRank] = useState(false);

  // Secret Reveal Dialog
  const [revealData, setRevealData] = useState<SecretRevealData | null>(null);

  // Copy state for keys
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Edit Duration Modal
  const [editingLic, setEditingLic] = useState<License | null>(null);
  const [editDurationVal, setEditDurationVal] = useState('30 Days');

  // Discord Bot Integration State
  const [discordToken, setDiscordToken] = useState('');
  const [discordGuildId, setDiscordGuildId] = useState('');
  const [discordRoleId, setDiscordRoleId] = useState('');
  const [discordRoleName, setDiscordRoleName] = useState('');
  const [discordEnabled, setDiscordEnabled] = useState(false);
  const [savingDiscord, setSavingDiscord] = useState(false);
  const [showDiscordToken, setShowDiscordToken] = useState(false);

  const fetchServiceData = async () => {
    if (!id) return;
    try {
      const [srvRes, licRes, rankRes] = await Promise.all([
        api.get(`/services/${id}`),
        api.get(`/services/${id}/licenses`),
        api.get(`/services/${id}/ranks`),
      ]);
      setService(srvRes.data);
      if (srvRes.data) {
        setDiscordToken(srvRes.data.discord_bot_token || '');
        setDiscordGuildId(srvRes.data.discord_guild_id || '');
        setDiscordRoleId(srvRes.data.discord_role_id || '');
        setDiscordRoleName(srvRes.data.discord_role_name || '');
        setDiscordEnabled(Boolean(srvRes.data.discord_bot_enabled));
      }
      setLicenses(licRes.data);
      setRanks(rankRes.data);
      if (rankRes.data && rankRes.data.length > 0) {
        setRank(rankRes.data[0].name);
      } else {
        setRank('Default');
      }
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiscordConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingDiscord(true);
    try {
      await api.patch(`/services/${id}/discord`, {
        discord_bot_token: discordToken,
        discord_guild_id: discordGuildId,
        discord_role_id: discordRoleId,
        discord_role_name: discordRoleName,
        discord_bot_enabled: discordEnabled,
      });
      toast.success('Discord Bot settings saved successfully');
      fetchServiceData();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setSavingDiscord(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [id]);

  const getComputedDurationString = () => {
    if (durationMode === 'preset') return presetDuration;
    if (exactDate) return exactDate;
    if (customUnit === 'Lifetime') return 'Lifetime';
    return `${customValue} ${customUnit}`;
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const finalDuration = getComputedDurationString();
    setSubmittingLicense(true);
    try {
      await api.post(`/services/${id}/licenses`, {
        username,
        duration: finalDuration,
        rank,
        hwid: hwid.trim() || undefined,
        notes,
        expires_at: exactDate || undefined,
      });
      toast.success('License generated successfully');
      setUsername('');
      setHwid('');
      setNotes('');
      setExactDate('');
      setShowLicenseForm(false);
      fetchServiceData();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setSubmittingLicense(false);
    }
  };

  const handleUpdateLicenseStatus = async (licId: string, newStatus: 'active' | 'paused' | 'banned') => {
    if (!id) return;
    try {
      await api.patch(`/services/${id}/licenses/${licId}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchServiceData();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    }
  };

  const handleResetHwid = async (licId: string, keyName: string) => {
    if (!id) return;
    try {
      await api.patch(`/services/${id}/licenses/${licId}`, { hwid: '' });
      toast.success('HWID unlinked and removed successfully');
      fetchServiceData();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    }
  };

  const handleEditHwid = async (licId: string, currentHwid: string) => {
    if (!id) return;
    const newHwid = prompt('Enter new HWID string (leave blank to unbind):', currentHwid || '');
    if (newHwid === null) return;
    try {
      await api.patch(`/services/${id}/licenses/${licId}`, { hwid: newHwid.trim() });
      if (!newHwid.trim()) {
        toast.success('HWID unlinked');
      } else {
        toast.success('HWID updated');
      }
      fetchServiceData();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    }
  };

  const handleSaveDurationEdit = async () => {
    if (!id || !editingLic) return;
    try {
      await api.patch(`/services/${id}/licenses/${editingLic.id}`, { duration: editDurationVal });
      toast.success('License duration updated successfully');
      setEditingLic(null);
      fetchServiceData();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    }
  };

  const handleDeleteLicense = async (licId: string) => {
    if (!id || !confirm('Permanently delete this license key?')) return;
    try {
      await api.delete(`/services/${id}/licenses/${licId}`);
      toast.success('License deleted');
      fetchServiceData();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    }
  };

  const handleCreateRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rankName.trim()) return;
    setSubmittingRank(true);
    try {
      await api.post(`/services/${id}/ranks/${encodeURIComponent(rankName.trim())}`, {
        color: rankColor,
      });
      toast.success('Rank added successfully');
      setRankName('');
      setShowRankForm(false);
      fetchServiceData();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setSubmittingRank(false);
    }
  };

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'reset-api-key' | 'reset-secret-id' | 'delete-license' | 'reset-hwid';
    targetId?: string;
    title: string;
    description: string;
    variant?: 'danger' | 'warning' | 'primary';
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleConfirmAction = async () => {
    if (!id || !confirmModal) return;
    setActionLoading(true);
    try {
      if (confirmModal.type === 'reset-api-key') {
        const res = await api.post(`/services/${id}/reset-api-key`);
        toast.success('API Key reset successfully');
        fetchServiceData();
        setRevealData({
          title: 'New API Key Generated',
          api_key: res.data.api_key,
          secret_id: '(unchanged)',
        });
      } else if (confirmModal.type === 'reset-secret-id') {
        const res = await api.post(`/services/${id}/reset-secret-id`);
        toast.success('Secret ID reset successfully');
        fetchServiceData();
        setRevealData({
          title: 'New Secret ID Generated',
          api_key: '(unchanged)',
          secret_id: res.data.secret_id,
        });
      } else if (confirmModal.type === 'delete-license' && confirmModal.targetId) {
        await api.delete(`/services/${id}/licenses/${confirmModal.targetId}`);
        toast.success('License deleted');
        fetchServiceData();
      } else if (confirmModal.type === 'reset-hwid' && confirmModal.targetId) {
        await api.patch(`/services/${id}/licenses/${confirmModal.targetId}`, { hwid: '' });
        toast.success('HWID unlinked successfully');
        fetchServiceData();
      }
      setConfirmModal(null);
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setActionLoading(false);
    }
  };

  const openResetHwidModal = (licId: string) => {
    setConfirmModal({
      open: true,
      type: 'reset-hwid',
      targetId: licId,
      title: 'Unlink HWID from license?',
      description: 'The client will be able to bind a new hardware ID on their next launch.',
      variant: 'warning',
    });
  };

  const openDeleteLicenseModal = (licId: string) => {
    setConfirmModal({
      open: true,
      type: 'delete-license',
      targetId: licId,
      title: 'Delete license key?',
      description: 'This license key will be permanently removed from the database.',
      variant: 'danger',
    });
  };

  const openResetApiKeyModal = () => {
    setConfirmModal({
      open: true,
      type: 'reset-api-key',
      title: 'Reset Service API Key?',
      description: 'WARNING: The previous API key will immediately stop working.',
      variant: 'warning',
    });
  };

  const openResetSecretIdModal = () => {
    setConfirmModal({
      open: true,
      type: 'reset-secret-id',
      title: 'Reset Service Secret ID?',
      description: 'WARNING: The previous Secret ID will immediately stop working.',
      variant: 'warning',
    });
  };

  const handleCopyKey = (keyText: string, keyId: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId(keyId);
    toast.success('Key copied to clipboard!');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  if (loading) {
    return <div className="text-center py-12 text-zinc-500">Loading service details...</div>;
  }

  if (!service) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-zinc-400">Service not found.</div>
        <Link to="/services" data-testid="back-to-services" className="text-zinc-300 hover:text-white font-medium underline underline-offset-2">
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="service-detail-page"
      className="space-y-8 font-sans"
    >
      {/* Header Navigation & Title */}
      <div className="space-y-4 pb-6 border-b border-white/10">
        <Link
          to="/services"
          data-testid="back-to-services"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Services
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-medium sm:text-[38px] sm:font-semibold text-[#EEEEEC] tracking-tight">{service.name}</h1>
              <p className="text-[15px] sm:text-[16px] text-[#B5B3AD] mt-1">{service.description || 'Service Application'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-testid="reset-api-key-btn"
              onClick={openResetApiKeyModal}
              className="px-3 py-2 rounded-md text-xs font-medium border border-white/10 hover:bg-white/5 text-zinc-300 flex items-center gap-2 transition-colors duration-200"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset API Key
            </button>

            <button
              data-testid="reset-secret-id-btn"
              onClick={openResetSecretIdModal}
              className="px-3 py-2 rounded-md text-xs font-medium border border-white/10 hover:bg-white/5 text-zinc-300 flex items-center gap-2 transition-colors duration-200"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset Secret ID
            </button>
          </div>
        </div>
      </div>

      {/* Service Credentials Banner - Hover to Reveal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CredentialCard label="API Key" value={service.api_key} testid="api-key-card" />
        <CredentialCard label="Secret ID" value={service.secret_id} testid="secret-id-card" />
      </div>

      {/* Discord Bot & Developer Portal Integration */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-[#111110] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex size-[36px] items-center justify-center rounded-[10px] bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-white text-base">Official Discord Bot Integration</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30">
                  Slash Commands (/claim, /resethwid)
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automatically issues keys to users with a specific Discord role and allows self-service HWID resets.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer self-start sm:self-auto bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-xs font-medium text-zinc-300">Bot Status:</span>
            <input
              type="checkbox"
              checked={discordEnabled}
              onChange={(e) => setDiscordEnabled(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 cursor-pointer"
            />
            <span className={`text-xs font-bold ${discordEnabled ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {discordEnabled ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </label>
        </div>

        {/* Security Rule Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-lg border border-white/10 bg-black/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Rule 1: Account Limit</span>
            <p className="text-zinc-300 font-medium">1 Key per Discord Account</p>
            <p className="text-[11px] text-zinc-500">Blocks duplicate claims from the same Discord account.</p>
          </div>
          <div className="p-3 rounded-lg border border-white/10 bg-black/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Rule 2: Required Role</span>
            <p className="text-zinc-300 font-medium">{discordRoleName || discordRoleId || 'Exclusive Role'}</p>
            <p className="text-[11px] text-zinc-500">Only users with the configured role can execute /claim.</p>
          </div>
          <div className="p-3 rounded-lg border border-white/10 bg-black/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Rule 3: Auto-Reset HWID</span>
            <p className="text-zinc-300 font-medium">/resethwid Command</p>
            <p className="text-[11px] text-zinc-500">Removes bound hardware ID for seamless device migration.</p>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSaveDiscordConfig} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Discord Bot Token (Developer Portal)</label>
                <button
                  type="button"
                  onClick={() => setShowDiscordToken(!showDiscordToken)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {showDiscordToken ? 'Hide' : 'Reveal Token'}
                </button>
              </div>
              <input
                type={showDiscordToken ? 'text' : 'password'}
                value={discordToken}
                onChange={(e) => setDiscordToken(e.target.value)}
                placeholder="MTI5... (Your Discord Application Bot Token)"
                className="w-full bg-zinc-950 border border-white/10 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-white font-mono outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Server ID / Guild ID (Optional)</label>
              <input
                type="text"
                value={discordGuildId}
                onChange={(e) => setDiscordGuildId(e.target.value)}
                placeholder="123456789012345678 (Discord Server ID)"
                className="w-full bg-zinc-950 border border-white/10 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-white font-mono outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Required Role Name in Discord</label>
              <input
                type="text"
                value={discordRoleName}
                onChange={(e) => setDiscordRoleName(e.target.value)}
                placeholder="e.g. Client, Buyer, VIP"
                className="w-full bg-zinc-950 border border-white/10 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Required Role ID in Discord (Optional)</label>
              <input
                type="text"
                value={discordRoleId}
                onChange={(e) => setDiscordRoleId(e.target.value)}
                placeholder="109876543210987654 (Numeric Role ID)"
                className="w-full bg-zinc-950 border border-white/10 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-zinc-400">
              * Slash commands supported: <code className="text-indigo-300 font-mono">/claim &lt;username&gt;</code> and <code className="text-indigo-300 font-mono">/resethwid &lt;key&gt; &lt;username&gt;</code>.
            </div>
            <button
              type="submit"
              disabled={savingDiscord}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors duration-200"
            >
              {savingDiscord ? 'Saving...' : 'Save Discord Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Ranks Management Section */}
      <div className="rounded-xl border border-white/10 bg-[#111110] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-[32px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <Tag className="w-4 h-4 text-[#fae022]" />
            </div>
            <h2 className="font-semibold text-white [font-family:Arial,sans-serif]">License Ranks / Tiers</h2>
          </div>
          <button
            data-testid="new-rank-btn"
            onClick={() => setShowRankForm(!showRankForm)}
            className="text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rank
          </button>
        </div>

        {showRankForm && (
          <form
            onSubmit={handleCreateRank}
            className="p-4 rounded-lg border border-white/10 bg-zinc-950 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                data-testid="new-rank-name"
                value={rankName}
                onChange={(e) => setRankName(e.target.value)}
                placeholder="Rank Name (e.g. VIP, Premium, Lifetime)"
                className="bg-[#111110] border border-white/10 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-white/30"
              />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  data-testid="new-rank-color"
                  value={rankColor}
                  onChange={(e) => setRankColor(e.target.value)}
                  className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                />
                <button
                  type="submit"
                  disabled={submittingRank}
                  data-testid="submit-new-rank"
                  className="flex-1 bg-[#EEEEEC] hover:bg-white text-zinc-950 py-1.5 rounded text-xs font-semibold transition-colors duration-200"
                >
                  {submittingRank ? 'Saving...' : 'Save Rank'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {ranks.length === 0 ? (
            <span className="text-xs text-zinc-500">No custom ranks added. Default rank active.</span>
          ) : (
            ranks.map((r) => (
              <span
                key={r.id}
                className="px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5"
                style={{
                  backgroundColor: `${r.color}15`,
                  borderColor: `${r.color}40`,
                  color: r.color,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                {r.name}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Licenses Management Section */}
      <div className="rounded-xl border border-white/10 bg-[#111110] p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex size-[32px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <Key className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-white [font-family:Arial,sans-serif]">License Keys & Tokens ({licenses.length})</h2>
          </div>
          <button
            data-testid="new-license-btn"
            onClick={() => setShowLicenseForm(!showLicenseForm)}
            className="bg-[#EEEEEC] hover:bg-white text-zinc-950 px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate License
          </button>
        </div>

        {/* Generate License Form with Custom Duration */}
        {showLicenseForm && (
          <form
            data-testid="new-license-form"
            onSubmit={handleCreateLicense}
            className="p-5 rounded-lg border border-white/20 bg-[#141413] space-y-4 animate-in fade-in duration-200"
          >
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Issue New License Key
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-medium text-zinc-400">Assigned User</label>
                <input
                  type="text"
                  data-testid="new-license-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. client_01"
                  className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-medium text-zinc-400">Rank / Role</label>
                <select
                  data-testid="new-license-rank"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded px-3 py-2 text-xs text-white outline-none"
                >
                  {ranks.length === 0 ? (
                    <option value="Default">Default</option>
                  ) : (
                    ranks.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* DURATION CONFIGURATION BOX */}
            <div className="p-3.5 rounded-xl border border-white/10 bg-zinc-950/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Custom Duration
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationMode('preset')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      durationMode === 'preset' ? 'bg-white/20 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationMode('custom')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      durationMode === 'custom' ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ⚡ Custom
                  </button>
                </div>
              </div>

              {durationMode === 'preset' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['1 Second', '10 Seconds', '1 Minute', '1 Hour', '24 Hours', '7 Days', '30 Days', 'Lifetime'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPresetDuration(p)}
                      className={`py-1.5 px-2 rounded text-[11px] font-medium border text-center transition-all ${
                        presetDuration === p
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase">Amount</label>
                    <input
                      type="number"
                      min="1"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      disabled={customUnit === 'Lifetime'}
                      className="w-full bg-zinc-900 border border-white/15 focus:border-amber-400/50 rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none disabled:opacity-40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase">Unit</label>
                    <select
                      value={customUnit}
                      onChange={(e: any) => setCustomUnit(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/15 focus:border-amber-400/50 rounded px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                    >
                      <option value="Seconds">Seconds (s)</option>
                      <option value="Minutes">Minutes (m)</option>
                      <option value="Hours">Hours (h)</option>
                      <option value="Days">Days (d)</option>
                      <option value="Weeks">Weeks (w)</option>
                      <option value="Months">Months (mo)</option>
                      <option value="Years">Years (y)</option>
                      <option value="Lifetime">Lifetime</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase">Exact Expiration</label>
                    <input
                      type="datetime-local"
                      value={exactDate}
                      onChange={(e) => setExactDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/15 focus:border-amber-400/50 rounded px-2 py-1 text-[11px] text-white outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span>Effective Duration:</span>
                <strong className="text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  {getComputedDurationString()}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-medium text-zinc-400">Pre-bind HWID (Optional)</label>
                <input
                  type="text"
                  data-testid="new-license-hwid"
                  value={hwid}
                  onChange={(e) => setHwid(e.target.value)}
                  placeholder="Leave empty to bind on first login"
                  className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded px-3 py-2 text-xs text-white font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-medium text-zinc-400">Notes / Metadata</label>
                <input
                  type="text"
                  data-testid="new-license-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. VIP Discord Client / Promotion"
                  className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submittingLicense}
                data-testid="submit-new-license"
                className="bg-[#EEEEEC] hover:bg-white disabled:opacity-50 text-zinc-950 px-4 py-2 rounded text-xs font-semibold transition-colors duration-200"
              >
                {submittingLicense ? 'Generating...' : 'Issue License'}
              </button>
              <button
                type="button"
                onClick={() => setShowLicenseForm(false)}
                className="px-3 py-2 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* License Table */}
        {licenses.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500">No license keys generated for this service yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-500 uppercase tracking-wider font-medium">
                  <th className="pb-3 font-medium">License Key</th>
                  <th className="pb-3 font-medium">Assignee</th>
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Remaining Time</th>
                  <th className="pb-3 font-medium">HWID</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="py-3 font-mono text-[#EEEEEC] font-medium">
                      <div className="flex items-center gap-2">
                        <span>{lic.key}</span>
                        <button
                          onClick={() => handleCopyKey(lic.key, lic.id)}
                          className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10"
                          title="Copy Key"
                        >
                          {copiedKeyId === lic.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-300">{lic.username || 'Unassigned'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-zinc-300 font-medium">
                        {lic.rank}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider inline-flex items-center gap-1 ${
                          lic.status === 'active'
                            ? 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20'
                            : lic.status === 'paused'
                            ? 'text-amber-300 bg-amber-400/10 border-amber-400/20'
                            : lic.status === 'banned'
                            ? 'text-rose-300 bg-rose-400/10 border-rose-400/20'
                            : 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            lic.status === 'active'
                              ? 'bg-emerald-400'
                              : lic.status === 'paused'
                              ? 'bg-amber-400'
                              : lic.status === 'banned'
                              ? 'bg-rose-400'
                              : 'bg-zinc-400'
                          }`}
                        />
                        {lic.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <ExpirationCountdown
                        duration={lic.duration}
                        expiresAt={lic.expires_at}
                        createdAt={lic.created_at}
                        status={lic.status}
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-400 max-w-[110px] truncate" title={lic.hwid || 'Unbound'}>
                          {lic.hwid || 'Unbound'}
                        </span>
                        {lic.hwid ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(lic.hwid!);
                                toast.success('HWID copied to clipboard');
                              }}
                              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10"
                              title="Copy HWID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => openResetHwidModal(lic.id)}
                              className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1 font-semibold"
                              title="Unlink and reset HWID"
                            >
                              <Unlink className="w-3 h-3 text-amber-400 shrink-0" />
                              Unlink
                            </button>
                            <button
                              onClick={() => handleEditHwid(lic.id, lic.hwid || '')}
                              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10"
                              title="Edit HWID"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditHwid(lic.id, '')}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1"
                            title="Set HWID manually"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            Set HWID
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Pause / Resume Button */}
                        {lic.status === 'active' ? (
                          <button
                            onClick={() => handleUpdateLicenseStatus(lic.id, 'paused')}
                            className="p-1.5 rounded text-amber-400 hover:bg-amber-500/10 transition-colors duration-150"
                            title="Pause License"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        ) : lic.status === 'paused' ? (
                          <button
                            onClick={() => handleUpdateLicenseStatus(lic.id, 'active')}
                            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors duration-150"
                            title="Resume License"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        {/* Edit Duration Button */}
                        <button
                          onClick={() => {
                            setEditingLic(lic);
                            setEditDurationVal(lic.duration || '30 Days');
                          }}
                          className="p-1.5 rounded text-amber-400 hover:bg-amber-500/10 transition-colors duration-150"
                          title="Edit Duration"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        {/* Ban / Unban Button */}
                        {lic.status === 'banned' ? (
                          <button
                            onClick={() => handleUpdateLicenseStatus(lic.id, 'active')}
                            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors duration-150"
                            title="Unban License"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateLicenseStatus(lic.id, 'banned')}
                            className="p-1.5 rounded text-white hover:bg-white/10 transition-colors duration-150"
                            title="Ban License"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteLicenseModal(lic.id)}
                          className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition-colors duration-200"
                          title="Delete License"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Duration Modal */}
      {editingLic && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141413] border border-white/20 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Modify License Duration
            </h3>
            <p className="text-xs text-zinc-400">
              License Key: <strong className="text-white font-mono">{editingLic.key}</strong>
            </p>

            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-medium">Enter new duration string:</label>
              <input
                type="text"
                value={editDurationVal}
                onChange={(e) => setEditDurationVal(e.target.value)}
                placeholder="e.g. 10 Seconds, 5 Minutes, 12 Hours, Lifetime"
                className="w-full bg-zinc-950 border border-white/15 focus:border-amber-400/50 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['1 Second', '10 Seconds', '1 Minute', '1 Hour', '12 Hours', '7 Days', '30 Days', 'Lifetime'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setEditDurationVal(val)}
                    className="px-2 py-1 rounded text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingLic(null)}
                className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDurationEdit}
                className="bg-[#EEEEEC] hover:bg-white text-zinc-950 px-4 py-1.5 rounded-md text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <SecretRevealDialog open={!!revealData} data={revealData} onClose={() => setRevealData(null)} />

      <ConfirmModal
        open={!!confirmModal?.open}
        title={confirmModal?.title || ''}
        description={confirmModal?.description || ''}
        confirmLabel="Confirm"
        confirmVariant={confirmModal?.variant || 'danger'}
        loading={actionLoading}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmAction}
      />
    </motion.div>
  );
};

export default ServiceDetail;
