import React, { useRef, useMemo } from 'react';
import {
  Save,
  X,
  FileText,
  Stethoscope,
  Brain,
  Sparkles,
  Shield,
  Zap,
  Star,
  Mic,
  Upload,
  Settings,
  Cpu,
  Gauge,
  Square,
  Loader2,
  Paperclip,
  FileIcon
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';
import { ProductionControls } from './ProductionControls';

// Import mobile compact attachment styles
import '../styles/mobile-attachment-compact.css';

// Import types for file attachments
import { EnhancedAttachment } from '../../../utils/chatFileProcessor';
import type { ProgressInfo } from '../../../utils/pdfTextExtractor';
import { countEmptyFields, hasEmptyFields } from '../../../utils/markdownFormatter';

// Text formatting utilities removed - using raw transcript to preserve all user input including spaces

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  isProcessingChunks: boolean;
  processedChunks: number;
  totalChunks: number;
}

interface SpeakerSegment {
  Speaker: string;
  Text: string;
  StartSeconds: number;
  EndSeconds: number;
}

interface TranscriptContentProps {
  transcript: string;
  recordingState: RecordingState;
  onEditChange: (value: string) => void;
  onFileUpload?: (file: File) => void;
  // Recording functions
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  canRecord?: boolean;
  canStop?: boolean;
  // Session title props
  pendingSessionTitle?: string;
  onPendingTitleChange?: (title: string) => void;
  currentSession?: any;
  titleInputRef?: React.RefObject<HTMLInputElement>;
  showTitleError?: boolean;
  onTitleErrorTrigger?: () => void;
  // Mobile optimization props
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  isKeyboardAdjusted?: boolean;
  // Empty field detection props
  showEmptyFieldIndicator?: boolean;
  // File attachment props
  attachedFiles?: EnhancedAttachment[];
  onAttachFiles?: (files: File[]) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  isProcessingAttachment?: boolean;
  attachmentProgress?: ProgressInfo | null;
  // STT Model selection props
  selectedSTTModel?: 'Fast' | 'GoogleChirp';
  onModelChange?: (model: 'Fast' | 'GoogleChirp') => void;
}

