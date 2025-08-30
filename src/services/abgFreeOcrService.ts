import { extractTextFromImage, extractTextFromPdf, OcrResult } from '../utils/unifiedOcrExtractor';
import { ABGType } from '../types/abg';

export interface ABGFreeOcrResult {
  success: boolean;
  extractedText: string;
  confidence: number;
  processingTimeMs: number;
  error?: string;
  requestId: string;
  method: 'tesseract' | 'pdfjs' | 'failed';
  qualityScore: number;
  shouldFallbackToGemini: boolean;
}

export interface ABGOcrProgressInfo {
  stage: 'preparing' | 'processing' | 'validating' | 'complete';
  stageDescription: string;
  percentage: number;
  method: 'free-ocr';
  currentTask?: string;
}

/**
 * Validate extracted text for ABG/BG analysis quality
 */
function validateABGText(text: string): {
  qualityScore: number;
  isValidMedicalText: boolean;
  shouldFallbackToGemini: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  let qualityScore = 1.0;

  // Check for minimum text length
  if (text.trim().length < 20) {
    issues.push('Text too short for analysis');
    qualityScore -= 0.4;
  }

  // Check for blood gas parameters (case insensitive, more flexible patterns)
  const bgParameters = [
    /p[hH]\s*[:\-=]?\s*\d/i, // pH
    /p[cC][oO]2?\s*[:\-=]?\s*\d/i, // pCO2, pco2, PCO2
    /p[oO]2?\s*[:\-=]?\s*\d/i, // pO2, po2, PO2
    /[hH][cC][oO]3?\s*[:\-=]?\s*\d/i, // HCO3, hco3
    /base\s*excess\s*[:\-=]?\s*[\-\+]?\d/i, // Base Excess
    /[sS][oO]2?\s*[:\-=]?\s*\d/i, // SO2, so2
    /[sS]p[oO]2?\s*[:\-=]?\s*\d/i, // SpO2, spo2
    /[oO]2?\s*sat\s*[:\-=]?\s*\d/i, // O2Sat, o2sat
    // Additional patterns for common variations
    /\d+\.\d+\s*(mmHg|kPa|%)/i, // Numeric values with units
    /\d+\s*(mmol\/L|mEq\/L)/i // HCO3 units
  ];

  const foundParameters = bgParameters.filter(pattern => pattern.test(text)).length;
  const parameterScore = Math.min(foundParameters / 4, 1); // Expect at least 4 parameters for good quality
  
  if (foundParameters === 0) {
    issues.push('No blood gas parameters detected');
    qualityScore -= 0.5;
  } else if (foundParameters < 3) {
    issues.push('Few blood gas parameters detected');
    qualityScore -= 0.3;
  }

  // Check for numeric values
  const numericMatches = text.match(/\d+\.?\d*/g);
  const hasNumbers = numericMatches && numericMatches.length >= 3;
  
  if (!hasNumbers) {
    issues.push('Insufficient numeric values');
    qualityScore -= 0.3;
  }

  // Check for medical device indicators (Radiometer, ABL, etc.)
  const deviceIndicators = [
    /radiometer/i,
    /abl\s*\d+/i,
    /blood\s*gas/i,
    /analyzer/i,
    /ბლოგაზ/i, // Georgian "blood gas"
    /ანალიზი/i // Georgian "analysis"
  ];

  const hasDeviceIndicator = deviceIndicators.some(pattern => pattern.test(text));
  if (hasDeviceIndicator) {
    qualityScore += 0.1; // Bonus for device indicators
  }

  // Check for potential OCR errors (excessive special characters, garbled text)
  const specialCharRatio = (text.match(/[^a-zA-Z0-9\s\u10A0-\u10FF:\-.,=+%]/g) || []).length / text.length;
  if (specialCharRatio > 0.3) {
    issues.push('High ratio of special characters (possible OCR errors)');
    qualityScore -= 0.2;
  }

  // Check for very long words (OCR artifacts)
  const longWords = text.match(/\S{25,}/g);
  if (longWords && longWords.length > 0) {
    issues.push('Detected very long words (possible OCR artifacts)');
    qualityScore -= 0.2;
  }

  // Normalize quality score
  qualityScore = Math.max(0, Math.min(1, qualityScore));

  // Decision logic for Gemini fallback
  const shouldFallbackToGemini = (
    qualityScore < 0.5 || // Low overall quality (lowered threshold)
    (qualityScore < 0.7 && foundParameters < 2) || // Strict parameter check only for lower quality
    text.trim().length < 30 || // Very short text
    specialCharRatio > 0.4 // Too many OCR errors
  );

  // Debug logging to understand fallback decisions
  console.log('Fallback decision analysis:', {
    foundParameters,
    textLength: text.trim().length,
    specialCharRatio: specialCharRatio.toFixed(2),
    shouldFallback: shouldFallbackToGemini,
    issues: issues.length > 0 ? issues : 'none'
  });

  return {
    qualityScore,
    isValidMedicalText: foundParameters > 0 && hasNumbers,
    shouldFallbackToGemini,
    issues
  };
}

