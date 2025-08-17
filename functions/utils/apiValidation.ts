/**
 * API Validation Utilities
 * Provides comprehensive validation and testing for external API integrations
 */

import { ENV_VARS, validateEnvironmentVariables, getAPIKeys, hasAPIKeyPool, getAPIKeyInfo } from './constants';
import { logInfo, logError } from './logger';
import { getAllPoolStats } from './apiKeyPool';

export interface APIValidationResult {
  isValid: boolean;
  provider: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  responseTime?: number;
}

export interface APIHealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  results: APIValidationResult[];
  environmentStatus: ReturnType<typeof validateEnvironmentVariables>;
  keyPoolStatus: {
    enabled: boolean;
    poolStats: ReturnType<typeof getAllPoolStats>;
    keyInfo: ReturnType<typeof getAPIKeyInfo>;
  };
}

/**
 * Validate Brave Search API configuration and connectivity
 */
export async function validateBraveAPI(): Promise<APIValidationResult> {
  const startTime = Date.now();
  
  try {
    const apiKey = ENV_VARS.BRAVE_API_KEY;
    
    if (!apiKey) {
      return {
        isValid: false,
        provider: 'brave',
        status: 'error',
        message: 'Brave API key not configured',
        details: {
          hasViteKey: !!process.env.VITE_BRAVE_API_KEY,
          hasServerKey: !!process.env.BRAVE_API_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      };
    }

    if (apiKey.length < 20) {
      return {
        isValid: false,
        provider: 'brave',
        status: 'error',
        message: 'Brave API key appears to be invalid (too short)',
        details: {
          keyLength: apiKey.length,
          expectedMinLength: 20
        }
      };
    }

    // Test API connectivity with a simple search
    const testResponse = await fetch('https://api.search.brave.com/res/v1/web/search?q=test&count=1', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey,
        'User-Agent': 'MediMind-Expert/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (!testResponse.ok) {
      const errorText = await testResponse.text().catch(() => 'Unable to read error response');
      
      return {
        isValid: false,
        provider: 'brave',
        status: 'error',
        message: `Brave API connectivity test failed: ${testResponse.status} ${testResponse.statusText}`,
        details: {
          status: testResponse.status,
          statusText: testResponse.statusText,
          errorBody: errorText.substring(0, 500),
          headers: {
            contentType: testResponse.headers.get('content-type'),
            rateLimitRemaining: testResponse.headers.get('x-ratelimit-remaining'),
            rateLimitReset: testResponse.headers.get('x-ratelimit-reset')
          }
        },
        responseTime
      };
    }

    const responseData = await testResponse.json();
    
    return {
      isValid: true,
      provider: 'brave',
      status: 'success',
      message: 'Brave API is configured and accessible',
      details: {
        hasResults: !!responseData.web?.results?.length,
        rateLimitRemaining: testResponse.headers.get('x-ratelimit-remaining'),
        rateLimitReset: testResponse.headers.get('x-ratelimit-reset')
      },
      responseTime
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      isValid: false,
      provider: 'brave',
      status: 'error',
      message: `Brave API validation failed: ${errorMessage}`,
      details: {
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      },
      responseTime
    };
  }
}

/**
 * Validate all search API configurations
 */
export async function validateSearchAPIs(): Promise<APIValidationResult[]> {
  const validationPromises: Promise<APIValidationResult>[] = [];
  
  // Add Brave API validation
  validationPromises.push(validateBraveAPI());
  
  // Add other API validations (Perplexity, Exa) as needed
  validationPromises.push(validatePerplexityAPI());
  validationPromises.push(validateExaAPI());
  
  const results = await Promise.allSettled(validationPromises);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      const providers = ['brave', 'perplexity', 'exa'];
      return {
        isValid: false,
        provider: providers[index] || 'unknown',
        status: 'error' as const,
        message: `Validation promise rejected: ${result.reason?.message || 'Unknown error'}`,
        details: { error: result.reason }
      };
    }
  });
}

/**
 * Validate Perplexity API (placeholder)
 */
async function validatePerplexityAPI(): Promise<APIValidationResult> {
  const apiKey = ENV_VARS.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    return {
      isValid: false,
      provider: 'perplexity',
      status: 'warning',
      message: 'Perplexity API key not configured'
    };
  }
  
  // For now, just check if key exists and has reasonable length
  return {
    isValid: apiKey.length > 10,
    provider: 'perplexity',
    status: apiKey.length > 10 ? 'success' : 'error',
    message: apiKey.length > 10 ? 'Perplexity API key configured' : 'Perplexity API key appears invalid'
  };
}

/**
 * Validate Exa API (placeholder)
 */
