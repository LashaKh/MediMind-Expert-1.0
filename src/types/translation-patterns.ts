/**
 * Translation Key Pattern Structure
 * 
 * Refined patterns based on successful TIMI/GRACE calculator implementations
 * Establishes type-safe translation structures for medical calculators
 */

export type CalculatorSpecialty = 'cardiology' | 'obgyn' | 'neurology' | 'endocrinology';

export type ValidationFieldType = 'age' | 'weight' | 'height' | 'bmi' | 'blood_pressure' | 'heart_rate' | 'lab_value' | 'percentage' | 'generic';

/**
 * Base Calculator Translation Structure
 * Pattern: calculators.{specialty}.{calculator_name}.{property}
 */
export interface BaseCalculatorTranslation {
  // Core calculator identification
  title: string;
  subtitle: string;
  description: string;
  
  // Navigation and flow
  calculate_button: string;
  reset_button?: string;
  new_assessment?: string;
  modify_inputs?: string;
  
  // Results section
  results_title?: string;
  score_label?: string;
  risk_category: string;
  recommendations: string;
  
  // Common risk levels
  low_risk: string;
  moderate_risk?: string;
  intermediate_risk?: string;
  high_risk: string;
  very_high_risk?: string;
  
  // Allow for calculator-specific extensions
  [key: string]: string | undefined;
}

/**
 * Demographics Section Pattern
 * Standard demographic fields across calculators
 */
export interface DemographicsTranslation {
  demographics_section: string;
  age_label: string;
  age_placeholder: string;
  gender_label?: string;
  sex_label?: string;
  male: string;
  female: string;
  weight_label?: string;
  height_label?: string;
  bmi_label?: string;
}

/**
 * Clinical Assessment Pattern
 * For clinical presentation and examination findings
 */
export interface ClinicalAssessmentTranslation {
  clinical_section: string;
  clinical_assessment?: string;
  clinical_assessment_description?: string;
  risk_factors_section: string;
  medical_history?: string;
  physical_examination?: string;
}

/**
 * Validation Messages Pattern
 * Standardized validation key structure: validation_{field}
 */
export interface ValidationTranslation {
  [key: string]: string;
}

/**
 * Risk Factor Translation Pattern
 * Boolean risk factors with labels and descriptions
 */
export interface RiskFactorTranslation {
  [key: string]: string | undefined;
}

/**
 * Laboratory Values Pattern
 * Medical laboratory test translations
 */
export interface LaboratoryTranslation {
  laboratory_section: string;
  [key: string]: string | undefined;
}

/**
 * Emergency/Critical Care Pattern
 * For acute care calculators (TIMI, GRACE)
 */
export interface EmergencyCalculatorTranslation extends BaseCalculatorTranslation {
  emergency_tool: string;
  tool_description: string;
  
  // Time-sensitive recommendations
  timeframe_under_24?: string;
  timeframe_24_48?: string;
  timeframe_24_72?: string;
  
  // Management urgency
  management_urgency: string;
  recommended_timeframe: string;
  
  // Emergency strategies
  conservative_management?: string;
  early_invasive_strategy?: string;
  urgent_invasive_strategy?: string;
}

/**
 * Cardiovascular Calculator Pattern
 * Specific to cardiology calculators
 */
export interface CardiovascularCalculatorTranslation extends BaseCalculatorTranslation {
  // Common cardiovascular fields
  heart_rate_label?: string;
  systolic_bp_label?: string;
  diastolic_bp_label?: string;
  cholesterol_label?: string;
  
  // Risk stratification
  cardiovascular_risk?: string;
  mortality_risk?: string;
  intervention_benefit?: string;
  
  // Management recommendations
  medication_therapy?: string;
  lifestyle_modification?: string;
  invasive_strategy?: string;
}

/**
 * OB/GYN Calculator Pattern
 * Specific to obstetrics and gynecology calculators
 */
export interface ObgynCalculatorTranslation extends BaseCalculatorTranslation {
  // Pregnancy-related fields
  gestational_age_label?: string;
  parity_label?: string;
  gravida_label?: string;
  
