// Form 100 Direct Generation Section Component
// Displays Form 100 generation cards that open Form100Modal directly with raw transcript
// Bypasses need to generate initial consult first

import React from 'react';
import {
  ClipboardList,
  Sparkles,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface Form100DirectSectionProps {
  onOpenForm100Modal: () => void;
  disabled?: boolean;
}

export const Form100DirectSection: React.FC<Form100DirectSectionProps> = ({
  onOpenForm100Modal,
  disabled = false
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/5 via-[#2b6cb0]/10 to-[#1a365d]/5 rounded-2xl blur-xl" />
        <div className="relative flex items-center justify-between p-4 bg-gradient-to-r from-[#1a365d]/10 via-[#2b6cb0]/5 to-[#1a365d]/10 backdrop-blur-sm rounded-2xl border border-[#2b6cb0]/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] rounded-xl shadow-lg">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a365d] dark:text-[#90cdf4]">
                Form 100 Generation
              </h3>
              <p className="text-sm text-[#2b6cb0] dark:text-[#63b3ed]">
                Generate emergency consultation reports directly
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#2b6cb0]">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-semibold">Direct Generation</span>
          </div>
        </div>
      </div>

      {/* Form 100 Card */}
      <div className="grid grid-cols-1 gap-6">
        <button
          onClick={onOpenForm100Modal}
          disabled={disabled}
          className={`
            group relative overflow-hidden rounded-2xl transition-all duration-500
            ${disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-105 hover:shadow-2xl cursor-pointer transform-gpu'
            }
          `}
        >
          {/* Premium Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d] via-[#2b6cb0] to-[#1a365d] opacity-95 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Animated Shimmer Effect */}
          {!disabled && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          )}

          {/* Card Content */}
          <div className="relative p-6 min-h-[120px] flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {/* Premium Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-md" />
                  <div className="relative p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 group-hover:scale-110 transition-transform duration-500">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Title */}
                <div className="text-left">
                  <h4 className="text-xl font-bold text-white tracking-wide mb-1">
                    Form 100 - Emergency Consultation Report
                  </h4>
                  <p className="text-sm text-white/80">
                    Generate comprehensive emergency consultation report with ICD-10 diagnosis
                  </p>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="flex items-center space-x-2 text-white/80 group-hover:text-white transition-colors duration-300">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>

            {/* Features List */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Sparkles className="w-3 h-3 text-[#90cdf4]" />
                <span className="text-xs font-medium text-white">ICD-10 Diagnosis Selection</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <ClipboardList className="w-3 h-3 text-[#90cdf4]" />
                <span className="text-xs font-medium text-white">Voice Transcript Integration</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Zap className="w-3 h-3 text-[#90cdf4]" />
                <span className="text-xs font-medium text-white">Rapid Generation</span>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#63b3ed] via-[#90cdf4] to-[#63b3ed] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </button>
      </div>

      {/* Help Text */}
      <div className="flex items-center justify-center space-x-2 text-[#2b6cb0] dark:text-[#63b3ed]">
        <div className="w-1.5 h-1.5 bg-[#2b6cb0] dark:bg-[#63b3ed] rounded-full animate-pulse" />
        <p className="text-xs font-medium">
          Click to generate Form 100 directly from your transcript
        </p>
      </div>
    </div>
  );
};

export default Form100DirectSection;
