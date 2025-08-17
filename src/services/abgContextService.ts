import { ABGResult } from '../types/abg';
import { PatientCase } from '../types/chat';

/**
 * Service for creating AI context from ABG results
 */

/**
 * Format ABG result for AI context
 */
export const formatABGForAIContext = (result: ABGResult): string => {
  const sections: string[] = [];

  // Header
  sections.push(`=== Blood Gas Analysis Report ===`);
  sections.push(`Date: ${new Date(result.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`);
  sections.push(`Type: ${result.type}`);
  
  if (result.patient) {
    sections.push(`Patient: ${result.patient.first_name} ${result.patient.last_name}`);
    if (result.patient.medical_record_number) {
      sections.push(`MRN: ${result.patient.medical_record_number}`);
    }
  }

  if (result.gemini_confidence) {
    sections.push(`Analysis Confidence: ${Math.round(result.gemini_confidence * 100)}%`);
  }

  sections.push(''); // Empty line

  // Raw Analysis
  sections.push(`=== Laboratory Values and Analysis ===`);
  sections.push(result.raw_analysis);
  sections.push('');

  // Interpretation (if available)
  if (result.interpretation) {
    sections.push(`=== Clinical Interpretation ===`);
    sections.push(result.interpretation);
    sections.push('');
  }

  // Action Plan (if available)
  if (result.action_plan) {
    sections.push(`=== Recommended Action Plan ===`);
    sections.push(result.action_plan);
    sections.push('');
  }

  // Processing metadata
  if (result.processing_time_ms) {
    sections.push(`Processing Time: ${(result.processing_time_ms / 1000).toFixed(1)} seconds`);
  }

  sections.push(`Report ID: ${result.id}`);

  return sections.join('\n');
};

/**
 * Create a PatientCase from ABG result for AI context
 */
export const createPatientCaseFromABG = (result: ABGResult): PatientCase => {
  const patientName = result.patient 
    ? `${result.patient.first_name} ${result.patient.last_name}`
    : 'Unknown Patient';

  const patientAge = result.patient?.date_of_birth 
    ? calculateAge(new Date(result.patient.date_of_birth))
    : undefined;

  const caseDescription = `Blood Gas Analysis Case - ${result.type}\n\n${formatABGForAIContext(result)}`;

  return {
    id: `abg-${result.id}`,
    title: `ABG Analysis - ${patientName}`,
    description: result.interpretation 
      ? `${result.type} analysis with interpretation and action plan` 
      : `${result.type} analysis`,
    patient: {
      name: patientName,
      age: patientAge,
      mrn: result.patient?.medical_record_number,
      dateOfBirth: result.patient?.date_of_birth
    },
    chiefComplaint: `Blood gas analysis interpretation for ${result.type.toLowerCase()}`,
    currentIllness: caseDescription,
    status: 'active',
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    medicalSpecialty: 'cardiology', // ABG can be relevant to both specialties
    priority: result.interpretation?.includes('critical') || result.interpretation?.includes('urgent') 
      ? 'high' 
      : 'medium',
    tags: [
      'blood-gas-analysis',
      result.type.toLowerCase().replace(/\s+/g, '-'),
      ...(result.interpretation ? ['interpreted'] : []),
      ...(result.action_plan ? ['action-plan'] : [])
    ]
  };
};

/**
 * Create multiple patient cases from ABG results
 */
export const createPatientCasesFromABGs = (results: ABGResult[]): PatientCase[] => {
  return results.map(result => createPatientCaseFromABG(result));
};

/**
 * Format multiple ABG results for AI context
 */
export const formatMultipleABGsForAIContext = (results: ABGResult[]): string => {
  if (results.length === 0) {
    return 'No ABG results available.';
  }

  const sections: string[] = [];

  sections.push(`=== Blood Gas Analysis Summary ===`);
  sections.push(`Total Results: ${results.length}`);
  sections.push(`Date Range: ${new Date(results[results.length - 1]?.created_at).toLocaleDateString()} to ${new Date(results[0]?.created_at).toLocaleDateString()}`);
  sections.push('');

  results.forEach((result, index) => {
    sections.push(`--- Result ${index + 1} of ${results.length} ---`);
    sections.push(formatABGForAIContext(result));
    sections.push('');
  });

  return sections.join('\n');
};

/**
 * Create AI prompt enhancement with ABG context
 */
