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
    maxDuration = 0, // No limit by default - unlimited with chunked processing
    chunkSize = 1000, // 1 second chunks for MediaRecorder
    chunkDuration = 20000, // 20 seconds per processing chunk for optimal streaming transcription
    enableStreaming = true, // Enable streaming by default, set to false for single-shot mode
    sessionId, // Session ID for cross-session isolation
    onLiveTranscriptUpdate
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
      
      // Stop current recording - onstop handler will process and restart immediately
      mediaRecorderRef.current.stop();
      
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
    const maxSegmentDuration = 15000; // 15 seconds - faster, seamless segmentation
    
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
      
      console.log(`🛑 Audio monitoring stopped - MediaRecorder state: ${recorderState}, pending: ${isPending}`);
      
      // Fix state mismatch: if MediaRecorder is still recording but monitoring stopped
      if (recorderState === 'recording' && !isPending) {
        console.log('🔧 Fixing state mismatch - stopping orphaned MediaRecorder');
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

  // 🚀 Pre-initialize microphone for instant recording
  const preInitializeMicrophone = useCallback(async (): Promise<MediaStream> => {
    if (preInitializedStreamRef.current && preInitializedStreamRef.current.active) {

      return preInitializedStreamRef.current;
    }

    if (preInitPromiseRef.current) {

      return await preInitPromiseRef.current;
    }

    if (isPreInitializingRef.current) {
      throw new Error('Pre-initialization already in progress');
    }

    isPreInitializingRef.current = true;

    const initPromise = safeAsync(
      () => navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        }
      })
    ).then(([stream, error]) => {
      isPreInitializingRef.current = false;
      preInitPromiseRef.current = null;

      if (error) {

        throw error;
      }

      if (!stream) {
        throw new Error('No stream returned from getUserMedia');
      }

      preInitializedStreamRef.current = stream;

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
      const text = await georgianTTSServiceRef.current.recognizeSpeech(audioBlob, {
        language,
        autocorrect,
        punctuation,
        digits,
        maxRetries: 2 // Moderate retries for parallel chunks
      });
      
      totalProcessedChunksRef.current++;
      return text || '';
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
      // First batch: 320KB worked perfectly, so use that as our safe maximum
      const maxSafeBlobSizeKB = 320; // KB - proven safe limit from first batch
      const needsTrimming = actualBlobSizeKB > maxSafeBlobSizeKB || theoreticalDurationSeconds > 24;
      
      if (needsTrimming) {
        console.warn(`⚠️  Batch too large (${actualBlobSizeKB}KB, ${theoreticalDurationSeconds}s), trimming to stay under 25s limit...`);
        
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

            const chunkText = await freshService.recognizeSpeech(batchBlob, {
              language,
              autocorrect,
              punctuation,
              digits,
              maxRetries: 2 // Moderate retries since this should work as "first request"
            });
            
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
            const separator = combinedTranscriptRef.current.trim() ? ' ' : '';
            const previousLength = combinedTranscriptRef.current.length;
            combinedTranscriptRef.current += separator + result.text.trim();
            
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
          console.log('🚫 Skipping setTranscriptionResult for manual stop to prevent duplicates');
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
          setTimeout(() => {
            if (isProcessingActiveRef.current) {
              processChunksInParallel();
            } else {

            }
          }, 30000); // 30 second delay between batches - maximum delay to allow full server reset
        } else {

        }

      } catch (error) {

        // Continue with retry after error
        setTimeout(() => {
          if (isProcessingActiveRef.current) {
            processChunksInParallel();
          }
        }, 30000); // 30 second delay after errors too
      }
    };

    // Start the batch processing after a short delay to ensure clean state
    setTimeout(() => {
      if (isProcessingActiveRef.current) {
        processChunksInParallel();
      }
    }, 2000); // 2 second delay to let any previous requests clear
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
        
        const finalText = await freshService.recognizeSpeech(combinedBlob, {
          language,
          autocorrect,
          punctuation,
          digits,
          maxRetries: 2
        });
        
        if (finalText && finalText.trim()) {
          const separator = combinedTranscriptRef.current.trim() ? ' ' : '';
          const previousLength = combinedTranscriptRef.current.length;
          combinedTranscriptRef.current += separator + finalText.trim();
          
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
      console.log('🚫 Skipping final transcriptionResult to prevent duplicates');
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
        
        console.log(`🔍 DEBUG: processedChunkCount=${processedChunkCount}, totalChunks=${audioChunksRef.current.length}, unprocessedLength=${unprocessedChunks.length}`);
        
        if (unprocessedChunks.length === 0) {
          console.log('🧹 No remaining chunks to process (already processed in auto-segment)');
          // Don't return here - continue with cleanup and state management
        } else {
        
        const currentBlob = new Blob(unprocessedChunks, { type: 'audio/webm;codecs=opus' });
        const segmentDurationSeconds = unprocessedChunks.length * (chunkSize / 1000);
        console.log(`🎙️ Processing segment: ${Math.round(currentBlob.size/1024)}KB (${unprocessedChunks.length} chunks, ~${segmentDurationSeconds}s)`);
        console.log(`📊 Chunk tracking: processed=${processedChunkCount}, total=${audioChunksRef.current.length}, unprocessed=${unprocessedChunks.length}`);
        
        // For auto-restarts: process in background (non-blocking)
        // For manual stops: process synchronously (blocking)
        if (wasAutoSegmentation && !wasManualStop) {
          // Background processing for instant restart
          (async () => {
            try {
              const { GeorgianTTSService } = await import('../lib/speech/georgianTTSService');
              const freshService = new GeorgianTTSService();
              await freshService.initialize();
              
              const segmentText = await freshService.recognizeSpeech(currentBlob, {
                language, autocorrect, punctuation, digits, maxRetries: 2
              });
              
              if (segmentText?.trim()) {
                const separator = combinedTranscriptRef.current.trim() ? ' ' : '';
                const previousLength = combinedTranscriptRef.current.length;
                combinedTranscriptRef.current += separator + segmentText.trim();
                
                // DON'T update processed chunk count for auto-segments to prevent race condition
                // The auto-restart will handle chunk counter reset properly
                lastProcessedTimeRef.current = Date.now();
                
                console.log(`📝 Auto-segment: "${segmentText.trim().substring(0, 50)}..."`);
                console.log(`🚫 Skipping processed chunk update for auto-segment to prevent race condition`);
                
                if (onLiveTranscriptUpdate) {
                  const newText = combinedTranscriptRef.current.substring(previousLength);
                  onLiveTranscriptUpdate(newText, combinedTranscriptRef.current, sessionIdRef.current);
                }
                
                // DON'T set transcriptionResult for auto-segments - only use live updates
                // This prevents the useEffect in TranscriptPanel from also processing the same content
                console.log('🚫 Skipping setTranscriptionResult for auto-segment to prevent duplicates');
              }
            } catch (error) {
              console.error('💥 Auto-segment processing failed:', error);
              setError(`Auto-segment processing failed: ${error instanceof Error ? error.message : String(error)}`);
              
              // DON'T update processed chunks for auto-segments to prevent race condition
              console.log('🚫 Skipping processed chunk update for failed auto-segment');
              
              // Continue recording despite error - don't break the flow
            }
          })();
        } else {
          // Manual stop: wait for processing to complete
          try {
            const { GeorgianTTSService } = await import('../lib/speech/georgianTTSService');
            const freshService = new GeorgianTTSService();
            await freshService.initialize();
            
            const segmentText = await freshService.recognizeSpeech(currentBlob, {
              language, autocorrect, punctuation, digits, maxRetries: 2
            });
            
            if (segmentText?.trim()) {
              const separator = combinedTranscriptRef.current.trim() ? ' ' : '';
              const previousLength = combinedTranscriptRef.current.length;
              combinedTranscriptRef.current += separator + segmentText.trim();
              
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
              console.log('🚫 Skipping setTranscriptionResult for final segment to prevent duplicates');
            }
            
            // CRITICAL FIX: Clear chunks after manual processing to prevent duplicate processing in cleanup
            audioChunksRef.current = [];
            audioChunksForProcessingRef.current = [];

          } catch (error) {
            console.error('💥 Manual stop processing failed:', error);
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
          console.log(`🔄 Auto-restart: Reset processed chunk counter from ${previousCount} to 0 for new segment`);
          
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
            console.error('💥 Auto-restart failed:', error);
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
    try {
      // Prevent multiple recordings
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('🚫 Recording already in progress, ignoring start request');
        return;
      }
      
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
      
      // 🚀 Use pre-initialized stream for instant recording
      let stream: MediaStream;
      try {

        stream = await preInitializeMicrophone();
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
        console.error('🚨 MediaRecorder error:', error);
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
      
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      
      // Reset manual stop flag after a delay (cleanup)
      setTimeout(() => {
        manualStopRef.current = false;
      }, 1000);
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
      
      // For file uploads, we still need transcriptionResult since there's no live updates
      const result: TranscriptionResult = {
        text: combinedText,
        timestamp: Date.now(),
        duration: 0 // File duration not tracked
      };
      
      setTranscriptionResult(result); // Keep this one - file uploads need it
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

  // 🚀 Auto pre-initialize microphone for instant recording
  useEffect(() => {
    if (!isSupported) return;

    // Start pre-initialization in background to eliminate delay
    const timer = setTimeout(() => {
      preInitializeMicrophone().catch(error => {
        console.log('🤖 Background pre-initialization failed (this is normal):', error.message);
        // Don't set error state - this is just background optimization
      });
    }, 100); // Small delay to avoid blocking initial render

    return () => clearTimeout(timer);
  }, [isSupported, preInitializeMicrophone]);

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
    resetTranscript,
    updateAuthStatus,
    
    // Computed values
    canRecord: isSupported && !recordingState.isRecording && !isTranscribing,
    canStop: recordingState.isRecording,
    canPause: recordingState.isRecording && !recordingState.isPaused,
    canResume: recordingState.isRecording && recordingState.isPaused,
    remainingTime: Math.max(0, maxDuration - recordingState.duration),
    isNearMaxDuration: recordingState.duration > maxDuration * 0.9
  };
};