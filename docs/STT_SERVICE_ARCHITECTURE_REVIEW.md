# Speech-to-Text Service Architecture Review
## Complete Technical Documentation & Configuration Guide

**Document Version**: 1.0
**Last Updated**: 2025-10-03
**Project**: MediMind Expert - Georgian Medical Transcription System

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Enagram API Integration](#enagram-api-integration)
4. [Google Chirp API Integration](#google-chirp-api-integration)
5. [Frontend Integration Layer](#frontend-integration-layer)
6. [Edge Functions Architecture](#edge-functions-architecture)
7. [Audio Processing Pipeline](#audio-processing-pipeline)
8. [State Management & Real-time Updates](#state-management--real-time-updates)
9. [Configuration Reference](#configuration-reference)
10. [Performance Optimizations](#performance-optimizations)
11. [Error Handling & Recovery](#error-handling--recovery)
12. [Quick Reference Tables](#quick-reference-tables)

---

## Executive Summary

### System Overview

MediMind Expert implements a **parallel Speech-to-Text (STT) system** with two engines processing simultaneously:

1. **Enagram API** - Georgian language specialist with 3 STT models and speaker diarization
2. **Google Chirp API** - Multilingual v2 API with advanced Georgian support

Both services process the same audio in parallel for maximum accuracy and reliability.

### Key Capabilities

- ✅ **Real-time transcription** with <200ms recording start time
- ✅ **Parallel processing** - Both engines work simultaneously on same audio
- ✅ **Dual transcript management** - Separate Google, Enagram, and combined transcripts
- ✅ **Smart segmentation** (15s for Enagram, 5s for Google)
- ✅ **Speaker diarization** (Enagram STT2/STT3 models)
- ✅ **Session isolation** with unique session IDs
- ✅ **Error resilience** - One service failing doesn't block the other
- ✅ **Performance optimized** batch processing with fresh service instances
- ✅ **Cross-platform** browser compatibility with MediaRecorder API

### Architecture Flow

```
┌─────────────────┐
│  User Interface │
│  (GeorgianSTT)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  useGeorgianTTS                 │◄─── State Management
│  (Custom Hook)                  │
│  • googleTranscriptRef          │
│  • enagramTranscriptRef         │
│  • combinedForSubmissionRef     │
└─────────┬───────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│ georgianTTSService              │◄─── Service Layer
│  • recognizeSpeechParallel()    │
│  • Promise.allSettled()         │
└──────────┬──────────────────────┘
           │
           ├──────────────┬────────────────┐
           │              │                │
           ▼              ▼                ▼
┌──────────────────────────────────────────────┐
│     Supabase Edge Functions (Parallel)       │
│  ┌────────────┐       ┌────────────────┐    │
│  │ georgian-  │       │  google-stt-   │    │
│  │ tts-proxy  │       │    proxy       │    │
│  └─────┬──────┘       └────────┬───────┘    │
└────────┼───────────────────────┼─────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐       ┌──────────────────┐
│  Enagram API    │       │  Google Cloud    │
│  (enagramm.com) │       │  Speech API v2   │
└─────────────────┘       └──────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Parallel Results    │
          │  • google: string    │
          │  • enagram: string   │
          │  • combined: string  │
          └──────────────────────┘
```

---

## System Architecture Overview

### Component Hierarchy

```
src/
├── components/Georgian/
│   ├── GeorgianSTTApp.tsx              # Main UI component
│   ├── GeorgianSTTAppWrapper.tsx       # Context wrapper
│   ├── TranscriptPanel.tsx             # Transcript display
│   └── SessionHistory.tsx              # Session management
│
├── hooks/
│   └── useGeorgianTTS.ts               # ⭐ Core business logic
│
├── lib/speech/
│   └── georgianTTSService.ts           # ⭐ API service layer
│
supabase/functions/
├── georgian-tts-proxy/
│   └── index.ts                        # ⭐ Enagram Edge Function
│
└── google-stt-proxy/
    └── index.ts                        # ⭐ Google Chirp Edge Function
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18.3.1 + TypeScript | UI components & state |
| **Audio API** | MediaRecorder + Web Audio | Audio capture & monitoring |
| **Backend** | Supabase Edge Functions (Deno) | Serverless STT proxy |
| **STT Engine 1** | Enagram API | Georgian specialist |
| **STT Engine 2** | Google Chirp v2 | Advanced Georgian support |
| **State** | Custom hooks + refs | Performance optimization |

---

## Enagram API Integration

### Authentication Configuration

**Edge Function**: `georgian-tts-proxy`

#### Credentials (from .env & Edge Function)

```typescript
// Hardcoded in Edge Function
const ENAGRAMM_CREDENTIALS = {
  Email: 'Lasha.khosht@gmail.com',
  Password: 'Dba545c5fde36242@',
  RememberMe: true
}

// API Base URL
const ENAGRAMM_API_BASE = 'https://enagramm.com/API'
```

#### Token Caching Strategy

```typescript
// Global in-memory cache (Edge Function)
let cachedAccessToken: string | null = null
let tokenExpiryTime: number | null = null

async function getValidToken(): Promise<string> {
  // Check cache validity (29-minute window)
  if (cachedAccessToken && tokenExpiryTime &&
      Date.now() < (tokenExpiryTime - 60000)) {
    return cachedAccessToken
  }

  // Fresh login
  const loginResponse = await fetch(
    'https://enagramm.com/API/Account/Login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ENAGRAMM_CREDENTIALS)
    }
  )

  const loginData: AuthResponse = await loginResponse.json()

  // Cache for 29 minutes (30-minute token with 1-min buffer)
  cachedAccessToken = loginData.AccessToken
  tokenExpiryTime = Date.now() + (29 * 60 * 1000)

  return cachedAccessToken
}
```

### STT Models & Capabilities

| Model | Engine Param | Speaker Diarization | Use Case |
|-------|--------------|-------------------|----------|
| **STT1** | `undefined` or `'STT1'` | ❌ No | Fast, regular transcription (default) |
| **STT2** | `'STT2'` | ✅ Yes | Multi-speaker conversations |
| **STT3** | `'STT3'` | ✅ Yes | Multi-speaker conversations |

#### Model Selection Logic (Edge Function)

```typescript
const isSTT1 = !body.Engine || body.Engine === 'STT1'
const canUseSpeakerDiarization = !isSTT1 &&
  (body.Engine === 'STT2' || body.Engine === 'STT3')

// STT1: Regular endpoint
if (!canUseSpeakerDiarization) {
  const speechRequest = {
    theAudioDataAsBase64: body.theAudioDataAsBase64,
    Language: body.Language === 'ka-GE' ? 'ka' : body.Language,
    Punctuation: body.Punctuation ?? true,
    Autocorrect: body.Autocorrect ?? true,
    Digits: body.Digits ?? true,
    // ⚠️ IMPORTANT: Omit Engine for STT1 (default)
    ...(body.Engine && body.Engine !== 'STT1' && { Engine: body.Engine })
  }

  await fetch(`${ENAGRAMM_API_BASE}/STT/RecognizeSpeech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(speechRequest)
  })
}

// STT2/STT3: File upload for speaker diarization
if (canUseSpeakerDiarization &&
    body.enableSpeakerDiarization &&
    body.Speakers >= 2) {

  const formData = new FormData()
  formData.append('AudioFile', audioBlob, 'audio.webm')
  formData.append('Speakers', body.Speakers.toString())
  formData.append('Language', body.Language === 'ka-GE' ? 'ka' : body.Language)
  formData.append('Engine', body.Engine) // Required for STT2/STT3
  formData.append('Autocorrect', body.Autocorrect.toString())
  formData.append('Punctuation', body.Punctuation.toString())
  formData.append('Digits', body.Digits.toString())

  await fetch(`${ENAGRAMM_API_BASE}/STT/RecognizeSpeechFileSubmit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData
  })
}
```

### Audio Constraints (Enagram)

| Constraint | Value | Reason |
|-----------|-------|--------|
| **Max Duration** | 25 seconds | API limit |
| **Safe Duration** | 24 seconds | 1s buffer for safety |
| **Max Blob Size** | 320 KB | Proven stable size |
| **Chunk Size** | 1000 ms | MediaRecorder data collection |
| **Batch Duration** | 20 seconds | Optimal for processing |
| **Retry Delay** | 30 seconds | Rate limit avoidance |

### API Endpoints (Enagram)

```typescript
// Base URL
const BASE = 'https://enagramm.com/API'

// Endpoints
const ENDPOINTS = {
  login: `${BASE}/Account/Login`,
  regularSTT: `${BASE}/STT/RecognizeSpeech`,           // STT1
  speakerDiarization: `${BASE}/STT/RecognizeSpeechFileSubmit` // STT2/STT3
}
```

---

## Google Chirp API Integration

### Authentication Configuration

**Edge Function**: `google-stt-proxy`

#### Service Account Credentials

```typescript
// Hardcoded in Edge Function
const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "wide-song-473914-b6",
  private_key_id: "e8f9db23023ccbad7a98a53fed55741dc941e8f3",
  private_key: "-----BEGIN PRIVATE KEY-----\n...",
  client_email: "id-medimind-speech-v2@wide-song-473914-b6.iam.gserviceaccount.com",
  token_uri: "https://oauth2.googleapis.com/token"
}

// Recognizer Configuration
const RECOGNIZER_NAME = 'medimind-chirp-georgian'
const LOCATION = 'us-central1' // Regional (Chirp requires regional)
const PROJECT_ID = 'wide-song-473914-b6'
```

#### JWT-based Authentication

```typescript
async function createJWT(): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: SERVICE_ACCOUNT.client_email,
    sub: SERVICE_ACCOUNT.client_email,
    aud: SERVICE_ACCOUNT.token_uri,
    iat: now,
    exp: now + 3600, // 1 hour
    scope: 'https://www.googleapis.com/auth/cloud-platform'
  }

  // Sign with private key using crypto.subtle
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  )

  return `${unsignedToken}.${encodedSignature}`
}

async function getAccessToken(): Promise<string> {
  const jwt = await createJWT()

  const response = await fetch(SERVICE_ACCOUNT.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })

  const data = await response.json()
  return data.access_token
}
```

### Recognizer Management

#### Auto-Create Recognizer

```typescript
async function ensureRecognizer(accessToken: string): Promise<void> {
  const recognizerPath = `projects/${PROJECT_ID}/locations/${LOCATION}/recognizers/${RECOGNIZER_NAME}`
  const endpoint = `https://${LOCATION}-speech.googleapis.com/v2/${recognizerPath}`

  // Check existence
  const checkResponse = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (checkResponse.ok) return // Already exists

  // Create recognizer
  const recognizerConfig = {
    model: 'chirp',
    languageCodes: ['ka-GE'],
    defaultRecognitionConfig: {
      features: {
        enableAutomaticPunctuation: true
      }
    }
  }

  await fetch(createEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(recognizerConfig)
  })
}
```

### Audio Constraints (Google Chirp)

| Constraint | Value | Reason |
|-----------|-------|--------|
| **Max Duration** | 60 seconds (1 min) | V2 API sync limit |
| **Safe Duration** | 5 seconds | Live transcription feel |
| **Max Blob Size** | 80 KB | ~5s audio at 16kHz |
| **Chunk Size** | 1000 ms | MediaRecorder data collection |
| **Retry Delay** | 5 seconds | Fast retry for UX |

### API Endpoints (Google)

```typescript
// Base URL (regional)
const LOCATION = 'us-central1'
const BASE = `https://${LOCATION}-speech.googleapis.com/v2`

// Endpoints
const ENDPOINTS = {
  oauth: 'https://oauth2.googleapis.com/token',
  recognizer: `${BASE}/projects/${PROJECT_ID}/locations/${LOCATION}/recognizers/${RECOGNIZER_NAME}`,
  recognize: `${BASE}/projects/${PROJECT_ID}/locations/${LOCATION}/recognizers/${RECOGNIZER_NAME}:recognize`
}
```

### Request Format

```typescript
const requestBody = {
  config: {
    auto_decoding_config: {}, // Auto-detect audio format
    features: {
      enableAutomaticPunctuation: body.Punctuation !== false
    }
  },
  content: body.theAudioDataAsBase64 // Base64 audio
}

const response = await fetch(recognizeEndpoint, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestBody)
})

