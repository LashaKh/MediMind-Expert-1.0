/**
 * API Key Pool Manager
 * Provides intelligent rotation, health tracking, and circuit breaker patterns
 * for managing multiple API keys per provider
 */

import { logInfo, logError, logWarning } from './logger';

export interface APIKeyStatus {
  key: string;
  keyId: string; // First 8 chars + '...' for logging
  isHealthy: boolean;
  consecutiveFailures: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  totalUses: number;
  totalFailures: number;
  averageResponseTime: number;
  rateLimitedUntil?: number; // Timestamp when rate limit expires
  circuitBreakerUntil?: number; // Timestamp when circuit breaker expires
}

export interface APIKeyPoolConfig {
  provider: 'exa' | 'brave' | 'perplexity';
  keys: string[];
  maxConsecutiveFailures: number; // Circuit breaker threshold
  circuitBreakerCooldown: number; // Circuit breaker recovery time (ms)
  rateLimitCooldown: number; // Rate limit recovery time (ms)
  healthCheckInterval: number; // Health check frequency (ms)
}

export interface PoolUsageStats {
  provider: string;
  totalKeys: number;
  healthyKeys: number;
  activeKeys: number;
  rateLimitedKeys: number;
  circuitBreakerKeys: number;
  totalRequests: number;
  totalFailures: number;
  averageResponseTime: number;
  lastRotationTime: number;
}

class APIKeyPool {
  private config: APIKeyPoolConfig;
  private keyStatuses: Map<string, APIKeyStatus> = new Map();
  private currentKeyIndex: number = 0;
  private lastHealthCheck: number = 0;

  constructor(config: APIKeyPoolConfig) {
    this.config = config;
    this.initializeKeys();
  }

  private initializeKeys(): void {
    this.config.keys.forEach((key, index) => {
      if (!key || key.trim().length === 0) {
        logWarning(`API Key Pool: Empty key found for ${this.config.provider} at index ${index}`);
        return;
      }

      const keyId = this.generateKeyId(key);
      const status: APIKeyStatus = {
        key: key.trim(),
        keyId,
        isHealthy: true,
        consecutiveFailures: 0,
        totalUses: 0,
        totalFailures: 0,
        averageResponseTime: 0,
        lastSuccessTime: Date.now()
      };

      this.keyStatuses.set(key.trim(), status);
    });

    logInfo(`API Key Pool Initialized: ${this.config.provider}`, {
      totalKeys: this.keyStatuses.size,
      provider: this.config.provider
    });
  }

  private generateKeyId(key: string): string {
    return key.length > 8 ? `${key.substring(0, 8)}...` : `${key}...`;
  }

  /**
   * Get the next available healthy API key using round-robin with health bias
   */
  public getNextKey(): string | null {
    this.performHealthCheck();

    const healthyKeys = Array.from(this.keyStatuses.values()).filter(status => 
      this.isKeyAvailable(status)
    );

    if (healthyKeys.length === 0) {
      logError(`API Key Pool: No healthy keys available for ${this.config.provider}`, {
        provider: this.config.provider,
        totalKeys: this.keyStatuses.size,
        rateLimitedKeys: this.getRateLimitedCount(),
        circuitBreakerKeys: this.getCircuitBreakerCount()
      });
      return null;
    }

    // Use round-robin among healthy keys
    const healthyKeyList = healthyKeys.map(status => status.key);
    const selectedKey = healthyKeyList[this.currentKeyIndex % healthyKeyList.length];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % healthyKeyList.length;

    const keyStatus = this.keyStatuses.get(selectedKey);
    if (keyStatus) {
      keyStatus.totalUses++;
      logInfo(`API Key Selected: ${this.config.provider}`, {
        provider: this.config.provider,
        keyId: keyStatus.keyId,
        totalUses: keyStatus.totalUses,
        healthyKeysCount: healthyKeys.length
      });
    }

    return selectedKey;
  }

