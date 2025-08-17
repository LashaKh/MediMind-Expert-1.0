/**
 * Persistent Token Storage Service
 * Addresses MED-003: In-Memory Token Storage Limitations
 * 
 * Provides persistent storage for JWT blacklists and CSRF tokens using Supabase
 * Replaces in-memory Maps with database storage for serverless function persistence
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { ENV_VARS } from './constants';
import { logger, LogSensitivity } from './logger';

// ===============================================================================
// Types and Interfaces
// ===============================================================================

export interface TokenBlacklistEntry {
  jti: string;
  user_id?: string;
  token_hash: string;
  revoked_at: string;
  expires_at: string;
  revocation_reason?: string;
  client_info?: any;
}

export interface CsrfTokenEntry {
  token_hash: string;
  user_id?: string;
  session_id?: string;
  expires_at: string;
  created_at: string;
  last_used_at?: string;
  use_count: number;
  max_uses: number;
  client_info?: any;
}

export interface TokenStorageStats {
  jwt_blacklist: {
    total_blacklisted: number;
    expired_tokens: number;
    active_revocations: number;
    oldest_revocation?: string;
    newest_revocation?: string;
    users_with_revoked_tokens: number;
  };
  csrf_tokens: {
    total_csrf_tokens: number;
    expired_tokens: number;
    active_tokens: number;
    used_tokens: number;
    unused_tokens: number;
    average_uses: number;
    users_with_csrf_tokens: number;
  };
  cleanup_needed: number;
  last_updated: string;
}

export interface ClientInfo {
  ip?: string;
  userAgent?: string;
  origin?: string;
  method?: string;
  path?: string;
}

// ===============================================================================
// Persistent Token Storage Class
// ===============================================================================

class PersistentTokenStorage {
  private supabase: SupabaseClient;
  private isInitialized: boolean = false;
  private initializationError: Error | null = null;

  constructor() {
    // Initialize Supabase client with service role key for admin operations
    try {
      if (!ENV_VARS.SUPABASE_URL || !ENV_VARS.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing required Supabase configuration for persistent token storage');
      }

      this.supabase = createClient(
        ENV_VARS.SUPABASE_URL,
        ENV_VARS.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      this.isInitialized = true;
      logger.info('Persistent token storage initialized successfully', {
        hasSupabaseUrl: !!ENV_VARS.SUPABASE_URL,
        hasServiceKey: !!ENV_VARS.SUPABASE_SERVICE_ROLE_KEY
      }, LogSensitivity.INTERNAL);

    } catch (error) {
      this.initializationError = error instanceof Error ? error : new Error('Unknown initialization error');
      logger.error('Failed to initialize persistent token storage', this.initializationError, LogSensitivity.SENSITIVE);
    }
  }

  /**
   * Check if the storage service is properly initialized
   */
  public isReady(): boolean {
    return this.isInitialized && !this.initializationError;
  }

  /**
   * Get initialization error if any
   */
  public getInitializationError(): Error | null {
    return this.initializationError;
  }

  /**
   * Create SHA-256 hash of a token for secure storage
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // ===============================================================================
  // JWT Token Blacklist Operations
  // ===============================================================================

  /**
   * Add JWT token to blacklist
   */
  async addToBlacklist(
    jti: string,
    token: string,
    expiresAt: Date,
    userId?: string,
    reason: string = 'manual_revocation',
    clientInfo?: ClientInfo
  ): Promise<boolean> {
    if (!this.isReady()) {
      logger.error('Token storage not initialized', this.initializationError, LogSensitivity.SENSITIVE);
      return false;
    }

    try {
      const tokenHash = this.hashToken(token);
      
      const { error } = await this.supabase
        .from('token_blacklist')
        .insert({
          jti,
          user_id: userId,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString(),
          revocation_reason: reason,
          client_info: clientInfo
        });

      if (error) {
        logger.error('Failed to add token to blacklist', {
          jti,
          userId,
          reason,
          error: error.message
        }, LogSensitivity.SENSITIVE);
        return false;
      }

      logger.info('Token added to blacklist successfully', {
        jti,
        userId,
        reason,
        expiresAt: expiresAt.toISOString()
      }, LogSensitivity.SENSITIVE);

      return true;
    } catch (error) {
      logger.error('Exception adding token to blacklist', error, LogSensitivity.SENSITIVE);
      return false;
    }
  }

  /**
   * Check if JWT token is blacklisted
   */
  async isTokenBlacklisted(jti: string, token?: string): Promise<boolean> {
    if (!this.isReady()) {
      logger.warn('Token storage not initialized, cannot verify blacklist status', LogSensitivity.SENSITIVE);
      return false; // Fail open for availability, but log the issue
    }

    try {
      const query = this.supabase
        .from('token_blacklist')
        .select('jti, expires_at, token_hash')
        .eq('jti', jti)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      const { data, error } = await query;

      if (error) {
        logger.error('Error checking token blacklist', {
          jti,
          error: error.message
        }, LogSensitivity.SENSITIVE);
        return false; // Fail open on database errors
      }

      if (!data || data.length === 0) {
        return false; // Token not blacklisted
      }

      // If token is provided, verify hash for additional security
      if (token) {
        const tokenHash = this.hashToken(token);
        const isHashMatch = data[0].token_hash === tokenHash;
        
        if (!isHashMatch) {
          logger.warn('Token hash mismatch in blacklist check', {
            jti,
            hasToken: !!token
          }, LogSensitivity.SENSITIVE);
        }
        
        return isHashMatch;
      }

      return true; // Token is blacklisted
    } catch (error) {
      logger.error('Exception checking token blacklist', error, LogSensitivity.SENSITIVE);
      return false; // Fail open on exceptions
    }
  }

  /**
   * Clean up expired blacklisted tokens
   */
  async cleanupExpiredBlacklistedTokens(): Promise<number> {
    if (!this.isReady()) {
      return 0;
    }

    try {
      const { count, error } = await this.supabase
        .from('token_blacklist')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        logger.error('Error cleaning up expired blacklisted tokens', error, LogSensitivity.INTERNAL);
        return 0;
      }

      if (count && count > 0) {
        logger.info('Cleaned up expired blacklisted tokens', { count }, LogSensitivity.INTERNAL);
      }

      return count || 0;
    } catch (error) {
      logger.error('Exception cleaning up expired blacklisted tokens', error, LogSensitivity.INTERNAL);
      return 0;
    }
  }

  // ===============================================================================
  // CSRF Token Operations
  // ===============================================================================

  /**
   * Store CSRF token
   */
  async storeCsrfToken(
    token: string,
    expiresAt: Date,
    userId?: string,
    sessionId?: string,
    maxUses: number = 1,
    clientInfo?: ClientInfo
  ): Promise<boolean> {
    if (!this.isReady()) {
      logger.error('Token storage not initialized', this.initializationError, LogSensitivity.SENSITIVE);
      return false;
    }

    try {
      const tokenHash = this.hashToken(token);

      const { error } = await this.supabase
        .from('csrf_tokens')
        .insert({
          token_hash: tokenHash,
          user_id: userId,
          session_id: sessionId,
          expires_at: expiresAt.toISOString(),
          max_uses: maxUses,
          client_info: clientInfo
        });

      if (error) {
        logger.error('Failed to store CSRF token', {
          userId,
          sessionId,
          maxUses,
          error: error.message
        }, LogSensitivity.SENSITIVE);
        return false;
      }

      logger.debug('CSRF token stored successfully', {
        userId,
        sessionId,
        expiresAt: expiresAt.toISOString(),
        maxUses
      }, LogSensitivity.SENSITIVE);

      return true;
    } catch (error) {
      logger.error('Exception storing CSRF token', error, LogSensitivity.SENSITIVE);
      return false;
    }
  }

  /**
   * Validate CSRF token and optionally mark as used
   */
  async validateCsrfToken(
    token: string,
    userId?: string,
    markAsUsed: boolean = true
  ): Promise<boolean> {
    if (!this.isReady()) {
      logger.warn('Token storage not initialized, cannot validate CSRF token', LogSensitivity.SENSITIVE);
      return false;
    }

    try {
      const tokenHash = this.hashToken(token);
      
      // Find the token
      let query = this.supabase
        .from('csrf_tokens')
        .select('id, user_id, expires_at, use_count, max_uses')
        .eq('token_hash', tokenHash)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      // Optionally filter by user
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error validating CSRF token', {
          userId,
          error: error.message
        }, LogSensitivity.SENSITIVE);
        return false;
      }

      if (!data || data.length === 0) {
        logger.debug('CSRF token not found or expired', { userId }, LogSensitivity.SENSITIVE);
        return false;
      }

      const csrfToken = data[0];

      // Check if token has remaining uses
      if (csrfToken.use_count >= csrfToken.max_uses) {
        logger.debug('CSRF token exceeded max uses', {
          userId,
          useCount: csrfToken.use_count,
          maxUses: csrfToken.max_uses
        }, LogSensitivity.SENSITIVE);
        return false;
      }

      // Mark as used if requested
      if (markAsUsed) {
        const { error: updateError } = await this.supabase
          .from('csrf_tokens')
          .update({
            use_count: csrfToken.use_count + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('id', csrfToken.id);

        if (updateError) {
          logger.error('Error updating CSRF token usage', updateError, LogSensitivity.SENSITIVE);
          return false;
        }
      }

      logger.debug('CSRF token validated successfully', {
        userId,
        useCount: csrfToken.use_count + (markAsUsed ? 1 : 0),
        maxUses: csrfToken.max_uses
      }, LogSensitivity.SENSITIVE);

      return true;
    } catch (error) {
      logger.error('Exception validating CSRF token', error, LogSensitivity.SENSITIVE);
      return false;
    }
  }

  /**
   * Remove CSRF token (revoke)
   */
  async removeCsrfToken(token: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const tokenHash = this.hashToken(token);

      const { error } = await this.supabase
        .from('csrf_tokens')
        .delete()
        .eq('token_hash', tokenHash);

      if (error) {
        logger.error('Error removing CSRF token', error, LogSensitivity.SENSITIVE);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Exception removing CSRF token', error, LogSensitivity.SENSITIVE);
      return false;
    }
  }

  /**
   * Clean up expired CSRF tokens
   */
  async cleanupExpiredCsrfTokens(): Promise<number> {
    if (!this.isReady()) {
      return 0;
    }

    try {
      const { count, error } = await this.supabase
        .from('csrf_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        logger.error('Error cleaning up expired CSRF tokens', error, LogSensitivity.INTERNAL);
        return 0;
      }

      if (count && count > 0) {
        logger.info('Cleaned up expired CSRF tokens', { count }, LogSensitivity.INTERNAL);
      }

      return count || 0;
    } catch (error) {
      logger.error('Exception cleaning up expired CSRF tokens', error, LogSensitivity.INTERNAL);
      return 0;
    }
  }

  // ===============================================================================
  // Monitoring and Statistics
  // ===============================================================================

  /**
   * Get comprehensive token storage statistics
   */
  async getTokenStorageStats(): Promise<TokenStorageStats | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const { data, error } = await this.supabase.rpc('get_token_storage_stats');

      if (error) {
        logger.error('Error fetching token storage stats', error, LogSensitivity.INTERNAL);
        return null;
      }

      return data as TokenStorageStats;
    } catch (error) {
      logger.error('Exception fetching token storage stats', error, LogSensitivity.INTERNAL);
      return null;
    }
  }

  /**
   * Perform comprehensive cleanup of expired tokens
   */
  async performCleanup(): Promise<{ jwtTokens: number; csrfTokens: number; total: number }> {
    const jwtTokens = await this.cleanupExpiredBlacklistedTokens();
    const csrfTokens = await this.cleanupExpiredCsrfTokens();
    const total = jwtTokens + csrfTokens;

    if (total > 0) {
      logger.info('Token cleanup completed', {
        jwtTokens,
        csrfTokens,
        total
      }, LogSensitivity.INTERNAL);
    }

    return { jwtTokens, csrfTokens, total };
  }

  /**
   * Health check for token storage system
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    errors: string[];
    stats?: TokenStorageStats;
    lastCleanup?: Date;
  }> {
    const errors: string[] = [];
    
    if (!this.isReady()) {
      errors.push('Token storage not initialized');
      if (this.initializationError) {
        errors.push(`Initialization error: ${this.initializationError.message}`);
      }
    }

    let stats: TokenStorageStats | null = null;
    try {
      stats = await this.getTokenStorageStats();
      if (!stats) {
        errors.push('Failed to retrieve token storage statistics');
      }
    } catch (error) {
      errors.push(`Statistics error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test basic connectivity
    try {
      const { error } = await this.supabase
        .from('token_blacklist')
        .select('count')
        .limit(1);
      
      if (error) {
        errors.push(`Database connectivity error: ${error.message}`);
      }
    } catch (error) {
      errors.push(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isHealthy: errors.length === 0,
      errors,
      stats: stats || undefined,
      lastCleanup: new Date()
    };
  }
}

// ===============================================================================
// Singleton Instance and Fallback Management
// ===============================================================================

let tokenStorageInstance: PersistentTokenStorage | null = null;

/**
 * Get singleton instance of persistent token storage
 */
