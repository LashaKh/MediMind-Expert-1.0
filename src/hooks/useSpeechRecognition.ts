import { useState, useCallback, useRef } from 'react';
import { GoogleSpeechService } from '../lib/speech/googleSpeechService';

interface UseSpeechRecognitionProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
  language?: string;
}

export const useSpeechRecognition = ({
  onTranscript,
  onError,
  language = 'ka-GE'
}: UseSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const googleSpeechRef = useRef<GoogleSpeechService | null>(null);

  // Initialize the service only once
  if (!googleSpeechRef.current) {
    googleSpeechRef.current = new GoogleSpeechService();
  }

  const startRecording = useCallback(async () => {
    try {
      if (!googleSpeechRef.current) {
        throw new Error('Speech service not initialized');
      }

      setIsRecording(true);
      await googleSpeechRef.current.startRecording(onTranscript, language);
    } catch (error) {
      setIsRecording(false);
      onError(error instanceof Error ? error.message : 'Failed to start recording');
    }
  }, [language, onTranscript, onError]);

  const stopRecording = useCallback(async () => {
    try {
      if (!googleSpeechRef.current) {
        throw new Error('Speech service not initialized');
      }

      await googleSpeechRef.current.stopRecording();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to stop recording');
    } finally {
      setIsRecording(false);
    }
  }, [onError]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    isSupported: true
  };
};