  // Reproductive history
  reproductive_history?: string;
  obstetric_history?: string;
  gynecologic_history?: string;
  
  // Risk assessment
  maternal_risk?: string;
  fetal_risk?: string;
  pregnancy_outcome?: string;
}

/**
 * Step-by-Step Calculator Pattern
 * For multi-step calculators with progressive disclosure
 */
export interface SteppedCalculatorTranslation extends BaseCalculatorTranslation {
  // Step navigation
  step_1?: string;
  step_2?: string;
  step_3?: string;
  step_4?: string;
  
  // Progressive buttons
  next_demographics?: string;
  next_clinical_factors?: string;
  next_risk_factors?: string;
  next_results?: string;
  
  // Step titles
  patient_info: string;
  clinical_factors?: string;
  risk_assessment?: string;
}

/**
 * Complete Calculator Translation Interface
 * Combines all patterns for comprehensive type safety
 */
export interface CalculatorTranslation extends BaseCalculatorTranslation {
  // Additional optional patterns
  demographics_section?: string;
  clinical_section?: string;
  laboratory_section?: string;
}

/**
 * Specialty-Specific Calculator Collections
 */
export interface CardiologyCalculators {
  timi: CalculatorTranslation;
  grace: CalculatorTranslation;
  ascvd: CalculatorTranslation;
  hcm_risk_scd: CalculatorTranslation;
  dapt: CalculatorTranslation;
  [key: string]: CalculatorTranslation;
}

export interface ObgynCalculators {
  endometrial_cancer_risk: CalculatorTranslation;
  bishop_score: CalculatorTranslation;
  vbac_success: CalculatorTranslation;
  due_date: CalculatorTranslation;
  [key: string]: CalculatorTranslation;
}

/**
 * Top-Level Calculator Translation Structure
 */
export interface CalculatorsTranslation {
  categories: {
    cardiology: string;
    obgyn: string;
    coming_soon: string;
  };
  
  common: {
    calculate: string;
    calculating: string;
    result: string;
    results: string;
    interpretation: string;
    recommendations: string;
    riskLevel: string;
    lowRisk: string;
    moderateRisk: string;
    highRisk: string;
    veryHighRisk: string;
    riskFactors: string;
    inputs: string;
    clearInputs: string;
    shareResult: string;
    downloadPDF: string;
    printResult: string;
    enterValue: string;
    selectOption: string;
    required: string;
    invalidValue: string;
    valueOutOfRange: string;
  };
  
  cardiology: CardiologyCalculators;
  obgyn: ObgynCalculators;
}

/**
 * Validation Message Generator
 * Creates standardized validation messages for different field types
 */
export interface ValidationMessageTemplates {
  age: {
    required: string;
    min_max: string; // "Age must be between {min}-{max} years"
    invalid: string;
  };
  
  numeric: {
    required: string;
    min_max: string; // "Value must be between {min}-{max}"
    invalid: string;
  };
  
  selection: {
    required: string;
    invalid: string;
  };
  
  percentage: {
    required: string;
    range: string; // "Percentage must be between 0-100%"
    invalid: string;
  };
}

/**
 * Translation Key Utilities
 */
export type ValidationKey<TField extends string> = `validation_${TField}`;
export type LabelKey<TField extends string> = `${TField}_label`;
export type PlaceholderKey<TField extends string> = `${TField}_placeholder`;
export type DescriptionKey<TField extends string> = `${TField}_desc`;
export type HelpKey<TField extends string> = `${TField}_help`;

/**
 * Translation Path Builder
 * Type-safe path construction for nested translation keys
 */
export type TranslationPath<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? `${string & K}.${TranslationPath<T[K]>}`
        : string & K
    }[keyof T]
  : never;

/**
 * Calculator Translation Path
 * Examples:
 * - calculators.cardiology.timi.title
 * - calculators.obgyn.bishop_score.validation_age
 * - calculators.common.calculate
 */
export type CalculatorTranslationPath = `calculators.${TranslationPath<CalculatorsTranslation>}`; 