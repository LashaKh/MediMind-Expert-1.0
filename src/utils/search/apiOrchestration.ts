/**
 * API Orchestration for Medical Search
 * Coordinates between Brave Search, Exa AI, and Perplexity APIs with timeout handling and failover
 */

export interface SearchProvider {
  id: 'brave' | 'exa' | 'perplexity' | 'clinicaltrials';
  name: string;
  enabled: boolean;
  priority: number;
  timeout: number; // milliseconds
  retryCount: number;
  weight: number; // for result aggregation
}

export interface AdvancedMedicalFilters {
  // Content Type & Format Filters
  contentTypes?: {
    researchLiterature?: string[]; // 'studies', 'trials', 'meta-analyses', 'systematic-reviews'
    clinicalGuidelines?: string[]; // 'treatment-guidelines', 'diagnostic-protocols', 'best-practices'
    medicalReferences?: string[]; // 'textbooks', 'handbooks', 'medical-dictionaries'
    educationalContent?: string[]; // 'cme-materials', 'case-studies', 'learning-modules'
    regulatoryDocs?: string[]; // 'fda-approvals', 'drug-labels', 'safety-communications'
    patientResources?: string[]; // 'patient-education', 'fact-sheets', 'brochures'
  };
  fileFormats?: string[]; // 'pdf', 'html', 'doc', 'ppt', 'video', 'audio'
  
  // Authority & Credibility Filters
  sourceAuthority?: {
    government?: string[]; // 'cdc', 'fda', 'nih', 'who'
    professionalSocieties?: string[]; // 'aha', 'acs', 'asco', 'acp'
    academicInstitutions?: string[]; // 'harvard', 'mayo-clinic', 'johns-hopkins'
    publishers?: string[]; // 'elsevier', 'springer', 'wiley', 'nejm'
    medicalOrganizations?: string[]; // 'uptodate', 'medscape', 'cochrane'
  };
  peerReviewStatus?: string[]; // 'peer-reviewed', 'editorial-review', 'expert-consensus'
  citationTier?: string[]; // 'highly-cited', 'moderately-cited', 'new-content'
  
  // Medical Specialty & Domain
  medicalSpecialties?: {
    clinical?: string[]; // 'cardiology', 'oncology', 'neurology', etc.
    basicSciences?: string[]; // 'anatomy', 'physiology', 'pharmacology', 'pathology'
    publicHealth?: string[]; // 'epidemiology', 'health-policy', 'global-health'
    healthcareAdmin?: string[]; // 'quality-improvement', 'healthcare-economics'
    medicalTechnology?: string[]; // 'medical-devices', 'digital-health', 'telemedicine'
  };
  subspecialties?: string[]; // Subspecialty within chosen specialty
  
  // Audience & Complexity
  targetAudience?: string[]; // 'expert', 'general-practitioner', 'medical-student', 'patient', 'nursing'
  contentComplexity?: string[]; // 'basic', 'intermediate', 'advanced', 'expert'
  readingLevel?: string[]; // 'professional', 'graduate', 'undergraduate', 'patient-friendly'
  
  // Topic & Condition Filters
  diseaseCategories?: string[]; // 'cardiovascular', 'cancer', 'infectious-disease', etc.
  symptomsAndSigns?: string[]; // 'chest-pain', 'fever', 'fatigue', etc.
  treatmentTypes?: string[]; // 'surgical-procedures', 'drug-therapies', 'diagnostics'
  preventionScreening?: string[]; // 'preventive-care', 'health-screening', 'vaccination'
  
  // Publication & Quality
  recencyPeriod?: string; // 'last-30-days', '3-months', '1-year', '2-years', '5-years', 'all-time'
  updateStatus?: string[]; // 'recently-updated', 'regularly-maintained', 'static-content'
  evidenceGrade?: string[]; // 'grade-a-strong', 'grade-b-moderate', 'grade-c-weak'
  validationStatus?: string[]; // 'clinically-validated', 'experimental', 'theoretical'
  
  // Access & Availability
  accessType?: string[]; // 'open-access', 'free-registration', 'subscription-required'
  fullTextAvailable?: boolean;
  downloadFormat?: string[]; // 'pdf-available', 'html-only', 'interactive-content'
  mobileOptimized?: boolean;
  
  // Geographic & Context
  geographicRelevance?: string[]; // 'us-guidelines', 'european-guidelines', 'global', 'regional'
  practiceSettings?: string[]; // 'hospital', 'outpatient', 'emergency', 'home-care'
  patientPopulation?: string[]; // 'pediatric', 'adult', 'geriatric', 'pregnant'
  careLevel?: string[]; // 'primary-prevention', 'diagnosis', 'treatment', 'rehabilitation'
  
  // Clinical Trial Specific (existing)
  trialFilters?: {
    recruitmentStatus?: string[];
    phase?: string[];
    location?: { address: string; radius?: number };
    ageRange?: { min?: number; max?: number };
    gender?: 'all' | 'male' | 'female';
  };
}

export interface SearchQuery {
  query: string;
  specialty?: string;
  evidenceLevel?: string[];
  contentType?: string[];
  recency?: string;
  limit?: number;
  providers?: SearchProvider['id'][];
  tab?: string; // Active tab for UI state
  
  // Enhanced filters for comprehensive medical content
  advancedFilters?: AdvancedMedicalFilters;
  
