const { logger } = require('./logger');

/**
 * Document Processing Pipeline
 * Handles text extraction, chunking, and metadata extraction for various file types
 */

// Configuration for document processing
const PROCESSING_CONFIG = {
  // Text chunking configuration
  chunking: {
    maxChunkSize: 1000, // Maximum characters per chunk
    overlap: 200, // Character overlap between chunks
    minChunkSize: 100 // Minimum chunk size to be useful
  },
  
  // Supported file types for processing
  supportedTypes: {
    'application/pdf': { needsExtraction: true, priority: 'high' },
    'application/msword': { needsExtraction: true, priority: 'high' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { needsExtraction: true, priority: 'high' },
    'text/plain': { needsExtraction: false, priority: 'medium' },
    'text/csv': { needsExtraction: false, priority: 'medium' },
    'image/jpeg': { needsExtraction: true, priority: 'low' },
    'image/png': { needsExtraction: true, priority: 'low' },
    'image/gif': { needsExtraction: true, priority: 'low' },
    'image/webp': { needsExtraction: true, priority: 'low' },
    'image/tiff': { needsExtraction: true, priority: 'low' }
  }
};

/**
 * Extract text content from uploaded file based on file type
 * @param {Object} file - File object with type and data
 * @param {string} storagePath - Path to file in storage
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextContent(file, storagePath) {
  const fileType = file.type;
  const config = PROCESSING_CONFIG.supportedTypes[fileType];
  
  if (!config) {
    throw new Error(`Unsupported file type for processing: ${fileType}`);
  }

  logger.info('Starting text extraction', {
    fileType,
    fileName: file.name,
    storagePath,
    needsExtraction: config.needsExtraction
  });

  try {
    switch (fileType) {
      case 'text/plain':
      case 'text/csv':
        return await extractPlainText(file);
        
      case 'application/pdf':
        return await extractPDFText(file, storagePath);
        
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractWordText(file, storagePath);
        
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/webp':
      case 'image/tiff':
        return await extractImageText(file, storagePath);
        
      default:
        logger.warn('Unsupported file type for text extraction', { fileType });
        return `[Document: ${file.name}] - Content extraction not supported for this file type.`;
    }
  } catch (error) {
    logger.error('Text extraction failed', {
      error: error.message,
      fileType,
      fileName: file.name
    });
    throw error;
  }
}

/**
 * Extract text from plain text files
 */
async function extractPlainText(file) {
  try {
    // Decode base64 data
    const base64Data = file.data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const text = buffer.toString('utf-8');
    
    logger.info('Plain text extraction completed', {
      fileName: file.name,
      textLength: text.length
    });
    
    return text;
  } catch (error) {
    throw new Error(`Failed to extract plain text: ${error.message}`);
  }
}

/**
 * Extract text from PDF files
 * Note: This is a placeholder - in production, you'd use a library like pdf-parse
 */
async function extractPDFText(file, storagePath) {
  // Mock PDF processing - implement PDF.js integration in production
  const fileName = file.name;
  
  logger.info('PDF text extraction (placeholder)', {
    fileName,
    storagePath
  });
  
  return `[PDF Document: ${fileName}] - This is a placeholder for PDF text extraction. In production, this would use a PDF parsing library like pdf-parse to extract actual text content from the PDF file.`;
}

/**
 * Extract text from Word documents
 * Note: This is a placeholder - in production, you'd use a library like mammoth
 */
async function extractWordText(file, storagePath) {
  // Mock Word processing - implement mammoth.js integration in production
  const fileName = file.name;
  
  logger.info('Word document text extraction (placeholder)', {
    fileName,
    storagePath
  });
  
  return `[Word Document: ${fileName}] - This is a placeholder for Word document text extraction. In production, this would use a library like mammoth to extract actual text content from Word documents.`;
}

/**
 * Extract text from images using OCR
 * Note: This is a placeholder - in production, you'd use OCR services
 */
async function extractImageText(file, storagePath) {
  // Mock OCR processing - implement Tesseract.js integration in production
  const fileName = file.name;
  
  logger.info('Image text extraction (placeholder)', {
    fileName,
    storagePath
  });
  
  return `[Image Document: ${fileName}] - This is a placeholder for image text extraction. In production, this would use OCR services to extract text from images.`;
}

/**
 * Split text into chunks for vector storage
 * @param {string} text - Text content to chunk
 * @param {Object} metadata - Document metadata
 * @returns {Array} - Array of text chunks with metadata
 */
function chunkTextContent(text, metadata) {
  const { maxChunkSize, overlap, minChunkSize } = PROCESSING_CONFIG.chunking;
  const chunks = [];
  
  // Remove excessive whitespace and normalize
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  
  if (normalizedText.length <= maxChunkSize) {
    // If text is small enough, return as single chunk
    chunks.push({
      id: generateChunkId(metadata.documentId, 0),
      text: normalizedText,
      chunkIndex: 0,
      startPosition: 0,
      endPosition: normalizedText.length,
      metadata: {
        ...metadata,
        chunkCount: 1,
        chunkIndex: 0
      }
    });
    return chunks;
  }
  
  let startIndex = 0;
  let chunkIndex = 0;
  
  while (startIndex < normalizedText.length) {
    let endIndex = Math.min(startIndex + maxChunkSize, normalizedText.length);
    
    // Try to find a natural break point (sentence end, paragraph, etc.)
    if (endIndex < normalizedText.length) {
      const sentenceEnd = normalizedText.lastIndexOf('.', endIndex);
      const paragraphEnd = normalizedText.lastIndexOf('\n', endIndex);
      const spaceEnd = normalizedText.lastIndexOf(' ', endIndex);
      
      // Use the best break point available
      const breakPoint = Math.max(sentenceEnd, paragraphEnd, spaceEnd);
      if (breakPoint > startIndex + minChunkSize) {
        endIndex = breakPoint + 1;
      }
    }
    
    const chunkText = normalizedText.slice(startIndex, endIndex).trim();
    
    if (chunkText.length >= minChunkSize) {
      chunks.push({
        id: generateChunkId(metadata.documentId, chunkIndex),
        text: chunkText,
        chunkIndex,
        startPosition: startIndex,
        endPosition: endIndex,
        metadata: {
          ...metadata,
          chunkIndex,
          chunkCount: 0 // Will be updated after all chunks are created
        }
      });
      chunkIndex++;
    }
    
    // Move start index with overlap
    startIndex = Math.max(endIndex - overlap, startIndex + 1);
  }
  
  // Update chunk count in all chunks
  chunks.forEach(chunk => {
    chunk.metadata.chunkCount = chunks.length;
  });
  
  logger.info('Text chunking completed', {
    documentId: metadata.documentId,
    originalLength: normalizedText.length,
    chunkCount: chunks.length,
    avgChunkSize: Math.round(chunks.reduce((sum, chunk) => sum + chunk.text.length, 0) / chunks.length)
  });
  
  return chunks;
}

/**
 * Generate unique chunk ID
 */
function generateChunkId(documentId, chunkIndex) {
  return `${documentId}_chunk_${chunkIndex.toString().padStart(4, '0')}`;
}

/**
 * Extract metadata from document
 */
function extractDocumentMetadata(file, documentRecord) {
  const metadata = {
    documentId: documentRecord.id,
    title: documentRecord.title,
    description: documentRecord.description,
    category: documentRecord.category,
    tags: documentRecord.tags,
    fileName: file.name,
    fileType: file.type,
    fileSize: documentRecord.file_size,
    uploadDate: documentRecord.created_at,
    isPrivate: documentRecord.is_private,
    userId: documentRecord.user_id
  };
  
  // Add file-type specific metadata
  switch (file.type) {
    case 'application/pdf':
      metadata.documentType = 'pdf';
      metadata.extractionMethod = 'pdf-parser';
      break;
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      metadata.documentType = 'word';
      metadata.extractionMethod = 'word-parser';
      break;
    case 'text/plain':
      metadata.documentType = 'text';
      metadata.extractionMethod = 'direct';
      break;
    case 'text/csv':
      metadata.documentType = 'csv';
      metadata.extractionMethod = 'direct';
      break;
    default:
      if (file.type.startsWith('image/')) {
        metadata.documentType = 'image';
        metadata.extractionMethod = 'ocr';
      } else {
        metadata.documentType = 'unknown';
        metadata.extractionMethod = 'unknown';
      }
  }
  
  return metadata;
}

/**
 * Main document processing function
 * @param {Object} file - Original file object
 * @param {Object} documentRecord - Database record for the document
 * @param {string} storagePath - Path to file in storage
 * @returns {Promise<Object>} - Processing results
 */
async function processDocument(file, documentRecord, storagePath) {
  const startTime = Date.now();
  
  logger.info('Starting document processing', {
    documentId: documentRecord.id,
    fileName: file.name,
    fileType: file.type,
    fileSize: documentRecord.file_size
  });
  
  try {
    // Step 1: Extract text content
    const textContent = await extractTextContent(file, storagePath);
    
    // Step 2: Extract metadata
    const metadata = extractDocumentMetadata(file, documentRecord);
    
    // Step 3: Create text chunks
    const chunks = chunkTextContent(textContent, metadata);
    
    // Step 4: Prepare processing results
    const results = {
      documentId: documentRecord.id,
      textContent,
      chunks,
      metadata,
      processing: {
        status: 'completed',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
        textLength: textContent.length,
        chunkCount: chunks.length
      }
    };
    
    logger.info('Document processing completed successfully', {
      documentId: documentRecord.id,
      duration: results.processing.duration,
      textLength: results.processing.textLength,
      chunkCount: results.processing.chunkCount
    });
    
    return results;
    
  } catch (error) {
    logger.error('Document processing failed', {
      documentId: documentRecord.id,
      error: error.message,
      duration: Date.now() - startTime
    });
    
    throw new Error(`Document processing failed: ${error.message}`);
  }
}

/**
 * Check if file type is supported for processing
 */
function isProcessingSupported(fileType) {
  return PROCESSING_CONFIG.supportedTypes.hasOwnProperty(fileType);
}

/**
 * Get processing priority for file type
 */
function getProcessingPriority(fileType) {
  const config = PROCESSING_CONFIG.supportedTypes[fileType];
  return config ? config.priority : 'low';
}

module.exports = {
  processDocument,
  extractTextContent,
  chunkTextContent,
  extractDocumentMetadata,
  isProcessingSupported,
  getProcessingPriority,
  PROCESSING_CONFIG
}; 