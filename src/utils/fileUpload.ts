import { Attachment, FlowiseUpload, FlowiseUploadType } from '../types/chat';

// File size constants for medical image processing
export const FILE_SIZE_LIMITS = {
  IMAGE_MAX_SIZE_MB: 5, // Maximum image size for medical transcription
  COMPRESSION_THRESHOLD_MB: 2, // Images larger than this will be compressed
  MAX_MEMORY_SAFE_SIZE_MB: 10 // Maximum size for safe memory processing
} as const;

/**
 * Compress an image file to reduce memory usage and improve upload performance
 */
export const compressImageForMedicalUse = (file: File, maxSizeKB: number = 500): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context for image compression'));
          return;
        }

        // Calculate optimal dimensions while maintaining medical image quality
        let { width, height } = img;
        const maxDimension = 1920; // Higher resolution for medical images
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Use high-quality settings for medical images
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Progressive quality reduction for optimal file size
        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const sizeKB = blob.size / 1024;
              
              if (sizeKB <= maxSizeKB || quality <= 0.3) {
                // Maintain minimum quality for medical images
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                // Try lower quality
                tryCompress(quality - 0.1);
              }
            },
            file.type,
            quality
          );
        };
        
        // Start with high quality for medical images
        tryCompress(0.9);
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file for compression'));
    reader.readAsDataURL(file);
  });
};

/**
 * Optimized conversion from base64 data URL to File object with memory management
 */
export const convertBase64ToFile = (base64Data: string, fileName: string, mimeType: string): File => {
  try {
    // Extract base64 string from data URL
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    
    // For large files, use more memory-efficient approach
    const byteLength = (base64String.length * 3) / 4;
    const isLargeFile = byteLength > FILE_SIZE_LIMITS.COMPRESSION_THRESHOLD_MB * 1024 * 1024;
    
    if (isLargeFile) {
      // Use chunked processing for large files to prevent memory issues
      return convertBase64ToFileChunked(base64String, fileName, mimeType);
    } else {
      // Use standard approach for smaller files
      return convertBase64ToFileStandard(base64String, fileName, mimeType);
    }
  } catch (error) {
    throw new Error(`Failed to convert base64 to file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Standard base64 to File conversion for smaller files
 */
const convertBase64ToFileStandard = (base64String: string, fileName: string, mimeType: string): File => {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  
  return new File([blob], fileName, { type: mimeType });
};

/**
 * Chunked base64 to File conversion for large files to prevent memory issues
 */
const convertBase64ToFileChunked = (base64String: string, fileName: string, mimeType: string): File => {
  try {
    // For very large files, use a streaming approach
    const byteCharacters = atob(base64String);
    const chunkSize = 8192; // Process in 8KB chunks
    const chunks: Uint8Array[] = [];
    
    // Process the decoded bytes in chunks to prevent memory overflow
    for (let i = 0; i < byteCharacters.length; i += chunkSize) {
      const chunkEnd = Math.min(i + chunkSize, byteCharacters.length);
      const chunk = byteCharacters.slice(i, chunkEnd);
      const byteArray = new Uint8Array(chunk.length);
      
      for (let j = 0; j < chunk.length; j++) {
        byteArray[j] = chunk.charCodeAt(j);
      }
      
      chunks.push(byteArray);
    }
    
    // Combine chunks into final blob
    const blob = new Blob(chunks, { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    throw new Error(`Chunked conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Convert a File object to base64 data URL format with memory optimization
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
 * Determine the appropriate Flowise upload type based on file type and use case
 */
export const getFlowiseUploadType = (file: File, preferredType?: FlowiseUploadType): FlowiseUploadType => {
  // If a preferred type is specified, use it
  if (preferredType) {
    return preferredType;
  }
  
  const mimeType = file.type.toLowerCase();
  
  // Images - use 'file' type for vision model analysis
  if (mimeType.startsWith('image/')) {
    return 'file';
  }
  
  // Documents - use 'file:full' to send full content to LLM without affecting vector store
  // This prevents contamination of the curated medical knowledge base
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('word') ||
    mimeType.includes('text') ||
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown'
  ) {
    return 'file:full';
  }
  
  // Audio files
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  
  // Default to 'file' for other types
  return 'file';
};

/**
 * Convert an array of Attachment objects to Flowise upload format
 */
export const convertAttachmentsToUploads = (attachments: Attachment[]): FlowiseUpload[] => {
  return attachments
    .filter(attachment => attachment.base64Data) // Only include attachments with base64 data
    .map(attachment => ({
      data: attachment.base64Data!,
      type: attachment.uploadType || 'file',
      name: attachment.name,
      mime: attachment.type
    }));
};

/**
 * Process a File object and create an Attachment with base64 data
 */
export const processFileForUpload = async (
  file: File, 
  preferredUploadType?: FlowiseUploadType
): Promise<Attachment> => {
  try {
    // Convert file to base64
    const base64Data = await convertFileToBase64(file);
    
    // Determine upload type
    const uploadType = getFlowiseUploadType(file, preferredUploadType);
    
    // Create attachment object
    const attachment: Attachment = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      base64Data,
      uploadType,
      preview: file.type.startsWith('image/') ? base64Data : undefined
    };
    
    return attachment;
  } catch (error) {
    throw new Error(`Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate file specifically for medical transcription upload
 */
export const validateFileForMedicalTranscription = (file: File): { isValid: boolean; error?: string; needsCompression?: boolean } => {
  const fileSizeMB = file.size / (1024 * 1024);
  
  // Check maximum file size
  if (fileSizeMB > FILE_SIZE_LIMITS.IMAGE_MAX_SIZE_MB) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large (${fileSizeMB.toFixed(1)}MB). Maximum size for medical images is ${FILE_SIZE_LIMITS.IMAGE_MAX_SIZE_MB}MB.`
    };
  }
  
  // Check if compression is needed
  const needsCompression = file.type.startsWith('image/') && fileSizeMB > FILE_SIZE_LIMITS.COMPRESSION_THRESHOLD_MB;
  
  // Check file type support for medical transcription
  const supportedTypes = [
    'image/', // Medical images, ECGs, reports
    'application/pdf', // Medical documents
    'text/', // Text files
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const isSupported = supportedTypes.some(type => file.type.startsWith(type));
  
  if (!isSupported) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not supported for medical transcription.`
    };
  }
  
  return { 
    isValid: true, 
    needsCompression 
  };
};

/**
 * Validate file for Flowise upload requirements
 */
export const validateFileForFlowise = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (Flowise typically handles up to 10MB well)
  const maxSizeMB = 10;
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (fileSizeMB > maxSizeMB) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB for AI processing.`
    };
  }
  
  // Check file type support
  const supportedTypes = [
    'image/', // All image types
    'application/pdf',
    'text/',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/'
  ];
  
  const isSupported = supportedTypes.some(type => file.type.startsWith(type));
  
  if (!isSupported) {
    return {
      isValid: false,
      error: `File type "${file.type}" is not supported for AI analysis.`
    };
  }
  
  return { isValid: true };
};

/**
 * Get user-friendly description of upload type
 */
export const getUploadTypeDescription = (uploadType: FlowiseUploadType): string => {
  switch (uploadType) {
    case 'file':
      return 'Image analysis';
    case 'file:rag':
      return 'Add to knowledge base';
    case 'file:full':
      return 'Full document analysis';
    case 'audio':
      return 'Speech-to-text';
    case 'url':
      return 'URL content';
    default:
      return 'File processing';
  }
}; 