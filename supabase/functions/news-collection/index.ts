import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

const BRAVE_API_KEYS = [
  'BSACH1LOne7f_ejIG29RJvcT06mFcm0',
  'BSAc0xnLJNsXXy4Pqx87EWjL7GrlALv',
  'BSAvs2D9EhfzTp9HZGwKUeWdCya6YBM',
  'BSApPOpdNQWW7-1HwAvSwM74e1lnP32'
];

const EXA_API_KEYS = [
  '49d3e90b-09da-4daa-8d17-6a20b4eb8976',
  'c7b7e4a2-2d0e-49b1-8a43-e9e39d2c5c2a', 
  'f3a2e8b1-4c5d-6e7f-8a9b-0c1d2e3f4a5b'
];

const PERPLEXITY_API_KEYS = [
  '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',
  'pplx-2e5a6b1d3c7f9e8a4b6c8d1f3e5a7b9c2d4f6a8b1c3e5f7'
];

interface NewsArticle {
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  category: 'research' | 'drug_approvals' | 'clinical_trials' | 'guidelines' | 'breaking_news' | 'policy_updates';
  specialty: 'cardiology' | 'obgyn' | 'general' | 'emergency_medicine' | 'internal_medicine' | 'surgery';
  relevanceScore: number;
  credibilityScore: number;
  publishedAt: string;
}

// Fix date parsing function
function parsePublishedDate(dateString: string): string {
  if (!dateString || typeof dateString !== 'string') {
    return new Date().toISOString();
  }

  // Handle relative dates like "6 days ago", "2 hours ago", etc.
  const relativeMatch = dateString.match(/(\d+)\s*(minute|hour|day|week|month|year)s?\s*ago/i);
  if (relativeMatch) {
    const [, amount, unit] = relativeMatch;
    const now = new Date();
    const numAmount = parseInt(amount, 10);
    
    switch (unit.toLowerCase()) {
      case 'minute':
        now.setMinutes(now.getMinutes() - numAmount);
        break;
      case 'hour':
        now.setHours(now.getHours() - numAmount);
        break;
      case 'day':
        now.setDate(now.getDate() - numAmount);
        break;
      case 'week':
        now.setDate(now.getDate() - (numAmount * 7));
        break;
      case 'month':
        now.setMonth(now.getMonth() - numAmount);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - numAmount);
        break;
    }
    
    return now.toISOString();
  }

  // Try to parse as regular date
  try {
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) {
      // If parsing fails, return current timestamp
      return new Date().toISOString();
    }
    return parsed.toISOString();
  } catch (error) {
    console.warn('Failed to parse date:', dateString, error);
    return new Date().toISOString();
  }
}

// Rotate API keys
function getRotatedApiKey(keys: string[], index: number): string {
  return keys[index % keys.length];
}

async function searchBrave(query: string, apiKeyIndex: number = 0): Promise<any[]> {
  const apiKey = getRotatedApiKey(BRAVE_API_KEYS, apiKeyIndex);
  
  try {
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10&summary=1&search_lang=en&country=US`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });

    if (response.status === 401) {
      throw new Error('Brave API returned 401');
    }

    if (!response.ok) {
      throw new Error(`Brave API returned ${response.status}`);
    }

    const data = await response.json();
    
    return (data.web?.results || []).map((result: any) => ({
      title: result.title || '',
      url: result.url || '',
      description: result.description || '',
      published: result.age || result.published || new Date().toISOString(),
      source: result.profile?.name || new URL(result.url || '').hostname
    }));
  } catch (error) {
    console.error('Brave search error:', error.message);
    throw error;
  }
}

async function searchExa(query: string, apiKeyIndex: number = 0): Promise<any[]> {
  const apiKey = getRotatedApiKey(EXA_API_KEYS, apiKeyIndex);
  
  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        query: query,
        type: 'neural',
        useAutoprompt: true,
        numResults: 10,
        contents: {
          text: true
        }
      })
    });

    if (response.status === 401) {
      throw new Error('Exa API returned 401');
    }

    if (!response.ok) {
      throw new Error(`Exa API returned ${response.status}`);
    }

    const data = await response.json();
    
    return (data.results || []).map((result: any) => ({
      title: result.title || '',
      url: result.url || '',
      description: result.text || result.summary || '',
      published: result.publishedDate || new Date().toISOString(),
      source: new URL(result.url || '').hostname
    }));
  } catch (error) {
    console.error('Exa search error:', error.message);
    throw error;
  }
}

async function searchPerplexity(query: string, apiKeyIndex: number = 0): Promise<any[]> {
  const apiKey = getRotatedApiKey(PERPLEXITY_API_KEYS, apiKeyIndex);
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a medical news aggregator. Return recent medical news articles in JSON format with title, url, description, published date, and source.'
          },
          {
            role: 'user',
            content: `Find recent medical news articles about: ${query}. Return as JSON array.`
          }
        ],
        max_tokens: 2000
      })
    });

    if (response.status === 401) {
      throw new Error('Perplexity API returned 401');
    }

    if (!response.ok) {
      throw new Error(`Perplexity API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to extract JSON from response
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const articles = JSON.parse(jsonMatch[0]);
        return articles.map((article: any) => ({
          title: article.title || '',
          url: article.url || '',
          description: article.description || article.summary || '',
          published: article.published || article.publishedDate || new Date().toISOString(),
          source: article.source || (article.url ? new URL(article.url).hostname : '')
        }));
      }
    } catch (parseError) {
      console.warn('Could not parse Perplexity JSON response');
    }
    
    return [];
  } catch (error) {
    console.error('Perplexity search error:', error.message);
    throw error;
  }
}

