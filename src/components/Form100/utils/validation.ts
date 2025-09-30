// Form 100 Validation Utilities
// Medical-grade validation for emergency consultation reports
// Evidence-based validation rules with Georgian medical standards

import { Form100Request, ValidationRule, ValidationError } from '../../../types/form100';
import { validateDiagnosisCode } from '../config/diagnosisConfig';

// Medical validation constants
export const MEDICAL_VALIDATION_CONSTANTS = {
  AGE: {
    MIN: 0,
    MAX: 150,
    ADULT_THRESHOLD: 18,
    PEDIATRIC_THRESHOLD: 18,
    GERIATRIC_THRESHOLD: 65
  },
  VITAL_SIGNS: {
    HEART_RATE: { MIN: 20, MAX: 300 },
    BLOOD_PRESSURE: {
      SYSTOLIC: { MIN: 50, MAX: 300 },
      DIASTOLIC: { MIN: 30, MAX: 200 }
    },
    TEMPERATURE: { MIN: 25, MAX: 45 }, // Celsius
    RESPIRATORY_RATE: { MIN: 5, MAX: 60 },
    OXYGEN_SATURATION: { MIN: 50, MAX: 100 }
  },
  WEIGHT: { MIN: 0.5, MAX: 700 }, // kg
  HEIGHT: { MIN: 30, MAX: 250 }, // cm
  TEXT_LIMITS: {
    SHORT_TEXT: 500,
    MEDIUM_TEXT: 2000,
    LONG_TEXT: 10000
  }
} as const;

// Georgian medical validation patterns
export const GEORGIAN_MEDICAL_PATTERNS = {
  BLOOD_PRESSURE: /^\d{2,3}\/\d{2,3}$/,
  PHONE_NUMBER: /^(\+995|0)?(5\d{8}|[23]\d{7})$/,
  NATIONAL_ID: /^\d{11}$/,
  MEDICAL_LICENSE: /^[A-Z]{2}\d{6}$/
} as const;

