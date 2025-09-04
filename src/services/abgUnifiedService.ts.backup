import { extractTextFromImageWithGemini, GeminiProgressInfo } from '../utils/geminiVisionExtractor';
import { extractABGTextWithFreeOCR, ABGOcrProgressInfo } from './abgFreeOcrService';
import { ABGType, ProcessingStatus } from '../types/abg';

// Retry utility for API calls
async function retryApiCall<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 2000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error instanceof Error) {
      // Retry on 503, 429, or network errors
      if (error.message.includes('503') || error.message.includes('429') || error.message.includes('network')) {
        console.log(`API call failed, retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryApiCall(fn, retries - 1, delay * 1.5);
      }
    }
    throw error;
  }
}

// Extended progress info for unified workflow
export interface UnifiedProgressInfo extends GeminiProgressInfo {
  phase: 'extraction' | 'interpretation' | 'complete';
  overallProgress: number;
  phaseProgress: number;
  currentTask?: string;
  extractionMethod?: 'free-ocr' | 'gemini';
}

// Unified analysis result (only text extraction + interpretation, no action plan)
export interface UnifiedAnalysisResult {
  success: boolean;
  extractedText: string;
  interpretation: string;
  processingTimeMs: number;
  confidence: number;
  error?: string;
  requestId: string;
}

// Re-analysis result for edited text (only interpretation, no action plan)
export interface ReAnalysisResult {
  success: boolean;
  interpretation: string;
  processingTimeMs: number;
  error?: string;
  requestId: string;
}

/**
 * Process BG image with unified workflow: try free OCR first, fallback to Gemini if needed
 */
export async function processImageWithUnifiedAnalysis(
  file: File,
  abgType: ABGType,
  onProgress?: (progress: UnifiedProgressInfo) => void,
  options?: { caseContext?: string }
): Promise<UnifiedAnalysisResult> {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();

  try {
    // Phase 1: Text Extraction - Try Free OCR First
    onProgress?.({
      phase: 'extraction',
      stage: 'preparing',
      stageDescription: 'Starting free OCR text extraction...',
      percentage: 0,
      phaseProgress: 0,
      overallProgress: 0,
      method: 'gemini',
      extractionMethod: 'free-ocr',
      currentTask: 'Preparing free OCR analysis'
    });

    let extractedText = '';
    let confidence = 0;
    let extractionMethod: 'free-ocr' | 'gemini' = 'free-ocr';

    // Attempt free OCR extraction first
    const freeOcrResult = await extractABGTextWithFreeOCR(file, abgType, (ocrProgress) => {
      // Map OCR progress to unified progress for extraction phase (0-25% overall for OCR attempt)
      const phaseProgress = ocrProgress.percentage || 0;
      const overallProgress = Math.round(phaseProgress * 0.25); // OCR attempt is first 25%

      onProgress?.({
        phase: 'extraction',
        stage: ocrProgress.stage === 'preparing' ? 'preparing' : 'processing',
        stageDescription: ocrProgress.stageDescription,
        percentage: ocrProgress.percentage || 0,
        phaseProgress,
        overallProgress,
        method: 'gemini',
        extractionMethod: 'free-ocr',
        currentTask: ocrProgress.currentTask || 'Free OCR processing'
      });
    });

    // Evaluate if we should use free OCR result or fallback to Gemini
    if (freeOcrResult.success && !freeOcrResult.shouldFallbackToGemini) {
      // Free OCR succeeded with good quality
      extractedText = freeOcrResult.extractedText;
      confidence = freeOcrResult.confidence;
      extractionMethod = 'free-ocr';

      onProgress?.({
        phase: 'extraction',
        stage: 'complete',
        stageDescription: 'Free OCR extraction completed successfully',
        percentage: 100,
        phaseProgress: 100,
        overallProgress: 50,
        method: 'gemini',
        extractionMethod: 'free-ocr',
        currentTask: 'Free OCR complete - saved costs!'
      });
    } else {
      // Free OCR failed or quality too low - fallback to Gemini

      onProgress?.({
        phase: 'extraction',
        stage: 'preparing',
        stageDescription: 'Free OCR quality low - using Gemini Vision...',
        percentage: 25,
        phaseProgress: 25,
        overallProgress: 25,
        method: 'gemini',
        extractionMethod: 'gemini',
        currentTask: 'Switching to Gemini Vision'
      });

      const extractionResult = await retryApiCall(() => 
        extractTextFromImageWithGemini(file, (geminiProgress) => {
          // Map Gemini progress to unified progress for extraction phase (25-50% overall)
          const phaseProgress = 25 + ((geminiProgress.percentage || 0) * 0.25);
          const overallProgress = Math.round(25 + ((geminiProgress.percentage || 0) * 0.25));

          onProgress?.({
            phase: 'extraction',
            stage: geminiProgress.stage,
            stageDescription: geminiProgress.stageDescription,
            percentage: geminiProgress.percentage || 0,
            phaseProgress,
            overallProgress,
            method: 'gemini',
            extractionMethod: 'gemini',
            currentTask: 'Gemini Vision extracting text',
            apiAttempt: geminiProgress.apiAttempt,
            maxAttempts: geminiProgress.maxAttempts
          });
        })
      );

      if (!extractionResult.text || extractionResult.error) {
        throw new Error(extractionResult.error || 'Both free OCR and Gemini Vision failed to extract text');
      }

      extractedText = extractionResult.text;
      confidence = extractionResult.confidence;
      extractionMethod = 'gemini';

      onProgress?.({
        phase: 'extraction',
        stage: 'complete',
        stageDescription: 'Gemini Vision extraction completed',
        percentage: 100,
        phaseProgress: 100,
        overallProgress: 50,
        method: 'gemini',
        extractionMethod: 'gemini',
        currentTask: 'Gemini Vision complete'
      });
    }

    // Phase 2: Interpretation with OpenAI
    onProgress?.({
      phase: 'interpretation',
      stage: 'preparing',
      stageDescription: 'Preparing clinical interpretation...',
      percentage: 0,
      phaseProgress: 0,
      overallProgress: 50,
      method: 'gemini',
      extractionMethod,
      currentTask: 'Starting clinical analysis'
    });

    const interpretationResult = await generateInterpretation(extractedText, abgType, (progress) => {
      // Map interpretation progress to overall progress (50-100%)
      const phaseProgress = progress;
      const overallProgress = Math.round(50 + (progress * 0.5));

      onProgress?.({
        phase: 'interpretation',
        stage: 'processing',
        stageDescription: 'Generating clinical interpretation...',
        percentage: progress,
        phaseProgress,
        overallProgress,
        method: 'gemini',
        extractionMethod,
        currentTask: 'AI analyzing blood gas values'
      });
    }, options?.caseContext);

    if (!interpretationResult.success) {
      throw new Error(interpretationResult.error || 'Failed to generate interpretation');
    }

    // Complete
    const totalTime = Math.round(performance.now() - startTime);
    
    onProgress?.({
      phase: 'complete',
      stage: 'complete',
      stageDescription: `Analysis completed successfully using ${extractionMethod === 'free-ocr' ? 'Free OCR' : 'Gemini Vision'}`,
      percentage: 100,
      phaseProgress: 100,
      overallProgress: 100,
      method: 'gemini',
      extractionMethod,
      currentTask: 'Analysis complete'
    });

    return {
      success: true,
      extractedText,
      interpretation: interpretationResult.interpretation,
      processingTimeMs: totalTime,
      confidence,
      requestId
    };

  } catch (error) {
    const totalTime = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during unified analysis';

    onProgress?.({
      phase: 'complete',
      stage: 'complete',
      stageDescription: 'Analysis failed',
      percentage: 100,
      phaseProgress: 100,
      overallProgress: 100,
      method: 'gemini',
      currentTask: 'Error occurred'
    });

    return {
      success: false,
      extractedText: '',
      interpretation: '',
      processingTimeMs: totalTime,
      confidence: 0,
      error: errorMessage,
      requestId
    };
  }
}

/**
 * Re-analyze with edited text input
 */
export async function reAnalyzeWithEditedText(
  editedText: string,
  abgType: ABGType,
  onProgress?: (progress: number) => void,
  caseContext?: string
): Promise<ReAnalysisResult> {
  const startTime = performance.now();
  const requestId = crypto.randomUUID();

  try {
    onProgress?.(0);

    // Validate edited text
    if (!editedText.trim()) {
      throw new Error('Edited text cannot be empty');
    }

    // Generate interpretation with edited text
    const result = await generateInterpretation(editedText, abgType, onProgress, caseContext);

    const totalTime = Math.round(performance.now() - startTime);

    return {
      success: result.success,
      interpretation: result.interpretation,
      processingTimeMs: totalTime,
      error: result.error,
      requestId
    };

  } catch (error) {
    const totalTime = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during re-analysis';

    return {
      success: false,
      interpretation: '',
      processingTimeMs: totalTime,
      error: errorMessage,
      requestId
    };
  }
}

/**
 * Generate clinical interpretation using the interpretation service
 */
async function generateInterpretation(
  analysisText: string,
  abgType: ABGType,
  onProgress?: (progress: number) => void,
  caseContext?: string
): Promise<{success: boolean; interpretation: string; actionPlan?: string; error?: string}> {
  try {
    onProgress?.(10);

    // Call the Supabase Edge Function for interpretation
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/abg-interpretation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        analysis: analysisText,
        type: abgType,
        // Pass optional case context so backend can enhance interpretation
        caseContext,
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      })
    });

    onProgress?.(50);

    if (!response.ok) {
      throw new Error(`Interpretation service error: ${response.status}`);
    }

    const result = await response.json();
    
    onProgress?.(90);

    if (!result.success) {
      throw new Error(result.error || 'Interpretation service returned unsuccessful result');
    }

    onProgress?.(100);

    // Handle the nested response structure from Supabase Edge Function
    // Edge Function returns: { success: true, data: { success: true, data: "interpretation text", ... }, message: "..." }
    const interpretationData = result.data?.data || result.data || '';
    let interpretation = typeof interpretationData === 'string' ? interpretationData : '';
    
    // Clean up any file paths that may have been included by the AI
    interpretation = interpretation
      .replace(/\/var\/folders\/[^\s]+/g, '')
      .replace(/\/tmp\/[^\s]+/g, '')
      .replace(/\/Users\/[^\/]+\/[^\s]*TemporaryItems[^\s]*/g, '')
      .replace(/\/[A-Za-z0-9_\-]+\/TemporaryItems\/[^\s]+/g, '')
      .replace(/^[^\n]*\/[A-Za-z0-9_\-]+\/[A-Za-z0-9_\-]+\/[A-Za-z0-9_\-\.\/]+\.png[^\n]*$/gm, '')
      .replace(/\/[A-Za-z0-9_\-\.\/]*[Tt]emporary[A-Za-z0-9_\-\.\/]*/g, '')
      .trim();
    
    let actionPlan: string | undefined;

    // Look for action plan sections in the interpretation
    const actionPlanMatch = interpretation.match(/(?:## Action Plan|# Action Plan|## Recommendations)(.*?)(?=##|#|$)/is);
    if (actionPlanMatch) {
      actionPlan = actionPlanMatch[1].trim();
    }

    return {
      success: true,
      interpretation,
      actionPlan
    };

  } catch (error) {
    onProgress?.(100);
    
    return {
      success: false,
      interpretation: '',
      error: error instanceof Error ? error.message : 'Failed to generate interpretation'
    };
  }
}

/**
 * Validate extracted text for BG analysis
 */
export function validateExtractedText(text: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for minimum content
  if (text.trim().length < 20) {
    issues.push('Text is too short for meaningful analysis');
    suggestions.push('Ensure the image contains clear blood gas values');
  }

  // Check for potential BG parameters
  const hasBloodGasValues = /(?:pH|pco2|po2|hco3|base excess|so2)/i.test(text);
  if (!hasBloodGasValues) {
    issues.push('No recognizable blood gas parameters found');
    suggestions.push('Verify the image contains blood gas results (pH, pCO2, pO2, HCO3, etc.)');
  }

  // Check for numeric values
  const hasNumbers = /\d+\.?\d*/.test(text);
  if (!hasNumbers) {
    issues.push('No numeric values detected');
    suggestions.push('Ensure blood gas values are clearly visible and not obscured');
  }

  // Check for potential garbled text
  const hasGarbledText = /[^\x00-\x7F\u10A0-\u10FF\s]{5,}/.test(text);
  if (hasGarbledText) {
    issues.push('Text may contain unrecognizable characters');
    suggestions.push('Try taking a clearer image with better lighting');
  }

  // Check for very long continuous strings (might indicate OCR errors)
  const hasLongStrings = /\S{50,}/.test(text);
  if (hasLongStrings) {
    issues.push('Text contains unusually long continuous strings');
    suggestions.push('Review and edit the text to fix any OCR errors');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Format extracted text for better analysis
 */
export function formatExtractedTextForAnalysis(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim();
}