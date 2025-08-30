import React, { useEffect, useState, useCallback } from 'react';
import { 
  Stethoscope,
  Activity,
  Shield,
  X,
  AlertTriangle,
  ChevronRight,
  FileText,
  Plus,
  Search
} from 'lucide-react';
import { MedicalButton, MedicalCard, MedicalInput, MedicalLoading, MedicalBadge } from '../ui/MedicalDesignSystem';
import { MedicalDrawer } from '../ui/MedicalDrawer';
import '../../styles/medical-design-tokens.css';
import { SessionHistory } from './SessionHistory';
import { TranscriptPanel } from './TranscriptPanel';
import { useSessionManagement, GeorgianSession } from '../../hooks/useSessionManagement';
import { useAIProcessing } from '../../hooks/useAIProcessing';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';
import { useAuth } from '../../stores/useAppStore';

// Import extracted components
import { HeaderControls } from './components/HeaderControls';
import { MobileSessionHeader } from './components/MobileSessionHeader';
import { formatTime } from './utils/transcriptUtils';

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
  
  // Local transcript state - single source of truth for UI display
  const [localTranscript, setLocalTranscript] = useState('');
  
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
    searchSessions
  } = useSessionManagement();
  
  // Session-aware transcript updates - prevents cross-session contamination
  const handleLiveTranscriptUpdate = useCallback((newText: string, fullText: string, sessionId?: string) => {
    // OPTIMISTIC UI: Update local state immediately for instant feedback
    if (newText.trim()) {
      // Update local transcript immediately (optimistic UI)
      setLocalTranscript(prev => {
        const separator = prev ? '\n\n' : '';
        return prev + separator + newText.trim();
      });
      
      // Save to database in background (if sessionId available)
      if (sessionId) {
        appendToTranscript(sessionId, newText.trim()).catch(error => {
          console.warn('Failed to save transcript to database:', error);
          // Keep local state - user still sees the transcript
        });
      }
    }
  }, [appendToTranscript]);

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
    // service // Currently unused
  } = useGeorgianTTS({
    language: 'ka-GE',
    autocorrect: true,
    punctuation: true,
    digits: true,
    maxDuration: 0, // No limit - use chunked processing
    chunkDuration: 12000, // 12 second chunks for processing
    sessionId: currentSession?.id, // Pass current session ID for isolation
    onLiveTranscriptUpdate: handleLiveTranscriptUpdate
  });

  // AI Processing
  const {
    processing,
    error: aiError,
    // lastResult, // Currently unused
    processingHistory,
    processText,
    clearError: clearAIError,
    clearHistory
  } = useAIProcessing();

  // Filter sessions based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredSessions(searchSessions(searchQuery));
    } else {
      setFilteredSessions(sessions);
    }
  }, [sessions, searchQuery, searchSessions]);


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

  // Handle session creation with cleanup
  const handleCreateSession = useCallback(async (title?: string) => {
    // Stop any ongoing recording and clear TTS state
    if (recordingState.isRecording) {
      stopRecording();
    }
    
    // Clear ALL TTS state and local transcript for fresh start
    resetTranscript();
    clearTTSResult();
    setLocalTranscript('');
    
    // Create new session
    const newSession = await createSession(title);
    if (newSession) {
      selectSession(newSession.id);
    }
  }, [createSession, selectSession, resetTranscript, clearTTSResult, recordingState.isRecording, stopRecording]);

  // Handle session deletion with confirmation
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session && window.confirm(`Are you sure you want to delete "${session.title}"?`)) {
      await deleteSession(sessionId);
    }
  }, [sessions, deleteSession]);

  // Handle AI text processing
  const handleProcessText = useCallback(async (instruction: string) => {
    const transcript = currentSession?.transcript || transcriptionResult?.text || '';
    if (!transcript.trim()) return;

    const result = await processText(transcript, instruction);
    if (result && currentSession) {
      // Save processing result to session
      await addProcessingResult(currentSession.id, {
        userInstruction: instruction,
        aiResponse: result.result,
        model: result.model,
        tokensUsed: result.tokensUsed,
        processingTime: result.processingTime
      });
    }
  }, [currentSession, transcriptionResult, processText, addProcessingResult]);

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
      
      // Load session transcript into local state immediately
      const sessionTranscript = selectedSession.transcript || '';
      setLocalTranscript(sessionTranscript);
      
      // Switch session
      selectSession(sessionId);
    }
  }, [sessions, resetTranscript, clearTTSResult, selectSession, recordingState.isRecording, stopRecording]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!currentSession) {
      // Create new session for file upload
      const newSession = await createSession(`File: ${file.name}`);
      if (newSession) {
        resetTranscript(); // Reset transcript for new session
        clearTTSResult(); // Clear old transcription result
        selectSession(newSession.id);
      }
    }
    await processFileUpload(file);
  }, [currentSession, createSession, selectSession, processFileUpload, resetTranscript, clearTTSResult]);

  // Handle transcript update (for editing existing transcript)
  const handleTranscriptUpdate = useCallback((transcript: string, duration?: number) => {
    if (currentSession) {
      updateTranscript(currentSession.id, transcript, duration);
    }
  }, [currentSession, updateTranscript]);

  // Handle transcript append (for new recordings)
  const handleTranscriptAppend = useCallback((newText: string, duration?: number) => {
    if (currentSession) {
      appendToTranscript(currentSession.id, newText, duration);
    }
  }, [currentSession, appendToTranscript]);

  // Handle recording start - create session if needed
  const handleStartRecording = useCallback(async () => {
    if (!currentSession) {
      // Create new session when user starts recording - clear local state for fresh start
      setLocalTranscript(''); // Clear local transcript for new session
      resetTranscript(); // Reset TTS hook state
      clearTTSResult(); // Clear old transcription result
      
      const newSession = await createSession('New Recording');
      if (newSession) {
        selectSession(newSession.id);
      } else {
        console.error('❌ Failed to create session for recording');
        return; // Don't start recording without a session
      }
    } else {
      // Only clear TTS result for clean processing, keep local transcript intact
      clearTTSResult();
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
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
      {/* Enhanced Medical Professional Header */}
      <HeaderControls 
        authStatus={authStatus}
        recordingState={recordingState}
        processing={processing}
        activeTab={activeTab}
      />

      {/* Mobile-First Responsive Layout */}
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 dark:from-gray-900/50 dark:via-gray-800 dark:to-blue-900/10">
        
        {/* Mobile: Compact Session Header with Drawer Toggle */}
        <MobileSessionHeader
          currentSession={currentSession}
          sessions={sessions}
          recordingDuration={recordingState.duration}
          onOpenDrawer={openMobileDrawer}
          formatTime={formatTime}
        />

        {/* Medical Session History Drawer */}
        <MedicalDrawer
          isOpen={isMobileDrawerOpen}
          onClose={closeMobileDrawer}
          title="Medical Sessions"
          subtitle={`${sessions.length} recordings available`}
          icon={Stethoscope}
          maxHeight={75}
          showHandle={true}
          enableSwipeGestures={true}
          className="lg:hidden"
        >
          <div className="p-4 space-y-4">
            {/* Medical Drawer Header Actions */}
            <div className="flex items-center justify-between mb-4">
              <MedicalButton
                onClick={handleCreateSession}
                variant="primary"
                size="md"
                leftIcon={Plus}
                className="flex-1 mr-2"
              >
                New Session
              </MedicalButton>
              
              {/* Medical Search Input */}
              <div className="flex-1 ml-2">
                <MedicalInput
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={Search}
                  size="md"
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Session List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <MedicalLoading
                    size="lg"
                    variant="medical"
                    text="Loading sessions..."
                  />
                </div>
              ) : filteredSessions.length === 0 ? (
                <MedicalCard className="p-6 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-medical-blue-100 dark:bg-medical-blue-900/30 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-medical-blue-600 dark:text-medical-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-medical-gray-900 dark:text-medical-gray-100 mb-2">
                        No Sessions Yet
                      </h3>
                      <p className="text-sm text-medical-gray-600 dark:text-medical-gray-400 mb-4 max-w-sm">
                        Create your first medical transcription session to begin capturing patient consultations.
                      </p>
                      <MedicalButton
                        onClick={() => {
                          handleCreateSession();
                          closeMobileDrawer();
                        }}
                        variant="primary"
                        size="lg"
                        leftIcon={Plus}
                      >
                        Create First Session
                      </MedicalButton>
                    </div>
                  </div>
                </MedicalCard>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = currentSession?.id === session.id;
                  const hasTranscript = session.transcript && session.transcript.length > 0;
                  
                  return (
                    <MedicalCard
                      key={session.id}
                      variant={isActive ? "elevated" : "interactive"}
                      className={`cursor-pointer transition-all duration-200 ${
                        isActive
                          ? 'border-medical-blue-500 bg-medical-blue-50 dark:bg-medical-blue-900/20'
                          : 'hover:border-medical-blue-300 dark:hover:border-medical-blue-600'
                      }`}
                      onClick={() => handleMobileSessionSelect(session.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                            isActive 
                              ? 'bg-medical-blue-600 text-white' 
                              : 'bg-medical-gray-100 dark:bg-medical-gray-600 text-medical-gray-500 dark:text-medical-gray-400'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-semibold truncate mb-1 ${
                              isActive ? 'text-medical-blue-900 dark:text-medical-blue-100' : 'text-medical-gray-900 dark:text-medical-gray-100'
                            }`}>
                              {session.title}
                            </h3>
                            
                            <div className="flex items-center space-x-3 text-sm">
                              <span className={isActive ? 'text-medical-blue-600 dark:text-medical-blue-300' : 'text-medical-gray-500 dark:text-medical-gray-400'}>
                                {new Date(session.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {session.durationMs > 0 && (
                                <span className={isActive ? 'text-medical-blue-600 dark:text-medical-blue-300' : 'text-medical-gray-500 dark:text-medical-gray-400'}>
                                  {formatTime(session.durationMs)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {hasTranscript && (
                          <MedicalBadge 
                            variant="success" 
                            className="text-xs"
                          >
                            Transcribed
                          </MedicalBadge>
                        )}
                      </div>
                      
                      {session.transcript && (
                        <p className={`text-sm leading-relaxed line-clamp-2 ${
                          isActive 
                            ? 'text-medical-blue-800 dark:text-medical-blue-200'
                            : 'text-medical-gray-600 dark:text-medical-gray-300'
                        }`}>
                          {session.transcript.length > 100 
                            ? session.transcript.substring(0, 100) + '...'
                            : session.transcript
                          }
                        </p>
                      )}
                      
                      {isActive && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-medical-blue-600 rounded-r-full" />
                      )}
                    </MedicalCard>
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
            <div className="w-80 xl:w-96 flex-shrink-0 border-r border-blue-200/30 dark:border-gray-700/50">
              <div className="h-full bg-white/70 dark:bg-gray-800/80 backdrop-blur-sm">
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

          {/* Desktop Transcript Panel */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Collapsed History Toggle - Show when history is collapsed */}
            {isHistoryCollapsed && (
              <div className="hidden lg:flex items-center justify-start p-4 bg-white/70 dark:bg-gray-800/80 backdrop-blur-sm border-b border-blue-200/30 dark:border-gray-700/50">
                <button
                  onClick={() => setIsHistoryCollapsed(false)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                  title="Show sessions"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>Sessions ({sessions.length})</span>
                </button>
              </div>
            )}
            <div className="h-full bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm shadow-inner">
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
              />
            </div>
          </div>
        </div>

        {/* Mobile: Full-Screen Transcript Panel */}
        <div className="lg:hidden flex-1 flex flex-col min-h-0">
          <div className="h-full bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm">
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
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
            />
          </div>
        </div>

      </div>

      {/* Enhanced Medical Error Display */}
      {(sessionError && !ttsError && !aiError) && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 rounded-xl p-5 shadow-2xl shadow-red-500/10">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-red-800 dark:text-red-200">System Alert</h3>
                <button
                  onClick={clearAllErrors}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                {sessionError}
              </p>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};