// Response format
const result = {
  results: [{
    alternatives: [{
      transcript: "ტრანსკრიფცია...",
      confidence: 0.95
    }]
  }]
}
```

---

## Parallel Processing Architecture

### Overview

MediMind Expert's parallel STT system processes audio through **both Google Chirp and Enagram services simultaneously** for maximum accuracy and reliability. This architecture ensures transcription continues even if one service fails.

### Core Parallel Processing Method

**File**: `src/lib/speech/georgianTTSService.ts` (lines 271-346)

```typescript
async recognizeSpeechParallel(
  audioBlob: Blob,
  options: {
    language?: string;
    autocorrect?: boolean;
    punctuation?: boolean;
    digits?: boolean;
    maxRetries?: number;
    enableSpeakerDiarization?: boolean;
    speakers?: number;
  } = {}
): Promise<{
  google: string;
  enagram: string | SpeakerDiarizationResult;
  primary: string; // For UI display (Google)
  combined: string; // For submission
}>
```

#### Implementation Pattern

```typescript
// 1. Prepare both service requests with same audio
const googleOptions = { ...options, engine: 'GoogleChirp' };
const enagramOptions = { ...options, engine: 'Fast' };

// 2. Execute both services in parallel using Promise.allSettled
const [googleResult, enagramResult] = await Promise.allSettled([
  this.performSpeechRecognition(base64Audio, googleOptions),
  this.performSpeechRecognition(base64Audio, enagramOptions)
]);

// 3. Extract results with error resilience
const googleText = googleResult.status === 'fulfilled' ?
  (typeof googleResult.value === 'string' ? googleResult.value : '') : '';

const enagramText = enagramResult.status === 'fulfilled' ?
  enagramResult.value : '';

// 4. Ensure at least one service succeeded
if (!googleText.trim() && !enagramText.trim()) {
  throw new Error('Both Google and Enagram TTS services failed');
}

// 5. Create combined transcript for AI processing
const combinedText = [googleText, enagramText]
  .filter(text => text.trim())
  .join('\n--- Alternative Transcription ---\n');

return {
  google: googleText,
  enagram: enagramText,
  primary: googleText, // Google for UI display
  combined: combinedText
};
```

### Dual Transcript Management

**File**: `src/hooks/useGeorgianTTS.ts`

The hook maintains three separate transcript refs for parallel processing:

```typescript
// Separate transcripts for each service
const googleTranscriptRef = useRef<string>('');
const enagramTranscriptRef = useRef<string>('');
const combinedForSubmissionRef = useRef<string>('');
```

#### Transcript Accumulation Pattern

Each service builds its own complete transcript independently:

```typescript
const updateCombinedTranscriptRefs = useCallback((parallelResults: any) => {
  // Google transcript accumulation
  if (parallelResults.google?.trim()) {
    const prevGoogle = googleTranscriptRef.current.trim();
    const separator = prevGoogle ? ' ' : '';
    googleTranscriptRef.current = prevGoogle + separator + parallelResults.google.trim();
  }

  // Enagram transcript accumulation
  if (parallelResults.enagram?.trim()) {
    const prevEnagram = enagramTranscriptRef.current.trim();
    const separator = prevEnagram ? ' ' : '';
    enagramTranscriptRef.current = prevEnagram + separator + parallelResults.enagram.trim();
  }

  // Build combined transcript for AI submission
  const completeGoogleTranscript = googleTranscriptRef.current.trim();
  const completeEnagramTranscript = enagramTranscriptRef.current.trim();

  if (completeGoogleTranscript || completeEnagramTranscript) {
    const parts = [];
    if (completeGoogleTranscript) parts.push(completeGoogleTranscript);
    if (completeEnagramTranscript) parts.push(completeEnagramTranscript);

    combinedForSubmissionRef.current = parts.join('\n--- Alternative Transcription ---\n');
  }
}, []);
```

### Combined Transcript Format

The combined transcript for AI processing uses this format:

```
FULL GOOGLE CHIRP TRANSCRIPT (all segments combined)
--- Alternative Transcription ---
FULL ENAGRAM TRANSCRIPT (all segments combined)
```

**Benefits of this format:**
- AI gets two complete versions for cross-validation
- Better accuracy in diagnosis generation
- Redundancy if one service produces errors
- Enhanced medical term recognition

### UI Display Strategy

**Priority Order:**
1. **Primary**: Google Chirp transcript (faster, better quality)
2. **Fallback**: Enagram transcript (if Google fails)
3. **Display**: Best available result immediately

```typescript
// UI display logic
const displayText = googleText.trim() || enagramText.trim() || '';
```

### Error Resilience Benefits

#### 1. Service-Level Resilience
```typescript
// Promise.allSettled ensures one failure doesn't block the other
const [googleResult, enagramResult] = await Promise.allSettled([...]);

// Individual failure handling
if (googleResult.status === 'rejected') {
  console.warn('⚠️ Google TTS failed:', googleResult.reason?.message);
}
if (enagramResult.status === 'rejected') {
  console.warn('⚠️ Enagram TTS failed:', enagramResult.reason?.message);
}
```

#### 2. Graceful Degradation
- One service failing: Continue with successful service
- Both services failing: Throw error to user
- Partial results: Use best available transcript

#### 3. Independent Retry Logic
- Google: 5-second retry delay, fast recovery
- Enagram: 30-second retry delay, prevents rate limiting
- Each service retries independently

### Integration Points

#### 1. GeorgianSTTApp Component
```typescript
// Access combined transcript for AI processing
const combinedTranscript = getCombinedTranscriptForSubmission();
const transcript = combinedTranscript || localTranscript || currentSession?.transcript;

// Submit to AI with both transcripts
const result = await processText(transcript, instruction);
```

#### 2. VoiceTranscriptField Component (Form 100)
```typescript
// Expose combined transcript function to parent
useEffect(() => {
  if (onCombinedTranscriptReady && getCombinedTranscriptForSubmission) {
    onCombinedTranscriptReady(getCombinedTranscriptForSubmission);
  }
}, [onCombinedTranscriptReady, getCombinedTranscriptForSubmission]);
```

#### 3. Batch Processing
```typescript
// Process audio batch with parallel services
const parallelResults = await freshService.recognizeSpeechParallel(batchBlob, options);

