import { useState, useCallback, useRef } from 'react';
import { GoogleSpeechService } from '../lib/speech/googleSpeechService';

interface UseGoogleSpeechProps {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
  language?: string;
}

export const useGoogleSpeech = ({
  onTranscript,
  onError,
  language = 'ka-GE'
}: UseGoogleSpeechProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechService = useRef(new GoogleSpeechService());

  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const transcript = await speechService.current.transcribeAudio(audioBlob, { languageCode: language });
          onTranscript(transcript);
        } catch (error) {
          onError(error instanceof Error ? error.message : 'Transcription failed');
        }
      };

      recorder.start(1000); // Collect data in 1-second chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      onError('Failed to start recording');
    }
  }, [language]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    isSupported: true
  };
};