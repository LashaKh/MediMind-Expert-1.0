/**
 * Netlify Function: ClinicalTrials.gov API Proxy
 * Provides secure access to ClinicalTrials.gov API v2 with caching and error handling
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface ClinicalTrialsRequest {
  query: string;
  filters?: {
    recruitmentStatus?: string[];
    phase?: string[];
    location?: {
      address: string;
      radius?: number;
    };
    ageRange?: {
      min?: number;
      max?: number;
    };
    gender?: 'all' | 'male' | 'female';
  };
  pageSize?: number;
  pageToken?: string;
  fields?: string[];
}

// Simple in-memory cache for development
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // CORS headers for browser compatibility
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  // Validate request method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const request: ClinicalTrialsRequest = JSON.parse(event.body || '{}');
    
    // Input validation
    if (!request.query || request.query.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter is required' })
      };
    }

    // Check cache first
    const cacheKey = JSON.stringify(request);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached response');
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=3600'
        },
        body: JSON.stringify(cached.data)
      };
    }

    // Build query parameters
    const params = buildQueryParams(request);
    
    // Make API request with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const apiUrl = `https://clinicaltrials.gov/api/v2/studies?${params}`;
    console.log('Calling ClinicalTrials.gov API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MediMindExpert/1.0'
      }
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ClinicalTrials.gov API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform and enhance data
    const enhancedData = await enhanceTrialData(data, request);
    
    // Cache the response
    cache.set(cacheKey, { data: enhancedData, timestamp: Date.now() });
    
    // Clean old cache entries
    cleanCache();
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify(enhancedData)
    };
  } catch (error: any) {
    console.error('Clinical trials search error:', error);
    
    // Determine error type and response
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.name === 'AbortError') {
      statusCode = 504;
      errorMessage = 'Request timeout';
    } else if (error.message.includes('API error')) {
      statusCode = 502;
      errorMessage = 'External API error';
    }
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

function buildQueryParams(request: ClinicalTrialsRequest): URLSearchParams {
  const params = new URLSearchParams();
  
  // Basic search parameters
  params.append('query.cond', request.query);
  params.append('pageSize', (request.pageSize || 20).toString());
  
  if (request.pageToken) {
    params.append('pageToken', request.pageToken);
  }
  
  // Status filtering
  if (request.filters?.recruitmentStatus && request.filters.recruitmentStatus.length > 0) {
    const statusMap: Record<string, string> = {
      'recruiting': 'RECRUITING',
      'active': 'ACTIVE_NOT_RECRUITING',
      'completed': 'COMPLETED',
      'terminated': 'TERMINATED',
      'suspended': 'SUSPENDED',
      'withdrawn': 'WITHDRAWN'
    };
    
    const statuses = request.filters.recruitmentStatus
      .map(s => statusMap[s] || s.toUpperCase())
      .join('|');
    
    params.append('filter.overallStatus', statuses);
  } else {
    // Default to actively recruiting studies
    params.append('filter.overallStatus', 'RECRUITING|ACTIVE_NOT_RECRUITING|ENROLLING_BY_INVITATION');
  }
  
  // Phase filtering
  if (request.filters?.phase && request.filters.phase.length > 0) {
    const phaseFilter = request.filters.phase
      .map(p => `AREA[Phase]${p.toUpperCase().replace('PHASE', 'PHASE')}`)
      .join(' OR ');
    params.append('filter.advanced', phaseFilter);
  }
  
  // Location filtering
  if (request.filters?.location) {
    params.append('filter.geo.location', request.filters.location.address);
    params.append('filter.geo.distance', (request.filters.location.radius || 50).toString());
  }
  
  // Age filtering
  if (request.filters?.ageRange) {
    const ageFilter = [];
    if (request.filters.ageRange.min !== undefined) {
      ageFilter.push(`AREA[MinimumAge]RANGE[MIN, ${request.filters.ageRange.min} years]`);
    }
    if (request.filters.ageRange.max !== undefined) {
      ageFilter.push(`AREA[MaximumAge]RANGE[${request.filters.ageRange.max} years, MAX]`);
    }
    if (ageFilter.length > 0) {
      const existingAdvanced = params.get('filter.advanced');
      const combinedFilter = existingAdvanced 
        ? `(${existingAdvanced}) AND (${ageFilter.join(' AND ')})`
        : ageFilter.join(' AND ');
      params.set('filter.advanced', combinedFilter);
    }
  }
  
  // Gender filtering
  if (request.filters?.gender && request.filters.gender !== 'all') {
    const genderFilter = `AREA[Sex]${request.filters.gender.toUpperCase()}`;
    const existingAdvanced = params.get('filter.advanced');
    const combinedFilter = existingAdvanced 
      ? `(${existingAdvanced}) AND ${genderFilter}`
      : genderFilter;
    params.set('filter.advanced', combinedFilter);
  }
  
  // Field selection for optimization
  if (request.fields && request.fields.length > 0) {
    params.append('fields', request.fields.join(','));
  } else {
    // Default optimized field list
    params.append('fields', [
      'NCTId',
      'BriefTitle',
      'OfficialTitle',
      'OverallStatus',
      'LeadSponsorName',
      'LeadSponsorClass',
      'Condition',
      'Phase',
      'EnrollmentCount',
      'EnrollmentType',
      'StartDate',
      'StartDateType',
      'PrimaryCompletionDate',
      'PrimaryCompletionDateType',
      'LastUpdatePostDate',
      'LocationCity',
      'LocationState',
      'LocationCountry',
      'MinimumAge',
      'MaximumAge',
      'Gender',
      'HealthyVolunteers',
      'BriefSummary',
      'PrimaryOutcomeMeasure'
    ].join(','));
  }
  
  // Always include count for pagination
  params.append('countTotal', 'true');
  
  return params;
}

async function enhanceTrialData(data: any, request: ClinicalTrialsRequest): Promise<any> {
  // Add metadata about the search
  const enhanced = {
    ...data,
    searchMetadata: {
      query: request.query,
      filters: request.filters,
      timestamp: new Date().toISOString(),
      totalResults: data.totalCount || 0,
      hasMoreResults: !!data.nextPageToken
    }
  };
  
  // Enhance individual studies with calculated fields
  if (enhanced.studies && Array.isArray(enhanced.studies)) {
    enhanced.studies = enhanced.studies.map((study: any) => {
      const enrollmentCount = study.protocolSection?.designModule?.enrollmentInfo?.count || 0;
      const startDate = study.protocolSection?.statusModule?.startDateStruct?.date;
      const completionDate = study.protocolSection?.statusModule?.primaryCompletionDateStruct?.date;
      
      return {
        ...study,
        _enhanced: {
          enrollmentSize: categorizeEnrollmentSize(enrollmentCount),
          duration: calculateStudyDuration(startDate, completionDate),
          isActivelyRecruiting: isActivelyRecruiting(study.protocolSection?.statusModule?.overallStatus),
          locationCount: study.protocolSection?.contactsLocationsModule?.locations?.length || 0
        }
      };
    });
  }
  
  return enhanced;
}

function categorizeEnrollmentSize(count: number): string {
  if (count < 50) return 'small';
  if (count < 200) return 'medium';
  if (count < 1000) return 'large';
  return 'very-large';
}

function calculateStudyDuration(startDate?: string, completionDate?: string): string | null {
  if (!startDate || !completionDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(completionDate);
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (months < 12) return `${months} months`;
  const years = Math.round(months / 12);
  return `${years} year${years > 1 ? 's' : ''}`;
}

function isActivelyRecruiting(status?: string): boolean {
  return ['RECRUITING', 'ENROLLING_BY_INVITATION'].includes(status || '');
}

function cleanCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}