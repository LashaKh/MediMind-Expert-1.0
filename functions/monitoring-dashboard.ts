/**
 * Monitoring Dashboard API
 * Provides comprehensive analytics and monitoring data for the MediMind Expert search system
 */

import { HandlerEvent } from '@netlify/functions';
import { withAuth, requireAnyRole, UserPayload } from './utils/auth';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { parseRequest } from './utils/request';
import { logInfo, logError } from './utils/logger';
import { generateMonitoringReport } from './utils/monitoring';
import { ENV_VARS } from './utils/constants';

interface DashboardQuery {
  timeRange?: 'hour' | 'day' | 'week' | 'month';
  metrics?: string[];
  specialty?: string;
  userType?: 'all' | 'medical_professional' | 'standard' | 'admin';
}

interface DatabaseMetrics {
  searchHistory: {
    totalSearches: number;
    avgSearchTime: number;
    avgResultCount: number;
    cacheHitRate: number;
    topQueries: Array<{ query: string; count: number }>;
    searchesBySpecialty: Record<string, number>;
  };
  apiPerformance: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    errorsByFunction: Record<string, number>;
    slowRequestsByFunction: Record<string, number>;
  };
  contentQuality: {
    totalContentItems: number;
    avgQualityScore: number;
    qualityBySpecialty: Record<string, number>;
    qualityByEvidenceLevel: Record<string, number>;
    userFeedback: Record<string, number>;
  };
  security: {
    rateLimitEvents: number;
    securityIncidents: number;
    suspiciousActivity: number;
    failedAuthentications: number;
  };
}

// Create Supabase client for database queries
async function createSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    ENV_VARS.SUPABASE_URL,
    ENV_VARS.SUPABASE_SERVICE_ROLE_KEY
  );
}


