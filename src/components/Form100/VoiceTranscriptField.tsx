// Voice Transcript Field Component
// Integrated voice recording with Georgian TTS system
// Real-time transcription with <200ms recording start performance

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Volume2,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Waves
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { VoiceTranscriptFieldProps } from '../../types/form100';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';
import './styles/mobile.css';

const VoiceTranscriptField: React.FC<VoiceTranscriptFieldProps> = ({
  value = '',
  onChange,
  sessionId,
  placeholder = "Voice transcript will appear here...",
  disabled = false,
  className,
  showRecordButton = true,
  maxLength = 5000,
  onCombinedTranscriptReady // ADDED: Callback to pass combined transcript function to parent
}) => {
  // Local state for voice recording integration
  const [localTranscript, setLocalTranscript] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Track transcript content when recording starts (to preserve typed text)
  const transcriptAtRecordingStartRef = useRef<string>('');

  // Georgian TTS integration with session isolation
  const {
    recordingState,
    isTranscribing,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearTranscription,
    error: ttsError,
    authStatus,
    getCombinedTranscriptForSubmission // ADDED: Access dual transcripts for Form 100 generation
  } = useGeorgianTTS({
    sessionId,
    enableStreaming: true,
    chunkDuration: 23000, // Optimal for medical consultations
    onLiveTranscriptUpdate: useCallback((newText: string, fullText: string, currentSessionId?: string) => {
      // Only update if session matches or no session filtering
      if (!sessionId || currentSessionId === sessionId) {
        // PRESERVE existing content: combine base content with full transcript from current recording
        const baseContent = transcriptAtRecordingStartRef.current;
        const separator = baseContent && fullText ? '\n\n' : '';
        const combinedContent = baseContent + separator + fullText.trim();

        setLocalTranscript(combinedContent);
        onChange(combinedContent);

      }
    }, [sessionId, onChange])
  });

  // Sync external value changes
  useEffect(() => {
    if (value !== localTranscript && !recordingState.isRecording) {
      setLocalTranscript(value);
      // Also update the ref so next recording will preserve this content
      transcriptAtRecordingStartRef.current = value;
    }
  }, [value, localTranscript, recordingState.isRecording]);

  // ADDED: Expose combined transcript function to parent for Form 100 generation
  useEffect(() => {
    if (onCombinedTranscriptReady && getCombinedTranscriptForSubmission) {
      onCombinedTranscriptReady(getCombinedTranscriptForSubmission);
    }
  }, [onCombinedTranscriptReady, getCombinedTranscriptForSubmission]);

  // Mobile keyboard detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < 600 && window.screen.height > 600) {
        setIsKeyboardVisible(true);
      } else {
        setIsKeyboardVisible(false);
      }
    };

    const handleFocusIn = () => {
      setTimeout(() => {
        handleResize();
      }, 300);
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        setIsKeyboardVisible(false);
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Handle manual text editing
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setLocalTranscript(newValue);
      onChange(newValue);
    }
  };

  // Handle recording toggle
  const handleRecordingToggle = async () => {
    if (recordingState.isRecording) {
      if (recordingState.isPaused) {
        await resumeRecording();
      } else {
        await pauseRecording();
      }
    } else {
      // CRITICAL: Capture current transcript content BEFORE starting recording
      // This preserves any manually typed text or previous recordings
      transcriptAtRecordingStartRef.current = localTranscript;
      await startRecording();
    }
  };

  // Handle stop recording
  const handleStopRecording = async () => {
    await stopRecording();
    // Reset the ref after stopping so next recording starts fresh
  };

  // Handle clear transcript
  const handleClear = () => {
    clearTranscription();
    setLocalTranscript('');
    onChange('');
    // Also reset the recording start ref
    transcriptAtRecordingStartRef.current = '';
  };

  // Format recording duration
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render recording status indicator
  const renderRecordingStatus = () => {
    if (recordingState.isRecording) {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              {recordingState.isPaused ? 'Paused' : 'Recording'}
            </span>
          </div>
          <span className="text-sm font-mono">
            {formatDuration(recordingState.duration)}
          </span>
          {recordingState.isProcessingChunks && (
            <div className="flex items-center space-x-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">Processing...</span>
            </div>
          )}
        </div>
      );
    }

    if (isTranscribing) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Transcribing...</span>
        </div>
      );
    }

    if (localTranscript && !ttsError) {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Transcript ready</span>
        </div>
      );
    }

    return null;
  };

  // Render audio level indicator
  const renderAudioLevel = () => {
    if (!recordingState.isRecording || recordingState.isPaused) return null;

    return (
      <div className="flex items-center space-x-1">
        <Volume2 className="w-4 h-4 text-blue-600" />
        <div className="flex space-x-0.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 h-3 rounded-sm transition-colors duration-100",
                recordingState.audioLevel > (i + 1) * 20 
                  ? "bg-blue-500" 
                  : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "space-y-3 form100-voice-container form100-keyboard-aware",
      isKeyboardVisible && "form100-keyboard-visible",
      className
    )}>
      {/* Header with status and controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-semibold text-gray-700">Voice Transcript</label>
          {renderRecordingStatus()}
        </div>

        {showRecordButton && !disabled && (
          <div className="flex items-center space-x-2 form100-voice-controls">
            {renderAudioLevel()}
            
            {/* Recording controls */}
            <div className="flex items-center space-x-2 form100-mobile-spacing">
              {!recordingState.isRecording ? (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#1a365d]/30 to-[#2b6cb0]/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRecordingToggle}
                    disabled={!authStatus.isAuthenticated}
                    className="relative form100-voice-button h-11 sm:h-10 px-6 sm:px-4 text-base sm:text-sm touch-manipulation
                               bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white font-semibold
                               hover:from-[#2b6cb0] hover:to-[#63b3ed] border-0
                               shadow-lg hover:shadow-xl transition-all duration-300
                               disabled:from-gray-300 disabled:to-gray-400"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Record
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRecordingToggle}
                    className="form100-button h-11 sm:h-9 px-4 sm:px-3 text-base sm:text-sm touch-manipulation"
                  >
                    {recordingState.isPaused ? (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleStopRecording}
                    className="form100-button h-11 sm:h-9 px-4 sm:px-3 text-base sm:text-sm touch-manipulation"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                </>
              )}
              
              {localTranscript && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="form100-button h-11 sm:h-9 px-4 sm:px-3 text-base sm:text-sm text-gray-500 hover:text-red-600 touch-manipulation"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transcript text area */}
      <div className="relative">
        <textarea
          value={localTranscript}
          onChange={handleTextChange}
          placeholder={placeholder}
          disabled={disabled || recordingState.isRecording}
          maxLength={maxLength}
          className={cn(
            "form100-textarea w-full min-h-[390px] sm:min-h-[325px] p-3 border border-gray-300 rounded-lg resize-y",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent form100-focus-ring",
            "transition-all duration-200 touch-manipulation form100-no-zoom",
            "placeholder-gray-400 text-gray-900 text-base sm:text-sm",
            disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
            recordingState.isRecording && "bg-red-50 border-red-200",
            localTranscript && !ttsError && "border-green-300 form100-success-input",
            ttsError && "form100-error-input"
          )}
          rows={16}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {localTranscript.length}/{maxLength}
        </div>

        {/* Recording wave animation overlay */}
        {recordingState.isRecording && !recordingState.isPaused && (
          <div className="absolute top-2 right-2">
            <Waves className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Error display */}
      {ttsError && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Recording Error</p>
            <p className="text-xs text-red-600 mt-1">{ttsError}</p>
          </div>
        </div>
      )}

      {/* Authentication warning */}
      {!authStatus.isAuthenticated && showRecordButton && (
        <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800 font-medium">Authentication Required</p>
            <p className="text-xs text-yellow-600 mt-1">
              Please log in to use voice recording features.
            </p>
          </div>
        </div>
      )}

      {/* Processing status */}
      {recordingState.isProcessingChunks && (
        <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm text-blue-800">
            Processing audio chunks ({recordingState.processedChunks}/{recordingState.totalChunks})
          </span>
        </div>
      )}

    </div>
  );
};

export default VoiceTranscriptField;