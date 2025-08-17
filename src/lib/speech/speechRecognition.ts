import { SPEECH_CONFIG } from './config';
import { isMobile } from '../utils/device';
import { GoogleSpeechService } from './googleSpeechService';

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isWebSpeechSupported: boolean;
  private googleSpeechService: GoogleSpeechService;
  private isMobileDevice: boolean;
  private onTranscriptCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  
  constructor() {
    this.isWebSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this.googleSpeechService = new GoogleSpeechService();
    this.isMobileDevice = isMobile();
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;

    if (this.isWebSpeechSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
  }

  startRecording(options: {
    onResult: (text: string) => void;
    onError: (error: string) => void;
    language?: string
  }): void {
    this.onTranscriptCallback = options.onResult;
    this.onErrorCallback = options.onError;

    // Always use Google Cloud Speech API on mobile
    if (this.isMobileDevice) {
      this.startMobileRecording(options).catch(error => {
        const errorMessage = this.handleError(error);
        if (this.onErrorCallback) {
          this.onErrorCallback(errorMessage);
        }
      });
      return;
    }

    // Use Web Speech API for desktop browsers if available
    if (!this.recognition) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Speech recognition not supported');
      }
      return;
    }

    try {
      this.recognition.lang = options.language || SPEECH_CONFIG.defaults.languageCode;
      
      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal && this.onTranscriptCallback) {
          this.onTranscriptCallback(result[0].transcript);
        }
      };

      this.recognition.onerror = (event) => {
        if (this.onErrorCallback) {
          const errorMessage = this.handleSpeechError(event);
          this.onErrorCallback(errorMessage);
        }
      };

      this.recognition.start();
    } catch (error) {
      if (this.onErrorCallback) {
        const errorMessage = this.handleError(error);
        this.onErrorCallback(errorMessage);
      }
    }
  }

  stopRecording(): void {
    if (this.recognition) {
      this.recognition.stop();
    } else if (this.isMobileDevice) {
      this.googleSpeechService.stopRecording()
        .then(transcript => {
          if (this.onTranscriptCallback) {
            this.onTranscriptCallback(transcript);
          }
        })
        .catch(error => {
          if (this.onErrorCallback) {
            const errorMessage = this.handleError(error);
            this.onErrorCallback(errorMessage);
          }
        });
    }
  }

  private async startMobileRecording(options: {
    onResult: (text: string) => void;
    onError: (error: string) => void;
    language?: string;
  }): Promise<void> {
    try {
      await this.googleSpeechService.startRecording(
        options.onResult,
        options.language
      );
    } catch (error) {
      throw error;
    }
  }

  private handleSpeechError(event: SpeechRecognitionErrorEvent): string {
    switch (event.error) {
      case 'not-allowed':
        return 'Microphone access denied. Please check your permissions.';
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'network':
        return 'Network error occurred. Please check your connection.';
      default:
        return `Recognition error: ${event.error}`;
    }
  }

  private handleError(error: any): string {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        return 'Microphone access denied. Please grant permission in your browser settings.';
      } else if (error.name === 'NotReadableError') {
        return 'Could not access microphone. Please make sure it is properly connected.';
      }
    }
    return error.message || 'An unknown error occurred';
  }

  isSupported(): boolean {
    return this.isWebSpeechSupported || (this.isMobileDevice && !!SPEECH_CONFIG.googleCloud.apiKey);
  }
}