// Comprehensive validation rules for Form 100
export const FORM100_VALIDATION_RULES: ValidationRule[] = [
  // Required fields
  {
    field: 'sessionId',
    required: true,
    minLength: 1,
    custom: (value: string) => value?.trim().length > 0 || 'Session ID cannot be empty'
  },
  {
    field: 'userId',
    required: true,
    minLength: 1,
    custom: (value: string) => value?.trim().length > 0 || 'User ID cannot be empty'
  },
  {
    field: 'primaryDiagnosis',
    required: true,
    custom: (value: any) => {
      if (!value) return 'Primary diagnosis is required';
      if (!value.code) return 'Primary diagnosis must have a valid ICD-10 code';
      if (!validateDiagnosisCode(value.code)) return 'Invalid ICD-10 code format';
      return true;
    }
  },
  
  // Patient information validation
  {
    field: 'patientInfo',
    custom: (value: any) => {
      if (!value) return true; // Optional field
      
      if (value.age !== undefined) {
        if (typeof value.age !== 'number' || value.age < MEDICAL_VALIDATION_CONSTANTS.AGE.MIN || value.age > MEDICAL_VALIDATION_CONSTANTS.AGE.MAX) {
          return `Age must be between ${MEDICAL_VALIDATION_CONSTANTS.AGE.MIN} and ${MEDICAL_VALIDATION_CONSTANTS.AGE.MAX} years`;
        }
      }
      
      if (value.weight !== undefined) {
        if (typeof value.weight !== 'number' || value.weight < MEDICAL_VALIDATION_CONSTANTS.WEIGHT.MIN || value.weight > MEDICAL_VALIDATION_CONSTANTS.WEIGHT.MAX) {
          return `Weight must be between ${MEDICAL_VALIDATION_CONSTANTS.WEIGHT.MIN} and ${MEDICAL_VALIDATION_CONSTANTS.WEIGHT.MAX} kg`;
        }
      }
      
      if (value.height !== undefined) {
        if (typeof value.height !== 'number' || value.height < MEDICAL_VALIDATION_CONSTANTS.HEIGHT.MIN || value.height > MEDICAL_VALIDATION_CONSTANTS.HEIGHT.MAX) {
          return `Height must be between ${MEDICAL_VALIDATION_CONSTANTS.HEIGHT.MIN} and ${MEDICAL_VALIDATION_CONSTANTS.HEIGHT.MAX} cm`;
        }
      }
      
      return true;
    }
  },
  
  // Vital signs validation
  {
    field: 'vitalSigns',
    custom: (value: any) => {
      if (!value) return true; // Optional field
      
      const { heartRate, bloodPressure, temperature, respiratoryRate, oxygenSaturation } = value;
      
      if (heartRate !== undefined) {
        if (typeof heartRate !== 'number' || heartRate < MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.HEART_RATE.MIN || heartRate > MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.HEART_RATE.MAX) {
          return `Heart rate must be between ${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.HEART_RATE.MIN}-${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.HEART_RATE.MAX} bpm`;
        }
      }
      
      if (bloodPressure !== undefined) {
        if (typeof bloodPressure !== 'string' || !GEORGIAN_MEDICAL_PATTERNS.BLOOD_PRESSURE.test(bloodPressure)) {
          return 'Blood pressure must be in format "120/80"';
        }
        
        const [systolic, diastolic] = bloodPressure.split('/').map(Number);
        if (systolic < MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.BLOOD_PRESSURE.SYSTOLIC.MIN || 
            systolic > MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.BLOOD_PRESSURE.SYSTOLIC.MAX) {
          return `Systolic pressure must be between ${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.BLOOD_PRESSURE.SYSTOLIC.MIN}-${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.BLOOD_PRESSURE.SYSTOLIC.MAX} mmHg`;
        }
        
        if (diastolic < MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.BLOOD_PRESSURE.DIASTOLIC.MIN || 
            diastolic > MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.BLOOD_PRESSURE.DIASTOLIC.MAX) {
          return `Diastolic pressure must be between ${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.BLOOD_PRESSURE.DIASTOLIC.MIN}-${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.BLOOD_PRESSURE.DIASTOLIC.MAX} mmHg`;
        }
      }
      
      if (temperature !== undefined) {
        if (typeof temperature !== 'number' || temperature < MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.TEMPERATURE.MIN || temperature > MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.TEMPERATURE.MAX) {
          return `Temperature must be between ${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.TEMPERATURE.MIN}-${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.TEMPERATURE.MAX}°C`;
        }
      }
      
      if (respiratoryRate !== undefined) {
        if (typeof respiratoryRate !== 'number' || respiratoryRate < MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.RESPIRATORY_RATE.MIN || respiratoryRate > MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.RESPIRATORY_RATE.MAX) {
          return `Respiratory rate must be between ${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.RESPIRATORY_RATE.MIN}-${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.RESPIRATORY_RATE.MAX} breaths/min`;
        }
      }
      
      if (oxygenSaturation !== undefined) {
        if (typeof oxygenSaturation !== 'number' || oxygenSaturation < MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.OXYGEN_SATURATION.MIN || oxygenSaturation > MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.OXYGEN_SATURATION.MAX) {
          return `Oxygen saturation must be between ${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.OXYGEN_SATURATION.MIN}-${MEDICAL_VALIDATION_CONSTANTS.VITAL_SIGNS.OXYGEN_SATURATION.MAX}%`;
        }
      }
      
      return true;
    }
  },
  
  // Text field validations
  {
    field: 'symptoms',
    minLength: 1,
    custom: (value: string[]) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return 'At least one symptom must be specified';
      }
      
      const emptySymptoms = value.filter(symptom => !symptom?.trim());
      if (emptySymptoms.length > 0) {
        return 'All symptoms must be non-empty';
      }
      
      return true;
    }
  },
  
  {
    field: 'voiceTranscript',
    maxLength: MEDICAL_VALIDATION_CONSTANTS.TEXT_LIMITS.LONG_TEXT,
    custom: (value: string) => {
      if (value && value.length > MEDICAL_VALIDATION_CONSTANTS.TEXT_LIMITS.LONG_TEXT) {
        return `Voice transcript cannot exceed ${MEDICAL_VALIDATION_CONSTANTS.TEXT_LIMITS.LONG_TEXT} characters`;
      }
      return true;
    }
  },
  
  {
    field: 'angiographyReport',
    maxLength: MEDICAL_VALIDATION_CONSTANTS.TEXT_LIMITS.LONG_TEXT,
    custom: (value: string) => {
      if (value && value.length > MEDICAL_VALIDATION_CONSTANTS.TEXT_LIMITS.LONG_TEXT) {
        return `Angiography report cannot exceed ${MEDICAL_VALIDATION_CONSTANTS.TEXT_LIMITS.LONG_TEXT} characters`;
      }
      return true;
    }
  },
  
  {
    field: 'additionalNotes',
    maxLength: MEDICAL_VALIDATION_CONSTANTS.TEXT_LIMITS.MEDIUM_TEXT,
    custom: (value: string) => {
      if (value && value.length > MEDICAL_VALIDATION_CONSTANTS.TEXT_LIMITS.MEDIUM_TEXT) {
        return `Additional notes cannot exceed ${MEDICAL_VALIDATION_CONSTANTS.TEXT_LIMITS.MEDIUM_TEXT} characters`;
      }
      return true;
    }
  },
  
  // Priority and department validation
  {
    field: 'priority',
    custom: (value: string) => {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (value && !validPriorities.includes(value)) {
        return `Priority must be one of: ${validPriorities.join(', ')}`;
      }
      return true;
    }
  },
  
  {
    field: 'department',
    required: true,
    minLength: 1,
    custom: (value: string) => {
      if (!value?.trim()) {
        return 'Department is required';
      }
      return true;
    }
  }
];

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Validate a single field
export function validateField(
  formData: Partial<Form100Request>,
  fieldName: keyof Form100Request
): { isValid: boolean; error?: string } {
  const rule = FORM100_VALIDATION_RULES.find(r => r.field === fieldName);
  if (!rule) return { isValid: true };
  
  const value = getNestedValue(formData, fieldName);
  
  // Required validation
  if (rule.required && (value === undefined || value === null || value === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  // Skip other validations if field is not required and empty
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return { isValid: true };
  }
  
  // Length validations
  if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${rule.minLength} characters` };
  }
  
  if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${rule.maxLength} characters` };
  }
  
  if (rule.minLength && Array.isArray(value) && value.length < rule.minLength) {
    return { isValid: false, error: `${fieldName} must have at least ${rule.minLength} items` };
  }
  
  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return { isValid: false, error: `${fieldName} format is invalid` };
  }
  
  // Custom validation
  if (rule.custom) {
    const customResult = rule.custom(value);
    if (customResult !== true) {
      return { isValid: false, error: typeof customResult === 'string' ? customResult : `${fieldName} is invalid` };
    }
  }
  
  return { isValid: true };
}

