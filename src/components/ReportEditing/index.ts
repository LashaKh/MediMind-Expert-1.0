/**
 * ReportEditing Component Exports
 * MediScribe Interactive Report Editing Components
 */

// Core editing components
export { default as ReportEditCard } from './ReportEditCard'
export { default as EditInstructionInput } from './EditInstructionInput'
export { default as ReportTextEditor } from './ReportTextEditor'
export { default as EditHistoryPanel } from './EditHistoryPanel'
export { default as VoiceInstructionButton } from './VoiceInstructionButton'

// Component prop types
export type {
  ReportEditCardProps,
  EditInstructionInputProps,
  ReportTextEditorProps,
  EditHistoryPanelProps,
  VoiceInstructionButtonProps
} from '../../types/reportEditing'