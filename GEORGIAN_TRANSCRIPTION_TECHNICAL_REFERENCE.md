# Georgian Medical Transcription System - Technical Reference

## Overview
This document provides a complete technical reference for the Georgian Medical Transcription (MediScribe) system, detailing how transcript handling, state management, session management, and real-time updates work together. Use this as a recovery guide when making changes breaks the system.

## System Architecture

### Core Components
```
GeorgianSTTAppWrapper.tsx (Context Provider)
├── GeorgianSTTApp.tsx (Main Coordinator)
│   ├── TranscriptPanel.tsx (UI Display)
│   │   ├── TranscriptContent.tsx
│   │   ├── ContextContent.tsx  
│   │   └── AIProcessingContent.tsx
│   └── SessionHistory.tsx
├── useGeorgianTTS.ts (Recording Logic)
├── useSessionManagement.ts (Database Operations)
└── georgianTTSService.ts (API Integration)
```

## Critical State Management

### 1. Session Management (`useSessionManagement.ts`)

#### Session Creation Flow
```typescript
createSession(title, initialContent) → 
  Database INSERT → 
  Update sessions array → 
  Set currentSession → 
  Return session object
```

**Key Implementation Details:**
- Handles both wrapped `{data: sessionData}` and direct `sessionData` Supabase responses
- Creates sessions immediately in database (not temporary)
- Validates session data structure before proceeding
- Updates both `sessions` array and `currentSession` state

#### Transcript Appending (CRITICAL)
```typescript
appendToTranscript(sessionId, newText, duration) →
  Find session (3 levels: sessions array → currentSession → database fetch) →
  Fetch FRESH database data →
  Combine: existingTranscript + separator + newText →
  Update database →
  Return success
```

**CRITICAL FIX**: Triple-fallback session finding with database fetch:
```typescript
// 1. First try to find in sessions array
let session = sessions.find(s => s.id === sessionId);

// 2. If not found, check if it's the current session
if (!session && currentSession?.id === sessionId) {
  session = currentSession;
}

// 3. If still not found, try to fetch directly from database (session might be newly created)
if (!session && user) {
  const [dbSession, dbError] = await safeAsync(
    () => supabase.from('georgian_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
  );
  
  if (!dbError && dbSession) {
    // Map database response to session object
    session = { /* mapped session data */ };
  }
}

// Always fetch fresh database data to prevent stale transcript issues
const [freshData, fetchError] = await safeAsync(
  () => supabase.from('georgian_sessions')
    .select('transcript, duration_ms')
    .eq('id', sessionId)
    .eq('user_id', user?.id)
    .single()
);

// Use fresh data if available (prevents overwrites)
if (!fetchError && freshData) {
  existingTranscript = freshSessionData.transcript || '';
  currentDuration = freshSessionData.duration_ms || 0;
}
```

### 2. Recording Logic (`useGeorgianTTS.ts`)

#### Auto-Segmentation System
```typescript
15-second chunks → Auto-process → Live update
23-second chunks → Auto-process → Live update  
Manual stop → Process remaining → Final update
```

**Key Features:**
- **Smart chunking**: 15-23 second segments for optimal processing
- **Live updates**: Real-time transcript updates during recording
- **Chunk tracking**: Prevents duplicate processing
- **Background processing**: Non-blocking audio processing

#### Recording State Management
```typescript
interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  isProcessingChunks: boolean;
  processedChunks: number;
  totalChunks: number;
}
```

### 3. Transcript Display Logic (`TranscriptPanel.tsx`)

#### Transcript Selection Algorithm (CRITICAL)
This is the most complex part - determines which transcript to display:

```typescript
// Priority-based transcript selection with smart user edit detection
const transcriptSelectionLogic = () => {
  // 1. Smart check for user edits (not just live recording growth)
  // During live recording, localTranscript grows with new segments, but that's not a "user edit"
  const localStart = (localTranscript || '').substring(0, currentEditableLength);
  const userHasEdits = currentEditableLength > 0 && 
    editableTranscript.trim() !== sessionTranscript.trim() &&
    editableTranscript.trim() !== localStart.trim() &&
    !(localTranscript || '').startsWith(editableTranscript.trim()); // Not just a prefix of live recording
    
  if (userHasEdits) {
    return editableTranscript; // PRESERVE USER EDITS
  }
  
  // 2. Session has more content (new transcription)
  else if (sessionLength > currentEditableLength) {
    return sessionTranscript; // NEW DATABASE CONTENT
  }
  
  // 3. Local has more content (fresh recording)
  else if (localLength > currentEditableLength) {
    return localTranscript; // FRESH RECORDING
  }
  
  // 4. Fallback priorities...
};
```

**CRITICAL**: User typing interference prevention:
```typescript
const handleTranscriptChange = (newTranscript: string) => {
  // Prevent useEffect interference during typing
  isUserTypingRef.current = true;
  
  // Auto-save after 1 second of no typing
  typingTimeoutRef.current = setTimeout(() => {
    isUserTypingRef.current = false;
    
    // Save user changes to database
    if (onUpdateTranscript && newTranscript.trim()) {
      onUpdateTranscript(newTranscript);
    }
  }, 1000);
  
  // Update local state immediately
  setEditableTranscript(newTranscript);
};
```

