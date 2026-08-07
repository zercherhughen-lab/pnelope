import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import api, { formatErr } from '../lib/api';
import { Service, SecretRevealData } from '../types';
import SecretRevealDialog from '../components/SecretRevealDialog';
import ConfirmModal from '../components/ConfirmModal';
import { useServices } from '../context/ServiceContext';
import { Plus, Boxes, ArrowRight, Trash2, Layers, Shield, RefreshCcw, Tag } from 'lucide-react';
import { toast } from 'sonner';

export const Services: React.FC = () => {
  const { services, fetchServices, loading } = useServices();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [revealData, setRevealData] = useState<SecretRevealData | null>(null);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/services', { name, prefix, description });
      toast.success('Servicio creado correctamente');
      setName('');
      setPrefix('');
      setDescription('');
      setShowForm(false);
      await fetchServices();

      // Open Secret Reveal Dialog
      setRevealData({
        title: `Credenciales del Servicio: ${res.data.service.name}`,
        api_key: res.data.api_key,
        secret_id: res.data.secret_id,
      });
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/services/${deleteTarget.id}`);
      toast.success(`Servicio "${deleteTarget.name}" eliminado`);
      setDeleteTarget(null);
      await fetchServices();
    } catch (err: any) {
      toast.error(formatErr(err.response?.data?.detail));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="services-page"
      className="space-y-8 font-sans"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-[24px] font-medium sm:text-[38px] sm:font-semibold text-[#EEEEEC] tracking-tight">Servicios & Rango</h1>
          <p className="text-[15px] sm:text-[16px] text-[#B5B3AD] mt-1">
            Crea aplicaciones de servicio, configura credenciales (API Key y Secret ID) y administra roles o rangos.
          </p>
        </div>
        <button
          data-testid="new-service-btn"
          onClick={() => setShowForm(!showForm)}
          className="bg-[#EEEEEC] hover:bg-white text-zinc-950 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition-colors duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Servicio</span>
        </button>
      </div>

      {/* New Service Form */}
      {showForm && (
        <form
          data-testid="new-service-form"
          onSubmit={handleCreate}
          className="p-6 rounded-xl border border-white/20 bg-white/5 space-y-4 animate-in fade-in duration-200"
        >
          <h2 className="font-semibold text-white text-lg">Nuevo Servicio / Aplicación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Nombre del Servicio *</label>
              <input
                type="text"
                required
                data-testid="new-service-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Vape Cheat, Discord Bot, Licensing App"
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-md px-3.5 py-2 text-sm outline-none transition-colors duration-200 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Prefijo de Key (Opcional)</label>
              <input
                type="text"
                data-testid="new-service-prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="ej. VAPE (Predeterminado: VAUTH)"
                className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-md px-3.5 py-2 text-sm outline-none transition-colors duration-200 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve resumen del servicio"
              className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 rounded-md px-3.5 py-2 text-sm outline-none transition-colors duration-200 text-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              data-testid="submit-create-service"
              className="bg-[#EEEEEC] hover:bg-white disabled:opacity-50 text-zinc-950 px-5 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
            >
              {submitting ? 'Guardando...' : 'Guardar Servicio'}
            </button>
            <button
              type="button"
              data-testid="cancel-create-service"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500">Cargando servicios...</div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-white/10 bg-[#111110] space-y-3">
          <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-white font-medium text-lg">No hay servicios creados aún</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Crea tu primer servicio para comenzar a administrar credenciales de API y emitir licencias.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-6 rounded-xl border border-white/10 bg-[#111110] hover:bg-[#161615] hover:border-white/20 transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-[38px] items-center justify-center rounded-[10px] border border-[#222221] bg-[#191918] shrink-0" style={{ boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 0px 1px' }}>
                      <Boxes className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white text-lg group-hover:text-[#EEEEEC] transition-colors duration-200">
                        {srv.name}
                      </h2>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        Prefix: {srv.prefix || 'VAPE'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget({ id: srv.id, name: srv.name })}
                    className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-200"
                    title="Eliminar Servicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {srv.description || 'Sin descripción proporcionada.'}
                </p>

                {/* API Key / Secret Preview */}
                <div className="p-3 rounded-lg bg-zinc-950 border border-white/5 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-zinc-400">
                    <span>API KEY:</span>
                    <span className="text-zinc-300 font-medium">{srv.api_key.substring(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>SECRET ID:</span>
                    <span className="text-zinc-300 font-medium">{srv.secret_id.substring(0, 10)}...</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-4">
                  <span>{srv.licenses_count ?? 0} Keys</span>
                  <span>{srv.ranks_count ?? 0} Rango(s)</span>
                </div>

                <Link
                  to={`/services/${srv.id}`}
                  className="flex items-center gap-1.5 text-white font-medium hover:underline underline-offset-4"
                >
                  <span>Gestionar Rango / Credenciales</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Secret Reveal Dialog */}
      <SecretRevealDialog open={!!revealData} data={revealData} onClose={() => setRevealData(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title={`¿Eliminar servicio "${deleteTarget?.name}"?`}
        description="Esta acción eliminará permanentemente la aplicación de servicio junto con todas sus claves de licencia y rangos configurados en la base de datos."
        confirmLabel="Sí, Eliminar Servicio"
        confirmVariant="danger"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
};

export default Services;
