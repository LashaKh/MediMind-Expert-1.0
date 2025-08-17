/**
 * Error Recovery Strategies for Medical News Components
 * Implements automatic recovery, degraded service modes, and fallback data
 */

import React from 'react';
import { errorHandler, ErrorContext, MedicalErrorBoundary } from './errorHandling';
import { cacheManager } from './caching';

// Re-export MedicalErrorBoundary for convenience
export { MedicalErrorBoundary };

export interface RecoveryStrategy {
  name: string;
  priority: number;
  condition: (error: Error, context: ErrorContext) => boolean;
  action: (error: Error, context: ErrorContext) => Promise<any>;
  description: string;
}

export interface FallbackData {
  medicalNews: Array<{
    id: string;
    title: string;
    summary: string;
    category: string;
    specialty: string;
    publishedAt: string;
    source: string;
    fallback: true;
  }>;
  searchResults: {
    query: string;
    results: any[];
    total: 0;
    fallback: true;
    message: string;
  };
  calculatorData: {
    available: boolean;
    message: string;
    fallback: true;
  };
}

class ErrorRecoveryManager {
  private strategies: RecoveryStrategy[] = [];
  private fallbackData: FallbackData;
  
  constructor() {
    this.setupDefaultStrategies();
    this.initializeFallbackData();
  }

  /**
   * Initialize fallback data for medical content
   */
  private initializeFallbackData(): void {
    this.fallbackData = {
      medicalNews: [
        {
          id: 'fallback-1',
          title: 'Medical News Currently Unavailable',
          summary: 'We are experiencing technical difficulties accessing the latest medical news. Please check your connection and try again.',
          category: 'system',
          specialty: 'general',
          publishedAt: new Date().toISOString(),
          source: 'MediMind System',
          fallback: true
        }
      ],
      searchResults: {
        query: '',
        results: [],
        total: 0,
        fallback: true,
        message: 'Search is temporarily unavailable. Please try again later or check your connection.'
      },
      calculatorData: {
        available: false,
        message: 'Medical calculators are temporarily unavailable. Please use alternative calculation methods.',
        fallback: true
      }
    };
  }

  /**
   * Setup default recovery strategies
   */
  private setupDefaultStrategies(): void {
    // Strategy 1: Cache fallback for API failures
    this.registerStrategy({
      name: 'cache_fallback',
      priority: 1,
      condition: (error, context) => 
        context.action.includes('api') && !error.message.includes('authentication'),
      action: async (error, context) => {
        console.log('[Recovery] Attempting cache fallback for:', context.action);
        
        // Try to get cached data
        const cacheKey = `${context.component}_${context.action}`;
        const cachedData = await cacheManager.get(cacheKey, {
          userSpecialty: context.specialty
        });
        
        if (cachedData) {
          return {
            ...cachedData,
            fromCache: true,
            cacheWarning: 'This data may be outdated due to network issues.'
          };
        }
        
        throw new Error('No cached data available');
      },
      description: 'Attempts to serve cached data when API calls fail'
    });

    // Strategy 2: Degraded service mode
    this.registerStrategy({
      name: 'degraded_service',
      priority: 2,
      condition: (error, context) => 
        context.medicalContent && error.message.includes('network'),
      action: async (error, context) => {
        console.log('[Recovery] Entering degraded service mode for:', context.component);
        
        if (context.action.includes('news')) {
          return this.fallbackData.medicalNews;
        }
        
        if (context.action.includes('search')) {
          return this.fallbackData.searchResults;
        }
        
        if (context.action.includes('calculator')) {
          return this.fallbackData.calculatorData;
        }
        
        return {
          available: false,
          message: 'Service temporarily unavailable',
          fallback: true
        };
      },
      description: 'Provides minimal functionality when primary services fail'
    });

    // Strategy 3: Retry with exponential backoff
    this.registerStrategy({
      name: 'exponential_retry',
      priority: 3,
      condition: (error, context) => 
        error.message.includes('timeout') || error.message.includes('503'),
      action: async (error, context) => {
        console.log('[Recovery] Retrying with exponential backoff:', context.action);
        
        // This would be handled by the retry mechanism in errorHandler
        throw error; // Let the retry mechanism handle it
      },
      description: 'Retries failed operations with increasing delays'
    });

    // Strategy 4: Authentication recovery
    this.registerStrategy({
      name: 'auth_recovery',
      priority: 4,
      condition: (error, context) => 
        error.message.includes('401') || error.message.includes('authentication'),
      action: async (error, context) => {
        console.log('[Recovery] Attempting authentication recovery');
        
        // Try to refresh authentication
        try {
          // In a real app, this would refresh the auth token
          // For now, just redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login?returnTo=' + encodeURIComponent(window.location.pathname);
          }
        } catch (authError) {
          throw new Error('Authentication recovery failed');
        }
      },
      description: 'Attempts to recover from authentication failures'
    });

