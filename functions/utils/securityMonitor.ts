/**
 * Security monitoring and alerting utilities
 * Aggregates and analyzes security events from CORS and CSRF protection
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';

// Security event types
export enum SecurityEventType {
  CORS_VIOLATION = 'CORS_VIOLATION',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

// Security event interface
export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: string;
  clientId?: string;
  origin?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// In-memory event storage (in production, use proper logging service)
const securityEvents: SecurityEvent[] = [];
const MAX_EVENTS = 1000; // Keep only last 1000 events

/**
 * Log a security event
 */
export function logSecurityEvent(event: SecurityEvent): void {
  // Add to in-memory storage
  securityEvents.push(event);
  
  // Keep only recent events
  if (securityEvents.length > MAX_EVENTS) {
    securityEvents.shift();
  }
  
  // Log to console for monitoring systems
  console.log('SECURITY_EVENT', event);
  
  // For critical events, also log as error
  if (event.severity === 'critical') {
    console.error('CRITICAL_SECURITY_EVENT', event);
  }
}

/**
 * Create security event from handler context
 */
export function createSecurityEvent(
  type: SecurityEventType,
  event: HandlerEvent,
  details?: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): SecurityEvent {
  return {
    type,
    timestamp: new Date().toISOString(),
    clientId: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
    origin: event.headers.origin || event.headers.Origin,
    userAgent: event.headers['user-agent'],
    path: event.path,
    method: event.httpMethod,
    details,
    severity
  };
}

/**
 * Get security event statistics
 */
export function getSecurityStats() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const twentyFourHours = 24 * oneHour;
  
  const recentEvents = securityEvents.filter(e => 
    now - new Date(e.timestamp).getTime() < oneHour
  );
  
  const dailyEvents = securityEvents.filter(e => 
    now - new Date(e.timestamp).getTime() < twentyFourHours
  );
  
  const eventsByType = securityEvents.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const eventsBySeverity = securityEvents.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalEvents: securityEvents.length,
    recentEvents: recentEvents.length,
    dailyEvents: dailyEvents.length,
    eventsByType,
    eventsBySeverity,
    lastEventTime: securityEvents.length > 0 
      ? securityEvents[securityEvents.length - 1].timestamp 
      : null
  };
}

/**
 * Get recent security events
 */
export function getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
  return securityEvents
    .slice(-limit)
    .reverse(); // Most recent first
}

/**
 * Check for security alert conditions
 */
export function checkSecurityAlerts(): { alert: boolean; message: string; severity: string }[] {
  const alerts: { alert: boolean; message: string; severity: string }[] = [];
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // Check for high frequency of CORS violations
  const recentCorsViolations = securityEvents.filter(e => 
    e.type === SecurityEventType.CORS_VIOLATION &&
    now - new Date(e.timestamp).getTime() < oneHour
  );
  
  if (recentCorsViolations.length > 10) {
    alerts.push({
      alert: true,
      message: `High frequency of CORS violations: ${recentCorsViolations.length} in the last hour`,
      severity: 'high'
    });
  }
  
  // Check for CSRF attack attempts
  const recentCsrfViolations = securityEvents.filter(e => 
    e.type === SecurityEventType.CSRF_VIOLATION &&
    now - new Date(e.timestamp).getTime() < oneHour
  );
  
  if (recentCsrfViolations.length > 5) {
    alerts.push({
      alert: true,
      message: `Potential CSRF attack: ${recentCsrfViolations.length} violations in the last hour`,
      severity: 'critical'
    });
  }
  
  // Check for repeated unauthorized access from same IP
  const unauthorizedEvents = securityEvents.filter(e => 
    e.type === SecurityEventType.UNAUTHORIZED_ACCESS &&
    now - new Date(e.timestamp).getTime() < oneHour
  );
  
  const ipCounts = unauthorizedEvents.reduce((acc, event) => {
    const ip = event.clientId || 'unknown';
    acc[ip] = (acc[ip] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  for (const [ip, count] of Object.entries(ipCounts)) {
    if (count > 20) {
      alerts.push({
        alert: true,
        message: `Potential brute force attack from IP ${ip}: ${count} unauthorized attempts in the last hour`,
        severity: 'critical'
      });
    }
  }
  
  return alerts;
}

/**
 * Security monitoring endpoint handler
 */
export async function createSecurityMonitorEndpoint(event: HandlerEvent): Promise<HandlerResponse> {
  // Only allow GET requests from authorized origins
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  // Basic authentication check (in production, use proper authentication)
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Authentication required' })
    };
  }
  
  const stats = getSecurityStats();
  const alerts = checkSecurityAlerts();
  const recentEvents = getRecentSecurityEvents(20);
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stats,
      alerts,
      recentEvents,
      timestamp: new Date().toISOString()
    })
  };
}

/**
 * Middleware to automatically log security events
 */
export function withSecurityMonitoring(
  handler: (event: HandlerEvent) => Promise<HandlerResponse>
): (event: HandlerEvent) => Promise<HandlerResponse> {
  return async (event: HandlerEvent): Promise<HandlerResponse> => {
    const startTime = Date.now();
    
    try {
      const response = await handler(event);
      
      // Log security-relevant responses
      if (response.statusCode === 401) {
        logSecurityEvent(createSecurityEvent(
          SecurityEventType.UNAUTHORIZED_ACCESS,
          event,
          { responseCode: response.statusCode },
          'medium'
        ));
      } else if (response.statusCode === 403) {
        logSecurityEvent(createSecurityEvent(
          SecurityEventType.CORS_VIOLATION,
          event,
          { responseCode: response.statusCode },
          'high'
        ));
      } else if (response.statusCode === 429) {
        logSecurityEvent(createSecurityEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          event,
          { responseCode: response.statusCode },
          'medium'
        ));
      }
      
      return response;
    } catch (error) {
      // Log handler errors as potential security incidents
      logSecurityEvent(createSecurityEvent(
        SecurityEventType.SUSPICIOUS_ACTIVITY,
        event,
        { 
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime
        },
        'low'
      ));
      
      throw error;
    }
  };
}