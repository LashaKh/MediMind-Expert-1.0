import { SpeechSynthesisOptions } from './types';

export class SpeechSynthesisService {
  private options: SpeechSynthesisOptions;

  constructor(options: SpeechSynthesisOptions) {
    this.options = options;
  }

  public speak(text: string) {
    if (!this.isSupported()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.options.language;

    utterance.onstart = () => this.options.onStart?.();
    utterance.onend = () => this.options.onEnd?.();
    utterance.onerror = (event) => this.options.onError?.(new Error(event.error));

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  public setLanguage(language: string) {
    this.options.language = language;
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}