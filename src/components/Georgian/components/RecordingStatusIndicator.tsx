import React from 'react';
import { 
  Clock, 
  Volume2, 
  Star, 
  Sparkles, 
  Gem, 
  TrendingUp, 
  Waves, 
  Brain 
} from 'lucide-react';

interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioLevel: number;
  isProcessingChunks: boolean;
  processedChunks: number;
  totalChunks: number;
}

interface RecordingStatusIndicatorProps {
  recordingState: RecordingState;
  formatTime: (ms: number) => string;
}

export const RecordingStatusIndicator: React.FC<RecordingStatusIndicatorProps> = ({
  recordingState,
  formatTime
}) => {
  return (
    <>
      {/* Premium Live Recording Status */}
      {recordingState.isRecording && (
        <div className="relative bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 dark:from-red-900/20 dark:via-rose-900/20 dark:to-pink-900/20 border border-red-200/40 dark:border-red-700/40 rounded-2xl p-6 mb-6 shadow-lg shadow-red-500/10 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-transparent to-red-600 animate-pulse"/>
            <Waves className="absolute top-4 right-4 w-32 h-32 text-red-300 opacity-10 animate-pulse"/>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Enhanced Live Indicator */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-red-500/50 shadow-lg" />
                  <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-ping" />
                  <div className="absolute -inset-1 border border-red-300 rounded-full animate-pulse" />
                </div>
                <div>
                  <span className="text-red-700 dark:text-red-300 font-bold text-lg">LIVE</span>
                  <p className="text-red-600 dark:text-red-400 text-xs font-medium">Recording Active</p>
                </div>
              </div>
              
              {/* Premium Timer */}
              <div className="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-red-200/30 dark:border-red-700/30">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-mono font-bold text-xl text-red-700 dark:text-red-300">{formatTime(recordingState.duration)}</span>
              </div>
            </div>
            
            {/* Premium Audio Level Visualizer */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 bg-gradient-to-t from-green-500 to-emerald-400 rounded-full transition-all duration-150 ${
                        recordingState.audioLevel > (bar * 20) ? 'h-6 opacity-100' : 'h-2 opacity-30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[40px]">
                  {Math.round(recordingState.audioLevel)}%
                </span>
              </div>
              
              {/* Recording Quality Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/30 rounded-lg">
                <Star className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">HD Quality</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium AI Processing Status */}
      {recordingState.isProcessingChunks && (
        <div className="relative bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 border border-emerald-200/40 dark:border-emerald-700/40 rounded-2xl p-6 mb-6 shadow-lg shadow-emerald-500/10 overflow-hidden">
          {/* Animated AI Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-transparent to-emerald-600 animate-pulse"/>
            <Brain className="absolute top-4 right-4 w-32 h-32 text-emerald-300 opacity-10 animate-pulse"/>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Sophisticated Processing Animation */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Sparkles className="w-6 h-6 text-white animate-spin" />
                </div>
                <div className="absolute -inset-1 border-2 border-emerald-400 rounded-xl animate-pulse opacity-50" />
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-lg">
                    AI Processing
                  </span>
                  <Gem className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  Real-time transcription with medical intelligence
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((dot) => (
                      <div
                        key={dot}
                        className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${dot * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                    Intelligent segmentation active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 border border-emerald-200/50 dark:border-emerald-700/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 text-sm font-bold">Neural Mode</span>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Legacy Chunked Processing Status */}
      {recordingState.isProcessingChunks && recordingState.totalChunks > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-700/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-blue-700 dark:text-blue-300 font-semibold">
                Processing: {recordingState.processedChunks}/{recordingState.totalChunks} chunks
              </span>
            </div>
            <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
              {Math.round((recordingState.processedChunks / recordingState.totalChunks) * 100)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800/30 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ 
                width: `${recordingState.totalChunks > 0 ? (recordingState.processedChunks / recordingState.totalChunks) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};