// useForm100Generation Hook
// Comprehensive state management for Form 100 generation workflow
// Includes validation, generation, and persistence

import { useState, useCallback, useEffect, useRef } from 'react';
import { UseForm100GenerationReturn, Form100Request, ValidationError } from '../../../types/form100';
import { Form100Service } from '../../../services/form100Service';
import { FlowiseIntegrationService } from '../../../services/flowiseIntegration';
import { validateForm100Request } from '../../../services/form100Service';

// Default form data structure
const createDefaultFormData = (sessionId?: string, userId?: string): Partial<Form100Request> => ({
  sessionId,
  userId,
  patientInfo: {
    age: undefined,
    gender: undefined,
    weight: undefined,
    height: undefined,
    allergies: [],
    currentMedications: []
  },
  symptoms: [],
  vitalSigns: {
    bloodPressure: undefined,
    heartRate: undefined,
    temperature: undefined,
    respiratoryRate: undefined,
    oxygenSaturation: undefined
  },
  voiceTranscript: '',
  angiographyReport: '',
  labResults: '',
  additionalNotes: '',
  generationStatus: 'pending',
  priority: 'normal',
  department: 'Emergency',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Validation rules for Form 100 data
const VALIDATION_RULES = {
  primaryDiagnosis: {
    required: true,
    message: 'Primary diagnosis is required'
  },
  sessionId: {
    required: true,
    message: 'Session ID is required'
  },
  userId: {
    required: true,
    message: 'User ID is required'
  },
  symptoms: {
    minLength: 1,
    message: 'At least one symptom must be specified'
  },
  'patientInfo.age': {
    min: 0,
    max: 150,
    message: 'Age must be between 0 and 150 years'
  },
  'vitalSigns.heartRate': {
    min: 20,
    max: 300,
    message: 'Heart rate must be between 20-300 bpm'
  },
  'vitalSigns.temperature': {
    min: 25,
    max: 45,
    message: 'Temperature must be between 25-45°C'
  }
};

export const useForm100Generation = (
  sessionId?: string,
  userId?: string
): UseForm100GenerationReturn => {
  // Core state
  const [formData, setFormData] = useState<Form100Request | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Refs for managing async operations
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize form data
  useEffect(() => {
    if (sessionId && userId && !formData) {
      setFormData(createDefaultFormData(sessionId, userId) as Form100Request);
    }
  }, [sessionId, userId, formData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Validate specific field
  const validateField = useCallback((field: keyof Form100Request): boolean => {
    if (!formData) return false;
    
    const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES];
    if (!rule) return true;

    const value = getNestedValue(formData, field);
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (rule.required && (!value || (Array.isArray(value) && value.length === 0))) {
      isValid = false;
      errorMessage = rule.message;
    }

    // Type-specific validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        isValid = false;
        errorMessage = rule.message;
      }
      if (rule.max !== undefined && value > rule.max) {
        isValid = false;
        errorMessage = rule.message;
      }
    }

    if (Array.isArray(value) && rule.minLength && value.length < rule.minLength) {
      isValid = false;
      errorMessage = rule.message;
    }

    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [field]: isValid ? '' : errorMessage
    }));

    return isValid;
  }, [formData]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    if (!formData) return false;

    const validation = validateForm100Request(formData);
    
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        // Map validation errors to field names
        if (error.includes('Primary diagnosis')) {
          errors.primaryDiagnosis = error;
        } else if (error.includes('Session ID')) {
          errors.sessionId = error;
        } else if (error.includes('User ID')) {
          errors.userId = error;
        } else if (error.includes('Heart rate')) {
          errors['vitalSigns.heartRate'] = error;
        } else if (error.includes('Temperature')) {
          errors['vitalSigns.temperature'] = error;
        } else if (error.includes('Blood pressure')) {
          errors['vitalSigns.bloodPressure'] = error;
        }
      });
      
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  }, [formData]);

  // Update form data
  const setFormDataCallback = useCallback((data: Partial<Form100Request>) => {
    setFormData(prev => {
      if (!prev) return null;
      
      const updated = {
        ...prev,
        ...data,
        updatedAt: new Date()
      };
      
      return updated;
    });
    
    // Clear previous errors
    setError(null);
  }, []);

  // Simulate progress for user feedback
  const simulateProgress = useCallback(() => {
    setGenerationProgress(0);
    
    progressIntervalRef.current = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  }, []);

  // Generate Form 100
  const generateForm = useCallback(async (): Promise<void> => {
    if (!formData || isGenerating) return;
    
    // Validate form before generation
    if (!validateForm()) {
      setError('Please fix validation errors before generating the form');
      return;
    }

    setIsGenerating(true);
    setError(null);
    simulateProgress();
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Update generation status
      setFormDataCallback({ generationStatus: 'processing' });
      
      // Generate form using Flowise integration
      const result = await Form100Service.generateForm100(formData);
      
      if (result.success && result.data) {
        // Update form with generated content
        setFormDataCallback({
          generatedForm: result.data.generatedForm,
          generationStatus: 'completed',
          generatedAt: new Date()
        });
        
        setGenerationProgress(100);
        
        // Save to database
        if (formData.id) {
          await Form100Service.updateGenerationStatus(
            formData.id,
            'completed',
            result.data.generatedForm
          );
        } else {
          const saveResult = await Form100Service.saveForm100Request(formData);
          if (saveResult.success) {
            setFormDataCallback({ id: saveResult.data?.id });
          }
        }
      } else {
        throw new Error(result.error?.message || 'Form generation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setFormDataCallback({
        generationStatus: 'failed',
        generationError: errorMessage
      });
      
      // Update database with error status
      if (formData.id) {
        await Form100Service.updateGenerationStatus(
          formData.id,
          'failed',
          undefined,
          errorMessage
        );
      }
    } finally {
      setIsGenerating(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setGenerationProgress(100);
    }
  }, [formData, isGenerating, validateForm, simulateProgress, setFormDataCallback]);

  // Reset form
  const resetForm = useCallback(() => {
    if (sessionId && userId) {
      setFormData(createDefaultFormData(sessionId, userId) as Form100Request);
    }
    setError(null);
    setValidationErrors({});
    setGenerationProgress(0);
  }, [sessionId, userId]);

  // Save form
  const saveForm = useCallback(async (): Promise<void> => {
    if (!formData) return;

    try {
      if (formData.id) {
        // Update existing form
        await Form100Service.updateGenerationStatus(
          formData.id,
          formData.generationStatus,
          formData.generatedForm,
          formData.generationError
        );
      } else {
        // Create new form
        const result = await Form100Service.saveForm100Request(formData);
        if (result.success) {
          setFormDataCallback({ id: result.data?.id });
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save form');
    }
  }, [formData, setFormDataCallback]);

  // Calculate validation state
  const isValid = Object.keys(validationErrors).length === 0 && 
                  formData?.primaryDiagnosis !== undefined;

  return {
    formData,
    isGenerating,
    generationProgress,
    error,
    setFormData: setFormDataCallback,
    generateForm,
    resetForm,
    saveForm,
    isValid,
    validationErrors,
    validateField
  };
};

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}