# Flowise Streaming Response Implementation Plan

## Executive Summary

This plan outlines the implementation of streaming responses from Flowise backend to enhance user experience by displaying AI responses progressively instead of waiting for complete generation. This is a critical UX improvement for medical AI interactions where responses can take 10-30 seconds.

---

## Current Implementation Analysis

### What We Have Now
**Location**: `src/lib/api/chat.ts:395-428`

```typescript
// Current non-streaming approach
const response = await fetch(apiEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify(requestBody)
});

const data = await response.json(); // ❌ Waits for entire response
```

**Problems:**
- Users wait 10-30 seconds with no feedback
- No progressive rendering of AI responses
- Poor UX for medical consultations requiring quick information
- No indication of AI "thinking" process

### What Flowise Supports
**Documentation**: https://docs.flowiseai.com/using-flowise/streaming

Flowise supports Server-Sent Events (SSE) streaming with these event types:
- `start` - Streaming initialization
- `token` - Each word/token as it's generated
- `sourceDocuments` - Referenced medical sources
- `metadata` - Chat metadata (chatId, messageId)
- `error` - Error handling
- `end` - Completion signal

---

## Research Findings

### 1. Flowise Streaming API

**Endpoint**: Same as current (`POST /api/v1/predictions/{chatflow-id}`)

**Request Change**:
```json
{
  "question": "Your medical query here",
  "streaming": true,  // ✅ Add this parameter
  "overrideConfig": {
    "sessionId": "session-123"
  }
}
```

**Response Format (SSE)**:
```
event: start
data: {"chatId": "123"}

event: token
data: "The"

event: token
data: " patient's"

event: token
data: " ECG"

event: sourceDocuments
data: [{"pageContent": "Medical source..."}]

event: end
data: ""
```

### 2. React Implementation Options

**Option A: @microsoft/fetch-event-source** ⭐ **RECOMMENDED**
- Supports POST requests with custom headers (required for auth)
- Built-in retry and error handling
- Page visibility API integration (pauses when tab inactive)
- Production-grade error recovery

**Option B: Native EventSource**
- Only supports GET requests ❌
- Cannot send Authorization headers ❌
- Not suitable for our authenticated API

**Option C: Manual fetch with ReadableStream**
- Maximum control but complex implementation
- More code to maintain
- Higher risk of edge case bugs

### 3. Best Practices from Research

1. **Progressive State Updates**: Update message content as tokens arrive
2. **Error Recovery**: Handle network interruptions gracefully
3. **Fallback Mode**: Support non-streaming for compatibility
4. **Mobile Optimization**: Ensure low memory footprint
5. **Medical Safety**: Never show incomplete medical advice mid-stream

---

## Implementation Strategy

### Architecture Overview

```
User Message
    ↓
MessageInput → useFlowiseChat → streamingChatAPI
                    ↓                    ↓
            State Management    fetch-event-source
                    ↓                    ↓
            Message Updates ← SSE Events (token by token)
                    ↓
            MessageList (Progressive Rendering)
```

### Key Components to Modify

1. **`src/lib/api/chat.ts`** - Add streaming fetch function
2. **`src/hooks/chat/useFlowiseChat.ts`** - Add streaming mode
3. **`src/components/AICopilot/MessageList.tsx`** - Progressive rendering
4. **`src/components/AICopilot/FlowiseChatWindow.tsx`** - Streaming state UI

### State Management Strategy

```typescript
// In useFlowiseChat
const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
const [streamingContent, setStreamingContent] = useState<string>('');
const [isStreaming, setIsStreaming] = useState(false);

// Update pattern
onToken: (token) => {
  setStreamingContent(prev => prev + token);
  updateMessage(streamingMessageId, { content: streamingContent });
}
```

---

## Detailed Implementation Tasks

### Task 1: Create Streaming Service Utility

**File**: `src/lib/api/streamingService.ts` (NEW)

**Purpose**: Centralized streaming logic with error handling

**Key Functions**:
```typescript
export async function fetchStreamingResponse(
  endpoint: string,
  payload: any,
  callbacks: {
    onToken: (token: string) => void;
    onSource: (sources: any[]) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
  }
): Promise<void>
```

**Features**:
- Uses @microsoft/fetch-event-source
- Automatic reconnection (3 attempts)
- Exponential backoff
- Medical-safe error messages
- Session management integration

### Task 2: Update useFlowiseChat Hook

**File**: `src/hooks/chat/useFlowiseChat.ts:49-196`

**Changes**:
1. Add streaming mode parameter
2. Create streaming message with empty content
3. Update content progressively as tokens arrive
4. Mark as complete when streaming ends
5. Handle streaming errors gracefully

**New Interface**:
```typescript
interface UseFlowiseChatOptions {
  // ... existing options
  enableStreaming?: boolean; // ✅ NEW
  onStreamStart?: () => void; // ✅ NEW
  onStreamToken?: (token: string) => void; // ✅ NEW
  onStreamEnd?: () => void; // ✅ NEW
}
```

