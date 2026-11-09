import React from 'react';
import { CheckCircle2, Clock, XCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import { ClaimStatus, RiskLevel } from '../types';

interface StatusBadgeProps {
  status: ClaimStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  switch (status) {
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Verified Current</span>
        </span>
      );
    case 'POTENTIALLY_STALE':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span>Potentially Stale</span>
        </span>
      );
    case 'CONTRADICTED':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Contradicted</span>
        </span>
      );
    case 'CONFLICTING_EVIDENCE':
      return (
        <span className={`inline-flex items-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Conflicting Evidence</span>
        </span>
      );
    case 'UNVERIFIED':
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-700/30 text-slate-400 border border-slate-700/50 ${sizeClasses}`}>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Unverified</span>
        </span>
      );
  }
};

export const RiskBadge: React.FC<{ risk: RiskLevel }> = ({ risk }) => {
  switch (risk) {
    case 'HIGH':
      return (
        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
          High Freshness Risk
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Med Freshness Risk
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-700/40 text-slate-300 border border-slate-600/40">
          Low Freshness Risk
        </span>
      );
  }
};
