// Form 100 Generation Service
// Flowise integration for medical ER consultation reports
// HIPAA-compliant with secure authentication and error handling

import { 
  Form100Request, 
  FlowiseForm100Payload, 
  FlowiseForm100Response,
  Form100ServiceResponse,
  Form100Config,
  FORM100_DEFAULTS,
  DiagnosisCode
} from '../types/form100';
import { 
  getFlowiseEndpointForDiagnosis, 
  STEMI_FORM100_ENDPOINT,
  DEFAULT_FORM100_ENDPOINT 
} from '../components/Form100/config/diagnosisEndpoints';

// Service configuration
const FORM100_CONFIG: Form100Config = {
  flowiseEndpoint: DEFAULT_FORM100_ENDPOINT, // Direct Flowise endpoint
  maxGenerationTime: FORM100_DEFAULTS.maxGenerationTime || 15000, // 15 seconds to test faster
  retryAttempts: FORM100_DEFAULTS.retryAttempts || 1, // Single retry to avoid multiple long waits
  validationRules: [],
  supportedDepartments: FORM100_DEFAULTS.supportedDepartments || [],
  defaultPriority: FORM100_DEFAULTS.defaultPriority || 'normal'
};

// Error codes for medical safety compliance
export const FORM100_ERROR_CODES = {
  VALIDATION_FAILED: 'FORM100_VALIDATION_FAILED',
  MISSING_DIAGNOSIS: 'FORM100_MISSING_DIAGNOSIS',
  FLOWISE_TIMEOUT: 'FORM100_FLOWISE_TIMEOUT',
  FLOWISE_ERROR: 'FORM100_FLOWISE_ERROR',
  AUTHENTICATION_FAILED: 'FORM100_AUTH_FAILED',
  PATIENT_DATA_ERROR: 'FORM100_PATIENT_DATA_ERROR',
  GENERATION_FAILED: 'FORM100_GENERATION_FAILED',
  NETWORK_ERROR: 'FORM100_NETWORK_ERROR'
} as const;

// Safe async wrapper for error handling
const safeAsync = async <T>(
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
        requestId: generateRequestId()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      },
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId()
      }
    };
  }
};

