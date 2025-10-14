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
import { processCaseAttachments, processCaseAttachmentsParallel, ProcessedAttachment } from '../../utils/caseFileProcessor';
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

  // Session title props
  pendingSessionTitle?: string;
  onPendingTitleChange?: (title: string) => void;
  titleInputRef?: React.RefObject<HTMLInputElement>;
  showTitleError?: boolean;
  onTitleErrorTrigger?: () => void;

  // History controls
  isHistoryOpen?: boolean;
  onToggleHistory?: () => void;
  sessionCount?: number;

  // STT Model selection props
  selectedSTTModel?: 'Fast' | 'GoogleChirp';
  onModelChange?: (model: 'Fast' | 'GoogleChirp') => void;
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
  // Session title props
  pendingSessionTitle = '',
  onPendingTitleChange,
  titleInputRef,
  showTitleError = false,
  onTitleErrorTrigger,
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
  isKeyboardAdjusted,
  // STT Model selection props
  selectedSTTModel = 'Fast',
  onModelChange
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
  
  // Speaker diarization removed per user request
  

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
    // Get current state first to check for session changes
    const currentSessionId = currentSession?.id || '';
    const previousSessionId = previousSessionIdRef.current;
    const isSessionChange = currentSessionId !== previousSessionId;

    // If session changed, clear typing timeout and allow update
    if (isSessionChange && typingTimeoutRef.current) {
      console.log('🔄 Session changed - clearing typing timeout to allow immediate update');
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = undefined;
      isUserTypingRef.current = false;
    }

    // Don't update if user is currently typing to prevent interference
    // BUT allow updates during session changes
    if (!isSessionChange && isUserTypingRef.current) {
      console.log('🚫 User is typing, skipping transcript update to prevent interference');
      return;
    }

    // Don't update if user just made changes in the last 2 seconds to prevent overriding deletions
    // BUT always allow updates during session changes
    if (!isSessionChange && typingTimeoutRef.current) {
      console.log('🚫 User recently made changes, skipping transcript update to prevent overriding deletions');
      return;
    }

    // Get remaining state
    const sessionTranscript = currentSession?.transcript || '';
    const localLength = localTranscript?.length || 0;
    const sessionLength = sessionTranscript.length;
    const currentEditableLength = editableTranscript?.length || 0;
    
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
      // Same session - check for user edits INCLUDING DELETIONS
      // Key insight: If editableTranscript differs from sessionTranscript, the user made changes
      // This includes both additions AND deletions
      const userHasEdits = editableTranscript !== sessionTranscript;

      // Check if this looks like a user deletion (editable is shorter than session)
      const userDeletedText = currentEditableLength < sessionLength &&
                             editableTranscript !== sessionTranscript;

      if (userHasEdits || userDeletedText) {
        // User has made manual edits (including deletions) - ALWAYS preserve them
        transcript = editableTranscript;
        console.log('✏️ Preserving user edits/deletions (manual changes detected)');
      } else if (localLength > sessionLength && recordingState.isRecording) {
        // Local has MORE content than session AND we're actively recording (live recording added new content)
        transcript = localTranscript || '';
        console.log('📝 Using local transcript (fresh recording added)');
      } else if (currentEditableLength > 0) {
        // Preserve any existing editable content
        transcript = editableTranscript || '';
        console.log('💾 Preserving current editable content');
      } else if (sessionLength > 0) {
        // Session has content - use it only as fallback
        transcript = sessionTranscript;
        console.log('📄 Using session transcript (fallback)');
      } else if (localLength > 0) {
        // No session but we have local content - use local
        transcript = localTranscript || '';
        console.log('📝 Using local transcript (available)');
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

  }, [currentSession?.id, localTranscript, currentSession?.transcript, recordingState.isRecording]); // Remove editableTranscript to prevent infinite loop
  
  // File processing handlers - using simple case study approach
  const handleFileUploadFromContent = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Prevent duplicate processing
    if (isProcessingAttachment) {
      console.warn('⚠️ [PERFORMANCE] Ignoring duplicate file processing request - already processing');
      return;
    }

    const processingStartTime = performance.now();
    console.log('🚀 [PERFORMANCE] Starting file upload processing:', {
      fileCount: files.length,
      fileSizes: files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(1) + 'KB' })),
      timestamp: new Date().toISOString(),
      sessionId: currentSession?.id
    });

    setIsProcessingAttachment(true);
    setAttachmentProgress({
      stage: 'processing',
      stageDescription: 'Converting files...',
      percentage: 0,
      method: 'standard'
    });

    try {
      // INSTANT UI FEEDBACK: Show attachments immediately with 'processing' status
      const immediateAttachments: Attachment[] = files.map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        data: '', // Will be populated during processing
        textExtractionStatus: 'processing', // Show as processing immediately
        textExtractionProgress: 0
      }));

      setAttachedFiles(prev => [...prev, ...immediateAttachments]);
      console.log('✅ [INSTANT UI] Attachments added to UI immediately:', immediateAttachments.length);

      const processedAttachments: Attachment[] = [];

      // Step 1: Validate and process files with compression if needed
      const step1StartTime = performance.now();
      console.log('⚡ [PERFORMANCE] Step 1: Starting validation and compression phase');

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        const fileStartTime = performance.now();
        const basePercentage = Math.round((i / files.length) * 40);
        
        console.log(`📁 [PERFORMANCE] Processing file ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
        
        setAttachmentProgress({
          stage: 'processing',
          stageDescription: `Validating ${file.name}...`,
          percentage: basePercentage,
          method: 'standard'
        });

        // Validate file for medical transcription
        const validationStartTime = performance.now();
        const validation = validateFileForMedicalTranscription(file);
        console.log(`🔍 [PERFORMANCE] Validation took: ${(performance.now() - validationStartTime).toFixed(2)}ms`);
        
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

          const compressionStartTime = performance.now();
          try {
            file = await compressImageForMedicalUse(file, 500); // Compress to 500KB max
            const compressionTime = performance.now() - compressionStartTime;
            console.log(`✅ [PERFORMANCE] Image compressed: ${files[i].name} (${(files[i].size / 1024).toFixed(1)}KB → ${(file.size / 1024).toFixed(1)}KB) in ${compressionTime.toFixed(2)}ms`);
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
        const base64StartTime = performance.now();
        const processed = await processFileForUpload(file);
        const base64Time = performance.now() - base64StartTime;
        console.log(`📄 [PERFORMANCE] Base64 conversion took: ${base64Time.toFixed(2)}ms`);

        processedAttachments.push({
          ...processed,
          textExtractionStatus: 'pending' // Mark for text extraction
        });

        // UPDATE UI: Change status from 'processing' to 'pending' for this attachment
        setAttachedFiles(prev => prev.map(att =>
          att.name === file.name ? { ...att, ...processed, textExtractionStatus: 'pending' } : att
        ));

        const fileProcessingTime = performance.now() - fileStartTime;
        console.log(`✅ [PERFORMANCE] File ${file.name} processed in: ${fileProcessingTime.toFixed(2)}ms`);
      }

      const step1Time = performance.now() - step1StartTime;
      console.log(`⚡ [PERFORMANCE] Step 1 completed in: ${step1Time.toFixed(2)}ms`);

      // Step 2: Immediately extract text from all uploaded files
      const step2StartTime = performance.now();
      console.log('⚡ [PERFORMANCE] Step 2: Starting text extraction phase');
      
      setAttachmentProgress({
        stage: 'extracting',
        stageDescription: 'Extracting text from files...',
        percentage: 40,
        method: 'ocr'
      });

      // Convert to case attachment format for text extraction using optimized conversion
      const conversionStartTime = performance.now();
      console.log('🔄 [PERFORMANCE] Starting base64 to File conversion for text extraction...');
      
      const caseAttachments = processedAttachments.map((attachment, index) => {
        const fileConversionStartTime = performance.now();
        const base64Data = attachment.base64Data || '';
        let file: File;
        
        console.log(`🔄 [PERFORMANCE] Converting file ${index + 1}/${processedAttachments.length}: ${attachment.name}`);
        
        if (base64Data.startsWith('data:')) {
          const mimeType = base64Data.split(';')[0].split(':')[1];
          try {
            // Use optimized base64 to File conversion that handles large files efficiently
            file = convertBase64ToFile(base64Data, attachment.name, mimeType);
            const conversionTime = performance.now() - fileConversionStartTime;
            console.log(`✅ [PERFORMANCE] File conversion for ${attachment.name} took: ${conversionTime.toFixed(2)}ms`);
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
      
      const conversionTime = performance.now() - conversionStartTime;
      console.log(`🔄 [PERFORMANCE] All file conversions completed in: ${conversionTime.toFixed(2)}ms`);

      console.log('🔍 [PERFORMANCE] Starting immediate text extraction from uploaded files...');

      // Update status to processing for each file
      const statusUpdateStartTime = performance.now();
      setAttachedFiles(prev => prev.map(file => 
        processedAttachments.find(p => p.id === file.id) 
          ? { ...file, textExtractionStatus: 'processing' }
          : file
      ));
      console.log(`🎨 [PERFORMANCE] Status update took: ${(performance.now() - statusUpdateStartTime).toFixed(2)}ms`);

      // Extract text immediately - this is often the slowest part - now using parallel processing
      const textExtractionStartTime = performance.now();
      console.log('🔍 [PERFORMANCE] Starting PARALLEL OCR text extraction...');
      
      const processedWithText = await processCaseAttachmentsParallel(caseAttachments, (fileIndex, fileName, progress) => {
        console.log(`📝 [PERFORMANCE] Parallel text extraction progress for ${fileName}: ${progress.stage} - ${progress.percentage}%`);
        const currentFile = processedAttachments[fileIndex];
        setAttachmentProgress({
          stage: progress.stage,
          stageDescription: `${progress.stageDescription} (${fileName})`,
          percentage: 40 + Math.round(((fileIndex + (progress.percentage || 0) / 100) / processedAttachments.length) * 50),
          method: progress.method || 'standard'
        });
      });
      
      const textExtractionTime = performance.now() - textExtractionStartTime;
      console.log(`📝 [PERFORMANCE] Text extraction completed in: ${textExtractionTime.toFixed(2)}ms`);

      // Update files with extracted text results
      const finalUpdateStartTime = performance.now();
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
      const finalUpdateTime = performance.now() - finalUpdateStartTime;
      console.log(`🎨 [PERFORMANCE] Final UI update took: ${finalUpdateTime.toFixed(2)}ms`);

      const step2Time = performance.now() - step2StartTime;
      console.log(`⚡ [PERFORMANCE] Step 2 (text extraction) completed in: ${step2Time.toFixed(2)}ms`);

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

      const totalProcessingTime = performance.now() - processingStartTime;
      console.log(`🏁 [PERFORMANCE] TOTAL PROCESSING TIME: ${totalProcessingTime.toFixed(2)}ms`);
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

    // IMMEDIATELY update local state to prevent any interference
    setEditableTranscript(newTranscript);

    // Set timeout to mark typing as finished after user stops typing for 1 second
    typingTimeoutRef.current = setTimeout(() => {
      isUserTypingRef.current = false;

      // When user finishes typing, save their changes to the database
      // This ensures manually typed text (including deletions) becomes part of the permanent transcript
      if (onUpdateTranscript) {
        console.log('💾 Saving user changes to database:', newTranscript ? newTranscript.substring(0, 50) + '...' : '[EMPTY - User deleted all content]');
        onUpdateTranscript(newTranscript);
      }
    }, 1000);
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
            titleInputRef={titleInputRef}
            showTitleError={showTitleError}
            onTitleErrorTrigger={onTitleErrorTrigger}
            currentSession={currentSession}
            textareaRef={textareaRef}
            isKeyboardAdjusted={isKeyboardAdjusted}
            // File attachment props
            attachedFiles={attachedFiles}
            onAttachFiles={handleFileUploadFromContent}
            onRemoveAttachment={handleRemoveAttachment}
            isProcessingAttachment={isProcessingAttachment}
            attachmentProgress={attachmentProgress}
            // STT Model selection props
            selectedSTTModel={selectedSTTModel}
            onModelChange={onModelChange}
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