#### useEffect Dependencies (CRITICAL)
**NEVER include `editableTranscript` in dependencies:**
```typescript
// ✅ CORRECT - Prevents infinite loops
}, [currentSession?.id, localTranscript, currentSession?.transcript]);

// ❌ WRONG - Causes infinite re-renders
}, [currentSession?.id, localTranscript, currentSession?.transcript, editableTranscript]);
```

## Live Update Flow

### 1. Recording Process
```
User clicks record →
GeorgianSTTApp creates/uses session →
useGeorgianTTS starts recording →
Audio chunks accumulate →
15s/23s threshold hit →
Process chunk via georgianTTSService →
Return transcript text →
Trigger onLiveTranscriptUpdate callback
```

### 2. Live Update Handling
```typescript
// In GeorgianSTTApp.tsx - UPDATED with session ID priority fix
const handleLiveTranscriptUpdate = (newText: string, fullText: string, sessionId?: string) => {
  // OPTIMISTIC UI: Update local state immediately for instant feedback
  if (newText.trim()) {
    // Update local transcript immediately
    setLocalTranscript(prev => {
      const separator = prev ? '\n\n' : '';
      return prev + separator + newText.trim();
    });
    
    // Save to database in background - prioritize current recording session
    // Use sessionId parameter (from useGeorgianTTS hook) if available, fallback to currentSession
    const targetSessionId = sessionId || currentSession?.id;
    
    if (targetSessionId) {
      // Use the session ID from the recording or current selection
      console.log(`💾 Saving to session: ${targetSessionId} (from ${sessionId ? 'recording' : 'current'})`);
      
      appendToTranscript(targetSessionId, newText.trim()).catch(error => {
        // Keep local state - user still sees the transcript
        console.error(`❌ Failed to append to session ${targetSessionId}:`, error);
      });
    } else {
      // Only create new session if we truly have no session context
      const newSession = await createSession('Live Recording');
      if (newSession) {
        await selectSession(newSession.id);
        setTimeout(() => appendToTranscript(newSession.id, newText.trim()), 100);
      }
    }
  }
};
```

### 3. Database Update Flow
```
Live update received →
appendToTranscript called →
Fetch fresh database data →
Combine with new text →
Update database →
Database change triggers session reload →
TranscriptPanel detects session change →
Updates UI with new content
```

## Edge Function Integration

### Georgian TTS Service
```typescript
// Request structure
interface SpeechRequest {
  theAudioDataAsBase64: string;
  Language: string;
  Autocorrect: boolean;
  Punctuation: boolean;
  Digits: boolean;
  Engine?: 'STT1' | 'STT2' | 'STT3';
  Speakers?: number;
  enableSpeakerDiarization?: boolean;
}
```

**Engine Selection:**
- **STT1**: Fast, basic accuracy
- **STT2**: Balanced speed/accuracy (default)
- **STT3**: Highest accuracy, slower

**Response Handling:**
```typescript
// Text response for regular transcription
const text = await response.text();

// JSON response for speaker diarization
const json = await response.json();
const { text, speakers, hasSpeakers } = json;
```

## Common Issues and Solutions

### Issue 1: "Maximum update depth exceeded"
**Cause**: `editableTranscript` in useEffect dependency array
**Fix**: Remove `editableTranscript` from dependencies
```typescript
// Fix applied in TranscriptPanel.tsx:277
}, [currentSession?.id, localTranscript, currentSession?.transcript]);
```

### Issue 2: "Session not found for appendToTranscript"
**Cause**: Session created but not yet in sessions array, currentSession undefined
**Fix**: Triple-fallback session finding with database fetch
```typescript
// Fix in useSessionManagement.ts - Three levels of session finding
let session = sessions.find(s => s.id === sessionId);

// Level 2: Check if it's the current session
if (!session && currentSession?.id === sessionId) {
  session = currentSession;
}

// Level 3: If still not found, try to fetch directly from database
if (!session && user) {
  console.log('🔍 Session not in local state, fetching from database:', sessionId);
  
  const [dbSession, dbError] = await safeAsync(
    () => supabase.from('georgian_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
  );
  
  if (!dbError && dbSession) {
    session = { /* mapped session object */ };
    console.log('✅ Found session in database:', sessionId);
  }
}
```

### Issue 3: 15-second transcripts replaced by final segment
**Cause**: Stale session data used in appendToTranscript
**Fix**: Fetch fresh database data before appending
```typescript
// Critical fix - always get fresh data
const [freshData] = await safeAsync(
  () => supabase.from('georgian_sessions')
    .select('transcript, duration_ms')
    .eq('id', sessionId)
    .single()
);
```

