import React from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface MobileFloatingButtonProps {
  isRecording: boolean;
  canRecord: boolean;
  canStop: boolean;
  isProcessing?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  disabled?: boolean;
}

export const MobileFloatingButton: React.FC<MobileFloatingButtonProps> = ({
  isRecording,
  canRecord,
  canStop,
  isProcessing = false,
  onStartRecording,
  onStopRecording,
  disabled = false
}) => {
  const handleClick = () => {
    if (disabled) return;
    
    if (isRecording) {
      if (canStop && onStopRecording) {
        onStopRecording();
      }
    } else {
      if (canRecord && onStartRecording) {
        onStartRecording();
      }
    }
  };

  const canInteract = isRecording ? canStop : canRecord;
  const isEnabled = canInteract && !disabled && !isProcessing;

  return (
    <button
      onClick={handleClick}
      disabled={!isEnabled}
      className={`
        transcription-record-btn fixed bottom-6 right-6 z-50 w-16 h-16 shadow-2xl mediscribe-mobile-fab mediscribe-touch-target mediscribe-haptic-feedback lg:hidden
        ${isRecording ? 'recording' : ''}
        ${!isEnabled ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      title={
        disabled 
          ? "Recording controls disabled" 
          : isRecording 
            ? (canStop ? "Stop recording" : "Cannot stop recording")
            : (canRecord ? "Start recording" : "Cannot start recording")
      }
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Icon Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isProcessing ? (
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        ) : isRecording ? (
          <Square className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}
      </div>

      {/* Pulse Effect for Recording */}
      {isRecording && isEnabled && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-red-400/60 animate-pulse" />
          <div className="absolute -inset-2 rounded-full border border-red-300/30 animate-ping" />
        </>
      )}

      {/* Haptic Feedback Overlay */}
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-100 active:opacity-100" />
    </button>
  );
};

export default MobileFloatingButton;