import React, { useEffect, useState } from 'react';
import { Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface ExpirationCountdownProps {
  duration?: string;
  expiresAt?: string | null;
  createdAt?: string;
  status?: string;
}

function parseDurationToMsClient(durationStr?: string): number | null {
  if (!durationStr) return null;
  const lower = durationStr.toLowerCase().trim();
  if (['lifetime', 'vitalicia', 'ilimitado', 'unlimited', 'forever', '0'].includes(lower)) {
    return null;
  }
  const match = lower.match(/^(\d+)\s*([a-zñáéíóú]+)?$/);
  if (match) {
    const val = parseInt(match[1], 10);
    const unit = (match[2] || 'd').toLowerCase();
    if (unit === 's' || unit === 'sec' || unit === 'secs' || unit.startsWith('seg') || unit.startsWith('second')) return val * 1000;
    if (unit === 'm' || unit === 'min' || unit === 'mins' || unit.startsWith('minuto') || unit.startsWith('minute')) return val * 60000;
    if (unit === 'h' || unit === 'hr' || unit === 'hrs' || unit.startsWith('hor') || unit.startsWith('hour')) return val * 3600000;
    if (unit === 'd' || unit === 'day' || unit === 'days' || unit.startsWith('dia') || unit.startsWith('días')) return val * 86400000;
    if (unit === 'w' || unit === 'wk' || unit === 'wks' || unit.startsWith('week') || unit.startsWith('sem')) return val * 7 * 86400000;
    if (unit === 'mo' || unit === 'mon' || unit === 'mons' || unit.startsWith('month') || unit.startsWith('mes')) return val * 30 * 86400000;
    if (unit === 'y' || unit === 'yr' || unit === 'yrs' || unit.startsWith('year') || unit.startsWith('año') || unit.startsWith('ano')) return val * 365 * 86400000;
    return val * 86400000;
  }
  const num = parseInt(durationStr, 10);
  if (!isNaN(num) && num > 0) return num * 86400000;
  return 30 * 86400000;
}

export const ExpirationCountdown: React.FC<ExpirationCountdownProps> = ({
  duration,
  expiresAt,
  createdAt,
  status,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Tick every second for live countdown
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const normDuration = duration?.toLowerCase().trim() || '';
  const normExpires = expiresAt?.toLowerCase().trim() || '';

  const isLifetime =
    ['lifetime', 'vitalicia', 'ilimitado', 'unlimited'].includes(normDuration) ||
    ['lifetime', 'vitalicia', 'ilimitado', 'unlimited'].includes(normExpires);

  if (isLifetime) {
    return (
      <div className="flex flex-col gap-1 min-w-[120px]">
        <div className="flex items-center justify-between text-[11px] font-medium text-emerald-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Lifetime
          </span>
          <span className="text-[10px] text-zinc-400">Vitalicia</span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div className="bg-emerald-500 h-full w-full rounded-full" />
        </div>
      </div>
    );
  }

  // Not yet activated
  if (!expiresAt) {
    return (
      <div className="flex flex-col gap-1 min-w-[120px]">
        <div className="flex items-center justify-between text-[11px] font-medium text-amber-300">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            {duration || '30 Days'}
          </span>
          <span className="text-[9px] text-zinc-400 font-mono">1er uso</span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div className="bg-amber-400/50 h-full w-full rounded-full" />
        </div>
      </div>
    );
  }

  const expiresTime = new Date(expiresAt).getTime();
  const diff = expiresTime - now;

  if (isNaN(expiresTime) || diff <= 0 || status === 'expired') {
    return (
      <div className="flex flex-col gap-1 min-w-[120px]">
        <div className="flex items-center justify-between text-[11px] font-medium text-rose-400">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Expirado
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">0s</span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div className="bg-rose-500 h-full w-0 rounded-full" />
        </div>
      </div>
    );
  }

  // Calculate total duration in ms accurately
  let totalMs = 30 * 24 * 60 * 60 * 1000;
  if (createdAt) {
    const createdTime = new Date(createdAt).getTime();
    if (!isNaN(createdTime) && expiresTime > createdTime) {
      totalMs = expiresTime - createdTime;
    }
  } else if (duration) {
    const parsed = parseDurationToMsClient(duration);
    if (parsed && parsed > 0) totalMs = parsed;
  }

  const percentage = Math.min(100, Math.max(0, (diff / totalMs) * 100));

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let timeString = '';
  if (days > 0) {
    timeString = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    timeString = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    timeString = `${minutes}m ${seconds}s`;
  } else {
    timeString = `${seconds}s`;
  }

  // Color gradient
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-400';
  if (percentage <= 15) {
    barColor = 'bg-rose-500 animate-pulse';
    textColor = 'text-rose-400';
  } else if (percentage <= 40) {
    barColor = 'bg-amber-400';
    textColor = 'text-amber-300';
  }

  return (
    <div className="flex flex-col gap-1 min-w-[130px]">
      <div className={`flex items-center justify-between text-[11px] font-mono font-medium ${textColor}`}>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 shrink-0" />
          {timeString}
        </span>
        <span className="text-[10px] text-zinc-400 font-sans">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden border border-white/5">
        <div
          className={`${barColor} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ExpirationCountdown;