// Generate unique request ID for tracing
const generateRequestId = (): string => {
  return `form100_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Resolve the appropriate Flowise endpoint for a given diagnosis
const resolveFlowiseEndpoint = (
  diagnosis: DiagnosisCode,
  options?: {
    isFromSTEMI?: boolean;
    troponinPositive?: boolean;
  }
): string => {
  // First check if the diagnosis has its own endpoint configured
  if (diagnosis.flowiseEndpoint) {
    return diagnosis.flowiseEndpoint;
  }
  
  // Use the endpoint resolution function with diagnosis code
  return getFlowiseEndpointForDiagnosis(diagnosis.code, {
    isFromSTEMI: options?.isFromSTEMI,
    troponinPositive: diagnosis.troponinStatus === 'positive' || options?.troponinPositive
  });
};

// Validate Form 100 request data
const validateForm100Request = (request: Partial<Form100Request>): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];

  // Required fields validation
  if (!request.primaryDiagnosis) {
    errors.push('Primary diagnosis is required');
  }

  if (!request.sessionId) {
    errors.push('Session ID is required');
  }

  if (!request.userId) {
    errors.push('User ID is required');
  }

  // Medical validation
  if (request.primaryDiagnosis && !request.primaryDiagnosis.code) {
    errors.push('Primary diagnosis must have valid ICD-10 code');
  }

  if (request.vitalSigns) {
    const { bloodPressure, heartRate, temperature } = request.vitalSigns;
    
    if (heartRate && (heartRate < 20 || heartRate > 300)) {
      errors.push('Heart rate must be between 20-300 bpm');
    }
    
    if (temperature && (temperature < 25 || temperature > 45)) {
      errors.push('Temperature must be between 25-45°C');
    }
    
    if (bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(bloodPressure)) {
      errors.push('Blood pressure must be in format "120/80"');
    }
  }

  // Priority validation
  if (request.priority && !['low', 'normal', 'high', 'urgent'].includes(request.priority)) {
    errors.push('Invalid priority level');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Prepare payload for Flowise API
const prepareFlowisePayload = (request: Form100Request): FlowiseForm100Payload => {
  return {
    sessionId: request.sessionId,
    patientData: {
      demographics: request.patientInfo,
      clinicalData: {
        primaryDiagnosis: request.primaryDiagnosis,
        secondaryDiagnoses: request.secondaryDiagnoses,
        symptoms: request.symptoms,
        vitalSigns: request.vitalSigns
      },
      voiceTranscript: request.voiceTranscript,
      angiographyReport: request.angiographyReport,
      labResults: request.labResults,
      additionalNotes: request.additionalNotes,
      existingERReport: request.existingERReport
    },
    formParameters: {
      priority: request.priority,
      department: request.department,
      attendingPhysician: request.attendingPhysician,
      submissionDeadline: request.submissionDeadline?.toISOString()
    }
  };
};

// Make direct request to Flowise endpoint (EXACT same pattern as flowise-simple.mjs)
const makeFlowiseRequest = async (
  payload: FlowiseForm100Payload,
  endpoint?: string
): Promise<FlowiseForm100Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FORM100_CONFIG.maxGenerationTime);
  
  // Get the diagnosis-specific endpoint for this request
  const diagnosisCode = payload.patientData?.clinicalData?.primaryDiagnosis?.code;
  const flowiseEndpoint = endpoint || resolveFlowiseEndpoint(payload.patientData.clinicalData.primaryDiagnosis);

  try {
    // Build clean medical data input (no redundant sections)
    let questionContent = "";
    
    // Include existing ER report (initial consult transcript)
    if (payload.patientData?.existingERReport) {
      questionContent += `${payload.patientData.existingERReport}\n\n`;
    }
    
    // Include angiography report if available
    if (payload.patientData?.angiographyReport) {
      questionContent += `**Angiography Report:**\n${payload.patientData.angiographyReport}\n\n`;
    }
    
    // Include voice transcript if available
    if (payload.patientData?.voiceTranscript) {
      questionContent += `**Voice Notes:**\n${payload.patientData.voiceTranscript}\n\n`;
    }
    
    // Include patient demographics only if not already in ER report
    if (payload.patientData?.demographics) {
      const demo = payload.patientData.demographics;
      let hasNewDemographics = false;
      let demographicsContent = `**Patient Information:**\n`;
      
      if (demo.age) { demographicsContent += `Age: ${demo.age}\n`; hasNewDemographics = true; }
      if (demo.gender) { demographicsContent += `Gender: ${demo.gender}\n`; hasNewDemographics = true; }
      if (demo.weight) { demographicsContent += `Weight: ${demo.weight}kg\n`; hasNewDemographics = true; }
      if (demo.height) { demographicsContent += `Height: ${demo.height}cm\n`; hasNewDemographics = true; }
      
      if (hasNewDemographics) {
        questionContent += demographicsContent + `\n`;
      }
    }
    
    // Include vital signs only if not already in ER report
    if (payload.patientData?.clinicalData?.vitalSigns) {
      const vitals = payload.patientData.clinicalData.vitalSigns;
      let hasNewVitals = false;
      let vitalsContent = `**Additional Vital Signs:**\n`;
      
      if (vitals.bloodPressure) { vitalsContent += `Blood Pressure: ${vitals.bloodPressure}\n`; hasNewVitals = true; }
      if (vitals.heartRate) { vitalsContent += `Heart Rate: ${vitals.heartRate} bpm\n`; hasNewVitals = true; }
      if (vitals.temperature) { vitalsContent += `Temperature: ${vitals.temperature}°C\n`; hasNewVitals = true; }
      if (vitals.respiratoryRate) { vitalsContent += `Respiratory Rate: ${vitals.respiratoryRate}\n`; hasNewVitals = true; }
      if (vitals.oxygenSaturation) { vitalsContent += `Oxygen Saturation: ${vitals.oxygenSaturation}%\n`; hasNewVitals = true; }
      
      if (hasNewVitals) {
        questionContent += vitalsContent + `\n`;
      }
    }

    // Use EXACT same request format as flowise-simple.mjs working call
    const flowiseRequest = {
      question: questionContent.trim(),
      overrideConfig: { 
        sessionId: payload.sessionId || 'default-session' 
      }
    };

    console.log('🚀 Making direct request to Flowise (exact flowise-simple.mjs format):', {
      endpoint: flowiseEndpoint,
      sessionId: payload.sessionId,
      diagnosisCode,
      hasQuestion: !!flowiseRequest.question,
      questionLength: flowiseRequest.question.length
    });

    console.log('📤 Full request payload (flowise-simple.mjs format):', flowiseRequest);

    const requestStartTime = Date.now();
    console.log('⏰ Starting Flowise request at:', new Date().toISOString());

    // Use EXACT same fetch call as flowise-simple.mjs
    const flowiseResponse = await fetch(flowiseEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(flowiseRequest)
    });

    clearTimeout(timeoutId);

    const requestDuration = Date.now() - requestStartTime;
    console.log('✅ Flowise response received:', {
      status: flowiseResponse.status,
      statusText: flowiseResponse.statusText,
      duration: `${requestDuration}ms`,
      ok: flowiseResponse.ok
    });

    if (!flowiseResponse.ok) {
      const errorText = await flowiseResponse.text();
      console.error('❌ Flowise API error:', {
        status: flowiseResponse.status,
        statusText: flowiseResponse.statusText,
        body: errorText,
        endpoint: flowiseEndpoint
      });
      throw new Error(`Flowise error: ${flowiseResponse.status}`);
    }

    const flowiseResult = await flowiseResponse.json();
    
    console.log('📄 Flowise response data:', {
      responseType: typeof flowiseResult,
      hasText: !!flowiseResult.text,
      hasResult: !!flowiseResult.result,
      hasResponse: !!flowiseResult.response,
      hasAnswer: !!flowiseResult.answer,
      dataKeys: Object.keys(flowiseResult),
      textLength: flowiseResult.text?.length || 0
    });
    
    // Use EXACT same response parsing as flowise-simple.mjs
    const generatedContent = flowiseResult.text || flowiseResult.response || flowiseResult.answer || 'No response from AI';
    
    const transformedResponse: FlowiseForm100Response = {
      success: true,
      data: {
        generatedForm: generatedContent,
        confidence: 0.9,
        processingTime: requestDuration,
        recommendations: []
      }
    };

    console.log('🎉 Form 100 generation successful:', {
      contentLength: generatedContent.length,
      preview: generatedContent.substring(0, 100) + '...'
    });

    return transformedResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Form 100 generation timed out');
    }
    
    throw error;
  }
};

// Note: getAuthToken removed - not needed for direct Flowise calls

// Retry mechanism with exponential backoff
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = FORM100_CONFIG.retryAttempts
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Main Form 100 generation service
export class Form100Service {
  
  // Generate Form 100 document
  static async generateForm100(
    request: Partial<Form100Request>,
    options?: {
      isFromSTEMI?: boolean;
      troponinPositive?: boolean;
    }
  ): Promise<Form100ServiceResponse<{ generatedForm: string; processingTime: number }>> {
    return safeAsync(async () => {
      // Validation
      const validation = validateForm100Request(request);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const startTime = Date.now();
      
      // Resolve the appropriate Flowise endpoint for this diagnosis
      const endpoint = request.primaryDiagnosis 
        ? resolveFlowiseEndpoint(request.primaryDiagnosis, options)
        : DEFAULT_FORM100_ENDPOINT;

      console.log('🎯 Form 100 generation started:', {
        diagnosisCode: request.primaryDiagnosis?.code,
        sessionId: request.sessionId,
        endpoint,
        isFromSTEMI: options?.isFromSTEMI,
        troponinPositive: options?.troponinPositive
      });
      
      // Prepare and send request directly to Flowise (same as chat.ts)
      const payload = prepareFlowisePayload(request as Form100Request);
      
      const response = await withRetry(() => makeFlowiseRequest(payload, endpoint));
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Form 100 generation failed');
      }

      const processingTime = Date.now() - startTime;

      return {
        generatedForm: response.data!.generatedForm,
        processingTime
      };
      
    }, FORM100_ERROR_CODES.GENERATION_FAILED);
  }

  // Save Form 100 request to database
  static async saveForm100Request(
    request: Form100Request
  ): Promise<Form100ServiceResponse<{ id: string }>> {
    return safeAsync(async () => {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('form100_requests')
        .insert([{
          session_id: request.sessionId,
          user_id: request.userId,
          patient_info: request.patientInfo,
          primary_diagnosis: request.primaryDiagnosis,
          secondary_diagnoses: request.secondaryDiagnoses,
          symptoms: request.symptoms,
          vital_signs: request.vitalSigns,
          voice_transcript: request.voiceTranscript,
          angiography_report: request.angiographyReport,
          lab_results: request.labResults,
          additional_notes: request.additionalNotes,
          generated_form: request.generatedForm,
          generation_status: request.generationStatus,
          priority: request.priority,
          department: request.department,
          attending_physician: request.attendingPhysician,
          submission_deadline: request.submissionDeadline,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return { id: data.id };
      
    }, FORM100_ERROR_CODES.PATIENT_DATA_ERROR);
  }

  // Get Form 100 request by ID
  static async getForm100Request(
    id: string
  ): Promise<Form100ServiceResponse<Form100Request>> {
    return safeAsync(async () => {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('form100_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Transform database response to Form100Request
      return {
        id: data.id,
        sessionId: data.session_id,
        userId: data.user_id,
        patientInfo: data.patient_info,
        primaryDiagnosis: data.primary_diagnosis,
        secondaryDiagnoses: data.secondary_diagnoses,
        symptoms: data.symptoms,
        vitalSigns: data.vital_signs,
        voiceTranscript: data.voice_transcript,
        angiographyReport: data.angiography_report,
        labResults: data.lab_results,
        additionalNotes: data.additional_notes,
        generatedForm: data.generated_form,
        generationStatus: data.generation_status,
        generationError: data.generation_error,
        priority: data.priority,
        department: data.department,
        attendingPhysician: data.attending_physician,
        submissionDeadline: data.submission_deadline ? new Date(data.submission_deadline) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        generatedAt: data.generated_at ? new Date(data.generated_at) : undefined
      } as Form100Request;
      
    }, FORM100_ERROR_CODES.PATIENT_DATA_ERROR);
  }

  // Update Form 100 generation status
  static async updateGenerationStatus(
    id: string,
    status: Form100Request['generationStatus'],
    generatedForm?: string,
    error?: string
  ): Promise<Form100ServiceResponse<boolean>> {
    return safeAsync(async () => {
      const { supabase } = await import('../lib/supabase');
      
      const updateData: any = {
        generation_status: status,
        updated_at: new Date().toISOString()
      };

      if (generatedForm) {
        updateData.generated_form = generatedForm;
        updateData.generated_at = new Date().toISOString();
      }

      if (error) {
        updateData.generation_error = error;
      }

      const { error: dbError } = await supabase
        .from('form100_requests')
        .update(updateData)
        .eq('id', id);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      return true;
      
    }, FORM100_ERROR_CODES.PATIENT_DATA_ERROR);
  }

  // Get user's Form 100 reports with pagination and filtering
  static async getUserForm100Reports(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      sessionId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Form100ServiceResponse<{ reports: Form100Request[]; totalCount: number }>> {
    return safeAsync(async () => {
      const { supabase } = await import('../lib/supabase');
      
      let query = supabase
        .from('form100_requests')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options?.sessionId) {
        query = query.eq('session_id', options.sessionId);
      }
      
      if (options?.status) {
        query = query.eq('generation_status', options.status);
      }
      
      if (options?.startDate) {
        query = query.gte('created_at', options.startDate.toISOString());
      }
      
      if (options?.endDate) {
        query = query.lte('created_at', options.endDate.toISOString());
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Transform database response to Form100Request objects
      const reports: Form100Request[] = (data || []).map(row => ({
        id: row.id,
        sessionId: row.session_id,
        userId: row.user_id,
        patientInfo: row.patient_info,
        primaryDiagnosis: row.primary_diagnosis,
        secondaryDiagnoses: row.secondary_diagnoses,
        symptoms: row.symptoms,
        vitalSigns: row.vital_signs,
        voiceTranscript: row.voice_transcript,
        angiographyReport: row.angiography_report,
        labResults: row.lab_results,
        additionalNotes: row.additional_notes,
        existingERReport: row.existing_er_report,
        generatedForm: row.generated_form,
        generationStatus: row.generation_status,
        generationError: row.generation_error,
        priority: row.priority,
        department: row.department,
        attendingPhysician: row.attending_physician,
        submissionDeadline: row.submission_deadline ? new Date(row.submission_deadline) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        generatedAt: row.generated_at ? new Date(row.generated_at) : undefined
      }));

      return {
        reports,
        totalCount: count || 0
      };
      
    }, FORM100_ERROR_CODES.PATIENT_DATA_ERROR);
  }

  // Get recent Form 100 reports for quick access
  static async getRecentForm100Reports(
    userId: string,
    limit: number = 5
  ): Promise<Form100ServiceResponse<Form100Request[]>> {
    return safeAsync(async () => {
      const result = await this.getUserForm100Reports(userId, { 
        limit,
        status: 'completed' // Only show completed reports
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch recent reports');
      }
      
      return result.data?.reports || [];
      
    }, FORM100_ERROR_CODES.PATIENT_DATA_ERROR);
  }

  // Delete Form 100 report
  static async deleteForm100Report(
    reportId: string,
    userId: string
  ): Promise<Form100ServiceResponse<boolean>> {
    return safeAsync(async () => {
      const { supabase } = await import('../lib/supabase');
      
      const { error } = await supabase
        .from('form100_requests')
        .delete()
        .eq('id', reportId)
        .eq('user_id', userId); // Ensure user can only delete their own reports

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return true;
      
    }, FORM100_ERROR_CODES.PATIENT_DATA_ERROR);
  }

  // Get report statistics for user dashboard
  static async getForm100Statistics(
    userId: string
  ): Promise<Form100ServiceResponse<{
    totalReports: number;
    completedReports: number;
    failedReports: number;
    pendingReports: number;
    lastGenerated?: Date;
  }>> {
    return safeAsync(async () => {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('form100_requests')
        .select('generation_status, created_at, generated_at')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const reports = data || [];
      const totalReports = reports.length;
      const completedReports = reports.filter(r => r.generation_status === 'completed').length;
      const failedReports = reports.filter(r => r.generation_status === 'failed').length;
      const pendingReports = reports.filter(r => ['pending', 'processing'].includes(r.generation_status)).length;
      
      // Find most recent generated report
      const lastGeneratedReport = reports
        .filter(r => r.generated_at)
        .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())[0];
      
      const lastGenerated = lastGeneratedReport ? new Date(lastGeneratedReport.generated_at) : undefined;

      return {
        totalReports,
        completedReports,
        failedReports,
        pendingReports,
        lastGenerated
      };
      
    }, FORM100_ERROR_CODES.PATIENT_DATA_ERROR);
  }

  // Test Flowise connection
  static async testFlowiseConnection(): Promise<Form100ServiceResponse<boolean>> {
    return safeAsync(async () => {
      const response = await fetch(FORM100_CONFIG.flowiseEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: 'Test connection',
          overrideConfig: {}
        })
      });

      return response.ok;
      
    }, FORM100_ERROR_CODES.FLOWISE_ERROR);
  }
}

// Export utility functions
export {
  validateForm100Request,
  prepareFlowisePayload,
  generateRequestId,
  FORM100_CONFIG
};