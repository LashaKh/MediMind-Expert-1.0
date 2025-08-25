/**
 * Document Metadata Analyzer for MediMind Expert
 * Addresses LOW-001: Content Scanning Coverage Limitations
 * 
 * Analyzes document metadata for security purposes without breaking
 * existing file processing workflows
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

/**
 * Security-relevant metadata patterns
 */
const SECURITY_METADATA_PATTERNS = {
  // Author information that might contain sensitive data
  authors: {
    patterns: [
      /creator|author|producer/i,
      /subject|title|keywords/i,
      /company|organization/i
    ],
    riskLevel: 'medium',
    description: 'Document author and creation metadata'
  },
  
  // Software information for security assessment
  software: {
    patterns: [
      /microsoft\s+word|excel|powerpoint/i,
      /adobe\s+acrobat|reader/i,
      /libreoffice|openoffice/i,
      /google\s+docs|sheets/i
    ],
    riskLevel: 'low',
    description: 'Document creation software'
  },
  
  // Dates that might reveal sensitive timing
  dates: {
    patterns: [
      /creation\s+date|modified\s+date/i,
      /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/
    ],
    riskLevel: 'low',
    description: 'Document creation and modification dates'
  },
  
  // Hidden content or revision information
  revisions: {
    patterns: [
      /revision|version|track\s+changes/i,
      /comment|annotation|markup/i,
      /hidden|invisible|deleted/i
    ],
    riskLevel: 'high',
    description: 'Document revision and hidden content'
  }
};

/**
 * File size analysis thresholds
 */
const SIZE_ANALYSIS_THRESHOLDS = {
  suspicious: {
    tinyFile: 100, // Files under 100 bytes might be suspicious
    largeFile: 500 * 1024 * 1024, // Files over 500MB might need special handling
    emptyFile: 0 // Empty files
  },
  limits: {
    maxProcessingSize: 500 * 1024 * 1024, // 500MB processing limit
    warningSize: 100 * 1024 * 1024 // 100MB warning threshold
  }
};

/**
 * Analyze file metadata for security assessment
 * @param {string} tempFilePath - Path to temporary file
 * @param {Object} fileInfo - File information from upload
 * @returns {Object} Metadata analysis results
 */
