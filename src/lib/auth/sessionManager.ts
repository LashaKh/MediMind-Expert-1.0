import { supabase } from '../supabase';
import { logger } from '../logger';
import type { Session } from '@supabase/supabase-js';

class SessionManager {
  private refreshPromise: Promise<Session | null> | null = null;
  private refreshInProgress = false;
  private lastRefreshTime = 0;
  private readonly REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refreshes

  /**
   * Get a valid session, refreshing if necessary
   * Prevents concurrent refresh attempts with mutex pattern
   */
  async getValidSession(): Promise<Session | null> {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // If we have a valid session, return it
      if (session && !sessionError && this.isSessionValid(session)) {
        logger.debug('✅ Using existing valid session', {
          expiresAt: new Date(session.expires_at! * 1000).toISOString()
        });
        return session;
      }

      // If no session at all, user needs to login
      if (!session) {
        logger.debug('❌ No session found - user needs to login');
        throw new Error('Authentication required - please sign in');
      }

      // Session exists but is expired/invalid, need to refresh
      return await this.refreshSessionSafely();

    } catch (error) {
      logger.error('Session management error:', error);
      throw error;
    }
  }

  /**
   * Safely refresh session with concurrency protection
   */
  private async refreshSessionSafely(): Promise<Session | null> {
    // Check cooldown period to prevent rapid successive refreshes
    const now = Date.now();
    if (now - this.lastRefreshTime < this.REFRESH_COOLDOWN) {
      logger.debug('🕐 Session refresh in cooldown period, waiting...');
      await new Promise(resolve => setTimeout(resolve, this.REFRESH_COOLDOWN - (now - this.lastRefreshTime)));
    }

    // If refresh is already in progress, wait for it
    if (this.refreshInProgress && this.refreshPromise) {
      logger.debug('🔄 Session refresh already in progress, waiting for completion...');
      try {
        return await this.refreshPromise;
      } catch (error) {
        logger.error('Concurrent refresh failed:', error);
        // Reset state and try again
        this.refreshInProgress = false;
        this.refreshPromise = null;
      }
    }

    // Start new refresh
    this.refreshInProgress = true;
    this.lastRefreshTime = Date.now();
    
    this.refreshPromise = this.performRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Reset state
      this.refreshInProgress = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual session refresh
   */
  private async performRefresh(): Promise<Session | null> {
    try {
      logger.debug('🔄 Starting session refresh...');
      
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        // Handle specific error types
        if (refreshError.message?.includes('refresh_token_not_found') || 
            refreshError.message?.includes('invalid_grant')) {
          logger.error('Refresh token invalid - user needs to re-authenticate:', refreshError);
          throw new Error('Session expired - please sign in again');
        }
        
        logger.error('Session refresh failed:', refreshError);
        throw new Error(`Session refresh failed: ${refreshError.message}`);
      }
      
      if (!refreshedSession) {
        logger.error('Session refresh returned no session');
        throw new Error('Session refresh failed - please sign in again');
      }
      
      logger.debug('✅ Session refreshed successfully', {
        expiresAt: new Date(refreshedSession.expires_at! * 1000).toISOString()
      });
      
      return refreshedSession;
      
    } catch (error) {
      logger.error('Session refresh error:', error);
      throw error;
    }
  }

  /**
   * Check if a session is valid (not expired)
   */
  private isSessionValid(session: Session): boolean {
    if (!session.expires_at) {
      return true; // No expiration set, assume valid
    }
    
    const expirationTime = new Date(session.expires_at * 1000);
    const currentTime = new Date();
    const bufferTime = 60000; // 1 minute buffer before expiration
    
    const isValid = expirationTime.getTime() - currentTime.getTime() > bufferTime;
    
    if (!isValid) {
      logger.debug('⏰ Session will expire soon or has expired', {
        expiresAt: expirationTime.toISOString(),
        currentTime: currentTime.toISOString(),
        timeUntilExpiry: expirationTime.getTime() - currentTime.getTime()
      });
    }
    
    return isValid;
  }

  /**
   * Clear any cached refresh promises (for testing/reset)
   */
  reset(): void {
    this.refreshPromise = null;
    this.refreshInProgress = false;
    this.lastRefreshTime = 0;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();