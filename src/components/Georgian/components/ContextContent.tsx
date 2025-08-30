import React, { useRef } from 'react';
import { 
  User, 
  Mic, 
  Square, 
  Copy, 
  Undo, 
  Redo, 
  FileIcon, 
  X, 
  Paperclip, 
  AlertCircle 
} from 'lucide-react';
import { MedicalButton, MedicalCard } from '../../ui/MedicalDesignSystem';

interface ContextRecordingState {
  isRecording: boolean;
  duration: number;
}

interface ContextContentProps {
  contextText: string;
  onContextChange: (text: string) => void;
  attachedFiles: File[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  isRecordingContext: boolean;
  isContextTranscribing: boolean;
  contextRecordingState: ContextRecordingState;
  contextTTSError?: string | null;
  onContextVoiceRecord: () => void;
  onCopyContext: () => void;
  onClearError?: () => void;
  formatTime: (ms: number) => string;
}

export const ContextContent: React.FC<ContextContentProps> = ({
  contextText,
  onContextChange,
  attachedFiles,
  onFileUpload,
  onRemoveFile,
  isRecordingContext,
  isContextTranscribing,
  contextRecordingState,
  contextTTSError,
  onContextVoiceRecord,
  onCopyContext,
  onClearError,
  formatTime
}) => {
  const contextFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full p-6 bg-gradient-to-br from-indigo-50/80 via-purple-50/90 to-pink-50/60 dark:from-indigo-900/80 dark:via-purple-800/90 dark:to-pink-900/40">
      {/* World-Class Context Container */}
      <div className="relative group h-full flex flex-col">
        {/* Sophisticated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-indigo-50/98 to-purple-50/95 dark:from-gray-800/95 dark:via-indigo-900/70 dark:to-purple-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-indigo-900/10 dark:shadow-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-transparent dark:from-white/5 rounded-3xl" />
        <div className="absolute inset-0 border border-white/30 dark:border-white/10 rounded-3xl" />
        
        {/* Premium Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-pink-500/20 dark:from-indigo-400/20 dark:via-purple-400/15 dark:to-pink-400/20 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        {/* Main Content Structure */}
        <div className="relative h-full flex flex-col p-1">
          
          {/* Elegant Toolbar Header */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-indigo-200/50 dark:border-indigo-600/50 shadow-lg shadow-indigo-500/10 mb-4">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left Actions */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg shadow-purple-500/40 animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">Clinical Context</span>
                </div>
                
                {/* Voice Recording Button */}
                <button
                  onClick={onContextVoiceRecord}
                  className={`
                    group relative overflow-hidden px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center space-x-2
                    ${isRecordingContext 
                      ? 'bg-gradient-to-r from-red-500 via-rose-600 to-red-600 hover:from-red-600 hover:via-rose-700 hover:to-red-700 text-white shadow-red-500/30' 
                      : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:via-purple-700 hover:to-indigo-700 text-white shadow-indigo-500/30'
                    }
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse opacity-50" />
                  {isRecordingContext ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecordingContext ? 'Stop' : 'Record'}</span>
                  {isRecordingContext && contextRecordingState.duration > 0 && (
                    <span className="text-xs font-mono opacity-90">
                      {formatTime(contextRecordingState.duration)}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Right Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={onCopyContext}
                  className="px-4 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-600/50 rounded-xl text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-300 flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                
                {/* Attach Files */}
                <button
                  onClick={() => contextFileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300 flex items-center space-x-2 text-sm font-medium"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>Attach</span>
                </button>
                
                <input
                  ref={contextFileInputRef}
                  type="file"
                  multiple
                  onChange={onFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav"
                />
              </div>
            </div>
          </div>
          
          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-4">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-600/50 p-4">
                <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center space-x-2">
                  <FileIcon className="w-4 h-4" />
                  <span>Attached Files ({attachedFiles.length})</span>
                </h4>
                <div className="flex flex-wrap gap-3">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="group relative flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200/50 dark:border-indigo-700/50 px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FileIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-indigo-900 dark:text-indigo-100 font-semibold truncate max-w-40">
                          {file.name}
                        </p>
                        <p className="text-indigo-600 dark:text-indigo-400 text-xs">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveFile(index)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Premium Text Area */}
          <div className="flex-1 relative overflow-hidden">
            <div className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-indigo-200/60 dark:border-indigo-600/60 shadow-inner shadow-indigo-900/5 dark:shadow-black/20 overflow-hidden">
              
              {/* Text Area Header */}
              <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-indigo-50/90 via-purple-50/95 to-indigo-50/90 dark:from-indigo-700/90 dark:via-purple-600/95 dark:to-indigo-700/90 border-b border-indigo-200/50 dark:border-indigo-600/50">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide">Patient Context & Notes</span>
                </div>
                
                {/* Status Indicators */}
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full border border-indigo-200/50 dark:border-indigo-700/50">
                    Private
                  </div>
                  <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full border border-purple-200/50 dark:border-purple-700/50">
                    Encrypted
                  </div>
                </div>
              </div>
              
              {/* Main Text Area */}
              <div className="relative h-[calc(100%-56px)] p-0">
                <textarea
                  value={contextText}
                  onChange={(e) => onContextChange(e.target.value)}
                  className="w-full h-full resize-none bg-transparent text-slate-800 dark:text-slate-100 px-6 py-4 focus:outline-none text-base leading-relaxed overflow-y-auto selection:bg-indigo-200/60 dark:selection:bg-indigo-800/60 selection:text-indigo-900 dark:selection:text-indigo-100"
                  placeholder="Enter patient information, medical history, clinical context, or additional notes here..."
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", system-ui, ui-sans-serif, Helvetica, Arial, sans-serif',
                    lineHeight: '1.7',
                    letterSpacing: '0.01em'
                  }}
                />
                
                {/* Status Overlays */}
                {isRecordingContext && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-gradient-to-r from-red-500/95 to-rose-600/95 backdrop-blur-xl px-4 py-2 rounded-xl text-white shadow-lg shadow-red-500/30">
                    <div className="relative">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 bg-white/70 rounded-full animate-ping" />
                    </div>
                    <span className="text-sm font-semibold">
                      Recording {formatTime(contextRecordingState.duration)}
                    </span>
                  </div>
                )}
                
                {isContextTranscribing && !isRecordingContext && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-gradient-to-r from-indigo-500/95 to-purple-600/95 backdrop-blur-xl px-4 py-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span className="text-sm font-semibold">Processing...</span>
                  </div>
                )}
                
                {contextTTSError && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-gradient-to-r from-red-500/95 to-rose-600/95 backdrop-blur-xl px-4 py-2 rounded-xl text-white shadow-lg shadow-red-500/30">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Recording Failed</span>
                    {onClearError && (
                      <button
                        onClick={onClearError}
                        className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-lg transition-all duration-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
                
                {/* Elegant Scroll Indicator */}
                <div className="absolute right-2 top-4 bottom-4 w-1 bg-indigo-200/60 dark:bg-indigo-600/60 rounded-full overflow-hidden">
                  <div className="w-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{height: '25%'}} />
                </div>
              </div>
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