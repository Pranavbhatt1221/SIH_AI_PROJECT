import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'solid' | 'outline' | 'subtle';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant = 'subtle', className = '' }) => {
  const s = (status || '').toUpperCase();

  let colors = 'bg-slate-100 text-slate-700 border-slate-300';

  if (s.includes('PASS') || s.includes('VERIFIED') || s.includes('LOW') || s.includes('VALID') || (s.includes('MATCH') && !s.includes('MISMATCH')) || s.includes('CLEARED') || s.includes('CLEAN')) {
    colors = variant === 'solid'
      ? 'bg-emerald-600 text-white border-emerald-700'
      : 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (s.includes('REVIEW') || s.includes('MEDIUM') || s.includes('WARN') || s.includes('EXPIRED') || s.includes('PARTIAL') || s.includes('SUSPICIOUS')) {
    colors = variant === 'solid'
      ? 'bg-amber-600 text-white border-amber-700'
      : 'bg-amber-50 text-amber-900 border-amber-300';
  } else if (s.includes('FAIL') || s.includes('HIGH') || s.includes('BLACKLIST') || s.includes('REVOKED') || s.includes('MISMATCH') || s.includes('STOLEN') || s.includes('DENIED') || s.includes('TAMPERED') || s.includes('FORGERY')) {
    colors = variant === 'solid'
      ? 'bg-red-600 text-white border-red-700'
      : 'bg-red-50 text-red-800 border-red-300';
  } else if (s.includes('INFO') || s.includes('ACTIVE') || s.includes('FLAGGED') || s.includes('REGISTERED') || s.includes('PROCESSING')) {
    colors = variant === 'solid'
      ? 'bg-blue-600 text-white border-blue-700'
      : 'bg-blue-50 text-blue-800 border-blue-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide border ${colors} ${className}`}>
      {status}
    </span>
  );
};

