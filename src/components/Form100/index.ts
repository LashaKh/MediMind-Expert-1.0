// Form 100 Generation Feature - Component Exports
// Emergency consultation report generation with AI assistance
// Medical-grade validation and HIPAA-compliant workflow

// Main Components
export { default as Form100Button } from './Form100Button';
export { default as Form100Modal } from './Form100Modal';
export { default as DiagnosisDropdown } from './DiagnosisDropdown';
export { default as VoiceTranscriptField } from './VoiceTranscriptField';
export { default as AngiographyReportField } from './AngiographyReportField';

// Hooks
export { default as useForm100Generation } from './hooks/useForm100Generation';
export { default as useForm100Modal } from './hooks/useForm100Modal';
export { default as useDiagnosisSelection } from './hooks/useDiagnosisSelection';

// Services
export { form100Service } from '../../../services/form100Service';
export { flowiseIntegration } from '../../../services/flowiseIntegration';

// Configuration
export { diagnosisConfig } from './config/diagnosisConfig';

// Utilities
export { validateForm100Request } from './utils/validation';

// Types (re-exported for convenience)
export type {
  Form100Request,
  Form100Response,
  DiagnosisCode,
  DiagnosisCategory,
  PatientInfo,
  Form100ModalProps,
  VoiceTranscriptFieldProps,
  AngiographyReportFieldProps,
  DiagnosisDropdownProps
} from '../../types/form100';

// Loading Components
export { default as LoadingStates } from './components/LoadingStates';

// Styles
import './styles/mobile.css';