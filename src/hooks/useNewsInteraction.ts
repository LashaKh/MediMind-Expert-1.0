/**
 * useNewsInteraction Hook
 * Manages medical news data fetching, state management, and user interactions
 */

import { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { useAuth, useSpecialty } from '../stores/useAppStore';
import { safe, safeAsync, ErrorSeverity } from '../lib/utils/errorHandling';
import type { 
  MedicalNewsArticle, 
  NewsFilters, 
  NewsState, 
  NewsAction,
  NewsResponse,
  TrendingResponse 
} from '../types/medicalNews';

// Initial state
const initialNewsState: NewsState = {
  articles: [],
  trendingArticles: [],
  isLoading: false,
  error: null,
  filters: {},
  totalCount: 0,
  currentPage: 0,
  hasMore: true,
  viewMode: 'grid',
  selectedCategory: null,
};

// News reducer
function newsReducer(state: NewsState, action: NewsAction): NewsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: action.payload ? null : state.error };
    
    case 'SET_ARTICLES':
      return {
        ...state,
        articles: action.payload.articles,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        currentPage: 1,
        isLoading: false,
        error: null,
      };
    
    case 'APPEND_ARTICLES':
      return {
        ...state,
        articles: [...state.articles, ...action.payload.articles],
        hasMore: action.payload.hasMore,
        currentPage: state.currentPage + 1,
        isLoading: false,
      };
    
    case 'SET_TRENDING':
      return { ...state, trendingArticles: action.payload, isLoading: false };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    
    case 'RESET_NEWS':
      return { ...initialNewsState, filters: state.filters };
    
    default:
      return state;
  }
}

interface UseNewsInteractionOptions {
  autoLoad?: boolean;
  initialFilters?: NewsFilters;
  pageSize?: number;
}

