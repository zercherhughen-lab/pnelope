import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api, { formatErr } from '../lib/api';
import { useServices } from '../context/ServiceContext';
import { License, Rank } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import ExpirationCountdown from '../components/ExpirationCountdown';
import {
  Key,
  Plus,
  Search,
  Filter,
  Check,
  Copy,
  Trash2,
  Pause,
  Play,
  Shield,
  Ban,
  Lock,
  Edit3,
  Clock,
  Download,
  Unlink,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export const Licenses: React.FC = () => {
  const { services, selectedServiceId, setSelectedServiceId } = useServices();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'banned' | 'expired'>('all');

  // Issue License Form
  const [showForm, setShowForm] = useState(false);
  const [targetServiceId, setTargetServiceId] = useState<string>('');
  const [username, setUsername] = useState('');
  
  // Custom Duration State
  const [durationMode, setDurationMode] = useState<'preset' | 'custom'>('preset');
  const [presetDuration, setPresetDuration] = useState('30 Days');
  const [customValue, setCustomValue] = useState('10');
  const [customUnit, setCustomUnit] = useState<string>('Segundos');
  const [exactDate, setExactDate] = useState('');

  const [rank, setRank] = useState('Default');
  const [hwid, setHwid] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Target service ranks
  const [targetRanks, setTargetRanks] = useState<Rank[]>([]);

  // Copy indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Duration Modal
  const [editingDurationLic, setEditingDurationLic] = useState<License | null>(null);
  const [editDurationVal, setEditDurationVal] = useState('30 Days');

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant?: 'danger' | 'warning' | 'primary';
    action: () => Promise<void>;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const url = selectedServiceId && selectedServiceId !== 'all'
        ? `/licenses?service_id=${selectedServiceId}`
        : '/licenses';
      const res = await api.get(url);
      setLicenses(res.data || []);
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, [selectedServiceId]);

  useEffect(() => {
    if (!targetServiceId && services.length > 0) {
      const initialId = selectedServiceId !== 'all' ? selectedServiceId : services[0].id;
      setTargetServiceId(initialId);
    }
  }, [services, selectedServiceId]);

  useEffect(() => {
    const fetchRanks = async () => {
      if (!targetServiceId) return;
      try {
        const res = await api.get(`/services/${targetServiceId}/ranks`);
        setTargetRanks(res.data || []);
        if (res.data && res.data.length > 0) {
          setRank(res.data[0].name);
        } else {
          setRank('Default');
        }
      } catch {
        setTargetRanks([]);
        setRank('Default');
      }
    };
    fetchRanks();
  }, [targetServiceId]);

  const getComputedDurationString = () => {
    if (durationMode === 'preset') return presetDuration;
    if (exactDate) return exactDate;
    if (customUnit === 'Lifetime' || customUnit === 'Vitalicia') return 'Lifetime';
    return `${customValue} ${customUnit}`;
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetServiceId) {
      toast.error('Selecciona un servicio para generar la licencia');
      return;
    }
    const finalDuration = getComputedDurationString();
    setSubmitting(true);
    try {
      await api.post(`/services/${targetServiceId}/licenses`, {
        username,
        duration: finalDuration,
        rank,
        hwid: hwid.trim() || undefined,
        notes,
        expires_at: exactDate || undefined,
      });
      toast.success('Licencia generada correctamente');
      setUsername('');
      setHwid('');
      setNotes('');
      setExactDate('');
      setShowForm(false);
      fetchLicenses();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (serviceId: string, licId: string, newStatus: 'active' | 'paused' | 'banned') => {
    try {
      await api.patch(`/services/${serviceId}/licenses/${licId}`, { status: newStatus });
      toast.success(`Estado actualizado a ${newStatus}`);
      fetchLicenses();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    }
  };

  const openResetHwidModal = (serviceId: string, licId: string, keyName: string) => {
    setConfirmModal({
      open: true,
      title: '¿Desvincular y remover HWID?',
      description: `Se quitará el HWID de la licencia ${keyName}. El campo quedará vacío y el cliente podrá vincular un nuevo hardware en su próximo inicio de sesión.`,
      variant: 'warning',
      action: async () => {
        await api.patch(`/services/${serviceId}/licenses/${licId}`, { hwid: '' });
        toast.success('HWID desvinculado y removido con éxito');
        fetchLicenses();
      },
    });
  };

  const handleEditHwid = async (serviceId: string, licId: string, currentHwid: string) => {
    const newHwid = prompt('Ingresa la nueva cadena HWID (o déjala en blanco para desvincular):', currentHwid || '');
    if (newHwid === null) return;
    try {
      await api.patch(`/services/${serviceId}/licenses/${licId}`, { hwid: newHwid.trim() });
      if (!newHwid.trim()) {
        toast.success('HWID removido y desvinculado');
      } else {
        toast.success('HWID actualizado correctamente');
      }
      fetchLicenses();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    }
  };

  const handleSaveDurationEdit = async () => {
    if (!editingDurationLic) return;
    try {
      await api.patch(`/services/${editingDurationLic.service_id}/licenses/${editingDurationLic.id}`, {
        duration: editDurationVal,
      });
      toast.success('Duración actualizada correctamente');
      setEditingDurationLic(null);
      fetchLicenses();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    }
  };

  const openDeleteLicenseModal = (serviceId: string, licId: string, keyName: string) => {
    setConfirmModal({
      open: true,
      title: `¿Eliminar licencia ${keyName}?`,
      description: 'Esta acción eliminará de forma permanente la clave de licencia de la base de datos.',
      variant: 'danger',
      action: async () => {
        await api.delete(`/services/${serviceId}/licenses/${licId}`);
        toast.success('Licencia eliminada');
        fetchLicenses();
      },
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      await confirmModal.action();
      setConfirmModal(null);
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string, label: string = 'Texto') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`¡${label} copiado al portapapeles!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToCSV = () => {
    if (filteredLicenses.length === 0) {
      toast.error('No hay licencias para exportar');
      return;
    }
    const headers = ['ID', 'Servicio', 'Clave', 'Usuario', 'Estado', 'Rango', 'Duración', 'HWID', 'Creada'];
    const rows = filteredLicenses.map((l) => [
      l.id,
      (l as any).service_name || 'Desconocido',
      l.key,
      l.username || 'Sin asignar',
      l.status,
      l.rank || 'Default',
      l.duration || '30 Days',
      l.hwid || 'Sin vincular',
      l.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vauth_licenses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Archivo CSV exportado correctamente');
  };

  // Filtered Licenses
  const filteredLicenses = licenses.filter((lic) => {
    const matchesSearch =
      !search.trim() ||
      lic.key.toLowerCase().includes(search.toLowerCase().trim()) ||
      (lic.username && lic.username.toLowerCase().includes(search.toLowerCase().trim())) ||
      (lic.hwid && lic.hwid.toLowerCase().includes(search.toLowerCase().trim()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'expired'
        ? lic.expires_at ? new Date(lic.expires_at).getTime() < Date.now() : false
        : lic.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = licenses.filter((l) => l.status === 'active').length;
  const bannedCount = licenses.filter((l) => l.status === 'banned').length;
  const pausedCount = licenses.filter((l) => l.status === 'paused').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="licenses-page"
      className="space-y-8 font-sans"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            Panel de Claves VAuth
          </div>
          <h1 className="text-[24px] font-medium sm:text-[38px] sm:font-semibold text-[#EEEEEC] tracking-tight">
            Gestión de Licencias
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#B5B3AD] mt-1">
            Administra claves, duraciones personalizadas, desvinculación rápida de HWID y rangos.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={exportToCSV}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors duration-200"
            title="Exportar licencias visibles a CSV"
          >
            <Download className="w-4 h-4 text-zinc-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#EEEEEC] hover:bg-white text-zinc-950 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Generar Licencia</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-[#111110] space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Total Licencias</span>
          <div className="text-2xl font-semibold text-white">{licenses.length}</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <span className="text-xs text-emerald-400 font-medium">Activas</span>
          <div className="text-2xl font-semibold text-emerald-400">{activeCount}</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
          <span className="text-xs text-amber-400 font-medium">Pausadas</span>
          <div className="text-2xl font-semibold text-amber-400">{pausedCount}</div>
        </div>
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-1">
          <span className="text-xs text-rose-400 font-medium">Baneadas</span>
          <div className="text-2xl font-semibold text-rose-400">{bannedCount}</div>
        </div>
      </div>

      {/* Generate License Form with CUSTOM DURATION */}
      {showForm && (
        <form
          onSubmit={handleCreateLicense}
          className="p-6 rounded-xl border border-white/20 bg-[#141413] space-y-5 shadow-xl animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="font-semibold text-white text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Emisión de Nueva Clave de Licencia
            </h2>
            <span className="text-[11px] text-zinc-400">Personaliza duraciones, HWID pre-fijado o fecha exacta</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Servicio Destino *</label>
              <select
                value={targetServiceId}
                onChange={(e) => setTargetServiceId(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-white outline-none"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.prefix || 'VAUTH'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Usuario Asignado</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej. cliente_vape_01"
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Rango / Rol</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-white outline-none"
              >
                {targetRanks.length === 0 ? (
                  <option value="Default">Default</option>
                ) : (
                  targetRanks.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* DURATION CONFIGURATION BOX */}
          <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Configurar Duración de la Licencia
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDurationMode('preset')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    durationMode === 'preset' ? 'bg-white/20 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Presets Rápidos
                </button>
                <button
                  type="button"
                  onClick={() => setDurationMode('custom')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    durationMode === 'custom' ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚡ Duración Personalizada
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
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      presetDuration === p
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-bold'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {p === 'Lifetime' ? 'Vitalicia (Lifetime)' : p}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-medium">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    disabled={customUnit === 'Lifetime'}
                    className="w-full bg-zinc-900 border border-white/15 focus:border-amber-400/50 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none disabled:opacity-40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-medium">Unidad de Tiempo</label>
                  <select
                    value={customUnit}
                    onChange={(e: any) => setCustomUnit(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/15 focus:border-amber-400/50 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
                  >
                    <option value="Segundos">Segundos (s)</option>
                    <option value="Minutos">Minutos (m)</option>
                    <option value="Horas">Horas (h)</option>
                    <option value="Días">Días (d)</option>
                    <option value="Semanas">Semanas (w)</option>
                    <option value="Meses">Meses (mo)</option>
                    <option value="Años">Años (y)</option>
                    <option value="Lifetime">Vitalicia (Lifetime)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    O Expiración Exacta (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={exactDate}
                    onChange={(e) => setExactDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/15 focus:border-amber-400/50 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-1">
              <span>Duración final a asignar:</span>
              <strong className="text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                {getComputedDurationString()}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Pre-Fijar HWID (Opcional)</label>
              <input
                type="text"
                value={hwid}
                onChange={(e) => setHwid(e.target.value)}
                placeholder="Dejar en blanco para vincular automáticamente en el primer PC"
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400">Notas Adicionales</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ej. Venta VIP por Discord / Promoción"
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#EEEEEC] hover:bg-white disabled:opacity-50 text-zinc-950 px-5 py-2.5 rounded-lg text-xs font-bold transition-colors duration-200"
            >
              {submitting ? 'Generando Licencia...' : 'Guardar y Emitir Licencia'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-[#111110]">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Licencia, Usuario o HWID..."
            className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Servicio:</span>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="bg-zinc-950 border border-white/10 focus:border-white/30 rounded px-2.5 py-1.5 text-xs text-white outline-none"
            >
              <option value="all">Todos los servicios ({services.length})</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 border border-white/10 p-1 rounded-lg text-xs">
            {(['all', 'active', 'paused', 'banned', 'expired'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  statusFilter === st ? 'bg-white/10 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st === 'all' ? 'Todas' : st === 'active' ? 'Activas' : st === 'paused' ? 'Pausadas' : st === 'banned' ? 'Baneadas' : 'Expiradas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="rounded-xl border border-white/10 bg-[#111110] p-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-sm">Cargando licencias...</div>
        ) : filteredLicenses.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 space-y-2">
            <Key className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">No se encontraron licencias</p>
            <p className="text-xs text-zinc-500">Ajusta la búsqueda o crea una nueva clave con duración personalizada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-500 uppercase tracking-wider font-medium">
                  <th className="pb-3 font-medium">Servicio</th>
                  <th className="pb-3 font-medium">Clave de Licencia</th>
                  <th className="pb-3 font-medium">Usuario</th>
                  <th className="pb-3 font-medium">Rango</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Duración / Expiración</th>
                  <th className="pb-3 font-medium">HWID Asignado</th>
                  <th className="pb-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLicenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="py-3 font-medium text-zinc-300">
                      <button
                        onClick={() => handleCopyText((lic as any).service_name || 'Vape', `srv-${lic.id}`, 'Nombre de Servicio')}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-zinc-300 font-semibold inline-flex items-center gap-1 group"
                        title="Clic para copiar nombre de servicio"
                      >
                        <span>{(lic as any).service_name || 'Vape'}</span>
                        <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-zinc-400" />
                      </button>
                    </td>
                    <td className="py-3 font-mono text-[#EEEEEC] font-semibold">
                      <div className="flex items-center gap-2">
                        <span>{lic.key}</span>
                        <button
                          onClick={() => handleCopyText(lic.key, lic.id, 'Clave de Licencia')}
                          className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                          title="Copiar Clave al Portapapeles"
                        >
                          {copiedId === lic.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <span>{lic.username || 'Sin asignar'}</span>
                        {lic.username && (
                          <button
                            onClick={() => handleCopyText(lic.username!, `usr-${lic.id}`, 'Usuario')}
                            className="p-0.5 rounded text-zinc-600 hover:text-white"
                            title="Copiar Usuario"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-zinc-300 font-medium">
                        {lic.rank || 'Default'}
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
                      <div className="flex items-center gap-2">
                        <ExpirationCountdown
                          duration={lic.duration}
                          expiresAt={lic.expires_at}
                          createdAt={lic.created_at}
                          status={lic.status}
                        />
                        <button
                          onClick={() => {
                            setEditingDurationLic(lic);
                            setEditDurationVal(lic.duration || '30 Days');
                          }}
                          className="p-1 rounded text-zinc-500 hover:text-amber-300 hover:bg-white/10"
                          title="Cambiar duración personalizada"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] max-w-[110px] truncate ${
                            lic.hwid ? 'text-zinc-300' : 'text-zinc-500 italic'
                          }`}
                          title={lic.hwid || 'Sin vincular'}
                        >
                          {lic.hwid || 'Sin vincular'}
                        </span>
                        {lic.hwid ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyText(lic.hwid!, `hwid-${lic.id}`, 'HWID')}
                              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10"
                              title="Copiar HWID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {/* UNBIND BUTTON */}
                            <button
                              onClick={() => openResetHwidModal(lic.service_id, lic.id, lic.key)}
                              className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1 font-semibold"
                              title="Desvincular y remover HWID inmediatamente"
                            >
                              <Unlink className="w-3 h-3 text-amber-400 shrink-0" />
                              Desvincular
                            </button>
                            <button
                              onClick={() => handleEditHwid(lic.service_id, lic.id, lic.hwid || '')}
                              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10"
                              title="Editar HWID libremente"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditHwid(lic.service_id, lic.id, '')}
                            className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1"
                            title="Fijar HWID manual"
                          >
                            <Lock className="w-2.5 h-2.5 text-zinc-400" />
                            Fijar HWID
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Pause / Resume */}
                        {lic.status === 'active' ? (
                          <button
                            onClick={() => handleUpdateStatus(lic.service_id, lic.id, 'paused')}
                            className="p-1.5 rounded text-amber-400 hover:bg-amber-500/10 transition-colors duration-150"
                            title="Pausar Licencia"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        ) : lic.status === 'paused' ? (
                          <button
                            onClick={() => handleUpdateStatus(lic.service_id, lic.id, 'active')}
                            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors duration-150"
                            title="Reanudar Licencia"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        {/* Ban / Unban */}
                        {lic.status === 'banned' ? (
                          <button
                            onClick={() => handleUpdateStatus(lic.service_id, lic.id, 'active')}
                            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/10 transition-colors duration-150"
                            title="Desbanear Licencia"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(lic.service_id, lic.id, 'banned')}
                            className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10 transition-colors duration-150"
                            title="Banear Licencia"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => openDeleteLicenseModal(lic.service_id, lic.id, lic.key)}
                          className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition-colors duration-200"
                          title="Eliminar Licencia"
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
      {editingDurationLic && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141413] border border-white/20 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Modificar Duración de Licencia
            </h3>
            <p className="text-xs text-zinc-400">
              Clave: <strong className="text-white font-mono">{editingDurationLic.key}</strong>
            </p>

            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-medium">Ingresa nueva duración o plazo:</label>
              <input
                type="text"
                value={editDurationVal}
                onChange={(e) => setEditDurationVal(e.target.value)}
                placeholder="ej. 15 Días, 12 Horas, 6 Meses, Lifetime"
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
                onClick={() => setEditingDurationLic(null)}
                className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDurationEdit}
                className="bg-[#EEEEEC] hover:bg-white text-zinc-950 px-4 py-1.5 rounded-md text-xs font-bold"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.open}
          title={confirmModal.title}
          description={confirmModal.description}
          variant={confirmModal.variant}
          loading={actionLoading}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </motion.div>
  );
};

export default Licenses;
