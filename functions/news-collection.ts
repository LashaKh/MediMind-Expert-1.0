/**
 * News Collection Function
 * Automated medical news collection using existing search infrastructure
 * Integrates with Brave, Exa, and Perplexity APIs for comprehensive news gathering
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { parseRequest } from './utils/request';
import { logInfo, logError, logWarning } from './utils/logger';
import { withAuth } from './utils/auth';
import { createRateLimit } from './utils/rateLimit';

// Supabase integration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface NewsArticle {
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedDate: string;
  author?: string;
  category: 'research' | 'drug_approvals' | 'clinical_trials' | 'guidelines' | 'breaking_news' | 'policy_updates';
  specialty: 'cardiology' | 'obgyn' | 'general' | 'emergency_medicine' | 'internal_medicine' | 'surgery';
  relevanceScore: number;
  credibilityScore: number;
  contentType: 'article' | 'study' | 'guideline' | 'press_release' | 'editorial' | 'review';
  evidenceLevel?: 'systematic_review' | 'rct' | 'cohort_study' | 'case_control' | 'case_series' | 'expert_opinion' | 'guideline';
  keywords: string[];
}

interface CollectionConfig {
  id: string;
  specialty: string;
  searchQueries: string[];
  apiPreferences: {
    brave?: { enabled: boolean; priority: number; medical_filter?: boolean };
    exa?: { enabled: boolean; priority: number; academic_bias?: number };
    perplexity?: { enabled: boolean; priority: number; pro_search?: boolean };
  };
  updateFrequency: number;
  isActive: boolean;
  maxArticlesPerCollection: number;
  minCredibilityScore: number;
  minRelevanceScore: number;
  maxArticleAgeDays: number;
  enableSummarization: boolean;
  enableKeywordExtraction: boolean;
  enableCategorization: boolean;
  lastCollectionAt: string | null;
}

interface CollectionResult {
  specialty: string;
  articlesCollected: number;
  articlesProcessed: number;
  duplicatesSkipped: number;
  lowQualitySkipped: number;
  errors: string[];
  processingTime: number;
  providersUsed: string[];
}

interface SearchProviderResult {
  provider: string;
  results: any[];
  success: boolean;
  error?: string;
  searchTime: number;
}

// Medical news source credibility scoring
const SOURCE_CREDIBILITY_SCORES: Record<string, number> = {
  // Tier 1: Highest credibility (0.95-1.0)
  'nejm.org': 1.0,
  'thelancet.com': 1.0,
  'jamanetwork.com': 0.98,
  'bmj.com': 0.98,
  'nature.com': 0.97,
  'cell.com': 0.97,
  'sciencemag.org': 0.96,
  'ahajournals.org': 0.95, // American Heart Association
  'acc.org': 0.95, // American College of Cardiology
  
  // Tier 2: High credibility (0.85-0.94)
  'clinicaltrials.gov': 0.94,
  'fda.gov': 0.92,
  'cdc.gov': 0.92,
  'nih.gov': 0.91,
  'who.int': 0.90,
  'cochrane.org': 0.90,
  'uptodate.com': 0.88,
  'medscape.com': 0.86,
  'pubmed.ncbi.nlm.nih.gov': 0.85,
  
  // Tier 3: Moderate credibility (0.70-0.84)
  'reuters.com/healthcare': 0.82,
  'statnews.com': 0.80,
  'fiercehealthcare.com': 0.78,
  'modernhealthcare.com': 0.76,
  'healthaffairs.org': 0.75,
  'medpagetoday.com': 0.74,
  'theheart.org': 0.72,
  'cardiology.org': 0.70,
  
  // Default for unknown sources
  'default': 0.60
};

// Keywords for medical categorization
const CATEGORY_KEYWORDS = {
  research: ['study', 'research', 'trial', 'findings', 'analysis', 'systematic review', 'meta-analysis'],
  drug_approvals: ['fda approval', 'drug approval', 'medication', 'pharmaceutical', 'therapy', 'treatment approved'],
  clinical_trials: ['clinical trial', 'phase i', 'phase ii', 'phase iii', 'randomized', 'controlled trial'],
  guidelines: ['guidelines', 'recommendation', 'practice guideline', 'clinical practice', 'consensus', 'standards'],
  breaking_news: ['breaking', 'urgent', 'alert', 'emergency', 'immediate', 'critical'],
  policy_updates: ['policy', 'regulation', 'healthcare policy', 'medical policy', 'cms', 'medicare', 'medicaid']
};

const EVIDENCE_LEVEL_KEYWORDS = {
  systematic_review: ['systematic review', 'meta-analysis', 'cochrane review'],
  rct: ['randomized controlled trial', 'rct', 'randomized trial', 'controlled trial'],
  cohort_study: ['cohort study', 'longitudinal study', 'prospective study'],
  case_control: ['case-control study', 'case control', 'retrospective study'],
  case_series: ['case series', 'case report', 'case study'],
  expert_opinion: ['expert opinion', 'editorial', 'commentary', 'opinion'],
  guideline: ['clinical guideline', 'practice guideline', 'guideline', 'recommendation']
};

// Content hash generation for duplicate detection
function generateContentHash(title: string, sourceUrl: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(`${title}:${sourceUrl}`).digest('hex');
}

// Calculate source credibility score
function calculateCredibilityScore(sourceUrl: string, sourceName: string): number {
  try {
    const domain = new URL(sourceUrl).hostname.toLowerCase();
    
    // Check exact domain matches
    if (SOURCE_CREDIBILITY_SCORES[domain]) {
      return SOURCE_CREDIBILITY_SCORES[domain];
    }
    
    // Check partial domain matches
    for (const [scoredDomain, score] of Object.entries(SOURCE_CREDIBILITY_SCORES)) {
      if (domain.includes(scoredDomain) || scoredDomain.includes(domain)) {
        return score;
      }
    }
    
    // Check source name patterns
    const sourceLower = sourceName.toLowerCase();
    if (sourceLower.includes('journal') || sourceLower.includes('medical')) {
      return 0.75;
    }
    if (sourceLower.includes('university') || sourceLower.includes('hospital')) {
      return 0.70;
    }
    
    return SOURCE_CREDIBILITY_SCORES.default;
  } catch (error) {
    logWarning('Error calculating credibility score', { sourceUrl, sourceName, error });
    return SOURCE_CREDIBILITY_SCORES.default;
  }
}

// Categorize article content
function categorizeArticle(title: string, summary: string, sourceUrl: string): {
  category: NewsArticle['category'];
  evidenceLevel?: NewsArticle['evidenceLevel'];
  contentType: NewsArticle['contentType'];
} {
  const text = `${title} ${summary}`.toLowerCase();
  
  // Determine category
  let category: NewsArticle['category'] = 'research'; // default
  let maxScore = 0;
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      category = cat as NewsArticle['category'];
    }
  }
  
  // Determine evidence level
  let evidenceLevel: NewsArticle['evidenceLevel'] | undefined;
  maxScore = 0;
  
  for (const [level, keywords] of Object.entries(EVIDENCE_LEVEL_KEYWORDS)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      evidenceLevel = level as NewsArticle['evidenceLevel'];
    }
  }
  
  // Determine content type
  let contentType: NewsArticle['contentType'] = 'article'; // default
  
  if (text.includes('guideline') || text.includes('recommendation')) {
    contentType = 'guideline';
  } else if (text.includes('editorial') || text.includes('opinion')) {
    contentType = 'editorial';
  } else if (text.includes('review') || text.includes('systematic review')) {
    contentType = 'review';
  } else if (text.includes('study') || text.includes('trial') || text.includes('research')) {
    contentType = 'study';
  } else if (text.includes('press release') || text.includes('announcement')) {
    contentType = 'press_release';
  }
  
  return { category, evidenceLevel, contentType };
}

// Extract keywords from article content
function extractKeywords(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  
  // Medical terms and keywords
  const medicalTerms = [
    'cardiology', 'cardiac', 'heart', 'cardiovascular', 'coronary', 'myocardial', 'atrial', 'ventricular',
    'hypertension', 'diabetes', 'cholesterol', 'stent', 'bypass', 'catheterization', 'echocardiogram',
    'clinical trial', 'randomized', 'controlled', 'meta-analysis', 'systematic review',
    'fda', 'approval', 'drug', 'medication', 'therapy', 'treatment', 'diagnosis',
    'patient', 'outcome', 'mortality', 'morbidity', 'efficacy', 'safety', 'adverse'
  ];
  
  const foundTerms = medicalTerms.filter(term => text.includes(term));
  
  // Add additional keyword extraction logic if needed
  // For now, return found medical terms plus first 5 significant words from title
  const titleWords = title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !['with', 'from', 'that', 'this', 'they', 'have', 'been', 'were'].includes(word))
    .slice(0, 5);
  
  return [...new Set([...foundTerms, ...titleWords])].slice(0, 10);
}

// Calculate relevance score for specialty
function calculateRelevanceScore(article: any, specialty: string): number {
  const text = `${article.title} ${article.summary || article.snippet || ''}`.toLowerCase();
  
  const specialtyKeywords: Record<string, string[]> = {
    cardiology: [
      'cardiology', 'cardiac', 'heart', 'cardiovascular', 'coronary', 'myocardial',
      'atrial', 'ventricular', 'hypertension', 'cholesterol', 'arrhythmia', 'ecg',
      'echocardiogram', 'catheterization', 'angioplasty', 'stent', 'bypass'
    ],
    obgyn: [
      'obstetrics', 'gynecology', 'pregnancy', 'birth', 'maternal', 'fetal',
      'cervical', 'ovarian', 'uterine', 'menstrual', 'contraception', 'fertility',
      'prenatal', 'postpartum', 'cesarean', 'vaginal', 'hormonal'
    ],
    general: [
      'medicine', 'medical', 'health', 'healthcare', 'clinical', 'patient',
      'diagnosis', 'treatment', 'therapy', 'prevention', 'public health'
    ]
  };
  
  const keywords = specialtyKeywords[specialty] || specialtyKeywords.general;
  const matchCount = keywords.reduce((count, keyword) => {
    return count + (text.includes(keyword) ? 1 : 0);
  }, 0);
  
  // Calculate score based on keyword matches and other factors
  let score = Math.min(matchCount / keywords.length * 2, 1.0); // Base score from keyword matches
  
  // Boost score for high-quality sources
  if (text.includes('journal') || text.includes('study') || text.includes('research')) {
    score = Math.min(score + 0.2, 1.0);
  }
  
  // Reduce score for generic content
  if (text.includes('breaking') || text.includes('news') || text.includes('report')) {
    score = Math.max(score - 0.1, 0.0);
  }
  
  return Math.round(score * 1000) / 1000; // Round to 3 decimal places
}

// Process article from raw search result
function processArticle(rawResult: any, specialty: string): NewsArticle | null {
  try {
    const title = rawResult.title || '';
    const summary = rawResult.snippet || rawResult.summary || rawResult.description || '';
    const sourceUrl = rawResult.url || rawResult.link || '';
    const sourceName = rawResult.source || rawResult.domain || new URL(sourceUrl).hostname;
    
    if (!title || !sourceUrl || title.length < 10 || summary.length < 30) {
      return null; // Skip low-quality results
    }
    
    const publishedDate = rawResult.publishedDate || rawResult.date || new Date().toISOString();
    const credibilityScore = calculateCredibilityScore(sourceUrl, sourceName);
    const relevanceScore = calculateRelevanceScore(rawResult, specialty);
    const { category, evidenceLevel, contentType } = categorizeArticle(title, summary, sourceUrl);
    const keywords = extractKeywords(title, summary);
    
    return {
      title: title.substring(0, 500), // Ensure title length constraint
      summary: summary.substring(0, 2000), // Ensure summary length constraint
      sourceUrl: sourceUrl.substring(0, 2000), // Ensure URL length constraint
      sourceName,
      publishedDate,
      author: rawResult.author || null,
      category,
      specialty: specialty as NewsArticle['specialty'],
      relevanceScore,
      credibilityScore,
      contentType,
      evidenceLevel,
      keywords
    };
  } catch (error) {
    logError('Error processing article', { error, rawResult });
    return null;
  }
}

// Direct API key access
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || process.env.VITE_BRAVE_API_KEY;
const EXA_API_KEY = process.env.EXA_API_KEY || process.env.VITE_EXA_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || process.env.VITE_PERPLEXITY_API_KEY;

// Call individual search provider directly
async function callSearchProvider(
  provider: string,
  query: string,
  config: CollectionConfig,
  baseUrl: string
): Promise<SearchProviderResult> {
  const startTime = Date.now();
  
  try {
    const providerConfig = config.apiPreferences[provider as keyof typeof config.apiPreferences];
    if (!providerConfig?.enabled) {
      return {
        provider,
        results: [],
        success: false,
        error: 'Provider not enabled',
        searchTime: 0
      };
    }
    
    let results: any[] = [];
    let apiKey: string | undefined;
    
    // Call APIs directly instead of through HTTP functions
    switch (provider) {
      case 'brave':
        apiKey = BRAVE_API_KEY;
        if (!apiKey) {
          throw new Error('Brave API key not configured');
        }
        
        const braveUrl = new URL('https://api.search.brave.com/res/v1/web/search');
        braveUrl.searchParams.set('q', `${query} medical health news`);
        braveUrl.searchParams.set('count', '10');
        braveUrl.searchParams.set('text_decorations', 'false');
        braveUrl.searchParams.set('search_lang', 'en');
        braveUrl.searchParams.set('country', 'US');
        braveUrl.searchParams.set('freshness', 'pw'); // Past week
        
        const braveResponse = await fetch(braveUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Subscription-Token': apiKey
          },
          signal: AbortSignal.timeout(30000)
        });
        
        if (!braveResponse.ok) {
          throw new Error(`Brave API returned ${braveResponse.status}`);
        }
        
        const braveData = await braveResponse.json();
        results = (braveData.web?.results || []).map((item: any) => ({
          title: item.title,
          snippet: item.description,
          url: item.url,
          source: new URL(item.url).hostname,
          publishedDate: item.age || new Date().toISOString()
        }));
        break;
        
      case 'exa':
        apiKey = EXA_API_KEY;
        if (!apiKey) {
          throw new Error('Exa API key not configured');
        }
        
        const exaResponse = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            query: `${query} medical health`,
            useAutoprompt: true,
            numResults: Math.ceil(config.maxArticlesPerCollection / config.searchQueries.length),
            contents: {
              text: true,
              highlights: true
            }
          })
        });
        
        if (!exaResponse.ok) {
          throw new Error(`Exa API returned ${exaResponse.status}`);
        }
        
        const exaData = await exaResponse.json();
        results = (exaData.results || []).map((item: any) => ({
          title: item.title,
          snippet: item.text || item.highlights?.[0] || '',
          url: item.url,
          source: new URL(item.url).hostname,
          publishedDate: item.publishedDate || new Date().toISOString()
        }));
        break;
        
      case 'perplexity':
        apiKey = PERPLEXITY_API_KEY;
        if (!apiKey) {
          throw new Error('Perplexity API key not configured');
        }
        
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [{
              role: 'user',
              content: `Find recent medical news articles about ${query}. Return exactly 5-8 articles in this JSON format:
{
  "articles": [
    {
      "title": "Article title here",
      "url": "https://source.com/article-url",
      "summary": "Brief 1-2 sentence summary",
      "source": "source-domain.com"
    }
  ]
}

Focus on recent, credible medical sources. Include the full working URL for each article.`
            }],
            max_tokens: 2000,
            temperature: 0.2,
            top_p: 0.9,
            return_citations: true,
            search_domain_filter: ["pubmed.ncbi.nlm.nih.gov", "nejm.org", "thelancet.com", "jamanetwork.com", "bmj.com", "medscape.com", "reuters.com", "statnews.com"]
          })
        });
        
        if (!perplexityResponse.ok) {
          throw new Error(`Perplexity API returned ${perplexityResponse.status}`);
        }
        
        const perplexityData = await perplexityResponse.json();
        const aiResponse = perplexityData.choices?.[0]?.message?.content || '';
        
        // Parse structured response from Perplexity
        try {
          // Try to extract JSON from the response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extractedData = JSON.parse(jsonMatch[0]);
            if (extractedData.articles && Array.isArray(extractedData.articles)) {
              results = extractedData.articles;
            }
          } else {
            // Parse line-by-line format
            const lines = aiResponse.split('\n').filter(line => line.trim());
            results = lines.map((line, index) => {
              const titleMatch = line.match(/title[:\s]+"([^"]+)"/i);
              const urlMatch = line.match(/url[:\s]+"([^"]+)"/i);
              const summaryMatch = line.match(/summary[:\s]+"([^"]+)"/i);
              
              if (titleMatch && urlMatch) {
                return {
                  title: titleMatch[1],
                  url: urlMatch[1],
                  summary: summaryMatch?.[1] || '',
                  source: new URL(urlMatch[1]).hostname
                };
              }
              return null;
            }).filter(Boolean);
          }
        } catch (parseError) {
          logWarning('Could not parse Perplexity response as structured data', { 
            response: aiResponse.substring(0, 500),
            parseError 
          });
          results = [];
        }
        break;
        
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
    
    const searchTime = Date.now() - startTime;
    
    return {
      provider,
      results,
      success: true,
      searchTime
    };
    
  } catch (error) {
    const searchTime = Date.now() - startTime;
    return {
      provider,
      results: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      searchTime
    };
  }
}

// Collect news for a specific specialty
async function collectNewsForSpecialty(
  config: CollectionConfig,
  baseUrl: string
): Promise<CollectionResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const providersUsed: string[] = [];
  let articlesCollected = 0;
  let articlesProcessed = 0;
  let duplicatesSkipped = 0;
  let lowQualitySkipped = 0;
  
  try {
    logInfo('Starting news collection', {
      specialty: config.specialty,
      queries: config.searchQueries.length,
      maxArticles: config.maxArticlesPerCollection
    });
    
    // Get all search results across providers and queries
    const allResults: NewsArticle[] = [];
    const processedHashes = new Set<string>();
    
    for (const query of config.searchQueries) {
      // Get enabled providers sorted by priority
      const enabledProviders = Object.entries(config.apiPreferences)
        .filter(([_, settings]) => settings.enabled)
        .sort(([_, a], [__, b]) => (a.priority || 999) - (b.priority || 999))
        .map(([provider]) => provider);
      
      for (const provider of enabledProviders) {
        try {
          const providerResult = await callSearchProvider(provider, query, config, baseUrl);
          
          if (providerResult.success) {
            providersUsed.push(provider);
            
            for (const rawResult of providerResult.results) {
              const article = processArticle(rawResult, config.specialty);
              
              if (!article) {
                continue;
              }
              
              articlesCollected++;
              
              // Check for duplicates
              const contentHash = generateContentHash(article.title, article.sourceUrl);
              if (processedHashes.has(contentHash)) {
                duplicatesSkipped++;
                continue;
              }
              
              // Apply quality filters
              if (article.credibilityScore < config.minCredibilityScore ||
                  article.relevanceScore < config.minRelevanceScore) {
                lowQualitySkipped++;
                continue;
              }
              
              processedHashes.add(contentHash);
              allResults.push(article);
              articlesProcessed++;
              
              // Stop if we've reached the max articles
              if (allResults.length >= config.maxArticlesPerCollection) {
                break;
              }
            }
          } else {
            errors.push(`${provider}: ${providerResult.error}`);
          }
          
          if (allResults.length >= config.maxArticlesPerCollection) {
            break;
          }
        } catch (error) {
          errors.push(`${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      if (allResults.length >= config.maxArticlesPerCollection) {
        break;
      }
    }
    
    // Store articles in database
    if (allResults.length > 0) {
      await storeArticlesInDatabase(allResults);
      
      // Update last collection timestamp
      await updateCollectionTimestamp(config.id);
    }
    
    const processingTime = Date.now() - startTime;
    
    logInfo('News collection completed', {
      specialty: config.specialty,
      articlesCollected,
      articlesProcessed,
      duplicatesSkipped,
      lowQualitySkipped,
      processingTime,
      providersUsed: [...new Set(providersUsed)]
    });
    
    return {
      specialty: config.specialty,
      articlesCollected,
      articlesProcessed,
      duplicatesSkipped,
      lowQualitySkipped,
      errors,
      processingTime,
      providersUsed: [...new Set(providersUsed)]
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    errors.push(`Collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      specialty: config.specialty,
      articlesCollected,
      articlesProcessed,
      duplicatesSkipped,
      lowQualitySkipped,
      errors,
      processingTime,
      providersUsed
    };
  }
}

// Store articles in database
async function storeArticlesInDatabase(articles: NewsArticle[]): Promise<void> {
  try {
    const insertData = articles.map(article => ({
      title: article.title,
      summary: article.summary,
      source_url: article.sourceUrl,
      source_name: article.sourceName,
      category: article.category,
      specialty: article.specialty,
      published_date: article.publishedDate,
      content_hash: generateContentHash(article.title, article.sourceUrl),
      keywords: article.keywords,
      author_name: article.author,
      relevance_score: article.relevanceScore,
      credibility_score: article.credibilityScore,
      content_type: article.contentType,
      evidence_level: article.evidenceLevel,
      processing_status: 'processed'
    }));
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/medical_news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify(insertData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Database insert failed: ${response.status} - ${errorText}`);
    }
    
    logInfo('Articles stored in database', { count: articles.length });
    
  } catch (error) {
    logError('Failed to store articles in database', { error, articleCount: articles.length });
    throw error;
  }
}

// Update collection timestamp
async function updateCollectionTimestamp(configId: string): Promise<void> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/news_collection_configs?id=eq.${configId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      },
      body: JSON.stringify({
        last_collection_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update collection timestamp: ${response.status}`);
    }
    
  } catch (error) {
    logError('Failed to update collection timestamp', { error, configId });
  }
}

// Get active collection configurations
async function getActiveCollectionConfigs(): Promise<CollectionConfig[]> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/news_collection_configs?is_active=eq.true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY!
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collection configs: ${response.status}`);
    }
    
    const configs = await response.json();
    
    return configs.map((config: any) => ({
      id: config.id,
      specialty: config.specialty,
      searchQueries: config.search_queries,
      apiPreferences: config.api_preferences,
      updateFrequency: config.update_frequency,
      isActive: config.is_active,
      maxArticlesPerCollection: config.max_articles_per_collection,
      minCredibilityScore: config.min_credibility_score,
      minRelevanceScore: config.min_relevance_score,
      maxArticleAgeDays: config.max_article_age_days,
      enableSummarization: config.enable_summarization,
      enableKeywordExtraction: config.enable_keyword_extraction,
      enableCategorization: config.enable_categorization,
      lastCollectionAt: config.last_collection_at
    }));
    
  } catch (error) {
    logError('Failed to get collection configs', { error });
    throw error;
  }
}

// Main handler
const baseHandler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    const { method } = parseRequest(event);
    
    // Allow both GET (for scheduled functions) and POST (for manual triggers)
    if (method !== 'POST' && method !== 'GET') {
      return createErrorResponse('Method not allowed', 405);
    }
    
    // For GET requests (scheduled), parse from query params
    // For POST requests (manual), parse from body
    let specialty: string | undefined;
    let force = false;
    
    if (method === 'GET') {
      // For scheduled functions, force collection for all specialties
      specialty = undefined; // Collect for all specialties
      force = true; // Force collection regardless of timing
    } else {
      const body = JSON.parse(event.body || '{}');
      specialty = body.specialty;
      force = body.force || false;
    }
    
    logInfo('News collection request', { specialty, force });
    
    // Get base URL for internal function calls
    const baseUrl = `https://${event.headers.host}`;
    
    // Get active collection configurations
    const configs = await getActiveCollectionConfigs();
    
    // Filter by specialty if specified
    const targetConfigs = specialty 
      ? configs.filter(config => config.specialty === specialty)
      : configs;
    
    if (targetConfigs.length === 0) {
      return createErrorResponse(
        specialty ? `No active configuration found for specialty: ${specialty}` : 'No active collection configurations found',
        404
      );
    }
    
    // Check if collection is needed (unless forced)
    const configsToProcess = force ? targetConfigs : targetConfigs.filter(config => {
      if (!config.lastCollectionAt) return true;
      
      const lastCollection = new Date(config.lastCollectionAt);
      const hoursSinceLastCollection = (Date.now() - lastCollection.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceLastCollection >= config.updateFrequency;
    });
    
    if (configsToProcess.length === 0) {
      return createSuccessResponse({
        message: 'All configurations are up to date',
        results: [],
        totalArticlesProcessed: 0
      });
    }
    
    // Process collections
    const results: CollectionResult[] = [];
    let totalArticles = 0;
    
    for (const config of configsToProcess) {
      try {
        const result = await collectNewsForSpecialty(config, baseUrl);
        results.push(result);
        totalArticles += result.articlesProcessed;
      } catch (error) {
        logError('Failed to collect news for specialty', { 
          specialty: config.specialty, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        
        results.push({
          specialty: config.specialty,
          articlesCollected: 0,
          articlesProcessed: 0,
          duplicatesSkipped: 0,
          lowQualitySkipped: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          processingTime: 0,
          providersUsed: []
        });
      }
    }
    
    logInfo('News collection batch completed', {
      configurationsProcessed: configsToProcess.length,
      totalArticlesProcessed: totalArticles,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0)
    });
    
    return createSuccessResponse({
      message: 'News collection completed',
      results,
      totalArticlesProcessed: totalArticles,
      configurationsProcessed: configsToProcess.length
    });
    
  } catch (error) {
    logError('News collection error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return createErrorResponse('News collection failed', 500);
  }
};

// Apply rate limiting (generous limits for scheduled collection)
const customRateLimit = createRateLimit('search'); // Use existing search rate limit config
const handler = customRateLimit(baseHandler);

export { handler };