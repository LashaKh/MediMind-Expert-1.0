import React, { useMemo } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { ProcessingStatus, WorkflowStep } from '../../../../types/abg';
import { PremiumActionPlanResults } from '../PremiumActionPlanResults';
import { PremiumAIClinicalConsultationButton } from '../PremiumAIClinicalConsultationButton';
import { PremiumFinalSteps } from './PremiumFinalSteps';
import { PremiumInterpretationResults } from '../PremiumInterpretationResults';

interface ActionPlanStepProps {
  // Workflow state
  workflow?: any;
  
  // Results
  completedResult?: any;
  
  // Processing state
  isProcessing: boolean;
  
  // Actions
  onGoToStep: (step: WorkflowStep) => void;
  onCompleteAnalysis: () => void;
}

export const ActionPlanStep: React.FC<ActionPlanStepProps> = ({
  workflow,
  completedResult,
  isProcessing,
  onGoToStep,
  onCompleteAnalysis
}) => {
  const [isAnalysisCompleteCollapsed, setIsAnalysisCompleteCollapsed] = React.useState(false);
  const [isClinicalInterpretationCollapsed, setIsClinicalInterpretationCollapsed] = React.useState(true);

  const handleToggleAnalysisComplete = () => {
    setIsAnalysisCompleteCollapsed(!isAnalysisCompleteCollapsed);
  };

  const handleRestartWorkflow = () => {
    // Reset workflow and go back to the upload step
    onGoToStep(WorkflowStep.UPLOAD);
  };

  const handleBackToResults = () => {

    // Go back to the interpretation results view using correct enum value
    onGoToStep(WorkflowStep.INTERPRETATION);
  };
  const getActionPlanData = () => {

    // Try multiple fallback paths
    if (workflow?.actionPlanResult?.data) {
      return workflow.actionPlanResult.data;
    } else if (typeof workflow?.actionPlanResult === 'string') {
      return workflow.actionPlanResult;
    } else if (workflow?.actionPlanResult?.result) {
      return workflow.actionPlanResult.result;
    } else if (workflow?.actionPlanResult?.response) {
      return workflow.actionPlanResult.response;
    } else if (workflow?.actionPlanResult) {
      // If it's an object, try to extract text content
      return JSON.stringify(workflow.actionPlanResult, null, 2);
    }
    return undefined;
  };

  const tempResult = completedResult || (getActionPlanData() ? {
    id: 'temp-action-plan',
    user_id: workflow?.sessionId || '',
    raw_analysis: workflow?.analysisResult?.extractedText || workflow?.interpretationResult?.extractedText || '',
    interpretation: workflow?.interpretationResult?.data || '',
    action_plan: getActionPlanData(),
    type: 'Arterial Blood Gas',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    processing_time_ms: workflow?.interpretationResult?.processingTimeMs || 0,
    gemini_confidence: workflow?.analysisResult?.confidence || 0.9,
    patient_id: null,
    patient: null
  } : undefined);

  const debugInfo = useMemo(() => ({
    hasActionPlan: !!(tempResult?.action_plan),
    hasRawAnalysis: !!(tempResult?.raw_analysis),
    interpretationLength: tempResult?.interpretation?.length || 0,
    actionPlanLength: tempResult?.action_plan?.length || 0
  }), [tempResult]);

  const getInterpretation = () => {
    return workflow?.interpretationResult?.data || 
           tempResult?.interpretation || '';
  };

  return (
    <div className="space-y-6">
      {/* Clinical Interpretation Panel - Collapsible (same format as InterpretationStep) */}
      {getInterpretation() && (
        <div className="abg-card abg-glass p-5">
          <div 
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setIsClinicalInterpretationCollapsed(!isClinicalInterpretationCollapsed)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-[var(--foreground)]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">Clinical Interpretation</h3>
                <p className="text-xs text-[var(--foreground-tertiary)]">AI-generated clinical analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--foreground-secondary)]">
                {isClinicalInterpretationCollapsed ? 'Show' : 'Hide'}
              </span>
              {isClinicalInterpretationCollapsed ? 
                <ChevronDown className="h-4 w-4 text-slate-400" /> : 
                <ChevronUp className="h-4 w-4 text-slate-400" />
              }
            </div>
          </div>
          
          {!isClinicalInterpretationCollapsed ? (
            <PremiumInterpretationResults
              interpretation={getInterpretation()}
              isLoading={false}
            />
          ) : (
            <div className="bg-[var(--component-surface-primary)] rounded-lg p-4">
              <div className="text-sm text-[var(--foreground-tertiary)] leading-relaxed">
                {getInterpretation() ? (
                  <div>
                    <div className="font-medium text-[var(--foreground)] mb-2">Clinical Summary:</div>
                    <p className="line-clamp-3">
                      {getInterpretation()
                        // Clean markdown formatting for preview
                        .replace(/\*\*(.*?)\*\*/g, '$1')
                        .replace(/•?\s*\[RED\]\s*([^:]+):/gi, '🔴 $1:')
                        .replace(/•?\s*\[YELLOW\]\s*([^:]+):/gi, '🟡 $1:')
                        .replace(/•?\s*\[GREEN\]\s*([^:]+):/gi, '🟢 $1:')
                        .replace(/•?\s*Red\s*\(([^)]+)\):/gi, '🔴 $1:')
                        .replace(/•?\s*Yellow\s*\(([^)]+)\):/gi, '🟡 $1:')
                        .replace(/•?\s*Green\s*\(([^)]+)\):/gi, '🟢 $1:')
                        .replace(/•?\s*\*\*\[Red\]\s*([^*]+)\*\*:/gi, '🔴 $1:')
                        .replace(/•?\s*\*\*\[Yellow\]\s*([^*]+)\*\*:/gi, '🟡 $1:')
                        .replace(/•?\s*\*\*\[Green\]\s*([^*]+)\*\*:/gi, '🟢 $1:')
                        // Clean up ALL dash-based bullet points
                        .replace(/^\s*-\s+/gm, '• ')
                        .replace(/^\s*\*\s+/gm, '• ')
                        .replace(/^\s*•\s+/gm, '• ')
                        // Remove standalone dashes
                        .replace(/^\s*-\s*$/gm, '')
                        // Clean up markdown headers
                        .replace(/^#{1,6}\s+/gm, '')
                        .replace(/\n\s*\n/g, '\n')
                        .replace(/\n\s+/g, '\n')
                        .trim()
                        .substring(0, 200)
                      }...
                    </p>
                  </div>
                ) : (
                  'Clinical interpretation will appear here after analysis...'
                )}
              </div>
              <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                <span>AI-generated clinical analysis</span>
                <span className="text-[var(--cardiology-accent-blue)] font-medium">Click to expand</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Plan Results */}
      <PremiumActionPlanResults
        actionPlan={getActionPlanData()}
        isLoading={workflow?.processingStatus === ProcessingStatus.GENERATING_PLAN}
        error={workflow?.error}
        abgResult={completedResult || (getActionPlanData() ? {
          id: 'temp-action-plan',
          user_id: workflow?.sessionId || '',
          raw_analysis: workflow?.analysisResult?.extractedText || workflow?.interpretationResult?.extractedText || '',
          interpretation: workflow?.interpretationResult?.data || '',
          action_plan: getActionPlanData(),
          type: 'Arterial Blood Gas',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          processing_time_ms: workflow?.interpretationResult?.processingTimeMs || 0,
          gemini_confidence: workflow?.analysisResult?.confidence || 0.9,
          patient_id: null,
          patient: null
        } : undefined)}
      />

      {/* Premium Final Steps - Only show when action plan is ready */}
      {workflow?.actionPlanResult && (
        <PremiumFinalSteps
          completedResult={completedResult}
          isAnalysisCompleteCollapsed={isAnalysisCompleteCollapsed}
          onToggleAnalysisComplete={handleToggleAnalysisComplete}
          onRestartWorkflow={handleRestartWorkflow}
          onBackToResults={handleBackToResults}
        />
      )}
    </div>
  );
};