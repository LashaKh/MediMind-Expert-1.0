/**
 * Diagnosis Flowise Service
 * 
 * Service for generating Cardiologist ER consultation reports using 
 * the specialized Flowise agent for medical diagnosis analysis.
 */

import type { UserReportTemplate } from '../types/templates';

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

// Pulmonary embolism (I26.0) endpoint
const PULMONARY_EMBOLISM_API_URL = "https://flowise-2-0.onrender.com/api/v1/prediction/3602b392-65e5-4dbd-a649-cac18280bea5";

// General template processing endpoint
const GENERAL_TEMPLATE_API_URL = "https://flowise-2-0.onrender.com/api/v1/prediction/f27756ae-aa35-4af3-afd1-f6912f9103cf";

/**
 * Formats the transcript with diagnosis context and optional template for the Flowise agent
 */
function formatDiagnosisRequest(
  transcript: string, 
  diagnosis: DiagnosisContext, 
  template?: UserReportTemplate
): string {
  let prompt = `Please generate a comprehensive cardiologist's consultation report based on this transcript. Follow the examples and instructions on how the report should look, and make sure it's in Georgian as in the examples.`;
  
  // If a template is provided, include its structure and guidance
  if (template) {
    prompt += `\n\nUse this template structure as a guide for the report format:
${template.example_structure}`;
    
    // Add template notes if available
    if (template.notes?.trim()) {
      prompt += `\n\nAdditional guidance: ${template.notes}`;
    }
  }
  
  prompt += `\n\n${transcript}`;
  
  return prompt;
}

/**
 * Calls the diagnosis Flowise agent for consultation reports with optional custom template
 */
export async function generateDiagnosisReport(
  transcript: string,
  diagnosis: DiagnosisContext,
  template?: UserReportTemplate
): Promise<{ success: true; report: string } | { success: false; error: string }> {
  console.log('🔬 Diagnosis service: Starting report generation');
  console.log('📋 Input:', {
    transcriptLength: transcript.length,
    diagnosis: diagnosis.diagnosisEnglish,
    icdCode: diagnosis.icdCode,
    templateName: template?.name || 'none'
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
    let apiUrl: string;
    if (diagnosis.icdCode === 'I50.0') {
      apiUrl = HEART_FAILURE_API_URL;
    } else if (diagnosis.icdCode === 'I24.9') {
      apiUrl = NSTEMI_API_URL;
    } else if (diagnosis.icdCode === 'I26.0') {
      apiUrl = PULMONARY_EMBOLISM_API_URL;
    } else {
      // Fallback to NSTEMI for unknown codes
      apiUrl = NSTEMI_API_URL;
    }
    console.log('🌐 API URL selected:', apiUrl);

    const formattedRequest = formatDiagnosisRequest(transcript, diagnosis, template);
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
 * NSTEMI diagnosis context
 */
export const NSTEMI_DIAGNOSIS: DiagnosisContext = {
  icdCode: 'I24.9',
  diagnosisGeorgian: 'გულის მწვავე იშემიური ავადმყოფობა, დაუზუსტებელი',
  diagnosisEnglish: 'Non-ST elevation myocardial infarction',
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
 * Generate heart failure consultation report
 * Convenience function for the specific heart failure diagnosis
 */
export async function generateHeartFailureReport(transcript: string, template?: UserReportTemplate) {
  return generateDiagnosisReport(transcript, HEART_FAILURE_DIAGNOSIS, template);
}

/**
 * Generate NSTEMI consultation report
 * Convenience function for the specific NSTEMI diagnosis
 */
export async function generateNSTEMIReport(transcript: string, template?: UserReportTemplate) {
  return generateDiagnosisReport(transcript, NSTEMI_DIAGNOSIS, template);
}

/**
 * Generate pulmonary embolism consultation report
 * Convenience function for the specific pulmonary embolism diagnosis
 */
export async function generatePulmonaryEmbolismReport(transcript: string, template?: UserReportTemplate) {
  return generateDiagnosisReport(transcript, PULMONARY_EMBOLISM_DIAGNOSIS, template);
}

/**
 * Check if a template instruction is for diagnosis processing
 */
export function isDiagnosisTemplate(instruction: string): boolean {
  return instruction.toLowerCase().includes('diagnosis') && 
         (instruction.toLowerCase().includes('i50.0') || 
          instruction.toLowerCase().includes('i24.9') ||
          instruction.toLowerCase().includes('i26.0'));
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
  
  if (instruction.toLowerCase().includes('i26.0') || 
      instruction.toLowerCase().includes('pulmonary embolism') ||
      instruction.toLowerCase().includes('ფილტვის არტერიის ემბოლია')) {
    return PULMONARY_EMBOLISM_DIAGNOSIS;
  }
  
  return null;
}

/**
 * Generate report with custom template using general endpoint
 * Enhanced function that uses template structure to guide AI generation
 */
export async function generateTemplateBasedReport(
  transcript: string,
  template: UserReportTemplate,
  diagnosis?: DiagnosisContext
): Promise<{ success: true; report: string } | { success: false; error: string }> {
  // If diagnosis context is provided and matches our specialized endpoints, use diagnosis service
  if (diagnosis && (diagnosis.icdCode === 'I50.0' || diagnosis.icdCode === 'I24.9' || diagnosis.icdCode === 'I26.0')) {
    return generateDiagnosisReport(transcript, diagnosis, template);
  }
  
  console.log('🔬 Template-based report: Using general template processing');
  console.log('📋 Template:', template.name);
  console.log('📄 Transcript length:', transcript.length);
  
  try {
    if (!transcript.trim()) {
      return {
        success: false,
        error: 'Transcript is required for template-based report generation'
      };
    }

    // Create template-enhanced prompt for general endpoint
    let prompt = `Please generate a comprehensive medical consultation report based on this transcript. Use this template structure as a guide for the report format:

${template.example_structure}`;
    
    // Add template notes if available
    if (template.notes?.trim()) {
      prompt += `\n\nAdditional guidance: ${template.notes}`;
    }
    
    prompt += `\n\nTranscript to analyze:\n${transcript}`;

    console.log('🚀 Making API request to general template endpoint...');
    const response = await fetch(GENERAL_TEMPLATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        question: prompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Template API request failed:', {
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
    console.log('📥 Template API Response received:', {
      hasText: !!data.text,
      textLength: data.text?.length || 0
    });
    
    if (!data.text) {
      console.error('❌ Invalid response format from template API:', data);
      return {
        success: false,
        error: 'Invalid response format from template API'
      };
    }

    console.log('✅ Template-based report generated successfully');
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