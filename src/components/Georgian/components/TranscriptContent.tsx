import React, { useRef, useMemo, useEffect, useState } from 'react';
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
  Gauge
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';
import { ProductionControls } from './ProductionControls';

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
}

export const TranscriptContent: React.FC<TranscriptContentProps> = ({
  transcript,
  recordingState,
  onEditChange,
  onFileUpload,
  hasSpeakers = false,
  speakers = [],
  enableSpeakerDiarization = false,
  onToggleSpeakerDiarization,
  speakerCount = 2,
  onSpeakerCountChange,
  selectedSTTModel = 'STT3',
  onModelChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Mobile keyboard state
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('40vh');

  // Mobile keyboard detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      // Detect mobile keyboard by viewport height change
      const isMobile = window.innerWidth < 768;
      if (!isMobile) return;

      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      const keyboardHeight = windowHeight - viewportHeight;
      const isKeyboardVisible = keyboardHeight > 150; // 150px threshold

      setIsKeyboardOpen(isKeyboardVisible);
      
      // Add/remove class to body for CSS styling
      if (isKeyboardVisible) {
        document.body.classList.add('keyboard-open');
        // Adjust textarea height when keyboard is open
        setTextareaHeight(`${Math.max(viewportHeight * 0.3, 120)}px`);
      } else {
        document.body.classList.remove('keyboard-open');
        setTextareaHeight('40vh');
      }
    };

    // Listen to both resize and visualViewport events
    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      document.body.classList.remove('keyboard-open');
    };
  }, []);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current && !isKeyboardOpen) {
      const textarea = textareaRef.current;
      
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate the required height
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = window.innerHeight * 0.7; // 70vh max
      const minHeight = window.innerHeight * 0.4; // 40vh min
      
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      setTextareaHeight(`${newHeight}px`);
    }
  }, [transcript, isKeyboardOpen]);

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

  // Speaker colors for differentiation
  const speakerColors = [
    'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
    'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
    'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
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
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-6 mediscribe-mobile-transcript">
      {/* Modern Transcript Container */}
      <div className="relative group h-full flex flex-col">
        {/* Clean Background */}
        <div className="absolute inset-0 bg-white" />
        
        {/* Subtle Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-blue-500/10 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        {/* Main Content Structure */}
        <div className="relative h-full flex flex-col p-1 sm:p-1 lg:p-1">
          
          {/* Compact Production Controls */}
          <div className="relative mb-4 sm:mb-3 lg:mb-3 z-10 px-3 sm:px-4 lg:px-4 pt-3 sm:pt-3 lg:pt-3 mediscribe-mobile-controls">
            
            {/* Compact Controls Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-center lg:justify-start">
              
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

              {/* Desktop Upload Button - hidden on mobile */}
              {onFileUpload && (
                <button
                  onClick={handleFileUploadClick}
                  className="transcription-btn-secondary hidden lg:flex items-center min-h-[48px] px-5 shrink-0"
                  disabled={recordingState.isRecording}
                  title={recordingState.isRecording ? "Cannot upload files during recording" : "Upload an audio file (.wav, .mp3, .m4a, .ogg, .webm) for transcription"}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <span className="font-bold block">Upload</span>
                    <span className="text-xs opacity-70">Audio file</span>
                  </div>
                </button>
              )}

              {/* Mobile Floating Upload Button - positioned absolutely */}
              {onFileUpload && (
                <button
                  onClick={handleFileUploadClick}
                  disabled={recordingState.isRecording}
                  title={recordingState.isRecording ? "Cannot upload files during recording" : "Upload an audio file for transcription"}
                  className={`
                    lg:hidden mediscribe-mobile-floating-upload
                    flex items-center justify-center
                    ${recordingState.isRecording ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Upload className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
            onChange={handleFileChange}
            className="hidden"
            multiple={false}
          />

          
          {/* Premium Text Area */}
          <div className="flex-1 relative overflow-hidden">
            <div className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-2xl lg:rounded-2xl border border-indigo-200/60 dark:border-indigo-600/60 shadow-inner shadow-indigo-900/5 dark:shadow-black/20 overflow-hidden mediscribe-mobile-transcript">
              
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
                  <textarea
                    ref={textareaRef}
                    value={transcript}
                    onChange={(e) => onEditChange(e.target.value)}
                    className={`transcription-textarea w-full resize-none border-0 px-4 py-4 sm:px-6 sm:py-4 lg:px-6 lg:py-4 text-base sm:text-base lg:text-base leading-relaxed overflow-y-auto mediscribe-mobile-textarea transition-all duration-300 ${
                      isKeyboardOpen ? 'mediscribe-keyboard-active' : ''
                    }`}
                    placeholder={`Your medical transcript will appear here with real-time precision${enableSpeakerDiarization ? ' with speaker separation for doctor-patient conversations' : ''}. You can edit this text at any time...`}
                    dir="auto"
                    style={{ 
                      background: 'transparent',
                      fontSize: '16px', // Prevents zoom on iOS
                      height: textareaHeight,
                      minHeight: isKeyboardOpen ? '120px' : textareaHeight,
                      maxHeight: isKeyboardOpen ? 'calc(100vh - 200px)' : '70vh',
                      WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                    }}
                  />
                  
                  {/* Modern Scroll Indicator - MediScribe Theme */}
                  <div className="absolute right-2 top-4 bottom-4 w-1 bg-[#90cdf4]/40 rounded-full overflow-hidden pointer-events-none">
                    <div className="w-full bg-gradient-to-b from-[#1a365d] to-[#2b6cb0] rounded-full transition-all duration-300" style={{height: '25%'}} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-transparent rounded-3xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-3xl" />
      </div>
    </div>
  );
};