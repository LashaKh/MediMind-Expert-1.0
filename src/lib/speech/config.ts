export const SPEECH_CONFIG = {
  // Google Cloud Speech-to-Text configuration
  googleCloud: {
    apiEndpoint: 'https://speech.googleapis.com/v1/speech:recognize',
    apiKey: import.meta.env.VITE_GOOGLE_SPEECH_API_KEY
  },
  // Default speech recognition settings
  defaults: {
    encoding: 'LINEAR16' as const,
    sampleRateHertz: 16000,
    languageCode: 'ka-GE'
  }
} as const;