import { useState, useCallback, useRef } from 'react';
import { AudioProcessor } from '../utils/audioProcessing';
import { GeorgianTTSService } from '../lib/speech/georgianTTSService';
import { safeAsync } from '../lib/utils/errorHandling';

interface AudioUploadState {
  isUploading: boolean;
  isProcessing: boolean;
  progress: number;
  currentChunk: number;
  totalChunks: number;
  error: string | null;
  processingStage: 'idle' | 'validating' | 'chunking' | 'transcribing' | 'completed' | 'error';
}

interface AudioUploadOptions {
  language?: string;
  autocorrect?: boolean;
  punctuation?: boolean;
  digits?: boolean;
  sessionId?: string;
  onProgress?: (state: AudioUploadState) => void;
  onTranscriptUpdate?: (newText: string, fullText: string, sessionId?: string) => void;
}

interface AudioUploadResult {
  success: boolean;
  transcript: string;
  duration: number;
  chunksProcessed: number;
  error?: string;
}

export const useAudioFileUpload = (options: AudioUploadOptions = {}) => {
  const {
    language = 'ka-GE',
    autocorrect = true,
    punctuation = true,
    digits = true,
    sessionId,
    onProgress,
    onTranscriptUpdate
  } = options;

  const [uploadState, setUploadState] = useState<AudioUploadState>({
    isUploading: false,
    isProcessing: false,
    progress: 0,
    currentChunk: 0,
    totalChunks: 0,
    error: null,
    processingStage: 'idle'
  });

  // Refs for cleanup and cancellation
  const processingAbortRef = useRef<boolean>(false);
  const georgianTTSServiceRef = useRef<GeorgianTTSService | null>(null);

  const updateState = useCallback((updates: Partial<AudioUploadState>) => {
    setUploadState(prev => {
      const newState = { ...prev, ...updates };
      if (onProgress) {
        onProgress(newState);
      }
      return newState;
    });
  }, [onProgress]);

  /**
   * Process uploaded audio file
   */
  const processAudioFile = useCallback(async (file: File): Promise<AudioUploadResult> => {
    // Reset state
    processingAbortRef.current = false;
    updateState({
      isUploading: true,
      isProcessing: true,
      progress: 0,
      currentChunk: 0,
      totalChunks: 0,
      error: null,
      processingStage: 'validating'
    });

    try {
      // Starting audio file processing

      // Step 1: Validate file
      const validation = AudioProcessor.validateAudioFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 2: Get file info
      const audioInfo = await AudioProcessor.getAudioFileInfo(file);
      // Audio file info retrieved

      // Step 3: Estimate processing requirements
      const { chunks: totalChunks } = AudioProcessor.estimateProcessingTime(audioInfo.duration);
      updateState({
        totalChunks,
        processingStage: 'chunking'
      });

      // Estimated processing calculated

      // Step 4: Split audio into chunks
      const chunks = await AudioProcessor.splitAudioIntoChunks(file, (chunkProgress) => {
        if (processingAbortRef.current) return;
        updateState({
          progress: chunkProgress * 0.2, // Chunking is ~20% of total process
          processingStage: 'chunking'
        });
      });

      if (processingAbortRef.current) {
        throw new Error('Processing cancelled by user');
      }

      // Audio chunks created successfully

      // Step 5: Initialize TTS service
      if (!georgianTTSServiceRef.current) {
        georgianTTSServiceRef.current = new GeorgianTTSService();
        await georgianTTSServiceRef.current.initialize();
      }

      updateState({
        processingStage: 'transcribing',
        totalChunks: chunks.length
      });

      // Step 6: Process chunks sequentially
      let combinedTranscript = '';
      const service = georgianTTSServiceRef.current;

      for (let i = 0; i < chunks.length; i++) {
        if (processingAbortRef.current) {
          throw new Error('Processing cancelled by user');
        }

        const chunk = chunks[i];
        updateState({
          currentChunk: i + 1,
          progress: 20 + ((i + 1) / chunks.length) * 80 // 20% for chunking + 80% for transcription
        });

        // Processing current chunk

        try {
          const [result, error] = await safeAsync(
            () => service.recognizeSpeech(chunk.blob, {
              language,
              autocorrect,
              punctuation,
              digits,
              maxRetries: 2
            })
          );

          if (error) {
            console.error(`Chunk ${i + 1} processing failed, skipping:`, error.message);
            continue;
          }

          const chunkText = result?.trim();
          if (chunkText) {
            const separator = combinedTranscript.trim() ? ' ' : '';
            const previousLength = combinedTranscript.length;
            combinedTranscript += separator + chunkText;
            
            // Chunk processed successfully

            // Live transcript update
            if (onTranscriptUpdate) {
              const newText = combinedTranscript.substring(previousLength);
              onTranscriptUpdate(newText, combinedTranscript, sessionId);
            }
          }
        } catch (chunkError) {
          console.error(`Chunk ${i + 1} processing failed:`, chunkError);
          // Continue processing other chunks
        }
      }

      // Step 7: Complete processing
      updateState({
        progress: 100,
        processingStage: 'completed',
        isProcessing: false,
        isUploading: false
      });

      // Audio processing completed successfully

      return {
        success: true,
        transcript: combinedTranscript,
        duration: audioInfo.duration,
        chunksProcessed: chunks.length
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Audio processing failed:', errorMessage);
      
      updateState({
        error: errorMessage,
        processingStage: 'error',
        isProcessing: false,
        isUploading: false
      });

      return {
        success: false,
        transcript: '',
        duration: 0,
        chunksProcessed: 0,
        error: errorMessage
      };
    }
  }, [language, autocorrect, punctuation, digits, sessionId, onTranscriptUpdate, updateState]);

  /**
   * Cancel ongoing processing
   */
  const cancelProcessing = useCallback(() => {
    processingAbortRef.current = true;
    updateState({
      isProcessing: false,
      isUploading: false,
      processingStage: 'idle',
      error: 'Processing cancelled by user'
    });
    // Audio processing cancelled by user
  }, [updateState]);

  /**
   * Reset upload state
   */
  const resetState = useCallback(() => {
    processingAbortRef.current = false;
    setUploadState({
      isUploading: false,
      isProcessing: false,
      progress: 0,
      currentChunk: 0,
      totalChunks: 0,
      error: null,
      processingStage: 'idle'
    });
  }, []);

  /**
   * Get processing status message
   */
  const getStatusMessage = useCallback((): string => {
    switch (uploadState.processingStage) {
      case 'validating':
        return 'Validating audio file...';
      case 'chunking':
        return 'Preparing audio chunks...';
      case 'transcribing':
        return uploadState.totalChunks > 0 
          ? `Processing chunk ${uploadState.currentChunk} of ${uploadState.totalChunks}...`
          : 'Transcribing audio...';
      case 'completed':
        return 'Processing completed successfully!';
      case 'error':
        return uploadState.error || 'Processing failed';
      default:
        return 'Ready to process audio';
    }
  }, [uploadState]);

  /**
   * Check if processing can be started
   */
  const canProcess = uploadState.processingStage === 'idle' && !uploadState.isProcessing;

  /**
   * Check if processing can be cancelled
   */
  const canCancel = uploadState.isProcessing && uploadState.processingStage !== 'completed';

  return {
    uploadState,
    processAudioFile,
    cancelProcessing,
    resetState,
    getStatusMessage,
    canProcess,
    canCancel
  };
};