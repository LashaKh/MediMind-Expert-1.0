import React from 'react';
import { Mic, Square } from 'lucide-react';

interface RecordingState {
  isRecording: boolean;
}

interface FloatingRecordButtonProps {
  recordingState: RecordingState;
  canRecord: boolean;
  canStop: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const FloatingRecordButton: React.FC<FloatingRecordButtonProps> = ({
  recordingState,
  canRecord,
  canStop,
  onStartRecording,
  onStopRecording
}) => {
  return (
    <div className=""  /* Show on all screen sizes */>
      {!recordingState.isRecording && (
        <div className="fixed bottom-24 right-6 z-50 medical-safe-area-bottom">
          <button
            onClick={canRecord ? onStartRecording : undefined}
            disabled={!canRecord}
            className={`
              medical-touch-target-lg w-20 h-20 rounded-3xl shadow-2xl transform transition-all duration-300 
              premium-hover-lift active:scale-95 flex items-center justify-center relative overflow-hidden
              ${canRecord 
                ? 'transcription-record-btn shadow-blue-500/30' 
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400 shadow-none'
              }
            `}
            style={{ minHeight: '80px', minWidth: '80px' }}
          >
            {canRecord && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-500/20 animate-premium-gradient" />
            )}
            <Mic className="w-10 h-10 relative z-10" />
          </button>
        </div>
      )}
      
      {recordingState.isRecording && (
        <div className="fixed bottom-24 right-6 z-50 medical-safe-area-bottom">
          <div className="relative">
            <button
              onClick={canStop ? onStopRecording : undefined}
              disabled={!canStop}
              className="medical-touch-target-lg w-20 h-20 rounded-3xl shadow-2xl bg-gradient-to-br from-red-500 via-rose-600 to-red-600 hover:from-red-600 hover:via-rose-700 hover:to-red-700 text-white shadow-red-500/30 transform transition-all duration-300 premium-hover-lift active:scale-95 flex items-center justify-center relative overflow-hidden"
              style={{ minHeight: '80px', minWidth: '80px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-rose-500/20 animate-premium-gradient" />
              <Square className="w-10 h-10 relative z-10" />
            </button>
            {/* Enhanced Pulsing Ring Animation */}
            <div className="absolute inset-0 rounded-3xl border-4 border-red-400/60 animate-premium-pulse-ring" />
            <div className="absolute inset-0 rounded-3xl border-2 border-red-300/40 animate-premium-pulse-ring" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      )}
    </div>
  );
};