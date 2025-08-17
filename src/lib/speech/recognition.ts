import { SpeechRecognitionOptions, TranscriptState } from './types';

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private options: SpeechRecognitionOptions;

  constructor(options: SpeechRecognitionOptions) {
    this.options = options;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      this.options.onError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.options.language;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.recognition) return;

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      this.options.onTranscript(transcript);
    };

    this.recognition.onerror = (event) => {
      this.options.onError(`Speech recognition error: ${event.error}`);
    };
  }

  public start() {
    try {
      this.recognition?.start();
    } catch (error) {
      this.options.onError('Failed to start recording');
    }
  }

  public stop() {
    this.recognition?.stop();
  }

  public setLanguage(language: string) {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }
}