/**
 * Production Alerting System for MediMind Expert
 * Handles critical alerts for medical platform operations
 */

interface Alert {
  level: 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  actionRequired?: string;
}

interface AlertThresholds {
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

// Production alerting thresholds for medical application
const PRODUCTION_THRESHOLDS: AlertThresholds = {
  responseTime: 3000, // 3 seconds for medical workflows
  errorRate: 0.01, // 1% error rate threshold
  memoryUsage: 0.85, // 85% memory usage
  cpuUsage: 0.80, // 80% CPU usage
  diskUsage: 0.90 // 90% disk usage
};

// Alert manager class
export class AlertManager {
  private alerts: Alert[] = [];
  private alertHistory: Alert[] = [];
  private webhookUrls: string[] = [];
  
  constructor() {
    // Initialize webhook URLs from environment
    if (process.env.SLACK_WEBHOOK_URL) {
      this.webhookUrls.push(process.env.SLACK_WEBHOOK_URL);
    }
    if (process.env.TEAMS_WEBHOOK_URL) {
      this.webhookUrls.push(process.env.TEAMS_WEBHOOK_URL);
    }
  }

  // Add new alert
  addAlert(alert: Omit<Alert, 'timestamp'>) {
    const newAlert: Alert = {
      ...alert,
      timestamp: new Date().toISOString()
    };
    
    this.alerts.push(newAlert);
    this.alertHistory.push(newAlert);
    
    // Send immediate notification for critical alerts
    if (alert.level === 'critical') {
      this.sendImmediateNotification(newAlert);
    }
    
    // Keep only last 100 alerts in memory
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    // Keep 24 hours of alert history
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.alertHistory = this.alertHistory.filter(
      alert => new Date(alert.timestamp).getTime() > dayAgo
    );
  }

  // Performance threshold monitoring
  checkPerformanceThresholds(metrics: {
    responseTime?: number;
    errorRate?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  }) {
    if (metrics.responseTime && metrics.responseTime > PRODUCTION_THRESHOLDS.responseTime) {
      this.addAlert({
        level: 'warning',
        service: 'performance',
        message: `High response time: ${metrics.responseTime}ms`,
        actionRequired: 'Investigate performance bottlenecks',
        metadata: { responseTime: metrics.responseTime }
      });
    }

    if (metrics.errorRate && metrics.errorRate > PRODUCTION_THRESHOLDS.errorRate) {
      this.addAlert({
        level: 'error',
        service: 'reliability',
        message: `High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`,
        actionRequired: 'Check error logs and fix underlying issues',
        metadata: { errorRate: metrics.errorRate }
      });
    }

    if (metrics.memoryUsage && metrics.memoryUsage > PRODUCTION_THRESHOLDS.memoryUsage) {
      this.addAlert({
        level: 'warning',
        service: 'resources',
        message: `High memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`,
        actionRequired: 'Monitor for memory leaks',
        metadata: { memoryUsage: metrics.memoryUsage }
      });
    }

    if (metrics.cpuUsage && metrics.cpuUsage > PRODUCTION_THRESHOLDS.cpuUsage) {
      this.addAlert({
        level: 'warning',
        service: 'resources',
        message: `High CPU usage: ${(metrics.cpuUsage * 100).toFixed(1)}%`,
        actionRequired: 'Check for CPU-intensive operations',
        metadata: { cpuUsage: metrics.cpuUsage }
      });
    }
  }

  // Medical-specific alert types
  addMedicalAlert(type: 'calculator_failure' | 'search_degraded' | 'document_processing_error' | 'auth_failure', details: Record<string, any>) {
    let alert: Omit<Alert, 'timestamp'>;
    
    switch (type) {
      case 'calculator_failure':
        alert = {
          level: 'critical',
          service: 'medical_calculators',
          message: `Calculator failure: ${details.calculatorType}`,
          actionRequired: 'Verify calculator implementation and medical accuracy',
          metadata: details
        };
        break;
        
      case 'search_degraded':
        alert = {
          level: 'warning',
          service: 'medical_search',
          message: `Search provider degraded: ${details.provider}`,
          actionRequired: 'Check API keys and provider status',
          metadata: details
        };
        break;
        
      case 'document_processing_error':
        alert = {
          level: 'error',
          service: 'document_processing',
          message: `Document processing failed: ${details.documentType}`,
          actionRequired: 'Check OpenAI integration and processing pipeline',
          metadata: details
        };
        break;
        
      case 'auth_failure':
        alert = {
          level: 'critical',
          service: 'authentication',
          message: `Authentication system failure: ${details.reason}`,
          actionRequired: 'Check Supabase connection and JWT configuration',
          metadata: details
        };
        break;
    }
    
    this.addAlert(alert);
  }

