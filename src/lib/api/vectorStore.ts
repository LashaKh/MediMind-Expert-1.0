// API functions for OpenAI Vector Store integration

import type {
  UserVectorStore,
  UserDocument,
  VectorStoreCreateRequest,
  VectorStoreCreateResponse,
  VectorStoreGetResponse,
  VectorStoreDeleteResponse,
  DocumentUploadRequest,
  DocumentUploadResponse,
  DocumentListParams,
  DocumentListResponse,
  DocumentDeleteRequest,
  DocumentUpdateRequest,
  ApiResponse
} from '../../types/openai-vector-store';
import {
  VectorStoreError,
  DocumentUploadError
} from '../../types/openai-vector-store';
import { supabase } from '../supabase';

// Simple cache to prevent duplicate simultaneous requests with shorter TTL
const requestCache = new Map<string, { promise: Promise<unknown>; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds cache TTL (reduced for faster updates)

// Function to clear specific cache entries
const clearCacheFor = (keyPattern: string) => {
  for (const [key] of requestCache) {
    if (key.includes(keyPattern)) {
      requestCache.delete(key);
    }
  }
};

// Rate limiting helper with exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function makeRequestWithRetry<T>(
  requestFn: () => Promise<T>,
  cacheKey?: string,
  maxRetries: number = 3
): Promise<T> {
  // Check cache for ongoing requests with TTL
  if (cacheKey) {
    const cached = requestCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.promise;
    }
  }

  const executeRequest = async (): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await requestFn();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Check if it's a rate limit error
        if (lastError.message.includes('Rate limit exceeded') || 
            lastError.message.includes('429') ||
            lastError.message.includes('Try again after')) {
          
          // Extract wait time from message if available
          const waitTimeMatch = lastError.message.match(/Try again after (\d+) minutes?/);
          let waitTime: number;
          
          if (waitTimeMatch) {
            // Use the exact wait time specified by the backend
            waitTime = parseInt(waitTimeMatch[1]) * 60 * 1000; // Convert minutes to ms
          } else {
            // Exponential backoff with max of 10 minutes
            waitTime = Math.min(1000 * Math.pow(2, attempt), 10 * 60 * 1000); // Max 10 minutes
          }
          
          if (attempt < maxRetries - 1) {
            await sleep(waitTime);
            continue;
          } else {
            // On final attempt, throw a more user-friendly error
            throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
          }
        }
        
        // For non-rate-limit errors, don't retry
        throw lastError;
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  };

  // Cache the promise if cache key provided
  if (cacheKey) {
    const promise = executeRequest().finally(() => {
      // Remove from cache when done, but keep successful results for TTL
      setTimeout(() => {
        requestCache.delete(cacheKey);
      }, CACHE_TTL);
    });
    
    requestCache.set(cacheKey, { promise, timestamp: Date.now() });
    return promise;
  }

  return executeRequest();
}

/**
 * Vector Store Management
 */

// Create a new Vector Store for the user
export async function createVectorStore(
  request: VectorStoreCreateRequest
): Promise<VectorStoreCreateResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new VectorStoreError('Authentication required');
  }

  const userId = session.user.id;
  const cacheKey = `createVectorStore-${userId}`;

  return makeRequestWithRetry(async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/manageVectorStore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(request),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new VectorStoreError(responseData.error || 'Failed to create Vector Store', responseData.code);
    }

    // Backend wraps data in a 'data' property, so we need to extract it
    const result: VectorStoreCreateResponse = {
      message: responseData.message || 'Vector Store created successfully',
      vectorStore: responseData.data?.vectorStore || responseData.vectorStore
    };

    return result;
  }, cacheKey);
}

// Get user's Vector Store
export async function getUserVectorStore(): Promise<VectorStoreGetResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new VectorStoreError('Authentication required');
  }

  const userId = session.user.id;
  const cacheKey = `getUserVectorStore-${userId}`;

  return makeRequestWithRetry(async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/manageVectorStore`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    // Check content type before parsing JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();

      throw new VectorStoreError(`Server returned HTML instead of JSON. Status: ${response.status}`);
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw new VectorStoreError(responseData.error || 'Failed to get Vector Store');
    }

    // Backend wraps data in a 'data' property, so we need to extract it
    const result: VectorStoreGetResponse = {
      vectorStore: responseData.data?.vectorStore || responseData.vectorStore
    };
    
    // Add detailed logging for debugging backend mismatch
    const currentUser = await supabase.auth.getUser();

    return result;
  }, cacheKey);
}

// Delete user's Vector Store
export async function deleteVectorStore(): Promise<VectorStoreDeleteResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new VectorStoreError('Authentication required');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/manageVectorStore`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new VectorStoreError(data.error || 'Failed to delete Vector Store');
    }

    return data;
  } catch (error) {

    if (error instanceof VectorStoreError) {
      throw error;
    }
    throw new VectorStoreError('Failed to delete Vector Store');
  }
}