export function getTokenStorage(): PersistentTokenStorage {
  if (!tokenStorageInstance) {
    tokenStorageInstance = new PersistentTokenStorage();
  }
  return tokenStorageInstance;
}

/**
 * Fallback in-memory storage for when persistent storage is unavailable
 * This provides graceful degradation but should be avoided in production
 */
class FallbackTokenStorage {
  private jwtBlacklist = new Map<string, { exp: number; userId?: string }>();
  private csrfTokens = new Map<string, { expires: number; userId?: string; useCount: number; maxUses: number }>();

  addToBlacklist(jti: string, expiresAt: Date, userId?: string): boolean {
    this.jwtBlacklist.set(jti, { exp: Math.floor(expiresAt.getTime() / 1000), userId });
    return true;
  }

  isTokenBlacklisted(jti: string): boolean {
    const entry = this.jwtBlacklist.get(jti);
    if (!entry) return false;
    
    if (entry.exp < Math.floor(Date.now() / 1000)) {
      this.jwtBlacklist.delete(jti);
      return false;
    }
    
    return true;
  }

  storeCsrfToken(token: string, expiresAt: Date, userId?: string, maxUses: number = 1): boolean {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    this.csrfTokens.set(tokenHash, {
      expires: expiresAt.getTime(),
      userId,
      useCount: 0,
      maxUses
    });
    return true;
  }

