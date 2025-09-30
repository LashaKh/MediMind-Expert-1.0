// useForm100Modal Hook
// Modal state management for Form 100 generation wizard
// Multi-step navigation with validation and persistence

import { useState, useCallback, useEffect } from 'react';
import { UseForm100ModalReturn, Form100Request } from '../../../types/form100';

// Wizard step configuration
interface WizardStep {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  requiredFields: (keyof Form100Request)[];
  isOptional?: boolean;
}

// Define wizard steps for Form 100 modal
const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    name: 'patient-info',
    title: 'Patient Information',
    subtitle: 'Basic demographics and medical history',
    requiredFields: ['userId'],
    isOptional: true
  },
  {
    id: 2,
    name: 'clinical-data',
    title: 'Clinical Data',
    subtitle: 'Diagnosis, symptoms, and vital signs',
    requiredFields: ['primaryDiagnosis', 'symptoms']
  },
  {
    id: 3,
    name: 'documentation',
    title: 'Voice & Reports',
    subtitle: 'Transcripts and additional documentation',
    requiredFields: [],
    isOptional: true
  },
  {
    id: 4,
    name: 'generation',
    title: 'Generate Form',
    subtitle: 'Review and generate Form 100',
    requiredFields: ['primaryDiagnosis']
  }
];

export const useForm100Modal = (
  initialData?: Partial<Form100Request>
): UseForm100ModalReturn => {
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
  const [modalData, setModalData] = useState<Partial<Form100Request>>(initialData || {});

  // Get current step configuration
  const getCurrentStep = useCallback(() => {
    return WIZARD_STEPS.find(step => step.id === currentStep) || WIZARD_STEPS[0];
  }, [currentStep]);

  // Validate step requirements
  const validateStep = useCallback((stepId: number, data: Partial<Form100Request>): boolean => {
    const step = WIZARD_STEPS.find(s => s.id === stepId);
    if (!step) return false;

    // Optional steps are always valid
    if (step.isOptional) return true;

    // Check required fields
    return step.requiredFields.every(field => {
      const value = data[field];
      
      // Handle different field types
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0;
      }
      
      return value !== undefined && value !== null && value !== '';
    });
  }, []);

  // Update step validation when data changes
  useEffect(() => {
    const newValidation: Record<number, boolean> = {};
    
    WIZARD_STEPS.forEach(step => {
      newValidation[step.id] = validateStep(step.id, modalData);
    });
    
    setStepValidation(newValidation);
  }, [modalData, validateStep]);

  // Open modal
  const openModal = useCallback((data?: Partial<Form100Request>) => {
    setIsOpen(true);
    setCurrentStep(1);
    setVisitedSteps(new Set([1]));
    
    if (data) {
      setModalData(data);
    } else if (initialData) {
      setModalData(initialData);
    }
  }, [initialData]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(1);
    setVisitedSteps(new Set([1]));
    
    // Reset to initial data on close
    if (initialData) {
      setModalData(initialData);
    }
  }, [initialData]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    const current = getCurrentStep();
    
    // Validate current step before proceeding
    if (!current.isOptional && !stepValidation[currentStep]) {
      return false;
    }
    
    if (currentStep < WIZARD_STEPS.length) {
      const nextStepId = currentStep + 1;
      setCurrentStep(nextStepId);
      setVisitedSteps(prev => new Set([...prev, nextStepId]));
      return true;
    }
    
    return false;
  }, [currentStep, stepValidation, getCurrentStep]);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      return true;
    }
    return false;
  }, [currentStep]);

  // Jump to specific step (if visited)
  const goToStep = useCallback((stepId: number) => {
    if (stepId >= 1 && stepId <= WIZARD_STEPS.length && visitedSteps.has(stepId)) {
      setCurrentStep(stepId);
      return true;
    }
    return false;
  }, [visitedSteps]);

  // Check if can proceed to next step
  const canProceed = useCallback(() => {
    const current = getCurrentStep();
    
    // Always allow proceeding from optional steps
    if (current.isOptional) return true;
    
    // Check validation for required steps
    return stepValidation[currentStep] === true;
  }, [currentStep, stepValidation, getCurrentStep]);

  // Check if current step is completed
  const isStepCompleted = useCallback((stepId: number) => {
    return stepValidation[stepId] === true;
  }, [stepValidation]);

  // Update modal data
  const updateModalData = useCallback((updates: Partial<Form100Request>) => {
    setModalData(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  }, []);

  // Get step progress
  const getStepProgress = useCallback(() => {
    const completedSteps = WIZARD_STEPS.filter(step => 
      step.isOptional || stepValidation[step.id]
    ).length;
    
    return Math.round((completedSteps / WIZARD_STEPS.length) * 100);
  }, [stepValidation]);

  // Check if modal is on final step
  const isLastStep = currentStep === WIZARD_STEPS.length;
  const isFirstStep = currentStep === 1;

  // Get step summary for display
  const getStepSummary = useCallback(() => {
    return WIZARD_STEPS.map(step => ({
      ...step,
      isCompleted: isStepCompleted(step.id),
      isActive: step.id === currentStep,
      isVisited: visitedSteps.has(step.id),
      canNavigate: visitedSteps.has(step.id)
    }));
  }, [currentStep, visitedSteps, isStepCompleted]);

  // Reset modal state
  const resetModal = useCallback(() => {
    setCurrentStep(1);
    setVisitedSteps(new Set([1]));
    setStepValidation({});
    setModalData(initialData || {});
  }, [initialData]);

  // Auto-save modal data to localStorage
  useEffect(() => {
    if (isOpen && Object.keys(modalData).length > 0) {
      try {
        localStorage.setItem('form100-modal-draft', JSON.stringify({
          data: modalData,
          step: currentStep,
          timestamp: Date.now()
        }));
      } catch (error) {
      }
    }
  }, [isOpen, modalData, currentStep]);

  // Load draft data on open
  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem('form100-modal-draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        
        // Only load if draft is less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          setModalData(parsed.data);
          setCurrentStep(parsed.step);
          setVisitedSteps(new Set(Array.from({ length: parsed.step }, (_, i) => i + 1)));
          return true;
        }
      }
    } catch (error) {
    }
    return false;
  }, []);

  // Clear draft data
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem('form100-modal-draft');
    } catch (error) {
    }
  }, []);

  return {
    // State
    isOpen,
    currentStep,
    totalSteps: WIZARD_STEPS.length,
    
    // Navigation
    openModal,
    closeModal,
    nextStep,
    previousStep,
    goToStep,
    
    // Validation
    canProceed,
    isStepCompleted,
    
    // Data
    modalData,
    updateModalData,
    
    // Computed properties
    isLastStep,
    isFirstStep,
    stepProgress: getStepProgress(),
    stepSummary: getStepSummary(),
    currentStepConfig: getCurrentStep(),
    
    // Utilities
    resetModal,
    loadDraft,
    clearDraft
  };
};