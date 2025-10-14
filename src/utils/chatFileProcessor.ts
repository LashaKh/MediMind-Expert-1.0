import { Attachment, FlowiseUploadType } from '../types/chat';
import { extractTextFromPdfLazy as extractTextFromPdf, isPdfFile } from './lazyPdfExtractor';
import type { ProgressInfo } from './pdfTextExtractor';
import { extractTextFromPdf as unifiedExtractFromPdf, OcrResult } from './unifiedOcrExtractor';
import { validateFileForFlowise, getFlowiseUploadType } from './fileUpload';
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

export interface EnhancedAttachment extends Attachment {
  extractedText?: string;
  processingStatus?: 'processing' | 'completed' | 'error';
  processingError?: string;
  metadata?: {
    pageCount?: number;
    extractionMethod?: 'standard' | 'ocr' | 'gemini';
    ocrConfidence?: number;
    confidence?: number;
    compressed?: boolean;
    originalSize?: number;
    textRatio?: number;
    processingDecision?: string;
  };
}

/**
 * Convert a File object to base64 data URL format
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result); // This will be in format: "data:mime/type;base64,data"
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Compress image if needed for optimal chat performance
 */
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

/**
 * Process PDF files with text extraction
 */
async function processPdfForChat(
  file: File,
  onProgress?: (progress: ProgressInfo) => void
): Promise<{ base64Data: string; extractedText?: string; metadata?: Record<string, unknown> }> {
  try {
    // Get base64 data first (same as case study)
    const base64Data = await convertFileToBase64(file);
    
    // Try text extraction like case study does, but gracefully handle failures
    
    try {
      // Try the exact same extraction as case study processPdfFile
      const textResult = await extractTextFromPdf(file, onProgress);
      
      if (textResult.hasText && textResult.text && textResult.text.trim()) {
        return {
          base64Data,
          extractedText: textResult.text,
          metadata: {
            pageCount: textResult.pageCount,
            extractionMethod: textResult.extractionMethod || 'standard',
            confidence: textResult.confidence,
            processingDecision: `Extracted ${textResult.text.length} characters using ${textResult.extractionMethod || 'standard'} method`
          }
        };
      } else if (textResult.needsOCR) {
        // Try OCR fallback like case study does
        const ocrResult = await extractTextFromPdfWithOCR(file, onProgress);
        
        if (ocrResult.text && ocrResult.text.trim()) {
          return {
            base64Data,
            extractedText: ocrResult.text,
            metadata: {
              pageCount: ocrResult.pageCount,
              extractionMethod: 'ocr',
              ocrConfidence: ocrResult.confidence,
              processingDecision: `OCR extracted ${ocrResult.text.length} characters with ${Math.round(ocrResult.confidence * 100)}% confidence`
            }
          };
        }
      }
    } catch (extractionError) {
    }
    
    // Return base64 for visual analysis (like case study would if extraction failed)
    return {
      base64Data,
      metadata: {
        extractionMethod: 'base64',
        processingDecision: 'Text extraction failed, using PDF for visual analysis'
      }
    };
    
  } catch (error) {
    throw error;
  }
}

/**
 * Process image files with intelligent text extraction and optional compression
 */