  // Legacy trial filters (deprecated - use advancedFilters.trialFilters)
  trialFilters?: {
    recruitmentStatus?: string[];
    phase?: string[];
    location?: { address: string; radius?: number };
    ageRange?: { min?: number; max?: number };
    gender?: 'all' | 'male' | 'female';
  };
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  provider: SearchProvider['id'];
  relevanceScore: number;
  evidenceLevel?: string;
  publicationDate?: string;
  specialty?: string;
  contentType?: string;
  confidence: number; // 0-1 score for result confidence
  
  // Enhanced metadata for advanced filtering
  metadata?: {
    // Content classification
    contentCategory?: 'research' | 'guideline' | 'reference' | 'education' | 'regulatory' | 'patient';
    fileFormat?: 'pdf' | 'html' | 'doc' | 'ppt' | 'video' | 'audio';
    
    // Authority information
    authoritySource?: 'government' | 'professional-society' | 'academic' | 'publisher' | 'medical-org';
    authorityName?: string;
    peerReviewed?: boolean;
    citationCount?: number;
    
    // Audience and complexity
    targetAudience?: 'expert' | 'general-practitioner' | 'medical-student' | 'patient' | 'nursing';
    complexityLevel?: 'basic' | 'intermediate' | 'advanced' | 'expert';
    readingLevel?: 'professional' | 'graduate' | 'undergraduate' | 'patient-friendly';
    
    // Medical context
    medicalSpecialty?: string;
    subspecialty?: string;
    diseaseCategory?: string;
    treatmentType?: string;
    
    // Publication info
    lastUpdated?: string;
    evidenceGrade?: 'grade-a' | 'grade-b' | 'grade-c';
    validationStatus?: 'validated' | 'experimental' | 'theoretical';
    
    // Access information
    accessType?: 'open-access' | 'free-registration' | 'subscription';
    fullTextAvailable?: boolean;
    downloadable?: boolean;
    mobileOptimized?: boolean;
    
    // Geographic context
    geographicRelevance?: 'us' | 'european' | 'global' | 'regional';
    practiceSettings?: string[];
    patientPopulation?: string[];
    
    // Additional context
    languages?: string[];
    hasImages?: boolean;
    hasVideos?: boolean;
    cmeCredits?: number;
    conflictOfInterest?: boolean;
  };
  
  // Impact metrics
  impactFactor?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchTime: number;
  provider: SearchProvider['id'];
  query: string;
  status: 'success' | 'partial' | 'error';
  error?: string;
  summary?: string;
  evidenceLevel?: string;
  keyFindings?: string[];
}

export interface AggregatedSearchResponse {
  results: SearchResult[];
  totalCount: number;
  searchTime: number;
  providers: SearchProvider['id'][];
  query: string;
  successfulProviders: number;
  failedProviders: { provider: SearchProvider['id']; error: string }[];
}

// Provider configuration
const DEFAULT_PROVIDERS: SearchProvider[] = [
  { 
    id: 'brave', 
    name: 'Brave Search', 
    enabled: true, 
    priority: 1, 
    timeout: 8000,
    retryCount: 2,
    weight: 0.3
  },
  { 
    id: 'exa', 
    name: 'Exa AI', 
    enabled: true, 
    priority: 2, 
    timeout: 10000,
    retryCount: 1,
    weight: 0.25
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity AI', 
    enabled: true, 
    priority: 3, 
    timeout: 30000,
    retryCount: 1,
    weight: 0.2
  },
  { 
    id: 'clinicaltrials', 
    name: 'ClinicalTrials.gov', 
    enabled: true, 
    priority: 4, 
    timeout: 15000,
    retryCount: 2,
    weight: 0.25
  }
];

export class SearchOrchestrator {
  private providers: SearchProvider[];
  private isDevelopment: boolean;

  constructor(customProviders?: SearchProvider[]) {
    this.providers = customProviders || DEFAULT_PROVIDERS;
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Sequential search with fallback using simple search endpoint
   */
  async search(query: SearchQuery): Promise<AggregatedSearchResponse> {
    const startTime = Date.now();
    
    // Get authentication token
    const { data: { session } } = await import('../../lib/supabase').then(m => m.supabase.auth.getSession());
    if (!session) {
      throw new Error('Authentication required for search');
    }
    
    try {
      const response = await fetch('/.netlify/functions/simple-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          q: query.query,
          limit: query.limit || 10
        })
      });

      if (!response.ok) {
        throw new Error(`Simple search error: ${response.status} ${response.statusText}`);
      }

      const response_data = await response.json();
      const data = response_data.data || response_data; // Handle wrapped response
      
