# Mobile MediScribe Testing Quickstart

## Prerequisites
- Mobile device or browser dev tools with mobile simulation
- MediMind Expert running on `http://localhost:8888`
- Playwright MCP enabled for browser automation testing

## Core Testing Scenarios

### 1. Fixed Header During Text Focus (FR-001)
**Test Steps**:
1. Navigate to MediScribe transcription page on mobile
2. Scroll down to see header behavior
3. Tap transcript textarea to focus
4. **Expected**: Header remains fixed and visible without viewport shift
5. **Performance**: Measure layout change duration (<100ms)

**Validation Points**:
- Header position unchanged during focus
- Navigation buttons remain accessible
- No unwanted page scroll to textarea

### 2. Dynamic Footer Positioning (FR-002)
**Test Steps**:
1. Focus on transcript textarea
2. Wait for mobile keyboard to appear
3. **Expected**: Recording/upload buttons move above keyboard
4. **Expected**: Buttons maintain 44px minimum touch targets
5. Dismiss keyboard
6. **Expected**: Footer returns to original position

**Validation Points**:
- Footer repositions within 100ms of keyboard appearance
- Touch targets remain >= 44px during transition
- Recording functionality uninterrupted

### 3. Scroll Behavior Prevention (FR-003)
**Test Steps**:
1. Enter long text in transcript area
2. Position cursor at bottom of visible area
3. Continue typing
4. **Expected**: Cursor remains visible without page auto-scroll
5. **Expected**: Only textarea scrolls internally

**Validation Points**:
- Browser doesn't auto-scroll entire page
- Cursor stays visible within textarea
- Smooth scrolling within textarea only

### 4. Device Rotation Handling (Edge Case)
**Test Steps**:
1. Focus textarea with keyboard open in portrait
2. Rotate device to landscape
3. **Expected**: Layout adjusts smoothly
4. **Expected**: Keyboard and controls remain functional
5. Rotate back to portrait
6. **Expected**: Return to previous state

**Validation Points**:
- No layout breaks during rotation
- Keyboard height recalculated correctly
- Session state preserved

### 5. Rapid Focus Switching (Edge Case)
**Test Steps**:
1. Rapidly tap between textarea and other controls
2. Monitor layout stability during rapid state changes
3. **Expected**: No layout thrashing or performance issues
4. **Expected**: All interactions remain responsive

**Validation Points**:
- Smooth transitions during rapid input
- No visual jumping or layout breaks
- Consistent performance throughout

## Performance Validation

### Layout Transition Timing
```javascript
// Test in browser console
const startTime = performance.now();
document.querySelector('textarea').focus();
// Measure until layout settles
const duration = performance.now() - startTime;
console.log(`Layout transition: ${duration}ms`); // Must be <100ms
```

### Touch Target Verification
```javascript
// Verify minimum 44px touch targets
const buttons = document.querySelectorAll('[role="button"], button');
buttons.forEach(btn => {
  const rect = btn.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);
  console.log(`Button size: ${size}px`); // Must be >=44px
});
```

### Keyboard Height Detection
```javascript
// Monitor keyboard height accuracy
window.visualViewport.addEventListener('resize', () => {
  const keyboardHeight = window.innerHeight - window.visualViewport.height;
  console.log(`Keyboard height: ${keyboardHeight}px`);
});
```

## Accessibility Testing

### Screen Reader Compatibility
1. Enable screen reader (VoiceOver on iOS, TalkBack on Android)
2. Navigate through transcription interface
3. **Expected**: All elements properly announced
4. **Expected**: Focus changes communicated clearly

### Voice Control Testing
1. Enable voice control on device
2. Attempt to control transcription interface via voice
3. **Expected**: All interactive elements controllable
4. **Expected**: Text input via voice functions properly

### High Contrast Mode
1. Enable high contrast mode in device settings
2. **Expected**: All elements remain visible and functional
3. **Expected**: Touch targets maintain adequate contrast

## Browser Compatibility Matrix

| Browser | Version | Keyboard Detection | Layout Transitions | Touch Targets |
|---------|---------|-------------------|-------------------|---------------|
| iOS Safari | 15+ | ✅ Visual Viewport API | ✅ CSS Transforms | ✅ 44px min |
| Chrome Mobile | 90+ | ✅ Visual Viewport API | ✅ CSS Transforms | ✅ 44px min |
| Samsung Internet | 15+ | ✅ Visual Viewport API | ✅ CSS Transforms | ✅ 44px min |
| Firefox Mobile | 90+ | ⚠️ Fallback Events | ✅ CSS Transforms | ✅ 44px min |

## Integration Testing

### Session Management Integration
1. Start transcription session
2. Perform mobile keyboard interactions
3. **Expected**: Session state preserved throughout
4. **Expected**: Transcript content maintained

### Recording Functionality Integration
1. Begin recording in mobile interface
2. Open/close keyboard during recording
3. **Expected**: Recording continues uninterrupted
4. **Expected**: Audio quality unaffected

### Navigation Integration
1. Use mobile interface navigation during text editing
2. **Expected**: Navigation works with keyboard open
3. **Expected**: Route changes handle keyboard state

## Error Scenarios

### Network Interruption During Editing
1. Begin text editing with keyboard open
2. Disconnect network briefly
3. **Expected**: Layout remains stable
4. **Expected**: Local text editing continues

### Memory Pressure Testing
1. Open multiple browser tabs
2. Use transcription interface under memory pressure
3. **Expected**: Performance degrades gracefully
4. **Expected**: Core functionality maintained

### Unexpected Keyboard Dismissal
1. Focus textarea to open keyboard
2. Force dismiss keyboard (system gesture)
3. **Expected**: Layout returns to normal state
4. **Expected**: No broken UI elements remain

## Acceptance Criteria Checklist

- [ ] Header remains fixed during text focus (FR-001)
- [ ] Footer repositions above keyboard (FR-002)  
- [ ] Browser auto-scroll prevented (FR-003)
- [ ] 44px minimum touch targets maintained (FR-004)
- [ ] All transcription functionality preserved (FR-005)
- [ ] Dynamic keyboard height handling (FR-006)
- [ ] Smooth transition animations (FR-007)
- [ ] Recording controls accessibility (FR-008)
- [ ] Seamless editing during recording (FR-009)
- [ ] Cursor position preservation (FR-010)
- [ ] <100ms layout transition performance (PR-001)
- [ ] <50ms input latency (PR-002)
- [ ] 60fps transition smoothness (PR-003)
- [ ] WCAG 2.1 AA compliance (AR-001)
- [ ] Screen reader support (AR-002)
- [ ] Mobile focus state feedback (AR-003)
- [ ] Keyboard navigation preservation (AR-004)