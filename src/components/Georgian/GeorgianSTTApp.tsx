import React, { useEffect, useState, useCallback } from 'react';
import { 
  WifiOff, 
  Stethoscope,
  Activity,
  Shield,
  X,
  AlertTriangle
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
  
  // Session-aware transcript updates - prevents cross-session contamination
  const handleLiveTranscriptUpdate = useCallback((newText: string, fullText: string, sessionId?: string) => {
    // ROBUST VALIDATION: Only update if session IDs match exactly
    if (currentSession && newText.trim() && sessionId === currentSession.id) {
      console.log(`✅ Session-validated update for ${currentSession.id}: "${newText.trim().substring(0, 30)}..."`);
      appendToTranscript(currentSession.id, newText.trim());
    } else if (sessionId && sessionId !== currentSession?.id) {
      console.log(`🚫 BLOCKED cross-session contamination: chunk from ${sessionId} blocked from reaching ${currentSession?.id}`);
    } else if (!currentSession) {
      console.log(`⚠️ No active session - ignoring transcript chunk`);
    }
  }, [currentSession, appendToTranscript]);

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
    service
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
    lastResult,
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

  // Handle final transcription result (when not using live updates)
  useEffect(() => {
    if (transcriptionResult && currentSession && !recordingState.isRecording) {
      // Only update transcript if not currently recording (to avoid conflicts with live updates)
      const currentTranscript = currentSession.transcript || '';
      
      // FIXED: Don't overwrite - only append new text that isn't already in session
      if (transcriptionResult.text.length > currentTranscript.length && 
          transcriptionResult.text.startsWith(currentTranscript)) {
        // Extract only the new text that was added
        const newText = transcriptionResult.text.substring(currentTranscript.length).trim();
        if (newText) {
          console.log(`📝 Appending final segment: "${newText.substring(0, 50)}..."`);
          appendToTranscript(currentSession.id, newText);
        }
      } else if (!currentTranscript && transcriptionResult.text.trim()) {
        // First transcription - set the initial text
        console.log(`📝 Setting initial transcript: "${transcriptionResult.text.substring(0, 50)}..."`);
        updateTranscript(currentSession.id, transcriptionResult.text, transcriptionResult.duration);
      }
      clearTTSResult();
    }
  }, [transcriptionResult, currentSession, recordingState.isRecording, updateTranscript, appendToTranscript, clearTTSResult]);

  // Handle session creation with robust cleanup
  const handleCreateSession = useCallback(async (title?: string) => {
    console.log('🔄 Creating new session - initiating complete cleanup...');
    
    // STEP 1: Stop any ongoing recording and clear TTS state
    if (recordingState.isRecording) {
      console.log('🛑 Stopping active recording before session change');
      stopRecording();
    }
    
    // STEP 2: Clear ALL TTS state (this cancels background processing)
    resetTranscript(); // Reset transcript internal state
    clearTTSResult(); // Clear transcription results
    
    // STEP 3: Create new session
    const newSession = await createSession(title);
    if (newSession) {
      console.log(`✨ New session created: ${newSession.id}`);
      selectSession(newSession.id);
      
      // STEP 4: Ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('🎯 Session isolation complete - ready for recording');
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

  // Handle session selection with robust cleanup
  const handleSelectSession = useCallback(async (sessionId: string) => {
    const selectedSession = sessions.find(s => s.id === sessionId);
    if (selectedSession) {
      console.log(`🔄 Switching to session ${sessionId} - initiating cleanup...`);
      
      // STEP 1: Stop any ongoing recording
      if (recordingState.isRecording) {
        console.log('🛑 Stopping active recording before session switch');
        stopRecording();
      }
      
      // STEP 2: Clear ALL TTS state (cancels background processing)
      resetTranscript();
      clearTTSResult();
      
      // STEP 3: Switch session
      selectSession(sessionId);
      
      // STEP 4: Ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log(`🎯 Switched to session ${sessionId} - isolation complete`);
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
    // ALWAYS clear TTS state first, before creating session
    resetTranscript(); // Reset transcript state first
    clearTTSResult(); // Clear old transcription result first
    
    if (!currentSession) {
      // Create new session when user starts recording
      const newSession = await createSession('New Recording');
      if (newSession) {
        selectSession(newSession.id);
      }
    }
    
    // Small delay to ensure state is clean before starting
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Start the actual recording
    startRecording();
  }, [currentSession, createSession, selectSession, startRecording, resetTranscript, clearTTSResult]);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    clearSessionError();
    clearAIError();
    clearTTSError();
  }, [clearSessionError, clearAIError, clearTTSError]);

  // Test function: Send parallel requests to test server behavior
  const testParallelRequests = useCallback(async () => {
    // Get the current service reference directly from the hook return
    const currentService = service;
    
    if (!currentService) {
      console.error('❌ Georgian TTS service not available. Please wait for the app to fully load and try again.');
      alert('Georgian TTS service is not yet initialized. Please wait a moment and try again.');
      return;
    }
    
    console.log('✅ Georgian TTS service available, starting parallel test...');
    console.log('🎙️ Please speak for 3 seconds when prompted...');

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        }
      });

      console.log('🎙️ Recording audio for parallel test... Speak now!');
      
      // Create MediaRecorder for real audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop the microphone stream
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunks.length > 0) {
          const testBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
          console.log(`🧪 Running parallel request test with recorded audio (${Math.round(testBlob.size/1024)}KB)...`);
          await currentService.testParallelRequests(testBlob);
        } else {
          console.error('❌ No audio recorded, cannot run test');
        }
      };

      // Start recording
      mediaRecorder.start();
      
      // Stop recording after 3 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          console.log('🛑 Stopping recording, processing audio...');
          mediaRecorder.stop();
        }
      }, 3000);

    } catch (error) {
      console.error('❌ Failed to access microphone for test:', error);
      alert('Microphone access required for parallel test. Please allow microphone permission and try again.');
    }
  }, [service]); // Include service so callback updates when service becomes available

  // Get current transcript
  const currentTranscript = currentSession?.transcript || transcriptionResult?.text || '';

  // Browser support is checked in GeorgianSTTAppWrapper

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

              {/* Parallel Test Button (Development) */}
              <button
                onClick={testParallelRequests}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                title="Test: Send two parallel requests to check if issue is sequential vs capacity"
              >
                <span>🧪 Test</span>
              </button>
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
              onSelectSession={handleSelectSession}
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