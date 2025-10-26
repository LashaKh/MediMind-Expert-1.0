import { useState, useCallback, useRef, useEffect } from 'react';
import { safeAsync, ErrorSeverity } from '../lib/utils/errorHandling';

interface UseChatVoiceInputOptions {
  language?: string; // e.g., 'en-US', 'ka-GE', 'ru-RU'
  onTranscriptReceived?: (transcript: string) => void;
}

interface RecordingState {
  isRecording: boolean;
  audioLevel: number;
  isProcessing: boolean;
}

const GOOGLE_STT_URL = 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/google-stt-proxy';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3F0b2xzamdncHl2ZHRkcHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNjk3NzAsImV4cCI6MjA2Mzk0NTc3MH0.GcjFaO69jmW_nuJU4S8mZJdgi7PyM5Z736vGKvnKCyE';

/**
 * Simplified voice input hook for chat messages
 * Uses ONLY Google Speech-to-Text (Gemini/Chirp model)
 * No parallel processing, no Enagram API calls
 */
export const useChatVoiceInput = (options: UseChatVoiceInputOptions = {}) => {
  const { language = 'en-US', onTranscriptReceived } = options;

  // State
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    audioLevel: 0,
    isProcessing: false
  });
  const [error, setError] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const preInitializedStreamRef = useRef<MediaStream | null>(null);

  // Pre-initialize microphone for instant recording start
  useEffect(() => {
    const preInitializeMicrophone = async () => {
      if (preInitializedStreamRef.current) return;

      const [stream, error] = await safeAsync(
        async () => {
          const constraints: MediaStreamConstraints = {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000
            }
          };
          return await navigator.mediaDevices.getUserMedia(constraints);
        },
        {
          context: 'pre-initialize microphone for chat voice input',
          severity: ErrorSeverity.LOW
        }
      );

      if (!error && stream) {
        preInitializedStreamRef.current = stream;
        console.log('🎙️ Chat voice: Microphone pre-initialized');
      }
    };

    preInitializeMicrophone();

    // Cleanup on unmount
    return () => {
      if (preInitializedStreamRef.current) {
        preInitializedStreamRef.current.getTracks().forEach(track => track.stop());
        preInitializedStreamRef.current = null;
      }
    };
  }, []);

  // Audio level monitoring
  const startAudioLevelMonitoring = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(100, (average / 128) * 100);

        setRecordingState(prev => ({ ...prev, audioLevel: normalizedLevel }));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn('Failed to start audio level monitoring:', err);
    }
  }, []);

  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Convert audio blob to base64
  const convertAudioToBase64 = useCallback(async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        } catch (error) {
          reject(new Error('Failed to convert audio to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioBlob);
    });
  }, []);

  // Transcribe audio using Google STT
  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    console.log('🎯 Chat voice: Transcribing with Google STT only');
    console.log('🌐 Language code being sent:', language);

    const base64Audio = await convertAudioToBase64(audioBlob);

    const request = {
      theAudioDataAsBase64: base64Audio,
      Language: language,
      Autocorrect: true,
      Punctuation: true,
      Digits: true
    };

    console.log('📤 Request details:', {
      language: request.Language,
      audioSize: Math.round(audioBlob.size / 1024) + 'KB',
      autocorrect: request.Autocorrect,
      punctuation: request.Punctuation
    });

    const [response, error] = await safeAsync(
      () => fetch(GOOGLE_STT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }),
      {
        context: 'Google STT transcription for chat',
        severity: ErrorSeverity.MEDIUM
      }
    );

    if (error) {
      throw new Error(`Transcription request failed: ${error.message}`);
    }

    if (!response.ok) {
      let errorMessage = `Transcription failed: ${response.status}`;
      try {
        const errorBody = await response.text();
        const errorData = JSON.parse(errorBody);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Use basic error message
      }
      throw new Error(errorMessage);
    }

    const transcript = await response.text();
    console.log('✅ Chat voice: Transcription successful:', transcript.substring(0, 50) + '...');
    console.log('📊 Transcript details:', {
      length: transcript.length,
      trimmedLength: transcript.trim().length,
      isEmpty: !transcript.trim(),
      rawPreview: JSON.stringify(transcript.substring(0, 100))
    });

    return transcript.trim();
  }, [language, convertAudioToBase64]);

  // Start recording
  const startRecording = useCallback(async () => {
    console.log('🎙️ Chat voice: Starting recording');
    setError(null);
    audioChunksRef.current = [];

    // Use pre-initialized stream if available
    let stream = preInitializedStreamRef.current;

    if (!stream) {
      const [newStream, streamError] = await safeAsync(
        async () => {
          const constraints: MediaStreamConstraints = {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000
            }
          };
          return await navigator.mediaDevices.getUserMedia(constraints);
        },
        {
          context: 'get microphone access for chat voice input',
          severity: ErrorSeverity.MEDIUM
        }
      );

      if (streamError || !newStream) {
        setError('Could not access microphone. Please check permissions.');
        throw new Error('Microphone access denied');
      }

      stream = newStream;
    }

    streamRef.current = stream;

    // Start audio level monitoring
    startAudioLevelMonitoring(stream);

    // Create MediaRecorder
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start(1000); // Collect data every second
    mediaRecorderRef.current = mediaRecorder;

    setRecordingState(prev => ({ ...prev, isRecording: true }));
    console.log('✅ Chat voice: Recording started');
  }, [startAudioLevelMonitoring]);

  // Stop recording and transcribe
  const stopRecording = useCallback(async () => {
    console.log('🛑 Chat voice: Stopping recording');

    if (!mediaRecorderRef.current) {
      console.warn('No active recording to stop');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current!;

      mediaRecorder.onstop = async () => {
        console.log('📦 Chat voice: Processing recorded audio');
        stopAudioLevelMonitoring();

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log(`🎵 Chat voice: Audio blob size: ${Math.round(audioBlob.size / 1024)}KB`);

        // Clean up stream
        if (streamRef.current && streamRef.current !== preInitializedStreamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Update state
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          isProcessing: true,
          audioLevel: 0
        }));

        // Transcribe
        const [transcript, transcribeError] = await safeAsync(
          () => transcribeAudio(audioBlob),
          {
            context: 'transcribe chat voice input',
            severity: ErrorSeverity.MEDIUM
          }
        );

        setRecordingState(prev => ({ ...prev, isProcessing: false }));

        if (transcribeError) {
          setError(transcribeError.userMessage || 'Transcription failed');
          reject(transcribeError);
          return;
        }

        if (transcript && transcript.length > 0) {
          console.log('✅ Chat voice: Transcript ready:', transcript);
          onTranscriptReceived?.(transcript);
        } else {
          console.warn('⚠️ Chat voice: Empty transcript received');
          setError('No speech detected. Please try again.');
        }

        resolve();
      };

      mediaRecorder.stop();
    });
  }, [stopAudioLevelMonitoring, transcribeAudio, onTranscriptReceived]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && recordingState.isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current && streamRef.current !== preInitializedStreamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopAudioLevelMonitoring();
    };
  }, [recordingState.isRecording, stopAudioLevelMonitoring]);

  return {
    recordingState,
    startRecording,
    stopRecording,
    error,
    clearError
  };
};
