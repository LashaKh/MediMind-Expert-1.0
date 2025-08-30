/**
 * File Chunking Utilities for Large File Uploads
 * 
 * This module handles splitting large files into smaller chunks for upload.
 * For PDFs, uses page-based chunking to create valid PDF files.
 * For other files, uses binary chunking.
 */

import { shouldUsePageBasedChunking, splitPDFIntoPageChunks, PDFPageChunk } from './pdfPageChunking';

export interface FileChunk {
  chunkIndex: number;
  totalChunks: number;
  chunkData: Blob;
  chunkSize: number;
  originalFileName: string;
  originalFileSize: number;
  chunkId: string;
  isLastChunk: boolean;
}

export interface ChunkUploadProgress {
  chunkIndex: number;
  totalChunks: number;
  uploadedChunks: number;
  overallProgress: number;
  currentChunkProgress: number;
  bytesUploaded: number;
  totalBytes: number;
}

// 25MB chunk size - balanced for performance and reliability
const CHUNK_SIZE = 25 * 1024 * 1024; // 25MB - Balanced chunk size

/**
 * Split a file into chunks for upload - routes to appropriate chunking method
 */
export async function splitFileIntoChunks(file: File): Promise<FileChunk[] | PDFPageChunk[]> {
  if (shouldUsePageBasedChunking(file)) {

    return await splitPDFIntoPageChunks(file);
  } else {

    return splitFileIntoBinaryChunks(file);
  }
}

/**
 * Split a file into binary chunks for upload (legacy method for non-PDFs)
 */
export function splitFileIntoBinaryChunks(file: File): FileChunk[] {
  const chunks: FileChunk[] = [];
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunkData = file.slice(start, end);
    
    chunks.push({
      chunkIndex: i,
      totalChunks,
      chunkData,
      chunkSize: chunkData.size,
      originalFileName: file.name,
      originalFileSize: file.size,
      chunkId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-chunk-${i}`,
      isLastChunk: i === totalChunks - 1
    });
  }
  
  return chunks;
}

/**
 * Check if file needs chunking (over 25MB to be safe)
 */
export function shouldChunkFile(file: File): boolean {
  const CHUNKING_THRESHOLD = 25 * 1024 * 1024; // 25MB threshold - matches chunk size
  return file.size > CHUNKING_THRESHOLD;
}

/**
 * Calculate upload progress across all chunks
 */
export function calculateChunkProgress(
  uploadedChunks: number,
  totalChunks: number,
  currentChunkProgress: number,
  totalFileSize: number
): ChunkUploadProgress {
  // Calculate bytes uploaded (completed chunks + current chunk progress)
  const completedChunkBytes = uploadedChunks * CHUNK_SIZE;
  const currentChunkBytes = Math.min(
    currentChunkProgress * CHUNK_SIZE,
    totalFileSize - completedChunkBytes
  );
  const bytesUploaded = completedChunkBytes + currentChunkBytes;
  
  // Overall progress as percentage
  const overallProgress = Math.min((bytesUploaded / totalFileSize) * 100, 100);
  
  return {
    chunkIndex: uploadedChunks,
    totalChunks,
    uploadedChunks,
    overallProgress,
    currentChunkProgress: currentChunkProgress * 100,
    bytesUploaded,
    totalBytes: totalFileSize
  };
}

/**
 * Generate chunk file path for storage
 */
export function generateChunkPath(
  userId: string,
  sessionId: string,
  chunk: FileChunk
): string {
  // Store chunks in organized temporary folders
  // Format: temp-chunks/chunks-YYYY-MM-DD/{userIdPrefix}/{sessionId}/{chunkId}
  const today = new Date().toISOString().split('T')[0];
  const userPrefix = userId.substring(0, 8); // First 8 chars for organization
  return `temp-chunks/chunks-${today}/${userPrefix}/${sessionId}/${chunk.chunkId}`;
}

/**
 * Generate metadata for chunk tracking
 */
export interface ChunkMetadata {
  sessionId: string;
  originalFileName: string;
  originalFileSize: number;
  originalFileType: string;
  totalChunks: number;
  uploadedChunks: string[]; // Array of chunk IDs
  status: 'uploading' | 'ready' | 'processing' | 'error';
  createdAt: string;
}

export function createChunkMetadata(
  file: File,
  totalChunks: number,
  sessionId: string
): ChunkMetadata {
  return {
    sessionId,
    originalFileName: file.name,
    originalFileSize: file.size,
    originalFileType: file.type,
    totalChunks,
    uploadedChunks: [],
    status: 'uploading',
    createdAt: new Date().toISOString()
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Estimate upload time based on file size and connection speed
 */
export function estimateUploadTime(fileSize: number, connectionSpeedMbps: number = 5): string {
  const fileSizeMb = fileSize / (1024 * 1024);
  const uploadTimeSeconds = fileSizeMb / connectionSpeedMbps;
  
  if (uploadTimeSeconds < 60) {
    return `${Math.ceil(uploadTimeSeconds)} seconds`;
  } else if (uploadTimeSeconds < 3600) {
    return `${Math.ceil(uploadTimeSeconds / 60)} minutes`;
  } else {
    return `${Math.ceil(uploadTimeSeconds / 3600)} hours`;
  }
}