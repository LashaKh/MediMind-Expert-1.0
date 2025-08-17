import { createWorker, Worker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
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

// Unified OCR worker management
let unifiedOcrWorker: Worker | null = null;
let textDetectionWorker: Worker | null = null;

/**
 * Configure PDF.js worker with local-first strategy
 */
function configurePdfWorker(): void {
  if (typeof window !== 'undefined') {
    try {
      const timestamp = Date.now();
      const localWorkerUrl = new URL(`/pdf.worker.min.js?v=${timestamp}`, window.location.origin).href;
      pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerUrl;
      pdfjsLib.GlobalWorkerOptions.disableWorker = false;
    } catch (error) {

    }
  }
}

/**
 * Get or create a full-featured OCR worker
 */
async function getOcrWorker(): Promise<Worker> {
  if (!unifiedOcrWorker) {
    try {
      unifiedOcrWorker = await createWorker(['kat', 'eng', 'rus'], 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // Optional: emit progress events
          }
        }
      });

      // Initialize languages first
      await unifiedOcrWorker.loadLanguage('kat+eng+rus');
      await unifiedOcrWorker.initialize('kat+eng+rus', 2); // OEM_LSTM_ONLY

      // Set parameters after initialization
      await unifiedOcrWorker.setParameters({
        tessedit_pageseg_mode: '1',
        preserve_interword_spaces: '1'
      });
    } catch (error) {
      unifiedOcrWorker = null;
      throw error;
    }
  }
  return unifiedOcrWorker;
}

/**
 * Get or create a lightweight text detection worker
 */
async function getTextDetectionWorker(): Promise<Worker> {
  if (!textDetectionWorker) {
    try {
      textDetectionWorker = await createWorker();
      await textDetectionWorker.loadLanguage('eng');
      await textDetectionWorker.initialize('eng');
      
      await textDetectionWorker.setParameters({
        tessedit_pageseg_mode: '3',
        tessedit_ocr_engine_mode: '2',
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?()-+='
      });
    } catch (error) {
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
  
  try {
    onProgress?.({ current: 0, total: 100, message: 'Initializing OCR...' });
    
    const worker = await getOcrWorker();
    
    onProgress?.({ current: 25, total: 100, message: 'Processing image...' });
    
    const { data } = await worker.recognize(file);
    
    onProgress?.({ current: 75, total: 100, message: 'Analyzing results...' });
    
    // Check if OCR results are poor and fallback to Gemini Vision if needed
    const shouldUseGeminiVision = (
      data.confidence < 60 || // Low confidence
      data.text.length < 50 || // Very short text
      isMedicalImage(file.name) // Medical images benefit from Gemini
    );
    
    if (shouldUseGeminiVision && hasGeminiApiKey()) {
      try {
        onProgress?.({ current: 80, total: 100, message: 'Trying Gemini Vision for better accuracy...' });
        
        const geminiResult = await fallbackToGeminiVision(file);
        
        // Use Gemini result if it's significantly better
        if (geminiResult.success && 
            (geminiResult.text.length > data.text.length * 1.5 || 
             geminiResult.confidence > data.confidence + 0.2)) {
          onProgress?.({ current: 100, total: 100, message: 'Enhanced with Gemini Vision' });
          return {
            success: true,
            text: geminiResult.text,
            confidence: geminiResult.confidence,
            processingTime: Date.now() - startTime
          };
        }
      } catch (geminiError) {
        console.warn('Gemini Vision fallback failed:', geminiError);
        // Continue with OCR result
      }
    }
    
    onProgress?.({ current: 100, total: 100, message: 'Complete' });
    
    return {
      success: true,
      text: data.text,
      confidence: data.confidence / 100, // Normalize Tesseract confidence to 0-1
      processingTime: Date.now() - startTime
    };
  } catch (error) {
    // Try Gemini Vision as last resort if OCR completely fails
    if (hasGeminiApiKey()) {
      try {
        onProgress?.({ current: 50, total: 100, message: 'OCR failed, trying Gemini Vision...' });
        const geminiResult = await fallbackToGeminiVision(file);
        onProgress?.({ current: 100, total: 100, message: 'Recovered with Gemini Vision' });
        return geminiResult;
      } catch (geminiError) {
        console.error('Both OCR and Gemini Vision failed:', error, geminiError);
      }
    }
    
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
    configurePdfWorker();
    
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
    if (!file.type.startsWith('image/')) {
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
    
    // Text document patterns
    const textDocumentPatterns = [
      /scan/i, /document/i, /report/i, /form/i, /page/i,
      /დოკუმენტი/i, /ანგარიში/i, /ფორმა/i,
      /text/i, /note/i, /receipt/i, /invoice/i
    ];
    
    const hasTextualFilename = textDocumentPatterns.some(pattern => pattern.test(filename));
    
    // Medical image patterns
    const medicalImagePatterns = [
      /x[_-]?ray/i, /ultrasound/i, /mri/i, /ct[_-]?scan/i,
      /ecg|ekg/i, /echo/i, /mammo/i, /radio/i,
      /photo/i, /picture/i, /img/i
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
    } else if (sizeKB > 500 && sizeKB < 5000) {
      hasSignificantText = true;
      estimatedTextRatio = 0.3;
      recommendedAction = 'extract_and_send';
    }
    
    return {
      hasSignificantText,
      textConfidence: hasSignificantText ? 0.7 : 0,
      textPreview: '',
      recommendedAction,
      estimatedTextRatio
    };
    
  } catch (error) {
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