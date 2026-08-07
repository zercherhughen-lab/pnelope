import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import api, { formatErr } from '../lib/api';
import { Stats } from '../types';
import {
  BarChart3,
  RefreshCw,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';

export const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Prepare chart data for License Status Donut Chart
  const licenseStatusData = [
    { name: 'Activas', value: stats?.active_licenses ?? 0, color: '#10b981' },
    { name: 'Pausadas', value: stats?.paused_licenses ?? 0, color: '#f59e0b' },
    { name: 'Baneadas', value: stats?.banned_licenses ?? 0, color: '#f43f5e' },
    { name: 'Expiradas', value: stats?.expired_licenses ?? 0, color: '#64748b' },
  ].filter((d) => d.value > 0 || !stats);

  // Fallback if zero data
  const hasStatusData = licenseStatusData.some((d) => d.value > 0);

  // Prepare chart data for Service Breakdown Bar Chart
  const serviceChartData = (stats?.service_breakdown || []).map((s) => ({
    name: s.name,
    Licencias: s.total_licenses,
    Peticiones: s.verifications_count,
  }));

  // Prepare timeline activity chart data (grouped by hour/time from recent logs or formatted)
  const timelineData = React.useMemo(() => {
    if (!stats?.recent_verifications?.length) {
      return [
        { time: '00:00', Éxito: 0, Fallo: 0 },
        { time: '04:00', Éxito: 0, Fallo: 0 },
        { time: '08:00', Éxito: 0, Fallo: 0 },
        { time: '12:00', Éxito: 0, Fallo: 0 },
        { time: '16:00', Éxito: 0, Fallo: 0 },
        { time: '20:00', Éxito: 0, Fallo: 0 },
      ];
    }

    // Group logs by time intervals
    const groups: { [key: string]: { Éxito: number; Fallo: number } } = {};
    stats.recent_verifications.forEach((log) => {
      const date = new Date(log.timestamp);
      const hourStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!groups[hourStr]) {
        groups[hourStr] = { Éxito: 0, Fallo: 0 };
      }
      if (log.status === 'Success') {
        groups[hourStr].Éxito += 1;
      } else {
        groups[hourStr].Fallo += 1;
      }
    });

    return Object.entries(groups).map(([time, val]) => ({
      time,
      Éxito: val.Éxito,
      Fallo: val.Fallo,
    }));
  }, [stats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="stats-page"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-[24px] font-medium sm:text-[38px] sm:font-semibold text-[#EEEEEC] tracking-tight">Estadísticas Visuales</h1>
          <p className="text-[15px] sm:text-[16px] text-[#B5B3AD] mt-1">
            Análisis visual mediante gráficas de rendimiento, licencias y solicitudes API.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing || loading}
          className="bg-[#161614] hover:bg-[#1c1c1a] border border-[#222221] text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 self-start transition-all duration-200"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-white' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Grid of Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: License Distribution Donut */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#111110] space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
                <PieChartIcon className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-white text-base">Estado de Licencias</h2>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {loading ? (
              <div className="text-xs text-zinc-500">Cargando gráfica...</div>
            ) : !hasStatusData ? (
              <div className="text-xs text-zinc-500">No hay licencias registradas para graficar.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={licenseStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {licenseStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Verifications Timeline Area Chart */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#111110] space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-white text-base">Peticiones de Verificación</h2>
            </div>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">Cargando gráfica...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExito" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFallo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="Éxito" stroke="#10b981" fillOpacity={1} fill="url(#colorExito)" />
                  <Area type="monotone" dataKey="Fallo" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFallo)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Services Comparison Area Chart */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#111110] space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
          <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold text-white text-base">Comparativa por Servicio</h2>
        </div>

        <div className="h-72 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">Cargando gráfica...</div>
          ) : !serviceChartData.length ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              Crea servicios para ver la comparativa gráfica.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serviceChartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorLicencias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPeticiones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Licencias" stroke="#6366f1" fillOpacity={1} fill="url(#colorLicencias)" strokeWidth={2} />
                <Area type="monotone" dataKey="Peticiones" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPeticiones)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Verifications Feed */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#111110] space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-[32px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <Activity className="w-4 h-4 text-[#fae022]" />
            </div>
            <h2 className="font-semibold text-white text-base">Historial Reciente de Peticiones</h2>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-zinc-500 py-6 text-center">Cargando registros...</div>
        ) : !stats?.recent_verifications?.length ? (
          <div className="text-sm text-zinc-500 py-6 text-center">No hay peticiones de verificación registradas.</div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {stats.recent_verifications.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-sm gap-4 hover:bg-white/[0.01] px-1 rounded transition-colors">
                <div className="space-y-0.5">
                  <div className="font-mono text-xs text-[#EEEEEC] font-semibold">{log.key}</div>
                  <div className="text-xs text-zinc-400">{log.service_name}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      log.status === 'Success'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono hidden sm:inline">{log.ip || '127.0.0.1'}</span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsPage;