// Update all transcript refs
updateCombinedTranscriptRefs(parallelResults);

// Handle speaker diarization from Enagram
if (typeof parallelResults.enagram === 'object' && parallelResults.enagram.hasSpeakers) {
  setSpeakerSegments(prev => [...prev, ...(parallelResults.enagram.speakers || [])]);
}
```

### Performance Characteristics

| Aspect | Google Chirp | Enagram Fast | Parallel Benefit |
|--------|-------------|--------------|------------------|
| **Segment Duration** | 5 seconds | 15 seconds | Faster updates from Google |
| **Batch Delay** | 3 seconds | 30 seconds | Quick user feedback |
| **Processing Time** | ~1-2 seconds | ~2-3 seconds | Concurrent execution |
| **Total Time** | Sequential: 4-5s | Parallel: 2-3s | **~50% faster** |
| **Error Recovery** | Independent | Independent | No single point of failure |

### Fallback Strategy

```typescript
// Primary: Use parallel processing
const result = await processChunk(audioBlob);

// Fallback: If parallel processing fails completely
try {
  const fallbackResult = await georgianTTSService.recognizeSpeech(audioBlob, {
    engine: 'GoogleChirp', // Fast fallback
    maxRetries: 1
  });
} catch (fallbackError) {
  // All processing failed - notify user
}
```

---

## Frontend Integration Layer

### useGeorgianTTS Hook Architecture

**File**: `src/hooks/useGeorgianTTS.ts` (1570 lines)

#### Core State Management

```typescript
interface UseGeorgianTTSOptions {
  language?: string                    // Default: 'ka-GE'
  autocorrect?: boolean               // Default: true
  punctuation?: boolean               // Default: true
  digits?: boolean                    // Default: true
  maxDuration?: number                // No limit (0)
  chunkSize?: number                  // 1000ms
  chunkDuration?: number              // 20000ms (Enagram) or 5000ms (Google)
  enableStreaming?: boolean           // Default: true
  sessionId?: string                  // Session isolation
  onLiveTranscriptUpdate?: (newText: string, fullText: string, sessionId?: string) => void
  enableSpeakerDiarization?: boolean  // Default: false
  speakers?: number                   // Default: 2
}

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioLevel: number
  isProcessingChunks: boolean
  processedChunks: number
  totalChunks: number
}
```

#### STT Model Selection

```typescript
// Persistent model selection (localStorage)
const [selectedSTTModel, setSelectedSTTModel] = useState<'STT1' | 'STT2' | 'STT3' | 'GoogleSTT'>(() => {
  const saved = localStorage.getItem('medimind_stt_model')
  return (saved === 'STT1' || saved === 'STT2' || saved === 'STT3' || saved === 'GoogleSTT')
    ? saved
    : 'STT1' // Default to fast model
})

const updateSelectedSTTModel = useCallback((model: 'STT1' | 'STT2' | 'STT3' | 'GoogleSTT') => {
  setSelectedSTTModel(model)
  selectedSTTModelRef.current = model // Update ref immediately for async ops
  localStorage.setItem('medimind_stt_model', model)
}, [])
```

#### Performance Optimizations

##### 1. Microphone Pre-initialization (<200ms target)

```typescript
const preInitializeMicrophone = useCallback(async (): Promise<MediaStream> => {
  // Return cached stream immediately (0ms delay)
  if (preInitializedStreamRef.current && preInitializedStreamRef.current.active) {
    console.log('🚀 Using cached pre-initialized stream - 0ms delay')
    return preInitializedStreamRef.current
  }

  // Await existing promise to avoid duplicate requests
  if (preInitPromiseRef.current) {
    return await preInitPromiseRef.current
  }

  console.time('🚀 Microphone pre-initialization')

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 16000,        // Lower for faster processing
      channelCount: 1,          // Mono for better performance
      latency: 0,               // Lowest possible latency
      // Chrome-specific optimizations
      googEchoCancellation: true,
      googAutoGainControl: true,
      googNoiseSuppression: true,
      googHighpassFilter: true,
      googTypingNoiseDetection: true,
    } as any
  })

  preInitializedStreamRef.current = stream
  console.timeEnd('🚀 Microphone pre-initialization')

  return stream
}, [])

// Ultra-aggressive pre-initialization strategies
useEffect(() => {
  if (!isSupported) return

  // Strategy 1: Immediate pre-init (50ms delay)
  const immediateTimer = setTimeout(() => {
    preInitializeMicrophone().catch(err => {
      console.log('🤖 Immediate pre-initialization failed:', err.message)
    })
  }, 50)

  // Strategy 2: User interaction fallback (100ms delay)
  const fallbackTimer = setTimeout(() => {
    const handleUserInteraction = () => {
      preInitializeMicrophone()
      // Remove listeners after first interaction
      ['click', 'touchstart', 'keydown', 'mouseover'].forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
    }

    ['click', 'touchstart', 'keydown', 'mouseover'].forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true })
    })
  }, 100)

  // Strategy 3: Audio context pre-warm (10ms delay)
  const audioContextTimer = setTimeout(() => {
    const audioContext = new AudioContext()
    audioContext.resume().then(() => {
      audioContext.close()
    })
  }, 10)

  return () => {
    clearTimeout(immediateTimer)
    clearTimeout(fallbackTimer)
    clearTimeout(audioContextTimer)
  }
}, [isSupported, preInitializeMicrophone])
```

##### 2. Smart Segmentation (Auto-restart)

```typescript
// Different segment durations based on STT model
const isGoogleSTT = selectedSTTModelRef.current === 'GoogleSTT'
const maxSegmentDuration = isGoogleSTT ? 5000 : 15000 // Google: 5s, Enagram: 15s

// Monitor audio level and trigger auto-segmentation
const monitorAudioLevel = useCallback(() => {
  const segmentDuration = Date.now() - segmentStartTimeRef.current

  // Execute auto-restart at duration threshold
  if (segmentDuration >= maxSegmentDuration && !pendingAutoRestartRef.current) {
    handleAutoSegmentation() // Seamless restart without UI indicators
    return
  }

  // Continue monitoring
  if (mediaRecorderRef.current?.state === 'recording' && !pendingAutoRestartRef.current) {
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
  }
}, [handleAutoSegmentation])

const handleAutoSegmentation = useCallback(async () => {
  if (!mediaRecorderRef.current ||
      mediaRecorderRef.current.state !== 'recording' ||
      pendingAutoRestartRef.current) {
    return
  }

  pendingAutoRestartRef.current = true

  // Stop current recording - onstop handler will process and restart
  mediaRecorderRef.current.stop()
}, [])
```

##### 3. Batch Processing with Fresh Service Instances

```typescript
// CRITICAL: Fresh service instance per batch to avoid Enagram's sequential DALE100 errors
const processChunksInParallel = async () => {
  const chunksToProcess = audioChunksForProcessingRef.current.slice()

  // Wait for 20-second batch (Enagram) or 5-second batch (Google)
  const isGoogleSTT = selectedSTTModelRef.current === 'GoogleSTT'
  const standardBatchSize = isGoogleSTT
    ? Math.ceil(5000 / chunkSize)   // 5 chunks = 5s
    : Math.ceil(20000 / chunkSize)  // 20 chunks = 20s

  // Safety check: Ensure blob size under API limits
  const maxSafeBlobSizeKB = isGoogleSTT ? 80 : 320 // Google: ~5s, Enagram: ~25s

  // Create fresh service + token for each batch
  const { GeorgianTTSService } = await import('../lib/speech/georgianTTSService')
  const freshService = new GeorgianTTSService()

  await freshService.logout()     // Clear any cached tokens
  await freshService.initialize() // Force fresh login

  const result = await freshService.recognizeSpeech(audioBlob, {
    language,
    autocorrect,
    punctuation,
    digits,
    engine: selectedSTTModelRef.current,
    enableSpeakerDiarization,
    speakers,
    maxRetries: 2
  })

  // Different delays based on STT model
  const batchDelay = isGoogleSTT ? 3000 : 30000 // Google: 3s, Enagram: 30s
  setTimeout(() => processChunksInParallel(), batchDelay)
}
```

### georgianTTSService API Client

**File**: `src/lib/speech/georgianTTSService.ts` (489 lines)

#### Service Architecture

```typescript
export class GeorgianTTSService {
  private static readonly EDGE_FUNCTION_URL =
    'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/georgian-tts-proxy'
  private static readonly GOOGLE_STT_URL =
    'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/google-stt-proxy'
  private static readonly SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

  constructor() {
    // Stateless - no token management (handled by Edge Functions)
  }

