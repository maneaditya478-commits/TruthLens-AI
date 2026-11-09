import React from 'react';
import { Info } from 'lucide-react';

interface FreshnessScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showFormulaBreakdown?: boolean;
  breakdown?: {
    agreement: number;
    reliability: number;
    recency: number;
    diversity: number;
  };
}

export const FreshnessScoreGauge: React.FC<FreshnessScoreGaugeProps> = ({
  score,
  size = 'md',
  showFormulaBreakdown = false,
  breakdown
}) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

  // Determine color and qualitative tag
  let colorClass = 'text-emerald-400 stroke-emerald-500';
  let bgClass = 'bg-emerald-500/10 border-emerald-500/20';
  let label = 'Fresh & Accurate';

  if (normalizedScore < 40) {
    colorClass = 'text-rose-400 stroke-rose-500';
    bgClass = 'bg-rose-500/10 border-rose-500/20';
    label = 'Stale / Contradicted';
  } else if (normalizedScore < 75) {
    colorClass = 'text-amber-400 stroke-amber-500';
    bgClass = 'bg-amber-500/10 border-amber-500/20';
    label = 'Attention Needed';
  }

  const radius = size === 'lg' ? 46 : (size === 'md' ? 36 : 24);
  const stroke = size === 'lg' ? 8 : (size === 'md' ? 6 : 4);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  const dimension = (radius + stroke) * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90 drop-shadow-md"
        >
          {/* Background circle */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="transparent"
            stroke="#1F2937"
            strokeWidth={stroke}
          />
          {/* Animated score circle */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>

        {/* Center score display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-extrabold tracking-tight font-mono ${size === 'lg' ? 'text-3xl' : (size === 'md' ? 'text-xl' : 'text-sm')} ${colorClass}`}>
            {normalizedScore}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              / 100
            </span>
          )}
        </div>
      </div>

      {size !== 'sm' && (
        <div className="mt-2 text-center">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${bgClass} ${colorClass}`}>
            {label}
          </span>
        </div>
      )}

      {showFormulaBreakdown && breakdown && (
        <div className="mt-3 w-full bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-400 mb-2 font-medium">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Master Formula: F = 0.40A + 0.25R + 0.25T + 0.10D</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">Agreement (A):</span>
              <span className="text-cyan-400 font-semibold">{breakdown.agreement}%</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">Reliability (R):</span>
              <span className="text-cyan-400 font-semibold">{breakdown.reliability}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recency (T):</span>
              <span className="text-cyan-400 font-semibold">{breakdown.recency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Diversity (D):</span>
              <span className="text-cyan-400 font-semibold">{breakdown.diversity}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
