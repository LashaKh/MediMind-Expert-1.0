/**
 * Dynamic Layout Container API Contract
 * Frontend interface for responsive layout management during keyboard interactions
 */

export interface LayoutContainerState {
  headerHeight: number;
  footerHeight: number;
  contentAreaHeight: number;
  footerOffset: number;
  isTransitioning: boolean;
  transitionDuration: number;
}

export interface LayoutDimensions {
  header: { height: number; position: 'fixed' | 'sticky' };
  content: { height: number; paddingTop: number; paddingBottom: number };
  footer: { height: number; translateY: number; position: 'fixed' | 'absolute' };
}

export interface LayoutTransitionEvent {
  type: 'layout-start' | 'layout-complete' | 'layout-error';
  timestamp: number;
  duration: number;
  previous: LayoutDimensions;
  current: LayoutDimensions;
}

/**
 * Dynamic Layout Hook Contract
 */
export interface UseDynamicLayoutHook {
  // State
  layoutState: LayoutContainerState;
  dimensions: LayoutDimensions;
  isKeyboardAware: boolean;
  
  // Actions
  adjustForKeyboard: (keyboardHeight: number) => void;
  resetLayout: () => void;
  setHeaderHeight: (height: number) => void;
  setFooterHeight: (height: number) => void;
  
  // Event handlers
  onLayoutChange: (callback: (event: LayoutTransitionEvent) => void) => () => void;
  onTransitionComplete: (callback: () => void) => () => void;
}

/**
 * CSS Custom Properties for Layout Management
 */
export interface LayoutCSSProperties {
  '--header-height': string;          // fixed header height
  '--footer-height': string;          // footer controls height  
  '--content-height': string;         // available content area
  '--footer-offset': string;          // dynamic footer positioning
  '--transition-duration': string;    // layout transition timing
  '--layout-state': string;           // current layout state
}

/**
 * Header Behavior Configuration
 */
export interface HeaderBehaviorConfig {
  position: 'fixed' | 'sticky';
  backdropFilter: boolean;
  zIndex: number;
  preventViewportShift: boolean;
  maintainAccessibility: boolean;
}

/**
 * Footer Controls Configuration
 */
export interface FooterControlsConfig {
  keyboardAware: boolean;             // moves above keyboard
  minDistanceFromKeyboard: number;    // minimum space (44px)
  animatePositioning: boolean;        // smooth transitions
  maintainTouchTargets: boolean;      // ensure 44px targets
  preserveFunctionality: boolean;     // no feature disruption
}

/**
 * Layout Performance Metrics
 */
export interface LayoutPerformanceMetrics {
  transitionLatency: number;          // time to start transition
  transitionDuration: number;         // total transition time
  frameDrops: number;                 // missed 60fps frames
  reflowCount: number;                // layout recalculations
  repaintCount: number;               // visual repaints
}

/**
 * Responsive Breakpoint Integration
 */
export interface ResponsiveLayoutConfig {
  mobileBreakpoint: number;           // max width for mobile (768px)
  touchTargetSize: number;            // minimum touch target (44px)
  safeAreaHandling: boolean;          // handle device safe areas
  orientationAware: boolean;          // adjust for rotation
}

/**
 * Layout Container Component Props Contract
 */
export interface LayoutContainerProps {
  children: React.ReactNode;
  config: {
    header: HeaderBehaviorConfig;
    footer: FooterControlsConfig;
    responsive: ResponsiveLayoutConfig;
  };
  onLayoutChange?: (event: LayoutTransitionEvent) => void;
  className?: string;
}