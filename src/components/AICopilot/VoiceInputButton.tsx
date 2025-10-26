import React, { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useChatVoiceInput } from '../../hooks/useChatVoiceInput';
import { getCurrentLanguage } from '../../i18n/i18n';
import { getSTTLanguageCode } from '../../utils/sttLanguageMapper';

interface VoiceInputButtonProps {
  onTranscriptReceived: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscriptReceived,
  disabled = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update language when it changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(getCurrentLanguage());
    };

    // Listen for language changes (i18next emits languageChanged event)
    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  // Get STT language code from current app language
  const sttLanguage = getSTTLanguageCode(currentLanguage);

  // Initialize useChatVoiceInput with current language (Google STT only)
  const {
    recordingState,
    startRecording,
    stopRecording,
    error: voiceError,
    clearError
  } = useChatVoiceInput({
    language: sttLanguage,
    onTranscriptReceived: (transcript) => {
      // Call the callback with the transcript when ready
      if (transcript.trim()) {
        onTranscriptReceived(transcript);
      }
    }
  });

  // Handle recording toggle
  const handleToggleRecording = useCallback(async () => {
    setError(null);
    clearError();

    if (isRecording) {
      // Stop recording
      try {
        await stopRecording();
        setIsRecording(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
        setError(errorMessage);
        console.error('Failed to stop recording:', err);
      }
    } else {
      // Start recording
      try {
        await startRecording();
        setIsRecording(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
        setError(errorMessage);
        console.error('Failed to start recording:', err);
      }
    }
  }, [isRecording, startRecording, stopRecording, clearError]);

  // Sync internal recording state with hook state
  useEffect(() => {
    if (!recordingState.isRecording && isRecording) {
      setIsRecording(false);
    }
  }, [recordingState.isRecording, isRecording]);

  // Display error from voice input hook if any
  useEffect(() => {
    if (voiceError) {
      setError(voiceError);
    }
  }, [voiceError]);

  // Determine button state
  const isProcessing = recordingState.isProcessing;
  const showLoading = isProcessing && !isRecording;
  const isButtonDisabled = disabled || showLoading;

  return (
    <div className="relative">
      <button
        onClick={handleToggleRecording}
        disabled={isButtonDisabled}
        className={`
          min-h-[44px] min-w-[44px] p-2.5 sm:p-3 rounded-lg sm:rounded-xl
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 active:bg-red-700'
            : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 active:bg-white/90'
          }
          backdrop-blur-sm border
          ${isRecording
            ? 'border-red-600'
            : 'border-white/20 dark:border-gray-700/20'
          }
          transition-all duration-200 disabled:opacity-50 focus-enhanced
          shadow-sm hover:shadow-md
          ${className}
        `}
        aria-label={isRecording ? t('chat.stopRecording', 'Stop recording') : t('chat.startRecording', 'Start voice input')}
        title={isRecording
          ? t('chat.stopRecording', 'Stop recording')
          : t('chat.startRecording', 'Start voice input')
        }
      >
        {showLoading ? (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 animate-spin" />
        ) : isRecording ? (
          <div className="relative">
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            {/* Pulsing recording indicator */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        ) : (
          <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Audio level indicator when recording */}
      {isRecording && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${Math.min(recordingState.audioLevel, 100)}%` }}
          />
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && !isRecording && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        </div>
      )}

      {/* Error tooltip */}
      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-500 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
          {error}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-red-500" />
        </div>
      )}
    </div>
  );
};
