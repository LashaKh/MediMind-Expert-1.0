import React from 'react';
import { WorkflowStep, ProcessingStatus } from '../../../types/abg';
import { UnifiedProgressInfo } from '../../../services/abgUnifiedService';
import { 
  UploadStep, 
  AnalysisStep, 
  InterpretationStep, 
  ActionPlanStep, 
  CompletedStep 
} from './workflow-steps';

interface StepRendererProps {
  // Current workflow state
  workflow: {
    currentStep: WorkflowStep;
    processingStatus: ProcessingStatus;
    canProceed: boolean;
    progress: number;
    error?: string;
    analysisResult?: any;
    interpretationResult?: any;
    actionPlanResult?: any;
  } | null;

  // Step-specific data
  selectedFile: File | null;
  abgType: string;
  showCamera: boolean;
  isProcessing: boolean;
  unifiedProgress: UnifiedProgressInfo | null;
  extractedText: string;
  interpretation: string;
  showResults: boolean;
  completedResult: any;
  
  // UI state
  isExtractedTextCollapsed: boolean;
  isClinicalInterpretationCollapsed: boolean;
  isAnalysisCompleteCollapsed: boolean;

  // Case management
  activeCase?: any;
  
  // Actions
  onAbgTypeChange: (type: any) => void;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onShowCamera: (show: boolean) => void;
  onCameraCapture: (file: File) => void;
  onProcessAnalysis: () => void;
  onProcessInterpretation: () => void;
  onProcessActionPlan: () => void;
  onCompleteAnalysis: () => void;
  onGoToStep: (step: WorkflowStep) => void;
  onRestartWorkflow: () => void;
  onTextReAnalysis: (text: string) => void;
  onCaseCreateOpen: () => void;
  onCaseListOpen: () => void;
  
  // UI state setters
  onExtractedTextCollapsedChange: (collapsed: boolean) => void;
  onClinicalInterpretationCollapsedChange: (collapsed: boolean) => void;
  onAnalysisCompleteCollapsedChange: (collapsed: boolean) => void;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  workflow,
  selectedFile,
  abgType,
  showCamera,
  isProcessing,
  unifiedProgress,
  extractedText,
  interpretation,
  showResults,
  completedResult,
  isExtractedTextCollapsed,
  isClinicalInterpretationCollapsed,
  isAnalysisCompleteCollapsed,
  activeCase,
  onAbgTypeChange,
  onFileSelect,
  onFileRemove,
  onShowCamera,
  onCameraCapture,
  onProcessAnalysis,
  onProcessInterpretation,
  onProcessActionPlan,
  onCompleteAnalysis,
  onGoToStep,
  onRestartWorkflow,
  onTextReAnalysis,
  onCaseCreateOpen,
  onCaseListOpen,
  onExtractedTextCollapsedChange,
  onClinicalInterpretationCollapsedChange,
  onAnalysisCompleteCollapsedChange
}) => {
  if (!workflow) return null;

  console.log('🔍 DEBUG: StepRenderer rendering step:', {
    currentStep: workflow.currentStep,
    hasExtractedText: !!extractedText,
    hasInterpretation: !!interpretation,
    showResults,
    workflowInterpretationData: !!workflow?.interpretationResult?.data,
    workflowActionPlanData: !!workflow?.actionPlanResult?.data,
    processingStatus: workflow.processingStatus,
    canProceed: workflow.canProceed,
    hasError: !!workflow.error
  });

  const commonProps = {
    isProcessing,
    onGoToStep,
    workflow
  };

  switch (workflow.currentStep) {
    case WorkflowStep.UPLOAD:
      return (
        <UploadStep
          {...commonProps}
          abgType={abgType as any}
          onAbgTypeChange={onAbgTypeChange}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          onFileRemove={onFileRemove}
          showCamera={showCamera}
          onShowCamera={onShowCamera}
          onCameraCapture={onCameraCapture}
          error={workflow.error}
          unifiedProgress={unifiedProgress}
          activeCase={activeCase}
          onCaseCreateOpen={onCaseCreateOpen}
          onCaseListOpen={onCaseListOpen}
          onProcessAnalysis={onProcessAnalysis}
        />
      );

    case WorkflowStep.ANALYSIS:
      return (
        <AnalysisStep
          {...commonProps}
          result={extractedText ? {
            raw_analysis: extractedText,
            gemini_confidence: workflow.analysisResult?.confidence || 0.8,
            processing_time_ms: workflow.analysisResult?.processingTimeMs || 0
          } : undefined}
          isLoading={workflow.processingStatus === ProcessingStatus.ANALYZING}
          error={workflow.error}
          showHeaderActions={true}
          onProcessInterpretation={onProcessInterpretation}
        />
      );

    case WorkflowStep.INTERPRETATION:
      console.log('🔍 DEBUG: Rendering InterpretationStep with data:', {
        extractedText: extractedText?.length || 0,
        interpretation: interpretation?.length || 0,
        showResults,
        workflowInterpretationData: workflow?.interpretationResult?.data?.length || 0,
        completedResult: !!completedResult
      });
      
      return (
        <InterpretationStep
          {...commonProps}
          extractedText={extractedText}
          interpretation={interpretation || workflow?.interpretationResult?.data}
          showResults={showResults}
          abgType={workflow.type || 'Arterial Blood Gas'}
          isExtractedTextCollapsed={isExtractedTextCollapsed}
          isClinicalInterpretationCollapsed={isClinicalInterpretationCollapsed}
          onToggleExtractedText={onExtractedTextCollapsedChange}
          onToggleClinicalInterpretation={onClinicalInterpretationCollapsedChange}
          completedResult={completedResult}
          unifiedProgress={unifiedProgress}
          onTextReAnalysis={onTextReAnalysis}
          onCompleteAnalysis={onCompleteAnalysis}
          onProcessActionPlan={onProcessActionPlan}
        />
      );

    case WorkflowStep.ACTION_PLAN:
      return (
        <ActionPlanStep
          {...commonProps}
          actionPlan={(() => {
            // Handle action plan data extraction
            if (workflow.actionPlanResult?.data) {
              return workflow.actionPlanResult.data;
            } else if (typeof workflow.actionPlanResult === 'string') {
              return workflow.actionPlanResult;
            } else if (workflow.actionPlanResult?.result) {
              return workflow.actionPlanResult.result;
            } else if (workflow.actionPlanResult?.response) {
              return workflow.actionPlanResult.response;
            } else if (workflow.actionPlanResult) {
              return JSON.stringify(workflow.actionPlanResult, null, 2);
            }
            return undefined;
          })()}
          isLoading={workflow.processingStatus === ProcessingStatus.GENERATING_PLAN}
          error={workflow.error}
          abgResult={completedResult}
          onCompleteAnalysis={onCompleteAnalysis}
        />
      );

    case WorkflowStep.COMPLETED:
      return (
        <CompletedStep
          {...commonProps}
          completedResult={completedResult}
          isAnalysisCompleteCollapsed={isAnalysisCompleteCollapsed}
          onToggleAnalysisComplete={onAnalysisCompleteCollapsedChange}
          onRestartWorkflow={onRestartWorkflow}
        />
      );

    default:
      return null;
  }
};