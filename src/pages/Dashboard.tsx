import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api, { formatErr } from '../lib/api';
import { Stats } from '../types';
import { Layers, KeyRound, ShieldCheck, Users, ArrowRight, Activity, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err: any) {
        toast.error(formatErr(err.response?.data?.detail));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="dashboard-page"
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-[24px] font-medium sm:text-[38px] sm:font-semibold text-[#EEEEEC] tracking-tight">Dashboard</h1>
          <p className="text-[15px] sm:text-[16px] text-[#B5B3AD] mt-1">Resumen de tus servicios registrados y métricas principales.</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <Link
            to="/stats"
            data-testid="dashboard-view-stats-link"
            className="border border-[#222221] hover:border-[#333330] bg-[#161614] hover:bg-[#1c1c1a] text-zinc-300 hover:text-white px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200"
          >
            <BarChart3 className="w-4 h-4 text-white" />
            <span>Ver Estadísticas</span>
          </Link>
          <Link
            to="/services"
            data-testid="dashboard-create-service-link"
            className="bg-[#EEEEEC] hover:bg-white text-zinc-950 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm"
          >
            <span>Gestionar Servicios</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-[12px] border border-[#191918] bg-[#111110] p-[16px] text-left transition-colors hover:border-[#292927] hover:bg-[#161614] space-y-2"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[15px] sm:text-[16px] font-medium text-[#B5B3AD]">Servicios</span>
            <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <Layers className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-[2px] text-[24px] sm:text-[38px] font-medium text-[#EEEEEC]">
            {loading ? '...' : stats?.services ?? 0}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-[12px] border border-[#191918] bg-[#111110] p-[16px] text-left transition-colors hover:border-[#292927] hover:bg-[#161614] space-y-2"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[15px] sm:text-[16px] font-medium text-[#B5B3AD]">Total Licencias</span>
            <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <KeyRound className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-[2px] text-[24px] sm:text-[38px] font-medium text-[#EEEEEC]">
            {loading ? '...' : stats?.licenses ?? 0}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-[12px] border border-[#191918] bg-[#111110] p-[16px] text-left transition-colors hover:border-[#292927] hover:bg-[#161614] space-y-2"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[15px] sm:text-[16px] font-medium text-[#B5B3AD]">Licencias Activas</span>
            <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-[2px] text-[24px] sm:text-[38px] font-medium text-[#EEEEEC]">
            {loading ? '...' : stats?.active_licenses ?? 0}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-[12px] border border-[#191918] bg-[#111110] p-[16px] text-left transition-colors hover:border-[#292927] hover:bg-[#161614] space-y-2"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[15px] sm:text-[16px] font-medium text-[#B5B3AD]">Usuarios Únicos</span>
            <div className="flex size-[36px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-[2px] text-[24px] sm:text-[38px] font-medium text-[#EEEEEC]">
            {loading ? '...' : stats?.users ?? 0}
          </div>
        </motion.div>
      </div>

      {/* Recent Verification Logs */}
      <div className="rounded-xl border border-white/10 bg-[#111110] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-[32px] items-center justify-center rounded-[8px] border border-[#222221] bg-[#191918]" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-white">Registros de Verificación Recientes</h2>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-zinc-500 py-8 text-center">Cargando actividad...</div>
        ) : !stats?.recent_verifications?.length ? (
          <div className="text-sm text-zinc-500 py-8 text-center">No hay solicitudes de verificación registradas.</div>
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
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

export default Dashboard;
