/**
 * PDF Page-Based Chunking Utilities for OpenAI Vector Store
 * 
 * Creates individual, parseable PDF files from page ranges instead of binary chunks.
 * This ensures each chunk is a valid PDF that OpenAI can process.
 */

import { PDFDocument } from 'pdf-lib';

export interface PDFPageChunk {
  chunkIndex: number;
  totalChunks: number;
  startPage: number;
  endPage: number;
  pdfBytes: Uint8Array;
  originalFileName: string;
  originalPageCount: number;
  chunkId: string;
  isLastChunk: boolean;
}

export interface PDFChunkUploadProgress {
  chunkIndex: number;
  totalChunks: number;
  uploadedChunks: number;
  overallProgress: number;
  currentChunkProgress: number;
  pagesProcessed: number;
  totalPages: number;
}

// Target pages per chunk - 25 pages for optimal balance with storage limits
const PAGES_PER_CHUNK = 25;

/**
 * Split a PDF file into page-based chunks
 */
export async function splitPDFIntoPageChunks(file: File): Promise<PDFPageChunk[]> {
  try {
    console.log(`🔍 Splitting PDF "${file.name}" into page-based chunks...`);
    
    // Read the PDF file
    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    
    // Load the original PDF
    const originalPdf = await PDFDocument.load(pdfBytes);
    const totalPages = originalPdf.getPageCount();
    const totalChunks = Math.ceil(totalPages / PAGES_PER_CHUNK);
    
    console.log(`📄 PDF has ${totalPages} pages, creating ${totalChunks} chunks (${PAGES_PER_CHUNK} pages per chunk)`);
    
    const chunks: PDFPageChunk[] = [];
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startPage = chunkIndex * PAGES_PER_CHUNK;
      const endPage = Math.min(startPage + PAGES_PER_CHUNK - 1, totalPages - 1);
      const pageIndices = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
      
      console.log(`📝 Creating chunk ${chunkIndex + 1}/${totalChunks}: pages ${startPage + 1}-${endPage + 1}`);
      
      // Create a new PDF document for this chunk
      const chunkPdf = await PDFDocument.create();
      
      // Copy the specified pages from the original PDF
      const pagesToCopy = await chunkPdf.copyPages(originalPdf, pageIndices);
      
      // Add all copied pages to the new document
      pagesToCopy.forEach(page => chunkPdf.addPage(page));
      
      // Set metadata for the chunk
      chunkPdf.setTitle(`${file.name} - Part ${chunkIndex + 1}/${totalChunks}`);
      chunkPdf.setSubject(`Pages ${startPage + 1}-${endPage + 1} of ${totalPages}`);
      chunkPdf.setCreator('MediMind Expert PDF Chunker');
      chunkPdf.setProducer('pdf-lib');
      
      // Save the chunk as bytes
      const chunkBytes = await chunkPdf.save();
      
      chunks.push({
        chunkIndex,
        totalChunks,
        startPage: startPage + 1, // 1-based page numbers for display
        endPage: endPage + 1,     // 1-based page numbers for display
        pdfBytes: chunkBytes,
        originalFileName: file.name,
        originalPageCount: totalPages,
        chunkId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-chunk-${chunkIndex}`,
        isLastChunk: chunkIndex === totalChunks - 1
      });
      
      console.log(`✅ Created chunk ${chunkIndex + 1}: ${Math.round(chunkBytes.length / 1024)}KB`);
    }
    
    console.log(`🎉 Successfully split PDF into ${chunks.length} page-based chunks`);
    return chunks;
    
  } catch (error) {
    console.error('❌ Error splitting PDF into page chunks:', error);
    throw new Error(`Failed to split PDF: ${error.message}`);
  }
}

/**
 * Check if file is a PDF and should use page-based chunking
 */
export function shouldUsePageBasedChunking(file: File): boolean {
  return file.type === 'application/pdf' && file.size > 25 * 1024 * 1024; // 25MB threshold
}

/**
 * Check if file needs any kind of chunking
 */
export function shouldChunkFile(file: File): boolean {
  return file.size > 25 * 1024 * 1024; // 25MB threshold
}

/**
 * Calculate upload progress across all PDF chunks
 */
export function calculatePDFChunkProgress(
  uploadedChunks: number,
  totalChunks: number,
  currentChunkProgress: number,
  totalPages: number
): PDFChunkUploadProgress {
  // Calculate pages processed
  const pagesPerChunk = Math.ceil(totalPages / totalChunks);
  const completedPages = uploadedChunks * pagesPerChunk;
  const currentChunkPages = Math.min(currentChunkProgress * pagesPerChunk, totalPages - completedPages);
  const pagesProcessed = completedPages + currentChunkPages;
  
  // Overall progress as percentage
  const overallProgress = Math.min((pagesProcessed / totalPages) * 100, 100);
  
  return {
    chunkIndex: uploadedChunks,
    totalChunks,
    uploadedChunks,
    overallProgress,
    currentChunkProgress: currentChunkProgress * 100,
    pagesProcessed: Math.floor(pagesProcessed),
    totalPages
  };
}

/**
 * Generate chunk file path for storage
 */
export function generatePDFChunkPath(
  userId: string,
  sessionId: string,
  chunk: PDFPageChunk
): string {
  // Store chunks in organized folders by date and user
  const today = new Date().toISOString().split('T')[0];
  const userPrefix = userId.substring(0, 8);
  return `pdf-chunks/chunks-${today}/${userPrefix}/${sessionId}/${chunk.chunkId}`;
}

/**
 * Generate chunk metadata for tracking
 */
export interface PDFChunkMetadata {
  sessionId: string;
  originalFileName: string;
  originalPageCount: number;
  totalChunks: number;
  pagesPerChunk: number;
  uploadedChunks: string[];
  status: 'uploading' | 'ready' | 'processing' | 'error';
  createdAt: string;
}

export function createPDFChunkMetadata(
  file: File,
  totalPages: number,
  totalChunks: number,
  sessionId: string
): PDFChunkMetadata {
  return {
    sessionId,
    originalFileName: file.name,
    originalPageCount: totalPages,
    totalChunks,
    pagesPerChunk: PAGES_PER_CHUNK,
    uploadedChunks: [],
    status: 'uploading',
    createdAt: new Date().toISOString()
  };
}

/**
 * Format page range for display
 */
export function formatPageRange(startPage: number, endPage: number): string {
  if (startPage === endPage) {
    return `Page ${startPage}`;
  }
  return `Pages ${startPage}-${endPage}`;
}

/**
 * Estimate chunk file size based on original PDF and page count
 */
export function estimateChunkSize(originalFileSize: number, originalPageCount: number, chunkPageCount: number): string {
  const estimatedBytes = (originalFileSize / originalPageCount) * chunkPageCount;
  
  if (estimatedBytes < 1024 * 1024) {
    return `~${Math.round(estimatedBytes / 1024)}KB`;
  } else {
    return `~${Math.round(estimatedBytes / (1024 * 1024))}MB`;
  }
}