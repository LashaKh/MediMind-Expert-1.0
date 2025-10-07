import { useState, useCallback, useRef, useEffect } from 'react';
import { GeorgianTTSService } from '../lib/speech/georgianTTSService';
import { safeAsync } from '../lib/utils/errorHandling';

interface UseGeorgianTTSOptions {
  language?: string;
  autocorrect?: boolean;
  punctuation?: boolean;
  digits?: boolean;
  maxDuration?: number; // in milliseconds, no limit for chunked recording
  chunkSize?: number; // in milliseconds for data collection, default 1000
  chunkDuration?: number; // in milliseconds for each processing chunk, default 20000 (20 seconds)
  enableStreaming?: boolean; // Enable streaming transcription or use single-shot mode, default true
  sessionId?: string; // Session ID for cross-session isolation
  onLiveTranscriptUpdate?: (newText: string, fullText: string, sessionId?: string) => void; // Callback for session-aware real-time updates
  // Speaker diarization options
  enableSpeakerDiarization?: boolean; // Enable speaker separation
  speakers?: number; // Number of speakers to detect (default: 2)
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  isProcessingChunks: boolean;
  processedChunks: number;
  totalChunks: number;
}

interface SpeakerSegment {
  Speaker: string;
  Text: string;
  StartSeconds: number;
  EndSeconds: number;
}

interface TranscriptionResult {
  text: string;
  timestamp: number;
  duration: number;
  // Speaker diarization results
  hasSpeakers?: boolean;
  speakers?: SpeakerSegment[];
}

interface AuthStatus {
  isAuthenticated: boolean;
  tokenExpiresIn: number | null;
  email: string | null;
}

