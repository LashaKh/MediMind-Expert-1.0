import * as pdfjsLib from 'pdfjs-dist';
import { extractTextWithGeminiVision, assessGeorgianTextQuality } from './geminiVisionExtractor';

// Configure PDF.js worker with LOCAL-FIRST strategy (no external dependencies)
if (typeof window !== 'undefined') {
  let workerConfigured = false;
  
  // Strategy 1: PRIORITIZE LOCAL FILE (eliminates CORS issues)
  try {
    // Add timestamp to force cache refresh and handle /expert/ path
    const timestamp = Date.now();
    const currentPath = window.location.pathname;
    // Check if we're on expert path or mediscribe path (both should use expert assets)
    const isExpertContext = currentPath.includes('/expert/') || currentPath.includes('/mediscribe');
    const basePath = isExpertContext ? '/expert/' : '/';
    const localWorkerUrl = new URL(`${basePath}pdf.worker.min.js?v=${timestamp}`, window.location.origin).href;
    
    // Debug: Log path detection details
    
    // Force fresh worker configuration
    (pdfjsLib.GlobalWorkerOptions as any).workerSrc = localWorkerUrl;
    workerConfigured = true;
  } catch (localError) {

  }
  
  // Strategy 2: Only try CDN as backup if local completely fails
  if (!workerConfigured) {
    try {
      // Use a different CDN that doesn't have Cloudflare restrictions
      const cdnWorkerUrl = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
      pdfjsLib.GlobalWorkerOptions.workerSrc = cdnWorkerUrl;
      pdfjsLib.GlobalWorkerOptions.disableWorker = false;
      workerConfigured = true;
    } catch (cdnError) {

    }
  }
  
  // Strategy 3: Complete fallback - disable worker entirely (guaranteed to work)
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.disableWorker = true;
    pdfjsLib.GlobalWorkerOptions.workerSrc = null;
  }
  
  // Enhanced security and performance settings
  pdfjsLib.GlobalWorkerOptions.isEvalSupported = false;  // Security: No eval()
  pdfjsLib.GlobalWorkerOptions.maxImageSize = 16777216;  // Performance: 16MB image limit
  pdfjsLib.GlobalWorkerOptions.cMapPacked = true;        // Performance: Use packed character maps
  
}

export interface ProgressInfo {
  stage: 'analyzing' | 'extracting' | 'ocr' | 'gemini' | 'complete';
  stageDescription: string;
  percentage?: number;
  estimatedTimeRemaining?: string;
  currentPage?: number;
  totalPages?: number;
  method?: 'standard' | 'ocr' | 'gemini';
}

export interface PdfTextExtractionResult {
  text: string;
  pageCount: number;
  hasText: boolean;
  needsOCR: boolean;
  extractionMethod?: 'standard' | 'gemini' | 'ocr';
  confidence?: number;
  error?: string;
}

// Georgian text encoding fixes
const sylfaenGeorgianMappings: Record<string, string> = {
  'ნ': 'მ',
  'ძ': 'შ',
  'ჟ': 'ო',
  'კ': 'ი',
  'ტ': 'რ',
  'თ': 'ბ',
  'პ': 'ა',
  'ჲ': 'ვ',
  'ჳ': 'ლ',
  'ჴ': 'ს',
  'ჵ': 'დ',
  'ღ': 'ნ',
  'ჰ': 'უ',
  'ჱ': 'ფ',
  'ქ': 'ე',
  'წ': 'ტ',
  'რ': 'თ',
  'ფ': 'გ',
  'ხ': 'ქ',
  'ჷ': 'ც',
  'ჸ': 'ჩ',
  'ჹ': 'ჯ',
  'ჺ': 'ხ',
  'ჶ': 'ზ'
};

const specificWordMappings: Record<string, string> = {
  'ლქოთპსოთპთ': 'მშობიარობის',
  'სავაპასდო': 'სავარაუდო',
  'ტეპოლეპთა': 'ფეტომეტრია',
  'თავთს': 'თავის',
  'ბთპაპთეპალსპთ': 'ბიპარიეტალური',
  'გაპქელოწეპთლობა': 'გარშემოწერილობა',
  'ბსკლთ': 'ბუჩქი',
  'ლსბნათ': 'მუცლის',
  'დთალეპტთ': 'დიამეტრი',
  'ბთბაპთალსპთ': 'ბიპარიეტალური',
  'თქნეთ': 'იქნები'
};