### Task 3: Modify Chat API for Streaming

**File**: `src/lib/api/chat.ts:228-459`

**Changes**:
1. Add streaming parameter to fetchAIResponse
2. Detect streaming capability from Flowise config
3. Route to streaming or non-streaming based on flag
4. Maintain backward compatibility

**Streaming Detection**:
```typescript
const supportsStreaming = await checkFlowiseStreamingSupport();
const useStreaming = enableStreaming && supportsStreaming;
```

### Task 4: Update MessageList for Progressive Rendering

**File**: `src/components/AICopilot/MessageList.tsx`

**Changes**:
1. Add streaming message indicator
2. Show typing animation during streaming
3. Auto-scroll as content grows
4. Optimize rendering for 1000+ character responses

**Visual Feedback**:
```typescript
{message.isStreaming && (
  <div className="streaming-indicator">
    <span className="animate-pulse">●</span> Generating response...
  </div>
)}
```

### Task 5: Add Streaming State Management & UI

**Files**:
- `src/components/AICopilot/FlowiseChatWindow.tsx`
- `src/stores/useAppStore.ts`

**UI Elements**:
1. Streaming progress indicator in header
2. "Stop generation" button during streaming
3. Estimated time remaining (optional)
4. Network quality indicator

**State Extensions**:
```typescript
// Add to store
streamingState: {
  isActive: boolean;
  messageId: string | null;
  tokensReceived: number;
  startTime: number;
}
```

### Task 6: Error Handling & Reconnection

**Scenarios to Handle**:

1. **Network Interruption**
   - Auto-reconnect with exponential backoff
   - Resume from last token if possible
   - Fallback to non-streaming if 3 failures

2. **Flowise Service Error**
   - Parse error events from SSE
   - Display medical-appropriate error messages
   - Offer "Try again" with non-streaming

3. **Timeout Handling**
   - 3-minute timeout for streaming (same as current)
   - Graceful degradation to partial response
   - Save what was received

4. **User Navigation**
   - Cancel streaming on unmount
   - Cleanup event listeners
   - Prevent memory leaks

### Task 7: Testing Integration

**Test Scenarios**:

1. **Happy Path**
   - Send simple query
   - Verify tokens arrive progressively
   - Confirm sources appear correctly
   - Check final message matches complete response

2. **Error Cases**
   - Network disconnection mid-stream
   - Flowise service error
   - Invalid authentication
   - Timeout scenario

3. **Edge Cases**
   - Very long responses (5000+ tokens)
   - Rapid consecutive messages
   - Mobile network switching (4G → WiFi)
   - Browser tab switching

4. **Medical Safety**
   - Incomplete medical advice handling
   - Source verification during streaming
   - Emergency information display priority

### Task 8: Fallback Mode Implementation

**Purpose**: Ensure backward compatibility

**Strategy**:
```typescript
const streamingConfig = {
  enabled: import.meta.env.VITE_ENABLE_STREAMING === 'true',
  fallbackOnError: true,
  maxRetries: 3
};

// Automatic fallback
if (streamingError && attempt >= maxRetries) {
  logger.warn('Falling back to non-streaming mode');
  return fetchAIResponseNonStreaming(message, sessionId, ...);
}
```

### Task 9: Performance Testing & Mobile Optimization

**Performance Metrics**:
- Time to first token: < 500ms
- Memory usage: < 50MB for 10-message conversation
- Render performance: 60fps during streaming
- Mobile battery impact: < 5% per 10-minute session

**Mobile Optimizations**:
1. Debounce render updates (every 3 tokens instead of every token)
2. Virtual scrolling for long messages
3. Pause streaming when app backgrounded
4. Reduce animation complexity on low-end devices

**Testing Tools**:
- Chrome DevTools Performance tab
- React DevTools Profiler
- Mobile device testing (iOS Safari, Chrome Android)
- Network throttling (3G, 4G, WiFi)

---

## Security & Medical Safety Considerations

### 1. Authentication
- Stream requires same auth as current implementation
- Token validation on each SSE connection
- Auto-refresh tokens before streaming starts

### 2. Medical Content Safety
```typescript
// Never show partial critical medical advice
const criticalKeywords = ['emergency', 'call 911', 'immediate', 'urgent'];
const bufferCriticalContent = (content: string) => {
  if (criticalKeywords.some(kw => content.toLowerCase().includes(kw))) {
    // Wait for complete sentence before showing
    return waitForCompleteSentence(content);
  }
  return content; // Safe to stream
};
```

### 3. HIPAA Compliance
- No streaming of patient identifiable information
- Same encryption as current (HTTPS)
- Audit log streaming events
- Session isolation maintained

---

## Configuration & Environment Variables