async function processImageForChat(
  file: File,
  onProgress?: (progress: ProgressInfo) => void
): Promise<{ base64Data: string; extractedText?: string; metadata?: Record<string, unknown> }> {
  try {
    const sizeKB = file.size / 1024;

    // DIAGNOSTIC: Entry point logging
    console.log('🖼️ IMAGE PROCESSING START:', {
      filename: file.name,
      type: file.type,
      sizeKB: sizeKB.toFixed(2),
      sizeBytes: file.size,
      timestamp: new Date().toISOString()
    });

    onProgress?.({
      stage: 'analyzing',
      stageDescription: 'Analyzing image for text content...',
      percentage: 0,
      method: 'standard'
    });

    // DIAGNOSTIC: Before analysis
    console.log('🔍 Analyzing image for text content...', {
      filename: file.name,
      sizeKB: sizeKB.toFixed(2)
    });

    // Analyze image for text content
    const textAnalysis = await analyzeImageForText(file);

    // DIAGNOSTIC: Analysis results
    console.log('📊 Image Analysis Results:', {
      filename: file.name,
      hasSignificantText: textAnalysis.hasSignificantText,
      recommendedAction: textAnalysis.recommendedAction,
      estimatedTextRatio: textAnalysis.estimatedTextRatio,
      textConfidence: textAnalysis.textConfidence
    });
    
    onProgress?.({
      stage: 'extracting',
      stageDescription: 'Processing image...',
      percentage: 30,
      method: 'standard'
    });

    let extractedText: string | undefined;
    let textExtractionMethod: 'gemini' | 'ocr' | undefined;
    let confidence: number | undefined;

    // Use the optimized image OCR for text extraction when recommended
    if (textAnalysis.recommendedAction === 'extract_text' || textAnalysis.recommendedAction === 'extract_and_send') {
      // DIAGNOSTIC: OCR decision point
      console.log('📝 TEXT EXTRACTION TRIGGERED:', {
        filename: file.name,
        reason: textAnalysis.recommendedAction,
        confidence: textAnalysis.textConfidence,
        estimatedTextRatio: textAnalysis.estimatedTextRatio
      });

      onProgress?.({
        stage: 'extracting',
        stageDescription: 'Extracting text from image...',
        percentage: 40,
        method: 'ocr'
      });

      try {
        // DIAGNOSTIC: OCR import
        console.log('⚙️ Importing unified OCR extractor...', {
          filename: file.name
        });

        // Import the unified OCR extractor
        const { extractTextFromImage } = await import('./unifiedOcrExtractor');

        console.log('✅ OCR extractor imported successfully', {
          filename: file.name
        });

        console.log('🔄 Starting OCR process...', {
          filename: file.name,
          fileSize: file.size
        });

        const ocrResult = await extractTextFromImage(file, (ocrProgress) => {
          // DIAGNOSTIC: OCR progress
          console.log('📈 OCR Progress:', {
            filename: file.name,
            current: ocrProgress.current,
            total: ocrProgress.total,
            message: ocrProgress.message,
            percentage: Math.round((ocrProgress.current / ocrProgress.total) * 100)
          });

          onProgress?.({
            ...ocrProgress,
            percentage: 40 + (ocrProgress.percentage || 0) * 0.4
          });
        });

        // DIAGNOSTIC: OCR completion
        console.log('✅ OCR COMPLETED:', {
          filename: file.name,
          success: ocrResult.success,
          textLength: ocrResult.text?.length || 0,
          textPreview: ocrResult.text?.substring(0, 100) || '',
          confidence: ocrResult.confidence,
          processingTime: ocrResult.processingTime,
          error: ocrResult.error
        });

        if (ocrResult.success && ocrResult.text && ocrResult.text.trim()) {
          extractedText = ocrResult.text;
          textExtractionMethod = 'ocr';
          confidence = ocrResult.confidence;

          console.log('✅ Text extraction successful:', {
            filename: file.name,
            extractedTextLength: extractedText.length,
            method: textExtractionMethod,
            confidence: confidence
          });
        } else {
          console.warn('⚠️ OCR completed but no text extracted:', {
            filename: file.name,
            success: ocrResult.success,
            textLength: ocrResult.text?.length || 0,
            error: ocrResult.error
          });
        }
      } catch (ocrError) {
        // DIAGNOSTIC: OCR error (was silent before)
        console.error('❌ OCR EXTRACTION FAILED:', {
          filename: file.name,
          error: ocrError,
          errorMessage: ocrError instanceof Error ? ocrError.message : 'Unknown error',
          errorStack: ocrError instanceof Error ? ocrError.stack : undefined,
          fallbackAction: 'Returning image without text extraction'
        });

        // If OCR fails, we'll just send the image as visual content
      }
    } else {
      // DIAGNOSTIC: OCR skipped
      console.log('⏭️ TEXT EXTRACTION SKIPPED:', {
        filename: file.name,
        reason: `Recommended action: ${textAnalysis.recommendedAction}`,
        hasSignificantText: textAnalysis.hasSignificantText
      });
    }

    onProgress?.({
      stage: 'extracting',
      stageDescription: 'Preparing image data...',
      percentage: 80,
      method: 'standard'
    });

    // Handle image compression for visual content
    let base64Data: string;
    let compressed = false;

    if (textAnalysis.recommendedAction === 'extract_text' && extractedText) {
      // For text-only extraction, we don't need the image data
      // But we'll include a small compressed version for reference
      if (sizeKB > 1024) {
        base64Data = await compressImageIfNeeded(file, 200); // Very small for reference
        compressed = true;
      } else {
        base64Data = await convertFileToBase64(file);
      }
    } else {
      // For visual content or mixed content, maintain image quality
      if (sizeKB > 2048) {
        base64Data = await compressImageIfNeeded(file, 500);
        compressed = true;
      } else {
        base64Data = await convertFileToBase64(file);
      }
    }

    const processingDecision = (() => {
      if (textAnalysis.recommendedAction === 'extract_text') {
        return `Text document detected - extracted ${extractedText?.length || 0} characters`;
      } else if (textAnalysis.recommendedAction === 'extract_and_send') {
        return `Mixed content - extracted ${extractedText?.length || 0} characters + sending image`;
      } else {
        return 'Visual content detected - sending as image';
      }
    })();

    onProgress?.({
      stage: 'complete',
      stageDescription: 'Image processing complete',
      percentage: 100,
      method: textExtractionMethod || 'standard'
    });

    // DIAGNOSTIC: Final result logging
    console.log('✅ IMAGE PROCESSING COMPLETE:', {
      filename: file.name,
      hasExtractedText: !!extractedText,
      extractedTextLength: extractedText?.length || 0,
      textPreview: extractedText?.substring(0, 100) || 'No text extracted',
      base64DataLength: base64Data?.length || 0,
      compressed: compressed,
      extractionMethod: textExtractionMethod,
      confidence: confidence,
      textRatio: textAnalysis.estimatedTextRatio,
      processingDecision: processingDecision,
      totalProcessingTime: `${Date.now() - new Date(new Date().toISOString()).getTime()}ms`
    });

    return {
      base64Data,
      extractedText,
      metadata: {
        originalSize: file.size,
        compressed,
        extractionMethod: textExtractionMethod,
        confidence,
        textRatio: textAnalysis.estimatedTextRatio,
        processingDecision
      }
    };

  } catch (error) {
    // DIAGNOSTIC: Main error handler (was completely silent before)
    console.error('❌ IMAGE PROCESSING FATAL ERROR:', {
      filename: file.name,
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      fallbackAction: 'Converting to base64 and returning without text extraction'
    });

    // Fallback to standard conversion
    try {
      const base64Data = await convertFileToBase64(file);
      console.log('✅ Fallback base64 conversion successful', {
        filename: file.name,
        base64Length: base64Data.length
      });
      return {
        base64Data,
        metadata: {
          originalSize: file.size,
          compressed: false,
          processingDecision: 'Error occurred - sending as image',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    } catch (base64Error) {
      console.error('❌ FALLBACK BASE64 CONVERSION ALSO FAILED:', {
        filename: file.name,
        originalError: error,
        base64Error: base64Error,
        errorMessage: base64Error instanceof Error ? base64Error.message : 'Unknown error'
      });
      throw base64Error; // Re-throw since we can't recover
    }
  }
}

/**
 * Process other document types (DOC, DOCX, TXT, etc.)
 */
async function processDocumentForChat(
  file: File
): Promise<{ base64Data: string; extractedText?: string }> {
  try {
    const base64Data = await convertFileToBase64(file);
    
    // For text files, try to extract content
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      return {
        base64Data,
        extractedText: text
      };
    }
    
    // For other document types, return base64 only
    // The LLM will handle extraction on its end
    return { base64Data };
    
  } catch (error) {

    const base64Data = await convertFileToBase64(file);
    return { base64Data };
  }
}

/**
 * Enhanced file processing for chat with text extraction
 */
export const processFileForChatUpload = async (
  file: File,
  preferredUploadType?: FlowiseUploadType,
  onProgress?: (progress: ProgressInfo) => void
): Promise<EnhancedAttachment> => {
  try {
    // Validate file first
    const validation = validateFileForFlowise(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    // Determine upload type
    const uploadType = getFlowiseUploadType(file, preferredUploadType);
    
    // Base attachment object
    const baseAttachment: EnhancedAttachment = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadType,
      processingStatus: 'processing'
    };
    
    // Process based on file type
    const fileType = file.type.toLowerCase();
    
    let processingResult: { base64Data: string; extractedText?: string; metadata?: Record<string, unknown> };
    
    if (fileType === 'application/pdf') {
      processingResult = await processPdfForChat(file, onProgress);
    } else if (fileType.startsWith('image/')) {
      processingResult = await processImageForChat(file, onProgress);
    } else {
      processingResult = await processDocumentForChat(file);
    }
    
    // Create enhanced attachment with extracted content
    const enhancedAttachment: EnhancedAttachment = {
      ...baseAttachment,
      base64Data: processingResult.base64Data,
      extractedText: processingResult.extractedText,
      preview: fileType.startsWith('image/') ? processingResult.base64Data : undefined,
      processingStatus: 'completed',
      metadata: processingResult.metadata
    };
    
    return enhancedAttachment;
    
  } catch (error) {

    // Return basic attachment on error
    const fallbackBase64 = await convertFileToBase64(file);
    return {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      base64Data: fallbackBase64,
      uploadType: getFlowiseUploadType(file, preferredUploadType),
      preview: file.type.startsWith('image/') ? fallbackBase64 : undefined,
      processingStatus: 'error',
      processingError: error instanceof Error ? error.message : 'Processing failed'
    };
  }
};

/**
 * Semaphore for controlling concurrency of resource-intensive operations
 */
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

/**
 * Timeout wrapper utility
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
}

// Limit concurrent OCR operations to prevent browser resource exhaustion
const chatOcrSemaphore = new Semaphore(2); // Max 2 concurrent OCR operations

/**
 * Process multiple files for chat upload (SEQUENTIAL - for backward compatibility)
 */
export const processFilesForChatUpload = async (
  files: File[],
  onProgress?: (fileIndex: number, fileName: string, progress: ProgressInfo) => void
): Promise<EnhancedAttachment[]> => {
  const results: EnhancedAttachment[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progressCallback = (progress: ProgressInfo) => {
      onProgress?.(i, file.name, progress);
    };

    const processed = await processFileForChatUpload(file, undefined, progressCallback);
    results.push(processed);
  }

  return results;
};

/**
 * Process multiple files for chat upload in PARALLEL with concurrency control
 * This is significantly faster for multiple files (3-4x speedup)
 */
export const processFilesForChatUploadParallel = async (
  files: File[],
  onProgress?: (fileIndex: number, fileName: string, progress: ProgressInfo) => void
): Promise<EnhancedAttachment[]> => {
  const startTime = performance.now();

  console.log('🚀 [PARALLEL PROCESSING] Starting parallel file processing', {
    totalFiles: files.length,
    fileNames: files.map(f => f.name),
    timestamp: new Date().toISOString()
  });

  // Process all files in parallel with timeout and concurrency control
  const processingPromises = files.map(async (file, index) => {
    const progressCallback = (progress: ProgressInfo) => {
      onProgress?.(index, file.name, progress);
    };

    const fileStartTime = performance.now();

    try {
      // Acquire semaphore for resource-intensive operations (OCR, compression)
      await chatOcrSemaphore.acquire();

      try {
        console.log(`🔄 [PARALLEL] Processing file ${index + 1}/${files.length}: ${file.name}`, {
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          fileType: file.type,
          timeout: '180s'
        });

        // Add 180 second timeout per file (same as case study system)
        const processed = await withTimeout(
          processFileForChatUpload(file, undefined, progressCallback),
          180000, // 180 seconds timeout
          `Timeout: File processing took longer than 180 seconds for ${file.name}`
        );

        const fileTime = performance.now() - fileStartTime;
        console.log(`✅ [PARALLEL] File ${index + 1}/${files.length} complete: ${file.name}`, {
          processingTime: `${(fileTime / 1000).toFixed(1)}s`,
          hasExtractedText: !!processed.extractedText,
          extractedTextLength: processed.extractedText?.length || 0,
          status: processed.processingStatus
        });

        return processed;
      } finally {
        // Always release semaphore
        chatOcrSemaphore.release();
      }
    } catch (error) {
      const fileTime = performance.now() - fileStartTime;
      console.error(`❌ [PARALLEL] File ${index + 1}/${files.length} failed: ${file.name}`, {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTime: `${(fileTime / 1000).toFixed(1)}s`
      });

      // Release semaphore on error
      chatOcrSemaphore.release();

      // Return error attachment (graceful degradation)
      const fallbackBase64 = await convertFileToBase64(file);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        base64Data: fallbackBase64,
        uploadType: getFlowiseUploadType(file),
        preview: file.type.startsWith('image/') ? fallbackBase64 : undefined,
        processingStatus: 'error',
        processingError: error instanceof Error ? error.message : 'Processing failed'
      } as EnhancedAttachment;
    }
  });

  // Use Promise.allSettled to handle partial failures gracefully
  const results = await Promise.allSettled(processingPromises);

  const totalTime = performance.now() - startTime;
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failureCount = results.filter(r => r.status === 'rejected').length;

  console.log('✅ [PARALLEL PROCESSING] All files processed', {
    totalFiles: files.length,
    successCount: successCount,
    failureCount: failureCount,
    totalTime: `${(totalTime / 1000).toFixed(1)}s`,
    averageTimePerFile: `${(totalTime / files.length / 1000).toFixed(1)}s`
  });

  // Extract successful results
  return results
    .filter((result): result is PromiseFulfilledResult<EnhancedAttachment> =>
      result.status === 'fulfilled'
    )
    .map(result => result.value);
};

