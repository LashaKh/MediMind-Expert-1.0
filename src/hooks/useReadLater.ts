/**
 * useReadLater Hook - Comprehensive state management for read later functionality
 * Handles articles, collections, reading sessions, offline sync, and user interactions
 */

import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { safeAsync } from '../utils/errorHandling';
import { logError } from '../lib/logger';
import {
  ReadLaterState,
  ReadLaterAction,
  ReadLaterFilters,
  ReadLaterArticleWithNews,
  CollectionStatistics,
  CollectionFormData,
  BulkActionRequest,
  DeviceType,
  ReadingStatus,
  TextHighlight,
  UseReadLaterReturn,
  AddToReadLaterRequest,
  UpdateProgressRequest
} from '../types/readLater';

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: ReadLaterState = {
  articles: [],
  collections: [],
  currentCollection: 'default',
  filters: {
    sort: 'created_at',
    order: 'desc',
    limit: 20,
    offset: 0
  },
  loading: false,
  error: null,
  pagination: {
    limit: 20,
    offset: 0,
    total: 0,
    hasMore: false
  },
  selectedArticles: [],
  viewMode: 'grid',
  sortBy: 'created_at',
  sortOrder: 'desc'
};

// =====================================================
// REDUCER
// =====================================================

function readLaterReducer(state: ReadLaterState, action: ReadLaterAction): ReadLaterState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_ARTICLES':
      return { 
        ...state, 
        articles: action.payload, 
        loading: false, 
        error: null 
      };

    case 'ADD_ARTICLE':
      return {
        ...state,
        articles: [action.payload, ...state.articles],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      };

    case 'UPDATE_ARTICLE':
      return {
        ...state,
        articles: state.articles.map(article =>
          article.id === action.payload.id
            ? { ...article, ...action.payload.updates }
            : article
        )
      };

    case 'REMOVE_ARTICLE':
      return {
        ...state,
        articles: state.articles.filter(article => article.id !== action.payload),
        selectedArticles: state.selectedArticles.filter(id => id !== action.payload),
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1)
        }
      };

    case 'SET_COLLECTIONS':
      return { 
        ...state, 
        collections: action.payload, 
        loading: false, 
        error: null 
      };

    case 'ADD_COLLECTION':
      return {
        ...state,
        collections: [...state.collections, action.payload].sort((a, b) => a.sort_order - b.sort_order)
      };

    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(collection =>
          collection.id === action.payload.id
            ? { ...collection, ...action.payload.updates }
            : collection
        )
      };

    case 'REMOVE_COLLECTION':
      return {
        ...state,
        collections: state.collections.filter(collection => collection.id !== action.payload),
        currentCollection: state.currentCollection === action.payload.name ? 'default' : state.currentCollection
      };

    case 'SET_CURRENT_COLLECTION':
      return { 
        ...state, 
        currentCollection: action.payload,
        selectedArticles: [], // Clear selection when changing collections
        pagination: { ...initialState.pagination } // Reset pagination
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...initialState.pagination } // Reset pagination when filters change
      };

    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };

    case 'SET_SELECTED_ARTICLES':
      return { ...state, selectedArticles: action.payload };

    case 'TOGGLE_ARTICLE_SELECTION':
      const isSelected = state.selectedArticles.includes(action.payload);
      return {
        ...state,
        selectedArticles: isSelected
          ? state.selectedArticles.filter(id => id !== action.payload)
          : [...state.selectedArticles, action.payload]
      };

    case 'CLEAR_SELECTION':
      return { ...state, selectedArticles: [] };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
        filters: {
          ...state.filters,
          sort: action.payload.sortBy,
          order: action.payload.sortOrder
        }
      };

    default:
      return state;
  }
}

// =====================================================
// API FUNCTIONS
// =====================================================

const API_BASE = '/.netlify/functions';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('sb-access-token');
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// =====================================================
// MAIN HOOK
// =====================================================

