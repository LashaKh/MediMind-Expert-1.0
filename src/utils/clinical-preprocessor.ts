/**
 * Enhanced Clinical Preprocessor
 * Handles sophisticated clinical findings processing with custom components
 * Preserves all complex logic from the original InteractiveMarkdownViewer
 */

/**
 * Process clinical findings content and convert to custom components
 * @param content - Raw markdown content
 * @returns Processed content with clinical components
 */
export const processClinicalFindings = (content: string): string => {
  const lines = content.split('\n');
  const processedLines: string[] = [];
  
  let inClinicalFindings = false;
  let currentSection = '';
  let currentItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if we're entering a Clinical Findings section
    if (trimmed.toLowerCase().includes('clinical findings') && trimmed.startsWith('#')) {
      inClinicalFindings = true;
      processedLines.push(line); // Keep the heading
      continue;
    }

    // Check if we're leaving Clinical Findings (new major section)
    if (inClinicalFindings && trimmed.startsWith('## ') && !trimmed.toLowerCase().includes('clinical')) {
      // Save any remaining items
      if (currentItems.length > 0) {
        processedLines.push(`\n<ClinicalSection type="${currentSection}">`);
        currentItems.forEach(item => {
          processedLines.push(`<ClinicalItem>${item}</ClinicalItem>`);
        });
        processedLines.push('</ClinicalSection>\n');
      }
      
      inClinicalFindings = false;
      processedLines.push(line); // Add the new section
      continue;
    }
    
    if (inClinicalFindings) {
      // Handle H3 sections within Clinical Findings
      if (trimmed.startsWith('### ')) {
        // Save previous section
        if (currentItems.length > 0) {
          processedLines.push(`\n<ClinicalSection type="${currentSection}">`);
          currentItems.forEach(item => {
            processedLines.push(`<ClinicalItem>${item}</ClinicalItem>`);
          });
          processedLines.push('</ClinicalSection>\n');
        }
        
        currentSection = trimmed.replace('### ', '');
        currentItems = [];
        processedLines.push(`\n### ${currentSection}\n`);
      }
      // Handle list items
      else if (trimmed.startsWith('- ')) {
        const item = trimmed.replace('- ', '');
        currentItems.push(item);
      }
      // Handle other content within clinical findings
      else if (trimmed) {
        processedLines.push(line);
      }
    } else {
      processedLines.push(line);
    }
  }
  
  // Handle last section if we ended in clinical findings
  if (inClinicalFindings && currentItems.length > 0) {
    processedLines.push(`\n<ClinicalSection type="${currentSection}">`);
    currentItems.forEach(item => {
      processedLines.push(`<ClinicalItem>${item}</ClinicalItem>`);
    });
    processedLines.push('</ClinicalSection>\n');
  }
  
  return processedLines.join('\n');
};

/**
 * Detect section type from title for medical color schemes
 * @param title - Section title
 * @returns Section type for styling
 */
export const detectSectionTypeFromTitle = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('symptom') || lowerTitle.includes('complaint')) {
    return 'symptoms';
  } else if (lowerTitle.includes('demographic') || lowerTitle.includes('age') || lowerTitle.includes('gender')) {
    return 'demographics';
  } else if (lowerTitle.includes('medical history') || lowerTitle.includes('past') || lowerTitle.includes('history')) {
    return 'medical history';
  } else if (lowerTitle.includes('vital') || lowerTitle.includes('sign') || lowerTitle.includes('bp') || lowerTitle.includes('heart rate')) {
    return 'vital signs';
  } else if (lowerTitle.includes('physical') || lowerTitle.includes('examination') || lowerTitle.includes('exam')) {
    return 'physical exam';
  } else if (lowerTitle.includes('laboratory') || lowerTitle.includes('lab') || lowerTitle.includes('blood')) {
    return 'laboratory';
  } else if (lowerTitle.includes('imaging') || lowerTitle.includes('x-ray') || lowerTitle.includes('ct') || lowerTitle.includes('mri')) {
    return 'imaging';
  } else if (lowerTitle.includes('ecg') || lowerTitle.includes('ekg') || lowerTitle.includes('echo')) {
    return 'cardiac testing';
  }
  
  return 'default';
};

/**
 * Get medical color scheme based on section type
 * @param sectionType - The type of medical section
 * @returns Color scheme object
 */
