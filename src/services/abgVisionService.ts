import { analyzeImage } from '../lib/api/vision';

export interface ABGAnalysisResult {
  rawAnalysis: string;
  processingTimeMs: number;
  confidence: number;
  imageProcessed: boolean;
}

export interface ABGAnalysisError {
  code: 'INVALID_FILE' | 'PROCESSING_FAILED' | 'API_ERROR' | 'UNSUPPORTED_FORMAT';
  message: string;
  details?: string;
}

/**
 * Validate if the uploaded file is suitable for ABG analysis
 */
export const validateABGImage = (file: File): { isValid: boolean; error?: ABGAnalysisError } => {
  // Check file type
  if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
    return {
      isValid: false,
      error: {
        code: 'UNSUPPORTED_FORMAT',
        message: t('abg.vision.unsupportedFormat'),
        details: `${t('abg.vision.received')} ${file.type}`
      }
    };
  }

  // Check file size (max 10MB for medical images)
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_FILE',
        message: t('abg.vision.imageTooLarge'),
        details: `${t('abg.vision.fileSize')} ${Math.round(file.size / 1024 / 1024)}MB`
      }
    };
  }

  // Check minimum file size (avoid empty or corrupted files)
  const minSizeBytes = 1024; // 1KB
  if (file.size < minSizeBytes) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_FILE',
        message: t('abg.vision.imageCorruptedOrEmpty'),
        details: `${t('abg.vision.fileSize')} ${file.size} bytes`
      }
    };
  }

  return { isValid: true };
};

/**
 * Analyze ABG image using Google Gemini Vision API
 * Optimized for blood gas analysis reports with medical-specific prompting
 */
export const analyzeABGImage = async (file: File): Promise<ABGAnalysisResult> => {
  const startTime = performance.now();

  try {
    // Validate file first
    const validation = validateABGImage(file);
    if (!validation.isValid) {
      throw new Error(validation.error!.message);
    }

    // Enhanced prompt specifically for blood gas analysis
    const medicalPrompt = t('abg.vision.aiPrompt');

    // Create a custom Gemini API call with medical-specific configuration
    const base64Image = await convertImageToBase64(file);
    
    // Debug logging for image processing


    const apiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + 
      import.meta.env.VITE_GEMINI_API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: medicalPrompt },
                {
                  inlineData: {
                    mimeType: file.type,
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1, // Low temperature for consistent medical analysis
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 4096, // Higher token limit for detailed medical reports
            stopSequences: []
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      }
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(`${t('abg.vision.geminiApiError')} ${errorData.error?.message || t('abg.vision.unknownError')}`);
    }

    const data = await apiResponse.json();

    // Debug logging to understand what Gemini is actually returning


    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {

      throw new Error(t('abg.vision.noAnalysisResult'));
    }

    const processingTime = Math.round(performance.now() - startTime);
    const rawAnalysis = data.candidates[0].content.parts[0].text;
    
    // Debug the extracted text

    // Estimate confidence based on response quality and completeness
    const confidence = estimateAnalysisConfidence(rawAnalysis);

    return {
      rawAnalysis,
      processingTimeMs: processingTime,
      confidence,
      imageProcessed: true
    };

  } catch (error) {
    const processingTime = Math.round(performance.now() - startTime);

    // Re-throw with appropriate error type
    if (error instanceof Error) {
      if (error.message.includes('overloaded') || error.message.includes('capacity')) {
        throw new Error(t('abg.vision.serviceBusy'));
      }
      throw error;
    }

    throw new Error(t('abg.vision.failedToAnalyze'));
  }
};

/**
 * Convert image file to base64 for Gemini API
 */
const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        // Extract base64 data (remove data:image/...;base64, prefix)
        const base64 = result.split(',')[1];
        resolve(base64);
      } catch (error) {
        reject(new Error(`${t('abg.vision.failedToConvertImage')} ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`${t('abg.vision.failedToReadFile')} ${file.name}`));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Estimate confidence of the analysis based on content quality
 * This is a simple heuristic - could be enhanced with ML models
 */
const estimateAnalysisConfidence = (analysisText: string): number => {
  if (!analysisText || analysisText.trim().length === 0) {
    return 0.0;
  }

  let confidence = 0.5; // Base confidence

  // Check for key blood gas parameters
  const keyParameters = ['pH', 'pCO2', 'pO2', 'HCO3', 'bicarbonate', 'base excess'];
  const foundParameters = keyParameters.filter(param => 
    analysisText.toLowerCase().includes(param.toLowerCase())
  );
  confidence += (foundParameters.length / keyParameters.length) * 0.3;

  // Check for numerical values (typical in blood gas reports)
  const numericalValues = analysisText.match(/\d+\.?\d*/g);
  if (numericalValues && numericalValues.length > 5) {
    confidence += 0.1;
  }

  // Check for typical blood gas value ranges
  const hasTypicalRanges = /\d+\.?\d+\s*(mmHg|kPa|mEq|mmol)/gi.test(analysisText);
  if (hasTypicalRanges) {
    confidence += 0.1;
  }

  // Check for structured format (indicates good OCR)
  const hasStructure = analysisText.includes(':') || analysisText.includes('=') || 
                      /^\s*\w+.*:\s*\d+/m.test(analysisText);
  if (hasStructure) {
    confidence += 0.1;
  }

  // Ensure confidence is between 0 and 1
  return Math.min(1.0, Math.max(0.0, confidence));
};

/**
 * Extract structured data from raw analysis text
 * This is a utility function to help parse the Gemini Vision output
 */
export const parseABGAnalysis = (rawAnalysis: string) => {
  // This could be enhanced with more sophisticated parsing
  const lines = rawAnalysis.split('\n').filter(line => line.trim().length > 0);
  
  const parsed = {
    patientInfo: {} as Record<string, string>,
    bloodGasValues: {} as Record<string, string>,
    electrolytes: {} as Record<string, string>,
    clinicalContext: {} as Record<string, string>,
    rawLines: lines
  };

  // Simple parsing logic - could be enhanced with regex patterns
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0 && colonIndex < line.length - 1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      // Categorize based on common ABG parameters
      if (['pH', 'pCO2', 'pO2', 'HCO3', 'bicarbonate', 'base excess', 'BE', 'SaO2', 'SO2'].some(param => 
          key.toLowerCase().includes(param.toLowerCase())
      )) {
        parsed.bloodGasValues[key] = value;
      } else if (['Na', 'sodium', 'K', 'potassium', 'Cl', 'chloride', 'glucose', 'lactate'].some(param => 
          key.toLowerCase().includes(param.toLowerCase())
      )) {
        parsed.electrolytes[key] = value;
      } else if (['patient', 'name', 'age', 'gender', 'date', 'time'].some(param => 
          key.toLowerCase().includes(param.toLowerCase())
      )) {
        parsed.patientInfo[key] = value;
      } else {
        parsed.clinicalContext[key] = value;
      }
    }
  });

  return parsed;
};