export const enhancePromptWithABGContext = (
  originalPrompt: string, 
  results: ABGResult[], 
  contextType: 'single' | 'multiple' = 'single'
): string => {
  if (results.length === 0) {
    return originalPrompt;
  }

  const abgContext = contextType === 'single' 
    ? formatABGForAIContext(results[0])
    : formatMultipleABGsForAIContext(results);

  return `CLINICAL CONTEXT:
${abgContext}

USER QUESTION:
${originalPrompt}

Please consider the blood gas analysis results provided above when answering this medical question. If the question is related to the ABG results, provide specific clinical insights based on the laboratory values, interpretation, and recommended actions.`;
};

/**
 * Extract key ABG parameters from raw analysis text
 */
export const extractABGParameters = (rawAnalysis: string): Record<string, string | number> => {
  const parameters: Record<string, string | number> = {};
  
  // Common ABG parameters to extract
  const parameterPatterns = [
    { key: 'pH', pattern: /pH\s*[:=]?\s*([0-9]+\.?[0-9]*)/i },
    { key: 'pCO2', pattern: /p?CO2\s*[:=]?\s*([0-9]+\.?[0-9]*)/i },
    { key: 'pO2', pattern: /p?O2\s*[:=]?\s*([0-9]+\.?[0-9]*)/i },
    { key: 'HCO3', pattern: /HCO3[-]?\s*[:=]?\s*([0-9]+\.?[0-9]*)/i },
    { key: 'BE', pattern: /BE\s*[:=]?\s*([-+]?[0-9]+\.?[0-9]*)/i },
    { key: 'SaO2', pattern: /Sa?O2\s*[:=]?\s*([0-9]+\.?[0-9]*)/i },
    { key: 'lactate', pattern: /lactate\s*[:=]?\s*([0-9]+\.?[0-9]*)/i }
  ];

  parameterPatterns.forEach(({ key, pattern }) => {
    const match = rawAnalysis.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      parameters[key] = isNaN(value) ? match[1] : value;
    }
  });

  return parameters;
};

/**
 * Utility function to calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get ABG interpretation summary for quick reference
 */
export const getABGSummary = (result: ABGResult): string => {
  const parameters = extractABGParameters(result.raw_analysis);
  const sections: string[] = [];

  sections.push(`${result.type} - ${new Date(result.created_at).toLocaleDateString()}`);
  
  if (Object.keys(parameters).length > 0) {
    const paramStr = Object.entries(parameters)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    sections.push(`Key values: ${paramStr}`);
  }

  if (result.interpretation) {
    // Extract first sentence of interpretation for summary
    const firstSentence = result.interpretation.split('.')[0];
    sections.push(`Interpretation: ${firstSentence}...`);
  }

  return sections.join(' | ');
};

/**
 * Create consultation-ready prompt for pre-action-plan stage
 */
export const createPreActionPlanConsultationPrompt = (
  result: ABGResult, 
  userMessage: string = "Please review this blood gas analysis and provide clinical insights."
): string => {
  const abgContext = formatABGForAIContext(result);
  
  return `CLINICAL CONSULTATION REQUEST:

${abgContext}

CONSULTATION STAGE: POST-INTERPRETATION (Pre-Action Plan)
Available Information:
- Laboratory Values: ✓
- Clinical Interpretation: ✓
- Action Plan: ❌ (Not yet generated)

CLINICIAN REQUEST:
${userMessage}`;
};

/**
 * Create consultation-ready prompt for post-action-plan stage
 */
export const createPostActionPlanConsultationPrompt = (
  result: ABGResult, 
  userMessage: string = "Please review this complete blood gas analysis with action plan."
): string => {
  const abgContext = formatABGForAIContext(result);
  
  return `CLINICAL CONSULTATION REQUEST:

${abgContext}

CONSULTATION STAGE: COMPLETE ANALYSIS
Available Information:
- Laboratory Values: ✓
- Clinical Interpretation: ✓
- Action Plan: ✓

CLINICIAN REQUEST:
${userMessage}`;
};

/**
 * Create general ABG consultation prompt with flexible context
 */
export const createABGConsultationPrompt = (
  result: ABGResult, 
  userMessage: string,
  includeActionPlan: boolean = false
): string => {
  if (includeActionPlan && result.action_plan) {
    return createPostActionPlanConsultationPrompt(result, userMessage);
  } else {
    return createPreActionPlanConsultationPrompt(result, userMessage);
  }
};

/**
 * Enhanced prompt builder with context awareness
 */
export const buildContextAwarePrompt = (
  originalMessage: string,
  result: ABGResult,
  consultationStage: 'pre-action-plan' | 'post-action-plan' | 'auto' = 'auto'
): string => {
  // Auto-detect stage based on available data
  if (consultationStage === 'auto') {
    consultationStage = result.action_plan ? 'post-action-plan' : 'pre-action-plan';
  }
  
  return consultationStage === 'post-action-plan' 
    ? createPostActionPlanConsultationPrompt(result, originalMessage)
    : createPreActionPlanConsultationPrompt(result, originalMessage);
};

