/**
 * Liked Results API - Supabase Edge Function
 * Manages user's liked search results across all providers
 * Migrated from Netlify Functions to Supabase Edge Functions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-georgian-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface LikedResult {
  id?: string;
  user_id?: string;
  result_id: string;
  provider: string;
  title: string;
  url: string;
  snippet?: string;
  source?: string;
  content_type?: string;
  evidence_level?: string;
  relevance_score?: number;
  published_date?: string;
  notes?: string;
  tags?: string[];
  original_query: string;
  search_filters?: any;
  created_at?: string;
  updated_at?: string;
}

interface LikedResultsFilters {
  provider?: string;
  content_type?: string;
  evidence_level?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

// Get user's liked results
async function getLikedResults(userId: string, filters: LikedResultsFilters = {}) {
  try {
    let query = supabase
      .from('liked_search_results')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters.provider) {
      query = query.eq('provider', filters.provider);
    }
    if (filters.content_type) {
      query = query.eq('content_type', filters.content_type);
    }
    if (filters.evidence_level) {
      query = query.eq('evidence_level', filters.evidence_level);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,snippet.ilike.%${filters.search}%,original_query.ilike.%${filters.search}%`);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // Apply pagination and sorting
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;
    
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: results, error, count } = await query;

    if (error) {
      console.error('Database query failed:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }

    return {
      success: true,
      data: {
        results: results || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
          hasMore: offset + limit < (count || 0)
        }
      }
    };

  } catch (error) {
    console.error('Failed to get liked results:', error);
    throw error;
  }
}

// Like a search result
async function likeResult(userId: string, likedResult: Omit<LikedResult, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  try {
    // Check if already liked
    const { data: existing } = await supabase
      .from('liked_search_results')
      .select('id')
      .eq('user_id', userId)
      .eq('result_id', likedResult.result_id)
      .eq('provider', likedResult.provider)
      .single();

    if (existing) {
      return {
        success: true,
        data: {
          message: 'Result already liked',
          alreadyLiked: true
        }
      };
    }

    // Insert new liked result
    const insertData = {
      user_id: userId,
      result_id: likedResult.result_id,
      provider: likedResult.provider,
      title: likedResult.title,
      url: likedResult.url,
      snippet: likedResult.snippet || null,
      source: likedResult.source || null,
      content_type: likedResult.content_type || null,
      evidence_level: likedResult.evidence_level || null,
      relevance_score: likedResult.relevance_score || null,
      published_date: likedResult.published_date || null,
      notes: likedResult.notes || '',
      tags: likedResult.tags || [],
      original_query: likedResult.original_query,
      search_filters: likedResult.search_filters || null
    };

    const { data: newResult, error } = await supabase
      .from('liked_search_results')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database insert failed:', error);
      throw new Error(`Database insert failed: ${error.message}`);
    }

    return {
      success: true,
      data: {
        message: 'Result liked successfully',
        likedResult: newResult
      }
    };

  } catch (error) {
    console.error('Failed to like result:', error);
    throw error;
  }
}

// Unlike a search result
async function unlikeResult(userId: string, resultId: string, provider: string) {
  try {
    const { error } = await supabase
      .from('liked_search_results')
      .delete()
      .eq('user_id', userId)
      .eq('result_id', resultId)
      .eq('provider', provider);

    if (error) {
      console.error('Database delete failed:', error);
      throw new Error(`Database delete failed: ${error.message}`);
    }

    return {
      success: true,
      data: {
        message: 'Result unliked successfully'
      }
    };

  } catch (error) {
    console.error('Failed to unlike result:', error);
    throw error;
  }
}

// Update a liked result
async function updateLikedResult(userId: string, resultId: string, provider: string, updates: { notes?: string; tags?: string[] }) {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags;
    }

    const { data: updatedResult, error } = await supabase
      .from('liked_search_results')
      .update(updateData)
      .eq('user_id', userId)
      .eq('result_id', resultId)
      .eq('provider', provider)
      .select()
      .single();

    if (error) {
      console.error('Database update failed:', error);
      throw new Error(`Database update failed: ${error.message}`);
    }

    return {
      success: true,
      data: {
        message: 'Result updated successfully',
        likedResult: updatedResult
      }
    };

  } catch (error) {
    console.error('Failed to update liked result:', error);
    throw error;
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    
    // Parse filters from query parameters
    const filters: LikedResultsFilters = {
      provider: params.get('provider') || undefined,
      content_type: params.get('content_type') || undefined,
      evidence_level: params.get('evidence_level') || undefined,
      tags: params.get('tags') ? params.get('tags')!.split(',') : undefined,
      search: params.get('search') || undefined,
      limit: params.get('limit') ? parseInt(params.get('limit')!) : undefined,
      offset: params.get('offset') ? parseInt(params.get('offset')!) : undefined
    };

    let result;

    if (req.method === 'GET') {
      // Get liked results
      result = await getLikedResults(user.id, filters);
      
    } else if (req.method === 'POST') {
      // Like a result
      const body = await req.json();
      result = await likeResult(user.id, body);
      
    } else if (req.method === 'DELETE') {
      // Unlike a result
      const resultId = params.get('result_id');
      const provider = params.get('provider');
      
      if (!resultId || !provider) {
        throw new Error('Missing required parameters: result_id and provider');
      }
      
      result = await unlikeResult(user.id, resultId, provider);
      
    } else if (req.method === 'PUT') {
      // Update a liked result
      const body = await req.json();
      const { result_id, provider, notes, tags } = body;
      
      if (!result_id || !provider) {
        throw new Error('Missing required parameters: result_id and provider');
      }
      
      result = await updateLikedResult(user.id, result_id, provider, { notes, tags });
      
    } else {
      throw new Error('Method not allowed');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Liked results API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('Authentication') ? 401 : 
                      errorMessage.includes('Method not allowed') ? 405 :
                      errorMessage.includes('Missing required parameters') ? 400 : 500;

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    )
  }
})