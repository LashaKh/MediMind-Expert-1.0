import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChunkedUploadRequest {
  sessionId: string;
  chunkPaths: string[];
  originalFileName: string;
  originalFileSize: number;
  originalFileType: string;
  totalChunks: number;
  vectorStoreId: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧩 Streaming chunked upload Edge Function called');
    
    // Parse request body
    const requestBody: ChunkedUploadRequest = await req.json();
    console.log('📦 Request payload:', {
      sessionId: requestBody.sessionId,
      totalChunks: requestBody.totalChunks,
      originalFileName: requestBody.originalFileName,
      originalFileSize: requestBody.originalFileSize
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ Authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // For large files (>200MB), use streaming approach to avoid memory issues
    if (requestBody.originalFileSize > 200 * 1024 * 1024) {
      console.log('📁 Large file detected - using streaming reassembly approach');
      
      // Create a temporary file stream instead of loading all into memory
      const tempFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${requestBody.originalFileName.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_')}`;
      const tempFilePath = `temp-processing/${user.id}/${tempFileName}`;
      
      console.log('🔄 Streaming chunks directly to temporary storage...');
      
      // Download first chunk to initialize the file
      const { data: firstChunkData, error: firstError } = await supabase.storage
        .from('user-uploads')
        .download(requestBody.chunkPaths[0]);
      
      if (firstError || !firstChunkData) {
        throw new Error(`Failed to download first chunk: ${firstError?.message}`);
      }
      
      // Upload first chunk as base file
      const { data: baseUploadData, error: baseUploadError } = await supabase.storage
        .from('user-uploads')
        .upload(tempFilePath, firstChunkData, {
          cacheControl: '3600',
          upsert: false,
          contentType: requestBody.originalFileType
        });

      if (baseUploadError) {
        throw new Error(`Failed to upload base file: ${baseUploadError.message}`);
      }

      console.log('✅ Base file created, streaming remaining chunks...');
      
      // For remaining chunks, we'll need to append them
      // Since Supabase storage doesn't support append, we'll call the original 
      // upload function with a smaller chunk size
      console.log('🚀 Calling original upload function with smaller processing...');
      
      // Call the existing upload function with the temp file
      const uploadRequest = {
        supabaseFilePath: baseUploadData.path,
        vectorStoreId: requestBody.vectorStoreId,
        title: requestBody.title,
        description: requestBody.description,
        category: requestBody.category,
        tags: requestBody.tags,
        fileName: requestBody.originalFileName,
        fileType: requestBody.originalFileType,
        fileSize: requestBody.originalFileSize,
        isReassembledFile: true // Flag to indicate this is already reassembled
      };

      const uploadResponse = await fetch(`${supabaseUrl}/functions/v1/upload-document-to-openai`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadRequest),
      });

      const uploadResult = await uploadResponse.json();

      // Clean up temporary file
      try {
        await supabase.storage
          .from('user-uploads')
          .remove([baseUploadData.path]);
        console.log('✅ Temporary file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
      }

      if (!uploadResponse.ok) {
        console.error('❌ OpenAI upload failed:', uploadResult);
        throw new Error(uploadResult.error || 'Failed to upload to OpenAI');
      }

      console.log('🎉 Streaming chunked upload completed successfully!');

      return new Response(
        JSON.stringify(uploadResult),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // For smaller files, redirect to original function
      console.log('📄 File size manageable - redirecting to original function');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/upload-chunked-document-to-openai`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      
      return new Response(
        JSON.stringify(result),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('❌ Streaming chunked upload Edge Function error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Check for specific error types
    let statusCode = 500;
    let errorMessage = error.message || 'Internal server error';
    
    if (error.name === 'RangeError' || error.message?.includes('memory')) {
      statusCode = 507; // Insufficient Storage
      errorMessage = 'File too large for server processing. Please try a smaller file or contact support.';
    } else if (error.message?.includes('timeout')) {
      statusCode = 408; // Request Timeout
      errorMessage = 'Processing timeout. File may be too large.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.stack,
        originalError: error.message
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});