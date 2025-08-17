import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cache for frequent queries (5 minute TTL)
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generic caching wrapper for Supabase queries
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<T> {
  const cached = queryCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < cached.ttl) {
    logger.info('Cache hit', { cacheKey });
    return cached.data;
  }

  const data = await queryFn();
  queryCache.set(cacheKey, { data, timestamp: now, ttl });
  logger.info('Cache miss, stored new data', { cacheKey });
  
  return data;
}

/**
 * Clear cache for a specific key or pattern
 */
export function clearCache(keyPattern?: string): void {
  if (!keyPattern) {
    queryCache.clear();
    logger.info('All cache cleared');
    return;
  }

  const keysToDelete = Array.from(queryCache.keys()).filter(key => 
    key.includes(keyPattern)
  );
  
  keysToDelete.forEach(key => queryCache.delete(key));
  logger.info('Cache cleared for pattern', { keyPattern, deletedKeys: keysToDelete.length });
}

/**
 * Optimized user data fetching - batches multiple user-related queries
 */
export interface UserDataBatch {
  profile?: any;
  vectorStore?: any;
  documents?: any[];
  cases?: any[];
  consents?: any[];
}

export async function batchUserData(
  userId: string,
  options: {
    includeProfile?: boolean;
    includeVectorStore?: boolean;
    includeDocuments?: boolean;
    includeCases?: boolean;
    includeConsents?: boolean;
    useCache?: boolean;
  } = {}
): Promise<UserDataBatch> {
  const cacheKey = `user_batch_${userId}_${JSON.stringify(options)}`;
  
  if (options.useCache) {
    return cachedQuery(cacheKey, () => executeBatchUserData(userId, options), DEFAULT_CACHE_TTL);
  }
  
  return executeBatchUserData(userId, options);
}

