/**
 * Medical News API Gateway - Supabase Edge Function
 * Medical news aggregation and filtering with source diversity
 * Migrated from Netlify Functions to Supabase Edge Functions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Simple in-memory cache for medical news results
const medicalNewsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface MedicalNewsParams {
  specialty?: string;
  category?: 'research' | 'clinical' | 'policy' | 'technology' | 'general';
  sources?: string[];
  dateRange?: 'today' | 'week' | 'month';
  limit?: number;
  offset?: number;
  keywords?: string[];
  excludeKeywords?: string[];
  minRelevanceScore?: number;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  author?: string;
  publishedAt: string;
  imageUrl?: string;
  category: string;
  specialty: string;
  relevanceScore: number;
  tags: string[];
  readingTime?: number;
  isBreaking?: boolean;
  isVerified?: boolean;
}

// Medical news sources configuration
const MEDICAL_NEWS_SOURCES = {
  'pubmed_news': {
    name: 'PubMed News',
    baseUrl: 'https://pubmed.ncbi.nlm.nih.gov',
    category: 'research',
    reliability: 0.95
  },
  'medscape': {
    name: 'Medscape',
    baseUrl: 'https://www.medscape.com',
    category: 'clinical',
    reliability: 0.90
  },
  'nejm': {
    name: 'New England Journal of Medicine',
    baseUrl: 'https://www.nejm.org',
    category: 'research',
    reliability: 0.98
  },
  'jama': {
    name: 'JAMA Network',
    baseUrl: 'https://jamanetwork.com',
    category: 'research',
    reliability: 0.95
  },
  'bmj': {
    name: 'BMJ',
    baseUrl: 'https://www.bmj.com',
    category: 'research',
    reliability: 0.94
  },
  'lancet': {
    name: 'The Lancet',
    baseUrl: 'https://www.thelancet.com',
    category: 'research',
    reliability: 0.97
  },
  'nature_medicine': {
    name: 'Nature Medicine',
    baseUrl: 'https://www.nature.com/nm',
    category: 'research',
    reliability: 0.96
  },
  'science_translational': {
    name: 'Science Translational Medicine',
    baseUrl: 'https://www.science.org/journal/stm',
    category: 'research',
    reliability: 0.95
  },
  'webmd': {
    name: 'WebMD',
    baseUrl: 'https://www.webmd.com',
    category: 'general',
    reliability: 0.75
  },
  'healthline': {
    name: 'Healthline',
    baseUrl: 'https://www.healthline.com',
    category: 'general',
    reliability: 0.80
  }
};

function generateMedicalNewsCacheKey(params: MedicalNewsParams): string {
  const keyData = {
    specialty: params.specialty,
    category: params.category,
    dateRange: params.dateRange,
    limit: params.limit || 20,
    keywords: params.keywords?.sort() || [],
    excludeKeywords: params.excludeKeywords?.sort() || []
  };
  return `medical-news:${btoa(JSON.stringify(keyData))}`;
}

function getCachedMedicalNewsResult(cacheKey: string): any | null {
  const cached = medicalNewsCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    medicalNewsCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setCachedMedicalNewsResult(cacheKey: string, data: any): void {
  // Implement simple LRU eviction
  if (medicalNewsCache.size >= 100) {
    const oldestKey = Array.from(medicalNewsCache.keys())[0];
    medicalNewsCache.delete(oldestKey);
  }
  
  medicalNewsCache.set(cacheKey, {
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

// Get medical news from database
async function getMedicalNewsFromDB(params: MedicalNewsParams, userId?: string): Promise<NewsArticle[]> {
  try {
    let query = supabase
      .from('medical_news')
      .select('*')
      .eq('is_active', true);

    // Apply filters
    if (params.specialty) {
      query = query.eq('specialty', params.specialty);
    }

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.dateRange) {
      const now = new Date();
      let dateThreshold;
      
      switch (params.dateRange) {
        case 'today':
          dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to week
      }
      
      query = query.gte('published_at', dateThreshold.toISOString());
    }

    // Apply keyword filters
    if (params.keywords && params.keywords.length > 0) {
      const keywordFilter = params.keywords.map(keyword => 
        `title.ilike.%${keyword}%,summary.ilike.%${keyword}%,tags.cs.{${keyword}}`
      ).join(',');
      query = query.or(keywordFilter);
    }

    // Apply relevance score filter
    if (params.minRelevanceScore) {
      query = query.gte('relevance_score', params.minRelevanceScore);
    }

    // Order by publication date (newest first) and relevance
    query = query.order('published_at', { ascending: false })
                 .order('relevance_score', { ascending: false });

    // Apply pagination
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return [];
    }

    return (data || []).map(article => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      url: article.url,
      source: article.source,
      author: article.author,
      publishedAt: article.published_at,
      imageUrl: article.image_url,
      category: article.category,
      specialty: article.specialty,
      relevanceScore: article.relevance_score,
      tags: article.tags || [],
      readingTime: article.reading_time,
      isBreaking: article.is_breaking,
      isVerified: article.is_verified
    }));

  } catch (error) {
    console.error('Error fetching medical news from database:', error);
    return [];
  }
}

// Get trending topics
async function getTrendingTopics(specialty?: string): Promise<string[]> {
  try {
    let query = supabase
      .from('medical_news')
      .select('tags')
      .eq('is_active', true)
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last week

    if (specialty) {
      query = query.eq('specialty', specialty);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    data.forEach(article => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Return top 10 trending tags
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
}

// Transform news articles to standard search result format
function transformNewsToSearchResults(articles: NewsArticle[], query?: string): any {
  const results = articles.map((article, index) => ({
    id: `news-${article.id}`,
    title: article.title,
    url: article.url,
    snippet: article.summary,
    source: article.source,
    provider: 'medical-news',
    relevanceScore: article.relevanceScore,
    evidenceLevel: determineEvidenceLevel(article.source, article.category),
    publicationDate: article.publishedAt,
    author: article.author,
    specialty: article.specialty,
    contentType: 'news_article',
    
    // Additional news-specific data
    category: article.category,
    tags: article.tags,
    imageUrl: article.imageUrl,
    readingTime: article.readingTime,
    isBreaking: article.isBreaking,
    isVerified: article.isVerified
  }));

  return {
    results,
    totalCount: results.length,
    query: query || '',
    provider: 'medical-news'
  };
}

function determineEvidenceLevel(source: string, category: string): string {
  const sourceKey = Object.keys(MEDICAL_NEWS_SOURCES).find(key => 
    source.toLowerCase().includes(key.replace('_', ' ')) || 
    MEDICAL_NEWS_SOURCES[key as keyof typeof MEDICAL_NEWS_SOURCES].name.toLowerCase().includes(source.toLowerCase())
  );

  if (sourceKey) {
    const sourceInfo = MEDICAL_NEWS_SOURCES[sourceKey as keyof typeof MEDICAL_NEWS_SOURCES];
    if (sourceInfo.reliability >= 0.95) return 'peer_reviewed_journal';
    if (sourceInfo.reliability >= 0.90) return 'medical_news_verified';
    if (sourceInfo.reliability >= 0.80) return 'medical_news';
  }

  switch (category) {
    case 'research':
      return 'research_news';
    case 'clinical':
      return 'clinical_news';
    case 'policy':
      return 'policy_news';
    case 'technology':
      return 'technology_news';
    default:
      return 'news_article';
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📰 Medical News Edge Function called')

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

    // Validate HTTP method
    if (req.method !== 'POST' && req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile for personalization
    const profile = await getUserProfile(jwtPayload.id);
    const userSpecialty = profile.specialty || jwtPayload.specialty;

    let params: MedicalNewsParams = {};

    if (req.method === 'POST') {
      const requestData = await req.json();
      params = {
        specialty: requestData.specialty || userSpecialty,
        category: requestData.category,
        dateRange: requestData.dateRange || 'week',
        limit: requestData.limit || 20,
        offset: requestData.offset || 0,
        keywords: requestData.keywords,
        excludeKeywords: requestData.excludeKeywords,
        minRelevanceScore: requestData.minRelevanceScore || 0.5
      };
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      params = {
        specialty: url.searchParams.get('specialty') || userSpecialty,
        category: url.searchParams.get('category') as any,
        dateRange: url.searchParams.get('dateRange') as any || 'week',
        limit: parseInt(url.searchParams.get('limit') || '20'),
        offset: parseInt(url.searchParams.get('offset') || '0'),
        keywords: url.searchParams.get('keywords')?.split(',').filter(k => k.trim()),
        excludeKeywords: url.searchParams.get('excludeKeywords')?.split(',').filter(k => k.trim()),
        minRelevanceScore: parseFloat(url.searchParams.get('minRelevanceScore') || '0.5')
      };
    }

    console.log('Medical News Request', {
      userId: jwtPayload.id,
      specialty: params.specialty,
      category: params.category,
      dateRange: params.dateRange,
      keywords: params.keywords
    });

    const cacheKey = generateMedicalNewsCacheKey(params);
    
    // Check cache first
    const cachedResult = getCachedMedicalNewsResult(cacheKey);
    if (cachedResult) {
      console.log('Medical News Cache Hit', {
        userId: jwtPayload.id,
        specialty: params.specialty,
        cacheKey
      });
      
      return new Response(
        JSON.stringify({ success: true, data: cachedResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();

    // Get medical news from database
    const articles = await getMedicalNewsFromDB(params, jwtPayload.id);
    
    // Get trending topics
    const trendingTopics = await getTrendingTopics(params.specialty);

    const searchTime = Date.now() - startTime;

    // Transform to standard search result format
    const transformedData = transformNewsToSearchResults(articles);
    transformedData.searchTime = searchTime;
    transformedData.trendingTopics = trendingTopics;
    transformedData.specialty = params.specialty;
    transformedData.category = params.category;
    transformedData.dateRange = params.dateRange;

    // Cache the result
    setCachedMedicalNewsResult(cacheKey, transformedData);

    console.log('Medical News Success', {
      userId: jwtPayload.id,
      resultCount: transformedData.results.length,
      searchTime,
      specialty: params.specialty,
      trendingCount: trendingTopics.length
    });

    return new Response(
      JSON.stringify({ success: true, data: transformedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Medical News Error:', error)

    return new Response(
      JSON.stringify({ 
        error: 'Medical news fetch failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        provider: 'medical-news'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})