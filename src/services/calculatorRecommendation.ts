export interface CalculatorRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  relevanceScore: number;
  triggerKeywords: string[];
  icon: string;
}

export interface CalculatorSuggestion {
  recommendations: CalculatorRecommendation[];
  matchedKeywords: string[];
  confidence: number;
}

// Calculator database with trigger keywords
const CALCULATOR_DATABASE: CalculatorRecommendation[] = [
  // Risk Assessment
  {
    id: 'ascvd',
    name: 'ASCVD Risk Estimator Plus',
    description: '10-year atherosclerotic cardiovascular disease risk',
    category: 'Risk Assessment',
    relevanceScore: 0.9,
    triggerKeywords: ['ascvd', 'cardiovascular risk', 'cholesterol', 'statin', 'lipid', 'primary prevention', 'cv risk', 'cardiac risk'],
    icon: 'Heart'
  },
  {
    id: 'atrial-fibrillation',
    name: 'Atrial Fibrillation Calculators',
    description: 'CHA₂DS₂-VASc and HAS-BLED scores',
    category: 'Risk Assessment',
    relevanceScore: 0.95,
    triggerKeywords: ['atrial fibrillation', 'afib', 'af', 'stroke risk', 'anticoagulation', 'warfarin', 'chads', 'has-bled', 'bleeding risk'],
    icon: 'Activity'
  },

  // Acute Care
  {
    id: 'timi-risk',
    name: 'TIMI Risk Score',
    description: 'Risk assessment for UA/NSTEMI patients',
    category: 'Acute Care',
    relevanceScore: 0.9,
    triggerKeywords: ['timi', 'nstemi', 'unstable angina', 'acs', 'chest pain', 'acute coronary', 'mi', 'myocardial infarction'],
    icon: 'Activity'
  },
  {
    id: 'grace-risk',
    name: 'GRACE ACS Risk Calculator',
    description: 'In-hospital and 6-month mortality prediction',
    category: 'Acute Care',
    relevanceScore: 0.9,
    triggerKeywords: ['grace', 'acs', 'acute coronary syndrome', 'mortality risk', 'hospital mortality', 'stemi', 'nstemi'],
    icon: 'Activity'
  },

  // Therapy Management
  {
    id: 'dapt',
    name: 'DAPT Score',
    description: 'Dual antiplatelet therapy duration guidance',
    category: 'Therapy Management',
    relevanceScore: 0.85,
    triggerKeywords: ['dapt', 'dual antiplatelet', 'clopidogrel', 'prasugrel', 'ticagrelor', 'pci', 'stent', 'antiplatelet'],
    icon: 'Zap'
  },
  {
    id: 'precise-dapt',
    name: 'PRECISE-DAPT Calculator',
    description: 'Bleeding risk assessment for DAPT duration',
    category: 'Therapy Management',
    relevanceScore: 0.85,
    triggerKeywords: ['precise-dapt', 'bleeding risk', 'dapt bleeding', 'antiplatelet bleeding', 'dual antiplatelet bleeding'],
    icon: 'Zap'
  },
  {
    id: 'prevent',
    name: 'AHA PREVENT™ Calculator',
    description: 'Next-generation cardiovascular risk assessment',
    category: 'Therapy Management',
    relevanceScore: 0.8,
    triggerKeywords: ['prevent', 'aha prevent', 'cardiovascular prevention', 'ckm', 'kidney disease', 'metabolic risk'],
    icon: 'Zap'
  },

  // Heart Failure
  {
    id: 'heart-failure-staging',
    name: 'ACC/AHA Heart Failure Staging',
    description: 'Stage A-D classification and management',
    category: 'Heart Failure',
    relevanceScore: 0.9,
    triggerKeywords: ['heart failure', 'hf', 'heart failure staging', 'systolic dysfunction', 'diastolic dysfunction', 'cardiomyopathy'],
    icon: 'HeartHandshake'
  },
  {
    id: 'gwtg-hf',
    name: 'GWTG-HF Risk Score',
    description: 'In-hospital mortality for acute HF',
    category: 'Heart Failure',
    relevanceScore: 0.85,
    triggerKeywords: ['gwtg', 'acute heart failure', 'hf mortality', 'decompensated heart failure', 'hospital hf'],
    icon: 'HeartHandshake'
  },
  {
    id: 'maggic',
    name: 'MAGGIC Risk Calculator',
    description: '1-year and 3-year mortality in chronic HF',
    category: 'Heart Failure',
    relevanceScore: 0.8,
    triggerKeywords: ['maggic', 'chronic heart failure', 'hf prognosis', 'heart failure mortality', 'chronic hf'],
    icon: 'HeartHandshake'
  },
  {
    id: 'shfm',
    name: 'Seattle Heart Failure Model',
    description: 'Multi-year survival prediction with therapy modeling',
    category: 'Heart Failure',
    relevanceScore: 0.8,
    triggerKeywords: ['seattle heart failure', 'shfm', 'hf survival', 'heart failure prognosis', 'therapy modeling'],
    icon: 'HeartHandshake'
  },

  // Surgical Risk
  {
    id: 'sts',
    name: 'STS Adult Cardiac Surgery Risk',
    description: 'Operative mortality and morbidity prediction',
    category: 'Surgical Risk',
    relevanceScore: 0.9,
    triggerKeywords: ['sts', 'cardiac surgery', 'surgical risk', 'operative risk', 'cabg', 'valve surgery', 'surgery mortality'],
    icon: 'Wrench'
  },
  {
    id: 'euroscore',
    name: 'EuroSCORE II',
    description: 'European cardiac surgery mortality prediction',
    category: 'Surgical Risk',
    relevanceScore: 0.85,
    triggerKeywords: ['euroscore', 'european surgery', 'cardiac surgery risk', 'surgery mortality', 'operative mortality'],
    icon: 'Wrench'
  },

  // Cardiomyopathy
  {
    id: 'hcm-risk-scd',
    name: 'HCM Risk-SCD Calculator',
    description: '5-year sudden cardiac death risk in HCM',
    category: 'Cardiomyopathy',
    relevanceScore: 0.9,
    triggerKeywords: ['hcm', 'hypertrophic cardiomyopathy', 'sudden cardiac death', 'scd', 'icd', 'hcm risk'],
    icon: 'Dna'
  },
  {
    id: 'hcm-af-risk',
    name: 'HCM-AF Risk Calculator',
    description: 'Atrial fibrillation risk in HCM patients',
    category: 'Cardiomyopathy',
    relevanceScore: 0.85,
    triggerKeywords: ['hcm af', 'hcm atrial fibrillation', 'hypertrophic cardiomyopathy af', 'hcm arrhythmia'],
    icon: 'Dna'
  }
];

