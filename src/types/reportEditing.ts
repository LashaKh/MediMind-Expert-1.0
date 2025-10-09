// Report Editing Types for MediScribe Interactive Report Editing
// Based on data model specification from specs/002-on-my-generated/data-model.md

/**
 * Supported edit operation types
 */
export type EditType = 'text_instruction' | 'voice_instruction' | 'manual_edit'

/**
 * Edit session status
 */
export type EditSessionStatus = 'active' | 'completed' | 'cancelled'

/**
 * Core entity: Individual edit operations on medical reports
 */
export interface ReportEdit {
  id: string
  report_id: string
  user_id: string
  session_id: string
  edit_type: EditType
  instruction_text?: string
  voice_transcript?: string
  original_content: string
  updated_content: string
  processing_metadata: ProcessingMetadata
  created_at: string
  processed_at?: string
}

/**
 * Core entity: Report version history
 */
export interface ReportVersion {
  id: string
  report_id: string
  user_id: string
  version_number: number
  content: string
  edit_summary?: string
  is_current: boolean
  created_by_edit_id?: string
  created_at: string
}

/**
 * Core entity: Edit session tracking
 */
export interface EditSession {
  id: string
  report_id: string
  user_id: string
  session_id: string
  status: EditSessionStatus
  total_edits: number
  started_at: string
  completed_at?: string
}

/**
 * Processing metadata for AI operations
 */
export interface ProcessingMetadata {
  tokens_used?: number
  model?: string
  processing_time?: number
  flowise_endpoint?: string
  original_instruction?: string
  voice_transcript?: string
  error_details?: string
  retry_count?: number
}

/**
 * Request/Response Types for API Operations
 */

// Edit Session Operations
export interface CreateEditSessionRequest {
  report_id: string
  session_id: string
}

export interface UpdateEditSessionRequest {
  status: Exclude<EditSessionStatus, 'active'>
}

// Report Edit Operations
export interface CreateReportEditRequest {
  report_id: string
  session_id: string
  edit_type: EditType
  instruction_text?: string
  voice_transcript?: string
  original_content: string
}

export interface UpdateReportEditRequest {
  updated_content: string
  processing_metadata: ProcessingMetadata
  processed_at: string
}

// Report Version Operations
export interface CreateReportVersionRequest {
  report_id: string
  content: string
  edit_summary: string
  created_by_edit_id: string
}

// AI Processing Operations
export interface ProcessEditInstructionRequest {
  edit_id: string
  instruction_text: string
  original_content: string
  flowise_endpoint: string
  voice_transcript?: string
}

export interface ProcessEditInstructionResponse {
  updated_content: string
  processing_metadata: ProcessingMetadata
  success: boolean
  error?: string
}

// Voice Processing Operations
export interface TranscribeVoiceInstructionRequest {
  theAudioDataAsBase64: string
  Language: string
  Autocorrect: boolean
  Punctuation: boolean
  Digits: boolean
}

export interface TranscribeVoiceInstructionResponse {
  text: string
  confidence?: number
  language?: string
}

/**
 * Component Props and State Types
 */

// Report metadata for unified formatting
export interface ReportMetadata {
  cardTitle: string
  reportType: string
  diagnosisCode?: string
  diagnosisName?: string
  originalSessionId?: string
}

// ReportEditCard component props
export interface ReportEditCardProps {
  reportId: string
  initialContent: string
  sessionId: string
  flowiseEndpoint?: string
  onEditComplete: (result: any) => void
  onError: (error: Error) => void
  className?: string
  reportMetadata?: ReportMetadata
}

// Edit Instruction Input component props
export interface EditInstructionInputProps {
  onTextInstruction: (instruction: string) => void
  onVoiceInstruction: (transcript: string, audioData: string) => void
  disabled?: boolean
  placeholder?: string
}

// Voice Instruction Button component props
export interface VoiceInstructionButtonProps {
  onTranscription: (transcript: string, audioData: string) => void
  disabled?: boolean
  language?: string
  className?: string
}

// Report Text Editor component props
export interface ReportTextEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  maxLength?: number
}

// Edit History Panel component props
export interface EditHistoryPanelProps {
  reportId: string
  currentVersion?: ReportVersion
  onVersionSelect?: (version: ReportVersion) => void
}

/**
 * Hook Types and State Management
 */

// useReportEditing hook return type
export interface UseReportEditingReturn {
  currentContent: string
  editHistory: ReportEdit[]
  versionHistory: ReportVersion[]
  activeSession: EditSession | null
  isProcessing: boolean
  error: string | null
  
