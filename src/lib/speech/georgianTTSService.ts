import { safeAsync } from '../utils/errorHandling';

interface SpeechRecognitionRequest {
  Engine?: string;
  theAudioDataAsBase64: string;
  Language: string;
  Autocorrect: boolean;
  Punctuation: boolean;
  Digits: boolean;
  Model?: string;
  Speakers?: number;
  enableSpeakerDiarization?: boolean;
}

interface SpeakerSegment {
  Speaker: string;
  Text: string;
  CanBeMultiple: boolean;
  StartSeconds: number;
  EndSeconds: number;
}

interface SpeakerDiarizationResult {
  text: string;
  speakers: SpeakerSegment[];
  hasSpeakers: boolean;
}

// Only keep interfaces needed for the Edge Function

export class GeorgianTTSService {
  private static readonly EDGE_FUNCTION_URL = 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/georgian-tts-proxy';
  private static readonly SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3F0b2xzamdncHl2ZHRkcHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNjk3NzAsImV4cCI6MjA2Mzk0NTc3MH0.GcjFaO69jmW_nuJU4S8mZJdgi7PyM5Z736vGKvnKCyE';

  constructor() {
    // No need for token management - Edge Function handles authentication
  }

  // All authentication is handled by the Edge Function

  private async convertAudioToBase64(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result as string;
          // FileReader with readAsDataURL gives us data:audio/webm;base64,<base64data>
          // We need to extract just the base64 part
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        } catch (error) {
          reject(new Error(`Failed to convert audio to base64: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioBlob); // Use readAsDataURL instead of readAsArrayBuffer
    });
  }

  /**
   * Recognize speech from audio blob using Edge Function
   */
  async recognizeSpeech(
    audioBlob: Blob,
    options: {
      language?: string;
      autocorrect?: boolean;
      punctuation?: boolean;
      digits?: boolean;
      engine?: string;
      model?: string;
      maxRetries?: number;
      enableSpeakerDiarization?: boolean;
      speakers?: number;
    } = {}
  ): Promise<string | SpeakerDiarizationResult> {
    const maxRetries = options.maxRetries || 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const base64Audio = await this.convertAudioToBase64(audioBlob);
        const result = await this.performSpeechRecognition(base64Audio, options);
        
        if (attempt > 1) {

        }
        
        return result;
      } catch (error) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        const delay = 1000 * attempt; // 1s, 2s, 3s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  private async performSpeechRecognition(
    base64Audio: string,
    options: {
      language?: string;
      autocorrect?: boolean;
      punctuation?: boolean;
      digits?: boolean;
      engine?: string;
      model?: string;
      enableSpeakerDiarization?: boolean;
      speakers?: number;
    }
  ): Promise<string | SpeakerDiarizationResult> {
    // Add debug logging for speaker diarization options

    });
    
    const request: SpeechRecognitionRequest = {
      theAudioDataAsBase64: base64Audio,
      Language: options.language === 'ka-GE' ? 'ka' : (options.language === 'Georgian' ? 'ka' : (options.language || 'ka')),
      Autocorrect: options.autocorrect ?? true,
      Punctuation: options.punctuation ?? true,
      Digits: options.digits ?? true,
      ...(options.engine && { Engine: options.engine }),
      ...(options.model && { Model: options.model }),
      // Always include speaker diarization parameters for debugging
      enableSpeakerDiarization: options.enableSpeakerDiarization ?? false,
      Speakers: options.speakers || 2
    };

    });

    // Debug the exact JSON being sent
    const requestBody = JSON.stringify(request);
    const parsedBody = JSON.parse(requestBody);
    .includes('enableSpeakerDiarization') && Object.keys(parsedBody).includes('Speakers')
    });

    const [response, error] = await safeAsync(
      () => fetch(`${GeorgianTTSService.EDGE_FUNCTION_URL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GeorgianTTSService.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: requestBody
      })
    );

    if (error) {
      throw new Error(`Speech recognition request failed: ${error.message}`);
    }

    if (!response.ok) {
      let errorMessage = `Speech recognition failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorBody = await response.text();
        if (errorBody) {
          // Try to parse JSON error response for better error messages
          try {
            const errorData = JSON.parse(errorBody);
            if (errorData.error === 'Service temporarily unavailable') {
              throw new Error(`🚫 ${errorData.message}\n\n${errorData.details || ''}\n\n💡 ${errorData.suggestion || ''}`);
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage += ` - ${errorBody}`;
            }
          } catch (parseError) {
            errorMessage += ` - ${errorBody}`;
          }
        }
      } catch (e) {
        // If we can't parse the error body, just use the basic message
      }
      
      throw new Error(errorMessage);
    }

    // Check if this is a speaker diarization response (JSON) or regular text response
    const contentType = response.headers.get('content-type');
    
    ),
      requestedSpeakerDiarization: options.enableSpeakerDiarization
    });
    
    if (contentType?.includes('application/json')) {
      // Speaker diarization response
      const speakerResult: SpeakerDiarizationResult = await response.json();
      + (speakerResult.text?.length > 100 ? '...' : '')
      });
      return speakerResult;
    } else {
      // Regular transcription response (plain text)
      const result = await response.text();
      console.log('✅ Transcription result (text):', result?.substring(0, 50) + (result?.length > 50 ? '...' : ''));
      return result.trim();
    }
  }

  /**
   * Check if the service is available (Edge Function should handle authentication)
   */
  get isAuthenticated(): boolean {
    return true; // Edge Function handles authentication
  }

  /**
   * Get current service status
   */
  getAuthStatus(): {
    isAuthenticated: boolean;
    tokenExpiresIn: number | null;
    email: string | null;
  } {
    return {
      isAuthenticated: true,
      tokenExpiresIn: null,
      email: 'Handled by Edge Function'
    };
  }

  /**
   * Process an entire audio file by splitting it into chunks and transcribing each chunk
   */
  async processAudioFile(
    file: File,
    options: {
      language?: string;
      autocorrect?: boolean;
      punctuation?: boolean;
      digits?: boolean;
      engine?: string;
      model?: string;
      onProgress?: (progress: number) => void;
      onChunkComplete?: (chunkIndex: number, chunkText: string, totalChunks: number) => void;
      enableSpeakerDiarization?: boolean;
      speakers?: number;
    } = {}
  ): Promise<string | SpeakerDiarizationResult> {
    const { AudioProcessor } = await import('../../utils/audioProcessing');
    
    // Validate file
    const validation = AudioProcessor.validateAudioFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // For speaker diarization, process the entire file at once
    if (options.enableSpeakerDiarization && options.speakers && options.speakers > 1) {

      // Convert file to blob for processing
      const fileBlob = new Blob([file], { type: file.type });
      
      const result = await this.recognizeSpeech(fileBlob, {
        language: options.language,
        autocorrect: options.autocorrect,
        punctuation: options.punctuation,
        digits: options.digits,
        engine: options.engine,
        model: options.model,
        enableSpeakerDiarization: true,
        speakers: options.speakers,
        maxRetries: 2
      });

      if (options.onProgress) {
        options.onProgress(100);
      }

      return result as SpeakerDiarizationResult;
    }

    // Regular chunked processing for non-speaker-diarized transcription
    console.log('🎤 Processing file in chunks (no speaker diarization)...');
    
    // Get file info and split into chunks
    const audioInfo = await AudioProcessor.getAudioFileInfo(file);
    const chunks = await AudioProcessor.splitAudioIntoChunks(file, (progress) => {
      if (options.onProgress) {
        options.onProgress(progress * 0.2); // Chunking is 20% of total process
      }
    });

    let combinedTranscript = '';
    const totalChunks = chunks.length;

    // Process each chunk sequentially
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const chunkResult = await this.recognizeSpeech(chunk.blob, {
          language: options.language,
          autocorrect: options.autocorrect,
          punctuation: options.punctuation,
          digits: options.digits,
          engine: options.engine,
          model: options.model,
          maxRetries: 2
        });

        // Extract text from result (it should be a string for regular transcription)
        const chunkText = typeof chunkResult === 'string' ? chunkResult : chunkResult.text;

        if (chunkText?.trim()) {
          const separator = combinedTranscript.trim() ? ' ' : '';
          combinedTranscript += separator + chunkText.trim();
          
          // Notify chunk completion
          if (options.onChunkComplete) {
            options.onChunkComplete(i, chunkText.trim(), totalChunks);
          }
        }
      } catch (error) {

        // Continue with other chunks instead of failing entirely
      }

      // Update overall progress (20% for chunking + 80% for transcription)
      if (options.onProgress) {
        options.onProgress(20 + ((i + 1) / totalChunks) * 80);
      }
    }

    return combinedTranscript;
  }

  /**
   * Service is always ready (no initialization needed)
   */
  async initialize(): Promise<void> {
    // No initialization needed - Edge Function handles authentication
  }

  /**
   * No logout needed (stateless)
   */
  logout(): void {
    // No tokens to clear - authentication handled by Edge Function
  }
}