/**
 * Convert enhanced attachments to Flowise upload format
 * Sends extracted text instead of base64 for text-based documents to save tokens
 */
export const convertEnhancedAttachmentsToUploads = (attachments: EnhancedAttachment[]) => {
  return attachments
    .filter(attachment => attachment.base64Data || attachment.extractedText)
    .map(attachment => {
      // If we have extracted text, send as text content to save massive tokens
      if (attachment.extractedText && attachment.extractedText.trim()) {
        const upload: Record<string, unknown> = {
          data: `TEXT_CONTENT:${attachment.name}\n\n${attachment.extractedText}`,
          type: 'text',
          name: attachment.name,
          mime: 'text/plain'
        };
        
        // Add metadata about extraction method
        if (attachment.metadata) {
          upload.metadata = {
            ...attachment.metadata,
            originalMimeType: attachment.type,
            extractionNote: `Text extracted from ${attachment.type} using ${attachment.metadata.extractionMethod || 'standard'} method`
          };
        }
        
        return upload;
      }
      
      // For images or files without extracted text, send the base64 data
      const upload: Record<string, unknown> = {
        data: attachment.base64Data!,
        type: attachment.uploadType || 'file',
        name: attachment.name,
        mime: attachment.type
      };
      
      // Add any available metadata
      if (attachment.metadata) {
        upload.metadata = attachment.metadata;
      }
      
      return upload;
    });
};

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
const estimateTokenCount = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Truncate text to stay within token limits
 */