/**
 * Post-process extracted text for ABG analysis with improved formatting
 */
function postProcessABGText(text: string): string {
  // Clean up common OCR errors for medical text
  let cleaned = text
    // Fix common medical abbreviations and OCR errors
    .replace(/\bpl-l\b/gi, 'pH') // Common OCR error
    .replace(/\bp[-]?h\s*[:=]?\s*(\d)/gi, 'pH: $1')
    .replace(/\bpC02\b/gi, 'pCO2') // Zero vs O confusion
    .replace(/\bp02\b/gi, 'pO2')
    .replace(/\bHC03\b/gi, 'HCO3') // Zero vs O confusion
    .replace(/\bS02\b/gi, 'SO2')
    .replace(/\bSp02\b/gi, 'SpO2')
    // Fix unit separations
    .replace(/(\d+\.?\d*)\s*(?:mm\s*Hg|mmHg)/gi, '$1 mmHg')
    .replace(/(\d+\.?\d*)\s*(?:k\s*Pa|kPa)/gi, '$1 kPa')
    .replace(/(\d+\.?\d*)\s*(?:mmol\/L|mmol\s*\/\s*L|mEq\/L|mEq\s*\/\s*L)/gi, '$1 mmol/L')
    .replace(/(\d+\.?\d*)\s*%/g, '$1%')
    .replace(/(\d+\.?\d*)\s*(?:g\/dL|g\s*\/\s*dL)/gi, '$1 g/dL')
    // Clean up excessive whitespace but preserve line breaks
    .replace(/[ \t]+/g, ' ') // Only replace spaces and tabs, NOT newlines
    .replace(/\n\s*\n/g, '\n') // Clean up multiple newlines
    .trim();

  // Enhanced formatting for better structure
  cleaned = formatBloodGasData(cleaned);

  return cleaned;
}

/**
 * Advanced formatting function to structure blood gas data like Gemini output
 */
function formatBloodGasData(text: string): string {
  // Use the original line breaks from OCR - they're actually good!
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Debug: Log the original lines to see what we're working with

  // Group related parameters
  const bgParams = {
    arterial: [] as string[],
    venous: [] as string[],
    electrolytes: [] as string[],
    oxygenation: [] as string[],
    other: [] as string[]
  };

  let currentSection = 'other';

  // Process each line
  for (let line of lines) {
    // Clean up the line first
    line = line
      .replace(/\s+/g, ' ')
      .trim();

    // Skip very short lines or junk
    if (line.length < 2) continue;

    // Detect section headers
    if (/blood\s*gas\s*values/i.test(line)) {
      currentSection = 'arterial';
      continue;
    } else if (/oximetry\s*values/i.test(line) || /oxygen/i.test(line)) {
      currentSection = 'oxygenation';
      continue;
    } else if (/electrolyte\s*values/i.test(line)) {
      currentSection = 'electrolytes';
      continue;
    }

    // Simple formatting - just clean up and add to current section
    if (line.match(/\d/)) { // Only process lines with numbers (actual data)
      // Clean up the line while preserving important symbols
      let cleanedLine = line
        .replace(/\s+/g, ' ')
        .trim();

      // Add to the appropriate section based on current context
      switch (currentSection) {
        case 'arterial':
          bgParams.arterial.push(cleanedLine);
          break;
        case 'oxygenation':
          bgParams.oxygenation.push(cleanedLine);
          break;
        case 'electrolytes':
          bgParams.electrolytes.push(cleanedLine);
          break;
        default:
          bgParams.other.push(cleanedLine);
          break;
      }
    }
  }

  // Debug: Log what we found in each section

  // Build formatted output with proper sections
  const output: string[] = [];

  // Add header
  output.push('Blood Gas Analysis Report');
  output.push('');

  // Add arterial blood gas parameters
  if (bgParams.arterial.length > 0) {
    output.push('Arterial Blood Gas Parameters:');
    bgParams.arterial.forEach(param => {
      output.push(`- ${param}`);
    });
    output.push('');
  }

  // Add oxygenation parameters
  if (bgParams.oxygenation.length > 0) {
    output.push('Oxygenation Status:');
    bgParams.oxygenation.forEach(param => {
      output.push(`- ${param}`);
    });
    output.push('');
  }

  // Add electrolyte values
  if (bgParams.electrolytes.length > 0) {
    output.push('Electrolyte Values:');
    bgParams.electrolytes.forEach(param => {
      output.push(`- ${param}`);
    });
    output.push('');
  }

  // Add other metabolites
  if (bgParams.other.length > 0) {
    output.push('Additional Parameters:');
    bgParams.other.forEach(param => {
      output.push(`- ${param}`);
    });
  }

  // If no structured data found, return cleaned original
  if (output.length <= 2) {

    return text; // Return original instead of cleaned to preserve formatting
  }

  const result = output.join('\n').trim();

  return result;
}

/**
 * Extract text from ABG image using free OCR methods
 */