  // Actions
  startEditSession: () => Promise<EditSession>
  submitTextInstruction: (instruction: string) => Promise<void>
  submitVoiceInstruction: (transcript: string, audioData: string) => Promise<void>
  applyManualEdit: (newContent: string, summary: string) => Promise<void>
  completeSession: () => Promise<void>
  cancelSession: () => Promise<void>
  loadVersion: (versionId: string) => Promise<void>
  clearError: () => void
}

// useEditSession hook return type
export interface UseEditSessionReturn {
  session: EditSession | null
  isLoading: boolean
  error: string | null
  
  // Actions
  createSession: (reportId: string) => Promise<EditSession>
  updateSession: (sessionId: string, updates: Partial<EditSession>) => Promise<void>
  completeSession: (sessionId: string) => Promise<void>
  cancelSession: (sessionId: string) => Promise<void>
}

// useVersionHistory hook return type
export interface UseVersionHistoryReturn {
  versions: ReportVersion[]
  currentVersion: ReportVersion | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadVersions: (reportId: string) => Promise<void>
  createVersion: (request: CreateReportVersionRequest) => Promise<ReportVersion>
  setCurrentVersion: (versionId: string) => Promise<void>
}

// useAIEditProcessing hook return type
export interface UseAIEditProcessingReturn {
  isProcessing: boolean
  processingProgress: number
  error: string | null
  
  // Actions
  processInstruction: (request: ProcessEditInstructionRequest) => Promise<ProcessEditInstructionResponse>
  transcribeVoice: (request: TranscribeVoiceInstructionRequest) => Promise<TranscribeVoiceInstructionResponse>
  cancelProcessing: () => void
}

/**
 * Error Types
 */

export interface ReportEditingError {
  code: string
  message: string
  details?: Record<string, any>
  recoverable: boolean
}

export interface ValidationError extends ReportEditingError {
  field: string
  value: any
}

/**
 * Configuration Types
 */

export interface ReportEditingConfig {
  maxContentLength: number
  maxInstructionLength: number
  maxVersionHistory: number
  autoSaveInterval: number
  defaultFlowiseEndpoint: string
  enableVoiceInstructions: boolean
  enableManualEditing: boolean
  sessionTimeoutMinutes: number
}

/**
 * Utility Types
 */

// For filtering and querying
export interface EditSessionFilters {
  status?: EditSessionStatus
  report_id?: string
  user_id?: string
  date_from?: string
  date_to?: string
}

export interface ReportEditFilters {
  report_id?: string
  session_id?: string
  edit_type?: EditType
  user_id?: string
  date_from?: string
  date_to?: string
}

export interface ReportVersionFilters {
  report_id: string
  current_only?: boolean
  version_range?: {
    from: number
    to: number
  }
}

// For pagination
export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

/**
 * Medical Context Types
 */

export interface MedicalContext {
  specialty: 'cardiology' | 'obgyn'
  report_type: string
  patient_context?: {
    age_range?: string
    gender?: string
    conditions?: string[]
  }
  clinical_context?: {
    setting: 'emergency' | 'outpatient' | 'inpatient' | 'consultation'
    urgency: 'routine' | 'urgent' | 'emergent'
  }
}

/**
 * Integration Types
 */

// Integration with existing Georgian TTS system
export interface GeorgianTTSIntegration {
  session_id: string
  edit_session_id: string
  language: 'ka-GE'
  enable_diarization: boolean
}

// Integration with existing Flowise chat system
export interface FlowiseChatIntegration {
  chat_id: string
  session_context: string
  medical_context: MedicalContext
  edit_history: string[]
}

/**
 * Export all types for easy importing
 */
export type {
  // Re-export base types
  EditType,
  EditSessionStatus,
  
  // Core entities
  ReportEdit,
  ReportVersion,
  EditSession,
  ProcessingMetadata,
  
  // API types
  CreateEditSessionRequest,
  UpdateEditSessionRequest,
  CreateReportEditRequest,
  UpdateReportEditRequest,
  CreateReportVersionRequest,
  ProcessEditInstructionRequest,
  ProcessEditInstructionResponse,
  TranscribeVoiceInstructionRequest,
  TranscribeVoiceInstructionResponse,
  
  // Component types
  ReportEditCardProps,
  EditInstructionInputProps,
  VoiceInstructionButtonProps,
  ReportTextEditorProps,
  EditHistoryPanelProps,
  
  // Hook types
  UseReportEditingReturn,
  UseEditSessionReturn,
  UseVersionHistoryReturn,
  UseAIEditProcessingReturn,
  
  // Error and config types
  ReportEditingError,
  ValidationError,
  ReportEditingConfig,
  
  // Utility types
  EditSessionFilters,
  ReportEditFilters,
  ReportVersionFilters,
  PaginationParams,
  
  // Medical and integration types
  MedicalContext,
  GeorgianTTSIntegration,
  FlowiseChatIntegration
}