// Validate entire form
export function validateForm100(formData: Partial<Form100Request>): {
  isValid: boolean;
  errors: ValidationError[];
  fieldErrors: Record<string, string>;
} {
  const errors: ValidationError[] = [];
  const fieldErrors: Record<string, string> = {};
  
  for (const rule of FORM100_VALIDATION_RULES) {
    const result = validateField(formData, rule.field);
    
    if (!result.isValid && result.error) {
      errors.push({
        field: rule.field,
        message: result.error,
        code: `VALIDATION_${rule.field.toUpperCase()}_ERROR`
      });
      
      fieldErrors[rule.field] = result.error;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
}

// Medical severity validation
export function validateMedicalSeverity(formData: Partial<Form100Request>): {
  warningLevel: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let warningLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  // Check primary diagnosis severity
  if (formData.primaryDiagnosis?.severity === 'critical') {
    warningLevel = 'critical';
    warnings.push('Critical diagnosis detected - immediate attention required');
    recommendations.push('Ensure all vital signs are documented');
    recommendations.push('Consider immediate intervention protocols');
  } else if (formData.primaryDiagnosis?.severity === 'severe') {
    warningLevel = 'high';
    warnings.push('Severe diagnosis - close monitoring required');
    recommendations.push('Regular vital sign monitoring recommended');
  }
  
  // Check vital signs for abnormal values
  if (formData.vitalSigns) {
    const vitals = formData.vitalSigns;
    
    if (vitals.heartRate && (vitals.heartRate < 60 || vitals.heartRate > 100)) {
      warnings.push('Abnormal heart rate detected');
      if (warningLevel === 'low') warningLevel = 'medium';
    }
    
    if (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) {
      warnings.push('Low oxygen saturation - requires immediate attention');
      warningLevel = 'high';
      recommendations.push('Oxygen therapy may be required');
    }
    
    if (vitals.temperature && (vitals.temperature < 36 || vitals.temperature > 38.5)) {
      warnings.push('Abnormal body temperature');
      if (warningLevel === 'low') warningLevel = 'medium';
    }
  }
  
  // Check age-specific considerations
  if (formData.patientInfo?.age) {
    if (formData.patientInfo.age < MEDICAL_VALIDATION_CONSTANTS.AGE.PEDIATRIC_THRESHOLD) {
      warnings.push('Pediatric patient - special protocols may apply');
      recommendations.push('Consider pediatric dosing guidelines');
    } else if (formData.patientInfo.age >= MEDICAL_VALIDATION_CONSTANTS.AGE.GERIATRIC_THRESHOLD) {
      warnings.push('Geriatric patient - consider comorbidities');
      recommendations.push('Review medication interactions');
    }
  }
  
  return {
    warningLevel,
    warnings,
    recommendations
  };
}

// Quick validation for specific scenarios
export function quickValidateForGeneration(formData: Partial<Form100Request>): boolean {
  // Minimum requirements for Form 100 generation
  return !!(
    formData.sessionId &&
    formData.userId &&
    formData.primaryDiagnosis &&
    formData.department &&
    formData.priority
  );
}

// Validation for wizard steps
export function validateWizardStep(stepNumber: number, formData: Partial<Form100Request>): {
  isValid: boolean;
  errors: string[];
  canProceed: boolean;
} {
  const errors: string[] = [];
  
  switch (stepNumber) {
    case 1: // Patient Information
      // Optional step - always valid
      return { isValid: true, errors: [], canProceed: true };
      
    case 2: // Clinical Data
      if (!formData.primaryDiagnosis) {
        errors.push('Primary diagnosis is required');
      }
      if (!formData.symptoms || formData.symptoms.length === 0) {
        errors.push('At least one symptom must be specified');
      }
      break;
      
    case 3: // Documentation
      // Optional step - always valid
      return { isValid: true, errors: [], canProceed: true };
      
    case 4: // Generation
      if (!quickValidateForGeneration(formData)) {
        errors.push('Missing required information for Form 100 generation');
      }
      break;
      
    default:
      errors.push('Invalid wizard step');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    canProceed: errors.length === 0
  };
}

// Export all validation utilities
export {
  validateField,
  validateForm100,
  validateMedicalSeverity,
  quickValidateForGeneration,
  validateWizardStep
};