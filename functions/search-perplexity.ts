/**
 * Perplexity AI Search API Gateway
 * Secure proxy for Perplexity AI Chat API with medical search optimization
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { withAuth } from './utils/auth';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { parseRequest } from './utils/request';
import { ENV_VARS } from './utils/constants';
import { logInfo, logError } from './utils/logger';

// Cache for Perplexity Search results
const perplexityCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const PERPLEXITY_CACHE_TTL = 25 * 60 * 1000; // 25 minutes (longer for AI-generated summaries)

function generatePerplexityCacheKey(params: any): string {
  const keyData = {
    query: params.query.toLowerCase().trim(),
    model: params.model || 'sonar-pro',
    searchRecencyFilter: params.searchRecencyFilter,
    searchDomainFilter: params.searchDomainFilter
  };
  return `perplexity:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
}

function getCachedPerplexityResult(cacheKey: string): any | null {
  const cached = perplexityCache.get(cacheKey);
  
  if (!cached || Date.now() - cached.timestamp > cached.ttl) {
    if (cached) perplexityCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setCachedPerplexityResult(cacheKey: string, data: any): void {
  if (perplexityCache.size >= 50) { // Smaller cache for expensive AI results
    const oldestKey = Array.from(perplexityCache.keys())[0];
    perplexityCache.delete(oldestKey);
  }
  
  perplexityCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: PERPLEXITY_CACHE_TTL
  });
}

interface PerplexitySearchParams {
  query: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  returnCitations?: boolean;
  searchDomainFilter?: string[];
  searchRecencyFilter?: string;
}

interface PerplexityCitation {
  number: number;
  url: string;
  title?: string;
  text?: string;
}

interface PerplexitySearchResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  citations?: (string | PerplexityCitation)[];
  search_results?: Array<{
    title: string;
    url: string;
    date?: string;
    last_updated?: string;
  }>;
}

async function callPerplexityAPI(params: PerplexitySearchParams): Promise<PerplexitySearchResponse> {
  const apiKey = ENV_VARS.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    logError('Perplexity API key missing', {
      hasEnvVar: !!process.env.VITE_PERPLEXITY_API_KEY,
      envVarPrefix: process.env.VITE_PERPLEXITY_API_KEY?.substring(0, 8) || 'none'
    });
    throw new Error('Perplexity AI API key not configured');
  }

  // Optimize query for medical search
  const optimizedQuery = buildMedicalSearchQuery(params.query);

  const requestBody = {
    model: params.model || 'sonar-pro',
    messages: [
      {
        role: 'system',
        content: 'You are a medical research assistant. Provide evidence-based information with proper citations. Focus on peer-reviewed sources, clinical guidelines, and authoritative medical organizations. Include publication dates and evidence levels when available.'
      },
      {
        role: 'user',
        content: optimizedQuery
      }
    ],
    max_tokens: params.maxTokens || 2000,
    temperature: params.temperature || 0.2,
    top_p: params.topP || 0.9,
    // Correct Perplexity API parameters based on documentation
    search_domain_filter: params.searchDomainFilter || getMedicalDomains(),
    search_recency_filter: params.searchRecencyFilter,
    return_images: false,
    return_related_questions: false
  };

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'User-Agent': 'MediMind-Expert/1.0'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    logError('Perplexity AI API Error', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      requestBody: JSON.stringify(requestBody, null, 2) // Log the request body for debugging
    });
    console.error('PERPLEXITY API ERROR DETAILS:', {
      status: response.status,
      statusText: response.statusText,
      errorResponse: errorText,
      sentRequest: requestBody
    });
    throw new Error(`Perplexity AI API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

function buildMedicalSearchQuery(query: string): string {
  // Create a comprehensive search query for medical literature
  return `Please search for evidence-based medical information about: "${query}". 

Include:
- Recent clinical studies and systematic reviews
- Current clinical guidelines and recommendations  
- Evidence levels and quality of studies
- Key findings and clinical implications
- Safety considerations and contraindications

Focus on authoritative sources like PubMed, Cochrane, major medical journals, and professional medical organizations. Please provide specific citations with publication dates.`;
}

function getMedicalDomains(): string[] {
  // Perplexity API allows max 10 domains - prioritize highest authority sources
  return [
    'pubmed.ncbi.nlm.nih.gov',  // #1 - Primary medical literature database
    'cochrane.org',             // #2 - Systematic reviews and meta-analyses
    'nejm.org',                 // #3 - New England Journal of Medicine
    'jamanetwork.com',          // #4 - JAMA and JAMA Network journals
    'thelancet.com',            // #5 - The Lancet medical journal
    'bmj.com',                  // #6 - British Medical Journal
    'nature.com',               // #7 - Nature journals including Nature Medicine
    'who.int',                  // #8 - World Health Organization
    'cdc.gov',                  // #9 - Centers for Disease Control
    'nih.gov'                   // #10 - National Institutes of Health
  ];
}

function processPerplexityResponse(perplexityResponse: PerplexitySearchResponse, originalQuery: string) {
  console.log('🔍 [PERPLEXITY] Processing response:', {
    hasChoices: !!(perplexityResponse?.choices?.length),
    citationsType: typeof perplexityResponse?.citations,
    citationsLength: Array.isArray(perplexityResponse?.citations) ? perplexityResponse.citations.length : 0,
    fullResponse: JSON.stringify(perplexityResponse, null, 2)
  });

  // Safety checks
  if (!perplexityResponse || !perplexityResponse.choices || perplexityResponse.choices.length === 0) {
    console.log('❌ [PERPLEXITY] No valid choices in response');
    return {
      results: [],
      summary: '',
      evidenceLevel: 'mixed',
      keyFindings: [],
      totalCount: 0,
      searchTime: Date.now(),
      provider: 'perplexity' as const,
      query: originalQuery || '',
      model: perplexityResponse?.model || 'unknown',
      usage: perplexityResponse?.usage || { total_tokens: 0 },
      responseId: perplexityResponse?.id || 'unknown'
    };
  }

  const choice = perplexityResponse.choices[0];
  const content = choice?.message?.content || '';
  const citations = Array.isArray(perplexityResponse.citations) ? perplexityResponse.citations : [];
  const searchResults = Array.isArray(perplexityResponse.search_results) ? perplexityResponse.search_results : [];

  console.log('📄 [PERPLEXITY] Content analysis:', {
    contentLength: content.length,
    contentPreview: content.substring(0, 200),
    citationsCount: citations.length,
    citationsPreview: citations.slice(0, 2),
    citationsType: citations.length > 0 ? typeof citations[0] : 'none',
    searchResultsCount: searchResults.length,
    searchResultsPreview: searchResults.slice(0, 2)
  });

  // Extract key information from the response
  const summary = extractSummary(content);
  const evidenceLevel = extractEvidenceLevel(content);
  const keyFindings = extractKeyFindings(content);
  
  let results = [];
  
  if (citations.length > 0) {
    console.log('🔗 [PERPLEXITY] Processing citations:', citations);
    
    // Handle citations - they can be strings (URLs) or objects
    results = citations
      .filter(citation => citation) // Filter out null/undefined
      .map((citation, index) => {
        // Handle both string URLs and citation objects
        const isString = typeof citation === 'string';
        const url = isString ? citation : citation.url;
        const title = isString ? null : citation.title;
        const text = isString ? null : citation.text;
        const number = isString ? index + 1 : citation.number || index + 1;
        
        // Try to get additional info from search_results if available
        const searchResult = searchResults.find(sr => sr.url === url);
        
        return {
          id: `perplexity_${number}`,
          title: title || searchResult?.title || extractTitleFromUrl(url),
          url: url,
          snippet: text || extractSnippetFromContent(content, number) || summary.substring(0, 200),
          source: extractDomain(url),
          provider: 'perplexity' as const,
          relevanceScore: calculateCitationRelevance({ url, title, text, number }, content, originalQuery),
          citationNumber: number,
          evidenceLevel: classifySourceEvidenceLevel(url),
          contentType: classifyContentType(url, title || searchResult?.title || ''),
          publishedDate: searchResult?.date,
          lastUpdated: searchResult?.last_updated
        };
      })
      .filter(result => result.url); // Ensure we have valid URLs
  } else {
    // Extract URLs from content if no citations provided
    console.log('🔗 [PERPLEXITY] No citations provided, extracting URLs from content');
    const urlsFromContent = extractUrlsFromContent(content);
    results = urlsFromContent.map((urlData, index) => ({
      id: `perplexity_extracted_${index}`,
      title: urlData.title || extractTitleFromUrl(urlData.url),
      url: urlData.url,
      snippet: urlData.context || summary.substring(0, 200),
      source: extractDomain(urlData.url),
      provider: 'perplexity' as const,
      relevanceScore: 0.7, // Default relevance for extracted URLs
      citationNumber: index + 1,
      evidenceLevel: classifySourceEvidenceLevel(urlData.url),
      contentType: classifyContentType(urlData.url, urlData.title || '')
    }));
  }

  console.log('✅ [PERPLEXITY] Results processed:', {
    resultsCount: results.length,
    hasContent: content.length > 0,
    hasSummary: summary.length > 0
  });

  return {
    results,
    summary,
    evidenceLevel,
    keyFindings,
    totalCount: results.length,
    searchTime: Date.now(),
    provider: 'perplexity' as const,
    query: originalQuery,
    model: perplexityResponse.model,
    usage: perplexityResponse.usage,
    responseId: perplexityResponse.id
  };
}

function extractSummary(content: string): string {
  // Extract the first paragraph or first 300 characters as summary
  const sentences = content.split('. ');
  const summary = sentences.slice(0, 3).join('. ');
  return summary.length > 300 ? summary.substring(0, 297) + '...' : summary;
}

function extractEvidenceLevel(content: string): string {
  const evidenceLevelRegex = /(systematic review|meta-analysis|randomized controlled trial|RCT|cohort study|case-control|case series|expert opinion|clinical guidelines?)/i;
  const match = content.match(evidenceLevelRegex);
  return match ? match[1].toLowerCase() : 'mixed';
}

function extractKeyFindings(content: string): string[] {
  // Extract bullet points or numbered lists as key findings
  const bulletRegex = /[•\-\*]\s*(.+?)(?=\n|$)/g;
  const numberRegex = /\d+\.\s*(.+?)(?=\n|$)/g;
  
  const findings: string[] = [];
  let match;
  
  while ((match = bulletRegex.exec(content)) !== null) {
    findings.push(match[1].trim());
  }
  
  while ((match = numberRegex.exec(content)) !== null) {
    findings.push(match[1].trim());
  }
  
  return findings.slice(0, 5); // Limit to top 5 findings
}

function extractUrlsFromContent(content: string): Array<{url: string, title?: string, context?: string}> {
  const urls: Array<{url: string, title?: string, context?: string}> = [];
  
  // Match URLs in the content
  const urlRegex = /https?:\/\/[^\s\[\]()]+/g;
  const matches = content.match(urlRegex) || [];
  
  // Also look for markdown-style links
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let markdownMatch;
  while ((markdownMatch = markdownLinkRegex.exec(content)) !== null) {
    const [, title, url] = markdownMatch;
    if (url.startsWith('http')) {
      urls.push({ url, title, context: extractContextAroundUrl(content, url) });
    }
  }
  
  // Add plain URLs
  matches.forEach(url => {
    // Skip if already added as markdown link
    if (!urls.some(existing => existing.url === url)) {
      urls.push({ 
        url, 
        context: extractContextAroundUrl(content, url)
      });
    }
  });
  
  // Filter to medical domains only
  return urls.filter(urlData => isMedicalDomain(urlData.url));
}

function extractContextAroundUrl(content: string, url: string): string {
  const index = content.indexOf(url);
  if (index === -1) return '';
  
  const start = Math.max(0, index - 100);
  const end = Math.min(content.length, index + url.length + 100);
  return content.substring(start, end).trim();
}

function isMedicalDomain(url: string): boolean {
  const medicalDomains = [
    'pubmed.ncbi.nlm.nih.gov',
    'cochrane.org',
    'nejm.org',
    'jamanetwork.com',
    'thelancet.com',
    'bmj.com',
    'nature.com',
    'who.int',
    'cdc.gov',
    'nih.gov',
    'acc.org',
    'heart.org',
    'ahajournals.org',
    'acog.org',
    'ajog.org',
    'fertstert.org',
    'guidelines.gov',
    'uptodate.com',
    'clinicaltrials.gov'
  ];
  
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return medicalDomains.some(medDomain => domain.includes(medDomain));
  } catch {
    return false;
  }
}

function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract from PubMed URLs
    if (url.includes('pubmed.ncbi.nlm.nih.gov')) {
      return 'PubMed Article';
    }
    
    // Extract from other sources
    const segments = pathname.split('/').filter(seg => seg && seg !== 'article');
    return segments[segments.length - 1]?.replace(/-/g, ' ') || urlObj.hostname;
  } catch {
    return 'Medical Article';
  }
}

function extractSnippetFromContent(content: string, citationNumber: number): string {
  // Safety check for content
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Find text around citation number
  const citationRegex = new RegExp(`\\[${citationNumber}\\]`);
  const match = content.search(citationRegex);
  
  if (match !== -1) {
    const start = Math.max(0, match - 150);
    const end = Math.min(content.length, match + 150);
    return content.substring(start, end).trim();
  }
  
  return content.substring(0, Math.min(200, content.length));
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function calculateCitationRelevance(citation: any, content: string, query: string): number {
  let score = 0.5; // Base score
  
  // Safety checks
  if (!citation || !citation.url) {
    return score;
  }
  
  // Domain authority boost
  const domain = extractDomain(citation.url);
  const highAuthorityDomains = [
    'pubmed.ncbi.nlm.nih.gov',
    'pmc.ncbi.nlm.nih.gov',
    'cochrane.org',
    'nejm.org',
    'jamanetwork.com',
    'thelancet.com',
    'nature.com'
  ];
  
  if (highAuthorityDomains.some(authDomain => domain.includes(authDomain))) {
    score += 0.3;
  }
  
  // Citation context relevance
  if (content && query) {
    const citationContext = extractSnippetFromContent(content, citation.number || 1);
    const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 2); // Skip short terms
    
    if (citationContext && queryTerms.length > 0) {
      const contextLower = citationContext.toLowerCase();
      queryTerms.forEach(term => {
        if (contextLower.includes(term)) {
          score += 0.1;
        }
      });
    }
  }
  
  return Math.min(score, 1.0);
}

function classifySourceEvidenceLevel(url: string): string {
  const domain = extractDomain(url);
  
  if (domain.includes('cochrane.org')) return 'systematic_review';
  if (domain.includes('pubmed.ncbi.nlm.nih.gov')) return 'research_paper';
  if (domain.includes('guidelines.gov') || url.includes('guideline')) return 'guideline';
  if (domain.includes('uptodate.com')) return 'review_article';
  
  return 'mixed';
}

function classifyContentType(url: string, title: string): string {
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  const domain = extractDomain(url);
  
  // Check for clinical trials
  if (domain.includes('clinicaltrials.gov') || titleLower.includes('clinical trial') || titleLower.includes('trial')) {
    return 'clinical-trial';
  }
  
  // Check for guidelines
  if (domain.includes('guidelines.gov') || titleLower.includes('guideline') || titleLower.includes('consensus')) {
    return 'clinical-guideline';
  }
  
  // Check for systematic reviews
  if (domain.includes('cochrane.org') || titleLower.includes('systematic review') || titleLower.includes('meta-analysis')) {
    return 'systematic-review';
  }
  
  // Default to journal article for medical sources
  if (domain.includes('pubmed') || domain.includes('nejm') || domain.includes('jama') || 
      domain.includes('lancet') || domain.includes('bmj') || domain.includes('nature')) {
    return 'journal-article';
  }
  
  return 'journal-article'; // Default content type
}

const handler = withAuth(async (event: HandlerEvent, user) => {
  try {
    const { method } = parseRequest(event);
    
    if (method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }

    const { q, filters = {} } = JSON.parse(event.body || '{}');
    
    if (!q || typeof q !== 'string') {
      logError('Invalid search query', {
        userId: user?.id,
        requestBody: event.body,
        receivedQuery: q,
        queryType: typeof q
      });
      return createErrorResponse('Search query is required', 400);
    }

    // Build search parameters
    const searchParams: PerplexitySearchParams = {
      query: q,
      model: filters.model || 'sonar-pro',
      maxTokens: Math.min(filters.maxTokens || 2000, 4000),
      temperature: filters.temperature || 0.2,
      returnCitations: filters.returnCitations !== false,
      searchRecencyFilter: mapRecencyToPerplexity(filters.recency)
    };

    // Check cache first
    const cacheKey = generatePerplexityCacheKey(searchParams);
    const cachedResult = getCachedPerplexityResult(cacheKey);
    
    if (cachedResult) {
      logInfo('Perplexity AI Search Cache Hit', {
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

    logInfo('Perplexity AI Search Request', {
      userId: user.id,
      query: q.substring(0, 100), // Log truncated query for privacy
      filters,
      cacheKey
    });

    // Add specialty-specific domain filters
    if (filters.specialty) {
      searchParams.searchDomainFilter = getSpecialtyDomains(filters.specialty);
    }

    // Call Perplexity AI API
    const perplexityResponse = await callPerplexityAPI(searchParams);
    
    // Process and format results
    const processedResults = processPerplexityResponse(perplexityResponse, q);
    
    // Cache successful results
    if (processedResults.results.length > 0) {
      setCachedPerplexityResult(cacheKey, processedResults);
    }
    
    logInfo('Perplexity AI Search Success', {
      userId: user.id,
      resultCount: processedResults.results.length,
      provider: 'perplexity',
      tokensUsed: perplexityResponse.usage.total_tokens,
      cached: false
    });

    return createSuccessResponse({
      ...processedResults,
      cached: false,
      cacheKey
    });

  } catch (error) {
    logError('Perplexity AI Search Error', {
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

function mapRecencyToPerplexity(recency: string): string | undefined {
  switch (recency) {
    case 'pastWeek': return 'week';
    case 'pastMonth': return 'month';
    case 'pastYear': return 'year';
    default: return undefined;
  }
}

function getSpecialtyDomains(specialty: string): string[] {
  // Perplexity API allows max 10 domains - customize for specialty while staying within limit
  const baseDomains = [
    'pubmed.ncbi.nlm.nih.gov',
    'cochrane.org',
    'nejm.org',
    'jamanetwork.com',
    'thelancet.com',
    'bmj.com',
    'nature.com'
  ];
  
  switch (specialty) {
    case 'cardiology':
      return [
        ...baseDomains,
        'acc.org',          // American College of Cardiology
        'heart.org',        // American Heart Association
        'ahajournals.org'   // AHA Journals
      ];
    case 'obgyn':
      return [
        ...baseDomains,
        'acog.org',         // American College of Obstetricians and Gynecologists
        'ajog.org',         // American Journal of Obstetrics & Gynecology
        'fertstert.org'     // Fertility and Sterility
      ];
    default:
      return [
        ...baseDomains,
        'who.int',
        'cdc.gov',
        'nih.gov'
      ];
  }
}

export { handler };