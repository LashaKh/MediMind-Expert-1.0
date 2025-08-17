/**
 * SearchContextProvider - Global search state management
 * Handles search state, history, and filter preferences using React Context
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { SearchQuery, SearchResult, SearchProvider, AdvancedMedicalFilters } from '@/utils/search/apiOrchestration';
import { searchOrchestrator } from '@/utils/search/apiOrchestration';
import { useAuth, useSpecialty } from '../../../stores/useAppStore';
import { safe, safeAsync, ErrorSeverity } from '../../../lib/utils/errorHandling';

// Search History Interface
export interface SearchHistoryItem {
  id: string;
  query: SearchQuery;
  timestamp: number;
  resultCount?: number;
}

// Filter Preferences Interface
export interface FilterPreferences {
  defaultEvidenceLevel: string[];
  defaultContentType: string[];
  defaultRecency: string;
  preferredProviders: SearchProvider['id'][];
  savedFilters: Array<{
    id: string;
    name: string;
    filters: Partial<SearchQuery>;
  }>;
  // Add advanced filter defaults
  defaultAdvancedFilters: AdvancedMedicalFilters;
}

// Search State Interface
export interface SearchState {
  // Current search
  currentQuery: SearchQuery | null;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  searchTime: number;
  initialTab?: string;
  
  // Provider performance data
  providerMetrics?: {
    successfulProviders: number;  
    failedProviders: Array<{ provider: SearchProvider['id']; error: string }>;
    providerResponseTimes?: Record<SearchProvider['id'], number>;
  };
  
  // Selected result for detail view
  selectedResult: SearchResult | null;
  
  // Search history
  searchHistory: SearchHistoryItem[];
  
  // Filter preferences
  filterPreferences: FilterPreferences;
  
  // UI state
  showAdvancedFilters: boolean;
  viewMode: 'list' | 'grid' | 'compact';
  sortBy: 'relevance' | 'date' | 'evidence-level';
  selectedProviders: SearchProvider['id'][];
}

// Action Types
export type SearchAction =
  | { type: 'SET_QUERY'; payload: SearchQuery }
  | { type: 'SET_RESULTS'; payload: { 
      results: SearchResult[]; 
      totalCount: number; 
      searchTime: number; 
      providerMetrics?: {
        successfulProviders: number;  
        failedProviders: Array<{ provider: SearchProvider['id']; error: string }>;
        providerResponseTimes?: Record<SearchProvider['id'], number>;
      };
    } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_RESULT'; payload: SearchResult | null }
  | { type: 'ADD_TO_HISTORY'; payload: SearchHistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'UPDATE_FILTER_PREFERENCES'; payload: Partial<FilterPreferences> }
  | { type: 'TOGGLE_ADVANCED_FILTERS' }
  | { type: 'SET_VIEW_MODE'; payload: SearchState['viewMode'] }
  | { type: 'SET_SORT_BY'; payload: SearchState['sortBy'] }
  | { type: 'SET_SELECTED_PROVIDERS'; payload: SearchProvider['id'][] }
  | { type: 'RESET_SEARCH' };

// Context Interface
export interface SearchContextType {
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
  // Helper functions
  executeSearch: (query: SearchQuery) => Promise<void>;
  clearSearch: () => void;
  addToHistory: (query: SearchQuery, resultCount?: number) => void;
  updateFilterPreferences: (preferences: Partial<FilterPreferences>) => void;
  getSearchSuggestions: (input: string) => SearchHistoryItem[];
}

// Default filter preferences
const defaultFilterPreferences: FilterPreferences = {
  defaultEvidenceLevel: ['systematic-review', 'rct', 'cohort'],
  defaultContentType: ['journal-article', 'clinical-guideline'],
  defaultRecency: 'last-5-years',
  preferredProviders: ['exa', 'brave', 'clinicaltrials'],
  savedFilters: [],
  defaultAdvancedFilters: {},
};

// Initial state
const initialState: SearchState = {
  currentQuery: null,
  results: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  searchTime: 0,
  selectedResult: null,
  searchHistory: [],
  filterPreferences: defaultFilterPreferences,
  showAdvancedFilters: true,
  viewMode: 'list',
  sortBy: 'relevance',
  selectedProviders: ['exa', 'brave', 'clinicaltrials'],
};

// Reducer
const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        currentQuery: action.payload,
        error: null,
      };
    
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload.results,
        totalCount: action.payload.totalCount,
        searchTime: action.payload.searchTime,
        providerMetrics: action.payload.providerMetrics,
        isLoading: false,
        error: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'SET_SELECTED_RESULT':
      return {
        ...state,
        selectedResult: action.payload,
      };
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        searchHistory: [action.payload, ...state.searchHistory.slice(0, 49)], // Keep last 50
      };
    
    case 'CLEAR_HISTORY':
      return {
        ...state,
        searchHistory: [],
      };
    
    case 'UPDATE_FILTER_PREFERENCES':
      return {
        ...state,
        filterPreferences: {
          ...state.filterPreferences,
          ...action.payload,
        },
      };
    
    case 'TOGGLE_ADVANCED_FILTERS':
      return {
        ...state,
        showAdvancedFilters: !state.showAdvancedFilters,
      };
    
    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };
    
    case 'SET_SORT_BY':
      return {
        ...state,
        sortBy: action.payload,
      };
    
    case 'SET_SELECTED_PROVIDERS':
      return {
        ...state,
        selectedProviders: action.payload,
      };
    
    case 'RESET_SEARCH':
      return {
        ...state,
        currentQuery: null,
        results: [],
        selectedResult: null,
        isLoading: false,
        error: null,
        totalCount: 0,
        searchTime: 0,
      };
    
    default:
      return state;
  }
};

// Create Context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider Props
interface SearchContextProviderProps {
  children: ReactNode;
  initialQuery?: SearchQuery | null;
  onQueryChange?: (query: SearchQuery) => void;
  initialTab?: string;
}

// Provider Component
export const SearchContextProvider: React.FC<SearchContextProviderProps> = ({
  children,
  initialQuery,
  onQueryChange,
  initialTab,
}) => {
  const { user, profile } = useAuth();
  const { specialty } = useSpecialty();
  
  const [state, dispatch] = useReducer(searchReducer, {
    ...initialState,
    currentQuery: initialQuery || null,
    initialTab: initialTab,
  });

  // Generate user-specific storage keys
  const getStorageKey = (key: string) => {
    return user ? `medisearch-${key}-${user.id}` : `medisearch-${key}`;
  };

  // Load user-specific preferences from localStorage on mount or user change
  useEffect(() => {
    if (!user) return;

    const savedPreferences = localStorage.getItem(getStorageKey('filter-preferences'));
    if (savedPreferences) {
      const [preferences, error] = safe(() => {
        return JSON.parse(savedPreferences);
      }, {
        context: 'loading search filter preferences from localStorage',
        severity: ErrorSeverity.LOW,
        showToast: false
      });

      if (error) {
        // Continue with defaults, don't disrupt user experience
      } else {
        dispatch({ type: 'UPDATE_FILTER_PREFERENCES', payload: preferences });
      }
    }

    const savedHistory = localStorage.getItem(getStorageKey('history'));
    if (savedHistory) {
      const [history, error] = safe(() => {
        return JSON.parse(savedHistory);
      }, {
        context: 'loading search history from localStorage',
        severity: ErrorSeverity.LOW,
        showToast: false
      });

      if (error) {
        // Continue without history, don't disrupt user experience
      } else {
        // Clear existing history first, then load user-specific history
        dispatch({ type: 'CLEAR_HISTORY' });
        history.forEach((item: SearchHistoryItem) => {
          dispatch({ type: 'ADD_TO_HISTORY', payload: item });
        });
      }
    }
  }, [user]);

  // Apply specialty-specific defaults when specialty changes
  useEffect(() => {
    if (specialty && user) {
      const specialtyDefaults: Partial<FilterPreferences> = {
        defaultEvidenceLevel: ['systematic-review', 'rct', 'cohort'],
        defaultContentType: ['journal-article', 'clinical-guideline'],
        defaultRecency: 'last-5-years',
        preferredProviders: ['exa', 'brave', 'clinicaltrials'],
      };

      // Apply specialty-specific customizations
      if (specialty.toLowerCase() === 'cardiology') {
        specialtyDefaults.defaultContentType = ['journal-article', 'clinical-guideline', 'consensus-statement'];
      } else if (specialty.toLowerCase() === 'obstetrics_gynecology') {
        specialtyDefaults.defaultContentType = ['journal-article', 'clinical-guideline', 'practice-bulletin'];
      }

      dispatch({ type: 'UPDATE_FILTER_PREFERENCES', payload: specialtyDefaults });
    }
  }, [specialty, user]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(getStorageKey('filter-preferences'), JSON.stringify(state.filterPreferences));
    }
  }, [state.filterPreferences, user]);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(getStorageKey('history'), JSON.stringify(state.searchHistory));
    }
  }, [state.searchHistory, user]);

  // Notify parent of query changes - with deep comparison to prevent infinite loops
  useEffect(() => {
    if (state.currentQuery && onQueryChange) {
      onQueryChange(state.currentQuery);
    }
  }, [
    state.currentQuery?.query, 
    state.currentQuery?.specialty, 
    state.currentQuery?.evidenceLevel?.join(','), 
    state.currentQuery?.contentType?.join(','),
    state.currentQuery?.recency,
    onQueryChange
  ]);

  // Execute search function
  const executeSearch = async (query: SearchQuery): Promise<void> => {
    // Ensure user is authenticated
    if (!user) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Please log in to perform searches',
      });
      return;
    }

    // Apply user's specialty if not specified in query
    const enhancedQuery: SearchQuery = {
      ...query,
      specialty: query.specialty || specialty?.toLowerCase(),
      // Apply user's default filters if not specified
      evidenceLevel: query.evidenceLevel || state.filterPreferences.defaultEvidenceLevel,
      contentType: query.contentType || state.filterPreferences.defaultContentType,
      recency: query.recency || state.filterPreferences.defaultRecency,
      providers: query.providers || state.filterPreferences.preferredProviders,
      limit: query.limit || 10,
      // Apply advanced filters (merge with defaults if needed)
      advancedFilters: query.advancedFilters || 
        (Object.keys(state.filterPreferences.defaultAdvancedFilters).length > 0 
          ? state.filterPreferences.defaultAdvancedFilters 
          : undefined),
    };

    dispatch({ type: 'SET_QUERY', payload: enhancedQuery });
    dispatch({ type: 'SET_LOADING', payload: true });

    const [response, error] = await safeAsync(async () => {
      // Use the parallel search for better results
      return await searchOrchestrator.parallelSearch(enhancedQuery);
    }, {
      context: 'executing medical search with search orchestrator',
      severity: ErrorSeverity.MEDIUM,
      showToast: true
    });

    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.userMessage || 'Search failed',
      });
      
      // Still add failed searches to history for learning
      addToHistory(enhancedQuery, 0);
    } else {
      dispatch({
        type: 'SET_RESULTS',
        payload: {
          results: response.results,
          totalCount: response.totalCount,
          searchTime: response.searchTime,
          providerMetrics: {
            successfulProviders: response.successfulProviders,
            failedProviders: response.failedProviders,
          },
        },
      });

      // Add to user's search history
      addToHistory(enhancedQuery, response.totalCount);

      // Log provider performance for debugging (non-critical information)
      if (response.failedProviders.length > 0) {
        // Provider failures are logged by the error handling system
      }
    }
  };

  // Clear search function
  const clearSearch = (): void => {
    dispatch({ type: 'RESET_SEARCH' });
  };

  // Add to history function
  const addToHistory = (query: SearchQuery, resultCount?: number): void => {
    const historyItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      timestamp: Date.now(),
      resultCount,
    };
    dispatch({ type: 'ADD_TO_HISTORY', payload: historyItem });
  };

  // Update filter preferences function
  const updateFilterPreferences = (preferences: Partial<FilterPreferences>): void => {
    dispatch({ type: 'UPDATE_FILTER_PREFERENCES', payload: preferences });
  };

  // Get search suggestions function
  const getSearchSuggestions = (input: string): SearchHistoryItem[] => {
    if (!input.trim()) {
      return state.searchHistory.slice(0, 5);
    }

    return state.searchHistory
      .filter(item =>
        item.query.query.toLowerCase().includes(input.toLowerCase()) ||
        (item.query.specialty && item.query.specialty.toLowerCase().includes(input.toLowerCase()))
      )
      .slice(0, 5);
  };

  const contextValue: SearchContextType = {
    state,
    dispatch,
    executeSearch,
    clearSearch,
    addToHistory,
    updateFilterPreferences,
    getSearchSuggestions,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

// Hook to use the search context
export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchContextProvider');
  }
  return context;
};

export default SearchContextProvider;