  // Core methods:
  // 1. recognizeSpeech() - Single service processing
  // 2. recognizeSpeechParallel() - Parallel dual-service processing
  // 3. processAudioFile() - File upload with chunking
}
```

#### STT Engine Routing

```typescript
async recognizeSpeech(
  audioBlob: Blob,
  options: {
    language?: string
    autocorrect?: boolean
    punctuation?: boolean
    digits?: boolean
    engine?: string  // 'STT1' | 'STT2' | 'STT3' | 'GoogleSTT'
    model?: string
    maxRetries?: number
    enableSpeakerDiarization?: boolean
    speakers?: number
  } = {}
): Promise<string | SpeakerDiarizationResult> {

  // Route to Google STT
  if (options.engine === 'GoogleSTT') {
    const googleRequest = {
      theAudioDataAsBase64: base64Audio,
      Language: options.language === 'ka-GE' ? 'ka-GE' : (options.language || 'ka-GE'),
      Autocorrect: options.autocorrect ?? true,
      Punctuation: options.punctuation ?? true,
      Digits: options.digits ?? true
    }

    const response = await fetch(GOOGLE_STT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleRequest)
    })

    return await response.text() // Plain text response
  }

  // Route to Enagram STT (STT1/STT2/STT3)
  const request: SpeechRecognitionRequest = {
    theAudioDataAsBase64: base64Audio,
    Language: options.language === 'ka-GE' ? 'ka' : (options.language || 'ka'),
    Autocorrect: options.autocorrect ?? true,
    Punctuation: options.punctuation ?? true,
    Digits: options.digits ?? true,
    // Only include Engine if NOT STT1
    ...(options.engine && options.engine !== 'STT1' && { Engine: options.engine }),
    enableSpeakerDiarization: options.enableSpeakerDiarization ?? false,
    Speakers: options.speakers || 2
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  // Check response content type
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    // Speaker diarization response
    return await response.json() as SpeakerDiarizationResult
  } else {
    // Regular transcription (plain text)
    return await response.text()
  }
}
```

#### Retry Logic

```typescript
async recognizeSpeech(audioBlob: Blob, options = {}): Promise<string | SpeakerDiarizationResult> {
  const maxRetries = options.maxRetries || 3
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const base64Audio = await this.convertAudioToBase64(audioBlob)
      const result = await this.performSpeechRecognition(base64Audio, options)

      if (attempt > 1) {
        console.log('✅ STT retry successful on attempt', attempt)
      }

      return result
    } catch (error) {
      lastError = error
      console.log(`❌ STT attempt ${attempt} failed:`, error.message)

      if (attempt === maxRetries) break

      const delay = 1000 * attempt // 1s, 2s, 3s
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
```

#### Parallel Speech Recognition (Primary Method)

**Method**: `recognizeSpeechParallel()` (lines 271-346)

This is the primary transcription method used by the application, processing audio through both services simultaneously.

```typescript
async recognizeSpeechParallel(
  audioBlob: Blob,
  options: {
    language?: string;
    autocorrect?: boolean;
    punctuation?: boolean;
    digits?: boolean;
    maxRetries?: number;
    enableSpeakerDiarization?: boolean;
    speakers?: number;
  } = {}
): Promise<{
  google: string;
  enagram: string | SpeakerDiarizationResult;
  primary: string;
  combined: string;
}>
```

**Usage in Application:**

```typescript
// In useGeorgianTTS hook - batch processing
const result = await freshService.recognizeSpeechParallel(batchBlob, {
  language,
  autocorrect,
  punctuation,
  digits,
  enableSpeakerDiarization: optionsRef.current.enableSpeakerDiarization,
  speakers: optionsRef.current.speakers,
  maxRetries: 2
});

// Handle results
if (result) {
  const googleText = result.google || '';
  const enagramText = typeof result.enagram === 'string'
    ? result.enagram
    : result.enagram?.text || '';

  // Update dual transcript refs
  updateCombinedTranscriptRefs(result);

  // Display best available
  const displayText = googleText.trim() || enagramText.trim() || '';
}
```

**Return Value Structure:**

```typescript
{
  google: "Google Chirp transcript text",
  enagram: "Enagram transcript text" | SpeakerDiarizationResult,
  primary: "Google Chirp transcript text", // Same as google
  combined: "Google text\n--- Alternative Transcription ---\nEnagram text"
}
```

**Error Handling:**
- Uses `Promise.allSettled()` for resilience
- One service failing doesn't block the other
- Both services must fail to throw error
- Individual failures logged with warnings

#### Accessing Parallel Transcripts in Hook

The `useGeorgianTTS` hook provides methods to access the parallel transcripts:

```typescript
// Get all transcript versions
const getDualTranscripts = useCallback(() => {
  return {
    google: googleTranscriptRef.current,
    enagram: enagramTranscriptRef.current,
    combined: combinedForSubmissionRef.current,
    primary: googleTranscriptRef.current // For UI display
  };
}, []);

// Get combined transcript for AI submission
const getCombinedTranscriptForSubmission = useCallback(() => {
  // Priority order: combined > google > enagram
  if (combinedForSubmissionRef.current.trim()) {
    return combinedForSubmissionRef.current;
  }
  if (googleTranscriptRef.current.trim()) {
    return googleTranscriptRef.current;
  }
  return enagramTranscriptRef.current;
}, []);
```

**Exposed Methods:**
```typescript
const {
  // ... other methods
  getDualTranscripts,
  getCombinedTranscriptForSubmission
} = useGeorgianTTS({ ... });
```

---

## Edge Functions Architecture

### georgian-tts-proxy (Enagram)

**File**: `supabase/functions/georgian-tts-proxy/index.ts` (419 lines)

#### Request/Response Flow

```typescript
interface SpeechRequest {
  theAudioDataAsBase64: string
  Language: string
  Autocorrect: boolean
  Punctuation: boolean
  Digits: boolean
  Engine?: string           // 'STT1' | 'STT2' | 'STT3'
  Model?: string
  Speakers?: number
  enableSpeakerDiarization?: boolean
}

interface SpeechResponse {
  Success: boolean
  ErrorCode: string
  Error: string
  Message: string
  Text: string
  WordsCount: number
  VoiceFilePath: string
}

interface SpeakerDiarizationResponse {
  Success: boolean
  ErrorCode: string
  Error: string
  Message: string
  lstSpeakers: SpeakerSegment[]
  VoiceFilePath: string
}

interface SpeakerSegment {
  Speaker: string
  Text: string
  CanBeMultiple: boolean
  StartSeconds: number
  EndSeconds: number
}
```

#### Error Handling

```typescript
serve(async (req) => {
  try {
    const body: SpeechRequest = await req.json()

    // Get valid token (cached or fresh)
    let accessToken: string
    try {
      accessToken = await getValidToken()
    } catch (error) {
      // Service down detection
      const isConnectionRefused = error.message.includes('Connection refused') ||
                                 error.message.includes('ECONNREFUSED') ||
                                 error.code === 'ECONNREFUSED'

      if (isConnectionRefused) {
        return new Response(
          JSON.stringify({
            error: 'Service temporarily unavailable',
            message: 'The Georgian TTS service (enagramm.com) is currently unavailable.',
            details: 'This is likely a temporary service outage.',
            suggestion: 'You can try again in a few minutes or contact support.'
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          error: 'Authentication failed',
          message: error.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ... STT processing logic

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

#### 401 Retry Logic

```typescript
// If authentication fails, clear cached token and retry once
if (enagrammResponse.status === 401) {
  console.log('🔄 Authentication failed, clearing cache and retrying...')
  cachedAccessToken = null
  tokenExpiryTime = null

  try {
    const newToken = await getValidToken()

    const retryResponse = await fetch(`${ENAGRAMM_API_BASE}/STT/RecognizeSpeech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${newToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(speechRequest)
    })

    if (retryResponse.ok) {
      const retryData: SpeechResponse = await retryResponse.json()
      return new Response(retryData.Text || '', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
      })
    }
  } catch (retryError) {
    console.error('🔄 Retry failed:', retryError)
  }
}
```

### google-stt-proxy (Google Chirp)

**File**: `supabase/functions/google-stt-proxy/index.ts` (355 lines)

#### Request/Response Flow

```typescript
interface SpeechRequest {
  theAudioDataAsBase64: string
  Language: string
  Autocorrect?: boolean
  Punctuation?: boolean
  Digits?: boolean
}

serve(async (req) => {
  try {
    const body: SpeechRequest = await req.json()

    const audioSizeKB = Math.round((body.theAudioDataAsBase64?.length || 0) / 1024)

    // V2 API has 1-minute limit for synchronous recognition
    const maxSafeAudioSizeKB = 480
    if (audioSizeKB > maxSafeAudioSizeKB) {
      return new Response(
        JSON.stringify({
          error: 'Audio too long',
          message: `Audio segment is ${audioSizeKB}KB. Google STT V2 requires audio under 1 minute (~${maxSafeAudioSizeKB}KB).`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get OAuth access token
    const accessToken = await getAccessToken()

    // Ensure recognizer exists
    await ensureRecognizer(accessToken)

    // Call Google Speech-to-Text V2 API
    const recognizerPath = `projects/${PROJECT_ID}/locations/${LOCATION}/recognizers/${RECOGNIZER_NAME}`
    const endpoint = `https://${LOCATION}-speech.googleapis.com/v2/${recognizerPath}:recognize`

    const requestBody = {
      config: {
        auto_decoding_config: {}, // Auto-detect audio format
        features: {
          enableAutomaticPunctuation: body.Punctuation !== false
        }
      },
      content: body.theAudioDataAsBase64
    }

    const googleResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const googleData = await googleResponse.json()

    // Extract transcript
    const transcript = googleData.results?.[0]?.alternatives?.[0]?.transcript || ''

    return new Response(transcript || '', {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
    })

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## Audio Processing Pipeline

### MediaRecorder Configuration

```typescript
// Supported MIME types (priority order)
const supportedTypes = [
  'audio/webm;codecs=opus',  // Best quality + compression
  'audio/webm',              // Fallback
  'audio/mp4',               // Safari support
  'audio/ogg;codecs=opus'    // Firefox support
]

let selectedType = 'audio/webm;codecs=opus'
for (const type of supportedTypes) {
  if (MediaRecorder.isTypeSupported(type)) {
    selectedType = type
    break
  }
}

const recorder = new MediaRecorder(stream, {
  mimeType: selectedType,
  audioBitsPerSecond: 128000  // High quality for speech
})

// Data collection every 1 second
recorder.start(1000)

recorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    audioChunksRef.current.push(event.data)
    audioChunksForProcessingRef.current.push(event.data)
  }
}
```

### Audio Monitoring (Web Audio API)

```typescript
const setupAudioMonitoring = useCallback(async (stream: MediaStream) => {
  try {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    const source = audioContextRef.current.createMediaStreamSource(stream)
    analyserRef.current = audioContextRef.current.createAnalyser()

    analyserRef.current.fftSize = 256
    const bufferLength = analyserRef.current.frequencyBinCount
    dataArrayRef.current = new Uint8Array(bufferLength)

    source.connect(analyserRef.current)

    monitorAudioLevel() // Start monitoring loop
  } catch (error) {
    console.error('Audio monitoring setup failed:', error)
  }
}, [monitorAudioLevel])

const monitorAudioLevel = useCallback(() => {
  if (!analyserRef.current || !dataArrayRef.current) return

  analyserRef.current.getByteFrequencyData(dataArrayRef.current)

  // Calculate average audio level
  let sum = 0
  for (let i = 0; i < dataArrayRef.current.length; i++) {
    sum += dataArrayRef.current[i]
  }
  const average = sum / dataArrayRef.current.length
  const normalizedLevel = Math.min(100, (average / 255) * 100)

  setRecordingState(prev => ({ ...prev, audioLevel: normalizedLevel }))

  // Continue monitoring if still recording
  if (mediaRecorderRef.current?.state === 'recording' && !pendingAutoRestartRef.current) {
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
  }
}, [])
```

### Base64 Encoding/Decoding

```typescript
// Frontend: Blob to Base64
private async convertAudioToBase64(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const result = reader.result as string
        // Extract base64 data (remove data:audio/webm;base64, prefix)
        const base64Data = result.split(',')[1]
        resolve(base64Data)
      } catch (error) {
        reject(new Error(`Failed to convert audio to base64: ${error.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read audio file'))
    reader.readAsDataURL(audioBlob)
  })
}

// Edge Function: Base64 to Blob (for FormData)
function base64ToBlob(base64Data: string, mimeType: string): Blob {
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}
```

---

## State Management & Real-time Updates

### Session Isolation

```typescript
// Unique session ID for cross-session isolation
const sessionIdRef = useRef<string | undefined>(sessionId)

// Update session ID ref when prop changes
useEffect(() => {
  if (sessionId !== sessionIdRef.current) {
    sessionIdRef.current = sessionId
  }
}, [sessionId])

// Include session ID in live updates
if (onLiveTranscriptUpdate) {
  const newText = combinedTranscriptRef.current.substring(previousLength)
  onLiveTranscriptUpdate(newText, combinedTranscriptRef.current, sessionIdRef.current)
}
```

### Live Transcript Callbacks

```typescript
interface UseGeorgianTTSOptions {
  onLiveTranscriptUpdate?: (
    newText: string,      // New text added in this update
    fullText: string,     // Complete transcript so far
    sessionId?: string    // Session ID for isolation
  ) => void
}

// Component usage
const { startRecording } = useGeorgianTTS({
  sessionId: currentSessionId,
  onLiveTranscriptUpdate: (newText, fullText, sessionId) => {
    // Update UI with new transcript
    if (sessionId === currentSessionId) {
      setTranscript(fullText)
    }
  }
})
```

### Transcript Accumulation

```typescript
// Combined transcript ref (survives re-renders)
const combinedTranscriptRef = useRef<string>('')

// Add new text to combined transcript
const previousLength = combinedTranscriptRef.current.length
const separator = combinedTranscriptRef.current.trim() ? ' ' : ''
combinedTranscriptRef.current += separator + newText.trim()

// Trigger live update callback
if (onLiveTranscriptUpdate) {
  const newText = combinedTranscriptRef.current.substring(previousLength)
  onLiveTranscriptUpdate(newText, combinedTranscriptRef.current, sessionIdRef.current)
}
```

### Reset Transcript

```typescript
const resetTranscript = useCallback(() => {
  // Reset transcript for new session
  combinedTranscriptRef.current = ''
  lastSavedTranscriptLengthRef.current = 0
  setTranscriptionResult(null)
}, [])
```

---

## Configuration Reference

### Environment Variables (.env)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://kvsqtolsjggpyvdtdpss.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API (for other features)
VITE_GEMINI_API_KEY=AIzaSyDlCR5uww0iocuoue69THcAe0egkWvhFvI
```

### Supabase Edge Function Secrets

**Not currently using secrets** - credentials are hardcoded in Edge Functions:

```typescript
// georgian-tts-proxy
const CREDENTIALS = {
  Email: 'Lasha.khosht@gmail.com',
  Password: 'Dba545c5fde36242@'
}

// google-stt-proxy
const SERVICE_ACCOUNT = {
  project_id: "wide-song-473914-b6",
  private_key: "-----BEGIN PRIVATE KEY-----...",
  client_email: "id-medimind-speech-v2@wide-song-473914-b6.iam.gserviceaccount.com"
}
```

**⚠️ SECURITY RECOMMENDATION**: Move to Supabase secrets:

```bash
# Set Enagram credentials
supabase secrets set ENAGRAMM_EMAIL=Lasha.khosht@gmail.com
supabase secrets set ENAGRAMM_PASSWORD=Dba545c5fde36242@

# Set Google service account
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

### Frontend Service URLs

```typescript
// georgianTTSService.ts
private static readonly EDGE_FUNCTION_URL =
  'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/georgian-tts-proxy'
private static readonly GOOGLE_STT_URL =
  'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/google-stt-proxy'
private static readonly SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## Performance Optimizations

### Key Performance Metrics

| Metric | Target | Achieved | Method |
|--------|--------|----------|--------|
| **Recording Start** | <200ms | ✅ <200ms | Microphone pre-initialization |
| **Segment Duration** | 15-20s | ✅ 15s (Enagram), 5s (Google) | Smart auto-segmentation |
| **Live Transcript** | <5s | ✅ 3-5s (Google) | 5-second batches with parallel processing |
| **Batch Processing** | <30s | ✅ 2-3s (Parallel) | Concurrent service execution |
| **Sequential Time** | 4-5s | ⚠️ Deprecated | Single service processing |
| **Parallel Time** | 2-3s | ✅ 2-3s | **~50% faster than sequential** |
| **Audio Level** | Real-time | ✅ 100ms | requestAnimationFrame loop |
| **Error Recovery** | N/A | ✅ Instant | Parallel fallback to working service |

### Optimization Strategies

#### 1. Microphone Pre-initialization

```typescript
// Three-tier pre-initialization strategy
useEffect(() => {
  // Tier 1: Immediate (50ms) - most aggressive
  setTimeout(() => preInitializeMicrophone(), 50)

  // Tier 2: User interaction (100ms) - fallback
  setTimeout(() => {
    ['click', 'touchstart', 'keydown', 'mouseover'].forEach(event => {
      document.addEventListener(event, () => preInitializeMicrophone(), { once: true })
    })
  }, 100)

  // Tier 3: Audio context pre-warm (10ms) - fastest possible
  setTimeout(() => {
    new AudioContext().resume().then(ctx => ctx.close())
  }, 10)
}, [])
```

#### 2. Fresh Service Instances

```typescript
// CRITICAL: Avoid Enagram's sequential request DALE100 errors
// Create fresh service + token for EACH batch
const { GeorgianTTSService } = await import('../lib/speech/georgianTTSService')
const freshService = new GeorgianTTSService()

await freshService.logout()     // Clear cached tokens
await freshService.initialize() // Force fresh login

// This makes every request a "first request" to Enagram
const result = await freshService.recognizeSpeech(audioBlob, options)
```

#### 3. Smart Batch Delays

```typescript
// Different delays based on STT model to optimize UX and avoid rate limits
const isGoogleSTT = selectedSTTModelRef.current === 'GoogleSTT'

// Batch processing delays
const batchDelay = isGoogleSTT ? 3000 : 30000 // Google: 3s, Enagram: 30s

// Retry delays
const retryDelay = isGoogleSTT ? 5000 : 30000 // Google: 5s, Enagram: 30s

// Segment durations
const maxSegmentDuration = isGoogleSTT ? 5000 : 15000 // Google: 5s, Enagram: 15s
```

#### 4. Seamless UI During Auto-segmentation

```typescript
// No visible processing indicators for auto-segments
if (wasAutoSegmentation && !wasManualStop) {
  // Background processing (non-blocking)
  (async () => {
    const result = await freshService.recognizeSpeech(currentBlob, options)

    if (result?.trim()) {
      combinedTranscriptRef.current += ' ' + result.trim()

      if (onLiveTranscriptUpdate) {
        onLiveTranscriptUpdate(result, combinedTranscriptRef.current, sessionIdRef.current)
      }
    }
  })()

  // Immediate restart (10ms delay for seamless continuation)
  setTimeout(() => {
    const newRecorder = new MediaRecorder(streamRef.current!, options)
    newRecorder.start(chunkSize)
    mediaRecorderRef.current = newRecorder

    // Resume audio monitoring immediately
    setTimeout(() => monitorAudioLevel(), 10)
  }, 10)
}
```

#### 5. Parallel Processing for Speed & Reliability

**Performance Advantage**: ~50% faster than sequential processing

```typescript
// Sequential processing (OLD - deprecated):
// Google: 1-2s + Enagram: 2-3s = 3-5s total

// Parallel processing (NEW - current):
// Google: 1-2s  } executed simultaneously
// Enagram: 2-3s } = 2-3s total (limited by slowest service)

// Implementation
const [googleResult, enagramResult] = await Promise.allSettled([
  performGoogleSTT(audio),  // Runs concurrently
  performEnagramSTT(audio)  // Runs concurrently
]);

// Extract results with error resilience
const googleText = googleResult.status === 'fulfilled' ? googleResult.value : '';
const enagramText = enagramResult.status === 'fulfilled' ? enagramResult.value : '';

// Use best available immediately
const displayText = googleText.trim() || enagramText.trim();
```

**Reliability Benefits:**
- ✅ One service failing doesn't block transcription
- ✅ Best available transcript shown immediately
- ✅ Redundancy for medical-critical applications
- ✅ Independent retry logic per service
- ✅ Cross-validation from two sources

**Resource Optimization:**
- Concurrent API calls utilize network bandwidth efficiently
- No waiting for sequential processing completion
- Fresh service instances prevent token conflicts
- Minimal overhead from `Promise.allSettled()`
- Both services process same audio blob (no duplication)

**Medical Use Case Benefits:**
- Critical transcriptions have dual verification
- Fast updates for real-time clinical documentation
- Better accuracy through cross-reference
- Resilience during network issues or service outages

---

## Error Handling & Recovery

### Error Categories

#### 1. Browser/Hardware Errors

| Error Type | Detection | Recovery |
|-----------|-----------|----------|
| **Permission Denied** | `NotAllowedError` | Show HTTPS/permissions guide |
| **No Microphone** | `NotFoundError` | Prompt to connect device |
| **Unsupported Browser** | `NotSupportedError` | Suggest Chrome/Firefox/Safari/Edge |
| **Policy Violation** | `message.includes('policy')` | Show HTTPS requirement |

```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
} catch (streamError: any) {
  let errorMessage = streamError.message

  if (streamError.name === 'NotAllowedError' || streamError.message.includes('Permission denied')) {
    errorMessage = 'Microphone access denied. Please enable microphone permissions in your browser settings and ensure you are using HTTPS or localhost.'
  } else if (streamError.name === 'NotFoundError') {
    errorMessage = 'No microphone found. Please connect a microphone and try again.'
  } else if (streamError.name === 'NotSupportedError') {
    errorMessage = 'Microphone access is not supported in this browser. Please try Chrome, Firefox, Safari, or Edge.'
  } else if (streamError.message.includes('policy violation')) {
    errorMessage = 'Microphone access blocked by browser security policy. Please use HTTPS or enable microphone permissions.'
  }

  throw new Error(`Failed to access microphone: ${errorMessage}`)
}
```

#### 2. Network/API Errors

| Error Code | Meaning | Recovery |
|-----------|---------|----------|
| **401** | Token expired | Auto-retry with fresh token |
| **403** | Invalid credentials | Show authentication error |
| **422** | Invalid request | Log details, retry |
| **500** | Server error | Retry with exponential backoff |
| **503** | Service down | Show user-friendly message |

```typescript
// 401 Auto-retry (Edge Function)
if (enagrammResponse.status === 401) {
  cachedAccessToken = null
  tokenExpiryTime = null

  const newToken = await getValidToken()

  const retryResponse = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${newToken}` },
    body: requestBody
  })

  if (retryResponse.ok) {
    return retryResponse
  }
}

// Service down detection
const isConnectionRefused = error.message.includes('Connection refused') ||
                           error.message.includes('ECONNREFUSED')

if (isConnectionRefused) {
  return {
    error: 'Service temporarily unavailable',
    message: 'The Georgian TTS service (enagramm.com) is currently unavailable.',
    suggestion: 'You can try again in a few minutes or contact support.'
  }
}
```

#### 3. Audio Processing Errors

| Error | Detection | Recovery |
|-------|-----------|----------|
| **Audio too long** | Blob size > limit | Trim to safe size |
| **Empty audio** | Blob size = 0 | Skip processing |
| **Invalid format** | MediaRecorder error | Try different MIME type |
| **Encoding failure** | Base64 conversion error | Retry with fresh blob |

```typescript
// Audio blob size safety check
const theoreticalDurationSeconds = segmentChunks.length * (chunkSize / 1000)
const actualBlobSizeKB = Math.round(audioBlob.size / 1024)

const isGoogleSTT = selectedSTTModelRef.current === 'GoogleSTT'
const maxSafeBlobSizeKB = isGoogleSTT ? 80 : 320 // Google: ~5s, Enagram: ~25s
const maxDurationSeconds = isGoogleSTT ? 5 : 24

const needsTrimming = actualBlobSizeKB > maxSafeBlobSizeKB ||
                     theoreticalDurationSeconds > maxDurationSeconds

if (needsTrimming) {
  // Calculate safe chunk count
  const avgChunkSizeKB = actualBlobSizeKB / segmentChunks.length
  const maxSafeChunks = Math.floor(maxSafeBlobSizeKB / avgChunkSizeKB)
  const safeChunkCount = Math.max(1, Math.min(maxSafeChunks, segmentChunks.length - 1))

  const safeSegmentChunks = segmentChunks.slice(0, safeChunkCount)
  finalAudioBlob = new Blob(safeSegmentChunks, { type: 'audio/webm;codecs=opus' })

  // Return unused chunks to queue
  const unusedChunks = segmentChunks.slice(safeChunkCount)
  audioChunksForProcessingRef.current = [...unusedChunks, ...chunksToProcess.slice(chunksToTake)]
}
```

#### 4. Retry Strategies

```typescript
// STT Service retry with exponential backoff
async recognizeSpeech(audioBlob: Blob, options = {}): Promise<string> {
  const maxRetries = options.maxRetries || 3
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await this.performSpeechRecognition(base64Audio, options)

      if (attempt > 1) {
        console.log('✅ STT retry successful on attempt', attempt)
      }

      return result
    } catch (error) {
      lastError = error

      if (attempt === maxRetries) break

      const delay = 1000 * attempt // 1s, 2s, 3s
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
```

---

## Quick Reference Tables

### API Endpoints Summary

| Service | Endpoint | Method | Auth | Purpose |
|---------|----------|--------|------|---------|
| **Enagram Login** | `https://enagramm.com/API/Account/Login` | POST | Email/Password | Get access token |
| **Enagram STT** | `https://enagramm.com/API/STT/RecognizeSpeech` | POST | Bearer token | Regular transcription |
| **Enagram Diarization** | `https://enagramm.com/API/STT/RecognizeSpeechFileSubmit` | POST | Bearer token | Speaker separation |
| **Google OAuth** | `https://oauth2.googleapis.com/token` | POST | JWT assertion | Get access token |
| **Google STT** | `https://us-central1-speech.googleapis.com/v2/.../recognize` | POST | Bearer token | Chirp transcription |
| **Edge: Enagram** | `https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/georgian-tts-proxy` | POST | Supabase anon key | Enagram proxy |
| **Edge: Google** | `https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/google-stt-proxy` | POST | Supabase anon key | Google proxy |

### Service Methods Summary

| Method | Purpose | Return Type | Processing Mode |
|--------|---------|-------------|-----------------|
| **recognizeSpeechParallel()** | Primary transcription method | `{ google, enagram, primary, combined }` | **Parallel** (both services) |
| **recognizeSpeech()** | Single service fallback | `string \| SpeakerDiarizationResult` | Sequential (one service) |
| **processAudioFile()** | File upload processing | `string \| SpeakerDiarizationResult` | Sequential with chunking |
| **getDualTranscripts()** | Access all transcript versions | `{ google, enagram, combined, primary }` | Read-only (hook method) |
| **getCombinedTranscriptForSubmission()** | Get AI-ready transcript | `string` | Read-only (hook method) |

### Configuration Variables

| Variable | Location | Value | Purpose |
|----------|----------|-------|---------|
| `VITE_SUPABASE_URL` | .env | `https://kvsqtolsjggpyvdtdpss.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | .env | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase anon key |
| `ENAGRAMM_EMAIL` | Edge Function (hardcoded) | `Lasha.khosht@gmail.com` | Enagram login |
| `ENAGRAMM_PASSWORD` | Edge Function (hardcoded) | `Dba545c5fde36242@` | Enagram login |
| `GOOGLE_PROJECT_ID` | Edge Function (hardcoded) | `wide-song-473914-b6` | Google Cloud project |
| `GOOGLE_SERVICE_ACCOUNT` | Edge Function (hardcoded) | `{...}` | Google auth credentials |

### Model Capabilities Comparison

| Feature | Fast (Enagram STT1) | GoogleChirp | **Parallel Mode** |
|---------|-------------------|-------------|-------------------|
| **Speed** | ⚡ Fast | ⚡⚡ Very Fast | ⚡⚡⚡ **Fastest (both concurrent)** |
| **Speaker Diarization** | ❌ No | ❌ No | ✅ **Yes (via Enagram)** |
| **Max Duration** | 25s | 60s | 25s (Enagram limit) |
| **Optimal Segment** | 15s | 5s | 5s (Google pace) |
| **Engine Parameter** | `'Fast'` | `'GoogleChirp'` | **N/A (automatic)** |
| **Endpoint** | `RecognizeSpeech` | Google v2 API | **Both simultaneously** |
| **Batch Delay** | 30s | 3s | **2-3s (parallel)** |
| **Retry Delay** | 30s | 5s | **Independent per service** |
| **Error Resilience** | ❌ Single point of failure | ❌ Single point of failure | ✅ **Graceful degradation** |
| **UI Display** | Primary | Primary | **Google primary, Enagram fallback** |
| **AI Submission** | Single transcript | Single transcript | **Combined dual transcript** |
| **Processing Mode** | Sequential | Sequential | **Parallel (~50% faster)** |

### Legacy Models (Deprecated for parallel mode)

| Feature | STT2 (Enagram) | STT3 (Enagram) |
|---------|---------------|---------------|
| **Speed** | 🐢 Slower | 🐢 Slower |
| **Speaker Diarization** | ✅ Yes | ✅ Yes |
| **Engine Parameter** | `'STT2'` | `'STT3'` |
| **Endpoint** | `RecognizeSpeechFileSubmit` | `RecognizeSpeechFileSubmit` |
| **Note** | ⚠️ Not used in parallel mode | ⚠️ Not used in parallel mode |

### Audio Format Specifications

| Format | Codec | Sample Rate | Channels | Bit Rate | Use Case |
|--------|-------|------------|----------|----------|----------|
| **audio/webm;codecs=opus** | Opus | 16kHz | 1 (mono) | 128kbps | Primary (best quality) |
| **audio/webm** | Default | 16kHz | 1 (mono) | 128kbps | Fallback |
| **audio/mp4** | AAC | 16kHz | 1 (mono) | 128kbps | Safari support |
| **audio/ogg;codecs=opus** | Opus | 16kHz | 1 (mono) | 128kbps | Firefox support |

---

## Integration Examples

### Example 1: Basic Parallel Processing in Component

**Scenario**: GeorgianSTTApp using parallel transcription for real-time recording

```typescript
// src/components/Georgian/GeorgianSTTApp.tsx
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';

const GeorgianSTTApp: React.FC = () => {
  // Initialize hook with parallel processing enabled (default)
  const {
    recordingState,
    startRecording,
    stopRecording,
    getCombinedTranscriptForSubmission,
    getDualTranscripts
  } = useGeorgianTTS({
    language: 'ka-GE',
    sessionId: currentSession?.id,
    onLiveTranscriptUpdate: handleLiveTranscriptUpdate
  });

  // Handle AI processing with combined transcript
  const handleProcessText = async (instruction: string) => {
    // CRITICAL: Use combined transcript for AI processing
    // Contains both Google and Enagram transcripts for cross-validation
    const combinedTranscript = getCombinedTranscriptForSubmission();

    if (!combinedTranscript.trim()) {
      console.error('No transcript available for AI processing');
      return;
    }

    // Submit to AI with dual transcripts
    const result = await processText(combinedTranscript, instruction);

    // Log transcript sources for debugging
    const dualTranscripts = getDualTranscripts();
    console.log('Transcript sources:', {
      google: dualTranscripts.google.length,
      enagram: dualTranscripts.enagram.length,
      combined: dualTranscripts.combined.length
    });
  };

  return (
    // Component JSX
  );
};
```

### Example 2: Form 100 Integration with Voice Transcript

**Scenario**: VoiceTranscriptField component exposing combined transcript for medical report generation

```typescript
// src/components/Form100/VoiceTranscriptField.tsx
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';

const VoiceTranscriptField: React.FC<VoiceTranscriptFieldProps> = ({
  value,
  onChange,
  sessionId,
  onCombinedTranscriptReady // Callback to pass combined transcript function
}) => {
  const {
    recordingState,
    startRecording,
    stopRecording,
    getCombinedTranscriptForSubmission
  } = useGeorgianTTS({
    sessionId,
    enableStreaming: true,
    chunkDuration: 23000,
    onLiveTranscriptUpdate: (newText, fullText, currentSessionId) => {
      // Preserve existing content and append new transcript
      const baseContent = transcriptAtRecordingStartRef.current;
      const separator = baseContent && fullText ? '\n\n' : '';
      const combinedContent = baseContent + separator + fullText.trim();

      onChange(combinedContent);
    }
  });

  // CRITICAL: Expose combined transcript function to parent component
  // This allows Form 100 generation to access both transcripts
  useEffect(() => {
    if (onCombinedTranscriptReady && getCombinedTranscriptForSubmission) {
      onCombinedTranscriptReady(getCombinedTranscriptForSubmission);
    }
  }, [onCombinedTranscriptReady, getCombinedTranscriptForSubmission]);

  return (
    // Voice recording UI
  );
};

// Parent component (Form 100 Modal)
const Form100Modal: React.FC = () => {
  const [getCombinedTranscriptFn, setGetCombinedTranscriptFn] =
    useState<(() => string) | null>(null);

  const handleGenerateReport = async () => {
    // Get combined transcript from voice field
    const combinedTranscript = getCombinedTranscriptFn?.() || '';

    // Send to Flowise with both transcripts
    const reportData = await generateForm100Report({
      transcript: combinedTranscript,
      patientInfo: formData
    });
  };

  return (
    <VoiceTranscriptField
      value={voiceTranscript}
      onChange={setVoiceTranscript}
      sessionId={sessionId}
      onCombinedTranscriptReady={setGetCombinedTranscriptFn}
    />
  );
};
```

### Example 3: Batch Processing with Parallel Services

**Scenario**: Processing recorded audio chunks with fresh service instances

```typescript
// src/hooks/useGeorgianTTS.ts (excerpt)
const processChunksInParallel = async () => {
  const chunksToProcess = audioChunksForProcessingRef.current.slice();

  // Calculate optimal batch size based on STT model
  const standardBatchSize = Math.ceil(20000 / chunkSize); // 20 chunks = 20s
  const segmentChunks = chunksToProcess.slice(0, standardBatchSize);
  const audioBlob = new Blob(segmentChunks, { type: 'audio/webm;codecs=opus' });

  // CRITICAL: Create fresh service instance for each batch
  // Prevents Enagram's sequential request DALE100 errors
  const { GeorgianTTSService } = await import('../lib/speech/georgianTTSService');
  const freshService = new GeorgianTTSService();

  await freshService.logout();     // Clear any cached tokens
  await freshService.initialize(); // Force fresh login

  // Process with parallel services
  const result = await freshService.recognizeSpeechParallel(audioBlob, {
    language,
    autocorrect,
    punctuation,
    digits,
    enableSpeakerDiarization: optionsRef.current.enableSpeakerDiarization,
    speakers: optionsRef.current.speakers,
    maxRetries: 2
  });

  // Handle parallel results
  if (result) {
    // Update dual transcript refs (Google + Enagram)
    updateCombinedTranscriptRefs(result);

    // Handle speaker diarization from Enagram if available
    if (typeof result.enagram === 'object' && result.enagram.hasSpeakers) {
      setSpeakerSegments(prev => [...prev, ...(result.enagram.speakers || [])]);
      setHasSpeakerResults(true);
    }

    // Display best available (Google primary, Enagram fallback)
    const displayText = result.google.trim() ||
                       (typeof result.enagram === 'string'
                         ? result.enagram.trim()
                         : result.enagram?.text?.trim() || '');

    // Trigger live update with display text
    if (onLiveTranscriptUpdate) {
      onLiveTranscriptUpdate(displayText, combinedTranscriptRef.current, sessionIdRef.current);
    }
  }
};
```

### Example 4: Error Handling with Graceful Degradation

**Scenario**: Handling service failures with parallel processing resilience

```typescript
// src/lib/speech/georgianTTSService.ts (excerpt)
async recognizeSpeechParallel(audioBlob: Blob, options = {}) {
  const base64Audio = await this.convertAudioToBase64(audioBlob);

  // Execute both services in parallel with error resilience
  const [googleResult, enagramResult] = await Promise.allSettled([
    this.performSpeechRecognition(base64Audio, { ...options, engine: 'GoogleChirp' }),
    this.performSpeechRecognition(base64Audio, { ...options, engine: 'Fast' })
  ]);

  // Extract results with comprehensive error handling
  const googleText = googleResult.status === 'fulfilled' ?
    (typeof googleResult.value === 'string' ? googleResult.value : '') : '';

  const enagramText = enagramResult.status === 'fulfilled' ?
    enagramResult.value : '';

  // Log individual service failures (non-blocking)
  if (googleResult.status === 'rejected') {
    console.warn('⚠️ Google TTS failed:', googleResult.reason?.message || googleResult.reason);
    // Application continues with Enagram result
  }
  if (enagramResult.status === 'rejected') {
    console.warn('⚠️ Enagram TTS failed:', enagramResult.reason?.message || enagramResult.reason);
    // Application continues with Google result
  }

  // Ensure at least one service succeeded
  const hasGoogleText = googleText.trim().length > 0;
  const hasEnagramText = typeof enagramText === 'string'
    ? enagramText.trim().length > 0
    : (enagramText?.text?.trim() || '').length > 0;

  if (!hasGoogleText && !hasEnagramText) {
    // Both services failed - this is the only error case
    throw new Error('Both Google and Enagram TTS services failed to produce results');
  }

  // Create combined transcript (filter out empty results)
  const combinedText = [
    googleText,
    typeof enagramText === 'string' ? enagramText : enagramText?.text || ''
  ]
    .filter(text => text.trim())
    .join('\n--- Alternative Transcription ---\n');

  return {
    google: googleText,
    enagram: enagramText,
    primary: googleText, // Google for UI display
    combined: combinedText
  };
}
```

### Example 5: Accessing Transcript Versions for Different Use Cases

**Scenario**: Using different transcript versions based on use case

```typescript
// Component code
const MyComponent: React.FC = () => {
  const { getDualTranscripts, getCombinedTranscriptForSubmission } = useGeorgianTTS({ ... });

  // Use Case 1: UI Display
  const handleDisplayTranscript = () => {
    const transcripts = getDualTranscripts();
    // Show Google transcript (faster, better quality)
    setDisplayText(transcripts.primary || transcripts.google);
  };

  // Use Case 2: AI Processing / Diagnosis Generation
  const handleAIProcessing = async () => {
    // Use combined transcript with both versions for best accuracy
    const combinedTranscript = getCombinedTranscriptForSubmission();

    // Format:
    // "Google Chirp full transcript
    //  --- Alternative Transcription ---
    //  Enagram full transcript"

    await generateDiagnosisReport(combinedTranscript, diagnosisInfo);
  };

  // Use Case 3: Quality Comparison
  const handleQualityCheck = () => {
    const transcripts = getDualTranscripts();

    console.log('Transcript comparison:', {
      google: {
        length: transcripts.google.length,
        preview: transcripts.google.substring(0, 50)
      },
      enagram: {
        length: transcripts.enagram.length,
        preview: transcripts.enagram.substring(0, 50)
      },
      match: transcripts.google.trim() === transcripts.enagram.trim()
    });
  };

  // Use Case 4: Export / Backup
  const handleExport = () => {
    const transcripts = getDualTranscripts();

    const exportData = {
      timestamp: new Date().toISOString(),
      googleTranscript: transcripts.google,
      enagramTranscript: transcripts.enagram,
      combinedForAI: transcripts.combined,
      metadata: {
        sessionId,
        duration,
        model: 'parallel-stt'
      }
    };

    downloadJSON(exportData, 'transcript-export.json');
  };
};
```

### Example 6: Custom Parallel Processing Configuration

**Scenario**: Fine-tuning parallel processing for specific medical workflows

```typescript
// Custom configuration for different medical scenarios
const GeorgianTTSForEmergency: React.FC = () => {
  // Emergency scenario: Prioritize speed (Google Chirp)
  const {
    recordingState,
    startRecording,
    getCombinedTranscriptForSubmission
  } = useGeorgianTTS({
    language: 'ka-GE',
    chunkDuration: 5000, // Very fast 5-second segments (Google pace)
    onLiveTranscriptUpdate: (newText, fullText) => {
      // Immediate display for emergency documentation
      setEmergencyTranscript(fullText);
    }
  });

  return (
    // Emergency transcription UI
  );
};

const GeorgianTTSForConsultation: React.FC = () => {
  // Consultation scenario: Enable speaker diarization for multi-party discussion
  const {
    recordingState,
    speakerSegments,
    hasSpeakerResults
  } = useGeorgianTTS({
    language: 'ka-GE',
    enableSpeakerDiarization: true,
    speakers: 3, // Doctor + Patient + Family member
    chunkDuration: 15000, // Standard 15-second segments
    onLiveTranscriptUpdate: handleTranscriptUpdate
  });

  // Display speaker-separated transcript
  return (
    <div>
      {hasSpeakerResults && speakerSegments.map((segment, idx) => (
        <div key={idx}>
          <strong>{segment.Speaker}:</strong> {segment.Text}
        </div>
      ))}
    </div>
  );
};
```

---

## Recommendations for Future Changes

### 1. Security Improvements

**Move credentials to Supabase secrets**:

```bash
# Set Enagram credentials
supabase secrets set ENAGRAMM_EMAIL=Lasha.khosht@gmail.com
supabase secrets set ENAGRAMM_PASSWORD=Dba545c5fde36242@

# Set Google service account (as JSON string)
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"wide-song-473914-b6",...}'

# Update Edge Functions to use secrets
const email = Deno.env.get('ENAGRAMM_EMAIL')
const password = Deno.env.get('ENAGRAMM_PASSWORD')
const serviceAccount = JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON'))
```

### 2. Performance Enhancements

**Implement WebSocket for real-time streaming**:

```typescript
// Replace batch processing with WebSocket streaming
const ws = new WebSocket('wss://streaming-stt-api.com')

ws.onopen = () => {
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      ws.send(event.data) // Stream audio chunks
    }
  }
}

ws.onmessage = (event) => {
  const partialResult = JSON.parse(event.data)
  onLiveTranscriptUpdate(partialResult.text, fullText, sessionId)
}
```

### 3. Feature Additions

**Add model auto-switching based on audio characteristics**:

```typescript
// Detect silence patterns for speaker diarization suggestion
const detectMultipleSpeakers = (audioLevel: number[]): boolean => {
  const silenceThreshold = 10
  const silencePeriods = audioLevel.filter(level => level < silenceThreshold)
  return silencePeriods.length > 5 // Multiple silence periods = likely multiple speakers
}

if (detectMultipleSpeakers(audioLevelHistory)) {
  // Suggest STT2/STT3 for speaker diarization
  showModelSuggestion('STT2')
}
```

### 4. Error Recovery

**Implement circuit breaker pattern**:

```typescript
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > 60000) { // 1 minute
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.failures = 0
      this.state = 'CLOSED'
      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()

      if (this.failures >= 3) {
        this.state = 'OPEN'
      }

      throw error
    }
  }
}

// Usage
const sttCircuitBreaker = new CircuitBreaker()

await sttCircuitBreaker.execute(() =>
  georgianTTSService.recognizeSpeech(audioBlob, options)
)
```

---

## Conclusion

This document provides comprehensive coverage of the MediMind Expert **Parallel Speech-to-Text system architecture**. Use this as your **single source of truth** for:

- Understanding how parallel STT processing works
- Configuring API credentials and endpoints
- Debugging transcription issues
- Implementing new features or optimizations
- Integrating parallel transcripts in components
- Making configuration changes

**Key Takeaways**:

1. **Parallel STT System**: Enagram (Georgian specialist) + Google Chirp (advanced Georgian) process **simultaneously**
2. **Performance**: <200ms recording start + **~50% faster** parallel processing (2-3s vs 4-5s sequential)
3. **Dual Transcript Management**: Separate Google, Enagram, and combined transcripts for different use cases
4. **Smart Segmentation**: 5s (Google) or 15s (Enagram) auto-restart with parallel processing
5. **Error Resilience**: One service failing doesn't block transcription - graceful degradation
6. **Fresh Service Instances**: Prevents Enagram's sequential request errors (DALE100)
7. **Session Isolation**: Unique session IDs prevent transcript contamination across recordings
8. **Combined Format for AI**: Both transcripts sent to AI for cross-validation and better accuracy

**Critical Integration Points**:

- **UI Display**: Use `getDualTranscripts().primary` (Google transcript)
- **AI Processing**: Use `getCombinedTranscriptForSubmission()` (both transcripts)
- **Form 100**: Pass combined transcript function via `onCombinedTranscriptReady` callback
- **Batch Processing**: Always use `recognizeSpeechParallel()` for optimal performance
- **Error Handling**: `Promise.allSettled()` ensures resilience

**For any STT-related changes, always refer to this document first!**

---

*Document maintained by: MediMind Expert Development Team*
*Last reviewed: 2025-10-14*
*Architecture: Parallel Speech-to-Text System v2.0*