  /**
   * Report successful API call
   */
  public reportSuccess(key: string, responseTime: number): void {
    const status = this.keyStatuses.get(key);
    if (!status) return;

    status.isHealthy = true;
    status.consecutiveFailures = 0;
    status.lastSuccessTime = Date.now();
    
    // Update average response time using exponential moving average
    if (status.averageResponseTime === 0) {
      status.averageResponseTime = responseTime;
    } else {
      status.averageResponseTime = (status.averageResponseTime * 0.8) + (responseTime * 0.2);
    }

    // Clear circuit breaker if it was active
    if (status.circuitBreakerUntil) {
      delete status.circuitBreakerUntil;
      logInfo(`Circuit Breaker Cleared: ${this.config.provider}`, {
        provider: this.config.provider,
        keyId: status.keyId
      });
    }

    logInfo(`API Key Success: ${this.config.provider}`, {
      provider: this.config.provider,
      keyId: status.keyId,
      responseTime,
      averageResponseTime: Math.round(status.averageResponseTime)
    });
  }

  /**
   * Report failed API call with error categorization
   */
  public reportFailure(key: string, error: any, responseTime?: number): void {
    const status = this.keyStatuses.get(key);
    if (!status) return;

    status.consecutiveFailures++;
    status.totalFailures++;
    status.lastFailureTime = Date.now();

    if (responseTime && responseTime > 0) {
      status.averageResponseTime = (status.averageResponseTime * 0.8) + (responseTime * 0.2);
    }

    // Categorize error type
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRateLimit = this.isRateLimitError(errorMessage);
    const isAuthError = this.isAuthError(errorMessage);

    if (isRateLimit) {
      status.rateLimitedUntil = Date.now() + this.config.rateLimitCooldown;
      logWarning(`API Key Rate Limited: ${this.config.provider}`, {
        provider: this.config.provider,
        keyId: status.keyId,
        rateLimitedUntil: new Date(status.rateLimitedUntil).toISOString()
      });
    } else if (isAuthError || status.consecutiveFailures >= this.config.maxConsecutiveFailures) {
      // Activate circuit breaker
      status.circuitBreakerUntil = Date.now() + this.config.circuitBreakerCooldown;
      status.isHealthy = false;
      
      logError(`Circuit Breaker Activated: ${this.config.provider}`, {
        provider: this.config.provider,
        keyId: status.keyId,
        consecutiveFailures: status.consecutiveFailures,
        circuitBreakerUntil: new Date(status.circuitBreakerUntil).toISOString(),
        errorType: isAuthError ? 'authentication' : 'consecutive_failures'
      });
    }

    logError(`API Key Failure: ${this.config.provider}`, {
      provider: this.config.provider,
      keyId: status.keyId,
      consecutiveFailures: status.consecutiveFailures,
      errorType: isRateLimit ? 'rate_limit' : isAuthError ? 'authentication' : 'unknown',
      error: errorMessage.substring(0, 200)
    });
  }

  /**
   * Check if a key is currently available for use
   */
  private isKeyAvailable(status: APIKeyStatus): boolean {
    const now = Date.now();

    // Check if rate limited
    if (status.rateLimitedUntil && now < status.rateLimitedUntil) {
      return false;
    }

    // Check if circuit breaker is active
    if (status.circuitBreakerUntil && now < status.circuitBreakerUntil) {
      return false;
    }

    return status.isHealthy;
  }

  /**
   * Perform periodic health checks and recovery
   */
  private performHealthCheck(): void {
    const now = Date.now();
    
    if (now - this.lastHealthCheck < this.config.healthCheckInterval) {
      return;
    }

    this.lastHealthCheck = now;
    let recoveredKeys = 0;

    this.keyStatuses.forEach((status, key) => {
      // Recover from rate limiting
      if (status.rateLimitedUntil && now >= status.rateLimitedUntil) {
        delete status.rateLimitedUntil;
        recoveredKeys++;
        logInfo(`Rate Limit Recovered: ${this.config.provider}`, {
          provider: this.config.provider,
          keyId: status.keyId
        });
      }

      // Recover from circuit breaker
      if (status.circuitBreakerUntil && now >= status.circuitBreakerUntil) {
        delete status.circuitBreakerUntil;
        status.isHealthy = true;
        status.consecutiveFailures = Math.floor(status.consecutiveFailures / 2); // Reduce failure count
        recoveredKeys++;
        logInfo(`Circuit Breaker Recovered: ${this.config.provider}`, {
          provider: this.config.provider,
          keyId: status.keyId,
          consecutiveFailures: status.consecutiveFailures
        });
      }
    });

    if (recoveredKeys > 0) {
      logInfo(`Health Check Recovery: ${this.config.provider}`, {
        provider: this.config.provider,
        recoveredKeys,
        totalHealthyKeys: this.getHealthyCount()
      });
    }
  }