**New Environment Variables**:
```env
# Streaming Configuration
VITE_ENABLE_STREAMING=true
VITE_STREAMING_MAX_RETRIES=3
VITE_STREAMING_TIMEOUT=180000
VITE_STREAMING_DEBOUNCE_MS=50
VITE_STREAMING_FALLBACK=true
```

---

## Migration Strategy

### Phase 1: Development (Week 1)
1. Create streaming service utility
2. Update useFlowiseChat with streaming mode
3. Basic UI integration

### Phase 2: Testing (Week 2)
4. Comprehensive error handling
5. Performance optimization
6. Mobile testing

### Phase 3: Soft Launch (Week 3)
7. Feature flag rollout (10% users)
8. Monitor error rates and performance
9. Gather user feedback

### Phase 4: Full Rollout (Week 4)
10. Enable for all users
11. Monitor and optimize
12. Documentation updates

---

## Success Metrics

### User Experience
- **Time to first response**: Reduce from 10-30s to < 1s
- **Perceived performance**: User feels AI is "thinking" vs "loading"
- **Engagement**: Users send more messages due to better UX
- **Satisfaction**: CSAT score improvement

### Technical Metrics
- **Streaming success rate**: > 95%
- **Fallback rate**: < 5%
- **Error rate**: < 1%
- **Performance**: 60fps render during streaming
- **Mobile performance**: < 5% battery impact

---

## Dependencies

**New Package Required**:
```json
{
  "@microsoft/fetch-event-source": "^2.0.1"
}
```

**Installation**:
```bash
npm install @microsoft/fetch-event-source
```

---

## Rollback Plan

**If Issues Arise**:
1. Set `VITE_ENABLE_STREAMING=false`
2. Existing non-streaming code remains functional
3. No data loss or breaking changes
4. Can enable per-user via feature flag

---

## Code Structure Overview

```
src/
├── lib/
│   ├── api/
│   │   ├── chat.ts                    # ✏️ Modify: Add streaming mode
│   │   ├── streamingService.ts        # ✅ NEW: SSE handling
│   │   └── streamingHelpers.ts        # ✅ NEW: Utility functions
├── hooks/
│   └── chat/
│       └── useFlowiseChat.ts          # ✏️ Modify: Streaming state
├── components/
│   └── AICopilot/
│       ├── FlowiseChatWindow.tsx      # ✏️ Modify: UI indicators
│       ├── MessageList.tsx            # ✏️ Modify: Progressive render
│       └── StreamingIndicator.tsx     # ✅ NEW: Progress UI
└── utils/
    └── streamingValidation.ts         # ✅ NEW: Medical safety checks
```

---

## Testing Plan

### Unit Tests
- `streamingService.test.ts` - SSE event handling
- `useFlowiseChat.test.ts` - Streaming state management
- `streamingHelpers.test.ts` - Utility functions

### Integration Tests
- End-to-end streaming flow
- Error handling scenarios
- Fallback mechanism
- Authentication integration

### Manual Testing Checklist
- [ ] Simple query streaming
- [ ] Long response (5000+ tokens)
- [ ] Network interruption
- [ ] Multiple rapid messages
- [ ] Mobile Safari streaming
- [ ] Chrome Android streaming
- [ ] Slow 3G network
- [ ] Tab switching during stream
- [ ] Browser close during stream
- [ ] Concurrent case context + streaming

---

## Documentation Updates Required

1. **Developer Docs**: Streaming architecture explanation
2. **API Docs**: Streaming parameters and responses
3. **User Guide**: New streaming experience notes
4. **Troubleshooting**: Streaming error resolution

---

## Timeline Estimate

**Total Implementation**: 3-4 weeks

- **Week 1**: Core streaming implementation (Tasks 1-3)
- **Week 2**: UI/UX and error handling (Tasks 4-6)
- **Week 3**: Testing and optimization (Tasks 7-9)
- **Week 4**: Soft launch and monitoring

**Developer Effort**: 60-80 hours

---

## Questions for User Review

1. **Priority**: Is this high priority for immediate implementation?
2. **Feature Flag**: Should we use feature flags for gradual rollout?
3. **Flowise Version**: Confirm Flowise backend version supports streaming
4. **Mobile Focus**: Should we prioritize mobile or desktop first?
5. **Medical Safety**: Any additional medical content validation rules?

---

## Next Steps

**After Plan Approval**:
1. Install @microsoft/fetch-event-source package
2. Create streamingService.ts utility
3. Update useFlowiseChat hook
4. Implement progressive rendering
5. Add error handling
6. Test integration
7. Deploy with feature flag

**Immediate Action**: Awaiting your approval to proceed with implementation.

---

## References

- [Flowise Streaming Docs](https://docs.flowiseai.com/using-flowise/streaming)
- [Microsoft Fetch Event Source](https://github.com/Azure/fetch-event-source)
- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [React Streaming Best Practices](https://blog.logrocket.com/using-fetch-event-source-server-sent-events-react/)
