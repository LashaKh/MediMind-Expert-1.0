# Data Model: Mobile Viewport and Keyboard State Management

## Core Entities

### Mobile Viewport State
**Purpose**: Represents current mobile browser viewport dimensions and keyboard interaction state

**Attributes**:
- `windowHeight`: number - Initial browser window height in pixels
- `viewportHeight`: number - Current visible viewport height in pixels
- `keyboardHeight`: number - Calculated keyboard height (windowHeight - viewportHeight)
- `isKeyboardOpen`: boolean - Whether mobile keyboard is currently displayed
- `orientation`: 'portrait' | 'landscape' - Current device orientation
- `safeAreaInsets`: SafeAreaInsets - Device-specific safe area measurements

**Validation Rules**:
- windowHeight must be > 0
- viewportHeight must be > 0 and <= windowHeight
- keyboardHeight must be >= 0
- keyboardHeight > 50px indicates keyboard is open

**State Transitions**:
- keyboardClosed → keyboardOpening → keyboardOpen → keyboardClosing → keyboardClosed
- portrait ↔ landscape (triggers height recalculation)

### Textarea Focus State
**Purpose**: Manages text editing interaction state and cursor positioning

**Attributes**:
- `isFocused`: boolean - Whether textarea currently has focus
- `cursorPosition`: number - Current text cursor position
- `scrollTop`: number - Current textarea scroll position
- `textareaHeight`: number - Current calculated textarea height
- `content`: string - Current transcript content
- `selectionStart`: number - Selection start position
- `selectionEnd`: number - Selection end position

**Validation Rules**:
- cursorPosition must be >= 0 and <= content.length
- scrollTop must be >= 0
- textareaHeight must be >= 44px (minimum touch target)
- selectionStart <= selectionEnd

**Relationships**:
- Linked to MobileViewportState for keyboard-aware height adjustments
- Connected to TranscriptSession for content persistence

### Layout Container State
**Purpose**: Manages dynamic positioning of header, content, and footer elements

**Attributes**:
- `headerHeight`: number - Fixed header height in pixels
- `footerHeight`: number - Footer controls height in pixels
- `contentAreaHeight`: number - Available content area height
- `footerOffset`: number - Dynamic footer positioning offset
- `isTransitioning`: boolean - Whether layout transition is in progress
- `transitionDuration`: number - Current transition duration in milliseconds

**Validation Rules**:
- headerHeight must be >= 44px (minimum touch target height)
- footerHeight must be >= 44px (minimum touch target height)
- contentAreaHeight must be > 0
- transitionDuration must be <= 100ms (performance requirement)

**Relationships**:
- Responds to MobileViewportState changes
- Coordinates with TextareaFocusState for content positioning

### Touch Interaction State
**Purpose**: Tracks touch interactions and gesture handling for mobile optimization

**Attributes**:
- `lastTouchTime`: number - Timestamp of last touch interaction
- `touchTargetSize`: number - Current touch target size (minimum 44px)
- `isGestureActive`: boolean - Whether gesture interaction is in progress
- `touchOffset`: { x: number, y: number } - Touch position offset
- `pressureSupported`: boolean - Whether device supports pressure sensitivity

**Validation Rules**:
- touchTargetSize must be >= 44px (accessibility requirement)
- lastTouchTime must be valid timestamp
- touchOffset coordinates must be within viewport bounds

## Entity Relationships

```
MobileViewportState (1) ←→ (1) LayoutContainerState
    ↓
TextareaFocusState (1) ←→ (1) TouchInteractionState
    ↓
TranscriptSession (existing entity - no changes)
```

## State Persistence Strategy

### Session-Level Persistence
- TextareaFocusState.content → persisted to existing session management
- MobileViewportState.orientation → localStorage for session restoration
- TouchInteractionState.touchTargetSize → localStorage for accessibility preferences

### Transient State (Memory Only)
- Layout transition states and keyboard heights
- Touch interaction coordinates and timing
- Dynamic positioning calculations

### Cross-Component Communication
- CSS custom properties for viewport dimensions
- React Context for focus state management
- Event emitters for layout transition coordination

## Performance Constraints

### Update Frequency Limits
- Viewport state updates: Maximum 60Hz (16.67ms intervals)
- Layout calculations: Maximum 100ms total duration
- Touch interaction sampling: 120Hz on supported devices

### Memory Management
- State objects limited to essential data only
- Event listener cleanup on component unmount
- Debounced updates to prevent excessive calculations

## Accessibility Integration

### Touch Target Management
- Minimum 44px targets enforced at state level
- Dynamic sizing for vision accessibility preferences
- Pressure sensitivity support where available

### Screen Reader Compatibility
- Focus state changes announced to assistive technology
- Layout transitions communicated through ARIA live regions
- Keyboard navigation state preserved during mobile interactions