  /**
   * Get comprehensive usage statistics
   */
  public getUsageStats(): PoolUsageStats {
    const stats: PoolUsageStats = {
      provider: this.config.provider,
      totalKeys: this.keyStatuses.size,
      healthyKeys: this.getHealthyCount(),
      activeKeys: this.getAvailableCount(),
      rateLimitedKeys: this.getRateLimitedCount(),
      circuitBreakerKeys: this.getCircuitBreakerCount(),
      totalRequests: 0,
      totalFailures: 0,
      averageResponseTime: 0,
      lastRotationTime: this.lastHealthCheck
    };

    let totalResponseTime = 0;
    let responsiveKeys = 0;

    this.keyStatuses.forEach(status => {
      stats.totalRequests += status.totalUses;
      stats.totalFailures += status.totalFailures;
      
      if (status.averageResponseTime > 0) {
        totalResponseTime += status.averageResponseTime;
        responsiveKeys++;
      }
    });

    stats.averageResponseTime = responsiveKeys > 0 ? totalResponseTime / responsiveKeys : 0;

    return stats;
  }

  /**
   * Get detailed key statuses for monitoring
   */
  public getKeyStatuses(): APIKeyStatus[] {
    return Array.from(this.keyStatuses.values()).map(status => ({
      ...status,
      key: status.keyId // Return keyId instead of actual key for security
    }));
  }

  // Helper methods for counting key states
  private getHealthyCount(): number {
    return Array.from(this.keyStatuses.values()).filter(s => s.isHealthy).length;
  }

  private getAvailableCount(): number {
    return Array.from(this.keyStatuses.values()).filter(s => this.isKeyAvailable(s)).length;
  }

  private getRateLimitedCount(): number {
    const now = Date.now();
    return Array.from(this.keyStatuses.values()).filter(s => 
      s.rateLimitedUntil && now < s.rateLimitedUntil
    ).length;
  }

  private getCircuitBreakerCount(): number {
    const now = Date.now();
    return Array.from(this.keyStatuses.values()).filter(s => 
      s.circuitBreakerUntil && now < s.circuitBreakerUntil
    ).length;
  }

  // Error categorization helpers
  private isRateLimitError(errorMessage: string): boolean {
    const rateLimitPatterns = [
      'rate limit',
      'too many requests',
      '429',
      'quota exceeded',
      'limit exceeded'
    ];
    
    return rateLimitPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private isAuthError(errorMessage: string): boolean {
    const authPatterns = [
      'unauthorized',
      'invalid api key',
      'authentication failed', 
      '401',
      '403',
      'forbidden',
      'invalid token'
    ];
    
    return authPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }
}

// Global pool instances
const pools = new Map<string, APIKeyPool>();

/**
 * Initialize or get an API key pool for a provider
 */
export function getAPIKeyPool(config: APIKeyPoolConfig): APIKeyPool {
  if (!pools.has(config.provider)) {
    pools.set(config.provider, new APIKeyPool(config));
  }
  return pools.get(config.provider)!;
}

/**
 * Get usage statistics for all pools
 */
export function getAllPoolStats(): PoolUsageStats[] {
  return Array.from(pools.values()).map(pool => pool.getUsageStats());
}

/**
 * Reset all pools (useful for testing or configuration changes)
 */
export function resetAllPools(): void {
  pools.clear();
  logInfo('All API Key Pools Reset');
}

/**
 * Default pool configurations
 */
export const DEFAULT_POOL_CONFIGS = {
  exa: {
    maxConsecutiveFailures: 3,
    circuitBreakerCooldown: 5 * 60 * 1000, // 5 minutes
    rateLimitCooldown: 1 * 60 * 1000, // 1 minute  
    healthCheckInterval: 30 * 1000 // 30 seconds
  },
  brave: {
    maxConsecutiveFailures: 3,
    circuitBreakerCooldown: 5 * 60 * 1000, // 5 minutes
    rateLimitCooldown: 1 * 60 * 1000, // 1 minute
    healthCheckInterval: 30 * 1000 // 30 seconds
  },
  perplexity: {
    maxConsecutiveFailures: 2, // More sensitive for Perplexity
    circuitBreakerCooldown: 10 * 60 * 1000, // 10 minutes
    rateLimitCooldown: 2 * 60 * 1000, // 2 minutes
    healthCheckInterval: 45 * 1000 // 45 seconds
  }
} as const;