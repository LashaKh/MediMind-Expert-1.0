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

  // Color scheme mappings using theme colors
  const colorClasses = {
    emerald: 'bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 text-[#1a365d] border-[#63b3ed]/40',
    blue: 'bg-gradient-to-r from-[#63b3ed]/30 to-[#2b6cb0]/30 text-[#1a365d] border-[#2b6cb0]/40',
    amber: 'bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/25 text-[#1a365d] border-[#63b3ed]/35',
    red: 'bg-gradient-to-r from-[#2b6cb0]/25 to-[#1a365d]/25 text-[#1a365d] border-[#1a365d]/40',
    slate: 'bg-gradient-to-r from-[#90cdf4]/15 to-[#63b3ed]/20 text-[#1a365d] border-[#63b3ed]/30',
    purple: 'bg-gradient-to-r from-[#63b3ed]/25 to-[#2b6cb0]/25 text-[#1a365d] border-[#2b6cb0]/35',
    indigo: 'bg-gradient-to-r from-[#1a365d]/20 to-[#2b6cb0]/30 text-[#1a365d] border-[#2b6cb0]/40'
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