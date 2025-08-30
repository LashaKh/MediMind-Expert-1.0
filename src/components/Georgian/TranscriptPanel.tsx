import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MediScribeAnimations.css';
import { GeorgianSession } from '../../hooks/useSessionManagement';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';

// Import extracted components
import { TabNavigation } from './components/TabNavigation';
import { TranscriptContent } from './components/TranscriptContent';
import { ContextContent } from './components/ContextContent';
import { AIProcessingContent } from './components/AIProcessingContent';
import { RecordingStatusIndicator } from './components/RecordingStatusIndicator';

// Import utilities
import { formatTime, copyToClipboard, downloadTranscription } from './utils/transcriptUtils';

interface ProcessingHistory {
  userInstruction: string;
  aiResponse: string;
  model: string;
  tokensUsed?: number;
  processingTime: number;
  timestamp: number;
}

interface TranscriptPanelProps {
  currentSession: GeorgianSession | null;
  // Local transcript override - single source of truth for display
  localTranscript?: string;
  recordingState: {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    audioLevel: number;
    isProcessingChunks: boolean;
    processedChunks: number;
    totalChunks: number;
  };
  isTranscribing: boolean;
  transcriptionResult: {
    text: string;
    timestamp: number;
    duration: number;
  } | null;
  error: string | null;
  isSupported: boolean;
  canRecord: boolean;
  canStop: boolean;
  canPause: boolean;
  canResume: boolean;
  remainingTime: number;
  isNearMaxDuration: boolean;
  
  // Active tab control from parent
  activeTab: 'transcript' | 'context' | 'ai';
  onActiveTabChange: (tab: 'transcript' | 'context' | 'ai') => void;
  
  // Recording actions
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onFileUpload: (file: File) => void;
  onClearError: () => void;
  onClearResult: () => void;
  
  // Session actions
  onUpdateTranscript: (transcript: string, duration?: number) => void;
  onAppendTranscript?: (newText: string, duration?: number) => void;
  
  // AI Processing props
  processing?: boolean;
  aiError?: string | null;
  processingHistory?: ProcessingHistory[];
  onProcessText?: (instruction: string) => void;
  onClearAIError?: () => void;
  onClearHistory?: () => void;
}