function calculateRelevanceScore(article: any, specialty: string): number {
  const title = (article.title || '').toLowerCase();
  const description = (article.description || '').toLowerCase();
  const content = title + ' ' + description;
  
  let score = 0.5; // Base score
  
  // Specialty-specific keywords
  const specialtyKeywords: Record<string, string[]> = {
    cardiology: ['heart', 'cardiac', 'cardiology', 'cardiovascular', 'coronary', 'arrhythmia', 'hypertension', 'heart failure', 'myocardial', 'ecg', 'ekg'],
    obgyn: ['pregnancy', 'obstetric', 'gynecology', 'gynecological', 'prenatal', 'maternal', 'fetal', 'reproductive', 'ovarian', 'uterine', 'cervical'],
    general: ['medical', 'health', 'medicine', 'clinical', 'patient', 'treatment', 'diagnosis', 'therapy', 'healthcare', 'physician', 'doctor']
  };

  const keywords = specialtyKeywords[specialty] || specialtyKeywords.general;
  const matchedKeywords = keywords.filter(keyword => content.includes(keyword));
  score += matchedKeywords.length * 0.1;

  // Medical publication bonus
  const medicalSources = ['pubmed', 'nejm', 'jama', 'lancet', 'bmj', 'medscape', 'webmd', 'mayoclinic', 'nih', 'cdc'];
  if (medicalSources.some(source => (article.source || '').toLowerCase().includes(source))) {
    score += 0.3;
  }

  return Math.min(score, 1.0);
}

function calculateCredibilityScore(article: any): number {
  const source = (article.source || '').toLowerCase();
  
  // High credibility sources
  if (['pubmed', 'nejm', 'jama', 'lancet', 'bmj', 'nature', 'science', 'nih', 'cdc'].some(s => source.includes(s))) {
    return 0.95;
  }
  
  // Medium-high credibility
  if (['medscape', 'webmd', 'mayoclinic', 'healthline', 'reuters', 'ap', 'bbc'].some(s => source.includes(s))) {
    return 0.8;
  }
  
  // Medium credibility
  if (['cnn', 'nytimes', 'washingtonpost', 'guardian', 'forbes'].some(s => source.includes(s))) {
    return 0.7;
  }
  
  return 0.6; // Default score
}

function categorizeArticle(article: any): NewsArticle['category'] {
  const content = ((article.title || '') + ' ' + (article.description || '')).toLowerCase();
  
  if (content.includes('clinical trial') || content.includes('study') || content.includes('research')) {
    return 'clinical_trials';
  }
  if (content.includes('fda') || content.includes('approval') || content.includes('drug')) {
    return 'drug_approvals';
  }
  if (content.includes('guideline') || content.includes('recommendation')) {
    return 'guidelines';
  }
  if (content.includes('policy') || content.includes('regulation')) {
    return 'policy_updates';
  }
  if (content.includes('breaking') || content.includes('urgent') || content.includes('alert')) {
    return 'breaking_news';
  }
  
  return 'research';
}

