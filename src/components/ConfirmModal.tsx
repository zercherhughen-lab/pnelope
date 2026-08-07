import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, RefreshCcw, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmVariant = 'warning',
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const isDanger = confirmVariant === 'danger';
  const isWarning = confirmVariant === 'warning';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-[#111110] border border-white/10 rounded-xl p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                  isDanger
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : isWarning
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-white/10 text-white border-white/20'
                }`}
              >
                {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">{title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{description}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm ${
                isDanger
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : isWarning
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold'
                  : 'bg-[#EEEEEC] hover:bg-white text-zinc-950 font-bold'
              }`}
            >
              {loading && <RefreshCcw className="w-3.5 h-3.5 animate-spin" />}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
