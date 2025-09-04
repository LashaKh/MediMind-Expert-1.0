import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  WorkflowStep, 
  ProcessingStatus, 
  ABGType,
  ABGAnalysisError,
  LocalABGResponse
} from '../../../types/abg';
import { useABGStore, useABGActions } from '../../../stores/useABGStore';
import { processImageWithUnifiedAnalysis, reAnalyzeWithEditedText, UnifiedProgressInfo } from '../../../services/abgUnifiedService';
import { getABGResult } from '../../../services/abgService';

interface UseABGWorkflowProps {
  onComplete?: (resultId: string) => void;
  initialType?: ABGType;
}

interface UseABGWorkflowReturn {
  // State
  selectedFile: File | null;
  abgType: ABGType;
  showCamera: boolean;
  isProcessing: boolean;
  completedResult: any;
  currentProcessingStatus: string;
  pageVisible: boolean;
  unifiedProgress: UnifiedProgressInfo | null;
  extractedText: string;
  interpretation: string;
  showResults: boolean;
  isExtractedTextCollapsed: boolean;
  isClinicalInterpretationCollapsed: boolean;
  isAnalysisCompleteCollapsed: boolean;

  // Actions
  setSelectedFile: (file: File | null) => void;
  setAbgType: (type: ABGType) => void;
  setShowCamera: (show: boolean) => void;
  setPageVisible: (visible: boolean) => void;
  setIsExtractedTextCollapsed: (collapsed: boolean) => void;
  setIsClinicalInterpretationCollapsed: (collapsed: boolean) => void;
  setIsAnalysisCompleteCollapsed: (collapsed: boolean) => void;

  // Business logic
  handleFileSelect: (file: File) => void;
  handleFileRemove: () => void;
  handleCameraCapture: (file: File) => void;
  processAnalysis: () => Promise<void>;
  handleTextReAnalysis: (editedText: string) => Promise<void>;
  processInterpretation: () => Promise<void>;
  processActionPlan: () => Promise<void>;
  completeAnalysis: () => Promise<void>;
  loadExistingResult: (resultId: string) => Promise<void>;
  restartWorkflow: () => void;
}

