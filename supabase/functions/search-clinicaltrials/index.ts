/**
 * Clinical Trials Search - Supabase Edge Function
 * Secure proxy for ClinicalTrials.gov API with medical-specific filtering
 * Migrated from Netlify Functions to Supabase Edge Functions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Simple in-memory cache for Clinical Trials results
const clinicalTrialsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes (clinical trials data doesn't change frequently)

interface ClinicalTrialSearchParams {
  query: string;
  condition?: string;
  intervention?: string;
  outcome?: string;
  sponsor?: string;
  collaborator?: string;
  sex?: 'ALL' | 'FEMALE' | 'MALE';
  age?: 'CHILD' | 'ADULT' | 'OLDER_ADULT';
  phase?: 'EARLY_PHASE1' | 'PHASE1' | 'PHASE2' | 'PHASE3' | 'PHASE4';
  funder?: 'FED' | 'INDUS' | 'OTHER' | 'NIH';
  type?: 'INTERVENTIONAL' | 'OBSERVATIONAL' | 'PATIENT_REGISTRY';
  status?: 'ACTIVE_NOT_RECRUITING' | 'COMPLETED' | 'ENROLLING_BY_INVITATION' | 'NOT_YET_RECRUITING' | 'RECRUITING' | 'SUSPENDED' | 'TERMINATED' | 'WITHDRAWN';
  results?: 'WITH' | 'WITHOUT';
  start?: string; // YYYY-MM-DD format
  end?: string; // YYYY-MM-DD format
  pageSize?: number;
  pageToken?: string;
  filters?: {
    specialty?: string;
    evidenceLevel?: string[];
    contentType?: string[];
    recency?: string;
    limit?: number;
    offset?: number;
  };
}

interface ClinicalTrial {
  protocolSection: {
    identificationModule: {
      nctId: string;
      orgStudyIdInfo: {
        id: string;
      };
      briefTitle: string;
      officialTitle?: string;
    };
    statusModule: {
      statusVerifiedDate: string;
      overallStatus: string;
      lastUpdatePostDate: {
        date: string;
      };
      studyFirstPostDate: {
        date: string;
      };
    };
    sponsorCollaboratorsModule: {
      leadSponsor: {
        name: string;
        class: string;
      };
      collaborators?: Array<{
        name: string;
        class: string;
      }>;
    };
    oversightModule?: {
      fdaRegulatedDrug?: boolean;
      fdaRegulatedDevice?: boolean;
      isUsExport?: boolean;
      isFdaRegulatedDrug?: boolean;
      isFdaRegulatedDevice?: boolean;
    };
    descriptionModule?: {
      briefSummary: string;
      detailedDescription?: string;
    };
    conditionsModule?: {
      conditions: string[];
      keywords?: string[];
    };
    designModule?: {
      studyType: string;
      phases?: string[];
      designInfo?: {
        allocation?: string;
        interventionModel?: string;
        interventionModelDescription?: string;
        primaryPurpose?: string;
        observationalModel?: string;
        timePerspective?: string;
        masking?: {
          masking?: string;
          maskingDescription?: string;
          whoMasked?: string[];
        };
      };
      enrollmentInfo?: {
        count: number;
        type: string;
      };
    };
    armsInterventionsModule?: {
      armGroups?: Array<{
        label: string;
        type: string;
        description?: string;
        interventionNames?: string[];
      }>;
      interventions?: Array<{
        type: string;
        name: string;
        description?: string;
        armGroupLabels?: string[];
        otherNames?: string[];
      }>;
    };
    outcomesModule?: {
      primaryOutcomes?: Array<{
        measure: string;
        description?: string;
        timeFrame?: string;
      }>;
      secondaryOutcomes?: Array<{
        measure: string;
        description?: string;
        timeFrame?: string;
      }>;
    };
    eligibilityModule?: {
      eligibilityCriteria?: string;
      healthyVolunteers?: boolean;
      sex?: string;
      minimumAge?: string;
      maximumAge?: string;
      stdAges?: string[];
    };
    contactsLocationsModule?: {
      centralContacts?: Array<{
        name?: string;
        role?: string;
        phone?: string;
        email?: string;
      }>;
      overallOfficials?: Array<{
        name: string;
        affiliation?: string;
        role: string;
      }>;
      locations?: Array<{
        facility?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        contacts?: Array<{
          name?: string;
          role?: string;
          phone?: string;
          email?: string;
        }>;
        geoPoint?: {
          lat: number;
          lon: number;
        };
      }>;
    };
  };
  hasResults?: boolean;
}

interface ClinicalTrialsResponse {
  studies: ClinicalTrial[];
  totalCount: number;
  nextPageToken?: string;
}

function generateClinicalTrialsCacheKey(params: ClinicalTrialSearchParams): string {
  const keyData = {
    query: params.query.toLowerCase().trim(),
    condition: params.condition?.toLowerCase(),
    intervention: params.intervention?.toLowerCase(),
    phase: params.phase,
    status: params.status,
    type: params.type,
    pageSize: params.pageSize || 20
  };
  return `clinicaltrials:${btoa(JSON.stringify(keyData))}`;
}

function getCachedClinicalTrialsResult(cacheKey: string): any | null {
  const cached = clinicalTrialsCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    clinicalTrialsCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

function setCachedClinicalTrialsResult(cacheKey: string, data: any): void {
  // Implement simple LRU eviction
  if (clinicalTrialsCache.size >= 50) {
    const oldestKey = Array.from(clinicalTrialsCache.keys())[0];
    clinicalTrialsCache.delete(oldestKey);
  }
  
  clinicalTrialsCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
}

// JWT decoder for authentication
function decodeSupabaseJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role || payload.user_metadata?.role,
      specialty: payload.app_metadata?.specialty || payload.user_metadata?.specialty,
      exp: payload.exp
    }
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

// Build ClinicalTrials.gov API URL
function buildClinicalTrialsURL(params: ClinicalTrialSearchParams): string {
  const baseUrl = 'https://clinicaltrials.gov/api/v2/studies';
  const url = new URL(baseUrl);
  
  // Add query parameters
  if (params.query) {
    url.searchParams.append('query.term', params.query);
  }
  
  if (params.condition) {
    url.searchParams.append('query.cond', params.condition);
  }
  
  if (params.intervention) {
    url.searchParams.append('query.intr', params.intervention);
  }
  
  if (params.outcome) {
    url.searchParams.append('query.outc', params.outcome);
  }
  
  if (params.sponsor) {
    url.searchParams.append('query.lead', params.sponsor);
  }
  
  if (params.collaborator) {
    url.searchParams.append('query.coll', params.collaborator);
  }
  
  if (params.sex) {
    url.searchParams.append('filter.sex', params.sex);
  }
  
  if (params.age) {
    url.searchParams.append('filter.age', params.age);
  }
  
  if (params.phase) {
    url.searchParams.append('filter.phase', params.phase);
  }
  
  if (params.funder) {
    url.searchParams.append('filter.funder', params.funder);
  }
  
  if (params.type) {
    url.searchParams.append('filter.type', params.type);
  }
  
  if (params.status) {
    url.searchParams.append('filter.status', params.status);
  }
  
  if (params.results) {
    url.searchParams.append('filter.results', params.results);
  }
  
  if (params.start) {
    url.searchParams.append('filter.start', params.start);
  }
  
  if (params.end) {
    url.searchParams.append('filter.end', params.end);
  }
  
  // Pagination
  url.searchParams.append('pageSize', (params.pageSize || 20).toString());
  
  if (params.pageToken) {
    url.searchParams.append('pageToken', params.pageToken);
  }
  
  // Always request full study details
  url.searchParams.append('format', 'json');
  
  return url.toString();
}

// Transform Clinical Trials results to standard format
function transformClinicalTrialsResults(response: ClinicalTrialsResponse, originalQuery: string): any {
  const results = response.studies.map((study, index) => {
    const protocol = study.protocolSection;
    const identification = protocol.identificationModule;
    const status = protocol.statusModule;
    const description = protocol.descriptionModule;
    const conditions = protocol.conditionsModule;
    const design = protocol.designModule;
    const sponsor = protocol.sponsorCollaboratorsModule;
    const eligibility = protocol.eligibilityModule;
    const outcomes = protocol.outcomesModule;
    const locations = protocol.contactsLocationsModule;
    
    return {
      id: `ct-${identification.nctId}`,
      title: identification.briefTitle,
      url: `https://clinicaltrials.gov/study/${identification.nctId}`,
      snippet: description?.briefSummary || 'No summary available',
      source: 'clinicaltrials.gov',
      provider: 'clinicaltrials',
      relevanceScore: 1.0 - (index * 0.02), // Slight decrease per position
      evidenceLevel: 'clinical_trial',
      publicationDate: status.studyFirstPostDate?.date,
      specialty: determineSpecialtyFromConditions(conditions?.conditions || []),
      contentType: 'clinical_trial',
      
      // Additional clinical trial specific data
      nctId: identification.nctId,
      officialTitle: identification.officialTitle,
      overallStatus: status.overallStatus,
      lastUpdateDate: status.lastUpdatePostDate?.date,
      leadSponsor: sponsor.leadSponsor,
      collaborators: sponsor.collaborators,
      studyType: design?.studyType,
      phases: design?.phases,
      conditions: conditions?.conditions,
      keywords: conditions?.keywords,
      interventions: protocol.armsInterventionsModule?.interventions,
      primaryOutcomes: outcomes?.primaryOutcomes,
      secondaryOutcomes: outcomes?.secondaryOutcomes,
      eligibilityCriteria: eligibility?.eligibilityCriteria,
      sex: eligibility?.sex,
      minimumAge: eligibility?.minimumAge,
      maximumAge: eligibility?.maximumAge,
      healthyVolunteers: eligibility?.healthyVolunteers,
      enrollmentCount: design?.enrollmentInfo?.count,
      locations: locations?.locations?.length || 0,
      hasResults: study.hasResults || false,
      detailedDescription: description?.detailedDescription
    };
  });

  return {
    results,
    totalCount: response.totalCount,
    query: originalQuery,
    provider: 'clinicaltrials',
    nextPageToken: response.nextPageToken
  };
}

function determineSpecialtyFromConditions(conditions: string[]): string {
  const specialtyMap: Record<string, string[]> = {
    'cardiology': ['heart', 'cardiac', 'cardiovascular', 'myocardial', 'coronary', 'arrhythmia', 'hypertension'],
    'oncology': ['cancer', 'tumor', 'neoplasm', 'carcinoma', 'sarcoma', 'lymphoma', 'leukemia', 'melanoma'],
    'neurology': ['brain', 'neurological', 'alzheimer', 'parkinson', 'stroke', 'epilepsy', 'multiple sclerosis'],
    'endocrinology': ['diabetes', 'thyroid', 'hormone', 'endocrine', 'insulin', 'metabolic'],
    'psychiatry': ['depression', 'anxiety', 'bipolar', 'schizophrenia', 'ptsd', 'mental health'],
    'rheumatology': ['arthritis', 'rheumatoid', 'lupus', 'autoimmune', 'joint', 'inflammatory'],
    'infectious_disease': ['infection', 'viral', 'bacterial', 'antibiotic', 'vaccine', 'covid', 'hiv'],
    'pulmonology': ['lung', 'respiratory', 'asthma', 'copd', 'pneumonia', 'pulmonary'],
    'gastroenterology': ['digestive', 'gastrointestinal', 'liver', 'stomach', 'intestinal', 'crohn'],
    'nephrology': ['kidney', 'renal', 'dialysis', 'nephritis'],
    'ob-gyn': ['pregnancy', 'obstetric', 'gynecologic', 'reproductive', 'fertility', 'contraception']
  };
  
  const conditionText = conditions.join(' ').toLowerCase();
  
  for (const [specialty, keywords] of Object.entries(specialtyMap)) {
    if (keywords.some(keyword => conditionText.includes(keyword))) {
      return specialty;
    }
  }
  
  return 'general';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧪 Clinical Trials Search Edge Function called')

    // Check authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Decode JWT token
    const token = authHeader.replace('Bearer ', '')
    const jwtPayload = decodeSupabaseJWT(token)
    
    if (!jwtPayload) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check token expiration
    if (jwtPayload.exp && Date.now() >= jwtPayload.exp * 1000) {
      return new Response(
        JSON.stringify({ error: 'Token expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestData = await req.json();
    const { q: query, filters, condition, intervention, phase, status, type } = requestData;
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Clinical Trials Search Request', {
      userId: jwtPayload.id,
      query: query.substring(0, 100),
      condition,
      intervention,
      phase,
      status,
      type
    });

    // Build search parameters
    const searchParams: ClinicalTrialSearchParams = {
      query,
      condition,
      intervention,
      phase,
      status: status || 'RECRUITING', // Default to recruiting studies
      type: type || 'INTERVENTIONAL', // Default to interventional studies
      pageSize: filters?.limit || 20,
      filters
    };

    // Add recency filters if specified
    if (filters?.recency) {
      const now = new Date();
      const dateRanges = {
        'pastYear': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        'past2Years': new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
        'past5Years': new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
      };
      
      const startDate = dateRanges[filters.recency as keyof typeof dateRanges];
      if (startDate) {
        searchParams.start = startDate.toISOString().split('T')[0];
      }
    }

    const cacheKey = generateClinicalTrialsCacheKey(searchParams);
    
    // Check cache first
    const cachedResult = getCachedClinicalTrialsResult(cacheKey);
    if (cachedResult) {
      console.log('Clinical Trials Search Cache Hit', {
        userId: jwtPayload.id,
        query: query.substring(0, 100),
        cacheKey
      });
      
      return new Response(
        JSON.stringify({ success: true, data: cachedResult }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();
    const apiUrl = buildClinicalTrialsURL(searchParams);

    console.log('Calling ClinicalTrials.gov API', {
      url: apiUrl.substring(0, 150) + '...',
      query: query.substring(0, 100)
    });

    // Make API request to ClinicalTrials.gov
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MediMind-Expert/1.0 (medical research application)'
      }
    });

    const searchTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ClinicalTrials.gov API error:', {
        status: response.status,
        error: errorText,
        userId: jwtPayload.id
      });

      return new Response(
        JSON.stringify({ 
          error: 'Clinical trials search failed',
          details: `API returned ${response.status}`,
          provider: 'clinicaltrials'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clinicalTrialsData: ClinicalTrialsResponse = await response.json();
    
    // Transform results to standard format
    const transformedData = transformClinicalTrialsResults(clinicalTrialsData, query);
    transformedData.searchTime = searchTime;

    // Cache the result
    setCachedClinicalTrialsResult(cacheKey, transformedData);

    console.log('Clinical Trials Search Success', {
      userId: jwtPayload.id,
      resultCount: transformedData.results.length,
      totalCount: transformedData.totalCount,
      searchTime
    });

    return new Response(
      JSON.stringify({ success: true, data: transformedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Clinical Trials Search Error:', error)

    return new Response(
      JSON.stringify({ 
        error: 'Clinical trials search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        provider: 'clinicaltrials'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})