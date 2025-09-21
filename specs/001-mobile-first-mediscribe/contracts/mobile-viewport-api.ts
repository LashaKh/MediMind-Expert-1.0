/**
 * Mobile Viewport API Contract
 * Frontend interface for mobile viewport and keyboard state management
 */

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface MobileViewportState {
  windowHeight: number;
  viewportHeight: number;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  orientation: 'portrait' | 'landscape';
  safeAreaInsets: SafeAreaInsets;
}

export interface ViewportUpdateEvent {
  type: 'resize' | 'keyboard-open' | 'keyboard-close' | 'orientation-change';
  timestamp: number;
  previous: MobileViewportState;
  current: MobileViewportState;
}

/**
 * Mobile Viewport Management Hook Contract
 */
export interface UseMobileViewportHook {
  // State
  viewportState: MobileViewportState;
  isTransitioning: boolean;
  
  // Actions
  updateViewport: () => void;
  resetViewport: () => void;
  
  // Event handlers
  onViewportChange: (callback: (event: ViewportUpdateEvent) => void) => () => void;
  onKeyboardStateChange: (callback: (isOpen: boolean, height: number) => void) => () => void;
}

/**
 * CSS Custom Properties Set by Hook
 */
export interface ViewportCSSProperties {
  '--window-height': string;      // e.g., "844px"
  '--viewport-height': string;    // e.g., "550px" 
  '--keyboard-height': string;    // e.g., "294px"
  '--safe-area-top': string;      // e.g., "44px"
  '--safe-area-bottom': string;   // e.g., "34px"
}

/**
 * Validation Contract
 */
export interface ViewportStateValidator {
  isValidHeight: (height: number) => boolean;
  isKeyboardDetected: (heightDiff: number) => boolean;
  isSafeAreaValid: (insets: SafeAreaInsets) => boolean;
}

/**
 * Performance Monitoring Contract
 */
export interface ViewportPerformanceMetrics {
  updateLatency: number;          // milliseconds
  transitionDuration: number;     // milliseconds
  eventFrequency: number;         // updates per second
  memoryUsage: number;           // bytes
}