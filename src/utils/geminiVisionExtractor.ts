import { ProgressInfo } from './pdfTextExtractor';

export interface GeminiExtractionResult {
  text: string;
  confidence: number;
  method: 'gemini';
  error?: string;
}

export interface GeminiProgressInfo extends ProgressInfo {
  stage: 'preparing' | 'uploading' | 'processing' | 'complete';
  apiAttempt?: number;
  maxAttempts?: number;
}

/**
 * Convert file to base64 for Gemini API
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 data
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = () => reject(new Error('Failed to convert file to base64'));
    reader.readAsDataURL(file);
  });
}

/**
 * Make request to Gemini API with retry mechanism
 */
async function makeRequestWithRetry(
  url: string, 
  options: RequestInit, 
  retries = 3,
  onProgress?: (progress: GeminiProgressInfo) => void
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      onProgress?.({
        stage: 'uploading',
        stageDescription: `Making API request (attempt ${i + 1}/${retries + 1})`,
        percentage: 20 + (i * 10),
        method: 'gemini',
        apiAttempt: i + 1,
        maxAttempts: retries + 1
      });

      const response = await fetch(url, options);

      // Handle rate limiting
      if (response.status === 429 || response.status === 503) {
        if (i < retries) {
          const backoffDelay = 2000 * Math.pow(2, i); // Exponential backoff
          onProgress?.({
            stage: 'preparing',
            stageDescription: `Rate limited. Waiting ${backoffDelay / 1000}s before retry...`,
            percentage: 15,
            method: 'gemini'
          });
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }
      }

      // Handle quota exceeded
      if (response.status === 400) {
        const errorText = await response.text();
        if (errorText.includes('quota') || errorText.includes('limit')) {
          throw new Error('Gemini API quota exceeded. Please check your API usage.');
        }
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      
      // Wait before retry
      const retryDelay = 1000 * (i + 1);
      onProgress?.({
        stage: 'preparing',
        stageDescription: `Request failed. Retrying in ${retryDelay / 1000}s...`,
        percentage: 10,
        method: 'gemini'
      });
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('All retry attempts failed');
}

/**
 * Extract text from PDF using Gemini Vision API
 * Specialized for Georgian medical documents
 */
export async function extractTextWithGeminiVision(
  file: File,
  onProgress?: (progress: GeminiProgressInfo) => void
): Promise<GeminiExtractionResult> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.');
    }

    onProgress?.({
      stage: 'preparing',
      stageDescription: 'Preparing file for Gemini API...',
      percentage: 0,
      method: 'gemini'
    });

    // Convert file to base64
    const base64Data = await fileToBase64(file);

    onProgress?.({
      stage: 'preparing',
      stageDescription: 'Building API request...',
      percentage: 10,
      method: 'gemini'
    });

    // Determine MIME type
    let mimeType = file.type;
    if (!mimeType && file.name.toLowerCase().endsWith('.pdf')) {
      mimeType = 'application/pdf';
    }

    // Create specialized prompt for Georgian medical documents
    const prompt = `Extract ALL text content from this Georgian medical document exactly as it appears. 

Focus on:
- Georgian text (ქართული ტექსტი) - preserve all Georgian characters and medical terms
- Medical terminology, measurements, and patient data
- Dates, numbers, and clinical values
- Laboratory results and diagnostic findings
- Patient information and medical history
- Preserve the exact formatting and structure

- Return ONLY the extracted text content
- Do not add explanations, summaries, or interpretations
- Preserve line breaks and spacing where meaningful
- Include all text even if it seems incomplete or fragmented
- Pay special attention to Georgian medical terminology

Return the complete extracted text:`;

    // Prepare request payload
    const requestPayload = {
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }, {
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        }]
      }],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent extraction
        maxOutputTokens: 8192,
        topP: 0.8,
        topK: 10
      }
    };

    onProgress?.({
      stage: 'uploading',
      stageDescription: 'Sending request to Gemini API...',
      percentage: 20,
      method: 'gemini'
    });

    // Make API request with retry mechanism
    const response = await makeRequestWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      },
      3, // Max 3 retries
      onProgress
    );

    onProgress?.({
      stage: 'processing',
      stageDescription: 'Processing API response...',
      percentage: 80,
      method: 'gemini'
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Extract text from response
    const extractedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!extractedText) {

      throw new Error('No text content in Gemini API response');
    }

    // Calculate confidence based on response quality
    const finishReason = result?.candidates?.[0]?.finishReason;
    let confidence = 0.9; // Default high confidence for Gemini

    if (finishReason === 'STOP') {
      confidence = 0.95; // Completed successfully
    } else if (finishReason === 'MAX_TOKENS') {
      confidence = 0.8; // Truncated but likely good
    } else if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
      confidence = 0.7; // May have been filtered
    }

    onProgress?.({
      stage: 'complete',
      stageDescription: 'Text extraction completed successfully',
      percentage: 100,
      method: 'gemini'
    });

    // Log extraction stats for debugging

    return {
      text: extractedText.trim(),
      confidence,
      method: 'gemini'
    };

  } catch (error) {

    onProgress?.({
      stage: 'complete',
      stageDescription: 'Extraction failed',
      percentage: 100,
      method: 'gemini'
    });

    return {
      text: '',
      confidence: 0,
      method: 'gemini',
      error: error instanceof Error ? error.message : 'Unknown error during Gemini extraction'
    };
  }
}

