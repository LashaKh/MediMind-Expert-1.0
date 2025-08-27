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
  private static readonly EDGE_FUNCTION_URL = 'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/georgian-tts-proxy';
  private static readonly ENAGRAMM_BASE_URL = 'https://enagramm.com/API';
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
      () => fetch(`${GeorgianTTSService.ENAGRAMM_BASE_URL}/Account/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      () => fetch(`${GeorgianTTSService.ENAGRAMM_BASE_URL}/Account/RefreshToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
   * Recognize speech from audio blob with robust DALE100 retry logic
   * Handles Enagramm API server instability with aggressive retries
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
    } = {}
  ): Promise<string> {
    const maxRetries = options.maxRetries || 5; // Increased for DALE100 handling
    let lastError;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        await this.ensureValidToken();
        const base64Audio = await this.convertAudioToBase64(audioBlob);
        const result = await this.performSpeechRecognition(base64Audio, options);
        
        // Success - log if this was a retry
        if (attempt > 1) {
          console.log(`✅ Speech recognition succeeded on attempt ${attempt} after DALE100 recovery`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Don't retry for certain error types
        if (errorMessage.includes('401') || errorMessage.includes('Audio too long')) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries + 1) {
          break;
        }
        
        // DALE100 specific retry logic (Enagramm server overload)
        const isDALE100 = errorMessage.includes('DALE100');
        
        if (isDALE100) {
          console.warn(`🔄 DALE100 server overload detected on attempt ${attempt}/${maxRetries + 1}, implementing aggressive retry...`);
          
          // Much longer delays for DALE100 to allow Enagramm servers to recover
          const delay = Math.min(10000, 3000 * Math.pow(1.5, attempt - 1)); // 3s, 4.5s, 6.75s, 10s cap
          console.log(`⏳ Waiting ${delay}ms for Enagramm servers to recover...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Standard retry logic for other errors
          console.warn(`Speech recognition attempt ${attempt} failed, retrying...`, errorMessage);
          const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s, 8s
          console.log(`Waiting ${delay}ms before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we get here, all attempts failed
    const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    const isDALE100 = errorMessage.includes('DALE100');
    
    if (isDALE100) {
      console.error(`❌ All ${maxRetries + 1} attempts failed due to DALE100 - Enagramm servers are experiencing sustained instability`);
      throw new Error(`Enagramm servers are temporarily unstable (DALE100). Please try again in a few moments. Original error: ${errorMessage}`);
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
    }
  ): Promise<string> {
    const request: SpeechRecognitionRequest = {
      theAudioDataAsBase64: base64Audio,
      Language: options.language === 'ka-GE' ? 'ka' : (options.language === 'Georgian' ? 'ka' : (options.language || 'ka')),
      Autocorrect: options.autocorrect ?? true,
      Punctuation: options.punctuation ?? true,
      Digits: options.digits ?? true,
      ...(options.engine && { Engine: options.engine }),
      ...(options.model && { Model: options.model })
    };

    // Minimal debugging for production
    console.log('🎤 JSON Speech request:', { 
      Language: request.Language, 
      audioSize: base64Audio.length,
      Engine: request.Engine || 'STT2',
      Autocorrect: request.Autocorrect,
      Punctuation: request.Punctuation
    });

    // SWITCHED TO JSON FORMAT per user request
    console.log('🔄 USING JSON FORMAT: RecognizeSpeech endpoint with theAudioDataAsBase64');

    const [response, error] = await safeAsync(
      () => fetch(`${GeorgianTTSService.EDGE_FUNCTION_URL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GeorgianTTSService.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
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
        () => fetch(`${GeorgianTTSService.EDGE_FUNCTION_URL}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GeorgianTTSService.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        })
      );

      if (retryError) {
        throw new Error(`Speech recognition retry failed: ${retryError.message}`);
      }

      if (!retryResponse.ok) {
        let retryErrorMessage = `Speech recognition failed: ${retryResponse.status} ${retryResponse.statusText}`;
        
        // Try to get more detailed error information for 422 errors
        if (retryResponse.status === 422) {
          try {
            const errorBody = await retryResponse.text();
            if (errorBody) {
              retryErrorMessage += ` - ${errorBody}`;
            }
          } catch (e) {
            // If we can't parse the error body, just use the basic message
          }
        }
        
        throw new Error(retryErrorMessage);
      }

      // Handle JSON format response (plain text from Edge Function)
      const retryResult = await retryResponse.text();
      console.log('✅ JSON Retry Transcription:', retryResult?.substring(0, 50) + (retryResult?.length > 50 ? '...' : ''));
      return retryResult.trim();
    }

    if (!response.ok) {
      let errorMessage = `Speech recognition failed: ${response.status} ${response.statusText}`;
      
      // Try to get more detailed error information for 422 errors
      if (response.status === 422) {
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - ${errorBody}`;
          }
        } catch (e) {
          // If we can't parse the error body, just use the basic message
        }
      }
      
      throw new Error(errorMessage);
    }

    // JSON endpoint returns plain text from Edge Function
    const result = await response.text();
    console.log('✅ JSON Transcription:', result?.substring(0, 50) + (result?.length > 50 ? '...' : ''));
    return result.trim();
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
    formData.append('Language', options.language === 'ka-GE' ? 'Georgian' : (options.language === 'ka' ? 'Georgian' : (options.language || 'Georgian')));
    formData.append('Autocorrect', String(options.autocorrect ?? true));
    formData.append('Punctuation', String(options.punctuation ?? true));
    formData.append('Digits', String(options.digits ?? true));
    
    if (options.engine) {
      formData.append('Engine', options.engine);
    }

    const [response, error] = await safeAsync(
      () => fetch(`${GeorgianTTSService.ENAGRAMM_BASE_URL}/STT/RecognizeSpeechFileSubmit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken || ''}`
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
        () => fetch(`${GeorgianTTSService.ENAGRAMM_BASE_URL}/STT/RecognizeSpeechFileSubmit`, {
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

  /**
   * Test function: Send two identical requests in parallel to test if issue is sequential vs capacity
   */
  async testParallelRequests(audioBlob: Blob): Promise<{request1: string | null, request2: string | null, bothSucceeded: boolean}> {
    console.log('🧪 PARALLEL TEST: Sending two identical requests simultaneously...');
    
    const options = {
      language: 'ka-GE',
      autocorrect: true,
      punctuation: true,
      digits: true,
      maxRetries: 1 // Single attempt to see raw results
    };

    try {
      // Send both requests at EXACTLY the same time
      const [result1, result2] = await Promise.allSettled([
        this.recognizeSpeech(audioBlob, options),
        this.recognizeSpeech(audioBlob, options)
      ]);

      const request1Text = result1.status === 'fulfilled' ? result1.value : null;
      const request2Text = result2.status === 'fulfilled' ? result2.value : null;

      console.log('📊 PARALLEL TEST RESULTS:');
      console.log(`   Request 1: ${result1.status === 'fulfilled' ? '✅ SUCCESS' : '❌ FAILED'} - "${request1Text?.substring(0, 50) || 'N/A'}"`);
      console.log(`   Request 2: ${result2.status === 'fulfilled' ? '✅ SUCCESS' : '❌ FAILED'} - "${request2Text?.substring(0, 50) || 'N/A'}"`);

      const bothSucceeded = result1.status === 'fulfilled' && result2.status === 'fulfilled';
      
      if (bothSucceeded) {
        console.log('🎉 PARALLEL SUCCESS: Both requests succeeded! Issue is sequential overload, not capacity.');
      } else if (result1.status === 'fulfilled' || result2.status === 'fulfilled') {
        console.log('⚠️ MIXED RESULTS: One succeeded, one failed. Partial capacity issue.');
      } else {
        console.log('💥 BOTH FAILED: Server capacity or other issue affecting all requests.');
      }

      return {
        request1: request1Text,
        request2: request2Text,
        bothSucceeded
      };

    } catch (error) {
      console.error('🧪 PARALLEL TEST ERROR:', error);
      return {
        request1: null,
        request2: null,
        bothSucceeded: false
      };
    }
  }
}