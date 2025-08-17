// Upload document from Supabase Storage to OpenAI Vector Store
const { createClient } = require('@supabase/supabase-js');
let OpenAI;
try {
  OpenAI = require('openai');
} catch (error) {
  console.error('Error loading OpenAI:', error);
}

// Import secure CORS utilities
const { getCorsHeaders, isOriginAllowed } = require('./utils/cors');

// Import security modules
const { createErrorResponse } = require('./utils/errorHandler');
const { checkAdvancedRateLimit } = require('./utils/advancedRateLimiter');

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  // SECURITY: Get origin for CORS validation
  const origin = event.headers.origin || event.headers.Origin;
  const secureCorsHeaders = getCorsHeaders(origin);
  
  // SECURITY: Validate origin before processing
  if (origin && !isOriginAllowed(origin, require('./utils/cors').DEFAULT_CORS_OPTIONS.allowedOrigins)) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'CORS policy violation',
        message: 'Origin not allowed for file upload'
      })
    };
  }

  try {
    console.log('Upload from Supabase Storage function starting');

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      const { handleCorsPreflightRequest } = require('./utils/cors');
      return handleCorsPreflightRequest(event);
    }

    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        }, 
        body: JSON.stringify({ error: 'Method not allowed' }) 
      };
    }

    // Validate environment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      return { 
        statusCode: 500, 
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        }, 
        body: JSON.stringify({ error: 'Configuration error' }) 
      };
    }

    // Parse JSON request body
    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { 
      supabaseFilePath, 
      vectorStoreId, 
      title, 
      description, 
      category, 
      tags, 
      fileName, 
      fileType, 
      fileSize 
    } = requestData;

    if (!supabaseFilePath || !vectorStoreId || !title) {
      return { 
        statusCode: 400, 
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        }, 
        body: JSON.stringify({ error: 'Missing required fields: supabaseFilePath, vectorStoreId, title' }) 
      };
    }

    // Initialize clients
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      return { 
        statusCode: 401, 
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        }, 
        body: JSON.stringify({ error: 'Authorization required' }) 
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return { 
        statusCode: 401, 
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        }, 
        body: JSON.stringify({ error: 'Authentication failed' }) 
      };
    }

    // Rate limiting check
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    const uploadData = {
      fileSize: fileSize || 0,
      fileType: fileType || 'unknown',
      fileName: fileName || 'unknown'
    };

    const rateLimitResult = checkAdvancedRateLimit(user.id, clientIP, uploadData, event);
    
    if (!rateLimitResult.allowed) {
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limits?.maxUploads || 'dynamic',
          'X-RateLimit-Remaining': rateLimitResult.remaining?.uploads || 0,
          'X-RateLimit-Reset': rateLimitResult.resetTime || Date.now() + 900000,
          ...secureCorsHeaders
        },
        body: JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitResult.resetTime
        })
      };
    }

    // Verify vector store access
    const { data: vectorStore, error: vectorStoreError } = await supabase
      .from('user_vector_stores')
      .select('*')
      .eq('openai_vector_store_id', vectorStoreId)
      .eq('user_id', user.id)
      .single();

    if (vectorStoreError || !vectorStore) {
      return { 
        statusCode: 403, 
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        }, 
        body: JSON.stringify({ error: 'Vector store access denied' }) 
      };
    }

    console.log(`Processing file from Supabase Storage: ${supabaseFilePath}`);

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('user-uploads')
      .download(supabaseFilePath);

    if (downloadError || !fileData) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        },
        body: JSON.stringify({
          error: 'Failed to download file from storage',
          details: downloadError?.message
        })
      };
    }

    console.log(`File downloaded from storage, size: ${fileData.size} bytes`);

    // Upload to OpenAI
    let uploadedFile;
    try {
      // Create a File object from the downloaded blob
      const file = new File([fileData], fileName, { type: fileType });

      uploadedFile = await openai.files.create({
        file: file,
        purpose: 'assistants'
      });

      console.log(`OpenAI upload successful: ${uploadedFile.id}`);

    } catch (uploadError) {
      console.error('OpenAI upload failed:', uploadError.message);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        },
        body: JSON.stringify({
          error: 'File upload to OpenAI failed',
          details: uploadError.message
        })
      };
    }

    // Associate with vector store
    const vectorStoreResponse = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({ file_id: uploadedFile.id })
    });

    if (!vectorStoreResponse.ok) {
      const errorText = await vectorStoreResponse.text();
      console.error('Vector store association failed:', errorText);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        },
        body: JSON.stringify({
          error: 'Vector store association failed',
          details: errorText,
          uploadedFileId: uploadedFile.id
        })
      };
    }

    const vectorStoreFileAssociation = await vectorStoreResponse.json();
    console.log('Vector store association successful:', vectorStoreFileAssociation.id);

    // Create database record
    const documentId = crypto.randomUUID();

    const { data: documentRecord, error: documentError } = await supabase
      .from('user_documents')
      .insert({
        id: documentId,
        user_id: user.id,
        vector_store_id: vectorStore.id,
        openai_file_id: uploadedFile.id,
        openai_vector_store_file_id: vectorStoreFileAssociation.id,
        title: title.trim(),
        description: description || `File: ${fileName}`,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        category: category || 'other',
        tags: tags || [],
        is_private: true,
        upload_status: 'completed',
        processing_status: 'completed',
        uploaded_at: new Date().toISOString(),
        openai_metadata: { 
          openai_file: uploadedFile, 
          vector_store_file: vectorStoreFileAssociation,
          supabase_file_path: supabaseFilePath
        }
      })
      .select()
      .single();

    if (documentError) {
      console.error('Database insert failed:', documentError);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...secureCorsHeaders
        },
        body: JSON.stringify({ 
          error: 'Database record creation failed',
          openaiFileId: uploadedFile.id,
          details: documentError.message
        })
      };
    }

    // Update vector store stats
    await supabase
      .from('user_vector_stores')
      .update({
        document_count: vectorStore.document_count + 1,
        total_size_bytes: (vectorStore.total_size_bytes || 0) + (fileSize || 0),
        updated_at: new Date().toISOString()
      })
      .eq('id', vectorStore.id);

    // Clean up the temporary file from Supabase Storage
    try {
      await supabase.storage
        .from('user-uploads')
        .remove([supabaseFilePath]);
      console.log('Cleaned up temporary file from storage');
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError);
      // Not a critical error, continue
    }

    console.log('Upload completed successfully');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...secureCorsHeaders
      },
      body: JSON.stringify({
        message: 'Document uploaded successfully',
        documentId: documentId,
        uploadedFileId: uploadedFile.id,
        vectorStoreFileId: vectorStoreFileAssociation.id
      })
    };

  } catch (error) {
    console.error('Upload from storage error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...secureCorsHeaders
      },
      body: JSON.stringify({
        error: 'Upload failed',
        details: error.message
      })
    };
  }
};