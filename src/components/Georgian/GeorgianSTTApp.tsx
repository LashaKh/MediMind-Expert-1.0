import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Stethoscope,
  Activity,
  Shield,
  X,
  AlertTriangle,
  ChevronRight,
  FileText,
  Plus,
  Search,
  Mic,
  Square,
  Brain
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
import { isDiagnosisTemplate, extractDiagnosisFromInstruction, generateDiagnosisReport } from '../../services/diagnosisFlowiseService';
import { supabase } from '../../lib/supabase';

// Import extracted components
import { HeaderControls } from './components/HeaderControls';
import { MobileSessionHeader } from './components/MobileSessionHeader';
import { AudioUploadProgress } from './components/AudioUploadProgress';
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
  useAuth(); // Authentication hook
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<GeorgianSession[]>([]);
  // Mobile drawer state management
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  // Active tab state for header recording controls
  const [activeTab, setActiveTab] = useState<'transcript' | 'context' | 'ai'>('transcript');
  const openMobileDrawer = () => setIsMobileDrawerOpen(true);
  const closeMobileDrawer = () => setIsMobileDrawerOpen(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  
  // Speaker diarization state
  const [enableSpeakerDiarization, setEnableSpeakerDiarization] = useState(false);
  const [speakerCount, setSpeakerCount] = useState(2);

  // Store the expand chat function from AIProcessingContent
  const [expandChatFunction, setExpandChatFunction] = useState<(() => void) | null>(null);

  // Debug when expand function is set
  const handleSetExpandChatFunction = useCallback((fn: () => void) => {

    setExpandChatFunction(() => fn);
  }, []);
  
  // Debug speaker diarization state changes
  useEffect(() => {

  }, [enableSpeakerDiarization, speakerCount]);
  
  // Local transcript state - single source of truth for UI display
  const [localTranscript, setLocalTranscript] = useState('');
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
    // updateSession, // Currently unused
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
  
  // Session-aware transcript updates - prevents cross-session contamination
  const lastProcessedContentRef = useRef<string>('');
  const lastProcessedTimeRef = useRef<number>(0);
  
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
      setLocalTranscript(prev => {
        const separator = prev ? '\n\n' : '';
        return prev + separator + newText.trim();
      });
      
      // Save to database in background - prioritize current recording session
      // Use sessionId parameter (from useGeorgianTTS hook) if available, fallback to currentSession
      const targetSessionId = sessionId || currentSession?.id;
      
      if (targetSessionId) {
        // Use the session ID from the recording or current selection
        console.log(`💾 Saving to session: ${targetSessionId} (from ${sessionId ? 'recording' : 'current'})`);
        
        appendToTranscript(targetSessionId, newText.trim()).catch(error => {
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
            appendToTranscript(newSession.id, newText.trim());
          }, 100);
        } catch (error) {
          console.error(`❌ Failed to select new session ${newSession.id}:`, error);
          
          // Fallback: still try to append
          setTimeout(() => {
            appendToTranscript(newSession.id, newText.trim());
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
    clearHistory,
    addToHistory,
    deleteFromHistory,
    setProcessing
  } = useAIProcessing({
    sessionProcessingResults: currentSession?.processingResults
  });
  
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

    // Use directTranscript first (passed from UI), then fallback to other sources
    const transcript = directTranscript || localTranscript || currentSession?.transcript || transcriptionResult?.text || '';
    
    // Debug transcript source (disabled in production)
    
    if (!transcript.trim()) {

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
        
        // Manually manage processing state for diagnosis service
        // We can't use the regular processText as it goes to a different endpoint

        setProcessing(true);
        
        try {
          console.log('🚀 Starting diagnosis report generation...');
          const startTime = Date.now();
          const diagnosisResult = await generateDiagnosisReport(transcript, diagnosisInfo);
          const processingTime = Date.now() - startTime;
          
          console.log('✅ Diagnosis report completed:', {
            success: diagnosisResult.success,
            processingTime,
            reportLength: diagnosisResult.success ? diagnosisResult.report?.length : 0
          });

          if (diagnosisResult.success && currentSession) {
            // Save diagnosis result to session with special metadata
            const processingResultData = {
              userInstruction: instruction,
              aiResponse: diagnosisResult.report,
              model: 'flowise-diagnosis-agent',
              tokensUsed: Math.floor(diagnosisResult.report.length / 4), // Estimate tokens
              processingTime
            };
            
            const saveSuccess = await addProcessingResult(currentSession.id, processingResultData);
            console.log('💾 Session save result:', { saveSuccess, sessionId: currentSession.id });
            
            if (saveSuccess) {
              // Also add to the AI processing history for immediate UI update
              console.log('📈 Adding diagnosis to UI history...');
              addToHistory(
                processingResultData.userInstruction,
                processingResultData.aiResponse,
                processingResultData.model,
                processingResultData.tokensUsed,
                processingResultData.processingTime
              );
              console.log('✅ Diagnosis added to UI history');
            } else {
              console.error('❌ Failed to save diagnosis to session - not adding to UI history');
              // Still add to UI history even if session save failed
              console.log('📈 Adding diagnosis to UI history anyway...');
              addToHistory(
                processingResultData.userInstruction,
                processingResultData.aiResponse,
                processingResultData.model,
                processingResultData.tokensUsed,
                processingResultData.processingTime
              );
            }
          } else {

            // Fall back to regular processing if diagnosis service fails
            const result = await processText(transcript, instruction);
            if (result && currentSession) {
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
            }
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
  }, [currentSession, transcriptionResult, localTranscript, processText, addProcessingResult, createSession, setProcessing]);

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
      
      // Switch session (now async - will refresh with latest data from database)
      await selectSession(sessionId);
    }
  }, [sessions, resetTranscript, clearTTSResult, selectSession, recordingState.isRecording, stopRecording]);

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

  // Handle transcript update (for editing existing transcript)
  const handleTranscriptUpdate = useCallback(async (transcript: string, duration?: number) => {
    if (currentSession) {
      updateTranscript(currentSession.id, transcript, duration);
    } else if (transcript.trim()) {
      // Create a new session when user starts typing and no session exists
      const newSession = await createSession('Manual Entry', transcript);
      if (newSession) {
        await selectSession(newSession.id);
      }
    }
  }, [currentSession, updateTranscript, createSession, selectSession]);

  // Handle transcript append (for new recordings)
  const handleTranscriptAppend = useCallback((newText: string, duration?: number) => {
    if (currentSession) {
      appendToTranscript(currentSession.id, newText, duration);
    }
  }, [currentSession, appendToTranscript]);

  // Handle recording start - create temporary session if needed
  const handleStartRecording = useCallback(async () => {

    // Generate new recording session ID for tracking
    const newRecordingSessionId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentRecordingSessionId(newRecordingSessionId);
    
    // Reset duplicate detection for new recording session
    lastProcessedContentRef.current = '';
    lastProcessedTimeRef.current = 0;

    if (!currentSession) {
      // Create new session when user starts recording - clear local state for fresh start

      setLocalTranscript(''); // Clear local transcript for new session
      resetTranscript(); // Reset TTS hook state for new session
      clearTTSResult(); // Clear old transcription result
      
      const newSession = await createSession('New Recording');
      if (newSession) {
        await selectSession(newSession.id);
      }

    } else {
      // IMPORTANT: For existing session, we need to preserve the existing content
      // Don't call resetTranscript() as it clears the TTS hook's internal state
      // This preserves user's typed/pasted content when starting recording

      clearTTSResult(); // Just clear pending results, keep existing transcript state
      
      // CRITICAL: Initialize TTS hook's internal state with existing content
      // The TTS hook needs to know about existing content to properly append new transcriptions
      if (localTranscript.trim()) {

        // TODO: Add a way to initialize TTS hook with existing content
        // For now, we'll rely on the live update system to handle this
      }
    }

    startRecording();
  }, [currentSession, createSession, selectSession, startRecording, resetTranscript, clearTTSResult]);

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
    <div className="h-screen transcription-bg overflow-hidden">
      {/* Enhanced Medical Professional Header */}
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
        selectedSTTModel={selectedSTTModel}
        onModelChange={updateSelectedSTTModel}
      />

      {/* Mobile-First Responsive Layout */}
      <div className="flex flex-col h-[calc(100vh-64px)]">
        
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
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Session</span>
              </button>
              
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Session List */}
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '50vh' }}>
              {sessionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-blue-500">Loading sessions...</div>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-blue-600" />
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
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center space-x-2"
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
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleMobileSessionSelect(session.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isActive 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-semibold truncate mb-1 ${
                              isActive ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {session.title}
                            </h3>
                            
                            <div className="flex items-center space-x-3 text-sm">
                              <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                                {new Date(session.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {session.durationMs > 0 && (
                                <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                                  {formatTime(session.durationMs)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {hasTranscript && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            Transcribed
                          </span>
                        )}
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

        {/* Desktop: Side Panel Layout */}
        <div className="hidden lg:flex lg:flex-row h-full">
          {/* Desktop Session History Panel - Only show when not collapsed */}
          {!isHistoryCollapsed && (
            <div className="w-80 xl:w-96 flex-shrink-0 border-r border-white/20">
              <div className="h-full transcription-card-glass backdrop-blur-sm">
                <SessionHistory
                  sessions={filteredSessions}
                  currentSession={currentSession}
                  loading={sessionLoading}
                  onCreateSession={handleCreateSession}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={handleDeleteSession}
                  onDuplicateSession={duplicateSession}
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
                enableSpeakerDiarization={enableSpeakerDiarization}
                onToggleSpeakerDiarization={setEnableSpeakerDiarization}
                speakerCount={speakerCount}
                onSpeakerCountChange={setSpeakerCount}
                // Speaker diarization results from hook
                hasSpeakers={hasSpeakerResults}
                // STT Model selection props
                selectedSTTModel={selectedSTTModel}
                onModelChange={updateSelectedSTTModel}
                speakers={speakerSegments}
                onExpandChat={handleSetExpandChatFunction}
                // History controls
                isHistoryOpen={!isHistoryCollapsed}
                onToggleHistory={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
                sessionCount={sessions.length}
              />
            </div>
          </div>
        </div>

        {/* Mobile: Full-Screen Transcript Panel */}
        <div className="lg:hidden flex-1 flex flex-col min-h-0 relative">
          <div className="h-full transcription-card backdrop-blur-sm m-4">
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
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
              enableSpeakerDiarization={enableSpeakerDiarization}
              onToggleSpeakerDiarization={setEnableSpeakerDiarization}
              speakerCount={speakerCount}
              onSpeakerCountChange={setSpeakerCount}
              // Speaker diarization results from hook
              hasSpeakers={hasSpeakerResults}
              speakers={speakerSegments}
              // STT Model selection props
              selectedSTTModel={selectedSTTModel}
              onModelChange={updateSelectedSTTModel}
              onExpandChat={handleSetExpandChatFunction}
              // History controls - pass sessionCount but no toggle for mobile (uses drawer)
              sessionCount={sessions.length}
            />
          </div>
        </div>

      </div>


      {/* Enhanced Medical Security Warning */}
      {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 rounded-xl p-6 shadow-2xl shadow-amber-500/10">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200">Security Protocol Required</h3>
                <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                  HIPAA
                </div>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed mb-3">
                Medical transcription requires secure HTTPS connection for patient privacy protection and microphone access.
              </p>
              <div className="flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
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
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)',
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
            e.target.style.boxShadow = '0 35px 60px -12px rgba(0, 0, 0, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) translateY(0px)';
            e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
          }}
          title="Ask AI about this transcript"
        >
          <Brain size={28} color="white" />
        </button>
      )}
    </div>
  );
};