// Utility function for content hashing
const hashContent = (content: string): string => {
  // Simple hash function for content identification
  let hash = 0;
  const str = content.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${hash}_${str.length}_${str.slice(0, 20)}`;
};

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  currentSession,
  localTranscript,
  recordingState,
  // isTranscribing, // Currently unused
  transcriptionResult,
  error,
  canRecord,
  canStop,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  // onClearError, // Currently unused
  onUpdateTranscript,
  onAppendTranscript,
  processing = false,
  aiError = null,
  processingHistory = [],
  onProcessText,
  onClearAIError,
  onClearHistory,
  activeTab,
  onActiveTabChange
}) => {
  const [contextText, setContextText] = useState('');
  const [isRecordingContext, setIsRecordingContext] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [lastRecordingSessionId, setLastRecordingSessionId] = useState<string>('');
  
  // Context recording TTS - separate instance with 5-second chunks
  const {
    recordingState: contextRecordingState,
    isTranscribing: isContextTranscribing,
    transcriptionResult: contextTranscriptionResult,
    error: contextTTSError,
    startRecording: startContextRecording,
    stopRecording: stopContextRecording,
    clearError: clearContextTTSError,
    clearResult: clearContextTTSResult,
    isSupported: isContextTTSSupported, // eslint-disable-line @typescript-eslint/no-unused-vars
    canRecord: canContextRecord
  } = useGeorgianTTS({
    chunkSize: 5000, // 5-second chunks for context
    maxDuration: 120000, // 2 minutes max for context notes
    language: 'ka-GE'
  });

  // Refs
  const transcriptRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedSegmentsRef = useRef<Map<string, Set<string>>>(new Map()); // Per-session tracking
  // Global deduplication check with timestamp
  const lastGlobalProcessedRef = useRef<{ hash: string, timestamp: number }>({ hash: '', timestamp: 0 });
  // Circuit breaker to prevent multiple rapid useEffect executions
  const processingLockRef = useRef<boolean>(false);
  // Track last processed localTranscript to prevent loops
  const lastProcessedLocalTranscriptRef = useRef<string>('');
  
  // Simple transcript resolution like context window
  const currentTranscript = editableTranscript || currentSession?.transcript || transcriptionResult?.text || '';
  const hasTranscript = currentTranscript.length > 0;
  
  // Reset tracking when recording starts (not on every render)
  useEffect(() => {
    if (recordingState.isRecording && !lastRecordingSessionId) {
      const newSessionId = Date.now().toString();
      setLastRecordingSessionId(newSessionId);
      processedSegmentsRef.current.set(newSessionId, new Set());
      // Reset global tracking for new session
      lastGlobalProcessedRef.current = { hash: '', timestamp: 0 };

    } else if (!recordingState.isRecording && lastRecordingSessionId) {

      setLastRecordingSessionId('');
    }
  }, [recordingState.isRecording, lastRecordingSessionId]);

  // Load session transcript when session changes
  useEffect(() => {
    if (currentSession?.transcript && !editableTranscript) {

      setEditableTranscript(currentSession.transcript);
    }
  }, [currentSession?.id]); // Only trigger on session ID change, not transcript content changes
  
  // Sync context recording state with actual recording state
  useEffect(() => {
    setIsRecordingContext(contextRecordingState.isRecording);
  }, [contextRecordingState.isRecording]);

  // Handle context transcription results
  useEffect(() => {
    if (contextTranscriptionResult && !contextRecordingState.isRecording) {
      // Add final transcription result to context if not already added via live updates
      const newText = contextTranscriptionResult.text.trim();
      if (newText && !contextText.includes(newText)) {
        setContextText(prev => prev ? `${prev}\n\nVoice note: ${newText}` : `Voice note: ${newText}`);
      }
      
      // Also append to main transcript if there's a current session
      if (currentSession && onAppendTranscript && newText) {
        onAppendTranscript(`Context Note: ${newText}`);
      }
      
      // Clear the result
      clearContextTTSResult();
    }
  }, [contextTranscriptionResult, contextRecordingState.isRecording, currentSession, onAppendTranscript, contextText, clearContextTTSResult]);

  // Utility functions (using imported utilities)

  const handleCopyToClipboard = () => {
    const text = currentSession?.transcript || transcriptionResult?.text || '';
    if (text) {
      copyToClipboard(text);
    }
  };

  const handleDownloadTranscription = () => {
    const text = currentSession?.transcript || transcriptionResult?.text || '';
    if (text) {
      downloadTranscription(text);
    }
  };

  const handleContextFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleContextVoiceRecord = useCallback(() => {
    if (contextRecordingState.isRecording) {
      // Stop recording
      stopContextRecording();
    } else {
      // Start recording
      startContextRecording();
      setIsRecordingContext(true);
    }
  }, [contextRecordingState.isRecording, canContextRecord, startContextRecording, stopContextRecording]);

  const copyContextText = () => {
    copyToClipboard(contextText);
  };

  // Simple direct change handler like context window
  const handleTranscriptChange = (newTranscript: string) => {
    setEditableTranscript(newTranscript);
  };

  // Handle transcription updates with better deduplication and debouncing
  useEffect(() => {
    // Circuit breaker: prevent multiple simultaneous executions
    if (processingLockRef.current) {
      console.log('🚫 Processing already in progress, skipping duplicate useEffect');
      return;
    }
    
    // Additional check: don't process if neither transcriptionResult nor localTranscript have meaningful updates
    if (!transcriptionResult && !localTranscript) {
      console.log('🚫 No transcript updates to process');
      return;
    }
    
    // Prevent processing the same localTranscript multiple times
    if (localTranscript && localTranscript === lastProcessedLocalTranscriptRef.current) {
      console.log('🚫 Same localTranscript already processed, skipping');
      return;
    }
    
    // Debounce rapid state changes to prevent multiple processing
    const timeoutId = setTimeout(() => {
      processingLockRef.current = true; // Set lock
    const sessionId = lastRecordingSessionId || 'default';
    let processedSet = processedSegmentsRef.current.get(sessionId);
    
    if (!processedSet) {
      processedSet = new Set<string>();
      processedSegmentsRef.current.set(sessionId, processedSet);
    }
    
    let newText = '';
    
    if (transcriptionResult && !recordingState.isRecording) {
      // This should only be for file uploads now - recording uses live updates only
      newText = transcriptionResult.text.trim();
      console.log('📁 File upload transcription result processed');
    } else if (localTranscript) {
      // Extract only the NEW part from localTranscript (works both during and after recording)
      const currentLength = editableTranscript.length;
      if (localTranscript.length > currentLength) {
        newText = localTranscript.substring(currentLength).trim();
        console.log(`📝 Processing localTranscript update (recording: ${recordingState.isRecording})`);
      }
    }
    
    if (newText) {
      // Create content hash for better deduplication
      const contentHash = hashContent(newText);
      const now = Date.now();
      
      // ENHANCED DEBUG: Log every attempt to see the pattern
      console.log(`🔍 Processing attempt: hash=${contentHash}, text="${newText.substring(0, 30)}...", source=${transcriptionResult ? 'transcriptionResult' : 'localTranscript'}`);
      
      // Global duplicate check (catches rapid duplicate calls)
      if (lastGlobalProcessedRef.current.hash === contentHash && 
          (now - lastGlobalProcessedRef.current.timestamp) < 500) {
        console.log(`🚫 Global duplicate detected (hash: ${contentHash}), skipping rapid trigger`);
        return; // Exit early to prevent any processing
      }
      
      // Check for duplicates in session set BEFORE logging to prevent race conditions
      if (processedSet.has(contentHash)) {
        console.log(`🚫 Duplicate segment detected (hash: ${contentHash}), skipping`);
        return; // Exit early to prevent any processing
      }
      
      // Update global tracking
      lastGlobalProcessedRef.current = { hash: contentHash, timestamp: now };
      
      console.log(`✅ PROCESSING: New transcript segment (hash: ${contentHash}): "${newText.substring(0, 50)}..."`);
      processedSet.add(contentHash);
      
      // Update the last processed localTranscript reference
      if (localTranscript) {
        lastProcessedLocalTranscriptRef.current = localTranscript;
      }
        
      // Append to editable transcript
      setEditableTranscript(prev => {
        const separator = prev.trim() ? '\n\n' : '';
        return prev + separator + newText;
      });
    }
    
    // Always clear the lock at the end of processing
    processingLockRef.current = false;
    }, 100); // 100ms debounce to prevent rapid duplicate triggers
    
    return () => {
      clearTimeout(timeoutId);
      processingLockRef.current = false; // Clear lock on cleanup
    };
  }, [transcriptionResult, localTranscript, recordingState.isRecording, lastRecordingSessionId]);

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'transcript':
        return (
          <TranscriptContent
            transcript={currentTranscript}
            recordingState={recordingState}
            onEditChange={handleTranscriptChange}
          />
        );
      
      case 'context':
        return (
          <ContextContent
            contextText={contextText}
            onContextChange={setContextText}
            attachedFiles={attachedFiles}
            onFileUpload={handleContextFileUpload}
            onRemoveFile={removeAttachedFile}
            isRecordingContext={isRecordingContext}
            isContextTranscribing={isContextTranscribing}
            contextRecordingState={contextRecordingState}
            contextTTSError={contextTTSError}
            onContextVoiceRecord={handleContextVoiceRecord}
            onCopyContext={copyContextText}
            onClearError={clearContextTTSError}
            formatTime={formatTime}
          />
        );
      
      case 'ai':
        return (
          <AIProcessingContent
            transcript={currentTranscript}
            hasTranscript={hasTranscript}
            processing={processing}
            aiError={aiError}
            processingHistory={processingHistory}
            onProcessText={onProcessText}
            onClearAIError={onClearAIError}
            onClearHistory={onClearHistory}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50/30 via-white/80 to-blue-50/20 dark:from-gray-900/30 dark:via-gray-800/80 dark:to-blue-900/10 relative overflow-hidden">
      {/* Recording Status Indicators */}
      <RecordingStatusIndicator 
        recordingState={recordingState}
        formatTime={formatTime}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={onActiveTabChange}
        hasTranscript={hasTranscript}
        onCopy={handleCopyToClipboard}
        onDownload={handleDownloadTranscription}
        canRecord={canRecord}
        canStop={canStop}
        isRecording={recordingState.isRecording}
        onStartRecording={onStartRecording}
        onStopRecording={onStopRecording}
      />

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};