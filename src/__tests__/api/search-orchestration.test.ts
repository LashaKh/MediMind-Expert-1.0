/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SearchOrchestrator, type SearchQuery, type SearchProvider } from '../../utils/search/apiOrchestration'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock data
const mockBraveResponse = {
  web: {
    results: [
      {
        title: 'Cardiovascular Disease Prevention Guidelines 2024',
        url: 'https://acc.org/guidelines/cvd-prevention',
        description: 'Updated guidelines for cardiovascular disease prevention based on systematic review evidence.',
        age: '2024-01-15'
      },
      {
        title: 'Meta-analysis of Statin Therapy in Primary Prevention',
        url: 'https://pubmed.ncbi.nlm.nih.gov/example1',
        description: 'Comprehensive meta-analysis showing benefits of statin therapy in primary prevention.',
        age: '2023-12-01'
      }
    ]
  }
}

const mockExaResponse = {
  results: [
    {
      title: 'Hypertension Management: Clinical Guidelines Update',
      url: 'https://jama.jamanetwork.com/example',
      text: 'Recent randomized controlled trial data supports updated blood pressure targets.',
      score: 0.95,
      publishedDate: '2024-02-01'
    },
    {
      title: 'Cardiac Risk Assessment in Women',
      url: 'https://nejm.org/example',
      text: 'Cohort study examining cardiovascular risk factors in women.',
      score: 0.87,
      publishedDate: '2023-11-15'
    }
  ]
}

const mockPerplexityResponse = {
  choices: [
    {
      message: {
        content: `Based on recent medical literature:

[1] A 2024 systematic review in the Journal of the American College of Cardiology demonstrates that intensive lipid management reduces cardiovascular events by 25%.

[2] The 2023 meta-analysis published in The Lancet shows that combination therapy with ACE inhibitors and statins provides superior cardiovascular protection.

[3] Recent randomized controlled trial data from NEJM indicates that novel biomarkers can improve risk stratification in asymptomatic patients.

These findings support updated clinical guidelines for cardiovascular disease prevention.`
      }
    }
  ]
}

