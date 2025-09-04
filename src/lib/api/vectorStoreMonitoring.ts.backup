/**
 * Vector Store File Processing Status Monitoring
 * 
 * Monitors OpenAI Vector Store file processing status and updates database records accordingly
 */

import { supabase } from '../supabase';
import { safeAsync, ErrorSeverity } from '../utils/errorHandling';

export interface VectorStoreFileStatus {
  id: string;
  status: 'in_progress' | 'completed' | 'cancelled' | 'failed';
  usage_bytes?: number;
  created_at: number;
  last_error?: {
    code: string;
    message: string;
  };
}

export interface FileStatusMonitoringResult {
  documentId: string;
  openaiFileId: string;
  actualStatus: string;
  shouldUpdate: boolean;
  errorDetails?: string;
}

/**
 * Check actual OpenAI Vector Store file status
 */
export async function checkVectorStoreFileStatus(
  vectorStoreId: string,
  openaiFileId: string
): Promise<VectorStoreFileStatus | null> {
  const [result, error] = await safeAsync(async () => {
    const response = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/files/${openaiFileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      status: data.status,
      usage_bytes: data.usage_bytes,
      created_at: data.created_at,
      last_error: data.last_error
    };
  }, {
    context: `checking vector store file status for ${openaiFileId}`,
    severity: ErrorSeverity.MEDIUM,
    showToast: false
  });

  if (error) {

    return null;
  }

  return result;
}

/**
 * Monitor and sync all user documents with OpenAI Vector Store status
 */
export async function monitorUserDocumentStatus(userId: string): Promise<FileStatusMonitoringResult[]> {

  // Get all user documents that might need status updates
  const { data: documents, error: fetchError } = await supabase
    .from('user_documents')
    .select(`
      id,
      openai_file_id,
      openai_vector_store_file_id,
      title,
      upload_status,
      processing_status,
      file_size,
      created_at,
      user_vector_stores!inner (
        openai_vector_store_id
      )
    `)
    .eq('user_id', userId)
    .in('upload_status', ['completed'])
    .in('processing_status', ['completed', 'processing', 'pending']);

  if (fetchError) {

    return [];
  }

  if (!documents || documents.length === 0) {

    return [];
  }

  const results: FileStatusMonitoringResult[] = [];

  for (const doc of documents) {
    if (!doc.openai_file_id || !doc.user_vector_stores?.openai_vector_store_id) {
      continue;
    }

    console.log(`🔍 Checking status for: "${doc.title}" (${Math.round((doc.file_size || 0) / 1024 / 1024)}MB)`);

    // Check actual OpenAI status
    const actualStatus = await checkVectorStoreFileStatus(
      doc.user_vector_stores.openai_vector_store_id,
      doc.openai_file_id
    );

    if (!actualStatus) {

      continue;
    }

    // Determine if we need to update our database
    const shouldUpdate = 
      (actualStatus.status === 'failed' && doc.processing_status !== 'failed') ||
      (actualStatus.status === 'completed' && doc.processing_status !== 'completed') ||
      (actualStatus.status === 'in_progress' && doc.processing_status === 'completed');

    const result: FileStatusMonitoringResult = {
      documentId: doc.id,
      openaiFileId: doc.openai_file_id,
      actualStatus: actualStatus.status,
      shouldUpdate,
      errorDetails: actualStatus.last_error ? 
        `${actualStatus.last_error.code}: ${actualStatus.last_error.message}` : 
        undefined
    };

    results.push(result);

    // Update database if needed
    if (shouldUpdate) {

      const updateData: any = {
        processing_status: actualStatus.status,
        updated_at: new Date().toISOString()
      };

      if (actualStatus.last_error) {
        updateData.error_message = `${actualStatus.last_error.code}: ${actualStatus.last_error.message}`;
      }

      if (actualStatus.usage_bytes) {
        updateData.processing_metadata = {
          openai_usage_bytes: actualStatus.usage_bytes,
          last_status_check: new Date().toISOString()
        };
      }

      const { error: updateError } = await supabase
        .from('user_documents')
        .update(updateData)
        .eq('id', doc.id);

      if (updateError) {

      } else {

      }
    } else {

    }
  }

  console.log(`📊 Monitoring complete. Updated ${results.filter(r => r.shouldUpdate).length} documents`);
  return results;
}

/**
 * Monitor specific document status
 */
export async function monitorSingleDocumentStatus(documentId: string): Promise<FileStatusMonitoringResult | null> {

  const { data: doc, error: fetchError } = await supabase
    .from('user_documents')
    .select(`
      id,
      openai_file_id,
      title,
      upload_status,
      processing_status,
      user_id,
      user_vector_stores!inner (
        openai_vector_store_id
      )
    `)
    .eq('id', documentId)
    .single();

  if (fetchError || !doc) {

    return null;
  }

  if (!doc.openai_file_id || !doc.user_vector_stores?.openai_vector_store_id) {

    return null;
  }

  const actualStatus = await checkVectorStoreFileStatus(
    doc.user_vector_stores.openai_vector_store_id,
    doc.openai_file_id
  );

  if (!actualStatus) {
    return null;
  }

  const shouldUpdate = 
    (actualStatus.status === 'failed' && doc.processing_status !== 'failed') ||
    (actualStatus.status === 'completed' && doc.processing_status !== 'completed');

  const result: FileStatusMonitoringResult = {
    documentId: doc.id,
    openaiFileId: doc.openai_file_id,
    actualStatus: actualStatus.status,
    shouldUpdate,
    errorDetails: actualStatus.last_error ? 
      `${actualStatus.last_error.code}: ${actualStatus.last_error.message}` : 
      undefined
  };

  if (shouldUpdate) {

    const updateData: any = {
      processing_status: actualStatus.status,
      updated_at: new Date().toISOString()
    };

    if (actualStatus.last_error) {
      updateData.error_message = `${actualStatus.last_error.code}: ${actualStatus.last_error.message}`;
    }

    const { error: updateError } = await supabase
      .from('user_documents')
      .update(updateData)
      .eq('id', documentId);

    if (updateError) {

    } else {

    }
  }

  return result;
}

/**
 * Batch status monitoring for recently uploaded documents
 */
export async function monitorRecentUploads(userId: string, hoursBack: number = 24): Promise<void> {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

  const { data: recentDocs, error } = await supabase
    .from('user_documents')
    .select('id, title, created_at, file_size')
    .eq('user_id', userId)
    .gte('created_at', cutoffTime.toISOString())
    .in('upload_status', ['completed'])
    .order('created_at', { ascending: false });

  if (error || !recentDocs?.length) {

    return;
  }

  for (const doc of recentDocs) {
    await monitorSingleDocumentStatus(doc.id);
    
    // Add delay between checks to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}