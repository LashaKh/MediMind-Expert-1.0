/**
 * Mobile Testing Infrastructure Setup
 * Configures testing environment for mobile-first MediScribe optimization
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mobile viewport configurations for testing
export const MOBILE_VIEWPORTS = {
  iphone_se: { width: 375, height: 667 },
  iphone_12: { width: 390, height: 844 },
  iphone_14_pro: { width: 393, height: 852 },
  android_small: { width: 360, height: 640 },
  android_medium: { width: 412, height: 869 },
  tablet: { width: 768, height: 1024 }
} as const

// Touch target minimum sizes (Apple guidelines)
export const TOUCH_TARGET_MIN_SIZE = 44

// Performance thresholds for mobile optimization
export const PERFORMANCE_THRESHOLDS = {
  layoutTransition: 100, // ms
  inputLatency: 50, // ms
  animationFps: 60
} as const

// Medical safety requirements for mobile interface
export const MEDICAL_SAFETY_REQUIREMENTS = {
  minTouchTarget: TOUCH_TARGET_MIN_SIZE,
  maxLayoutTransition: PERFORMANCE_THRESHOLDS.layoutTransition,
  maxInputLatency: PERFORMANCE_THRESHOLDS.inputLatency,
  accessibilityCompliance: 'WCAG 2.1 AA'
} as const

// Mock Visual Viewport API for testing
export const mockVisualViewport = {
  width: 375,
  height: 667,
  offsetLeft: 0,
  offsetTop: 0,
  pageLeft: 0,
  pageTop: 0,
  scale: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}

// Setup mobile testing environment
beforeAll(() => {
  // Mock Visual Viewport API
  Object.defineProperty(window, 'visualViewport', {
    value: mockVisualViewport,
    writable: true
  })

  // Mock touch events
  Object.defineProperty(window, 'ontouchstart', {
    value: {},
    writable: true
  })

  // Mock device pixel ratio
  Object.defineProperty(window, 'devicePixelRatio', {
    value: 2,
    writable: true
  })

  // Mock CSS.supports for modern CSS features
  if (!window.CSS || !window.CSS.supports) {
    window.CSS = {
      supports: vi.fn().mockReturnValue(true)
    } as any
  }
})

// Clean up after each test
afterEach(() => {
  cleanup()
  // Reset viewport mock to default
  Object.assign(mockVisualViewport, {
    width: 375,
    height: 667,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1
  })
})

// Utility function to simulate viewport changes
export const simulateViewportChange = (viewport: keyof typeof MOBILE_VIEWPORTS) => {
  const config = MOBILE_VIEWPORTS[viewport]
  Object.assign(mockVisualViewport, config)
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'))
  
  // Trigger visual viewport change event
  if (mockVisualViewport.addEventListener.mock.calls.length > 0) {
    const callbacks = mockVisualViewport.addEventListener.mock.calls
      .filter(call => call[0] === 'resize')
      .map(call => call[1])
    
    callbacks.forEach(callback => callback(new Event('resize')))
  }
}

// Utility function to simulate keyboard showing/hiding
export const simulateKeyboard = (visible: boolean, height: number = 300) => {
  const newHeight = visible ? mockVisualViewport.height - height : mockVisualViewport.height + height
  
  Object.assign(mockVisualViewport, {
    height: Math.max(newHeight, 200) // Minimum height
  })
  
  // Trigger visual viewport change
  if (mockVisualViewport.addEventListener.mock.calls.length > 0) {
    const callbacks = mockVisualViewport.addEventListener.mock.calls
      .filter(call => call[0] === 'resize')
      .map(call => call[1])
    
    callbacks.forEach(callback => callback(new Event('resize')))
  }
}

// Utility to measure performance
export const measurePerformance = async (fn: () => Promise<void> | void): Promise<number> => {
  const start = performance.now()
  await fn()
  const end = performance.now()
  return end - start
}

// Utility to check touch target size
export const checkTouchTargetSize = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()
  return rect.width >= TOUCH_TARGET_MIN_SIZE && rect.height >= TOUCH_TARGET_MIN_SIZE
}

// Utility to check if element is accessible
export const checkAccessibility = (element: HTMLElement): { 
  hasAriaLabel: boolean
  hasTabIndex: boolean
  hasRole: boolean
  hasKeyboardHandler: boolean
} => {
  return {
    hasAriaLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
    hasTabIndex: element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1',
    hasRole: element.hasAttribute('role'),
    hasKeyboardHandler: element.hasAttribute('onkeydown') || element.hasAttribute('onkeyup')
  }
}