### Issue 4: User typed text gets erased during live recording
**Cause**: Live transcripts overwriting user input, poor user edit detection
**Fix**: Smart transcript selection that distinguishes live updates from user edits
```typescript
// Enhanced user edit detection - don't treat live recording growth as "user edits"
const localStart = (localTranscript || '').substring(0, currentEditableLength);
const userHasEdits = currentEditableLength > 0 && 
  editableTranscript.trim() !== sessionTranscript.trim() &&
  editableTranscript.trim() !== localStart.trim() &&
  !(localTranscript || '').startsWith(editableTranscript.trim());

if (userHasEdits) {
  transcript = editableTranscript; // Preserve user edits
} else {
  transcript = localTranscript; // Continue with live updates
}
```

### Issue 5: Multiple chunks creating separate sessions
**Cause**: currentSession becomes undefined between chunks
**Fix**: Prioritize sessionId parameter from useGeorgianTTS hook
```typescript
// In GeorgianSTTApp.tsx - Use recording session ID consistently
const targetSessionId = sessionId || currentSession?.id; // sessionId from hook takes priority
```

## Database Schema

### georgian_sessions Table
```sql
CREATE TABLE georgian_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  transcript TEXT DEFAULT '',
  duration_ms INTEGER DEFAULT 0,
  audio_file_url TEXT,
  processing_results JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- RLS Policies
CREATE POLICY "Users can manage their own sessions" 
ON georgian_sessions FOR ALL 
USING (auth.uid() = user_id);
```

## Performance Optimizations

### Microphone Pre-initialization
```typescript
// In useGeorgianTTS.ts
const preInitializeMicrophone = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    preInitializedStreamRef.current = stream;
    return true;
  } catch (error) {
    return false;
  }
};
```

### Session State Synchronization
```typescript
// Ref-based session tracking for immediate access
const currentSessionIdRef = useRef<string>('');

useEffect(() => {
  currentSessionIdRef.current = currentSession?.id || '';
}, [currentSession?.id]);
```

### Background Audio Processing
```typescript
// Non-blocking audio processing
const processAudioChunk = async (audioBlob: Blob) => {
  // Process in background without blocking UI
  setTimeout(() => processChunk(audioBlob), 0);
};
```

## Testing and Validation

### Key Test Scenarios
1. **STT Engine Switching**: Test all three engines work
2. **Long Recording**: Record >30 seconds, verify all chunks appear in UI and database
3. **User Typing**: Type during recording, verify text preserved and live updates continue
4. **Session Recovery**: Refresh page, verify sessions persist
5. **Multiple Chunks**: Record >60 seconds, verify no duplicate sessions created
6. **Session State Sync**: Verify currentSession remains consistent during recording
7. **Database Append**: Verify chunks append to database (not replace)
8. **Network Issues**: Test offline/online transitions
9. **Mobile Performance**: Test on mobile devices

### Debug Tools
```typescript
// Session debugging - Enhanced with recording session tracking
console.log('💾 Saving to session:', targetSessionId, '(from', sessionId ? 'recording' : 'current', ')');
console.log('🔍 Session not in local state, fetching from database:', sessionId);
console.log('✅ Found session in database:', sessionId);
console.log('Available sessions:', sessions.map(s => s.id));
console.log('Current session:', currentSession?.id);

// Transcript debugging - Enhanced with user edit detection
console.log('Transcript selection:', {
  sessionLength,
  localLength,
  currentEditableLength,
  userHasEdits,
  localStart: localStart.substring(0, 30) + '...'
});
console.log('🔄 Appending to transcript:', {
  sessionId,
  existingLength,
  newTextLength,
  combinedLength
});
```

## Recovery Procedures

### When Transcription Stops Working
1. Check browser console for errors
2. Verify Supabase connection
3. Test microphone permissions
4. Verify Edge Function deployment
5. Check session creation/selection

### When Text Gets Erased
1. Check transcript selection logic
2. Verify useEffect dependencies
3. Test user typing detection
4. Check appendToTranscript flow

### When Sessions Don't Persist
1. Verify RLS policies
2. Check user authentication
3. Test database connectivity
4. Verify session creation flow

## Future Enhancement Guidelines

### When Adding New Features:
1. **Never modify** the core transcript selection logic without understanding it fully
2. **Always test** with user typing during recording
3. **Verify** session persistence across page refreshes  
4. **Test** with multiple recordings in one session
5. **Check** mobile performance impacts

### Safe Modification Areas:
- UI components (styling, layout)
- Additional processing options
- New STT engines
- Export functionality

### Dangerous Modification Areas:
- useEffect dependencies in TranscriptPanel
- appendToTranscript logic in useSessionManagement
- Session state management
- Live update handling

## Conclusion

This system is complex due to the need to handle:
- Real-time audio processing
- Multiple transcript sources (live, session, user-typed)
- User interaction during recording
- Database synchronization
- Mobile performance requirements

Always refer to this document before making changes and test all scenarios thoroughly. The transcript selection logic and session management are the most critical components - modify with extreme caution.