/**
 * Analyzes a message for clinical keywords and suggests relevant calculators
 */
export function analyzeMessageForCalculators(message: string): CalculatorSuggestion {
  const lowerMessage = message.toLowerCase();
  const matchedCalculators = new Map<string, { calc: CalculatorRecommendation; matches: string[] }>();

  // Find matching calculators
  CALCULATOR_DATABASE.forEach(calc => {
    const matches: string[] = [];
    
    calc.triggerKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matches.push(keyword);
      }
    });

    if (matches.length > 0) {
      matchedCalculators.set(calc.id, { calc, matches });
    }
  });

  // Convert to recommendations with adjusted relevance scores
  const recommendations: CalculatorRecommendation[] = Array.from(matchedCalculators.values())
    .map(({ calc, matches }) => ({
      ...calc,
      relevanceScore: calc.relevanceScore * (matches.length * 0.2 + 0.8) // Boost score based on number of matches
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
    .slice(0, 3); // Limit to top 3 suggestions

  // Collect all matched keywords
  const matchedKeywords = Array.from(matchedCalculators.values())
    .flatMap(({ matches }) => matches);

  // Calculate overall confidence
  const confidence = Math.min(recommendations.length * 0.3 + matchedKeywords.length * 0.1, 1.0);

  return {
    recommendations,
    matchedKeywords,
    confidence
  };
}

/**
 * Gets calculator suggestions based on conversation context
 */
export function getContextualCalculators(messages: any[]): CalculatorSuggestion {
  // Analyze recent messages (last 5)
  const recentMessages = messages.slice(-5);
  const combinedText = recentMessages
    .filter(msg => msg.type === 'user')
    .map(msg => msg.content)
    .join(' ');

  return analyzeMessageForCalculators(combinedText);
}

/**
 * Gets calculators by category for workflow recommendations
 */
export function getCalculatorsByCategory(category: string): CalculatorRecommendation[] {
  return CALCULATOR_DATABASE.filter(calc => calc.category === category);
}

/**
 * Gets related calculators for clinical pathways
 */
export function getRelatedCalculators(calculatorId: string): CalculatorRecommendation[] {
  const calculator = CALCULATOR_DATABASE.find(calc => calc.id === calculatorId);
  if (!calculator) return [];

  // Simple related calculator logic based on category
  return CALCULATOR_DATABASE
    .filter(calc => calc.id !== calculatorId && calc.category === calculator.category)
    .slice(0, 2);
}

/**
 * Gets calculator workflow suggestions based on result
 */
export function getWorkflowSuggestions(calculatorId: string, result: any): CalculatorRecommendation[] {
  // Define clinical pathways
  const workflows: Record<string, string[]> = {
    'ascvd': ['dapt', 'precise-dapt'], // ASCVD risk → antiplatelet therapy
    'timi-risk': ['grace-risk', 'dapt'], // TIMI → GRACE → DAPT
    'grace-risk': ['sts', 'dapt'], // GRACE → surgical risk or therapy
    'heart-failure-staging': ['maggic', 'shfm'], // HF staging → prognosis
    'hcm-risk-scd': ['hcm-af-risk'], // HCM SCD → HCM AF risk
    'atrial-fibrillation': ['sts', 'precise-dapt'] // AF → surgery or bleeding risk
  };

  const nextCalculators = workflows[calculatorId] || [];
  return CALCULATOR_DATABASE.filter(calc => nextCalculators.includes(calc.id));
} 