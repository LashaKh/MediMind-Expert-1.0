/**
 * Performance Metrics Collection API
 * Collects and stores performance data for medical news monitoring
 */

import { Handler } from '@netlify/functions';
import { corsHeaders } from './utils/cors';
import { logger } from './utils/logger';
import { supabase } from './utils/supabase';

interface PerformanceMetricPayload {
  sessionId: string;
  userId?: string;
  specialty?: string;
  timestamp: number;
  pageLoadMetrics: Array<{
    name: string;
    value: number;
    medicalContent?: boolean;
  }>;
  apiMetrics: Array<{
    name: string;
    value: number;
    endpoint?: string;
  }>;
  webVitals: Array<{
    name: string;
    value: number;
    rating: string;
  }>;
  medicalContentPerformance: {
    newsLoadTime: number;
    calculatorResponseTime: number;
    searchResultsTime: number;
    imageLoadTime: number;
  };
  networkInfo: {
    effectiveType: string;
    rtt: number;
    downlink: number;
  };
  deviceInfo: {
    isMobile: boolean;
    memory?: number;
    cores?: number;
  };
  errors?: Array<{
    type: string;
    message: string;
    stack?: string;
  }>;
}

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload: PerformanceMetricPayload = JSON.parse(event.body || '{}');
    
    // Validate payload
    if (!payload.sessionId || !payload.timestamp) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid payload',
          message: 'sessionId and timestamp are required'
        })
      };
    }

    // Process and store metrics
    await storePerformanceMetrics(payload);
    
    // Log for monitoring
    logger.info('Performance metrics collected', {
      sessionId: payload.sessionId,
      specialty: payload.specialty,
      pageLoadCount: payload.pageLoadMetrics.length,
      apiMetricsCount: payload.apiMetrics.length,
      webVitalsCount: payload.webVitals.length,
      errorCount: payload.errors?.length || 0
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: true,
        message: 'Performance metrics stored successfully'
      })
    };

  } catch (error) {
    logger.error('Performance metrics collection failed', {
      error: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to process performance metrics'
      })
    };
  }
};

/**
 * Store performance metrics in database
 */
async function storePerformanceMetrics(payload: PerformanceMetricPayload): Promise<void> {
  const { data: session, error: sessionError } = await supabase
    .from('performance_sessions')
    .upsert({
      session_id: payload.sessionId,
      user_id: payload.userId,
      specialty: payload.specialty,
      timestamp: new Date(payload.timestamp).toISOString(),
      device_info: payload.deviceInfo,
      network_info: payload.networkInfo,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'session_id'
    });

  if (sessionError) {
    throw new Error(`Failed to store session: ${sessionError.message}`);
  }

  // Store page load metrics
  if (payload.pageLoadMetrics.length > 0) {
    const pageLoadData = payload.pageLoadMetrics.map(metric => ({
      session_id: payload.sessionId,
      metric_name: metric.name,
      metric_value: metric.value,
      medical_content: metric.medicalContent || false,
      timestamp: new Date().toISOString()
    }));

    const { error: pageLoadError } = await supabase
      .from('performance_page_load_metrics')
      .insert(pageLoadData);

    if (pageLoadError) {
      logger.error('Failed to store page load metrics', pageLoadError);
    }
  }

  // Store API metrics
  if (payload.apiMetrics.length > 0) {
    const apiData = payload.apiMetrics.map(metric => ({
      session_id: payload.sessionId,
      metric_name: metric.name,
      metric_value: metric.value,
      endpoint: metric.endpoint,
      timestamp: new Date().toISOString()
    }));

    const { error: apiError } = await supabase
      .from('performance_api_metrics')
      .insert(apiData);

    if (apiError) {
      logger.error('Failed to store API metrics', apiError);
    }
  }

  // Store Web Vitals
  if (payload.webVitals.length > 0) {
    const vitalsData = payload.webVitals.map(vital => ({
      session_id: payload.sessionId,
      vital_name: vital.name,
      vital_value: vital.value,
      rating: vital.rating,
      timestamp: new Date().toISOString()
    }));

    const { error: vitalsError } = await supabase
      .from('performance_web_vitals')
      .insert(vitalsData);

    if (vitalsError) {
      logger.error('Failed to store web vitals', vitalsError);
    }
  }

  // Store medical content performance
  const { error: medicalError } = await supabase
    .from('performance_medical_content')
    .insert({
      session_id: payload.sessionId,
      news_load_time: payload.medicalContentPerformance.newsLoadTime,
      calculator_response_time: payload.medicalContentPerformance.calculatorResponseTime,
      search_results_time: payload.medicalContentPerformance.searchResultsTime,
      image_load_time: payload.medicalContentPerformance.imageLoadTime,
      timestamp: new Date().toISOString()
    });

  if (medicalError) {
    logger.error('Failed to store medical content performance', medicalError);
  }

  // Store errors if present
  if (payload.errors && payload.errors.length > 0) {
    const errorData = payload.errors.map(error => ({
      session_id: payload.sessionId,
      error_type: error.type,
      error_message: error.message,
      error_stack: error.stack,
      timestamp: new Date().toISOString()
    }));

    const { error: errorInsertError } = await supabase
      .from('performance_errors')
      .insert(errorData);

    if (errorInsertError) {
      logger.error('Failed to store error metrics', errorInsertError);
    }
  }
}

