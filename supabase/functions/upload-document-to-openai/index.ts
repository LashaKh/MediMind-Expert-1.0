import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import OpenAI from 'https://deno.land/x/openai@v4.33.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// CORS configuration for MediMind Expert
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-auth-token, x-csrf-token, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin'
};

// Advanced rate limiting configuration
const RATE_LIMIT_CONFIG = {
  DEFAULT_LIMITS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxUploads: 10,
    maxTotalSize: 500 * 1024 * 1024, // 500MB total per window (for single massive files)
    maxProcessingTime: 900 * 1000, // 15 minutes total processing time
  },
  SIZE_PENALTIES: {
    SMALL_FILE: 1.0,    // < 1MB
    MEDIUM_FILE: 1.5,   // 1-10MB
    LARGE_FILE: 2.0,    // 10-25MB
    HUGE_FILE: 3.0,     // 25-100MB
    MASSIVE_FILE: 5.0,  // 100-500MB
  }
};

// Simple in-memory rate limiting store for Edge Functions
const rateLimitStore = new Map();

function calculateFileSizePenalty(fileSize: number): number {
  if (fileSize > 100 * 1024 * 1024) {
    return RATE_LIMIT_CONFIG.SIZE_PENALTIES.MASSIVE_FILE;
  } else if (fileSize > 25 * 1024 * 1024) {
    return RATE_LIMIT_CONFIG.SIZE_PENALTIES.HUGE_FILE;
  } else if (fileSize > 10 * 1024 * 1024) {
    return RATE_LIMIT_CONFIG.SIZE_PENALTIES.LARGE_FILE;
  } else if (fileSize > 1024 * 1024) {
    return RATE_LIMIT_CONFIG.SIZE_PENALTIES.MEDIUM_FILE;
  }
  return RATE_LIMIT_CONFIG.SIZE_PENALTIES.SMALL_FILE;
}

function checkRateLimit(userId: string, fileSize: number): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `user:${userId}`;
  const entry = rateLimitStore.get(key) || {
    uploads: [],
    totalSize: 0,
    lastReset: now
  };

  // Clean old uploads outside window
  const windowStart = now - RATE_LIMIT_CONFIG.DEFAULT_LIMITS.windowMs;
  entry.uploads = entry.uploads.filter((upload: any) => upload.timestamp > windowStart);
  
  // Recalculate total size
  entry.totalSize = entry.uploads.reduce((sum: number, upload: any) => sum + upload.fileSize, 0);

  // Apply size penalty
  const sizePenalty = calculateFileSizePenalty(fileSize);
  const adjustedMaxUploads = Math.floor(RATE_LIMIT_CONFIG.DEFAULT_LIMITS.maxUploads / sizePenalty);
  const adjustedMaxSize = Math.floor(RATE_LIMIT_CONFIG.DEFAULT_LIMITS.maxTotalSize / sizePenalty);

  // Check limits
  const uploadCount = entry.uploads.length;
  const wouldExceedCount = uploadCount >= adjustedMaxUploads;
  const wouldExceedSize = (entry.totalSize + fileSize) > adjustedMaxSize;

  if (wouldExceedCount || wouldExceedSize) {
    rateLimitStore.set(key, entry);
    return {
      allowed: false,
      remaining: Math.max(0, adjustedMaxUploads - uploadCount),
      resetTime: Math.min(...entry.uploads.map((u: any) => u.timestamp)) + RATE_LIMIT_CONFIG.DEFAULT_LIMITS.windowMs
    };
  }

  // Record successful upload
  entry.uploads.push({
    timestamp: now,
    fileSize: fileSize
  });
  entry.totalSize += fileSize;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, adjustedMaxUploads - uploadCount - 1),
    resetTime: now + RATE_LIMIT_CONFIG.DEFAULT_LIMITS.windowMs
  };
}

console.log('Edge function `upload-document-to-openai` initializing...');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)');
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    console.log('Upload from Supabase Storage function starting');

    // Validate environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('CRITICAL: Required environment variables not set.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing environment variables.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Parse JSON request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
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
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: supabaseFilePath, vectorStoreId, title' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize clients
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(user.id, fileSize || 0);
    
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
        resetTime: rateLimitResult.resetTime,
        remaining: rateLimitResult.remaining
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
        status: 429,
      });
    }

    // Verify vector store access
    const { data: vectorStore, error: vectorStoreError } = await supabase
      .from('user_vector_stores')
      .select('*')
      .eq('openai_vector_store_id', vectorStoreId)
      .eq('user_id', user.id)
      .single();

    if (vectorStoreError || !vectorStore) {
      return new Response(JSON.stringify({ error: 'Vector store access denied.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    console.log(`Processing file from Supabase Storage: ${supabaseFilePath}`);

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('user-uploads')
      .download(supabaseFilePath);

    if (downloadError || !fileData) {
      return new Response(JSON.stringify({
        error: 'Failed to download file from storage',
        details: downloadError?.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log(`File downloaded from storage, size: ${fileData.size} bytes`);

    // Convert Blob to File for OpenAI upload
    let uploadedFile;
    try {
      // Convert blob to array buffer then to Uint8Array for Deno File API
      const arrayBuffer = await fileData.arrayBuffer();
      const fileForUpload = new File([arrayBuffer], fileName, { type: fileType });

      uploadedFile = await openai.files.create({
        file: fileForUpload,
        purpose: 'assistants'
      });

      console.log(`OpenAI upload successful: ${uploadedFile.id}`);

    } catch (uploadError) {
      console.error('OpenAI upload failed:', uploadError.message);
      
      return new Response(JSON.stringify({
        error: 'File upload to OpenAI failed',
        details: uploadError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Associate file with vector store
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
      
      return new Response(JSON.stringify({
        error: 'Vector store association failed',
        details: errorText,
        uploadedFileId: uploadedFile.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
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
      return new Response(JSON.stringify({ 
        error: 'Database record creation failed',
        openaiFileId: uploadedFile.id,
        details: documentError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
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

    return new Response(JSON.stringify({
      message: 'Document uploaded successfully',
      documentId: documentId,
      uploadedFileId: uploadedFile.id,
      vectorStoreFileId: vectorStoreFileAssociation.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Upload from storage error:', error);
    
    return new Response(JSON.stringify({
      error: 'Upload failed',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

console.log('Edge function `upload-document-to-openai` is ready to serve requests.');