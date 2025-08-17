/**
 * Custom hook for managing liked search results
 * Provides state management and API integration for user's liked results
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { likedResultsAPI, type LikedResult, type LikedResultsFilters } from '../lib/api/likedResults';
import type { SearchResult } from '../utils/search/apiOrchestration';
import { useAuth } from '../stores/useAppStore';
import { safe, safeAsync, ErrorSeverity } from '../lib/utils/errorHandling';

interface UseLikedResultsState {
  likedResults: LikedResult[];
  likedResultIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  stats: {
    totalCount: number;
    byProvider: Record<string, number>;
    byContentType: Record<string, number>;
    byEvidenceLevel: Record<string, number>;
  };
}

interface UseLikedResultsActions {
  refreshLikedResults: (filters?: LikedResultsFilters) => Promise<void>;
  likeResult: (result: SearchResult, originalQuery: string, searchFilters?: any) => Promise<boolean>;
  unlikeResult: (resultId: string, provider: string) => Promise<boolean>;
  updateLikedResult: (resultId: string, provider: string, updates: { notes?: string; tags?: string[] }) => Promise<boolean>;
  isResultLiked: (resultId: string, provider: string) => boolean;
  loadMore: () => Promise<void>;
  searchLikedResults: (query: string) => Promise<void>;
  filterLikedResults: (filters: LikedResultsFilters) => Promise<void>;
  clearFilters: () => Promise<void>;
}

interface UseLikedResultsOptions {
  autoLoad?: boolean;
  initialFilters?: LikedResultsFilters;
  pageSize?: number;
}

export function useLikedResults(options: UseLikedResultsOptions = {}): [UseLikedResultsState, UseLikedResultsActions] {
  const { autoLoad = true, initialFilters = {}, pageSize = 50 } = options;
  const { user } = useAuth();
  
  // Debug authentication state
  useEffect(() => {
    console.log('🔐 [useLikedResults] Auth State:', {
      hasUser: !!user,
      userId: user?.id,
      autoLoad,
      timestamp: new Date().toISOString()
    });
  }, [user, autoLoad]);
  
  const [state, setState] = useState<UseLikedResultsState>({
    likedResults: [],
    likedResultIds: new Set(),
    isLoading: false,
    error: null,
    pagination: {
      limit: pageSize,
      offset: 0,
      total: 0,
      hasMore: false
    },
    stats: {
      totalCount: 0,
      byProvider: {},
      byContentType: {},
      byEvidenceLevel: {}
    }
  });

  const [currentFilters, setCurrentFilters] = useState<LikedResultsFilters>(initialFilters);

  // Memoized set of liked result IDs for fast lookup
  const likedResultIds = useMemo(() => {
    if (!state.likedResults || !Array.isArray(state.likedResults)) {
      return new Set<string>();
    }
    return new Set(state.likedResults.map(result => `${result.result_id}-${result.provider}`));
  }, [state.likedResults]);

  // Update the likedResultIds in state when it changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      likedResultIds
    }));
  }, [likedResultIds]);

  /**
   * Refresh liked results from the API
   */
  const refreshLikedResults = useCallback(async (filters: LikedResultsFilters = {}) => {
    if (!user) return;

    console.log('🔄 [refreshLikedResults] Starting refresh with filters:', filters);
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const [response, error] = await safeAsync(async () => {
      return await likedResultsAPI.getLikedResults({
        ...currentFilters,
        ...filters,
        limit: pageSize,
        offset: 0
      });
    }, {
      context: 'refreshing liked results',
      severity: ErrorSeverity.LOW,
      showToast: true
    });

    if (error) {
      console.error('❌ [refreshLikedResults] Error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.userMessage || 'Failed to load liked results'
      }));
      return;
    }

    console.log('📊 [refreshLikedResults] API Response:', {
      hasResponse: !!response,
      results: response?.results?.length || 0,
      pagination: response?.pagination,
      totalCount: response?.pagination?.total
    });

    // The API response has a nested structure: { success: true, data: { results: [], pagination: {} } }
    const actualData = response?.data || response;
    const results = actualData?.results || [];
    const pagination = actualData?.pagination || { limit: pageSize, offset: 0, total: 0, hasMore: false };

    console.log('📊 [refreshLikedResults] Processed data:', {
      results: results.length,
      pagination,
    });

    setState(prev => ({
     ...prev,
      likedResults: results,
      pagination: pagination,
      stats: {
        ...prev.stats,
        totalCount: pagination.total || 0
      },
      isLoading: false,
      error: null
    }));

    // Update current filters
    setCurrentFilters({ ...currentFilters, ...filters });
  }, [user, currentFilters, pageSize]);

  /**
   * Load statistics about liked results
   */
  const loadStats = useCallback(async () => {
    if (!user) return;

    const [stats] = await safeAsync(async () => {
      return await likedResultsAPI.getLikedResultsStats();
    }, {
      context: 'loading liked results statistics',
      severity: ErrorSeverity.LOW,
      showToast: false
    });

    if (stats) {
      setState(prev => ({ ...prev, stats }));
    }
  }, [user]);

  /**
   * Like a search result
   */
  const likeResult = useCallback(async (result: SearchResult, originalQuery: string, searchFilters?: any): Promise<boolean> => {
    if (!user) {
      console.warn('💖 [likeResult] No user authenticated');
      return false;
    }

    console.log('💖 [likeResult] Attempting to like result:', {
      resultId: result.id,
      provider: result.provider,
      title: result.title.substring(0, 50) + '...',
      hasUser: !!user,
      userId: user.id
    });

    const [response, error] = await safeAsync(async () => {
      return await likedResultsAPI.likeResult(result, originalQuery, searchFilters);
    }, {
      context: 'liking search result',
      severity: ErrorSeverity.MEDIUM,
      showToast: true
    });

    if (error) {
      console.error('❌ [likeResult] Error liking result:', error);
      return false;
    }

    console.log('✅ [likeResult] Response received:', {
      alreadyLiked: response.alreadyLiked,
      hasLikedResult: !!response.likedResult
    });

    // If result was already liked, no need to update state
    if (response.alreadyLiked) {
      return true;
    }

    // Add to local state immediately for better UX
    if (response.likedResult) {
      setState(prev => {
        console.log('📊 [likeResult] Updating state - before:', {
          totalCount: prev.stats.totalCount,
          resultsLength: prev.likedResults.length
        });
        
        const newState = {
          ...prev,
          likedResults: [response.likedResult!, ...prev.likedResults],
          stats: {
            ...prev.stats,
            totalCount: prev.stats.totalCount + 1
          }
        };
        
        console.log('📊 [likeResult] Updating state - after:', {
          totalCount: newState.stats.totalCount,
          resultsLength: newState.likedResults.length
        });
        
        return newState;
      });
    }

    return true;
  }, [user]);

  /**
   * Unlike a search result
   */
  const unlikeResult = useCallback(async (resultId: string, provider: string): Promise<boolean> => {
    if (!user) {
      console.warn('💔 [unlikeResult] No user authenticated');
      return false;
    }

    console.log('💔 [unlikeResult] Attempting to unlike result:', {
      resultId,
      provider,
      hasUser: !!user,
      userId: user.id
    });

    const [, error] = await safeAsync(async () => {
      return await likedResultsAPI.unlikeResult(resultId, provider);
    }, {
      context: 'unliking search result',
      severity: ErrorSeverity.MEDIUM,
      showToast: true
    });

    if (error) {
      console.error('❌ [unlikeResult] Error unliking result:', error);
      return false;
    }

    console.log('✅ [unlikeResult] Successfully unliked result');

    // Remove from local state immediately for better UX
    setState(prev => {
      console.log('📊 [unlikeResult] Updating state - before:', {
        totalCount: prev.stats.totalCount,
        resultsLength: prev.likedResults.length
      });
      
      const newState = {
        ...prev,
        likedResults: prev.likedResults.filter(
          r => !(r.result_id === resultId && r.provider === provider)
        ),
        stats: {
          ...prev.stats,
          totalCount: Math.max(0, prev.stats.totalCount - 1)
        }
      };
      
      console.log('📊 [unlikeResult] Updating state - after:', {
        totalCount: newState.stats.totalCount,
        resultsLength: newState.likedResults.length
      });
      
      return newState;
    });

    return true;
  }, [user]);

  /**
   * Update a liked result's notes or tags
   */
  const updateLikedResult = useCallback(async (
    resultId: string, 
    provider: string, 
    updates: { notes?: string; tags?: string[] }
  ): Promise<boolean> => {
    if (!user) return false;

    const [response, error] = await safeAsync(async () => {
      return await likedResultsAPI.updateLikedResult(resultId, provider, updates);
    }, {
      context: 'updating liked result',
      severity: ErrorSeverity.MEDIUM,
      showToast: true
    });

    if (error) {
      return false;
    }

    // Update local state
    setState(prev => ({
      ...prev,
      likedResults: prev.likedResults.map(result =>
        result.result_id === resultId && result.provider === provider
          ? { ...result, ...updates }
          : result
      )
    }));

    return true;
  }, [user]);

  /**
   * Check if a result is liked
   */
  const isResultLiked = useCallback((resultId: string, provider: string): boolean => {
    return likedResultIds.has(`${resultId}-${provider}`);
  }, [likedResultIds]);

  /**
   * Load more results (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!user || !state.pagination.hasMore || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true }));

    const [response, error] = await safeAsync(async () => {
      return await likedResultsAPI.getLikedResults({
        ...currentFilters,
        limit: pageSize,
        offset: state.pagination.offset + state.pagination.limit
      });
    }, {
      context: 'loading more liked results',
      severity: ErrorSeverity.LOW,
      showToast: false
    });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setState(prev => ({
      ...prev,
      likedResults: [...prev.likedResults, ...(response?.results || [])],
      pagination: response?.pagination || prev.pagination,
      isLoading: false
    }));
  }, [user, state.pagination, state.isLoading, currentFilters, pageSize]);

  /**
   * Search in liked results
   */
  const searchLikedResults = useCallback(async (query: string) => {
    await refreshLikedResults({ search: query });
  }, [refreshLikedResults]);

  /**
   * Apply filters to liked results
   */
  const filterLikedResults = useCallback(async (filters: LikedResultsFilters) => {
    await refreshLikedResults(filters);
  }, [refreshLikedResults]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(async () => {
    setCurrentFilters({});
    await refreshLikedResults({});
  }, [refreshLikedResults]);

  // Auto-load liked results when user changes or component mounts
  useEffect(() => {
    if (autoLoad && user) {
      refreshLikedResults();
    }
  }, [user, autoLoad]); // Removed refreshLikedResults from dependencies to prevent loop

  // Load stats when user changes (separate effect to prevent loops)
  useEffect(() => {
    if (user && state.likedResults.length > 0) {
      loadStats();
    }
  }, [user, state.likedResults.length]); // Only reload stats when user changes or results count changes

  const actions: UseLikedResultsActions = {
    refreshLikedResults,
    likeResult,
    unlikeResult,
    updateLikedResult,
    isResultLiked,
    loadMore,
    searchLikedResults,
    filterLikedResults,
    clearFilters
  };

  return [state, actions];
}

export default useLikedResults;