  // Send immediate notification for critical alerts
  private async sendImmediateNotification(alert: Alert) {
    const message = {
      text: `🚨 MediMind Expert Critical Alert`,
      attachments: [
        {
          color: 'danger',
          fields: [
            {
              title: 'Service',
              value: alert.service,
              short: true
            },
            {
              title: 'Level',
              value: alert.level.toUpperCase(),
              short: true
            },
            {
              title: 'Message',
              value: alert.message,
              short: false
            },
            {
              title: 'Action Required',
              value: alert.actionRequired || 'No action specified',
              short: false
            },
            {
              title: 'Timestamp',
              value: alert.timestamp,
              short: true
            }
          ]
        }
      ]
    };

    // Send to all configured webhooks
    const notificationPromises = this.webhookUrls.map(url =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      }).catch(error => {
        console.error(`Failed to send alert notification to ${url}:`, error);
      })
    );

    await Promise.allSettled(notificationPromises);
  }

  // Get current alerts
  getCurrentAlerts(): Alert[] {
    return [...this.alerts];
  }

  // Get alert statistics
  getAlertStats() {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);

    const recentAlerts = this.alertHistory.filter(
      alert => new Date(alert.timestamp).getTime() > hourAgo
    );
    
    const dailyAlerts = this.alertHistory.filter(
      alert => new Date(alert.timestamp).getTime() > dayAgo
    );

    return {
      total: this.alertHistory.length,
      lastHour: recentAlerts.length,
      lastDay: dailyAlerts.length,
      byLevel: {
        critical: dailyAlerts.filter(a => a.level === 'critical').length,
        error: dailyAlerts.filter(a => a.level === 'error').length,
        warning: dailyAlerts.filter(a => a.level === 'warning').length,
        info: dailyAlerts.filter(a => a.level === 'info').length
      },
      byService: dailyAlerts.reduce((acc, alert) => {
        acc[alert.service] = (acc[alert.service] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Clear resolved alerts
  clearResolvedAlerts() {
    this.alerts = [];
  }
}

// Global alert manager instance
export const alertManager = new AlertManager();

// Convenience functions for common alert types
export const alertCritical = (service: string, message: string, actionRequired?: string) => {
  alertManager.addAlert({
    level: 'critical',
    service,
    message,
    actionRequired
  });
};

export const alertError = (service: string, message: string, metadata?: Record<string, any>) => {
  alertManager.addAlert({
    level: 'error',
    service,
    message,
    metadata
  });
};

export const alertWarning = (service: string, message: string, metadata?: Record<string, any>) => {
  alertManager.addAlert({
    level: 'warning',
    service,
    message,
    metadata
  });
};

// Medical workflow monitoring
export const monitorMedicalWorkflow = (
  workflow: 'calculator' | 'search' | 'document' | 'chat',
  operation: string,
  startTime: number,
  success: boolean,
  metadata?: Record<string, any>
) => {
  const duration = Date.now() - startTime;
  
  if (!success) {
    alertManager.addMedicalAlert(
      workflow === 'calculator' ? 'calculator_failure' :
      workflow === 'search' ? 'search_degraded' :
      workflow === 'document' ? 'document_processing_error' : 'auth_failure',
      {
        operation,
        duration,
        ...metadata
      }
    );
  } else if (duration > 5000) {
    alertWarning(
      `medical_${workflow}`,
      `Slow medical operation: ${operation} took ${duration}ms`,
      { duration, operation, ...metadata }
    );
  }
};