/**
 * Document Management
 */

// Progress callback type for real-time updates
export type UploadProgressCallback = (progress: {
  type: 'chunk' | 'overall';
  currentChunk?: number;
  totalChunks?: number;
  overallProgress: number;
  status: 'preparing' | 'chunking' | 'uploading' | 'reassembling' | 'processing';
}) => void;

// Upload document to OpenAI Vector Store with chunking support
export async function uploadDocumentToVectorStore(
  request: DocumentUploadRequest,
  onProgress?: UploadProgressCallback
): Promise<DocumentUploadResponse> {
  // EXTREMELY VISIBLE DEBUG LOG - This should ALWAYS appear if function is called
  console.log('🚨🚨🚨 UPLOAD FUNCTION CALLED! File:', request.file.name, 'Size:', request.file.size);
  console.log('🚨🚨🚨 Request object:', request);
  
  // Import chunking utilities
  const { 
    shouldChunkFile, 
    splitFileIntoChunks, 
    createChunkMetadata,
    generateChunkPath,
    calculateChunkProgress 
  } = await import('../utils/fileChunking');
  
  // Check if file needs chunking
  if (shouldChunkFile(request.file)) {
    console.log('🧩 Large file detected - using chunked upload');
    return await uploadFileInChunks(request, onProgress);
  }
  
  // For smaller files, use direct upload
  console.log('📄 Small file - using direct upload');
  return await uploadFileDirectly(request, onProgress);
}

// Direct upload for files under 45MB
async function uploadFileDirectly(request: DocumentUploadRequest, onProgress?: UploadProgressCallback): Promise<DocumentUploadResponse> {
  try {
    console.log('🔄 Starting direct document upload process...');
    
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔐 Session check:', session ? 'authenticated' : 'not authenticated');
    
    if (!session) {
      throw new DocumentUploadError('Authentication required');
    }

    // Stage 1: Upload file to Supabase Storage first (avoids Netlify function memory limits)
    // Sanitize filename to avoid special characters that break storage URLs
    const sanitizedFileName = request.file.name
      .replace(/[^\w\s.-]/g, '') // Remove special chars except word chars, spaces, dots, hyphens
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
    
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${sanitizedFileName}`;
    const filePath = `uploads/${session.user.id}/${fileName}`;
    
    console.log('📤 Uploading to Supabase Storage:', filePath);
    console.log('📄 File details:', { name: request.file.name, size: request.file.size, type: request.file.type });
    
    console.log('🚨 ABOUT TO START SUPABASE STORAGE UPLOAD...');
    
    // Add timeout to prevent infinite hanging on large files
    const uploadWithTimeout = Promise.race([
      supabase.storage
        .from('user-uploads')
        .upload(filePath, request.file, {
          cacheControl: '3600',
          upsert: false
        }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Storage upload timeout (10 minutes)')), 10 * 60 * 1000)
      )
    ]);
    
    const { data: uploadData, error: uploadError } = await uploadWithTimeout as any;
      
    console.log('🚨 SUPABASE STORAGE UPLOAD COMPLETED!');
    console.log('📤 Storage upload result:', { uploadData, uploadError });

    if (uploadError) {

      throw new DocumentUploadError(
        'Failed to upload file to storage: ' + uploadError.message
      );
    }

    // Stage 2: Call function to process from Supabase Storage to OpenAI
    const requestPayload = {
      supabaseFilePath: uploadData.path,
      vectorStoreId: request.vectorStoreId,
      title: request.title,
      description: request.description,
      category: request.category,
      tags: request.tags,
      fileName: request.file.name,
      fileType: request.file.type,
      fileSize: request.file.size
    };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log('🚀 Calling Edge Function:', `${supabaseUrl}/functions/v1/upload-document-to-openai`);
    console.log('📦 Payload:', requestPayload);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/upload-document-to-openai`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      // Add timeout for large file uploads - extended for 500MB files
      signal: AbortSignal.timeout(15 * 60 * 1000), // 15 minute timeout for large files
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, get the text response for debugging
      const textResponse = await response.text();

      throw new DocumentUploadError(
        'Failed to upload document to OpenAI.',
        undefined,
        undefined,
        textResponse
      );
    }

    if (!response.ok) {
      // Clean up the Supabase file if OpenAI processing failed
      try {
        await supabase.storage
          .from('user-uploads')
          .remove([uploadData.path]);
      } catch (cleanupError) {

      }

      throw new DocumentUploadError(
        data.error || 'Failed to upload document',
        data.documentId,
        data.uploadedFileId,
        data.errorDetails
      );
    }

    return data;
  } catch (error) {

    if (error instanceof DocumentUploadError) {
      throw error;
    }
    
    // Handle specific error types
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      throw new DocumentUploadError('Upload timed out. Please try again with a smaller file or check your connection.');
    }
    
    if (error.name === 'AbortError') {
      throw new DocumentUploadError('Upload was cancelled. Please try again.');
    }
    
    if (error.message?.includes('Failed to fetch')) {
      throw new DocumentUploadError('Network error during upload. Please check your connection and try again.');
    }
    
    throw new DocumentUploadError('Failed to upload document to Vector Store');
  }
}

