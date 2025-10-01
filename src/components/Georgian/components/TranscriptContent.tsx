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
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-[#1a365d]/60 font-medium">
                    {currentSession ? '✏️ Edit title to organize your recordings' : '💡 Add a title to organize your recordings'}
                  </div>
                  <div className="text-xs text-[#1a365d]/40 font-mono">
                    {(currentSession ? currentSession.title : pendingSessionTitle).length}/100
                  </div>
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
            <div className="mb-4 px-3 sm:px-4 lg:px-4">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 p-4">
                <h4 className="text-sm font-semibold text-[#1a365d] dark:text-[#63b3ed] mb-3 flex items-center space-x-2">
                  <FileIcon className="w-4 h-4" />
                  <span>Attached Files ({attachedFiles.length})</span>
                  {isProcessingAttachment && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {attachedFiles.map((attachment) => (
                    <div key={attachment.id} className="group relative flex items-center space-x-3 bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 dark:from-[#1a365d]/30 dark:to-[#2b6cb0]/30 border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-[#2b6cb0]/10 transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-xl flex items-center justify-center shadow-lg">
                        <FileIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1a365d] dark:text-[#90cdf4] font-semibold truncate max-w-40">
                          {attachment.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-[#2b6cb0] dark:text-[#63b3ed]">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </span>
                          {(() => {
                            const status = attachment.textExtractionStatus;
                            switch (status) {
                              case 'processing':
                                return (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Processing...
                                  </span>
                                );
                              case 'success':
                                return (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <span className="text-green-600">✅</span>
                                    Text extracted
                                  </span>
                                );
                              case 'failed':
                                return (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1" title={attachment.textExtractionError}>
                                    <span className="text-red-600">❌</span>
                                    Failed
                                  </span>
                                );
                              case 'pending':
                                return (
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <span className="text-gray-500">⏸️</span>
                                    Pending
                                  </span>
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
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                          title="Remove attachment"
                        >
                          <X className="w-4 h-4" />
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
                    placeholder={`Your medical transcript will appear here with real-time precision${enableSpeakerDiarization ? ' with speaker separation for doctor-patient conversations' : ''}. You can edit this text at any time...`}
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