const truncateToTokenLimit = (text: string, maxTokens: number): { text: string; wasTruncated: boolean } => {
  const estimatedTokens = estimateTokenCount(text);
  
  if (estimatedTokens <= maxTokens) {
    return { text, wasTruncated: false };
  }
  
  // Calculate character limit (approximation)
  const maxChars = maxTokens * 4;
  
  // Try to truncate at sentence boundaries
  const sentences = text.split(/[.!?]+\s+/);
  let truncatedText = '';
  
  for (const sentence of sentences) {
    const testText = truncatedText + sentence + '. ';
    if (testText.length > maxChars) {
      break;
    }
    truncatedText = testText;
  }
  
  // If no complete sentences fit, truncate by characters
  if (truncatedText.length < maxChars * 0.1) {
    truncatedText = text.substring(0, maxChars - 100) + '...';
  }
  
  return { text: truncatedText, wasTruncated: true };
};

/**
 * Create a summary of long text content
 */
const createTextSummary = (text: string, filename: string): string => {
  const words = text.split(/\s+/);
  const totalWords = words.length;
  const estimatedTokens = estimateTokenCount(text);
  
  // Extract first few paragraphs as preview
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const preview = paragraphs.slice(0, 3).join('\n\n');
  const { text: truncatedPreview } = truncateToTokenLimit(preview, 500);
  
  return `
=== DOCUMENT SUMMARY: ${filename} ===
Total length: ${totalWords} words (~${estimatedTokens} tokens)
Content preview:
${truncatedPreview}

[Note: This is a preview of a large document. The full content was extracted but truncated for context management.]
`;
};

