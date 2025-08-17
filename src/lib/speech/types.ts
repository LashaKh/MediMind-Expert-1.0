export interface AudioConfig {
  encoding: 'LINEAR16';
  sampleRateHertz: number;
  languageCode: string;
}

export interface SpeechRecognitionOptions {
  onTranscript: (text: string) => void;
  onError: (error: string) => void;
  language?: string;
}

export interface SpeechSynthesisOptions {
  language: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export type SpeechSynthesisStatus = 'idle' | 'speaking' | 'error';