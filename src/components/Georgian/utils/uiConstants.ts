// UI constants and configuration for Georgian MediScribe components

import { FileText, User, Brain } from 'lucide-react';

// Tab definitions for the transcript panel
export const TRANSCRIPT_TABS = [
  { id: 'transcript' as const, label: 'Transcript', icon: FileText },
  { id: 'context' as const, label: 'Context', icon: User },
  { id: 'ai' as const, label: 'AI Processing', icon: Brain }
] as const;

export type TabId = typeof TRANSCRIPT_TABS[number]['id'];

// Sample AI processing instructions for medical transcription
export const SAMPLE_INSTRUCTIONS = [
  'Summarize this medical consultation in English',
  'Extract patient symptoms and complaints',
  'List all mentioned medications and dosages',
  'Identify medical procedures discussed',
  'Translate key medical terms to English',
  'Create a problem list from this consultation',
  'Extract vital signs and measurements',
  'Identify follow-up recommendations',
  'Extract diagnostic information and test results',
  'Summarize treatment plan and prescriptions'
] as const;

// Audio level visualization configuration
export const AUDIO_LEVEL_BARS = [1, 2, 3, 4, 5] as const;

// Animation delays for processing indicators
export const PROCESSING_ANIMATION_DELAYS = [150, 300, 450] as const;

// File size limits and formats
export const FILE_UPLOAD_CONFIG = {
  maxSizeBytes: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'audio/m4a'
  ],
  allowedExtensions: ['.mp3', '.wav', '.webm', '.m4a'],
  contextFileTypes: [
    '.pdf', '.doc', '.docx', '.txt', 
    '.jpg', '.jpeg', '.png', 
    '.mp3', '.wav'
  ]
} as const;

// Recording configuration constants
export const RECORDING_CONFIG = {
  chunkDuration: 12000, // 12 seconds for main transcript
  contextChunkDuration: 5000, // 5 seconds for context recording
  maxContextDuration: 120000, // 2 minutes max for context
  qualityIndicatorThreshold: 50, // Audio level threshold for "HD Quality"
  nearMaxDurationThreshold: 0.9 // 90% of max duration
} as const;

// Status indicator colors and states
export const STATUS_COLORS = {
  success: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  error: {
    bg: 'bg-red-500',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  warning: {
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  info: {
    bg: 'bg-blue-500',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  processing: {
    bg: 'bg-purple-500',
    text: 'text-purple-700',
    border: 'border-purple-200'
  }
} as const;

// Medical design system tokens
export const MEDICAL_DESIGN_TOKENS = {
  touchTargets: {
    minimum: 44, // px - Apple accessibility guidelines
    large: 80,   // px - for floating action buttons
    comfortable: 56 // px - comfortable tap targets
  },
  borderRadius: {
    small: 8,    // px
    medium: 16,  // px
    large: 24,   // px
    extraLarge: 32 // px
  },
  shadows: {
    medical: 'shadow-lg shadow-slate-500/10',
    premium: 'shadow-2xl shadow-slate-500/20',
    floating: 'shadow-2xl shadow-blue-500/25'
  },
  animations: {
    fast: 200,     // ms
    normal: 300,   // ms
    slow: 500,     // ms
    gentle: 700    // ms
  }
} as const;

// Responsive breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: 640,   // px
  md: 768,   // px
  lg: 1024,  // px
  xl: 1280,  // px
  '2xl': 1536 // px
} as const;

// Georgian medical transcription specific constants
export const GEORGIAN_MEDICAL_CONFIG = {
  language: 'ka-GE',
  supportedDialects: ['ka-GE'] as const,
  medicalTermsSupport: true,
  punctuationSupport: true,
  numberRecognition: true,
  autoCorrection: true
} as const;