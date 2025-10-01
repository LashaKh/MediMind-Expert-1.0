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
  // Mobile optimization props
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  isKeyboardAdjusted?: boolean;
  // Empty field detection props
  showEmptyFieldIndicator?: boolean;
  // Speaker diarization props
  hasSpeakers?: boolean;
  speakers?: SpeakerSegment[];
  enableSpeakerDiarization?: boolean;
  onToggleSpeakerDiarization?: (enabled: boolean) => void;
  speakerCount?: number;
  onSpeakerCountChange?: (count: number) => void;
  // STT Model selection props
  selectedSTTModel?: 'STT1' | 'STT2' | 'STT3';
  onModelChange?: (model: 'STT1' | 'STT2' | 'STT3') => void;
  // File attachment props
  attachedFiles?: EnhancedAttachment[];
  onAttachFiles?: (files: File[]) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  isProcessingAttachment?: boolean;
  attachmentProgress?: ProgressInfo | null;
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
  hasSpeakers = false,
  speakers = [],
  enableSpeakerDiarization = false,
  onToggleSpeakerDiarization,
  speakerCount = 2,
  onSpeakerCountChange,
  selectedSTTModel = 'STT3',
  onModelChange,
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
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  
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

  // Speaker colors for differentiation
  const speakerColors = [
    'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
    'text-[#2b6cb0] dark:text-[#63b3ed] bg-[#63b3ed]/10 dark:bg-[#2b6cb0]/20 border-[#63b3ed]/30 dark:border-[#2b6cb0]/50',
    'text-[#1a365d] dark:text-[#90cdf4] bg-[#90cdf4]/10 dark:bg-[#1a365d]/30 border-[#90cdf4]/30 dark:border-[#1a365d]/50',
    'text-[#2b6cb0] dark:text-[#90cdf4] bg-[#90cdf4]/20 dark:bg-[#2b6cb0]/30 border-[#90cdf4]/40 dark:border-[#2b6cb0]/50',
  ];

  // Render speaker-differentiated transcript - memoized to prevent infinite re-renders
  const renderSpeakerTranscript = useMemo(() => {
    console.log('🎭 TranscriptContent: Rendering speaker transcript (memoized):', {
      hasSpeakers,
      speakersCount: speakers?.length || 0,
      enableSpeakerDiarization,
      speakers: speakers?.map(s => s.Speaker) || []
    });
    
    if (!hasSpeakers || !speakers || speakers.length === 0) {

      return null;
    }

    return (
      <div className="space-y-4 p-4">
        {speakers.map((segment, index) => {
          const speakerIndex = parseInt(segment.Speaker.replace(/\D/g, '')) - 1 || 0;
          const colorClass = speakerColors[speakerIndex % speakerColors.length];
          
          return (
            <div key={index} className={`p-3 rounded-lg border ${colorClass} transition-all duration-200`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">
                  {segment.Speaker === 'Speaker_1' ? '👨‍⚕️ Doctor' : 
                   segment.Speaker === 'Speaker_2' ? '🏥 Patient' : 
                   segment.Speaker}
                </span>
                <span className="text-xs opacity-70">
                  {Math.floor(segment.StartSeconds / 60)}:{(segment.StartSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                {segment.Text}
              </p>
            </div>
          );
        })}
      </div>
    );
  }, [hasSpeakers, speakers, enableSpeakerDiarization]);

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
          
          {/* Session Title Input - Always show when handler is available */}
          {onPendingTitleChange && (
            <div className="relative mb-3 sm:mb-2 lg:mb-2 z-10 px-3 sm:px-4 lg:px-4 pt-2 sm:pt-1 lg:pt-1">
              <div className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={currentSession ? "Edit session title" : "Session title (optional)"}
                    value={currentSession ? currentSession.title : pendingSessionTitle}
                    onChange={(e) => {
                      if (currentSession) {
                        // Update existing session title immediately
                        const updatedSession = { ...currentSession, title: e.target.value };
                        // This will trigger a session update
                        onPendingTitleChange(e.target.value);
                      } else {
                        // Update pending title for new session
                        onPendingTitleChange(e.target.value);
                      }
                    }}
                    className="w-full h-10 px-3 py-2 bg-white/95 border-2 border-[#63b3ed]/30 hover:border-[#63b3ed]/50 focus:border-[#2b6cb0] rounded-lg text-sm font-medium text-[#1a365d] placeholder-[#1a365d]/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#63b3ed]/20"
                    maxLength={100}
                    disabled={recordingState.isRecording}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#63b3ed]/5 via-transparent to-[#63b3ed]/5 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Compact Production Controls */}
          <div className="relative mb-4 sm:mb-3 lg:mb-3 z-10 px-3 sm:px-4 lg:px-4 pt-4 sm:pt-3 lg:pt-3 mediscribe-mobile-controls">
            
            {/* Compact Controls Row */}
            <div className="w-full">
              
              {/* Engine & Speaker Controls */}
              <ProductionControls
                selectedSTTModel={selectedSTTModel}
                onModelChange={onModelChange}
                recordingState={recordingState}
                enableSpeakerDiarization={enableSpeakerDiarization}
                onToggleSpeakerDiarization={onToggleSpeakerDiarization}
                speakerCount={speakerCount}
                onSpeakerCountChange={onSpeakerCountChange}
              />


            </div>
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

          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-1 md:mb-4 px-2 md:px-3 lg:px-4">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl md:rounded-2xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 p-1 md:p-4 max-h-[80px] md:max-h-none">
                <h4 className="text-xs md:text-sm font-semibold text-[#1a365d] dark:text-[#63b3ed] mb-1 md:mb-3 flex items-center space-x-1 md:space-x-2">
                  <FileIcon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="md:hidden">{attachedFiles.length} files</span>
                  <span className="hidden md:inline">Attached Files ({attachedFiles.length})</span>
                  {isProcessingAttachment && (
                    <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                  )}
                </h4>
                <div className="flex overflow-x-auto md:flex-row md:flex-wrap gap-2 md:gap-3 pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-[#63b3ed]/40 scrollbar-track-transparent hover:scrollbar-thumb-[#63b3ed]/60">
                  {attachedFiles.map((attachment) => (
                    <div key={attachment.id} className="group relative flex-shrink-0 flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 bg-gradient-to-br from-white to-[#f8fafc] dark:from-[#1e293b] dark:to-[#334155] border border-[#e2e8f0] dark:border-[#475569] px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-[#2b6cb0]/20 hover:border-[#63b3ed]/60 transition-all duration-300 min-w-[80px] max-w-[80px] md:max-w-none md:min-w-fit">
                      <div className="w-6 h-6 md:w-10 md:h-10 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-lg md:rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200">
                        <FileIcon className="w-3 h-3 md:w-5 md:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 text-center md:text-left">
                        <p className="text-[#334155] dark:text-[#94a3b8] font-medium md:font-semibold text-[9px] md:text-sm truncate max-w-[70px] md:max-w-40 leading-tight">
                          {attachment.name.length > 10 ? `${attachment.name.substring(0, 10)}...` : attachment.name}
                        </p>
                        <div className="flex items-center justify-center md:justify-start space-x-1 md:space-x-2 text-[8px] md:text-xs mt-0.5 md:mt-0">
                          <span className="hidden md:inline text-[#64748b] dark:text-[#94a3b8]">
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
                          className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-80 md:opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110"
                          title="Remove attachment"
                        >
                          <X className="w-2.5 h-2.5 md:w-4 md:h-4" />
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
              
              {/* Conditional Content Display */}
              {hasSpeakers && speakers && speakers.length > 0 ? (
                /* Speaker-differentiated view */
                <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-4">
                  {speakers.map((segment, index) => (
                    <div key={index} className={`p-4 sm:p-3 lg:p-3 mb-3 sm:mb-3 lg:mb-3 rounded-xl sm:rounded-lg lg:rounded-lg border transition-all duration-200 mediscribe-mobile-speaker-segment ${
                      speakerColors[parseInt(segment.Speaker.replace(/\D/g, '')) - 1 || 0 % speakerColors.length]
                    }`}>
                      <div className="flex items-center justify-between mb-3 sm:mb-2 lg:mb-2 mediscribe-mobile-speaker-label">
                        <span className="font-semibold text-sm sm:text-sm lg:text-sm">
                          {segment.Speaker === 'Speaker_1' ? '👨‍⚕️ Doctor' : 
                           segment.Speaker === 'Speaker_2' ? '🏥 Patient' : 
                           segment.Speaker}
                        </span>
                        <span className="text-xs opacity-70">
                          {Math.floor(segment.StartSeconds / 60)}:{(segment.StartSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-sm sm:text-sm lg:text-sm leading-relaxed">
                        {segment.Text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                /* Regular editable text area */
                <div className="relative h-full p-0">
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
                    value={transcript}
                    onChange={(e) => onEditChange(e.target.value)}
                    className={`transcription-textarea w-full resize-none border-0 px-5 py-5 sm:px-6 sm:py-4 lg:px-6 lg:py-4 text-base sm:text-base lg:text-base leading-relaxed mediscribe-mobile-textarea ${isKeyboardAdjusted ? 'keyboard-adjusted' : ''}`}
                    placeholder=""
                    dir="auto"
                    style={{ 
                      background: 'transparent',
                      fontSize: '16px', // Prevents zoom on iOS
                      WebkitTextSizeAdjust: '100%', // Prevent text size adjustment
                      textSizeAdjust: '100%',
                      height: isKeyboardAdjusted ? 'calc(100% - 60px)' : '100%',
                      minHeight: isKeyboardAdjusted ? '200px' : 'auto'
                    }}
                    // Prevent viewport jumping on focus
                    onFocus={(e) => {
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
              )}
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
                if (recordingState.isRecording) {
                  onStopRecording && onStopRecording();
                } else {
                  onStartRecording && onStartRecording();
                }
              }}
              disabled={recordingState.isRecording ? !canStop : !canRecord}
              className={`mediscribe-mobile-footer-button flex items-center justify-center ${
                recordingState.isRecording ? 'recording' : ''
              }`}
              title={recordingState.isRecording ? "Stop recording" : "Start recording"}
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