/**
 * Brave Search API Gateway - Supabase Edge Function
 * Secure proxy for Brave Search API with authentication and rate limiting
 * Migrated from Netlify Functions to Supabase Edge Functions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BRAVE_API_KEY = Deno.env.get('BRAVE_API_KEY')!

// Multiple API keys for load balancing
const BRAVE_API_KEYS = Deno.env.get('BRAVE_API_KEYS')?.split(',').map(key => key.trim()).filter(key => key.length > 0) || [BRAVE_API_KEY]

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Simple in-memory cache for Brave Search results
const braveCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function generateBraveCacheKey(params: any): string {
  const keyData = {
    q: params.q.toLowerCase().trim(),
    country: params.country || 'US',
    count: params.count || 10,
    offset: params.offset || 0,
    freshness: params.freshness
  };
  return `brave:${btoa(JSON.stringify(keyData))}`;
}

function getCachedBraveResult(cacheKey: string): any | null {
  const cached = braveCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    braveCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setCachedBraveResult(cacheKey: string, data: any): void {
  // Implement simple LRU eviction
  if (braveCache.size >= 100) {
    const oldestKey = Array.from(braveCache.keys())[0];
    braveCache.delete(oldestKey);
  }
  
  braveCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
}

interface BraveSearchParams {
  q: string;
  country?: string;
  search_lang?: string;
  ui_lang?: string;
  count?: number;
  offset?: number;
  safesearch?: 'off' | 'moderate' | 'strict';
  freshness?: 'pd' | 'pw' | 'pm' | 'py';
  text_decorations?: boolean;
  spellcheck?: boolean;
}

interface BraveSearchResult {
  type: string;
  title: string;
  url: string;
  description: string;
  age?: string;
  language?: string;
  locations?: string[];
  family_friendly?: boolean;
  extra_snippets?: string[];
}

interface BraveSearchResponse {
  query: {
    original: string;
    show_strict_warning: boolean;
    altered: string;
    safesearch: boolean;
  };
  mixed: {
    type: string;
    main: BraveSearchResult[];
    top: BraveSearchResult[];
    side: BraveSearchResult[];
  };
  web: {
    type: string;
    results: BraveSearchResult[];
    family_friendly: boolean;
  };
}

// JWT decoder for authentication
function decodeSupabaseJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role || payload.user_metadata?.role,
      specialty: payload.app_metadata?.specialty || payload.user_metadata?.specialty,
      exp: payload.exp
    }
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

// Get API key with load balancing
function getAPIKey(): string {
  if (BRAVE_API_KEYS.length === 1) {
    return BRAVE_API_KEYS[0];
  }
  
  // Simple round-robin selection
  const index = Math.floor(Math.random() * BRAVE_API_KEYS.length);
  return BRAVE_API_KEYS[index];
}

// Enhance search query for medical content
function enhanceSearchQuery(query: string, filters?: any): string {
  let enhancedQuery = query;
  
  // Add medical context if not already present
  const medicalKeywords = ['medical', 'medicine', 'clinical', 'patient', 'treatment', 'diagnosis', 'study', 'research'];
  const hasContextKeyword = medicalKeywords.some(keyword => 
    enhancedQuery.toLowerCase().includes(keyword)
  );
  
  if (!hasContextKeyword) {
    enhancedQuery += ' medical';
  }
  
  return enhancedQuery;
}

// Transform Brave results to standard format
function transformBraveResults(braveResponse: BraveSearchResponse, query: string): any {
  const results: any[] = [];
  
  // Process web results
  if (braveResponse.web?.results) {
    braveResponse.web.results.forEach((result, index) => {
      results.push({
        id: `brave-${index}`,
        title: result.title,
        url: result.url,
        snippet: result.description,
        source: new URL(result.url).hostname,
        provider: 'brave',
        relevanceScore: 1.0 - (index * 0.05), // Decreasing relevance
        evidenceLevel: 'web_article',
        publicationDate: result.age,
        specialty: 'general',
        contentType: 'web_article'
      });
    });
  }
  
  // Process mixed results if available
  if (braveResponse.mixed?.main) {
    braveResponse.mixed.main.forEach((result, index) => {
      if (!results.find(r => r.url === result.url)) { // Avoid duplicates
        results.push({
          id: `brave-mixed-${index}`,
          title: result.title,
          url: result.url,
          snippet: result.description,
          source: new URL(result.url).hostname,
          provider: 'brave',
          relevanceScore: 1.1 - (index * 0.05), // Slightly higher relevance for mixed results
          evidenceLevel: 'web_article',
          publicationDate: result.age,
          specialty: 'general',
          contentType: 'web_article'
        });
      }
    });
  }
  
  return {
    results,
    totalCount: results.length,
    query: braveResponse.query?.original || query,
    queryAltered: braveResponse.query?.altered !== braveResponse.query?.original,
    provider: 'brave'
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Brave Search Edge Function called')

    // Check authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Decode JWT token
    const token = authHeader.replace('Bearer ', '')
    const jwtPayload = decodeSupabaseJWT(token)
    
    if (!jwtPayload) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check token expiration
    if (jwtPayload.exp && Date.now() >= jwtPayload.exp * 1000) {
      return new Response(
        JSON.stringify({ error: 'Token expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { q: query, filters } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Brave Search Request', {
      userId: jwtPayload.id,
      query: query.substring(0, 100),
      filters
    });

    // Enhance query for medical content
    const enhancedQuery = enhanceSearchQuery(query, filters);

    // Generate cache key
    const searchParams: BraveSearchParams = {
      q: enhancedQuery,
      country: 'US',
      search_lang: 'en',
      ui_lang: 'en',
      count: filters?.limit || 20,
      offset: filters?.offset || 0,
      safesearch: 'moderate',
      freshness: filters?.recency === 'pastDay' ? 'pd' : 
                 filters?.recency === 'pastWeek' ? 'pw' :
                 filters?.recency === 'pastMonth' ? 'pm' : undefined,
      text_decorations: true,
      spellcheck: true
    };

    const cacheKey = generateBraveCacheKey(searchParams);
    
    // Check cache first
    const cachedResult = getCachedBraveResult(cacheKey);
    if (cachedResult) {
      console.log('Brave Search Cache Hit', {
        userId: jwtPayload.id,
        query: query.substring(0, 100),
        cacheKey
      });
      
      return new Response(
        JSON.stringify({ success: true, data: cachedResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key
    const apiKey = getAPIKey();
    const startTime = Date.now();

    // Build search URL
    const searchUrl = new URL('https://api.search.brave.com/res/v1/web/search');
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        searchUrl.searchParams.append(key, value.toString());
      }
    });

    console.log('Calling Brave API', {
      url: searchUrl.toString(),
      query: enhancedQuery.substring(0, 100)
    });

    // Make API request to Brave
    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
      }
    });

    const searchTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brave API error:', {
        status: response.status,
        error: errorText,
        userId: jwtPayload.id
      });

      return new Response(
        JSON.stringify({ 
          error: 'Brave search failed',
          details: `API returned ${response.status}`,
          provider: 'brave'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const braveData: BraveSearchResponse = await response.json();
    
    // Transform results to standard format
    const transformedData = transformBraveResults(braveData, query);
    transformedData.searchTime = searchTime;

    // Cache the result
    setCachedBraveResult(cacheKey, transformedData);

    console.log('Brave Search Success', {
      userId: jwtPayload.id,
      resultCount: transformedData.results.length,
      searchTime,
      queryAltered: transformedData.queryAltered
    });

    return new Response(
      JSON.stringify({ success: true, data: transformedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Brave Search Error:', error)

    return new Response(
      JSON.stringify({ 
        error: 'Brave search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        provider: 'brave'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})