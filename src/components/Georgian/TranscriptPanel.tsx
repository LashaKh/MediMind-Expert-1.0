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

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  currentSession,
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [contextText, setContextText] = useState('');
  const [isRecordingContext, setIsRecordingContext] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
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
  
  // Get current transcript text
  const currentTranscript = currentSession?.transcript || transcriptionResult?.text || '';
  const hasTranscript = currentTranscript.length > 0;

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

  const handleEditStart = () => {
    setEditedTranscript(currentSession?.transcript || transcriptionResult?.text || '');
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (currentSession && editedTranscript.trim()) {
      onUpdateTranscript(editedTranscript.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedTranscript('');
  };

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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'transcript':
        return (
          <TranscriptContent
            transcript={currentTranscript}
            recordingState={recordingState}
            isEditing={isEditing}
            editedTranscript={editedTranscript}
            error={error}
            hasTranscript={hasTranscript}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onEditChange={setEditedTranscript}
            canRecord={canRecord}
            canStop={canStop}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            onFileUpload={onFileUpload}
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
        onEdit={handleEditStart}
      />

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};