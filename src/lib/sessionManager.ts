import { supabase } from './supabase';

interface SessionConfig {
  warningTimeBeforeExpiry: number; // minutes
  maxConcurrentSessions: number;
  sessionTimeoutMinutes: number;
}

const DEFAULT_CONFIG: SessionConfig = {
  warningTimeBeforeExpiry: 5, // Warn 5 minutes before expiry
  maxConcurrentSessions: 3, // Allow max 3 concurrent sessions
  sessionTimeoutMinutes: 60, // 1 hour timeout
};

interface SessionWarningCallback {
  (minutesRemaining: number): void;
}

interface SessionExpiredCallback {
  (): void;
}

class SessionManager {
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private expiredTimeoutId: NodeJS.Timeout | null = null;
  private warningCallback: SessionWarningCallback | null = null;
  private expiredCallback: SessionExpiredCallback | null = null;
  private lastActivityTime: number = Date.now();
  private config: SessionConfig = DEFAULT_CONFIG;

  constructor() {
    this.setupActivityListeners();
    this.startSessionMonitoring();
  }

  private setupActivityListeners() {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      this.resetTimers();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
  }

  private startSessionMonitoring() {
    // Check session every minute
    setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        this.handleSessionExpired();
        return;
      }

      const timeUntilExpiry = (session.expires_at || 0) * 1000 - Date.now();
      const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));

      // Check if session is about to expire
      if (minutesUntilExpiry <= this.config.warningTimeBeforeExpiry && minutesUntilExpiry > 0) {
        this.handleSessionWarning(minutesUntilExpiry);
      }

      // Check for inactivity timeout
      const inactiveTime = Date.now() - this.lastActivityTime;
      const inactiveMinutes = Math.floor(inactiveTime / (1000 * 60));

      if (inactiveMinutes >= this.config.sessionTimeoutMinutes) {
        await this.signOut();
      }
    }, 60000); // Check every minute
  }

  private resetTimers() {
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
    
    if (this.expiredTimeoutId) {
      clearTimeout(this.expiredTimeoutId);
      this.expiredTimeoutId = null;
    }
  }

  private handleSessionWarning(minutesRemaining: number) {
    if (this.warningCallback) {
      this.warningCallback(minutesRemaining);
    }
  }

  private handleSessionExpired() {
    if (this.expiredCallback) {
      this.expiredCallback();
    }
  }

  public onSessionWarning(callback: SessionWarningCallback) {
    this.warningCallback = callback;
  }

  public onSessionExpired(callback: SessionExpiredCallback) {
    this.expiredCallback = callback;
  }

  public async extendSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {

        return false;
      }

      this.lastActivityTime = Date.now();
      this.resetTimers();
      return true;
    } catch (error) {

      return false;
    }
  }

  public async signOut() {
    try {
      await supabase.auth.signOut();
      this.resetTimers();
    } catch (error) {

    }
  }

  public async checkConcurrentSessions(): Promise<boolean> {
    try {
      // This would require a custom implementation to track sessions
      // For now, we'll return true (allowed)
      return true;
    } catch (error) {

      return true;
    }
  }

  public updateConfig(newConfig: Partial<SessionConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getLastActivityTime(): number {
    return this.lastActivityTime;
  }

  public getInactiveTime(): number {
    return Date.now() - this.lastActivityTime;
  }

  public destroy() {
    this.resetTimers();
    this.warningCallback = null;
    this.expiredCallback = null;
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

// Session warning component hook
export function useSessionWarning() {
  return {
    extendSession: () => sessionManager.extendSession(),
    signOut: () => sessionManager.signOut(),
  };
}