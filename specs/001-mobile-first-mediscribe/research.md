# Research: Mobile Viewport and Keyboard Management

## Mobile Browser Viewport Behavior Analysis

### Decision: Visual Viewport API + CSS Custom Properties
**Rationale**: Modern mobile browsers support Visual Viewport API which provides accurate keyboard height detection and viewport dimensions. Combined with CSS custom properties, this enables dynamic layout adjustments without JavaScript DOM manipulation.

**Alternatives considered**:
- Window resize events only: Unreliable on iOS Safari
- Fixed viewport meta tags: Doesn't solve keyboard interference
- Third-party libraries: Adds unnecessary dependencies for core browser functionality

### Decision: CSS Layout Containment + Transform Positioning  
**Rationale**: Using CSS `contain: layout` prevents reflow cascading, while `transform: translateY()` enables GPU-accelerated positioning changes without triggering layout recalculation.

**Alternatives considered**:
- Direct style.top modifications: Triggers expensive layout recalculation
- Flexbox gap adjustments: Causes visual jumping during transitions
- Absolute positioning changes: Breaks responsive design flow

### Decision: Textarea Auto-resize with Overflow Management
**Rationale**: Combining `field-sizing: content` (where supported) with manual height calculation prevents browser auto-scroll behavior while maintaining text visibility.

**Alternatives considered**:
- Fixed textarea height: Poor UX for long transcripts
- Scroll prevention only: Text becomes hidden below keyboard
- Modal overlay for editing: Disrupts medical workflow continuity

## Mobile Touch Target Optimization

### Decision: 44px Minimum Touch Targets with Safe Areas
**Rationale**: Apple Human Interface Guidelines specify 44pt minimum (44px at 1x) for reliable touch interaction. Medical professionals often use gloves, requiring larger targets.

**Alternatives considered**:
- 48dp Android standard: Less suitable for iOS-heavy medical market
- 32px targets with larger padding: Creates inconsistent visual hierarchy
- Context-dependent sizing: Adds complexity without UX benefit

### Decision: CSS Backdrop-filter for Header Persistence
**Rationale**: Maintains header visibility during scroll with visual hierarchy, while `position: sticky` ensures it remains accessible during keyboard interactions.

**Alternatives considered**:
- Fixed positioning: Can interfere with iOS Safari UI
- JavaScript scroll listeners: Performance overhead during typing
- Header hiding patterns: Reduces navigation accessibility

## Performance Optimization Strategies

### Decision: RequestAnimationFrame + CSS Transitions
**Rationale**: RAF ensures layout changes occur during optimal browser paint cycles, while CSS transitions provide hardware-accelerated animations within the 16ms budget.

**Alternatives considered**:
- SetTimeout based timing: Unreliable frame alignment
- Immediate DOM updates: Causes janky visual transitions  
- Web Animations API: Overkill for simple layout transitions

### Decision: Passive Event Listeners + Debouncing
**Rationale**: Passive listeners prevent blocking scroll performance, while 16ms debouncing matches 60fps refresh rate for smooth visual updates.

**Alternatives considered**:
- Active event listeners: Can block scrolling on mobile
- No debouncing: Excessive function calls during rapid input
- Longer debounce delays: Visible lag in layout updates

## Cross-Device Compatibility

### Decision: Progressive Enhancement from iOS Safari
**Rationale**: iOS Safari has the most restrictive mobile browser behavior. Features that work on iOS Safari typically work across all mobile browsers.

**Alternatives considered**:
- Chrome Mobile first: Missing iOS-specific edge cases
- Feature detection branching: Adds maintenance complexity
- Lowest common denominator: Misses performance opportunities

### Decision: CSS Environment Variables for Safe Areas
**Rationale**: `env(safe-area-inset-*)` provides native safe area support for notched devices, ensuring touch targets remain accessible.

**Alternatives considered**:
- Fixed padding values: Breaks on diverse device designs
- JavaScript device detection: Requires constant device database updates
- Viewport-relative units only: Ignores hardware design variations

## Medical Workflow Integration Requirements

### Decision: Non-blocking Layout Transitions
**Rationale**: Medical transcription cannot be interrupted by UI adjustments. All layout changes must occur without affecting text input or recording functionality.

**Alternatives considered**:
- Modal editing states: Disrupts continuous recording workflow
- Temporary UI disabling: Breaks critical medical documentation flow
- Background processing pauses: Unacceptable for patient care scenarios

### Decision: Preserve Session State During Layout Changes
**Rationale**: Medical sessions contain critical patient information that must remain intact regardless of UI state changes or device orientation.

**Alternatives considered**:
- Reset on layout change: Data loss risk unacceptable in medical context
- Temporary session suspension: Interrupts patient consultation flow
- Manual save prompts: Adds cognitive load during patient care

## Implementation Dependencies

### Current Codebase Integration
- **useViewportHeight hook**: Already provides CSS custom properties infrastructure
- **Medical Design System**: Touch target standards already established  
- **Session Management**: Robust state preservation already implemented
- **Performance Monitoring**: Existing 200ms recording start requirement sets performance baseline

### Required Enhancements
- Textarea auto-resize behavior optimization
- Footer control dynamic positioning refinement  
- Header sticky positioning with backdrop filtering
- Cross-component layout coordination improvements