/**
 * Perplexity Search API Gateway - Supabase Edge Function
 * AI-powered search with medical optimization and citation tracking
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
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')!

// Multiple API keys for load balancing
const PERPLEXITY_API_KEYS = Deno.env.get('PERPLEXITY_API_KEYS')?.split(',').map(key => key.trim()).filter(key => key.length > 0) || [PERPLEXITY_API_KEY]

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Simple in-memory cache for Perplexity results
const perplexityCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 20 * 60 * 1000; // 20 minutes (longer due to AI processing cost)

interface PerplexitySearchParams {
  q: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  return_citations?: boolean;
  return_images?: boolean;
  recency_filter?: string;
  filters?: {
    specialty?: string;
    evidenceLevel?: string[];
    contentType?: string[];
    recency?: string;
    limit?: number;
    offset?: number;
  };
}

interface PerplexityCitation {
  position: number;
  url: string;
  title?: string;
  domain?: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: PerplexityCitation[];
  images?: string[];
}

function generatePerplexityCacheKey(params: PerplexitySearchParams): string {
  const keyData = {
    q: params.q.toLowerCase().trim(),
    model: params.model || 'llama-3.1-sonar-small-128k-online',
    recency: params.filters?.recency,
    specialty: params.filters?.specialty
  };
  return `perplexity:${btoa(JSON.stringify(keyData))}`;
}

function getCachedPerplexityResult(cacheKey: string): any | null {
  const cached = perplexityCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    perplexityCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setCachedPerplexityResult(cacheKey: string, data: any): void {
  // Implement simple LRU eviction
  if (perplexityCache.size >= 50) { // Smaller cache due to larger response sizes
    const oldestKey = Array.from(perplexityCache.keys())[0];
    perplexityCache.delete(oldestKey);
  }
  
  perplexityCache.set(cacheKey, {
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
  if (PERPLEXITY_API_KEYS.length === 1) {
    return PERPLEXITY_API_KEYS[0];
  }
  
  // Simple round-robin selection
  const index = Math.floor(Math.random() * PERPLEXITY_API_KEYS.length);
  return PERPLEXITY_API_KEYS[index];
}

// Get user profile for personalization
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

// Create medical search prompt
function createMedicalSearchPrompt(query: string, specialty?: string): string {
  const basePrompt = `As a medical AI assistant, provide a comprehensive and accurate response to: "${query}"

Please include:
1. Key medical information and evidence
2. Current best practices and guidelines
3. Recent research or updates if relevant
4. Important safety considerations or warnings
5. Cite all sources with proper references

Format your response for healthcare professionals with appropriate medical terminology.`;

  if (specialty) {
    return `${basePrompt}\n\nSpecialty focus: ${specialty}`;
  }

  return basePrompt;
}

// Extract citations and create structured results
function parsePerplexityResponse(response: PerplexityResponse, originalQuery: string): any {
  const results: any[] = [];
  const content = response.choices?.[0]?.message?.content || '';
  
  // Parse citations if available
  if (response.citations && response.citations.length > 0) {
    response.citations.forEach((citation, index) => {
      results.push({
        id: `perplexity-${index}`,
        title: citation.title || `Citation ${citation.position}`,
        url: citation.url,
        snippet: extractSnippetFromContent(content, citation.position),
        source: citation.domain || new URL(citation.url).hostname,
        provider: 'perplexity',
        relevanceScore: 1.0 - (index * 0.05),
        evidenceLevel: 'ai_analysis',
        publicationDate: new Date().toISOString(),
        specialty: 'general',
        contentType: 'ai_analysis',
        citationPosition: citation.position
      });
    });
  } else {
    // If no citations, create a single result with the AI response
    results.push({
      id: 'perplexity-ai-response',
      title: `AI Analysis: ${originalQuery}`,
      url: 'https://perplexity.ai',
      snippet: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
      source: 'perplexity.ai',
      provider: 'perplexity',
      relevanceScore: 1.0,
      evidenceLevel: 'ai_analysis',
      publicationDate: new Date().toISOString(),
      specialty: 'general',
      contentType: 'ai_analysis',
      fullContent: content
    });
  }

  return {
    results,
    totalCount: results.length,
    query: originalQuery,
    model: response.model,
    usage: response.usage,
    fullResponse: content,
    citations: response.citations || [],
    provider: 'perplexity'
  };
}

function extractSnippetFromContent(content: string, position: number): string {
  // Extract a relevant snippet around the citation position
  // This is a simplified implementation
  const sentences = content.split(/[.!?]+/);
  const citationPattern = new RegExp(`\\[${position}\\]`, 'g');
  
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].match(citationPattern)) {
      // Return the sentence containing the citation plus some context
      const start = Math.max(0, i - 1);
      const end = Math.min(sentences.length - 1, i + 1);
      return sentences.slice(start, end + 1).join('. ').trim();
    }
  }
  
  // Fallback: return first 200 characters
  return content.substring(0, 200) + (content.length > 200 ? '...' : '');
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧠 Perplexity Search Edge Function called')

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

    const { q: query, filters, model } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile for personalization
    const profile = await getUserProfile(jwtPayload.id);
    const userSpecialty = profile.specialty || jwtPayload.specialty || filters?.specialty;

    console.log('Perplexity Search Request', {
      userId: jwtPayload.id,
      query: query.substring(0, 100),
      specialty: userSpecialty,
      model: model || 'llama-3.1-sonar-small-128k-online'
    });

    // Prepare search parameters
    const searchParams: PerplexitySearchParams = {
      q: createMedicalSearchPrompt(query, userSpecialty),
      model: model || 'llama-3.1-sonar-small-128k-online',
      max_tokens: 4096,
      temperature: 0.1,
      top_p: 1.0,
      return_citations: true,
      return_images: false,
      recency_filter: filters?.recency === 'pastDay' ? 'day' : 
                     filters?.recency === 'pastWeek' ? 'week' :
                     filters?.recency === 'pastMonth' ? 'month' : undefined,
      filters
    };

    const cacheKey = generatePerplexityCacheKey(searchParams);
    
    // Check cache first
    const cachedResult = getCachedPerplexityResult(cacheKey);
    if (cachedResult) {
      console.log('Perplexity Search Cache Hit', {
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

    // Make API request to Perplexity
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: searchParams.model,
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant providing evidence-based information to healthcare professionals.'
          },
          {
            role: 'user',
            content: searchParams.q
          }
        ],
        max_tokens: searchParams.max_tokens,
        temperature: searchParams.temperature,
        top_p: searchParams.top_p,
        return_citations: searchParams.return_citations,
        return_images: searchParams.return_images,
        ...(searchParams.recency_filter && {
          search_recency_filter: searchParams.recency_filter
        })
      })
    });

    const searchTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', {
        status: response.status,
        error: errorText,
        userId: jwtPayload.id
      });

      return new Response(
        JSON.stringify({ 
          error: 'Perplexity search failed',
          details: `API returned ${response.status}`,
          provider: 'perplexity'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const perplexityData: PerplexityResponse = await response.json();
    
    // Parse and transform results
    const transformedData = parsePerplexityResponse(perplexityData, query);
    transformedData.searchTime = searchTime;

    // Cache the result
    setCachedPerplexityResult(cacheKey, transformedData);

    console.log('Perplexity Search Success', {
      userId: jwtPayload.id,
      resultCount: transformedData.results.length,
      searchTime,
      tokensUsed: transformedData.usage?.total_tokens || 0,
      citationsFound: transformedData.citations.length
    });

    return new Response(
      JSON.stringify({ success: true, data: transformedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Perplexity Search Error:', error)

    return new Response(
      JSON.stringify({ 
        error: 'Perplexity search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        provider: 'perplexity'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})