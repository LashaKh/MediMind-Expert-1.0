import { useState, useEffect, useCallback, useRef } from 'react';
import { ABGLazyLoadingConfig } from '../types/abg';

/**
 * Custom hook for lazy loading with intersection observer
 */
export interface UseLazyLoadingOptions {
  /** Configuration for lazy loading behavior */
  config?: Partial<ABGLazyLoadingConfig>;
  /** Function to load more data */
  loadMore: (offset: number, limit: number) => Promise<any[]>;
  /** Initial data to start with */
  initialData?: any[];
  /** Whether there are more items to load */
  hasMore?: boolean;
  /** Whether to enable lazy loading */
  enabled?: boolean;
}

export interface UseLazyLoadingReturn<T> {
  /** Current loaded items */
  items: T[];
  /** Whether currently loading */
  isLoading: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Error state */
  error: string | null;
  /** Manual trigger for loading more */
  loadMore: () => Promise<void>;
  /** Reset the lazy loading state */
  reset: () => void;
  /** Ref to attach to the sentinel element */
  sentinelRef: React.RefObject<HTMLDivElement>;
  /** Current page/offset info */
  currentOffset: number;
  /** Total items loaded */
  totalLoaded: number;
}

const DEFAULT_CONFIG: ABGLazyLoadingConfig = {
  pageSize: 20,
  preloadCount: 5,
  threshold: 200,
  debounceMs: 300
};

export function useLazyLoading<T = any>({
  config = {},
  loadMore: loadMoreFn,
  initialData = [],
  hasMore: initialHasMore = true,
  enabled = true
}: UseLazyLoadingOptions): UseLazyLoadingReturn<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State
  const [items, setItems] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);

  // Refs
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load more data function
  const loadMore = useCallback(async () => {
    if (!enabled || loadingRef.current || !hasMore) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const newItems = await loadMoreFn(currentOffset, finalConfig.pageSize);
      
      if (newItems && newItems.length > 0) {
        setItems(prevItems => {
          // Avoid duplicates by filtering out items with existing IDs
          const existingIds = new Set(prevItems.map((item: any) => item.id || item));
          const uniqueNewItems = newItems.filter((item: any) => 
            !existingIds.has(item.id || item)
          );
          return [...prevItems, ...uniqueNewItems];
        });
        
        setCurrentOffset(prev => prev + newItems.length);
        
        // Check if we've reached the end
        if (newItems.length < finalConfig.pageSize) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more items';
      setError(errorMessage);
      console.error('Lazy loading error:', err);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [enabled, hasMore, currentOffset, finalConfig.pageSize, loadMoreFn]);

  // Debounced load more function
  const debouncedLoadMore = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      loadMore();
    }, finalConfig.debounceMs);
  }, [loadMore, finalConfig.debounceMs]);

  // Reset function
  const reset = useCallback(() => {
    setItems([]);
    setCurrentOffset(0);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
    loadingRef.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Set up intersection observer
  useEffect(() => {
    if (!enabled || !sentinelRef.current) {
      return;
    }

    const sentinel = sentinelRef.current;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          debouncedLoadMore();
        }
      },
      {
        rootMargin: `${finalConfig.threshold}px`,
        threshold: 0.1
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current && sentinel) {
        observerRef.current.unobserve(sentinel);
      }
    };
  }, [enabled, hasMore, isLoading, debouncedLoadMore, finalConfig.threshold]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Initial setup only - no dependency updates to prevent loops
  useEffect(() => {
    // Only set initial data on mount if provided and items are empty
    if (initialData.length > 0 && items.length === 0) {
      setItems(initialData);
      setCurrentOffset(initialData.length);
    }
  }, []); // Empty dependency array to run only on mount

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    sentinelRef,
    currentOffset,
    totalLoaded: items.length
  };
}

/**
 * Custom hook for virtual scrolling (for very large datasets)
 */
export interface UseVirtualScrollingOptions {
  /** Total number of items */
  totalCount: number;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container in pixels */
  containerHeight: number;
  /** Number of items to render outside visible area (buffer) */
  overscan?: number;
}

export interface UseVirtualScrollingReturn {
  /** Start index of visible items */
  startIndex: number;
  /** End index of visible items */
  endIndex: number;
  /** Total height of all items */
  totalHeight: number;
  /** Offset from top for visible items */
  offsetY: number;
  /** Items to render (with buffer) */
  visibleItems: number[];
  /** Scroll event handler */
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  /** Current scroll position */
  scrollTop: number;
}

export function useVirtualScrolling({
  totalCount,
  itemHeight,
  containerHeight,
  overscan = 5
}: UseVirtualScrollingOptions): UseVirtualScrollingReturn {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalCount - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Calculate total height and offset
  const totalHeight = totalCount * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Generate visible items array
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(i);
  }

  // Scroll event handler
  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    visibleItems,
    onScroll,
    scrollTop
  };
}

/**
 * Hook for infinite scroll with search functionality
 */
export interface UseInfiniteScrollOptions<T> {
  /** Search function */
  searchFn: (query: string, offset: number, limit: number) => Promise<{
    items: T[];
    total: number;
    hasMore: boolean;
  }>;
  /** Search query */
  query: string;
  /** Page size */
  pageSize?: number;
  /** Debounce delay for search */
  debounceMs?: number;
  /** Whether to reset on query change */
  resetOnQueryChange?: boolean;
}

export interface UseInfiniteScrollReturn<T> extends UseLazyLoadingReturn<T> {
  /** Current search query */
  query: string;
  /** Update search query */
  setQuery: (query: string) => void;
  /** Total count from search results */
  totalCount: number;
  /** Whether search is active */
  isSearching: boolean;
}

export function useInfiniteScroll<T = any>({
  searchFn,
  query: initialQuery = '',
  pageSize = 20,
  debounceMs = 300,
  resetOnQueryChange = true
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [query, setQuery] = useState(initialQuery);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const queryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load more function for search
  const loadMore = useCallback(async (offset: number, limit: number) => {
    setIsSearching(true);
    try {
      const result = await searchFn(query, offset, limit);
      setTotalCount(result.total);
      return result.items;
    } finally {
      setIsSearching(false);
    }
  }, [searchFn, query]);

  // Use lazy loading hook
  const lazyLoading = useLazyLoading<T>({
    config: { pageSize },
    loadMore,
    enabled: true
  });

  // Handle query changes
  useEffect(() => {
    if (queryTimeoutRef.current) {
      clearTimeout(queryTimeoutRef.current);
    }

    queryTimeoutRef.current = setTimeout(() => {
      if (resetOnQueryChange) {
        lazyLoading.reset();
        // Trigger initial load with new query
        lazyLoading.loadMore();
      }
    }, debounceMs);

    return () => {
      if (queryTimeoutRef.current) {
        clearTimeout(queryTimeoutRef.current);
      }
    };
  }, [query, debounceMs, resetOnQueryChange, lazyLoading]);

  return {
    ...lazyLoading,
    query,
    setQuery,
    totalCount,
    isSearching
  };
}