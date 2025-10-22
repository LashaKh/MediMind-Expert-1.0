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
  sections.push(t('abg.context.reportHeader'));
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
  sections.push(t('abg.context.laboratoryValuesHeader'));
  sections.push(result.raw_analysis);
  sections.push('');

  // Interpretation (if available)
  if (result.interpretation) {
    sections.push(t('abg.context.clinicalInterpretationHeader'));
    sections.push(result.interpretation);
    sections.push('');
  }

  // Action Plan (if available)
  if (result.action_plan) {
    sections.push(t('abg.context.recommendedActionPlanHeader'));
    sections.push(result.action_plan);
    sections.push('');
  }

  // Processing metadata
  if (result.processing_time_ms) {
    sections.push(`${t('abg.context.processingTime')} ${(result.processing_time_ms / 1000).toFixed(1)} seconds`);
  }

  sections.push(`${t('abg.context.reportId')} ${result.id}`);

  return sections.join('\n');
};

/**
 * Create a PatientCase from ABG result for AI context
 */
export const createPatientCaseFromABG = (result: ABGResult): PatientCase => {
  const patientName = result.patient 
    ? `${result.patient.first_name} ${result.patient.last_name}`
    : t('abg.context.unknownPatient');

  const patientAge = result.patient?.date_of_birth 
    ? calculateAge(new Date(result.patient.date_of_birth))
    : undefined;

  const caseDescription = `${t('abg.context.casePrefix')}${result.type}\n\n${formatABGForAIContext(result)}`;

  return {
    id: `abg-${result.id}`,
    title: `${t('abg.context.abgAnalysisPrefix')}${patientName}`,
    description: result.interpretation 
      ? `${result.type}${t('abg.context.analysisWithInterpretationAndActionPlan')}` 
      : `${result.type}${t('abg.context.analysis')}`,
    patient: {
      name: patientName,
      age: patientAge,
      mrn: result.patient?.medical_record_number,
      dateOfBirth: result.patient?.date_of_birth
    },
    chiefComplaint: `${t('abg.context.interpretationFor')}${result.type.toLowerCase()}`,
    currentIllness: caseDescription,
    status: 'active',
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    medicalSpecialty: t('abg.context.medicalSpecialtyCardiology'), // ABG can be relevant to both specialties
    priority: result.interpretation?.includes('critical') || result.interpretation?.includes('urgent') 
      ? t('abg.context.priorityHigh') 
      : t('abg.context.priorityMedium'),
    tags: [
      t('abg.context.tagBloodGasAnalysis'),
      result.type.toLowerCase().replace(/\s+/g, '-'),
      ...(result.interpretation ? [t('abg.context.tagInterpreted')] : []),
      ...(result.action_plan ? [t('abg.context.tagActionPlan')] : [])
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
    return t('abg.context.noResultsAvailable');
  }

  const sections: string[] = [];

  sections.push(t('abg.context.summaryHeader'));
  sections.push(`${t('abg.context.totalResults')} ${results.length}`);
  sections.push(`${t('abg.context.dateRange')} ${new Date(results[results.length - 1]?.created_at).toLocaleDateString()} ${t('abg.context.to')} ${new Date(results[0]?.created_at).toLocaleDateString()}`);
  sections.push('');

  results.forEach((result, index) => {
    sections.push(`${t('abg.context.resultOf')} ${index + 1} ${t('abg.context.of')} ${results.length} ---`);
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

  return `${t('abg.context.clinicalContext')}
${abgContext}

${t('abg.context.userQuestion')}
${originalPrompt}

${t('abg.context.considerResultsPrompt')}`;
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
    sections.push(`${t('abg.context.keyValues')} ${paramStr}`);
  }

  if (result.interpretation) {
    // Extract first sentence of interpretation for summary
    const firstSentence = result.interpretation.split('.')[0];
    sections.push(`${t('abg.context.interpretation')} ${firstSentence}...`);
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
${t('abg.context.availableInformation')}
${t('abg.context.clinicalInterpretationCheck')}
${t('abg.context.actionPlanNotGenerated')}

${t('abg.context.clinicianRequest')}
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

${t('abg.context.consultationStageCompleteAnalysis')}
${t('abg.context.availableInformation')}
${t('abg.context.laboratoryValuesCheck')}
${t('abg.context.clinicalInterpretationCheck')}
${t('abg.context.actionPlanCheck')}

${t('abg.context.clinicianRequest')}
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
  sections.push(t('abg.context.reportInterpretationStage'));
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
  sections.push(t('abg.context.currentStageInterpretationComplete'));
  sections.push(t('abg.context.actionPlanStatusNotGenerated'));
  sections.push(t('abg.context.availableForAIConsultation'));

  // Processing metadata
  if (result.processing_time_ms) {
    sections.push('');
    sections.push(`${t('abg.context.processingTime')} ${(result.processing_time_ms / 1000).toFixed(1)} seconds`);
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
  const selectionNote = `\n\n${t('abg.context.selectedContentHeader')}\n`;
  const selectedNote = selectedIssues.length > 0 
    ? `${t('abg.context.selectedIssues')} ${selectedIssues.join(', ')}\n`
    : `${t('abg.context.selectedActionPlans')} ${selectedActionPlans.join(', ')}\n`;
  
  return {
    ...result,
    action_plan: result.action_plan + selectionNote + selectedNote + `\n${t('abg.context.fullActionPlanNote')}`
  };
};

/**
 * Enhanced prompt builder with context awareness
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
      stageDescription = t('abg.context.interpretationStageDescription');
      break;
      
    case 'selective-action-plan':
      if (selectedItems && selectedItems.length > 0) {
        contextualResult = createSelectiveActionPlanContext(result, selectedItems);
        stageDescription = `${t('abg.context.selectiveActionPlanConsultation')}${selectedItems.length} ${t('abg.context.selectedItems')}`;
      } else {
        stageDescription = t('abg.context.completeActionPlanConsultation');
      }
      break;
      
          case 'complete':
          stageDescription = t('abg.context.completeAnalysisConsultation');
          break;      
    case 'auto':
    default:
      if (!result.action_plan) {
        return buildEnhancedContextAwarePrompt(originalMessage, result, 'interpretation-only');
      } else {
        return buildEnhancedContextAwarePrompt(originalMessage, result, 'complete');
      }
  }

  const contextFormat = formatABGForAIContext(contextualResult);

  return `${t('abg.context.clinicalConsultationRequest')}

${contextFormat}

${t('abg.context.consultationType')} ${stageDescription}

${t('abg.context.clinicianRequest')}
${originalMessage}`;
};