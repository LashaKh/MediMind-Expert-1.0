import React, { useEffect, useState, useCallback } from 'react';
import { 
  AlertTriangle, 
  WifiOff, 
  Stethoscope,
  Activity,
  Shield,
  X
} from 'lucide-react';
import { SessionHistory } from './SessionHistory';
import { TranscriptPanel } from './TranscriptPanel';
import { useSessionManagement } from '../../hooks/useSessionManagement';
import { useAIProcessing } from '../../hooks/useAIProcessing';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';
import { useAuth } from '../../stores/useAppStore';

export const GeorgianSTTApp: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);

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
    searchSessions
  } = useSessionManagement();

  // AI Processing
  const {
    processing,
    error: aiError,
    lastResult,
    processingHistory,
    processText,
    clearError: clearAIError,
    clearHistory
  } = useAIProcessing();

  // Georgian TTS
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
    canRecord,
    canStop,
    canPause,
    canResume,
    remainingTime,
    isNearMaxDuration
  } = useGeorgianTTS({
    language: 'ka-GE',
    autocorrect: true,
    punctuation: true,
    digits: true,
    maxDuration: 25000
  });

  // Filter sessions based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredSessions(searchSessions(searchQuery));
    } else {
      setFilteredSessions(sessions);
    }
  }, [sessions, searchQuery, searchSessions]);

  // Don't auto-create sessions - only create when user starts recording or uploads

  // Handle transcription result and save to current session
  useEffect(() => {
    if (transcriptionResult && currentSession) {
      appendToTranscript(
        currentSession.id,
        transcriptionResult.text,
        transcriptionResult.duration
      );
      clearTTSResult();
    }
  }, [transcriptionResult, currentSession, appendToTranscript, clearTTSResult]);

  // Handle session creation
  const handleCreateSession = useCallback(async (title?: string) => {
    const newSession = await createSession(title);
    if (newSession) {
      selectSession(newSession.id);
    }
  }, [createSession, selectSession]);

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

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!currentSession) {
      // Create new session for file upload
      const newSession = await createSession(`File: ${file.name}`);
      if (newSession) {
        selectSession(newSession.id);
      }
    }
    await processFileUpload(file);
  }, [currentSession, createSession, selectSession, processFileUpload]);

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
      // Create new session when user starts recording
      const newSession = await createSession('New Recording');
      if (newSession) {
        selectSession(newSession.id);
      }
    }
    // Start the actual recording
    startRecording();
  }, [currentSession, createSession, selectSession, startRecording]);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    clearSessionError();
    clearAIError();
    clearTTSError();
  }, [clearSessionError, clearAIError, clearTTSError]);

  // Get current transcript
  const currentTranscript = currentSession?.transcript || transcriptionResult?.text || '';

  // Check for browser support
  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Browser Not Supported
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Clean Professional Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Clean Professional Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    MediScribe
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Georgian Medical Transcription</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="text-green-600 dark:text-green-400 font-medium">HIPAA Secure</span>
                  </div>
                </div>
              </div>
              
              {/* Clean Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                authStatus.isAuthenticated
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  authStatus.isAuthenticated ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {authStatus.isAuthenticated ? (
                  <span>Connected</span>
                ) : (
                  <span>Offline</span>
                )}
              </div>
            </div>

            {/* Clean User Profile */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.email?.split('@')[0] || 'Medical Professional'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Physician</p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user.email?.charAt(0).toUpperCase() || 'M'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900">
        {/* Left Panel - Session History */}
        <div className="w-full lg:w-80 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
          <div className="h-64 lg:h-full bg-white dark:bg-gray-800">
            <SessionHistory
              sessions={filteredSessions}
              currentSession={currentSession}
              loading={sessionLoading}
              onCreateSession={handleCreateSession}
              onSelectSession={selectSession}
              onDeleteSession={handleDeleteSession}
              onDuplicateSession={duplicateSession}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Main Panel - Tabbed Interface with Transcript, Context, and AI Processing */}
        <div className="flex-1 flex flex-col">
          <div className="h-96 lg:h-full bg-white dark:bg-gray-800">
            <TranscriptPanel
              currentSession={currentSession}
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
            />
          </div>
        </div>
      </div>

      {/* Clean Error Display */}
      {(sessionError && !ttsError && !aiError) && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <button
                  onClick={clearAllErrors}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {sessionError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clean HTTPS Security Warning */}
      {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">HTTPS Required</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Medical transcription requires secure HTTPS connection for patient privacy and microphone access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};