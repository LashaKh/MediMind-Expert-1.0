/**
 * Diagnosis Flowise Service
 * 
 * Service for generating Cardiologist ER consultation reports using 
 * the specialized Flowise agent for medical diagnosis analysis.
 */

interface DiagnosisFlowiseRequest {
  question: string;
}

interface DiagnosisFlowiseResponse {
  text: string;
  sourceDocuments?: any[];
  [key: string]: any;
}

interface DiagnosisContext {
  icdCode: string;
  diagnosisGeorgian: string;
  diagnosisEnglish: string;
  specialty: string;
}

// Blue card (Heart Failure) endpoint
const HEART_FAILURE_API_URL = "https://flowise-2-0.onrender.com/api/v1/prediction/89920f52-74cb-46bc-bf6c-b9099746dfe9";

// Red card (NSTEMI) endpoint  
const NSTEMI_API_URL = "https://flowise-2-0.onrender.com/api/v1/prediction/3db46c83-334b-4ffc-9112-5d30e43f7cf4";

/**
 * Formats the transcript with diagnosis context for the Flowise agent
 */
function formatDiagnosisRequest(transcript: string, diagnosis: DiagnosisContext): string {
  // Use the same simple prompt format as regular processing
  return `Please generate a comprehensive cardiologist's consultation report based on this transcript. Follow the examples and instructions on how the report should look, and make sure it's in Georgian as in the examples.

${transcript}`;
}

/**
 * Calls the diagnosis Flowise agent for heart failure consultation reports
 */
export async function generateDiagnosisReport(
  transcript: string,
  diagnosis: DiagnosisContext
): Promise<{ success: true; report: string } | { success: false; error: string }> {
  console.log('🔬 Diagnosis service: Starting report generation');
  console.log('📋 Input:', {
    transcriptLength: transcript.length,
    diagnosis: diagnosis.diagnosisEnglish,
    icdCode: diagnosis.icdCode
  });
  
  try {
    if (!transcript.trim()) {
      const error = 'Transcript is required for diagnosis report generation';
      console.error('❌ Diagnosis service error:', error);
      return {
        success: false,
        error
      };
    }

    // Select the correct endpoint based on diagnosis type
    const apiUrl = diagnosis.icdCode === 'I50.0' ? HEART_FAILURE_API_URL : NSTEMI_API_URL;
    console.log('🌐 API URL selected:', apiUrl);

    const formattedRequest = formatDiagnosisRequest(transcript, diagnosis);
    console.log('📄 Formatted request length:', formattedRequest.length);
    
    const requestPayload: DiagnosisFlowiseRequest = {
      question: formattedRequest
    };

    console.log('🚀 Making API request to diagnosis endpoint...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Diagnosis API request failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500)
      });
      
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`
      };
    }

    const data: DiagnosisFlowiseResponse = await response.json();
    console.log('📥 API Response received:', {
      hasText: !!data.text,
      textLength: data.text?.length || 0,
      responseKeys: Object.keys(data)
    });
    
    if (!data.text) {
      console.error('❌ Invalid response format from diagnosis API:', data);
      return {
        success: false,
        error: 'Invalid response format from diagnosis API'
      };
    }

    console.log('✅ Diagnosis report generated successfully');
    return {
      success: true,
      report: data.text
    };

  } catch (error) {
    console.error('🚨 Fatal error in diagnosis service:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : 'Unknown error occurred while generating diagnosis report'
    };
  }
}

/**
 * Heart failure diagnosis context
 */
export const HEART_FAILURE_DIAGNOSIS: DiagnosisContext = {
  icdCode: 'I50.0',
  diagnosisGeorgian: 'გულის შეგუბებითი უკმარისობა',
  diagnosisEnglish: 'Congestive Heart Failure',
  specialty: 'Cardiology'
};

/**
 * NSTEMI diagnosis context
 */
export const NSTEMI_DIAGNOSIS: DiagnosisContext = {
  icdCode: 'I24.9',
  diagnosisGeorgian: 'გულის მწვავე იშემიური ავადმყოფობა, დაუზუსტებელი',
  diagnosisEnglish: 'Non-ST elevation myocardial infarction',
  specialty: 'Cardiology'
};

/**
 * Generate heart failure consultation report
 * Convenience function for the specific heart failure diagnosis
 */
export async function generateHeartFailureReport(transcript: string) {
  return generateDiagnosisReport(transcript, HEART_FAILURE_DIAGNOSIS);
}

/**
 * Generate NSTEMI consultation report
 * Convenience function for the specific NSTEMI diagnosis
 */
export async function generateNSTEMIReport(transcript: string) {
  return generateDiagnosisReport(transcript, NSTEMI_DIAGNOSIS);
}

/**
 * Check if a template instruction is for diagnosis processing
 */
export function isDiagnosisTemplate(instruction: string): boolean {
  return instruction.toLowerCase().includes('diagnosis') && 
         (instruction.toLowerCase().includes('i50.0') || 
          instruction.toLowerCase().includes('i24.9'));
}

/**
 * Extract diagnosis information from instruction
 */
export function extractDiagnosisFromInstruction(instruction: string): DiagnosisContext | null {
  if (instruction.toLowerCase().includes('i50.0') || 
      instruction.toLowerCase().includes('heart failure') ||
      instruction.toLowerCase().includes('გულის შეგუბებითი უკმარისობა')) {
    return HEART_FAILURE_DIAGNOSIS;
  }
  
  if (instruction.toLowerCase().includes('i24.9') || 
      instruction.toLowerCase().includes('nstemi') ||
      instruction.toLowerCase().includes('გულის მწვავე იშემიური ავადმყოფობა')) {
    return NSTEMI_DIAGNOSIS;
  }
  
  return null;
}