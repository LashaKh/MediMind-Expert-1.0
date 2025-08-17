/**
 * ABG Issue Parser
 * Extracts individual clinical issues from interpretation results for separate action plan generation
 */

export interface IdentifiedIssue {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: 'acid-base' | 'oxygenation' | 'ventilation' | 'metabolic' | 'other';
  priorityOrder: number;
}

export interface ABGIssueParsingResult {
  issues: IdentifiedIssue[];
  originalInterpretation: string;
  totalIssuesFound: number;
}

/**
 * Parse ABG interpretation to identify individual clinical issues
 */
export function parseABGInterpretation(interpretationText: string): ABGIssueParsingResult {
  if (!interpretationText || interpretationText.trim().length === 0) {
    return {
      issues: [],
      originalInterpretation: interpretationText,
      totalIssuesFound: 0
    };
  }

  const issues: IdentifiedIssue[] = [];
  const text = interpretationText.toLowerCase();

  // Common ABG issues with their patterns, severity, and categories
  const issuePatterns = [
    // Acid-Base Disorders
    {
      patterns: ['respiratory acidosis', 'acute respiratory acidosis', 'chronic respiratory acidosis'],
      title: 'Respiratory Acidosis',
      category: 'acid-base' as const,
      severity: 'high' as const,
      priorityOrder: 1
    },
    {
      patterns: ['respiratory alkalosis', 'acute respiratory alkalosis', 'chronic respiratory alkalosis'],
      title: 'Respiratory Alkalosis',
      category: 'acid-base' as const,
      severity: 'medium' as const,
      priorityOrder: 2
    },
    {
      patterns: ['metabolic acidosis', 'acute metabolic acidosis', 'chronic metabolic acidosis'],
      title: 'Metabolic Acidosis',
      category: 'acid-base' as const,
      severity: 'high' as const,
      priorityOrder: 1
    },
    {
      patterns: ['metabolic alkalosis', 'acute metabolic alkalosis', 'chronic metabolic alkalosis'],
      title: 'Metabolic Alkalosis',
      category: 'acid-base' as const,
      severity: 'medium' as const,
      priorityOrder: 2
    },
    
    // Oxygenation Issues
    {
      patterns: ['hypoxemia', 'severe hypoxemia', 'mild hypoxemia', 'moderate hypoxemia', 'low pao2', 'decreased oxygenation'],
      title: 'Hypoxemia',
      category: 'oxygenation' as const,
      severity: 'high' as const,
      priorityOrder: 1
    },
    {
      patterns: ['hyperoxemia', 'elevated pao2', 'high oxygen'],
      title: 'Hyperoxemia',
      category: 'oxygenation' as const,
      severity: 'low' as const,
      priorityOrder: 4
    },
    
    // Ventilation Issues
    {
      patterns: ['hypoventilation', 'inadequate ventilation', 'poor ventilation'],
      title: 'Hypoventilation',
      category: 'ventilation' as const,
      severity: 'high' as const,
      priorityOrder: 1
    },
    {
      patterns: ['hyperventilation', 'excessive ventilation', 'over ventilation'],
      title: 'Hyperventilation',
      category: 'ventilation' as const,
      severity: 'medium' as const,
      priorityOrder: 3
    },
    
    // Carbon Monoxide and Other Toxins
    {
      patterns: ['elevated carboxyhemoglobin', 'carbon monoxide', 'co poisoning', 'carboxyhemoglobin', 'cohb'],
      title: 'Carbon Monoxide Poisoning',
      category: 'other' as const,
      severity: 'high' as const,
      priorityOrder: 1
    },
    {
      patterns: ['methemoglobinemia', 'elevated methemoglobin'],
      title: 'Methemoglobinemia',
      category: 'other' as const,
      severity: 'high' as const,
      priorityOrder: 1
    },
    
    // Metabolic Issues
    {
      patterns: ['anemia', 'low hemoglobin', 'decreased hemoglobin'],
      title: 'Anemia',
      category: 'metabolic' as const,
      severity: 'medium' as const,
      priorityOrder: 3
    },
    {
      patterns: ['electrolyte imbalance', 'electrolyte abnormalities', 'sodium abnormalities', 'potassium abnormalities'],
      title: 'Electrolyte Imbalances',
      category: 'metabolic' as const,
      severity: 'medium' as const,
      priorityOrder: 3
    }
  ];

  // Extract issues based on patterns
  issuePatterns.forEach((issuePattern, index) => {
    const found = issuePattern.patterns.some(pattern => text.includes(pattern));
    
    if (found) {
      // Extract relevant context around the issue
      const description = extractIssueContext(interpretationText, issuePattern.patterns[0]);
      
      issues.push({
        id: `issue-${index}`,
        title: issuePattern.title,
        description,
        severity: issuePattern.severity,
        category: issuePattern.category,
        priorityOrder: issuePattern.priorityOrder
      });
    }
  });

  // Remove duplicates based on title
  const uniqueIssues = issues.filter((issue, index, self) => 
    index === self.findIndex(i => i.title === issue.title)
  );

  // Sort by priority order (1 = highest priority)
  uniqueIssues.sort((a, b) => a.priorityOrder - b.priorityOrder);

  return {
    issues: uniqueIssues,
    originalInterpretation: interpretationText,
    totalIssuesFound: uniqueIssues.length
  };
}

/**
 * Extract context around a specific issue from the interpretation text
 */
function extractIssueContext(text: string, issueKeyword: string): string {
  const lines = text.split('\n');
  const issueLines: string[] = [];
  
  // Find lines that contain the issue keyword or related context
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes(issueKeyword.toLowerCase()) || 
        lowerLine.includes('ph') || 
        lowerLine.includes('pco2') || 
        lowerLine.includes('po2') || 
        lowerLine.includes('pao2') || 
        lowerLine.includes('hco3') || 
        lowerLine.includes('mmhg') || 
        lowerLine.includes('mmol/l')) {
      
      // Include the line and surrounding context
      if (index > 0) issueLines.push(lines[index - 1]);
      issueLines.push(line);
      if (index < lines.length - 1) issueLines.push(lines[index + 1]);
    }
  });

  // Remove duplicates and empty lines
  const uniqueLines = [...new Set(issueLines)].filter(line => line.trim().length > 0);
  
  // Limit to relevant context (max 500 characters)
  const context = uniqueLines.join('\n').substring(0, 500);
  
  return context || `Clinical issue identified: ${issueKeyword}`;
}

/**
 * Generate action plan request for a specific issue
 */
export function generateIssueActionPlanRequest(issue: IdentifiedIssue, abgType: string) {
  return {
    issue: issue.title,
    description: issue.description,
    question: `Please provide a comprehensive action plan for ${issue.title} in this ${abgType} analysis. Focus specifically on immediate interventions, monitoring parameters, and treatment protocols for this condition.`,
    severity: issue.severity,
    category: issue.category,
    priorityOrder: issue.priorityOrder
  };
}