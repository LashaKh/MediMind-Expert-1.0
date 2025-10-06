/**
 * Diagnosis Flowise Service
 * 
 * Service for generating Cardiologist ER consultation reports using 
 * the specialized Flowise agent for medical diagnosis analysis.
 */

import type { UserReportTemplate } from '../types/templates';

// Flowise API request format - backend ONLY accepts "question" field
// We encode structured metadata (cardTitle, type, etc.) within the question text
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

// UNIFIED ENDPOINT - All requests (Initial Consults, Templates, Form 100) use this single endpoint
const UNIFIED_API_URL = "https://flowise-2-0.onrender.com/api/v1/prediction/0dfbbc44-76d0-451f-b7ca-92a96f862924";

/**
 * Formats the diagnosis request for the Flowise agent
 * Converts structured data into the "question" format required by Flowise backend
 */
function formatDiagnosisRequest(
  transcript: string,
  diagnosis: DiagnosisContext,
  cardTitle: string
): { question: string } {
  // Flowise backend requires "question" field format
  // We encode our structured metadata within the question text
  const questionContent = `Card Title: ${cardTitle}
Type: Initial Consult
Diagnosis Code: ${diagnosis.icdCode}

${transcript}`;

  return {
    question: questionContent
  };
}

/**
 * Calls the diagnosis Flowise agent for consultation reports with structured JSON request
 */
