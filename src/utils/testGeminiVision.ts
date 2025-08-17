/**
 * Test utility to debug Gemini Vision API issues
 * This helps diagnose problems with ABG image text extraction
 */

import { extractTextFromImageWithGemini } from './geminiVisionExtractor';

export interface TestResult {
  success: boolean;
  extractedText: string;
  confidence: number;
  error?: string;
  apiKeyPresent: boolean;
  imageInfo: {
    name: string;
    size: number;
    type: string;
  };
}

/**
 * Test Gemini Vision extraction with detailed logging
 */
export async function testGeminiVisionExtraction(file: File): Promise<TestResult> {
  console.log('🔍 Testing Gemini Vision API with file:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  });

  // Check API key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const apiKeyPresent = Boolean(apiKey);
  
  console.log('🔑 API Key status:', {
    present: apiKeyPresent,
    length: apiKey ? apiKey.length : 0,
    preview: apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found'
  });

  if (!apiKeyPresent) {
    return {
      success: false,
      extractedText: '',
      confidence: 0,
      error: 'Gemini API key not found in environment variables',
      apiKeyPresent: false,
      imageInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };
  }

  try {
    console.log('📤 Calling Gemini Vision API...');
    const result = await extractTextFromImageWithGemini(file);
    
    console.log('✅ Gemini Vision API Response:', {
      success: true,
      textLength: result.text.length,
      confidence: result.confidence,
      method: result.method,
      textPreview: result.text.substring(0, 200) + (result.text.length > 200 ? '...' : '')
    });

    return {
      success: true,
      extractedText: result.text,
      confidence: result.confidence,
      apiKeyPresent: true,
      imageInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('❌ Gemini Vision API Error:', {
      error: errorMessage,
      errorObject: error
    });

    return {
      success: false,
      extractedText: '',
      confidence: 0,
      error: errorMessage,
      apiKeyPresent: true,
      imageInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };
  }
}

/**
 * Compare expected vs actual extraction results
 */
export function compareExtractionResults(expected: string[], actual: string): {
  matches: string[];
  missing: string[];
  accuracy: number;
} {
  const matches: string[] = [];
  const missing: string[] = [];

  expected.forEach(expectedValue => {
    if (actual.toLowerCase().includes(expectedValue.toLowerCase())) {
      matches.push(expectedValue);
    } else {
      missing.push(expectedValue);
    }
  });

  const accuracy = expected.length > 0 ? matches.length / expected.length : 0;

  return {
    matches,
    missing,
    accuracy
  };
}

/**
 * Test with known ABG values from the uploaded image
 */
export function testABGExtraction(extractedText: string) {
  // Expected values from the screenshot
  const expectedValues = [
    '7.499', // pH
    '27.5', // pCO2
    '12.2', // pO2
    '20.4', // HCO3
    '136', // Na+
    '3.4', // K+
    '99', // Cl-
    '73', // ctHb
    '94.1', // sO2
    '11.2', // cGlu
    '1.3' // cLac
  ];

  const results = compareExtractionResults(expectedValues, extractedText);
  
  console.log('🧪 ABG Extraction Test Results:', {
    accuracy: `${Math.round(results.accuracy * 100)}%`,
    matches: results.matches,
    missing: results.missing,
    totalExpected: expectedValues.length,
    foundValues: results.matches.length
  });

  return results;
}