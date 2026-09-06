import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'solid' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant = 'solid', className = '' }) => {
  const s = (status || '').toUpperCase();

  let colors = 'bg-slate-800 text-slate-300 border-slate-700';

  if (s.includes('PASS') || s.includes('VERIFIED') || s.includes('LOW') || s.includes('VALID') || s.includes('MATCH') && !s.includes('MISMATCH')) {
    colors = variant === 'solid'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : 'border-emerald-500 text-emerald-400';
  } else if (s.includes('REVIEW') || s.includes('MEDIUM') || s.includes('WARN') || s.includes('EXPIRED') || s.includes('PARTIAL')) {
    colors = variant === 'solid'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      : 'border-amber-500 text-amber-400';
  } else if (s.includes('FAIL') || s.includes('HIGH') || s.includes('BLACKLIST') || s.includes('REVOKED') || s.includes('MISMATCH') || s.includes('STOLEN')) {
    colors = variant === 'solid'
      ? 'bg-red-500/15 text-red-400 border-red-500/30'
      : 'border-red-500 text-red-400';
  } else if (s.includes('INFO') || s.includes('ACTIVE') || s.includes('FLAGGED')) {
    colors = variant === 'solid'
      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
      : 'border-cyan-500 text-cyan-400';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${colors} ${className}`}>
      {status}
    </span>
  );
};
