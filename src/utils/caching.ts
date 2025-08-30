/**
 * Advanced Caching System for MediMind Expert Medical News
 * Implements intelligent caching with medical content considerations
 */

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size in MB
  compressionEnabled: boolean;
  medicalContentPriority: boolean;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  contentType: 'medical_news' | 'search_results' | 'user_data' | 'media' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  accessCount: number;
  lastAccessed: number;
  compressed?: boolean;
  medicalSpecialty?: string;
  evidenceLevel?: string;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalSize: number;
  entryCount: number;
  evictionCount: number;
  medicalContentCached: number;
  lastCleanup: number;
}

class AdvancedCacheManager {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hitRate: 0,
    missRate: 0,
    totalSize: 0,
    entryCount: 0,
    evictionCount: 0,
    medicalContentCached: 0,
    lastCleanup: Date.now()
  };
  
  private readonly defaultConfig: CacheConfig = {
    ttl: 15 * 60 * 1000, // 15 minutes for medical news
    maxSize: 50, // 50MB cache limit
    compressionEnabled: true,
    medicalContentPriority: true
  };

  // Medical content cache configurations
  private readonly cacheConfigs: Record<string, Partial<CacheConfig>> = {
    medical_news: { ttl: 15 * 60 * 1000, medicalContentPriority: true },
    search_results: { ttl: 10 * 60 * 1000, medicalContentPriority: true },
    user_data: { ttl: 30 * 60 * 1000, medicalContentPriority: false },
    media: { ttl: 60 * 60 * 1000, compressionEnabled: false },
    other: { ttl: 5 * 60 * 1000, medicalContentPriority: false }
  };

  /**
   * Generate cache key with medical context
   */
  private generateKey(
    baseKey: string, 
    params?: Record<string, any>,
    userSpecialty?: string
  ): string {
    const paramStr = params ? JSON.stringify(params) : '';
    const specialtyStr = userSpecialty ? `_${userSpecialty}` : '';
    return `${baseKey}${specialtyStr}_${this.hashString(paramStr)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Compress data for storage efficiency
   */
  private async compressData(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      
      // Use TextEncoder/TextDecoder for better compression
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const uint8Array = encoder.encode(jsonString);
      
      // Simple compression using gzip-like algorithm
      // In production, use proper compression library
      return btoa(String.fromCharCode(...uint8Array));
    } catch {
      return JSON.stringify(data);
    }
  }

  /**
   * Decompress cached data
   */
  private async decompressData(compressedData: string): Promise<any> {
    try {
      const binaryString = atob(compressedData);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(bytes);
      return JSON.parse(jsonString);
    } catch {
      return JSON.parse(compressedData);
    }
  }

  /**
   * Calculate cache entry size in bytes
   */
  private calculateSize(entry: CacheEntry): number {
    const dataSize = new Blob([JSON.stringify(entry.data)]).size;
    const metadataSize = new Blob([JSON.stringify({
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt,
      contentType: entry.contentType,
      priority: entry.priority,
      accessCount: entry.accessCount,
      lastAccessed: entry.lastAccessed
    })]).size;
    
    return dataSize + metadataSize;
  }

  /**
   * Medical content priority scoring
   */
  private getMedicalPriorityScore(entry: CacheEntry): number {
    let score = 0;
    
    // Content type priority
    if (entry.contentType === 'medical_news') score += 10;
    if (entry.contentType === 'search_results') score += 8;
    
    // Evidence level priority
    if (entry.evidenceLevel === 'systematic_review') score += 5;
    if (entry.evidenceLevel === 'rct') score += 4;
    if (entry.evidenceLevel === 'cohort_study') score += 3;
    
    // Access frequency
    score += Math.min(entry.accessCount / 10, 5);
    
    // Recency bonus
    const hoursSinceAccess = (Date.now() - entry.lastAccessed) / (1000 * 60 * 60);
    score += Math.max(5 - hoursSinceAccess, 0);
    
    return score;
  }

  /**
   * Intelligent cache eviction with medical priority
   */
  private evictEntries(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries first
    let evicted = 0;
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        evicted++;
      }
    }
    
    // If still over limit, use LRU with medical priority
    if (this.stats.totalSize > this.defaultConfig.maxSize * 1024 * 1024) {
      const remainingEntries = Array.from(this.cache.entries());
      
      // Sort by priority score (lower = evict first)
      remainingEntries.sort(([, a], [, b]) => {
        const priorityA = this.getMedicalPriorityScore(a);
        const priorityB = this.getMedicalPriorityScore(b);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // If same priority, use LRU
        return a.lastAccessed - b.lastAccessed;
      });
      
      // Evict lowest priority entries
      const targetSize = this.defaultConfig.maxSize * 0.8 * 1024 * 1024; // 80% of max
      let currentSize = this.stats.totalSize;
      
      for (const [key, entry] of remainingEntries) {
        if (currentSize <= targetSize) break;
        
        currentSize -= this.calculateSize(entry);
        this.cache.delete(key);
        evicted++;
      }
    }
    
    this.stats.evictionCount += evicted;
    this.updateStats();
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    let totalSize = 0;
    let medicalContentCount = 0;
    
    for (const entry of this.cache.values()) {
      totalSize += this.calculateSize(entry);
      if (entry.contentType === 'medical_news' || entry.contentType === 'search_results') {
        medicalContentCount++;
      }
    }
    
    this.stats.totalSize = totalSize;
    this.stats.entryCount = this.cache.size;
    this.stats.medicalContentCached = medicalContentCount;
  }

  /**
   * Store data in cache with medical context
   */
  async set<T>(
    key: string,
    data: T,
    options: {
      contentType?: CacheEntry['contentType'];
      priority?: CacheEntry['priority'];
      ttl?: number;
      medicalSpecialty?: string;
      evidenceLevel?: string;
      userSpecialty?: string;
      params?: Record<string, any>;
    } = {}
  ): Promise<void> {
    const config = { ...this.defaultConfig, ...this.cacheConfigs[options.contentType || 'other'] };
    const cacheKey = this.generateKey(key, options.params, options.userSpecialty);
    const now = Date.now();
    
    let processedData = data;
    let compressed = false;
    
    // Compress if enabled and data is large
    if (config.compressionEnabled && JSON.stringify(data).length > 1024) {
      processedData = await this.compressData(data) as T;
      compressed = true;
    }
    
    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: now,
      expiresAt: now + (options.ttl || config.ttl),
      contentType: options.contentType || 'other',
      priority: options.priority || 'medium',
      accessCount: 0,
      lastAccessed: now,
      compressed,
      medicalSpecialty: options.medicalSpecialty,
      evidenceLevel: options.evidenceLevel
    };
    
    this.cache.set(cacheKey, entry);
    
    // Trigger eviction if needed
    this.updateStats();
    if (this.stats.totalSize > this.defaultConfig.maxSize * 1024 * 1024) {
      this.evictEntries();
    }
  }

  /**
   * Retrieve data from cache
   */
  async get<T>(
    key: string,
    options: {
      userSpecialty?: string;
      params?: Record<string, any>;
    } = {}
  ): Promise<T | null> {
    const cacheKey = this.generateKey(key, options.params, options.userSpecialty);
    const entry = this.cache.get(cacheKey) as CacheEntry<T> | undefined;
    
    if (!entry) {
      this.stats.missRate++;
      return null;
    }
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      this.stats.missRate++;
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hitRate++;
    
    // Decompress if needed
    if (entry.compressed) {
      return await this.decompressData(entry.data as any);
    }
    
    return entry.data;
  }

  /**
   * Check if key exists and is valid
   */
  has(
    key: string,
    options: {
      userSpecialty?: string;
      params?: Record<string, any>;
    } = {}
  ): boolean {
    const cacheKey = this.generateKey(key, options.params, options.userSpecialty);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      return false;
    }
    
    return true;
  }

  /**
   * Remove specific cache entry
   */
  delete(
    key: string,
    options: {
      userSpecialty?: string;
      params?: Record<string, any>;
    } = {}
  ): boolean {
    const cacheKey = this.generateKey(key, options.params, options.userSpecialty);
    const deleted = this.cache.delete(cacheKey);
    if (deleted) this.updateStats();
    return deleted;
  }

  /**
   * Clear cache with optional filtering
   */
  clear(filter?: {
    contentType?: CacheEntry['contentType'];
    medicalSpecialty?: string;
    olderThan?: number;
  }): number {
    let cleared = 0;
    
    if (!filter) {
      cleared = this.cache.size;
      this.cache.clear();
    } else {
      const entries = Array.from(this.cache.entries());
      const now = Date.now();
      
      for (const [key, entry] of entries) {
        let shouldClear = true;
        
        if (filter.contentType && entry.contentType !== filter.contentType) {
          shouldClear = false;
        }
        
        if (filter.medicalSpecialty && entry.medicalSpecialty !== filter.medicalSpecialty) {
          shouldClear = false;
        }
        
        if (filter.olderThan && (now - entry.timestamp) < filter.olderThan) {
          shouldClear = false;
        }
        
        if (shouldClear) {
          this.cache.delete(key);
          cleared++;
        }
      }
    }
    
    this.updateStats();
    return cleared;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    
    const totalRequests = this.stats.hitRate + this.stats.missRate;
    return {
      ...this.stats,
      hitRate: totalRequests > 0 ? this.stats.hitRate / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.missRate / totalRequests : 0
    };
  }

  /**
   * Preload critical medical content
   */
  async preloadMedicalContent(specialty: string): Promise<void> {
    const criticalEndpoints = [
      '/api/medical-news',
      '/api/medical-news/trending',
      '/api/medical-news/categories'
    ];
    
    // Preload in background
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(`${endpoint}?specialty=${specialty}&limit=12`);
        if (response.ok) {
          const data = await response.json();
          await this.set(`preload_${endpoint}`, data, {
            contentType: 'medical_news',
            priority: 'critical',
            medicalSpecialty: specialty,
            ttl: 10 * 60 * 1000 // 10 minutes for preloaded content
          });
        }
      } catch (error) {

      }
    }
  }

  /**
   * Cleanup expired entries (run periodically)
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    this.stats.lastCleanup = now;
    this.updateStats();
    
    if (cleaned > 0) {

    }
  }
}

// Create singleton instance
export const cacheManager = new AdvancedCacheManager();

// Initialize periodic cleanup
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

/**
 * Higher-level caching utilities for medical news
 */
export class MedicalNewsCache {
  /**
   * Cache medical news API responses
   */
  static async cacheNewsResponse(
    endpoint: string,
    params: Record<string, any>,
    data: any,
    userSpecialty?: string
  ): Promise<void> {
    await cacheManager.set(
      `news_${endpoint}`,
      data,
      {
        contentType: 'medical_news',
        priority: 'high',
        medicalSpecialty: userSpecialty,
        params,
        userSpecialty,
        ttl: 15 * 60 * 1000 // 15 minutes
      }
    );
  }

  /**
   * Retrieve cached medical news
   */
  static async getCachedNews(
    endpoint: string,
    params: Record<string, any>,
    userSpecialty?: string
  ): Promise<any | null> {
    return await cacheManager.get(
      `news_${endpoint}`,
      { params, userSpecialty }
    );
  }

  /**
   * Cache search results with medical context
   */
  static async cacheSearchResults(
    query: string,
    filters: Record<string, any>,
    results: any,
    userSpecialty?: string
  ): Promise<void> {
    await cacheManager.set(
      `search_${query}`,
      results,
      {
        contentType: 'search_results',
        priority: 'high',
        medicalSpecialty: userSpecialty,
        params: filters,
        userSpecialty,
        ttl: 10 * 60 * 1000 // 10 minutes
      }
    );
  }

  /**
   * Get cached search results
   */
  static async getCachedSearchResults(
    query: string,
    filters: Record<string, any>,
    userSpecialty?: string
  ): Promise<any | null> {
    return await cacheManager.get(
      `search_${query}`,
      { params: filters, userSpecialty }
    );
  }

  /**
   * Preload user's specialty content
   */
  static async preloadUserContent(userSpecialty: string): Promise<void> {
    await cacheManager.preloadMedicalContent(userSpecialty);
  }

  /**
   * Clear medical content cache
   */
  static clearMedicalCache(specialty?: string): number {
    return cacheManager.clear({
      contentType: 'medical_news',
      medicalSpecialty: specialty
    });
  }

  /**
   * Get cache performance metrics
   */
  static getCacheMetrics(): CacheStats {
    return cacheManager.getStats();
  }
}

export default cacheManager;