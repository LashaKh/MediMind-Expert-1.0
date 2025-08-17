import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { WorkflowStep, ProcessingStatus } from '../../../../types/abg';
import { PremiumAnalysisResults } from '../PremiumAnalysisResults';
import { Button } from '../../../ui/button';

interface AnalysisStepProps {
  // Results
  extractedText: string;
  workflow?: any;
  
  // Processing state
  isProcessing: boolean;
  
  // Actions
  onGoToStep: (step: WorkflowStep) => void;
  onProcessInterpretation: () => void;
}

export const AnalysisStep: React.FC<AnalysisStepProps> = ({
  extractedText,
  workflow,
  isProcessing,
  onGoToStep,
  onProcessInterpretation
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <PremiumAnalysisResults
        result={extractedText ? {
          raw_analysis: extractedText,
          gemini_confidence: workflow?.analysisResult?.confidence || 0.8,
          processing_time_ms: workflow?.analysisResult?.processingTimeMs || 0
        } : undefined}
        isLoading={workflow?.processingStatus === ProcessingStatus.ANALYZING}
        error={workflow?.error}
      />
      
      {workflow?.canProceed && (
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => onGoToStep(WorkflowStep.UPLOAD)}
            className="w-full sm:w-auto border-slate-300 hover:border-slate-400"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('abg.analysis.backToUpload', 'Back to Upload')}
          </Button>
          <Button
            onClick={onProcessInterpretation}
            className="abg-btn-primary w-full sm:w-auto"
            disabled={isProcessing}
          >
            {isProcessing ? t('common.processing', 'Processing...') : t('abg.analysis.getInterpretation', 'Get Clinical Interpretation')}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};