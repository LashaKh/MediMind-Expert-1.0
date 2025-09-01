import React, { useState, useRef, useEffect, useCallback, ChangeEvent, KeyboardEvent, DragEvent } from 'react';
import { Send, Paperclip, X, Loader2, AlertCircle, FileText, Image, BookOpen, User, CheckCircle, Zap, Files } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';
import { Attachment, CaseAttachmentData } from '../../types/chat';
import { KnowledgeBaseType } from '../../types/chat';
import { validateFileForFlowise, getUploadTypeDescription } from '../../utils/fileUpload';
import { processFileForChatUpload, EnhancedAttachment, buildAttachmentTextContext } from '../../utils/chatFileProcessor';
import type { ProgressInfo } from '../../utils/pdfTextExtractor';
import { DocumentSelector } from './DocumentSelector';
import { SelectedDocumentsIndicator } from './SelectedDocumentsIndicator';

interface MessageInputProps {
  onSendMessage: (message: string, attachments?: Attachment[], enhancedMessage?: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  allowAttachments?: boolean;
  maxFileSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  // Knowledge base props
  selectedKnowledgeBase?: KnowledgeBaseType;
  personalDocumentCount?: number;
  // Case document selection props
  caseDocuments?: CaseAttachmentData[];
  selectedDocuments?: string[];
  onDocumentToggle?: (documentId: string) => void;
  onSelectAllDocuments?: () => void;
  onClearSelectedDocuments?: () => void;
  showDocumentSelector?: boolean;
  // Layout control props
  forceMobileLayout?: boolean;
  disableInternalMobilePositioning?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder,
  maxLength = 2000,
  allowAttachments = false,
  maxFileSize = 10, // 10MB default
  maxFiles = 5,
  className = '',
  // Knowledge base props
  selectedKnowledgeBase,
  personalDocumentCount,
  // Case document selection props
  caseDocuments = [],
  selectedDocuments = [],
  onDocumentToggle,
  onSelectAllDocuments,
  onClearSelectedDocuments,
  showDocumentSelector = false,
  // Layout control props
  forceMobileLayout = false,
  disableInternalMobilePositioning = false
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  
  // Clear message state on component mount/unmount for mobile optimization
  useEffect(() => {
    // Reset all states on mount to prevent stale data display
    setMessage('');
    setAttachments([]);
    setIsSubmitting(false);
    setIsProcessingFiles(false);
    setUploadError(null);
    
    return () => {
      // Clean up on unmount
      setMessage('');
      setAttachments([]);
      // Clear any keyboard-related body classes
      document.body.classList.remove('mobile-keyboard-open');
      // Clear any fixed positioning on body
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, []);
  const [attachments, setAttachments] = useState<EnhancedAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [processingProgress, setProcessingProgress] = useState<{ fileIndex: number; fileName: string; progress: ProgressInfo } | null>(null);
  const [showDocumentSelection, setShowDocumentSelection] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced mobile device and keyboard detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleResize = () => {
      checkMobile();
    };

    // Enhanced keyboard detection with Visual Viewport API
    const handleViewportChange = () => {
      if (isMobile && window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const heightDiff = windowHeight - viewportHeight;
        const keyboardVisible = heightDiff > 150;
        
        setKeyboardHeight(keyboardVisible ? heightDiff : 0);
        
        // Add keyboard state class to body for global styling
        if (keyboardVisible) {
          document.body.classList.add('mobile-keyboard-open');
        } else {
          document.body.classList.remove('mobile-keyboard-open');
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      document.body.classList.remove('mobile-keyboard-open');
    };
  }, [isMobile]);

  // Auto-resize textarea based on content
  const adjustTextAreaHeight = useCallback(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = 'auto';
      const maxHeight = isMobile ? 120 : 160;
      textArea.style.height = `${Math.min(textArea.scrollHeight, maxHeight)}px`;
    }
  }, [isMobile]);

  // Handle focus - fix iOS input connection and layout stabilization
  const handleFocus = useCallback(() => {
    if (isMobile && textAreaRef.current && containerRef.current) {
      // CRITICAL: Force input connection for iOS Safari
      const textarea = textAreaRef.current;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      
      // Trigger input event to ensure connection
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
      
      // Prevent layout shift with minimal intervention
      setTimeout(() => {
        if (window.visualViewport && textAreaRef.current && containerRef.current) {
          const viewportHeight = window.visualViewport.height;
          const windowHeight = window.innerHeight;
          const keyboardHeight = windowHeight - viewportHeight;
          
          if (keyboardHeight > 100) {
            // Keep input visible without aggressive layout changes
            const inputRect = textAreaRef.current.getBoundingClientRect();
            const availableSpace = viewportHeight - 80; // Reserve space for input
            
            // Minimal positioning adjustment
            if (inputRect.bottom > availableSpace) {
              containerRef.current.style.transform = `translateY(-${Math.min(keyboardHeight * 0.2, 60)}px)`;
            }
          }
        }
      }, 100); // Faster response for better UX
    }
  }, [isMobile]);

  // Handle blur - clean up mobile keyboard adjustments with minimal intervention
  const handleBlur = useCallback(() => {
    if (isMobile && containerRef.current) {
      // Clean up with minimal layout disruption
      setTimeout(() => {
        if (containerRef.current) {
          // Clear keyboard-related styles smoothly
          containerRef.current.style.transform = '';
          containerRef.current.style.paddingBottom = '';
        }
      }, 200); // Faster cleanup
    }
  }, [isMobile]);

  // Handle message content change
  const handleMessageChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      adjustTextAreaHeight();
    }
  }, [maxLength]);

  // Handle file selection
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  }, []);

  // Process selected files with enhanced text extraction
  const processFiles = useCallback(async (files: File[]) => {
    setUploadError(null);
    setIsProcessingFiles(true);
    setProcessingProgress(null);

    const [processedFiles, error] = await safeAsync(
      async () => {
        // Check total file count
        if (attachments.length + files.length > maxFiles) {
          throw new Error(t('chat.maxFilesError', { maxFiles: maxFiles.toString() }));
        }

        const validFiles: File[] = [];
        const errors: string[] = [];

        // Validate each file using Flowise-specific validation
        files.forEach(file => {
          const validation = validateFileForFlowise(file);
          if (!validation.isValid) {
            errors.push(validation.error!);
          } else {
            validFiles.push(file);
          }
        });

        // Show errors if any
        if (errors.length > 0) {
          throw new Error(errors[0]); // Show first error
        }

        // Process files with enhanced extraction (async)
        const newAttachments: EnhancedAttachment[] = [];
        const processingErrors: string[] = [];

        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          
          const [attachment, fileError] = await safeAsync(
            async () => {
              // Progress callback for this specific file
              const progressCallback = (progress: ProgressInfo) => {
                setProcessingProgress({ fileIndex: i, fileName: file.name, progress });
              };
              
              return await processFileForChatUpload(file, undefined, progressCallback);
            },
            {
              context: `process file ${file.name} for chat upload`,
              severity: ErrorSeverity.MEDIUM
            }
          );
          
          if (fileError) {
            processingErrors.push(`${file.name}: ${fileError.userMessage || 'Processing failed'}`);
          } else {
            newAttachments.push(attachment);
          }
          
          // Clear progress for this file
          setProcessingProgress(null);
        }

        // Handle processing errors
        if (processingErrors.length > 0) {
          if (newAttachments.length === 0) {
            // All files failed
            throw new Error(processingErrors[0]);
          } else {
            // Some files succeeded, show warning for failed ones
            // Some files failed to process - continue with successfully processed files
          }
        }

        return newAttachments;
      },
      {
        context: 'process files for message attachment',
        showToast: true,
        severity: ErrorSeverity.MEDIUM
      }
    );

    if (error) {
      setUploadError(error.userMessage || t('chat.fileProcessFailed'));
    } else {
      setAttachments(prev => [...prev, ...processedFiles]);
    }
    
    setIsProcessingFiles(false);
    setProcessingProgress(null);
  }, [attachments.length, maxFiles, t]);

  // Remove attachment
  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === attachmentId);
      // Clean up preview URLs (but not base64 data URLs)
      if (attachment?.preview && attachment.preview.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(att => att.id !== attachmentId);
    });
    setUploadError(null); // Clear any upload errors
  };

  // Handle drag and drop
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (allowAttachments) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!allowAttachments) return;
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  // Send message with enhanced text content in background
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && attachments.length === 0) return;
    if (disabled || isSubmitting) return;

    setIsSubmitting(true);
    setUploadError(null);

    // Store current values before clearing
    const currentMessage = trimmedMessage;
    const currentAttachments = [...attachments];

    // Clear form immediately for better UX
    setMessage('');
    setAttachments([]);
    
    // Reset textarea height immediately
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
    
    const [, error] = await safeAsync(
      async () => {
        // Build enhanced message with extracted text content for AI (background)
        const attachmentTextContext = buildAttachmentTextContext(currentAttachments);
        
        // Create the actual message that will be sent to AI (includes extracted content)
        let aiMessage = currentMessage;
        if (attachmentTextContext) {
          if (currentMessage) {
            aiMessage = `${currentMessage}${attachmentTextContext}`;
          } else {
            aiMessage = `${t('chat.analyzeAttachedDocuments')}${attachmentTextContext}`;
          }
        }
        
        // Convert enhanced attachments to standard format for API
        const standardAttachments: Attachment[] = currentAttachments.map(att => ({
          id: att.id,
          name: att.name,
          type: att.type,
          size: att.size,
          base64Data: att.base64Data,
          uploadType: att.uploadType,
          preview: att.preview,
          url: att.url
        }));
        
        // Send both original message (for UI) and enhanced message (for AI)
        await onSendMessage(
          currentMessage, // Original message for UI display
          standardAttachments.length > 0 ? standardAttachments : undefined,
          aiMessage // Enhanced message with PDF content for AI
        );
      },
      {
        context: 'send message with attachments',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setUploadError(t('chat.messageSendFailed'));
      // Restore the form state if there was an error
      setMessage(currentMessage);
      setAttachments(currentAttachments);
      
      // Restore textarea height
      if (textAreaRef.current) {
        adjustTextAreaHeight();
      }
    }
    
    setIsSubmitting(false);
  }, [message, attachments, disabled, isSubmitting, onSendMessage, t, adjustTextAreaHeight]);

  // Handle key press events  
  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return FileText;
  };

  // Get knowledge base icon
  const getKnowledgeBaseIcon = () => {
    switch (selectedKnowledgeBase) {
      case 'personal':
        return User;
      default:
        return BookOpen;
    }
  };

  // Get knowledge base info text
  const getKnowledgeBaseInfo = () => {
    switch (selectedKnowledgeBase) {
      case 'personal':
        return personalDocumentCount
          ? t('chat.personalDocsAvailable', { count: personalDocumentCount.toString() })
          : t('chat.noPersonalDocs');
      default:
        return t('chat.generalMedicalKnowledge');
    }
  };

  const canSend = (message.trim() || attachments.length > 0) && !disabled && !isSubmitting;

  return (
    <div 
      ref={containerRef}
      className={`
        flex flex-col transition-all duration-300 safe-bottom
        ${(isMobile && !disableInternalMobilePositioning) || forceMobileLayout ? 'fixed bottom-0 left-0 right-0 z-40 bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 shadow-xl mobile-input-container' : 'relative'}
        ${className}
      `}
      data-tour="message-input"
      style={{
        paddingBottom: isMobile && keyboardHeight > 0 ? `${keyboardHeight}px` : undefined
      }}
    >
      {/* Knowledge Base Indicator - Hidden to prevent overlap */}
      {/* {selectedKnowledgeBase && (
        <div className="flex items-center px-6 py-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-b border-white/10 dark:border-gray-700/20">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {React.createElement(getKnowledgeBaseIcon(), { 
              className: "w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" 
            })}
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium truncate">
              {getKnowledgeBaseInfo()}
            </span>
          </div>
        </div>
      )} */}

      {/* Mobile-Optimized Processing Progress */}
      {processingProgress && (
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm border-b border-blue-200/50 dark:border-blue-800/30">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                  {t('chat.processingFile', { fileName: processingProgress.fileName })}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0">
                  {Math.round(processingProgress.progress.percentage || 0)}%
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 truncate">
                {processingProgress.progress.stageDescription}
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${processingProgress.progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-b border-white/10 dark:border-gray-700/20">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
            {attachments.map((attachment) => {
              const IconComponent = getFileIcon(attachment.type);
              const hasExtractedText = attachment.extractedText && attachment.extractedText.length > 0;
              const isProcessing = attachment.processingStatus === 'processing';
              const hasError = attachment.processingStatus === 'error';
              
              return (
                <div
                  key={attachment.id}
                  className={`
                    flex items-center space-x-2 sm:space-x-3 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm border shadow-sm w-full sm:w-auto sm:max-w-full transition-all duration-200
                    ${hasError 
                      ? 'bg-red-50/60 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30' 
                      : 'bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80'
                    }
                  `}
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                    <IconComponent className={`w-4 h-4 flex-shrink-0 ${hasError ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
                    {hasExtractedText && !hasError && (
                      <Zap className="w-3 h-3 text-green-500" />
                    )}
                    {isProcessing && (
                      <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={`block truncate font-medium ${hasError ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {attachment.name}
                    </span>
                    {hasExtractedText && !hasError && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {t('chat.textExtracted', { count: String(attachment.extractedText?.length || 0) })}
                        {(attachment.extractedText?.length || 0) > 800000 ? ` - ${t('chat.largeDocumentsSummarized')}` : ''}
                      </span>
                    )}
                    {hasError && attachment.processingError && (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {attachment.processingError}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="min-h-[36px] min-w-[36px] p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 focus-enhanced group flex items-center justify-center"
                    aria-label={t('chat.removeAttachment')}
                  >
                    <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Summary of extracted content */}
          {attachments.some(att => att.extractedText) && (
            <div className="mt-3 p-3 bg-green-50/60 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t('chat.textExtractedFromCount', { count: String(attachments.filter(att => att.extractedText).length) })}
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {t('chat.extractedContentIncluded')}
              </p>
              {attachments.some(att => att.extractedText && att.extractedText.length > 800000) && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {t('chat.largeDocumentsSummarized')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile-Optimized Error Display */}
      {uploadError && (
        <div className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border-b border-red-200/50 dark:border-red-800/30">
          <div className="p-1 rounded-lg bg-red-100 dark:bg-red-900/40 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-sm text-red-700 dark:text-red-300 font-medium break-words flex-1">
            {uploadError}
          </span>
        </div>
      )}

      {/* Mobile-Optimized Selected Documents Indicator */}
      {showDocumentSelector && selectedDocuments.length > 0 && (
        <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border-b border-white/10 dark:border-gray-700/20">
          <SelectedDocumentsIndicator
            selectedDocuments={selectedDocuments}
            allDocuments={caseDocuments}
            onRemoveDocument={onDocumentToggle || (() => {})}
            onClearAll={onClearSelectedDocuments || (() => {})}
            onOpenSelector={() => setShowDocumentSelection(true)}
          />
        </div>
      )}

      {/* Mobile-Optimized Input Area */}
      <div 
        className={`
          flex items-end space-x-2 sm:space-x-3 lg:space-x-4 p-3 sm:p-4 lg:p-6
          ${isDragOver ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}
          transition-all duration-300
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Mobile-Optimized Attachment and Document Selection Buttons */}
        <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2">
          {/* Mobile-friendly Case Document Selection Button */}
          {showDocumentSelector && caseDocuments.length > 0 && (
            <button
              onClick={() => setShowDocumentSelection(true)}
              disabled={disabled}
              className="min-h-[44px] min-w-[44px] p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 active:bg-white/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 transition-all duration-200 disabled:opacity-50 focus-enhanced shadow-sm hover:shadow-md"
              aria-label={t('chat.selectCaseDocuments')}
              title={t('chat.selectFromCaseDocuments', { count: String(caseDocuments.length) })}
            >
              <Files className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </button>
          )}

          {/* Mobile-friendly File Upload Button */}
          {allowAttachments && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="min-h-[44px] min-w-[44px] p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 active:bg-white/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 transition-all duration-200 disabled:opacity-50 focus-enhanced shadow-sm hover:shadow-md"
              aria-label={t('chat.attachFile')}
              data-tour="file-upload"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Mobile-Optimized Message Input Area */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <textarea
              ref={textAreaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder || t('chat.typeMessage')}
              disabled={disabled}
              maxLength={maxLength}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck="true"
              inputMode="text"
              className={`
                w-full resize-none border-none outline-none bg-transparent
                focus:outline-none focus:ring-0 focus:border-none
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                text-gray-900 dark:text-white
                leading-6
                ${className || ''}
              `}
              style={{ 
                fontSize: '16px !important', // CRITICAL: Exactly 16px prevents mobile zoom
                minHeight: isMobile ? '44px' : '24px', // Apple's minimum touch target
                maxHeight: isMobile ? '120px' : '160px',
                padding: isMobile ? '12px 0' : '8px 0',
                lineHeight: '1.5',
                WebkitTextSizeAdjust: '100%',
                WebkitAppearance: 'none',
                // iOS-specific fixes for input connection
                WebkitUserSelect: 'text',
                WebkitTouchCallout: 'default',
                WebkitTapHighlightColor: 'transparent',
                // Performance optimizations
                transform: 'translateZ(0)', // Force GPU acceleration
                willChange: 'auto' // Optimize for changes
              }}
              rows={isMobile ? 2 : 1}
            />
          </div>
        </div>

        {/* Mobile-Optimized Send Button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleSendMessage}
            disabled={!canSend}
            className="min-h-[44px] min-w-[44px] p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-all duration-200 disabled:opacity-50 focus-enhanced shadow-sm hover:shadow-md flex items-center justify-center"
            aria-label={t('chat.send')}
          >
            {disabled || isSubmitting ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Document Selection Modal */}
      {showDocumentSelection && (
        <DocumentSelector
          documents={caseDocuments || []}
          selectedDocuments={selectedDocuments || []}
          onDocumentToggle={onDocumentToggle || (() => {})}
          onSelectAll={onSelectAllDocuments || (() => {})}
          onClearAll={onClearSelectedDocuments || (() => {})}
          onClose={() => setShowDocumentSelection(false)}
          isOpen={showDocumentSelection}
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label={t('chat.selectFiles')}
      />
    </div>
  );
};