import { Attachment, FlowiseUpload, FlowiseUploadType } from '../types/chat';

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