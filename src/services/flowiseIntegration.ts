// Flowise Integration Service for Form 100 Generation
// Secure proxy service for medical AI chat integration
// HIPAA-compliant with retry mechanisms and error handling

import { 
  FlowiseForm100Payload, 
  FlowiseForm100Response, 
  Form100ServiceResponse 
} from '../types/form100';

// Flowise endpoint configuration
const FLOWISE_CONFIG = {
  baseUrl: process.env.VITE_FLOWISE_BASE_URL || 'https://medimind-flowise.supabase.co',
  form100Endpoint: process.env.VITE_FLOWISE_FORM100_ENDPOINT || '/api/v1/prediction/form100-generation',
  apiKey: process.env.VITE_FLOWISE_API_KEY || '',
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};

// Error codes for Flowise integration
export const FLOWISE_ERROR_CODES = {
  NETWORK_ERROR: 'FLOWISE_NETWORK_ERROR',
  TIMEOUT_ERROR: 'FLOWISE_TIMEOUT_ERROR',
  AUTH_ERROR: 'FLOWISE_AUTH_ERROR',
  VALIDATION_ERROR: 'FLOWISE_VALIDATION_ERROR',
  API_ERROR: 'FLOWISE_API_ERROR',
  RATE_LIMIT_ERROR: 'FLOWISE_RATE_LIMIT_ERROR',
  GENERATION_ERROR: 'FLOWISE_GENERATION_ERROR'
} as const;

// Safe async wrapper for Flowise operations
const safeFlowiseAsync = async <T>(
  operation: () => Promise<T>,
  errorCode: string
): Promise<Form100ServiceResponse<T>> => {
  try {
    const data = await operation();
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date(),
        requestId: generateFlowiseRequestId()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Unknown Flowise error',
        details: error
      },
      metadata: {
        timestamp: new Date(),
        requestId: generateFlowiseRequestId()
      }
    };
  }
};

