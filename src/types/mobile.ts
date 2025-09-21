/**
 * Mobile-Specific TypeScript Types for MediScribe Optimization
 * Supporting mobile-first transcription interface with keyboard-aware behavior
 */

// Mobile viewport configuration types
export interface MobileViewportConfig {
  readonly width: number
  readonly height: number
  readonly orientation: 'portrait' | 'landscape'
  readonly devicePixelRatio: number
}

// Standard mobile viewport presets
export const MOBILE_VIEWPORTS = {
  iphone_se: { width: 375, height: 667 },
  iphone_12: { width: 390, height: 844 },
  iphone_14_pro: { width: 393, height: 852 },
  android_small: { width: 360, height: 640 },
  android_medium: { width: 412, height: 869 },
  tablet: { width: 768, height: 1024 }
} as const

export type MobileViewportName = keyof typeof MOBILE_VIEWPORTS

// Visual Viewport API types (Enhanced)
export interface VisualViewportAPI {
  readonly width: number
  readonly height: number
  readonly offsetLeft: number
  readonly offsetTop: number
  readonly pageLeft: number
  readonly pageTop: number
  readonly scale: number
  addEventListener(type: 'resize' | 'scroll', listener: EventListener): void
  removeEventListener(type: 'resize' | 'scroll', listener: EventListener): void
  dispatchEvent(event: Event): boolean
}

// Mobile viewport state management
export interface MobileViewportState {
  readonly viewport: MobileViewportConfig
  readonly visualViewport: VisualViewportAPI | null
  readonly isKeyboardVisible: boolean
  readonly keyboardHeight: number
  readonly safeAreaInsets: SafeAreaInsets
  readonly orientation: 'portrait' | 'landscape'
  readonly isReducedViewport: boolean
}

// Safe area insets for modern mobile devices
export interface SafeAreaInsets {
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly left: number
}

// Keyboard-aware textarea state
export interface TextareaFocusState {
  readonly isFocused: boolean
  readonly element: HTMLTextAreaElement | null
  readonly selectionStart: number
  readonly selectionEnd: number
  readonly scrollTop: number
  readonly keyboardVisible: boolean
  readonly originalViewportHeight: number
  readonly adjustedViewportHeight: number
}

// Layout container state for dynamic positioning
export interface LayoutContainerState {
  readonly headerHeight: number
  readonly footerHeight: number
  readonly contentHeight: number
  readonly availableHeight: number
  readonly isHeaderFixed: boolean
  readonly isFooterFixed: boolean
  readonly scrollPosition: number
  readonly keyboardAdjustment: number
}

// Mobile touch interaction types
export interface TouchTargetMetrics {
  readonly width: number
  readonly height: number
  readonly isAccessible: boolean
  readonly meetsMinimumSize: boolean // 44px Apple guideline
}

// Performance monitoring for mobile optimizations
export interface MobilePerformanceMetrics {
  readonly layoutTransitionDuration: number // Target: <100ms
  readonly inputLatency: number // Target: <50ms
  readonly animationFrameRate: number // Target: 60fps
  readonly keyboardShowDelay: number
  readonly keyboardHideDelay: number
}

// Mobile viewport hooks return types
export interface UseMobileViewportReturn {
  readonly viewportState: MobileViewportState
  readonly isKeyboardVisible: boolean
  readonly keyboardHeight: number
  readonly safeAreaInsets: SafeAreaInsets
  readonly updateViewport: (config: Partial<MobileViewportConfig>) => void
  readonly resetViewport: () => void
}

// Keyboard-aware textarea hooks return types
export interface UseKeyboardAwareTextareaReturn {
  readonly textareaRef: React.RefObject<HTMLTextAreaElement>
  readonly focusState: TextareaFocusState
  readonly containerStyle: React.CSSProperties
  readonly isKeyboardAdjusted: boolean
  readonly adjustForKeyboard: () => void
  readonly resetLayout: () => void
  readonly measurePerformance: () => MobilePerformanceMetrics
}

