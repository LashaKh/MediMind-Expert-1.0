// Simple podcast document upload - no Netlify functions needed
import { supabase } from '../supabase';

interface PodcastUploadRequest {
  file: File;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
}

interface PodcastUploadResponse {
  documentId: string;
  publicUrl: string;
  message: string;
}

// Supported file types for podcasts
const SUPPORTED_FILE_TYPES = {
  'application/pdf': { ext: 'pdf', maxSize: 50 * 1024 * 1024 }, // 50MB
  'application/msword': { ext: 'doc', maxSize: 25 * 1024 * 1024 }, // 25MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', maxSize: 25 * 1024 * 1024 },
  'text/plain': { ext: 'txt', maxSize: 10 * 1024 * 1024 }, // 10MB
  'text/markdown': { ext: 'md', maxSize: 10 * 1024 * 1024 },
};

export async function uploadDocumentForPodcast(
  request: PodcastUploadRequest
): Promise<PodcastUploadResponse> {
  const { file, title, description, category = 'podcast_temp', tags = [] } = request;

  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const userId = session.user.id;

    // Validate file type
    if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
      throw new Error(`Unsupported file type: ${file.type}. Supported types: ${Object.keys(SUPPORTED_FILE_TYPES).join(', ')}`);
    }

    // Validate file size
    const maxSize = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES].maxSize;
    if (file.size > maxSize) {
      throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB) for ${file.type}`);
    }

    // Generate unique document ID and file path
    const documentId = crypto.randomUUID();
    const timestamp = Date.now();
    const fileExtension = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES].ext;
    const fileName = `podcasts/${userId}/${timestamp}-${documentId}.${fileExtension}`;

    // Upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {

      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(fileName);

    // Extract text content from file for description if it's a text file
    let documentDescription = description || '';
    
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      try {
        const textContent = await file.text();
        documentDescription = textContent.substring(0, 10000); // Limit to 10KB
      } catch (error) {

      }
    }

    // If no description, create a basic one
    if (!documentDescription || documentDescription.trim().length < 50) {
      documentDescription = `MEDICAL DOCUMENT FOR PODCAST GENERATION
=======================================

Document Title: ${title.trim()}
Original Filename: ${file.name}
File Type: ${file.type}
File Size: ${Math.round(file.size / 1024)} KB
Category: ${category}
Upload Date: ${new Date().toISOString()}
Tags: ${tags.join(', ') || 'None'}

CONTENT SUMMARY:
This is a ${file.type === 'application/pdf' ? 'PDF document' : 'medical document'} uploaded for podcast generation. The document contains medical information that will be processed by MediMind Expert using ephemeral vector stores and ElevenLabs TTS to create a professional podcast.

${description?.trim() ? `User Description: ${description.trim()}` : ''}

PODCAST GENERATION NOTES:
- This document is intended for AI-powered podcast generation
- Content should be discussed with medical accuracy and professionalism
- Target audience: Healthcare professionals
- Maintain medical terminology while ensuring accessibility
- Include relevant clinical context and practical applications

This document is ready for AI-powered podcast generation with medical accuracy and professional context.`;
    }

    // Create document record in podcast_documents table with OpenAI processing status
    const { data: documentRecord, error: documentError } = await supabase
      .from('podcast_documents')
      .insert({
        id: documentId,
        user_id: userId,
        title: title.trim(),
        description: documentDescription,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        supabase_file_path: fileName,
        supabase_public_url: publicUrl,
        tags: tags,
        upload_status: 'completed',
        is_processed: false,
        openai_upload_status: 'pending', // Mark for OpenAI processing
        openai_processing_retries: 0
      })
      .select()
      .single();

    if (documentError) {
      // Clean up uploaded file
      await supabase.storage
        .from('user-uploads')
        .remove([fileName]);
      
      throw new Error(`Failed to create document record: ${documentError.message}`);
    }

    // Automatically trigger OpenAI processing
    try {
      console.log(`[Podcast] Triggering OpenAI processing for document ${documentId}`);
      
      const { data: processingResult, error: processingError } = await supabase.functions.invoke('process-podcast-document', {
        body: {
          documentId: documentRecord.id,
          userId: userId
        }
      });

      if (processingError) {
        console.warn(`[Podcast] OpenAI processing failed, document saved but not processed:`, processingError);
        // Don't fail the upload, just log the issue
        return {
          documentId: documentRecord.id,
          publicUrl,
          message: 'Document uploaded successfully. OpenAI processing will be retried automatically.',
          openaiProcessing: {
            status: 'failed',
            error: processingError.message
          }
        };
      }

      console.log(`[Podcast] OpenAI processing completed successfully:`, processingResult);
      
      return {
        documentId: documentRecord.id,
        publicUrl,
        message: 'Document uploaded and processed successfully for podcast generation',
        openaiProcessing: {
          status: 'completed',
          openaiFileId: processingResult.openaiFileId,
          metadata: processingResult.metadata
        }
      };

    } catch (processingError) {
      console.warn(`[Podcast] Failed to trigger OpenAI processing:`, processingError);
      
      // Update document status to indicate processing failed
      await supabase
        .from('podcast_documents')
        .update({
          openai_upload_status: 'failed',
          openai_upload_error: processingError.message
        })
        .eq('id', documentRecord.id);

      return {
        documentId: documentRecord.id,
        publicUrl,
        message: 'Document uploaded successfully. OpenAI processing failed but can be retried.',
        openaiProcessing: {
          status: 'failed',
          error: processingError.message
        }
      };
    }

  } catch (error) {

    throw new Error(error instanceof Error ? error.message : 'Failed to upload document');
  }
}

// Generate podcast using Supabase Edge Function
export async function generatePodcast(request: {
  userId: string;
  documentIds: string[];
  title: string;
  description?: string;
  synthesisStyle: 'podcast' | 'executive-briefing' | 'debate';
  specialty: string;
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Authentication required');
    try {
      console.log('[Podcast] generate:request', {
        userId: request.userId,
        docs: request.documentIds?.length,
        title: request.title,
        style: request.synthesisStyle,
        specialty: request.specialty
      });
    } catch {}
    // TODO: Replace with working podcast generation function
    // const { data, error } = await supabase.functions.invoke('generate-podcast-debug', {
    //   body: request
    // });
    // if (error) {
    //   throw new Error(error.message || 'Failed to generate podcast');
    // }
    // try { console.log('[Podcast] generate:ok', data); } catch {}
    // return data;
    
    throw new Error('Podcast generation function is temporarily disabled');

  } catch (error) {
    try { console.log('[Podcast] generate:error', { error }); } catch {}
    throw new Error(error instanceof Error ? error.message : 'Failed to generate podcast');
  }
}

// Clean up podcast documents after generation (optional)
export async function cleanupPodcastDocument(documentId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    // Get document info first
    const { data: document } = await supabase
      .from('podcast_documents')
      .select('supabase_file_path')
      .eq('id', documentId)
      .eq('user_id', session.user.id)
      .single();

    if (document?.supabase_file_path) {
      // Delete file from storage
      await supabase.storage
        .from('user-uploads')
        .remove([document.supabase_file_path]);
    }

    // Delete document record
    await supabase
      .from('podcast_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', session.user.id);

  } catch (error) {

    // Don't throw - cleanup failures shouldn't break the flow
  }
}