function hasSylfaenGeorgianPatterns(text: string): boolean {
  const patterns = [
    /ლქოთპსოთპთ/g,
    /სავაპასდო/g,
    /ტეპოლეპთა/g,
    /ბთპაპთეპალსპთ/g,
    /გაპქელოწეპთლობა/g,
    /ÌØÏÁÉÀÒÏÁÉÓ/g,
    /ÓÀÝÀÒÏ/g,
    /ÔÄÔÏÌÄÔÒÉÀ/g,
    /[äöüÄÖÜ]/g,
    /[À-ÿ]{3,}/g,
    /[ა-ჰ][À-ÿ]/g
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

function fixGeorgianEncoding(text: string): string {
  if (!hasSylfaenGeorgianPatterns(text)) {
    return text;
  }

  let fixedText = text;

  // Apply word mappings first
  for (const [incorrect, correct] of Object.entries(specificWordMappings)) {
    fixedText = fixedText.replace(new RegExp(incorrect, 'g'), correct);
  }

  // Apply character mappings
  for (const [from, to] of Object.entries(sylfaenGeorgianMappings)) {
    fixedText = fixedText.replace(new RegExp(from, 'g'), to);
  }

  // Fix Latin Extended characters
  const latinExtendedToGeorgian: Record<string, string> = {
    'À': 'ა', 'Á': 'ბ', 'Â': 'გ', 'Ã': 'დ', 'Ä': 'ე', 'Å': 'ვ',
    'Æ': 'ზ', 'Ç': 'თ', 'È': 'ი', 'É': 'კ', 'Ê': 'ლ', 'Ë': 'მ',
    'Ì': 'ნ', 'Í': 'ო', 'Î': 'პ', 'Ï': 'ჟ', 'Ð': 'რ', 'Ñ': 'ს',
    'Ò': 'ტ', 'Ó': 'უ', 'Ô': 'ფ', 'Õ': 'ქ', 'Ö': 'ღ', '×': 'ყ',
    'Ø': 'შ', 'Ù': 'ჩ', 'Ú': 'ც', 'Û': 'ძ', 'Ü': 'წ', 'Ý': 'ჭ',
    'Þ': 'ხ', 'ß': 'ჯ', 'à': 'ჰ'
  };

  for (const [latin, georgian] of Object.entries(latinExtendedToGeorgian)) {
    fixedText = fixedText.replace(new RegExp(latin, 'g'), georgian);
  }

  return fixedText;
}

export async function extractTextFromPdf(
  file: File,
  onProgress?: (progress: ProgressInfo) => void
): Promise<PdfTextExtractionResult> {
  try {
    onProgress?.({
      stage: 'analyzing',
      stageDescription: 'Loading PDF document...',
      percentage: 0
    });

    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF with enhanced Unicode support and BULLETPROOF error handling
    let pdf;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        attempts++;
        
        // Force fresh worker configuration for each attempt
        const freshTimestamp = Date.now();
        const currentPath = window.location.pathname;
        const isExpertContext = currentPath.includes('/expert/') || currentPath.includes('/mediscribe');
        const basePath = isExpertContext ? '/expert/' : '/';
        const freshWorkerUrl = new URL(`${basePath}pdf.worker.min.js?v=${freshTimestamp}`, window.location.origin).href;
        (pdfjsLib.GlobalWorkerOptions as any).workerSrc = freshWorkerUrl;
        
        pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
          useSystemFonts: true,
          disableFontFace: false,
          fontExtraProperties: true,
          cMapPacked: true,
          disableRange: false,
          disableStream: false,
          disableAutoFetch: false,
          isOffscreenCanvasSupported: false
        }).promise;
        
        break; // Success - exit retry loop
        
      } catch (workerError) {

        if (attempts === 1) {
          // First failure: Disable worker and try again
          pdfjsLib.GlobalWorkerOptions.disableWorker = true;
          pdfjsLib.GlobalWorkerOptions.workerSrc = null;
        } else if (attempts === 2) {
          // Second failure: Use minimal configuration
        } else {
          // Final failure: Re-throw error
          throw new Error(`PDF loading failed after ${maxAttempts} attempts: ${workerError.message}`);
        }
      }
    }

    const numPages = pdf.numPages;
    let allText = '';
    let hasText = false;

    onProgress?.({
      stage: 'extracting',
      stageDescription: 'Extracting text from pages...',
      percentage: 10,
      totalPages: numPages,
      method: 'standard'
    });

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      
      // Extract text from items
      const pageText = textContent.items
        .map((item) => (item as { str: string }).str)
        .join(' ')
        .trim();

      if (pageText.length > 0) {
        hasText = true;
        allText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }

      // Check for text operators even if no text extracted
      if (!hasText) {
        const operators = await page.getOperatorList();
        const hasTextOperators = operators.fnArray.some((fn: number) => 
          [pdfjsLib.OPS.showText, pdfjsLib.OPS.showSpacedText, pdfjsLib.OPS.nextLineShowText].includes(fn)
        );
        if (hasTextOperators) {
          hasText = true;
        }
      }

      const progress = 10 + (pageNum / numPages) * 80;
      onProgress?.({
        stage: 'extracting',
        stageDescription: `Processing page ${pageNum} of ${numPages}...`,
        percentage: Math.round(progress),
        currentPage: pageNum,
        totalPages: numPages,
        method: 'standard'
      });
    }

    // Apply encoding fixes
    if (allText) {
      allText = fixGeorgianEncoding(allText);
    }

    // Assess text quality and determine if Gemini extraction is needed
    if (allText) {
      const qualityAssessment = assessGeorgianTextQuality(allText);
      
      // Debug logging for quality assessment
      if (process.env.NODE_ENV === 'development') {
      }
      
      // Use Gemini if text appears garbled or quality is poor
      if (qualityAssessment.shouldUseGemini) {
        onProgress?.({
          stage: 'gemini',
          stageDescription: 'Georgian text quality issues detected, using Gemini Vision API...',
          percentage: 50,
          method: 'gemini'
        });

        try {
          const geminiResult = await extractTextWithGeminiVision(file, (geminiProgress) => {
            // Forward Gemini progress with adjusted percentage
            onProgress?.({
              ...geminiProgress,
              percentage: 50 + (geminiProgress.percentage || 0) * 0.5
            });
          });

          if (geminiResult.text && geminiResult.text.trim().length > 0) {
            // For Georgian text, prioritize Gemini's clean extraction over garbled standard text
            // Even if it's shorter, clean Georgian text is much more valuable than garbled characters
            return {
              text: geminiResult.text,
              pageCount: numPages,
              hasText: true,
              needsOCR: false,
              extractionMethod: 'gemini',
              confidence: geminiResult.confidence
            };
          }
        } catch (geminiError) {

          // Continue with standard extraction
        }
      }
    }

    // If no text found with standard extraction, fall back to OCR (not Gemini)
    // Gemini should only be used for garbled Georgian text, not for missing text
    if (!hasText || !allText.trim()) {
      // Continue to OCR fallback - don't use Gemini for missing text
    }

    // Truncate to fit API token limits (approximately 25,000 tokens)
    const maxChars = 100000; // Roughly 25k tokens
    if (allText.length > maxChars) {
      allText = allText.substring(0, maxChars) + '\n... (content truncated)';
    }

    onProgress?.({
      stage: 'complete',
      stageDescription: 'Text extraction complete',
      percentage: 100,
      method: 'standard'
    });

    return {
      text: allText || '',
      pageCount: numPages,
      hasText,
      needsOCR: !hasText,
      extractionMethod: 'standard',
      confidence: hasText ? 0.8 : 0
    };

  } catch (error) {

    return {
      text: '',
      pageCount: 0,
      hasText: false,
      needsOCR: true,
      extractionMethod: 'standard',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}