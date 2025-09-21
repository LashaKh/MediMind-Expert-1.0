/**
 * Textarea Focus Management API Contract
 * Frontend interface for text editing state and keyboard interaction
 */

export interface TextareaFocusState {
  isFocused: boolean;
  cursorPosition: number;
  scrollTop: number;
  textareaHeight: number;
  content: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface TextareaMetrics {
  lineHeight: number;
  totalLines: number;
  visibleLines: number;
  scrollHeight: number;
  clientHeight: number;
}

export interface KeyboardAwareTextareaEvent {
  type: 'focus' | 'blur' | 'content-change' | 'cursor-move' | 'resize';
  timestamp: number;
  focusState: TextareaFocusState;
  metrics: TextareaMetrics;
}

/**
 * Keyboard-Aware Textarea Hook Contract
 */
export interface UseKeyboardAwareTextareaHook {
  // State
  focusState: TextareaFocusState;
  metrics: TextareaMetrics;
  isAutoResizing: boolean;
  
  // Refs for DOM interaction
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  
  // Actions
  focus: () => void;
  blur: () => void;
  updateContent: (content: string) => void;
  setCursorPosition: (position: number) => void;
  scrollToCursor: () => void;
  
  // Event handlers
  onFocusChange: (callback: (isFocused: boolean) => void) => () => void;
  onContentChange: (callback: (content: string) => void) => () => void;
  onCursorMove: (callback: (position: number) => void) => () => void;
}

/**
 * Auto-resize Configuration Contract
 */
export interface TextareaAutoResizeConfig {
  minHeight: number;              // minimum height in pixels (44px minimum)
  maxHeight: number;              // maximum height before scrolling
  keyboardOffset: number;         // space to maintain above keyboard
  transitionDuration: number;     // resize animation duration (max 100ms)
}

/**
 * CSS Properties for Textarea Behavior
 */
export interface TextareaCSSProperties {
  '--textarea-height': string;        // calculated height
  '--textarea-min-height': string;    // minimum height (44px)
  '--textarea-max-height': string;    // maximum before scroll
  '--keyboard-offset': string;        // space above keyboard
  '--cursor-line': string;            // current cursor line number
}

/**
 * Scroll Behavior Management Contract
 */
export interface TextareaScrollManager {
  preventBrowserScroll: boolean;
  maintainCursorVisibility: boolean;
  scrollToPosition: (position: number) => void;
  ensureCursorVisible: () => void;
  getVisibleRange: () => { start: number; end: number };
}

/**
 * Integration with Existing Session Management
 */
export interface TextareaSessionIntegration {
  sessionId: string;
  onContentPersist: (content: string) => Promise<void>;
  onSessionChange: (sessionId: string) => void;
  preserveStateOnUnmount: boolean;
}