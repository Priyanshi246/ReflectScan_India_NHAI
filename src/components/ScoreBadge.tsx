import { AssetStatus } from '../types';

interface ScoreBadgeProps {
  score?: number;
  status: AssetStatus | 'pass' | 'warning' | 'fail';
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreBadge({ score, status, size = 'md' }: ScoreBadgeProps) {
  const colorMap = {
    pass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    fail: 'bg-red-500/20 text-red-400 border-red-500/30',
    unknown: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const sizeMap = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const labelMap = {
    pass: 'PASS',
    warning: 'WARNING',
    fail: 'FAIL',
    unknown: 'UNKNOWN',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${colorMap[status]} ${sizeMap[size]}`}>
      {score !== undefined && <span>{score}%</span>}
      <span>{labelMap[status]}</span>
    </span>
  );
}
