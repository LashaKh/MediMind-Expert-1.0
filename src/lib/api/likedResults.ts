/**
 * Liked Results API Service
 * Frontend service for managing user's liked search results
 */

import { supabase } from '../supabase';
import type { SearchResult } from '../../utils/search/apiOrchestration';

export interface LikedResult {
  id?: string;
  result_id: string;
  provider: string;
  title: string;
  url: string;
  snippet?: string;
  source?: string;
  content_type?: string;
  evidence_level?: string;
  relevance_score?: number;
  published_date?: string;
  notes?: string;
  tags?: string[];
  original_query: string;
  search_filters?: any;
  created_at?: string;
  updated_at?: string;
}

export interface LikedResultsResponse {
  results: LikedResult[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface LikedResultsFilters {
  provider?: string;
  content_type?: string;
  evidence_level?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

class LikedResultsAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {

      throw new Error('Authentication required');
    }

    const response = await fetch(`/.netlify/functions/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response debug:', {
      dataKeys: data ? Object.keys(data) : [],
      dataDataKeys: data?.data ? Object.keys(data.data) : []
    });
    return data;
  }

  /**
   * Get user's liked results with optional filtering
   */
  async getLikedResults(filters: LikedResultsFilters = {}): Promise<LikedResultsResponse> {
    const params = new URLSearchParams();
    
    if (filters.provider) params.append('provider', filters.provider);
    if (filters.content_type) params.append('content_type', filters.content_type);
    if (filters.evidence_level) params.append('evidence_level', filters.evidence_level);
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `liked-results${queryString ? `?${queryString}` : ''}`;
    
    return await this.makeRequest(endpoint, {
      method: 'GET'
    });
  }

  /**
   * Like a search result (save it to user's liked results)
   */
  async likeResult(result: SearchResult, originalQuery: string, searchFilters?: any): Promise<{ message: string; likedResult?: LikedResult; alreadyLiked?: boolean }> {
    const likedResult: Omit<LikedResult, 'id' | 'created_at' | 'updated_at'> = {
      result_id: result.id,
      provider: result.provider,
      title: result.title,
      url: result.url,
      snippet: result.snippet,
      source: result.source,
      content_type: result.contentType,
      evidence_level: result.evidenceLevel,
      relevance_score: result.relevanceScore,
      published_date: result.publishedDate,
      original_query: originalQuery,
      search_filters: searchFilters,
      notes: '',
      tags: []
    };

    const response = await this.makeRequest('liked-results', {
      method: 'POST',
      body: JSON.stringify(likedResult)
    });

    return response;
  }

  /**
   * Unlike a search result (remove it from user's liked results)
   */
  async unlikeResult(resultId: string, provider: string): Promise<{ message: string }> {
    const params = new URLSearchParams({
      result_id: resultId,
      provider: provider
    });

    return await this.makeRequest(`liked-results?${params.toString()}`, {
      method: 'DELETE'
    });
  }

  /**
   * Update a liked result's notes or tags
   */
  async updateLikedResult(resultId: string, provider: string, updates: { notes?: string; tags?: string[] }): Promise<{ message: string; likedResult: LikedResult }> {
    return await this.makeRequest('liked-results', {
      method: 'PUT',
      body: JSON.stringify({
        result_id: resultId,
        provider: provider,
        ...updates
      })
    });
  }

  /**
   * Check if a result is liked by the user
   */
  async isResultLiked(resultId: string, provider: string): Promise<boolean> {
    try {
      const response = await this.getLikedResults({
        limit: 1,
        offset: 0
      });
      
      return response.results.some(r => r.result_id === resultId && r.provider === provider);
    } catch (error) {

      return false;
    }
  }

  /**
   * Get liked results by specific provider
   */
  async getLikedResultsByProvider(provider: string, limit = 50): Promise<LikedResult[]> {
    const response = await this.getLikedResults({ provider, limit });
    return response.results;
  }

  /**
   * Get liked results by content type
   */
  async getLikedResultsByContentType(contentType: string, limit = 50): Promise<LikedResult[]> {
    const response = await this.getLikedResults({ content_type: contentType, limit });
    return response.results;
  }

  /**
   * Search in liked results
   */
  async searchLikedResults(searchQuery: string, limit = 50): Promise<LikedResult[]> {
    const response = await this.getLikedResults({ search: searchQuery, limit });
    return response.results;
  }

  /**
   * Get liked results with specific tags
   */
  async getLikedResultsByTags(tags: string[], limit = 50): Promise<LikedResult[]> {
    const response = await this.getLikedResults({ tags, limit });
    return response.results;
  }

  /**
   * Get aggregated statistics about liked results
   */
  async getLikedResultsStats(): Promise<{
    totalCount: number;
    byProvider: Record<string, number>;
    byContentType: Record<string, number>;
    byEvidenceLevel: Record<string, number>;
  }> {
    try {
      const response = await this.getLikedResults({ limit: 100 }); // Reduced limit to avoid 500 errors
      
      // Handle nested response structure: { success: true, data: { results: [], pagination: {} } }
      const actualData = response?.data || response;
      const results = actualData?.results || [];
      const pagination = actualData?.pagination || { total: 0 };

      const stats = {
        totalCount: pagination.total || results.length,
        byProvider: {} as Record<string, number>,
        byContentType: {} as Record<string, number>,
        byEvidenceLevel: {} as Record<string, number>
      };

      results.forEach(result => {
        // Count by provider
        stats.byProvider[result.provider] = (stats.byProvider[result.provider] || 0) + 1;
        
        // Count by content type
        if (result.content_type) {
          stats.byContentType[result.content_type] = (stats.byContentType[result.content_type] || 0) + 1;
        }
        
        // Count by evidence level
        if (result.evidence_level) {
          stats.byEvidenceLevel[result.evidence_level] = (stats.byEvidenceLevel[result.evidence_level] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {

      return {
        totalCount: 0,
        byProvider: {},
        byContentType: {},
        byEvidenceLevel: {}
      };
    }
  }
}

// Export singleton instance
export const likedResultsAPI = new LikedResultsAPI();
export default likedResultsAPI;