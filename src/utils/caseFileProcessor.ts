import { extractTextFromPdfLazy as extractTextFromPdf, isPdfFile } from './lazyPdfExtractor';
import type { ProgressInfo } from './pdfTextExtractor';
import { extractTextFromPdf as unifiedExtractFromPdf, OcrResult } from './unifiedOcrExtractor';
import { CaseAttachment } from '../components/CaseManagement/CaseFileUpload';
import { analyzeImageForText } from './unifiedOcrExtractor';

// Compatibility wrapper for the old OCR interface
async function extractTextFromPdfWithOCR(
  file: File,
  onProgress?: (progress: ProgressInfo) => void
): Promise<{ text: string; confidence: number; pageCount?: number }> {
  const compatProgress = onProgress ? (progress: { current: number; total: number; message: string }) => {
    onProgress({
      stage: 'ocr',
      stageDescription: progress.message,
      percentage: Math.round((progress.current / progress.total) * 100),
      method: 'ocr'
    });
  } : undefined;
  
  const result = await unifiedExtractFromPdf(file, compatProgress);
  return {
    text: result.text,
    confidence: result.confidence,
    pageCount: result.pageCount
  };
}

export interface ProcessedAttachment extends CaseAttachment {
  processedData?: {
    extractedText?: string;
    compressedBase64?: string;
    metadata?: Record<string, unknown>;
    ocrConfidence?: number;
    confidence?: number;
    extractionMethod?: 'standard' | 'gemini' | 'ocr';
    textRatio?: number;
    processingDecision?: string;
  };
}

// Compress image if needed
async function compressImageIfNeeded(file: File, maxSizeKB: number = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const maxWidth = 1024;
        const maxHeight = 1024;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels
        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const sizeKB = blob.size / 1024;
              
              if (sizeKB <= maxSizeKB || quality <= 0.1) {
                // Convert to base64
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('Failed to read compressed image'));
                reader.readAsDataURL(blob);
              } else {
                // Try lower quality
                tryCompress(quality - 0.1);
              }
            },
            file.type,
            quality
          );
        };
        
        tryCompress(0.8);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Process PDF files with enhanced extraction (includes Gemini fallback)
async function processPdfFile(
  attachment: CaseAttachment,
  onProgress?: (progress: ProgressInfo) => void
): Promise<ProcessedAttachment> {
  try {
    // Use enhanced text extraction (includes Gemini fallback for Georgian text)
    const textResult = await extractTextFromPdf(attachment.file, onProgress);
    
    if (textResult.hasText && textResult.text) {
      const processingDecision = `Extracted ${textResult.text.length} characters using ${textResult.extractionMethod || 'standard'} method`;
      
      return {
        ...attachment,
        status: 'ready',
        extractedText: textResult.text,
        processedData: {
          extractedText: textResult.text,
          extractionMethod: textResult.extractionMethod || 'standard',
          confidence: textResult.confidence,
          processingDecision,
          metadata: {
            pageCount: textResult.pageCount,
            extractionMethod: textResult.extractionMethod || 'standard',
            confidence: textResult.confidence
          }
        }
      };
    }
    
    // If no text found and OCR is needed, try OCR as final fallback
    if (textResult.needsOCR) {
      onProgress?.({
        stage: 'ocr',
        stageDescription: 'No text found with enhanced extraction, trying OCR...',
        percentage: 0,
        method: 'ocr'
      });
      
      const ocrResult = await extractTextFromPdfWithOCR(attachment.file, onProgress);
      
      if (ocrResult.text && ocrResult.text.trim()) {
        return {
          ...attachment,
          status: 'ready',
          extractedText: ocrResult.text,
          processedData: {
            extractedText: ocrResult.text,
            extractionMethod: 'ocr',
            ocrConfidence: ocrResult.confidence,
            confidence: ocrResult.confidence,
            processingDecision: `OCR extracted ${ocrResult.text.length} characters with ${Math.round(ocrResult.confidence * 100)}% confidence`,
            metadata: {
              pageCount: ocrResult.pageCount,
              extractionMethod: 'ocr',
              confidence: ocrResult.confidence
            }
          }
        };
      }
    }
    
    return {
      ...attachment,
      status: 'error',
      error: 'No text could be extracted from PDF using any method'
    };
    
  } catch (error) {
    return {
      ...attachment,
      status: 'error',
      error: error instanceof Error ? error.message : 'PDF processing failed'
    };
  }
}