export function useNewsInteraction(options: UseNewsInteractionOptions = {}) {
  const { autoLoad = true, initialFilters = {}, pageSize = 12 } = options;
  const { user, session } = useAuth();
  const { specialty } = useSpecialty();
  
  // Use ref to track if initial load has been triggered
  const hasInitiallyLoadedRef = useRef(false);
  
  const [state, dispatch] = useReducer(newsReducer, {
    ...initialNewsState,
    filters: { 
      ...initialFilters, 
      specialty: specialty?.toLowerCase() || 'cardiology' 
    }
  });
  
  // Hook initialized - removed console.log to prevent infinite loops

  // User interaction tracking sets
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  // Load news articles
  const loadNews = useCallback(async (filters: NewsFilters, append = false) => {
    if (!user?.id) {
      console.log('🔐 [loadNews] No user, skipping news load');
      return;
    }

    console.log('🔄 [loadNews] Starting news load', { filters, append, specialty });

    dispatch({ type: 'SET_LOADING', payload: true });

    const queryParams = new URLSearchParams({
      limit: pageSize.toString(),
      offset: append ? (state.articles.length).toString() : '0',
      specialty: filters.specialty || specialty?.toLowerCase() || 'cardiology',
      ...(filters.category?.length && { category: filters.category.join(',') }),
      ...(filters.evidenceLevel?.length && { evidenceLevel: filters.evidenceLevel.join(',') }),
      ...(filters.contentType?.length && { contentType: filters.contentType.join(',') }),
      ...(filters.recency && { recency: filters.recency }),
      ...(filters.search && { search: filters.search }),
      ...(filters.minCredibilityScore && { minCredibilityScore: filters.minCredibilityScore.toString() }),
      ...(filters.minRelevanceScore && { minRelevanceScore: filters.minRelevanceScore.toString() }),
      sortBy: filters.sortBy || 'engagement',
      sortOrder: filters.sortOrder || 'desc'
    });

    console.log('🌐 [loadNews] API URL:', `/.netlify/functions/medical-news?${queryParams}`);

    const [response, error] = await safeAsync(async () => {
      const res = await fetch(`/.netlify/functions/medical-news?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 [loadNews] API Response Status:', res.status, res.statusText);

      if (!res.ok) {
        throw new Error(`Failed to fetch news: ${res.status} ${res.statusText}`);
      }

      const jsonResponse = await res.json();
      console.log('📊 [loadNews] Raw API Response:', jsonResponse);
      
      // Handle wrapped response structure
      const actualData = jsonResponse.data || jsonResponse;
      console.log('📋 [loadNews] Processed Data:', actualData);
      
      return actualData as NewsResponse;
    }, {
      context: 'fetching medical news articles',
      severity: ErrorSeverity.MEDIUM,
      showToast: true,
    });

    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.userMessage || 'Failed to load news' });
    } else {
      const hasMore = response.articles.length === pageSize && 
                     (response.totalCount > (append ? state.articles.length + response.articles.length : response.articles.length));

      if (append) {
        dispatch({ 
          type: 'APPEND_ARTICLES', 
          payload: { articles: response.articles, hasMore } 
        });
      } else {
        dispatch({ 
          type: 'SET_ARTICLES', 
          payload: { 
            articles: response.articles, 
            totalCount: response.totalCount, 
            hasMore 
          } 
        });
      }
    }
  }, [user?.id, specialty, pageSize, session?.access_token]);

  // Load trending articles
  const loadTrending = useCallback(async (timeframe = '24h') => {
    if (!user) return;

    const [response, error] = await safeAsync(async () => {
      const res = await fetch(`/.netlify/functions/medical-news/trending?specialty=${specialty?.toLowerCase() || 'cardiology'}&timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch trending news: ${res.status} ${res.statusText}`);
      }

      const jsonResponse = await res.json();
      // Handle wrapped response structure
      const actualData = jsonResponse.data || jsonResponse;
      return actualData as TrendingResponse;
    }, {
      context: 'fetching trending medical news',
      severity: ErrorSeverity.LOW,
      showToast: false,
    });

    if (!error) {
      dispatch({ type: 'SET_TRENDING', payload: response.trending });
    }
  }, [user?.id, specialty, session?.access_token]);

  // Track user interaction
  const trackInteraction = useCallback(async (
    article: MedicalNewsArticle, 
    interactionType: 'click' | 'read_time' | 'share' | 'bookmark' | 'like' | 'save_later',
    value?: number,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;

    await safeAsync(async () => {
      await fetch('/.netlify/functions/news-interaction', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsId: article.id,
          interactionType,
          interactionValue: value,
          interactionMetadata: metadata,
        }),
      });
    }, {
      context: 'tracking news interaction',
      severity: ErrorSeverity.LOW,
      showToast: false,
    });
  }, [user?.id, session?.access_token]);

  // Handle article interactions
  const handleArticleInteraction = useCallback((
    article: MedicalNewsArticle, 
    type: 'click' | 'view' | 'share' | 'bookmark' | 'like'
  ) => {
    switch (type) {
      case 'click':
      case 'view':
        trackInteraction(article, 'click');
        break;
      
      case 'share':
        trackInteraction(article, 'share');
        break;
      
      case 'bookmark': {
        const isBookmarked = bookmarkedArticles.has(article.id);
        if (isBookmarked) {
          setBookmarkedArticles(prev => {
            const updated = new Set(prev);
            updated.delete(article.id);
            return updated;
          });
        } else {
          setBookmarkedArticles(prev => new Set(prev).add(article.id));
          trackInteraction(article, 'bookmark');
        }
        break;
      }
      
      case 'like': {
        const isLiked = likedArticles.has(article.id);
        if (isLiked) {
          setLikedArticles(prev => {
            const updated = new Set(prev);
            updated.delete(article.id);
            return updated;
          });
        } else {
          setLikedArticles(prev => new Set(prev).add(article.id));
          trackInteraction(article, 'like');
        }
        break;
      }
    }
  }, [trackInteraction, bookmarkedArticles, likedArticles]);

  // Load more articles (pagination)
  const loadMore = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState.hasMore && !currentState.isLoading) {
      loadNews(currentState.filters, true);
    }
  }, [loadNews]);

  // Refresh news
  const refresh = useCallback(() => {
    const currentState = stateRef.current;
    loadNews(currentState.filters, false);
  }, [loadNews]);

  // Update filters
  const updateFilters = useCallback((newFilters: NewsFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
    loadNews(newFilters, false);
  }, [loadNews]);

  // Set view mode
  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  // Create stable refs for state access
  const stateRef = useRef(state);
  const loadNewsRef = useRef(loadNews);
  const loadTrendingRef = useRef(loadTrending);
  
  // Update refs without causing re-renders
  stateRef.current = state;
  loadNewsRef.current = loadNews;
  loadTrendingRef.current = loadTrending;

  // Load saved preferences from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedPreferences = localStorage.getItem(`medisearch-news-preferences-${user.id}`);
      if (savedPreferences) {
        const [preferences, error] = safe(() => {
          return JSON.parse(savedPreferences);
        }, {
          context: 'loading news filter preferences from localStorage',
          severity: ErrorSeverity.LOW,
          showToast: false
        });

        if (!error && preferences) {
          dispatch({ type: 'SET_FILTERS', payload: { ...preferences, specialty: specialty?.toLowerCase() } });
        }
      }
    }
  }, [user?.id, specialty]);

  // Save preferences to localStorage when filters change
  useEffect(() => {
    if (user?.id && state.filters && Object.keys(state.filters).length > 0) {
      const preferencesToSave = { ...state.filters };
      delete preferencesToSave.search; // Don't save search queries
      localStorage.setItem(
        `medisearch-news-preferences-${user.id}`, 
        JSON.stringify(preferencesToSave)
      );
    }
  }, [user?.id, state.filters]);

  // Auto-load on mount and specialty change
  useEffect(() => {
    // Auto-load effect triggered - removed console.log to prevent infinite loops
    
    if (autoLoad && user?.id && specialty && session?.access_token && !hasInitiallyLoadedRef.current) {
      const filters = { 
        ...state.filters, 
        specialty: specialty.toLowerCase() 
      };
      // Setting filters and loading news
      dispatch({ type: 'SET_FILTERS', payload: filters });
      loadNewsRef.current?.(filters, false);
      loadTrendingRef.current?.();
      hasInitiallyLoadedRef.current = true;
    }
    // Auto-load conditions checked
  }, [autoLoad, user?.id, specialty, session?.access_token]); // Remove function dependencies to prevent infinite loops

  return {
    // State
    ...state,
    bookmarkedArticles,
    likedArticles,
    
    // Actions
    loadNews: (filters: NewsFilters) => loadNews(filters, false),
    loadMore,
    loadTrending,
    refresh,
    updateFilters,
    setViewMode,
    handleArticleInteraction,
    trackInteraction,
    
    // Dispatch for advanced usage
    dispatch,
  };
}

export default useNewsInteraction;