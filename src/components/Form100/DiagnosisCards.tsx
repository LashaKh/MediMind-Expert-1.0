// Diagnosis Cards Component for Form 100
// Beautiful card-based diagnosis selection interface
// Replaces dropdown with modern card grid layout

import React, { useState } from 'react';
import { 
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { DiagnosisCode } from '../../types/form100';
import { FORM100_DIAGNOSES } from './config/form100Diagnoses';

interface DiagnosisCardsProps {
  selectedDiagnosis?: DiagnosisCode;
  onDiagnosisSelect: (diagnosis: DiagnosisCode) => void;
  className?: string;
}

// Color schemes using theme colors only
const getCardColors = (diagnosisCode: string, severity: string) => {
  switch (severity) {
    case 'critical':
      return 'from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]'; // Theme gradient for critical
    case 'severe':
      return 'from-[#2b6cb0] via-[#63b3ed] to-[#90cdf4]'; // Theme gradient for severe
    case 'moderate':
      return 'from-[#63b3ed] via-[#90cdf4] to-[#63b3ed]'; // Theme gradient for moderate
    default:
      return 'from-[#2b6cb0] to-[#63b3ed]'; // Default theme gradient
  }
};


const DiagnosisCards: React.FC<DiagnosisCardsProps> = ({
  selectedDiagnosis,
  onDiagnosisSelect,
  className
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleCardClick = (diagnosis: DiagnosisCode) => {
    onDiagnosisSelect(diagnosis);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Compact Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-[#1a365d] mb-1">
          Select Primary Diagnosis
        </h3>
        <p className="text-[#2b6cb0] text-sm">
          Choose the appropriate ICD-10 diagnosis code
        </p>
      </div>

      {/* Compact Diagnosis Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-7xl mx-auto">
        {FORM100_DIAGNOSES.map((diagnosis) => {
          const isSelected = selectedDiagnosis?.id === diagnosis.id;
          const isHovered = hoveredCard === diagnosis.id;
          const cardColors = getCardColors(diagnosis.code, diagnosis.severity);

          return (
            <div
              key={diagnosis.id}
              className={cn(
                "relative group cursor-pointer transition-all duration-300",
                "hover:scale-102",
                isSelected && "scale-102"
              )}
              onMouseEnter={() => setHoveredCard(diagnosis.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(diagnosis)}
            >
              {/* Glow Effect */}
              <div className={cn(
                "absolute -inset-1 rounded-xl blur opacity-0 transition-all duration-300",
                `bg-gradient-to-r ${cardColors}`,
                (isHovered || isSelected) && "opacity-20"
              )} />

              {/* Compact Main Card */}
              <div className={cn(
                "relative rounded-xl p-3 shadow-md border transition-all duration-300",
                "hover:shadow-lg min-h-[140px] flex flex-col",
                isSelected
                  ? "bg-gradient-to-br from-[#63b3ed]/10 via-white to-[#90cdf4]/10 border-[#63b3ed] shadow-[#63b3ed]/30"
                  : "bg-white border-transparent hover:border-[#90cdf4] hover:bg-gradient-to-br hover:from-[#90cdf4]/5 hover:to-transparent"
              )}>
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#63b3ed] rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* ICD Code Header */}
                <div className="mb-3">
                  <div className={cn(
                    "inline-flex items-center px-3 py-2 rounded-lg font-bold text-white text-base w-full justify-center",
                    `bg-gradient-to-r ${cardColors}`
                  )}>
                    <span>{diagnosis.code}</span>
                  </div>
                </div>

                {/* Compact Diagnosis Name */}
                <h4 className="text-sm font-bold text-[#1a365d] mb-1 leading-tight line-clamp-2 flex-1">
                  {diagnosis.name}
                </h4>

                {/* Compact English Name */}
                <p className="text-xs text-[#2b6cb0] line-clamp-1 mb-2">
                  {diagnosis.nameEn}
                </p>

                {/* Selection State Indicator */}
                {isSelected && (
                  <div className="text-xs text-[#63b3ed] font-medium text-center">
                    ✓ Selected
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Selected Diagnosis Info */}
      {selectedDiagnosis && (
        <div className="mt-4 p-4 bg-gradient-to-br from-[#63b3ed]/10 to-[#90cdf4]/10 rounded-xl border border-[#63b3ed]/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#63b3ed] rounded-lg flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#1a365d] mb-1">
                Selected: <span className="text-[#2b6cb0]">{selectedDiagnosis.code}</span>
              </h4>
              <p className="text-xs text-[#2b6cb0] truncate">
                {selectedDiagnosis.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisCards;