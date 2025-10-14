// Mobile Performance Optimization: Dynamic imports for heavy OCR libraries
import { extractTextFromImageWithGemini } from './geminiVisionExtractor';

// Unified interfaces
export interface OcrResult {
  success: boolean;
  text: string;
  confidence: number;
  error?: string;
  processingTime?: number;
  pageCount?: number;
  imageInfo?: {
    width: number;
    height: number;
    scaleFactor: number;
  };
}

export interface ImageTextAnalysis {
  hasSignificantText: boolean;
  textConfidence: number;
  textPreview: string;
  recommendedAction: 'extract_text' | 'send_image' | 'extract_and_send';
  estimatedTextRatio: number;
}

export interface ProgressInfo {
  current: number;
  total: number;
  message: string;
}

// Types for dynamic imports
type TesseractModule = typeof import('tesseract.js');
type PdfjsModule = typeof import('pdfjs-dist');

// Unified OCR worker management
let unifiedOcrWorker: any = null; // Changed from Worker to any due to dynamic import
let textDetectionWorker: any = null;

/**
 * Configure PDF.js worker with local-first strategy (lazy loaded)
 */
async function configurePdfWorker(): Promise<PdfjsModule> {
  const pdfjsLib = await import('pdfjs-dist');
  
  if (typeof window !== 'undefined') {
    try {
      const timestamp = Date.now();
      const basePath = window.location.pathname.includes('/expert/') ? '/expert/' : '/';
      const localWorkerUrl = new URL(`${basePath}pdf.worker.min.js?v=${timestamp}`, window.location.origin).href;
      pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerUrl;
      pdfjsLib.GlobalWorkerOptions.disableWorker = false;
    } catch (error) {
      // Fallback handling
    }
  }
  
  return pdfjsLib;
}

/**
 * Get or create a full-featured OCR worker with dynamic loading
 */
async function getOcrWorker(): Promise<any> {
  if (!unifiedOcrWorker) {
    try {
      console.log('🔧 OCR: Initializing Tesseract.js v6 worker...');

      // Dynamic import of Tesseract.js for mobile performance
      const { createWorker } = await import('tesseract.js');

      // FIXED: Correct Tesseract.js v6 API - simplified initialization
      console.log('🔧 OCR: Creating worker with multiple languages...');

      // Tesseract.js v6 simplified API - languages are loaded automatically
      unifiedOcrWorker = await createWorker(['kat', 'eng', 'rus'], 1, {
        logger: (m) => {
          console.log('🔧 OCR Worker:', m);
        }
      });

      console.log('✅ OCR: Worker created and languages loaded automatically (v6 API)');

      // Set parameters after initialization
      await unifiedOcrWorker.setParameters({
        tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
        preserve_interword_spaces: '1'
      });
      console.log('✅ OCR: Parameters set');

      console.log('✅ OCR: Full worker initialization complete');
    } catch (error) {
      console.error('❌ OCR: Worker initialization failed:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      unifiedOcrWorker = null;
      throw error;
    }
  }
  return unifiedOcrWorker;
}

/**
 * Get or create a lightweight text detection worker with dynamic loading
 */
async function getTextDetectionWorker(): Promise<any> {
  if (!textDetectionWorker) {
    try {
      console.log('🔧 OCR: Initializing text detection worker (v6 API)...');

      // Dynamic import of Tesseract.js for mobile performance
      const { createWorker } = await import('tesseract.js');

      // FIXED: Correct Tesseract.js v6 API - simplified initialization
      textDetectionWorker = await createWorker(['eng'], 1, {
        logger: (m) => {
          console.log('🔧 Text Detection Worker:', m);
        }
      });
      console.log('✅ OCR: Text detection worker created and loaded automatically (v6 API)');

      await textDetectionWorker.setParameters({
        tessedit_pageseg_mode: '3',
        tessedit_ocr_engine_mode: '2',
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?()-+='
      });
      console.log('✅ OCR: Text detection parameters set');

      console.log('✅ OCR: Text detection worker fully initialized');
    } catch (error) {
      console.error('❌ OCR: Text detection worker initialization failed:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      textDetectionWorker = null;
      throw error;
    }
  }
  return textDetectionWorker;
}

/**
 * Cleanup all OCR workers
 */
export async function cleanupOcrWorkers(): Promise<void> {
  const cleanupPromises = [];
  
  if (unifiedOcrWorker) {
    cleanupPromises.push(unifiedOcrWorker.terminate());
    unifiedOcrWorker = null;
  }
  
  if (textDetectionWorker) {
    cleanupPromises.push(textDetectionWorker.terminate());
    textDetectionWorker = null;
  }
  
  await Promise.all(cleanupPromises);
}

/**
 * Extract text from image file with Gemini Vision fallback
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: ProgressInfo) => void
): Promise<OcrResult> {
  const startTime = Date.now();

  // DIAGNOSTIC: Entry point
  console.log('🤖 OCR: extractTextFromImage() called', {
    filename: file.name,
    fileType: file.type,
    fileSize: file.size,
    timestamp: new Date().toISOString()
  });

  try {
    // ========================================
    // STRATEGY: Try Gemini Vision API FIRST (5-15 seconds)
    // Only fallback to Tesseract OCR if Gemini fails
    // ========================================

    // Step 1: Try Gemini Vision API as PRIMARY method
    if (hasGeminiApiKey()) {
      try {
        console.log('🚀 Attempting Gemini Vision API (primary method)...', {
          filename: file.name,
          fileSize: file.size,
          strategy: 'Gemini First → Tesseract Fallback'
        });

        onProgress?.({ current: 0, total: 100, message: 'Processing with AI Vision...' });

        const geminiResult = await fallbackToGeminiVision(file);

        console.log('✅ Gemini Vision result received:', {
          filename: file.name,
          success: geminiResult.success,
          textLength: geminiResult.text.length,
          confidence: geminiResult.confidence,
          textPreview: geminiResult.text.substring(0, 150),
          processingTime: `${Date.now() - startTime}ms`
        });

        // Use Gemini result if successful
        if (geminiResult.success && geminiResult.text.length > 0) {
          onProgress?.({ current: 100, total: 100, message: 'Complete' });

          console.log('✅ Using Gemini Vision result (primary method succeeded)', {
            filename: file.name,
            finalTextLength: geminiResult.text.length,
            confidence: geminiResult.confidence,
            processingTime: `${Date.now() - startTime}ms`
          });

          return {
            success: true,
            text: geminiResult.text,
            confidence: geminiResult.confidence,
            processingTime: Date.now() - startTime
          };
        } else {
          console.warn('⚠️ Gemini Vision returned empty/failed result, falling back to Tesseract OCR...', {
            filename: file.name,
            geminiSuccess: geminiResult.success,
            geminiTextLength: geminiResult.text.length
          });
        }
      } catch (geminiError) {
        console.warn('⚠️ Gemini Vision API failed, falling back to Tesseract OCR...', {
          filename: file.name,
          error: geminiError,
          errorMessage: geminiError instanceof Error ? geminiError.message : 'Unknown error',
          fallbackAction: 'Using Tesseract OCR as backup'
        });
      }
    } else {
      console.log('ℹ️ Gemini API key not configured, using Tesseract OCR directly', {
        filename: file.name
      });
    }

    // Step 2: Fallback to Tesseract OCR if Gemini failed or unavailable
    console.log('🔄 Starting Tesseract OCR fallback...', {
      filename: file.name,
      reason: 'Gemini Vision unavailable or failed'
    });

    onProgress?.({ current: 0, total: 100, message: 'Processing with OCR...' });

    // DIAGNOSTIC: Worker initialization
    console.log('🔧 OCR: Getting worker instance...', {
      filename: file.name
    });

    const worker = await getOcrWorker();

    console.log('✅ OCR: Worker ready', {
      filename: file.name,
      workerExists: !!worker
    });

    onProgress?.({ current: 25, total: 100, message: 'Processing image with Tesseract...' });

    // DIAGNOSTIC: Starting recognition
    console.log('🔍 OCR: Starting Tesseract recognition...', {
      filename: file.name,
      fileSize: file.size
    });

    const { data } = await worker.recognize(file);

    // DIAGNOSTIC: Recognition complete
    console.log('✅ OCR: Tesseract recognition complete', {
      filename: file.name,
      textLength: data.text.length,
      confidence: data.confidence,
      textPreview: data.text.substring(0, 150),
      processingTime: `${Date.now() - startTime}ms`
    });

    onProgress?.({ current: 100, total: 100, message: 'Complete' });

    // DIAGNOSTIC: Final OCR result
    console.log('✅ OCR: Returning Tesseract result (fallback method)', {
      filename: file.name,
      success: true,
      textLength: data.text.length,
      confidence: data.confidence / 100,
      processingTime: `${Date.now() - startTime}ms`
    });

    return {
      success: true,
      text: data.text,
      confidence: data.confidence / 100, // Normalize Tesseract confidence to 0-1
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    // DIAGNOSTIC: OCR main error handler
    console.error('❌ OCR: Main extraction failed', {
      filename: file.name,
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      nextAction: hasGeminiApiKey() ? 'Trying Gemini Vision' : 'Returning failure'
    });

    // Try Gemini Vision as last resort if OCR completely fails
    if (hasGeminiApiKey()) {
      try {
        console.log('🆘 OCR failed completely, attempting Gemini Vision rescue...', {
          filename: file.name
        });

        onProgress?.({ current: 50, total: 100, message: 'OCR failed, trying Gemini Vision...' });
        const geminiResult = await fallbackToGeminiVision(file);

        console.log('✅ Recovered with Gemini Vision after OCR failure', {
          filename: file.name,
          success: geminiResult.success,
          textLength: geminiResult.text.length,
          confidence: geminiResult.confidence
        });

        onProgress?.({ current: 100, total: 100, message: 'Recovered with Gemini Vision' });
        return geminiResult;
      } catch (geminiError) {
        // DIAGNOSTIC: Gemini rescue also failed
        console.error('❌ Gemini Vision rescue attempt also failed', {
          filename: file.name,
          geminiError: geminiError,
          geminiErrorMessage: geminiError instanceof Error ? geminiError.message : 'Unknown error',
          originalOcrError: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      console.warn('⚠️ OCR failed and Gemini API key not configured - cannot attempt rescue', {
        filename: file.name
      });
    }

    // DIAGNOSTIC: Final failure
    console.error('❌ OCR: All extraction attempts failed, returning failure', {
      filename: file.name,
      processingTime: `${Date.now() - startTime}ms`
    });

    return {
      success: false,
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: ProgressInfo) => void
): Promise<OcrResult> {
  const startTime = Date.now();
  
  try {
    // Dynamic import of PDF.js for mobile performance
    const pdfjsLib = await configurePdfWorker();
    
    onProgress?.({ current: 0, total: 100, message: 'Loading PDF...' });
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      disableRange: true,
      disableStream: true
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let extractedText = '';
    
    // Try text extraction first
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress?.({ 
        current: (pageNum / numPages) * 50, 
        total: 100, 
        message: `Extracting text from page ${pageNum}/${numPages}...` 
      });
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      extractedText += pageText + '\n';
    }
    
    // If no text found, try OCR
    if (!extractedText.trim()) {
      const worker = await getOcrWorker();
      
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        onProgress?.({ 
          current: 50 + (pageNum / numPages) * 50, 
          total: 100, 
          message: `OCR processing page ${pageNum}/${numPages}...` 
        });
        
        const page = await pdf.getPage(pageNum);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const viewport = page.getViewport({ scale: 2.0 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        
        const { data } = await worker.recognize(canvas);
        extractedText += data.text + '\n';
      }
    }
    
    onProgress?.({ current: 100, total: 100, message: 'Complete' });
    
    return {
      success: true,
      text: extractedText,
      confidence: extractedText.trim() ? 0.8 : 0,
      pageCount: numPages,
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      pageCount: 0,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Analyze image for text content (lightweight detection)
 */
export async function analyzeImageForText(file: File): Promise<ImageTextAnalysis> {
  try {
    // DIAGNOSTIC: Entry point
    console.log('🔍 analyzeImageForText() called', {
      filename: file.name,
      fileType: file.type,
      fileSizeKB: (file.size / 1024).toFixed(2)
    });

    if (!file.type.startsWith('image/')) {
      console.log('⏭️ Not an image file, skipping text analysis', {
        filename: file.name,
        fileType: file.type
      });
      return {
        hasSignificantText: false,
        textConfidence: 0,
        textPreview: '',
        recommendedAction: 'send_image',
        estimatedTextRatio: 0
      };
    }

    const filename = file.name.toLowerCase();
    const sizeKB = file.size / 1024;
    
    // Text document patterns - expanded for medical use
    const textDocumentPatterns = [
      /scan/i, /document/i, /report/i, /form/i, /page/i,
      /დოკუმენტი/i, /ანგარიში/i, /ფორმა/i,
      /text/i, /note/i, /receipt/i, /invoice/i,
      /screenshot/i, /screen/i, /capture/i, /snap/i // Add screenshot detection
    ];
    
    const hasTextualFilename = textDocumentPatterns.some(pattern => pattern.test(filename));
    
    // Medical image patterns - expanded
    const medicalImagePatterns = [
      /x[_-]?ray/i, /ultrasound/i, /mri/i, /ct[_-]?scan/i,
      /ecg|ekg/i, /echo/i, /mammo/i, /radio/i,
      /photo/i, /picture/i, /img/i,
      /medical/i, /lab/i, /test/i, /result/i // Add common medical terms
    ];
    
    const isMedicalImage = medicalImagePatterns.some(pattern => pattern.test(filename));
    
    let hasSignificantText = false;
    let recommendedAction: 'extract_text' | 'send_image' | 'extract_and_send' = 'send_image';
    let estimatedTextRatio = 0;
    
    if (hasTextualFilename && !isMedicalImage) {
      hasSignificantText = true;
      estimatedTextRatio = 0.7;
      recommendedAction = 'extract_text';
    } else if (hasTextualFilename && isMedicalImage) {
      hasSignificantText = true;
      estimatedTextRatio = 0.5;
      recommendedAction = 'extract_and_send';
    } else if (sizeKB > 10 && sizeKB < 10000) {
      // For medical app, be more aggressive about OCR for any reasonable-sized image
      hasSignificantText = true;
      estimatedTextRatio = 0.4;
      recommendedAction = 'extract_and_send';
    } else {
      // Even for other images, try extraction in medical context
      hasSignificantText = true;
      estimatedTextRatio = 0.2;
      recommendedAction = 'extract_and_send';
    }
    
    // DIAGNOSTIC: Analysis decision
    console.log('📊 Image text analysis complete:', {
      filename: file.name,
      hasSignificantText: hasSignificantText,
      recommendedAction: recommendedAction,
      estimatedTextRatio: estimatedTextRatio,
      textConfidence: hasSignificantText ? 0.7 : 0,
      matchedPatterns: {
        hasTextualFilename: hasTextualFilename,
        isMedicalImage: isMedicalImage
      },
      sizeKB: sizeKB.toFixed(2)
    });

    return {
      hasSignificantText,
      textConfidence: hasSignificantText ? 0.7 : 0,
      textPreview: '',
      recommendedAction,
      estimatedTextRatio
    };

  } catch (error) {
    // DIAGNOSTIC: Analysis error
    console.error('❌ Image text analysis failed:', {
      filename: file.name,
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      fallbackAction: 'Defaulting to send_image'
    });

    return {
      hasSignificantText: false,
      textConfidence: 0,
      textPreview: '',
      recommendedAction: 'send_image',
      estimatedTextRatio: 0
    };
  }
}

/**
 * Get file processing recommendation
 */
export async function getFileProcessingRecommendation(file: File): Promise<{
  action: 'extract_text' | 'send_image' | 'extract_and_send' | 'send_file';
  reason: string;
  confidence: number;
}> {
  const fileType = file.type.toLowerCase();
  
  if (fileType === 'application/pdf') {
    return {
      action: 'extract_text',
      reason: 'PDF document - attempting text extraction',
      confidence: 0.9
    };
  }
  
  if (fileType.startsWith('image/')) {
    const analysis = await analyzeImageForText(file);
    
    let reason = '';
    switch (analysis.recommendedAction) {
      case 'extract_text':
        reason = 'Image contains significant text content';
        break;
      case 'send_image':
        reason = 'Image is primarily visual content';
        break;
      case 'extract_and_send':
        reason = 'Mixed content - extracting text and sending image';
        break;
    }
    
    return {
      action: analysis.recommendedAction,
      reason,
      confidence: analysis.textConfidence
    };
  }
  
  if (fileType.includes('document') || fileType.includes('text') || fileType === 'text/plain') {
    return {
      action: 'extract_text',
      reason: 'Text document type',
      confidence: 0.8
    };
  }
  
  return {
    action: 'send_file',
    reason: 'Unsupported type - sending as file attachment',
    confidence: 0.5
  };
}

/**
 * Check if the file appears to be a medical image that would benefit from Gemini Vision
 */
function isMedicalImage(filename: string): boolean {
  const medicalPatterns = [
    /abg/i, /blood[_-]?gas/i, /bga/i, 
    /x[_-]?ray/i, /ultrasound/i, /mri/i, /ct[_-]?scan/i,
    /ecg|ekg/i, /echo/i, /mammo/i, /radiometer/i,
    /report/i, /analysis/i, /result/i, /lab/i
  ];
  
  return medicalPatterns.some(pattern => pattern.test(filename));
}

/**
 * Check if Gemini API key is available
 */
function hasGeminiApiKey(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}

/**
 * Fallback to Gemini Vision API for better text extraction
 */
async function fallbackToGeminiVision(file: File): Promise<OcrResult> {
  try {
    const result = await extractTextFromImageWithGemini(file);
    
    return {
      success: result.text.length > 0,
      text: result.text,
      confidence: result.confidence,
      processingTime: 0 // Will be calculated by parent function
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Gemini Vision extraction failed'
    };
  }
}