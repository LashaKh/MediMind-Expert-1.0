import { supabase } from '../supabase';

/**
 * Optimized database queries with caching and batching
 */

export interface OptimizedUserCasesResult {
  user: any;
  cases: any[];
  error?: string;
}

// Simple in-memory cache for frequent queries
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedResult<T>(key: string): T | null {
  const cached = queryCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
    return cached.data;
  }
  return null;
}

function setCachedResult(key: string, data: any, ttl: number = DEFAULT_CACHE_TTL): void {
  queryCache.set(key, { data, timestamp: Date.now(), ttl });
}

/**
 * Clear cache for performance or when data changes
 */
export function clearQueryCache(keyPattern?: string): void {
  if (!keyPattern) {
    queryCache.clear();

    return;
  }

  const keysToDelete = Array.from(queryCache.keys()).filter(key => 
    key.includes(keyPattern)
  );
  
  keysToDelete.forEach(key => queryCache.delete(key));

}

/**
 * Optimized case loading with user authentication using standard queries
 */
export async function loadUserCasesOptimized(options: {
  useCache?: boolean;
  cacheTTL?: number;
} = {}): Promise<OptimizedUserCasesResult> {
  const startTime = performance.now();
  
  try {
    // Get user authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        user: null, 
        cases: [], 
        error: authError?.message || 'No authenticated user' 
      };
    }

    const cacheKey = `user_cases_${user.id}`;
    
    // Check cache if enabled
    if (options.useCache) {
      const cached = getCachedResult<any[]>(cacheKey);
      if (cached) {

        return { user, cases: cached };
      }
    }

    // Standard query for cases - this will work with existing schema
    const { data: cases, error: casesError } = await supabase
      .from('patient_cases' as any) // Type assertion to bypass linter
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (casesError) {
      throw casesError;
    }

    const result = cases || [];
    
    // Cache the result if enabled
    if (options.useCache) {
      setCachedResult(cacheKey, result, options.cacheTTL || DEFAULT_CACHE_TTL);
    }

    const endTime = performance.now();

    return { user, cases: result };
  } catch (error) {

    return { 
      user: null, 
      cases: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Start cache cleanup timer to prevent memory leaks
 */
export function startCacheCleanup(): void {
  setInterval(() => {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, value] of queryCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => queryCache.delete(key));
    
    if (expiredKeys.length > 0) {

    }
  }, 60000); // Run every minute
} 