// Add mobile keyboard styles
const mobileKeyboardStyles = `
  .mediscribe-mobile-textarea-container.keyboard-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mediscribe-mobile-textarea.keyboard-adjusted {
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mediscribe-mobile-button-footer.keyboard-visible {
    animation: slideUpFromBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideUpFromBottom {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;

export const TranscriptContent: React.FC<TranscriptContentProps> = ({
  transcript,
  recordingState,
  onEditChange,
  onFileUpload,
  onStartRecording,
  onStopRecording,
  canRecord = true,
  canStop = true,
  pendingSessionTitle = '',
  onPendingTitleChange,
  currentSession,
  titleInputRef,
  showTitleError = false,
  onTitleErrorTrigger,
  // File attachment props
  attachedFiles = [],
  onAttachFiles,
  onRemoveAttachment,
  isProcessingAttachment = false,
  attachmentProgress,
  // Mobile optimization props
  textareaRef,
  isKeyboardAdjusted,
  // Empty field detection
  showEmptyFieldIndicator = true,
  // STT Model selection props
  selectedSTTModel = 'Fast',
  onModelChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Title validation state
  const [titleError, setTitleError] = React.useState(false);
  const [titleHighlight, setTitleHighlight] = React.useState(false);
  const [titleTouched, setTitleTouched] = React.useState(false);
  const isTitleEmpty = !currentSession && !pendingSessionTitle.trim();

  // Update error state when parent triggers it
  React.useEffect(() => {
    if (showTitleError) {
      setTitleError(true);
    }
  }, [showTitleError]);

  // Clear error state when session changes (user selected a session from history)
  React.useEffect(() => {
    if (currentSession) {
      // Session exists, clear all error states
      setTitleError(false);
      setTitleHighlight(false);
      setTitleTouched(false);
    }
  }, [currentSession?.id]); // Watch for session ID changes

  // Use raw transcript without formatting for textarea to preserve user input
  // Formatting is only applied to AI transcription results, not user edits
  // This ensures spaces and all characters work correctly during manual editing
  const displayTranscript = transcript;

  // Calculate empty fields in transcript
  const emptyFieldsCount = countEmptyFields(transcript);
  const hasEmptyFieldsPresent = hasEmptyFields(transcript);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachmentUploadClick = () => {
    attachmentInputRef.current?.click();
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && onAttachFiles) {
      onAttachFiles(files);
    }
    // Reset file input to allow selecting the same files again
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  // Speaker differentiation removed per user request

  return (
    <>
      {/* Inject mobile keyboard styles */}
      <style>{mobileKeyboardStyles}</style>
      
      <div className="flex flex-col h-full p-4 sm:p-6 lg:p-6 mediscribe-mobile-transcript">
      {/* Modern Transcript Container */}
      <div className="relative group h-full flex flex-col">
        {/* Clean Background */}
        <div className="absolute inset-0 bg-white" />
        
        {/* Subtle Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-blue-500/10 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        {/* Main Content Structure */}
        <div className="relative h-full flex flex-col p-1 sm:p-1 lg:p-1">
          
          {/* Enhanced Session Title Input - Production Ready Design */}
          {onPendingTitleChange && (
            <div className="relative mb-4 sm:mb-3 lg:mb-3 z-10 px-3 sm:px-4 lg:px-4 pt-3 sm:pt-2 lg:pt-2">
              <div className="w-full">
                {/* Beautiful Title Container with Icon */}
                <div className="relative group">
                  {/* Elegant Label with Icon */}
                  <label className="flex items-center space-x-2 mb-2.5 text-sm font-bold text-[#1a365d]">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#2b6cb0] to-[#63b3ed] flex items-center justify-center shadow-sm">
                      <FileText className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span>Session Title</span>
                    {!currentSession && (
                      <span className="text-red-600 text-base font-bold" title="Required field">*</span>
                    )}
                  </label>

                  {/* Enhanced Input Container with Gradient Border */}
                  <div className="relative">
                    {/* Gradient Background Glow */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-[#2b6cb0] via-[#63b3ed] to-[#90cdf4] rounded-xl opacity-0 ${
                      titleHighlight ? 'opacity-60 animate-pulse' : 'group-hover:opacity-30'
                    } blur transition-all duration-500`} />

                    {/* Main Input */}
                    <div className="relative">
                      <input
                        ref={titleInputRef}
                        type="text"
                        placeholder={currentSession ? "Edit session title..." : "Enter a descriptive title for this medical session..."}
                        value={currentSession ? currentSession.title : pendingSessionTitle}
                        onChange={(e) => {
                          // Mark as touched when user types
                          if (!titleTouched) setTitleTouched(true);
                          // Clear error when user starts typing
                          if (titleError) setTitleError(false);
                          if (titleHighlight) setTitleHighlight(false);

                          if (currentSession) {
                            // Update existing session title immediately
                            onPendingTitleChange(e.target.value);
                          } else {
                            // Update pending title for new session
                            onPendingTitleChange(e.target.value);
                          }
                        }}
                        onBlur={() => {
                          // Mark as touched on blur
                          setTitleTouched(true);
                          // Show error on blur if title is empty for new session
                          if (isTitleEmpty) {
                            setTitleError(true);
                          }
                        }}
                        onFocus={() => {
                          // Mark as touched when focused
                          setTitleTouched(true);
                          // Trigger highlight animation when focused
                          setTitleHighlight(true);
                          setTimeout(() => setTitleHighlight(false), 2000);
                        }}
                        className={`w-full h-12 sm:h-14 lg:h-14 px-4 py-3 sm:py-4 lg:py-4 bg-white border-4 ${
                          titleError || (isTitleEmpty && titleError)
                            ? 'border-red-500 focus:border-red-600 focus:ring-red-500/50 shadow-xl shadow-red-500/30 animate-shake'
                            : titleHighlight
                            ? 'border-[#2b6cb0] focus:border-[#2b6cb0] focus:ring-[#2b6cb0]/40 shadow-xl shadow-[#2b6cb0]/20'
                            : 'border-[#63b3ed]/40 hover:border-[#63b3ed]/70 focus:border-[#2b6cb0] focus:ring-[#63b3ed]/30'
                        } rounded-xl text-base sm:text-lg lg:text-lg font-semibold text-[#1a365d] placeholder-[#1a365d]/50 transition-all duration-300 focus:outline-none focus:ring-4 shadow-md hover:shadow-lg ${
                          titleHighlight ? 'scale-[1.01]' : ''
                        }`}
                        style={{ minHeight: '48px' }}
                        maxLength={100}
                        disabled={recordingState.isRecording}
                      />

                      {/* Decorative Shimmer Effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 pointer-events-none" />

                      {/* Character Counter */}
                      {(pendingSessionTitle || currentSession?.title) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#2b6cb0]/60">
                          {(currentSession?.title || pendingSessionTitle).length}/100
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Error Message */}
                  {titleError && isTitleEmpty && (
                    <div className="mt-2.5 flex items-center space-x-2 text-sm text-red-600 font-semibold bg-red-50 border-l-4 border-red-600 px-3 py-2.5 rounded-r-lg animate-in slide-in-from-left-2 duration-300">
                      <div className="flex items-center space-x-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                        <span>⚠️ Session title is required before recording</span>
                      </div>
                    </div>
                  )}

                  {/* Success Indicator */}
                  {!isTitleEmpty && !titleError && pendingSessionTitle.length >= 3 && (
                    <div className="mt-2 flex items-center space-x-1.5 text-xs text-[#2b6cb0] font-medium">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2b6cb0]"></span>
                      <span>✓ Title looks good!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Compact Production Controls - Below Title */}
          <div className="relative mb-3 z-10 px-3 sm:px-4 lg:px-4" style={{ width: 'fit-content', maxWidth: '50%' }}>
            <ProductionControls
              selectedSTTModel={selectedSTTModel}
              onModelChange={onModelChange}
              recordingState={recordingState}
            />
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
            onChange={handleFileChange}
            className="hidden"
            multiple={false}
          />
          <input
            ref={attachmentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav"
            onChange={handleAttachmentChange}
            className="hidden"
            multiple={true}
          />

          {/* Attached Files Display - Medical Blue Theme */}
          {attachedFiles.length > 0 && (
            <div className="mb-1 md:mb-4 px-2 md:px-3 lg:px-4">
              <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-xl rounded-xl md:rounded-2xl border border-[#63b3ed]/40 dark:border-[#2b6cb0]/40 p-1 md:p-4 max-h-[80px] md:max-h-none shadow-sm">
                <h4 className="text-xs md:text-sm font-semibold text-[#1a365d] dark:text-[#63b3ed] mb-1 md:mb-3 flex items-center space-x-1 md:space-x-2">
                  <Paperclip className="w-3 h-3 md:w-4 md:h-4 text-[#2b6cb0]" />
                  <span className="md:hidden">{attachedFiles.length} files</span>
                  <span className="hidden md:inline">Attached Files ({attachedFiles.length})</span>
                  {isProcessingAttachment && (
                    <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-[#2b6cb0]" />
                  )}
                </h4>
                <div className="flex overflow-x-auto md:flex-row md:flex-wrap gap-2 md:gap-3 pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-[#63b3ed]/50 scrollbar-track-transparent hover:scrollbar-thumb-[#63b3ed]/70">
                  {attachedFiles.map((attachment) => (
                    <div key={attachment.id} className="group relative flex-shrink-0 flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 bg-white/90 dark:bg-[#1a365d]/30 border-2 border-[#63b3ed]/30 dark:border-[#2b6cb0]/50 px-2 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl hover:shadow-lg hover:shadow-[#63b3ed]/30 hover:border-[#2b6cb0] hover:bg-blue-50/95 dark:hover:bg-[#1a365d]/50 transition-all duration-300 min-w-[80px] max-w-[80px] md:max-w-none md:min-w-fit">
                      <div className="w-6 h-6 md:w-10 md:h-10 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-lg md:rounded-xl flex items-center justify-center shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200">
                        <FileIcon className="w-3 h-3 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 text-center md:text-left">
                        <p className="text-[#1a365d] dark:text-[#93c5fd] font-semibold text-[9px] md:text-sm truncate max-w-[70px] md:max-w-40 leading-tight">
                          {attachment.name.length > 10 ? `${attachment.name.substring(0, 10)}...` : attachment.name}
                        </p>
                        <div className="flex items-center justify-center md:justify-start space-x-1 md:space-x-2 text-[8px] md:text-xs mt-0.5 md:mt-0">
                          <span className="hidden md:inline text-[#2b6cb0] dark:text-[#63b3ed] font-medium">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </span>
                          {(() => {
                            const status = attachment.textExtractionStatus;
                            switch (status) {
                              case 'processing':
                                return (
                                  <div className="w-3 h-3 md:w-4 md:h-4 bg-amber-100 rounded-full flex items-center justify-center" title="Processing...">
                                    <Loader2 className="w-2 h-2 md:w-3 md:h-3 animate-spin text-amber-600" />
                                  </div>
                                );
                              case 'success':
                                return (
                                  <div className="w-3 h-3 md:w-4 md:h-4 bg-emerald-100 rounded-full flex items-center justify-center" title="Text extracted">
                                    <span className="text-emerald-600 text-[8px] md:text-xs">✓</span>
                                  </div>
                                );
                              case 'failed':
                                return (
                                  <div className="w-3 h-3 md:w-4 md:h-4 bg-red-100 rounded-full flex items-center justify-center" title={attachment.textExtractionError || 'Processing failed'}>
                                    <span className="text-red-600 text-[8px] md:text-xs">✕</span>
                                  </div>
                                );
                              case 'pending':
                                return (
                                  <div className="w-3 h-3 md:w-4 md:h-4 bg-slate-100 rounded-full flex items-center justify-center" title="Pending processing">
                                    <span className="text-slate-500 text-[8px] md:text-xs">•</span>
                                  </div>
                                );
                              default:
                                return (
                                  <span className="bg-[#63b3ed]/20 text-[#1a365d] px-2 py-1 rounded-full text-xs font-medium">
                                    Ready for analysis
                                  </span>
                                );
                            }
                          })()}
                        </div>
                      </div>
                      {onRemoveAttachment && (
                        <button
                          onClick={() => onRemoveAttachment(attachment.id)}
                          className="absolute top-1 right-1 md:-top-1.5 md:-right-1.5 w-5 h-5 md:w-6 md:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 border border-white/50 active:scale-95 z-10"
                          title="Remove"
                        >
                          <X className="w-3 h-3 md:w-3.5 md:h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Progress Bar */}
                {attachmentProgress && (
                  <div className="mt-4 p-3 bg-[#63b3ed]/10 dark:bg-[#1a365d]/20 rounded-xl border border-[#63b3ed]/30 dark:border-[#2b6cb0]/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#1a365d] dark:text-[#63b3ed]">
                        {attachmentProgress.stageDescription}
                      </span>
                      <span className="text-sm font-bold text-[#2b6cb0] dark:text-[#90cdf4]">
                        {attachmentProgress.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#63b3ed]/20 dark:bg-[#1a365d]/40 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${attachmentProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Premium Text Area */}
          <div 
            className={`flex-1 relative mediscribe-mobile-textarea-container ${isKeyboardAdjusted ? 'keyboard-active' : ''}`}
            style={{
              height: isKeyboardAdjusted ? 'var(--content-height, calc(100vh - var(--keyboard-height, 0px) - 180px))' : '100%',
              maxHeight: isKeyboardAdjusted ? 'var(--content-height, calc(100vh - var(--keyboard-height, 0px) - 180px))' : 'none',
              transition: 'height 0.3s ease-out, max-height 0.3s ease-out'
            }}
          >
            
            <div className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-2xl lg:rounded-2xl border border-[#63b3ed]/60 dark:border-[#2b6cb0]/60 shadow-inner shadow-[#1a365d]/5 dark:shadow-black/20 overflow-hidden mediscribe-mobile-transcript">

              {/* Regular editable text area - speaker differentiation removed */}
              <div
                className="relative h-full p-0"
                style={{ pointerEvents: isTitleEmpty ? 'auto' : undefined }}
                onClick={(e) => {
                  // Show title error if trying to type without title (handles disabled textarea clicks)
                  if (isTitleEmpty) {
                    setTitleError(true);
                    setTitleTouched(true);
                    // Trigger parent error state
                    onTitleErrorTrigger?.();
                    titleInputRef?.current?.focus();
                    titleInputRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              >
                  {/* Empty Field Notification */}
                  {showEmptyFieldIndicator && hasEmptyFieldsPresent && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-amber-100/90 to-yellow-100/90 backdrop-blur-sm rounded-lg border border-amber-300/60 shadow-lg">
                        <span className="text-amber-600">⚠️</span>
                        <span className="text-xs font-bold text-amber-800">
                          {emptyFieldsCount} field{emptyFieldsCount !== 1 ? 's' : ''} incomplete
                        </span>
                      </div>
                    </div>
                  )}

                  <textarea
                    ref={textareaRef}
                    value={displayTranscript}
                    onChange={(e) => onEditChange(e.target.value)}
                    className={`transcription-textarea w-full resize-none border-0 px-5 py-5 sm:px-6 sm:py-4 lg:px-6 lg:py-4 text-base sm:text-base lg:text-base leading-relaxed mediscribe-mobile-textarea ${isKeyboardAdjusted ? 'keyboard-adjusted' : ''}`}
                    placeholder={isTitleEmpty ? "Please enter a session title above to start..." : ""}
                    disabled={isTitleEmpty}
                    dir="auto"
                    style={{
                      background: 'transparent',
                      fontSize: '16px', // Prevents zoom on iOS
                      WebkitTextSizeAdjust: '100%', // Prevent text size adjustment
                      textSizeAdjust: '100%',
                      height: '100%', // Always use full height - removed 60px subtraction
                      minHeight: isKeyboardAdjusted ? '200px' : 'auto',
                      cursor: isTitleEmpty ? 'not-allowed' : 'text',
                      pointerEvents: isTitleEmpty ? 'none' : 'auto',
                      opacity: isTitleEmpty ? 0.5 : 1
                    }}
                    // Prevent viewport jumping on focus
                    onFocus={(e) => {
                      // Prevent focus if title is empty
                      if (isTitleEmpty) {
                        e.currentTarget.blur();
                        setTitleError(true);
                        return;
                      }

                      // Prevent default zoom behavior on iOS
                      e.currentTarget.style.fontSize = '16px';

                      // **SIMPLE VIEWPORT LOCK**: Prevent any scroll changes
                      const scrollX = window.scrollX;
                      const scrollY = window.scrollY;

                      // Lock scroll position after focus
                      setTimeout(() => {
                        window.scrollTo(scrollX, scrollY);
                      }, 0);

                      setTimeout(() => {
                        window.scrollTo(scrollX, scrollY);
                      }, 100);
                    }}
                    onBlur={(e) => {
                      // Reset any focus styles
                      e.currentTarget.style.fontSize = '16px';
                    }}
                    // Improve mobile input experience
                    autoComplete="off"
                    autoCorrect="on"
                    autoCapitalize="sentences"
                    spellCheck="true"
                    inputMode="text"
                  />
                  
                  {/* Modern Scroll Indicator - Preserve BLUE theme for history icons */}
                  <div className="absolute right-2 top-4 bottom-4 w-1 bg-[#90cdf4]/40 rounded-full overflow-hidden pointer-events-none">
                    <div className="w-full bg-gradient-to-b from-[#1a365d] to-[#2b6cb0] rounded-full transition-all duration-300" style={{height: '25%'}} />
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Mobile Button Footer - Optimized positioning */}
        <div 
          className={`lg:hidden mediscribe-mobile-button-footer ${isKeyboardAdjusted ? 'keyboard-visible' : ''}`}
          style={{
            position: isKeyboardAdjusted ? 'fixed' : 'relative',
            bottom: isKeyboardAdjusted ? 'var(--safe-area-bottom, 0px)' : 'auto',
            left: isKeyboardAdjusted ? '0' : 'auto',
            right: isKeyboardAdjusted ? '0' : 'auto',
            zIndex: isKeyboardAdjusted ? 1000 : 'auto',
            backgroundColor: isKeyboardAdjusted ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
            backdropFilter: isKeyboardAdjusted ? 'blur(10px)' : 'none',
            borderTop: isKeyboardAdjusted ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
            padding: isKeyboardAdjusted ? '12px 16px' : '0',
            transition: 'all 0.3s ease-out'
          }}
        >
          <div className="flex justify-between items-center space-x-3">
            {/* Upload Audio Button */}
            {onFileUpload && (
              <button
                onClick={handleFileUploadClick}
                disabled={recordingState.isRecording}
                title={recordingState.isRecording ? "Cannot upload files during recording" : "Upload an audio file for transcription"}
                className={`
                  mediscribe-mobile-footer-button
                  flex items-center justify-center
                  ${recordingState.isRecording ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Upload className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Attach Files Button - positioned between Upload and Record */}
            {onAttachFiles && (
              <button
                onClick={handleAttachmentUploadClick}
                disabled={recordingState.isRecording}
                title={recordingState.isRecording ? "Cannot attach files during recording" : "Attach documents, images, or files"}
                className={`
                  mediscribe-mobile-footer-button
                  flex items-center justify-center bg-gradient-to-r from-[#63b3ed] to-[#90cdf4] hover:from-[#2b6cb0] hover:to-[#63b3ed]
                  ${recordingState.isRecording ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 15px rgba(43, 108, 176, 0.3)'
                }}
              >
                <Paperclip className="w-6 h-6 text-white" />
              </button>
            )}
            
            {/* Record Button */}
            <button
              onClick={() => {
                // Show title error if trying to start recording without title
                if (!recordingState.isRecording && isTitleEmpty) {
                  setTitleError(true);
                  return;
                }

                if (recordingState.isRecording) {
                  onStopRecording && onStopRecording();
                } else {
                  onStartRecording && onStartRecording();
                }
              }}
              disabled={recordingState.isRecording ? !canStop : (!canRecord || isTitleEmpty)}
              className={`mediscribe-mobile-footer-button flex items-center justify-center ${
                recordingState.isRecording ? 'recording' : ''
              } ${isTitleEmpty && !recordingState.isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={
                isTitleEmpty && !recordingState.isRecording
                  ? "Please enter a session title first"
                  : recordingState.isRecording
                  ? "Stop recording"
                  : "Start recording"
              }
            >
              {recordingState.isProcessingChunks ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : recordingState.isRecording ? (
                <Square className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Subtle Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-transparent rounded-3xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-3xl" />
      </div>
    </div>
    </>
  );
};