/**
 * Get performance analytics
 */
export async function getPerformanceAnalytics(
  timeframe: '1h' | '24h' | '7d' | '30d' = '24h',
  specialty?: string
): Promise<any> {
  const timeframeDays = {
    '1h': 1/24,
    '24h': 1,
    '7d': 7,
    '30d': 30
  };

  const since = new Date();
  since.setDate(since.getDate() - timeframeDays[timeframe]);

  try {
    // Get session data
    let sessionQuery = supabase
      .from('performance_sessions')
      .select('*')
      .gte('timestamp', since.toISOString());

    if (specialty) {
      sessionQuery = sessionQuery.eq('specialty', specialty);
    }

    const { data: sessions, error: sessionError } = await sessionQuery;
    
    if (sessionError) throw sessionError;

    // Get aggregated metrics
    const sessionIds = sessions.map(s => s.session_id);
    
    const [pageLoadData, apiData, vitalsData, medicalData] = await Promise.all([
      supabase
        .from('performance_page_load_metrics')
        .select('*')
        .in('session_id', sessionIds)
        .gte('timestamp', since.toISOString()),
      
      supabase
        .from('performance_api_metrics')
        .select('*')
        .in('session_id', sessionIds)
        .gte('timestamp', since.toISOString()),
      
      supabase
        .from('performance_web_vitals')
        .select('*')
        .in('session_id', sessionIds)
        .gte('timestamp', since.toISOString()),
      
      supabase
        .from('performance_medical_content')
        .select('*')
        .in('session_id', sessionIds)
        .gte('timestamp', since.toISOString())
    ]);

    return {
      timeframe,
      specialty,
      sessionCount: sessions.length,
      pageLoadMetrics: pageLoadData.data || [],
      apiMetrics: apiData.data || [],
      webVitals: vitalsData.data || [],
      medicalContentMetrics: medicalData.data || [],
      aggregations: {
        avgPageLoad: calculateAverage(pageLoadData.data || [], 'metric_value'),
        avgApiResponse: calculateAverage(apiData.data || [], 'metric_value'),
        medicalNewsAvgLoad: calculateAverage(
          (medicalData.data || []).map(m => m.news_load_time).filter(t => t > 0)
        )
      }
    };
  } catch (error) {
    logger.error('Failed to get performance analytics', error);
    throw error;
  }
}

function calculateAverage(values: any[], field?: string): number {
  if (values.length === 0) return 0;
  
  const nums = field 
    ? values.map(v => v[field]).filter(v => typeof v === 'number')
    : values.filter(v => typeof v === 'number');
    
  return nums.length > 0 ? nums.reduce((sum, val) => sum + val, 0) / nums.length : 0;
}