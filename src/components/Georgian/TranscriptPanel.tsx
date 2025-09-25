import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MediScribeAnimations.css';
import './styles/mediscribe-mobile.css';
import { GeorgianSession } from '../../hooks/useSessionManagement';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';
import { Brain } from 'lucide-react';

// Import file processing utilities
import { processFileForChatUpload, EnhancedAttachment, buildAttachmentTextContext } from '../../utils/chatFileProcessor';
import type { ProgressInfo } from '../../utils/pdfTextExtractor';

// Import extracted components
import { TabNavigation } from './components/TabNavigation';
import { TranscriptContent } from './components/TranscriptContent';
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
  // Mobile optimization props
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  isKeyboardAdjusted?: boolean;
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
  activeTab: 'transcript' | 'ai';
  onActiveTabChange: (tab: 'transcript' | 'ai') => void;
  
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
  
  // STT Model selection props
  selectedSTTModel?: 'STT1' | 'STT2' | 'STT3';
  onModelChange?: (model: 'STT1' | 'STT2' | 'STT3') => void;
  
  // Session title props
  pendingSessionTitle?: string;
  onPendingTitleChange?: (title: string) => void;
  
  // History controls
  isHistoryOpen?: boolean;
  onToggleHistory?: () => void;
  sessionCount?: number;
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
  speakers: speakersFromHook = [],
  // STT Model selection props
  selectedSTTModel = 'STT3',
  onModelChange,
  // Session title props
  pendingSessionTitle = '',
  onPendingTitleChange,
  // History controls
  isHistoryOpen = false,
  onToggleHistory,
  sessionCount = 0,
  // Mobile optimization props
  textareaRef,
  isKeyboardAdjusted
}) => {
  // File attachment state - replaces old context functionality
  const [attachedFiles, setAttachedFiles] = useState<EnhancedAttachment[]>([]);
  const [isProcessingAttachment, setIsProcessingAttachment] = useState(false);
  const [attachmentProgress, setAttachmentProgress] = useState<ProgressInfo | null>(null);
  
  const [editableTranscript, setEditableTranscript] = useState('');
  const [lastRecordingSessionId, setLastRecordingSessionId] = useState<string>('');
  
  // Track user typing to prevent interference
  const isUserTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Store chat close function for tab switching
  const closeChatFunctionRef = useRef<(() => void) | null>(null);

  // Handle tab change with automatic chat and history closing
  const handleTabChange = useCallback((tab: 'transcript' | 'ai') => {
    // Close chat if it's open and we're switching tabs
    if (closeChatFunctionRef.current) {
      closeChatFunctionRef.current();
    }
    
    // Close history sidebar if it's open and we're switching tabs
    if (isHistoryOpen && onToggleHistory) {
      onToggleHistory();
    }
    
    // Call the original tab change handler
    onActiveTabChange(tab);
  }, [onActiveTabChange, isHistoryOpen, onToggleHistory]);
  
  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  // Use speaker diarization state from hook, fallback to local state
  const hasSpeakers = hasSpeakersFromHook;
  const speakerSegments = speakersFromHook;
  

  // Refs
  const transcriptRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Simplified refs for basic tracking
  const lastRecordingSessionIdRef = useRef<string>('');
  
  // Smart transcript resolution - prioritize live transcript during recording
  const currentTranscript = recordingState.isRecording 
    ? (localTranscript || editableTranscript || currentSession?.transcript || transcriptionResult?.text || '')
    : (editableTranscript || localTranscript || currentSession?.transcript || transcriptionResult?.text || '');
  
  // Check if we have content for AI processing (transcript OR attached files)
  const hasTranscript = currentTranscript.length > 0;
  // Consider ANY attached file as potential AI content, not just files with extracted text
  // This allows visual analysis of images, charts, etc. even without text extraction
  const hasAttachmentContent = attachedFiles.length > 0 && attachedFiles.some(file => 
    // File has extracted text OR is processable (has base64Data for visual analysis)
    (file.extractedText && file.extractedText.trim()) || file.base64Data
  );
  const hasContentForAI = hasTranscript || hasAttachmentContent;
  
  
  // Debug transcript resolution (disabled in production)
  // + '...'
  // });
  
  // Track recording session changes for cleanup and clear editable state when recording starts
  useEffect(() => {
    if (recordingState.isRecording && !lastRecordingSessionId) {
      const newSessionId = Date.now().toString();
      setLastRecordingSessionId(newSessionId);
      lastRecordingSessionIdRef.current = newSessionId;
      
      // Clear editable transcript when recording starts to ensure live transcript is visible
      if (editableTranscript) {
        console.log('🧹 Clearing editable transcript to show live recording');
        setEditableTranscript('');
      }
    } else if (!recordingState.isRecording && lastRecordingSessionId) {
      setLastRecordingSessionId('');
      lastRecordingSessionIdRef.current = '';
    }
  }, [recordingState.isRecording, lastRecordingSessionId, editableTranscript]);

  // Track previous session ID to detect session changes
  const previousSessionIdRef = useRef<string>('');

  // Load session transcript when session changes OR when localTranscript updates
  useEffect(() => {
    // Don't update if user is currently typing to prevent interference
    if (isUserTypingRef.current) {
      console.log('🚫 User is typing, skipping transcript update to prevent interference');
      return;
    }
    
    // Get current state
    const sessionTranscript = currentSession?.transcript || '';
    const localLength = localTranscript?.length || 0;
    const sessionLength = sessionTranscript.length;
    const currentEditableLength = editableTranscript?.length || 0;
    const currentSessionId = currentSession?.id || '';
    const previousSessionId = previousSessionIdRef.current;
    
    // Check if this is a session change
    const isSessionChange = currentSessionId !== previousSessionId;
    
    console.log('🔍 Transcript selection logic:', {
      sessionId: currentSessionId,
      previousSessionId,
      isSessionChange,
      sessionLength,
      localLength,
      currentEditableLength,
      isUserTyping: isUserTypingRef.current,
      sessionTranscript: sessionTranscript.substring(0, 50) + (sessionTranscript.length > 50 ? '...' : ''),
      localTranscript: (localTranscript || '').substring(0, 50) + ((localTranscript?.length || 0) > 50 ? '...' : ''),
      currentEditable: (editableTranscript || '').substring(0, 50) + ((editableTranscript?.length || 0) > 50 ? '...' : ''),
    });
    
    // Update previous session ID tracker
    if (isSessionChange) {
      previousSessionIdRef.current = currentSessionId;
    }
    
    // Enhanced transcript selection logic with user edits preservation:
    // 1. If session changed, always load the new session transcript
    // 2. Within same session: if user has typed content that's different from session, preserve user edits
    // 3. If session transcript is longer (new transcription added), use session
    // 4. Fall back to local/session/empty as before
    let transcript = '';
    
    if (isSessionChange) {
      // Session changed - always load the new session transcript, ignore user edits from previous session
      transcript = sessionTranscript;
      console.log('🔄 Session changed - loading new session transcript');
    } else {
      // Same session - check for user edits
      // During live recording, localTranscript grows with new segments, but that's not a "user edit"
      // Only consider it a user edit if the editable content differs from the START of local transcript
      const localStart = (localTranscript || '').substring(0, currentEditableLength);
      const userHasEdits = currentEditableLength > 0 && 
                          editableTranscript.trim() !== sessionTranscript.trim() &&
                          editableTranscript.trim() !== localStart.trim() &&
                          !(localTranscript || '').startsWith(editableTranscript.trim()); // Not just a prefix of live recording
      
      if (userHasEdits) {
        // User has made manual edits within the same session - preserve them
        transcript = editableTranscript;
        console.log('✏️ Preserving user edits (manual changes detected within same session)');
      } else if (sessionLength > currentEditableLength) {
        // Session has more content (new transcription arrived) - use it
        transcript = sessionTranscript;
        console.log('📄 Using session transcript (new content available)');
      } else if (localLength > currentEditableLength) {
        // Local has more content - use local
        transcript = localTranscript || '';
        console.log('📝 Using local transcript (fresh recording)');
      } else if (sessionLength > 0) {
        // Session has content - use it
        transcript = sessionTranscript;
        console.log('📄 Using session transcript (most complete)');
      } else if (localLength > 0) {
        // No session but we have local content - use local
        transcript = localTranscript || '';
        console.log('📝 Using local transcript (available)');
      } else if (currentEditableLength > 0) {
        // Preserve any existing editable content
        transcript = editableTranscript || '';
        console.log('💾 Preserving current editable content');
      } else {
        // Nothing available - start fresh
        transcript = '';
        console.log('🆕 Starting with empty transcript');
      }
    }
    
    // Only update if the transcript actually changed
    if (transcript !== editableTranscript) {
      console.log('🔄 Updating editable transcript');
      setEditableTranscript(transcript);
    } else {
      console.log('⏭️ Transcript unchanged, skipping update');
    }

  }, [currentSession?.id, localTranscript, currentSession?.transcript]); // Remove editableTranscript to prevent infinite loop
  
  // File processing handlers
  const handleFileUploadFromContent = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsProcessingAttachment(true);
    setAttachmentProgress(null);

    try {
      const processedAttachments: EnhancedAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progressCallback = (progress: ProgressInfo) => {
          setAttachmentProgress({
            ...progress,
            stageDescription: `Processing ${file.name}... ${progress.stageDescription}`
          });
        };

        const processed = await processFileForChatUpload(file, undefined, progressCallback);
        processedAttachments.push(processed);
      }

      setAttachedFiles(prev => [...prev, ...processedAttachments]);
      setAttachmentProgress(null);
    } catch (error) {
      console.error('❌ File processing failed:', error);
      setAttachmentProgress({
        stage: 'error',
        stageDescription: 'File processing failed',
        percentage: 0,
        method: 'error'
      });
    } finally {
      setIsProcessingAttachment(false);
    }
  }, []);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== attachmentId));
  }, []);

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


  // Enhanced transcript change handler that preserves typed text during live transcription
  const handleTranscriptChange = (newTranscript: string) => {
    // Mark that user is typing to prevent useEffect interference
    isUserTypingRef.current = true;
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to mark typing as finished after user stops typing for 1 second
    typingTimeoutRef.current = setTimeout(() => {
      isUserTypingRef.current = false;
      
      // When user finishes typing, save their changes to the database
      // This ensures manually typed text becomes part of the permanent transcript
      if (onUpdateTranscript && newTranscript.trim()) {
        console.log('💾 Saving user typed text to database:', newTranscript.substring(0, 50) + '...');
        onUpdateTranscript(newTranscript);
      }
    }, 1000);
    
    // Update local editable state immediately for responsive UI
    setEditableTranscript(newTranscript);
  };

  // File upload transcription handling only (live updates are handled by parent component)
  useEffect(() => {
    if (transcriptionResult && !recordingState.isRecording) {
      // Handle file upload transcription results only
      const newText = transcriptionResult.text.trim();
      if (newText && newText !== editableTranscript.trim()) {

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
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            canRecord={canRecord}
            canStop={canStop}
            pendingSessionTitle={pendingSessionTitle}
            onPendingTitleChange={onPendingTitleChange}
            currentSession={currentSession}
            hasSpeakers={hasSpeakers}
            speakers={speakerSegments}
            enableSpeakerDiarization={enableSpeakerDiarization}
            onToggleSpeakerDiarization={onToggleSpeakerDiarization}
            speakerCount={speakerCount}
            onSpeakerCountChange={onSpeakerCountChange}
            textareaRef={textareaRef}
            isKeyboardAdjusted={isKeyboardAdjusted}
            selectedSTTModel={selectedSTTModel}
            onModelChange={onModelChange}
            // File attachment props
            attachedFiles={attachedFiles}
            onAttachFiles={handleFileUploadFromContent}
            onRemoveAttachment={handleRemoveAttachment}
            isProcessingAttachment={isProcessingAttachment}
            attachmentProgress={attachmentProgress}
          />
        );
      
      case 'ai':
        return (
          <AIProcessingContent
            transcript={currentTranscript}
            hasTranscript={hasContentForAI}
            processing={processing}
            aiError={aiError}
            processingHistory={processingHistory}
            onProcessText={(instruction) => {
              // Include attachment content when processing
              const attachmentContext = buildAttachmentTextContext(attachedFiles);
              let combinedText = '';
              
              if (currentTranscript && attachmentContext) {
                combinedText = `${currentTranscript}\n\n${attachmentContext}`;
              } else if (currentTranscript) {
                combinedText = currentTranscript;
              } else if (attachmentContext) {
                combinedText = attachmentContext;
              } else if (attachedFiles.length > 0) {
                // If we have attached files but no extracted text, still provide context
                const fileNames = attachedFiles.map(f => f.name).join(', ');
                combinedText = `Please analyze the attached file(s): ${fileNames}. The file(s) have been processed and are available for visual analysis.`;
              } else {
                combinedText = 'No content available for processing.';
              }
              
              onProcessText?.(instruction, combinedText);
            }}
            onClearAIError={onClearAIError}
            onClearHistory={onClearHistory}
            onDeleteReport={onDeleteReport}
            onSwitchToHistory={() => {
              // Switch to history view in AI tab by updating the view mode

              // This will trigger the view change inside AIProcessingContent
            }}
            onExpandChat={onExpandChat}
            onCloseChat={(closeFunction) => {
              closeChatFunctionRef.current = closeFunction;
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative mediscribe-mobile-content-area mediscribe-mobile-safe-bottom">
      {/* Recording Status Indicators */}
      <RecordingStatusIndicator 
        recordingState={recordingState}
        formatTime={formatTime}
      />

      {/* Tab Navigation */}
      <div className="mediscribe-mobile-tabs">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasTranscript={hasContentForAI}
          canRecord={canRecord}
          canStop={canStop}
          isRecording={recordingState.isRecording}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          isHistoryOpen={isHistoryOpen}
          onToggleHistory={onToggleHistory}
          sessionCount={sessionCount}
          onFileUpload={onFileUpload}
          onAttachFiles={handleFileUploadFromContent}
        />
      </div>

      {/* Content Area - Adaptive height */}
      <div className="flex-1 min-h-0 mediscribe-mobile-scrollable-content overflow-hidden">
        {renderContent()}
      </div>


    </div>
  );
};