/**
 * Extract text from image using Gemini Vision API
 * Optimized for medical images with text content
 */
export async function extractTextFromImageWithGemini(
  file: File,
  onProgress?: (progress: GeminiProgressInfo) => void
): Promise<GeminiExtractionResult> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    onProgress?.({
      stage: 'preparing',
      stageDescription: 'Preparing image for text extraction...',
      percentage: 0,
      method: 'gemini'
    });

    const base64Data = await fileToBase64(file);

    // Specialized prompt for medical images, especially blood gas analysis
    const prompt = `Extract all visible text from this medical image or document. This may be a blood gas analysis report, laboratory result, or other medical document.

Pay special attention to:
- Blood gas values (pH, pCO2, pO2, HCO3, Base Excess, SO2)
- Laboratory parameters and measurements
- Patient information and timestamps
- Reference ranges and normal values
- Georgian text (ქართული ტექსტი) if present
- Medical equipment readings (like RADIOMETER ABL800)
- Numerical values with units (mmHg, kPa, mmol/L, g/dL, %)

Instructions:
- Extract ALL visible text exactly as shown
- Preserve numerical precision (don't round values)
- Include units of measurement
- Maintain the structure and grouping of related values
- Read from top to bottom, left to right
- Do not interpret or analyze - only extract the raw text
- Include partially visible text with a note if unclear

Raw extracted text:`;

    const requestPayload = {
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }, {
          inline_data: {
            mime_type: file.type,
            data: base64Data
          }
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        topP: 0.8,
        topK: 10
      }
    };

    const response = await makeRequestWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      },
      2, // Fewer retries for images
      onProgress
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const extractedText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const finishReason = result?.candidates?.[0]?.finishReason;
    const confidence = finishReason === 'STOP' ? 0.9 : 0.8;

    onProgress?.({
      stage: 'complete',
      stageDescription: 'Image text extraction completed',
      percentage: 100,
      method: 'gemini'
    });

    return {
      text: extractedText.trim(),
      confidence,
      method: 'gemini'
    };

  } catch (error) {

    return {
      text: '',
      confidence: 0,
      method: 'gemini',
      error: error instanceof Error ? error.message : 'Image extraction failed'
    };
  }
}

/**
 * Check if text appears to be garbled Georgian (Sylfaen or other encoding issues)
 */
export function hasGarbledGeorgianText(text: string): boolean {
  // Check for common patterns that indicate garbled Georgian text
  const garbledPatterns = [
    /[À-ÿ]{3,}/g, // Extended Latin characters often used in garbled Georgian
    /[äöüÄÖÜàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþß]{3,}/g, // Specific garbled characters
    /ÌØÏÁÉÀÒÏÁÉÓ/g, // Common garbled patterns from Sylfaen
    /ÓÀÝÀÒÏ/g,
    /ÔÄÔÏÌÄÔÒÉÀ/g,
    /[ა-ჰ][À-ÿ]/g, // Mixed Georgian and extended Latin
    /ლქოთპსოთპთ/g, // Specific known garbled medical terms
    /სავაპასდო/g,
    /ტეპოლეპთა/g,
    /ბთპაპთেპალსპთ/g,
    // Additional patterns from your sample
    /უანეაოჟ-გკოელჟმჟგკღტკ/g, // Medical department garbled
    /ნჭკტე ნეოãკუ/g, // Anatomical terms garbled  
    /ეშჟულჟრკღტკ/g, // Ultrasound garbled
    /ნძჟბკატჟბკუ/g, // Medical terms garbled
    /[ა-ჰ]{3,}[ჟკღტ]{2,}/g, // Georgian chars with specific garbled suffixes
    /[კღტჟ]{3,}/g, // Repeated garbled Georgian characters
    /ã/g, // Latin character mixed with Georgian (common in garbled text)
  ];
  
  return garbledPatterns.some(pattern => pattern.test(text));
}

/**
 * Simple quality assessment for Georgian text
 */
export function assessGeorgianTextQuality(text: string): {
  quality: 'good' | 'poor' | 'garbled';
  confidence: number;
  georgianRatio: number;
  shouldUseGemini: boolean;
} {
  const georgianChars = (text.match(/[\u10A0-\u10FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  const georgianRatio = totalChars > 0 ? georgianChars / totalChars : 0;
  
  // Check for garbled patterns
  const hasGarbled = hasGarbledGeorgianText(text);
  
  let quality: 'good' | 'poor' | 'garbled' = 'good';
  let confidence = 1.0;
  let shouldUseGemini = false;

  if (hasGarbled) {
    quality = 'garbled';
    confidence = 0.9;
    shouldUseGemini = true;
  } else if (georgianRatio > 0.1 && georgianRatio < 0.8) {
    // Mixed content but might have issues
    quality = 'poor';
    confidence = 0.6;
    shouldUseGemini = georgianRatio > 0.3; // Use Gemini if significant Georgian content
  } else if (totalChars < 50) {
    quality = 'poor';
    confidence = 0.5;
    shouldUseGemini = true; // Try Gemini for very short extractions
  }

  return {
    quality,
    confidence,
    georgianRatio,
    shouldUseGemini
  };
}