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
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-gray-800 dark:via-gray-700/80 dark:to-blue-900/10">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2 min-h-0 max-h-[calc(100vh-120px)]">
        {/* Medical Toolbar - Compact */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 mb-2">
          <MedicalCard className="p-2 w-full sm:w-auto" variant="elevated">
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              {/* Medical Voice Record Button */}
              <MedicalButton
                onClick={onContextVoiceRecord}
                variant={isRecordingContext ? "destructive" : "primary"}
                size="lg"
                leftIcon={isRecordingContext ? Square : Mic}
                className="min-w-[140px]"
                aria-label={isRecordingContext ? "Stop voice recording" : "Start voice recording"}
              >
                {isRecordingContext ? (
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold">Stop Recording</span>
                    {contextRecordingState.duration > 0 && (
                      <span className="text-xs font-mono opacity-90">{formatTime(contextRecordingState.duration)}</span>
                    )}
                  </div>
                ) : (
                  <span>Record Voice Note</span>
                )}
              </MedicalButton>

              {/* Medical Action Buttons */}
              <div className="flex items-center space-x-2">
                <MedicalButton
                  variant="ghost"
                  size="icon"
                  aria-label="Undo"
                >
                  <Undo className="w-4 h-4" />
                </MedicalButton>
                <MedicalButton
                  variant="ghost"
                  size="icon"
                  aria-label="Redo"
                >
                  <Redo className="w-4 h-4" />
                </MedicalButton>
              </div>
            </div>
          </MedicalCard>

          {/* Context Actions */}
          <MedicalCard className="p-2 w-full sm:w-auto">
            <div className="flex items-center justify-center space-x-3">
              <MedicalButton
                onClick={onCopyContext}
                variant="secondary"
                size="md"
                leftIcon={Copy}
                className="min-w-[100px]"
              >
                Copy Text
              </MedicalButton>
            </div>
          </MedicalCard>
        </div>

        {/* Premium Attached Files Display */}
        {attachedFiles.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Attached Files</h4>
            <div className="flex flex-wrap gap-3">
              {attachedFiles.map((file, index) => (
                <div key={index} className="group relative flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-700/50 px-4 py-2 rounded-xl text-sm hover:shadow-lg transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <FileIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-900 dark:text-blue-100 font-semibold truncate max-w-32">
                      {file.name}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <MedicalButton
                    onClick={() => onRemoveFile(index)}
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-medical-error-500 hover:text-medical-error-600 hover:bg-medical-error-50 dark:hover:bg-medical-error-900/30"
                    aria-label="Remove attached file"
                  >
                    <X className="w-4 h-4" />
                  </MedicalButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium Text Area - Constrained height */}
        <div className="flex-1 flex flex-col min-h-0 max-h-[calc(100vh-240px)]">
          <div className="flex-1 relative bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-gray-800 dark:via-gray-700/80 dark:to-blue-900/10 backdrop-blur-xl rounded-2xl border border-slate-200/30 dark:border-gray-600/30 shadow-xl shadow-slate-500/10 overflow-hidden h-full max-h-[calc(100vh-280px)]">
            {/* Glass Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-gray-700/20 pointer-events-none rounded-3xl" />
            
            <textarea
              value={contextText}
              onChange={(e) => onContextChange(e.target.value)}
              placeholder="Add patient information, context notes, or medical history here..."
              className="relative z-10 w-full h-full p-3 pr-10 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm leading-relaxed"
              style={{ 
                fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                maxHeight: 'calc(100vh - 320px)'
              }}
            />
            
            {/* Premium Attachment Button */}
            <div className="absolute bottom-3 right-3 z-20">
              <input
                ref={contextFileInputRef}
                type="file"
                multiple
                onChange={onFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp3,.wav"
              />
              <div className="relative">
                <MedicalButton
                  onClick={() => contextFileInputRef.current?.click()}
                  variant="primary"
                  size="icon"
                  className="shadow-lg"
                  aria-label="Attach files"
                >
                  <Paperclip className="w-5 h-5" />
                </MedicalButton>
              </div>
            </div>
            
            {/* Premium Status Indicators */}
            {isRecordingContext && (
              <div className="absolute top-3 right-3 flex items-center space-x-3 bg-gradient-to-r from-red-500/90 to-rose-600/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-white shadow-lg shadow-red-500/25">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-white/70 rounded-full animate-ping" />
                </div>
                <span className="text-sm font-bold">
                  Recording {formatTime(contextRecordingState.duration)}
                </span>
              </div>
            )}
            
            {isContextTranscribing && !isRecordingContext && (
              <div className="absolute top-3 right-3 flex items-center space-x-3 bg-gradient-to-r from-blue-500/90 to-indigo-600/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-white shadow-lg shadow-blue-500/25">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span className="text-sm font-bold">Processing...</span>
              </div>
            )}
            
            {contextTTSError && (
              <div className="absolute top-3 right-3 flex items-center space-x-3 bg-gradient-to-r from-red-500/90 to-rose-600/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-white shadow-lg shadow-red-500/25">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-bold">Recording failed</span>
                {onClearError && (
                  <MedicalButton
                    onClick={onClearError}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    aria-label="Clear error"
                  >
                    <X className="w-4 h-4" />
                  </MedicalButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};