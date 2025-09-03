import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MediScribeAnimations.css';
import { GeorgianSession } from '../../hooks/useSessionManagement';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';
import { Brain } from 'lucide-react';

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
  
  // AI Processing props - modified to pass transcript directly
  processing?: boolean;
  aiError?: string | null;
  processingHistory?: ProcessingHistory[];
  onProcessText?: (instruction: string, transcript?: string) => void;
  onClearAIError?: () => void;
  onClearHistory?: () => void;
  onDeleteReport?: (analysis: ProcessingHistory) => void;
  onExpandChat?: (expandFunction: () => void) => void;
  
  // Speaker diarization props
  enableSpeakerDiarization?: boolean;
  onToggleSpeakerDiarization?: (enabled: boolean) => void;
  speakerCount?: number;
  onSpeakerCountChange?: (count: number) => void;
  // Speaker diarization results
  hasSpeakers?: boolean;
  speakers?: Array<{
    Speaker: string;
    Text: string;
    StartSeconds: number;
    EndSeconds: number;
  }>;
}


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
  onDeleteReport,
  onExpandChat,
  activeTab,
  onActiveTabChange,
  enableSpeakerDiarization = false,
  onToggleSpeakerDiarization,
  speakerCount = 2,
  onSpeakerCountChange,
  // Speaker diarization results
  hasSpeakers: hasSpeakersFromHook = false,
  speakers: speakersFromHook = []
}) => {
  const [contextText, setContextText] = useState('');
  const [isRecordingContext, setIsRecordingContext] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [lastRecordingSessionId, setLastRecordingSessionId] = useState<string>('');
  
  // Use speaker diarization state from hook, fallback to local state
  const hasSpeakers = hasSpeakersFromHook;
  const speakerSegments = speakersFromHook;
  
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
  // Simplified refs for basic tracking
  const lastRecordingSessionIdRef = useRef<string>('');
  
  // Simple transcript resolution with editableTranscript priority for AI processing
  const currentTranscript = editableTranscript || localTranscript || currentSession?.transcript || transcriptionResult?.text || '';
  const hasTranscript = currentTranscript.length > 0;
  
  // Debug transcript resolution (disabled in production)
  // console.log('🔍 Transcript resolution:', {
  //   hasEditableTranscript: !!editableTranscript,
  //   editableLength: editableTranscript?.length || 0,
  //   hasLocalTranscript: !!localTranscript,
  //   hasSessionTranscript: !!currentSession?.transcript,
  //   finalTranscript: currentTranscript.slice(0, 100) + '...'
  // });
  
  // Track recording session changes for cleanup
  useEffect(() => {
    if (recordingState.isRecording && !lastRecordingSessionId) {
      const newSessionId = Date.now().toString();
      setLastRecordingSessionId(newSessionId);
      lastRecordingSessionIdRef.current = newSessionId;
    } else if (!recordingState.isRecording && lastRecordingSessionId) {
      setLastRecordingSessionId('');
      lastRecordingSessionIdRef.current = '';
    }
  }, [recordingState.isRecording, lastRecordingSessionId]);

  // Load session transcript when session changes
  useEffect(() => {
    // Always update editableTranscript when session changes to reflect the selected session
    const sessionTranscript = currentSession?.transcript || '';
    setEditableTranscript(sessionTranscript);
  }, [currentSession?.id]); // Only depend on session ID change
  
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

  // Simple direct change handler that updates both local and parent state
  const handleTranscriptChange = (newTranscript: string) => {
    setEditableTranscript(newTranscript);
    // Also update parent state so AI Processing can access the transcript
    if (onUpdateTranscript) {
      onUpdateTranscript(newTranscript);
    }
  };

  // File upload transcription handling only (live updates are handled by parent component)
  useEffect(() => {
    if (transcriptionResult && !recordingState.isRecording) {
      // Handle file upload transcription results only
      const newText = transcriptionResult.text.trim();
      if (newText && newText !== editableTranscript.trim()) {
        console.log('📁 File upload transcription result processed');
        setEditableTranscript(newText);
      }
    }
  }, [transcriptionResult, recordingState.isRecording, editableTranscript]);

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'transcript':
        return (
          <TranscriptContent
            transcript={currentTranscript}
            recordingState={recordingState}
            onEditChange={handleTranscriptChange}
            onFileUpload={onFileUpload}
            hasSpeakers={hasSpeakers}
            speakers={speakerSegments}
            enableSpeakerDiarization={enableSpeakerDiarization}
            onToggleSpeakerDiarization={onToggleSpeakerDiarization}
            speakerCount={speakerCount}
            onSpeakerCountChange={onSpeakerCountChange}
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
            onProcessText={(instruction) => onProcessText?.(instruction, currentTranscript)}
            onClearAIError={onClearAIError}
            onClearHistory={onClearHistory}
            onDeleteReport={onDeleteReport}
            onSwitchToHistory={() => {
              // Switch to history view in AI tab by updating the view mode
              console.log('🔄 Auto-switching to history view after diagnosis completion');
              // This will trigger the view change inside AIProcessingContent
            }}
            onExpandChat={onExpandChat}
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