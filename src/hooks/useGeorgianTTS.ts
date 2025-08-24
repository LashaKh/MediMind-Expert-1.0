import { useState, useCallback, useRef, useEffect } from 'react';
import { GeorgianTTSService } from '../lib/speech/georgianTTSService';
import { safeAsync } from '../lib/utils/errorHandling';

interface UseGeorgianTTSOptions {
  language?: string;
  autocorrect?: boolean;
  punctuation?: boolean;
  digits?: boolean;
  maxDuration?: number; // in milliseconds, default 25000 (25 seconds)
  chunkSize?: number; // in milliseconds for data collection, default 1000
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
}

interface TranscriptionResult {
  text: string;
  timestamp: number;
  duration: number;
}

interface AuthStatus {
  isAuthenticated: boolean;
  tokenExpiresIn: number | null;
  email: string | null;
}

export const useGeorgianTTS = (options: UseGeorgianTTSOptions = {}) => {
  const {
    language = 'ka-GE',
    autocorrect = true,
    punctuation = true,
    digits = true,
    maxDuration = 25000, // 25 seconds max
    chunkSize = 1000 // 1 second chunks
  } = options;

  // State
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0
  });
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    tokenExpiresIn: null,
    email: null
  });

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const georgianTTSServiceRef = useRef<GeorgianTTSService | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);

  const updateAuthStatus = useCallback(() => {
    if (georgianTTSServiceRef.current) {
      const status = georgianTTSServiceRef.current.getAuthStatus();
      setAuthStatus(status);
    }
  }, []);

  // Initialize service and authenticate
  useEffect(() => {
    if (!georgianTTSServiceRef.current) {
      georgianTTSServiceRef.current = new GeorgianTTSService();
      updateAuthStatus();
      
      // Trigger authentication if not already authenticated
      const initializeAuth = async () => {
        try {
          await georgianTTSServiceRef.current!.initialize();
          updateAuthStatus();
        } catch (error) {
          console.warn('Georgian TTS authentication initialization failed:', error);
          setError('Authentication failed. Please refresh the page.');
        }
      };
      
      initializeAuth();
    }
  }, [updateAuthStatus]);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average audio level
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    const normalizedLevel = Math.min(100, (average / 255) * 100);
    
    setRecordingState(prev => ({ ...prev, audioLevel: normalizedLevel }));
    
    if (recordingState.isRecording && !recordingState.isPaused) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  }, [recordingState.isRecording, recordingState.isPaused]);

  // Duration tracking
  const startDurationTracking = useCallback(() => {
    recordingStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (recordingStartTimeRef.current || Date.now());
      setRecordingState(prev => ({ ...prev, duration: elapsed }));
      
      // Auto-stop if max duration reached
      if (elapsed >= maxDuration) {
        stopRecording();
      }
    }, 100);
  }, [maxDuration]);

  const stopDurationTracking = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Setup audio monitoring
  const setupAudioMonitoring = useCallback(async (stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      source.connect(analyserRef.current);
      monitorAudioLevel();
    } catch (error) {
      console.warn('Audio monitoring setup failed:', error);
    }
  }, [monitorAudioLevel]);

  // Cleanup audio resources
  const cleanupAudioResources = useCallback(() => {
    stopDurationTracking();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
    recordingStartTimeRef.current = null;
  }, [stopDurationTracking]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      
      // Request microphone permission
      const [stream, streamError] = await safeAsync(
        () => navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000, // Optimal for speech recognition
          }
        })
      );
      
      if (streamError) {
        // Enhanced error handling for common microphone permission issues
        let errorMessage = streamError.message;
        
        if (streamError.name === 'NotAllowedError' || streamError.message.includes('Permission denied')) {
          errorMessage = 'Microphone access denied. Please enable microphone permissions in your browser settings and ensure you are using HTTPS or localhost.';
        } else if (streamError.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (streamError.name === 'NotSupportedError') {
          errorMessage = 'Microphone access is not supported in this browser. Please try Chrome, Firefox, Safari, or Edge.';
        } else if (streamError.message.includes('policy violation')) {
          errorMessage = 'Microphone access blocked by browser security policy. Please use HTTPS or enable microphone permissions.';
        }
        
        throw new Error(`Failed to access microphone: ${errorMessage}`);
      }
      
      streamRef.current = stream;
      
      // Setup audio monitoring
      await setupAudioMonitoring(stream);
      
      // Create MediaRecorder
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      
      let selectedType = 'audio/webm;codecs=opus';
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedType = type;
          break;
        }
      }
      
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedType,
        audioBitsPerSecond: 128000
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        setRecordingState(prev => ({ ...prev, isRecording: false }));
        cleanupAudioResources();
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: selectedType });
          await processRecording(audioBlob);
        }
      };
      
      recorder.onerror = (event) => {
        const error = (event as any).error;
        setError(`Recording error: ${error?.message || 'Unknown error'}`);
        cleanupAudioResources();
      };
      
      // Start recording
      recorder.start(chunkSize);
      mediaRecorderRef.current = recorder;
      
      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioLevel: 0
      });
      
      startDurationTracking();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      setError(errorMessage);
      cleanupAudioResources();
    }
  }, [chunkSize, setupAudioMonitoring, startDurationTracking, cleanupAudioResources]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, [recordingState.isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.pause();
      setRecordingState(prev => ({ ...prev, isPaused: true }));
      stopDurationTracking();
    }
  }, [recordingState.isRecording, stopDurationTracking]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isPaused) {
      mediaRecorderRef.current.resume();
      setRecordingState(prev => ({ ...prev, isPaused: false }));
      startDurationTracking();
      monitorAudioLevel();
    }
  }, [recordingState.isPaused, startDurationTracking, monitorAudioLevel]);

  const processRecording = useCallback(async (audioBlob: Blob) => {
    if (!georgianTTSServiceRef.current) {
      setError('Georgian TTS service not initialized');
      return;
    }

    setIsTranscribing(true);
    setError(null);
    
    try {
      const [text, transcriptionError] = await safeAsync(
        () => georgianTTSServiceRef.current!.recognizeSpeech(audioBlob, {
          language,
          autocorrect,
          punctuation,
          digits
        })
      );
      
      if (transcriptionError) {
        throw transcriptionError;
      }
      
      const result: TranscriptionResult = {
        text: text || '',
        timestamp: Date.now(),
        duration: recordingState.duration
      };
      
      setTranscriptionResult(result);
      updateAuthStatus();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
      setError(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  }, [language, autocorrect, punctuation, digits, recordingState.duration, updateAuthStatus]);

  const processFileUpload = useCallback(async (file: File) => {
    if (!georgianTTSServiceRef.current) {
      setError('Georgian TTS service not initialized');
      return null;
    }

    setIsTranscribing(true);
    setError(null);
    
    try {
      const [speakers, transcriptionError] = await safeAsync(
        () => georgianTTSServiceRef.current!.recognizeSpeechFromFile(file, {
          language: language === 'ka-GE' ? 'ka' : language,
          autocorrect,
          punctuation,
          digits,
          speakers: 1
        })
      );
      
      if (transcriptionError) {
        throw transcriptionError;
      }
      
      // Combine all speaker texts
      const combinedText = speakers.map(speaker => speaker.Text).join(' ');
      
      const result: TranscriptionResult = {
        text: combinedText,
        timestamp: Date.now(),
        duration: 0 // File duration not tracked
      };
      
      setTranscriptionResult(result);
      updateAuthStatus();
      
      return speakers;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File transcription failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, [language, autocorrect, punctuation, digits, updateAuthStatus]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setTranscriptionResult(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, [cleanupAudioResources]);

  // Check for browser support
  const isSupported = !!(
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia && 
    window.MediaRecorder
  );

  return {
    // State
    recordingState,
    isTranscribing,
    transcriptionResult,
    error,
    authStatus,
    isSupported,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    processFileUpload,
    clearError,
    clearResult,
    updateAuthStatus,
    
    // Computed values
    canRecord: isSupported && !recordingState.isRecording && !isTranscribing,
    canStop: recordingState.isRecording,
    canPause: recordingState.isRecording && !recordingState.isPaused,
    canResume: recordingState.isRecording && recordingState.isPaused,
    remainingTime: Math.max(0, maxDuration - recordingState.duration),
    isNearMaxDuration: recordingState.duration > maxDuration * 0.9,
    
    // Service reference for advanced usage
    service: georgianTTSServiceRef.current
  };
};