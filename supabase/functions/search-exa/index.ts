/**
 * Exa Search API Gateway - Supabase Edge Function
 * Neural search API integration with semantic search capabilities
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
const EXA_API_KEY = Deno.env.get('EXA_API_KEY')!

// Multiple API keys for load balancing
const EXA_API_KEYS = Deno.env.get('EXA_API_KEYS')?.split(',').map(key => key.trim()).filter(key => key.length > 0) || [EXA_API_KEY]

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Simple in-memory cache for Exa results
const exaCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 25 * 60 * 1000; // 25 minutes

interface ExaSearchParams {
  query: string;
  type?: 'neural' | 'keyword';
  useAutoprompt?: boolean;
  numResults?: number;
  startCrawlDate?: string;
  endCrawlDate?: string;
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeText?: string[];
  excludeText?: string[];
  category?: string;
  contents?: {
    text?: boolean;
    highlights?: boolean;
    summary?: boolean;
  };
}

interface ExaResult {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  score: number;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  summary?: string;
}

interface ExaSearchResponse {
  results: ExaResult[];
  autopromptString?: string;
  resolvedSearchType?: string;
}

function generateExaCacheKey(params: ExaSearchParams): string {
  const keyData = {
    query: params.query.toLowerCase().trim(),
    type: params.type || 'neural',
    numResults: params.numResults || 10,
    startPublishedDate: params.startPublishedDate,
    endPublishedDate: params.endPublishedDate,
    includeDomains: params.includeDomains?.sort() || [],
    category: params.category
  };
  return `exa:${btoa(JSON.stringify(keyData))}`;
}

function getCachedExaResult(cacheKey: string): any | null {
  const cached = exaCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    exaCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setCachedExaResult(cacheKey: string, data: any): void {
  // Implement simple LRU eviction
  if (exaCache.size >= 100) {
    const oldestKey = Array.from(exaCache.keys())[0];
    exaCache.delete(oldestKey);
  }
  
  exaCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
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
  if (EXA_API_KEYS.length === 1) {
    return EXA_API_KEYS[0];
  }
  
  // Simple round-robin selection
  const index = Math.floor(Math.random() * EXA_API_KEYS.length);
  return EXA_API_KEYS[index];
}

// Get medical domains for enhanced search
function getMedicalDomains(): string[] {
  return [
    'pubmed.ncbi.nlm.nih.gov',
    'nejm.org',
    'thelancet.com',
    'bmj.com',
    'jamanetwork.com',
    'nature.com',
    'cell.com',
    'sciencedirect.com',
    'uptodate.com',
    'cochrane.org',
    'who.int',
    'cdc.gov',
    'nih.gov',
    'mayoclinic.org',
    'medscape.com',
    'webmd.com'
  ];
}

// Create medical-optimized search parameters
function optimizeSearchForMedicine(query: string, filters?: any): ExaSearchParams {
  const params: ExaSearchParams = {
    query: query,
    type: 'neural', // Neural search is better for semantic understanding
    useAutoprompt: true,
    numResults: filters?.limit || 20,
    includeDomains: getMedicalDomains(),
    category: 'research paper',
    contents: {
      text: true,
      highlights: true,
      summary: true
    }
  };

  // Add date filters based on recency requirements
  if (filters?.recency) {
    const now = new Date();
    const dateRanges = {
      'pastDay': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      'pastWeek': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      'pastMonth': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      'pastYear': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };

    const startDate = dateRanges[filters.recency as keyof typeof dateRanges];
    if (startDate) {
      params.startPublishedDate = startDate.toISOString().split('T')[0];
    }
  }

  // Enhance query for medical context
  const medicalKeywords = ['medical', 'medicine', 'clinical', 'patient', 'treatment', 'diagnosis', 'study', 'research'];
  const hasContextKeyword = medicalKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
  
  if (!hasContextKeyword) {
    params.query = `${query} medical research`;
  }

  return params;
}

// Transform Exa results to standard format
function transformExaResults(exaResponse: ExaSearchResponse, originalQuery: string): any {
  const results = exaResponse.results.map((result, index) => ({
    id: `exa-${result.id}`,
    title: result.title,
    url: result.url,
    snippet: result.summary || (result.text ? result.text.substring(0, 300) + '...' : '') || 
             (result.highlights && result.highlights.length > 0 ? result.highlights[0] : 'No summary available'),
    source: new URL(result.url).hostname,
    provider: 'exa',
    relevanceScore: result.score,
    evidenceLevel: determineEvidenceLevel(result.url, result.title),
    publicationDate: result.publishedDate,
    author: result.author,
    specialty: 'general',
    contentType: determineContentType(result.url, result.title),
    fullText: result.text,
    highlights: result.highlights,
    highlightScores: result.highlightScores,
    summary: result.summary
  }));

  return {
    results,
    totalCount: results.length,
    query: originalQuery,
    autopromptUsed: !!exaResponse.autopromptString,
    autopromptString: exaResponse.autopromptString,
    searchType: exaResponse.resolvedSearchType,
    provider: 'exa'
  };
}

function determineEvidenceLevel(url: string, title: string): string {
  const domain = new URL(url).hostname.toLowerCase();
  
  // High-quality evidence sources
  if (domain.includes('pubmed') || domain.includes('ncbi')) return 'research_paper';
  if (domain.includes('nejm') || domain.includes('lancet') || domain.includes('bmj')) return 'peer_reviewed_journal';
  if (domain.includes('cochrane')) return 'systematic_review';
  if (domain.includes('who.int') || domain.includes('cdc.gov') || domain.includes('nih.gov')) return 'official_guideline';
  if (domain.includes('uptodate')) return 'clinical_reference';
  
  // Check title for evidence indicators
  const titleLower = title.toLowerCase();
  if (titleLower.includes('systematic review') || titleLower.includes('meta-analysis')) return 'systematic_review';
  if (titleLower.includes('randomized controlled trial') || titleLower.includes('rct')) return 'clinical_trial';
  if (titleLower.includes('case study') || titleLower.includes('case report')) return 'case_study';
  if (titleLower.includes('guideline') || titleLower.includes('recommendation')) return 'clinical_guideline';
  
  return 'research_paper';
}

function determineContentType(url: string, title: string): string {
  const domain = new URL(url).hostname.toLowerCase();
  const titleLower = title.toLowerCase();
  
  if (domain.includes('pubmed') || titleLower.includes('abstract')) return 'research_abstract';
  if (titleLower.includes('review')) return 'literature_review';
  if (titleLower.includes('guideline')) return 'clinical_guideline';
  if (titleLower.includes('case')) return 'case_study';
  if (domain.includes('news') || titleLower.includes('news')) return 'news_article';
  
  return 'research_paper';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔬 Exa Search Edge Function called')

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

    console.log('Exa Search Request', {
      userId: jwtPayload.id,
      query: query.substring(0, 100),
      filters
    });

    // Optimize search parameters for medical content
    const searchParams = optimizeSearchForMedicine(query, filters);
    const cacheKey = generateExaCacheKey(searchParams);
    
    // Check cache first
    const cachedResult = getCachedExaResult(cacheKey);
    if (cachedResult) {
      console.log('Exa Search Cache Hit', {
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

    console.log('Calling Exa API', {
      query: searchParams.query.substring(0, 100),
      type: searchParams.type,
      numResults: searchParams.numResults,
      useAutoprompt: searchParams.useAutoprompt
    });

    // Make API request to Exa
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams)
    });

    const searchTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Exa API error:', {
        status: response.status,
        error: errorText,
        userId: jwtPayload.id
      });

      return new Response(
        JSON.stringify({ 
          error: 'Exa search failed',
          details: `API returned ${response.status}`,
          provider: 'exa'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const exaData: ExaSearchResponse = await response.json();
    
    // Transform results to standard format
    const transformedData = transformExaResults(exaData, query);
    transformedData.searchTime = searchTime;

    // Cache the result
    setCachedExaResult(cacheKey, transformedData);

    console.log('Exa Search Success', {
      userId: jwtPayload.id,
      resultCount: transformedData.results.length,
      searchTime,
      autopromptUsed: transformedData.autopromptUsed,
      searchType: transformedData.searchType
    });

    return new Response(
      JSON.stringify({ success: true, data: transformedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Exa Search Error:', error)

    return new Response(
      JSON.stringify({ 
        error: 'Exa search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        provider: 'exa'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})