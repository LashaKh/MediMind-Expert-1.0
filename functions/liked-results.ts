/**
 * Liked Results API
 * Manages user's liked search results across all providers
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { parseRequest } from './utils/request';
import { logInfo, logError } from './utils/logger';
import { withAuth } from './utils/auth';

// Supabase integration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

interface LikedResultsResponse {
  results: LikedResult[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
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
async function getLikedResults(userId: string, filters: LikedResultsFilters = {}): Promise<LikedResultsResponse> {
  try {
    let query = `${SUPABASE_URL}/rest/v1/liked_search_results?select=*&user_id=eq.${userId}`;
    
    // Apply filters
    if (filters.provider) {
      query += `&provider=eq.${encodeURIComponent(filters.provider)}`;
    }
    if (filters.content_type) {
      query += `&content_type=eq.${encodeURIComponent(filters.content_type)}`;
    }
    if (filters.evidence_level) {
      query += `&evidence_level=eq.${encodeURIComponent(filters.evidence_level)}`;
    }
    if (filters.search) {
      // Search in title, snippet, and original_query
      query += `&or=(title.ilike.%25${encodeURIComponent(filters.search)}%25,snippet.ilike.%25${encodeURIComponent(filters.search)}%25,original_query.ilike.%25${encodeURIComponent(filters.search)}%25)`;
    }
    if (filters.tags && filters.tags.length > 0) {
      // Search for any of the specified tags
      const tagConditions = filters.tags.map(tag => `tags.cs.{${encodeURIComponent(tag)}}`).join(',');
      query += `&or=(${tagConditions})`;
    }
    
    // Sorting and pagination
    query += `&order=created_at.desc`;
    
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;
    
    const response = await fetch(query, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Range': `${offset}-${offset + limit - 1}`,
        'Prefer': 'count=exact'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Database query failed: ${response.status}`);
    }
    
    const results = await response.json();
    
    // Get total count from response headers
    const contentRange = response.headers.get('content-range');
    let total = 0;
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) {
        total = parseInt(match[1], 10);
      }
    }
    
    const likedResults: LikedResult[] = results.map((result: any) => ({
      id: result.id,
      user_id: result.user_id,
      result_id: result.result_id,
      provider: result.provider,
      title: result.title,
      url: result.url,
      snippet: result.snippet,
      source: result.source,
      content_type: result.content_type,
      evidence_level: result.evidence_level,
      relevance_score: result.relevance_score,
      published_date: result.published_date,
      notes: result.notes,
      tags: result.tags,
      original_query: result.original_query,
      search_filters: result.search_filters,
      created_at: result.created_at,
      updated_at: result.updated_at
    }));
    
    return {
      results: likedResults,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    };
    
  } catch (error) {
    logError('Failed to get liked results', { error, userId, filters });
    throw error;
  }
}

// Like a search result
async function likeResult(userId: string, likedResult: Omit<LikedResult, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ message: string; likedResult?: LikedResult; alreadyLiked?: boolean }> {
  try {
    // Check if already liked
    const existingQuery = `${SUPABASE_URL}/rest/v1/liked_search_results?user_id=eq.${userId}&result_id=eq.${encodeURIComponent(likedResult.result_id)}&provider=eq.${encodeURIComponent(likedResult.provider)}&select=id`;
    
    const existingResponse = await fetch(existingQuery, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      }
    });
    
    if (existingResponse.ok) {
      const existing = await existingResponse.json();
      if (existing.length > 0) {
        return {
          message: 'Result already liked',
          alreadyLiked: true
        };
      }
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
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/liked_search_results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(insertData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Database insert failed: ${response.status} - ${errorText}`);
    }
    
    const [newResult] = await response.json();
    
    return {
      message: 'Result liked successfully',
      likedResult: {
        id: newResult.id,
        user_id: newResult.user_id,
        result_id: newResult.result_id,
        provider: newResult.provider,
        title: newResult.title,
        url: newResult.url,
        snippet: newResult.snippet,
        source: newResult.source,
        content_type: newResult.content_type,
        evidence_level: newResult.evidence_level,
        relevance_score: newResult.relevance_score,
        published_date: newResult.published_date,
        notes: newResult.notes,
        tags: newResult.tags,
        original_query: newResult.original_query,
        search_filters: newResult.search_filters,
        created_at: newResult.created_at,
        updated_at: newResult.updated_at
      }
    };
    
  } catch (error) {
    logError('Failed to like result', { error, userId, likedResult });
    throw error;
  }
}

// Unlike a search result
async function unlikeResult(userId: string, resultId: string, provider: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/liked_search_results?user_id=eq.${userId}&result_id=eq.${encodeURIComponent(resultId)}&provider=eq.${encodeURIComponent(provider)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Database delete failed: ${response.status} - ${errorText}`);
    }
    
    return { message: 'Result unliked successfully' };
    
  } catch (error) {
    logError('Failed to unlike result', { error, userId, resultId, provider });
    throw error;
  }
}

// Update a liked result
async function updateLikedResult(userId: string, resultId: string, provider: string, updates: { notes?: string; tags?: string[] }): Promise<{ message: string; likedResult: LikedResult }> {
  try {
    const updateData: any = {};
    
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags;
    }
    
    updateData.updated_at = new Date().toISOString();
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/liked_search_results?user_id=eq.${userId}&result_id=eq.${encodeURIComponent(resultId)}&provider=eq.${encodeURIComponent(provider)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Database update failed: ${response.status} - ${errorText}`);
    }
    
    const [updatedResult] = await response.json();
    
    return {
      message: 'Result updated successfully',
      likedResult: {
        id: updatedResult.id,
        user_id: updatedResult.user_id,
        result_id: updatedResult.result_id,
        provider: updatedResult.provider,
        title: updatedResult.title,
        url: updatedResult.url,
        snippet: updatedResult.snippet,
        source: updatedResult.source,
        content_type: updatedResult.content_type,
        evidence_level: updatedResult.evidence_level,
        relevance_score: updatedResult.relevance_score,
        published_date: updatedResult.published_date,
        notes: updatedResult.notes,
        tags: updatedResult.tags,
        original_query: updatedResult.original_query,
        search_filters: updatedResult.search_filters,
        created_at: updatedResult.created_at,
        updated_at: updatedResult.updated_at
      }
    };
    
  } catch (error) {
    logError('Failed to update liked result', { error, userId, resultId, provider, updates });
    throw error;
  }
}

// Main handler
const baseHandler = async (event: HandlerEvent, user: any): Promise<HandlerResponse> => {
  try {
    const { method } = parseRequest(event);
    
    // Parse query parameters for filtering
    const params = new URLSearchParams(event.queryStringParameters || {});
    const filters: LikedResultsFilters = {
      provider: params.get('provider') || undefined,
      content_type: params.get('content_type') || undefined,
      evidence_level: params.get('evidence_level') || undefined,
      tags: params.get('tags') ? params.get('tags')!.split(',') : undefined,
      search: params.get('search') || undefined,
      limit: params.get('limit') ? parseInt(params.get('limit')!) : undefined,
      offset: params.get('offset') ? parseInt(params.get('offset')!) : undefined
    };
    
    if (method === 'GET') {
      // Get liked results
      const result = await getLikedResults(user.id, filters);
      return createSuccessResponse(result);
      
    } else if (method === 'POST') {
      // Like a result
      const body = JSON.parse(event.body || '{}');
      const result = await likeResult(user.id, body);
      return createSuccessResponse(result);
      
    } else if (method === 'DELETE') {
      // Unlike a result
      const resultId = params.get('result_id');
      const provider = params.get('provider');
      
      if (!resultId || !provider) {
        return createErrorResponse('Missing required parameters: result_id and provider', 400);
      }
      
      const result = await unlikeResult(user.id, resultId, provider);
      return createSuccessResponse(result);
      
    } else if (method === 'PUT') {
      // Update a liked result
      const body = JSON.parse(event.body || '{}');
      const { result_id, provider, notes, tags } = body;
      
      if (!result_id || !provider) {
        return createErrorResponse('Missing required parameters: result_id and provider', 400);
      }
      
      const result = await updateLikedResult(user.id, result_id, provider, { notes, tags });
      return createSuccessResponse(result);
      
    } else {
      return createErrorResponse('Method not allowed', 405);
    }
    
  } catch (error) {
    logError('Liked results API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return createErrorResponse('Failed to process liked results request', 500);
  }
};

// Apply authentication
const handler = withAuth(baseHandler);

export { handler };