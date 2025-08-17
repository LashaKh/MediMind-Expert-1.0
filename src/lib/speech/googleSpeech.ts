import { Storage } from '@google-cloud/storage';
import { SpeechClient } from '@google-cloud/speech';

export class GoogleSpeechService {
  private speechClient: SpeechClient;

  constructor() {
    this.speechClient = new SpeechClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY
      }
    });
  }

  async transcribeAudio(audioBuffer: ArrayBuffer): Promise<string> {
    try {
      const audio = {
        content: Buffer.from(audioBuffer).toString('base64')
      };

      const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'ka-GE',
      };

      const request = {
        audio: audio,
        config: config,
      };

      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        ?.map(result => result.alternatives?.[0]?.transcript)
        .join('\n');

      return transcription || '';
    } catch (error) {

      throw new Error('Failed to transcribe audio');
    }
  }
}