      return {
        results: this.transformOrchestratorResults(data.results || []),
        totalCount: data.totalCount || 0,
        searchTime: Date.now() - startTime,
        providers: [data.provider || 'brave'],
        query: query.query,
        successfulProviders: 1,
        failedProviders: []
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Search failed');
    }
  }

  /**
   * Parallel search across multiple providers with intelligent result aggregation
   */
  async parallelSearch(query: SearchQuery): Promise<AggregatedSearchResponse> {
    const startTime = Date.now();
    const enabledProviders = this.getEnabledProviders(query.providers);
    
    if (enabledProviders.length === 0) {
      throw new Error('No search providers are enabled');
    }

    // Execute searches in parallel with timeout handling
    const searchPromises = enabledProviders.map(async (provider) => {
      try {
        return await this.callProviderWithRetry(provider, query);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`💥 [${provider.id.toUpperCase()}] Provider completely failed:`, {
          error: errorMessage,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          timeout: provider.timeout,
          retryCount: provider.retryCount,
          priority: provider.priority
        });
        
        // Return structured error response for better debugging
        return {
          results: [],
          totalCount: 0,
          searchTime: 0,
          provider: provider.id,
          query: query.query,
          status: 'error' as const,
          error: errorMessage
        };
      }
    });

    // Wait for all searches to complete (or timeout)
    const responses = await Promise.allSettled(searchPromises);
    
    // Process successful responses
    const successfulResponses: SearchResponse[] = [];
    const failedProviders: { provider: SearchProvider['id']; error: string }[] = [];
    
    responses.forEach((result, index) => {
      const provider = enabledProviders[index];
      
      if (result.status === 'fulfilled' && result.value.status !== 'error') {
        successfulResponses.push(result.value);
      } else {
        const error = result.status === 'rejected' 
          ? result.reason?.message || 'Promise rejected'
          : result.value.error || 'Unknown error';
        failedProviders.push({ provider: provider.id, error });
      }
    });

    // If no providers succeeded, show appropriate error with detailed information
    if (successfulResponses.length === 0) {
      console.error(`🚨 [ORCHESTRATOR] All providers failed:`, { 
        failedProviders: failedProviders.map(f => ({ provider: f.provider, error: f.error })),
        enabledProviders: enabledProviders.map(p => ({ id: p.id, priority: p.priority, timeout: p.timeout })),
        totalAttempted: enabledProviders.length,
        query: query.query.substring(0, 100) + (query.query.length > 100 ? '...' : '')
      });
      
      // Try to categorize the errors and provide helpful messaging
      const authErrors = failedProviders.filter(f => f.error.includes('authentication') || f.error.includes('API key'));
      const rateErrors = failedProviders.filter(f => f.error.includes('rate limit') || f.error.includes('429'));
      const serverErrors = failedProviders.filter(f => f.error.includes('500') || f.error.includes('Internal Server Error'));
      
      let errorMessage = 'All selected search providers failed';
      
      if (authErrors.length > 0) {
        errorMessage += ` (${authErrors.length} authentication issues)`;
      }
      if (rateErrors.length > 0) {
        errorMessage += ` (${rateErrors.length} rate limit issues)`;
      }
      if (serverErrors.length > 0) {
        errorMessage += ` (${serverErrors.length} server errors)`;
      }
      
      // Add the first specific error for debugging
      if (failedProviders.length > 0) {
        const firstError = failedProviders[0];
        errorMessage += `: ${firstError.provider} - ${firstError.error}`;
      }
      
      throw new Error(errorMessage);
    }

    // Aggregate and deduplicate results with advanced filtering
    const aggregatedResults = this.aggregateResults(successfulResponses, query);
    
    return {
      results: aggregatedResults,
      totalCount: aggregatedResults.length,
      searchTime: Date.now() - startTime,
      providers: successfulResponses.map(r => r.provider),
      query: query.query,
      successfulProviders: successfulResponses.length,
      failedProviders
    };
  }

  /**
   * Get enabled providers based on query preferences
   */
  private getEnabledProviders(requestedProviders?: SearchProvider['id'][]): SearchProvider[] {
    let providers = this.providers.filter(p => p.enabled);
    
    if (requestedProviders && requestedProviders.length > 0) {
      providers = providers.filter(p => requestedProviders.includes(p.id));
    }
    
    return providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Call a provider with retry logic
   */
  private async callProviderWithRetry(provider: SearchProvider, query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    console.group(`🔍 [${provider.id.toUpperCase()}] Starting search with retry logic`);

    let lastError: Error;
    
    for (let attempt = 0; attempt <= provider.retryCount; attempt++) {
      const attemptStartTime = Date.now();
      console.log(`🎯 [${provider.id.toUpperCase()}] Attempt ${attempt + 1}/${provider.retryCount + 1}`);
      
      try {
        const response = await this.callProvider(provider, query);
        const totalTime = Date.now() - startTime;
        const attemptTime = Date.now() - attemptStartTime;
        
        console.log(`✅ [${provider.id.toUpperCase()}] Success on attempt ${attempt + 1}`);

        console.groupEnd();
        
        return response;
      } catch (error) {
        const attemptTime = Date.now() - attemptStartTime;
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        console.error(`❌ [${provider.id.toUpperCase()}] Attempt ${attempt + 1} failed after ${attemptTime}ms:`, {
          error: lastError.message,
          stack: lastError.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
          type: lastError.constructor.name
        });
        
        if (attempt < provider.retryCount) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`⏳ [${provider.id.toUpperCase()}] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`💥 [${provider.id.toUpperCase()}] All attempts failed. Total time: ${Date.now() - startTime}ms`);
        }
      }
    }
    
    console.groupEnd();
    throw lastError!;
  }

  /**
   * Call a specific provider with timeout
   */
  private async callProvider(provider: SearchProvider, query: SearchQuery): Promise<SearchResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏰ [${provider.id.toUpperCase()}] Request timeout triggered after ${provider.timeout}ms`);
      controller.abort();
    }, provider.timeout);

    const requestStartTime = Date.now();
    console.log(`🚀 [${provider.id.toUpperCase()}] Making API request...`);

    try {
      let response: SearchResponse;
      
      switch (provider.id) {
        case 'brave':

          response = await this.callBraveAPI(query, controller.signal);
          break;
        case 'exa':

          response = await this.callExaAPI(query, controller.signal);
          break;
        case 'perplexity':

          response = await this.callPerplexityAPI(query, controller.signal);
          break;
        case 'clinicaltrials':

          response = await this.callClinicalTrialsAPI(query, controller.signal);
          break;
        default:
          const error = new Error(`Unknown provider: ${provider.id}`);

          throw error;
      }

      const responseTime = Date.now() - requestStartTime;
      clearTimeout(timeoutId);
      
      console.log(`✨ [${provider.id.toUpperCase()}] API response received:`, {
        responseTime: `${responseTime}ms`,
        resultsCount: response.results?.length || 0,
        totalCount: response.totalCount,
        status: response.status,
        provider: response.provider
      });
      
      return response;
    } catch (error) {
      const responseTime = Date.now() - requestStartTime;
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error(`Provider ${provider.id} timed out after ${provider.timeout}ms`);
        console.error(`⏰ [${provider.id.toUpperCase()}] Request timed out:`, {
          timeout: `${provider.timeout}ms`,
          actualTime: `${responseTime}ms`
        });
        throw timeoutError;
      }
      
      console.error(`💥 [${provider.id.toUpperCase()}] API request failed:`, {
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      
      throw error;
    }
  }

  /**
   * Aggregate results from multiple providers with advanced filtering
   */
  private aggregateResults(responses: SearchResponse[], query?: SearchQuery): SearchResult[] {
    const resultMap = new Map<string, SearchResult>();
    const providerWeights = new Map<SearchProvider['id'], number>();
    
    // Set up provider weights
    this.providers.forEach(p => providerWeights.set(p.id, p.weight));

    responses.forEach(response => {
      const weight = providerWeights.get(response.provider) || 0.1;
      
      response.results.forEach(result => {
        const key = this.generateResultKey(result);
        
        if (resultMap.has(key)) {
          // Merge duplicate results with weighted scoring
          const existing = resultMap.get(key)!;
          existing.relevanceScore = Math.max(existing.relevanceScore, result.relevanceScore * weight);
          existing.confidence = Math.min(existing.confidence + 0.2, 1.0); // Boost confidence for duplicates
        } else {
          // Add new result with weighted score
          resultMap.set(key, {
            ...result,
            relevanceScore: result.relevanceScore * weight,
            confidence: result.confidence || 0.7
          });
        }
      });
    });

    let results = Array.from(resultMap.values());
    
    // Apply advanced filters to results
    if (query?.advancedFilters) {
      results = this.applyAdvancedFilters(results, query.advancedFilters);
    }

    // Sort by relevance and confidence
    return results
      .sort((a, b) => {
        const scoreA = a.relevanceScore * a.confidence;
        const scoreB = b.relevanceScore * b.confidence;
        return scoreB - scoreA;
      })
      .slice(0, 20); // Limit to top 20 results
  }

  /**
   * Apply advanced filters to search results
   */
  private applyAdvancedFilters(results: SearchResult[], filters: AdvancedMedicalFilters): SearchResult[] {
    return results.filter(result => {
      // File format filtering
      if (filters.fileFormats?.length) {
        const hasMatchingFormat = filters.fileFormats.some(format => {
          switch (format) {
            case 'video':
              return result.url.includes('youtube.com') || 
                     result.url.includes('vimeo.com') || 
                     result.title.toLowerCase().includes('video') ||
                     result.snippet.toLowerCase().includes('video');
            case 'audio':
              return result.url.includes('podcast') ||
                     result.title.toLowerCase().includes('podcast') ||
                     result.snippet.toLowerCase().includes('podcast') ||
                     result.snippet.toLowerCase().includes('audio');
            case 'pdf':
              return result.url.endsWith('.pdf') ||
                     result.snippet.toLowerCase().includes('pdf');
            case 'ppt':
              return result.url.includes('.ppt') ||
                     result.title.toLowerCase().includes('presentation') ||
                     result.snippet.toLowerCase().includes('slides');
            default:
              return true;
          }
        });
        
        if (!hasMatchingFormat) {
          return false;
        }
      }
      
      // Authority source filtering
      if (filters.sourceAuthority) {
        let hasMatchingAuthority = false;
        
        // Government sources
        if (filters.sourceAuthority.government?.length) {
          const govSources = ['cdc.gov', 'nih.gov', 'fda.gov', 'who.int'];
          hasMatchingAuthority = govSources.some(domain => result.url.includes(domain));
        }
        
        // Professional societies
        if (!hasMatchingAuthority && filters.sourceAuthority.professionalSocieties?.length) {
          const societySources = ['heart.org', 'acc.org', 'cancer.org', 'acog.org'];
          hasMatchingAuthority = societySources.some(domain => result.url.includes(domain));
        }
        
        // Publishers
        if (!hasMatchingAuthority && filters.sourceAuthority.publishers?.length) {
          const publisherSources = ['nejm.org', 'thelancet.com', 'bmj.com', 'jamanetwork.com'];
          hasMatchingAuthority = publisherSources.some(domain => result.url.includes(domain));
        }
        
        // If no authority filters match and we have authority filters, exclude this result
        if (Object.keys(filters.sourceAuthority).length > 0 && !hasMatchingAuthority) {
          // Allow results if no specific authority filter is set, or if at least one matches
          const hasAnyAuthorityFilter = 
            (filters.sourceAuthority.government?.length || 0) +
            (filters.sourceAuthority.professionalSocieties?.length || 0) +
            (filters.sourceAuthority.publishers?.length || 0) > 0;
          
          if (hasAnyAuthorityFilter && !hasMatchingAuthority) {
            return false;
          }
        }
      }
      
      // Content type filtering based on title and snippet analysis
      if (filters.contentTypes) {
        const textContent = (result.title + ' ' + result.snippet).toLowerCase();
        let hasMatchingContent = false;
        
        // Check research literature
        if (filters.contentTypes.researchLiterature?.length) {
          hasMatchingContent = filters.contentTypes.researchLiterature.some(type => {
            switch (type) {
              case 'studies':
                return textContent.includes('study') || textContent.includes('research');
              case 'trials':
                return textContent.includes('trial') || textContent.includes('clinical trial');
              case 'meta-analyses':
                return textContent.includes('meta-analysis') || textContent.includes('meta analysis');
              case 'systematic-reviews':
                return textContent.includes('systematic review');
              default:
                return false;
            }
          });
        }
        
        // Check educational content
        if (!hasMatchingContent && filters.contentTypes.educationalContent?.length) {
          hasMatchingContent = filters.contentTypes.educationalContent.some(type => {
            switch (type) {
              case 'cme-materials':
                return textContent.includes('cme') || textContent.includes('continuing education');
              case 'case-studies':
                return textContent.includes('case study') || textContent.includes('case report');
              case 'learning-modules':
                return textContent.includes('education') || textContent.includes('learning');
              default:
                return false;
            }
          });
        }
        
        // If we have content type filters but no match, exclude unless it's a general match
        if (Object.values(filters.contentTypes).some(arr => arr && arr.length > 0) && !hasMatchingContent) {
          // Allow results that might still be relevant (don't be too restrictive)
          return true; // Keep most results to avoid over-filtering
        }
      }
      
      return true; // Keep result if it passes all filters
    });
  }

  /**
   * Generate a unique key for result deduplication
   */
  private generateResultKey(result: SearchResult): string {
    // Use URL or title for deduplication
    return result.url || result.title.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Transform orchestrator results to common format
   */
  private transformOrchestratorResults(results: any[]): SearchResult[] {
    return results.map((result, index) => ({
      id: result.id || `orchestrator-${index}`,
      title: result.title || '',
      url: result.url || '',
      snippet: result.snippet || result.description || '',
      source: result.source || this.extractDomain(result.url || ''),
      provider: result.provider || 'unknown' as const,
      relevanceScore: result.relevanceScore || Math.max(0.9 - (index * 0.1), 0.1),
      confidence: result.confidence || 0.8,
      publicationDate: result.publicationDate || undefined,
      evidenceLevel: result.evidenceLevel || undefined,
      specialty: result.specialty || undefined,
      contentType: result.contentType || undefined
    }));
  }

  /**
   * Build medical search query with specialty and advanced filters
   */
  private buildMedicalQuery(query: SearchQuery): string {
    let searchQuery = query.query;
    
    // Add specialty context (keep simple)
    if (query.specialty) {
      searchQuery += ` ${query.specialty}`;
    }
    
    // Process advanced filters if present
    if (query.advancedFilters) {
      const filters = query.advancedFilters;
      
      // Add content type filters
      if (filters.contentTypes) {
        const contentTerms: string[] = [];
        
        // Research literature
        if (filters.contentTypes.researchLiterature?.length) {
          filters.contentTypes.researchLiterature.forEach(type => {
            switch (type) {
              case 'studies': contentTerms.push('clinical study'); break;
              case 'trials': contentTerms.push('clinical trial'); break;
              case 'meta-analyses': contentTerms.push('meta-analysis'); break;
              case 'systematic-reviews': contentTerms.push('systematic review'); break;
            }
          });
        }
        
        // Clinical guidelines
        if (filters.contentTypes.clinicalGuidelines?.length) {
          filters.contentTypes.clinicalGuidelines.forEach(type => {
            switch (type) {
              case 'treatment-guidelines': contentTerms.push('treatment guidelines'); break;
              case 'diagnostic-protocols': contentTerms.push('diagnostic protocol'); break;
              case 'best-practices': contentTerms.push('best practices'); break;
            }
          });
        }
        
        // Medical references
        if (filters.contentTypes.medicalReferences?.length) {
          filters.contentTypes.medicalReferences.forEach(type => {
            switch (type) {
              case 'textbooks': contentTerms.push('medical textbook'); break;
              case 'handbooks': contentTerms.push('clinical handbook'); break;
              case 'medical-dictionaries': contentTerms.push('medical dictionary'); break;
            }
          });
        }
        
        // Educational content
        if (filters.contentTypes.educationalContent?.length) {
          filters.contentTypes.educationalContent.forEach(type => {
            switch (type) {
              case 'cme-materials': contentTerms.push('CME continuing education'); break;
              case 'case-studies': contentTerms.push('case study'); break;
              case 'learning-modules': contentTerms.push('medical education'); break;
            }
          });
        }
        
        // Add the most important content terms (limit to 2 to avoid query bloat)
        if (contentTerms.length > 0) {
          searchQuery += ` ${contentTerms.slice(0, 2).join(' ')}`;
        }
      }
      
      // Add file format filters
      if (filters.fileFormats?.length) {
        const formatTerms: string[] = [];
        filters.fileFormats.forEach(format => {
          switch (format) {
            case 'video': formatTerms.push('video lecture medical'); break;
            case 'audio': formatTerms.push('podcast medical education'); break;
            case 'pdf': formatTerms.push('PDF medical document'); break;
            case 'ppt': formatTerms.push('presentation medical slides'); break;
          }
        });
        
        // Add format terms (limit to 1 to avoid query bloat)
        if (formatTerms.length > 0) {
          searchQuery += ` ${formatTerms[0]}`;
        }
      }
      
      // Add authority source filters
      if (filters.sourceAuthority) {
        const authorityTerms: string[] = [];
        
        if (filters.sourceAuthority.government?.length) {
          authorityTerms.push('site:cdc.gov OR site:nih.gov OR site:fda.gov');
        }
        
        if (filters.sourceAuthority.professionalSocieties?.length) {
          const societies = filters.sourceAuthority.professionalSocieties;
          if (societies.includes('aha')) authorityTerms.push('site:heart.org');
          if (societies.includes('acc')) authorityTerms.push('site:acc.org');
          if (societies.includes('acs')) authorityTerms.push('site:cancer.org');
        }
        
        if (filters.sourceAuthority.publishers?.length) {
          const publishers = filters.sourceAuthority.publishers;
          if (publishers.includes('nejm')) authorityTerms.push('site:nejm.org');
          if (publishers.includes('lancet')) authorityTerms.push('site:thelancet.com');
          if (publishers.includes('bmj')) authorityTerms.push('site:bmj.com');
          if (publishers.includes('jama')) authorityTerms.push('site:jamanetwork.com');
        }
        
        // Add site restrictions (limit to avoid query bloat)
        if (authorityTerms.length > 0) {
          searchQuery += ` (${authorityTerms.slice(0, 3).join(' OR ')})`;
        }
      }
      
      // Add recency filter
      if (filters.recencyPeriod) {
        switch (filters.recencyPeriod) {
          case 'last-30-days':
            searchQuery += ' recent 2024'; break;
          case '3-months':
            searchQuery += ' recent 2024'; break;
          case '1-year':
            searchQuery += ' 2024'; break;
          case '2-years':
            searchQuery += ' 2023 2024'; break;
        }
      }
    } else {
      // Fallback to legacy filters if no advanced filters
      // Simplify evidence level filters - use only the most important one
      if (query.evidenceLevel && query.evidenceLevel.length > 0) {
        const primaryLevel = query.evidenceLevel[0];
        let evidenceTerm = '';
        switch (primaryLevel) {
          case 'systematic-review': evidenceTerm = 'systematic review'; break;
          case 'rct': evidenceTerm = 'randomized trial'; break;
          case 'cohort': evidenceTerm = 'cohort study'; break;
          case 'case-control': evidenceTerm = 'case control'; break;
          case 'case-series': evidenceTerm = 'case series'; break;
          default: evidenceTerm = primaryLevel; break;
        }
        searchQuery += ` ${evidenceTerm}`;
      }
      
      // Simplify content type filters - use only the most important one
      if (query.contentType && query.contentType.length > 0) {
        const primaryType = query.contentType[0];
        let contentTerm = '';
        switch (primaryType) {
          case 'journal-article': contentTerm = 'journal article'; break;
          case 'clinical-guideline': contentTerm = 'guidelines'; break;
          case 'consensus-statement': contentTerm = 'consensus'; break;
          case 'practice-bulletin': contentTerm = 'practice bulletin'; break;
          default: contentTerm = primaryType; break;
        }
        searchQuery += ` ${contentTerm}`;
      }
    }
    
    // Ensure the query isn't too long (API limits)
    if (searchQuery.length > 150) {
      searchQuery = searchQuery.substring(0, 150).trim();
      // Remove incomplete words at the end
      const lastSpaceIndex = searchQuery.lastIndexOf(' ');
      if (lastSpaceIndex > 50) {
        searchQuery = searchQuery.substring(0, lastSpaceIndex);
      }
    }
    
    return searchQuery;
  }

  /**
   * Call Brave Search API
   */
  private async callBraveAPI(query: SearchQuery, signal?: AbortSignal): Promise<SearchResponse> {
    const startTime = Date.now();
    const searchQuery = this.buildMedicalQuery(query);

    // Get authentication token
    const authStartTime = Date.now();
    const { data: { session } } = await import('../../lib/supabase').then(m => m.supabase.auth.getSession());
    const authTime = Date.now() - authStartTime;
    
    if (!session) {
      throw new Error('Authentication required for search');
    }

    // Use Netlify Functions for both development and production
    const endpoint = '/.netlify/functions/search-brave';
    
    const body = {
      q: searchQuery,
      filters: {
        limit: query.limit || 10,
        language: 'en',
        country: 'US',
        safesearch: 'moderate',
        recency: query.recency
      }
    };

    const requestStartTime = Date.now();
    let response: Response;
    
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
        signal
      });
    } catch (fetchError) {
      const requestTime = Date.now() - requestStartTime;
      console.error(`🌐 [BRAVE] Network request failed:`, {
        requestTime: `${requestTime}ms`,
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        errorType: fetchError instanceof Error ? fetchError.constructor.name : typeof fetchError
      });
      throw fetchError;
    }
    
    const requestTime = Date.now() - requestStartTime;

    if (!response.ok) {
      let errorDetails: any = {};
      try {
        const errorText = await response.text();
        errorDetails = {
          responseBody: errorText.substring(0, 500), // First 500 chars
          bodyLength: errorText.length
        };
      } catch (parseError) {
        errorDetails.parseError = parseError instanceof Error ? parseError.message : String(parseError);
      }

      throw new Error(`Brave API error: ${response.status} ${response.statusText}`);
    }

    const parseStartTime = Date.now();
    let data: any;
    
    try {
      data = await response.json();
    } catch (parseError) {
      const parseTime = Date.now() - parseStartTime;
      throw new Error(`Failed to parse Brave API response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
    const parseTime = Date.now() - parseStartTime;
    const totalTime = Date.now() - startTime;
    
    // The response is wrapped in a success response structure
    const searchData = data.data || data;
    
    const transformedResults = this.transformBraveResults(searchData.results || []);
    
    return {
      results: transformedResults,
      totalCount: searchData.totalCount || 0,
      searchTime: totalTime,
      provider: 'brave',
      query: searchQuery,
      status: 'success'
    };
  }

  /**
   * Call Exa AI API
   */
  private async callExaAPI(query: SearchQuery, signal?: AbortSignal): Promise<SearchResponse> {
    const startTime = Date.now();
    const searchQuery = this.buildMedicalQuery(query);
    
    // Get authentication token
    const { data: { session } } = await import('../../lib/supabase').then(m => m.supabase.auth.getSession());
    if (!session) {
      throw new Error('Authentication required for search');
    }
    
    // Use Netlify Functions for both development and production
    const endpoint = '/.netlify/functions/search-exa';

    const body = {
      query: searchQuery,
      num_results: query.limit || 10,
      include_text: true,
      include_domains: [
        'pubmed.ncbi.nlm.nih.gov',
        'nejm.org',
        'jamanetwork.com',
        'thelancet.com',
        'nature.com',
        'bmj.com',
        'acc.org',
        'heart.org',
        'acog.org'
      ],
      start_crawl_date: query.recency === 'last-year' ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
      signal
    });

    if (!response.ok) {
      throw new Error(`Exa API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // The response is wrapped in a success response structure
    const searchData = data.data || data;
    
    return {
      results: this.transformExaResults(searchData.results || []),
      totalCount: searchData.totalCount || searchData.results?.length || 0,
      searchTime: Date.now() - startTime,
      provider: 'exa',
      query: searchQuery,
      status: 'success'
    };
  }

  /**
   * Call Perplexity AI API
   */
  private async callPerplexityAPI(query: SearchQuery, signal?: AbortSignal): Promise<SearchResponse> {
    const startTime = Date.now();
    const searchQuery = this.buildMedicalQuery(query);
    
    // Get authentication token
    const { data: { session } } = await import('../../lib/supabase').then(m => m.supabase.auth.getSession());
    if (!session) {
      throw new Error('Authentication required for search');
    }
    
    // Use Netlify Functions for both development and production
    const endpoint = '/.netlify/functions/search-perplexity';

    const body = {
      q: searchQuery,
      filters: {
        model: "sonar-pro",
        maxTokens: 1000,
        temperature: 0.2,
        returnCitations: true,
        searchDomainFilter: [
          "pubmed.ncbi.nlm.nih.gov",
          "cochrane.org",
          "nejm.org",
          "jamanetwork.com",
          "thelancet.com",
          "bmj.com"
        ]
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Handle both direct results and nested data structure
    const results = data.results || data.data?.results || [];
    const totalCount = data.totalCount || data.data?.totalCount || results.length;
    
    // The backend already returns properly formatted results
    return {
      results,
      totalCount,
      searchTime: Date.now() - startTime,
      provider: 'perplexity',
      query: searchQuery,
      status: 'success',
      summary: data.summary || data.data?.summary,
      evidenceLevel: data.evidenceLevel || data.data?.evidenceLevel,
      keyFindings: data.keyFindings || data.data?.keyFindings
    };
  }

  /**
   * Transform Brave Search results to common format
   */
  private transformBraveResults(results: any[]): SearchResult[] {
    return results.map((result, index) => ({
      id: `brave-${index}`,
      title: result.title || '',
      url: result.url || '',
      snippet: result.description || '',
      source: this.extractDomain(result.url || ''),
      provider: 'brave' as const,
      relevanceScore: Math.max(0.9 - (index * 0.1), 0.1),
      confidence: 0.8,
      publicationDate: result.age || undefined,
      evidenceLevel: this.classifyEvidenceLevel(result.title + ' ' + result.description),
      contentType: this.classifyContentType(result.title + ' ' + result.description)
    }));
  }

  /**
   * Transform Exa AI results to common format
   */
  private transformExaResults(results: any[]): SearchResult[] {
    return results.map((result, index) => ({
      id: `exa-${index}`,
      title: result.title || '',
      url: result.url || '',
      snippet: result.text || result.snippet || '',
      source: this.extractDomain(result.url || ''),
      provider: 'exa' as const,
      relevanceScore: result.score || Math.max(0.9 - (index * 0.1), 0.1),
      confidence: 0.85,
      publicationDate: result.publishedDate || undefined,
      evidenceLevel: this.classifyEvidenceLevel(result.title + ' ' + result.text),
      contentType: this.classifyContentType(result.title + ' ' + result.text)
    }));
  }

  /**
   * Call ClinicalTrials.gov API
   */
  private async callClinicalTrialsAPI(query: SearchQuery, signal?: AbortSignal): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/.netlify/functions/search-clinicaltrials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query: query.query,
          filters: query.trialFilters || {
            recruitmentStatus: ['recruiting', 'active'],
            ...(query.specialty && { 
              phase: this.mapSpecialtyToPhases(query.specialty) 
            })
          },
          pageSize: query.limit || 20
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`ClinicalTrials API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        results: this.transformClinicalTrialsResults(data.studies || [], query.query),
        totalCount: data.totalCount || data.studies?.length || 0,
        searchTime: Date.now() - startTime,
        provider: 'clinicaltrials',
        query: query.query,
        status: 'success'
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Clinical trials search timed out');
      }
      throw error;
    }
  }

  /**
   * Transform ClinicalTrials.gov results to common format
   */
  private transformClinicalTrialsResults(studies: any[], originalQuery: string): SearchResult[] {
    return studies.slice(0, 20).map((study, index) => {
      const identification = study.protocolSection?.identificationModule;
      const status = study.protocolSection?.statusModule;
      const design = study.protocolSection?.designModule;
      
      const title = identification?.officialTitle || identification?.briefTitle || 'Untitled Study';
      const snippet = this.generateClinicalTrialSnippet(study);
      
      return {
        id: `ct-${identification?.nctId || index}`,
        title: title,
        url: `https://clinicaltrials.gov/study/${identification?.nctId}`,
        snippet: snippet,
        source: 'ClinicalTrials.gov',
        provider: 'clinicaltrials' as const,
        relevanceScore: this.calculateClinicalTrialRelevance(study, originalQuery, index),
        confidence: 0.95,
        publicationDate: status?.studyFirstPostDateStruct?.date,
        contentType: 'clinical-trial',
        specialty: this.extractSpecialtyFromTrial(study),
        evidenceLevel: this.mapPhaseToEvidenceLevel(design?.phases)
      };
    });
  }

  /**
   * Generate snippet for clinical trial
   */
  private generateClinicalTrialSnippet(study: any): string {
    const description = study.protocolSection?.descriptionModule;
    const brief = description?.briefSummary || '';
    const conditions = study.protocolSection?.conditionsModule?.conditions || [];
    const phase = study.protocolSection?.designModule?.phases?.[0] || '';
    const status = study.protocolSection?.statusModule?.overallStatus || '';
    
    let snippet = brief.substring(0, 150).trim();
    if (snippet && !snippet.endsWith('.')) snippet += '.';
    
    if (conditions.length > 0) {
      snippet += ` Conditions: ${conditions.slice(0, 2).join(', ')}.`;
    }
    
    if (phase) {
      snippet += ` ${phase.replace('PHASE', 'Phase ').replace('_', ' ')}.`;
    }
    
    if (status === 'RECRUITING') {
      snippet += ' Currently recruiting participants.';
    }
    
    return snippet.trim();
  }

  /**
   * Calculate relevance score for clinical trials
   */
  private calculateClinicalTrialRelevance(study: any, query: string, index: number): number {
    let score = Math.max(0.85 - (index * 0.05), 0.3);
    
    const conditions = study.protocolSection?.conditionsModule?.conditions || [];
    const title = study.protocolSection?.identificationModule?.briefTitle || '';
    const keywords = study.protocolSection?.conditionsModule?.keywords || [];
    
    // Boost for query match in conditions or title
    const queryLower = query.toLowerCase();
    if (conditions.some((c: string) => c.toLowerCase().includes(queryLower)) ||
        title.toLowerCase().includes(queryLower) ||
        keywords.some((k: string) => k.toLowerCase().includes(queryLower))) {
      score += 0.15;
    }
    
    // Boost for recruiting status
    const status = study.protocolSection?.statusModule?.overallStatus;
    if (status === 'RECRUITING') {
      score += 0.1;
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
   * Extract specialty from clinical trial
   */
  private extractSpecialtyFromTrial(study: any): string {
    const conditions = study.protocolSection?.conditionsModule?.conditions || [];
    const keywords = study.protocolSection?.conditionsModule?.keywords || [];
    
    const allTerms = [...conditions, ...keywords].join(' ').toLowerCase();
    
    if (allTerms.includes('cardiac') || allTerms.includes('heart') || allTerms.includes('cardiovascular')) {
      return 'cardiology';
    }
    if (allTerms.includes('cancer') || allTerms.includes('oncolog') || allTerms.includes('tumor')) {
      return 'oncology';
    }
    if (allTerms.includes('pregnan') || allTerms.includes('maternal') || allTerms.includes('obstetric')) {
      return 'obstetrics';
    }
    if (allTerms.includes('gynecolog') || allTerms.includes('reproduct') || allTerms.includes('ovarian')) {
      return 'gynecology';
    }
    
    return 'general';
  }

  /**
   * Map clinical trial phase to evidence level
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
   * Map specialty to relevant trial phases
   */
  private mapSpecialtyToPhases(_specialty: string): string[] {
    // For most specialties, include phase 2-4 trials
    // Early phase trials are less relevant for general practice
    return ['phase2', 'phase3', 'phase4'];
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  /**
   * Classify evidence level based on content
   */
  private classifyEvidenceLevel(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('systematic review') || lowerText.includes('meta-analysis')) {
      return 'systematic-review';
    }
    if (lowerText.includes('randomized controlled trial') || lowerText.includes('rct')) {
      return 'rct';
    }
    if (lowerText.includes('cohort study') || lowerText.includes('prospective')) {
      return 'cohort';
    }
    if (lowerText.includes('case-control') || lowerText.includes('retrospective')) {
      return 'case-control';
    }
    if (lowerText.includes('case series') || lowerText.includes('case report')) {
      return 'case-series';
    }
    
    return 'other';
  }

  /**
   * Classify content type based on content
   */
  private classifyContentType(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('guideline') || lowerText.includes('guidelines')) {
      return 'clinical-guideline';
    }
    if (lowerText.includes('consensus') || lowerText.includes('statement')) {
      return 'consensus-statement';
    }
    if (lowerText.includes('practice bulletin') || lowerText.includes('bulletin')) {
      return 'practice-bulletin';
    }
    if (lowerText.includes('journal') || lowerText.includes('article')) {
      return 'journal-article';
    }
    
    return 'other';
  }
}

// Export singleton instance
export const searchOrchestrator = new SearchOrchestrator();