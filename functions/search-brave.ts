/**
 * Brave Search API Gateway
 * Secure proxy for Brave Search API with authentication and rate limiting
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { withAuth } from './utils/auth';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { parseRequest } from './utils/request';
import { ENV_VARS, getAPIKeys, hasAPIKeyPool } from './utils/constants';
import { logInfo, logError } from './utils/logger';
import { getAPIKeyPool, DEFAULT_POOL_CONFIGS, APIKeyPoolConfig } from './utils/apiKeyPool';

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
  return `brave:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
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

async function callBraveSearchAPI(params: BraveSearchParams): Promise<BraveSearchResponse> {
  const requestId = Date.now().toString();
  const startTime = Date.now();
  
  console.group(`🌐 [BRAVE-API-${requestId}] Starting Brave Search API call`);
  
  // Initialize API key pool if multiple keys are configured
  const apiKeys = getAPIKeys('brave');
  const usePool = hasAPIKeyPool('brave');
  
  if (apiKeys.length === 0) {
    console.error(`🔑 [BRAVE-API-${requestId}] API key validation failed:`, {
      hasApiKey: false,
      envVarsDefined: Object.keys(ENV_VARS).length,
      availableEnvVars: Object.keys(ENV_VARS),
      hasViteKey: !!process.env.VITE_BRAVE_API_KEY,
      hasServerKey: !!process.env.BRAVE_API_KEY,
      nodeEnv: process.env.NODE_ENV
    });
    console.groupEnd();
    throw new Error('Brave Search API key not configured - check BRAVE_API_KEY or VITE_BRAVE_API_KEY environment variables');
  }

  let apiKey: string;
  let pool: ReturnType<typeof getAPIKeyPool> | null = null;

  if (usePool) {
    // Initialize pool with current keys
    const poolConfig: APIKeyPoolConfig = {
      provider: 'brave',
      keys: apiKeys,
      ...DEFAULT_POOL_CONFIGS.brave
    };
    
    pool = getAPIKeyPool(poolConfig);
    const selectedKey = pool.getNextKey();
    
    if (!selectedKey) {
      console.error(`🔑 [BRAVE-API-${requestId}] No healthy API keys available`);
      console.groupEnd();
      throw new Error('No healthy Brave Search API keys available');
    }
    
    apiKey = selectedKey;
    console.log(`🔧 [BRAVE-API-${requestId}] Using API Key Pool:`, {
      provider: 'brave',
      totalKeys: apiKeys.length,
      keyId: apiKey.substring(0, 8) + '...'
    });
  } else {
    // Use single key for backward compatibility
    apiKey = apiKeys[0];
    console.log(`🔑 [BRAVE-API-${requestId}] Using Single API Key:`, {
      provider: 'brave',
      keyId: apiKey.substring(0, 8) + '...'
    });
  }
  
  console.log(`🔑 [BRAVE-API-${requestId}] API key validation successful:`, {
    hasApiKey: true,
    keyLength: apiKey.length,
    keyPrefix: apiKey.substring(0, 8) + '...',
    usingPool: usePool,
    totalKeys: apiKeys.length
  });

  // Validate query parameters
  if (!params.q || typeof params.q !== 'string' || params.q.trim().length === 0) {
    console.error(`📝 [BRAVE-API-${requestId}] Query validation failed:`, {
      hasQuery: !!params.q,
      queryType: typeof params.q,
      queryLength: params.q?.length || 0
    });
    console.groupEnd();
    throw new Error('Search query is required and must be a non-empty string');
  }

  if (params.q.length > 400) {
    console.warn(`📝 [BRAVE-API-${requestId}] Query too long, truncating:`, {
      originalLength: params.q.length,
      truncatedLength: 400
    });
    params.q = params.q.substring(0, 400).trim();
  }

  // Build query parameters according to Brave API specification
  // Web Search API maximum count is 20, maximum offset is 9
  const searchParams = new URLSearchParams({
    q: params.q,
    count: Math.min(params.count || 10, 20).toString(), // Maximum 20 for web search
    offset: Math.min(params.offset || 0, 9).toString(), // Maximum 9 for offset
    country: params.country || 'US',
    search_lang: params.search_lang || 'en',
    ui_lang: params.ui_lang || 'en-US',
    safesearch: params.safesearch || 'moderate',
    text_decorations: (params.text_decorations !== false).toString(),
    spellcheck: (params.spellcheck !== false).toString()
  });

  // Add freshness filter if specified
  if (params.freshness) {
    searchParams.append('freshness', params.freshness);
  }
  
  const requestParams = Object.fromEntries(searchParams.entries());
  console.log(`📝 [BRAVE-API-${requestId}] Request parameters prepared:`, {
    paramCount: Object.keys(requestParams).length,
    queryLength: params.q.length,
    query: params.q.substring(0, 100) + (params.q.length > 100 ? '...' : ''),
    searchParams: requestParams
  });

  const apiUrl = `https://api.search.brave.com/res/v1/web/search?${searchParams}`;
  const requestHeaders = {
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip',
    'X-Subscription-Token': apiKey,
    'User-Agent': 'MediMind-Expert/1.0'
  };
  
  console.log(`🚀 [BRAVE-API-${requestId}] Making HTTP request:`, {
    url: apiUrl.substring(0, 100) + '...',
    method: 'GET',
    headerCount: Object.keys(requestHeaders).length,
    userAgent: requestHeaders['User-Agent']
  });

  const fetchStartTime = Date.now();
  let response: Response;
  
  try {
    response = await fetch(apiUrl, {
      method: 'GET',
      headers: requestHeaders
    });
  } catch (networkError) {
    const fetchTime = Date.now() - fetchStartTime;
    const totalTime = Date.now() - startTime;
    
    // Report network failure to pool
    if (pool) {
      pool.reportFailure(apiKey, networkError, fetchTime);
    }
    
    console.error(`🌐 [BRAVE-API-${requestId}] Network request failed:`, {
      fetchTime: `${fetchTime}ms`,
      totalTime: `${totalTime}ms`,
      error: networkError instanceof Error ? networkError.message : String(networkError),
      errorType: networkError instanceof Error ? networkError.constructor.name : typeof networkError,
      stack: networkError instanceof Error ? networkError.stack?.split('\n').slice(0, 3).join('\n') : undefined,
      usingPool: usePool,
      totalKeys: apiKeys.length
    });
    console.groupEnd();
    throw networkError;
  }
  
  const fetchTime = Date.now() - fetchStartTime;
  
  console.log(`📡 [BRAVE-API-${requestId}] HTTP response received:`, {
    status: response.status,
    statusText: response.statusText,
    fetchTime: `${fetchTime}ms`,
    headers: {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      server: response.headers.get('server'),
      rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
      rateLimitReset: response.headers.get('x-ratelimit-reset')
    }
  });

  if (!response.ok) {
    const errorStartTime = Date.now();
    let errorText = '';
    const errorDetails: any = {
      status: response.status,
      statusText: response.statusText,
      fetchTime: `${fetchTime}ms`,
      url: apiUrl.substring(0, 200) + '...',
      headers: {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
        rateLimitReset: response.headers.get('x-ratelimit-reset')
      }
    };
    
    try {
      errorText = await response.text();
      errorDetails.responseBody = errorText.substring(0, 1000); // First 1000 chars
      errorDetails.bodyLength = errorText.length;
      
      // Try to parse error as JSON for more details
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails.parsedError = errorJson;
        // Check for specific Brave API error patterns
        if (errorJson.error) {
          errorDetails.braveErrorCode = errorJson.error.code;
          errorDetails.braveErrorMessage = errorJson.error.message;
        }
      } catch {
        // Not JSON, keep as text
        // Check for common error patterns in text response
        if (errorText.includes('Invalid API key')) {
          errorDetails.errorType = 'INVALID_API_KEY';
        } else if (errorText.includes('Rate limit exceeded')) {
          errorDetails.errorType = 'RATE_LIMIT_EXCEEDED';
        } else if (errorText.includes('Invalid request')) {
          errorDetails.errorType = 'INVALID_REQUEST';
        }
      }
    } catch (readError) {
      errorDetails.readError = readError instanceof Error ? readError.message : String(readError);
    }
    
    const errorTime = Date.now() - errorStartTime;
    const totalTime = Date.now() - startTime;
    
    // Report failure to pool for intelligent rotation
    if (pool) {
      pool.reportFailure(apiKey, new Error(`HTTP ${response.status}: ${errorText}`), fetchTime);
    }
    
    console.error(`❌ [BRAVE-API-${requestId}] API returned error response:`, {
      ...errorDetails,
      errorTime: `${errorTime}ms`,
      totalTime: `${totalTime}ms`,
      usingPool: usePool,
      totalKeys: apiKeys.length,
      requestParams: {
        ...requestParams,
        query: requestParams.q.substring(0, 100) + (requestParams.q.length > 100 ? '...' : '')
      }
    });
    
    logError('Brave Search API Error', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      errorType: errorDetails.errorType,
      braveErrorCode: errorDetails.braveErrorCode,
      requestParams: {
        ...requestParams,
        query: requestParams.q.substring(0, 100) + (requestParams.q.length > 100 ? '...' : '')
      },
      timing: {
        fetchTime: `${fetchTime}ms`,
        errorTime: `${errorTime}ms`,
        totalTime: `${totalTime}ms`
      }
    });
    
    console.groupEnd();
    
    // Provide more specific error messages based on the error type
    if (response.status === 401) {
      throw new Error('Brave Search API authentication failed - check API key configuration');
    } else if (response.status === 429) {
      throw new Error('Brave Search API rate limit exceeded - please try again later');
    } else if (response.status === 400) {
      throw new Error(`Brave Search API bad request: ${errorDetails.braveErrorMessage || response.statusText}`);
    } else if (response.status === 422) {
      const validationMsg = errorDetails.braveErrorMessage || errorDetails.parsedError?.error?.detail || 'Invalid request parameters';
      throw new Error(`Brave Search API validation error: ${validationMsg}`);
    } else {
      throw new Error(`Brave Search API error: ${response.status} ${response.statusText}${errorDetails.braveErrorMessage ? ' - ' + errorDetails.braveErrorMessage : ''}`);
    }
  }

  const parseStartTime = Date.now();
  let responseData: BraveSearchResponse;
  
  try {
    responseData = await response.json();
  } catch (parseError) {
    const parseTime = Date.now() - parseStartTime;
    const totalTime = Date.now() - startTime;
    
    console.error(`📝 [BRAVE-API-${requestId}] Response parsing failed:`, {
      parseTime: `${parseTime}ms`,
      totalTime: `${totalTime}ms`,
      error: parseError instanceof Error ? parseError.message : String(parseError),
      contentType: response.headers.get('content-type')
    });
    console.groupEnd();
    throw new Error(`Failed to parse Brave API response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
  
  const parseTime = Date.now() - parseStartTime;
  const totalTime = Date.now() - startTime;
  
  // Report success to pool for performance tracking
  if (pool) {
    pool.reportSuccess(apiKey, totalTime);
  }
  
  console.log(`✅ [BRAVE-API-${requestId}] API call completed successfully:`, {
    parseTime: `${parseTime}ms`,
    totalTime: `${totalTime}ms`,
    responseStructure: Object.keys(responseData || {}),
    resultsCount: responseData?.web?.results?.length || 0,
    hasQuery: !!responseData?.query,
    hasMixed: !!responseData?.mixed,
    hasWeb: !!responseData?.web,
    usingPool: usePool,
    totalKeys: apiKeys.length
  });
  
  console.groupEnd();
  return responseData;
}

function processSearchResults(braveResponse: BraveSearchResponse, query: string) {
  const results = braveResponse.web?.results || [];
  
  return {
    results: results.map((result, index) => ({
      id: `brave_${index}`,
      title: result.title,
      url: result.url,
      snippet: result.description,
      source: extractDomain(result.url),
      provider: 'brave' as const,
      relevanceScore: calculateRelevanceScore(result, query),
      publicationDate: result.age,
      language: result.language || 'en',
      extraSnippets: result.extra_snippets || []
    })),
    totalCount: results.length,
    searchTime: Date.now(),
    provider: 'brave' as const,
    query: braveResponse.query.original || query,
    queryAltered: braveResponse.query.altered !== braveResponse.query.original,
    safeSearch: braveResponse.query.safesearch
  };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function calculateRelevanceScore(result: BraveSearchResult, query: string): number {
  let score = 0.5; // Base score
  
  const queryTerms = query.toLowerCase().split(' ');
  const title = result.title.toLowerCase();
  const description = result.description.toLowerCase();
  
  // Title matches
  queryTerms.forEach(term => {
    if (title.includes(term)) score += 0.2;
    if (description.includes(term)) score += 0.1;
  });
  
  // Medical domain boost
  const domain = extractDomain(result.url);
  const medicalDomains = [
    'pubmed.ncbi.nlm.nih.gov',
    'cochrane.org',
    'nejm.org',
    'jamanetwork.com',
    'thelancet.com',
    'bmj.com',
    'uptodate.com',
    'mayoclinic.org',
    'medscape.com',
    'who.int',
    'cdc.gov',
    'nih.gov'
  ];
  
  if (medicalDomains.some(medDomain => domain.includes(medDomain))) {
    score += 0.3;
  }
  
  return Math.min(score, 1.0);
}

const handler = withAuth(async (event: HandlerEvent, user) => {
  try {
    const { method } = parseRequest(event);
    
    if (method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }

    const { q, filters = {} } = JSON.parse(event.body || '{}');
    
    if (!q || typeof q !== 'string') {
      return createErrorResponse('Search query is required', 400);
    }

    // Build search parameters
    const searchParams: BraveSearchParams = {
      q,
      count: Math.min(filters.limit || 10, 50), // Max 50 results
      offset: filters.offset || 0,
      country: filters.country || 'US',
      search_lang: filters.language || 'en-US',
      safesearch: filters.safesearch || 'moderate',
      freshness: filters.recency ? mapRecencyToFreshness(filters.recency) : undefined
    };

    // Check cache first
    const cacheKey = generateBraveCacheKey(searchParams);
    const cachedResult = getCachedBraveResult(cacheKey);
    
    if (cachedResult) {
      logInfo('Brave Search Cache Hit', {
        userId: user.id,
        query: q.substring(0, 100),
        cacheKey
      });
      
      return createSuccessResponse({
        ...cachedResult,
        cached: true,
        cacheKey
      });
    }

    logInfo('Brave Search Request', {
      userId: user.id,
      query: q.substring(0, 100), // Log truncated query for privacy
      filters,
      cacheKey
    });

    // Call Brave Search API
    const braveResponse = await callBraveSearchAPI(searchParams);
    
    // Process and format results
    const processedResults = processSearchResults(braveResponse, q);
    
    // Cache successful results
    if (processedResults.results.length > 0) {
      setCachedBraveResult(cacheKey, processedResults);
    }
    
    logInfo('Brave Search Success', {
      userId: user.id,
      resultCount: processedResults.results.length,
      provider: 'brave',
      cached: false
    });

    return createSuccessResponse({
      ...processedResults,
      cached: false,
      cacheKey
    });

  } catch (error) {
    logError('Brave Search Error', {
      userId: user?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof Error && error.message.includes('API key')) {
      return createErrorResponse('Search service unavailable', 503);
    }

    if (error instanceof Error && error.message.includes('rate limit')) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    return createErrorResponse('Search request failed', 500);
  }
});

function mapRecencyToFreshness(recency: string): BraveSearchParams['freshness'] {
  switch (recency) {
    case 'pastWeek': return 'pw';
    case 'pastMonth': return 'pm';
    case 'pastYear': return 'py';
    case 'pastDay': return 'pd';
    default: return undefined;
  }
}

export { handler };