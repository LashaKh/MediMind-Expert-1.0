import { WorkflowStep } from '../../../types/abg';

/**
 * Service for handling workflow navigation logic
 */
export class NavigationService {
  private static readonly STEP_ORDER = [
    WorkflowStep.UPLOAD,
    WorkflowStep.ANALYSIS,
    WorkflowStep.INTERPRETATION,
    WorkflowStep.ACTION_PLAN,
    WorkflowStep.COMPLETED
  ];

  /**
   * Validates if navigation to target step is allowed
   */
  static canNavigateToStep(
    currentStep: WorkflowStep, 
    targetStep: WorkflowStep,
    canProceed: boolean
  ): boolean {
    const currentIndex = this.STEP_ORDER.indexOf(currentStep);
    const targetIndex = this.STEP_ORDER.indexOf(targetStep);
    
    // Can only go back or to completed steps, or to next step if can proceed
    return targetIndex <= currentIndex || 
           (targetIndex === currentIndex + 1 && canProceed);
  }

  /**
   * Gets the next step in the workflow
   */
  static getNextStep(currentStep: WorkflowStep): WorkflowStep | null {
    const currentIndex = this.STEP_ORDER.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex >= this.STEP_ORDER.length - 1) {
      return null;
    }
    return this.STEP_ORDER[currentIndex + 1];
  }

  /**
   * Gets the previous step in the workflow
   */
  static getPreviousStep(currentStep: WorkflowStep): WorkflowStep | null {
    const currentIndex = this.STEP_ORDER.indexOf(currentStep);
    if (currentIndex <= 0) {
      return null;
    }
    return this.STEP_ORDER[currentIndex - 1];
  }

  /**
   * Gets progress percentage for a given step
   */
  static getStepProgress(step: WorkflowStep): number {
    const stepProgressMap = {
      [WorkflowStep.UPLOAD]: 0,
      [WorkflowStep.ANALYSIS]: 25,
      [WorkflowStep.INTERPRETATION]: 50,
      [WorkflowStep.ACTION_PLAN]: 75,
      [WorkflowStep.COMPLETED]: 100
    };
    
    return stepProgressMap[step] || 0;
  }

  /**
   * Determines if a step should be shown as completed
   */
  static isStepCompleted(step: WorkflowStep, currentStep: WorkflowStep): boolean {
    const stepIndex = this.STEP_ORDER.indexOf(step);
    const currentIndex = this.STEP_ORDER.indexOf(currentStep);
    return stepIndex < currentIndex;
  }

  /**
   * Gets step display information
   */
  static getStepInfo(step: WorkflowStep): {
    title: string;
    description: string;
    icon: string;
  } {
    const stepInfoMap = {
      [WorkflowStep.UPLOAD]: {
        title: 'Upload',
        description: 'Upload blood gas report',
        icon: 'upload'
      },
      [WorkflowStep.ANALYSIS]: {
        title: 'Analysis',
        description: 'Extract text from image',
        icon: 'analyze'
      },
      [WorkflowStep.INTERPRETATION]: {
        title: 'Interpretation',
        description: 'Generate clinical analysis',
        icon: 'brain'
      },
      [WorkflowStep.ACTION_PLAN]: {
        title: 'Action Plan',
        description: 'Create treatment plan',
        icon: 'target'
      },
      [WorkflowStep.COMPLETED]: {
        title: 'Complete',
        description: 'Analysis finished',
        icon: 'check'
      }
    };

    return stepInfoMap[step] || {
      title: 'Unknown',
      description: 'Unknown step',
      icon: 'question'
    };
  }
}