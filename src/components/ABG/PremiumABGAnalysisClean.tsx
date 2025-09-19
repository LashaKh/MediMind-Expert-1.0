import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw, Clock, ExternalLink } from 'lucide-react';

// Hooks
import { 
  useABGWorkflow, 
  useCaseManagement, 
  useABGUIActions 
} from './hooks';
import { useABGStore, useABGActions } from '../../stores/useABGStore';

// Components
import { PremiumABGHeader } from './components/PremiumABGHeader';
import { PremiumWorkflowProgress } from './components/PremiumWorkflowProgress';
import { StepRenderer } from './components/StepRenderer';
import { CaseCreationModal } from '../AICopilot/CaseCreationModal';
import { CaseListModal } from '../AICopilot/CaseListModal';

// Services
import { NavigationService } from './services/navigationService';

// Types
import { WorkflowStep, ProcessingStatus, ABGType } from '../../types/abg';

// UI Components
import { cn } from '../../lib/utils';

interface PremiumABGAnalysisCleanProps {
  onComplete?: (resultId: string) => void;
  initialType?: ABGType;
  className?: string;
}

export const PremiumABGAnalysisClean: React.FC<PremiumABGAnalysisCleanProps> = ({
  onComplete,
  initialType = 'Arterial Blood Gas',
  className
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store state
  const workflow = useABGStore(state => state.currentWorkflow);
  const loading = useABGStore(state => state.loading);
  const error = useABGStore(state => state.error);
  
  // Store actions
  const { startWorkflow, updateWorkflowStep } = useABGActions();

  // Workflow hook
  const workflowHook = useABGWorkflow({ onComplete, initialType });
  
  // Case management hook  
  const caseManagement = useCaseManagement();
  
  // UI actions hook
  const uiActions = useABGUIActions({
    extractedText: workflowHook.extractedText,
    interpretation: workflowHook.interpretation,
    completedResult: workflowHook.completedResult,
    onTextReAnalysis: workflowHook.handleTextReAnalysis
  });

  // Initialize workflow on mount
  useEffect(() => {
    workflowHook.setPageVisible(true);
    
    if (!workflow) {
      startWorkflow({
        currentStep: WorkflowStep.UPLOAD,
        processingStatus: ProcessingStatus.IDLE,
        progress: 0,
        canProceed: false
      });
    }
  }, [workflow, startWorkflow]); // Remove workflowHook from dependencies

  // Handle navigation from history - load existing result
  useEffect(() => {
    const locationState = location.state as { resultId?: string; viewMode?: string } | null;
    
    if (locationState?.resultId && locationState?.viewMode === 'history') {

      workflowHook.loadExistingResult(locationState.resultId);
      
      // Clear the location state to prevent re-loading
      navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [location, navigate]); // Remove workflowHook from dependencies

  // Navigate between steps
  const goToStep = (step: WorkflowStep) => {
    if (!workflow) return;
    
    if (NavigationService.canNavigateToStep(workflow.currentStep, step, workflow.canProceed)) {
      updateWorkflowStep(step);
    }
  };

  // Handle edit action from header
  const handleEditFromHeader = () => {
    const newText = prompt('Edit the extracted text:', workflowHook.extractedText);
    if (newText && newText !== workflowHook.extractedText) {
      uiActions.handleEditResults(newText);
    }
  };

  // Determine if we have results to show action buttons
  const hasResults = !!(
    workflowHook.extractedText || 
    workflowHook.interpretation || 
    workflowHook.completedResult
  );

  return (
    <div className={cn(
      "abg-premium min-h-screen transition-all duration-700 transform",
      workflowHook.pageVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      className
    )}>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#90cdf4]/10 via-[#63b3ed]/10 to-[#2b6cb0]/10 -z-10" />
      
      <div className="max-w-5xl mx-auto p-5 space-y-4">
        {/* Header */}
        <PremiumABGHeader />

        {/* Progress Indicator */}
        {workflow && (
          <PremiumWorkflowProgress
            currentStep={workflow.currentStep}
            progress={workflow.progress}
            error={!!workflow.error}
            processingStatus={workflowHook.currentProcessingStatus}
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
                <p className="text-red-700 leading-relaxed mb-4">{error}</p>
                
                {/* Helpful suggestions for API errors */}
                {(error.includes('503') || error.includes('temporarily unavailable')) && (
                  <div className="bg-white/70 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      What you can do:
                    </h5>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Wait 2-3 minutes and try again</li>
                      <li>• The AI service is experiencing high traffic</li>
                      <li>• This usually resolves automatically</li>
                    </ul>
                  </div>
                )}
                
                {error.includes('quota') && (
                  <div className="bg-white/70 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-red-900 mb-2">Daily limit reached:</h5>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Try again tomorrow</li>
                      <li>• Contact support for increased limits</li>
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </button>
                  
                  <a
                    href="https://status.google.com/products/ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 hover:border-red-400 text-red-700 rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Check AI Status
                  </a>
                  
                  {/* Show fallback option if Gemini is failing */}
                  {(error.includes('503') || error.includes('Gemini')) && (
                    <div className="text-xs text-red-600 mt-2 p-2 bg-white/50 rounded">
                      💡 <strong>Alternative:</strong> Your system supports Flowise AI as backup. 
                      Contact support to enable fallback processing.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="relative">
          <StepRenderer
            workflow={workflow}
            selectedFile={workflowHook.selectedFile}
            abgType={workflowHook.abgType}
            showCamera={workflowHook.showCamera}
            isProcessing={workflowHook.isProcessing}
            unifiedProgress={workflowHook.unifiedProgress}
            extractedText={workflowHook.extractedText}
            interpretation={workflowHook.interpretation}
            showResults={workflowHook.showResults}
            completedResult={workflowHook.completedResult}
            isExtractedTextCollapsed={workflowHook.isExtractedTextCollapsed}
            isClinicalInterpretationCollapsed={workflowHook.isClinicalInterpretationCollapsed}
            isAnalysisCompleteCollapsed={workflowHook.isAnalysisCompleteCollapsed}
            activeCase={caseManagement.activeCase}
            onAbgTypeChange={workflowHook.setAbgType}
            onFileSelect={workflowHook.handleFileSelect}
            onFileRemove={workflowHook.handleFileRemove}
            onShowCamera={workflowHook.setShowCamera}
            onCameraCapture={workflowHook.handleCameraCapture}
            onProcessAnalysis={workflowHook.processAnalysis}
            onProcessInterpretation={workflowHook.processInterpretation}
            onProcessActionPlan={workflowHook.processActionPlan}
            onCompleteAnalysis={workflowHook.completeAnalysis}
            onGoToStep={goToStep}
            onRestartWorkflow={workflowHook.restartWorkflow}
            onTextReAnalysis={workflowHook.handleTextReAnalysis}
            onCaseCreateOpen={() => caseManagement.setIsCaseCreateOpen(true)}
            onCaseListOpen={() => caseManagement.setIsCaseListOpen(true)}
            onExtractedTextCollapsedChange={workflowHook.setIsExtractedTextCollapsed}
            onClinicalInterpretationCollapsedChange={workflowHook.setIsClinicalInterpretationCollapsed}
            onAnalysisCompleteCollapsedChange={workflowHook.setIsAnalysisCompleteCollapsed}
          />

          {/* Modals: Case creation and selection */}
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