export const useABGWorkflow = ({
  onComplete,
  initialType = 'Arterial Blood Gas'
}: UseABGWorkflowProps): UseABGWorkflowReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store state
  const workflow = useABGStore(state => state.currentWorkflow);
  
  // Store actions
  const {
    startWorkflow,
    updateWorkflowStep,
    setProcessingStatus,
    completeWorkflow,
    createResult,
    setError,
    clearError
  } = useABGActions();

  // Local state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [abgType, setAbgType] = useState<ABGType>(initialType);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedResult, setCompletedResult] = useState<any>(null);
  const [currentProcessingStatus, setCurrentProcessingStatus] = useState<string>('');
  const [pageVisible, setPageVisible] = useState(false);
  const [unifiedProgress, setUnifiedProgress] = useState<UnifiedProgressInfo | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [interpretation, setInterpretation] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [isExtractedTextCollapsed, setIsExtractedTextCollapsed] = useState(true);
  const [isClinicalInterpretationCollapsed, setIsClinicalInterpretationCollapsed] = useState(true);
  const [isAnalysisCompleteCollapsed, setIsAnalysisCompleteCollapsed] = useState(false);

  // Load existing ABG result from history
  const loadExistingResult = useCallback(async (resultId: string) => {
    try {

      const result = await getABGResult(resultId);
      
      // Set the completed result and workflow to completion step
      setCompletedResult(result);
      setAbgType(result.type);
      
      // Update workflow to show the completed result
      startWorkflow({
        currentStep: WorkflowStep.COMPLETED,
        processingStatus: ProcessingStatus.COMPLETED,
        progress: 100,
        canProceed: true,
        hasAnalysisResult: true,
        result: result
      });

    } catch (error) {

      setError('Failed to load ABG result from history');
    }
  }, [startWorkflow, setError]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    clearError();
    updateWorkflowStep(WorkflowStep.UPLOAD, {
      uploadedFile: file,
      canProceed: true
    });
  }, [updateWorkflowStep, clearError]);

  // Handle file removal
  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    updateWorkflowStep(WorkflowStep.UPLOAD, {
      uploadedFile: undefined,
      canProceed: false
    });
  }, [updateWorkflowStep]);

  // Handle camera capture
  const handleCameraCapture = useCallback((file: File) => {
    handleFileSelect(file);
    setShowCamera(false);
  }, [handleFileSelect]);

  // Process the ABG analysis workflow using unified service
  const processAnalysis = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setShowResults(false);
    clearError();
    setUnifiedProgress(null);
    setExtractedText('');
    setInterpretation('');

    try {
      console.log('🤖 Starting unified BG analysis workflow (Premium)');
      
      // Start unified analysis with real-time progress
      const result = await processImageWithUnifiedAnalysis(
        selectedFile,
        abgType,
        (progress) => {
          setUnifiedProgress(progress);
          setCurrentProcessingStatus(progress.currentTask || 'Processing...');
          
          // Update workflow step based on progress phase
          if (progress.phase === 'extraction') {
            updateWorkflowStep(WorkflowStep.ANALYSIS, {
              processingStatus: ProcessingStatus.ANALYZING,
              progress: progress.overallProgress
            });
          } else if (progress.phase === 'interpretation') {
            updateWorkflowStep(WorkflowStep.INTERPRETATION, {
              processingStatus: ProcessingStatus.INTERPRETING,
              progress: progress.overallProgress
            });
          }
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Unified analysis failed');
      }

      // Set results for immediate display
      setExtractedText(result.extractedText);
      setInterpretation(result.interpretation);
      setShowResults(true);

      // Update workflow state to INTERPRETATION step only

      updateWorkflowStep(WorkflowStep.INTERPRETATION, {
        analysisResult: {
          success: true,
          extractedText: result.extractedText,
          processingTimeMs: result.processingTimeMs,
          confidence: result.confidence,
          requestId: result.requestId
        },
        interpretationResult: {
          success: true,
          data: result.interpretation,
          extractedText: result.extractedText,
          processingTimeMs: result.processingTimeMs,
          requestId: result.requestId
        },
        processingStatus: ProcessingStatus.COMPLETED,
        progress: 80,
        canProceed: true
      });

      // Save to database (without action plan yet)
      const resultId = await createResult({
        patient_id: null,
        raw_analysis: result.extractedText,
        interpretation: result.interpretation,
        type: abgType,
        processing_time_ms: result.processingTimeMs,
        gemini_confidence: result.confidence
      });

      // Store partial result for AI consultation
      const partialABGResult = {
        id: resultId,
        raw_analysis: result.extractedText,
        interpretation: result.interpretation,
        type: abgType,
        processing_time_ms: result.processingTimeMs,
        gemini_confidence: result.confidence,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: '',
        patient: null
      };

      setCompletedResult(partialABGResult);
      setCurrentProcessingStatus('Interpretation completed - Ready for action plan');
      console.log('✅ Unified BG analysis completed successfully (Premium)');

    } catch (err) {
      console.error('Unified ABG analysis failed (Premium):', err);
      
      let errorMessage = 'An unexpected error occurred during analysis';
      if (err instanceof Error) {
        // Enhanced error messages for specific API issues
        if (err.message.includes('503')) {
          errorMessage = 'AI service is temporarily unavailable (503). This usually resolves within a few minutes. Please try again shortly.';
        } else if (err.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (err.message.includes('quota')) {
          errorMessage = 'API quota exhausted for today. Please try again tomorrow or contact support.';
        } else if (err.message.includes('Gemini API error')) {
          errorMessage = `AI analysis service error: ${err.message}. This is likely temporary - please try again in a few minutes.`;
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      updateWorkflowStep(WorkflowStep.UPLOAD, {
        processingStatus: ProcessingStatus.ERROR,
        error: errorMessage
      });

      setCurrentProcessingStatus('Analysis failed - try again in a few minutes');
    } finally {
      setIsProcessing(false);
    }
  }, [
    selectedFile, 
    abgType, 
    updateWorkflowStep, 
    setProcessingStatus,
    createResult,
    setError,
    clearError,
    onComplete
  ]);

  // Re-analyze with edited text
  const handleTextReAnalysis = useCallback(async (editedText: string) => {
    if (!editedText.trim()) {
      setError('Edited text cannot be empty');
      return;
    }

    setIsProcessing(true);
    clearError();

    try {
      console.log('🔄 Re-analyzing with edited text (Premium)');
      
      const result = await reAnalyzeWithEditedText(editedText, abgType, (progress) => {
        setUnifiedProgress({
          phase: 'interpretation',
          stage: 'processing',
          stageDescription: 'Re-analyzing with edited text...',
          percentage: progress,
          phaseProgress: progress,
          overallProgress: 50 + (progress * 0.5),
          method: 'gemini',
          currentTask: 'Processing edited text'
        });
        setCurrentProcessingStatus('Re-analyzing with edited text...');
      });

      if (!result.success) {
        throw new Error(result.error || 'Re-analysis failed');
      }

      // Update the interpretation
      setInterpretation(result.interpretation);
      setExtractedText(editedText);

      // Update workflow state
      updateWorkflowStep(WorkflowStep.INTERPRETATION, {
        interpretationResult: {
          success: true,
          data: result.interpretation,
          processingTimeMs: result.processingTimeMs,
          requestId: result.requestId
        },
        processingStatus: ProcessingStatus.COMPLETED,
        progress: 85,
        canProceed: true
      });

      setCurrentProcessingStatus('Re-analysis completed successfully!');
      console.log('✅ Re-analysis completed successfully (Premium)');

    } catch (err) {
      console.error('Re-analysis failed (Premium):', err);
      const errorMessage = err instanceof Error ? err.message : 'Re-analysis failed';
      setError(errorMessage);
      setCurrentProcessingStatus('Re-analysis failed');
    } finally {
      setIsProcessing(false);
    }
  }, [abgType, updateWorkflowStep, setError, clearError]);

  // Process the interpretation using local OpenAI function
  const processInterpretation = useCallback(async () => {

    if (!extractedText) {

      return;
    }

    setIsProcessing(true);
    clearError();

    try {
      setCurrentProcessingStatus('Generating clinical interpretation...');
      updateWorkflowStep(WorkflowStep.INTERPRETATION, {
        processingStatus: ProcessingStatus.INTERPRETING,
        progress: 50
      });

      const requestId = crypto.randomUUID();
      const interpretationRequest = {
        analysis: extractedText,
        type: abgType,
        timestamp: new Date().toISOString(),
        requestId
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/abg-interpretation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interpretationRequest)
      });

      if (!response.ok) {
        throw new Error(`Interpretation failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const interpretationData = result.data?.data || result.data || '';
      const interpretationText = typeof interpretationData === 'string' ? interpretationData : '';
      
      const interpretationResult = {
        success: true,
        data: interpretationText,
        processingTimeMs: result.data?.processingTimeMs || 0,
        requestId: result.data?.requestId || requestId
      };

      updateWorkflowStep(WorkflowStep.INTERPRETATION, {
        interpretationResult,
        processingStatus: ProcessingStatus.COMPLETED,
        progress: 70,
        canProceed: true
      });

      setCurrentProcessingStatus('Interpretation completed - Ready for action plan');

    } catch (err) {

      let errorMessage = 'An unexpected error occurred during interpretation';
      
      if (err && typeof err === 'object') {
        if ('code' in err) {
          const error = err as ABGAnalysisError;
          errorMessage = error.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      updateWorkflowStep(WorkflowStep.INTERPRETATION, {
        processingStatus: ProcessingStatus.ERROR,
        error: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    extractedText,
    abgType, 
    updateWorkflowStep, 
    setProcessingStatus,
    clearError,
    setError,
    setCurrentProcessingStatus
  ]);

  // Process the action plan using local functions
  const processActionPlan = useCallback(async () => {

    if (!workflow?.interpretationResult) {

      setError('No interpretation available. Please get clinical interpretation first.');
      return;
    }

    setIsProcessing(true);
    clearError();

    try {
      // Import the issue parser and test
      const { parseABGInterpretation, generateIssueActionPlanRequest } = await import('../../../utils/abgIssueParser');
      
      // Step 1: Parse interpretation to identify individual issues
      setCurrentProcessingStatus('Identifying clinical issues...');
      updateWorkflowStep(WorkflowStep.ACTION_PLAN, {
        processingStatus: ProcessingStatus.GENERATING_PLAN,
        progress: 75
      });

      const parsingResult = parseABGInterpretation(workflow.interpretationResult.data);

      if (parsingResult.totalIssuesFound === 0) {
        // Fallback to single comprehensive action plan

        setCurrentProcessingStatus('Generating comprehensive action plan...');
        
        const requestId = crypto.randomUUID();
        const actionPlanResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/abg-action-plan-processor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            issue: 'Blood Gas Analysis - Comprehensive Action Plan',
            description: workflow.interpretationResult.data,
            question: `Please provide a comprehensive action plan for this ${abgType} analysis`,
            requestId,
            timestamp: new Date().toISOString()
          })
        });

        if (!actionPlanResponse.ok) {
          throw new Error(`Action plan service error: ${actionPlanResponse.status}`);
        }

        const actionPlanData = await actionPlanResponse.json();
        const nestedData = actionPlanData.data || actionPlanData;
        const actionPlanText = nestedData.data || nestedData.message || '';

        const actionPlanResult = {
          success: true,
          data: actionPlanText,
          processingTimeMs: nestedData.processingTimeMs || 0,
          requestId: nestedData.requestId || requestId,
          issues: []
        };

        updateWorkflowStep(WorkflowStep.ACTION_PLAN, {
          actionPlanResult,
          processingStatus: ProcessingStatus.COMPLETED,
          progress: 90,
          canProceed: true
        });

        setCurrentProcessingStatus('Action plan completed!');
        return;
      }

      // Generate action plans for each identified issue - PARALLEL REQUESTS
      setCurrentProcessingStatus(`Generating action plans for ${parsingResult.totalIssuesFound} issues simultaneously...`);
      
      const baseRequestId = crypto.randomUUID();
      const actionPlanPromises = parsingResult.issues.map(async (issue, index) => {
        const issueRequest = generateIssueActionPlanRequest(issue, abgType);
        const requestId = `${baseRequestId}-issue-${index + 1}`;
        
        try {
          const actionPlanResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/abg-action-plan-processor`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              ...issueRequest,
              requestId,
              timestamp: new Date().toISOString()
            })
          });

          if (!actionPlanResponse.ok) {
            const errorText = await actionPlanResponse.text();
            return {
              issue: issue,
              success: false,
              data: `Action plan generation failed for ${issue.title}. Status: ${actionPlanResponse.status} - ${errorText}`,
              error: `HTTP ${actionPlanResponse.status}: ${errorText}`,
              requestId
            };
          }

          const actionPlanData = await actionPlanResponse.json();
          const actionPlanText = actionPlanData.data || actionPlanData.message || '';
          
          return {
            issue: issue,
            success: true,
            data: actionPlanText,
            processingTimeMs: actionPlanData.processingTimeMs || 0,
            requestId: actionPlanData.requestId || requestId
          };
          
        } catch (issueError) {

          return {
            issue: issue,
            success: false,
            data: `Failed to generate action plan for ${issue.title}: ${issueError instanceof Error ? issueError.message : 'Unknown error'}`,
            error: issueError instanceof Error ? issueError.message : 'Unknown error',
            requestId
          };
        }
      });

      // Wait for all requests to complete

      setCurrentProcessingStatus('Waiting for all action plans to complete...');
      
      const actionPlans = await Promise.all(actionPlanPromises);

      // Create combined action plan result
      const { createCombinedActionPlan } = await import('../utils/actionPlanUtils');
      const combinedActionPlan = {
        success: true,
        data: createCombinedActionPlan(parsingResult.issues, actionPlans),
        processingTimeMs: actionPlans.reduce((total, plan) => total + (plan.processingTimeMs || 0), 0),
        requestId: baseRequestId,
        issues: parsingResult.issues,
        actionPlans: actionPlans,
        totalIssues: parsingResult.totalIssuesFound,
        successfulPlans: actionPlans.filter(plan => plan.success).length,
        failedPlans: actionPlans.filter(plan => !plan.success).length
      };

      updateWorkflowStep(WorkflowStep.ACTION_PLAN, {
        actionPlanResult: combinedActionPlan,
        processingStatus: ProcessingStatus.COMPLETED,
        progress: 90,
        canProceed: true
      });

      setCurrentProcessingStatus(`Action plans completed! Generated ${combinedActionPlan.successfulPlans} action plans for identified issues.`);

    } catch (err) {

      let errorMessage = 'An unexpected error occurred during action plan generation';
      
      if (err && typeof err === 'object') {
        if ('code' in err) {
          const error = err as ABGAnalysisError;
          errorMessage = error.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      updateWorkflowStep(WorkflowStep.ACTION_PLAN, {
        processingStatus: ProcessingStatus.ERROR,
        error: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    workflow,
    abgType, 
    updateWorkflowStep, 
    setProcessingStatus,
    clearError,
    setError,
    setCurrentProcessingStatus
  ]);

  // Complete and save the analysis (final step)
  const completeAnalysis = useCallback(async () => {

    // Action plan is optional. Only interpretation is required to complete.
    if (!workflow?.interpretationResult) {

      setError('Cannot complete analysis - missing interpretation');
      return;
    }

    // Try to get extractedText from workflow results or local state
    const rawAnalysisText = workflow.analysisResult?.extractedText || 
                           workflow.interpretationResult?.extractedText ||
                           extractedText;

    if (!rawAnalysisText) {

      setError('Cannot complete analysis - missing extracted text. Please restart the analysis.');
      return;
    }

    setIsProcessing(true);
    clearError();

    try {
      // Save complete results to database
      setCurrentProcessingStatus('Saving complete analysis...');
      const resultId = await createResult({
        patient_id: null,
        raw_analysis: rawAnalysisText,
        interpretation: workflow.interpretationResult.data,
        action_plan: workflow.actionPlanResult?.data || undefined,
        type: abgType,
        processing_time_ms: workflow.analysisResult?.processingTimeMs || 0,
        gemini_confidence: workflow.analysisResult?.confidence || 0.8
      });

      // Store completed result for AI consultation
      const completedABGResult = {
        id: resultId,
        raw_analysis: rawAnalysisText,
        interpretation: workflow.interpretationResult.data,
        action_plan: workflow.actionPlanResult?.data || undefined,
        type: abgType,
        processing_time_ms: workflow.analysisResult?.processingTimeMs || 0,
        gemini_confidence: workflow.analysisResult?.confidence || 0.8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: '',
        patient: null
      };

      setCompletedResult(completedABGResult);
      setCurrentProcessingStatus('Analysis Complete!');

      // Mark workflow as completed
      updateWorkflowStep(WorkflowStep.COMPLETED, {
        processingStatus: ProcessingStatus.COMPLETED,
        progress: 100
      });

      // Notify parent component
      if (onComplete) {
        onComplete(resultId);
      }

    } catch (err) {

      let errorMessage = 'Failed to save analysis results';
      
      if (err && typeof err === 'object') {
        if ('code' in err) {
          const error = err as ABGAnalysisError;
          errorMessage = error.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [
    workflow,
    extractedText,
    abgType, 
    updateWorkflowStep, 
    createResult,
    clearError,
    setError,
    onComplete,
    setCurrentProcessingStatus
  ]);

  // Restart workflow
  const restartWorkflow = useCallback(() => {
    setSelectedFile(null);
    setAbgType('Arterial Blood Gas');
    setCurrentProcessingStatus('');
    clearError();
    startWorkflow({
      currentStep: WorkflowStep.UPLOAD,
      processingStatus: ProcessingStatus.IDLE,
      progress: 0,
      canProceed: false
    });
  }, [startWorkflow, clearError]);

  return {
    // State
    selectedFile,
    abgType,
    showCamera,
    isProcessing,
    completedResult,
    currentProcessingStatus,
    pageVisible,
    unifiedProgress,
    extractedText,
    interpretation,
    showResults,
    isExtractedTextCollapsed,
    isClinicalInterpretationCollapsed,
    isAnalysisCompleteCollapsed,

    // Actions
    setSelectedFile,
    setAbgType,
    setShowCamera,
    setPageVisible,
    setIsExtractedTextCollapsed,
    setIsClinicalInterpretationCollapsed,
    setIsAnalysisCompleteCollapsed,

    // Business logic
    handleFileSelect,
    handleFileRemove,
    handleCameraCapture,
    processAnalysis,
    handleTextReAnalysis,
    processInterpretation,
    processActionPlan,
    completeAnalysis,
    loadExistingResult,
    restartWorkflow
  };
};