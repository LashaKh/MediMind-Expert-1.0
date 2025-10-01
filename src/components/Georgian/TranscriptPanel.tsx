import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MediScribeAnimations.css';
import './styles/mediscribe-mobile.css';
import { GeorgianSession } from '../../hooks/useSessionManagement';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';
import { Brain } from 'lucide-react';

// Import file processing utilities - using case study approach
import { 
  processFileForUpload, 
  validateFileForMedicalTranscription, 
  compressImageForMedicalUse,
  convertBase64ToFile,
  FILE_SIZE_LIMITS 
} from '../../utils/fileUpload';
import { processCaseAttachments, ProcessedAttachment } from '../../utils/caseFileProcessor';
import type { ProgressInfo } from '../../utils/pdfTextExtractor';
import type { Attachment } from '../../types/chat';

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
  onAddToHistory?: (instruction: string, response: string, model: string, tokensUsed?: number, processingTime?: number) => void;
  onExpandChat?: (expandFunction: () => void) => void;
  
  // Template selection props
  selectedTemplate?: any; // UserReportTemplate
  onTemplateSelect?: (template: any | null) => void;
  availableTemplates?: any[]; // UserReportTemplate[]
  
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
  onAddToHistory,
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
  // Template selection props
  selectedTemplate,
  onTemplateSelect,
  availableTemplates = [],
  // Mobile optimization props
  textareaRef,
  isKeyboardAdjusted
}) => {
  // File attachment state - using simple attachment type like case studies
  const [attachedFiles, setAttachedFiles] = useState<Attachment[]>([]);
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
  // Consider ANY attached file as potential AI content for visual or text analysis
  const hasAttachmentContent = attachedFiles.length > 0 && attachedFiles.some(file => 
    // File has base64Data for processing (simple attachment type)
    file.base64Data
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
  
  // File processing handlers - using simple case study approach
  const handleFileUploadFromContent = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsProcessingAttachment(true);
    setAttachmentProgress({
      stage: 'processing',
      stageDescription: 'Converting files...',
      percentage: 0,
      method: 'standard'
    });

    try {
      const processedAttachments: Attachment[] = [];

      // Step 1: Validate and process files with compression if needed
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const basePercentage = Math.round((i / files.length) * 40);
        
        setAttachmentProgress({
          stage: 'processing',
          stageDescription: `Validating ${file.name}...`,
          percentage: basePercentage,
          method: 'standard'
        });

        // Validate file for medical transcription
        const validation = validateFileForMedicalTranscription(file);
        if (!validation.isValid) {
          console.error(`❌ File validation failed: ${validation.error}`);
          setAttachmentProgress({
            stage: 'error',
            stageDescription: validation.error || 'File validation failed',
            percentage: basePercentage,
            method: 'error'
          });
          
          // Show error for 3 seconds then continue with other files
          setTimeout(() => {
            if (i === files.length - 1) {
              setAttachmentProgress(null);
            }
          }, 3000);
          continue;
        }

        // Compress image if needed
        if (validation.needsCompression) {
          setAttachmentProgress({
            stage: 'processing',
            stageDescription: `Compressing ${file.name} for optimal performance...`,
            percentage: basePercentage + 10,
            method: 'compression'
          });

          try {
            file = await compressImageForMedicalUse(file, 500); // Compress to 500KB max
            console.log(`✅ Image compressed: ${files[i].name} (${(files[i].size / 1024).toFixed(1)}KB → ${(file.size / 1024).toFixed(1)}KB)`);
          } catch (compressionError) {
            console.warn(`⚠️ Compression failed for ${file.name}, using original:`, compressionError);
            // Continue with original file
            file = files[i];
          }
        }

        setAttachmentProgress({
          stage: 'processing',
          stageDescription: `Processing ${file.name}...`,
          percentage: basePercentage + 20,
          method: 'standard'
        });

        // Convert to base64 with optimized method
        const processed = await processFileForUpload(file);
        processedAttachments.push({
          ...processed,
          textExtractionStatus: 'pending' // Mark for text extraction
        });
      }

      // Add files to UI with pending status
      setAttachedFiles(prev => [...prev, ...processedAttachments]);

      // Step 2: Immediately extract text from all uploaded files
      setAttachmentProgress({
        stage: 'extracting',
        stageDescription: 'Extracting text from files...',
        percentage: 40,
        method: 'ocr'
      });

      // Convert to case attachment format for text extraction using optimized conversion
      const caseAttachments = processedAttachments.map(attachment => {
        const base64Data = attachment.base64Data || '';
        let file: File;
        
        if (base64Data.startsWith('data:')) {
          const mimeType = base64Data.split(';')[0].split(':')[1];
          try {
            // Use optimized base64 to File conversion that handles large files efficiently
            file = convertBase64ToFile(base64Data, attachment.name, mimeType);
          } catch (error) {
            console.error(`❌ Failed to convert base64 to file for ${attachment.name}:`, error);
            // Fallback to empty file
            file = new File([], attachment.name, { type: attachment.type });
          }
        } else {
          file = new File([], attachment.name, { type: attachment.type });
        }

        return {
          id: attachment.id,
          file,
          base64Data: base64Data,
          uploadType: attachment.type.startsWith('image/') ? 'image' as const : 
                    attachment.type === 'application/pdf' ? 'pdf' as const : 'document' as const,
          status: 'ready' as const,
          category: 'medical-images'
        };
      });

      console.log('🔍 Starting immediate text extraction from uploaded files...');

      // Update status to processing for each file
      setAttachedFiles(prev => prev.map(file => 
        processedAttachments.find(p => p.id === file.id) 
          ? { ...file, textExtractionStatus: 'processing' }
          : file
      ));

      // Extract text immediately
      const processedWithText = await processCaseAttachments(caseAttachments, (fileIndex, fileName, progress) => {
        const currentFile = processedAttachments[fileIndex];
        setAttachmentProgress({
          stage: progress.stage,
          stageDescription: `${progress.stageDescription} (${fileName})`,
          percentage: 40 + Math.round(((fileIndex + (progress.percentage || 0) / 100) / processedAttachments.length) * 50),
          method: progress.method || 'standard'
        });
      });

      // Update files with extracted text results
      setAttachedFiles(prev => prev.map(file => {
        const attachmentIndex = processedAttachments.findIndex(p => p.id === file.id);
        if (attachmentIndex >= 0) {
          const textResult = processedWithText[attachmentIndex];
          return {
            ...file,
            extractedText: textResult.extractedText || '',
            textExtractionStatus: textResult.status === 'ready' ? 'success' : 'failed',
            textExtractionError: textResult.error
          };
        }
        return file;
      }));

      setAttachmentProgress({
        stage: 'complete',
        stageDescription: 'All files processed with text extraction!',
        percentage: 100,
        method: 'standard'
      });

      // Clear progress after showing success
      setTimeout(() => {
        setAttachmentProgress(null);
      }, 2000);

      console.log('✅ Files processed successfully with immediate text extraction');
    } catch (error) {
      console.error('❌ File processing failed:', error);
      
      // Provide more specific error messages for common issues
      let errorMessage = 'File processing failed';
      if (error instanceof Error) {
        if (error.message.includes('memory') || error.message.includes('allocation')) {
          errorMessage = 'File too large for processing. Please use smaller images (under 5MB).';
        } else if (error.message.includes('base64') || error.message.includes('convert')) {
          errorMessage = 'File format error. Please try uploading a different image format.';
        } else if (error.message.includes('compression')) {
          errorMessage = 'Image compression failed. File may be corrupted.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAttachmentProgress({
        stage: 'error',
        stageDescription: errorMessage,
        percentage: 0,
        method: 'error'
      });

      // Clear error message after 5 seconds for better UX
      setTimeout(() => {
        setAttachmentProgress(null);
      }, 5000);

      // Mark failed files with specific error info
      setAttachedFiles(prev => prev.map(file => ({
        ...file,
        textExtractionStatus: 'failed',
        textExtractionError: errorMessage
      })));
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
            onProcessText={async (instruction) => {
              let combinedText = '';

              // Use pre-extracted text from immediately processed attachments
              if (attachedFiles.length > 0) {
                console.log('📄 Using pre-extracted text from uploaded files...');
                
                // Build attachment text context from pre-extracted text
                let attachmentContext = '';
                let hasExtractedText = false;
                
                attachedFiles.forEach((file, index) => {
                  if (file.extractedText && file.extractedText.trim()) {
                    attachmentContext += `\n--- Document ${index + 1}: ${file.name} ---\n${file.extractedText}\n`;
                    hasExtractedText = true;
                  }
                });

                if (currentTranscript && hasExtractedText) {
                  combinedText = `${currentTranscript}\n\n=== Attached Documents ===${attachmentContext}`;
                } else if (currentTranscript) {
                  combinedText = currentTranscript;
                } else if (hasExtractedText) {
                  combinedText = `=== Attached Documents ===${attachmentContext}`;
                } else {
                  // No text extracted - provide context for visual analysis
                  const fileDetails = attachedFiles.map(f => {
                    const status = f.textExtractionStatus;
                    const statusIndicator = status === 'success' ? '✅' : 
                                          status === 'failed' ? '❌' : 
                                          status === 'processing' ? '⏳' : '⏸️';
                    return `${f.name} (${f.type}) ${statusIndicator}`;
                  }).join(', ');
                  
                  if (currentTranscript) {
                    combinedText = `${currentTranscript}\n\n=== Attached Files ===\nThe following files are available for visual analysis: ${fileDetails}`;
                  } else {
                    combinedText = `Please analyze the attached file(s): ${fileDetails}. The files have been processed and are available for visual analysis.`;
                  }
                }
              } else {
                combinedText = currentTranscript || 'No content available for processing.';
              }
              
              onProcessText?.(instruction, combinedText);
            }}
            onClearAIError={onClearAIError}
            onClearHistory={onClearHistory}
            onDeleteReport={onDeleteReport}
            onAddToHistory={onAddToHistory}
            onSwitchToHistory={() => {
              // Switch to history view in AI tab by updating the view mode

              // This will trigger the view change inside AIProcessingContent
            }}
            onExpandChat={onExpandChat}
            onCloseChat={(closeFunction) => {
              closeChatFunctionRef.current = closeFunction;
            }}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={onTemplateSelect}
            availableTemplates={availableTemplates}
            sessionTitle={currentSession?.title || ''}
            sessionId={currentSession?.id}
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