describe('SearchOrchestrator', () => {
  let orchestrator: SearchOrchestrator
  
  const mockQuery: SearchQuery = {
    query: 'hypertension guidelines',
    specialty: 'cardiology',
    evidenceLevel: ['systematic-review', 'rct'],
    contentType: ['clinical-guideline'],
    recency: 'last-year',
    limit: 10
  }

  beforeEach(() => {
    vi.clearAllMocks()
    orchestrator = new SearchOrchestrator()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor and Initialization', () => {
    it('should initialize with default providers', () => {
      const defaultOrchestrator = new SearchOrchestrator()
      expect(defaultOrchestrator).toBeInstanceOf(SearchOrchestrator)
    })

    it('should accept custom providers', () => {
      const customProviders: SearchProvider[] = [
        {
          id: 'brave',
          name: 'Brave Custom',
          enabled: true,
          priority: 1,
          timeout: 5000,
          retryCount: 1,
          weight: 1.0
        }
      ]
      
      const customOrchestrator = new SearchOrchestrator(customProviders)
      expect(customOrchestrator).toBeInstanceOf(SearchOrchestrator)
    })
  })

  describe('Sequential Search', () => {
    it('should successfully search using first available provider', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBraveResponse)
      })

      const result = await orchestrator.search(mockQuery)

      expect(result).toMatchObject({
        query: expect.stringContaining('hypertension guidelines'),
        successfulProviders: 1,
        providers: ['brave']
      })
      
      expect(result.results).toHaveLength(2)
      expect(result.results[0]).toMatchObject({
        title: 'Cardiovascular Disease Prevention Guidelines 2024',
        provider: 'brave',
        evidenceLevel: expect.any(String),
        contentType: expect.any(String)
      })
    })

    it('should fallback to next provider when first fails', async () => {
      // First call (Brave) fails
      mockFetch
        .mockRejectedValueOnce(new Error('Brave API Error'))
        // Second call (Exa) succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockExaResponse)
        })

      const result = await orchestrator.search(mockQuery)

      expect(result.providers).toEqual(['exa'])
      expect(result.failedProviders).toHaveLength(1)
      expect(result.failedProviders[0]).toMatchObject({
        provider: 'brave',
        error: 'Brave API Error'
      })
    })

    it('should throw error when all providers fail', async () => {
      mockFetch.mockRejectedValue(new Error('Network Error'))

      await expect(orchestrator.search(mockQuery)).rejects.toThrow('Network Error')
    })

    it('should throw error when no providers are enabled', async () => {
      const noProviders: SearchProvider[] = []
      const emptyOrchestrator = new SearchOrchestrator(noProviders)

      await expect(emptyOrchestrator.search(mockQuery)).rejects.toThrow('No enabled search providers available')
    })

    it('should handle timeout errors correctly', async () => {
      // Mock a provider with very short timeout
      const shortTimeoutProviders: SearchProvider[] = [
        {
          id: 'brave',
          name: 'Brave Search',
          enabled: true,
          priority: 1,
          timeout: 1, // 1ms timeout
          retryCount: 0,
          weight: 1.0
        }
      ]
      
      const timeoutOrchestrator = new SearchOrchestrator(shortTimeoutProviders)
      
      // Mock a slow response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockBraveResponse)
        }), 100)) // 100ms delay
      )

      await expect(timeoutOrchestrator.search(mockQuery)).rejects.toThrow(/timed out/)
    })
  })

  describe('Parallel Search', () => {
    it('should aggregate results from multiple providers', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockBraveResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockExaResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockPerplexityResponse)
        })

      const result = await orchestrator.parallelSearch(mockQuery)

      expect(result.successfulProviders).toBe(3)
      expect(result.providers).toEqual(['brave', 'exa', 'perplexity'])
      expect(result.results.length).toBeGreaterThan(0)
      expect(result.failedProviders).toHaveLength(0)
    })

    it('should handle partial failures in parallel search', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockBraveResponse)
        })
        .mockRejectedValueOnce(new Error('Exa API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockPerplexityResponse)
        })

      const result = await orchestrator.parallelSearch(mockQuery)

      expect(result.successfulProviders).toBe(2)
      expect(result.providers).toEqual(['brave', 'perplexity'])
      expect(result.failedProviders).toHaveLength(1)
      expect(result.failedProviders[0].provider).toBe('exa')
    })

    it('should throw error when all parallel providers fail', async () => {
      mockFetch.mockRejectedValue(new Error('Network Error'))

      await expect(orchestrator.parallelSearch(mockQuery)).rejects.toThrow('All search providers failed')
    })

    it('should deduplicate similar results', async () => {
      // Mock responses with duplicate URLs
      const duplicateBraveResponse = {
        web: {
          results: [
            {
              title: 'Hypertension Guidelines',
              url: 'https://example.com/duplicate',
              description: 'Guidelines for hypertension management.',
              age: '2024-01-01'
            }
          ]
        }
      }
      
      const duplicateExaResponse = {
        results: [
          {
            title: 'Hypertension Management Guidelines',
            url: 'https://example.com/duplicate', // Same URL
            text: 'Updated guidelines for managing hypertension.',
            score: 0.9
          }
        ]
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(duplicateBraveResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(duplicateExaResponse)
        })
        .mockRejectedValueOnce(new Error('Perplexity Error'))

      const result = await orchestrator.parallelSearch(mockQuery)

      // Should have only one result due to deduplication
      expect(result.results).toHaveLength(1)
      expect(result.results[0].url).toBe('https://example.com/duplicate')
      // Confidence should be boosted for duplicates
      expect(result.results[0].confidence).toBeGreaterThan(0.7)
    })
  })

  describe('Medical Query Building', () => {
    it('should build medical query with specialty context', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBraveResponse)
      })

      await orchestrator.search(mockQuery)

      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
      const url = lastCall[0] as string
      
      expect(url).toContain('cardiology')
    })

    it('should include evidence level filters in query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBraveResponse)
      })

      await orchestrator.search(mockQuery)

      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
      const url = lastCall[0] as string
      
      expect(url).toContain('systematic%20review')
      expect(url).toContain('randomized%20controlled%20trial')
    })

    it('should include content type filters in query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBraveResponse)
      })

      await orchestrator.search(mockQuery)

      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
      const url = lastCall[0] as string
      
      expect(url).toContain('clinical%20guideline')
    })
  })

  describe('Provider-Specific API Calls', () => {
    describe('Brave Search API', () => {
      it('should call Brave API with correct parameters', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockBraveResponse)
        })

        await orchestrator.search({ ...mockQuery, providers: ['brave'] })

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/brave/web/search'),
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Accept': 'application/json'
            })
          })
        )
      })

      it('should handle Brave API errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        })

        await expect(
          orchestrator.search({ ...mockQuery, providers: ['brave'] })
        ).rejects.toThrow('Brave API error: 404 Not Found')
      })

      it('should transform Brave results correctly', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockBraveResponse)
        })

        const result = await orchestrator.search({ ...mockQuery, providers: ['brave'] })

        expect(result.results[0]).toMatchObject({
          id: 'brave-0',
          title: 'Cardiovascular Disease Prevention Guidelines 2024',
          url: 'https://acc.org/guidelines/cvd-prevention',
          provider: 'brave',
          source: 'acc.org',
          evidenceLevel: 'systematic-review', // Should classify from content
          contentType: 'clinical-guideline'
        })
      })
    })

    describe('Exa AI API', () => {
      it('should call Exa API with medical domains', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockExaResponse)
        })

        await orchestrator.search({ ...mockQuery, providers: ['exa'] })

        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
        const requestBody = JSON.parse(lastCall[1].body)
        
        expect(requestBody.include_domains).toContain('pubmed.ncbi.nlm.nih.gov')
        expect(requestBody.include_domains).toContain('nejm.org')
        expect(requestBody.include_domains).toContain('jamanetwork.com')
      })

      it('should include recency filter for Exa API', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockExaResponse)
        })

        await orchestrator.search({ 
          ...mockQuery, 
          providers: ['exa'],
          recency: 'last-year'
        })

        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
        const requestBody = JSON.parse(lastCall[1].body)
        
        expect(requestBody.start_crawl_date).toBeDefined()
      })

      it('should transform Exa results with scores', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockExaResponse)
        })

        const result = await orchestrator.search({ ...mockQuery, providers: ['exa'] })

        expect(result.results[0]).toMatchObject({
          id: 'exa-0',
          provider: 'exa',
          relevanceScore: 0.95,
          confidence: 0.85
        })
      })
    })

    describe('Perplexity AI API', () => {
      it('should call Perplexity API with medical context', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockPerplexityResponse)
        })

        await orchestrator.search({ ...mockQuery, providers: ['perplexity'] })

        const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
        const requestBody = JSON.parse(lastCall[1].body)
        
        expect(requestBody.filters.model).toBe('sonar-pro')
        expect(requestBody.q).toBeDefined()
        expect(requestBody.filters.searchDomainFilter).toContain('pubmed.ncbi.nlm.nih.gov')
      })

      it('should parse Perplexity citations correctly', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockPerplexityResponse)
        })

        const result = await orchestrator.search({ ...mockQuery, providers: ['perplexity'] })

        expect(result.results).toHaveLength(3) // Should extract 3 citations
        expect(result.results[0]).toMatchObject({
          id: 'perplexity-0',
          provider: 'perplexity',
          title: expect.stringContaining('systematic review'),
          snippet: expect.stringContaining('cardiovascular events')
        })
      })
    })
  })

  describe('Result Classification', () => {
    it('should classify evidence levels correctly', async () => {
      const testResults = [
        { text: 'systematic review of cardiovascular outcomes', expected: 'systematic-review' },
        { text: 'randomized controlled trial of statin therapy', expected: 'rct' },
        { text: 'cohort study of 10,000 patients', expected: 'cohort' },
        { text: 'case-control study of myocardial infarction', expected: 'case-control' },
        { text: 'case series of rare complications', expected: 'case-series' },
        { text: 'expert opinion on treatment guidelines', expected: 'other' }
      ]

      for (const testCase of testResults) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            web: {
              results: [{
                title: testCase.text,
                url: 'https://example.com',
                description: testCase.text
              }]
            }
          })
        })

        const result = await orchestrator.search({ 
          query: testCase.text,
          providers: ['brave']
        })

        expect(result.results[0].evidenceLevel).toBe(testCase.expected)
      }
    })

    it('should classify content types correctly', async () => {
      const testResults = [
        { text: 'clinical guidelines for hypertension', expected: 'clinical-guideline' },
        { text: 'consensus statement on diabetes', expected: 'consensus-statement' },
        { text: 'practice bulletin for obstetrics', expected: 'practice-bulletin' },
        { text: 'journal article on cardiology', expected: 'journal-article' },
        { text: 'conference presentation data', expected: 'other' }
      ]

      for (const testCase of testResults) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            web: {
              results: [{
                title: testCase.text,
                url: 'https://example.com',
                description: testCase.text
              }]
            }
          })
        })

        const result = await orchestrator.search({ 
          query: testCase.text,
          providers: ['brave']
        })

        expect(result.results[0].contentType).toBe(testCase.expected)
      }
    })
  })

  describe('Retry Logic', () => {
    it('should retry failed requests with exponential backoff', async () => {
      const retryProviders: SearchProvider[] = [
        {
          id: 'brave',
          name: 'Brave Search',
          enabled: true,
          priority: 1,
          timeout: 5000,
          retryCount: 2,
          weight: 1.0
        }
      ]
      
      const retryOrchestrator = new SearchOrchestrator(retryProviders)
      
      // Fail twice, then succeed
      mockFetch
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Still failing'))
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockBraveResponse)
        })

      const result = await retryOrchestrator.search(mockQuery)

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result.providers).toEqual(['brave'])
    })

    it('should fail after max retries exceeded', async () => {
      const retryProviders: SearchProvider[] = [
        {
          id: 'brave',
          name: 'Brave Search',
          enabled: true,
          priority: 1,
          timeout: 5000,
          retryCount: 1, // Only 1 retry
          weight: 1.0
        }
      ]
      
      const retryOrchestrator = new SearchOrchestrator(retryProviders)
      mockFetch.mockRejectedValue(new Error('Persistent failure'))

      await expect(retryOrchestrator.search(mockQuery)).rejects.toThrow('Persistent failure')
      expect(mockFetch).toHaveBeenCalledTimes(2) // Initial + 1 retry
    })
  })

  describe('Provider Weight and Scoring', () => {
    it('should apply provider weights in result aggregation', async () => {
      // Mock different scores from different providers
      const highScoreBrave = {
        web: {
          results: [{
            title: 'High relevance result',
            url: 'https://brave-result.com',
            description: 'Very relevant content'
          }]
        }
      }

      const lowScoreExa = {
        results: [{
          title: 'Lower relevance result',
          url: 'https://exa-result.com',
          text: 'Less relevant content',
          score: 0.3
        }]
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(highScoreBrave)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(lowScoreExa)
        })
        .mockRejectedValueOnce(new Error('Perplexity failed'))

      const result = await orchestrator.parallelSearch(mockQuery)

      // Brave result (weight 0.4) should score higher than Exa result (weight 0.35)
      expect(result.results[0].provider).toBe('brave')
    })

    it('should boost confidence for duplicate results', async () => {
      const duplicateResults = {
        web: {
          results: [{
            title: 'Same Result',
            url: 'https://duplicate.com',
            description: 'Same content'
          }]
        }
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(duplicateResults)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: [{
              title: 'Same Result',
              url: 'https://duplicate.com',
              text: 'Same content',
              score: 0.8
            }]
          })
        })
        .mockRejectedValueOnce(new Error('Perplexity failed'))

      const result = await orchestrator.parallelSearch(mockQuery)

      expect(result.results).toHaveLength(1)
      expect(result.results[0].confidence).toBeGreaterThan(0.8) // Should be boosted
    })
  })

  describe('URL and Domain Extraction', () => {
    it('should extract domain correctly from URLs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockBraveResponse)
      })

      const result = await orchestrator.search({ ...mockQuery, providers: ['brave'] })

      expect(result.results[0].source).toBe('acc.org')
      expect(result.results[1].source).toBe('pubmed.ncbi.nlm.nih.gov')
    })

    it('should handle malformed URLs gracefully', async () => {
      const malformedUrlResponse = {
        web: {
          results: [{
            title: 'Result with bad URL',
            url: 'not-a-valid-url',
            description: 'Content with invalid URL'
          }]
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(malformedUrlResponse)
      })

      const result = await orchestrator.search({ ...mockQuery, providers: ['brave'] })

      expect(result.results[0].source).toBe('not-a-valid-url') // Should fallback to original
    })
  })

  describe('Provider Selection', () => {
    it('should filter providers based on query preferences', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockExaResponse)
      })

      const result = await orchestrator.search({ 
        ...mockQuery, 
        providers: ['exa'] // Only use Exa
      })

      expect(result.providers).toEqual(['exa'])
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should respect provider priority ordering', async () => {
      // All providers fail except the last one
      mockFetch
        .mockRejectedValueOnce(new Error('Brave failed'))
        .mockRejectedValueOnce(new Error('Exa failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockPerplexityResponse)
        })

      const result = await orchestrator.search(mockQuery)

      expect(result.providers).toEqual(['perplexity'])
      expect(result.failedProviders).toHaveLength(2)
    })
  })
})