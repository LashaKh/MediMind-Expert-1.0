import { supabase } from '../supabase';
import { Tables, TablesInsert, TablesUpdate } from '../../types/supabase';

// Type definitions for knowledge base documents
export type KnowledgeBaseDocument = Tables<'knowledge_base_documents'>;
export type DocumentInsert = TablesInsert<'knowledge_base_documents'>;
export type DocumentUpdate = TablesUpdate<'knowledge_base_documents'>;

// Document categories for filtering
export const DOCUMENT_CATEGORIES = [
  'research-papers',
  'clinical-guidelines',
  'case-studies',
  'medical-images',
  'lab-results',
  'patient-education',
  'protocols',
  'reference-materials',
  'personal-notes',
  'other'
] as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

// Document status types
export type UploadStatus = 'pending' | 'uploaded' | 'failed';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Query options for listing documents
export interface DocumentQueryOptions {
  category?: DocumentCategory;
  tags?: string[];
  status?: ProcessingStatus;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'file_size';
  sortOrder?: 'asc' | 'desc';
}

// Document with computed fields for UI
export interface DocumentWithMetadata extends KnowledgeBaseDocument {
  formattedSize: string;
  formattedDate: string;
  statusColor: string;
  canDelete: boolean;
  canEdit: boolean;
}

/**
 * Create a new document record in the database
 */
export async function createDocument(document: DocumentInsert): Promise<KnowledgeBaseDocument> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .insert([document])
      .select()
      .single();

    if (error) {

      throw new Error(`Failed to create document: ${error.message}`);
    }

    return data;
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error creating document');
  }
}

/**
 * Get a single document by ID
 */
export async function getDocument(documentId: string): Promise<KnowledgeBaseDocument> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {

      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    return data;
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error fetching document');
  }
}

/**
 * List documents with filtering and pagination
 */
export async function listDocuments(options: DocumentQueryOptions = {}): Promise<{
  documents: DocumentWithMetadata[];
  total: number;
  hasMore: boolean;
}> {
  try {
    const {
      category,
      tags,
      status,
      searchTerm,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    let query = supabase
      .from('knowledge_base_documents')
      .select('*', { count: 'exact' });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('processing_status', status);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {

      throw new Error(`Failed to list documents: ${error.message}`);
    }

    // Transform documents with computed fields
    const documentsWithMetadata: DocumentWithMetadata[] = (data || []).map(doc => ({
      ...doc,
      formattedSize: formatFileSize(doc.file_size),
      formattedDate: formatDate(doc.created_at),
      statusColor: getStatusColor(doc.processing_status),
      canDelete: doc.processing_status !== 'processing',
      canEdit: ['completed', 'failed'].includes(doc.processing_status)
    }));

    return {
      documents: documentsWithMetadata,
      total: count || 0,
      hasMore: offset + limit < (count || 0)
    };
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error listing documents');
  }
}

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: string, 
  updates: DocumentUpdate
): Promise<KnowledgeBaseDocument> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {

      throw new Error(`Failed to update document: ${error.message}`);
    }

    return data;
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error updating document');
  }
}

/**
 * Delete a document and its associated files
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    // First get the document to find the storage path
    const document = await getDocument(documentId);

    // Delete from storage if file exists
    if (document.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('user-uploads')
        .remove([document.storage_path]);

      if (storageError) {

        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('knowledge_base_documents')
      .delete()
      .eq('id', documentId);

    if (error) {

      throw new Error(`Failed to delete document: ${error.message}`);
    }
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error deleting document');
  }
}

/**
 * Update document processing status
 */
export async function updateDocumentStatus(
  documentId: string,
  processingStatus: ProcessingStatus,
  errorMessage?: string
): Promise<KnowledgeBaseDocument> {
  try {
    const updates: DocumentUpdate = {
      processing_status: processingStatus,
      updated_at: new Date().toISOString()
    };

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    return await updateDocument(documentId, updates);
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error updating document status');
  }
}

/**
 * Get documents by category
 */
export async function getDocumentsByCategory(
  category: DocumentCategory,
  limit = 10
): Promise<DocumentWithMetadata[]> {
  const result = await listDocuments({
    category,
    limit,
    sortBy: 'updated_at',
    sortOrder: 'desc'
  });
  
  return result.documents;
}

/**
 * Search documents by text
 */
export async function searchDocuments(
  searchTerm: string,
  options: Omit<DocumentQueryOptions, 'searchTerm'> = {}
): Promise<DocumentWithMetadata[]> {
  const result = await listDocuments({
    ...options,
    searchTerm
  });
  
  return result.documents;
}

/**
 * Get document statistics for dashboard
 */
export async function getDocumentStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  recentCount: number;
}> {
  try {
    // Get total count
    const { count: total } = await supabase
      .from('knowledge_base_documents')
      .select('*', { count: 'exact', head: true });

    // Get count by category
    const { data: categoryData } = await supabase
      .from('knowledge_base_documents')
      .select('category');

    // Get count by status
    const { data: statusData } = await supabase
      .from('knowledge_base_documents')
      .select('processing_status');

    // Get recent documents (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentCount } = await supabase
      .from('knowledge_base_documents')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Count by category
    const byCategory: Record<string, number> = {};
    categoryData?.forEach(doc => {
      byCategory[doc.category] = (byCategory[doc.category] || 0) + 1;
    });

    // Count by status
    const byStatus: Record<string, number> = {};
    statusData?.forEach(doc => {
      byStatus[doc.processing_status] = (byStatus[doc.processing_status] || 0) + 1;
    });

    return {
      total: total || 0,
      byCategory,
      byStatus,
      recentCount: recentCount || 0
    };
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error getting document statistics');
  }
}

/**
 * Bulk update documents
 */
export async function bulkUpdateDocuments(
  documentIds: string[],
  updates: DocumentUpdate
): Promise<KnowledgeBaseDocument[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base_documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', documentIds)
      .select();

    if (error) {

      throw new Error(`Failed to bulk update documents: ${error.message}`);
    }

    return data || [];
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error bulk updating documents');
  }
}

/**
 * Bulk delete documents
 */
export async function bulkDeleteDocuments(documentIds: string[]): Promise<void> {
  try {
    // Get documents to find storage paths
    const { data: documents } = await supabase
      .from('knowledge_base_documents')
      .select('storage_path')
      .in('id', documentIds);

    // Delete files from storage
    if (documents && documents.length > 0) {
      const storagePaths = documents
        .map(doc => doc.storage_path)
        .filter(Boolean);

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('user-uploads')
          .remove(storagePaths);

        if (storageError) {

          // Continue with database deletion
        }
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('knowledge_base_documents')
      .delete()
      .in('id', documentIds);

    if (error) {

      throw new Error(`Failed to bulk delete documents: ${error.message}`);
    }
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error bulk deleting documents');
  }
}

/**
 * Download a document from storage
 */
export async function downloadDocument(documentData: DocumentWithMetadata): Promise<void> {
  try {
    if (!documentData.storage_path) {
      throw new Error('Document storage path not found');
    }

    // Get the file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-uploads')
      .download(documentData.storage_path);

    if (error) {

      throw new Error(`Failed to download document: ${error.message}`);
    }

    if (!data) {
      throw new Error('No file data received');
    }

    // Create a blob URL and trigger download
    const blob = new Blob([data], { type: data.type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = documentData.file_name || 'document';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {

    throw error instanceof Error ? error : new Error('Unknown error downloading document');
  }
}

// Utility functions

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100';
    case 'processing': return 'text-yellow-600 bg-yellow-100';
    case 'failed': return 'text-red-600 bg-red-100';
    case 'pending': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
} 