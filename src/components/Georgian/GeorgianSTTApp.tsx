import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Stethoscope,
  Activity,
  Shield,
  X,
  Check,
  Edit3,
  AlertTriangle,
  ChevronRight,
  FileText,
  Plus,
  Search,
  Mic,
  Square,
  Brain,
  MoreVertical,
  Trash2,
  Copy,
  ClipboardList
} from 'lucide-react';
import { MedicalButton, MedicalCard, MedicalInput, MedicalLoading, MedicalBadge } from '../ui/MedicalDesignSystem';
import { MedicalDrawer } from '../ui/MedicalDrawer';
import '../../styles/medical-design-tokens.css';
import './styles/transcription-theme.css';
import { SessionHistory } from './SessionHistory';
import { TranscriptPanel } from './TranscriptPanel';
import { useSessionManagement, GeorgianSession } from '../../hooks/useSessionManagement';
import { useAIProcessing } from '../../hooks/useAIProcessing';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';
import { useAudioFileUpload } from '../../hooks/useAudioFileUpload';
import { useAuth } from '../../stores/useAppStore';
import { useViewportHeight } from '../../hooks/useViewportHeight';
import { useMobileViewport } from '../../hooks/useMobileViewport';
import { useKeyboardAwareTextarea } from '../../hooks/useKeyboardAwareTextarea';
import { isDiagnosisTemplate, extractDiagnosisFromInstruction, generateDiagnosisReport, generateTemplateBasedReport } from '../../services/diagnosisFlowiseService';
import { useTemplateSelection } from '../../hooks/useTemplateManagement';
import type { UserReportTemplate } from '../../types/templates';
import { supabase } from '../../lib/supabase';

// Import extracted components
import { HeaderControls } from './components/HeaderControls';
import { MobileHeader } from './components/MobileHeader';
import { MobileSessionHeader } from './components/MobileSessionHeader';
import { AudioUploadProgress } from './components/AudioUploadProgress';
import { TitleRequiredModal } from './components/TitleRequiredModal';
import { formatTime } from './utils/transcriptUtils';

// Types
interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

