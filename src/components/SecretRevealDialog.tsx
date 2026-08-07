import React, { useState } from 'react';
import { ShieldAlert, X, Copy, Check } from 'lucide-react';
import { SecretRevealData } from '../types';

interface SecretRevealDialogProps {
  open: boolean;
  data: SecretRevealData | null;
  onClose: () => void;
}

const CopyRow: React.FC<{ label: string; value: string; testid: string }> = ({ label, value, testid }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</div>
      <div className="flex items-center gap-2 bg-zinc-950 border border-white/10 rounded-md p-2.5 font-mono text-xs text-[#EEEEEC] overflow-x-auto">
        <span className="flex-1 truncate">{value}</span>
        <button
          type="button"
          data-testid={testid}
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors duration-200"
          title={`Copy ${label}`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export const SecretRevealDialog: React.FC<SecretRevealDialogProps> = ({ open, data, onClose }) => {
  if (!open || !data) return null;

  return (
    <div
      data-testid="secret-reveal-dialog"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-md w-full relative shadow-2xl space-y-4">
        <button
          data-testid="secret-dialog-close"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight text-white">
              {data.title || 'Credentials Generated'}
            </h2>
            <p className="text-xs text-zinc-500">Save these now — they won't be shown again.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {data.api_key && data.api_key !== '(unchanged)' && (
            <CopyRow label="API Key" value={data.api_key} testid="copy-api-key" />
          )}
          {data.secret_id && data.secret_id !== '(unchanged)' && (
            <CopyRow label="Secret ID" value={data.secret_id} testid="copy-secret-id" />
          )}
        </div>

        <div className="mt-6 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/80">
          Store these credentials in your app's environment variables. If lost, you'll need to reset them.
        </div>

        <button
          data-testid="secret-dialog-done"
          onClick={onClose}
          className="mt-6 w-full bg-[#EEEEEC] text-zinc-950 hover:bg-white py-2.5 rounded-md text-sm font-semibold transition-colors duration-200"
        >
          I've saved them
        </button>
      </div>
    </div>
  );
};

export default SecretRevealDialog;
