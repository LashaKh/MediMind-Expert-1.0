import { useState, useCallback, useEffect } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { SpeechSynthesisService } from '../lib/speech/synthesis';
import { SpeechSynthesisStatus } from '../lib/speech/types';

export const useSpeechSynthesis = () => {
  const [status, setStatus] = useState<SpeechSynthesisStatus>('idle');
  const [service, setService] = useState<SpeechSynthesisService | null>(null);
  const { currentLanguage } = useLanguageStore();

  useEffect(() => {
    const speechService = new SpeechSynthesisService({
      language: currentLanguage,
      onStart: () => setStatus('speaking'),
      onEnd: () => setStatus('idle'),
      onError: () => setStatus('error')
    });

    setService(speechService);
  }, [currentLanguage]);

  useEffect(() => {
    service?.setLanguage(currentLanguage);
  }, [currentLanguage, service]);

  const speak = useCallback((text: string) => {
    service?.speak(text);
  }, [service]);

  const stop = useCallback(() => {
    service?.stop();
    setStatus('idle');
  }, [service]);

  return {
    speak,
    stop,
    isSpeaking: status === 'speaking',
    isSupported: service?.isSupported() ?? false
  };
};