/**
 * Clinical Trials Integration Tests
 * Tests the integration of ClinicalTrials.gov API with MediSearch
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchOrchestrator } from '@/utils/search/apiOrchestration';
import ClinicalTrialsService from '@/services/clinicalTrialsService';

// Mock fetch globally
global.fetch = vi.fn();

describe('Clinical Trials Integration', () => {
  let orchestrator: SearchOrchestrator;
  
  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new SearchOrchestrator();
  });

  describe('SearchOrchestrator Integration', () => {
    it('should include clinical trials provider in default configuration', () => {
      const providers = orchestrator['providers'];
      const clinicalTrialsProvider = providers.find(p => p.id === 'clinicaltrials');
      
      expect(clinicalTrialsProvider).toBeDefined();
      expect(clinicalTrialsProvider?.enabled).toBe(true);
      expect(clinicalTrialsProvider?.weight).toBe(0.25);
    });

    it('should call clinical trials API when provider is enabled', async () => {
      const mockResponse = {
        studies: [{
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Clinical Trial'
            },
            statusModule: {
              overallStatus: 'RECRUITING'
            }
          }
        }],
        totalCount: 1
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const query = {
        query: 'diabetes',
        providers: ['clinicaltrials' as const],
        limit: 10
      };

      const result = await orchestrator.search(query);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/.netlify/functions/search-clinicaltrials'),
        expect.any(Object)
      );
    });
  });

  describe('Clinical Trials Service', () => {
    it('should transform API response to search results format', async () => {
      const mockApiResponse = {
        studies: [{
          protocolSection: {
            identificationModule: {
              nctId: 'NCT12345678',
              briefTitle: 'Test Trial for Diabetes',
              officialTitle: 'A Randomized Controlled Trial for Diabetes Treatment'
            },
            statusModule: {
              overallStatus: 'RECRUITING',
              studyFirstPostDateStruct: { date: '2024-01-15' }
            },
            designModule: {
              phases: ['PHASE3'],
              enrollmentInfo: { count: 200, type: 'ESTIMATED' }
            },
            conditionsModule: {
              conditions: ['Type 2 Diabetes Mellitus']
            },
            descriptionModule: {
              briefSummary: 'This is a test trial for diabetes treatment.'
            }
          }
        }],
        totalCount: 1
      };

      const results = ClinicalTrialsService.transformToSearchResults(
        mockApiResponse,
        'diabetes'
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        id: 'ct-NCT12345678',
        title: 'A Randomized Controlled Trial for Diabetes Treatment',
        url: 'https://clinicaltrials.gov/study/NCT12345678',
        contentType: 'clinical-trial',
        provider: 'clinicaltrials',
        clinicalTrialData: {
          nctId: 'NCT12345678',
          phase: 'PHASE3',
          status: 'RECRUITING',
          enrollment: 200
        }
      });
    });

    it('should build query parameters with filters', () => {
      const query = {
        query: 'heart failure',
        specialty: 'cardiology',
        evidenceLevel: ['high']
      };

      const filters = {
        recruitmentStatus: ['recruiting', 'active'],
        phase: ['phase3', 'phase4'],
        location: {
          address: 'New York, NY',
          radius: 50
        }
      };

      const params = ClinicalTrialsService.buildQueryParams(query, filters);

      expect(params.query).toContain('heart failure');
      expect(params.query).toContain('cardiovascular');
      expect(params.filters?.phase).toContain('phase3');
      expect(params.filters?.location?.address).toBe('New York, NY');
    });
  });

  describe('Clinical Trial Filtering', () => {
    it('should filter trials by recruitment status', () => {
      const filters = {
        recruitmentStatus: ['recruiting'],
        phase: [],
        gender: 'all' as const
      };

      const request = ClinicalTrialsService.buildQueryParams(
        { query: 'cancer' },
        filters
      );

      expect(request.filters?.recruitmentStatus).toEqual(['recruiting']);
    });

    it('should filter trials by phase', () => {
      const filters = {
        recruitmentStatus: [],
        phase: ['phase2', 'phase3'],
        gender: 'all' as const
      };

      const request = ClinicalTrialsService.buildQueryParams(
        { query: 'diabetes' },
        filters
      );

      expect(request.filters?.phase).toEqual(['phase2', 'phase3']);
    });

    it('should filter trials by location', () => {
      const filters = {
        recruitmentStatus: ['recruiting'],
        location: {
          address: 'Boston, MA',
          radius: 100
        },
        gender: 'all' as const
      };

      const request = ClinicalTrialsService.buildQueryParams(
        { query: 'heart disease' },
        filters
      );

      expect(request.filters?.location).toEqual({
        address: 'Boston, MA',
        radius: 100
      });
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify clinical trial results', () => {
      const clinicalTrialResult = {
        id: 'ct-123',
        title: 'Test Trial',
        url: 'https://example.com',
        snippet: 'Test',
        source: 'ClinicalTrials.gov',
        provider: 'clinicaltrials',
        relevanceScore: 0.9,
        confidence: 0.95,
        contentType: 'clinical-trial',
        clinicalTrialData: {
          nctId: 'NCT123',
          status: 'RECRUITING'
        }
      };

      const regularResult = {
        id: 'paper-123',
        title: 'Research Paper',
        url: 'https://example.com',
        snippet: 'Test',
        source: 'PubMed',
        provider: 'brave',
        relevanceScore: 0.8,
        confidence: 0.9,
        contentType: 'journal-article'
      };

      expect(ClinicalTrialsService.isClinicalTrialResult(clinicalTrialResult)).toBe(true);
      expect(ClinicalTrialsService.isClinicalTrialResult(regularResult)).toBe(false);
    });
  });
});