// Layout container hooks return types
export interface UseLayoutContainerReturn {
  readonly containerRef: React.RefObject<HTMLDivElement>
  readonly layoutState: LayoutContainerState
  readonly dynamicStyles: React.CSSProperties
  readonly updateLayout: () => void
  readonly optimizeForKeyboard: (keyboardHeight: number) => void
  readonly restoreLayout: () => void
}

// Mobile event handlers
export interface MobileEventHandlers {
  readonly onViewportChange: (state: MobileViewportState) => void
  readonly onKeyboardShow: (height: number) => void
  readonly onKeyboardHide: () => void
  readonly onOrientationChange: (orientation: 'portrait' | 'landscape') => void
  readonly onTextareaFocus: (element: HTMLTextAreaElement) => void
  readonly onTextareaBlur: () => void
}

// CSS custom properties for mobile optimization
export interface MobileCSSProperties {
  readonly '--mobile-vh': string
  readonly '--keyboard-height': string
  readonly '--safe-area-top': string
  readonly '--safe-area-bottom': string
  readonly '--safe-area-left': string
  readonly '--safe-area-right': string
  readonly '--content-height': string
  readonly '--header-height': string
  readonly '--footer-height': string
}

// Mobile testing utilities
export interface MobileTestingUtils {
  readonly simulateViewportChange: (viewport: MobileViewportName) => void
  readonly simulateKeyboard: (visible: boolean, height?: number) => void
  readonly measurePerformance: (fn: () => Promise<void> | void) => Promise<number>
  readonly checkTouchTargetSize: (element: HTMLElement) => TouchTargetMetrics
  readonly validateAccessibility: (element: HTMLElement) => AccessibilityMetrics
}

// Accessibility metrics for mobile interfaces
export interface AccessibilityMetrics {
  readonly hasAriaLabel: boolean
  readonly hasTabIndex: boolean
  readonly hasRole: boolean
  readonly hasKeyboardHandler: boolean
  readonly touchTargetSize: TouchTargetMetrics
  readonly contrastRatio: number
  readonly screenReaderCompatible: boolean
}

// Medical safety requirements for mobile interface
export interface MedicalMobileSafetyRequirements {
  readonly minTouchTargetSize: 44 // Apple guidelines for medical use
  readonly maxLayoutTransition: 100 // milliseconds
  readonly maxInputLatency: 50 // milliseconds
  readonly minAnimationFps: 60
  readonly accessibilityCompliance: 'WCAG 2.1 AA'
  readonly medicalWorkflowPreservation: boolean
}

// Georgian transcription mobile-specific types
export interface GeorgianMobileTranscriptionState {
  readonly isRecording: boolean
  readonly isMobileOptimized: boolean
  readonly keyboardAware: boolean
  readonly touchOptimized: boolean
  readonly recordingButtonSize: TouchTargetMetrics
  readonly transcriptAreaHeight: number
  readonly mobileSessionId: string
}

// Mobile browser compatibility matrix
export interface MobileBrowserSupport {
  readonly ios_safari: boolean
  readonly chrome_mobile: boolean
  readonly samsung_internet: boolean
  readonly firefox_mobile: boolean
  readonly edge_mobile: boolean
  readonly features: {
    readonly visualViewportAPI: boolean
    readonly resizeObserver: boolean
    readonly intersectionObserver: boolean
    readonly cssCustomProperties: boolean
    readonly touchEvents: boolean
  }
}

// Export utility type for mobile optimization props
export type MobileOptimizationProps = {
  readonly mobileViewport?: MobileViewportConfig
  readonly keyboardAware?: boolean
  readonly touchOptimized?: boolean
  readonly performanceMonitoring?: boolean
  readonly accessibilityCompliant?: boolean
  readonly medicalSafetyMode?: boolean
}