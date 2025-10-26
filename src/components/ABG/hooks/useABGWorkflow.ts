import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  WorkflowStep,
  ProcessingStatus,
  ABGType,
  ABGAnalysisError,
  LocalABGResponse,
  FlowiseIdentifiedIssue,
  ActionPlanResult
} from '../../../types/abg';
import { useABGStore, useABGActions } from '../../../stores/useABGStore';
import { processImageWithUnifiedAnalysis, reAnalyzeWithEditedText, UnifiedProgressInfo } from '../../../services/abgUnifiedService';
import { getABGResult, updateABGResult } from '../../../services/abgService';
import { buildEnhancedCaseContext } from '../../../utils/caseAttachmentIntegration';

interface UseABGWorkflowProps {
  onComplete?: (resultId: string) => void;
  initialType?: ABGType;
  activeCase?: any;
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
  identifiedIssues: FlowiseIdentifiedIssue[];
  actionPlans: ActionPlanResult[];
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
  initialType = 'Arterial Blood Gas',
  activeCase
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
  const [identifiedIssues, setIdentifiedIssues] = useState<FlowiseIdentifiedIssue[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlanResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isExtractedTextCollapsed, setIsExtractedTextCollapsed] = useState(true);
  const [isClinicalInterpretationCollapsed, setIsClinicalInterpretationCollapsed] = useState(true);
  const [isAnalysisCompleteCollapsed, setIsAnalysisCompleteCollapsed] = useState(false);