/**
 * Build text content from attachments for LLM context with token management
 */
export const buildAttachmentTextContext = (attachments: EnhancedAttachment[]): string => {
  let context = '';
  
  const attachmentsWithText = attachments.filter(att => att.extractedText);
  const attachmentsWithoutText = attachments.filter(att => !att.extractedText && att.base64Data);
  
  // If no attachments at all, return empty
  if (attachments.length === 0) {
    return context;
  }
  
  context += '\n\n=== Attached Documents Content ===\n';
  
  // Token budget management
  const MAX_TOTAL_TOKENS = 800000; // Conservative limit (about 80% of 1M context)
  const MAX_TOKENS_PER_DOCUMENT = 200000; // Max per individual document
  let totalTokensUsed = 0;
  
  attachmentsWithText.forEach((attachment, index) => {
    if (!attachment.extractedText) return;
    
    const docTitle = `\n--- Document ${index + 1}: ${attachment.name} ---\n`;
    const estimatedDocTokens = estimateTokenCount(attachment.extractedText);
    
    // Debug logging for token management
    
    // Check if we're approaching total limit
    if (totalTokensUsed + estimatedDocTokens > MAX_TOTAL_TOKENS) {
      context += `\n--- Document ${index + 1}: ${attachment.name} (SKIPPED) ---\n`;
      context += `[Document too large for context - ${estimatedDocTokens} estimated tokens. Document was processed but not included in context.]\n`;

      return;
    }
    
    context += docTitle;
    
    // Handle large individual documents
    if (estimatedDocTokens > MAX_TOKENS_PER_DOCUMENT) {
      // Create summary for very large documents
      const summary = createTextSummary(attachment.extractedText, attachment.name);
      context += summary;
      totalTokensUsed += estimateTokenCount(summary);
    } else {
      // Include full text for reasonably sized documents
      const { text: processedText, wasTruncated } = truncateToTokenLimit(
        attachment.extractedText, 
        Math.min(MAX_TOKENS_PER_DOCUMENT, MAX_TOTAL_TOKENS - totalTokensUsed)
      );
      
      context += processedText;
      
      if (wasTruncated) {
        context += '\n[Note: Document content was truncated due to length.]\n';
      }
      
      totalTokensUsed += estimateTokenCount(processedText);
    }
    
    // Add metadata
    if (attachment.metadata) {
      let metadataText = `[Extraction method: ${attachment.metadata.extractionMethod || 'standard'}`;
      if (attachment.metadata.pageCount) {
        metadataText += `, Pages: ${attachment.metadata.pageCount}`;
      }
      if (attachment.metadata.ocrConfidence) {
        metadataText += `, OCR confidence: ${Math.round(attachment.metadata.ocrConfidence * 100)}%`;
      }
      metadataText += `]\n`;
      context += metadataText;
    }
  });
  
  // Handle visual files without extracted text
  if (attachmentsWithoutText.length > 0) {
    context += '\n--- Visual Files for Analysis ---\n';
    attachmentsWithoutText.forEach((attachment, index) => {
      context += `File ${index + 1}: ${attachment.name} (${attachment.type})\n`;
      if (attachment.metadata?.processingDecision) {
        context += `Processing: ${attachment.metadata.processingDecision}\n`;
      }
      context += `Status: Image/file available for visual analysis\n\n`;
    });
  }
  
  // Add final summary
  if (totalTokensUsed > 500000) {
    context += `\n[Total extracted content: ~${totalTokensUsed} tokens from ${attachmentsWithText.length} document(s)]\n`;
  }
  
  if (attachmentsWithoutText.length > 0) {
    context += `[Additional ${attachmentsWithoutText.length} visual file(s) attached for analysis]\n`;
  }
  
  return context;
};