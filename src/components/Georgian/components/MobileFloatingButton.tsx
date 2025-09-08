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
        fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 mediscribe-mobile-fab mediscribe-touch-target mediscribe-haptic-feedback
        ${isRecording 
          ? (canStop && !disabled 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/40 mediscribe-mobile-fab recording' 
              : 'bg-gray-300 cursor-not-allowed shadow-gray-300/40')
          : (canRecord && !disabled 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/40' 
              : 'bg-gray-300 cursor-not-allowed shadow-gray-300/40')
        }
        ${isEnabled ? 'hover:scale-110' : ''}
        lg:hidden
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
      {/* Background Glow */}
      <div className={`
        absolute inset-0 rounded-full opacity-0 transition-opacity duration-300
        ${isRecording 
          ? 'bg-red-500/20 group-hover:opacity-100' 
          : 'bg-emerald-500/20 group-hover:opacity-100'
        }
        ${isEnabled ? 'group-hover:opacity-100' : ''}
      `} />

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