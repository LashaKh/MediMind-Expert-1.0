const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

// SECURITY FIX: Import secure CORS utilities
const { getCorsHeaders, isOriginAllowed, DEFAULT_CORS_OPTIONS, handleCorsPreflightRequest } = require('./utils/cors');

// SECURITY FIX: Remove wildcard CORS headers
// Secure CORS headers are now handled by getCorsHeaders() function

exports.handler = async (event, context) => {
  console.log('Netlify function `deleteDocumentFromOpenAI` invoked');
  
  // SECURITY: Get origin for CORS validation
  const origin = event.headers.origin || event.headers.Origin;
  
  // SECURITY: Validate origin before processing
  if (origin && !isOriginAllowed(origin, DEFAULT_CORS_OPTIONS.allowedOrigins)) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'CORS policy violation',
        message: 'Origin not allowed for document deletion'
      })
    };
  }

  // Handle CORS preflight requests with secure validation
  if (event.httpMethod === 'OPTIONS') {
    return handleCorsPreflightRequest(event);
  }

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
      body: JSON.stringify({ error: 'Method not allowed. Use DELETE.' })
    };
  }

  try {
    // Get environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('CRITICAL: Required environment variables not set.');
      return {
        statusCode: 500,
        headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
        body: JSON.stringify({ error: 'Server configuration error: Missing environment variables.' })
      };
    }

    // Parse request body to get document ID
    let requestData;
    try {
      requestData = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
        body: JSON.stringify({ error: 'Invalid JSON in request body.' })
      };
    }

    const { documentId } = requestData;

    if (!documentId) {
      return {
        statusCode: 400,
        headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
        body: JSON.stringify({ error: 'Document ID is required.' })
      };
    }

    // Initialize clients
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
        body: JSON.stringify({ error: 'Authorization header required.' })
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return {
        statusCode: 401,
        headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
        body: JSON.stringify({ error: 'Authentication failed.' })
      };
    }

    console.log(`Processing document deletion: ${documentId} for user: ${user.id}`);

    // Get document details from database first
    const { data: document, error: documentError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (documentError || !document) {
      console.error('Document not found or access denied:', documentError);
      return {
        statusCode: 404,
        headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
        body: JSON.stringify({ error: 'Document not found or access denied.' })
      };
    }

    const { openai_file_id, openai_vector_store_file_id, vector_store_id } = document;

    try {
      // Get vector store details to get the OpenAI vector store ID
      const { data: vectorStore, error: vectorStoreError } = await supabase
        .from('user_vector_stores')
        .select('openai_vector_store_id')
        .eq('id', vector_store_id)
        .single();

      if (vectorStoreError || !vectorStore) {
        console.error('Vector store not found:', vectorStoreError);
        return {
          statusCode: 404,
          headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
          body: JSON.stringify({ error: 'Vector store not found.' })
        };
      }

      const openaiVectorStoreId = vectorStore.openai_vector_store_id;

      // Step 1: Remove file from Vector Store (if it exists)
      let vectorStoreRemovalSuccess = false;
      let vectorStoreRemovalError = null;
      
      if (openai_vector_store_file_id && openaiVectorStoreId) {
        console.log(`🗑️ Step 1: Removing file from Vector Store`, {
          vectorStoreFileId: openai_vector_store_file_id,
          vectorStoreId: openaiVectorStoreId
        });
        
        try {
          const removeFromVectorStoreResponse = await fetch(
            `https://api.openai.com/v1/vector_stores/${openaiVectorStoreId}/files/${openai_vector_store_file_id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'OpenAI-Beta': 'assistants=v2',
                'Content-Type': 'application/json'
              }
            }
          );

          if (removeFromVectorStoreResponse.ok) {
            console.log(`✅ Successfully removed file from Vector Store: ${openai_vector_store_file_id}`);
            vectorStoreRemovalSuccess = true;
          } else {
            const errorText = await removeFromVectorStoreResponse.text();
            vectorStoreRemovalError = `HTTP ${removeFromVectorStoreResponse.status}: ${errorText}`;
            console.error(`❌ Failed to remove file from Vector Store:`, {
              status: removeFromVectorStoreResponse.status,
              error: errorText,
              vectorStoreFileId: openai_vector_store_file_id
            });
          }
        } catch (error) {
          vectorStoreRemovalError = error.message;
          console.error('❌ Exception removing file from Vector Store:', {
            error: error.message,
            stack: error.stack,
            vectorStoreFileId: openai_vector_store_file_id
          });
        }
      } else {
        console.log('⏭️ Skipping Vector Store removal - no vector store file ID found');
      }

      // Step 2: Delete the file from OpenAI Files with retry logic (if it exists)
      let openaiFileDeleteSuccess = false;
      let openaiFileDeleteError = null;
      
      if (openai_file_id) {
        console.log(`🗑️ Step 2: Deleting OpenAI file with retry logic`, {
          fileId: openai_file_id
        });
        
        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Attempt ${attempt}/${maxRetries}: Deleting OpenAI file: ${openai_file_id}`);
            
            // Try the OpenAI SDK deletion method (v5+ uses 'delete' not 'del')
            const deleteResult = await openai.files.delete(openai_file_id);
            console.log(`✅ Successfully deleted OpenAI file: ${openai_file_id}`, {
              deleteResult: deleteResult,
              resultType: typeof deleteResult
            });
            openaiFileDeleteSuccess = true;
            break; // Success, exit retry loop
            
          } catch (fileDeleteError) {
            openaiFileDeleteError = fileDeleteError.message;
            console.error(`❌ Attempt ${attempt}/${maxRetries} failed to delete OpenAI file:`, {
              fileId: openai_file_id,
              error: fileDeleteError.message,
              errorCode: fileDeleteError.code,
              errorType: fileDeleteError.type,
              httpStatus: fileDeleteError.status,
              responseBody: fileDeleteError.response?.data,
              stack: fileDeleteError.stack
            });
            
            // Log the full error object for debugging
            console.error('❌ Full OpenAI deletion error object:', fileDeleteError);
            
            // If this is the last attempt, don't retry
            if (attempt === maxRetries) {
              console.error(`❌ All ${maxRetries} attempts failed to delete OpenAI file: ${openai_file_id}`);
              break;
            }
            
            // Wait before retry (exponential backoff)
            const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      } else {
        console.log('⏭️ Skipping OpenAI file deletion - no file ID found');
      }

      // Step 3: Clean up Supabase storage file (if it exists)
      let storageDeleteSuccess = false;
      let storageDeleteError = null;
      
      const storageFilePath = document.openai_metadata?.supabase_file_path;
      if (storageFilePath) {
        console.log(`🗑️ Step 3: Deleting Supabase storage file`, {
          filePath: storageFilePath
        });
        
        try {
          const { error: storageError } = await supabase.storage
            .from('user-uploads')
            .remove([storageFilePath]);
          
          if (storageError) {
            storageDeleteError = storageError.message;
            console.error(`❌ Failed to delete storage file:`, {
              filePath: storageFilePath,
              error: storageError.message
            });
          } else {
            console.log(`✅ Successfully deleted storage file: ${storageFilePath}`);
            storageDeleteSuccess = true;
          }
        } catch (error) {
          storageDeleteError = error.message;
          console.error('❌ Exception deleting storage file:', {
            filePath: storageFilePath,
            error: error.message,
            stack: error.stack
          });
        }
      } else {
        console.log('⏭️ Skipping storage cleanup - no storage file path found');
      }

      // Step 4: Delete from database
      const { error: dbDeleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (dbDeleteError) {
        console.error('Failed to delete document from database:', dbDeleteError);
        return {
          statusCode: 500,
          headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
          body: JSON.stringify({ 
            error: 'Failed to delete document from database.',
            details: dbDeleteError.message
          })
        };
      }

      // Step 5: Update vector store document count
      if (vectorStore) {
        console.log(`🔄 Step 5: Updating vector store document count`);
        const { data: currentVectorStore } = await supabase
          .from('user_vector_stores')
          .select('document_count, total_size_bytes')
          .eq('id', vector_store_id)
          .single();

        if (currentVectorStore) {
          await supabase
            .from('user_vector_stores')
            .update({
              document_count: Math.max(0, (currentVectorStore.document_count || 1) - 1),
              total_size_bytes: Math.max(0, (currentVectorStore.total_size_bytes || document.file_size) - document.file_size),
              updated_at: new Date().toISOString()
            })
            .eq('id', vector_store_id);
          console.log(`✅ Updated vector store counts`);
        }
      }

      // Determine overall success and create detailed response
      const cleanupResults = {
        vectorStoreRemoval: {
          attempted: !!openai_vector_store_file_id,
          success: vectorStoreRemovalSuccess,
          error: vectorStoreRemovalError
        },
        openaiFileDeletion: {
          attempted: !!openai_file_id,
          success: openaiFileDeleteSuccess,
          error: openaiFileDeleteError
        },
        storageDeletion: {
          attempted: !!storageFilePath,
          success: storageDeleteSuccess,
          error: storageDeleteError
        }
      };

      const hasFailures = (cleanupResults.vectorStoreRemoval.attempted && !cleanupResults.vectorStoreRemoval.success) ||
                         (cleanupResults.openaiFileDeletion.attempted && !cleanupResults.openaiFileDeletion.success) ||
                         (cleanupResults.storageDeletion.attempted && !cleanupResults.storageDeletion.success);

      let message = 'Document deleted from database successfully.';
      if (!hasFailures) {
        message = 'Document completely deleted from all systems (database, OpenAI, and storage).';
      } else {
        message = 'Document deleted from database, but some cleanup operations failed. See details.';
      }

      console.log(`📊 Deletion Summary:`, {
        documentId,
        overallSuccess: !hasFailures,
        cleanupResults
      });

      return {
        statusCode: hasFailures ? 207 : 200, // 207 = Multi-Status (partial success)
        headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
        body: JSON.stringify({
          message,
          documentId: documentId,
          cleanupResults,
          warnings: hasFailures ? ['Some OpenAI or storage cleanup operations failed. Files may still exist in OpenAI dashboard or storage.'] : []
        })
      };

    } catch (deletionError) {
      console.error('Error during OpenAI deletion:', deletionError);
      
      return {
        statusCode: 500,
        headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
        body: JSON.stringify({
          error: 'Failed to delete document from OpenAI.',
          details: deletionError.message,
          documentId: documentId
        })
      };
    }

  } catch (error) {
    console.error('Unexpected error in deleteDocumentFromOpenAI:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin)
      },
      body: JSON.stringify({
        error: error.message || 'Internal server error.'
      })
    };
  }
}; 