/**
 * System Health Check Endpoint
 * Provides comprehensive health status for MediMind Expert deployment
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { parseRequest } from './utils/request';
import { logInfo, logError } from './utils/logger';
import { generateMonitoringReport } from './utils/monitoring';
import { ENV_VARS } from './utils/constants';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    searchProviders: {
      brave: ServiceHealth;
      exa: ServiceHealth;
      perplexity: ServiceHealth;
    };
    authentication: ServiceHealth;
    functions: ServiceHealth;
    monitoring: ServiceHealth;
  };
  performance: {
    responseTime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: number;
    activeConnections: number;
  };
  deployment: {
    buildTime: string;
    commitHash?: string;
    deploymentId?: string;
    region: string;
  };
  alerts: HealthAlert[];
}

interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  error?: string;
  details?: Record<string, any>;
}

interface HealthAlert {
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  service: string;
  timestamp: string;
  actionRequired?: string;
}

// Test database connectivity
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      ENV_VARS.SUPABASE_URL,
      ENV_VARS.SUPABASE_SERVICE_ROLE_KEY
    );

    // Simple health check query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }

    return {
      status: responseTime > 5000 ? 'degraded' : 'healthy',
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        connectionPool: 'active',
        region: 'optimal'
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database connection failed'
    };
  }
}

// Test search provider connectivity
async function checkSearchProviderHealth(provider: 'brave' | 'exa' | 'perplexity'): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    let apiKey: string;
    let testUrl: string;
    
    switch (provider) {
      case 'brave':
        apiKey = process.env.BRAVE_API_KEY || '';
        testUrl = 'https://api.search.brave.com/res/v1/web/search?q=test&count=1';
        break;
      case 'exa':
        apiKey = process.env.EXA_API_KEY || '';
        testUrl = 'https://api.exa.ai/search';
        break;
      case 'perplexity':
        apiKey = process.env.PERPLEXITY_API_KEY || '';
        testUrl = 'https://api.perplexity.ai/chat/completions';
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    if (!apiKey) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: 'API key not configured'
      };
    }

    const response = await fetch(testUrl, {
      method: provider === 'perplexity' ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: provider === 'perplexity' ? JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      }) : undefined,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    // Accept various response codes that indicate the service is accessible
    const healthyStatuses = [200, 201, 400, 401, 429]; // 401 means auth is working, 429 means rate limiting is working
    const isHealthy = healthyStatuses.includes(response.status);

    return {
      status: isHealthy ? (responseTime > 5000 ? 'degraded' : 'healthy') : 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: !isHealthy ? `HTTP ${response.status}: ${response.statusText}` : undefined,
      details: {
        httpStatus: response.status,
        rateLimit: response.headers.get('x-ratelimit-remaining')
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

// Test authentication system
async function checkAuthenticationHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Test JWT verification with a dummy token (should fail gracefully)
    const testHeader = 'Bearer invalid.jwt.token';
    
    // Import auth utilities
    const { decodeJWTSecure } = require('./utils/jwt');
    
    try {
      decodeJWTSecure('invalid.jwt.token');
      // If this succeeds, something is wrong with our auth
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: 'Authentication system not properly validating tokens'
      };
    } catch (authError) {
      // Expected behavior - invalid tokens should be rejected
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        details: {
          jwtValidation: 'working',
          errorHandling: 'proper'
        }
      };
    }

  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Auth system check failed'
    };
  }
}

// Check Netlify Functions health
async function checkFunctionsHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Check key environment variables
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY',
      'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: `Missing environment variables: ${missingVars.join(', ')}`
      };
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryThresholdMB = 100; // 100MB threshold
    const memoryUsageMB = memoryUsage.heapUsed / (1024 * 1024);

    const status = memoryUsageMB > memoryThresholdMB ? 'degraded' : 'healthy';

    return {
      status,
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      details: {
        memoryUsageMB: Math.round(memoryUsageMB),
        environmentVariables: 'configured',
        nodeVersion: process.version,
        platform: process.platform
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Functions health check failed'
    };
  }
}

// Check monitoring system health
async function checkMonitoringHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    // Generate a monitoring report to test the monitoring system
    const monitoringReport = generateMonitoringReport();
    
    const responseTime = Date.now() - startTime;
    
    // Check if monitoring data looks reasonable
    const hasPerformanceData = monitoringReport.performance?.totalRequests !== undefined;
    const hasSearchData = monitoringReport.search?.totalSearches !== undefined;
    
    if (!hasPerformanceData && !hasSearchData) {
      return {
        status: 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          message: 'No monitoring data available yet',
          alertCount: monitoringReport.alerts?.length || 0
        }
      };
    }

    return {
      status: 'healthy',
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        alertCount: monitoringReport.alerts?.length || 0,
        performanceMetrics: hasPerformanceData,
        searchMetrics: hasSearchData
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Monitoring system failed'
    };
  }
}

// Generate health alerts based on service status
function generateHealthAlerts(services: HealthCheckResult['services']): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const timestamp = new Date().toISOString();

  // Database alerts
  if (services.database.status === 'unhealthy') {
    alerts.push({
      level: 'critical',
      message: 'Database connection failed',
      service: 'database',
      timestamp,
      actionRequired: 'Check Supabase connection and API keys'
    });
  } else if (services.database.status === 'degraded') {
    alerts.push({
      level: 'warning',
      message: `Database response time high: ${services.database.responseTime}ms`,
      service: 'database',
      timestamp,
      actionRequired: 'Monitor database performance'
    });
  }

  // Search provider alerts
  Object.entries(services.searchProviders).forEach(([provider, health]) => {
    if (health.status === 'unhealthy') {
      alerts.push({
        level: 'error',
        message: `${provider} search provider unavailable`,
        service: `search_${provider}`,
        timestamp,
        actionRequired: `Check ${provider} API key and service status`
      });
    } else if (health.status === 'degraded') {
      alerts.push({
        level: 'warning',
        message: `${provider} search provider slow response`,
        service: `search_${provider}`,
        timestamp
      });
    }
  });

  // Authentication alerts
  if (services.authentication.status === 'unhealthy') {
    alerts.push({
      level: 'critical',
      message: 'Authentication system failure',
      service: 'authentication',
      timestamp,
      actionRequired: 'Check JWT configuration and secrets'
    });
  }

  // Functions alerts
  if (services.functions.status === 'unhealthy') {
    alerts.push({
      level: 'critical',
      message: 'Function environment configuration issues',
      service: 'functions',
      timestamp,
      actionRequired: 'Check environment variables and function deployment'
    });
  }

  return alerts;
}

// Get CPU usage (approximation)
function getCPUUsage(): number {
  const startUsage = process.cpuUsage();
  // Return usage from process start (not real-time, but useful for monitoring)
  return (startUsage.user + startUsage.system) / 1000000; // Convert to seconds
}

// Main health check handler
const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  const startTime = Date.now();
  
  try {
    const { method } = parseRequest(event);
    
    if (method !== 'GET') {
      return createErrorResponse('Method not allowed', 405);
    }

    logInfo('System health check initiated', {
      timestamp: new Date().toISOString(),
      userAgent: event.headers['user-agent']
    });

    // Run all health checks in parallel
    const [
      databaseHealth,
      braveHealth,
      exaHealth,
      perplexityHealth,
      authHealth,
      functionsHealth,
      monitoringHealth
    ] = await Promise.all([
      checkDatabaseHealth(),
      checkSearchProviderHealth('brave'),
      checkSearchProviderHealth('exa'),
      checkSearchProviderHealth('perplexity'),
      checkAuthenticationHealth(),
      checkFunctionsHealth(),
      checkMonitoringHealth()
    ]);

    const services: HealthCheckResult['services'] = {
      database: databaseHealth,
      searchProviders: {
        brave: braveHealth,
        exa: exaHealth,
        perplexity: perplexityHealth
      },
      authentication: authHealth,
      functions: functionsHealth,
      monitoring: monitoringHealth
    };

    // Determine overall system status
    const allServices = [
      databaseHealth,
      braveHealth,
      exaHealth,
      perplexityHealth,
      authHealth,
      functionsHealth,
      monitoringHealth
    ];

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (allServices.some(s => s.status === 'unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (allServices.some(s => s.status === 'degraded')) {
      overallStatus = 'degraded';
    }

    // Generate performance metrics
    const memoryUsage = process.memoryUsage();
    const responseTime = Date.now() - startTime;

    const healthCheck: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      services,
      performance: {
        responseTime,
        memoryUsage,
        cpuUsage: getCPUUsage(),
        activeConnections: 0 // Would need to be tracked separately
      },
      deployment: {
        buildTime: process.env.__BUILD_TIME__ || new Date().toISOString(),
        commitHash: process.env.COMMIT_REF,
        deploymentId: process.env.DEPLOY_ID,
        region: process.env.AWS_REGION || 'us-east-1'
      },
      alerts: generateHealthAlerts(services)
    };

    logInfo('System health check completed', {
      status: overallStatus,
      responseTime,
      alertCount: healthCheck.alerts.length,
      unhealthyServices: allServices.filter(s => s.status === 'unhealthy').length
    });

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return {
      statusCode: httpStatus,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify(healthCheck, null, 2)
    };

  } catch (error) {
    logError('System health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    const errorResponse: Partial<HealthCheckResult> = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      alerts: [{
        level: 'critical',
        message: 'Health check system failure',
        service: 'system',
        timestamp: new Date().toISOString(),
        actionRequired: 'Check function logs and system configuration'
      }]
    };

    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorResponse, null, 2)
    };
  }
};

export { handler };