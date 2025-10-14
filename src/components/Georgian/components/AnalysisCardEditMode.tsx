import React from 'react';
import {
  // Edit3 and Crown removed - no longer used
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
        {/* Header section removed - content starts directly */}
        
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
            reportMetadata={{
              cardTitle: analysisType.type,
              reportType: analysisType.isDiagnosis ? 'Initial Consult' : 'medical analysis',
              originalSessionId: `edit-${analysis.timestamp}`
            }}
          />
        </div>
      </div>
    </div>
  );
};