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
 * Compress image for optimal Gemini Vision API processing
 * Medium compression: 1800px max dimension, 75% quality
 * Reduces file size while maintaining text extraction accuracy
 */
async function compressImageForGemini(file: File): Promise<File> {
  console.log('🗜️ Gemini: Compressing image for optimal API processing...', {
    originalSize: `${(file.size / 1024).toFixed(2)} KB`,
    originalName: file.name
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.warn('⚠️ Gemini: Canvas context unavailable, using original image');
      resolve(file);
      return;
    }

    img.onload = () => {
      // Calculate new dimensions (max 1800px on longest side)
      const MAX_DIMENSION = 1800;
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
        console.log('📐 Gemini: Resizing image', {
          originalDimensions: `${img.width}x${img.height}`,
          newDimensions: `${width}x${height}`,
          scale: `${(scale * 100).toFixed(1)}%`
        });
      } else {
        console.log('📐 Gemini: Image already optimal size', {
          dimensions: `${width}x${height}`
        });
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image with high quality (good for text)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with 75% quality (medium compression)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.warn('⚠️ Gemini: Compression failed, using original image');
            resolve(file);
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          console.log('✅ Gemini: Image compressed successfully', {
            originalSize: `${(file.size / 1024).toFixed(2)} KB`,
            compressedSize: `${(compressedFile.size / 1024).toFixed(2)} KB`,
            reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`,
            quality: '75%'
          });

          resolve(compressedFile);
        },
        'image/jpeg',
        0.75 // 75% quality - "high quality" setting, visually lossless for text
      );
    };

    img.onerror = () => {
      console.warn('⚠️ Gemini: Failed to load image for compression, using original');
      resolve(file);
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
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
  const startTime = Date.now();

  // DIAGNOSTIC: Entry point
  console.log('🌟 Gemini Vision: extractTextWithGeminiVision() called', {
    filename: file.name,
    fileType: file.type,
    fileSize: file.size,
    timestamp: new Date().toISOString()
  });

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ Gemini Vision: API key not configured', {
        filename: file.name,
        envVarName: 'VITE_GEMINI_API_KEY'
      });
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.');
    }

    console.log('✅ Gemini Vision: API key configured', {
      filename: file.name,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });

    onProgress?.({
      stage: 'preparing',
      stageDescription: 'Preparing file for Gemini API...',
      percentage: 0,
      method: 'gemini'
    });

    // Convert file to base64
    console.log('🔄 Gemini Vision: Converting file to base64...', {
      filename: file.name
    });

    const base64Data = await fileToBase64(file);

    console.log('✅ Gemini Vision: Base64 conversion complete', {
      filename: file.name,
      base64Length: base64Data.length,
      estimatedSizeKB: (base64Data.length * 0.75 / 1024).toFixed(2) // Approximate original size
    });

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

    console.log('📝 Gemini Vision: Building API request', {
      filename: file.name,
      mimeType: mimeType,
      model: 'gemini-2.5-flash'
    });

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

    console.log('🚀 Gemini Vision: Sending API request...', {
      filename: file.name,
      endpoint: 'gemini-2.5-flash:generateContent',
      maxRetries: 3
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

    console.log('✅ Gemini Vision: API request completed', {
      filename: file.name,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    onProgress?.({
      stage: 'processing',
      stageDescription: 'Processing API response...',
      percentage: 80,
      method: 'gemini'
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error('❌ Gemini Vision: API error response', {
        filename: file.name,
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500)
      });

      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    console.log('📦 Gemini Vision: Response parsed', {
      filename: file.name,
      hasCandidates: !!result?.candidates,
      candidatesCount: result?.candidates?.length || 0,
      hasContent: !!result?.candidates?.[0]?.content,
      hasParts: !!result?.candidates?.[0]?.content?.parts,
      partsCount: result?.candidates?.[0]?.content?.parts?.length || 0
    });

    // Extract text from response
    const extractedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!extractedText) {
      console.error('❌ Gemini Vision: No text in response', {
        filename: file.name,
        responseStructure: JSON.stringify(result).substring(0, 500)
      });

      throw new Error('No text content in Gemini API response');
    }

    console.log('✅ Gemini Vision: Text extracted successfully', {
      filename: file.name,
      textLength: extractedText.length,
      textPreview: extractedText.substring(0, 150)
    });

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

    // DIAGNOSTIC: Final result
    console.log('✅ Gemini Vision: Extraction complete', {
      filename: file.name,
      textLength: extractedText.trim().length,
      confidence: confidence,
      finishReason: finishReason,
      processingTime: `${Date.now() - startTime}ms`
    });

    return {
      text: extractedText.trim(),
      confidence,
      method: 'gemini'
    };

  } catch (error) {
    // DIAGNOSTIC: Main error handler
    console.error('❌ Gemini Vision: Extraction failed', {
      filename: file.name,
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      processingTime: `${Date.now() - startTime}ms`
    });

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
  const startTime = Date.now();

  // DIAGNOSTIC: Entry point
  console.log('🌟 Gemini Vision: extractTextFromImageWithGemini() called', {
    filename: file.name,
    fileType: file.type,
    fileSize: file.size,
    timestamp: new Date().toISOString()
  });

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ Gemini Vision: API key not configured (image)', {
        filename: file.name
      });
      throw new Error('Gemini API key not configured');
    }

    console.log('✅ Gemini Vision: API key found (image extraction)', {
      filename: file.name
    });

    onProgress?.({
      stage: 'preparing',
      stageDescription: 'Optimizing image for AI processing...',
      percentage: 0,
      method: 'gemini'
    });

    // OPTIMIZATION: Compress image for Gemini API (1800px, 75% quality)
    console.log('🗜️ Gemini Vision: Compressing image for optimal processing...', {
      filename: file.name,
      originalSize: file.size
    });

    const compressedFile = await compressImageForGemini(file);

    onProgress?.({
      stage: 'preparing',
      stageDescription: 'Converting to API format...',
      percentage: 5,
      method: 'gemini'
    });

    console.log('🔄 Gemini Vision: Converting compressed image to base64...', {
      filename: file.name,
      compressedSize: compressedFile.size
    });

    const base64Data = await fileToBase64(compressedFile);

    console.log('✅ Gemini Vision: Image converted to base64', {
      filename: file.name,
      base64Length: base64Data.length,
      estimatedSizeKB: (base64Data.length * 0.75 / 1024).toFixed(2)
    });

    // Specialized prompt for medical images, especially blood gas analysis
    // IMPORTANT: Keep prompt concise for large images to maximize text extraction space
    const prompt = `Extract ALL visible text from this medical image. This is likely a medical document, report, or laboratory result.

CRITICAL INSTRUCTIONS:
- Extract ALL text exactly as shown - DO NOT summarize or skip any text
- Preserve ALL Georgian text (ქართული ტექსტი) exactly
- Include ALL numerical values with their units
- Maintain original formatting and structure
- Read top to bottom, left to right
- NO interpretation - only raw text extraction

Begin extraction now:`;

    // OPTIMIZATION: Configure request payload with best practices
    // 1. Image BEFORE text prompt (Google recommendation)
    // 2. Disable thinking mode (thinkingBudget: 0) to avoid MAX_TOKENS error
    // 3. Increase maxOutputTokens to 32768 for large medical documents
    const requestPayload = {
      contents: [{
        role: 'user',
        parts: [
          // Image FIRST (best practice for text extraction)
          {
            inline_data: {
              mime_type: compressedFile.type, // image/jpeg after compression
              data: base64Data
            }
          },
          // Text prompt AFTER image
          {
            text: prompt
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 32768, // Increased from 16384 for large documents
        topP: 0.8,
        topK: 10,
        // CRITICAL FIX: Disable thinking mode to prevent MAX_TOKENS error
        // Gemini 2.5 Flash has thinking enabled by default, which consumes output tokens
        // For OCR/text extraction, we don't need reasoning - just direct text output
        thinkingConfig: {
          thinkingBudget: 0  // 0 = disabled, -1 = dynamic, >0 = specific budget
        }
      }
    };

    console.log('📝 Gemini Vision: Request configured (with optimization)', {
      filename: file.name,
      originalFileSize: `${(file.size / 1024).toFixed(2)} KB`,
      compressedFileSize: `${(compressedFile.size / 1024).toFixed(2)} KB`,
      compressionRatio: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`,
      maxOutputTokens: 32768,
      thinkingBudget: 0,
      thinkingMode: 'disabled',
      temperature: 0.1,
      promptLength: prompt.length,
      base64ImageSizeKB: (base64Data.length / 1024).toFixed(2),
      partsOrder: 'image-first'
    });

    console.log('🚀 Gemini Vision: Sending image API request via secure proxy...', {
      filename: file.name,
      model: 'gemini-2.0-flash',
      maxRetries: 2,
      useProxy: true
    });

    // Import Supabase client for auth token
    const { supabase } = await import('../lib/supabase');

    // Get auth session for secure API call
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required for API access');
    }

    // Call via Supabase Edge Function proxy (API key secured server-side)
    const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-vision-proxy`;

    const response = await makeRequestWithRetry(
      proxyUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestPayload)
      },
      2, // Fewer retries for images
      onProgress
    );

    // Extract rate limit info from headers
    const rateLimitHeaders = {
      limit: response.headers.get('X-RateLimit-Limit'),
      remaining: response.headers.get('X-RateLimit-Remaining'),
      reset: response.headers.get('X-RateLimit-Reset')
    };

    console.log('✅ Gemini Vision: Image API request completed', {
      filename: file.name,
      status: response.status,
      ok: response.ok,
      rateLimit: rateLimitHeaders
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

      // Handle rate limit specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || rateLimitHeaders.reset || '60';
        console.error('⚠️ Gemini Vision: Rate limit exceeded', {
          filename: file.name,
          retryAfter: `${retryAfter}s`,
          ...rateLimitHeaders
        });
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      }

      console.error('❌ Gemini Vision: Image API error', {
        filename: file.name,
        status: response.status,
        error: errorData
      });
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();

    // DIAGNOSTIC: Log full response structure
    console.log('📦 Gemini Vision: Full API response structure', {
      filename: file.name,
      hasCandidates: !!result?.candidates,
      candidatesCount: result?.candidates?.length || 0,
      firstCandidateStructure: result?.candidates?.[0] ? {
        hasContent: !!result.candidates[0].content,
        hasParts: !!result.candidates[0].content?.parts,
        partsCount: result.candidates[0].content?.parts?.length || 0,
        finishReason: result.candidates[0].finishReason,
        safetyRatings: result.candidates[0].safetyRatings?.length || 0
      } : null,
      rawResponse: JSON.stringify(result).substring(0, 1000)
    });

    // DIAGNOSTIC: Enhanced logging for response parsing
    console.log('🔍 Gemini Vision: Detailed response inspection', {
      filename: file.name,
      candidates: result?.candidates,
      firstCandidate: result?.candidates?.[0],
      content: result?.candidates?.[0]?.content,
      parts: result?.candidates?.[0]?.content?.parts,
      firstPart: result?.candidates?.[0]?.content?.parts?.[0],
      fullResponse: JSON.stringify(result, null, 2).substring(0, 2000)
    });

    const extractedText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('📦 Gemini Vision: Image response parsed', {
      filename: file.name,
      textLength: extractedText.length,
      textPreview: extractedText.substring(0, 100),
      hasCandidates: !!result?.candidates
    });

    const finishReason = result?.candidates?.[0]?.finishReason;
    const confidence = finishReason === 'STOP' ? 0.9 : 0.8;

    // DIAGNOSTIC: Warn if response was truncated
    if (finishReason === 'MAX_TOKENS') {
      console.warn('⚠️ Gemini Vision: Response truncated (MAX_TOKENS)', {
        filename: file.name,
        extractedTextLength: extractedText.length,
        maxOutputTokens: 16384,
        imageSizeKB: (base64Data.length / 1024).toFixed(2),
        warning: 'Hit maximum token limit (16384). Image is very large or contains extensive text. Consider: 1) Image compression, 2) Chunking strategy, 3) Different extraction method.'
      });
    }

    // DIAGNOSTIC: Warn if no text extracted
    if (extractedText.length === 0) {
      console.warn('⚠️ Gemini Vision: No text extracted from image', {
        filename: file.name,
        finishReason: finishReason,
        hasCandidates: !!result?.candidates,
        possibleReasons: [
          'Image contains only visual content (no text)',
          'Text is too small or blurry to read',
          'API response was filtered or blocked',
          'Image format not fully supported'
        ]
      });
    }

    onProgress?.({
      stage: 'complete',
      stageDescription: 'Image text extraction completed',
      percentage: 100,
      method: 'gemini'
    });

    console.log('✅ Gemini Vision: Image extraction complete', {
      filename: file.name,
      textLength: extractedText.trim().length,
      confidence: confidence,
      finishReason: finishReason,
      processingTime: `${Date.now() - startTime}ms`
    });

    return {
      text: extractedText.trim(),
      confidence,
      method: 'gemini'
    };

  } catch (error) {
    // DIAGNOSTIC: Error handler
    console.error('❌ Gemini Vision: Image extraction failed', {
      filename: file.name,
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      processingTime: `${Date.now() - startTime}ms`
    });

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