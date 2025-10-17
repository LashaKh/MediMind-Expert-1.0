# Georgian Medical Transcription System - Complete Architecture Reference

**Last Updated:** 2025-10-15
**System:** MediScribe - Georgian Medical Transcription with AI Integration
**Performance Target:** <200ms recording start, 15-second auto-segmentation, dual STT processing

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [State Management Flow](#state-management-flow)
4. [Critical Edge Cases & Solutions](#critical-edge-cases--solutions)
5. [Recording Workflows](#recording-workflows)
6. [Session Management](#session-management)
7. [Database Synchronization](#database-synchronization)
8. [Performance Optimizations](#performance-optimizations)
9. [Transcript Reference System](#transcript-reference-system)
10. [Testing & Debugging](#testing--debugging)

---

## System Overview

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    GeorgianSTTApp.tsx                        │
│         (Main Orchestration & Session Management)            │
│  - Session CRUD operations                                   │
│  - Title management with validation                          │
│  - Local transcript state (single source of truth)           │
│  - Live transcript updates with session-aware callbacks      │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│TranscriptPanel│ │useGeorgianTTS│ │SessionHistory│
│  (UI Display) │ │ (TTS Engine) │ │(Session List)│
└──────┬────────┘ └──────┬───────┘ └──────────────┘
       │                 │
       │                 │
       ▼                 ▼
┌──────────────┐ ┌──────────────────────────┐
│ Text Editing │ │ GeorgianTTSService       │
│ & File       │ │ (Edge Function Proxy)    │
│ Attachments  │ │ - Google STT integration │
└──────────────┘ │ - Enagram STT integration│
                 │ - Parallel processing    │
                 └────────────┬──────────────┘
                              │
                              ▼
                  ┌──────────────────────────┐
                  │   Supabase Database      │
                  │   georgian_sessions      │
                  │   - id, user_id, title   │
                  │   - transcript           │
                  │   - duration_ms          │
                  │   - processing_results   │
                  │   - created_at, updated  │
                  └──────────────────────────┘
```

### Key Components

1. **GeorgianSTTApp** - Main application orchestrator
2. **useGeorgianTTS** - Speech-to-text engine with performance optimizations
3. **useSessionManagement** - Database operations for session persistence
4. **GeorgianTTSService** - Edge Function integration for STT APIs
5. **TranscriptPanel** - UI for transcript display and editing
6. **SessionHistory** - Session list with search/filter capabilities

---

## Component Architecture

### 1. GeorgianSTTApp.tsx

**Primary Responsibilities:**
- Session lifecycle management (create, select, delete, duplicate)
- Session title validation (required before recording)
- Local transcript state management (single source of truth)
- Recording session tracking with unique IDs
- Live transcript updates with session isolation
- Coordination between recording, editing, and AI processing

**Key State Variables:**

```typescript
// Single source of truth for UI display
const [localTranscript, setLocalTranscript] = useState('');
const localTranscriptRef = useRef<string>(''); // Prevents stale closures

// Recording session tracking
const [currentRecordingSessionId, setCurrentRecordingSessionId] = useState<string>('');

// Session title with validation
const [pendingSessionTitle, setPendingSessionTitle] = useState('');
const [showTitleModal, setShowTitleModal] = useState(false);

// Duplicate detection
const lastProcessedContentRef = useRef<string>('');
const lastProcessedTimeRef = useRef<number>(0);
```

**Critical Methods:**

1. **handleLiveTranscriptUpdate** - Core transcript update logic
```typescript
const handleLiveTranscriptUpdate = useCallback(async (
  newText: string,
  fullText: string,
  sessionId?: string
) => {
  // Duplicate detection (within 1 second window)
  if (lastProcessedContentRef.current === newText.trim() &&
      (now - lastProcessedTimeRef.current) < 1000) {
    return; // Skip duplicate
  }

  // Optimistic UI update (immediate feedback)
  setLocalTranscript(prev => {
    const separator = prev ? ' ' : '';
    const updatedTranscript = prev + separator + newText.trim();
    localTranscriptRef.current = updatedTranscript; // Sync ref
    return updatedTranscript;
  });

  // Background database save
  const targetSessionId = sessionId || currentSession?.id;
  if (targetSessionId) {
    appendToTranscript(targetSessionId, newText.trim(), localTranscriptRef.current);
  }
}, [appendToTranscript, currentSession]);
```

2. **handleStartRecording** - Recording initialization with validation
```typescript
const handleStartRecording = useCallback(async () => {
  // VALIDATION: Title required for new sessions
  if (!currentSession && !pendingSessionTitle.trim()) {
    setShowTitleError(true);
    titleInputRef.current?.focus();
    return;
  }

  // Generate unique recording session ID
  const newRecordingSessionId = `rec_${Date.now()}_${Math.random().toString(36)}`;
  setCurrentRecordingSessionId(newRecordingSessionId);

  if (!currentSession) {
    // Create new session with typed content preserved
    const initialContent = localTranscript.trim() || undefined;
    const newSession = await createSession(
      pendingSessionTitle.trim() || 'New Recording',
      initialContent
    );

    if (newSession) {
      await selectSession(newSession.id);
    }
  } else {
    // Existing session: Initialize TTS with current content
    if (localTranscript.trim()) {
      initializeWithExistingTranscript(localTranscript);
    }
  }

  startRecording(false); // false = preserve existing transcript refs
}, [currentSession, pendingSessionTitle, localTranscript]);
```

3. **handleSelectSession** - Session switching with cleanup
```typescript
const handleSelectSession = useCallback(async (sessionId: string) => {
  // Stop any ongoing recording
  if (recordingState.isRecording) {
    stopRecording();
  }

  // Clear TTS state
  resetTranscript();
  clearTTSResult();

  // Load session transcript immediately (optimistic UI)
  const sessionTranscript = selectedSession.transcript || '';
  setLocalTranscript(sessionTranscript);
  localTranscriptRef.current = sessionTranscript;

  // Initialize TTS hook for AI processing
  if (sessionTranscript.trim()) {
    initializeWithExistingTranscript(sessionTranscript);
  }

  // Switch to new session (refreshes from database)
  await selectSession(sessionId);
}, [sessions, resetTranscript, selectSession]);
```

---

### 2. useGeorgianTTS.ts

**Primary Responsibilities:**
- Audio recording with MediaRecorder API
- Microphone pre-initialization for <200ms start time
- 15-second automatic segmentation for continuous recording
- Dual parallel STT processing (Google + Enagram)
- Three-transcript reference system
- Smart auto-restart logic

**Key State & Refs:**

```typescript
// Recording state
const [recordingState, setRecordingState] = useState<RecordingState>({
  isRecording: false,
  isPaused: false,
  duration: 0,
  audioLevel: 0,
  isProcessingChunks: false,
  processedChunks: 0,
  totalChunks: 0
});

// Three-transcript refs for parallel processing
const googleTranscriptRef = useRef<string>('');      // Google STT results
const enagramTranscriptRef = useRef<string>('');     // Enagram STT results
const combinedForSubmissionRef = useRef<string>(''); // Combined for AI

// Smart segmentation refs
const segmentStartTimeRef = useRef<number>(0);
const pendingAutoRestartRef = useRef<boolean>(false);
const manualStopRef = useRef<boolean>(false);

// Pre-initialization refs
const preInitializedStreamRef = useRef<MediaStream | null>(null);
const isPreInitializingRef = useRef<boolean>(false);
```

**Performance Optimizations:**

1. **Microphone Pre-initialization** (<200ms target)
```typescript
const preInitializeMicrophone = useCallback(async (): Promise<MediaStream> => {
  // Return cached stream immediately (0ms)
  if (preInitializedStreamRef.current?.active) {
    return preInitializedStreamRef.current;
  }

  // Request microphone access
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 16000,     // Lower for faster processing
      channelCount: 1,       // Mono for performance
      latency: 0,            // Lowest possible latency
    }
  });

  preInitializedStreamRef.current = stream;
  return stream;
}, []);

// Aggressive pre-initialization on component mount
useEffect(() => {
  // Strategy 1: Immediate pre-init
  setTimeout(() => preInitializeMicrophone(), 50);

  // Strategy 2: On user interaction
  ['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, () => preInitializeMicrophone(), { once: true });
  });
}, []);
```

2. **15-Second Auto-Segmentation** (Continuous recording)
```typescript
const handleAutoSegmentation = useCallback(async () => {
  if (!mediaRecorderRef.current || pendingAutoRestartRef.current) {
    return;
  }

  // Set flag to prevent duplicate calls
  pendingAutoRestartRef.current = true;

  // Request final buffered data before stopping
  if (mediaRecorderRef.current.state === 'recording') {
    mediaRecorderRef.current.requestData();
  }

  // Stop current segment (triggers onstop handler)
  setTimeout(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  }, 50);
}, []);

// Called from audio level monitoring loop
const monitorAudioLevel = useCallback(() => {
  const segmentDuration = Date.now() - segmentStartTimeRef.current;

  // Execute 15-second restart
  if (segmentDuration >= 15000 && !pendingAutoRestartRef.current) {
    handleAutoSegmentation();
    return;
  }

  // Continue monitoring
  animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
}, [handleAutoSegmentation]);
```

3. **Recording Stop Handler** (Auto vs Manual)
```typescript
const createRecordingStopHandler = useCallback(() => {
  return async () => {
    const wasAutoSegmentation = pendingAutoRestartRef.current;
    const wasManualStop = manualStopRef.current;

    // Process current audio segment
    if (audioChunksRef.current.length > 0) {
      const currentBlob = new Blob(audioChunksRef.current, {
        type: 'audio/webm;codecs=opus'
      });

      if (wasAutoSegmentation && !wasManualStop) {
        // Background processing for instant restart
        processSegmentInBackground(currentBlob);
      } else {
        // Manual stop: wait for processing
        await processSegmentSynchronously(currentBlob);
      }
    }

    // Handle auto-restart for continuous recording
    if (wasAutoSegmentation && !wasManualStop) {
      setTimeout(async () => {
        // Reset for new segment
        segmentStartTimeRef.current = Date.now();
        audioChunksRef.current = [];
        processedSegmentsRef.current = 0;
        pendingAutoRestartRef.current = false;

        // Create new MediaRecorder for continued recording
        const newRecorder = new MediaRecorder(streamRef.current!, {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 128000
        });

        newRecorder.onstop = createRecordingStopHandler(); // Recursive!
        newRecorder.start(chunkSize);
        mediaRecorderRef.current = newRecorder;

        // Resume monitoring
        monitorAudioLevel();
      }, 10); // Ultra-minimal delay
    } else {
      // Manual stop: cleanup
      setRecordingState(prev => ({ ...prev, isRecording: false }));
      cleanupAudioResources();
    }
  };
}, []);
```

4. **Parallel STT Processing** (Google + Enagram simultaneously)
```typescript
const recognizeSpeechParallel = async (audioBlob: Blob) => {
  const base64Audio = await convertAudioToBase64(audioBlob);

  // Execute both services in parallel
  const [googleResult, enagramResult] = await Promise.allSettled([
    performSpeechRecognition(base64Audio, { engine: 'GoogleChirp' }),
    performSpeechRecognition(base64Audio, { engine: 'Fast' })
  ]);

  // Extract results
  const googleText = googleResult.status === 'fulfilled' ? googleResult.value : '';
  const enagramText = enagramResult.status === 'fulfilled' ? enagramResult.value : '';

  // Update refs (accumulative)
  googleTranscriptRef.current += ' ' + googleText.trim();
  enagramTranscriptRef.current += ' ' + enagramText.trim();

  // Build combined transcript
  combinedForSubmissionRef.current =
    `${googleTranscriptRef.current}\n--- Alternative Transcription ---\n${enagramTranscriptRef.current}`;

  return {
    google: googleText,
    enagram: enagramText,
    primary: googleText,
    combined: combinedForSubmissionRef.current
  };
};
```

---

### 3. GeorgianTTSService.ts

**Primary Responsibilities:**
- Proxy requests to Supabase Edge Functions
- Route to Google STT or Enagram based on engine selection
- Handle authentication with Supabase anon key
- Retry logic with exponential backoff

**Key Methods:**

```typescript
class GeorgianTTSService {
  private static readonly EDGE_FUNCTION_URL =
    'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/georgian-tts-proxy';
  private static readonly GOOGLE_STT_URL =
    'https://kvsqtolsjggpyvdtdpss.supabase.co/functions/v1/google-stt-proxy';

  async recognizeSpeech(audioBlob: Blob, options: {
    language?: string;
    autocorrect?: boolean;
    punctuation?: boolean;
    digits?: boolean;
    engine?: string;
    maxRetries?: number;
  }): Promise<string> {
    // Route to Google or Enagram based on engine
    if (options.engine === 'GoogleChirp') {
      return this.callGoogleSTT(audioBlob, options);
    } else {
      return this.callEnagramSTT(audioBlob, options);
    }
  }

  async recognizeSpeechParallel(audioBlob: Blob, options): Promise<{
    google: string;
    enagram: string;
    primary: string;
    combined: string;
  }> {
    const [googleResult, enagramResult] = await Promise.allSettled([
      this.recognizeSpeech(audioBlob, { ...options, engine: 'GoogleChirp' }),
      this.recognizeSpeech(audioBlob, { ...options, engine: 'Fast' })
    ]);

    const googleText = googleResult.status === 'fulfilled' ? googleResult.value : '';
    const enagramText = enagramResult.status === 'fulfilled' ? enagramResult.value : '';

    return {
      google: googleText,
      enagram: enagramText,
      primary: googleText,
      combined: [googleText, enagramText]
        .filter(t => t.trim())
        .join('\n--- Alternative Transcription ---\n')
    };
  }
}
```

---

### 4. TranscriptPanel.tsx

**Primary Responsibilities:**
- Display transcript content
- Handle user editing with typing detection
- File attachment with OCR text extraction
- Tab switching (Transcript vs AI)
- Keyboard-aware layout for mobile

**Key State & Logic:**

```typescript
// Editable transcript with user typing detection
const [editableTranscript, setEditableTranscript] = useState('');
const isUserTypingRef = useRef(false);
const typingTimeoutRef = useRef<NodeJS.Timeout>();

// Smart transcript resolution
const currentTranscript = recordingState.isRecording
  ? (localTranscript || editableTranscript)  // During recording: use live transcript
  : (editableTranscript || localTranscript); // After recording: use editable

// Track session changes
const previousSessionIdRef = useRef<string>('');

// Load session transcript when session changes
useEffect(() => {
  const currentSessionId = currentSession?.id || '';
  const isSessionChange = currentSessionId !== previousSessionIdRef.current;

  // Clear typing timeout on session change
  if (isSessionChange && typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
    isUserTypingRef.current = false;
  }

  // Don't update if user is typing (prevents interference)
  if (!isSessionChange && isUserTypingRef.current) {
    return;
  }

  // Smart transcript selection logic
  let transcript = '';

  if (isSessionChange) {
    // Session changed: load new session transcript
    transcript = currentSession?.transcript || '';
  } else {
    // Same session: preserve user edits
    const userHasEdits = editableTranscript !== currentSession?.transcript;

    if (userHasEdits) {
      transcript = editableTranscript; // Preserve edits
    } else if (localTranscript && recordingState.isRecording) {
      transcript = localTranscript; // Use live transcript
    } else {
      transcript = currentSession?.transcript || ''; // Fallback
    }
  }

  setEditableTranscript(transcript);
  previousSessionIdRef.current = currentSessionId;
}, [currentSession?.id, localTranscript, recordingState.isRecording]);

// Handle transcript changes with debounced save
const handleTranscriptChange = (newTranscript: string) => {
  isUserTypingRef.current = true;

  // Clear existing timeout
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  // Immediate UI update
  setEditableTranscript(newTranscript);

  // Debounced database save (1 second)
  typingTimeoutRef.current = setTimeout(() => {
    isUserTypingRef.current = false;
    onUpdateTranscript(newTranscript);
  }, 1000);
};
```

---

## State Management Flow

### 1. Recording Flow (New Text)

```
User clicks Record
  ↓
GeorgianSTTApp.handleStartRecording()
  - Validate title (required for new sessions)
  - Generate recording session ID
  - Create/select session
  - Initialize TTS with existing content
  ↓
useGeorgianTTS.startRecording()
  - Use pre-initialized microphone stream (0-50ms)
  - Create MediaRecorder
  - Start 15-second segmentation timer
  ↓
Audio captured → onstop every 15 seconds
  ↓
Parallel STT Processing (Google + Enagram)
  ↓
Results combined → handleLiveTranscriptUpdate
  ↓
GeorgianSTTApp.handleLiveTranscriptUpdate(newText, fullText, sessionId)
  - Duplicate detection check
  - Update localTranscript (optimistic UI)
  - Sync localTranscriptRef
  - Background database save via appendToTranscript
  ↓
useSessionManagement.appendToTranscript(sessionId, newText, currentTranscript)
  - Fetch fresh database state (race condition prevention)
  - Append new text with smart separator
  - Update database session
  - Update local sessions array
  ↓
TranscriptPanel sees localTranscript update
  - Display in UI (via currentTranscript computed value)
```

### 2. User Editing Flow

```
User types in TranscriptPanel textarea
  ↓
TranscriptPanel.handleTranscriptChange(newTranscript)
  - Set isUserTypingRef = true
  - Clear existing timeout
  - Update editableTranscript immediately (UI)
  - Start 1-second debounce timer
  ↓
After 1 second of no typing
  ↓
onUpdateTranscript(newTranscript)
  ↓
useSessionManagement.updateTranscript(sessionId, transcript)
  - Update database session
  - Update sessions array
  - Update currentSession
  ↓
GeorgianSTTApp sees currentSession update
  - Does NOT update localTranscript (user is editing)
  ↓
TranscriptPanel useEffect sees update
  - Checks isUserTypingRef (true during typing)
  - Skips update to prevent interference
  - Preserves editableTranscript
```

### 3. Session Switching Flow

```
User clicks different session in SessionHistory
  ↓
SessionHistory calls onSelectSession(sessionId)
  ↓
GeorgianSTTApp.handleSelectSession(sessionId)
  - Stop any ongoing recording
  - Clear TTS state (resetTranscript, clearTTSResult)
  - Load session transcript to localTranscript
  - Sync localTranscriptRef
  - Initialize TTS hook with session transcript (for AI)
  ↓
useSessionManagement.selectSession(sessionId)
  - Set from local sessions (immediate)
  - Fetch fresh from database (accurate)
  - Update sessions array
  - Update currentSession
  ↓
TranscriptPanel useEffect detects session change
  - previousSessionIdRef !== currentSessionId
  - Clear typing timeout and flag
  - Load new session transcript to editableTranscript
  - Display in UI
```

---

## Critical Edge Cases & Solutions

### Edge Case 1: Recording with Existing Typed Text

**Scenario:** User types text in textarea, then clicks Record button.

**Challenge:** Need to preserve typed text AND append new dictated text.

**Solution:**
```typescript
// In GeorgianSTTApp.handleStartRecording()
if (!currentSession) {
  // Create session WITH existing typed content
  const initialContent = localTranscript.trim() || undefined;
  const newSession = await createSession(
    pendingSessionTitle.trim(),
    initialContent  // Passed to database immediately
  );

  await selectSession(newSession.id);
} else {
  // Save typed text to database before recording
  if (localTranscript.trim() && localTranscript !== currentSession.transcript) {
    await updateTranscript(currentSession.id, localTranscript);
  }

  // Initialize TTS hook with existing content
  if (localTranscript.trim()) {
    initializeWithExistingTranscript(localTranscript);
  }
}

startRecording(false); // false = preserve transcript refs
```

**Result:** Typed text + dictated text combined seamlessly in database.

---

### Edge Case 2: Pause/Resume Recording

**Scenario:** User clicks Pause during recording, then Resume.

**Challenge:** Resume from exact point without losing any content.

**Solution:**
```typescript
// Pause: MediaRecorder pauses, transcript stays in memory
const pauseRecording = useCallback(() => {
  if (mediaRecorderRef.current && recordingState.isRecording) {
    mediaRecorderRef.current.pause();
    setRecordingState(prev => ({ ...prev, isPaused: true }));
    stopDurationTracking();
  }
}, [recordingState.isRecording]);

// Resume: MediaRecorder resumes, continues from existing refs
const resumeRecording = useCallback(() => {
  if (mediaRecorderRef.current && recordingState.isPaused) {
    mediaRecorderRef.current.resume();
    setRecordingState(prev => ({ ...prev, isPaused: false }));
    startDurationTracking();
    monitorAudioLevel();
  }
}, [recordingState.isPaused]);
```

**Key Points:**
- `audioChunksRef` accumulates all chunks (paused + resumed)
- `googleTranscriptRef`, `enagramTranscriptRef` persist across pause/resume
- No special handling needed - continuous accumulation works

---

### Edge Case 3: Switching Sessions While Recording

**Scenario:** User is recording, then clicks a different session.

**Challenge:** Stop current recording safely, save progress, switch session.

**Solution:**
```typescript
const handleSelectSession = useCallback(async (sessionId: string) => {
  // CRITICAL: Stop recording first
  if (recordingState.isRecording) {
    stopRecording(); // Processes final segment, saves to database
  }

  // Clear TTS state (cancels background processing)
  resetTranscript();
  clearTTSResult();

  // Clear recording session tracking
  setCurrentRecordingSessionId('');

  // Load new session transcript immediately
  const sessionTranscript = selectedSession.transcript || '';
  setLocalTranscript(sessionTranscript);
  localTranscriptRef.current = sessionTranscript;

  // Initialize TTS for AI processing
  if (sessionTranscript.trim()) {
    initializeWithExistingTranscript(sessionTranscript);
  }

  // Switch to new session
  await selectSession(sessionId);
}, [sessions, recordingState.isRecording, stopRecording]);
```

**Result:** Current recording saved to original session, new session loaded cleanly.

---

### Edge Case 4: Editing Text Between Recording Sessions

**Scenario:** User records, stops, edits transcript, then starts new recording.

**Challenge:** Preserve manual edits while appending new dictated text.

**Solution:**

In **TranscriptPanel**:
```typescript
// Detect user edits vs system updates
useEffect(() => {
  const isSessionChange = currentSessionId !== previousSessionIdRef.current;

  // Give 5 seconds after recording stops for database sync
  const timeSinceRecordingStop = Date.now() - recordingStopTimeRef.current;
  const justFinishedRecording = timeSinceRecordingStop < 5000;

  const userHasEdits = editableTranscript !== sessionTranscript &&
                      !justFinishedRecording;

  if (userHasEdits) {
    // Preserve user edits - don't overwrite!
    transcript = editableTranscript;
  } else if (justFinishedRecording && localLength > 0) {
    // Recording just stopped - use localTranscript
    transcript = localTranscript;
  } else {
    // Normal flow - use session transcript
    transcript = sessionTranscript;
  }

  setEditableTranscript(transcript);
}, [currentSession?.id, localTranscript, editableTranscript]);
```

In **GeorgianSTTApp**:
```typescript
// When starting new recording, initialize with edited content
const handleStartRecording = useCallback(async () => {
  if (currentSession) {
    // Save typed/edited text to database BEFORE recording
    if (localTranscript.trim() && localTranscript !== currentSession.transcript) {
      await updateTranscript(currentSession.id, localTranscript);
    }

    // Initialize TTS with edited content
    if (localTranscript.trim()) {
      initializeWithExistingTranscript(localTranscript);
    }
  }

  startRecording(false); // Preserve refs
}, [currentSession, localTranscript]);
```

**Result:** Manual edits preserved, new recording appends correctly.

---

### Edge Case 5: Duplicate Detection

**Scenario:** Same audio segment processed multiple times due to network retries or race conditions.

**Challenge:** Prevent duplicate text appearing in transcript.

**Solution:**
```typescript
const lastProcessedContentRef = useRef<string>('');
const lastProcessedTimeRef = useRef<number>(0);

const handleLiveTranscriptUpdate = useCallback(async (newText: string) => {
  const now = Date.now();

  // Duplicate detection: same content within 1 second
  if (lastProcessedContentRef.current === newText.trim() &&
      (now - lastProcessedTimeRef.current) < 1000) {
    console.log('🚫 Duplicate detected, skipping');
    return;
  }

  lastProcessedContentRef.current = newText.trim();
  lastProcessedTimeRef.current = now;

  // Process new text...
}, []);
```

**Result:** Duplicate segments filtered out, clean transcript.

---

### Edge Case 6: Race Condition in appendToTranscript

**Scenario:** User types text → saves to DB → recording adds text → append reads stale DB value.

**Challenge:** Database might not have updated yet when append reads.

**Solution:**
```typescript
// In GeorgianSTTApp
const handleLiveTranscriptUpdate = useCallback(async (newText: string) => {
  // Pass current UI state (localTranscriptRef) to appendToTranscript
  appendToTranscript(
    targetSessionId,
    newText.trim(),
    localTranscriptRef.current // Current state, not stale DB
  );
}, [appendToTranscript]);

// In useSessionManagement
const appendToTranscript = useCallback(async (
  sessionId: string,
  newText: string,
  currentTranscript?: string // Accept current state parameter
) => {
  let existingTranscript = '';

  // CRITICAL FIX: Use provided current state if available
  if (currentTranscript !== undefined) {
    existingTranscript = currentTranscript;
    console.log('✅ Using provided transcript (avoiding race condition)');
  } else {
    // Fallback: fetch from database
    const freshData = await fetchSessionFromDatabase(sessionId);
    existingTranscript = freshData.transcript || '';
  }

  const combinedTranscript = existingTranscript + ' ' + newText;
  return await updateSession(sessionId, { transcript: combinedTranscript });
}, []);
```

**Result:** Race condition eliminated, no text loss.

---

## Recording Workflows

### Workflow 1: New Recording (No Existing Session)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "New Session" or Record without session     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Title validation triggered                               │
│    - showTitleModal = true if title empty                   │
│    - User enters title in pendingSessionTitle               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. handleStartRecording() called                            │
│    - Generate recording session ID                          │
│    - Check if localTranscript has typed content             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. createSession(title, initialContent)                     │
│    - Creates database record                                │
│    - Sets transcript = initialContent (typed text)          │
│    - Returns new GeorgianSession                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. selectSession(newSession.id)                             │
│    - Sets currentSession in state                           │
│    - Loads session data from database                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. startRecording(false) - TTS hook                         │
│    - Use pre-initialized microphone (0-50ms)                │
│    - Create MediaRecorder                                   │
│    - Start 15-second segmentation timer                     │
│    - Begin audio capture                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Every 15 seconds: Auto-segmentation                      │
│    - Stop MediaRecorder (triggers onstop)                   │
│    - Process segment with parallel STT                      │
│    - Create new MediaRecorder                               │
│    - Continue recording seamlessly                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. User clicks Stop                                         │
│    - Set manualStopRef = true                               │
│    - Stop MediaRecorder                                     │
│    - Process final segment                                  │
│    - Save to database                                       │
│    - Clean up resources                                     │
└─────────────────────────────────────────────────────────────┘
```

---

### Workflow 2: Recording with Existing Session

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User selects existing session from SessionHistory       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. handleSelectSession(sessionId)                           │
│    - Load session.transcript to localTranscript            │
│    - Display in TranscriptPanel                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. (Optional) User edits transcript                         │
│    - Types in textarea                                      │
│    - Debounced save to database (1 second)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. User clicks Record button                                │
│    - handleStartRecording() called                          │
│    - Save edited text to database (if changed)              │
│    - Initialize TTS with existing content                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. startRecording(false) - preserve refs                    │
│    - googleTranscriptRef, enagramTranscriptRef preserved    │
│    - Recording continues from existing content              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Audio captured and processed                             │
│    - New text appended to existing transcript               │
│    - appendToTranscript(sessionId, newText, localTranscript)│
│    - Database updated with combined content                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Session Management

### Database Schema

```sql
CREATE TABLE georgian_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  transcript TEXT DEFAULT '',
  duration_ms INTEGER DEFAULT 0,
  audio_file_url TEXT,
  processing_results JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Row Level Security
ALTER TABLE georgian_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON georgian_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON georgian_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON georgian_sessions FOR UPDATE
  USING (auth.uid() = user_id);
```

### Key Operations

1. **createSession** - Creates database record immediately
```typescript
const createSession = async (title?: string, initialContent?: string) => {
  const { data, error } = await supabase
    .from('georgian_sessions')
    .insert({
      user_id: user.id,
      title: title || '',
      transcript: initialContent || '',
      duration_ms: 0,
      processing_results: []
    })
    .select()
    .single();

  const newSession = formatSession(data);
  setSessions(prev => [newSession, ...prev]);
  setCurrentSession(newSession);
  return newSession;
};
```

2. **selectSession** - Loads fresh data from database
```typescript
const selectSession = async (sessionId: string) => {
  // Immediate UI feedback
  const cached = sessions.find(s => s.id === sessionId);
  if (cached) {
    setCurrentSession(cached);
  }

  // Fetch fresh data
  const { data } = await supabase
    .from('georgian_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  const freshSession = formatSession(data);

  // Update both arrays
  setSessions(prev => prev.map(s => s.id === sessionId ? freshSession : s));
  setCurrentSession(freshSession);
};
```

3. **updateSession** - Updates specific fields
```typescript
const updateSession = async (sessionId: string, updates: Partial<GeorgianSession>) => {
  const { error } = await supabase
    .from('georgian_sessions')
    .update({
      title: updates.title,
      transcript: updates.transcript,
      duration_ms: updates.durationMs,
      processing_results: updates.processingResults
    })
    .eq('id', sessionId);

  if (!error) {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, ...updates } : s
    ));

    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => ({ ...prev, ...updates }));
    }
  }

  return !error;
};
```

4. **appendToTranscript** - Appends text without replacing
```typescript
const appendToTranscript = async (
  sessionId: string,
  newText: string,
  currentTranscript?: string
) => {
  let existingTranscript = '';

  // Use provided current state or fetch from database
  if (currentTranscript !== undefined) {
    existingTranscript = currentTranscript;
  } else {
    const { data } = await supabase
      .from('georgian_sessions')
      .select('transcript')
      .eq('id', sessionId)
      .single();

    existingTranscript = data?.transcript || '';
  }

  const separator = existingTranscript ? ' ' : '';
  const combinedTranscript = existingTranscript + separator + newText;

  return await updateSession(sessionId, { transcript: combinedTranscript });
};
```

---

## Database Synchronization

### Synchronization Points

1. **Session Creation** - Immediate database write
2. **Live Transcription** - Background save every segment (15s)
3. **User Editing** - Debounced save (1 second after typing stops)
4. **Recording Stop** - Final save of remaining content
5. **Session Switch** - Fresh load from database

### Optimistic UI Pattern

```typescript
// Pattern used throughout the app
const updateWithOptimisticUI = async (sessionId: string, newData: any) => {
  // 1. Update local state immediately (optimistic)
  setSessions(prev => prev.map(s =>
    s.id === sessionId ? { ...s, ...newData } : s
  ));

  // 2. Save to database in background
  const success = await updateDatabase(sessionId, newData);

  // 3. Revert on failure
  if (!success) {
    await refreshSessions(); // Reload from database
  }
};
```

### Race Condition Prevention

1. **Use Refs for Async Operations**
```typescript
// Bad: stale closure
setTimeout(() => {
  console.log(localTranscript); // Might be stale
}, 1000);

// Good: always fresh
setTimeout(() => {
  console.log(localTranscriptRef.current); // Always current
}, 1000);
```

2. **Pass Current State as Parameter**
```typescript
// Instead of reading from database (might be stale)
appendToTranscript(sessionId, newText, localTranscriptRef.current);
```

3. **Duplicate Detection**
```typescript
// Track last processed content and time
if (lastProcessedContentRef.current === newText &&
    Date.now() - lastProcessedTimeRef.current < 1000) {
  return; // Skip duplicate
}
```

---

## Performance Optimizations

### 1. Microphone Pre-initialization

**Goal:** <200ms recording start time

**Implementation:**
- Pre-initialize microphone on component mount
- Cache MediaStream in ref
- Reuse cached stream for instant recording start
- Fallback to user interaction pre-init if immediate fails

**Measurement:**
```typescript
console.time('🚀 Recording start performance');
await handleStartRecording();
console.timeEnd('🚀 Recording start performance');
// Target: <200ms
```

### 2. 15-Second Auto-Segmentation

**Goal:** Continuous recording without user intervention

**Benefits:**
- Processes smaller chunks (faster STT)
- Provides progressive feedback
- Handles network interruptions gracefully
- Prevents memory buildup

**Implementation:**
- Timer starts at segment beginning
- At 15 seconds, stop → process → restart
- Seamless UI (no visible interruption)
- `manualStopRef` prevents unwanted restart

### 3. Parallel STT Processing

**Goal:** Better accuracy and redundancy

**Benefits:**
- Google STT for speed (5-second segments)
- Enagram STT for accuracy (15-second segments)
- Combined transcript for AI analysis
- Graceful degradation if one service fails

**Implementation:**
```typescript
const [googleResult, enagramResult] = await Promise.allSettled([
  recognizeWithGoogle(audioBlob),
  recognizeWithEnagram(audioBlob)
]);

// Use Google for UI (faster)
const displayText = googleResult.value || enagramResult.value;

// Use both for AI (more accurate)
const aiText = `${googleResult.value}\n--- Alternative ---\n${enagramResult.value}`;
```

### 4. Debounced Database Saves

**Goal:** Reduce database writes during typing

**Implementation:**
```typescript
let typingTimeout: NodeJS.Timeout;

const handleTranscriptChange = (newTranscript: string) => {
  // Immediate UI update
  setEditableTranscript(newTranscript);

  // Debounced database save
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    onUpdateTranscript(newTranscript);
  }, 1000);
};
```

### 5. Background Processing

**Goal:** Keep UI responsive during heavy operations

**Implementation:**
```typescript
// Auto-segmentation: process in background
if (wasAutoSegmentation && !wasManualStop) {
  // Non-blocking processing
  processSegmentInBackground(audioBlob);

  // Immediate restart (10ms delay)
  setTimeout(() => {
    startNewRecording();
  }, 10);
}

// Manual stop: wait for processing
else {
  await processSegmentSynchronously(audioBlob);
  cleanupResources();
}
```

---

## Transcript Reference System

### Three-Ref Architecture

```typescript
// 1. Google STT results (fast, 5-second segments)
const googleTranscriptRef = useRef<string>('');

// 2. Enagram STT results (accurate, 15-second segments)
const enagramTranscriptRef = useRef<string>('');

// 3. Combined for AI processing (both services)
const combinedForSubmissionRef = useRef<string>('');
```

### Why Three Refs?

1. **Google** - Fast feedback, displayed in UI
2. **Enagram** - Higher accuracy, backup transcript
3. **Combined** - Comprehensive for AI analysis

### Update Pattern

```typescript
// After each segment processed
const updateCombinedTranscriptRefs = (parallelResults) => {
  const googleText = parallelResults.google || '';
  const enagramText = parallelResults.enagram || '';

  // Accumulate each service separately
  if (googleText.trim()) {
    googleTranscriptRef.current += ' ' + googleText.trim();
  }

  if (enagramText.trim()) {
    enagramTranscriptRef.current += ' ' + enagramText.trim();
  }

  // Build combined transcript
  const parts = [];
  if (googleTranscriptRef.current.trim()) {
    parts.push(googleTranscriptRef.current.trim());
  }
  if (enagramTranscriptRef.current.trim()) {
    parts.push(enagramTranscriptRef.current.trim());
  }

  combinedForSubmissionRef.current = parts.join('\n--- Alternative Transcription ---\n');
};
```

### Retrieval for AI Processing

```typescript
const getCombinedTranscriptForSubmission = useCallback(() => {
  // Priority: Combined > Google > Enagram
  if (combinedForSubmissionRef.current.trim()) {
    return combinedForSubmissionRef.current;
  }
  if (googleTranscriptRef.current.trim()) {
    return googleTranscriptRef.current;
  }
  return enagramTranscriptRef.current;
}, []);
```

---

## Testing & Debugging

### Console Log Patterns

**Successful Recording Start:**
```
🚀 Microphone pre-initialized successfully
🚀 Recording start performance: 127ms
✅ Recording start performance: 127ms (target: <200ms) - PASS
```

**Live Transcription:**
```
📤 Live update received: "პაციენტი მიმართავს..." (session: abc123)
🔄 Local transcript updated: prev=0, new=45, total=45
💾 Saving to session: abc123 (from recording)
```

**Auto-Segmentation:**
```
⏱️ Recording: 15s elapsed, 0s until auto-restart, audio: 67%
🎙️ Processing segment: 320KB (20 chunks, ~15s)
🔄 Continuing batch processing... (0 chunks remaining)
```

**Session Switching:**
```
🔄 Session changed - loading new session transcript
📝 Using session transcript (fallback)
✅ Initialized TTS hook with session transcript for AI processing (245 chars)
```

### Common Issues & Solutions

**Issue 1: Text Not Appearing**
```
Symptoms:
- Recording works but no text appears
- Console shows "📤 Live update received" but no UI update

Debug:
console.log('Local transcript:', localTranscript);
console.log('Editable transcript:', editableTranscript);
console.log('Session transcript:', currentSession?.transcript);

Common Cause: isUserTypingRef stuck as true
Solution: Clear typing flag on session change
```

**Issue 2: Duplicate Text**
```
Symptoms:
- Same text appears multiple times
- Console shows "🚫 Duplicate detected" not working

Debug:
console.log('Last processed:', lastProcessedContentRef.current);
console.log('Time since last:', Date.now() - lastProcessedTimeRef.current);

Common Cause: Duplicate detection window too small
Solution: Increase window from 1000ms to 2000ms
```

**Issue 3: Text Disappearing After Edit**
```
Symptoms:
- User edits text, then it reverts to old version
- Console shows "⏭️ Transcript unchanged, skipping update"

Debug:
console.log('User has edits:', userHasEdits);
console.log('Editable:', editableTranscript);
console.log('Session:', currentSession?.transcript);

Common Cause: isUserTypingRef not cleared
Solution: Add cleanup in useEffect dependencies
```

### Performance Monitoring

```typescript
// Recording start performance
console.time('🚀 Recording start performance');
await handleStartRecording();
console.timeEnd('🚀 Recording start performance');
// Target: <200ms

// Segment processing performance
console.time('🎯 Segment processing');
await processSegment(audioBlob);
console.timeEnd('🎯 Segment processing');
// Target: <5000ms for 15-second segment

// Database operation performance
console.time('💾 Database save');
await updateSession(sessionId, updates);
console.timeEnd('💾 Database save');
// Target: <500ms
```

---

## Conclusion

The Georgian medical transcription system is built with robust edge case handling, performance optimizations, and a clear separation of concerns. Key architectural decisions include:

1. **Single Source of Truth** - `localTranscript` for UI display
2. **Three-Ref System** - Google, Enagram, Combined for redundancy
3. **Optimistic UI** - Immediate updates, background saves
4. **Race Condition Prevention** - Refs for async, current state parameters
5. **Smart Segmentation** - 15-second chunks, seamless continuation
6. **Duplicate Detection** - Content + time-based filtering
7. **User Edit Preservation** - Typing detection, debounced saves
8. **Performance First** - <200ms start, parallel processing

This architecture ensures:
- ✅ No text loss in any scenario
- ✅ Seamless user experience
- ✅ Robust error handling
- ✅ High performance
- ✅ Easy debugging and maintenance

---

**Document Version:** 1.0
**Created:** 2025-10-15
**Author:** System Analysis
