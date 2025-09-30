import React from 'react';
import {
  Edit3,
  Crown
} from 'lucide-react';
import ReportEditCard from '../../ReportEditing/ReportEditCard';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface AnalysisType {
  type: string;
  icon: React.ElementType;
  color: string;
  isDiagnosis: boolean;
  endpoint: string;
  supportsForm100?: boolean;
}

interface AnalysisCardEditModeProps {
  analysis: ProcessingHistory;
  analysisType: AnalysisType;
  isEditMode: boolean;
  enableEditing?: boolean;
  flowiseEndpoint?: string;
  onEditComplete: (editResult: any) => void;
  onEditError: (error: Error) => void;
}

export const AnalysisCardEditMode: React.FC<AnalysisCardEditModeProps> = ({
  analysis,
  analysisType,
  isEditMode,
  enableEditing = false,
  flowiseEndpoint,
  onEditComplete,
  onEditError
}) => {
  if (!isEditMode || !enableEditing || !analysisType.isDiagnosis || !flowiseEndpoint) {
    return null;
  }

  return (
    <div className="relative overflow-hidden">
      {/* Luxury Editor Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#90cdf4]/20 via-[#63b3ed]/15 to-[#2b6cb0]/10 dark:from-[#2b6cb0]/20 dark:via-[#1a365d]/15 dark:to-[#63b3ed]/20 rounded-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,108,176,0.1),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(43,108,176,0.2),transparent_70%)]" />
      
      <div className="relative p-6">
        {/* Editor Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl blur-md opacity-30 animate-pulse" />
            <div className="relative bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-2xl p-3 shadow-xl shadow-[#2b6cb0]/25">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <span>AI Report Editor</span>
              <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#2b6cb0]/30 dark:to-[#63b3ed]/30 rounded-full">
                <Crown className="w-3 h-3 text-[#2b6cb0] dark:text-[#90cdf4]" />
                <span className="text-xs font-bold text-[#1a365d] dark:text-[#90cdf4]">STUDIO</span>
              </div>
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Advanced medical report editing with AI assistance
            </p>
          </div>
        </div>
        
        {/* Enhanced Report Edit Card */}
        <div className="relative">
          <ReportEditCard
            reportId={analysis.timestamp.toString()}
            initialContent={analysis.aiResponse}
            sessionId={`edit-${analysis.timestamp}`}
            flowiseEndpoint={analysisType.endpoint}
            onEditComplete={onEditComplete}
            onError={onEditError}
            className="border-2 border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 shadow-2xl shadow-[#2b6cb0]/10"
          />
        </div>
      </div>
    </div>
  );
};