export function useReadLater(): UseReadLaterReturn {
  const [state, dispatch] = useReducer(readLaterReducer, initialState);
  const { user } = useAuth();
  const currentSessionRef = useRef<string | null>(null);

  // Load user preferences from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('readLater:viewMode') as 'grid' | 'list';
    const savedSortBy = localStorage.getItem('readLater:sortBy') as ReadLaterState['sortBy'];
    const savedSortOrder = localStorage.getItem('readLater:sortOrder') as ReadLaterState['sortOrder'];

    if (savedViewMode) {
      dispatch({ type: 'SET_VIEW_MODE', payload: savedViewMode });
    }
    if (savedSortBy && savedSortOrder) {
      dispatch({ type: 'SET_SORT', payload: { sortBy: savedSortBy, sortOrder: savedSortOrder } });
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('readLater:viewMode', state.viewMode);
    localStorage.setItem('readLater:sortBy', state.sortBy);
    localStorage.setItem('readLater:sortOrder', state.sortOrder);
  }, [state.viewMode, state.sortBy, state.sortOrder]);

  // =====================================================
  // ARTICLE MANAGEMENT
  // =====================================================

  const loadArticles = useCallback(async (filters?: ReadLaterFilters) => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    const [result, error] = await safeAsync(async () => {
      const searchParams = new URLSearchParams();
      const currentFilters = { ...state.filters, ...filters };

      // Apply current collection filter
      if (state.currentCollection !== 'all') {
        searchParams.set('collection', state.currentCollection);
      }

      // Apply other filters
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });

      return apiCall(`/read-later-api/articles?${searchParams.toString()}`);
    });

    if (error) {
      logError('Failed to load read later articles', error, { userId: user.id, filters });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load articles' });
      return;
    }

    dispatch({ type: 'SET_ARTICLES', payload: result.articles });
    dispatch({ type: 'SET_PAGINATION', payload: result.pagination });

    if (filters) {
      dispatch({ type: 'SET_FILTERS', payload: filters });
    }
  }, [user, state.filters, state.currentCollection]);

  const addToReadLater = useCallback(async (
    newsId: string, 
    collectionName = 'default', 
    priority = 0
  ): Promise<boolean> => {
    if (!user) return false;

    const [result, error] = await safeAsync(async () => {
      const requestData: AddToReadLaterRequest = {
        news_id: newsId,
        collection_name: collectionName,
        priority
      };

      return apiCall('/read-later-api/add', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
    });

    if (error) {
      logError('Failed to add article to read later', error, { userId: user.id, newsId });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add article' });
      return false;
    }

    // Reload articles to get the updated list
    await loadArticles();
    return true;
  }, [user, loadArticles]);

  const removeFromReadLater = useCallback(async (articleId: string): Promise<boolean> => {
    if (!user) return false;

    const [, error] = await safeAsync(async () => {
      return apiCall('/read-later-api/remove', {
        method: 'POST',
        body: JSON.stringify({ article_id: articleId })
      });
    });

    if (error) {
      logError('Failed to remove article from read later', error, { userId: user.id, articleId });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove article' });
      return false;
    }

    dispatch({ type: 'REMOVE_ARTICLE', payload: articleId });
    return true;
  }, [user]);

  const updateProgress = useCallback(async (
    articleId: string, 
    progress: number, 
    status?: ReadingStatus
  ): Promise<boolean> => {
    if (!user) return false;

    const [, error] = await safeAsync(async () => {
      const requestData: UpdateProgressRequest = {
        article_id: articleId,
        progress,
        status
      };

      return apiCall('/read-later-api/update-progress', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
    });

    if (error) {
      logError('Failed to update reading progress', error, { userId: user.id, articleId, progress });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update progress' });
      return false;
    }

    // Update local state optimistically
    dispatch({
      type: 'UPDATE_ARTICLE',
      payload: {
        id: articleId,
        updates: {
          reading_progress: progress,
          reading_status: status || (progress >= 1.0 ? 'completed' : 'reading'),
          last_accessed_at: new Date().toISOString()
        }
      }
    });

    return true;
  }, [user]);

  const updateNotes = useCallback(async (articleId: string, notes: string): Promise<boolean> => {
    if (!user) return false;

    const [, error] = await safeAsync(async () => {
      return apiCall('/read-later-api/update-progress', {
        method: 'POST',
        body: JSON.stringify({
          article_id: articleId,
          progress: state.articles.find(a => a.id === articleId)?.reading_progress || 0,
          notes
        })
      });
    });

    if (error) {
      logError('Failed to update article notes', error, { userId: user.id, articleId });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update notes' });
      return false;
    }

    dispatch({
      type: 'UPDATE_ARTICLE',
      payload: {
        id: articleId,
        updates: { personal_notes: notes }
      }
    });

    return true;
  }, [user, state.articles]);

  const addHighlight = useCallback(async (articleId: string, highlight: TextHighlight): Promise<boolean> => {
    if (!user) return false;

    const article = state.articles.find(a => a.id === articleId);
    if (!article) return false;

    const updatedHighlights = [...article.highlights, highlight];

    const [, error] = await safeAsync(async () => {
      return apiCall('/read-later-api/update-progress', {
        method: 'POST',
        body: JSON.stringify({
          article_id: articleId,
          progress: article.reading_progress,
          highlights: updatedHighlights
        })
      });
    });

    if (error) {
      logError('Failed to add highlight', error, { userId: user.id, articleId });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add highlight' });
      return false;
    }

    dispatch({
      type: 'UPDATE_ARTICLE',
      payload: {
        id: articleId,
        updates: { highlights: updatedHighlights }
      }
    });

    return true;
  }, [user, state.articles]);

  // =====================================================
  // COLLECTION MANAGEMENT
  // =====================================================

  const loadCollections = useCallback(async (): Promise<void> => {
    if (!user) return;

    const [result, error] = await safeAsync(async () => {
      return apiCall('/read-later-api/collections?include_stats=true');
    });

    if (error) {
      logError('Failed to load collections', error, { userId: user.id });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load collections' });
      return;
    }

    dispatch({ type: 'SET_COLLECTIONS', payload: result.collections });
  }, [user]);

  const createCollection = useCallback(async (data: CollectionFormData): Promise<boolean> => {
    if (!user) return false;

    const [result, error] = await safeAsync(async () => {
      return apiCall('/read-later-api/collections', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    });

    if (error) {
      logError('Failed to create collection', error, { userId: user.id, data });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create collection' });
      return false;
    }

    dispatch({ type: 'ADD_COLLECTION', payload: result.collection });
    return true;
  }, [user]);

  const updateCollection = useCallback(async (id: string, data: Partial<CollectionFormData>): Promise<boolean> => {
    if (!user) return false;

    const [result, error] = await safeAsync(async () => {
      return apiCall('/read-later-api/collections', {
        method: 'PUT',
        body: JSON.stringify({ id, ...data })
      });
    });

    if (error) {
      logError('Failed to update collection', error, { userId: user.id, id, data });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update collection' });
      return false;
    }

    dispatch({
      type: 'UPDATE_COLLECTION',
      payload: { id, updates: data }
    });

    return true;
  }, [user]);

  const deleteCollection = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    const [, error] = await safeAsync(async () => {
      return apiCall(`/read-later-api/collections?id=${id}`, {
        method: 'DELETE'
      });
    });

    if (error) {
      logError('Failed to delete collection', error, { userId: user.id, id });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete collection' });
      return false;
    }

    dispatch({ type: 'REMOVE_COLLECTION', payload: id });
    return true;
  }, [user]);

  // =====================================================
  // BULK OPERATIONS
  // =====================================================

  const bulkAction = useCallback(async (
    action: BulkActionRequest['action'],
    articleIds: string[],
    options?: any
  ): Promise<boolean> => {
    if (!user || !articleIds.length) return false;

    const [, error] = await safeAsync(async () => {
      const requestData: BulkActionRequest = {
        action,
        article_ids: articleIds,
        ...options
      };

      return apiCall('/read-later-api/bulk-actions', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
    });

    if (error) {
      logError('Failed to perform bulk action', error, { userId: user.id, action, articleIds });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to perform bulk action' });
      return false;
    }

    // Handle different actions optimistically
    switch (action) {
      case 'delete':
        articleIds.forEach(id => {
          dispatch({ type: 'REMOVE_ARTICLE', payload: id });
        });
        break;

      case 'update_status':
        articleIds.forEach(id => {
          dispatch({
            type: 'UPDATE_ARTICLE',
            payload: {
              id,
              updates: { reading_status: options.status }
            }
          });
        });
        break;

      case 'move_to_collection':
        articleIds.forEach(id => {
          dispatch({
            type: 'UPDATE_ARTICLE',
            payload: {
              id,
              updates: { collection_name: options.collection_name }
            }
          });
        });
        break;
    }

    dispatch({ type: 'CLEAR_SELECTION' });
    return true;
  }, [user]);

  // =====================================================
  // READING SESSION MANAGEMENT
  // =====================================================

  const startReadingSession = useCallback(async (
    articleId: string, 
    deviceType: DeviceType
  ): Promise<string | null> => {
    if (!user) return null;

    const [result, error] = await safeAsync(async () => {
      return apiCall('/read-later-api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          read_later_id: articleId,
          device_type: deviceType
        })
      });
    });

    if (error) {
      logError('Failed to start reading session', error, { userId: user.id, articleId });
      return null;
    }

    currentSessionRef.current = result.session_id;
    return result.session_id;
  }, [user]);

  const endReadingSession = useCallback(async (
    sessionId: string, 
    progress: number, 
    interactions = 0
  ): Promise<boolean> => {
    if (!user) return false;

    const [, error] = await safeAsync(async () => {
      return apiCall('/read-later-api/sessions', {
        method: 'PUT',
        body: JSON.stringify({
          session_id: sessionId,
          end_progress: progress,
          interactions_count: interactions
        })
      });
    });

    if (error) {
      logError('Failed to end reading session', error, { userId: user.id, sessionId });
      return false;
    }

    if (currentSessionRef.current === sessionId) {
      currentSessionRef.current = null;
    }

    return true;
  }, [user]);

  // =====================================================
  // UI STATE MANAGEMENT
  // =====================================================

  const setCurrentCollection = useCallback((collectionName: string) => {
    dispatch({ type: 'SET_CURRENT_COLLECTION', payload: collectionName });
  }, []);

  const setFilters = useCallback((filters: Partial<ReadLaterFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const toggleArticleSelection = useCallback((articleId: string) => {
    dispatch({ type: 'TOGGLE_ARTICLE_SELECTION', payload: articleId });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setSortOrder = useCallback((
    sortBy: ReadLaterState['sortBy'], 
    order: ReadLaterState['sortOrder']
  ) => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder: order } });
  }, []);

  // =====================================================
  // INITIALIZATION
  // =====================================================

  useEffect(() => {
    if (user) {
      loadCollections();
      loadArticles();
    }
  }, [user, loadCollections, loadArticles]);

  // =====================================================
  // RETURN HOOK INTERFACE
  // =====================================================

  return {
    state,
    actions: {
      // Article management
      loadArticles,
      addToReadLater,
      removeFromReadLater,
      updateProgress,
      updateNotes,
      addHighlight,
      
      // Collection management
      loadCollections,
      createCollection,
      updateCollection,
      deleteCollection,
      
      // Bulk operations
      bulkAction,
      
      // UI state management
      setCurrentCollection,
      setFilters,
      toggleArticleSelection,
      clearSelection,
      setViewMode,
      setSortOrder,
      
      // Reading session management
      startReadingSession,
      endReadingSession
    }
  };
}