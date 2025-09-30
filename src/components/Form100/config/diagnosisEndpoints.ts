// Form 100 Diagnosis Endpoint Configuration
// Maps each ICD-10 diagnosis code to its dedicated Flowise endpoint
// Each endpoint is specialized for specific diagnosis types for optimal Form 100 generation

export interface DiagnosisEndpointMapping {
  diagnosisCode: string;
  flowiseEndpoint: string;
  description: string;
  isSpecialized: boolean;
}

// Base Flowise URL for all Form 100 endpoints
const FLOWISE_BASE_URL = "https://flowise-2-0.onrender.com/api/v1/prediction";

// Diagnosis-specific Flowise endpoints for Form 100 generation
export const DIAGNOSIS_ENDPOINTS: Record<string, DiagnosisEndpointMapping> = {
  // Subendocardial MI (I21.4)
  'I21.4': {
    diagnosisCode: 'I21.4',
    flowiseEndpoint: `${FLOWISE_BASE_URL}/b7a97ee2-31f1-4a68-a80a-83142c3c2d6e`,
    description: 'მიოკარდიუმის მწვავე სუბენდოკარდიული ინფარქტი',
    isSpecialized: true
  },
  
  // Unstable Angina with Troponin+ (I20.0 - Braunwald III)
  'I20.0-TROPONIN_POSITIVE': {
    diagnosisCode: 'I20.0',
    flowiseEndpoint: `${FLOWISE_BASE_URL}/6dc8bb6d-ce79-4a40-9561-9108ba05e7c7`,
    description: 'არასტაბილური სტენოკარდია Braunwald III Troponin +',
    isSpecialized: true
  },
  
  // Unstable Angina without Troponin (I20.0 - Troponin-)
  'I20.0-TROPONIN_NEGATIVE': {
    diagnosisCode: 'I20.0',
    flowiseEndpoint: `${FLOWISE_BASE_URL}/99079fbc-b9cf-4c9c-832c-ac71c864d9fb`,
    description: 'არასტაბილური სტენოკარდია Tn-',
    isSpecialized: true
  },
  
  // Other forms of angina (I20.8)
  'I20.8': {
    diagnosisCode: 'I20.8',
    flowiseEndpoint: `${FLOWISE_BASE_URL}/26c0feef-1d01-4350-8bdd-be6b0a315ac0`,
    description: 'სტენოკარდიის სხვა ფორმები',
    isSpecialized: true
  },
  
  // Acute unspecified MI (I21.9) - CORRECTED ENDPOINT
  'I21.9': {
    diagnosisCode: 'I21.9',
    flowiseEndpoint: `${FLOWISE_BASE_URL}/77a48098-671d-4dea-b476-fcea11cd1b5a`,
    description: 'მიოკარდიუმის მწვავე დაუზუსტებელი ინფარქტი',
    isSpecialized: true
  }
};

// Special STEMI Form 100 endpoint - used when generating Form 100 from STEMI cardiac consults
export const STEMI_FORM100_ENDPOINT = `${FLOWISE_BASE_URL}/483bb23c-616a-4b49-9bc3-addb24930714`;

// Default fallback endpoint for non-specialized diagnoses (TESTING with I21.4 endpoint)
export const DEFAULT_FORM100_ENDPOINT = `${FLOWISE_BASE_URL}/b7a97ee2-31f1-4a68-a80a-83142c3c2d6e`;

/**
 * Get the appropriate Flowise endpoint for a given diagnosis code
 * Handles special cases like I20.0 variants and STEMI Form 100 generation
 */
export const getFlowiseEndpointForDiagnosis = (
  diagnosisCode: string, 
  options?: {
    isFromSTEMI?: boolean;
    troponinPositive?: boolean;
  }
): string => {
  // Special case: If this Form 100 is being generated from a STEMI cardiac consult
  if (options?.isFromSTEMI) {
    return STEMI_FORM100_ENDPOINT;
  }
  
  // Handle I20.0 variants based on troponin status
  if (diagnosisCode === 'I20.0') {
    const variant = options?.troponinPositive ? 'I20.0-TROPONIN_POSITIVE' : 'I20.0-TROPONIN_NEGATIVE';
    return DIAGNOSIS_ENDPOINTS[variant]?.flowiseEndpoint || DEFAULT_FORM100_ENDPOINT;
  }
  
  // Standard diagnosis endpoint lookup
  const endpoint = DIAGNOSIS_ENDPOINTS[diagnosisCode];
  return endpoint?.flowiseEndpoint || DEFAULT_FORM100_ENDPOINT;
};

/**
 * Get diagnosis endpoint mapping by code
 */
export const getDiagnosisEndpointMapping = (diagnosisCode: string): DiagnosisEndpointMapping | null => {
  return DIAGNOSIS_ENDPOINTS[diagnosisCode] || null;
};

/**
 * Check if a diagnosis has a specialized endpoint
 */
export const hasSpecializedEndpoint = (diagnosisCode: string): boolean => {
  return Boolean(DIAGNOSIS_ENDPOINTS[diagnosisCode]?.isSpecialized);
};

/**
 * Get all supported diagnosis codes with specialized endpoints
 */
export const getSupportedDiagnosisCodes = (): string[] => {
  return Object.keys(DIAGNOSIS_ENDPOINTS);
};

/**
 * Validate if a Flowise endpoint URL is properly formatted
 */
export const validateFlowiseEndpoint = (endpoint: string): boolean => {
  try {
    const url = new URL(endpoint);
    return url.hostname === 'flowise-2-0.onrender.com' && 
           url.pathname.includes('/api/v1/prediction/');
  } catch {
    return false;
  }
};