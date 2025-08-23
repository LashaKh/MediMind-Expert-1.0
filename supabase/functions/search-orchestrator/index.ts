/**
 * Search Orchestrator - Supabase Edge Function
 * Coordinates multiple search providers with intelligent fallback and result aggregation
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

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface SearchProvider {
  name: 'brave' | 'exa' | 'perplexity';
  enabled: boolean;
  priority: number;
  timeout: number;
}

interface SearchRequest {
  q: string;
  providers?: string[];
  parallel?: boolean;
  aggregateResults?: boolean;
  filters?: {
    specialty?: string;
    evidenceLevel?: string[];
    contentType?: string[];
    recency?: string;
    limit?: number;
    offset?: number;
  };
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  provider: string;
  relevanceScore: number;
  evidenceLevel?: string;
  publicationDate?: string;
  specialty?: string;
  contentType?: string;
}

interface ProviderResponse {
  provider: string;
  success: boolean;
  results: SearchResult[];
  totalCount: number;
  searchTime: number;
  error?: string;
  metadata?: any;
}

interface OrchestrationResult {
  results: SearchResult[];
  providers: ProviderResponse[];
  aggregatedCount: number;
  totalSearchTime: number;
  query: string;
  duplicatesRemoved: number;
  bestProvider?: string;
  cacheHit?: boolean;
  cacheKey?: string;
}

const SEARCH_PROVIDERS: SearchProvider[] = [
  {
    name: 'brave',
    enabled: true,
    priority: 1,
    timeout: 10000 // 10 seconds
  },
  {
    name: 'exa',
    enabled: true,
    priority: 2,
    timeout: 15000 // 15 seconds
  },
  {
    name: 'perplexity',
    enabled: true,
    priority: 3,
    timeout: 20000 // 20 seconds for AI processing
  }
];

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 30 * 60 * 1000, // 30 minutes in milliseconds
  maxCacheSize: 1000, // Maximum number of cached queries
  enableCompression: true,
  enableMedicalClassification: true
};

// In-memory cache store (Edge Functions are stateless, consider using Supabase for persistent cache)
const searchCache = new Map<string, {
  data: OrchestrationResult;
  timestamp: number;
  ttl: number;
  accessCount: number;
}>();

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

// Get user profile from database
async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('medical_specialty, role, specialty')
      .eq('id', userId)
      .single()

    if (!error && data) {
      return {
        specialty: data?.medical_specialty || data?.specialty,
        role: data?.role
      }
    }
    return {}
  } catch (error) {
    console.error('Error getting user profile:', error)
    return {}
  }
}

function generateCacheKey(query: string, filters: SearchRequest['filters']): string {
  const normalizedQuery = query.toLowerCase().trim();
  const filterString = JSON.stringify(filters || {});
  return `search:${btoa(`${normalizedQuery}:${filterString}`)}`;
}

function getCachedResult(cacheKey: string): OrchestrationResult | null {
  const cached = searchCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  const now = Date.now();
  
  // Check if cache entry has expired
  if (now - cached.timestamp > cached.ttl) {
    searchCache.delete(cacheKey);
    return null;
  }
  
  // Update access count for cache analytics
  cached.accessCount++;
  
  console.log('Cache hit', {
    cacheKey,
    accessCount: cached.accessCount,
    age: now - cached.timestamp
  });
  
  return {
    ...cached.data,
    cacheHit: true,
    cacheKey
  };
}

function setCachedResult(
  cacheKey: string, 
  result: OrchestrationResult, 
  ttl: number = CACHE_CONFIG.defaultTTL
): void {
  // Implement LRU eviction if cache is full
  if (searchCache.size >= CACHE_CONFIG.maxCacheSize) {
    const oldestKey = Array.from(searchCache.keys())[0];
    searchCache.delete(oldestKey);
  }
  
  searchCache.set(cacheKey, {
    data: result,
    timestamp: Date.now(),
    ttl,
    accessCount: 1
  });
  
  console.log('Result cached', {
    cacheKey,
    resultCount: result.results.length,
    ttl
  });
}

function clearExpiredCache(): void {
  const now = Date.now();
  let clearedCount = 0;
  
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      searchCache.delete(key);
      clearedCount++;
    }
  }
  
  if (clearedCount > 0) {
    console.log('Cache cleanup', { clearedCount, remainingCount: searchCache.size });
  }
}

async function enhanceResultsWithClassification(results: SearchResult[], query: string): Promise<SearchResult[]> {
  if (!CACHE_CONFIG.enableMedicalClassification) {
    return results;
  }
  
  // For now, return results as-is until classification is properly integrated
  // In production, this would include the full medical classification logic
  console.log('Medical classification enhancement', { 
    resultCount: results.length,
    query: query.substring(0, 50)
  });
  
  return results.map(result => ({
    ...result,
    // Placeholder classification data
    evidenceLevel: 'research_paper',
    specialty: 'general',
    contentType: 'research_paper'
  }));
}

function determineCacheTTL(query: string, filters: SearchRequest['filters']): number {
  const queryLower = query.toLowerCase();
  
  // Shorter TTL for time-sensitive medical queries
  const timeSensitiveKeywords = [
    'breaking', 'news', 'urgent', 'alert', 'outbreak', 'emergency',
    'latest', 'recent', 'current', 'today', 'this week'
  ];
  
  if (timeSensitiveKeywords.some(keyword => queryLower.includes(keyword))) {
    return 10 * 60 * 1000; // 10 minutes
  }
  
  // Shorter TTL for queries with recency filters
  if (filters?.recency === 'pastWeek' || filters?.recency === 'pastDay') {
    return 15 * 60 * 1000; // 15 minutes
  }
  
  if (filters?.recency === 'pastMonth') {
    return 60 * 60 * 1000; // 1 hour
  }
  
  // Longer TTL for established medical knowledge
  const stableKeywords = [
    'anatomy', 'physiology', 'pathophysiology', 'pharmacology',
    'diagnosis', 'treatment', 'guidelines', 'protocol'
  ];
  
  if (stableKeywords.some(keyword => queryLower.includes(keyword))) {
    return 2 * 60 * 60 * 1000; // 2 hours
  }
  
  // Default TTL
  return CACHE_CONFIG.defaultTTL;
}

async function storeSearchInDatabase(
  userId: string,
  query: string,
  result: OrchestrationResult,
  cacheKey: string
): Promise<void> {
  try {
    // Store in search_history for analytics
    const { error: historyError } = await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        query: query.substring(0, 500), // Truncate long queries
        providers_used: result.providers.filter(p => p.success).map(p => p.provider),
        result_count: result.results.length,
        search_time_ms: result.totalSearchTime,
        filters_applied: {},
        cache_hit: result.cacheHit || false
      });

    // Store in search_result_cache for future use
    if (result.results.length > 0 && !result.cacheHit) {
      const { error: cacheError } = await supabase
        .from('search_result_cache')
        .insert({
          cache_key: cacheKey,
          query_hash: btoa(query),
          results: result.results.slice(0, 20), // Store top 20 results
          providers_used: result.providers.filter(p => p.success).map(p => p.provider),
          search_metadata: {
            duplicatesRemoved: result.duplicatesRemoved,
            bestProvider: result.bestProvider,
            totalSearchTime: result.totalSearchTime
          },
          expires_at: new Date(Date.now() + determineCacheTTL(query, {})).toISOString()
        });
      
      if (cacheError) {
        console.error('Failed to cache results in database', {
          error: cacheError,
          cacheKey
        });
      }
    }

    if (historyError) {
      console.error('Failed to store search history', {
        error: historyError,
        userId
      });
    }
  } catch (error) {
    console.error('Database storage error', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function callSearchProvider(
  provider: SearchProvider,
  request: SearchRequest,
  baseUrl: string
): Promise<ProviderResponse> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), provider.timeout);

    const response = await fetch(`${baseUrl}/functions/v1/search-${provider.name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        q: request.q,
        filters: request.filters
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Provider ${provider.name} returned ${response.status}`);
    }

    const data = await response.json();
    const searchTime = Date.now() - startTime;

    return {
      provider: provider.name,
      success: true,
      results: data.results || [],
      totalCount: data.totalCount || 0,
      searchTime,
      metadata: {
        model: data.model,
        usage: data.usage,
        autopromptUsed: data.autopromptUsed,
        queryAltered: data.queryAltered
      }
    };

  } catch (error) {
    const searchTime = Date.now() - startTime;
    
    return {
      provider: provider.name,
      success: false,
      results: [],
      totalCount: 0,
      searchTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function executeParallelSearch(
  request: SearchRequest,
  enabledProviders: SearchProvider[],
  baseUrl: string
): Promise<ProviderResponse[]> {
  console.log('Executing parallel search', {
    providers: enabledProviders.map(p => p.name),
    query: request.q.substring(0, 100)
  });

  const searchPromises = enabledProviders.map(provider =>
    callSearchProvider(provider, request, baseUrl)
  );

  return Promise.all(searchPromises);
}

async function executeSequentialSearch(
  request: SearchRequest,
  enabledProviders: SearchProvider[],
  baseUrl: string
): Promise<ProviderResponse[]> {
  console.log('Executing sequential search', {
    providers: enabledProviders.map(p => p.name),
    query: request.q.substring(0, 100)
  });

  const responses: ProviderResponse[] = [];
  
  for (const provider of enabledProviders) {
    const response = await callSearchProvider(provider, request, baseUrl);
    responses.push(response);
    
    // If we got good results, we might stop early for performance
    if (response.success && response.results.length >= 5) {
      console.log('Sequential search early termination', {
        provider: provider.name,
        resultCount: response.results.length
      });
      break;
    }
  }

  return responses;
}

function aggregateResults(responses: ProviderResponse[]): SearchResult[] {
  const allResults: SearchResult[] = [];
  
  // Collect all results
  responses.forEach(response => {
    if (response.success) {
      allResults.push(...response.results);
    }
  });

  // Remove duplicates based on URL
  const seen = new Set<string>();
  const uniqueResults: SearchResult[] = [];
  
  allResults.forEach(result => {
    const normalizedUrl = normalizeUrl(result.url);
    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl);
      uniqueResults.push(result);
    }
  });

  // Sort by relevance score (highest first)
  uniqueResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return uniqueResults;
}

function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common URL variations
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function calculateDuplicatesRemoved(totalResults: number, uniqueResults: number): number {
  return Math.max(0, totalResults - uniqueResults);
}

function selectBestProvider(responses: ProviderResponse[]): string | undefined {
  const successfulResponses = responses.filter(r => r.success && r.results.length > 0);
  
  if (successfulResponses.length === 0) {
    return undefined;
  }

  // Score providers based on result count, response time, and quality
  const scoredProviders = successfulResponses.map(response => {
    let score = 0;
    
    // Result count score (0-40 points)
    score += Math.min(response.results.length * 4, 40);
    
    // Response time score (0-30 points, faster is better)
    score += Math.max(0, 30 - (response.searchTime / 1000));
    
    // Quality score based on average relevance (0-30 points)
    const avgRelevance = response.results.reduce((sum, r) => sum + r.relevanceScore, 0) / response.results.length;
    score += avgRelevance * 30;
    
    return {
      provider: response.provider,
      score
    };
  });

  scoredProviders.sort((a, b) => b.score - a.score);
  return scoredProviders[0].provider;
}

function applyFilters(results: SearchResult[], filters: SearchRequest['filters']): SearchResult[] {
  let filteredResults = [...results];

  if (filters?.evidenceLevel && filters.evidenceLevel.length > 0) {
    filteredResults = filteredResults.filter(result =>
      filters.evidenceLevel?.includes(result.evidenceLevel || 'unknown')
    );
  }

  if (filters?.contentType && filters.contentType.length > 0) {
    filteredResults = filteredResults.filter(result =>
      filters.contentType?.includes(result.contentType || 'unknown')
    );
  }

  if (filters?.specialty) {
    filteredResults = filteredResults.filter(result =>
      result.specialty === filters.specialty || !result.specialty
    );
  }

  // Apply limit and offset
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 20;
  
  return filteredResults.slice(offset, offset + limit);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Search Orchestrator Edge Function called')

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

    const request: SearchRequest = await req.json();
    
    if (!request.q || typeof request.q !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile
    const profile = await getUserProfile(jwtPayload.id)
    const user = {
      ...jwtPayload,
      specialty: profile.specialty || jwtPayload.specialty,
      role: profile.role || jwtPayload.role
    }

    // Clear expired cache entries periodically
    clearExpiredCache();

    // Generate cache key for this request
    const cacheKey = generateCacheKey(request.q, request.filters);
    
    // Check cache first
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      console.log('Search Orchestrator Cache Hit', {
        userId: user.id,
        query: request.q.substring(0, 100),
        cacheKey,
        resultCount: cachedResult.results.length
      });
      
      return new Response(
        JSON.stringify({ success: true, data: cachedResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Search Orchestrator Request', {
      userId: user.id,
      query: request.q.substring(0, 100),
      providers: request.providers,
      parallel: request.parallel,
      aggregateResults: request.aggregateResults,
      cacheKey
    });

    // Determine which providers to use
    let enabledProviders = SEARCH_PROVIDERS.filter(p => p.enabled);
    
    if (request.providers && request.providers.length > 0) {
      enabledProviders = enabledProviders.filter(p => 
        request.providers!.includes(p.name)
      );
    }

    // Sort by priority
    enabledProviders.sort((a, b) => a.priority - b.priority);

    if (enabledProviders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No search providers available' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get base URL for internal function calls
    const baseUrl = SUPABASE_URL;

    const overallStartTime = Date.now();

    // Execute search based on strategy
    let responses: ProviderResponse[];
    
    if (request.parallel !== false && enabledProviders.length > 1) {
      responses = await executeParallelSearch(request, enabledProviders, baseUrl);
    } else {
      responses = await executeSequentialSearch(request, enabledProviders, baseUrl);
    }

    const overallSearchTime = Date.now() - overallStartTime;

    // Aggregate results if requested
    let finalResults: SearchResult[];
    let duplicatesRemoved = 0;
    
    if (request.aggregateResults !== false) {
      const aggregated = aggregateResults(responses);
      const totalResults = responses.reduce((sum, r) => sum + r.results.length, 0);
      duplicatesRemoved = calculateDuplicatesRemoved(totalResults, aggregated.length);
      
      // Enhance results with medical classification
      const enhancedResults = await enhanceResultsWithClassification(aggregated, request.q);
      
      // Re-sort by enhanced relevance scores
      enhancedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      finalResults = applyFilters(enhancedResults, request.filters);
    } else {
      // Use results from the best performing provider
      const bestProvider = selectBestProvider(responses);
      const bestResponse = responses.find(r => r.provider === bestProvider);
      const providerResults = bestResponse?.results || [];
      
      // Enhance results with medical classification
      const enhancedResults = await enhanceResultsWithClassification(providerResults, request.q);
      
      // Re-sort by enhanced relevance scores
      enhancedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      finalResults = applyFilters(enhancedResults, request.filters);
    }

    const result: OrchestrationResult = {
      results: finalResults,
      providers: responses,
      aggregatedCount: finalResults.length,
      totalSearchTime: overallSearchTime,
      query: request.q,
      duplicatesRemoved,
      bestProvider: selectBestProvider(responses),
      cacheHit: false,
      cacheKey
    };

    // Cache successful results
    if (finalResults.length > 0) {
      // Determine cache TTL based on query characteristics
      const cacheTTL = determineCacheTTL(request.q, request.filters);
      setCachedResult(cacheKey, result, cacheTTL);
    }

    // Store search in database for analytics and caching
    await storeSearchInDatabase(user.id, request.q, result, cacheKey);

    console.log('Search Orchestrator Success', {
      userId: user.id,
      resultCount: finalResults.length,
      providersUsed: responses.filter(r => r.success).map(r => r.provider),
      duplicatesRemoved,
      totalTime: overallSearchTime,
      cacheKey,
      cached: finalResults.length > 0
    });

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Search Orchestrator Error:', error)

    return new Response(
      JSON.stringify({ 
        error: 'Search orchestration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})