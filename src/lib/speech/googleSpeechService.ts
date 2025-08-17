import { SPEECH_CONFIG } from './config';
import { AudioConfig } from './types';
import { API_ENDPOINTS } from '../api/constants';

async function correctGeorgianText(text: string): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINTS.GEORGIAN_CORRECTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: text })
    });

    if (!response.ok) {
      throw new Error('Failed to correct Georgian text');
    }

    const data = await response.json();
    return data.text || text; // Fallback to original text if correction fails
  } catch (error) {

    return text; // Return original text if correction fails
  }
}

export class GoogleSpeechService {
  private readonly apiEndpoint = SPEECH_CONFIG.googleCloud.apiEndpoint;
  private readonly apiKey = SPEECH_CONFIG.googleCloud.apiKey;
  private readonly MAX_DURATION = 60000; // 60 seconds in milliseconds
  private readonly MAX_RECORDING_DURATION = 300000; // 5 minutes total recording time
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingTimeout: NodeJS.Timeout | null = null;
  private chunkStartTime: number = 0;
  private recordingState = {
    isRecording: false,
    isProcessing: false,
    lastError: null as Error | null,
    debugInfo: {
      chunks: 0,
      totalSize: 0,
      startTime: 0,
      lastChunkTime: 0
    }
  };
  private onTranscriptCallback: ((text: string) => void) | null = null;
  private language: string = SPEECH_CONFIG.defaults.languageCode;
  private stream: MediaStream | null = null;

  private getSupportedMimeType(): string | null {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav'
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || null;
  }

  async startRecording(onTranscript: (text: string) => void, language?: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Google Speech API key not configured');
    }

    try {
      // Ensure cleanup of previous recording session
      await this.cleanup();

      this.audioChunks = [];
      this.language = language || SPEECH_CONFIG.defaults.languageCode;
      this.onTranscriptCallback = onTranscript;

      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      const mimeType = this.getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported audio MIME type found for this device');
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      this.recordingState.isRecording = true;
      this.recordingState.debugInfo.startTime = Date.now();

      // Set up recording timeout
      this.recordingTimeout = setTimeout(() => {
        if (this.recordingState.isRecording) {
          this.stopRecording().catch(console.error);
        }
      }, this.MAX_RECORDING_DURATION);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          
          // Check if we need to process the current chunk
          const currentTime = Date.now();
          if (currentTime - this.chunkStartTime >= this.MAX_DURATION) {
            this.processCurrentChunk();
          }
          
          this.recordingState.debugInfo.chunks++;
          this.recordingState.debugInfo.totalSize += event.data.size;
          this.recordingState.debugInfo.lastChunkTime = Date.now();
        }
      };

      this.chunkStartTime = Date.now();
      this.mediaRecorder.start(500); // Collect data every 500ms
      
        mimeType,
        language: this.language,
        sampleRate: 48000,
        apiEndpoint: this.apiEndpoint ? 'Configured' : 'Missing',
        apiKey: this.apiKey ? 'Present' : 'Missing'
      });
    } catch (error) {
      this.recordingState.isRecording = false;
      await this.cleanup();
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.mediaRecorder || !this.recordingState.isRecording) {
      throw new Error('Recording not started');
    }
    
    // Immediately update recording state
    this.recordingState.isRecording = false;

    try {
      this.recordingState.isProcessing = true;

      const transcript = await new Promise<string>((resolve, reject) => {
        if (!this.mediaRecorder) {
          reject(new Error('MediaRecorder not initialized'));
          return;
        }

        this.mediaRecorder.onstop = async () => {
          try {
            const mimeType = this.getSupportedMimeType() || 'audio/webm';
            const audioBlob = new Blob(this.audioChunks, { type: mimeType });
            
              blobSize: audioBlob.size,
              mimeType: audioBlob.type,
              chunks: this.recordingState.debugInfo.chunks,
              duration: (Date.now() - this.recordingState.debugInfo.startTime) / 1000
            });

            const text = await this.transcribeAudio(audioBlob);
            
            if (this.onTranscriptCallback && text) {
              this.onTranscriptCallback(text);
            }
            
            resolve(text);
          } catch (error) {
            reject(error);
          } finally {
            this.recordingState.isProcessing = false;
          }
        };

        this.mediaRecorder.stop();
      });

      return transcript;
    } finally {
      await this.cleanup();
    }
  }

  private async cleanup(): Promise<void> {
    // Update state immediately
    this.recordingState.isProcessing = false;
    this.recordingState.isRecording = false;

    // Stop MediaRecorder if it's running
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    // Stop all tracks in the stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Reset MediaRecorder
    this.mediaRecorder = null;

    // Clear audio chunks
    this.audioChunks = [];
    
    // Clear timeout
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    
    this.onTranscriptCallback = null;

    // Small delay to ensure everything is cleaned up
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async processCurrentChunk(): Promise<void> {
    if (this.audioChunks.length === 0) return;

    const audioBlob = new Blob(this.audioChunks, { type: this.getSupportedMimeType() || 'audio/webm' });
    this.audioChunks = []; // Reset chunks for next batch
    this.chunkStartTime = Date.now();

    try {
      const text = await this.transcribeAudio(audioBlob);
      if (this.onTranscriptCallback && text) {
        this.onTranscriptCallback(text);
      }
    } catch (error) {

    }
  }

  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Empty audio data');
    }

    try {
      const base64Audio = await this.blobToBase64(audioBlob);

        blobSize: audioBlob.size,
        mimeType: audioBlob.type,
        language: this.language
      });

        const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 48000,
              audioChannelCount: 1,
              languageCode: this.language,
              enableAutomaticPunctuation: true,
              model: 'default',
              useEnhanced: true,
              maxAlternatives: 1,
              profanityFilter: false,
              enableWordTimeOffsets: false
            },
            audio: {
              content: base64Audio
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(errorData.error?.message || 'Transcription request failed');
        }

        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {

          return '';
        }

        const transcript = data.results
          .map(result => result.alternatives[0]?.transcript || '')
          .join(' ');
        
        // If language is Georgian, send for correction
        if (this.language === 'ka-GE') {
          return await correctGeorgianText(transcript);
        }

        return transcript;
    } catch (error) {

      if (error instanceof Error) {
        throw new Error(`Transcription failed: ${error.message}`);
      } else {
        throw new Error('Transcription failed with unknown error');
      }
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        } catch (error) {
          reject(new Error('Failed to convert audio to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}