import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { withCors } from './utils/cors';
import { parseRequest } from './utils/request';
import { successResponse, errorResponse } from './utils/response';
import { handleError, ValidationError } from './utils/errors';
import { logger } from './utils/logger';

async function handleVectorStoreRequest(event: HandlerEvent, context: { user: any }): Promise<HandlerResponse> {
  const { body, method } = parseRequest(event);
  const { user } = context;
  
  logger.info('Vector Store request', {
    method,
    userId: user.id,
    userEmail: user.email
  });

  // Get environment variables
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
    logger.error('Missing environment variables', {
      hasOpenAI: !!openaiApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    throw new ValidationError('Server configuration error: Missing environment variables.');
  }

  // Initialize clients
  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

  // Debug logging
  logger.info('OpenAI client initialized', {
    hasOpenAI: !!openai,
    hasVectorStores: !!openai?.vectorStores,
    hasCreate: !!openai?.vectorStores?.create
  });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  logger.info(`Processing ${method} request for user: ${user.id}`);

  try {
    // Handle different HTTP methods
    if (method === 'POST') {
      // Create Vector Store
      const { name, description } = body;

      if (!name) {
        throw new ValidationError('Vector Store name is required.');
      }

      logger.info(`Creating Vector Store for user ${user.id}: ${name}`);

      try {
        // Check if user already has a Vector Store
        const { data: existingStore } = await supabase
          .from('user_vector_stores')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingStore) {
          return successResponse({
            vectorStore: {
              id: existingStore.id,
              openai_vector_store_id: existingStore.openai_vector_store_id,
              name: existingStore.name,
              description: existingStore.description || '',
              status: existingStore.status,
              document_count: existingStore.document_count,
              created_at: existingStore.created_at
            }
          }, 'Using existing Vector Store.');
        }

        // Create Vector Store in OpenAI - Updated for v5 API
        const vectorStore = await openai.vectorStores.create({
          name: `${name} - ${user.email || user.id}`,
        });

        logger.info(`Vector Store created in OpenAI: ${vectorStore.id}`);

        // Save to database
        const { data: dbRecord, error: dbError } = await supabase
          .from('user_vector_stores')
          .insert({
            user_id: user.id,
            openai_vector_store_id: vectorStore.id,
            name: name.trim(),
            description: description?.trim() || '',
            status: 'active',
            document_count: 0,
            total_size_bytes: 0,
            openai_metadata: vectorStore
          })
          .select()
          .single();

        if (dbError) {
          logger.error('Failed to save Vector Store to database:', dbError);
          // Try to clean up the OpenAI Vector Store
          try {
            await openai.vectorStores.delete(vectorStore.id);
            logger.info('Cleaned up OpenAI Vector Store after database error');
          } catch (cleanupError) {
            logger.error('Failed to cleanup OpenAI Vector Store:', cleanupError);
          }
          
          throw new Error('Failed to save Vector Store metadata.');
        }

        return successResponse({
          vectorStore: {
            id: dbRecord.id,
            openai_vector_store_id: vectorStore.id,
            name: dbRecord.name,
            description: dbRecord.description,
            status: dbRecord.status,
            document_count: dbRecord.document_count,
            created_at: dbRecord.created_at
          }
        }, 'Vector Store created successfully.');

      } catch (error) {
        logger.error('Error creating Vector Store:', error);
        throw new Error(error.message || 'Failed to create Vector Store.');
      }

    } else if (method === 'GET') {
      // Get user's Vector Store
      logger.info(`Getting Vector Store for user ${user.id}`);

      const { data: vectorStore, error: dbError } = await supabase
        .from('user_vector_stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (dbError) {
        if (dbError.code === 'PGRST116') { // No rows returned
          return successResponse({
            vectorStore: null
          }, 'No Vector Store found for user.');
        }
        
        logger.error('Database error getting Vector Store:', dbError);
        throw new Error('Failed to get Vector Store.');
      }

      // Optionally get fresh status from OpenAI
      try {
        const openaiVectorStore = await openai.vectorStores.retrieve(vectorStore.openai_vector_store_id);
        
        // Update our database with latest OpenAI data
        await supabase
          .from('user_vector_stores')
          .update({
            openai_metadata: openaiVectorStore,
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', vectorStore.id);

        // Return enhanced data
        return successResponse({
          vectorStore: {
            ...vectorStore,
            openai_status: openaiVectorStore.status,
            openai_file_counts: openaiVectorStore.file_counts,
            openai_error: null
          }
        }, 'Vector Store retrieved successfully.');

      } catch (openaiError) {
        logger.error('Error fetching from OpenAI:', openaiError);
        
        // Update error status in database
        await supabase
          .from('user_vector_stores')
          .update({
            openai_error: openaiError.message,
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', vectorStore.id);

        // Still return the database data with error info
        return successResponse({
          vectorStore: {
            ...vectorStore,
            openai_error: openaiError.message
          }
        }, 'Vector Store retrieved with OpenAI error.');
      }

    } else if (method === 'DELETE') {
      // Delete user's Vector Store
      logger.info(`Deleting Vector Store for user ${user.id}`);

      const { data: vectorStore, error: getError } = await supabase
        .from('user_vector_stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (getError) {
        if (getError.code === 'PGRST116') { // No rows returned
          throw new ValidationError('No Vector Store found to delete.');
        }
        
        logger.error('Database error getting Vector Store for deletion:', getError);
        throw new Error('Failed to find Vector Store for deletion.');
      }

      try {
        // Delete from OpenAI first
        await openai.vectorStores.delete(vectorStore.openai_vector_store_id);
        logger.info(`Deleted Vector Store from OpenAI: ${vectorStore.openai_vector_store_id}`);

        // Delete associated documents
        await supabase
          .from('user_documents')
          .delete()
          .eq('vector_store_id', vectorStore.id);

        // Delete from our database
        const { error: deleteError } = await supabase
          .from('user_vector_stores')
          .delete()
          .eq('id', vectorStore.id);

        if (deleteError) {
          logger.error('Failed to delete Vector Store from database:', deleteError);
          throw new Error('Failed to delete Vector Store from database.');
        }

        return successResponse({
          deletedVectorStoreId: vectorStore.openai_vector_store_id
        }, 'Vector Store deleted successfully.');

      } catch (error) {
        logger.error('Error deleting Vector Store:', error);
        throw new Error(error.message || 'Failed to delete Vector Store.');
      }

    } else {
      throw new ValidationError('Method not allowed.');
    }

  } catch (error) {
    logger.error('Error processing Vector Store request', {
      error: error.message,
      userId: user.id,
      method
    });
    
    throw error;
  }
}

// Export the handler with CORS but simplified auth (like uploadDocumentToOpenAI)
export const handler = withCors(async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: {}, body: '' };
    }

    // Simple authentication using Supabase (like uploadDocumentToOpenAI.js)
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return errorResponse('Authorization required', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client for auth
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return errorResponse('Authentication failed', 401, userError?.message);
    }

    // Call the main handler with authenticated user
    return await handleVectorStoreRequest(event, { user });
  } catch (error) {
    return handleError(error);
  }
});