    // Strategy 5: Medical safety override
    this.registerStrategy({
      name: 'medical_safety',
      priority: 5,
      condition: (error, context) => 
        context.medicalContent && context.action.includes('calculator'),
      action: async (error, context) => {
        console.warn('[Recovery] Medical safety override activated');
        
        return {
          error: 'calculator_unavailable',
          message: 'Medical calculators are temporarily unavailable. Please use alternative calculation methods and verify all results independently.',
          safetyNote: 'Always consult primary medical sources for critical calculations.',
          fallback: true,
          medicalSafety: true
        };
      },
      description: 'Provides safe fallback for critical medical tool failures'
    });
  }

  /**
   * Register a recovery strategy
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Attempt recovery for an error
   */
  async attemptRecovery(error: Error, context: ErrorContext): Promise<any> {
    console.log('[Recovery] Attempting recovery for error:', error.message);
    
    for (const strategy of this.strategies) {
      if (strategy.condition(error, context)) {
        console.log(`[Recovery] Trying strategy: ${strategy.name}`);
        
        try {
          const result = await strategy.action(error, context);
          console.log(`[Recovery] Strategy ${strategy.name} succeeded`);
          return result;
        } catch (recoveryError) {
          console.warn(`[Recovery] Strategy ${strategy.name} failed:`, recoveryError);
          continue;
        }
      }
    }
    
    console.error('[Recovery] All recovery strategies failed');
    throw error;
  }

  /**
   * Get available strategies for error type
   */
  getAvailableStrategies(error: Error, context: ErrorContext): RecoveryStrategy[] {
    return this.strategies.filter(strategy => strategy.condition(error, context));
  }

  /**
   * Update fallback data
   */
  updateFallbackData(type: keyof FallbackData, data: any): void {
    this.fallbackData[type] = data;
  }
}

// Singleton instance
export const recoveryManager = new ErrorRecoveryManager();

/**
 * High-order component for automatic error recovery
 */
export function withErrorRecovery<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  medicalContent = false,
  specialty?: string
) {
  return React.forwardRef<any, P>((props, ref) => {
    const [error, setError] = React.useState<Error | null>(null);
    const [recoveryData, setRecoveryData] = React.useState<any>(null);
    const [isRecovering, setIsRecovering] = React.useState(false);

    const handleError = React.useCallback(async (error: Error, action: string) => {
      const context: ErrorContext = {
        component: WrappedComponent.displayName || 'Component',
        action,
        medicalContent,
        specialty,
        timestamp: Date.now(),
        sessionId: `session_${Date.now()}`,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      setIsRecovering(true);
      
      try {
        const recoveredData = await recoveryManager.attemptRecovery(error, context);
        setRecoveryData(recoveredData);
        setError(null);
      } catch (recoveryError) {
        setError(error);
      } finally {
        setIsRecovering(false);
      }
    }, [medicalContent, specialty]);

    const enhancedProps = {
      ...props,
      onError: handleError,
      recoveryData,
      isRecovering,
      hasRecoveredData: !!recoveryData
    } as any;

    if (error && !recoveryData) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">
            {medicalContent 
              ? 'Medical content temporarily unavailable. Please consult primary sources.'
              : 'Content temporarily unavailable. Please try again.'}
          </p>
        </div>
      );
    }

    return <WrappedComponent ref={ref} {...enhancedProps} />;
  });
}