// Generate unique request ID for Flowise tracking
const generateFlowiseRequestId = (): string => {
  return `flowise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Validate Flowise payload before sending
const validateFlowisePayload = (payload: FlowiseForm100Payload): boolean => {
  if (!payload.sessionId) {
    throw new Error('Session ID is required for Flowise integration');
  }
  
  if (!payload.patientData.clinicalData.primaryDiagnosis) {
    throw new Error('Primary diagnosis is required for Form 100 generation');
  }
  
  if (!payload.patientData.clinicalData.primaryDiagnosis.code) {
    throw new Error('Primary diagnosis must have valid ICD-10 code');
  }
  
  return true;
};

// Get authentication headers for Flowise
const getFlowiseAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'MediMind-Expert/1.0'
  };
  
  if (FLOWISE_CONFIG.apiKey) {
    headers['Authorization'] = `Bearer ${FLOWISE_CONFIG.apiKey}`;
  }
  
  return headers;
};

// Retry mechanism with exponential backoff for Flowise requests
const withFlowiseRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = FLOWISE_CONFIG.retryAttempts
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on authentication or validation errors
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          throw error; // Authentication error - don't retry
        }
        if (error.message.includes('validation')) {
          throw error; // Validation error - don't retry
        }
      }
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * FLOWISE_CONFIG.retryDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Make HTTP request to Flowise with timeout and error handling
const makeFlowiseRequest = async (
  payload: FlowiseForm100Payload,
  endpoint?: string
): Promise<FlowiseForm100Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FLOWISE_CONFIG.timeout);
  
  // Use provided endpoint or fall back to default
  const url = endpoint || `${FLOWISE_CONFIG.baseUrl}${FLOWISE_CONFIG.form100Endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getFlowiseAuthHeaders(),
        'X-Session-ID': payload.sessionId,
        'X-Request-ID': generateFlowiseRequestId(),
        'X-Priority': payload.formParameters.priority || 'normal'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Flowise authentication failed: ${response.status}`);
      }
      
      if (response.status === 429) {
        throw new Error(`Flowise rate limit exceeded: ${response.status}`);
      }
      
      if (response.status >= 500) {
        throw new Error(`Flowise server error: ${response.status} ${response.statusText}`);
      }
      
      throw new Error(`Flowise API error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Validate response structure
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Invalid response format from Flowise API');
    }
    
    return responseData as FlowiseForm100Response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Flowise request timed out after ${FLOWISE_CONFIG.timeout}ms`);
    }
    
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error connecting to Flowise service');
    }
    
    throw error;
  }
};

// Transform medical data for Flowise consumption
const prepareFlowiseContext = (payload: FlowiseForm100Payload): string => {
  const { patientData, formParameters } = payload;
  
  let context = `MEDICAL CONTEXT FOR FORM 100 GENERATION:\n\n`;
  
  // Primary diagnosis
  context += `PRIMARY DIAGNOSIS:\n`;
  context += `- Code: ${patientData.clinicalData.primaryDiagnosis.code}\n`;
  context += `- Name (Georgian): ${patientData.clinicalData.primaryDiagnosis.name}\n`;
  context += `- Name (English): ${patientData.clinicalData.primaryDiagnosis.nameEn}\n`;
  context += `- Severity: ${patientData.clinicalData.primaryDiagnosis.severity || 'Not specified'}\n\n`;
  
  // Secondary diagnoses
  if (patientData.clinicalData.secondaryDiagnoses?.length) {
    context += `SECONDARY DIAGNOSES:\n`;
    patientData.clinicalData.secondaryDiagnoses.forEach((diagnosis, index) => {
      context += `${index + 1}. ${diagnosis.code} - ${diagnosis.name}\n`;
    });
    context += '\n';
  }
  
  // Symptoms
  if (patientData.clinicalData.symptoms?.length) {
    context += `SYMPTOMS:\n`;
    patientData.clinicalData.symptoms.forEach((symptom, index) => {
      context += `${index + 1}. ${symptom}\n`;
    });
    context += '\n';
  }
  
  // Vital signs
  if (patientData.clinicalData.vitalSigns) {
    context += `VITAL SIGNS:\n`;
    const vitals = patientData.clinicalData.vitalSigns;
    if (vitals.bloodPressure) context += `- Blood Pressure: ${vitals.bloodPressure}\n`;
    if (vitals.heartRate) context += `- Heart Rate: ${vitals.heartRate} bpm\n`;
    if (vitals.temperature) context += `- Temperature: ${vitals.temperature}°C\n`;
    if (vitals.respiratoryRate) context += `- Respiratory Rate: ${vitals.respiratoryRate}/min\n`;
    if (vitals.oxygenSaturation) context += `- Oxygen Saturation: ${vitals.oxygenSaturation}%\n`;
    context += '\n';
  }
  
  // Demographics
  if (patientData.demographics && Object.keys(patientData.demographics).length > 0) {
    context += `PATIENT DEMOGRAPHICS:\n`;
    const demo = patientData.demographics;
    if (demo.age) context += `- Age: ${demo.age} years\n`;
    if (demo.gender) context += `- Gender: ${demo.gender}\n`;
    if (demo.weight) context += `- Weight: ${demo.weight} kg\n`;
    if (demo.height) context += `- Height: ${demo.height} cm\n`;
    if (demo.allergies?.length) context += `- Allergies: ${demo.allergies.join(', ')}\n`;
    if (demo.currentMedications?.length) context += `- Current Medications: ${demo.currentMedications.join(', ')}\n`;
    context += '\n';
  }
  
  // Voice transcript
  if (patientData.voiceTranscript) {
    context += `VOICE TRANSCRIPT:\n${patientData.voiceTranscript}\n\n`;
  }
  
  // Angiography report
  if (patientData.angiographyReport) {
    context += `ANGIOGRAPHY REPORT:\n${patientData.angiographyReport}\n\n`;
  }
  
  // Lab results
  if (patientData.labResults) {
    context += `LABORATORY RESULTS:\n${patientData.labResults}\n\n`;
  }
  
  // Additional notes
  if (patientData.additionalNotes) {
    context += `ADDITIONAL NOTES:\n${patientData.additionalNotes}\n\n`;
  }
  
  // Form parameters
  context += `FORM PARAMETERS:\n`;
  context += `- Priority: ${formParameters.priority}\n`;
  context += `- Department: ${formParameters.department}\n`;
  if (formParameters.attendingPhysician) {
    context += `- Attending Physician: ${formParameters.attendingPhysician}\n`;
  }
  if (formParameters.submissionDeadline) {
    context += `- Submission Deadline: ${formParameters.submissionDeadline}\n`;
  }
  
  return context;
};

// Main Flowise integration service
export class FlowiseIntegrationService {
  
  // Generate Form 100 using Flowise AI
  static async generateForm100(
    payload: FlowiseForm100Payload,
    endpoint?: string
  ): Promise<Form100ServiceResponse<FlowiseForm100Response>> {
    return safeFlowiseAsync(async () => {
      // Validate payload
      validateFlowisePayload(payload);
      
      // Add medical context for better AI understanding
      const enhancedPayload = {
        ...payload,
        context: prepareFlowiseContext(payload),
        metadata: {
          requestId: generateFlowiseRequestId(),
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };
      
      // Make request with retry mechanism
      const response = await withFlowiseRetry(() => 
        makeFlowiseRequest(enhancedPayload as FlowiseForm100Payload, endpoint)
      );
      
      // Validate response
      if (!response.success && response.error) {
        throw new Error(response.error.message || 'Form 100 generation failed');
      }
      
      if (!response.data?.generatedForm) {
        throw new Error('Flowise returned empty Form 100 content');
      }
      
      return response;
      
    }, FLOWISE_ERROR_CODES.GENERATION_ERROR);
  }
  
  // Test Flowise connection and health
  static async testConnection(): Promise<Form100ServiceResponse<boolean>> {
    return safeFlowiseAsync(async () => {
      const healthUrl = `${FLOWISE_CONFIG.baseUrl}/api/v1/health`;
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: getFlowiseAuthHeaders(),
        signal: AbortSignal.timeout(5000) // 5 second timeout for health check
      });
      
      return response.ok;
      
    }, FLOWISE_ERROR_CODES.NETWORK_ERROR);
  }
  
  // Get Flowise service configuration
  static getConfiguration() {
    return {
      baseUrl: FLOWISE_CONFIG.baseUrl,
      endpoint: FLOWISE_CONFIG.form100Endpoint,
      timeout: FLOWISE_CONFIG.timeout,
      retryAttempts: FLOWISE_CONFIG.retryAttempts,
      hasApiKey: !!FLOWISE_CONFIG.apiKey
    };
  }
  
  // Update Flowise configuration (for testing)
  static updateConfiguration(config: Partial<typeof FLOWISE_CONFIG>) {
    Object.assign(FLOWISE_CONFIG, config);
  }
}

// Export utility functions
export {
  validateFlowisePayload,
  prepareFlowiseContext,
  generateFlowiseRequestId,
  FLOWISE_CONFIG,
  withFlowiseRetry
};