  validateCsrfToken(token: string, userId?: string, markAsUsed: boolean = true): boolean {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const entry = this.csrfTokens.get(tokenHash);
    
    if (!entry) return false;
    if (entry.expires < Date.now()) {
      this.csrfTokens.delete(tokenHash);
      return false;
    }
    if (entry.useCount >= entry.maxUses) return false;
    if (userId && entry.userId && entry.userId !== userId) return false;
    
    if (markAsUsed) {
      entry.useCount++;
    }
    
    return true;
  }

  cleanup(): { jwtTokens: number; csrfTokens: number; total: number } {
    let jwtCleaned = 0;
    let csrfCleaned = 0;
    const now = Date.now();
    const nowSeconds = Math.floor(now / 1000);

    for (const [jti, entry] of this.jwtBlacklist.entries()) {
      if (entry.exp < nowSeconds) {
        this.jwtBlacklist.delete(jti);
        jwtCleaned++;
      }
    }

    for (const [token, entry] of this.csrfTokens.entries()) {
      if (entry.expires < now) {
        this.csrfTokens.delete(token);
        csrfCleaned++;
      }
    }

    return { jwtTokens: jwtCleaned, csrfTokens: csrfCleaned, total: jwtCleaned + csrfCleaned };
  }
}

let fallbackStorageInstance: FallbackTokenStorage | null = null;

/**
 * Get fallback storage for emergency use
 */
export function getFallbackStorage(): FallbackTokenStorage {
  if (!fallbackStorageInstance) {
    fallbackStorageInstance = new FallbackTokenStorage();
    logger.warn('Using fallback in-memory token storage - not recommended for production', LogSensitivity.SENSITIVE);
  }
  return fallbackStorageInstance;
}

/**
 * Export the storage interfaces for backwards compatibility
 */
export type { TokenBlacklistEntry, CsrfTokenEntry, TokenStorageStats, ClientInfo };
export { PersistentTokenStorage };