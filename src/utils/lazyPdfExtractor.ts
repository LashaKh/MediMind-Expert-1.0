import type { PdfTextExtractionResult, ProgressInfo } from './pdfTextExtractor';

/**
 * Lazy-loaded PDF text extraction
 * Only loads PDF.js when actually needed for PDF processing
 */
export const extractTextFromPdfLazy = async (
  file: File,
  onProgress?: (progress: ProgressInfo) => void
): Promise<PdfTextExtractionResult> => {
  try {
    // Dynamic import to load PDF.js only when needed
    console.log('📦 Loading PDF extractor dynamically...');
    const { extractTextFromPdf } = await import('./pdfTextExtractor');
    console.log('📦 PDF extractor loaded, calling extractTextFromPdf...');
    const result = await extractTextFromPdf(file, onProgress);
    console.log('📦 PDF extractor result:', result);
    return result;
  } catch (error) {
    console.error('❌ Lazy PDF extractor failed:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });

    return {
      text: '',
      pageCount: 0,
      hasText: false,
      needsOCR: true,
      extractionMethod: 'standard',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Failed to load PDF processor'
    };
  }
};

/**
 * Check if a file is a PDF without loading the heavy PDF.js library
 */
export const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

/**
 * Get PDF info without loading the full extractor
 */
export const getPdfInfo = async (file: File): Promise<{ isPdf: boolean; size: number; name: string }> => {
  return {
    isPdf: isPdfFile(file),
    size: file.size,
    name: file.name
  };
};