/**
 * Document Helper Utilities
 *
 * Utility functions for document formatting, status colors, and metadata processing.
 */

import { UserDocument } from '../../../types/openai-vector-store';
import { DocumentWithMetadata } from '../../../lib/api/knowledgeBase';

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get status color based on upload status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'green';
    case 'failed': return 'red';
    case 'uploading':
    case 'pending': return 'yellow';
    default: return 'gray';
  }
};

/**
 * Convert UserDocument to DocumentWithMetadata for legacy compatibility
 */
export const convertUserDocumentToLegacy = (doc: UserDocument): DocumentWithMetadata => {
  const uploadDate = new Date(doc.created_at);
  const size = doc.file_size || 0;

  return {
    id: doc.id,
    file_name: doc.file_name,
    title: doc.title,
    description: doc.description || '',
    file_type: doc.file_type,
    file_size: size,
    category: doc.category || 'other',
    tags: doc.tags || [],
    upload_status: doc.upload_status,
    processing_status: doc.processing_status,
    error_message: doc.error_message || null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    is_private: doc.is_private,
    user_id: doc.user_id,
    vector_store_id: doc.vector_store_id,
    openai_file_id: doc.openai_file_id,
    storage_path: '',
    formattedSize: formatFileSize(size),
    formattedDate: uploadDate.toLocaleDateString(),
    statusColor: getStatusColor(doc.upload_status),
    canDelete: true,
    canEdit: doc.upload_status === 'completed'
  };
};

/**
 * Extract clean base title from chunked document title
 * Removes chunk suffixes like " - Part X/Y" or " - Pages X-Y (Z/Total)"
 */
export const extractCleanBaseTitle = (title: string): string => {
  let cleanTitle = title;

  // Remove binary chunk suffix: " - Part X/Y"
  cleanTitle = cleanTitle.replace(/ - Part \d+\/\d+$/, '');

  // Remove PDF page chunk suffix: " - Pages X-Y (Z/Total)"
  cleanTitle = cleanTitle.replace(/ - Pages \d+-\d+ \(\d+\/\d+\)$/, '');

  // Remove any trailing ellipsis
  cleanTitle = cleanTitle.replace(/\.\.\.$/, '');

  // Trim whitespace
  cleanTitle = cleanTitle.trim();

  return cleanTitle;
};

/**
 * Get file icon configuration based on file type
 */
export const getFileIconConfig = (fileType: string) => {
  const normalizedType = fileType.toLowerCase();

  if (normalizedType.includes('pdf')) {
    return {
      iconType: 'pdf',
      color: 'from-[#1a365d] to-[#2b6cb0]',
      solid: 'text-[#1a365d]'
    };
  } else if (normalizedType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(normalizedType)) {
    return {
      iconType: 'image',
      color: 'from-purple-500 to-pink-500',
      solid: 'text-purple-500'
    };
  } else if (normalizedType.includes('excel') || normalizedType.includes('csv') || normalizedType.includes('spreadsheet')) {
    return {
      iconType: 'spreadsheet',
      color: 'from-green-500 to-emerald-500',
      solid: 'text-green-500'
    };
  } else if (normalizedType.includes('word') || normalizedType.includes('doc')) {
    return {
      iconType: 'word',
      color: 'from-[#2b6cb0] to-[#63b3ed]',
      solid: 'text-[#2b6cb0]'
    };
  } else {
    return {
      iconType: 'file',
      color: 'from-gray-500 to-gray-600',
      solid: 'text-gray-500'
    };
  }
};
