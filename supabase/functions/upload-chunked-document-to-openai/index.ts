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
    console.log('🧩 Chunked upload Edge Function called');
    
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

    // Download and reassemble chunks with memory optimization
    console.log('🔄 Downloading and reassembling chunks...');
    console.log('💾 Memory usage before download:', `${Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024 || 0)}MB`);
    
    // Check if file is too large for memory (>300MB)
    const totalSize = requestBody.originalFileSize;
    console.log('📏 File size for reassembly:', `${Math.round(totalSize / 1024 / 1024)}MB`);
    
    if (totalSize > 300 * 1024 * 1024) { // 300MB limit
      console.log('🚨 File too large for Edge Function memory - rejecting');
      return new Response(
        JSON.stringify({ 
          error: 'File too large for processing. Maximum supported file size is 300MB.',
          code: 'FILE_TOO_LARGE'
        }),
        { 
          status: 413, // Payload Too Large
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const reassembledFile = new Uint8Array(totalSize);
    let currentOffset = 0;
    
    // Download and write chunks directly to avoid storing all in memory
    for (let i = 0; i < requestBody.chunkPaths.length; i++) {
      const chunkPath = requestBody.chunkPaths[i];
      console.log(`📦 Downloading chunk ${i + 1}/${requestBody.chunkPaths.length}: ${chunkPath}`);
      
      const { data: chunkData, error: downloadError } = await supabase.storage
        .from('user-uploads')
        .download(chunkPath);
      
      if (downloadError) {
        console.error(`❌ Failed to download chunk ${i + 1}:`, downloadError);
        throw new Error(`Failed to download chunk ${i + 1}: ${downloadError.message}`);
      }
      
      if (!chunkData) {
        throw new Error(`Chunk ${i + 1} data is null`);
      }
      
      // Convert blob to Uint8Array and write directly to final array
      const arrayBuffer = await chunkData.arrayBuffer();
      const chunkArray = new Uint8Array(arrayBuffer);
      
      // Write chunk to final array
      reassembledFile.set(chunkArray, currentOffset);
      currentOffset += chunkArray.length;
      
      console.log(`✅ Chunk ${i + 1} written to final array. Offset: ${currentOffset}, Memory: ${Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024 || 0)}MB`);
      
      // Force garbage collection hint
      if (globalThis.gc) {
        globalThis.gc();
      }
    }

    console.log('🔗 File reassembled successfully');

    console.log('✅ File reassembled successfully:', {
      expectedSize: requestBody.originalFileSize,
      actualSize: reassembledFile.length,
      sizeMatch: reassembledFile.length === requestBody.originalFileSize
    });

    // Verify file size matches
    if (reassembledFile.length !== requestBody.originalFileSize) {
      throw new Error(`File size mismatch: expected ${requestBody.originalFileSize}, got ${reassembledFile.length}`);
    }

    // Upload reassembled file to temporary storage for OpenAI processing
    const tempFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${requestBody.originalFileName.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_')}`;
    const tempFilePath = `temp-processing/${user.id}/${tempFileName}`;
    
    console.log('📤 Uploading reassembled file to temporary storage:', tempFilePath);
    
    const { data: tempUploadData, error: tempUploadError } = await supabase.storage
      .from('user-uploads')
      .upload(tempFilePath, reassembledFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: requestBody.originalFileType
      });

    if (tempUploadError) {
      console.error('❌ Failed to upload reassembled file:', tempUploadError);
      throw new Error(`Failed to upload reassembled file: ${tempUploadError.message}`);
    }

    console.log('✅ Reassembled file uploaded to temporary storage');

    // Now call the existing upload-document-to-openai function
    const uploadRequest = {
      supabaseFilePath: tempUploadData.path,
      vectorStoreId: requestBody.vectorStoreId,
      title: requestBody.title,
      description: requestBody.description,
      category: requestBody.category,
      tags: requestBody.tags,
      fileName: requestBody.originalFileName,
      fileType: requestBody.originalFileType,
      fileSize: requestBody.originalFileSize
    };

    console.log('🚀 Calling upload-document-to-openai for processing...');
    
    // Call the existing upload function
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
        .remove([tempUploadData.path]);
      console.log('✅ Temporary file cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
    }

    if (!uploadResponse.ok) {
      console.error('❌ OpenAI upload failed:', uploadResult);
      throw new Error(uploadResult.error || 'Failed to upload to OpenAI');
    }

    console.log('🎉 Chunked upload completed successfully!');

    return new Response(
      JSON.stringify(uploadResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Chunked upload Edge Function error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // Check for specific error types
    let statusCode = 500;
    let errorMessage = error.message || 'Internal server error';
    
    if (error.name === 'RangeError' || error.message?.includes('memory')) {
      statusCode = 507; // Insufficient Storage
      errorMessage = 'File too large for server memory. Try a smaller file.';
    } else if (error.message?.includes('timeout')) {
      statusCode = 408; // Request Timeout
      errorMessage = 'Processing timeout. File may be too large.';
    } else if (error.message?.includes('download') || error.message?.includes('storage')) {
      statusCode = 502; // Bad Gateway
      errorMessage = 'Storage access error during processing.';
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