// Chunked upload for files over 45MB
async function uploadFileInChunks(request: DocumentUploadRequest, onProgress?: UploadProgressCallback): Promise<DocumentUploadResponse> {
  try {
    console.log('🧩 Starting chunked upload process...');
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new DocumentUploadError('Authentication required');
    }

    // Import chunking utilities
    const { 
      splitFileIntoChunks, 
      createChunkMetadata,
      generateChunkPath,
      formatFileSize 
    } = await import('../utils/fileChunking');

    // Split file into chunks
    const chunks = splitFileIntoChunks(request.file);
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🧩 File split into ${chunks.length} chunks:`, {
      originalSize: formatFileSize(request.file.size),
      chunkSize: formatFileSize(chunks[0].chunkSize),
      totalChunks: chunks.length
    });

    // Notify UI of chunking completion
    onProgress?.({
      type: 'overall',
      totalChunks: chunks.length,
      overallProgress: 5,
      status: 'uploading'
    });

    // Upload chunks sequentially with progress updates
    const uploadedChunks: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`🧩 Uploading chunk ${i + 1}/${chunks.length} (${formatFileSize(chunk.chunkSize)})`);
      
      // Update progress for current chunk (10% to 80% for chunk uploads)
      const chunkProgress = 10 + Math.round((i / chunks.length) * 70);
      console.log(`📊 Chunk upload progress: ${chunkProgress}%`);
      
      // Notify UI of chunk progress
      onProgress?.({
        type: 'chunk',
        currentChunk: i + 1,
        totalChunks: chunks.length,
        overallProgress: chunkProgress,
        status: 'uploading'
      });
      
      // Generate chunk path
      const chunkPath = generateChunkPath(session.user.id, sessionId, chunk);
      
      // Upload chunk to storage with retry logic
      let uploadData, uploadError;
      let retryAttempts = 0;
      const maxRetries = 3;
      
      while (retryAttempts < maxRetries) {
        try {
          console.log(`🔄 Uploading chunk ${i + 1}/${chunks.length}, attempt ${retryAttempts + 1}/${maxRetries}...`);
          
          const uploadResult = await supabase.storage
            .from('user-uploads')
            .upload(chunkPath, chunk.chunkData, {
              cacheControl: '3600',
              upsert: false
            });
          
          uploadData = uploadResult.data;
          uploadError = uploadResult.error;
          
          if (!uploadError) {
            console.log(`✅ Chunk ${i + 1} uploaded successfully on attempt ${retryAttempts + 1}`);
            break; // Success, exit retry loop
          } else {
            console.warn(`⚠️ Chunk ${i + 1} upload attempt ${retryAttempts + 1} failed:`, uploadError);
          }
        } catch (error) {
          console.warn(`⚠️ Chunk ${i + 1} upload attempt ${retryAttempts + 1} threw error:`, error);
          uploadError = error;
        }
        
        retryAttempts++;
        
        if (retryAttempts < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, retryAttempts) * 2000; // 4s, 8s, 16s
          console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      if (uploadError) {
        console.error(`❌ Chunk ${i + 1} upload failed:`, uploadError);
        
        // Clean up any uploaded chunks on failure
        await cleanupChunks(session.user.id, sessionId, uploadedChunks);
        
        throw new DocumentUploadError(
          `Failed to upload chunk ${i + 1}: ${uploadError.message}`
        );
      }
      
      uploadedChunks.push(uploadData.path);
      console.log(`✅ Chunk ${i + 1}/${chunks.length} uploaded successfully`);
    }

    console.log('🎉 All chunks uploaded successfully, processing each chunk as separate documents...');

    // Notify UI of processing starting
    onProgress?.({
      type: 'overall',
      totalChunks: chunks.length,
      overallProgress: 85,
      status: 'processing'
    });

    // Process each chunk as a separate document
    const chunkResults: any[] = [];
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    // Refresh session before processing
    console.log('🔄 Refreshing session for document processing...');
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    
    if (!freshSession) {
      throw new DocumentUploadError('Authentication session expired during upload');
    }
    
    console.log('✅ Fresh session obtained, processing chunks individually...');

    for (let i = 0; i < uploadedChunks.length; i++) {
      const chunkPath = uploadedChunks[i];
      console.log(`📄 Processing chunk ${i + 1}/${uploadedChunks.length} as separate document...`);
      
      // Create chunk-specific title (truncate if too long for database)
      const maxTitleLength = 200; // Database constraint limit
      const partSuffix = ` - Part ${i + 1}/${uploadedChunks.length}`;
      const maxBaseLength = maxTitleLength - partSuffix.length;
      
      let baseTitle = request.title;
      if (baseTitle.length > maxBaseLength) {
        baseTitle = baseTitle.substring(0, maxBaseLength - 3) + '...';
      }
      
      const chunkTitle = `${baseTitle}${partSuffix}`;
      console.log(`📝 Generated chunk title (${chunkTitle.length} chars): ${chunkTitle}`);
      
      const chunkRequest = {
        supabaseFilePath: chunkPath,
        vectorStoreId: request.vectorStoreId,
        title: chunkTitle,
        description: request.description ? `${request.description} (Part ${i + 1} of ${uploadedChunks.length})` : `Part ${i + 1} of ${uploadedChunks.length}`,
        category: request.category,
        tags: [...(request.tags || []), 'chunked-document', `part-${i + 1}-of-${uploadedChunks.length}`],
        fileName: `${request.file.name.replace(/\.([^.]+)$/, `-part${i + 1}.$1`)}`,
        fileType: request.file.type,
        fileSize: chunks[i].chunkSize
      };

      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/upload-document-to-openai`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${freshSession.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunkRequest),
          signal: AbortSignal.timeout(10 * 60 * 1000), // 10 minute timeout per chunk
        });

        if (response.ok) {
          const result = await response.json();
          chunkResults.push(result);
          console.log(`✅ Chunk ${i + 1}/${uploadedChunks.length} processed successfully`);
          
          // Update progress
          const chunkProgress = 85 + Math.round(((i + 1) / uploadedChunks.length) * 15);
          onProgress?.({
            type: 'overall',
            totalChunks: chunks.length,
            overallProgress: chunkProgress,
            status: 'processing'
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn(`⚠️ Chunk ${i + 1} processing failed:`, errorData);
          // Continue with other chunks instead of failing completely
        }
      } catch (error) {
        console.warn(`⚠️ Chunk ${i + 1} processing error:`, error);
        // Continue with other chunks
      }
    }

    console.log(`🎉 Chunked document processing complete! ${chunkResults.length}/${uploadedChunks.length} chunks processed successfully`);
    
    // Show where the final documents are stored
    console.log(`📁 Document storage summary:`);
    console.log(`   • Vector Store ID: ${request.vectorStoreId}`);
    console.log(`   • OpenAI Files: ${chunkResults.length} separate files uploaded`);
    console.log(`   • Database Records: ${chunkResults.length} documents created`);
    console.log(`   • Temp Storage: Chunks will be cleaned up from temp-chunks/`);

    // Clean up chunk files after processing
    await cleanupChunks(session.user.id, sessionId, uploadedChunks);

    // Return summary of results
    return {
      success: true,
      message: `Large document successfully split and processed as ${chunkResults.length} separate documents`,
      chunkedUpload: true,
      totalChunks: uploadedChunks.length,
      successfulChunks: chunkResults.length,
      chunkResults: chunkResults,
      // Return first chunk's document info for compatibility
      documentId: chunkResults[0]?.documentId,
      uploadedFileId: chunkResults[0]?.uploadedFileId
    };
  } catch (error) {
    console.error('❌ Chunked upload failed:', error);
    
    if (error instanceof DocumentUploadError) {
      throw error;
    }
    
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      throw new DocumentUploadError('Chunked upload timed out. Please try again or use a smaller file.');
    }
    
    if (error.name === 'AbortError') {
      throw new DocumentUploadError('Chunked upload was cancelled.');
    }
    
    throw new DocumentUploadError('Failed to upload large document');
  }
}

