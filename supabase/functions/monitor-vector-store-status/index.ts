import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VectorStoreFileStatus {
  id: string;
  status: 'in_progress' | 'completed' | 'cancelled' | 'failed';
  usage_bytes?: number;
  created_at: number;
  last_error?: {
    code: string;
    message: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Vector Store Status Monitor function called');

    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const { documentId, checkAll = false, hoursBack = 24 } = await req.json();

    let documentsToCheck: any[] = [];

    if (documentId) {
      // Check specific document
      console.log('🔍 Checking specific document:', documentId);
      
      const { data: doc, error: fetchError } = await supabase
        .from('user_documents')
        .select(`
          id,
          openai_file_id,
          openai_vector_store_file_id,
          title,
          upload_status,
          processing_status,
          file_size,
          user_vector_stores!inner (
            openai_vector_store_id
          )
        `)
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !doc) {
        return new Response(JSON.stringify({ error: 'Document not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      documentsToCheck = [doc];
    } else {
      // Check all recent documents or all user documents
      const query = supabase
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
        .eq('user_id', user.id)
        .in('upload_status', ['completed']);

      if (!checkAll) {
        // Only check recent uploads
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - hoursBack);
        query.gte('created_at', cutoffTime.toISOString());
      }

      const { data: docs, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        return new Response(JSON.stringify({ error: 'Failed to fetch documents' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      documentsToCheck = docs || [];
    }

    console.log(`📊 Monitoring ${documentsToCheck.length} documents`);

    const results = [];
    let updatedCount = 0;

    for (const doc of documentsToCheck) {
      if (!doc.openai_file_id || !doc.user_vector_stores?.openai_vector_store_id) {
        console.log(`⚠️ Skipping document ${doc.title} - missing OpenAI identifiers`);
        continue;
      }

      console.log(`🔍 Checking: "${doc.title}" (${Math.round((doc.file_size || 0) / 1024 / 1024)}MB)`);

      try {
        // Check OpenAI Vector Store file status
        const response = await fetch(`https://api.openai.com/v1/vector_stores/${doc.user_vector_stores.openai_vector_store_id}/files/${doc.openai_file_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!response.ok) {
          console.log(`❌ OpenAI API error for ${doc.title}:`, response.status);
          continue;
        }

        const openaiStatus: VectorStoreFileStatus = await response.json();
        console.log(`📄 OpenAI status for "${doc.title}":`, openaiStatus.status);

        // Determine if we need to update our database
        const shouldUpdate = 
          (openaiStatus.status === 'failed' && doc.processing_status !== 'failed') ||
          (openaiStatus.status === 'completed' && doc.processing_status !== 'completed') ||
          (openaiStatus.status === 'in_progress' && doc.processing_status === 'completed');

        const result = {
          documentId: doc.id,
          title: doc.title,
          fileSize: doc.file_size,
          currentStatus: doc.processing_status,
          actualStatus: openaiStatus.status,
          shouldUpdate,
          errorDetails: openaiStatus.last_error ? 
            `${openaiStatus.last_error.code}: ${openaiStatus.last_error.message}` : 
            null
        };

        results.push(result);

        // Update database if needed
        if (shouldUpdate) {
          console.log(`🔄 Updating "${doc.title}": ${doc.processing_status} → ${openaiStatus.status}`);
          
          const updateData: any = {
            processing_status: openaiStatus.status,
            updated_at: new Date().toISOString()
          };

          if (openaiStatus.last_error) {
            updateData.error_message = `${openaiStatus.last_error.code}: ${openaiStatus.last_error.message}`;
          }

          if (openaiStatus.usage_bytes) {
            updateData.processing_metadata = {
              openai_usage_bytes: openaiStatus.usage_bytes,
              last_status_check: new Date().toISOString()
            };
          }

          const { error: updateError } = await supabase
            .from('user_documents')
            .update(updateData)
            .eq('id', doc.id);

          if (updateError) {
            console.error(`❌ Failed to update ${doc.title}:`, updateError);
          } else {
            console.log(`✅ Updated "${doc.title}" status to: ${openaiStatus.status}`);
            updatedCount++;
          }
        } else {
          console.log(`✅ Status in sync for "${doc.title}": ${openaiStatus.status}`);
        }

        // Add delay between requests to avoid rate limiting
        if (documentsToCheck.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`❌ Error checking ${doc.title}:`, error);
        results.push({
          documentId: doc.id,
          title: doc.title,
          error: error.message,
          currentStatus: doc.processing_status,
          actualStatus: 'unknown',
          shouldUpdate: false
        });
      }
    }

    console.log(`📊 Monitoring complete. Updated ${updatedCount} documents`);

    return new Response(JSON.stringify({
      success: true,
      message: `Monitored ${documentsToCheck.length} documents, updated ${updatedCount}`,
      results,
      summary: {
        total: documentsToCheck.length,
        updated: updatedCount,
        failed: results.filter(r => r.actualStatus === 'failed').length,
        completed: results.filter(r => r.actualStatus === 'completed').length,
        inProgress: results.filter(r => r.actualStatus === 'in_progress').length
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Monitor function error:', error);
    
    return new Response(JSON.stringify({
      error: 'Monitoring failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

console.log('🔍 Vector Store Status Monitor Edge Function ready');