async function validateExaAPI(): Promise<APIValidationResult> {
  const apiKey = ENV_VARS.EXA_API_KEY;
  
  if (!apiKey) {
    return {
      isValid: false,
      provider: 'exa',
      status: 'warning',
      message: 'Exa API key not configured'
    };
  }
  
  // For now, just check if key exists and has reasonable length
  return {
    isValid: apiKey.length > 10,
    provider: 'exa',
    status: apiKey.length > 10 ? 'success' : 'error',
    message: apiKey.length > 10 ? 'Exa API key configured' : 'Exa API key appears invalid'
  };
}

/**
 * Generate a comprehensive API health report
 */
export async function generateAPIHealthReport(): Promise<APIHealthReport> {
  const environmentStatus = validateEnvironmentVariables();
  const apiResults = await validateSearchAPIs();
  
  // Determine overall health status
  const hasError = apiResults.some(r => r.status === 'error');
  const hasWarning = apiResults.some(r => r.status === 'warning');
  const hasCriticalEnvIssues = !environmentStatus.isValid;
  
  let overall: APIHealthReport['overall'];
  if (hasError || hasCriticalEnvIssues) {
    overall = 'critical';
  } else if (hasWarning) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }
  
  // Collect API key pool status
  const keyInfo = getAPIKeyInfo();
  const poolStats = getAllPoolStats();
  const hasAnyPool = Object.values(keyInfo).some(info => info.hasPool);

  const report: APIHealthReport = {
    overall,
    timestamp: new Date().toISOString(),
    results: apiResults,
    environmentStatus,
    keyPoolStatus: {
      enabled: hasAnyPool,
      poolStats,
      keyInfo
    }
  };
  
  logInfo('API Health Report Generated', {
    overall: report.overall,
    totalAPIs: apiResults.length,
    successfulAPIs: apiResults.filter(r => r.status === 'success').length,
    environmentValid: environmentStatus.isValid,
    poolsEnabled: hasAnyPool,
    totalPools: poolStats.length
  });
  
  return report;
}

/**
 * Quick validation for debugging - logs results to console
 */
export async function debugAPIStatus(): Promise<void> {
  console.group('🔧 API Status Debug');
  
  try {
    const report = await generateAPIHealthReport();
    
    console.log('📊 Overall Status:', report.overall.toUpperCase());
    console.log('🕐 Timestamp:', report.timestamp);
    
    console.group('🌍 Environment Status');
    console.log('Valid:', report.environmentStatus.isValid);
    if (report.environmentStatus.criticalMissing.length > 0) {
      console.log('❌ Critical missing:', report.environmentStatus.criticalMissing);
    }
    if (report.environmentStatus.optionalMissing.length > 0) {
      console.log('⚠️ Optional missing:', report.environmentStatus.optionalMissing);
    }
    console.groupEnd();
    
    console.group('🔍 API Status');
    report.results.forEach(result => {
      const statusIcon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${result.provider.toUpperCase()}:`, result.message);
      if (result.responseTime) {
        console.log(`   Response time: ${result.responseTime}ms`);
      }
      if (result.details && Object.keys(result.details).length > 0) {
        console.log('   Details:', result.details);
      }
    });
    console.groupEnd();
    
    console.group('🔄 API Key Pool Status');
    console.log('Pool System Enabled:', report.keyPoolStatus.enabled);
    
    // Display key configuration info
    Object.entries(report.keyPoolStatus.keyInfo).forEach(([provider, info]) => {
      const poolIcon = info.hasPool ? '🔄' : '🔑';
      console.log(`${poolIcon} ${provider.toUpperCase()}:`, {
        hasPool: info.hasPool,
        keyCount: info.keyCount,
        hasSingle: info.hasSingle
      });
    });
    
    // Display active pool statistics
    if (report.keyPoolStatus.poolStats.length > 0) {
      console.group('📊 Pool Statistics');
      report.keyPoolStatus.poolStats.forEach(stats => {
        console.log(`🔄 ${stats.provider.toUpperCase()} Pool:`, {
          totalKeys: stats.totalKeys,
          healthyKeys: stats.healthyKeys,
          activeKeys: stats.activeKeys,
          rateLimitedKeys: stats.rateLimitedKeys,
          circuitBreakerKeys: stats.circuitBreakerKeys,
          totalRequests: stats.totalRequests,
          totalFailures: stats.totalFailures,
          averageResponseTime: Math.round(stats.averageResponseTime) + 'ms'
        });
      });
      console.groupEnd();
    }
    console.groupEnd();
    
  } catch (error) {
    console.error('❌ Failed to generate API status report:', error);
  } finally {
    console.groupEnd();
  }
}