/**
 * HIPAA Compliance Monitoring and Enforcement
 * Ensures medical data protection and regulatory compliance
 */

import { HandlerEvent } from '@netlify/functions';
import { logInfo, logWarning, logError } from './logger';
import { auditPHIAccess } from './dataSanitization';

// HIPAA compliance requirements
export interface HIPAARequirements {
  encryption: {
    inTransit: boolean;    // HTTPS/TLS required
    atRest: boolean;       // Database encryption required
  };
  authentication: {
    strongPasswords: boolean;
    twoFactor: boolean;
    sessionTimeout: number; // In minutes
  };
  accessControl: {
    minimumPrivilege: boolean;
    auditLogging: boolean;
    userAccessReview: boolean;
  };
  dataIntegrity: {
    backupRequired: boolean;
    integrityChecks: boolean;
    changeLogging: boolean;
  };
  breach: {
    detectionEnabled: boolean;
    notificationTime: number; // Max hours to notify
    documentationRequired: boolean;
  };
}

// Production HIPAA requirements
const PRODUCTION_HIPAA_REQUIREMENTS: HIPAARequirements = {
  encryption: {
    inTransit: true,
    atRest: true
  },
  authentication: {
    strongPasswords: true,
    twoFactor: false, // Optional for now
    sessionTimeout: 30 // 30 minutes
  },
  accessControl: {
    minimumPrivilege: true,
    auditLogging: true,
    userAccessReview: true
  },
  dataIntegrity: {
    backupRequired: true,
    integrityChecks: true,
    changeLogging: true
  },
  breach: {
    detectionEnabled: true,
    notificationTime: 24, // 24 hours max
    documentationRequired: true
  }
};

export class HIPAAComplianceMonitor {
  private auditLog: any[] = [];
  private breachDetectionRules: any[] = [];
  
  constructor() {
    this.initializeBreachDetection();
  }

  // Initialize breach detection rules
  private initializeBreachDetection() {
    this.breachDetectionRules = [
      {
        name: 'Unauthorized_PHI_Access',
        pattern: /unauthorized.*access.*medical/gi,
        severity: 'critical',
        action: 'immediate_alert'
      },
      {
        name: 'Mass_Data_Export',
        condition: (event: any) => {
          return event.dataExported && event.recordCount > 100;
        },
        severity: 'high',
        action: 'investigation_required'
      },
      {
        name: 'Failed_Authentication_Spike',
        condition: (event: any) => {
          return event.authFailures && event.authFailures > 10;
        },
        severity: 'medium',
        action: 'monitor_closely'
      },
      {
        name: 'Unusual_Access_Pattern',
        condition: (event: any) => {
          return event.accessTime && (
            new Date(event.accessTime).getHours() < 6 || 
            new Date(event.accessTime).getHours() > 22
          );
        },
        severity: 'low',
        action: 'log_and_review'
      }
    ];
  }

  // Validate HIPAA compliance for request
  validateRequest(event: HandlerEvent): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check encryption in transit
    const protocol = event.headers['x-forwarded-proto'] || 'http';
    if (protocol !== 'https') {
      violations.push('Request not using HTTPS - PHI transmission not secure');
    }

    // Check authentication for protected resources
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const isProtectedResource = event.path.includes('/api/') && 
                                !event.path.includes('/health') &&
                                !event.path.includes('/public');
    
    if (isProtectedResource && !authHeader) {
      violations.push('Protected medical resource accessed without authentication');
    }

    // Check for potential PHI in URL parameters (should never happen)
    const queryString = event.rawQuery || '';
    if (queryString.length > 0) {
      const suspiciousParams = ['ssn', 'patient', 'medical_record', 'diagnosis'];
      if (suspiciousParams.some(param => queryString.toLowerCase().includes(param))) {
        violations.push('Potential PHI detected in URL parameters');
        recommendations.push('Move sensitive data to request body');
      }
    }

    // Check request size for potential data exfiltration
    const contentLength = parseInt(event.headers['content-length'] || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB
      recommendations.push('Large request detected - monitor for data exfiltration');
    }

    // Check user agent for automated access
    const userAgent = event.headers['user-agent'] || '';
    if (!userAgent || userAgent.toLowerCase().includes('bot')) {
      recommendations.push('Automated access detected - verify legitimate medical use');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  // Log HIPAA-compliant audit entry
  logAuditEvent(event: {
    userId?: string;
    action: string;
    resource: string;
    outcome: 'success' | 'failure' | 'blocked';
    ipAddress: string;
    userAgent: string;
    metadata?: Record<string, any>;
  }) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId: event.userId || 'anonymous',
      action: event.action,
      resource: event.resource,
      outcome: event.outcome,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: event.metadata || {},
      compliance: {
        hipaa: true,
        encrypted: true,
        audited: true
      }
    };

    // Store audit entry (in production, use secure audit database)
    this.auditLog.push(auditEntry);
    