// Clean up uploaded chunks after processing
async function cleanupChunks(userId: string, sessionId: string, chunkPaths: string[]): Promise<void> {
  try {
    console.log(`🧹 Cleaning up ${chunkPaths.length} temporary chunks from Supabase Storage...`);
    console.log(`   📁 Removing temp files from: temp-chunks/chunks-${new Date().toISOString().split('T')[0]}/`);
    
    if (chunkPaths.length > 0) {
      const { error } = await supabase.storage
        .from('user-uploads')
        .remove(chunkPaths);
      
      if (error) {
        console.warn('⚠️ Failed to clean up some temp chunks:', error);
      } else {
        console.log('✅ Temporary chunks cleaned up successfully (final documents are in OpenAI Vector Store)');
      }
    }
  } catch (error) {
    console.warn('⚠️ Chunk cleanup failed:', error);
  }
}

// List user's documents
export async function listUserDocuments(
  params: DocumentListParams = {}
): Promise<DocumentListResponse> {
  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const {
      category,
      search,
      tags,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params;

    let query = supabase
      .from('user_documents')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,file_name.ilike.%${search}%`
      );
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    const { data, error, count } = await query;

    if (error) {

      throw new Error(error.message);
    }

    const result = {
      documents: (data || []) as unknown as UserDocument[],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    };

    return result;
  } catch (error) {

    throw new Error('Failed to list documents');
  }
}

// Get a specific document
export async function getUserDocument(documentId: string): Promise<UserDocument> {
  try {
    const { data, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Document not found');
    }

    return data as unknown as UserDocument;
  } catch (error) {

    throw new Error('Failed to get document');
  }
}

// Update document metadata
export async function updateUserDocument(
  request: DocumentUpdateRequest
): Promise<UserDocument> {
  try {
    const updateData: Partial<UserDocument> = {};
    
    if (request.title !== undefined) updateData.title = request.title;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.category !== undefined) updateData.category = request.category;
    if (request.tags !== undefined) updateData.tags = request.tags;
    if (request.is_private !== undefined) updateData.is_private = request.is_private;

    const { data, error } = await supabase
      .from('user_documents')
      .update(updateData)
      .eq('id', request.documentId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Document not found');
    }

    return data as unknown as UserDocument;
  } catch (error) {

    throw new Error('Failed to update document');
  }
}

// Delete document from Vector Store and database with detailed cleanup results
export async function deleteUserDocument(
  request: DocumentDeleteRequest
): Promise<{ 
  success: boolean; 
  message: string; 
  cleanupResults?: {
    supabaseCleanup?: { success: boolean; error?: string };
    openaiCleanup?: { success: boolean; error?: string };
    storageCleanup?: { success: boolean; error?: string };
  }; 
  warnings?: string[];
  partialSuccess?: boolean;
}> {
  try {
    console.log('🔑 Getting session for document deletion...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    console.log('✅ Session found, calling Edge Function');

    // Call the Supabase Edge Function to delete from OpenAI and database
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const deleteUrl = `${supabaseUrl}/functions/v1/delete-document-from-openai`;
    console.log('🚀 Calling Edge Function:', deleteUrl);
    console.log('📦 Request payload:', { documentId: request.documentId });

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        documentId: request.documentId
      })
    });

    console.log('📡 Edge Function response status:', response.status);
    console.log('📡 Edge Function response headers:', response.headers);

    // Handle both complete success (200) and partial success (207)
    if (!response.ok && response.status !== 207) {
      console.error('❌ Edge Function returned error status:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error data from Edge Function:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Edge Function response:', result);
    
    // Determine if this was a partial success (207 status = some cleanup failed)
    const partialSuccess = response.status === 207;

    // Clear vector store cache after deletion to ensure fresh data on next request
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user?.id) {
      clearCacheFor(`VectorStore-${currentSession.user.id}`);
      clearCacheFor(`initializeUserVectorStore-${currentSession.user.id}`);
    }

    return {
      success: true,
      partialSuccess,
      message: result.message || 'Document deleted successfully.',
      cleanupResults: result.cleanupResults,
      warnings: result.warnings || []
    };
  } catch (error) {

    throw new Error(error instanceof Error ? error.message : 'Failed to delete document');
  }
}

/**
 * Utility Functions
 */

// Check if user has a Vector Store
export async function checkUserVectorStore(): Promise<{ hasVectorStore: boolean; vectorStore?: UserVectorStore }> {
  try {
    const response = await getUserVectorStore();
    return {
      hasVectorStore: response.vectorStore !== null,
      vectorStore: response.vectorStore || undefined
    };
  } catch (error) {

    return { hasVectorStore: false };
  }
}

// Get Vector Store status and health
export async function getVectorStoreStatus(): Promise<{
  status: string;
  documentCount: number;
  totalSize: number;
  openaiStatus?: string;
  openaiFileCounts?: {
    cancelled?: number;
    completed?: number;
    failed?: number;
    in_progress?: number;
    total?: number;
  };
  errorMessage?: string;
}> {
  try {
    const response = await getUserVectorStore();
    
    if (!response.vectorStore) {
      return {
        status: 'not_found',
        documentCount: 0,
        totalSize: 0,
        errorMessage: 'No Vector Store found'
      };
    }

    return {
      status: response.vectorStore.status,
      documentCount: response.vectorStore.document_count,
      totalSize: response.vectorStore.total_size_bytes,
      openaiStatus: response.vectorStore.openai_status,
      openaiFileCounts: response.vectorStore.openai_file_counts,
      errorMessage: response.vectorStore.openai_error
    };
  } catch (error) {

    return {
      status: 'error',
      documentCount: 0,
      totalSize: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Initialize Vector Store for new user
export async function initializeUserVectorStore(
  name: string = 'Personal Knowledge Base',
  description: string = 'Personal medical knowledge base and documents'
): Promise<VectorStoreCreateResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new VectorStoreError('Authentication required');
  }

  const userId = session.user.id;
  const cacheKey = `initializeUserVectorStore-${userId}`;

  return makeRequestWithRetry(async () => {
    console.log('🔄 Checking if user has an existing vector store...');
    
    // Clear any cached vector store data to force fresh lookup
    clearCacheFor(`VectorStore-${userId}`);
    clearCacheFor(`getUserVectorStore-${userId}`);
    clearCacheFor(cacheKey);
    
    try {
      // First check if user already has a Vector Store (bypass cache for fresh data)
      const { hasVectorStore, vectorStore } = await checkUserVectorStore();

      if (hasVectorStore && vectorStore) {
        console.log('✅ Found existing vector store:', vectorStore.openai_vector_store_id);
        
        // Return existing vector store information in the expected format
        const existingResponse = {
          message: 'Vector Store already exists',
          vectorStore: {
            id: vectorStore.id,
            openai_vector_store_id: vectorStore.openai_vector_store_id,
            name: vectorStore.name,
            description: vectorStore.description || '',
            status: vectorStore.status,
            document_count: vectorStore.document_count,
            created_at: vectorStore.created_at
          }
        };
        return existingResponse;
      }
    } catch (error) {
      console.warn('⚠️ Error checking existing vector store, will create new one:', error.message);
      // Continue to create a new vector store
    }
    
    console.log('🆕 No existing vector store found, creating new one...');
    
    // If no vector store exists or there was an error, create a new one
    const createResponse = await createVectorStore({ name, description });
    console.log('✅ New vector store created:', createResponse.vectorStore.openai_vector_store_id);
    return createResponse;
  }, cacheKey);
}

// Clear vector store cache manually (useful for troubleshooting)
export async function clearVectorStoreCache(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) {
    clearCacheFor(`VectorStore-${session.user.id}`);
    clearCacheFor(`initializeUserVectorStore-${session.user.id}`);
  }
}

// Count user documents by category
export async function getUserDocumentStats(): Promise<{
  totalDocuments: number;
  categoryCounts: Record<string, number>;
  totalSize: number;
}> {
  try {
    const { data, error } = await supabase
      .from('user_documents')
      .select('category, file_size')
      .eq('upload_status', 'completed');

    if (error) {
      throw new Error(error.message);
    }

    const stats = {
      totalDocuments: data?.length || 0,
      categoryCounts: {} as Record<string, number>,
      totalSize: 0
    };

    if (data) {
      for (const doc of data) {
        const docData = doc as { category: string; file_size?: number }; // Type assertion for database row
        // Count by category
        stats.categoryCounts[docData.category] = (stats.categoryCounts[docData.category] || 0) + 1;
        
        // Sum file sizes
        stats.totalSize += docData.file_size || 0;
      }
    }

    return stats;
  } catch (error) {

    throw new Error('Failed to get document statistics');
  }
} 