// Fetch search metrics from database
async function fetchSearchMetrics(supabase: any, timeRange: string, specialty?: string): Promise<DatabaseMetrics['searchHistory']> {

  // Basic search statistics
  const { data: searchStats } = await supabase
    .from('search_history')
    .select('search_time_ms, result_count, cache_hit, query, specialty, providers_used')
    .gte('created_at', timeRange === 'hour' ? new Date(Date.now() - 60 * 60 * 1000).toISOString() :
         timeRange === 'day' ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() :
         timeRange === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
         new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  const filteredStats = specialty ? searchStats?.filter(s => s.specialty === specialty) : searchStats;

  if (!filteredStats || filteredStats.length === 0) {
    return {
      totalSearches: 0,
      avgSearchTime: 0,
      avgResultCount: 0,
      cacheHitRate: 0,
      topQueries: [],
      searchesBySpecialty: {}
    };
  }

  // Calculate metrics
  const totalSearches = filteredStats.length;
  const avgSearchTime = filteredStats.reduce((sum, s) => sum + s.search_time_ms, 0) / totalSearches;
  const avgResultCount = filteredStats.reduce((sum, s) => sum + s.result_count, 0) / totalSearches;
  const cacheHits = filteredStats.filter(s => s.cache_hit).length;
  const cacheHitRate = cacheHits / totalSearches;

  // Top queries (anonymized)
  const queryCount: Record<string, number> = {};
  const searchesBySpecialty: Record<string, number> = {};

  filteredStats.forEach(search => {
    // Count queries (truncated for privacy)
    const truncatedQuery = search.query.substring(0, 20) + (search.query.length > 20 ? '...' : '');
    queryCount[truncatedQuery] = (queryCount[truncatedQuery] || 0) + 1;

    // Count by specialty
    if (search.specialty) {
      searchesBySpecialty[search.specialty] = (searchesBySpecialty[search.specialty] || 0) + 1;
    }
  });

  const topQueries = Object.entries(queryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  return {
    totalSearches,
    avgSearchTime: Math.round(avgSearchTime),
    avgResultCount: Math.round(avgResultCount * 100) / 100,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    topQueries,
    searchesBySpecialty
  };
}

// Fetch API performance metrics from database
async function fetchApiPerformanceMetrics(supabase: any, timeRange: string): Promise<DatabaseMetrics['apiPerformance']> {
  const { data: perfStats } = await supabase
    .from('api_performance_metrics')
    .select('function_name, duration_ms, success, error_type')
    .gte('created_at', timeRange === 'hour' ? new Date(Date.now() - 60 * 60 * 1000).toISOString() :
         timeRange === 'day' ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() :
         timeRange === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
         new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (!perfStats || perfStats.length === 0) {
    return {
      totalRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      errorsByFunction: {},
      slowRequestsByFunction: {}
    };
  }

  const totalRequests = perfStats.length;
  const successfulRequests = perfStats.filter(p => p.success).length;
  const avgResponseTime = perfStats.reduce((sum, p) => sum + p.duration_ms, 0) / totalRequests;

  const errorsByFunction: Record<string, number> = {};
  const slowRequestsByFunction: Record<string, number> = {};

  perfStats.forEach(perf => {
    if (!perf.success) {
      errorsByFunction[perf.function_name] = (errorsByFunction[perf.function_name] || 0) + 1;
    }
    
    if (perf.duration_ms > 10000) { // Requests slower than 10 seconds
      slowRequestsByFunction[perf.function_name] = (slowRequestsByFunction[perf.function_name] || 0) + 1;
    }
  });

  return {
    totalRequests,
    successRate: Math.round((successfulRequests / totalRequests) * 100) / 100,
    avgResponseTime: Math.round(avgResponseTime),
    errorsByFunction,
    slowRequestsByFunction
  };
}

// Fetch content quality metrics from database
async function fetchContentQualityMetrics(supabase: any, timeRange: string, specialty?: string): Promise<DatabaseMetrics['contentQuality']> {
  const { data: qualityStats } = await supabase
    .from('content_quality_metrics')
    .select('specialty, evidence_level, citation_accuracy, medical_accuracy, user_feedback')
    .gte('created_at', timeRange === 'hour' ? new Date(Date.now() - 60 * 60 * 1000).toISOString() :
         timeRange === 'day' ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() :
         timeRange === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
         new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const filteredStats = specialty ? qualityStats?.filter(q => q.specialty === specialty) : qualityStats;

  if (!filteredStats || filteredStats.length === 0) {
    return {
      totalContentItems: 0,
      avgQualityScore: 0,
      qualityBySpecialty: {},
      qualityByEvidenceLevel: {},
      userFeedback: {}
    };
  }

  const totalContentItems = filteredStats.length;
  const avgQualityScore = filteredStats.reduce((sum, q) => 
    sum + ((q.citation_accuracy + q.medical_accuracy) / 2), 0) / totalContentItems;

  const qualityBySpecialty: Record<string, number> = {};
  const qualityByEvidenceLevel: Record<string, number> = {};
  const userFeedback: Record<string, number> = {};

  filteredStats.forEach(quality => {
    const score = (quality.citation_accuracy + quality.medical_accuracy) / 2;
    
    // Quality by specialty
    if (!qualityBySpecialty[quality.specialty]) {
      qualityBySpecialty[quality.specialty] = 0;
    }
    qualityBySpecialty[quality.specialty] = 
      (qualityBySpecialty[quality.specialty] + score) / 2;

    // Quality by evidence level
    if (!qualityByEvidenceLevel[quality.evidence_level]) {
      qualityByEvidenceLevel[quality.evidence_level] = 0;
    }
    qualityByEvidenceLevel[quality.evidence_level] = 
      (qualityByEvidenceLevel[quality.evidence_level] + score) / 2;

    // User feedback
    if (quality.user_feedback) {
      userFeedback[quality.user_feedback] = (userFeedback[quality.user_feedback] || 0) + 1;
    }
  });

  return {
    totalContentItems,
    avgQualityScore: Math.round(avgQualityScore * 100) / 100,
    qualityBySpecialty,
    qualityByEvidenceLevel,
    userFeedback
  };
}

// Fetch security metrics from database
async function fetchSecurityMetrics(supabase: any, timeRange: string): Promise<DatabaseMetrics['security']> {
  const timeFilter = timeRange === 'hour' ? new Date(Date.now() - 60 * 60 * 1000).toISOString() :
                     timeRange === 'day' ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() :
                     timeRange === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() :
                     new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Rate limit events
  const { data: rateLimitEvents } = await supabase
    .from('rate_limit_events')
    .select('id')
    .gte('created_at', timeFilter);

  // Security incidents
  const { data: securityIncidents } = await supabase
    .from('security_incidents')
    .select('id, severity')
    .gte('created_at', timeFilter);

  // Failed authentications (from error logs)
  const { data: authErrors } = await supabase
    .from('api_error_logs')
    .select('id')
    .gte('created_at', timeFilter)
    .or('error_type.eq.AuthenticationError,error_type.eq.AuthorizationError');

  const suspiciousActivity = securityIncidents?.filter(i => 
    i.severity === 'high' || i.severity === 'critical').length || 0;

  return {
    rateLimitEvents: rateLimitEvents?.length || 0,
    securityIncidents: securityIncidents?.length || 0,
    suspiciousActivity,
    failedAuthentications: authErrors?.length || 0
  };
}

// Generate comprehensive dashboard data
async function generateDashboardData(query: DashboardQuery): Promise<{
  realTimeMetrics: ReturnType<typeof generateMonitoringReport>;
  databaseMetrics: DatabaseMetrics;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    alerts: string[];
    uptime: number;
    version: string;
  };
}> {
  const supabase = await createSupabaseClient();
  const timeRange = query.timeRange || 'day';

  // Get real-time metrics from monitoring utility
  const realTimeMetrics = generateMonitoringReport();

  // Fetch database metrics
  const [searchMetrics, apiMetrics, qualityMetrics, securityMetrics] = await Promise.all([
    fetchSearchMetrics(supabase, timeRange, query.specialty),
    fetchApiPerformanceMetrics(supabase, timeRange),
    fetchContentQualityMetrics(supabase, timeRange, query.specialty),
    fetchSecurityMetrics(supabase, timeRange)
  ]);

  const databaseMetrics: DatabaseMetrics = {
    searchHistory: searchMetrics,
    apiPerformance: apiMetrics,
    contentQuality: qualityMetrics,
    security: securityMetrics
  };

  // Determine system health
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  const alerts: string[] = [];

  if (apiMetrics.successRate < 0.95) {
    status = apiMetrics.successRate < 0.9 ? 'critical' : 'warning';
    alerts.push(`API success rate: ${(apiMetrics.successRate * 100).toFixed(1)}%`);
  }

  if (apiMetrics.avgResponseTime > 10000) {
    status = status === 'healthy' ? 'warning' : status;
    alerts.push(`High average response time: ${apiMetrics.avgResponseTime}ms`);
  }

  if (qualityMetrics.avgQualityScore < 0.8) {
    status = status === 'healthy' ? 'warning' : status;
    alerts.push(`Low content quality score: ${(qualityMetrics.avgQualityScore * 100).toFixed(1)}%`);
  }

  if (securityMetrics.suspiciousActivity > 0) {
    status = 'warning';
    alerts.push(`${securityMetrics.suspiciousActivity} suspicious security incidents`);
  }

  const systemHealth = {
    status,
    alerts,
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  };

  return {
    realTimeMetrics,
    databaseMetrics,
    systemHealth
  };
}

// Main handler
const handler = withAuth(async (event: HandlerEvent, user: UserPayload) => {
  try {
    // Require admin or medical professional role for monitoring access
    requireAnyRole(user, ['admin', 'medical_professional']);

    const { method, query } = parseRequest(event);
    
    if (method !== 'GET') {
      return createErrorResponse('Method not allowed', 405);
    }

    const dashboardQuery: DashboardQuery = {
      timeRange: (query.timeRange as any) || 'day',
      metrics: query.metrics ? query.metrics.split(',') : undefined,
      specialty: query.specialty,
      userType: (query.userType as any) || 'all'
    };

    logInfo('Monitoring dashboard access', {
      userId: user.id,
      userType: user.role,
      specialty: user.specialty,
      query: dashboardQuery
    });

    // Generate dashboard data
    const dashboardData = await generateDashboardData(dashboardQuery);

    // Add request metadata
    const response = {
      ...dashboardData,
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: {
          id: user.id,
          role: user.role,
          specialty: user.specialty
        },
        query: dashboardQuery,
        dataFreshness: {
          realTime: 'current',
          database: `${dashboardQuery.timeRange} range`,
          lastUpdate: new Date().toISOString()
        }
      }
    };

    return createSuccessResponse(response);

  } catch (error) {
    logError('Monitoring dashboard error', {
      userId: user?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return createErrorResponse('Failed to generate monitoring dashboard', 500);
  }
});

export { handler };