export const GeorgianSTTApp: React.FC = () => {
  const { user } = useAuth(); // Authentication hook - get user for Form 100
  useViewportHeight(); // Mobile viewport height management
  
  // Mobile-first optimization hooks
  const { viewportState, isKeyboardVisible, keyboardHeight } = useMobileViewport();
  const { 
    textareaRef, 
    focusState, 
    containerStyle, 
    isKeyboardAdjusted 
  } = useKeyboardAwareTextarea();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<GeorgianSession[]>([]);
  // Mobile drawer state management
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  // Active tab state for header recording controls
  const [activeTab, setActiveTab] = useState<'transcript' | 'ai'>('transcript');
  const openMobileDrawer = () => setIsMobileDrawerOpen(true);
  const closeMobileDrawer = () => setIsMobileDrawerOpen(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  
  // Speaker diarization state
  const [enableSpeakerDiarization, setEnableSpeakerDiarization] = useState(false);
  const [speakerCount, setSpeakerCount] = useState(2);

  // Session title state for pre-recording title input
  const [pendingSessionTitle, setPendingSessionTitle] = useState('');

  // Title required modal state
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showTitleError, setShowTitleError] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Mobile session editing states
  const [editingSessionId, setEditingSessionId] = useState<string>('');
  const [editingTitle, setEditingTitle] = useState('');

  // Mobile action menu state
  const [mobileActionMenuId, setMobileActionMenuId] = useState<string>('');

  // Store the expand chat function from AIProcessingContent
  const [expandChatFunction, setExpandChatFunction] = useState<(() => void) | null>(null);

  // Template selection for AI processing
  const [selectedTemplate, setSelectedTemplate] = useState<UserReportTemplate | null>(null);
  const { templates, selectTemplate, getSuggestedTemplates } = useTemplateSelection();

  // Debug when expand function is set
  const handleSetExpandChatFunction = useCallback((fn: () => void) => {

    setExpandChatFunction(() => fn);
  }, []);
  
  // Debug speaker diarization state changes
  useEffect(() => {

  }, [enableSpeakerDiarization, speakerCount]);
  
  // Local transcript state - single source of truth for UI display
  const [localTranscript, setLocalTranscript] = useState('');
  // CRITICAL FIX: Ref to always have synchronous access to current transcript value
  // Prevents stale closure issues in async callbacks
  const localTranscriptRef = useRef<string>('');
  // Recording session tracking
  const [currentRecordingSessionId, setCurrentRecordingSessionId] = useState<string>('');
  
  // Session Management
  const {
    sessions,
    currentSession,
    loading: sessionLoading,
    error: sessionError,
    createSession,
    selectSession,
    updateSession,
    deleteSession,
    duplicateSession,
    updateTranscript,
    appendToTranscript,
    addProcessingResult,
    clearError: clearSessionError,
    refreshSessions,
    searchSessions,
    cleanupEmptyTemporarySessions
  } = useSessionManagement();
  
  // Handle title change for both new and existing sessions (LOCAL STATE ONLY - no database updates)
  const handleTitleChange = useCallback((title: string) => {
    // Clear error when user starts typing
    if (showTitleError) setShowTitleError(false);

    // ALWAYS use local state for immediate UI updates (no database calls, no trimming)
    // This ensures smooth typing experience with spaces and fast typing
    if (currentSession) {
      // For existing session, update local pending title temporarily
      setPendingSessionTitle(title);
    } else {
      // For new session, update pending title
      setPendingSessionTitle(title);
    }
  }, [showTitleError]);

  // Save title to database (called on blur, Enter key, or before recording)
  const handleTitleSave = useCallback(async (title: string) => {
    const trimmedTitle = title.trim();

    // Only save if title is not empty
    if (!trimmedTitle) return;

    if (currentSession) {
      // Update existing session title in database
      await updateSession(currentSession.id, { title: trimmedTitle });
    }
    // For new sessions, title will be saved when session is created during recording
  }, [currentSession, updateSession]);

  // Sync pendingSessionTitle with current session title when session changes
  useEffect(() => {
    if (currentSession) {
      // Load current session's title into pending title for editing
      setPendingSessionTitle(currentSession.title);
    } else {
      // Clear pending title when no session is selected
      setPendingSessionTitle('');
    }
  }, [currentSession?.id, currentSession?.title]);

  // Session-aware transcript updates - prevents cross-session contamination
  const lastProcessedContentRef = useRef<string>('');
  const lastProcessedTimeRef = useRef<number>(0);
  // Track if we're in the middle of a recording that started with existing content
  const recordingWithExistingContentRef = useRef<boolean>(false);

  const handleLiveTranscriptUpdate = useCallback(async (newText: string, fullText: string, sessionId?: string) => {
    // OPTIMISTIC UI: Update local state immediately for instant feedback
    if (newText.trim()) {
      const now = Date.now();

      // Prevent duplicate processing of the same content within a short time window
      if (lastProcessedContentRef.current === newText.trim() && (now - lastProcessedTimeRef.current) < 1000) {
        console.log(`🚫 Duplicate live update detected (within 1s), skipping: "${newText.substring(0, 50)}..."`);
        return;
      }

      lastProcessedContentRef.current = newText.trim();
      lastProcessedTimeRef.current = now;

      // Only append NEW text, not full text - this prevents duplicates
      console.log(`📤 Live update received: "${newText.substring(0, 50)}..." (session: ${sessionId || 'no session'})`);

      // Update local transcript immediately (optimistic UI)
      // CRITICAL FIX: Properly append to existing content (typed/pasted text)
      setLocalTranscript(prev => {
        // Use single space for natural text flow (no automatic paragraph breaks)
        const separator = prev ? ' ' : '';
        const updatedTranscript = prev + separator + newText.trim();
        // CRITICAL FIX: Sync ref with state update for synchronous access
        localTranscriptRef.current = updatedTranscript;
        console.log(`🔄 Local transcript updated: prev=${prev.length}, new=${newText.length}, total=${updatedTranscript.length}`);
        return updatedTranscript;
      });
      
      // Save to database in background - prioritize current recording session
      // Use sessionId parameter (from useGeorgianTTS hook) if available, fallback to currentSession
      const targetSessionId = sessionId || currentSession?.id;
      
      if (targetSessionId) {
        // Use the session ID from the recording or current selection
        console.log(`💾 Saving to session: ${targetSessionId} (from ${sessionId ? 'recording' : 'current'})`);

        // CRITICAL FIX: Use ref for current transcript value (prevents stale closure)
        // localTranscriptRef is always up-to-date, unlike localTranscript in async callbacks
        appendToTranscript(targetSessionId, newText.trim(), localTranscriptRef.current).catch(error => {
          // Keep local state - user still sees the transcript
          console.error(`❌ Failed to append to session ${targetSessionId}:`, error);
        });
      } else {
        // Only create new session if we truly have no session context
        console.log('🆕 No session available, creating new one');
        
        const newSession = await createSession('Live Recording');
        if (!newSession) return;

        // First select the session, then append the text
        try {
          await selectSession(newSession.id);
          console.log(`✅ Created and selected new session: ${newSession.id}`);

          // Use a small delay to ensure the session selection has propagated
          setTimeout(() => {
            // For new session, pass empty string (session is fresh)
            appendToTranscript(newSession.id, newText.trim(), '');
          }, 100);
        } catch (error) {
          console.error(`❌ Failed to select new session ${newSession.id}:`, error);

          // Fallback: still try to append
          setTimeout(() => {
            // For new session, pass empty string (session is fresh)
            appendToTranscript(newSession.id, newText.trim(), '');
          }, 100);
        }
      }
    }
  }, [appendToTranscript, sessions, createSession, currentSession, selectSession]);

  // Georgian TTS - Check support first
  const {
    recordingState,
    isTranscribing,
    transcriptionResult,
    error: ttsError,
    authStatus,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    processFileUpload,
    clearError: clearTTSError,
    clearResult: clearTTSResult,
    resetTranscript,
    initializeWithExistingTranscript,
    canRecord,
    canStop,
    canPause,
    canResume,
    remainingTime,
    isNearMaxDuration,
    // Speaker diarization state from hook
    speakerSegments,
    hasSpeakerResults,
    // STT model selection
    selectedSTTModel,
    updateSelectedSTTModel,
    // Dual transcript methods for parallel processing
    getDualTranscripts,
    getCombinedTranscriptForSubmission
    // service // Currently unused
  } = useGeorgianTTS({
    language: 'ka-GE',
    autocorrect: true,
    punctuation: true,
    digits: true,
    maxDuration: 0, // No limit - use chunked processing
    chunkDuration: 12000, // 12 second chunks for processing
    sessionId: currentSession?.id, // Pass current session ID for isolation
    onLiveTranscriptUpdate: handleLiveTranscriptUpdate,
    // Speaker diarization options
    enableSpeakerDiarization,
    speakers: speakerCount
  });

  // Audio File Upload
  const {
    uploadState,
    processAudioFile,
    cancelProcessing,
    resetState: resetUploadState,
    getStatusMessage,
    canProcess,
    canCancel
  } = useAudioFileUpload({
    language: 'ka-GE',
    autocorrect: true,
    punctuation: true,
    digits: true,
    sessionId: currentSession?.id,
    onTranscriptUpdate: handleLiveTranscriptUpdate,
    // Speaker diarization options
    enableSpeakerDiarization,
    speakers: speakerCount
  });

  // AI Processing
  const {
    processing,
    error: aiError,
    // lastResult, // Currently unused
    processingHistory,
    processText,
    clearError: clearAIError,
    setError: setAIError,
    clearHistory,
    addToHistory: addToHistoryLocal,
    deleteFromHistory,
    setProcessing
  } = useAIProcessing({
    sessionProcessingResults: currentSession?.processingResults
  });

  // Wrapper function to add to history AND save to database
  const addToHistory = useCallback(async (
    instruction: string,
    response: string,
    model: string,
    tokensUsed?: number,
    processingTime?: number
  ) => {
    console.log('📝 Adding to history and saving to database:', { model, sessionId: currentSession?.id });

    // Add to local state immediately (for instant UI update)
    addToHistoryLocal(instruction, response, model, tokensUsed, processingTime);

    // Save to database in background (for persistence)
    if (currentSession?.id) {
      try {
        const saveSuccess = await addProcessingResult(currentSession.id, {
          userInstruction: instruction,
          aiResponse: response,
          model,
          tokensUsed,
          processingTime: processingTime || 0
        });
        console.log('💾 Processing result saved to database:', { saveSuccess, sessionId: currentSession.id });
      } catch (error) {
        console.error('❌ Failed to save processing result to database:', error);
        // Don't throw - local state is already updated
      }
    } else {
      console.warn('⚠️ No current session - result shown in UI but not saved to database');
    }
  }, [currentSession?.id, addToHistoryLocal, addProcessingResult]);
  
  // Debug processing history updates (disabled in production)
  // + '...',
  //     responseLength: item.aiResponse?.length || 0,
  //     timestamp: item.timestamp
  //   })) || []
  // });

  // Filter sessions based on search and exclude empty temporary sessions
  useEffect(() => {
    let filteredSessions = sessions.filter(session => {
      // Exclude temporary sessions that don't have content, UNLESS they are the current active session
      if (session.isTemporary && (!session.transcript || session.transcript.trim() === '')) {
        // Show temporary session if it's the currently selected one (user just created it)
        return currentSession?.id === session.id;
      }
      return true;
    });

    if (searchQuery.trim()) {
      filteredSessions = filteredSessions.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.transcript.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredSessions(filteredSessions);
  }, [sessions, searchQuery, currentSession]);

  // Cleanup empty temporary sessions on unmount
  useEffect(() => {
    return () => {
      cleanupEmptyTemporarySessions();
    };
  }, [cleanupEmptyTemporarySessions]);

  // Don't auto-create sessions - only create when user starts recording or uploads

  // Handle final transcription result (DISABLED - live updates handle everything)
  // COMPLETELY DISABLED - was interfering with transcript display
  /*
  useEffect(() => {
    if (transcriptionResult && currentSession && !recordingState.isRecording) {
      // DISABLED: Live updates via handleLiveTranscriptUpdate handle all transcript additions
      // This useEffect was causing DOUBLE ADDITION of the same segment text
      console.log(`🚫 SKIPPING final processing - live updates already handled: "${transcriptionResult.text.substring(0, 50)}..."`);
      clearTTSResult();
    }
  }, [transcriptionResult, currentSession, recordingState.isRecording, clearTTSResult]);
  */

  // Handle session creation with cleanup - creates temporary session only
  const handleCreateSession = useCallback(async (title?: string) => {
    // Stop any ongoing recording and clear TTS state
    if (recordingState.isRecording) {
      stopRecording();
    }

    // Clear ALL TTS state and local transcript for fresh start
    resetTranscript();
    clearTTSResult();
    setLocalTranscript('');
    // CRITICAL FIX: Sync ref when clearing transcript for new session
    localTranscriptRef.current = '';
    setCurrentRecordingSessionId(''); // Clear recording session
    
    // Create new session
    const newSession = await createSession(title);
    if (newSession) {
      await selectSession(newSession.id);
    }
  }, [createSession, selectSession, resetTranscript, clearTTSResult, recordingState.isRecording, stopRecording]);

  // Handle session deletion with confirmation
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session && window.confirm(`Are you sure you want to delete "${session.title}"?`)) {
      await deleteSession(sessionId);
    }
  }, [sessions, deleteSession]);

  // Handle AI text processing with direct transcript parameter
  const handleProcessText = useCallback(async (instruction: string, directTranscript?: string) => {
    // Debug info (disabled in production)

    // CRITICAL FIX: Build comprehensive transcript for AI processing
    // Priority order: directTranscript (explicit) > localTranscript (UI state with typed + dictated)
    // Then ADD dual parallel transcripts (Google + Enagram) as alternative versions
    const combinedTranscript = getCombinedTranscriptForSubmission();
    const baseTranscript = directTranscript || localTranscript || currentSession?.transcript || transcriptionResult?.text || '';

    // CRITICAL: If we have both typed/pasted text AND parallel transcripts, combine them properly
    // This ensures typed text is ALWAYS included in AI processing
    let transcript = baseTranscript;
    if (baseTranscript.trim() && combinedTranscript && combinedTranscript !== baseTranscript) {
      // We have manually typed/pasted content PLUS parallel transcripts
      // Format: "TYPED/PASTED CONTENT\n--- Transcription ---\nPARALLEL TRANSCRIPTS"
      transcript = `${baseTranscript.trim()}\n--- Transcription ---\n${combinedTranscript.trim()}`;
      console.log('🔄 Combined typed + parallel transcripts for AI processing');
    } else if (!baseTranscript.trim() && combinedTranscript) {
      // Only parallel transcripts, no typed content
      transcript = combinedTranscript;
    }

    // Debug transcript source for parallel processing
    console.log('📝 Transcript source for AI processing:', {
      hasDirectTranscript: !!directTranscript,
      hasLocalTranscript: !!localTranscript,
      hasSessionTranscript: !!currentSession?.transcript,
      hasCombinedTranscript: !!combinedTranscript,
      baseLength: baseTranscript?.length || 0,
      combinedLength: combinedTranscript?.length || 0,
      finalLength: transcript.length,
      includesTypedContent: baseTranscript.trim() && combinedTranscript && combinedTranscript !== baseTranscript
    });

    if (!transcript.trim()) {

      return;
    }

    // Check if a custom template is selected
    if (selectedTemplate) {
      console.log('📋 Custom template selected:', selectedTemplate.name);
      
      // Record template usage
      try {
        await selectTemplate(selectedTemplate);
      } catch (error) {
        console.warn('Failed to record template usage:', error);
      }
      
      // Use template-based report generation
      setProcessing(true);
      
      try {
        console.log('🚀 Starting template-based report generation...');
        const startTime = Date.now();
        const templateResult = await generateTemplateBasedReport(transcript, selectedTemplate);
        const processingTime = Date.now() - startTime;
        
        console.log('✅ Template-based report completed:', {
          success: templateResult.success,
          processingTime,
          reportLength: templateResult.success ? templateResult.report?.length : 0
        });

        if (templateResult.success && currentSession) {
          // Save template result to session with Template: prefix for UI recognition
          const processingResultData = {
            userInstruction: `Template: ${selectedTemplate.name}\n${selectedTemplate.example_structure.substring(0, 150)}...`,
            aiResponse: templateResult.report,
            model: 'flowise-diagnosis-agent', // Use same model as diagnosis for consistent display
            tokensUsed: Math.floor(templateResult.report.length / 4),
            processingTime
          };

          const saveSuccess = await addProcessingResult(currentSession.id, processingResultData);
          console.log('💾 Template session save result:', { saveSuccess, sessionId: currentSession.id });

          if (saveSuccess) {
            addToHistory(
              processingResultData.userInstruction,
              processingResultData.aiResponse,
              processingResultData.model,
              processingResultData.tokensUsed,
              processingResultData.processingTime
            );
            console.log('✅ Template result added to UI history');
          }

          // Clear selected template after successful generation
          setSelectedTemplate(null);
        } else if (!templateResult.success) {
          console.error('❌ Template processing failed:', templateResult.error);
          setAIError(`Template processing failed: ${templateResult.error}`);
          // Clear selected template on error
          setSelectedTemplate(null);
        }
      } catch (error) {
        console.error('🚨 Template processing failed:', error);
        setAIError('Failed to generate template-based report. Please try again.');
        // Clear selected template on error
        setSelectedTemplate(null);
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Check if this is a diagnosis request and route to specialized service
    if (isDiagnosisTemplate(instruction)) {
      console.log('🩺 Diagnosis template detected:', instruction);

      const diagnosisInfo = extractDiagnosisFromInstruction(instruction);
      if (diagnosisInfo) {
        console.log('🩺 Diagnosis info extracted:', diagnosisInfo);
        console.log('📝 Transcript length:', transcript.length);
        console.log('📝 Transcript preview:', transcript.substring(0, 200) + '...');

        // Extract card title from instruction (first line contains the title)
        const cardTitle = `Initial Diagnosis - (${diagnosisInfo.icdCode}) ${diagnosisInfo.diagnosisGeorgian}`;
        console.log('📋 Card title:', cardTitle);

        // Manually manage processing state for diagnosis service
        // We can't use the regular processText as it goes to a different endpoint

        setProcessing(true);

        try {
          console.log('🚀 Starting diagnosis report generation...');
          const startTime = Date.now();
          const diagnosisResult = await generateDiagnosisReport(transcript, diagnosisInfo, cardTitle);
          const processingTime = Date.now() - startTime;
          
          console.log('✅ Diagnosis report completed:', {
            success: diagnosisResult.success,
            processingTime,
            reportLength: diagnosisResult.success ? diagnosisResult.report?.length : 0
          });

          if (diagnosisResult.success) {
            // Save diagnosis result to session with special metadata
            const processingResultData = {
              userInstruction: instruction,
              aiResponse: diagnosisResult.report,
              model: 'flowise-diagnosis-agent',
              tokensUsed: Math.floor(diagnosisResult.report.length / 4), // Estimate tokens
              processingTime
            };

            // CRITICAL: Add to history IMMEDIATELY to show Georgian output
            console.log('📈 Adding diagnosis to UI history (Georgian)...');
            addToHistory(
              processingResultData.userInstruction,
              processingResultData.aiResponse,
              processingResultData.model,
              processingResultData.tokensUsed,
              processingResultData.processingTime
            );
            console.log('✅ Diagnosis added to UI history');

            // THEN try to save to session (non-blocking)
            if (currentSession) {
              const saveSuccess = await addProcessingResult(currentSession.id, processingResultData);
              console.log('💾 Session save result:', { saveSuccess, sessionId: currentSession.id });
            } else {
              console.warn('⚠️ No current session - diagnosis shown in UI but not saved to database');
            }
          } else {
            // Diagnosis generation failed - show error to user
            console.error('❌ Diagnosis generation failed - NO FALLBACK');
            console.error('Diagnosis result:', diagnosisResult);
            console.error('Error:', diagnosisResult.error);

            // Set error message for user
            setAIError(`Failed to generate diagnosis report: ${diagnosisResult.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('🚨 Diagnosis processing failed:', error);
          console.error('Diagnosis info:', diagnosisInfo);
          console.error('Transcript length:', transcript.length);
          
          // Set error state for user feedback
          setAIError('Failed to generate diagnosis report. Please try again.');
        } finally {
          // Always reset processing state
          setProcessing(false);
        }
        return;
      }
    }

    // Regular AI processing for non-diagnosis requests
    const result = await processText(transcript, instruction);
    
    if (result && currentSession) {
      // Save processing result to session
      const processingResultData = {
        userInstruction: instruction,
        aiResponse: result.result,
        model: result.model,
        tokensUsed: result.tokensUsed,
        processingTime: result.processingTime
      };
      
      const saveSuccess = await addProcessingResult(currentSession.id, processingResultData);
      if (saveSuccess) {
        // Add to local history for immediate UI update
        addToHistory(
          processingResultData.userInstruction,
          processingResultData.aiResponse,
          processingResultData.model,
          processingResultData.tokensUsed,
          processingResultData.processingTime
        );
      }
    } else if (!currentSession) {

      // Create a temporary session for the AI processing result with initial content
      const tempSession = await createSession('AI Analysis Session', transcript.substring(0, 100) + '...');
      if (tempSession && result) {
        await addProcessingResult(tempSession.id, {
          userInstruction: instruction,
          aiResponse: result.result,
          model: result.model,
          tokensUsed: result.tokensUsed,
          processingTime: result.processingTime
        });

      }
    }
  }, [currentSession, transcriptionResult, localTranscript, processText, addProcessingResult, createSession, setProcessing, getCombinedTranscriptForSubmission]);

  // Handle report deletion with database sync
  const handleDeleteReport = useCallback(async (analysis: ProcessingHistory) => {

    // Remove from local state immediately for responsive UI
    deleteFromHistory(analysis.timestamp);

    // Also remove from database if we have a current session
    if (currentSession) {
      try {
        // First, fetch the current session data
        const { data: sessionData, error: fetchError } = await supabase
          .from('georgian_sessions')
          .select('processing_results')
          .eq('id', currentSession.id)
          .single();

        if (fetchError) {

          throw fetchError;
        }

        // Filter out the deleted report from the processing results
        const currentResults = sessionData?.processing_results || [];
        const updatedResults = currentResults.filter(
          (result: any) => result.timestamp !== analysis.timestamp
        );

        // Update the session with the filtered results
        const { error: updateError } = await supabase
          .from('georgian_sessions')
          .update({
            processing_results: updatedResults,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSession.id);

        if (updateError) {

          throw updateError;
        }

        // Refresh sessions to ensure UI shows updated data
        await refreshSessions();
      } catch (error) {
        console.error('🚨 Failed to delete report from database:', error);
        console.error('Session ID:', currentSession.id);
        console.error('Report timestamp:', analysis.timestamp);
        
        // Re-add to local state if deletion failed
        addToHistory(
          analysis.userInstruction,
          analysis.aiResponse,
          analysis.model,
          analysis.tokensUsed,
          analysis.processingTime
        );
      }
    }
  }, [currentSession, deleteFromHistory, addToHistory, refreshSessions]);

  // Handle session selection with local transcript loading
  const handleSelectSession = useCallback(async (sessionId: string) => {
    const selectedSession = sessions.find(s => s.id === sessionId);
    if (selectedSession) {
      // Stop any ongoing recording
      if (recordingState.isRecording) {
        stopRecording();
      }

      // Clear TTS state (cancels background processing)
      resetTranscript();
      clearTTSResult();

      // Clear recording session when switching
      setCurrentRecordingSessionId('');

      // Load session transcript into local state immediately for instant UI feedback
      const sessionTranscript = selectedSession.transcript || '';
      setLocalTranscript(sessionTranscript);
      // CRITICAL FIX: Sync ref when loading session transcript
      localTranscriptRef.current = sessionTranscript;

      // CRITICAL FIX: Initialize TTS hook with existing transcript for AI processing
      // This ensures getCombinedTranscriptForSubmission() returns the transcript for diagnosis generation
      if (sessionTranscript.trim()) {
        initializeWithExistingTranscript(sessionTranscript);
        console.log(`🔄 Initialized TTS hook with session transcript for AI processing (${sessionTranscript.length} chars)`);
      }

      // Switch session (now async - will refresh with latest data from database)
      await selectSession(sessionId);
    }
  }, [sessions, resetTranscript, clearTTSResult, selectSession, recordingState.isRecording, stopRecording, initializeWithExistingTranscript]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!canProcess) {

      return;
    }

    if (!currentSession) {
      // Create new session for file upload
      const newSession = await createSession(`File: ${file.name}`);
      if (!newSession) return;
      
      resetTranscript(); // Reset transcript for new session
      clearTTSResult(); // Clear old transcription result
      await selectSession(newSession.id);
    }
    
    // Reset any previous upload state
    resetUploadState();
    
    // Use the new audio file upload hook
    const result = await processAudioFile(file);
    if (result.success) {
      console.log(`✅ Audio file upload completed: ${result.chunksProcessed} chunks, ${Math.round(result.duration)}s audio`);
    } else {

    }
  }, [currentSession, createSession, selectSession, resetTranscript, clearTTSResult, canProcess, resetUploadState, processAudioFile]);

  // Track when recording stops to prevent clearing transcript immediately after
  const recordingStopTimeRef = useRef<number>(0);

  // Update ref when recording stops
  useEffect(() => {
    if (!recordingState.isRecording) {
      recordingStopTimeRef.current = Date.now();
    }
  }, [recordingState.isRecording]);

  // Handle transcript update (for editing existing transcript)
  const handleTranscriptUpdate = useCallback(async (transcript: string, duration?: number) => {
    // CRITICAL FIX: NEVER clear localTranscript here!
    // This function is called when user types/pastes text OR when component saves to database
    // Clearing localTranscript would lose the user's work
    // The only time we clear localTranscript is when:
    // 1. Creating a new session (handleCreateSession)
    // 2. Switching to a different session (handleSelectSession)

    // Simply save the transcript to the database without touching localTranscript
    if (currentSession) {
      // CRITICAL FIX: Also update localTranscript so it stays in sync with user edits
      // When user types/edits after pausing recording, we need localTranscript updated
      // so that resuming recording continues from the edited version
      setLocalTranscript(transcript);
      // CRITICAL FIX: Sync ref when user edits transcript
      localTranscriptRef.current = transcript;
      console.log(`📝 Updated localTranscript from edit (${transcript.length} chars)`);
      updateTranscript(currentSession.id, transcript, duration);
    } else if (transcript.trim()) {
      // CRITICAL FIX: Use pendingSessionTitle if user already typed a title, otherwise use 'Manual Entry'
      // This prevents creating duplicate sessions when user types title first, then types in transcript
      const sessionTitle = pendingSessionTitle.trim() || 'Manual Entry';
      console.log(`📝 Creating session with title: "${sessionTitle}" (from ${pendingSessionTitle ? 'pending title' : 'default'})`);

      const newSession = await createSession(sessionTitle, transcript);
      if (newSession) {
        // Clear pending title since we just used it to create the session
        setPendingSessionTitle('');
        console.log('🧹 Cleared pending title after using it for session creation');

        // CRITICAL FIX: Set localTranscript to the transcript we just saved
        // handleSelectSession will load from local session state which might not have the transcript yet
        setLocalTranscript(transcript);
        // CRITICAL FIX: Sync ref with new transcript
        localTranscriptRef.current = transcript;
        console.log(`📝 Set localTranscript to saved content (${transcript.length} chars)`);

        await selectSession(newSession.id);
      }
    }
  }, [currentSession, updateTranscript, createSession, selectSession, pendingSessionTitle, setPendingSessionTitle]);

  // Handle transcript append (for new recordings)
  const handleTranscriptAppend = useCallback((newText: string, duration?: number) => {
    if (currentSession) {
      // Pass localTranscript to ensure append uses current UI state
      appendToTranscript(currentSession.id, newText, localTranscript, duration);
    }
  }, [currentSession, appendToTranscript, localTranscript]);

  // Handle recording start - create temporary session if needed
  const handleStartRecording = useCallback(async () => {
    // VALIDATION: Enforce title requirement for new sessions
    if (!currentSession && !pendingSessionTitle.trim()) {
      console.warn('⚠️ Recording blocked: Session title is required');
      // Trigger error state
      setShowTitleError(true);
      titleInputRef.current?.focus();
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Generate new recording session ID for tracking
    const newRecordingSessionId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentRecordingSessionId(newRecordingSessionId);

    // Reset duplicate detection for new recording session
    lastProcessedContentRef.current = '';
    lastProcessedTimeRef.current = 0;

    if (!currentSession) {
      // Create new session when user starts recording

      // Only reset if no existing content to preserve user's typed/pasted text
      if (!localTranscript.trim()) {
        resetTranscript(); // Fresh start for truly empty sessions
      } else {
        // Initialize TTS hook with existing typed/pasted content
        initializeWithExistingTranscript(localTranscript);
        console.log(`🔄 Preserving existing content for new session (${localTranscript.length} chars)`);
      }
      clearTTSResult(); // Clear old transcription result

      const sessionTitle = pendingSessionTitle.trim() || 'New Recording';
      // CRITICAL FIX: Create session WITH existing typed/pasted content
      // This ensures typed text is saved to database immediately
      const initialContent = localTranscript.trim() || undefined;
      const newSession = await createSession(sessionTitle, initialContent);

      // Clear the pending title after creating the session
      setPendingSessionTitle('');
      if (newSession) {
        await selectSession(newSession.id);
      }

    } else {
      // IMPORTANT: For existing session, we need to preserve the existing content
      // Don't call resetTranscript() as it clears the TTS hook's internal state
      // This preserves user's typed/pasted content when starting recording

      clearTTSResult(); // Just clear pending results, keep existing transcript state

      // CRITICAL FIX: Save typed/pasted text to database BEFORE starting recording
      // This ensures it persists across session switches
      if (localTranscript.trim() && localTranscript !== currentSession.transcript) {
        console.log(`💾 Saving typed content to database before recording (${localTranscript.length} chars)`);
        await updateTranscript(currentSession.id, localTranscript);
      }

      // CRITICAL: Initialize TTS hook's internal state with existing content
      // The TTS hook needs to know about existing content to properly append new transcriptions
      if (localTranscript.trim()) {
        // Initialize TTS hook with existing content for proper appending
        initializeWithExistingTranscript(localTranscript);
        console.log(`🔄 Initialized recording with existing content (${localTranscript.length} chars)`);
      }
    }

    // CRITICAL FIX: Pass false to preserve transcript refs when continuing existing session
    startRecording(false);
  }, [currentSession, createSession, selectSession, startRecording, resetTranscript, initializeWithExistingTranscript, clearTTSResult, pendingSessionTitle, localTranscript]);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    clearSessionError();
    clearAIError();
    clearTTSError();
  }, [clearSessionError, clearAIError, clearTTSError]);

  // Handle session selection and close drawer
  const handleMobileSessionSelect = useCallback(async (sessionId: string) => {
    await handleSelectSession(sessionId);
    closeMobileDrawer();
  }, [handleSelectSession, closeMobileDrawer]);

  // Handle history collapse change
  const handleHistoryCollapseChange = useCallback((isCollapsed: boolean) => {
    setIsHistoryCollapsed(isCollapsed);
  }, []);

  // Current transcript is accessed directly in components

  // Using imported formatTime utility

  // Browser support is checked in GeorgianSTTAppWrapper

  return (
    <div 
      className="h-screen transcription-bg overflow-hidden relative"
      style={{
        ...containerStyle,
        '--keyboard-height': `${keyboardHeight}px`,
        '--viewport-height': `${viewportState.viewport.height}px`,
        '--safe-area-top': `${viewportState.safeAreaInsets.top}px`,
        '--safe-area-bottom': `${viewportState.safeAreaInsets.bottom}px`
      } as React.CSSProperties}
    >
      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden lg:block">
        <HeaderControls
          authStatus={authStatus}
          recordingState={recordingState}
          processing={processing}
          activeTab={activeTab}
          onOpenMobileSessions={openMobileDrawer}
          sessionsCount={sessions.length}
          canRecord={canRecord}
          canStop={canStop}
          onStartRecording={handleStartRecording}
          onStopRecording={stopRecording}
          onCreateSession={handleCreateSession}
        />
      </div>

      {/* Mobile Header - Only on Mobile */}
      <div className="lg:hidden mediscribe-mobile-header">
        <MobileHeader
          authStatus={authStatus}
          recordingState={recordingState}
          processing={processing}
          onOpenMobileSessions={openMobileDrawer}
          sessionsCount={sessions.length}
          onCreateSession={handleCreateSession}
        />
      </div>

      {/* Mobile-First Responsive Layout */}
      <div className="flex flex-col mediscribe-mobile-layout-container mediscribe-mobile-main-container lg:h-[calc(100vh-64px)]">
        
        {/* Medical Session History Drawer */}
        <MedicalDrawer
          isOpen={isMobileDrawerOpen}
          onClose={closeMobileDrawer}
          title="Medical History"
          subtitle={`${sessions.length} recordings available`}
          icon={Stethoscope}
          maxHeight="85vh"
          showHandle={true}
          enableSwipeGestures={true}
          className="lg:hidden"
        >
          <div className="space-y-4">
            {/* Simplified Header Actions */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleCreateSession()}
                className="w-full bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] hover:from-[#2b6cb0] hover:to-[#1a365d] text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Session</span>
              </button>
              
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#63b3ed]"
              />
            </div>
            
            {/* Session List */}
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '50vh' }}>
              {sessionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-[#2b6cb0]">Loading sessions...</div>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-[#90cdf4]/20 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-[#2b6cb0]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No History Yet
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 max-w-sm">
                        Create your first medical transcription session to begin capturing patient consultations.
                      </p>
                      <button
                        onClick={() => {
                          handleCreateSession();
                          closeMobileDrawer();
                        }}
                        className="bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] hover:from-[#2b6cb0] hover:to-[#1a365d] text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create First Session</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = currentSession?.id === session.id;
                  const hasTranscript = session.transcript && session.transcript.length > 0;
                  
                  return (
                    <div
                      key={session.id}
                      className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isActive
                          ? 'border-[#63b3ed] bg-[#90cdf4]/10'
                          : 'border-gray-200 hover:border-[#63b3ed]/50'
                      }`}
                      onClick={() => handleMobileSessionSelect(session.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isActive 
                              ? 'bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {editingSessionId === session.id ? (
                              <div className="flex items-center space-x-2 mb-1">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      if (editingTitle.trim()) {
                                        updateSession(editingSessionId, { title: editingTitle.trim() });
                                        setEditingSessionId('');
                                        setEditingTitle('');
                                      }
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault();
                                      setEditingSessionId('');
                                      setEditingTitle('');
                                    }
                                  }}
                                  onBlur={() => {
                                    if (editingTitle.trim()) {
                                      updateSession(editingSessionId, { title: editingTitle.trim() });
                                    }
                                    setEditingSessionId('');
                                    setEditingTitle('');
                                  }}
                                  className="flex-1 text-sm font-semibold bg-white border-2 border-[#63b3ed] rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#2b6cb0] text-[#1a365d]"
                                  maxLength={100}
                                  autoFocus
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (editingTitle.trim()) {
                                      updateSession(editingSessionId, { title: editingTitle.trim() });
                                    }
                                    setEditingSessionId('');
                                    setEditingTitle('');
                                  }}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-[#2b6cb0] text-white rounded-md hover:bg-[#1a365d] transition-colors"
                                  title="Save title"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSessionId('');
                                    setEditingTitle('');
                                  }}
                                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
                                  title="Cancel edit"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 mb-1 group/mobile-title">
                                <h3 className={`text-base font-semibold truncate flex-1 ${
                                  isActive ? 'text-[#1a365d]' : 'text-gray-900'
                                }`}>
                                  {session.title}
                                </h3>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSessionId(session.id);
                                    setEditingTitle(session.title);
                                  }}
                                  className="opacity-0 group-hover/mobile-title:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#2b6cb0] hover:text-[#1a365d] transition-all duration-200"
                                  title="Edit title"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMobileActionMenuId(mobileActionMenuId === session.id ? '' : session.id);
                                  }}
                                  className="opacity-0 group-hover/mobile-title:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#2b6cb0] hover:text-[#1a365d] transition-all duration-200"
                                  title="More actions"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-3 text-sm">
                              <span className={isActive ? 'text-[#2b6cb0]' : 'text-gray-500'}>
                                {new Date(session.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {session.durationMs > 0 && (
                                <span className={isActive ? 'text-[#2b6cb0]' : 'text-gray-500'}>
                                  {formatTime(session.durationMs)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-1">
                          {hasTranscript && (
                            <span className="bg-[#90cdf4]/20 text-[#1a365d] px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                              <Stethoscope className="w-3 h-3" />
                              <span>Transcribed</span>
                            </span>
                          )}
                          {session.processingResults && session.processingResults.length > 0 && (
                            <span className="bg-[#dbeafe] text-[#1e40af] px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                              <Brain className="w-3 h-3" />
                              <span>AI: {session.processingResults.length}</span>
                            </span>
                          )}
                          {/* Form 100 count indicator */}
                          {(() => {
                            const form100Count = session.processingResults?.filter(result =>
                              result.userInstruction?.toLowerCase().includes('form 100') ||
                              result.userInstruction?.toLowerCase().includes('emergency report') ||
                              result.model?.includes('form100')
                            ).length || 0;

                            return form100Count > 0 ? (
                              <span className="bg-[#1e40af] text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                <ClipboardList className="w-3 h-3" />
                                <span>Form 100: {form100Count}</span>
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      
                      {session.transcript && (
                        <p className={`text-sm leading-relaxed ${
                          isActive 
                            ? 'text-blue-800'
                            : 'text-gray-600'
                        }`}
                          style={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {session.transcript.length > 100 
                            ? session.transcript.substring(0, 100) + '...'
                            : session.transcript
                          }
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </MedicalDrawer>

        {/* Mobile Action Menu Dropdown */}
        {mobileActionMenuId && (
          <div
            className="fixed inset-0 bg-black/20 z-50 lg:hidden"
            onClick={() => setMobileActionMenuId('')}
          >
            <div
              className="fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1">
                <button
                  onClick={() => {
                    duplicateSession(mobileActionMenuId);
                    setMobileActionMenuId('');
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <Copy className="w-4 h-4 text-[#2b6cb0]" />
                  <span>Duplicate Session</span>
                </button>
                <button
                  onClick={() => {
                    const sessionToDelete = sessions.find(s => s.id === mobileActionMenuId);
                    if (sessionToDelete && confirm(`Delete "${sessionToDelete.title}"?`)) {
                      handleDeleteSession(mobileActionMenuId);
                    }
                    setMobileActionMenuId('');
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-3"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Session</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop: Side Panel Layout */}
        <div className="hidden lg:flex lg:flex-row h-full">
          {/* Desktop Session History Panel - Only show when not collapsed */}
          {!isHistoryCollapsed && (
            <div className="w-80 xl:w-96 flex-shrink-0 border-r border-[#90cdf4]/30">
              <div className="h-full bg-white">
                <SessionHistory
                  sessions={filteredSessions}
                  currentSession={currentSession}
                  loading={sessionLoading}
                  onCreateSession={handleCreateSession}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={handleDeleteSession}
                  onDuplicateSession={duplicateSession}
                  onUpdateSession={updateSession}
                  onSearchChange={setSearchQuery}
                  onCollapseChange={handleHistoryCollapseChange}
                />
              </div>
            </div>
          )}

          {/* Desktop Transcript Panel - Full width when history is collapsed */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="h-full transcription-card backdrop-blur-sm shadow-inner m-4 ml-0">
              <TranscriptPanel
                currentSession={currentSession}
                localTranscript={localTranscript}
                recordingState={recordingState}
                isTranscribing={isTranscribing}
                transcriptionResult={transcriptionResult}
                error={ttsError}
                isSupported={isSupported}
                canRecord={canRecord}
                canStop={canStop}
                canPause={canPause}
                textareaRef={textareaRef}
                isKeyboardAdjusted={isKeyboardAdjusted}
                canResume={canResume}
                remainingTime={remainingTime}
                isNearMaxDuration={isNearMaxDuration}
                onStartRecording={handleStartRecording}
                onStopRecording={stopRecording}
                onPauseRecording={pauseRecording}
                onResumeRecording={resumeRecording}
                onFileUpload={handleFileUpload}
                onClearError={clearTTSError}
                onClearResult={clearTTSResult}
                onUpdateTranscript={handleTranscriptUpdate}
                activeTab={activeTab}
                onActiveTabChange={setActiveTab}
                onAppendTranscript={handleTranscriptAppend}
                processing={processing}
                aiError={aiError}
                processingHistory={processingHistory}
                onProcessText={handleProcessText}
                onClearAIError={clearAIError}
                onClearHistory={clearHistory}
                onDeleteReport={handleDeleteReport}
                onAddToHistory={addToHistory}
                // Session title props
                pendingSessionTitle={pendingSessionTitle}
                onPendingTitleChange={handleTitleChange}
                onTitleSave={handleTitleSave}
                titleInputRef={titleInputRef}
                showTitleError={showTitleError}
                onTitleErrorTrigger={() => setShowTitleError(true)}
                onExpandChat={handleSetExpandChatFunction}
                // Template selection props
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
                availableTemplates={templates}
                // History controls
                isHistoryOpen={!isHistoryCollapsed}
                onToggleHistory={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
                sessionCount={sessions.length}
                // STT Model selection props
                selectedSTTModel={selectedSTTModel}
                onModelChange={updateSelectedSTTModel}
                // User ID for Form 100 generation
                userId={user?.id}
              />
            </div>
          </div>
        </div>

        {/* Mobile: Full-Screen Transcript Panel */}
        <div className="lg:hidden flex-1 flex flex-col min-h-0 relative">
          <div className="h-full transcription-card backdrop-blur-sm m-1 sm:m-4">
            <TranscriptPanel
              currentSession={currentSession}
              localTranscript={localTranscript}
              recordingState={recordingState}
              isTranscribing={isTranscribing}
              transcriptionResult={transcriptionResult}
              error={ttsError}
              isSupported={isSupported}
              canRecord={canRecord}
              canStop={canStop}
              canPause={canPause}
              textareaRef={textareaRef}
              isKeyboardAdjusted={isKeyboardAdjusted}
              canResume={canResume}
              remainingTime={remainingTime}
              isNearMaxDuration={isNearMaxDuration}
              onStartRecording={handleStartRecording}
              onStopRecording={stopRecording}
              onPauseRecording={pauseRecording}
              onResumeRecording={resumeRecording}
              onFileUpload={handleFileUpload}
              onClearError={clearTTSError}
              onClearResult={clearTTSResult}
              onUpdateTranscript={handleTranscriptUpdate}
              onAppendTranscript={handleTranscriptAppend}
              processing={processing}
              aiError={aiError}
              processingHistory={processingHistory}
              onProcessText={handleProcessText}
              onClearAIError={clearAIError}
              onClearHistory={clearHistory}
              onDeleteReport={handleDeleteReport}
              onAddToHistory={addToHistory}
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
              // Session title props
              pendingSessionTitle={pendingSessionTitle}
              onPendingTitleChange={handleTitleChange}
              onTitleSave={handleTitleSave}
              titleInputRef={titleInputRef}
              onExpandChat={handleSetExpandChatFunction}
              // Template selection props
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              availableTemplates={templates}
              // History controls - pass sessionCount but no toggle for mobile (uses drawer)
              sessionCount={sessions.length}
              // STT Model selection props
              selectedSTTModel={selectedSTTModel}
              onModelChange={updateSelectedSTTModel}
              // User ID for Form 100 generation
              userId={user?.id}
            />
          </div>
        </div>

      </div>


      {/* Enhanced Medical Security Warning */}
      {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 rounded-xl p-6 shadow-2xl shadow-amber-500/10">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#90cdf4] to-[#63b3ed] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="text-lg font-bold text-[#1a365d] dark:text-[#90cdf4]">Security Protocol Required</h3>
                <div className="px-2 py-1 bg-[#90cdf4]/20 dark:bg-[#90cdf4]/30 text-[#1a365d] dark:text-[#90cdf4] rounded-full text-xs font-semibold">
                  HIPAA
                </div>
              </div>
              <p className="text-sm text-[#2b6cb0] dark:text-[#90cdf4] leading-relaxed mb-3">
                Medical transcription requires secure HTTPS connection for patient privacy protection and microphone access.
              </p>
              <div className="flex items-center space-x-2 text-xs text-[#2b6cb0] dark:text-[#90cdf4]">
                <Activity className="w-3 h-3" />
                <span>Please ensure secure connection before proceeding</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Upload Progress Overlay */}
      <AudioUploadProgress
        isVisible={uploadState.isUploading || uploadState.isProcessing}
        stage={uploadState.processingStage}
        progress={uploadState.progress}
        currentChunk={uploadState.currentChunk}
        totalChunks={uploadState.totalChunks}
        fileName={uploadState.processingStage !== 'idle' ? 'Audio file' : undefined}
        error={uploadState.error}
        onCancel={canCancel ? cancelProcessing : undefined}
      />

      {/* Title Required Modal */}
      <TitleRequiredModal
        isOpen={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        onFocusTitle={() => {
          // Focus and highlight the title input
          titleInputRef.current?.focus();
          titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />

      {/* AI BUTTON - ONLY VISIBLE ON AI PROCESSING TAB */}
      {activeTab === 'ai' && (localTranscript || currentSession?.transcript) && (
        <button
          onClick={() => {

            // Expand the chat since we're already on AI tab
            if (expandChatFunction) {
              expandChatFunction();
            } else {

            }
          }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #63b3ed 100%)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            zIndex: 999999,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1) translateY(-2px)';
            e.target.style.boxShadow = '0 35px 60px -12px rgba(26, 54, 93, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) translateY(0px)';
            e.target.style.boxShadow = '0 25px 50px -12px rgba(26, 54, 93, 0.25)';
          }}
          title="Ask AI about this transcript"
        >
          <Brain size={28} color="white" />
        </button>
      )}
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
// No props comparison needed as component has no props
export default React.memo(GeorgianSTTApp);