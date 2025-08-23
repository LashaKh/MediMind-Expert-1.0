/**
 * Medical News API
 * Provides filtering, pagination, and retrieval of medical news articles
 * Integrates with existing authentication and caching systems
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { parseRequest } from './utils/request';
import { logInfo, logError, logWarning } from './utils/logger';
import { searchRateLimit } from './utils/rateLimit';

// Supabase integration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface NewsFilters {
  specialty?: string;
  category?: string[];
  evidenceLevel?: string[];
  contentType?: string[];
  recency?: string;
  limit?: number;
  offset?: number;
  search?: string;
  minCredibilityScore?: number;
  minRelevanceScore?: number;
  sortBy?: 'engagement' | 'date' | 'relevance' | 'credibility';
  sortOrder?: 'desc' | 'asc';
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  category: string;
  specialty: string;
  publishedDate: string;
  createdAt: string;
  clickCount: number;
  engagementScore: number;
  keywords: string[] | null;
  authorName: string | null;
  authorAffiliation: string | null;
  publicationName: string | null;
  relevanceScore: number;
  credibilityScore: number;
  contentType: string;
  evidenceLevel: string | null;
  processingStatus: string;
}

interface NewsResponse {
  articles: NewsArticle[];
  totalCount: number;
  limit: number;
  offset: number;
  filters: NewsFilters;
  cacheHit?: boolean;
  responseTime: number;
}

interface TrendingResponse {
  trending: NewsArticle[];
  specialty: string;
  timeframe: string;
  totalCount: number;
  responseTime: number;
}

interface CategoriesResponse {
  categories: {
    name: string;
    count: number;
    recentCount: number;
  }[];
  specialty: string;
  responseTime: number;
}

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 15 * 60 * 1000, // 15 minutes
  trendingTTL: 5 * 60 * 1000, // 5 minutes for trending
  categoriesTTL: 30 * 60 * 1000, // 30 minutes for categories
  maxCacheSize: 500
};

// In-memory cache (in production, use Redis or similar)
const newsCache = new Map<string, {
  data: any;
  timestamp: number;
  ttl: number;
}>();

function generateCacheKey(type: string, params: any): string {
  const sortedParams = JSON.stringify(params, Object.keys(params).sort());
  return `news:${type}:${Buffer.from(sortedParams).toString('base64')}`;
}

function getCachedResult(cacheKey: string): any | null {
  const cached = newsCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  const now = Date.now();
  
  if (now - cached.timestamp > cached.ttl) {
    newsCache.delete(cacheKey);
    return null;
  }
  
  return { ...cached.data, cacheHit: true };
}

function setCachedResult(cacheKey: string, data: any, ttl: number): void {
  // Implement LRU eviction if cache is full
  if (newsCache.size >= CACHE_CONFIG.maxCacheSize) {
    const oldestKey = Array.from(newsCache.keys())[0];
    newsCache.delete(oldestKey);
  }
  
  newsCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

// Build SQL query for news filtering
function buildNewsQuery(filters: NewsFilters): { query: string; params: any[] } {
  let query = `
    SELECT 
      id,
      title,
      summary,
      source_url as "sourceUrl",
      source_name as "sourceName",
      category,
      specialty,
      published_date as "publishedDate",
      created_at as "createdAt",
      click_count as "clickCount",
      engagement_score as "engagementScore",
      keywords,
      author_name as "authorName",
      author_affiliation as "authorAffiliation",
      publication_name as "publicationName",
      relevance_score as "relevanceScore",
      credibility_score as "credibilityScore",
      content_type as "contentType",
      evidence_level as "evidenceLevel",
      processing_status as "processingStatus"
    FROM medical_news
    WHERE processing_status = 'processed'
  `;
  
  const params: any[] = [];
  let paramCount = 0;
  
  // Specialty filter
  if (filters.specialty) {
    paramCount++;
    query += ` AND specialty = $${paramCount}`;
    params.push(filters.specialty);
  }
  
  // Category filter
  if (filters.category && filters.category.length > 0) {
    paramCount++;
    query += ` AND category = ANY($${paramCount})`;
    params.push(filters.category);
  }
  
  // Evidence level filter
  if (filters.evidenceLevel && filters.evidenceLevel.length > 0) {
    paramCount++;
    query += ` AND evidence_level = ANY($${paramCount})`;
    params.push(filters.evidenceLevel);
  }
  
  // Content type filter
  if (filters.contentType && filters.contentType.length > 0) {
    paramCount++;
    query += ` AND content_type = ANY($${paramCount})`;
    params.push(filters.contentType);
  }
  
  // Recency filter
  if (filters.recency) {
    const intervalMap: Record<string, string> = {
      'today': '1 day',
      'week': '7 days',
      'month': '30 days',
      '3months': '90 days',
      'year': '365 days'
    };
    
    const interval = intervalMap[filters.recency];
    if (interval) {
      query += ` AND published_date >= NOW() - INTERVAL '${interval}'`;
    }
  }
  
  // Search filter (full-text search)
  if (filters.search && filters.search.trim()) {
    paramCount++;
    query += ` AND to_tsvector('english', title || ' ' || summary || ' ' || coalesce(array_to_string(keywords, ' '), '')) @@ plainto_tsquery('english', $${paramCount})`;
    params.push(filters.search.trim());
  }
  
  // Quality filters
  if (filters.minCredibilityScore !== undefined) {
    paramCount++;
    query += ` AND credibility_score >= $${paramCount}`;
    params.push(filters.minCredibilityScore);
  }
  
  if (filters.minRelevanceScore !== undefined) {
    paramCount++;
    query += ` AND relevance_score >= $${paramCount}`;
    params.push(filters.minRelevanceScore);
  }
  
  // Sorting
  const sortBy = filters.sortBy || 'engagement';
  const sortOrder = filters.sortOrder || 'desc';
  
  const sortColumns: Record<string, string> = {
    engagement: 'engagement_score',
    date: 'published_date',
    relevance: 'relevance_score',
    credibility: 'credibility_score'
  };
  
  const sortColumn = sortColumns[sortBy] || 'engagement_score';
  query += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}, published_date DESC`;
  
  // Pagination
  const limit = Math.min(filters.limit || 12, 50); // Max 50 articles per request
  const offset = filters.offset || 0;
  
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limit);
  
  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);
  
  return { query, params };
}

// Get total count for pagination
async function getTotalCount(filters: NewsFilters): Promise<number> {
  try {
    let countQuery = `
      SELECT COUNT(*) as count
      FROM medical_news
      WHERE processing_status = 'processed'
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    // Apply same filters as main query (without sorting, limit, offset)
    if (filters.specialty) {
      paramCount++;
      countQuery += ` AND specialty = $${paramCount}`;
      params.push(filters.specialty);
    }
    
    if (filters.category && filters.category.length > 0) {
      paramCount++;
      countQuery += ` AND category = ANY($${paramCount})`;
      params.push(filters.category);
    }
    
    if (filters.evidenceLevel && filters.evidenceLevel.length > 0) {
      paramCount++;
      countQuery += ` AND evidence_level = ANY($${paramCount})`;
      params.push(filters.evidenceLevel);
    }
    
    if (filters.contentType && filters.contentType.length > 0) {
      paramCount++;
      countQuery += ` AND content_type = ANY($${paramCount})`;
      params.push(filters.contentType);
    }
    
    if (filters.recency) {
      const intervalMap: Record<string, string> = {
        'today': '1 day',
        'week': '7 days',
        'month': '30 days',
        '3months': '90 days',
        'year': '365 days'
      };
      
      const interval = intervalMap[filters.recency];
      if (interval) {
        countQuery += ` AND published_date >= NOW() - INTERVAL '${interval}'`;
      }
    }
    
    if (filters.search && filters.search.trim()) {
      paramCount++;
      countQuery += ` AND to_tsvector('english', title || ' ' || summary || ' ' || coalesce(array_to_string(keywords, ' '), '')) @@ plainto_tsquery('english', $${paramCount})`;
      params.push(filters.search.trim());
    }
    
    if (filters.minCredibilityScore !== undefined) {
      paramCount++;
      countQuery += ` AND credibility_score >= $${paramCount}`;
      params.push(filters.minCredibilityScore);
    }
    
    if (filters.minRelevanceScore !== undefined) {
      paramCount++;
      countQuery += ` AND relevance_score >= $${paramCount}`;
      params.push(filters.minRelevanceScore);
    }
    
    // Build URL with parameters
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/count_medical_news`);
    
    // For now, use a simpler approach with the existing REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/medical_news?select=id&processing_status=eq.processed`, {
      method: 'HEAD', // Use HEAD to get count without data
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Range': '0-1',
        'Prefer': 'count=exact'
      }
    });
    
    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      const match = contentRange.match(/(\d+)$/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    return 0;
  } catch (error) {
    logError('Failed to get total count', { error });
    return 0;
  }
}

// Get medical news articles
async function getMedicalNews(filters: NewsFilters): Promise<NewsResponse> {
  const startTime = Date.now();
  
  try {
    logInfo('Starting medical news fetch', { filters });
    
    // Check cache first
    const cacheKey = generateCacheKey('news', filters);
    const cachedResult = getCachedResult(cacheKey);
    
    if (cachedResult) {
      logInfo('Returning cached result', { cacheKey });
      return {
        ...cachedResult,
        responseTime: Date.now() - startTime
      };
    }

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    // Build a simpler, more robust query
    let supabaseQuery = `${SUPABASE_URL}/rest/v1/medical_news?select=*&processing_status=eq.processed`;
    
    // Add basic filters
    if (filters.specialty) {
      supabaseQuery += `&specialty=eq.${encodeURIComponent(filters.specialty)}`;
    }
    
    // Add sorting - use created_at as fallback if engagement_score doesn't exist
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'desc';
    
    const sortColumns: Record<string, string> = {
      engagement: 'engagement_score',
      date: 'created_at',
      relevance: 'relevance_score',
      credibility: 'credibility_score'
    };
    
    const sortColumn = sortColumns[sortBy] || 'created_at';
    supabaseQuery += `&order=${sortColumn}.${sortOrder}`;
    
    // Add pagination
    const limit = Math.min(filters.limit || 12, 50);
    const offset = filters.offset || 0;
    
    logInfo('Making Supabase request', { 
      url: supabaseQuery,
      limit,
      offset,
      hasAuthHeader: !!SUPABASE_SERVICE_ROLE_KEY
    });
    
    const response = await fetch(supabaseQuery, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Range': `${offset}-${offset + limit - 1}`,
        'Prefer': 'count=exact'
      }
    });
    
    logInfo('Supabase response received', { 
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      logError('Supabase request failed', { 
        status: response.status,
        statusText: response.statusText,
        body: errorBody 
      });
      throw new Error(`Database query failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    
    const articles = await response.json();
    logInfo('Articles fetched from database', { count: articles.length });
    
    // Get total count from response headers
    const contentRange = response.headers.get('content-range');
    let totalCount = articles.length;
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) {
        totalCount = parseInt(match[1], 10);
      }
    }
    
    // Transform the response with safe property access
    const transformedArticles: NewsArticle[] = articles.map((article: any) => ({
      id: article.id || '',
      title: article.title || '',
      summary: article.summary || '',
      sourceUrl: article.source_url || '',
      sourceName: article.source_name || '',
      category: article.category || '',
      specialty: article.specialty || '',
      publishedDate: article.published_date || article.created_at,
      createdAt: article.created_at || '',
      clickCount: article.click_count || 0,
      engagementScore: article.engagement_score || 0,
      keywords: article.keywords || [],
      authorName: article.author_name || null,
      authorAffiliation: article.author_affiliation || null,
      publicationName: article.publication_name || null,
      relevanceScore: article.relevance_score || 0,
      credibilityScore: article.credibility_score || 0,
      contentType: article.content_type || '',
      evidenceLevel: article.evidence_level || null,
      processingStatus: article.processing_status || 'processed'
    }));
    
    const result: NewsResponse = {
      articles: transformedArticles,
      totalCount,
      limit,
      offset,
      filters,
      responseTime: Date.now() - startTime
    };
    
    // Cache the result
    setCachedResult(cacheKey, result, CACHE_CONFIG.defaultTTL);
    
    logInfo('Medical news retrieved successfully', {
      articleCount: transformedArticles.length,
      totalCount,
      filters,
      responseTime: result.responseTime
    });
    
    return result;
    
  } catch (error) {
    logError('Failed to get medical news', { error: error instanceof Error ? error.message : error, filters });
    throw error;
  }
}

// Get trending medical news
async function getTrendingNews(specialty?: string, timeframe: string = '24h'): Promise<TrendingResponse> {
  const startTime = Date.now();
  
  try {
    logInfo('Starting trending news fetch', { specialty, timeframe });
    
    const cacheKey = generateCacheKey('trending', { specialty, timeframe });
    const cachedResult = getCachedResult(cacheKey);
    
    if (cachedResult) {
      logInfo('Returning cached trending result', { cacheKey });
      return {
        ...cachedResult,
        responseTime: Date.now() - startTime
      };
    }
    
    // Fallback to regular medical_news table if trending view doesn't exist
    let query = `${SUPABASE_URL}/rest/v1/medical_news?select=*&processing_status=eq.processed`;
    
    if (specialty) {
      query += `&specialty=eq.${encodeURIComponent(specialty)}`;
    }
    
    // Order by engagement score and recent date for trending
    query += `&order=engagement_score.desc,created_at.desc&limit=20`;
    
    logInfo('Making trending request', { url: query });
    
    const response = await fetch(query, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      }
    });
    
    logInfo('Trending response received', { status: response.status });
    
    if (!response.ok) {
      const errorBody = await response.text();
      logError('Trending query failed', { 
        status: response.status,
        statusText: response.statusText,
        body: errorBody 
      });
      throw new Error(`Trending query failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    
    const trendingData = await response.json();
    logInfo('Trending articles fetched', { count: trendingData.length });
    
    const trending: NewsArticle[] = trendingData.map((article: any) => ({
      id: article.id || '',
      title: article.title || '',
      summary: article.summary || '',
      sourceUrl: article.source_url || '',
      sourceName: article.source_name || '',
      category: article.category || '',
      specialty: article.specialty || '',
      publishedDate: article.published_date || article.created_at,
      createdAt: article.created_at || '',
      clickCount: article.click_count || 0,
      engagementScore: article.engagement_score || 0,
      keywords: article.keywords || [],
      authorName: article.author_name || null,
      authorAffiliation: article.author_affiliation || null,
      publicationName: article.publication_name || null,
      relevanceScore: article.relevance_score || 0,
      credibilityScore: article.credibility_score || 0,
      contentType: article.content_type || '',
      evidenceLevel: article.evidence_level || null,
      processingStatus: article.processing_status || 'processed'
    }));
    
    const result: TrendingResponse = {
      trending,
      specialty: specialty || 'all',
      timeframe,
      totalCount: trending.length,
      responseTime: Date.now() - startTime
    };
    
    // Cache trending results with shorter TTL
    setCachedResult(cacheKey, result, CACHE_CONFIG.trendingTTL);
    
    logInfo('Trending news retrieved successfully', {
      count: trending.length,
      specialty,
      timeframe,
      responseTime: result.responseTime
    });
    
    return result;
    
  } catch (error) {
    logError('Failed to get trending news', { error: error instanceof Error ? error.message : error, specialty, timeframe });
    throw error;
  }
}

// Get news categories with counts
async function getNewsCategories(specialty?: string): Promise<CategoriesResponse> {
  const startTime = Date.now();
  
  try {
    const cacheKey = generateCacheKey('categories', { specialty });
    const cachedResult = getCachedResult(cacheKey);
    
    if (cachedResult) {
      return {
        ...cachedResult,
        responseTime: Date.now() - startTime
      };
    }
    
    // Query for category counts
    let query = `${SUPABASE_URL}/rest/v1/medical_news?select=category&processing_status=eq.processed`;
    
    if (specialty) {
      query += `&specialty=eq.${encodeURIComponent(specialty)}`;
    }
    
    const response = await fetch(query, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      }
    });
    
    if (!response.ok) {
      throw new Error(`Categories query failed: ${response.status}`);
    }
    
    const articles = await response.json();
    
    // Count categories
    const categoryCounts: Record<string, number> = {};
    articles.forEach((article: any) => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });
    
    // Get recent counts (last 7 days)
    const recentQuery = query + `&published_date=gte.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`;
    
    const recentResponse = await fetch(recentQuery, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      }
    });
    
    const recentArticles = recentResponse.ok ? await recentResponse.json() : [];
    const recentCounts: Record<string, number> = {};
    recentArticles.forEach((article: any) => {
      recentCounts[article.category] = (recentCounts[article.category] || 0) + 1;
    });
    
    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      recentCount: recentCounts[name] || 0
    })).sort((a, b) => b.count - a.count);
    
    const result: CategoriesResponse = {
      categories,
      specialty: specialty || 'all',
      responseTime: Date.now() - startTime
    };
    
    // Cache categories with longer TTL
    setCachedResult(cacheKey, result, CACHE_CONFIG.categoriesTTL);
    
    logInfo('News categories retrieved', {
      categoryCount: categories.length,
      specialty,
      responseTime: result.responseTime
    });
    
    return result;
    
  } catch (error) {
    logError('Failed to get news categories', { error, specialty });
    throw error;
  }
}

// Main handler
const baseHandler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    const { method, path } = parseRequest(event);
    
    if (method !== 'GET') {
      return createErrorResponse('Method not allowed', 405);
    }
    
    const queryParams = event.queryStringParameters || {};
    const params = new URLSearchParams();
    
    // Convert query parameters to URLSearchParams
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.set(key, value);
      }
    });
    
    // Parse filters from query parameters
    const filters: NewsFilters = {
      specialty: params.get('specialty') || undefined,
      category: params.get('category') ? params.get('category')!.split(',') : undefined,
      evidenceLevel: params.get('evidenceLevel') ? params.get('evidenceLevel')!.split(',') : undefined,
      contentType: params.get('contentType') ? params.get('contentType')!.split(',') : undefined,
      recency: params.get('recency') || undefined,
      limit: params.get('limit') ? parseInt(params.get('limit')!) : undefined,
      offset: params.get('offset') ? parseInt(params.get('offset')!) : undefined,
      search: params.get('search') || undefined,
      minCredibilityScore: params.get('minCredibilityScore') ? parseFloat(params.get('minCredibilityScore')!) : undefined,
      minRelevanceScore: params.get('minRelevanceScore') ? parseFloat(params.get('minRelevanceScore')!) : undefined,
      sortBy: (params.get('sortBy') as any) || 'engagement',
      sortOrder: (params.get('sortOrder') as any) || 'desc'
    };
    
    // Route based on path
    if (path.includes('/trending')) {
      const specialty = params.get('specialty') || undefined;
      const timeframe = params.get('timeframe') || '24h';
      const result = await getTrendingNews(specialty, timeframe);
      return createSuccessResponse(result);
    }
    
    if (path.includes('/categories')) {
      const specialty = params.get('specialty') || undefined;
      const result = await getNewsCategories(specialty);
      return createSuccessResponse(result);
    }
    
    // Default: get medical news
    const result = await getMedicalNews(filters);
    return createSuccessResponse(result);
    
  } catch (error) {
    logError('Medical news API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return createErrorResponse('Failed to retrieve medical news', 500);
  }
};

// Apply rate limiting
const handler = searchRateLimit(baseHandler);

export { handler };