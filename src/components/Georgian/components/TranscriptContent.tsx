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
    <div className="flex flex-col h-full p-6 bg-gradient-to-br from-indigo-50/80 via-purple-50/90 to-pink-50/60 dark:from-indigo-900/80 dark:via-purple-800/90 dark:to-pink-900/40">
      {/* World-Class Transcript Container */}
      <div className="relative group h-full flex flex-col">
        {/* Sophisticated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-indigo-50/98 to-purple-50/95 dark:from-gray-800/95 dark:via-indigo-900/70 dark:to-purple-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-indigo-900/10 dark:shadow-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-transparent dark:from-white/5 rounded-3xl" />
        <div className="absolute inset-0 border border-white/30 dark:border-white/10 rounded-3xl" />
        
        {/* Premium Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-pink-500/20 dark:from-indigo-400/20 dark:via-purple-400/15 dark:to-pink-400/20 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        {/* Main Content Structure */}
        <div className="relative h-full flex flex-col p-1">
          
          {/* Compact Production Controls */}
          <div className="relative mb-3 z-10 px-3 sm:px-4 pt-3">
            
            {/* Compact Controls Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              
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

              {/* Compact Upload Button */}
              {onFileUpload && (
                <button
                  onClick={handleFileUploadClick}
                  className="group relative overflow-hidden h-12 px-4 shrink-0"
                  disabled={recordingState.isRecording}
                  title={recordingState.isRecording ? "Cannot upload files during recording" : "Upload an audio file (.wav, .mp3, .m4a, .ogg, .webm) for transcription"}
                >
                  {/* Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/50 rounded-xl" />
                  
                  {/* Glass Effect */}
                  <div className="absolute inset-0 bg-white/40 dark:bg-white/10 backdrop-blur-sm rounded-xl" />
                  
                  {/* Border */}
                  <div className="absolute inset-0 border border-slate-200 dark:border-slate-600 rounded-xl group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-all duration-200" />
                  
                  {/* Content */}
                  <div className="relative flex items-center space-x-2 h-full">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block">
                        Upload
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Audio file
                      </span>
                    </div>
                  </div>
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
            <div className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-indigo-200/60 dark:border-indigo-600/60 shadow-inner shadow-indigo-900/5 dark:shadow-black/20 overflow-hidden">
              
              {/* Conditional Content Display */}
              {hasSpeakers && speakers && speakers.length > 0 ? (
                /* Speaker-differentiated view */
                <div className="h-full overflow-y-auto">
                  {renderSpeakerTranscript}
                </div>
              ) : (
                /* Regular editable text area */
                <div className="relative h-full p-0">
                  <textarea
                    value={transcript}
                    onChange={(e) => onEditChange(e.target.value)}
                    className="w-full h-full resize-none bg-transparent text-slate-800 dark:text-slate-100 px-6 py-4 focus:outline-none text-base leading-relaxed overflow-y-auto selection:bg-indigo-200/60 dark:selection:bg-indigo-800/60 selection:text-indigo-900 dark:selection:text-indigo-100"
                    placeholder={`Your medical transcript will appear here with real-time precision${enableSpeakerDiarization ? ' with speaker separation for doctor-patient conversations' : ''}. You can edit this text at any time...`}
                    dir="auto"
                    style={{ 
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", system-ui, ui-sans-serif, Helvetica, Arial, sans-serif',
                      lineHeight: '1.7',
                      letterSpacing: '0.01em'
                    }}
                  />
                  
                  {/* Elegant Scroll Indicator */}
                  <div className="absolute right-2 top-4 bottom-4 w-1 bg-indigo-200/60 dark:bg-indigo-600/60 rounded-full overflow-hidden pointer-events-none">
                    <div className="w-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{height: '25%'}} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-3xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-purple-400/20 to-transparent rounded-3xl" />
      </div>
    </div>
  );
};