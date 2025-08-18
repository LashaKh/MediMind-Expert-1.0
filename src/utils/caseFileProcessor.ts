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
    const sizeKB = attachment.file.size / 1024;
    
    onProgress?.({
      stage: 'analyzing',
      stageDescription: 'Analyzing image for text content...',
      percentage: 0,
      method: 'standard'
    });

    // Analyze image for text content
    const textAnalysis = await analyzeImageForText(attachment.file);
    
    let extractedText: string | undefined;
    let extractionMethod: 'gemini' | undefined;
    let confidence: number | undefined;

    // Use the optimized image OCR for text extraction when recommended
    if (textAnalysis.hasSignificantText && 
        (textAnalysis.recommendedAction === 'extract_text' || textAnalysis.recommendedAction === 'extract_and_send')) {
      
      onProgress?.({
        stage: 'extracting',
        stageDescription: 'Extracting text from image...',
        percentage: 30,
        method: 'ocr'
      });

      try {
        // Import the unified OCR extractor
        const { extractTextFromImage } = await import('./unifiedOcrExtractor');
        
        const ocrResult = await extractTextFromImage(attachment.file, (ocrProgress) => {
          onProgress?.({
            ...ocrProgress,
            percentage: 30 + (ocrProgress.percentage || 0) * 0.5
          });
        });

        if (ocrResult.success && ocrResult.text && ocrResult.text.trim()) {
          extractedText = ocrResult.text;
          extractionMethod = 'ocr';
          confidence = ocrResult.confidence;
        }
      } catch (ocrError) {

      }
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

// Batch processing function
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