/**
 * Format ABG result for interpretation-only context (excludes action plan)
 */
export const formatInterpretationOnlyContext = (result: ABGResult): string => {
  const sections: string[] = [];

  // Header
  sections.push(`=== Blood Gas Analysis Report (Interpretation Stage) ===`);
  sections.push(`Date: ${new Date(result.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`);
  sections.push(`Type: ${result.type}`);
  
  if (result.patient) {
    sections.push(`Patient: ${result.patient.first_name} ${result.patient.last_name}`);
    if (result.patient.medical_record_number) {
      sections.push(`MRN: ${result.patient.medical_record_number}`);
    }
  }

  if (result.gemini_confidence) {
    sections.push(`Analysis Confidence: ${Math.round(result.gemini_confidence * 100)}%`);
  }

  sections.push(''); // Empty line

  // Raw Analysis
  sections.push(`=== Laboratory Values and Analysis ===`);
  sections.push(result.raw_analysis);
  sections.push('');

  // Interpretation (if available)
  if (result.interpretation) {
    sections.push(`=== Clinical Interpretation ===`);
    sections.push(result.interpretation);
    sections.push('');
  }

  // Note about stage
  sections.push(`=== Consultation Stage ===`);
  sections.push(`Current Stage: INTERPRETATION COMPLETE`);
  sections.push(`Action Plan Status: Not yet generated`);
  sections.push(`Available for AI consultation: Laboratory values + Clinical interpretation`);

  // Processing metadata
  if (result.processing_time_ms) {
    sections.push('');
    sections.push(`Processing Time: ${(result.processing_time_ms / 1000).toFixed(1)} seconds`);
  }

  sections.push(`Report ID: ${result.id}`);

  return sections.join('\n');
};

/**
 * Create ABG result with selective action plan content
 */
export const createSelectiveActionPlanContext = (
  result: ABGResult,
  selectedIssues: string[] = [],
  selectedActionPlans: string[] = []
): ABGResult => {
  if (!result.action_plan || (selectedIssues.length === 0 && selectedActionPlans.length === 0)) {
    // Return original result if no action plan or no selections
    return result;
  }

  // For now, we'll return the original result with a note about selection
  // In a more sophisticated implementation, we could parse and filter the action plan
  const selectionNote = `\n\n=== SELECTED CONTENT FOR AI CONSULTATION ===\n`;
  const selectedNote = selectedIssues.length > 0 
    ? `Selected Issues: ${selectedIssues.join(', ')}\n`
    : `Selected Action Plans: ${selectedActionPlans.join(', ')}\n`;
  
  return {
    ...result,
    action_plan: result.action_plan + selectionNote + selectedNote + `\n(Full action plan available, showing selected content only for AI consultation)`
  };
};

/**
 * Enhanced buildContextAwarePrompt with new consultation types
 */
export const buildEnhancedContextAwarePrompt = (
  originalMessage: string,
  result: ABGResult,
  consultationType: 'interpretation-only' | 'selective-action-plan' | 'complete' | 'auto' = 'auto',
  selectedItems?: string[]
): string => {
  let contextualResult = result;
  let stageDescription = '';

  switch (consultationType) {
    case 'interpretation-only':
      // Create a result without action plan for context
      contextualResult = {
        ...result,
        action_plan: undefined
      };
      stageDescription = 'INTERPRETATION STAGE - Clinical interpretation available, action plan not yet generated';
      break;
      
    case 'selective-action-plan':
      if (selectedItems && selectedItems.length > 0) {
        contextualResult = createSelectiveActionPlanContext(result, selectedItems);
        stageDescription = `SELECTIVE ACTION PLAN CONSULTATION - ${selectedItems.length} selected item(s)`;
      } else {
        stageDescription = 'COMPLETE ACTION PLAN CONSULTATION - All action plan content included';
      }
      break;
      
    case 'complete':
      stageDescription = 'COMPLETE ANALYSIS CONSULTATION - All available information included';
      break;
      
    case 'auto':
    default:
      if (!result.action_plan) {
        return buildEnhancedContextAwarePrompt(originalMessage, result, 'interpretation-only');
      } else {
        return buildEnhancedContextAwarePrompt(originalMessage, result, 'complete');
      }
  }

  const contextFormat = consultationType === 'interpretation-only' 
    ? formatInterpretationOnlyContext(contextualResult)
    : formatABGForAIContext(contextualResult);

  return `CLINICAL CONSULTATION REQUEST:

${contextFormat}

CONSULTATION TYPE: ${stageDescription}

CLINICIAN REQUEST:
${originalMessage}`;
};