export async function generateDiagnosisReport(
  transcript: string,
  diagnosis: DiagnosisContext,
  cardTitle: string
): Promise<{ success: true; report: string } | { success: false; error: string }> {
  console.log('🔬 Diagnosis service: Starting report generation');
  console.log('📋 Input:', {
    transcriptLength: transcript.length,
    diagnosis: diagnosis.diagnosisEnglish,
    icdCode: diagnosis.icdCode,
    cardTitle
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

    // Use unified endpoint for all requests
    console.log('🌐 Using unified API endpoint:', UNIFIED_API_URL);

    const requestPayload = formatDiagnosisRequest(
      transcript,
      diagnosis,
      cardTitle
    );

    console.log('📄 Request metadata:', {
      cardTitle,
      type: 'Initial Consult',
      diagnosisCode: diagnosis.icdCode,
      transcriptLength: transcript.length,
      questionLength: requestPayload.question.length
    });

    // Log the FULL request being sent to Flowise for debugging
    console.log('📨 FULL Flowise Request Being Sent:');
    console.log(JSON.stringify(requestPayload, null, 2));
    console.log('🌐 Target Endpoint:', UNIFIED_API_URL);

    console.log('🚀 Making API request to unified endpoint...');
    const response = await fetch(UNIFIED_API_URL, {
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

    // Debug: Check the actual response content
    console.log('🔍 DEBUG - API Response Content Analysis:', {
      contentPreview: data.text?.substring(0, 300) + '...',
      hasGeorgianChars: /[\u10A0-\u10FF]/.test(data.text || ''),
      contentLanguage: /[\u10A0-\u10FF]/.test(data.text || '') ? 'Georgian detected' : 'No Georgian detected'
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
 * Acute Ischaemic Heart Disease diagnosis context
 */
export const ACUTE_ISCHAEMIC_DIAGNOSIS: DiagnosisContext = {
  icdCode: 'I24.9',
  diagnosisGeorgian: 'გულის მწვავე იშემიური ავადმყოფობა, დაუზუსტებელი',
  diagnosisEnglish: 'Acute ischaemic heart disease, unspecified',
  specialty: 'Cardiology'
};

/**
 * Pulmonary embolism diagnosis context
 */
export const PULMONARY_EMBOLISM_DIAGNOSIS: DiagnosisContext = {
  icdCode: 'I26.0',
  diagnosisGeorgian: 'ფილტვის არტერიის ემბოლია მწვავე ფილტვისმიერი გულის დროს',
  diagnosisEnglish: 'Pulmonary embolism with acute cor pulmonale',
  specialty: 'Cardiology'
};

/**
 * STEMI diagnosis context
 */
export const STEMI_DIAGNOSIS: DiagnosisContext = {
  icdCode: 'I21.0',
  diagnosisGeorgian: 'ST ელევაციური მიოკარდიუმის ინფარქტი',
  diagnosisEnglish: 'ST elevation myocardial infarction',
  specialty: 'Cardiology'
};

/**
 * Angina Pectoris diagnosis context
 */
export const ANGINA_PECTORIS_DIAGNOSIS: DiagnosisContext = {
  icdCode: 'I20.8',
  diagnosisGeorgian: 'სტენოკარდიის სხვა ფორმები (Planned Angiography)',
  diagnosisEnglish: 'Other forms of angina pectoris',
  specialty: 'Cardiology'
};

/**
 * AV Block and Bradyarrhythmia diagnosis context
 */
export const AV_BLOCK_DIAGNOSIS: DiagnosisContext = {
  icdCode: 'I44.(-)',
  diagnosisGeorgian: 'სრული/არასრული AV ბლოკადა და ბრადიარითმიები',
  diagnosisEnglish: 'Complete/Incomplete AV block and bradyarrhythmias',
  specialty: 'Cardiology'
};

/**
 * Generate heart failure consultation report
 * Convenience function for the specific heart failure diagnosis
 */
export async function generateHeartFailureReport(transcript: string, cardTitle?: string) {
  const title = cardTitle || `Initial Diagnosis - (I50.0) ${HEART_FAILURE_DIAGNOSIS.diagnosisGeorgian}`;
  return generateDiagnosisReport(transcript, HEART_FAILURE_DIAGNOSIS, title);
}

/**
 * Generate Acute Ischaemic Heart Disease consultation report
 * Convenience function for the specific Acute Ischaemic Heart Disease diagnosis
 */
export async function generateAcuteIschaemicReport(transcript: string, cardTitle?: string) {
  const title = cardTitle || `Initial Diagnosis - (I24.9) ${ACUTE_ISCHAEMIC_DIAGNOSIS.diagnosisGeorgian}`;
  return generateDiagnosisReport(transcript, ACUTE_ISCHAEMIC_DIAGNOSIS, title);
}

/**
 * Generate pulmonary embolism consultation report
 * Convenience function for the specific pulmonary embolism diagnosis
 */
export async function generatePulmonaryEmbolismReport(transcript: string, cardTitle?: string) {
  const title = cardTitle || `Initial Diagnosis - (I26.0) ${PULMONARY_EMBOLISM_DIAGNOSIS.diagnosisGeorgian}`;
  return generateDiagnosisReport(transcript, PULMONARY_EMBOLISM_DIAGNOSIS, title);
}

/**
 * Generate STEMI consultation report
 * Convenience function for the specific STEMI diagnosis
 */
export async function generateSTEMIReport(transcript: string, cardTitle?: string) {
  const title = cardTitle || `Initial Diagnosis - (I21.0) ${STEMI_DIAGNOSIS.diagnosisGeorgian}`;
  return generateDiagnosisReport(transcript, STEMI_DIAGNOSIS, title);
}

/**
 * Check if a template instruction is for diagnosis processing
 */
export function isDiagnosisTemplate(instruction: string): boolean {
  return instruction.toLowerCase().includes('diagnosis') &&
         (instruction.toLowerCase().includes('i50.0') ||
          instruction.toLowerCase().includes('i24.9') ||
          instruction.toLowerCase().includes('i26.0') ||
          instruction.toLowerCase().includes('i21.0') ||
          instruction.toLowerCase().includes('i20.8') ||
          instruction.toLowerCase().includes('i44'));
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
      instruction.toLowerCase().includes('acute ischaemic') ||
      instruction.toLowerCase().includes('acute ischemic') ||
      instruction.toLowerCase().includes('გულის მწვავე იშემიური ავადმყოფობა')) {
    return ACUTE_ISCHAEMIC_DIAGNOSIS;
  }

  if (instruction.toLowerCase().includes('i26.0') ||
      instruction.toLowerCase().includes('pulmonary embolism') ||
      instruction.toLowerCase().includes('ფილტვის არტერიის ემბოლია')) {
    return PULMONARY_EMBOLISM_DIAGNOSIS;
  }

  if (instruction.toLowerCase().includes('i21.0') ||
      instruction.toLowerCase().includes('stemi') ||
      instruction.toLowerCase().includes('st elevation') ||
      instruction.toLowerCase().includes('st ელევაციური მიოკარდიუმის ინფარქტი')) {
    return STEMI_DIAGNOSIS;
  }

  if (instruction.toLowerCase().includes('i20.8') ||
      instruction.toLowerCase().includes('angina pectoris') ||
      instruction.toLowerCase().includes('სტენოკარდიის სხვა ფორმები')) {
    return ANGINA_PECTORIS_DIAGNOSIS;
  }

  if (instruction.toLowerCase().includes('i44') ||
      instruction.toLowerCase().includes('av block') ||
      instruction.toLowerCase().includes('bradyarrhythmia') ||
      instruction.toLowerCase().includes('av ბლოკადა')) {
    return AV_BLOCK_DIAGNOSIS;
  }

  return null;
}

/**
 * Generate report with custom template using unified endpoint with question format
 */
export async function generateTemplateBasedReport(
  transcript: string,
  template: UserReportTemplate
): Promise<{ success: true; report: string } | { success: false; error: string }> {
  try {
    if (!transcript.trim()) {
      return {
        success: false,
        error: 'Transcript is required for template-based report generation'
      };
    }

    // Flowise backend requires "question" field format
    // Include the full template structure so AI knows how to format the report
    const questionContent = `Card Title: Template
Type: Custom Template Report
Template Name: ${template.name}

TEMPLATE STRUCTURE (Follow this format exactly):
${template.example_structure}
${template.notes ? `\n\nADDITIONAL NOTES:\n${template.notes}` : ''}

PATIENT TRANSCRIPT:
${transcript}

INSTRUCTIONS: Generate a medical report following the TEMPLATE STRUCTURE above, using the information from the PATIENT TRANSCRIPT.`;

    const requestPayload = {
      question: questionContent
    };

    const response = await fetch(UNIFIED_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Template API request failed:', response.status, response.statusText);

      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`
      };
    }

    const data: DiagnosisFlowiseResponse = await response.json();

    if (!data.text) {
      console.error('Invalid response format from template API');
      return {
        success: false,
        error: 'Invalid response format from template API'
      };
    }

    return {
      success: true,
      report: data.text
    };

  } catch (error) {
    console.error('🚨 Fatal error in template service:', error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Unknown error occurred while generating template-based report'
    };
  }
}