/**
 * ClinicalTrials.gov API Service
 * Provides integration with ClinicalTrials.gov API v2 for clinical trial search and monitoring
 */

import { SearchQuery, SearchResult } from '@/utils/search/apiOrchestration';

// Clinical trial specific types
export interface ClinicalTrial {
  nctId: string;
  title: string;
  status: 'RECRUITING' | 'ACTIVE_NOT_RECRUITING' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED' | 'WITHDRAWN' | 'UNKNOWN';
  phase?: 'EARLY_PHASE1' | 'PHASE1' | 'PHASE2' | 'PHASE3' | 'PHASE4' | 'NA';
  conditions: string[];
  interventions: string[];
  locations: TrialLocation[];
  eligibility: TrialEligibility;
  enrollment: {
    value: number;
    type: 'ACTUAL' | 'ESTIMATED';
  };
  startDate?: string;
  primaryCompletionDate?: string;
  lastUpdateDate: string;
  sponsor: {
    name: string;
    class: 'INDUSTRY' | 'NIH' | 'OTHER' | 'NETWORK' | 'AMBIG';
  };
  briefSummary: string;
  detailedDescription?: string;
  primaryOutcome?: string;
}

export interface TrialLocation {
  facility: string;
  city: string;
  state: string;
  country: string;
  zip?: string;
  geoPoint?: {
    lat: number;
    lon: number;
  };
  status?: string;
  contacts?: TrialContact[];
}

export interface TrialContact {
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

export interface TrialEligibility {
  criteria: string;
  healthyVolunteers?: boolean;
  sex: 'ALL' | 'MALE' | 'FEMALE';
  minimumAge?: string;
  maximumAge?: string;
}

export interface ClinicalTrialSearchResult extends SearchResult {
  clinicalTrialData?: {
    nctId: string;
    phase?: string;
    status: string;
    enrollment?: number;
    startDate?: string;
    completionDate?: string;
    lastUpdateDate: string;
    locations: Array<{
      facility: string;
      city: string;
      state: string;
      country: string;
      status?: string;
      distance?: number;
    }>;
    eligibility?: {
      minAge?: string;
      maxAge?: string;
      gender: string;
      acceptsHealthyVolunteers?: boolean;
    };
    primaryOutcome?: string;
  };
}

export interface ClinicalTrialFilters {
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
}

export interface ClinicalTrialsRequest {
  query: string;
  filters?: ClinicalTrialFilters;
  pageSize?: number;
  pageToken?: string;
  fields?: string[];
}

export interface ClinicalTrialsResponse {
  studies: any[];
  nextPageToken?: string;
  totalCount?: number;
  searchMetadata?: {
    query: string;
    filters?: ClinicalTrialFilters;
    timestamp: string;
    totalResults: number;
    hasMoreResults: boolean;
  };
}

export class ClinicalTrialsService {
  private static instance: ClinicalTrialsService;
  
  private constructor() {}
  
  static getInstance(): ClinicalTrialsService {
    if (!this.instance) {
      this.instance = new ClinicalTrialsService();
    }
    return this.instance;
  }

