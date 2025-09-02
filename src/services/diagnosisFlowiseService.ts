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

const DIAGNOSIS_API_URL = "https://flowise-2-0.onrender.com/api/v1/prediction/89920f52-74cb-46bc-bf6c-b9099746dfe9";

/**
 * Formats the transcript with diagnosis context for the Flowise agent
 */
function formatDiagnosisRequest(transcript: string, diagnosis: DiagnosisContext): string {
  const context = `
MEDICAL CONSULTATION TRANSCRIPT FOR DIAGNOSIS ANALYSIS

Patient Consultation Context:
- Primary Diagnosis: ${diagnosis.diagnosisEnglish} (${diagnosis.diagnosisGeorgian})
- ICD-10 Code: ${diagnosis.icdCode}
- Medical Specialty: ${diagnosis.specialty}
- Consultation Type: Emergency Department / Cardiology Assessment

TRANSCRIPT:
${transcript}

REQUESTED ANALYSIS:
Please generate a comprehensive Cardiologist's Emergency Room consultation report based on this transcript. The report should include:

1. CLINICAL SUMMARY
   - Chief complaint and presenting symptoms
   - Vital signs and initial assessment
   - Cardiac examination findings

2. DIAGNOSTIC ASSESSMENT
   - Primary diagnosis: ${diagnosis.icdCode} - ${diagnosis.diagnosisEnglish}
   - Supporting clinical evidence from transcript
   - Differential diagnoses considered

3. TREATMENT PLAN
   - Immediate interventions performed/recommended
   - Medication management
   - Follow-up care instructions

4. RISK STRATIFICATION
   - Acute cardiac risk assessment
   - Prognosis and complications to monitor

5. DISPOSITION
   - Admission recommendations
   - Discharge planning if applicable
   - Emergency return precautions

Please format this as a formal medical consultation report suitable for medical records and colleague communication.
  `.trim();

  return context;
}

/**
 * Calls the diagnosis Flowise agent for heart failure consultation reports
 */
export async function generateDiagnosisReport(
  transcript: string,
  diagnosis: DiagnosisContext
): Promise<{ success: true; report: string } | { success: false; error: string }> {
  try {
    if (!transcript.trim()) {
      return {
        success: false,
        error: 'Transcript is required for diagnosis report generation'
      };
    }

    const formattedRequest = formatDiagnosisRequest(transcript, diagnosis);
    
    const requestPayload: DiagnosisFlowiseRequest = {
      question: formattedRequest
    };

    console.log('🏥 Sending diagnosis request to Flowise agent:', {
      diagnosis: diagnosis.diagnosisEnglish,
      icdCode: diagnosis.icdCode,
      transcriptLength: transcript.length
    });

    const response = await fetch(DIAGNOSIS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Flowise diagnosis API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`
      };
    }

    const data: DiagnosisFlowiseResponse = await response.json();
    
    if (!data.text) {
      console.error('❌ Invalid response from diagnosis API:', data);
      return {
        success: false,
        error: 'Invalid response format from diagnosis API'
      };
    }

    console.log('✅ Diagnosis report generated successfully:', {
      reportLength: data.text.length,
      hasSourceDocuments: !!data.sourceDocuments
    });

    return {
      success: true,
      report: data.text
    };

  } catch (error) {
    console.error('❌ Error generating diagnosis report:', error);
    
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
 * Generate heart failure consultation report
 * Convenience function for the specific heart failure diagnosis
 */
export async function generateHeartFailureReport(transcript: string) {
  return generateDiagnosisReport(transcript, HEART_FAILURE_DIAGNOSIS);
}

/**
 * Check if a template instruction is for diagnosis processing
 */
export function isDiagnosisTemplate(instruction: string): boolean {
  return instruction.toLowerCase().includes('diagnosis') && 
         instruction.toLowerCase().includes('i50.0');
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
  
  return null;
}