async function executeBatchUserData(userId: string, options: any): Promise<UserDataBatch> {
  const queries: Promise<any>[] = [];
  const queryTypes: string[] = [];

  if (options.includeProfile !== false) {
    queries.push(
      supabase.from('profiles').select('*').eq('id', userId).single()
    );
    queryTypes.push('profile');
  }

  if (options.includeVectorStore) {
    queries.push(
      supabase
        .from('user_vector_stores')
        .select('openai_vector_store_id, openai_metadata')
        .eq('user_id', userId)
        .single()
    );
    queryTypes.push('vectorStore');
  }

  if (options.includeDocuments) {
    queries.push(
      supabase
        .from('user_documents')
        .select('openai_file_id, filename, status')
        .eq('user_id', userId)
        .eq('status', 'completed')
    );
    queryTypes.push('documents');
  }

  if (options.includeCases) {
    queries.push(
      supabase
        .from('patient_cases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
    queryTypes.push('cases');
  }

  if (options.includeConsents) {
    queries.push(
      supabase
        .from('user_consent_records')
        .select('*')
        .eq('user_id', userId)
    );
    queryTypes.push('consents');
  }

  const startTime = performance.now();
  const results = await Promise.all(queries);
  const endTime = performance.now();

  logger.info('Batch user data query completed', {
    userId,
    queryTypes,
    duration: `${endTime - startTime}ms`,
    queryCount: queries.length
  });

  const batchResult: UserDataBatch = {};
  results.forEach((result, index) => {
    const queryType = queryTypes[index];
    switch (queryType) {
      case 'profile':
        batchResult.profile = result.data;
        break;
      case 'vectorStore':
        batchResult.vectorStore = result.data;
        break;
      case 'documents':
        batchResult.documents = result.data || [];
        break;
      case 'cases':
        batchResult.cases = result.data || [];
        break;
      case 'consents':
        batchResult.consents = result.data || [];
        break;
    }
  });

  return batchResult;
}

/**
 * Optimized podcast queue operations
 */
export interface PodcastQueueBatch {
  userQueue?: any;
  queueStats?: {
    waiting: number;
    processing: number;
    total: number;
  };
  nextItem?: any;
}

export async function batchPodcastQueueData(
  userId?: string,
  options: {
    includeUserQueue?: boolean;
    includeQueueStats?: boolean;
    includeNextItem?: boolean;
    useCache?: boolean;
  } = {}
): Promise<PodcastQueueBatch> {
  const cacheKey = `podcast_queue_${userId || 'global'}_${JSON.stringify(options)}`;
  
  if (options.useCache) {
    return cachedQuery(cacheKey, () => executeBatchPodcastQueue(userId, options), 30000); // 30 second cache
  }
  
  return executeBatchPodcastQueue(userId, options);
}

async function executeBatchPodcastQueue(userId?: string, options: any = {}): Promise<PodcastQueueBatch> {
  const queries: Promise<any>[] = [];
  const queryTypes: string[] = [];

  if (options.includeUserQueue && userId) {
    queries.push(
      supabase
        .from('podcast_queue')
        .select(`
          *,
          ai_podcasts (
            id,
            title,
            status
          )
        `)
        .eq('user_id', userId)
        .in('status', ['waiting', 'processing'])
        .order('position')
        .single()
    );
    queryTypes.push('userQueue');
  }

  if (options.includeQueueStats) {
    queries.push(
      supabase
        .from('podcast_queue')
        .select('status')
        .in('status', ['waiting', 'processing'])
    );
    queryTypes.push('queueStats');
  }

  if (options.includeNextItem) {
    queries.push(
      supabase
        .from('podcast_queue')
        .select(`
          *,
          ai_podcasts (*)
        `)
        .eq('status', 'waiting')
        .order('position')
        .limit(1)
        .single()
    );
    queryTypes.push('nextItem');
  }

  const startTime = performance.now();
  const results = await Promise.all(queries);
  const endTime = performance.now();

  logger.info('Batch podcast queue query completed', {
    userId,
    queryTypes,
    duration: `${endTime - startTime}ms`,
    queryCount: queries.length
  });

  const batchResult: PodcastQueueBatch = {};
  results.forEach((result, index) => {
    const queryType = queryTypes[index];
    switch (queryType) {
      case 'userQueue':
        batchResult.userQueue = result.data;
        break;
      case 'queueStats':
        const data = result.data || [];
        batchResult.queueStats = {
          waiting: data.filter((item: any) => item.status === 'waiting').length,
          processing: data.filter((item: any) => item.status === 'processing').length,
          total: data.length
        };
        break;
      case 'nextItem':
        batchResult.nextItem = result.data;
        break;
    }
  });

  return batchResult;
}

/**
 * Optimized case loading with user authentication
 */
export async function loadUserCasesOptimized(options: {
  useCache?: boolean;
  cacheTTL?: number;
} = {}): Promise<{
  user: any;
  cases: any[];
  error?: string;
}> {
  const startTime = performance.now();
  
  try {
    // Use Promise.all to fetch user and cases in parallel once we have the user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { user: null, cases: [], error: 'No authenticated user' };
    }

    const cacheKey = `user_cases_${user.id}`;
    const cacheTTL = options.cacheTTL || DEFAULT_CACHE_TTL;

    const loadCases = async () => {
      const { data: cases, error } = await supabase
        .from('patient_cases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error loading user cases', { userId: user.id, error });
        throw error;
      }

      return cases || [];
    };

    const cases = options.useCache 
      ? await cachedQuery(cacheKey, loadCases, cacheTTL)
      : await loadCases();

    const endTime = performance.now();
    logger.info('Optimized user cases loaded', {
      userId: user.id,
      caseCount: cases.length,
      duration: `${endTime - startTime}ms`,
      cached: options.useCache
    });

    return { user, cases };
  } catch (error) {
    logger.error('Failed to load user cases optimized', error);
    return { 
      user: null, 
      cases: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Batch update operations for better performance
 */
export async function batchUpdatePodcastStatus(updates: Array<{
  table: 'podcast_queue' | 'ai_podcasts';
  id: string;
  data: Record<string, any>;
}>): Promise<void> {
  const queueUpdates = updates.filter(u => u.table === 'podcast_queue');
  const podcastUpdates = updates.filter(u => u.table === 'ai_podcasts');

  const promises: Promise<any>[] = [];

  if (queueUpdates.length > 0) {
    // For multiple updates to the same table, we can use upsert or individual updates
    promises.push(...queueUpdates.map(update => 
      supabase
        .from('podcast_queue')
        .update(update.data)
        .eq('id', update.id)
    ));
  }

  if (podcastUpdates.length > 0) {
    promises.push(...podcastUpdates.map(update => 
      supabase
        .from('ai_podcasts')
        .update(update.data)
        .eq('id', update.id)
    ));
  }

  const startTime = performance.now();
  await Promise.all(promises);
  const endTime = performance.now();

  logger.info('Batch podcast status updates completed', {
    queueUpdates: queueUpdates.length,
    podcastUpdates: podcastUpdates.length,
    duration: `${endTime - startTime}ms`
  });
}

/**
 * Clean up cache periodically
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
      logger.info('Cache cleanup completed', { expiredKeys: expiredKeys.length });
    }
  }, 60000); // Run every minute
} 