async function analyzeFileMetadata(tempFilePath, fileInfo = {}) {
  const startTime = Date.now();
  
  try {
    if (!fs.existsSync(tempFilePath)) {
      throw new Error('File does not exist at specified path');
    }

    const stats = fs.statSync(tempFilePath);
    const analysis = {
      fileStats: await analyzeFileStats(stats, fileInfo),
      sizeAnalysis: analyzeSizeMetrics(stats.size, fileInfo),
      signatureAnalysis: await analyzeFileSignature(tempFilePath, fileInfo),
      securityAssessment: {
        riskLevel: 'low',
        warnings: [],
        recommendations: []
      },
      processingRecommendations: [],
      analysisTimestamp: new Date().toISOString(),
      analysisDuration: 0
    };

    // Perform security assessment based on collected data
    const securityAssessment = performSecurityAssessment(analysis);
    analysis.securityAssessment = securityAssessment;

    // Generate processing recommendations
    analysis.processingRecommendations = generateProcessingRecommendations(analysis);

    analysis.analysisDuration = Date.now() - startTime;

    logger.info('Metadata analysis completed', {
      fileName: fileInfo.name,
      fileSize: stats.size,
      riskLevel: analysis.securityAssessment.riskLevel,
      warningsCount: analysis.securityAssessment.warnings.length,
      analysisDuration: analysis.analysisDuration
    });

    return analysis;

  } catch (error) {
    logger.error('Metadata analysis failed', {
      error: error.message,
      fileName: fileInfo.name,
      tempFilePath
    });

    return {
      fileStats: null,
      sizeAnalysis: null,
      signatureAnalysis: null,
      securityAssessment: {
        riskLevel: 'unknown',
        warnings: ['Metadata analysis failed'],
        recommendations: ['Manual security review recommended']
      },
      processingRecommendations: ['Proceed with caution'],
      analysisTimestamp: new Date().toISOString(),
      analysisDuration: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * Analyze basic file statistics
 */
async function analyzeFileStats(stats, fileInfo) {
  return {
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
    accessedAt: stats.atime,
    
    // Security-relevant metrics
    ageInMinutes: (Date.now() - stats.birthtime.getTime()) / (1000 * 60),
    lastModifiedMinutes: (Date.now() - stats.mtime.getTime()) / (1000 * 60),
    
    // File system attributes
    isSymlink: stats.isSymbolicLink(),
    permissions: stats.mode.toString(8),
    
    // Cross-reference with declared information
    sizeMismatch: fileInfo.size && Math.abs(stats.size - fileInfo.size) > 1024,
    declaredType: fileInfo.type,
    declaredName: fileInfo.name
  };
}

/**
 * Analyze file size for security implications
 */
function analyzeSizeMetrics(fileSize, fileInfo) {
  const analysis = {
    size: fileSize,
    sizeCategory: categorizeSizeRisk(fileSize),
    warnings: [],
    recommendations: []
  };

  // Check for suspicious sizes
  if (fileSize <= SIZE_ANALYSIS_THRESHOLDS.suspicious.tinyFile) {
    analysis.warnings.push('File is unusually small');
    analysis.recommendations.push('Verify file content completeness');
  }

  if (fileSize >= SIZE_ANALYSIS_THRESHOLDS.suspicious.largeFile) {
    analysis.warnings.push('File is very large');
    analysis.recommendations.push('Consider chunked processing for large file');
  }

  if (fileSize === 0) {
    analysis.warnings.push('File appears to be empty');
    analysis.recommendations.push('Verify file was uploaded correctly');
  }

  // Performance warnings
  if (fileSize >= SIZE_ANALYSIS_THRESHOLDS.limits.warningSize) {
    analysis.recommendations.push('Large file may require extended processing time');
  }

  if (fileSize >= SIZE_ANALYSIS_THRESHOLDS.limits.maxProcessingSize) {
    analysis.warnings.push('File exceeds recommended processing size');
    analysis.recommendations.push('Consider breaking into smaller segments');
  }

  return analysis;
}

/**
 * Analyze file signature and basic structure
 */
async function analyzeFileSignature(tempFilePath, fileInfo) {
  try {
    const buffer = fs.readFileSync(tempFilePath, { start: 0, end: 1024 }); // Read first 1KB
    
    const analysis = {
      signatureBytes: Array.from(buffer.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' '),
      probableType: detectFileTypeFromSignature(buffer),
      declaredType: fileInfo.type,
      hasNullBytes: buffer.includes(0),
      hasHighBytes: buffer.some(b => b > 127),
      textRatio: calculateTextRatio(buffer),
      warnings: []
    };

    // Validate declared type against signature
    if (analysis.probableType && analysis.declaredType) {
      const typeMatch = validateTypeConsistency(analysis.probableType, analysis.declaredType);
      if (!typeMatch) {
        analysis.warnings.push('File signature does not match declared type');
      }
    }

    // Additional structural analysis for PDFs
    if (analysis.probableType === 'application/pdf' || analysis.declaredType === 'application/pdf') {
      const pdfAnalysis = analyzePdfStructure(buffer);
      analysis.pdfStructure = pdfAnalysis;
    }

    return analysis;

  } catch (error) {
    logger.error('File signature analysis failed', {
      error: error.message,
      fileName: fileInfo.name
    });

    return {
      signatureBytes: null,
      probableType: null,
      declaredType: fileInfo.type,
      warnings: ['File signature analysis failed'],
      error: error.message
    };
  }
}

/**
 * Detect file type from binary signature
 */
function detectFileTypeFromSignature(buffer) {
  const signatures = {
    'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
    'application/msword': [Buffer.from([0xD0, 0xCF, 0x11, 0xE0])], // MS Office
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [Buffer.from([0x50, 0x4B, 0x03, 0x04])], // ZIP (DOCX)
    'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
    'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47])],
    'text/plain': [] // No specific signature for text files
  };

  for (const [mimeType, sigs] of Object.entries(signatures)) {
    if (sigs.length === 0) continue; // Skip text files
    
    for (const sig of sigs) {
      if (buffer.length >= sig.length && buffer.subarray(0, sig.length).equals(sig)) {
        return mimeType;
      }
    }
  }

  // Check if it's likely text
  const textRatio = calculateTextRatio(buffer);
  if (textRatio > 0.8) {
    return 'text/plain';
  }

  return null; // Unknown type
}

/**
 * Calculate the ratio of printable text characters
 */
function calculateTextRatio(buffer) {
  if (buffer.length === 0) return 0;
  
  let textChars = 0;
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    // Count printable ASCII and common whitespace
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
      textChars++;
    }
  }
  
  return textChars / buffer.length;
}

/**
 * Validate consistency between detected and declared file types
 */
function validateTypeConsistency(detected, declared) {
  // Exact matches
  if (detected === declared) return true;
  
  // Known compatible types
  const compatibleTypes = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['application/zip'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['application/zip'],
    'text/csv': ['text/plain']
  };
  
  if (compatibleTypes[declared] && compatibleTypes[declared].includes(detected)) {
    return true;
  }
  
  return false;
}

/**
 * Analyze PDF structure for additional security insights
 */
function analyzePdfStructure(buffer) {
  try {
    const headerString = buffer.toString('ascii', 0, 8);
    const pdfMatch = headerString.match(/%PDF-(\d+\.\d+)/);
    
    return {
      version: pdfMatch ? pdfMatch[1] : null,
      hasValidHeader: buffer.toString('ascii', 0, 4) === '%PDF',
      estimatedComplexity: estimatePdfComplexity(buffer)
    };
  } catch (error) {
    return {
      version: null,
      hasValidHeader: false,
      error: error.message
    };
  }
}

/**
 * Estimate PDF complexity based on structure indicators
 */
function estimatePdfComplexity(buffer) {
  const content = buffer.toString('binary');
  let complexity = 0;
  
  // Look for complexity indicators
  if (content.includes('/JavaScript')) complexity += 3; // High risk
  if (content.includes('/EmbeddedFile')) complexity += 2;
  if (content.includes('/Form')) complexity += 1;
  if (content.includes('/Image')) complexity += 1;
  if (content.includes('/Font')) complexity += 1;
  
  return Math.min(complexity, 10); // Cap at 10
}

/**
 * Categorize file size risk level
 */
function categorizeSizeRisk(size) {
  if (size === 0) return 'empty';
  if (size < 100) return 'tiny';
  if (size < 1024) return 'small';
  if (size < 1024 * 1024) return 'medium';
  if (size < 10 * 1024 * 1024) return 'large';
  if (size < 100 * 1024 * 1024) return 'very-large';
  if (size < 500 * 1024 * 1024) return 'huge';
  return 'massive';
}

/**
 * Perform overall security assessment
 */
function performSecurityAssessment(analysis) {
  const warnings = [];
  const recommendations = [];
  let riskLevel = 'low';

  // Aggregate warnings from all analyses
  if (analysis.sizeAnalysis?.warnings?.length > 0) {
    warnings.push(...analysis.sizeAnalysis.warnings);
  }
  
  if (analysis.signatureAnalysis?.warnings?.length > 0) {
    warnings.push(...analysis.signatureAnalysis.warnings);
  }

  // Assess risk level
  if (warnings.some(w => w.includes('signature does not match') || w.includes('unusually'))) {
    riskLevel = 'high';
  } else if (warnings.length > 2) {
    riskLevel = 'medium';
  }

  // Generate recommendations
  if (riskLevel === 'high') {
    recommendations.push('Additional security review recommended');
    recommendations.push('Consider manual verification of file contents');
  }
  
  if (analysis.fileStats?.sizeMismatch) {
    recommendations.push('Verify file integrity - size mismatch detected');
  }

  // PDF-specific recommendations
  if (analysis.signatureAnalysis?.pdfStructure?.estimatedComplexity > 5) {
    recommendations.push('Complex PDF detected - enhanced scanning recommended');
  }

  return {
    riskLevel,
    warnings,
    recommendations,
    overallRiskScore: calculateOverallRiskScore(warnings, riskLevel)
  };
}

/**
 * Calculate numerical risk score
 */
function calculateOverallRiskScore(warnings, riskLevel) {
  let score = 0;
  
  // Base score from risk level
  const riskScores = { 'low': 1, 'medium': 3, 'high': 5, 'critical': 8 };
  score += riskScores[riskLevel] || 0;
  
  // Add warnings score
  score += warnings.length;
  
  // Normalize to 0-10 scale
  return Math.min(score, 10);
}

/**
 * Generate processing recommendations
 */
function generateProcessingRecommendations(analysis) {
  const recommendations = [];
  
  // Size-based recommendations
  if (analysis.sizeAnalysis?.sizeCategory === 'very-large' || analysis.sizeAnalysis?.sizeCategory === 'huge') {
    recommendations.push('Use streaming processing for large file');
    recommendations.push('Monitor memory usage during processing');
  }
  
  // Type-based recommendations
  if (analysis.signatureAnalysis?.probableType === 'application/pdf') {
    recommendations.push('Use PDF-specific text extraction methods');
    if (analysis.signatureAnalysis.pdfStructure?.estimatedComplexity > 3) {
      recommendations.push('Enhanced OCR may be needed for complex PDF');
    }
  }
  
  // Security-based recommendations
  if (analysis.securityAssessment.riskLevel === 'high') {
    recommendations.push('Apply additional security scanning');
    recommendations.push('Log detailed processing metadata');
  }
  
  return recommendations;
}

module.exports = {
  analyzeFileMetadata,
  SECURITY_METADATA_PATTERNS,
  SIZE_ANALYSIS_THRESHOLDS
};