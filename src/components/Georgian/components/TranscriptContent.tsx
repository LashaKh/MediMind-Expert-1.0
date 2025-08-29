import React, { useRef } from 'react';
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
  Upload
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  isProcessingChunks: boolean;
  processedChunks: number;
  totalChunks: number;
}

interface TranscriptContentProps {
  transcript: string;
  recordingState: RecordingState;
  isEditing: boolean;
  editedTranscript: string;
  error?: string | null;
  hasTranscript: boolean;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditChange: (value: string) => void;
  canRecord?: boolean;
  canStop?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onFileUpload?: (file: File) => void;
}

export const TranscriptContent: React.FC<TranscriptContentProps> = ({
  transcript,
  recordingState,
  isEditing,
  editedTranscript,
  error,
  hasTranscript,
  onEditSave,
  onEditCancel,
  onEditChange,
  canRecord = false,
  canStop = false,
  onStartRecording,
  onStopRecording,
  onFileUpload
}) => {
  const transcriptRef = useRef<HTMLDivElement>(null);

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Transcript
          </h3>
          <div className="flex items-center space-x-3">
            <MedicalButton
              onClick={onEditSave}
              variant="success"
              size="md"
              leftIcon={Save}
              className="min-w-[120px]"
            >
              Save Changes
            </MedicalButton>
            <MedicalButton
              onClick={onEditCancel}
              variant="secondary"
              size="md"
              leftIcon={X}
              className="min-w-[100px]"
            >
              Cancel
            </MedicalButton>
          </div>
        </div>
        
        <textarea
          value={editedTranscript}
          onChange={(e) => onEditChange(e.target.value)}
          className="w-full h-80 p-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed"
          placeholder="Enter Georgian medical transcript here..."
          dir="auto"
        />
      </div>
    );
  }

  if (hasTranscript) {
    return (
      <div className="relative bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-gray-800 dark:via-gray-700/80 dark:to-blue-900/10 backdrop-blur-xl rounded-3xl border border-slate-200/30 dark:border-gray-600/30 shadow-2xl shadow-slate-500/10 min-h-96 flex flex-col overflow-hidden">
        {/* Premium Glass Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent dark:from-gray-700/40 pointer-events-none rounded-3xl" />
        
        {/* World-Class Live Streaming Header */}
        {recordingState.isRecording && (
          <div className="relative z-10 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 dark:from-emerald-900/30 dark:via-green-900/30 dark:to-teal-900/30 backdrop-blur-xl border-b border-emerald-200/30 dark:border-emerald-700/30">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                {/* Premium Live Indicator */}
                <div className="relative">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-emerald-500/50 shadow-lg" />
                  <div className="absolute inset-0 w-4 h-4 bg-emerald-400 rounded-full animate-ping" />
                  <div className="absolute -inset-0.5 border border-emerald-300 rounded-full animate-pulse" />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-lg flex items-center space-x-2">
                    <span>Live Transcription</span>
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    AI-powered medical transcription
                  </span>
                </div>
                
                {/* Service Status Indicators */}
                {error && error.includes('experiencing issues') ? (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 border border-amber-200/50 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <span>Service Degraded</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 border border-blue-200/50 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold">
                    <Star className="w-3 h-3" />
                    <span>Premium Quality</span>
                  </div>
                )}
              </div>
              
              {/* Processing Status */}
              {recordingState.isProcessingChunks && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-700/50 rounded-xl">
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="absolute inset-1 w-3 h-3 border border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin animate-reverse" />
                  </div>
                  <span className="text-emerald-700 dark:text-emerald-300 text-sm font-bold">Neural Processing</span>
                </div>
              )}
            </div>
            
            {/* Premium Progress Indicator */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 opacity-30">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse" />
            </div>
          </div>
        )}
        
        {/* Premium Medical Transcript Content */}
        <div 
          ref={transcriptRef}
          className="relative z-10 flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth"
        >
          {/* Content Enhancement Overlay */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/80 dark:from-gray-800/80 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 dark:from-gray-800/80 to-transparent pointer-events-none z-10" />
          
          <div 
            className="relative text-slate-800 dark:text-slate-100 text-lg lg:text-xl leading-loose whitespace-pre-wrap selection:bg-gradient-to-r selection:from-blue-200 selection:to-indigo-200 dark:selection:from-blue-800 dark:selection:to-indigo-800 selection:text-blue-900 dark:selection:text-blue-100"
            style={{ 
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              lineHeight: '1.9',
              textShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            dir="auto"
          >
            {/* Enhanced Text with Gradient Highlights for Medical Terms */}
            <div className="space-y-4">
              {transcript.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p 
                    key={index} 
                    className="transition-all duration-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 rounded-lg p-2 -m-2"
                  >
                    {paragraph}
                  </p>
                )
              ))}
            </div>
            
            {/* Premium Typing Indicator */}
            {recordingState.isRecording && recordingState.isProcessingChunks && (
              <div className="inline-flex items-center ml-4 px-4 py-2 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-purple-900/40 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-2xl shadow-lg">
                <div className="flex space-x-1">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                </div>
                <span className="ml-3 text-sm font-semibold text-blue-700 dark:text-blue-300">Processing...</span>
              </div>
            )}
          </div>
          
          {/* Scroll Progress Indicator */}
          <div className="fixed right-6 top-1/2 transform -translate-y-1/2 w-1 h-32 bg-slate-200 dark:bg-slate-700 rounded-full opacity-50 hover:opacity-100 transition-opacity">
            <div className="w-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style={{height: '30%'}} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-3">
      <textarea
        className="w-full resize-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed overflow-y-auto"
        placeholder="Transcript will appear here..."
        readOnly
        dir="auto"
        style={{ height: 'calc(100vh - 280px)' }}
      />
    </div>
  );
};