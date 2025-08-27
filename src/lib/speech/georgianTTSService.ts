import { safeAsync } from '../utils/errorHandling';

interface AuthCredentials {
  Email: string;
  Password: string;
  RememberMe: boolean;
}

interface AuthResponse {
  Success: boolean;
  ErrorCode: string;
  Error: string;
  Message: string;
  AccessToken: string;
  RefreshToken: string;
  Email: string;
  PackageID: number;
}

interface RefreshTokenRequest {
  AccessToken: string;
  RefreshToken: string;
}

interface SpeechRecognitionRequest {
  Engine?: string;
  theAudioDataAsBase64: string;
  Language: string;
  Autocorrect: boolean;
  Punctuation: boolean;
  Digits: boolean;
  Model?: string;
}

interface SpeechRecognitionResponse {
  Success: boolean;
  ErrorCode: string;
  Error: string;
  Message: string;
  Text: string;
  WordsCount: number;
  VoiceFilePath: string;
}

interface SpeakerInfo {
  Speaker: string;
  Text: string;
  CanBeMultiple: boolean;
  StartSeconds: number;
  EndSeconds: number;
}

interface FileSpeechRecognitionResponse {
  Success: boolean;
  ErrorCode: string;
  Error: string;
  Message: string;
  lstSpeakers: SpeakerInfo[];
  VoiceFilePath: string;
}

export class GeorgianTTSService {
  private static readonly BASE_URL = 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/georgian-tts-proxy';
  private static readonly SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3F0b2xzamdncHl2ZHRkcHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNjk3NzAsImV4cCI6MjA2Mzk0NTc3MH0.GcjFaO69jmW_nuJU4S8mZJdgi7PyM5Z736vGKvnKCyE';
  private static readonly CREDENTIALS: AuthCredentials = {
    Email: 'Lasha.khosht@gmail.com',
    Password: 'Dba545c5fde36242@',
    RememberMe: true
  };

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiryTime: number | null = null;

  constructor() {
    // Load saved tokens from localStorage
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    try {
      const savedTokens = localStorage.getItem('georgian-tts-tokens');
      if (savedTokens) {
        const tokens = JSON.parse(savedTokens);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.tokenExpiryTime = tokens.expiryTime;
      }
    } catch (error) {
      console.warn('Failed to load saved tokens:', error);
    }
  }