  // Load existing ABG result from history
  const loadExistingResult = useCallback(async (resultId: string) => {
    try {

      const result = await getABGResult(resultId);

      // Set the completed result and ABG type
      setCompletedResult(result);
      setAbgType(result.type);

      // Populate local state variables from database result
      if (result.raw_analysis) {
        setExtractedText(result.raw_analysis);
      }

      if (result.interpretation) {
        setInterpretation(result.interpretation);
      }

      // Parse action plans from database if available
      if (result.action_plan) {
        // Parse the action_plan text back into ActionPlanResult array
        const planSections = result.action_plan.split('\n\n---\n\n');
        const parsedPlans: ActionPlanResult[] = planSections.map((section) => {
          // Extract issue title from "## Action Plan N: Issue Title"
          const issueMatch = section.match(/^## Action Plan \d+: (.+)$/m);
          const issue = issueMatch ? issueMatch[1].trim() : 'Action Plan';

          // Remove the header line to get just the plan content
          const plan = section.replace(/^## Action Plan \d+: .+\n\n/m, '').trim();

          return {
            issue,
            plan,
            status: 'success' as const
          };
        });

        setActionPlans(parsedPlans);
      } else {
        setActionPlans([]);
      }

      // Enable results display
      setShowResults(true);

      // Note: identifiedIssues are generated during live analysis and not stored in DB
      // Action plans are now loaded from the database action_plan field

      // Update workflow to INTERPRETATION step (not COMPLETED)
      // This ensures the InterpretationStep component renders with all data
      startWorkflow({
        currentStep: WorkflowStep.INTERPRETATION,
        processingStatus: ProcessingStatus.COMPLETED,
        progress: 100,
        canProceed: true,
        hasAnalysisResult: true,
        analysisResult: {
          success: true,
          extractedText: result.raw_analysis,
          processingTimeMs: result.processing_time_ms || 0,
          confidence: result.gemini_confidence || 0.9,
          requestId: result.id
        },
        interpretationResult: {
          success: true,
          data: result.interpretation || '',
          processingTimeMs: result.processing_time_ms || 0,
          requestId: result.id
        },
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

      // Build case context if active case exists (following chat.ts pattern)
      let caseContextString: string | undefined;
      if (activeCase) {
        console.log('Building enhanced case context for BG analysis:', {
          caseId: activeCase.id,
          caseTitle: activeCase.title
        });
        caseContextString = buildEnhancedCaseContext(activeCase);
      }

      // Start unified analysis with real-time progress and case context
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
        },
        { caseContext: caseContextString }
      );

      if (!result.success) {
        throw new Error(result.error || 'Unified analysis failed');
      }

      // Set results for immediate display
      setExtractedText(result.extractedText);
      setInterpretation(result.interpretation);
      setIdentifiedIssues(result.identifiedIssues);
      setShowResults(true);

      console.log('Analysis complete with identified issues:', {
        issueCount: result.identifiedIssues.length,
        issues: result.identifiedIssues.map(issue => issue.issue)
      });

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
      console.log('🔵 About to call createResult with data:', {
        patient_id: null,
        raw_analysis_length: result.extractedText?.length,
        interpretation_length: result.interpretation?.length,
        type: abgType,
        type_typeof: typeof abgType,
        processing_time_ms: result.processingTimeMs,
        gemini_confidence: result.confidence
      });

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

    } catch (err) {
      console.error('❌ processAnalysis error caught:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack trace',
        type: typeof err,
        error: err
      });

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
    activeCase,
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

      // Build case context if active case exists (following chat.ts pattern)
      let caseContextString: string | undefined;
      if (activeCase) {
        console.log('Building enhanced case context for BG re-analysis:', {
          caseId: activeCase.id,
          caseTitle: activeCase.title
        });
        caseContextString = buildEnhancedCaseContext(activeCase);
      }

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
      }, caseContextString);

      if (!result.success) {
        throw new Error(result.error || 'Re-analysis failed');
      }

      // Update the interpretation and identified issues
      setInterpretation(result.interpretation);
      setIdentifiedIssues(result.identifiedIssues);
      setExtractedText(editedText);

      console.log('Re-analysis complete with identified issues:', {
        issueCount: result.identifiedIssues.length,
        issues: result.identifiedIssues.map(issue => issue.issue)
      });

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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Re-analysis failed';
      setError(errorMessage);
      setCurrentProcessingStatus('Re-analysis failed');
    } finally {
      setIsProcessing(false);
    }
  }, [abgType, activeCase, updateWorkflowStep, setError, clearError]);

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

  // Process action plans for all identified issues (parallel generation)
  const processActionPlan = useCallback(async () => {
    // Check if we have identified issues to process
    if (!identifiedIssues || identifiedIssues.length === 0) {
      setError('No identified issues found. Please complete the clinical interpretation first.');
      return;
    }

    setIsProcessing(true);
    clearError();

    try {
      const startTime = performance.now();
      const FLOWISE_ENDPOINT = 'https://flowise-2-0.onrender.com/api/v1/prediction/bff0fbe6-1a17-4c9b-a3fd-6ba4202cd150';

      console.log(`Starting parallel action plan generation for ${identifiedIssues.length} issues`);

      // Initialize action plans with 'pending' status
      const initialActionPlans: ActionPlanResult[] = identifiedIssues.map(issue => ({
        issue: issue.issue,
        plan: '',
        status: 'pending' as const
      }));
      setActionPlans(initialActionPlans);

      setCurrentProcessingStatus(`Generating action plans... (0 of ${identifiedIssues.length})`);
      // Stay on INTERPRETATION step - don't advance to ACTION_PLAN
      // Action plans are displayed within InterpretationStep
      setProcessingStatus(ProcessingStatus.GENERATING_PLAN, 'Generating action plans...');

      // Create parallel requests for each issue
      const actionPlanPromises = identifiedIssues.map(async (issue, index) => {
        // Update status to 'loading' for this issue
        setActionPlans(prev =>
          prev.map((plan, i) =>
            i === index ? { ...plan, status: 'loading' as const } : plan
          )
        );

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes per request

          const response = await fetch(FLOWISE_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              question: `<<BG_ACTION_PLAN>>\n\nIssue: ${issue.issue}\n\nDescription: ${issue.description}\n\nQuestion: ${issue.question}`
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Flowise API Error: ${response.status} ${response.statusText}`);
          }

          const flowiseResult = await response.json();

          // Extract action plan text with robust parsing
          let actionPlanText = '';

          // Try to extract the actual text content from various response structures
          if (typeof flowiseResult === 'string') {
            actionPlanText = flowiseResult;
          } else if (flowiseResult.text && typeof flowiseResult.text === 'string' && flowiseResult.text.trim()) {
            actionPlanText = flowiseResult.text;
          } else if (flowiseResult.output && typeof flowiseResult.output === 'string') {
            actionPlanText = flowiseResult.output;
          } else if (flowiseResult.data) {
            if (typeof flowiseResult.data === 'string') {
              actionPlanText = flowiseResult.data;
            } else if (flowiseResult.data.text && typeof flowiseResult.data.text === 'string') {
              actionPlanText = flowiseResult.data.text;
            }
          } else if (flowiseResult.message && typeof flowiseResult.message === 'string') {
            actionPlanText = flowiseResult.message;
          } else if (flowiseResult.response && typeof flowiseResult.response === 'string') {
            actionPlanText = flowiseResult.response;
          } else if (flowiseResult.result && typeof flowiseResult.result === 'string') {
            actionPlanText = flowiseResult.result;
          }

          // If still empty, try to find text in nested structures
          if (!actionPlanText || actionPlanText.trim() === '') {
            // Check if there's a question field that contains the actual content
            if (flowiseResult.question && typeof flowiseResult.question === 'string') {
              // Extract content after <<BG_ACTION_PLAN>> marker if present
              const markerIndex = flowiseResult.question.indexOf('<<BG_ACTION_PLAN>>');
              if (markerIndex !== -1) {
                actionPlanText = flowiseResult.question.substring(markerIndex + '<<BG_ACTION_PLAN>>'.length).trim();
              } else {
                actionPlanText = flowiseResult.question;
              }
            }
          }

          // Last resort: stringify but log warning
          if (!actionPlanText || actionPlanText.trim() === '') {
            console.warn('⚠️ Could not extract clean text from Flowise response, using fallback', flowiseResult);
            actionPlanText = JSON.stringify(flowiseResult);
          }

          // Clean up metadata patterns that sometimes leak through
          actionPlanText = actionPlanText
            // Remove JSON metadata patterns
            .replace(/^\{"text":"","question":"[^"]*","chatId":"[^"]*"[^}]*\}/g, '')
            .replace(/\{"nodeId":"[^"]*","nodeLabel":"[^"]*"[^}]*\}/g, '')
            .replace(/\{"agentFlowExecutedData":\[.*?\]\}/g, '')
            // Remove Flowise metadata fields
            .replace(/<<".*?">>/g, '')
            .replace(/\[chatflow\]/gi, '')
            .replace(/\{"executionId":"[^"]*"\}/g, '')
            // Clean up file paths
            .replace(/\/var\/folders\/[^\s]+/g, '')
            .replace(/\/tmp\/[^\s]+/g, '')
            .replace(/\/Users\/[^\/]+\/[^\s]*TemporaryItems[^\s]*/g, '')
            .replace(/\/[A-Za-z0-9_\-]+\/TemporaryItems\/[^\s]+/g, '')
            // Clean up escape sequences
            .replace(/\\n\\n/g, '\n\n')
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .trim();

          return { index, success: true, plan: actionPlanText };

        } catch (error) {
          console.error(`Error generating action plan for issue "${issue.issue}":`, error);
          return {
            index,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate action plan'
          };
        }
      });

      // Wait for all requests to complete (with partial failures allowed)
      const results = await Promise.allSettled(actionPlanPromises);

      // Process results and update action plans
      const finalActionPlans: ActionPlanResult[] = identifiedIssues.map((issue, index) => {
        const result = results[index];

        if (result.status === 'fulfilled' && result.value.success) {
          return {
            issue: issue.issue,
            plan: result.value.plan,
            status: 'success' as const
          };
        } else {
          const errorMsg = result.status === 'fulfilled'
            ? result.value.error
            : 'Request failed';
          return {
            issue: issue.issue,
            plan: '',
            status: 'error' as const,
            error: errorMsg
          };
        }
      });

      setActionPlans(finalActionPlans);

      // Count successful and failed plans
      const successCount = finalActionPlans.filter(p => p.status === 'success').length;
      const failedCount = finalActionPlans.filter(p => p.status === 'error').length;

      const processingTime = Math.round(performance.now() - startTime);

      console.log(`✅ Action plan generation complete: ${successCount} successful, ${failedCount} failed in ${processingTime}ms`);

      // Auto-save action plans to database if we have a result ID
      if (successCount > 0 && completedResult?.id) {
        try {
          // Convert action plans to formatted text for database storage
          const successfulPlans = finalActionPlans.filter(ap => ap.status === 'success');
          const actionPlanText = successfulPlans
            .map((ap, index) => `## Action Plan ${index + 1}: ${ap.issue}\n\n${ap.plan}`)
            .join('\n\n---\n\n');

          // Update the existing database record with action plans
          await updateABGResult(completedResult.id, {
            action_plan: actionPlanText
          });

          console.log(`✅ Action plans auto-saved to database for result ${completedResult.id}`);

          // Update completedResult with the action plans
          setCompletedResult({
            ...completedResult,
            action_plan: actionPlanText
          });
        } catch (error) {
          console.error('Failed to auto-save action plans:', error);
          // Don't show error to user - action plans are still in memory
        }
      }

      // Stay on INTERPRETATION step - action plans display there
      // Just update processing status, don't advance workflow
      if (successCount === identifiedIssues.length) {
        setCurrentProcessingStatus(`All ${successCount} action plans generated successfully!`);
        setProcessingStatus(ProcessingStatus.COMPLETED, 'Action plans generated');
      } else if (successCount > 0) {
        setCurrentProcessingStatus(`${successCount} of ${identifiedIssues.length} action plans generated (${failedCount} failed)`);
        setProcessingStatus(ProcessingStatus.COMPLETED, 'Partial success');
      } else {
        setError(`Failed to generate action plans for all ${identifiedIssues.length} issues`);
        setCurrentProcessingStatus('Action plan generation failed');
        setProcessingStatus(ProcessingStatus.ERROR, 'Generation failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during action plan generation';
      console.error('Action plan generation error:', err);
      setError(errorMessage);
      setProcessingStatus(ProcessingStatus.ERROR, errorMessage);
      setCurrentProcessingStatus('Action plan generation failed');
    } finally {
      setIsProcessing(false);
    }
  }, [
    identifiedIssues,
    completedResult,
    updateWorkflowStep,
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

      // Convert actionPlans array to formatted string for database storage
      let actionPlanText: string | undefined = undefined;
      if (actionPlans && actionPlans.length > 0) {
        const successfulPlans = actionPlans.filter(ap => ap.status === 'success');
        if (successfulPlans.length > 0) {
          actionPlanText = successfulPlans
            .map((ap, index) => `## Action Plan ${index + 1}: ${ap.issue}\n\n${ap.plan}`)
            .join('\n\n---\n\n');
        }
      }

      const resultId = await createResult({
        patient_id: null,
        raw_analysis: rawAnalysisText,
        interpretation: workflow.interpretationResult.data,
        action_plan: actionPlanText,
        type: abgType,
        processing_time_ms: workflow.analysisResult?.processingTimeMs || 0,
        gemini_confidence: workflow.analysisResult?.confidence || 0.8
      });

      // Store completed result for AI consultation
      const completedABGResult = {
        id: resultId,
        raw_analysis: rawAnalysisText,
        interpretation: workflow.interpretationResult.data,
        action_plan: actionPlanText,
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
    actionPlans,
    updateWorkflowStep,
    createResult,
    clearError,
    setError,
    onComplete,
    setCurrentProcessingStatus
  ]);

  // Restart workflow - Reset ALL state variables for fresh session
  const restartWorkflow = useCallback(() => {
    // Reset file selection
    setSelectedFile(null);
    setAbgType('Arterial Blood Gas');

    // Reset processing state
    setIsProcessing(false);
    setCurrentProcessingStatus('');
    setUnifiedProgress(null);

    // Reset analysis results
    setExtractedText('');
    setInterpretation('');
    setIdentifiedIssues([]);
    setActionPlans([]);
    setCompletedResult(null);
    setShowResults(false);

    // Reset collapsed states to initial values
    setIsExtractedTextCollapsed(true);
    setIsClinicalInterpretationCollapsed(true);
    setIsAnalysisCompleteCollapsed(false);

    // Clear camera state
    setShowCamera(false);

    // Clear errors and reset store workflow
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
    identifiedIssues,
    actionPlans,
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