  /**
   * Search for clinical trials based on query and filters using Supabase Edge Function
   */
  async searchTrials(request: ClinicalTrialsRequest): Promise<ClinicalTrialsResponse> {
    try {
      // Use Supabase Edge Function
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.functions.invoke('search-clinicaltrials', {
        body: {
          q: request.query,
          filters: request.filters,
          pageSize: request.pageSize,
          pageToken: request.pageToken
        }
      });

      if (error) {
        throw new Error(error.message || 'Clinical trials search failed');
      }

      const result = data?.data || data;
      return {
        studies: result.results || [],
        totalCount: result.totalCount || 0,
        nextPageToken: result.nextPageToken,
        searchMetadata: {
          query: request.query,
          filters: request.filters,
          timestamp: new Date().toISOString(),
          totalResults: result.totalCount || 0,
          hasMoreResults: !!result.nextPageToken
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Transform API response to search results format
   */
  transformToSearchResults(
    data: ClinicalTrialsResponse,
    originalQuery: string
  ): ClinicalTrialSearchResult[] {
    return (data.studies || []).map((study: any, index: number) => {
      const identification = study.protocolSection?.identificationModule;
      const status = study.protocolSection?.statusModule;
      const design = study.protocolSection?.designModule;
      const eligibility = study.protocolSection?.eligibilityModule;
      const locations = study.protocolSection?.contactsLocationsModule?.locations || [];
      const outcomes = study.protocolSection?.outcomesModule;
      const description = study.protocolSection?.descriptionModule;
      
      return {
        id: `ct-${identification?.nctId}`,
        title: identification?.officialTitle || identification?.briefTitle || 'Untitled Study',
        url: `https://clinicaltrials.gov/study/${identification?.nctId}`,
        snippet: this.generateTrialSnippet(study),
        source: 'ClinicalTrials.gov',
        provider: 'clinicaltrials' as any,
        relevanceScore: this.calculateRelevanceScore(study, originalQuery, index),
        confidence: 0.95,
        publicationDate: status?.studyFirstPostDateStruct?.date,
        contentType: 'clinical-trial',
        specialty: this.extractSpecialty(study),
        evidenceLevel: this.mapPhaseToEvidenceLevel(design?.phases),
        clinicalTrialData: {
          nctId: identification?.nctId,
          phase: design?.phases?.[0],
          status: status?.overallStatus,
          enrollment: design?.enrollmentInfo?.count,
          startDate: status?.startDateStruct?.date,
          completionDate: status?.primaryCompletionDateStruct?.date,
          lastUpdateDate: status?.lastUpdatePostDateStruct?.date,
          locations: this.transformLocations(locations),
          eligibility: {
            minAge: eligibility?.minimumAge,
            maxAge: eligibility?.maximumAge,
            gender: eligibility?.sex,
            acceptsHealthyVolunteers: eligibility?.healthyVolunteers
          },
          primaryOutcome: outcomes?.primaryOutcomes?.[0]?.measure
        }
      };
    });
  }

  /**
   * Generate a concise snippet for the trial
   */
  private generateTrialSnippet(study: any): string {
    const description = study.protocolSection?.descriptionModule;
    const brief = description?.briefSummary || '';
    const conditions = study.protocolSection?.conditionsModule?.conditions || [];
    const phase = study.protocolSection?.designModule?.phases?.[0] || '';
    
    let snippet = brief.substring(0, 200);
    if (conditions.length > 0) {
      snippet += ` Conditions: ${conditions.slice(0, 3).join(', ')}.`;
    }
    if (phase) {
      snippet += ` Phase: ${phase.replace('PHASE', 'Phase ')}.`;
    }
    
    return snippet.trim();
  }

  /**
   * Calculate relevance score based on query match and other factors
   */
  private calculateRelevanceScore(study: any, query: string, index: number): number {
    let score = Math.max(0.9 - (index * 0.05), 0.1); // Base score from position
    
    // Boost for exact condition match
    const conditions = study.protocolSection?.conditionsModule?.conditions || [];
    if (conditions.some((c: string) => 
      c.toLowerCase().includes(query.toLowerCase())
    )) {
      score += 0.1;
    }
    
    // Boost for recruiting status
    const status = study.protocolSection?.statusModule?.overallStatus;
    if (status === 'RECRUITING') {
      score += 0.05;
    }
    
    // Boost for recent updates
    const lastUpdate = study.protocolSection?.statusModule?.lastUpdatePostDateStruct?.date;
    if (lastUpdate) {
      const daysSinceUpdate = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) {
        score += 0.05;
      }
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Extract medical specialty from trial data
   */
  private extractSpecialty(study: any): string {
    const conditions = study.protocolSection?.conditionsModule?.conditions || [];
    const keywords = study.protocolSection?.conditionsModule?.keywords || [];
    
    const allTerms = [...conditions, ...keywords].join(' ').toLowerCase();
    
    if (allTerms.includes('cardiac') || allTerms.includes('heart')) return 'cardiology';
    if (allTerms.includes('cancer') || allTerms.includes('oncolog')) return 'oncology';
    if (allTerms.includes('neurolog') || allTerms.includes('brain')) return 'neurology';
    if (allTerms.includes('pregnan') || allTerms.includes('maternal')) return 'obstetrics';
    if (allTerms.includes('gynecolog') || allTerms.includes('reproduct')) return 'gynecology';
    
    return 'general';
  }

  /**
   * Map trial phase to evidence level
   */
  private mapPhaseToEvidenceLevel(phases?: string[]): string {
    if (!phases || phases.length === 0) return 'other';
    
    const phase = phases[0];
    switch (phase) {
      case 'PHASE3':
      case 'PHASE4':
        return 'high';
      case 'PHASE2':
        return 'moderate';
      case 'PHASE1':
      case 'EARLY_PHASE1':
        return 'low';
      default:
        return 'other';
    }
  }

  /**
   * Transform location data
   */
  private transformLocations(locations: any[]): Array<any> {
    return locations.slice(0, 10).map(loc => ({
      facility: loc.facility || 'Unknown Facility',
      city: loc.city || '',
      state: loc.state || '',
      country: loc.country || '',
      status: loc.status
    }));
  }

  /**
   * Build query parameters for ClinicalTrials.gov API
   */
  buildQueryParams(query: SearchQuery, filters?: ClinicalTrialFilters): ClinicalTrialsRequest {
    const request: ClinicalTrialsRequest = {
      query: query.query,
      pageSize: query.limit || 20,
      filters: filters || {}
    };

    // Add specialty-specific terms
    if (query.specialty) {
      request.query = this.enhanceQueryWithSpecialty(request.query, query.specialty);
    }

    // Add evidence level filters (map to phase)
    if (query.evidenceLevel && query.evidenceLevel.length > 0) {
      request.filters!.phase = this.mapEvidenceLevelToPhase(query.evidenceLevel);
    }

    return request;
  }

  /**
   * Enhance query with specialty-specific terms
   */
  private enhanceQueryWithSpecialty(query: string, specialty: string): string {
    const specialtyTerms: Record<string, string> = {
      'cardiology': 'cardiovascular OR cardiac OR heart',
      'oncology': 'cancer OR oncology OR tumor OR neoplasm',
      'neurology': 'neurological OR brain OR nervous system',
      'psychiatry': 'mental health OR psychiatric OR behavioral',
      'pediatrics': 'pediatric OR children OR adolescent',
      'obstetrics': 'pregnancy OR maternal OR obstetric',
      'gynecology': 'gynecologic OR women health OR reproductive'
    };

    const terms = specialtyTerms[specialty.toLowerCase()];
    return terms ? `${query} AND (${terms})` : query;
  }

  /**
   * Map evidence levels to clinical trial phases
   */
  private mapEvidenceLevelToPhase(evidenceLevels: string[]): string[] {
    const phases: string[] = [];
    
    evidenceLevels.forEach(level => {
      switch (level) {
        case 'high':
          phases.push('phase3', 'phase4');
          break;
        case 'moderate':
          phases.push('phase2');
          break;
        case 'low':
          phases.push('phase1');
          break;
      }
    });
    
    return [...new Set(phases)]; // Remove duplicates
  }
}

/**
 * Type guard to check if a search result is a clinical trial
 */
export function isClinicalTrialResult(result: any): result is ClinicalTrialSearchResult {
  return result && result.contentType === 'clinical-trial' && 'clinicalTrialData' in result;
}

export default ClinicalTrialsService.getInstance();