// Process image files with intelligent text extraction
async function processImageFile(
  attachment: CaseAttachment, 
  onProgress?: (progress: ProgressInfo) => void
): Promise<ProcessedAttachment> {
  try {
    const startTime = performance.now();
    const sizeKB = attachment.file.size / 1024;
    
    console.log(`🖼️ [PERFORMANCE] Starting image processing for ${attachment.file.name} (${sizeKB.toFixed(1)}KB)`);
    
    onProgress?.({
      stage: 'analyzing',
      stageDescription: 'Analyzing image for text content...',
      percentage: 0,
      method: 'standard'
    });

    // Analyze image for text content
    const analysisStartTime = performance.now();
    const textAnalysis = await analyzeImageForText(attachment.file);
    const analysisTime = performance.now() - analysisStartTime;
    console.log(`🔍 [PERFORMANCE] Image analysis took: ${analysisTime.toFixed(2)}ms - hasText: ${textAnalysis.hasSignificantText}, action: ${textAnalysis.recommendedAction}`);
    
    let extractedText: string | undefined;
    let extractionMethod: 'gemini' | undefined;
    let confidence: number | undefined;

    // Use the optimized image OCR for text extraction when recommended
    if (textAnalysis.hasSignificantText && 
        (textAnalysis.recommendedAction === 'extract_text' || textAnalysis.recommendedAction === 'extract_and_send')) {
      
      console.log(`📝 [PERFORMANCE] Starting OCR extraction for ${attachment.file.name}`);
      onProgress?.({
        stage: 'extracting',
        stageDescription: 'Extracting text from image...',
        percentage: 30,
        method: 'ocr'
      });

      try {
        const ocrStartTime = performance.now();
        // Import the unified OCR extractor
        const { extractTextFromImage } = await import('./unifiedOcrExtractor');
        
        const ocrResult = await extractTextFromImage(attachment.file, (ocrProgress) => {
          console.log(`📝 [PERFORMANCE] OCR progress for ${attachment.file.name}: ${ocrProgress.stage} - ${ocrProgress.percentage}%`);
          onProgress?.({
            ...ocrProgress,
            percentage: 30 + (ocrProgress.percentage || 0) * 0.5
          });
        });

        const ocrTime = performance.now() - ocrStartTime;
        console.log(`📝 [PERFORMANCE] OCR extraction took: ${ocrTime.toFixed(2)}ms - success: ${ocrResult.success}, textLength: ${ocrResult.text?.length || 0}`);

        if (ocrResult.success && ocrResult.text && ocrResult.text.trim()) {
          extractedText = ocrResult.text;
          extractionMethod = 'ocr';
          confidence = ocrResult.confidence;
        }
      } catch (ocrError) {
        console.error(`❌ [PERFORMANCE] OCR extraction failed for ${attachment.file.name}:`, ocrError);
      }
    } else {
      console.log(`⏭️ [PERFORMANCE] Skipping OCR for ${attachment.file.name} - no significant text detected`);
    }

    onProgress?.({
      stage: 'extracting',
      stageDescription: 'Processing image data...',
      percentage: 80,
      method: 'standard'
    });

    // Handle image compression
    let compressedBase64: string | undefined;
    let compressed = false;

    if (sizeKB > 2048) {
      compressedBase64 = await compressImageIfNeeded(attachment.file, 500);
      compressed = true;
    }

    const processingDecision = (() => {
      if (extractedText) {
        return `Text extracted (${extractedText.length} chars) + ${compressed ? 'compressed' : 'original'} image`;
      } else if (textAnalysis.hasSignificantText) {
        return `Text detected but extraction failed - ${compressed ? 'compressed' : 'original'} image only`;
      } else {
        return `Visual content - ${compressed ? 'compressed' : 'original'} image`;
      }
    })();

    onProgress?.({
      stage: 'complete',
      stageDescription: 'Image processing complete',
      percentage: 100,
      method: extractionMethod || 'standard'
    });
    
    const totalTime = performance.now() - startTime;
    console.log(`✅ [PERFORMANCE] Image processing completed for ${attachment.file.name} in: ${totalTime.toFixed(2)}ms`);
    
    return {
      ...attachment,
      status: 'ready',
      extractedText,
      base64Data: compressedBase64,
      processedData: {
        extractedText,
        compressedBase64,
        extractionMethod,
        confidence,
        textRatio: textAnalysis.estimatedTextRatio,
        processingDecision,
        metadata: {
          originalSizeKB: sizeKB,
          compressed,
          hasSignificantText: textAnalysis.hasSignificantText,
          textConfidence: textAnalysis.textConfidence,
          extractionMethod,
          confidence
        }
      }
    };
    
  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error(`❌ [PERFORMANCE] Image processing failed for ${attachment.file.name} after ${totalTime.toFixed(2)}ms:`, error);
    return {
      ...attachment,
      status: 'error',
      error: error instanceof Error ? error.message : 'Image processing failed'
    };
  }
}