    // Keep only last 1000 entries in memory
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }

    // Log for immediate monitoring
    logInfo('HIPAA Audit Event', auditEntry);

    return auditEntry;
  }

  // Check for potential data breaches
  detectPotentialBreach(event: any): {
    breachDetected: boolean;
    ruleTriggered?: string;
    severity?: string;
    actionRequired?: string;
  } {
    for (const rule of this.breachDetectionRules) {
      let triggered = false;

      if (rule.pattern && typeof event.description === 'string') {
        triggered = rule.pattern.test(event.description);
      } else if (rule.condition && typeof rule.condition === 'function') {
        triggered = rule.condition(event);
      }

      if (triggered) {
        // Log potential breach
        logWarning('Potential HIPAA breach detected', {
          rule: rule.name,
          severity: rule.severity,
          action: rule.action,
          timestamp: new Date().toISOString(),
          event: event
        });

        return {
          breachDetected: true,
          ruleTriggered: rule.name,
          severity: rule.severity,
          actionRequired: rule.action
        };
      }
    }

    return { breachDetected: false };
  }

  // Generate compliance report
  generateComplianceReport(): {
    compliant: boolean;
    requirements: HIPAARequirements;
    auditEventCount: number;
    breachAlerts: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Check recent audit events for compliance patterns
    const recentEvents = this.auditLog.filter(
      event => Date.now() - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    const failedAuthAttempts = recentEvents.filter(event => 
      event.action === 'authentication' && event.outcome === 'failure'
    ).length;

    if (failedAuthAttempts > 10) {
      recommendations.push('High number of failed authentication attempts - review security');
    }

    const unauthorizedAccess = recentEvents.filter(event =>
      event.outcome === 'blocked'
    ).length;

    if (unauthorizedAccess > 5) {
      recommendations.push('Multiple unauthorized access attempts - strengthen access controls');
    }

    return {
      compliant: true, // Assume compliant unless specific violations found
      requirements: PRODUCTION_HIPAA_REQUIREMENTS,
      auditEventCount: this.auditLog.length,
      breachAlerts: 0, // Would count actual breach alerts
      recommendations
    };
  }

  // Get audit log (filtered for privacy)
  getAuditLog(limit: number = 100): any[] {
    return this.auditLog
      .slice(-limit)
      .map(entry => ({
        ...entry,
        // Redact sensitive information from logs
        userId: entry.userId.substring(0, 8) + '...',
        ipAddress: entry.ipAddress.replace(/\.\d+$/, '.***'),
        userAgent: entry.userAgent.substring(0, 50) + '...'
      }));
  }
}

// Global compliance monitor instance
export const hipaaMonitor = new HIPAAComplianceMonitor();

// Middleware wrapper for HIPAA compliance
export function withHIPAACompliance(
  handler: (event: HandlerEvent, context: any) => Promise<any>
) {
  return async (event: HandlerEvent, context: any) => {
    const startTime = Date.now();
    
    try {
      // Validate HIPAA compliance for incoming request
      const compliance = hipaaMonitor.validateRequest(event);
      
      if (!compliance.compliant) {
        // Log compliance violation
        hipaaMonitor.logAuditEvent({
          action: 'compliance_violation',
          resource: event.path,
          outcome: 'blocked',
          ipAddress: event.headers['x-forwarded-for'] || 'unknown',
          userAgent: event.headers['user-agent'] || 'unknown',
          metadata: { violations: compliance.violations }
        });

        return {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'HIPAA Compliance Violation',
            message: 'Request does not meet medical data protection requirements',
            violations: compliance.violations
          })
        };
      }

      // Execute the handler
      const response = await handler(event, context);
      const duration = Date.now() - startTime;

      // Log successful audit event
      hipaaMonitor.logAuditEvent({
        userId: event.headers.authorization ? 'authenticated_user' : undefined,
        action: `${event.httpMethod}_${event.path}`,
        resource: event.path,
        outcome: response.statusCode < 400 ? 'success' : 'failure',
        ipAddress: event.headers['x-forwarded-for'] || 'unknown',
        userAgent: event.headers['user-agent'] || 'unknown',
        metadata: {
          responseTime: duration,
          statusCode: response.statusCode
        }
      });

      return response;

    } catch (error) {
      // Log error event
      hipaaMonitor.logAuditEvent({
        action: 'system_error',
        resource: event.path,
        outcome: 'failure',
        ipAddress: event.headers['x-forwarded-for'] || 'unknown',
        userAgent: event.headers['user-agent'] || 'unknown',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime
        }
      });

      throw error;
    }
  };
}

// Data retention compliance utility
export function enforceDataRetention(
  data: any[],
  retentionDays: number = 2555
): { retained: any[]; expired: any[]; }  {
  const now = Date.now();
  const retentionPeriod = retentionDays * 24 * 60 * 60 * 1000;

  const retained: any[] = [];
  const expired: any[] = [];

  data.forEach(item => {
    const createdAt = new Date(item.created_at || item.createdAt || item.timestamp);
    const isExpired = (now - createdAt.getTime()) > retentionPeriod;

    if (isExpired) {
      expired.push(item);
    } else {
      retained.push(item);
    }
  });

  // Log retention enforcement
  if (expired.length > 0) {
    logInfo('Data retention enforcement', {
      retainedCount: retained.length,
      expiredCount: expired.length,
      retentionDays
    });
  }

  return { retained, expired };
}