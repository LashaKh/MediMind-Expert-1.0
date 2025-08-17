import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Brain,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';

// Types
import { 
  WorkflowStep, 
  ProcessingStatus, 
  ABGType
} from '../../types/abg';

// Custom Hooks
import { useABGWorkflow, useCaseManagement } from './hooks';

// Components
import { PremiumWorkflowProgress } from './components/PremiumWorkflowProgress';
import { CaseCreationModal } from '../AICopilot/CaseCreationModal';
import { CaseListModal } from '../AICopilot/CaseListModal';

// Workflow Step Components
import {
  UploadStep,
  AnalysisStep, 
  InterpretationStep,
  ActionPlanStep,
  CompletedStep
} from './components/workflow-steps';

// Shared Components
import { ProgressDisplay } from './components/shared';

// UI Components
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

// Store
import { useABGStore, useABGActions } from '../../stores/useABGStore';

interface PremiumABGAnalysisProps {
  onComplete?: (resultId: string) => void;
  initialType?: ABGType;
  className?: string;
}

export const PremiumABGAnalysis: React.FC<PremiumABGAnalysisProps> = ({
  onComplete,
  initialType = 'Arterial Blood Gas',
  className
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store state
  const workflow = useABGStore(state => state.currentWorkflow);
  const loading = useABGStore(state => state.loading);
  const error = useABGStore(state => state.error);
  
  // Store actions
  const { startWorkflow, updateWorkflowStep } = useABGActions();

  // Custom hooks
  const workflowHook = useABGWorkflow({ onComplete, initialType });
  const caseManagement = useCaseManagement();

  // Initialize workflow on mount
  useEffect(() => {
    workflowHook.setPageVisible(true);
    console.log('ABG Compact UI Debug: PremiumABGAnalysis mounted at', new Date().toISOString());
    if (!workflow) {
      startWorkflow({
        currentStep: WorkflowStep.UPLOAD,
        processingStatus: ProcessingStatus.IDLE,
        progress: 0,
        canProceed: false
      });
    }
  }, [workflow, startWorkflow, workflowHook]);

  // Handle navigation from history - load existing result
  useEffect(() => {
    const locationState = location.state as { resultId?: string; viewMode?: string } | null;
    
    if (locationState?.resultId && locationState?.viewMode === 'history') {
      console.log('🔄 Loading existing ABG result from history:', locationState.resultId);
      workflowHook.loadExistingResult(locationState.resultId);
      
      // Clear the location state to prevent re-loading
      navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [location, navigate, workflowHook]);

  // Navigate between steps
  const goToStep = useCallback((step: WorkflowStep) => {
    if (!workflow) return;
    
    // Validate step navigation
    const stepOrder = [
      WorkflowStep.UPLOAD,
      WorkflowStep.ANALYSIS,
      WorkflowStep.INTERPRETATION,
      WorkflowStep.ACTION_PLAN,
      WorkflowStep.COMPLETED
    ];
    
    const currentIndex = stepOrder.indexOf(workflow.currentStep);
    const targetIndex = stepOrder.indexOf(step);
    
    // Can only go back or to completed steps
    if (targetIndex <= currentIndex || 
        (targetIndex === currentIndex + 1 && workflow.canProceed)) {
      
      // Preserve existing workflow data when navigating
      const preservedData = {
        analysisResult: workflow.analysisResult,
        interpretationResult: workflow.interpretationResult,
        actionPlanResult: workflow.actionPlanResult,
        progress: workflow.progress,
        canProceed: workflow.canProceed,
        processingStatus: workflow.processingStatus
      };
      
      updateWorkflowStep(step, preservedData);
    }
  }, [workflow, updateWorkflowStep]);

  // Render current step content
  const renderStepContent = () => {
    if (!workflow) return null;

    console.log('🎯 Rendering workflow step:', {
      currentStep: workflow.currentStep,
      canProceed: workflow.canProceed,
      hasAnalysisResult: !!workflow.analysisResult,
      hasInterpretationResult: !!workflow.interpretationResult,
      processingStatus: workflow.processingStatus,
      isProcessing: workflowHook.isProcessing,
      showResults: workflowHook.showResults,
      hasExtractedText: !!workflowHook.extractedText,
      hasInterpretation: !!workflowHook.interpretation
    });

    const commonProps = {
      workflow,
      isProcessing: workflowHook.isProcessing,
      onGoToStep: goToStep
    };

    switch (workflow.currentStep) {
      case WorkflowStep.UPLOAD:
        return (
          <UploadStep
            abgType={workflowHook.abgType}
            onAbgTypeChange={workflowHook.setAbgType}
            selectedFile={workflowHook.selectedFile}
            onFileSelect={workflowHook.handleFileSelect}
            onFileRemove={workflowHook.handleFileRemove}
            showCamera={workflowHook.showCamera}
            onShowCamera={workflowHook.setShowCamera}
            onCameraCapture={workflowHook.handleCameraCapture}
            isProcessing={workflowHook.isProcessing}
            error={error}
            unifiedProgress={workflowHook.unifiedProgress}
            activeCase={caseManagement.activeCase}
            onCaseCreateOpen={() => caseManagement.setIsCaseCreateOpen(true)}
            onCaseListOpen={() => caseManagement.setIsCaseListOpen(true)}
            onProcessAnalysis={workflowHook.processAnalysis}
          />
        );

      case WorkflowStep.ANALYSIS:
        return (
          <AnalysisStep
            extractedText={workflowHook.extractedText}
            workflow={workflow}
            isProcessing={workflowHook.isProcessing}
            onGoToStep={goToStep}
            onProcessInterpretation={workflowHook.processInterpretation}
          />
        );

      case WorkflowStep.INTERPRETATION:
        return (
          <InterpretationStep
            extractedText={workflowHook.extractedText}
            interpretation={workflowHook.interpretation}
            showResults={workflowHook.showResults}
            abgType={workflowHook.abgType}
            completedResult={workflowHook.completedResult}
            workflow={workflow}
            isExtractedTextCollapsed={workflowHook.isExtractedTextCollapsed}
            isClinicalInterpretationCollapsed={workflowHook.isClinicalInterpretationCollapsed}
            onToggleExtractedText={() => workflowHook.setIsExtractedTextCollapsed(!workflowHook.isExtractedTextCollapsed)}
            onToggleClinicalInterpretation={() => workflowHook.setIsClinicalInterpretationCollapsed(!workflowHook.isClinicalInterpretationCollapsed)}
            isProcessing={workflowHook.isProcessing}
            unifiedProgress={workflowHook.unifiedProgress}
            onTextReAnalysis={workflowHook.handleTextReAnalysis}
            onProcessActionPlan={workflowHook.processActionPlan}
            onCompleteAnalysis={workflowHook.completeAnalysis}
            onGoToStep={goToStep}
          />
        );

      case WorkflowStep.ACTION_PLAN:
        return (
          <ActionPlanStep
            workflow={workflow}
            completedResult={workflowHook.completedResult}
            isProcessing={workflowHook.isProcessing}
            onGoToStep={goToStep}
            onCompleteAnalysis={workflowHook.completeAnalysis}
          />
        );

      case WorkflowStep.COMPLETED:
        return (
          <CompletedStep
            completedResult={workflowHook.completedResult}
            isAnalysisCompleteCollapsed={workflowHook.isAnalysisCompleteCollapsed}
            onToggleAnalysisComplete={() => workflowHook.setIsAnalysisCompleteCollapsed(!workflowHook.isAnalysisCompleteCollapsed)}
            onRestartWorkflow={workflowHook.restartWorkflow}
            abgResult={workflowHook.completedResult}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "abg-premium min-h-screen transition-all duration-700 transform",
      workflowHook.pageVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      className
    )}>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 via-pink-50 to-emerald-50 -z-10" />
      
      <div className="max-w-5xl mx-auto p-5 space-y-4">
        {/* Header */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
            <div className="abg-hero-aurora" />
          </div>

          <div className="abg-card p-6 sm:p-8 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 abg-hero-badge">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">Medical‑grade AI</span>
              </div>
              <Button
                onClick={() => navigate('/abg-history')}
                variant="outline"
                size="sm"
                className="
                  relative group overflow-hidden
                  bg-gradient-to-r from-blue-500 to-purple-600 
                  hover:from-blue-600 hover:to-purple-700
                  border-0 text-white
                  shadow-lg hover:shadow-xl hover:shadow-blue-500/25
                  transition-all duration-300 ease-in-out
                  transform hover:scale-105 hover:-translate-y-0.5
                  font-semibold tracking-wide
                  px-4 py-2.5
                  rounded-xl
                  before:absolute before:inset-0 before:bg-gradient-to-r 
                  before:from-white/20 before:to-transparent 
                  before:opacity-0 before:transition-opacity before:duration-300
                  hover:before:opacity-100
                  after:absolute after:inset-0 after:rounded-xl 
                  after:shadow-inner after:shadow-white/10
                  focus:ring-2 focus:ring-purple-300 focus:ring-offset-2
                  focus:outline-none
                "
                aria-label="View analysis history"
              >
                <div className="relative z-10 flex items-center">
                  <FileText className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="relative">
                    View History
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                                   transform translate-x-[-100%] group-hover:translate-x-[200%] 
                                   transition-transform duration-700 ease-in-out skew-x-12 h-full w-8"></div>
                  </span>
                </div>
              </Button>
            </div>

            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="abg-hero-icon">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-purple-700 to-emerald-600 bg-clip-text text-transparent">
                  Blood Gas Analysis
                </h1>
                <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                  Upload a blood gas report for instant AI vision, verified interpretation, and a clinician‑ready action plan.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Progress Indicator */}
        {workflow && (
          <PremiumWorkflowProgress
            currentStep={workflow.currentStep}
            progress={workflow.progress}
            error={!!workflow.error}
            processingStatus={workflowHook.currentProcessingStatus}
          />
        )}

        {/* Unified Progress Display */}
        {workflowHook.isProcessing && workflowHook.unifiedProgress && (
          <ProgressDisplay 
            progress={workflowHook.unifiedProgress} 
            className="mt-6" 
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="abg-card border-red-300 bg-red-50 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 text-lg mb-2">Analysis Error</h4>
                <p className="text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="relative">
          {renderStepContent()}
          
          {/* Case Management Modals */}
          <CaseCreationModal
            isOpen={caseManagement.isCaseCreateOpen}
            onClose={() => caseManagement.setIsCaseCreateOpen(false)}
            onCaseCreate={async (data) => {
              const created = await caseManagement.createCase(data);
              caseManagement.setActiveCase(created);
              return created;
            }}
            className=""
          />
          <CaseListModal
            isOpen={caseManagement.isCaseListOpen}
            onClose={() => caseManagement.setIsCaseListOpen(false)}
            cases={caseManagement.caseHistory}
            onCaseSelect={(c) => caseManagement.setActiveCase(c)}
            activeCase={caseManagement.activeCase || undefined}
          />
        </div>
      </div>
    </div>
  );
};