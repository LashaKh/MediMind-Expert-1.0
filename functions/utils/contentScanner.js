/**
 * Enhanced Content Scanner for MediMind Expert
 * Addresses LOW-001: Content Scanning Coverage Limitations
 * 
 * This module ENHANCES the existing content scanning WITHOUT modifying
 * the working OCR/text extraction systems. It processes extracted text
 * from the existing extraction pipeline for comprehensive security scanning.
 */

const { logger } = require('./logger');

/**
 * Enhanced security patterns for medical documents
 * Designed to work with already-extracted text from existing OCR system
 */
const ENHANCED_SECURITY_PATTERNS = {
  // Basic PII patterns (existing)
  ssn: {
    pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    type: 'SSN',
    severity: 'high',
    description: 'Social Security Number'
  },
  creditCard: {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    type: 'Credit Card',
    severity: 'high',
    description: 'Credit Card Number'
  },
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    type: 'Email',
    severity: 'medium',
    description: 'Email Address'
  },
  phone: {
    pattern: /\b(?:\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    type: 'Phone Number',
    severity: 'medium',
    description: 'Phone Number'
  },

  // Medical/HIPAA-specific patterns
  medicalRecordNumber: {
    pattern: /\b(?:MRN|MR#|Medical\s+Record|Record\s+#)[:\s]*([A-Z0-9]{6,12})\b/gi,
    type: 'Medical Record Number',
    severity: 'critical',
    description: 'Medical Record Number (HIPAA Protected)'
  },
  patientId: {
    pattern: /\b(?:Patient\s+ID|PID|Patient\s+#)[:\s]*([A-Z0-9]{4,12})\b/gi,
    type: 'Patient ID',
    severity: 'critical',
    description: 'Patient Identifier'
  },
  dateOfBirth: {
    pattern: /\b(?:DOB|Date\s+of\s+Birth|Birth\s+Date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi,
    type: 'Date of Birth',
    severity: 'critical',
    description: 'Date of Birth (HIPAA Protected)'
  },
  insuranceNumber: {
    pattern: /\b(?:Insurance|Policy|Member)\s+(?:#|Number|ID)[:\s]*([A-Z0-9]{6,15})\b/gi,
    type: 'Insurance Number',
    severity: 'high',
    description: 'Insurance/Policy Number'
  },
  providerNPI: {
    pattern: /\b(?:NPI|Provider\s+#)[:\s]*(\d{10})\b/gi,
    type: 'Provider NPI',
    severity: 'medium',
    description: 'Healthcare Provider NPI'
  },

  // Medical terminology patterns for context analysis
  diagnosisCodes: {
    pattern: /\b[A-Z]\d{2}(?:\.\d{1,2})?\b/g,
    type: 'ICD-10 Code',
    severity: 'medium',
    description: 'Medical Diagnosis Code'
  },
  prescriptionInfo: {
    pattern: /\b(?:Rx|Prescription)[:\s]*[A-Za-z\s]+\d+\s*mg\b/gi,
    type: 'Prescription',
    severity: 'high',
    description: 'Prescription Information'
  },
  labResults: {
    pattern: /\b(?:glucose|cholesterol|hemoglobin|hba1c)\s*[:\s]*\d+(?:\.\d+)?\s*(?:mg\/dl|mmol\/l|%)\b/gi,
    type: 'Lab Results',
    severity: 'high',
    description: 'Laboratory Results'
  },

  // Georgian medical patterns (works with existing Georgian text processing)
  georgianPersonalInfo: {
    pattern: /\b(?:პირადი\s+ნომერი|სახელი|გვარი)[:\s]*[ა-ჰ\s]+\b/gi,
    type: 'Georgian Personal Info',
    severity: 'high',
    description: 'Georgian Personal Information'
  },
  georgianMedicalTerms: {
    pattern: /\b(?:დიაგნოზი|მკურნალობა|ანალიზი|კვლევა)[:\s]*[ა-ჰ\s]+\b/gi,
    type: 'Georgian Medical Info',
    severity: 'medium',
    description: 'Georgian Medical Information'
  },

  // Russian medical patterns
  russianPersonalInfo: {
    pattern: /\b(?:ФИО|Фамилия|Имя|Отчество)[:\s]*[А-Яа-я\s]+\b/gi,
    type: 'Russian Personal Info',
    severity: 'high',
    description: 'Russian Personal Information'
  },
  russianMedicalTerms: {
    pattern: /\b(?:диагноз|лечение|анализ|исследование)[:\s]*[А-Яа-я\s]+\b/gi,
    type: 'Russian Medical Info',
    severity: 'medium',
    description: 'Russian Medical Information'
  }
};

/**
 * Document classification patterns to determine document type
 */
const DOCUMENT_CLASSIFICATION_PATTERNS = {
  medicalReport: {
    patterns: [
      /medical\s+report/gi,
      /patient\s+summary/gi,
      /clinical\s+notes/gi,
      /discharge\s+summary/gi,
      /progress\s+note/gi
    ],
    category: 'Medical Report',
    riskLevel: 'high'
  },
  labResults: {
    patterns: [
      /laboratory\s+results/gi,
      /lab\s+report/gi,
      /blood\s+test/gi,
      /urine\s+analysis/gi,
      /pathology\s+report/gi
    ],
    category: 'Laboratory Results',
    riskLevel: 'high'
  },
  imagingReport: {
    patterns: [
      /radiology\s+report/gi,
      /x-ray\s+report/gi,
      /mri\s+report/gi,
      /ct\s+scan/gi,
      /ultrasound\s+report/gi
    ],
    category: 'Medical Imaging',
    riskLevel: 'high'
  },
  researchData: {
    patterns: [
      /clinical\s+trial/gi,
      /research\s+data/gi,
      /study\s+protocol/gi,
      /statistical\s+analysis/gi
    ],
    category: 'Research Data',
    riskLevel: 'medium'
  },
  educationalContent: {
    patterns: [
      /educational\s+material/gi,
      /patient\s+information/gi,
      /medical\s+guideline/gi,
      /protocol/gi,
      /procedure/gi
    ],
    category: 'Educational Content',
    riskLevel: 'low'
  }
};

/**
 * Scan extracted text for sensitive content
 * This function receives text that has already been extracted using the existing OCR system
 * @param {string} extractedText - Text content from existing OCR/extraction pipeline
 * @param {Object} fileInfo - File metadata
 * @param {Object} options - Scanning options
 * @returns {Object} Enhanced scanning results
 */
function scanExtractedContent(extractedText, fileInfo = {}, options = {}) {
  const startTime = Date.now();
  
  try {
    // Input validation
    if (!extractedText || typeof extractedText !== 'string') {
      return {
        hasSensitiveContent: false,
        warnings: [],
        patterns: [],
        classification: null,
        confidence: 0,
        scanDuration: Date.now() - startTime,
        error: 'No text content provided for scanning'
      };
    }

    const warnings = [];
    const detectedPatterns = [];
    let highestSeverity = 'low';
    let totalMatches = 0;

    // Log scan initiation
    logger.info('Enhanced content scanning initiated', {
      textLength: extractedText.length,
      fileName: fileInfo.name,
      fileType: fileInfo.type,
      enableMedicalTerminology: options.enableMedicalTerminology !== false
    });

    // Scan for all security patterns
    Object.entries(ENHANCED_SECURITY_PATTERNS).forEach(([patternKey, patternConfig]) => {
      const matches = extractedText.match(patternConfig.pattern);
      
      if (matches && matches.length > 0) {
        const matchCount = matches.length;
        totalMatches += matchCount;
        
        // Update highest severity
        if (getSeverityLevel(patternConfig.severity) > getSeverityLevel(highestSeverity)) {
          highestSeverity = patternConfig.severity;
        }

        // Create warning
        const warning = `${patternConfig.description}: ${matchCount} instance${matchCount > 1 ? 's' : ''} found`;
        warnings.push(warning);

        // Record detected pattern
        detectedPatterns.push({
          type: patternConfig.type,
          severity: patternConfig.severity,
          description: patternConfig.description,
          matchCount,
          // Include first few characters of matches for auditing (redacted for security)
          sampleMatches: matches.slice(0, 3).map(match => 
            match.length > 10 ? match.substring(0, 4) + '***' + match.substring(match.length - 2) : '***'
          )
        });

        logger.info('Sensitive content detected', {
          patternType: patternConfig.type,
          matchCount,
          severity: patternConfig.severity,
          fileName: fileInfo.name
        });
      }
    });

    // Classify document content
    const classification = classifyDocument(extractedText);
    
    // Calculate confidence score based on text length, patterns found, and content quality
    const confidence = calculateScanConfidence(extractedText, totalMatches, classification);

    // Determine overall assessment
    const hasSensitiveContent = warnings.length > 0;
    const riskScore = calculateRiskScore(detectedPatterns, classification, extractedText.length);

    const scanDuration = Date.now() - startTime;

    const result = {
      hasSensitiveContent,
      warnings,
      patterns: detectedPatterns,
      classification,
      confidence,
      riskScore,
      highestSeverity,
      totalMatches,
      scanDuration,
      scanTimestamp: new Date().toISOString(),
      textLength: extractedText.length,
      // Enhanced metadata
      medicalContentDetected: classification?.category?.includes('Medical') || false,
      multilanguageContent: detectMultiLanguageContent(extractedText),
      recommendedActions: generateRecommendedActions(detectedPatterns, classification)
    };

    // Log scan completion
    logger.info('Enhanced content scanning completed', {
      fileName: fileInfo.name,
      hasSensitiveContent,
      totalMatches,
      riskScore,
      scanDuration,
      classification: classification?.category
    });

    return result;

  } catch (error) {
    logger.error('Content scanning failed', {
      error: error.message,
      fileName: fileInfo.name,
      textLength: extractedText?.length || 0
    });

    return {
      hasSensitiveContent: false,
      warnings: ['Content scanning encountered an error'],
      patterns: [],
      classification: null,
      confidence: 0,
      scanDuration: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * Classify document based on content patterns
 */
function classifyDocument(text) {
  let bestMatch = null;
  let highestScore = 0;

  Object.entries(DOCUMENT_CLASSIFICATION_PATTERNS).forEach(([key, config]) => {
    let score = 0;
    
    config.patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length;
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        type: key,
        category: config.category,
        riskLevel: config.riskLevel,
        confidence: Math.min(score / 5, 1) // Normalize to 0-1
      };
    }
  });

  return bestMatch;
}

/**
 * Calculate scanning confidence based on various factors
 */
function calculateScanConfidence(text, totalMatches, classification) {
  let confidence = 0.5; // Base confidence

  // Adjust based on text length (longer text = higher confidence in scan completeness)
  if (text.length > 10000) confidence += 0.3;
  else if (text.length > 1000) confidence += 0.2;
  else if (text.length > 100) confidence += 0.1;

  // Adjust based on patterns found
  if (totalMatches > 0) confidence += 0.2;

  // Adjust based on document classification
  if (classification && classification.confidence > 0.5) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

/**
 * Calculate risk score for the document
 */
function calculateRiskScore(patterns, classification, textLength) {
  let riskScore = 0;

  // Base risk from detected patterns
  patterns.forEach(pattern => {
    const severityMultiplier = getSeverityLevel(pattern.severity);
    riskScore += pattern.matchCount * severityMultiplier;
  });

  // Adjust based on document classification
  if (classification) {
    const classificationRisk = {
      'high': 0.3,
      'medium': 0.2,
      'low': 0.1
    };
    riskScore += (classificationRisk[classification.riskLevel] || 0) * 10;
  }

  // Normalize to 0-1 scale
  return Math.min(riskScore / 10, 1.0);
}

/**
 * Get numeric severity level
 */
function getSeverityLevel(severity) {
  const levels = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };
  return levels[severity] || 1;
}

/**
 * Detect multi-language content in the document
 */
function detectMultiLanguageContent(text) {
  const languages = [];
  
  // English detection
  if (/[A-Za-z]{10,}/.test(text)) {
    languages.push('English');
  }
  
  // Georgian detection
  if (/[ა-ჰ]{10,}/.test(text)) {
    languages.push('Georgian');
  }
  
  // Russian detection  
  if (/[А-Яа-я]{10,}/.test(text)) {
    languages.push('Russian');
  }

  return languages;
}

/**
 * Generate recommended actions based on scan results
 */
function generateRecommendedActions(patterns, classification) {
  const actions = [];

  // Critical patterns require immediate action
  const criticalPatterns = patterns.filter(p => p.severity === 'critical');
  if (criticalPatterns.length > 0) {
    actions.push('Review document for HIPAA compliance before processing');
    actions.push('Consider additional access controls for this document');
  }

  // High-risk patterns require review
  const highRiskPatterns = patterns.filter(p => p.severity === 'high');
  if (highRiskPatterns.length > 0) {
    actions.push('Review sensitive content before sharing');
    actions.push('Ensure proper data handling procedures are followed');
  }

  // Medical documents require special handling
  if (classification && classification.category.includes('Medical')) {
    actions.push('Apply medical document security protocols');
    actions.push('Verify patient consent for document processing');
  }

  // General recommendations
  if (patterns.length > 0) {
    actions.push('Monitor document access and usage');
    actions.push('Regular audit of document handling compliance');
  }

  return actions;
}

module.exports = {
  scanExtractedContent,
  ENHANCED_SECURITY_PATTERNS,
  DOCUMENT_CLASSIFICATION_PATTERNS
};