/**
 * Resilient API hook with automatic recovery
 */
export function useResilientApi<T>(
  url: string,
  options: RequestInit = {},
  medicalContent = false,
  specialty?: string
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [fromCache, setFromCache] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const context: ErrorContext = {
      component: 'useResilientApi',
      action: 'api_fetch',
      medicalContent,
      specialty,
      timestamp: Date.now(),
      sessionId: `session_${Date.now()}`,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    try {
      const response = await errorHandler.withRetry(
        () => fetch(url, options),
        context
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setFromCache(false);
    } catch (fetchError) {
      try {
        // Attempt recovery
        const recoveredData = await recoveryManager.attemptRecovery(fetchError as Error, context);
        setData(recoveredData);
        setFromCache(true);
      } catch (recoveryError) {
        setError(fetchError as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [url, options, medicalContent, specialty]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fromCache,
    refetch: fetchData
  };
}

/**
 * Offline queue for medical actions
 */
export class OfflineActionQueue {
  private queue: Array<{
    id: string;
    action: string;
    data: any;
    timestamp: number;
    medicalContent: boolean;
    specialty?: string;
  }> = [];

  /**
   * Queue action for later execution
   */
  enqueue(action: string, data: any, medicalContent = false, specialty?: string): string {
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    this.queue.push({
      id,
      action,
      data,
      timestamp: Date.now(),
      medicalContent,
      specialty
    });

    this.saveToStorage();
    
    // Register for background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('medimind-offline-sync');
      });
    }

    return id;
  }

  /**
   * Process queued actions when online
   */
  async processQueue(): Promise<void> {
    if (!navigator.onLine) return;

    const actionsToProcess = [...this.queue];
    this.queue = [];

    for (const queuedAction of actionsToProcess) {
      try {
        await this.executeAction(queuedAction);
        console.log('[OfflineQueue] Successfully processed action:', queuedAction.action);
      } catch (error) {
        console.error('[OfflineQueue] Failed to process action:', queuedAction.action, error);
        
        // Re-queue if not too old (max 1 hour)
        if (Date.now() - queuedAction.timestamp < 60 * 60 * 1000) {
          this.queue.push(queuedAction);
        }
      }
    }

    this.saveToStorage();
  }

  /**
   * Execute a queued action
   */
  private async executeAction(action: any): Promise<void> {
    // Map action types to actual API calls
    switch (action.action) {
      case 'save_article':
        await fetch('/api/saved-articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
        
      case 'track_interaction':
        await fetch('/api/analytics/interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
        
      case 'submit_feedback':
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
        
      default:
        console.warn('[OfflineQueue] Unknown action type:', action.action);
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('medimind_offline_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.warn('[OfflineQueue] Failed to save to storage:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('medimind_offline_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[OfflineQueue] Failed to load from storage:', error);
      this.queue = [];
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      medicalActions: this.queue.filter(a => a.medicalContent).length,
      oldestAction: this.queue.length > 0 ? new Date(Math.min(...this.queue.map(a => a.timestamp))) : null
    };
  }
}

// Singleton instance
export const offlineQueue = new OfflineActionQueue();

/**
 * Setup default recovery strategies
 */
function setupDefaultRecoveryStrategies() {
  // Medical news API recovery
  errorHandler.registerRecoveryStrategy('medical_news_api', async () => {
    const cachedNews = await cacheManager.get('medical_news_fallback');
    if (cachedNews) return cachedNews;
    
    return recoveryManager.fallbackData.medicalNews;
  });

  // Search API recovery
  errorHandler.registerRecoveryStrategy('search_api', async () => {
    const cachedSearch = await cacheManager.get('search_results_fallback');
    if (cachedSearch) return cachedSearch;
    
    return recoveryManager.fallbackData.searchResults;
  });

  // Calculator recovery
  errorHandler.registerRecoveryStrategy('calculator_api', async () => {
    // For calculators, we cannot provide fallback calculations for safety
    // Instead, provide clear guidance
    return {
      available: false,
      error: 'calculator_unavailable',
      message: 'Medical calculators are temporarily unavailable due to technical issues.',
      guidance: 'Please use alternative calculation methods and verify all results with primary medical sources.',
      medicalSafety: true
    };
  });
}

/**
 * React hook for resilient data fetching with recovery
 */
export function useResilientFetch<T>(
  url: string,
  options: RequestInit = {},
  medicalContent = false,
  specialty?: string
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [isRecovered, setIsRecovered] = React.useState(false);
  const [recoveryMethod, setRecoveryMethod] = React.useState<string | null>(null);

  const fetchWithRecovery = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsRecovered(false);

    const context: ErrorContext = {
      component: 'useResilientFetch',
      action: 'fetch_data',
      medicalContent,
      specialty,
      timestamp: Date.now(),
      sessionId: `session_${Date.now()}`,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (fetchError) {
      try {
        console.log('[ResilientFetch] Primary fetch failed, attempting recovery');
        const recoveredData = await recoveryManager.attemptRecovery(fetchError as Error, context);
        
        setData(recoveredData);
        setIsRecovered(true);
        setRecoveryMethod('cache_fallback');
      } catch (recoveryError) {
        console.error('[ResilientFetch] Recovery failed:', recoveryError);
        setError(fetchError as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [url, options, medicalContent, specialty]);

  React.useEffect(() => {
    fetchWithRecovery();
  }, [fetchWithRecovery]);

  return {
    data,
    loading,
    error,
    isRecovered,
    recoveryMethod,
    refetch: fetchWithRecovery
  };
}

/**
 * Component wrapper for resilient rendering
 */
export function ResilientComponent<T>({
  children,
  fallback,
  data,
  error,
  isRecovered,
  medicalContent = false
}: {
  children: (data: T) => React.ReactNode;
  fallback?: React.ReactNode;
  data: T | null;
  error: Error | null;
  isRecovered?: boolean;
  medicalContent?: boolean;
}) {
  if (error && !data) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className={`p-4 border rounded ${medicalContent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center space-x-2 mb-2">
          <svg className={`w-5 h-5 ${medicalContent ? 'text-red-500' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className={`font-medium ${medicalContent ? 'text-red-800' : 'text-gray-800'}`}>
            {medicalContent ? 'Medical Content Unavailable' : 'Content Unavailable'}
          </h3>
        </div>
        <p className={`text-sm ${medicalContent ? 'text-red-700' : 'text-gray-600'}`}>
          {medicalContent 
            ? 'Medical content is temporarily unavailable. Please verify information with primary medical sources.'
            : 'This content is temporarily unavailable. Please try again later.'}
        </p>
      </div>
    );
  }

  if (data) {
    return (
      <>
        {isRecovered && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ This content was recovered from cache and may be outdated.
          </div>
        )}
        {children(data)}
      </>
    );
  }

  return null;
}

// Initialize recovery strategies
setupDefaultRecoveryStrategies();

// Load offline queue on startup
if (typeof window !== 'undefined') {
  offlineQueue.loadFromStorage();
  
  // Process queue when coming online
  window.addEventListener('online', () => {
    console.log('[Recovery] Connection restored, processing offline queue');
    offlineQueue.processQueue();
  });
}