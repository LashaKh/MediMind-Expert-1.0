/**
 * Exa AI Search API Gateway
 * Secure proxy for Exa AI Search API with authentication and medical content optimization
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { withAuth } from './utils/auth';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { parseRequest } from './utils/request';
import { ENV_VARS, getAPIKeys, hasAPIKeyPool } from './utils/constants';
import { logInfo, logError } from './utils/logger';
import { getAPIKeyPool, DEFAULT_POOL_CONFIGS, APIKeyPoolConfig } from './utils/apiKeyPool';

// Cache for Exa Search results
const exaCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const EXA_CACHE_TTL = 20 * 60 * 1000; // 20 minutes (longer for neural search results)

function generateExaCacheKey(params: any): string {
  const keyData = {
    query: params.query.toLowerCase().trim(),
    type: params.type || 'auto',
    numResults: params.numResults || 10,
    includeDomains: params.includeDomains,
    startPublishedDate: params.startPublishedDate,
    endPublishedDate: params.endPublishedDate
  };
  return `exa:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
}

function getCachedExaResult(cacheKey: string): any | null {
  const cached = exaCache.get(cacheKey);
  
  if (!cached || Date.now() - cached.timestamp > cached.ttl) {
    if (cached) exaCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setCachedExaResult(cacheKey: string, data: any): void {
  if (exaCache.size >= 100) {
    const oldestKey = Array.from(exaCache.keys())[0];
    exaCache.delete(oldestKey);
  }
  
  exaCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: EXA_CACHE_TTL
  });
}

interface ExaSearchParams {
  query: string;
  type?: 'neural' | 'keyword' | 'auto';
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
}

interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  score: number;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  neural?: boolean;
}

interface ExaSearchResponse {
  results: ExaSearchResult[];
  requestId: string;
  resolvedSearchType?: string;
  searchType?: string;
}

async function callExaSearchAPI(params: ExaSearchParams): Promise<ExaSearchResponse> {
  // Initialize API key pool if multiple keys are configured
  const apiKeys = getAPIKeys('exa');
  const usePool = hasAPIKeyPool('exa');
  
  if (apiKeys.length === 0) {
    throw new Error('Exa AI API key not configured');
  }

  let apiKey: string;
  let pool: ReturnType<typeof getAPIKeyPool> | null = null;

  if (usePool) {
    // Initialize pool with current keys
    const poolConfig: APIKeyPoolConfig = {
      provider: 'exa',
      keys: apiKeys,
      ...DEFAULT_POOL_CONFIGS.exa
    };
    
    pool = getAPIKeyPool(poolConfig);
    const selectedKey = pool.getNextKey();
    
    if (!selectedKey) {
      throw new Error('No healthy Exa AI API keys available');
    }
    
    apiKey = selectedKey;
    logInfo('Using Exa API Key Pool', {
      provider: 'exa',
      totalKeys: apiKeys.length,
      keyId: apiKey.substring(0, 8) + '...'
    });
  } else {
    // Use single key for backward compatibility
    apiKey = apiKeys[0];
    logInfo('Using Single Exa API Key', {
      provider: 'exa',
      keyId: apiKey.substring(0, 8) + '...'
    });
  }

  // Optimize query for medical content
  const optimizedQuery = optimizeQueryForMedical(params.query);

  // Start with minimal request body based on API documentation
  const requestBody: any = {
    query: optimizedQuery,
    numResults: Math.min(params.numResults || 10, 100)
  };

  // Add type if specified (defaults to 'auto' on server)
  if (params.type && params.type !== 'auto') {
    requestBody.type = params.type;
  }

  // Add content options
  if (true) { // Always request text for medical searches
    requestBody.text = true;
  }

  // Only add optional parameters if they have valid values
  if (params.startCrawlDate) requestBody.startCrawlDate = params.startCrawlDate;
  if (params.endCrawlDate) requestBody.endCrawlDate = params.endCrawlDate;
  if (params.startPublishedDate) requestBody.startPublishedDate = params.startPublishedDate;
  if (params.endPublishedDate) requestBody.endPublishedDate = params.endPublishedDate;
  if (params.includeDomains && params.includeDomains.length > 0) requestBody.includeDomains = params.includeDomains;
  if (params.excludeDomains && params.excludeDomains.length > 0) requestBody.excludeDomains = params.excludeDomains;
  if (params.includeText && params.includeText.length > 0) requestBody.includeText = params.includeText;
  if (params.excludeText && params.excludeText.length > 0) requestBody.excludeText = params.excludeText;
  if (params.category) requestBody.category = params.category;

  // Force console output with multiple methods
  console.log('=== EXA API DEBUG START ===');
  console.error('🚀 [EXA-API] Making request to: https://api.exa.ai/search');
  console.error('📝 [EXA-API] Request body:', JSON.stringify(requestBody, null, 2));
  console.error('🔑 [EXA-API] API key present:', !!apiKey, 'Length:', apiKey?.length || 0);
  console.error('🔑 [EXA-API] API key first 10 chars:', apiKey?.substring(0, 10) || 'NONE');
  console.error('🔧 [EXA-API] Using pool:', usePool, 'Total keys:', apiKeys.length);
  
  // Also log to process stdout
  process.stdout.write(`EXA REQUEST: ${JSON.stringify(requestBody)}\n`);
  process.stderr.write(`EXA API KEY LENGTH: ${apiKey?.length || 0}\n`);

  const startTime = Date.now();
  let response: Response;
  
  try {
    response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'User-Agent': 'MediMind-Expert/1.0'
      },
      body: JSON.stringify(requestBody)
    });
  } catch (networkError) {
    const responseTime = Date.now() - startTime;
    
    // Report network failure to pool
    if (pool) {
      pool.reportFailure(apiKey, networkError, responseTime);
    }
    
    console.error('🌐 [EXA-API] Network error:', networkError);
    throw networkError;
  }

  const responseTime = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    
    // Report failure to pool for intelligent rotation
    if (pool) {
      pool.reportFailure(apiKey, new Error(`HTTP ${response.status}: ${errorText}`), responseTime);
    }
    
    // Enhanced error logging with request details
    console.error('=== EXA API ERROR ===');
    console.error('🚨 [EXA-API] Request failed with status:', response.status);
    console.error('🚨 [EXA-API] Status text:', response.statusText);
    console.error('🚨 [EXA-API] Error response body:', errorText);
    console.error('🚨 [EXA-API] Request that failed:', JSON.stringify(requestBody, null, 2));
    console.error('🚨 [EXA-API] Response time:', `${responseTime}ms`);
    console.error('🚨 [EXA-API] Request headers used:', {
      'Content-Type': 'application/json',
      'x-api-key': apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING',
      'User-Agent': 'MediMind-Expert/1.0'
    });
    
    // Force output to both stdout and stderr
    process.stderr.write(`EXA ERROR: ${response.status} - ${errorText}\n`);
    process.stdout.write(`EXA FAILED REQUEST: ${JSON.stringify(requestBody)}\n`);
    
    logError('Exa AI Search API Error', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      requestBody: JSON.stringify(requestBody, null, 2),
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      responseTime,
      usingPool: usePool,
      totalKeys: apiKeys.length
    });
    
    throw new Error(`Exa API error: ${response.status} ${response.statusText}`);
  }

  // Report success to pool for performance tracking
  if (pool) {
    pool.reportSuccess(apiKey, responseTime);
  }

  console.log('✅ [EXA-API] Request successful, response time:', `${responseTime}ms`);

  return await response.json();
}

function optimizeQueryForMedical(query: string): string {
  // Add medical context to improve search relevance
  const medicalTerms = [
    'clinical', 'medical', 'patient', 'treatment', 'diagnosis', 
    'therapy', 'evidence', 'study', 'research', 'healthcare'
  ];
  
  // Check if query already contains medical terms
  const hasmedicalContext = medicalTerms.some(term => 
    query.toLowerCase().includes(term)
  );
  
  if (!hasmedicalContext) {
    // Add subtle medical context without changing the core query
    return `${query} medical clinical evidence`;
  }
  
  return query;
}

function getMedicalDomains(): string[] {
  return [
    'pubmed.ncbi.nlm.nih.gov',
    'cochrane.org',
    'nejm.org',
    'jamanetwork.com',
    'thelancet.com',
    'bmj.com',
    'nature.com',
    'sciencedirect.com',
    'uptodate.com',
    'medscape.com',
    'mayoclinic.org',
    'who.int',
    'cdc.gov',
    'nih.gov',
    'acc.org',
    'heart.org',
    'acog.org',
    'ascp.org',
    'aafp.org',
    'guidelines.gov'
  ];
}

function processSearchResults(exaResponse: ExaSearchResponse, originalQuery: string) {
  const results = exaResponse.results || [];
  
  return {
    results: results.map((result, index) => ({
      id: result.id || `exa_${index}`,
      title: result.title,
      url: result.url,
      snippet: extractSnippet(result),
      source: extractDomain(result.url),
      provider: 'exa' as const,
      relevanceScore: normalizeExaScore(result.score),
      publicationDate: result.publishedDate,
      author: result.author,
      highlights: result.highlights || [],
      highlightScores: result.highlightScores || [],
      isNeuralResult: result.neural || false
    })),
    totalCount: results.length,
    searchTime: Date.now(),
    provider: 'exa' as const,
    query: originalQuery,
    resolvedSearchType: exaResponse.resolvedSearchType,
    searchType: exaResponse.searchType,
    requestId: exaResponse.requestId
  };
}

function extractSnippet(result: ExaSearchResult): string {
  // Prefer highlights over full text for snippets
  if (result.highlights && result.highlights.length > 0) {
    return result.highlights[0];
  }
  
  // If no highlights, extract from full text
  if (result.text) {
    return result.text.substring(0, 300) + (result.text.length > 300 ? '...' : '');
  }
  
  // Fallback to title if no text available
  return result.title;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function normalizeExaScore(score: number): number {
  // Exa scores are typically between 0-1, but can go higher
  // Normalize to 0-1 range for consistency
  return Math.min(Math.max(score, 0), 1);
}

const handler = withAuth(async (event: HandlerEvent, user) => {
  // Force immediate logging at function start
  console.error('=== EXA HANDLER START ===');
  process.stderr.write('EXA FUNCTION CALLED\n');
  
  try {
    const { method } = parseRequest(event);
    
    console.error('EXA: Method received:', method);
    process.stderr.write(`EXA METHOD: ${method}\n`);
    
    if (method !== 'POST') {
      console.error('EXA: Method not allowed, returning 405');
      return createErrorResponse('Method not allowed', 405);
    }

    const requestBody = JSON.parse(event.body || '{}');
    const q = requestBody.q || requestBody.query; // Support both 'q' and 'query' parameter names
    const filters = requestBody.filters || {};
    
    console.error('EXA: Full request body:', requestBody);
    console.error('EXA: Extracted query:', { q: q?.substring(0, 50), filters });
    process.stderr.write(`EXA QUERY: ${q?.substring(0, 50)}\n`);
    
    if (!q || typeof q !== 'string') {
      console.error('EXA: Query validation failed:', { 
        hasQuery: !!q, 
        queryType: typeof q,
        hasRequestQuery: !!requestBody.query,
        hasRequestQ: !!requestBody.q,
        requestKeys: Object.keys(requestBody)
      });
      return createErrorResponse('Search query is required', 400);
    }

    // Test API key before proceeding
    const testApiKey = ENV_VARS.EXA_API_KEY;
    console.error('EXA: API Key test:', {
      hasKey: !!testApiKey,
      keyLength: testApiKey?.length || 0,
      keyPrefix: testApiKey?.substring(0, 10) || 'NONE',
      envVarsAvailable: Object.keys(ENV_VARS).length
    });
    process.stderr.write(`EXA API KEY TEST: ${!!testApiKey} (${testApiKey?.length || 0} chars)\n`);

    // Build search parameters - handle both old (filters-based) and new (direct) parameter formats
    const searchParams: ExaSearchParams = {
      query: q,
      type: requestBody.type || filters.searchType || 'auto',
      numResults: Math.min(requestBody.num_results || filters.limit || 10, 50)
    };

    // Handle direct parameters from client
    if (requestBody.include_domains) {
      searchParams.includeDomains = requestBody.include_domains;
    }
    
    if (requestBody.start_crawl_date) {
      searchParams.startCrawlDate = requestBody.start_crawl_date;
    }

    // Add date filters if specified (legacy filters format)
    if (filters.recency) {
      const dateRange = mapRecencyToDateRange(filters.recency);
      searchParams.startPublishedDate = dateRange.start;
      searchParams.endPublishedDate = dateRange.end;
    }

    // Add domain filters for specialty (legacy filters format)
    if (filters.specialty) {
      searchParams.includeDomains = getSpecialtyDomains(filters.specialty);
    }

    console.error('EXA: Final search params:', searchParams);

    // Check cache first
    const cacheKey = generateExaCacheKey(searchParams);
    const cachedResult = getCachedExaResult(cacheKey);
    
    if (cachedResult) {
      logInfo('Exa AI Search Cache Hit', {
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

    logInfo('Exa AI Search Request', {
      userId: user.id,
      query: q.substring(0, 100), // Log truncated query for privacy
      filters,
      cacheKey
    });

    // Call Exa AI Search API
    const exaResponse = await callExaSearchAPI(searchParams);
    
    // Process and format results
    const processedResults = processSearchResults(exaResponse, q);
    
    // Cache successful results
    if (processedResults.results.length > 0) {
      setCachedExaResult(cacheKey, processedResults);
    }
    
    logInfo('Exa AI Search Success', {
      userId: user.id,
      resultCount: processedResults.results.length,
      provider: 'exa',
      resolvedSearchType: processedResults.resolvedSearchType,
      cached: false
    });

    return createSuccessResponse({
      ...processedResults,
      cached: false,
      cacheKey
    });

  } catch (error) {
    logError('Exa AI Search Error', {
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

function mapRecencyToDateRange(recency: string): { start?: string; end?: string } {
  const now = new Date();
  const start = new Date();
  
  switch (recency) {
    case 'pastWeek':
      start.setDate(now.getDate() - 7);
      break;
    case 'pastMonth':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'past3Months':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'pastYear':
      start.setFullYear(now.getFullYear() - 1);
      break;
    case 'past5Years':
      start.setFullYear(now.getFullYear() - 5);
      break;
    default:
      return {};
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0]
  };
}

function getSpecialtyDomains(specialty: string): string[] {
  const baseDomains = getMedicalDomains();
  
  switch (specialty) {
    case 'cardiology':
      return [
        ...baseDomains,
        'acc.org',
        'heart.org',
        'escardio.org',
        'onlinejacc.org',
        'ahajournals.org'
      ];
    case 'obgyn':
      return [
        ...baseDomains,
        'acog.org',
        'smfm.org',
        'greenjournal.org',
        'ajog.org',
        'fertstert.org'
      ];
    default:
      return baseDomains;
  }
}

export { handler };