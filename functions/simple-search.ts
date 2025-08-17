/**
 * Simple Search Function
 * Basic search functionality without authentication for testing
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { ENV_VARS } from './utils/constants';

interface SearchRequest {
  q: string;
  limit?: number;
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  provider: string;
  relevanceScore: number;
}

async function searchBrave(query: string, limit: number = 10): Promise<SearchResult[]> {
  const apiKey = ENV_VARS.BRAVE_API_KEY;
  
  if (!apiKey) {
    console.warn('Brave API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: `${query} medical research`,
      count: limit.toString(),
      search_lang: 'en',
      country: 'US',
      safesearch: 'moderate'
    });

    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });

    if (!response.ok) {
      console.error(`Brave API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const results = data.web?.results || [];

    return results.map((result: any, index: number) => ({
      id: `brave-${index}`,
      title: result.title || '',
      url: result.url || '',
      snippet: result.description || '',
      source: extractDomain(result.url || ''),
      provider: 'brave',
      relevanceScore: Math.max(0.9 - (index * 0.1), 0.1)
    }));
  } catch (error) {
    console.error('Brave search error:', error);
    return [];
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return createErrorResponse('Method not allowed', 405, headers);
  }

  try {
    const { q, limit = 10 }: SearchRequest = JSON.parse(event.body || '{}');
    
    if (!q || typeof q !== 'string') {
      return createErrorResponse('Search query is required', 400, headers);
    }

    console.log(`Simple search request: "${q}"`);

    // Try Brave search
    const results = await searchBrave(q, Math.min(limit, 20));

    return createSuccessResponse({
      results,
      totalCount: results.length,
      query: q,
      provider: 'brave',
      searchTime: Date.now()
    }, headers);

  } catch (error) {
    console.error('Simple search error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Search failed',
      500,
      headers
    );
  }
};