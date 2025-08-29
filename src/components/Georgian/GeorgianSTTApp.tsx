import React, { useEffect, useState, useCallback } from 'react';
import { 
  WifiOff, 
  Stethoscope,
  Activity,
  Shield,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  Mic,
  Square,
  Plus,
  Search
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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(0);
  const [touchStart, setTouchStart] = useState<{ y: number; time: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);

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

  // Initialize drawer height and handle window resize
  useEffect(() => {
    const updateDrawerHeight = () => {
      const windowHeight = window.innerHeight;
      const headerHeight = 88; // Header height
      const maxDrawerHeight = windowHeight * 0.75; // 75% of screen height
      setDrawerHeight(maxDrawerHeight);
    };

    updateDrawerHeight();
    window.addEventListener('resize', updateDrawerHeight);
    return () => window.removeEventListener('resize', updateDrawerHeight);
  }, []);

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

  // Handle mobile drawer controls
  const openMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(true);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(false);
  }, []);

  // Handle drawer backdrop click
  const handleDrawerBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeMobileDrawer();
    }
  }, [closeMobileDrawer]);

  // Handle session selection and close drawer
  const handleMobileSessionSelect = useCallback(async (sessionId: string) => {
    await handleSelectSession(sessionId);
    closeMobileDrawer();
  }, [handleSelectSession, closeMobileDrawer]);

  // Touch gesture handlers for drawer
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ y: touch.clientY, time: Date.now() });
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStart.y;
    
    // Only start dragging if moved more than 10px
    if (Math.abs(deltaY) > 10 && !isDragging) {
      setIsDragging(true);
    }
    
    // If dragging down significantly, close drawer
    if (isDragging && deltaY > 100) {
      closeMobileDrawer();
      setTouchStart(null);
      setIsDragging(false);
    }
  }, [touchStart, isDragging, closeMobileDrawer]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    
    // Fast swipe down - close drawer
    if (deltaY > 50 && deltaTime < 300) {
      closeMobileDrawer();
    }
    
    setTouchStart(null);
    setIsDragging(false);
  }, [touchStart, closeMobileDrawer]);

  // Handle history collapse change
  const handleHistoryCollapseChange = useCallback((isCollapsed: boolean) => {
    setIsHistoryCollapsed(isCollapsed);
  }, []);


  // Get current transcript
  const currentTranscript = currentSession?.transcript || transcriptionResult?.text || '';

  // Format time helper for mobile display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Browser support is checked in GeorgianSTTAppWrapper

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
      {/* Enhanced Medical Professional Header */}
      <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border-b border-blue-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Enhanced Medical Branding */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    MediScribe
                  </h1>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Georgian Medical Transcription</span>
                    <div className="flex items-center space-x-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      <Shield className="w-3 h-3" />
                      <span className="text-xs font-semibold">HIPAA Secure</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Connection Status with Medical Context */}
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 ${
                authStatus.isAuthenticated
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/50'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-700/50'
              }`}>
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${
                    authStatus.isAuthenticated ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-red-500 shadow-red-500/25'
                  } shadow-lg`} />
                  {authStatus.isAuthenticated && (
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <Activity className="w-4 h-4" />
                {authStatus.isAuthenticated ? (
                  <span>Service Active</span>
                ) : (
                  <span>Connecting...</span>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Mobile-First Responsive Layout */}
      <div className="flex flex-col h-[calc(100vh-88px)] bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 dark:from-gray-900/50 dark:via-gray-800 dark:to-blue-900/10">
        
        {/* Mobile: Compact Session Header with Drawer Toggle */}
        <div className="lg:hidden">
          {currentSession ? (
            // Active session header with drawer toggle
            <div className="h-16 bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-gray-700/50">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {currentSession.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Active Session • {formatTime(recordingState.duration)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={openMobileDrawer}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Open session history"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // No active session - show sessions button
            <div className="h-16 bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-gray-700/50">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      No Active Session
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {sessions.length} sessions available
                    </p>
                  </div>
                </div>
                <button
                  onClick={openMobileDrawer}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  aria-label="View sessions"
                >
                  <FileText className="w-4 h-4" />
                  <span>Sessions</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile: Session History Drawer */}
        {isMobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleDrawerBackdropClick}
            />
            
            {/* Drawer */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out"
              style={{ maxHeight: `${drawerHeight}px` }}
            >
              {/* Drawer Handle */}
              <div 
                className="flex items-center justify-center py-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={closeMobileDrawer}
              >
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
              
              {/* Drawer Header */}
              <div className="px-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Sessions
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {sessions.length} recordings
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCreateSession}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      aria-label="Create new session"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={closeMobileDrawer}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Close drawer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Search Input */}
                <div className="mt-3 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="text-gray-400 w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: `${drawerHeight - 180}px` }}>
                <div className="p-4 space-y-3">
                  {sessionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center space-y-3">
                        <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading sessions...</p>
                      </div>
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                        <Stethoscope className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Sessions Yet
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
                        Create your first medical transcription session to begin capturing patient consultations.
                      </p>
                      <button
                        onClick={() => {
                          handleCreateSession();
                          closeMobileDrawer();
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Create First Session
                      </button>
                    </div>
                  ) : (
                    filteredSessions.map((session) => {
                      const isActive = currentSession?.id === session.id;
                      const hasTranscript = session.transcript && session.transcript.length > 0;
                      
                      return (
                        <div
                          key={session.id}
                          className={`
                            relative p-4 rounded-xl cursor-pointer transition-all duration-200 border-2
                            ${isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                            }
                          `}
                          onClick={() => handleMobileSessionSelect(session.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isActive 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                              }`}>
                                <FileText className="w-5 h-5" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-base font-semibold truncate mb-1 ${
                                  isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                                }`}>
                                  {session.title}
                                </h3>
                                
                                <div className="flex items-center space-x-3 text-sm">
                                  <span className={isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}>
                                    {new Date(session.createdAt).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {session.durationMs > 0 && (
                                    <span className={isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}>
                                      {formatTime(session.durationMs)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {hasTranscript && (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isActive 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              }`}>
                                Transcribed
                              </div>
                            )}
                          </div>
                          
                          {session.transcript && (
                            <div className={`text-sm leading-relaxed line-clamp-2 ${
                              isActive 
                                ? 'text-blue-800 dark:text-blue-200'
                                : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {session.transcript.length > 100 
                                ? session.transcript.substring(0, 100) + '...'
                                : session.transcript
                              }
                            </div>
                          )}
                          
                          {isActive && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-r-full" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Mobile: Full-Screen Transcript Panel */}
        <div className="lg:hidden flex-1 flex flex-col min-h-0">
          <div className="h-full bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm">
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

        {/* Mobile: Floating Action Button for Recording */}
        <div className="lg:hidden">
          {!recordingState.isRecording && (
            <div className="fixed bottom-20 right-4 z-50">
              <button
                onClick={canRecord ? handleStartRecording : undefined}
                disabled={!canRecord}
                className={`
                  w-16 h-16 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center
                  ${canRecord 
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-green-500/25' 
                    : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none'
                  }
                `}
              >
                <Mic className="w-8 h-8" />
              </button>
            </div>
          )}
          
          {recordingState.isRecording && (
            <div className="fixed bottom-20 right-4 z-50">
              <button
                onClick={canStop ? stopRecording : undefined}
                disabled={!canStop}
                className="w-16 h-16 rounded-full shadow-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/25 transform transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center animate-pulse"
              >
                <Square className="w-8 h-8" />
              </button>
            </div>
          )}
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