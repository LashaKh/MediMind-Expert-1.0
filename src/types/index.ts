/**
 * Centralized TypeScript Type Exports
 * Main types index for MediMind Expert application
 */

// Core application types
export * from './abg'
export * from './api-responses'
export * from './case-management'
export * from './chat'
export * from './i18n'
export * from './markdown-viewer'
export * from './medicalNews'
export * from './medivoice'
export * from './obgyn-calculators'
export * from './openai-vector-store'
export * from './podcast'
export * from './podcast-script'
export * from './supabase'
export * from './translation-patterns'

// Mobile-specific types (NEW)
export * from './mobile'

// Report editing types (NEW)
export * from './reportEditing'

// Re-export commonly used mobile types for convenience
export type {
  MobileViewportState,
  TextareaFocusState,
  LayoutContainerState,
  UseMobileViewportReturn,
  UseKeyboardAwareTextareaReturn,
  UseLayoutContainerReturn,
  MobilePerformanceMetrics,
  MedicalMobileSafetyRequirements,
  GeorgianMobileTranscriptionState
} from './mobile'