async function collectNewsForSpecialty(specialty: string, supabase: any): Promise<any> {
  const queries = {
    cardiology: [
      'cardiology heart disease research 2025',
      'cardiovascular clinical trials 2025',
      'heart failure treatment advances 2025'
    ],
    obgyn: [
      'obstetrics gynecology research 2025', 
      'maternal health clinical trials 2025',
      'reproductive medicine advances 2025'
    ],
    general: [
      'medical research breakthroughs 2025',
      'clinical trials results 2025',
      'healthcare advances 2025'
    ]
  };

  const specialtyQueries = queries[specialty as keyof typeof queries] || queries.general;
  let allArticles: any[] = [];
  let providersUsed: string[] = [];
  let errors: string[] = [];

  for (const query of specialtyQueries) {
    // Try Brave first (most reliable)
    try {
      const braveResults = await searchBrave(query);
      allArticles.push(...braveResults);
      providersUsed.push('brave');
    } catch (error) {
      errors.push(`brave: ${error.message}`);
    }

    // Try Exa
    try {
      const exaResults = await searchExa(query);
      allArticles.push(...exaResults);
      providersUsed.push('exa');
    } catch (error) {
      errors.push(`exa: ${error.message}`);
    }

    // Try Perplexity
    try {
      const perplexityResults = await searchPerplexity(query);
      allArticles.push(...perplexityResults);
      providersUsed.push('perplexity');
    } catch (error) {
      errors.push(`perplexity: ${error.message}`);
    }
  }

  // Process and filter articles
  let processedArticles = 0;
  let duplicatesSkipped = 0;
  let lowQualitySkipped = 0;
  const seenUrls = new Set();

  for (const article of allArticles) {
    // Skip duplicates
    if (seenUrls.has(article.url)) {
      duplicatesSkipped++;
      continue;
    }
    seenUrls.add(article.url);

    // Calculate scores
    const relevanceScore = calculateRelevanceScore(article, specialty);
    const credibilityScore = calculateCredibilityScore(article);

    // Quality filter
    if (relevanceScore < 0.6 || credibilityScore < 0.5) {
      lowQualitySkipped++;
      continue;
    }

    // Create news article object with proper date parsing
    const newsArticle: NewsArticle = {
      title: article.title,
      summary: article.description,
      sourceUrl: article.url,
      sourceName: article.source,
      category: categorizeArticle(article),
      specialty: specialty as NewsArticle['specialty'],
      relevanceScore,
      credibilityScore,
      publishedAt: parsePublishedDate(article.published) // Use our date parsing function
    };

    try {
      // Insert into database
      const { error } = await supabase
        .from('medical_news_articles')
        .insert([{
          title: newsArticle.title,
          summary: newsArticle.summary,
          source_url: newsArticle.sourceUrl,
          source_name: newsArticle.sourceName,
          category: newsArticle.category,
          specialty: newsArticle.specialty,
          relevance_score: newsArticle.relevanceScore,
          credibility_score: newsArticle.credibilityScore,
          published_at: newsArticle.publishedAt,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        throw error;
      }

      processedArticles++;
    } catch (error) {
      errors.push(`Collection failed: Database insert failed: ${error.message}`);
      console.error('Database insert error:', error);
    }
  }

  return {
    specialty,
    articlesCollected: allArticles.length,
    articlesProcessed: processedArticles,
    duplicatesSkipped,
    lowQualitySkipped,
    errors,
    processingTime: 0,
    providersUsed: [...new Set(providersUsed)]
  };
}

serve(async (req) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Simple supabase client
    const supabase = {
      from: (table: string) => ({
        insert: async (data: any[]) => {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey
            },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            const errorText = await response.text();
            return { error: new Error(`Database error: ${response.status} - ${errorText}`) };
          }

          return { error: null };
        }
      })
    };

    const specialties = ['cardiology', 'general', 'obgyn'];
    const results = [];

    for (const specialty of specialties) {
      const startTime = Date.now();
      const result = await collectNewsForSpecialty(specialty, supabase);
      result.processingTime = Date.now() - startTime;
      results.push(result);
    }

    const totalProcessed = results.reduce((sum, r) => sum + r.articlesProcessed, 0);

    return new Response(JSON.stringify({
      message: 'News collection completed',
      results,
      totalArticlesProcessed: totalProcessed,
      configurationsProcessed: specialties.length
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('News collection error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});