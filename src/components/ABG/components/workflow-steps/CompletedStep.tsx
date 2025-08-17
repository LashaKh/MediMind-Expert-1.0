import React from 'react';
import { PremiumFinalSteps } from './PremiumFinalSteps';
import { ABGResult } from '../../../../types/abg';

interface CompletedStepProps {
  // Results
  completedResult?: any;
  
  // UI state
  isAnalysisCompleteCollapsed: boolean;
  onToggleAnalysisComplete: () => void;
  
  // Actions
  onRestartWorkflow: () => void;
  onBackToResults?: () => void;
  
  // ABG Result for AI consultation
  abgResult?: ABGResult;
}

export const CompletedStep: React.FC<CompletedStepProps> = ({
  completedResult,
  isAnalysisCompleteCollapsed,
  onToggleAnalysisComplete,
  onRestartWorkflow,
  onBackToResults,
  abgResult
}) => {
  return (
    <PremiumFinalSteps
      completedResult={completedResult}
      isAnalysisCompleteCollapsed={isAnalysisCompleteCollapsed}
      onToggleAnalysisComplete={onToggleAnalysisComplete}
      onRestartWorkflow={onRestartWorkflow}
      onBackToResults={onBackToResults}
      abgResult={abgResult}
    />
  );
};