import { WorkflowStep } from '../../../types/abg';

export interface StepRendererProps {
  workflow: any;
  isProcessing: boolean;
  error?: string;
}

export interface WorkflowStepRenderer {
  canRender: (step: WorkflowStep) => boolean;
  render: (props: StepRendererProps) => React.ReactNode;
}

export interface WorkflowNavigationProps {
  currentStep: WorkflowStep;
  canProceed: boolean;
  onGoToStep: (step: WorkflowStep) => void;
  onNavigateBack: () => void;
}