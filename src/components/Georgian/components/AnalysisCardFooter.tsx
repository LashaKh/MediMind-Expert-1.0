import React from 'react';
import {
  Clock,
  Award
} from 'lucide-react';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface AnalysisCardFooterProps {
  analysis: ProcessingHistory;
  isExpanded: boolean;
}

export const AnalysisCardFooter: React.FC<AnalysisCardFooterProps> = ({
  analysis,
  isExpanded
}) => {
  if (!isExpanded) {
    return null;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 to-[#90cdf4]/15 dark:from-slate-800/60 dark:to-[#2b6cb0]/20 rounded-3xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          {/* Enhanced Metadata */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 px-4 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-white/50 dark:border-slate-700/50 shadow-sm">
              <div className="p-1 bg-gradient-to-r from-[#63b3ed] to-red-600 rounded-lg shadow-lg">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {new Date(analysis.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          {/* Premium Status Indicator */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/20 to-[#63b3ed]/20 rounded-2xl blur-md opacity-70 animate-pulse" />
            <div className="relative flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 dark:from-[#2b6cb0]/30 dark:to-[#63b3ed]/30 backdrop-blur-sm rounded-2xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/30 shadow-lg">
              <div className="relative">
                <div className="w-3 h-3 bg-[#2b6cb0] rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-[#63b3ed] rounded-full animate-ping" />
              </div>
              <span className="text-sm font-bold text-[#1a365d] dark:text-[#90cdf4] tracking-wide">
                ANALYSIS COMPLETE
              </span>
              <Award className="w-4 h-4 text-[#2b6cb0] dark:text-[#63b3ed]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};