// Main processing function
export async function processFileForCaseUpload(
  attachment: CaseAttachment,
  onProgress?: (progress: ProgressInfo) => void
): Promise<ProcessedAttachment> {
  try {
    const fileType = attachment.file.type.toLowerCase();
    
    // Route to appropriate processor
    if (fileType === 'application/pdf') {
      return processPdfFile(attachment, onProgress);
    } else if (fileType.startsWith('image/')) {
      return processImageFile(attachment, onProgress);
    } else {
      // For other file types, just mark as ready
      return {
        ...attachment,
        status: 'ready',
        processedData: {
          metadata: {
            fileType,
            sizeKB: attachment.file.size / 1024
          }
        }
      };
    }
    
  } catch (error) {
    return {
      ...attachment,
      status: 'error',
      error: error instanceof Error ? error.message : 'File processing failed'
    };
  }
}

// Batch processing function (sequential)
export async function processCaseAttachments(
  attachments: CaseAttachment[],
  onProgress?: (fileIndex: number, fileName: string, progress: ProgressInfo) => void
): Promise<ProcessedAttachment[]> {
  const results: ProcessedAttachment[] = [];
  
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    const progressCallback = (progress: ProgressInfo) => {
      onProgress?.(i, attachment.file.name, progress);
    };
    
    const processed = await processFileForCaseUpload(attachment, progressCallback);
    results.push(processed);
  }
  
  return results;
}

// Timeout wrapper to prevent infinite hanging
async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number, 
  timeoutMessage: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// Semaphore to limit concurrent OCR operations
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!;
      this.permits--;
      resolve();
    }
  }
}

// Limit concurrent OCR operations to prevent resource conflicts
const ocrSemaphore = new Semaphore(2); // Max 2 concurrent OCR operations

// Parallel batch processing function with timeout and concurrency control
export async function processCaseAttachmentsParallel(
  attachments: CaseAttachment[],
  onProgress?: (fileIndex: number, fileName: string, progress: ProgressInfo) => void
): Promise<ProcessedAttachment[]> {
  console.log(`🚀 [PERFORMANCE] Starting parallel processing of ${attachments.length} files (max 2 concurrent OCR operations)`);
  const startTime = performance.now();
  
  // Create progress tracking for each file
  const fileProgress = attachments.map(() => ({ stage: 'pending', percentage: 0 }));
  
  // Process all files in parallel with timeout and concurrency control
  const processingPromises = attachments.map(async (attachment, index) => {
    const progressCallback = (progress: ProgressInfo) => {
      // Update progress for this specific file
      fileProgress[index] = {
        stage: progress.stage || 'processing',
        percentage: progress.percentage || 0
      };
      
      // Report progress for this file
      onProgress?.(index, attachment.file.name, progress);
    };
    
    console.log(`🔄 [PERFORMANCE] Starting parallel processing for file ${index + 1}: ${attachment.file.name}`);
    const fileStartTime = performance.now();
    
    try {
      // Acquire semaphore for OCR operations
      await ocrSemaphore.acquire();
      console.log(`🎫 [PERFORMANCE] OCR slot acquired for file ${index + 1}: ${attachment.file.name}`);
      
      try {
        // Add 60 second timeout to prevent infinite hanging
        const processed = await withTimeout(
          processFileForCaseUpload(attachment, progressCallback),
          60000, // 60 seconds timeout
          `Timeout: File processing took longer than 60 seconds for ${attachment.file.name}`
        );
        
        const fileTime = performance.now() - fileStartTime;
        console.log(`✅ [PERFORMANCE] File ${index + 1} (${attachment.file.name}) completed in parallel after: ${fileTime.toFixed(2)}ms`);
        return processed;
      } finally {
        // Always release the semaphore
        ocrSemaphore.release();
        console.log(`🎫 [PERFORMANCE] OCR slot released for file ${index + 1}: ${attachment.file.name}`);
      }
    } catch (error) {
      const fileTime = performance.now() - fileStartTime;
      console.error(`❌ [PERFORMANCE] File ${index + 1} (${attachment.file.name}) failed in parallel after: ${fileTime.toFixed(2)}ms`, error);
      
      // Return a failed attachment instead of throwing
      return {
        ...attachment,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  });
  
  // Use Promise.allSettled to continue even if some files fail
  const results = await Promise.allSettled(processingPromises);
  
  const totalTime = performance.now() - startTime;
  console.log(`🏁 [PERFORMANCE] Parallel processing completed for ${attachments.length} files in: ${totalTime.toFixed(2)}ms`);
  
  // Extract successful results and handle failed ones
  const processedAttachments: ProcessedAttachment[] = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`❌ [PERFORMANCE] Final error for file ${index + 1}:`, result.reason);
      return {
        ...attachments[index],
        status: 'error' as const,
        error: result.reason instanceof Error ? result.reason.message : 'Processing failed'
      };
    }
  });
  
  const successCount = processedAttachments.filter(p => p.status === 'ready').length;
  const failureCount = processedAttachments.filter(p => p.status === 'error').length;
  console.log(`📊 [PERFORMANCE] Final results: ${successCount} successful, ${failureCount} failed`);
  
  return processedAttachments;
}