export async function extractABGTextWithFreeOCR(
  file: File,
  abgType: ABGType,
  onProgress?: (progress: ABGOcrProgressInfo) => void
): Promise<ABGFreeOcrResult> {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();

  try {
    onProgress?.({
      stage: 'preparing',
      stageDescription: 'Initializing free OCR for blood gas analysis...',
      percentage: 0,
      method: 'free-ocr',
      currentTask: 'Preparing OCR engine'
    });

    let ocrResult: OcrResult;
    let method: 'tesseract' | 'pdfjs' | 'failed' = 'failed';

    // Determine extraction method based on file type
    if (file.type === 'application/pdf') {
      onProgress?.({
        stage: 'processing',
        stageDescription: 'Extracting text from PDF using PDF.js...',
        percentage: 25,
        method: 'free-ocr',
        currentTask: 'Processing PDF document'
      });

      ocrResult = await extractTextFromPdf(file, (pdfProgress) => {
        onProgress?.({
          stage: 'processing',
          stageDescription: pdfProgress.message,
          percentage: 25 + (pdfProgress.current / pdfProgress.total) * 50,
          method: 'free-ocr',
          currentTask: 'Extracting PDF text'
        });
      });
      method = ocrResult.success ? 'pdfjs' : 'failed';
    } else if (file.type.startsWith('image/')) {
      onProgress?.({
        stage: 'processing',
        stageDescription: 'Extracting text from image using Tesseract OCR...',
        percentage: 25,
        method: 'free-ocr',
        currentTask: 'Processing image with OCR'
      });

      ocrResult = await extractTextFromImage(file, (imageProgress) => {
        onProgress?.({
          stage: 'processing',
          stageDescription: imageProgress.message,
          percentage: 25 + (imageProgress.current / imageProgress.total) * 50,
          method: 'free-ocr',
          currentTask: 'OCR text recognition'
        });
      });
      method = ocrResult.success ? 'tesseract' : 'failed';
    } else {
      throw new Error(`Unsupported file type for OCR: ${file.type}`);
    }

    if (!ocrResult.success || !ocrResult.text) {
      const errorMessage = ocrResult.error || 'Free OCR extraction failed';
      const processingTime = Math.round(performance.now() - startTime);

      onProgress?.({
        stage: 'complete',
        stageDescription: 'Free OCR failed - ready for Gemini fallback',
        percentage: 100,
        method: 'free-ocr',
        currentTask: 'OCR failed'
      });

      return {
        success: false,
        extractedText: '',
        confidence: 0,
        processingTimeMs: processingTime,
        error: errorMessage,
        requestId,
        method: 'failed',
        qualityScore: 0,
        shouldFallbackToGemini: true
      };
    }

    onProgress?.({
      stage: 'validating',
      stageDescription: 'Validating extracted text quality...',
      percentage: 75,
      method: 'free-ocr',
      currentTask: 'Analyzing text quality'
    });

    // Post-process the extracted text
    const cleanedText = postProcessABGText(ocrResult.text);

    // Validate text quality for ABG analysis
    const validation = validateABGText(cleanedText);

    onProgress?.({
      stage: 'complete',
      stageDescription: validation.shouldFallbackToGemini 
        ? 'Low quality detected - recommending Gemini fallback'
        : 'Free OCR extraction completed successfully',
      percentage: 100,
      method: 'free-ocr',
      currentTask: 'Quality assessment complete'
    });

    const processingTime = Math.round(performance.now() - startTime);

    // Debug: Log the formatted text to see if our formatting is working

    console.log('Original OCR text:', ocrResult.text.substring(0, 200) + '...');
    console.log('After postProcessABGText:', cleanedText.substring(0, 200) + '...');
    console.log('Original has', (ocrResult.text.match(/\n/g) || []).length, 'line breaks');
    console.log('Cleaned has', (cleanedText.match(/\n/g) || []).length, 'line breaks');

    return {
      success: true,
      extractedText: cleanedText,
      confidence: ocrResult.confidence,
      processingTimeMs: processingTime,
      requestId,
      method,
      qualityScore: validation.qualityScore,
      shouldFallbackToGemini: validation.shouldFallbackToGemini
    };

  } catch (error) {
    const processingTime = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';

    onProgress?.({
      stage: 'complete',
      stageDescription: 'Free OCR error - ready for Gemini fallback',
      percentage: 100,
      method: 'free-ocr',
      currentTask: 'Error occurred'
    });

    return {
      success: false,
      extractedText: '',
      confidence: 0,
      processingTimeMs: processingTime,
      error: errorMessage,
      requestId,
      method: 'failed',
      qualityScore: 0,
      shouldFallbackToGemini: true
    };
  }
}

/**
 * Quick text quality check for already extracted text
 */
export function assessABGTextQuality(text: string): {
  qualityScore: number;
  shouldFallbackToGemini: boolean;
  issues: string[];
} {
  const validation = validateABGText(text);
  return {
    qualityScore: validation.qualityScore,
    shouldFallbackToGemini: validation.shouldFallbackToGemini,
    issues: validation.issues
  };
}