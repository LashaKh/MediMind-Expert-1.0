import React from 'react';
import { EvidenceLevel as EvidenceLevelType } from '../../../types/markdown-viewer';

interface EvidenceLevelProps {
  evidence: EvidenceLevelType;
  className?: string;
}

/**
 * Evidence Level Badge Component
 * Displays color-coded evidence level badges with icons
 */
const EvidenceLevel: React.FC<EvidenceLevelProps> = ({ evidence, className = '' }) => {
  const { level, color, icon: Icon } = evidence;

  // Color scheme mappings
  const colorClasses = {
    emerald: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300',
    blue: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
    amber: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300',
    red: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
    slate: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300',
    purple: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300',
    indigo: 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border-indigo-300'
  };

  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.slate;

  return (
    <span 
      className={`inline-flex items-center gap-1 px-2.5 py-1 mx-1 rounded-lg border text-xs font-bold shadow-sm ${colorClass} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>Level {level}</span>
    </span>
  );
};

export default EvidenceLevel;