export const useGeorgianTTS = (options: UseGeorgianTTSOptions = {}) => {
  // Use a ref to store current options to avoid stale closure
  const optionsRef = useRef(options);
  optionsRef.current = options;
  
  const {
    language = 'ka-GE',
    autocorrect = true,
    punctuation = true,
    digits = true,
    maxDuration = 0, // No limit by default - unlimited with chunked processing
    chunkSize = 1000, // 1 second chunks for MediaRecorder
    chunkDuration = 20000, // 20 seconds per processing chunk for optimal streaming transcription
    enableStreaming = true, // Enable streaming by default, set to false for single-shot mode
    sessionId, // Session ID for cross-session isolation
    onLiveTranscriptUpdate,
    // Speaker diarization options (for compatibility, but use ref for current values)
    enableSpeakerDiarization = false,
    speakers = 2
  } = options;

  // State
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
    isProcessingChunks: false,
    processedChunks: 0,
    totalChunks: 0
  });
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    tokenExpiresIn: null,
    email: null
  });
  
  // STT model selection state - Default to Fast
  const [selectedSTTModel, setSelectedSTTModel] = useState<'Fast' | 'GoogleChirp'>(() => {
    // Load from localStorage or default to Fast
    const saved = localStorage.getItem('medimind_stt_model');
    const model = (saved === 'Fast' || saved === 'GoogleChirp') ? saved : 'Fast';
    console.log('🎯 STT Model loaded from localStorage:', model, '(saved value:', saved, ')');
    return model;
  });

  // Update ref when state changes
  useEffect(() => {
    selectedSTTModelRef.current = selectedSTTModel;
    console.log('🎯 STT Model ref updated to:', selectedSTTModel);
  }, [selectedSTTModel]);

  // Speaker diarization state
  const [speakerSegments, setSpeakerSegments] = useState<SpeakerSegment[]>([]);
  const [hasSpeakerResults, setHasSpeakerResults] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Track processed segments to prevent duplicates
  const processedSegmentsRef = useRef<number>(0); // Count of processed segments
  const lastProcessedTimeRef = useRef<number>(0); // Last processed timestamp
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const georgianTTSServiceRef = useRef<GeorgianTTSService | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);

  // Chunked processing refs
  const audioChunksForProcessingRef = useRef<Blob[]>([]);
  const chunkProcessingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const combinedTranscriptRef = useRef<string>('');
  const isProcessingActiveRef = useRef<boolean>(false);
  const lastSavedTranscriptLengthRef = useRef<number>(0);
  const failedChunksCountRef = useRef<number>(0);
  const totalProcessedChunksRef = useRef<number>(0);

  // Smart segmentation refs
  const segmentStartTimeRef = useRef<number>(0);

  // STT model ref for async operations
  const selectedSTTModelRef = useRef<'Fast' | 'GoogleChirp'>(selectedSTTModel);
  const lastAudioLevelRef = useRef<number>(0);
  const silenceCountRef = useRef<number>(0);
  const autoRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingAutoRestartRef = useRef<boolean>(false);

  // 🚀 Pre-initialization refs for instant recording
  const preInitializedStreamRef = useRef<MediaStream | null>(null);
  const isPreInitializingRef = useRef<boolean>(false);
  const preInitPromiseRef = useRef<Promise<MediaStream> | null>(null);
  
  // Session ID ref for dynamic updates
  const sessionIdRef = useRef<string | undefined>(sessionId);
  const manualStopRef = useRef<boolean>(false); // Flag to track manual vs auto stops

  // Update session ID ref when prop changes
  useEffect(() => {
    if (sessionId !== sessionIdRef.current) {

      sessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  const updateAuthStatus = useCallback(() => {
    if (georgianTTSServiceRef.current) {
      const status = georgianTTSServiceRef.current.getAuthStatus();
      setAuthStatus(status);
    }
  }, []);

  const updateSelectedSTTModel = useCallback((model: 'Fast' | 'GoogleChirp') => {
    console.log('🎯 STT Model changed from', selectedSTTModel, 'to', model);
    setSelectedSTTModel(model);
    selectedSTTModelRef.current = model; // Update ref immediately
    localStorage.setItem('medimind_stt_model', model);
  }, [selectedSTTModel]);

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

          setError('Authentication failed. Please refresh the page.');
        }
      };
      
      initializeAuth();
    }
  }, [updateAuthStatus]);

  // Smart auto-segmentation handler (declared first to avoid hoisting issues)
  const handleAutoSegmentation = useCallback(async () => {
    if (!mediaRecorderRef.current || 
        mediaRecorderRef.current.state !== 'recording' || 
        pendingAutoRestartRef.current) {
      return; // Silent return - no debug spam
    }

    try {

      // Set flag to prevent duplicate calls
      pendingAutoRestartRef.current = true;

      // CRITICAL FIX: Request final buffered data before stopping in auto-segmentation
      // This ensures no audio is lost between segments
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.requestData();
      }

      // Small delay before stop to ensure data is flushed
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      }, 50); // 50ms is sufficient for auto-segmentation
      
    } catch (error) {

      pendingAutoRestartRef.current = false;
      
      // Clear UI state on error
      setRecordingState(prev => ({ 
        ...prev, 
        isProcessingChunks: false 
      }));
    }
  }, []);

  // Audio level monitoring with silence detection
  const monitorAudioLevel = useCallback(() => {
    // Safety check
    if (!analyserRef.current || !dataArrayRef.current) {

      return;
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average audio level
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    const normalizedLevel = Math.min(100, (average / 255) * 100);
    
    // Silence detection for smart segmentation
    const currentTime = Date.now();
    
    // Initialize segment start time if not set
    if (!segmentStartTimeRef.current || segmentStartTimeRef.current <= 0) {
      segmentStartTimeRef.current = currentTime;
    }
    
    const segmentDuration = Math.max(0, currentTime - segmentStartTimeRef.current);
    
    // OPTIMIZED: 15-second automatic restart for faster word capture
    // Different segment durations based on STT model
    // Google: 5 seconds for live feel, Enagram: 15 seconds
    const isGoogleSTT = selectedSTTModelRef.current === 'GoogleChirp';
    const maxSegmentDuration = isGoogleSTT ? 5000 : 15000; // Google: 5s, Enagram: 15s
    
    // Clean status logging every 5 seconds (disabled in production)
    // if (segmentDuration % 5000 < 50) { // Every 5 seconds
    //   const secondsElapsed = Math.round(segmentDuration/1000);
    //   const secondsRemaining = Math.max(0, 15 - secondsElapsed);
    //   console.log(`⏱️ Recording: ${secondsElapsed}s elapsed, ${secondsRemaining}s until auto-restart, audio: ${Math.round(normalizedLevel)}%`);
    // }
    
    // Execute 15-second restart
    if (segmentDuration >= maxSegmentDuration && !pendingAutoRestartRef.current) {

      // SEAMLESS UI: No visible processing indicator for auto-segments to prevent blink/refresh
      // Processing happens in background while maintaining continuous recording visual
      
      handleAutoSegmentation();
      return; // Don't continue the loop - segmentation will restart it
    }
    
    lastAudioLevelRef.current = normalizedLevel;
    setRecordingState(prev => ({ ...prev, audioLevel: normalizedLevel }));
    
    // CRITICAL: Continue the animation frame loop
    // Check MediaRecorder state directly - don't rely on React state in callback
    const shouldContinueMonitoring = mediaRecorderRef.current && 
                                   mediaRecorderRef.current.state === 'recording' && 
                                   !pendingAutoRestartRef.current;
    
    if (shouldContinueMonitoring) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    } else {
      // Debug only when monitoring actually stops
      const hasRecorder = !!mediaRecorderRef.current;
      const recorderState = mediaRecorderRef.current?.state;
      const isPending = pendingAutoRestartRef.current;

      // Fix state mismatch: if MediaRecorder is still recording but monitoring stopped
      if (recorderState === 'recording' && !isPending) {

        mediaRecorderRef.current?.stop();
        mediaRecorderRef.current = null;
        setRecordingState(prev => ({ ...prev, isRecording: false }));
        cleanupAudioResources();
      }
    }
  }, [handleAutoSegmentation]); // Remove recordingState dependencies that recreate the callback

  // Duration tracking
  const startDurationTracking = useCallback(() => {
    recordingStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (recordingStartTimeRef.current || Date.now());
      setRecordingState(prev => ({ ...prev, duration: elapsed }));
      
      // Auto-stop if max duration reached (optional limit)
      if (maxDuration > 0 && elapsed >= maxDuration) {
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

    }
  }, [monitorAudioLevel]);

  // 🚀 Performance-optimized microphone pre-initialization for <200ms recording start
  const preInitializeMicrophone = useCallback(async (): Promise<MediaStream> => {
    // Performance optimization: Return immediately if already initialized
    if (preInitializedStreamRef.current && preInitializedStreamRef.current.active) {
      console.log('🚀 Using cached pre-initialized stream - 0ms delay');
      return preInitializedStreamRef.current;
    }

    // Performance optimization: Await existing promise to avoid duplicate requests
    if (preInitPromiseRef.current) {
      console.log('🚀 Awaiting existing pre-initialization promise');
      return await preInitPromiseRef.current;
    }

    if (isPreInitializingRef.current) {
      throw new Error('Pre-initialization already in progress');
    }

    console.time('🚀 Microphone pre-initialization');
    isPreInitializingRef.current = true;

    const initPromise = safeAsync(
      () => navigator.mediaDevices.getUserMedia({ 
        audio: {
          // Performance-optimized audio constraints for <200ms start
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Lower sample rate for faster processing
          channelCount: 1, // Mono for better performance
          latency: 0, // Request lowest possible latency
          // Advanced performance constraints
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
        } as any // Cast to any for advanced Chrome constraints
      })
    ).then(([stream, error]) => {
      console.timeEnd('🚀 Microphone pre-initialization');
      isPreInitializingRef.current = false;
      preInitPromiseRef.current = null;

      if (error) {
        console.error('❌ Pre-initialization failed:', error.message);
        throw error;
      }

      if (!stream) {
        throw new Error('No stream returned from getUserMedia');
      }

      // Performance optimization: Immediately set up optimal audio constraints
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack && audioTrack.applyConstraints) {
        audioTrack.applyConstraints({
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          latency: 0,
        }).catch(err => {
          console.warn('⚠️ Could not apply optimal audio constraints:', err.message);
        });
      }

      preInitializedStreamRef.current = stream;
      console.log('✅ Microphone pre-initialized successfully');
      
      // Performance monitoring: Track pre-initialization success
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('microphone-preinitialized', { 
          detail: { timestamp: Date.now() } 
        }));
      }

      return stream;
    });

    preInitPromiseRef.current = initPromise;
    return await initPromise;
  }, []);

  // Cleanup audio resources
  const cleanupAudioResources = useCallback(() => {
    stopDurationTracking();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clean up pre-initialized stream when done
    if (preInitializedStreamRef.current) {
      preInitializedStreamRef.current.getTracks().forEach(track => track.stop());
      preInitializedStreamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
    recordingStartTimeRef.current = null;
    
    // Clean up chunked processing
    if (chunkProcessingIntervalRef.current) {
      clearInterval(chunkProcessingIntervalRef.current);
      chunkProcessingIntervalRef.current = null;
    }
    audioChunksForProcessingRef.current = [];
    combinedTranscriptRef.current = '';
    isProcessingActiveRef.current = false;
    lastSavedTranscriptLengthRef.current = 0;
    failedChunksCountRef.current = 0;
    totalProcessedChunksRef.current = 0;
    
    // Clean up smart segmentation
    if (autoRestartTimeoutRef.current) {
      clearTimeout(autoRestartTimeoutRef.current);
      autoRestartTimeoutRef.current = null;
    }
    segmentStartTimeRef.current = 0;
    silenceCountRef.current = 0;
    pendingAutoRestartRef.current = false;
  }, [stopDurationTracking]);

  // Chunked processing functions
  const processAudioChunk = useCallback(async (audioBlob: Blob): Promise<string> => {
    if (!georgianTTSServiceRef.current) {
      throw new Error('Georgian TTS service not initialized');
    }

    try {
      console.log('🎯 Processing audio chunk with STT model:', selectedSTTModelRef.current);

      const result = await georgianTTSServiceRef.current.recognizeSpeech(audioBlob, {
        language,
        autocorrect,
        punctuation,
        digits,
        engine: selectedSTTModelRef.current, // Use current STT model from ref
        enableSpeakerDiarization: optionsRef.current.enableSpeakerDiarization ?? false,
        speakers: optionsRef.current.speakers ?? 2, // Use current ref value
        maxRetries: 2 // Moderate retries for parallel chunks
      });
      
      // Handle speaker diarization results
      if (typeof result === 'object' && result.hasSpeakers) {

        setSpeakerSegments(result.speakers || []);
        setHasSpeakerResults(true);
        totalProcessedChunksRef.current++;
        return result.text;
      } else {
        // Regular text result
        const text = typeof result === 'string' ? result : result.text;
        totalProcessedChunksRef.current++;
        return text || '';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      failedChunksCountRef.current++;
      totalProcessedChunksRef.current++;

      // Log specific error types for debugging
      if (errorMessage.includes('500')) {

      } else if (errorMessage.includes('401')) {

      } else if (errorMessage.includes('422')) {

      }
      
      // If too many chunks fail, show an error to the user
      const failureRate = failedChunksCountRef.current / totalProcessedChunksRef.current;
      if (totalProcessedChunksRef.current >= 3 && failureRate > 0.7) {
        setError('Georgian speech recognition service is experiencing issues. Recording continues but transcription may be incomplete.');
      }
      
      return ''; // Return empty string to continue processing other chunks
    }
  }, [language, autocorrect, punctuation, digits]);

  const startChunkedProcessing = useCallback(() => {
    if (chunkProcessingIntervalRef.current) {
      clearInterval(chunkProcessingIntervalRef.current);
    }

    console.log('🚀 Starting PARALLEL transcription (15s chunks processed simultaneously)...');
    isProcessingActiveRef.current = true;
    combinedTranscriptRef.current = '';
    lastSavedTranscriptLengthRef.current = 0;
    failedChunksCountRef.current = 0;
    totalProcessedChunksRef.current = 0;
    setRecordingState(prev => ({
      ...prev,
      isProcessingChunks: true,
      processedChunks: 0,
      totalChunks: 0
    }));

    // PARALLEL processing - process multiple chunks simultaneously (like the test proved works!)
    const processChunksInParallel = async () => {
      // Safety check - prevent infinite loops
      if (!isProcessingActiveRef.current) {

        return;
      }

      const chunksToProcess = audioChunksForProcessingRef.current.slice();
      if (chunksToProcess.length === 0) {
        // Schedule next check only if still recording
        const isStillRecording = mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording';
        if (isStillRecording) {

          setTimeout(processChunksInParallel, 2000);
        } else {

        }
        return;
      }

      // SAFE 20-SECOND BATCHES: Stay well under Enagramm's 25-second limit
      const standardBatchSize = Math.ceil(20000 / chunkSize); // 20 chunks = 20 seconds (safe margin)
      
      // Check if we have enough chunks for a complete 20-second batch (under 25s limit)
      const isStillRecording = mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording';
      
      if (chunksToProcess.length < standardBatchSize) {
        if (isStillRecording) {
          console.log(`⏳ Waiting for 20s batch (under 25s limit): ${chunksToProcess.length}/${standardBatchSize} chunks ready, checking in 1s...`);
          setTimeout(processChunksInParallel, 1000);
          return; // Continue waiting
        } else if (chunksToProcess.length > 0) {
          console.log(`🏁 Recording stopped, processing remaining ${chunksToProcess.length} chunks (${chunksToProcess.length * chunkSize / 1000}s)...`);
          // Process remaining chunks even if less than 20 seconds
        } else {

          return;
        }
      }

      // IMMEDIATE BATCH PROCESSING: Send each 20-second batch as separate API call (under 25s limit)
      // Process exactly ONE batch at a time to ensure proper sequence and avoid server overload
      
      // Take exactly one 20-second batch for processing
      const chunksToTake = Math.min(standardBatchSize, chunksToProcess.length);
      const segmentChunks = chunksToProcess.slice(0, chunksToTake);
      const audioBlob = new Blob(segmentChunks, { type: 'audio/webm;codecs=opus' });
      
      // SAFETY CHECK: Ensure we're under Enagramm's 25-second limit
      // Check both theoretical duration AND actual blob size (chunks can vary in size!)
      const theoreticalDurationSeconds = segmentChunks.length * (chunkSize / 1000);
      const actualBlobSizeKB = Math.round(audioBlob.size / 1024);
      let finalAudioBlob: Blob;
      let finalSegmentChunks: Blob[];
      
      // CRITICAL: Use blob size as primary safety check - larger blobs = longer audio
      // Google STT: Send 3-5 second chunks for near real-time transcription
      // Enagram: 320KB works (25 seconds)
      const isGoogleSTT = selectedSTTModelRef.current === 'GoogleChirp';
      const maxSafeBlobSizeKB = isGoogleSTT ? 80 : 320; // KB - Google: ~5s chunks, Enagram: 25s
      const maxDurationSeconds = isGoogleSTT ? 5 : 24; // Google: 5s for live feel, Enagram: 24s
      const needsTrimming = actualBlobSizeKB > maxSafeBlobSizeKB || theoreticalDurationSeconds > maxDurationSeconds;
      
      if (needsTrimming) {
        const limitDesc = isGoogleSTT ? '5s (Google)' : '25s (Enagram)';
        console.warn(`⚠️  Batch too large (${actualBlobSizeKB}KB, ${theoreticalDurationSeconds}s), trimming to stay under ${limitDesc} limit...`);
        
        // Calculate safe chunk count based on successful first batch ratio
        // First batch: 320KB / 20 chunks = 16KB per chunk average
        // So for 320KB max: maxChunks = 320KB / (currentBlobSize/currentChunks) 
        const avgChunkSizeKB = actualBlobSizeKB / segmentChunks.length;
        const maxSafeChunks = Math.floor(maxSafeBlobSizeKB / avgChunkSizeKB);
        const safeChunkCount = Math.max(1, Math.min(maxSafeChunks, segmentChunks.length - 1)); // At least 1 chunk, but not all
        
        console.log(`📏 Trimming: ${segmentChunks.length} chunks (${actualBlobSizeKB}KB) → ${safeChunkCount} chunks (target: ${maxSafeBlobSizeKB}KB)`);
        
        const safeSegmentChunks = segmentChunks.slice(0, safeChunkCount);
        finalAudioBlob = new Blob(safeSegmentChunks, { type: 'audio/webm;codecs=opus' });
        finalSegmentChunks = safeSegmentChunks;
        
        // Return unused chunks to the queue for the next batch
        const unusedChunks = segmentChunks.slice(safeChunkCount);
        audioChunksForProcessingRef.current = [...unusedChunks, ...chunksToProcess.slice(chunksToTake)];
        
        console.log(`✂️  Trimmed to ${Math.round(finalAudioBlob.size/1024)}KB (${safeChunkCount} chunks), ${unusedChunks.length} chunks returned to queue`);
      } else {
        finalAudioBlob = audioBlob;
        finalSegmentChunks = segmentChunks;
        // Remove processed chunks from the queue
        audioChunksForProcessingRef.current = chunksToProcess.slice(chunksToTake);
      }
      
      // Create single batch for immediate processing
      const audioSegments: Blob[] = [finalAudioBlob];
      const batchNumber = Math.floor(totalProcessedChunksRef.current / standardBatchSize) + 1;
      console.log(`🎧 Processing batch ${batchNumber}: ${Math.round(finalAudioBlob.size/1024)}KB (${finalSegmentChunks.length} chunks, ${finalSegmentChunks.length * chunkSize / 1000}s)`);

      // No need to check if audioSegments is empty since we always create exactly one segment above

      try {
        console.log(`🚀 BATCH PROCESSING: Sending batch ${batchNumber} (${Math.round(finalAudioBlob.size/1024)}KB)...`);
        
        setRecordingState(prev => ({
          ...prev,
          totalChunks: prev.totalChunks + 1
        }));

        // Process the single batch - CRITICAL: Use fresh service instance for each batch
        // This makes every request a "first request" to avoid Enagramm's sequential DALE100 issue
        const parallelPromises = audioSegments.map(async (batchBlob, index) => {
          const segmentStart = Date.now();
          console.log(`🎙️ Processing batch ${batchNumber} as FRESH SESSION: ${Math.round(batchBlob.size/1024)}KB`);
          
          try {
            // CRITICAL FIX: Create fresh service instance + fresh token for each batch
            // This avoids Enagramm's sequential request DALE100 errors with true session isolation
            const { GeorgianTTSService } = await import('../lib/speech/georgianTTSService');
            const freshService = new GeorgianTTSService();
            
            // FRESH TOKEN: Force fresh authentication for each batch to simulate completely new user
            console.log(`🆕 Forcing fresh authentication for batch ${batchNumber} (true session isolation)...`);
            await freshService.logout(); // Clear any cached tokens
            await freshService.initialize(); // Force fresh login

            const result = await freshService.recognizeSpeech(batchBlob, {
              language,
              autocorrect,
              punctuation,
              digits,
              engine: selectedSTTModelRef.current, // Use current STT model from ref
              enableSpeakerDiarization: optionsRef.current.enableSpeakerDiarization ?? false,
              speakers: optionsRef.current.speakers ?? 2, // Use current props value
              maxRetries: 2 // Moderate retries since this should work as "first request"
            });
            
            // Handle speaker diarization results
            let chunkText = '';
            if (typeof result === 'object' && result.hasSpeakers) {

              setSpeakerSegments(prev => [...prev, ...(result.speakers || [])]);
              setHasSpeakerResults(true);
              chunkText = result.text;
            } else {
              chunkText = typeof result === 'string' ? result : result.text;
            }
            
            // Update statistics for successful processing
            totalProcessedChunksRef.current++;
            
            const processingTime = Date.now() - segmentStart;
            console.log(`✅ Batch ${batchNumber} completed in ${processingTime}ms: "${chunkText?.substring(0, 30) + (chunkText?.length > 30 ? '...' : '') || '[empty]'}"`);
            return { index, text: chunkText || '', success: true };
          } catch (error) {
            // Update statistics for failed processing
            failedChunksCountRef.current++;
            totalProcessedChunksRef.current++;
            
            const processingTime = Date.now() - segmentStart;

            // Check failure rate and show user error if too many failures
            const failureRate = failedChunksCountRef.current / totalProcessedChunksRef.current;
            if (totalProcessedChunksRef.current >= 3 && failureRate > 0.7) {
              setError('Georgian speech recognition service is experiencing issues. Recording continues but transcription may be incomplete.');
            }
            
            return { index, text: '', success: false, error };
          }
        });

        // Wait for batch processing to complete
        const results = await Promise.allSettled(parallelPromises);
        
        // Process results and combine transcript
        const successfulResults: Array<{index: number, text: string}> = [];
        let successCount = 0;
        let failCount = 0;

        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value.success && result.value.text?.trim()) {
            successfulResults.push({ index: result.value.index, text: result.value.text });
            successCount++;
          } else {
            failCount++;
          }
        });

        // Sort results by original index to maintain order
        successfulResults.sort((a, b) => a.index - b.index);

        // Add successful transcriptions to combined transcript
        successfulResults.forEach(result => {
          if (result.text && result.text.trim()) {
            // Smart text concatenation for natural flow
            const prevText = combinedTranscriptRef.current.trim();
            const newText = result.text.trim();
            let separator = '';

            if (prevText) {
              // Check if previous text ends with sentence-ending punctuation
              // Including Georgian punctuation marks
              const endsWithPunctuation = /[.!?။។៕។၊။।॥।।৷।।।።።።፨።።።።።។]$/.test(prevText);
              separator = endsWithPunctuation ? ' ' : ' '; // Single space always for now
            }

            const previousLength = combinedTranscriptRef.current.length;
            combinedTranscriptRef.current = prevText + separator + newText;
            
            // Call live transcript callback with new text
            if (onLiveTranscriptUpdate) {
              const newText = combinedTranscriptRef.current.substring(previousLength);
              onLiveTranscriptUpdate(newText, combinedTranscriptRef.current, sessionIdRef.current);
            }
            
            console.log(`📝 Added to transcript: "${result.text.trim().substring(0, 30) + (result.text.trim().length > 30 ? '...' : '')}"`);
          }
        });

        // Update transcription result with accumulated text
        if (combinedTranscriptRef.current.trim()) {
          // DON'T set transcriptionResult on manual stop - live updates already handled everything

        }

        setRecordingState(prev => ({
          ...prev,
          processedChunks: prev.processedChunks + successCount
        }));

        // Continue processing next batch if there are more chunks
        const hasMoreChunks = audioChunksForProcessingRef.current.length > 0;
        const isStillRecording = mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording';
        
        if (hasMoreChunks || isStillRecording) {
          console.log(`🔄 Continuing batch processing... (${audioChunksForProcessingRef.current.length} chunks remaining)`);

          // Different delays based on STT model
          // Google: 3-5s for live feel, Enagram: 30s to avoid rate limits
          const isGoogleSTT = selectedSTTModelRef.current === 'GoogleChirp';
          const batchDelay = isGoogleSTT ? 3000 : 30000; // Google: 3s, Enagram: 30s

          setTimeout(() => {
            if (isProcessingActiveRef.current) {
              processChunksInParallel();
            } else {

            }
          }, batchDelay);
        } else {

        }

      } catch (error) {

        // Continue with retry after error
        // Different delays based on STT model
        const isGoogleSTT = selectedSTTModelRef.current === 'GoogleChirp';
        const retryDelay = isGoogleSTT ? 5000 : 30000; // Google: 5s retry, Enagram: 30s

        setTimeout(() => {
          if (isProcessingActiveRef.current) {
            processChunksInParallel();
          }
        }, retryDelay);
      }
    };

    // Start the batch processing after a short delay to ensure clean state
    // Different initial delays based on STT model
    const isGoogleSTT = selectedSTTModelRef.current === 'GoogleChirp';
    const initialDelay = isGoogleSTT ? 500 : 2000; // Google: 500ms for fast start, Enagram: 2s

    setTimeout(() => {
      if (isProcessingActiveRef.current) {
        processChunksInParallel();
      }
    }, initialDelay);
  }, [chunkSize, language, autocorrect, punctuation, digits, onLiveTranscriptUpdate]);

  const stopChunkedProcessing = useCallback(async () => {
    isProcessingActiveRef.current = false;
    
    if (chunkProcessingIntervalRef.current) {
      clearInterval(chunkProcessingIntervalRef.current);
      chunkProcessingIntervalRef.current = null;
    }

    // Process any remaining chunks with fresh service instance (only if not already processed)
    const remainingChunks = audioChunksForProcessingRef.current.slice();
    if (remainingChunks.length > 0) {
      try {
        console.log(`🔄 Processing final ${remainingChunks.length} remaining chunks (${remainingChunks.length * chunkSize / 1000}s audio) with fresh service instance...`);
        const combinedBlob = new Blob(remainingChunks, { type: 'audio/webm;codecs=opus' });
        
        // Use fresh service instance + token for final chunks too
        const { GeorgianTTSService } = await import('../lib/speech/georgianTTSService');
        const freshService = new GeorgianTTSService();
        
        // FRESH TOKEN for final processing

        await freshService.logout();
        await freshService.initialize();

        const result = await freshService.recognizeSpeech(combinedBlob, {
          language,
          autocorrect,
          punctuation,
          digits,
          engine: selectedSTTModelRef.current, // Use current STT model from ref
          enableSpeakerDiarization: optionsRef.current.enableSpeakerDiarization ?? false,
          speakers: optionsRef.current.speakers ?? 2, // Use current props value
          maxRetries: 2
        });
        
        // Handle speaker diarization results for final processing
        let finalText = '';
        if (typeof result === 'object' && result.hasSpeakers) {

          setSpeakerSegments(prev => [...prev, ...(result.speakers || [])]);
          setHasSpeakerResults(true);
          finalText = result.text;
        } else {
          finalText = typeof result === 'string' ? result : result.text;
        }

        if (finalText && finalText.trim()) {
          // Smart text concatenation for natural flow
          const prevText = combinedTranscriptRef.current.trim();
          const newText = finalText.trim();
          let separator = '';

          if (prevText) {
            // Check if previous text ends with sentence-ending punctuation
            const endsWithPunctuation = /[.!?។។៕។၊။।॥।।৷।।।።።።፨።።።።።።]$/.test(prevText);
            separator = endsWithPunctuation ? ' ' : ' '; // Single space
          }

          const previousLength = combinedTranscriptRef.current.length;
          combinedTranscriptRef.current = prevText + separator + newText;
          
          // Call live transcript callback with final new text
          if (onLiveTranscriptUpdate) {
            const newText = combinedTranscriptRef.current.substring(previousLength);
            onLiveTranscriptUpdate(newText, combinedTranscriptRef.current, sessionIdRef.current);
          }
        }
      } catch (error) {

      }
    } else {
      console.log('🧹 No remaining chunks to process (already processed in manual stop)');
    }

    // Final result - DON'T set transcriptionResult, live updates handled everything
    if (combinedTranscriptRef.current.trim()) {

    }

    setRecordingState(prev => ({
      ...prev,
      isProcessingChunks: false
    }));

    audioChunksForProcessingRef.current = [];
  }, [language, autocorrect, punctuation, digits, onLiveTranscriptUpdate, recordingState.duration]);

  // Recording stop handler - extracted for reusability in auto-segmentation
  const createRecordingStopHandler = useCallback(() => {
    return async () => {
      const wasAutoSegmentation = pendingAutoRestartRef.current;
      const wasManualStop = manualStopRef.current;
      
      if (wasManualStop) {

      } else {

      }
      
      // Process current audio segment immediately
      if (audioChunksRef.current.length > 0) {
        // Get only the unprocessed chunks to prevent duplicates
        const processedChunkCount = processedSegmentsRef.current;
        const unprocessedChunks = audioChunksRef.current.slice(processedChunkCount);

        if (unprocessedChunks.length === 0) {
          console.log('🧹 No remaining chunks to process (already processed in auto-segment)');
          // Don't return here - continue with cleanup and state management
        } else {
        
        const currentBlob = new Blob(unprocessedChunks, { type: 'audio/webm;codecs=opus' });
        const segmentDurationSeconds = unprocessedChunks.length * (chunkSize / 1000);
        console.log(`🎙️ Processing segment: ${Math.round(currentBlob.size/1024)}KB (${unprocessedChunks.length} chunks, ~${segmentDurationSeconds}s)`);

        // For auto-restarts: process in background (non-blocking)
        // For manual stops: process synchronously (blocking)
        if (wasAutoSegmentation && !wasManualStop) {
          // Background processing for instant restart
          (async () => {
            try {
              const { GeorgianTTSService } = await import('../lib/speech/georgianTTSService');
              const freshService = new GeorgianTTSService();
              await freshService.initialize();

              const result = await freshService.recognizeSpeech(currentBlob, {
                language, 
                autocorrect, 
                punctuation, 
                digits, 
                engine: selectedSTTModelRef.current, // Use current STT model from ref
                enableSpeakerDiarization: optionsRef.current.enableSpeakerDiarization ?? false,
                speakers: optionsRef.current.speakers ?? 2, // Use current props value
                maxRetries: 2
              });
              
              // Handle speaker diarization results for manual stop processing
              let segmentText = '';
              if (typeof result === 'object' && result.hasSpeakers) {

                setSpeakerSegments(prev => [...prev, ...(result.speakers || [])]);
                setHasSpeakerResults(true);
                segmentText = result.text;
              } else {
                segmentText = typeof result === 'string' ? result : result.text;
              }

              if (segmentText?.trim()) {
                // Smart text concatenation for natural flow
                const prevText = combinedTranscriptRef.current.trim();
                const newText = segmentText.trim();
                let separator = '';

                if (prevText) {
                  // Check if previous text ends with sentence-ending punctuation
                  const endsWithPunctuation = /[.!?។។៕។၊။।॥।।৷।।।።።።፨።።።።።។]$/.test(prevText);
                  separator = endsWithPunctuation ? ' ' : ' '; // Single space
                }

                const previousLength = combinedTranscriptRef.current.length;
                combinedTranscriptRef.current = prevText + separator + newText;
                
                // DON'T update processed chunk count for auto-segments to prevent race condition
                // The auto-restart will handle chunk counter reset properly
                lastProcessedTimeRef.current = Date.now();
                
                console.log(`📝 Auto-segment: "${segmentText.trim().substring(0, 50)}..."`);

                if (onLiveTranscriptUpdate) {
                  const newText = combinedTranscriptRef.current.substring(previousLength);
                  onLiveTranscriptUpdate(newText, combinedTranscriptRef.current, sessionIdRef.current);
                }
                
                // DON'T set transcriptionResult for auto-segments - only use live updates
                // This prevents the useEffect in TranscriptPanel from also processing the same content

              }
            } catch (error) {

              setError(`Auto-segment processing failed: ${error instanceof Error ? error.message : String(error)}`);
              
              // DON'T update processed chunks for auto-segments to prevent race condition

              // Continue recording despite error - don't break the flow
            }
          })();
        } else {
          // Manual stop: wait for processing to complete
          try {
            const { GeorgianTTSService } = await import('../lib/speech/georgianTTSService');
            const freshService = new GeorgianTTSService();
            await freshService.initialize();

            console.log('🎯 Making API call with STT model:', selectedSTTModelRef.current);
            const result = await freshService.recognizeSpeech(currentBlob, {
              language, 
              autocorrect, 
              punctuation, 
              digits, 
              engine: selectedSTTModelRef.current, // Use current STT model from ref
              enableSpeakerDiarization: optionsRef.current.enableSpeakerDiarization ?? false,
              speakers: optionsRef.current.speakers ?? 2, // Use current props value
              maxRetries: 2
            });
            
            // Handle speaker diarization results for auto-segmentation
            let segmentText = '';
            if (typeof result === 'object' && result.hasSpeakers) {

              setSpeakerSegments(prev => [...prev, ...(result.speakers || [])]);
              setHasSpeakerResults(true);
              segmentText = result.text;
            } else {
              segmentText = typeof result === 'string' ? result : result.text;
            }
            if (segmentText?.trim()) {
              // Smart text concatenation for natural flow
              const prevText = combinedTranscriptRef.current.trim();
              const newText = segmentText.trim();
              let separator = '';

              if (prevText) {
                // Check if previous text ends with sentence-ending punctuation
                const endsWithPunctuation = /[.!?។។៕។၊។।॥।।৷।।।።።።፨።።።።።។]$/.test(prevText);
                separator = endsWithPunctuation ? ' ' : ' '; // Single space
              }

              const previousLength = combinedTranscriptRef.current.length;
              combinedTranscriptRef.current = prevText + separator + newText;
              
              // Update processed chunk count to the total chunks processed (including current unprocessed ones)
              const totalProcessedChunks = processedSegmentsRef.current + unprocessedChunks.length;
              processedSegmentsRef.current = totalProcessedChunks;
              lastProcessedTimeRef.current = Date.now();
              
              console.log(`📝 Final segment: "${segmentText.trim().substring(0, 50)}..."`);
              console.log(`🔄 Updated processed chunks: ${processedSegmentsRef.current} (was ${processedSegmentsRef.current - unprocessedChunks.length}, added ${unprocessedChunks.length})`);
              
              if (onLiveTranscriptUpdate) {
                const newText = combinedTranscriptRef.current.substring(previousLength);
                onLiveTranscriptUpdate(newText, combinedTranscriptRef.current, sessionIdRef.current);
              }
              
              // DON'T set transcriptionResult for final segments - keep using live updates only

            }
            
            // CRITICAL FIX: Clear chunks after manual processing to prevent duplicate processing in cleanup
            audioChunksRef.current = [];
            audioChunksForProcessingRef.current = [];

          } catch (error) {

            setError(`Final segment processing failed: ${error instanceof Error ? error.message : String(error)}`);
            
            // Still update processed chunks to prevent chunk tracking issues
            const totalProcessedChunks = processedSegmentsRef.current + unprocessedChunks.length;
            processedSegmentsRef.current = totalProcessedChunks;
            
            // Clear chunks even on error to prevent reprocessing
            audioChunksRef.current = [];
            audioChunksForProcessingRef.current = [];
          }
        }
        } // Close the else block for unprocessed chunks
      }
      
      // Handle auto-restart for smart segmentation (only if NOT manual stop)
      if (wasAutoSegmentation && !wasManualStop) {
        // CRITICAL: Wait a small delay to ensure all processing completes before restart
        setTimeout(async () => {
          // Reset segmentation timing for new segment
          segmentStartTimeRef.current = Date.now();
          silenceCountRef.current = 0;
          pendingAutoRestartRef.current = false;
          
          // Reset audio chunks for new segment
          audioChunksRef.current = [];
          audioChunksForProcessingRef.current = [];
          
          // CRITICAL FIX: Reset processed chunk counter for new segment
          const previousCount = processedSegmentsRef.current;
          processedSegmentsRef.current = 0;

          // Force garbage collection to prevent memory issues
          if (window.gc) window.gc();
          
        // Start new recording segment with minimal delay for fastest restart
          try {
            // Create new MediaRecorder for continued recording
            const newRecorder = new MediaRecorder(streamRef.current!, {
              mimeType: 'audio/webm;codecs=opus',
              audioBitsPerSecond: 128000
            });
            
            newRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
                audioChunksForProcessingRef.current.push(event.data);
              }
            };
            
            // Set up the stop handler recursively for continued segmentation
            newRecorder.onstop = createRecordingStopHandler();
            
            newRecorder.onerror = (event) => {
              const error = (event as any).error;
              setError(`Recording error: ${error?.message || 'Unknown error'}`);
              cleanupAudioResources();
            };
            
            // Start new segment
            newRecorder.start(chunkSize);
            mediaRecorderRef.current = newRecorder;
            
            // SEAMLESS UI: Maintain continuous recording state without processing indicators
            setRecordingState(prev => ({ 
              ...prev, 
              isRecording: true, 
              isProcessingChunks: false // Keep seamless visual continuity
            }));

            // CRITICAL: Resume audio level monitoring immediately for fastest continuation
            setTimeout(() => {
              if (analyserRef.current && dataArrayRef.current && mediaRecorderRef.current) {
                monitorAudioLevel();
              }
            }, 10); // Ultra-minimal delay for instant restart
            
          } catch (error) {

            setError('Auto-restart failed. Please manually restart recording.');
            cleanupAudioResources();
          }
        }, 10); // Minimal delay for seamless continuation
        
      } else {
        // Manual stop or normal stop - clean up everything and don't restart

        setRecordingState(prev => ({ 
          ...prev, 
          isRecording: false, 
          isProcessingChunks: false 
        }));
        stopChunkedProcessing();
        cleanupAudioResources();
        
        // Reset flags
        manualStopRef.current = false;
        pendingAutoRestartRef.current = false;
      }
    };
  }, [language, autocorrect, punctuation, digits, onLiveTranscriptUpdate, chunkSize, monitorAudioLevel, stopChunkedProcessing, cleanupAudioResources]);

  const startRecording = useCallback(async () => {
    // 🚀 Performance timing to ensure <200ms recording start
    const startTime = performance.now();
    console.time('🚀 Recording start performance');
    
    try {
      // Prevent multiple recordings
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('🚀 Recording already active - 0ms');
        return;
      }
      
      // Fast state reset without blocking operations
      setError(null);
      audioChunksRef.current = [];
      audioChunksForProcessingRef.current = [];
      // DON'T reset combinedTranscriptRef here - let it accumulate across sessions
      // combinedTranscriptRef.current = '';  // REMOVED: This was causing transcript overwrite
      lastSavedTranscriptLengthRef.current = 0;
      failedChunksCountRef.current = 0;
      totalProcessedChunksRef.current = 0;
      
      // Reset segment tracking for new recording session
      processedSegmentsRef.current = 0;
      lastProcessedTimeRef.current = 0;
      
      // 🚀 Use pre-initialized stream for instant recording (target: 0-50ms)
      let stream: MediaStream;
      try {
        const streamStartTime = performance.now();
        stream = await preInitializeMicrophone();
        const streamTime = performance.now() - streamStartTime;
        console.log(`🚀 Stream acquisition: ${streamTime.toFixed(1)}ms`);
        
        if (streamTime > 100) {
          console.warn(`⚠️ Stream acquisition slower than expected: ${streamTime.toFixed(1)}ms`);
        }
      } catch (streamError: any) {
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
          audioChunksForProcessingRef.current.push(event.data);
        }
      };
      
      // Use the reusable stop handler
      recorder.onstop = createRecordingStopHandler();
      
      recorder.onerror = (event) => {
        const error = (event as any).error;

        setError(`Recording error: ${error?.message || 'Unknown error'}`);
        setRecordingState(prev => ({ ...prev, isRecording: false }));
        cleanupAudioResources();
      };
      
      // Start recording
      recorder.start(chunkSize);
      mediaRecorderRef.current = recorder;
      
      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioLevel: 0,
        isProcessingChunks: false,
        processedChunks: 0,
        totalChunks: 0
      });
      
      // Initialize smart segmentation timing
      const startTime = Date.now();
      segmentStartTimeRef.current = startTime;
      silenceCountRef.current = 0;
      pendingAutoRestartRef.current = false;

      startDurationTracking();
      
      // CRITICAL: Start audio monitoring AFTER MediaRecorder is set
      monitorAudioLevel();
      
      // Start processing based on mode - but disable it for smart segmentation approach
      // Smart segmentation processes each segment immediately in onstop handler
      // if (enableStreaming) {
      //   startChunkedProcessing();
      // }
      
      // 🚀 Performance monitoring: Track total recording start time
      const totalTime = performance.now() - startTime;
      console.timeEnd('🚀 Recording start performance');
      console.log(`🚀 Total recording start time: ${totalTime.toFixed(1)}ms`);
      
      // Performance validation: Warn if >200ms target is exceeded
      if (totalTime > 200) {
        console.warn(`⚠️ PERFORMANCE WARNING: Recording start took ${totalTime.toFixed(1)}ms (target: <200ms)`);
        
        // Dispatch performance warning event for monitoring
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('recording-performance-warning', { 
            detail: { 
              startTime: totalTime,
              target: 200,
              component: 'useGeorgianTTS'
            } 
          }));
        }
      } else {
        console.log(`✅ Recording start performance: ${totalTime.toFixed(1)}ms (target: <200ms) - PASS`);
        
        // Dispatch success event for monitoring
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('recording-performance-success', { 
            detail: { 
              startTime: totalTime,
              target: 200,
              component: 'useGeorgianTTS'
            } 
          }));
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      setError(errorMessage);
      cleanupAudioResources();
    }
  }, [chunkSize, setupAudioMonitoring, startDurationTracking, cleanupAudioResources, createRecordingStopHandler, preInitializeMicrophone]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {

      // Set manual stop flag BEFORE stopping to prevent restart
      manualStopRef.current = true;
      pendingAutoRestartRef.current = false; // Clear any pending auto-restart

      // INSTANT UI FEEDBACK: Update UI state immediately for better UX
      setRecordingState(prev => ({ ...prev, isRecording: false }));

      // CRITICAL FIX: Request final buffered data before stopping
      // This forces MediaRecorder to flush any buffered audio immediately
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.requestData();
      }

      // Small delay to ensure data is collected before stop
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current = null;
        }
      }, 100); // 100ms delay to ensure ondataavailable fires

      // Reset manual stop flag after a delay (cleanup)
      setTimeout(() => {
        manualStopRef.current = false;
      }, 1100);
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

  const processFileUpload = useCallback(async (file: File) => {
    if (!georgianTTSServiceRef.current) {
      setError('Georgian TTS service not initialized');
      return null;
    }

    setIsTranscribing(true);
    setError(null);

    try {
      console.log('🎯 Processing file upload with STT model:', selectedSTTModelRef.current, 'File:', file.name);

      // Use the new processAudioFile method with chunking support
      const [transcriptResult, transcriptionError] = await safeAsync(
        () => georgianTTSServiceRef.current!.processAudioFile(file, {
          language: language === 'ka-GE' ? 'ka' : language,
          autocorrect,
          punctuation,
          digits,
          engine: selectedSTTModelRef.current, // Use current STT model from ref
          enableSpeakerDiarization,
          speakers,
          onProgress: (progress) => {
            // Update processing state for UI feedback
            setRecordingState(prev => ({
              ...prev,
              isProcessingChunks: progress < 100,
              processedChunks: Math.floor(progress / 5), // Rough estimate
              totalChunks: 20 // Rough estimate
            }));
          },
          onChunkComplete: (chunkIndex, chunkText, totalChunks) => {
            console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} completed: "${chunkText.substring(0, 50)}..."`);
            
            // Update live transcript if callback provided
            if (onLiveTranscriptUpdate) {
              // Get current combined transcript from all previous chunks
              const chunkProgress = (chunkIndex + 1) / totalChunks;
              // We don't have the full transcript yet, so we'll let the final result handle the update
            }
          }
        })
      );
      
      if (transcriptionError) {
        throw transcriptionError;
      }
      
      // Handle speaker diarization results for file uploads
      let transcriptText = '';
      if (typeof transcriptResult === 'object' && transcriptResult.hasSpeakers) {

        setSpeakerSegments(transcriptResult.speakers || []);
        setHasSpeakerResults(true);
        transcriptText = transcriptResult.text;
      } else {
        transcriptText = typeof transcriptResult === 'string' ? transcriptResult : transcriptResult.text;
      }
      
      // For file uploads, create transcription result
      const result: TranscriptionResult = {
        text: transcriptText,
        timestamp: Date.now(),
        duration: 0, // File duration not tracked here
        hasSpeakers: typeof transcriptResult === 'object' ? transcriptResult.hasSpeakers : false,
        speakers: typeof transcriptResult === 'object' ? transcriptResult.speakers : undefined
      };
      
      setTranscriptionResult(result);
      updateAuthStatus();
      
      // Also trigger live update for session management
      if (onLiveTranscriptUpdate && transcriptText) {
        onLiveTranscriptUpdate(transcriptText, transcriptText, sessionIdRef.current);
      }
      
      return transcriptText;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File transcription failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsTranscribing(false);
      // Reset processing state
      setRecordingState(prev => ({
        ...prev,
        isProcessingChunks: false,
        processedChunks: 0,
        totalChunks: 0
      }));
    }
  }, [language, autocorrect, punctuation, digits, updateAuthStatus, onLiveTranscriptUpdate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setTranscriptionResult(null);
  }, []);

  const resetTranscript = useCallback(() => {
    // Reset transcript for new session
    combinedTranscriptRef.current = '';
    lastSavedTranscriptLengthRef.current = 0;
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

  // 🚀 Ultra-aggressive microphone pre-initialization for <200ms target
  useEffect(() => {
    if (!isSupported) return;

    // Multiple pre-initialization strategies for maximum performance
    const preInitStrategies = [
      // Strategy 1: Immediate pre-init (most aggressive)
      () => {
        preInitializeMicrophone().catch(error => {
          console.log('🤖 Immediate pre-initialization failed (trying fallback):', error.message);
        });
      },
      
      // Strategy 2: User interaction pre-init (fallback)
      () => {
        const handleUserInteraction = () => {
          console.log('🚀 User interaction detected - pre-initializing microphone');
          preInitializeMicrophone().catch(error => {
            console.log('🤖 User interaction pre-initialization failed:', error.message);
          });
          
          // Remove listeners after first interaction
          ['click', 'touchstart', 'keydown', 'mouseover'].forEach(event => {
            document.removeEventListener(event, handleUserInteraction);
          });
        };
        
        // Listen for any user interaction to trigger pre-init
        ['click', 'touchstart', 'keydown', 'mouseover'].forEach(event => {
          document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
        });
      }
    ];

    // Try immediate pre-initialization first
    const immediateTimer = setTimeout(preInitStrategies[0], 50); // Reduced delay for faster init
    
    // Setup fallback user interaction pre-init after short delay
    const fallbackTimer = setTimeout(preInitStrategies[1], 100);
    
    // Advanced: Pre-warm browser audio context
    const audioContextTimer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContext.resume().then(() => {
            console.log('🚀 Audio context pre-warmed successfully');
            audioContext.close(); // Clean up
          }).catch(err => {
            console.log('🤖 Audio context pre-warm failed:', err.message);
          });
        }
      } catch (error) {
        console.log('🤖 Audio context not available:', error);
      }
    }, 10); // Very early pre-warm

    return () => {
      clearTimeout(immediateTimer);
      clearTimeout(fallbackTimer);
      clearTimeout(audioContextTimer);
    };
  }, [isSupported, preInitializeMicrophone]);

  return {
    // State
    recordingState,
    isTranscribing,
    transcriptionResult,
    error,
    authStatus,
    isSupported,
    
    // STT model selection state
    selectedSTTModel,
    
    // Speaker diarization state
    speakerSegments,
    hasSpeakerResults,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    processFileUpload,
    clearError,
    clearResult,
    resetTranscript,
    updateAuthStatus,
    updateSelectedSTTModel,
    
    // Computed values
    canRecord: isSupported && !recordingState.isRecording && !isTranscribing,
    canStop: recordingState.isRecording,
    canPause: recordingState.isRecording && !recordingState.isPaused,
    canResume: recordingState.isRecording && recordingState.isPaused,
    remainingTime: Math.max(0, maxDuration - recordingState.duration),
    isNearMaxDuration: recordingState.duration > maxDuration * 0.9
  };
};