  private saveTokensToStorage(): void {
    try {
      const tokens = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiryTime: this.tokenExpiryTime
      };
      localStorage.setItem('georgian-tts-tokens', JSON.stringify(tokens));
    } catch (error) {
      console.warn('Failed to save tokens:', error);
    }
  }

  private clearTokensFromStorage(): void {
    try {
      localStorage.removeItem('georgian-tts-tokens');
    } catch (error) {
      console.warn('Failed to clear tokens:', error);
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiryTime) return true;
    // Add 1 minute buffer to prevent edge cases
    return Date.now() >= (this.tokenExpiryTime - 60000);
  }

  private async login(): Promise<void> {
    const [response, error] = await safeAsync(
      () => fetch(`${GeorgianTTSService.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GeorgianTTSService.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(GeorgianTTSService.CREDENTIALS)
      })
    );

    if (error) {
      throw new Error(`Login request failed: ${error.message}`);
    }

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const [data, parseError] = await safeAsync<AuthResponse>(() => response.json());
    if (parseError) {
      throw new Error(`Failed to parse login response: ${parseError.message}`);
    }

    if (!data.Success) {
      throw new Error(`Login failed: ${data.Error || data.Message || 'Unknown error'}`);
    }

    this.accessToken = data.AccessToken;
    this.refreshToken = data.RefreshToken;
    // Tokens expire in 30 minutes, store the exact expiry time
    this.tokenExpiryTime = Date.now() + (30 * 60 * 1000);
    
    this.saveTokensToStorage();
  }

  private async refreshTokens(): Promise<void> {
    if (!this.accessToken || !this.refreshToken) {
      throw new Error('No tokens available for refresh');
    }

    const refreshRequest: RefreshTokenRequest = {
      AccessToken: this.accessToken,
      RefreshToken: this.refreshToken
    };

    const [response, error] = await safeAsync(
      () => fetch(`${GeorgianTTSService.BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GeorgianTTSService.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(refreshRequest)
      })
    );

    if (error) {
      throw new Error(`Token refresh request failed: ${error.message}`);
    }

    if (!response.ok) {
      // If refresh fails, clear tokens and try login
      this.clearTokensFromStorage();
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiryTime = null;
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
    }

    const [data, parseError] = await safeAsync<AuthResponse>(() => response.json());
    if (parseError) {
      throw new Error(`Failed to parse refresh response: ${parseError.message}`);
    }

    if (!data.Success) {
      // Clear tokens and force re-login
      this.clearTokensFromStorage();
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiryTime = null;
      throw new Error(`Token refresh failed: ${data.Error || data.Message || 'Unknown error'}`);
    }

    this.accessToken = data.AccessToken;
    this.refreshToken = data.RefreshToken;
    this.tokenExpiryTime = Date.now() + (30 * 60 * 1000);
    
    this.saveTokensToStorage();
  }

  private async ensureValidToken(): Promise<void> {
    // If no token or token is expired, try to refresh or login
    if (!this.accessToken || this.isTokenExpired()) {
      if (this.refreshToken) {
        try {
          await this.refreshTokens();
          return;
        } catch (error) {
          console.warn('Token refresh failed, attempting login:', error);
        }
      }
      
      // If refresh failed or no refresh token, login
      await this.login();
    }
  }

  private async convertAudioToBase64(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          
          // Convert to base64 using chunks to avoid stack overflow
          let binary = '';
          const chunkSize = 8192;
          
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }
          
          const base64 = btoa(binary);
          resolve(base64);
        } catch (error) {
          reject(new Error(`Failed to convert audio to base64: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsArrayBuffer(audioBlob);
    });
  }

  /**
   * Recognize speech from audio blob (real-time recognition)
   * Maximum 25 seconds duration
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
    } = {}
  ): Promise<string> {
    await this.ensureValidToken();

    const base64Audio = await this.convertAudioToBase64(audioBlob);
    
    const request: SpeechRecognitionRequest = {
      theAudioDataAsBase64: base64Audio,
      Language: options.language || 'ka-GE',
      Autocorrect: options.autocorrect ?? true,
      Punctuation: options.punctuation ?? true,
      Digits: options.digits ?? true,
      ...(options.engine && { Engine: options.engine }),
      ...(options.model && { Model: options.model })
    };

    const [response, error] = await safeAsync(
      () => fetch(`${GeorgianTTSService.BASE_URL}/recognize-speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GeorgianTTSService.SUPABASE_ANON_KEY}`,
          'X-Georgian-Token': this.accessToken || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })
    );

    if (error) {
      throw new Error(`Speech recognition request failed: ${error.message}`);
    }

    if (response.status === 401) {
      // Token might be expired, try to refresh and retry once
      await this.ensureValidToken();
      
      const [retryResponse, retryError] = await safeAsync(
        () => fetch(`${GeorgianTTSService.BASE_URL}/recognize-speech`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GeorgianTTSService.SUPABASE_ANON_KEY}`,
            'X-Georgian-Token': this.accessToken || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request)
        })
      );

      if (retryError) {
        throw new Error(`Speech recognition retry failed: ${retryError.message}`);
      }

      if (!retryResponse.ok) {
        throw new Error(`Speech recognition failed: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      const [retryData, retryParseError] = await safeAsync<SpeechRecognitionResponse>(() => retryResponse.json());
      if (retryParseError) {
        throw new Error(`Failed to parse retry response: ${retryParseError.message}`);
      }

      if (!retryData.Success) {
        throw new Error(`Speech recognition failed: ${retryData.Error || retryData.Message || 'Unknown error'}`);
      }

      return retryData.Text;
    }

    if (!response.ok) {
      throw new Error(`Speech recognition failed: ${response.status} ${response.statusText}`);
    }

    const [data, parseError] = await safeAsync<SpeechRecognitionResponse>(() => response.json());
    if (parseError) {
      throw new Error(`Failed to parse recognition response: ${parseError.message}`);
    }

    if (!data.Success) {
      throw new Error(`Speech recognition failed: ${data.Error || data.Message || 'Unknown error'}`);
    }

    return data.Text;
  }

  /**
   * Recognize speech from MP3 file with speaker separation
   */
  async recognizeSpeechFromFile(
    file: File,
    options: {
      language?: string;
      autocorrect?: boolean;
      punctuation?: boolean;
      digits?: boolean;
      engine?: string;
      speakers?: number;
    } = {}
  ): Promise<SpeakerInfo[]> {
    if (file.type !== 'audio/mp3' && file.type !== 'audio/mpeg') {
      throw new Error('Only MP3 files are supported for file upload recognition');
    }

    await this.ensureValidToken();

    const formData = new FormData();
    formData.append('AudioFile', file);
    formData.append('Speakers', String(options.speakers || 1));
    formData.append('Language', options.language || 'ka');
    formData.append('Autocorrect', String(options.autocorrect ?? true));
    formData.append('Punctuation', String(options.punctuation ?? true));
    formData.append('Digits', String(options.digits ?? true));
    
    if (options.engine) {
      formData.append('Engine', options.engine);
    }

    const [response, error] = await safeAsync(
      () => fetch(`${GeorgianTTSService.BASE_URL}/recognize-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GeorgianTTSService.SUPABASE_ANON_KEY}`,
          'X-Georgian-Token': this.accessToken || '',
        },
        body: formData
      })
    );

    if (error) {
      throw new Error(`File recognition request failed: ${error.message}`);
    }

    if (response.status === 401) {
      // Token might be expired, try to refresh and retry once
      await this.ensureValidToken();
      
      const [retryResponse, retryError] = await safeAsync(
        () => fetch(`${GeorgianTTSService.BASE_URL}/recognize-file`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GeorgianTTSService.SUPABASE_ANON_KEY}`,
            'X-Georgian-Token': this.accessToken || '',
          },
          body: formData
        })
      );

      if (retryError) {
        throw new Error(`File recognition retry failed: ${retryError.message}`);
      }

      if (!retryResponse.ok) {
        throw new Error(`File recognition failed: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      const [retryData, retryParseError] = await safeAsync<FileSpeechRecognitionResponse>(() => retryResponse.json());
      if (retryParseError) {
        throw new Error(`Failed to parse retry response: ${retryParseError.message}`);
      }

      if (!retryData.Success) {
        throw new Error(`File recognition failed: ${retryData.Error || retryData.Message || 'Unknown error'}`);
      }

      return retryData.lstSpeakers;
    }

    if (!response.ok) {
      throw new Error(`File recognition failed: ${response.status} ${response.statusText}`);
    }

    const [data, parseError] = await safeAsync<FileSpeechRecognitionResponse>(() => response.json());
    if (parseError) {
      throw new Error(`Failed to parse file recognition response: ${parseError.message}`);
    }

    if (!data.Success) {
      throw new Error(`File recognition failed: ${data.Error || data.Message || 'Unknown error'}`);
    }

    return data.lstSpeakers;
  }

  /**
   * Check if the service is properly initialized and tokens are available
   */
  get isAuthenticated(): boolean {
    return !!(this.accessToken && !this.isTokenExpired());
  }

  /**
   * Get current authentication status
   */
  getAuthStatus(): {
    isAuthenticated: boolean;
    tokenExpiresIn: number | null;
    email: string | null;
  } {
    return {
      isAuthenticated: this.isAuthenticated,
      tokenExpiresIn: this.tokenExpiryTime ? Math.max(0, this.tokenExpiryTime - Date.now()) : null,
      email: GeorgianTTSService.CREDENTIALS.Email
    };
  }

  /**
   * Manually trigger authentication if not already authenticated
   */
  async initialize(): Promise<void> {
    if (!this.isAuthenticated) {
      await this.ensureValidToken();
    }
  }

  /**
   * Force logout and clear all stored tokens
   */
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiryTime = null;
    this.clearTokensFromStorage();
  }
}