export const getMedicalColorScheme = (sectionType: string) => {
  const schemes = {
    symptoms: { 
      icon: 'Stethoscope', 
      gradient: 'from-purple-500 to-violet-600', 
      bg: 'from-purple-50 to-violet-50', 
      text: 'text-purple-900', 
      border: 'border-purple-200' 
    },
    demographics: { 
      icon: 'User', 
      gradient: 'from-emerald-500 to-teal-600', 
      bg: 'from-emerald-50 to-teal-50', 
      text: 'text-emerald-900', 
      border: 'border-emerald-200' 
    },
    'medical history': { 
      icon: 'Heart', 
      gradient: 'from-red-500 to-rose-600', 
      bg: 'from-red-50 to-rose-50', 
      text: 'text-red-900', 
      border: 'border-red-200' 
    },
    'past medical history': { 
      icon: 'Heart', 
      gradient: 'from-red-500 to-rose-600', 
      bg: 'from-red-50 to-rose-50', 
      text: 'text-red-900', 
      border: 'border-red-200' 
    },
    'vital signs': { 
      icon: 'Activity', 
      gradient: 'from-cyan-500 to-blue-600', 
      bg: 'from-cyan-50 to-blue-50', 
      text: 'text-cyan-900', 
      border: 'border-cyan-200' 
    },
    'physical exam': { 
      icon: 'Stethoscope', 
      gradient: 'from-indigo-500 to-purple-600', 
      bg: 'from-indigo-50 to-purple-50', 
      text: 'text-indigo-900', 
      border: 'border-indigo-200' 
    },
    laboratory: { 
      icon: 'Microscope', 
      gradient: 'from-orange-500 to-red-600', 
      bg: 'from-orange-50 to-red-50', 
      text: 'text-orange-900', 
      border: 'border-orange-200' 
    },
    imaging: { 
      icon: 'Eye', 
      gradient: 'from-blue-500 to-indigo-600', 
      bg: 'from-blue-50 to-indigo-50', 
      text: 'text-blue-900', 
      border: 'border-blue-200' 
    },
    'cardiac testing': { 
      icon: 'Heart', 
      gradient: 'from-pink-500 to-red-600', 
      bg: 'from-pink-50 to-red-50', 
      text: 'text-pink-900', 
      border: 'border-pink-200' 
    },
    default: { 
      icon: 'Activity', 
      gradient: 'from-slate-500 to-gray-600', 
      bg: 'from-slate-50 to-gray-50', 
      text: 'text-slate-900', 
      border: 'border-slate-200' 
    }
  };
  
  return schemes[sectionType.toLowerCase() as keyof typeof schemes] || schemes.default;
};

/**
 * Enhanced content detection for medical context
 * @param children - React children to analyze
 * @returns Detected medical section type
 */
export const detectMedicalSectionType = (children: React.ReactNode): string => {
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return node.toString();
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && typeof node === 'object' && 'props' in node) {
      return extractText((node as any).props.children);
    }
    return '';
  };

  const text = extractText(children).toLowerCase();
  
  // Medical keyword analysis
  const medicalKeywords = {
    symptoms: ['chest pain', 'shortness of breath', 'dyspnea', 'palpitations', 'fatigue', 'dizziness', 'syncope'],
    demographics: ['age', 'gender', 'race', 'ethnicity', 'male', 'female', 'years old'],
    'medical history': ['history', 'previous', 'prior', 'past medical', 'comorbidities', 'diabetes', 'hypertension'],
    'vital signs': ['blood pressure', 'heart rate', 'temperature', 'respiratory rate', 'oxygen saturation', 'bp', 'hr'],
    'physical exam': ['examination', 'auscultation', 'palpation', 'inspection', 'murmur', 'gallop', 'rales'],
    laboratory: ['lab', 'blood', 'serum', 'plasma', 'troponin', 'bnp', 'creatinine', 'hemoglobin'],
    imaging: ['chest x-ray', 'echocardiogram', 'ct scan', 'mri', 'angiography', 'catheterization'],
    'cardiac testing': ['ecg', 'ekg', 'electrocardiogram', 'stress test', 'holter', 'event monitor']
  };
  
  // Score each category
  let maxScore = 0;
  let detectedType = 'default';
  
  for (const [type, keywords] of Object.entries(medicalKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 1;
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }
  
  return detectedType;
};

/**
 * Process clinical content for enhanced medical formatting
 * @param content - Raw content to process
 * @returns Enhanced content with medical components
 */
export const enhanceClinicalContent = (content: string): string => {
  // First process clinical findings
  const processedContent = processClinicalFindings(content);
  
  // Additional medical content enhancements could go here
  // For example, automatic evidence level detection, medical terminology highlighting, etc.
  
  return processedContent;
};

/**
 * Validate clinical content structure
 * @param content - Content to validate
 * @returns Validation result with suggestions
 */
export const validateClinicalContent = (content: string): {
  isValid: boolean;
  suggestions: string[];
  warnings: string[];
} => {
  const suggestions: string[] = [];
  const warnings: string[] = [];
  
  // Check for clinical findings section
  if (!content.toLowerCase().includes('clinical findings')) {
    suggestions.push('Consider adding a "Clinical Findings" section for better medical documentation');
  }
  
  // Check for evidence levels
  if (!content.includes('Evidence Level') && !content.includes('Class A') && !content.includes('Class B')) {
    suggestions.push('Consider adding evidence levels (Class A-E) to support medical recommendations');
  }
  
  // Check for references
  if (!content.toLowerCase().includes('references') && !content.includes('PubMed')) {
    warnings.push('No references found - medical content should include supporting literature');
  }
  
  // Check for balanced structure
  const sections = content.match(/^##\s/gm);
  if (!sections || sections.length < 3) {
    suggestions.push('Consider organizing content into multiple sections (Background, Clinical Findings, Management, etc.)');
  }
  
  return {
    isValid: warnings.length === 0,
    suggestions,
    warnings
  };
}; 