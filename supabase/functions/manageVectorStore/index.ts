import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import OpenAI from 'https://deno.land/x/openai@v4.33.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
};

console.log('Edge function `manageVectorStore` initializing...');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('CRITICAL: Required environment variables not set.');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Initialize clients
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
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

    // Parse request based on method
    if (req.method === 'POST') {
      // Create Vector Store
      const body = await req.json();
      const { name, description } = body;

      if (!name) {
        return new Response(JSON.stringify({ error: 'Vector Store name is required.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      console.log(`Creating Vector Store for user ${user.id}: ${name}`);

      try {
        // Check if user already has a Vector Store
        const { data: existingStore } = await supabase
          .from('user_vector_stores')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingStore) {
          return new Response(JSON.stringify({ 
            error: 'User already has a Vector Store. Only one Vector Store per user is currently supported.',
            existingStore: {
              id: existingStore.id,
              name: existingStore.name,
              openai_vector_store_id: existingStore.openai_vector_store_id
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 409,
          });
        }

        // Create Vector Store in OpenAI
        const vectorStore = await openai.beta.vectorStores.create({
          name: `${name} - ${user.email || user.id}`,
          file_counts: {},
        });

        console.log(`Vector Store created in OpenAI: ${vectorStore.id}`);

        // Save to database
        const { data: dbRecord, error: dbError } = await supabase
          .from('user_vector_stores')
          .insert({
            user_id: user.id,
            openai_vector_store_id: vectorStore.id,
            name: name.trim(),
            description: description?.trim() || '',
            status: 'active',
            openai_metadata: vectorStore
          })
          .select()
          .single();

        if (dbError) {
          console.error('Failed to save Vector Store to database:', dbError);
          // Try to clean up the OpenAI Vector Store
          try {
            await openai.beta.vectorStores.del(vectorStore.id);
          } catch (cleanupError) {
            console.error('Failed to cleanup OpenAI Vector Store:', cleanupError);
          }
          
          return new Response(JSON.stringify({ error: 'Failed to save Vector Store metadata.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        return new Response(JSON.stringify({
          message: 'Vector Store created successfully.',
          vectorStore: {
            id: dbRecord.id,
            openai_vector_store_id: vectorStore.id,
            name: dbRecord.name,
            description: dbRecord.description,
            status: dbRecord.status,
            document_count: dbRecord.document_count,
            created_at: dbRecord.created_at
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });

      } catch (error) {
        console.error('Error creating Vector Store:', error);
        return new Response(JSON.stringify({
          error: error.message || 'Failed to create Vector Store.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

    } else if (req.method === 'GET') {
      // Get user's Vector Store
      console.log(`Getting Vector Store for user ${user.id}`);

      const { data: vectorStore, error: dbError } = await supabase
        .from('user_vector_stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (dbError) {
        if (dbError.code === 'PGRST116') { // No rows returned
          return new Response(JSON.stringify({
            message: 'No Vector Store found for user.',
            vectorStore: null
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
        
        console.error('Database error getting Vector Store:', dbError);
        return new Response(JSON.stringify({ error: 'Failed to get Vector Store.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      // Optionally get fresh status from OpenAI
      try {
        const openaiVectorStore = await openai.beta.vectorStores.retrieve(vectorStore.openai_vector_store_id);
        
        // Update our database with latest OpenAI data
        await supabase
          .from('user_vector_stores')
          .update({
            openai_metadata: openaiVectorStore,
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', vectorStore.id);

        return new Response(JSON.stringify({
          vectorStore: {
            id: vectorStore.id,
            openai_vector_store_id: vectorStore.openai_vector_store_id,
            name: vectorStore.name,
            description: vectorStore.description,
            status: vectorStore.status,
            document_count: vectorStore.document_count,
            total_size_bytes: vectorStore.total_size_bytes,
            created_at: vectorStore.created_at,
            updated_at: vectorStore.updated_at,
            openai_status: openaiVectorStore.status,
            openai_file_counts: openaiVectorStore.file_counts
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      } catch (openaiError) {
        console.error('Error getting Vector Store from OpenAI:', openaiError);
        // Return database data even if OpenAI call fails
        return new Response(JSON.stringify({
          vectorStore: {
            id: vectorStore.id,
            openai_vector_store_id: vectorStore.openai_vector_store_id,
            name: vectorStore.name,
            description: vectorStore.description,
            status: vectorStore.status,
            document_count: vectorStore.document_count,
            total_size_bytes: vectorStore.total_size_bytes,
            created_at: vectorStore.created_at,
            updated_at: vectorStore.updated_at,
            openai_error: openaiError.message
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

    } else if (req.method === 'DELETE') {
      // Delete Vector Store
      console.log(`Deleting Vector Store for user ${user.id}`);

      const { data: vectorStore, error: dbError } = await supabase
        .from('user_vector_stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (dbError) {
        if (dbError.code === 'PGRST116') { // No rows returned
          return new Response(JSON.stringify({
            message: 'No Vector Store found to delete.',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        
        console.error('Database error getting Vector Store for deletion:', dbError);
        return new Response(JSON.stringify({ error: 'Failed to find Vector Store.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      try {
        // Mark as deleting in database
        await supabase
          .from('user_vector_stores')
          .update({ status: 'deleting' })
          .eq('id', vectorStore.id);

        // Delete from OpenAI
        await openai.beta.vectorStores.del(vectorStore.openai_vector_store_id);
        console.log(`Vector Store ${vectorStore.openai_vector_store_id} deleted from OpenAI`);

        // Delete all associated documents from database
        const { error: documentsDeleteError } = await supabase
          .from('user_documents')
          .delete()
          .eq('vector_store_id', vectorStore.id);

        if (documentsDeleteError) {
          console.error('Error deleting associated documents:', documentsDeleteError);
        }

        // Delete Vector Store from database
        const { error: vectorStoreDeleteError } = await supabase
          .from('user_vector_stores')
          .delete()
          .eq('id', vectorStore.id);

        if (vectorStoreDeleteError) {
          console.error('Error deleting Vector Store from database:', vectorStoreDeleteError);
          return new Response(JSON.stringify({ error: 'Failed to delete Vector Store metadata.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        return new Response(JSON.stringify({
          message: 'Vector Store deleted successfully.',
          deletedVectorStoreId: vectorStore.openai_vector_store_id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      } catch (error) {
        console.error('Error deleting Vector Store:', error);
        
        // Update status back to error
        await supabase
          .from('user_vector_stores')
          .update({ status: 'error' })
          .eq('id', vectorStore.id);

        return new Response(JSON.stringify({
          error: error.message || 'Failed to delete Vector Store.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

  } catch (error) {
    console.error('Error in manageVectorStore function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

console.log('Edge function `manageVectorStore` is ready to serve requests.'); 