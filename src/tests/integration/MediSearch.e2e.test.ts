/**
 * End-to-End Integration Tests for MediSearch
 * Tests complete search workflows from UI to API responses
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Test components and contexts
import { MediSearchPage } from '@/components/MediSearch/MediSearchPage';
import { AuthContextProvider } from '@/contexts/AuthContext';
import { SpecialtyContextProvider } from '@/contexts/SpecialtyContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SearchContextProvider } from '@/components/MediSearch/contexts/SearchContextProvider';

// Mock API responses
import { mockBraveResponse, mockExaResponse, mockPerplexityResponse } from '../mocks/searchApiMocks';

// Test utilities
import { createTestUser, createTestWrapper } from '../utils/testUtils';
import { setupMockServer } from '../utils/mockServer';

// Performance monitoring
interface PerformanceMetrics {
  searchStartTime: number;
  searchEndTime: number;
  apiResponseTime: number;
  renderTime: number;
  totalInteractionTime: number;
}

describe('MediSearch E2E Integration Tests', () => {
  let mockServer: any;
  let performanceMetrics: PerformanceMetrics;
  let queryClient: QueryClient;

  beforeAll(async () => {
    // Setup mock API server
    mockServer = setupMockServer();
    
    // Mock network conditions
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false
      }
    });

    // Mock IntersectionObserver for virtualized lists
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    }));
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    performanceMetrics = {
      searchStartTime: 0,
      searchEndTime: 0,
      apiResponseTime: 0,
      renderTime: 0,
      totalInteractionTime: 0
    };

    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  afterAll(() => {
    mockServer?.close();
  });

  const renderMediSearch = (specialty = 'cardiology', user = createTestUser()) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthContextProvider initialUser={user}>
            <SpecialtyContextProvider initialSpecialty={specialty}>
              <LanguageProvider>
                <SearchContextProvider>
                  <MediSearchPage />
                </SearchContextProvider>
              </LanguageProvider>
            </SpecialtyContextProvider>
          </AuthContextProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Complete Search Workflow Tests', () => {
    test('should complete full cardiology search workflow with all providers', async () => {
      // Setup API mocks
      mockServer.use(
        mockBraveResponse('atrial fibrillation treatment'),
        mockExaResponse('atrial fibrillation treatment'),
        mockPerplexityResponse('atrial fibrillation treatment')
      );

      const user = userEvent.setup();
      performanceMetrics.searchStartTime = performance.now();

      // Render component
      renderMediSearch('cardiology');

      // Verify initial state
      expect(screen.getByPlaceholderText(/search medical literature/i)).toBeInTheDocument();
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();

      // Enter search query
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'atrial fibrillation treatment');

      // Apply filters
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      // Set evidence level filter
      const evidenceFilter = screen.getByLabelText(/systematic review/i);
      await user.click(evidenceFilter);

      // Set recency filter
      const recencyFilter = screen.getByLabelText(/last year/i);
      await user.click(recencyFilter);

      // Initiate search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Verify loading state
      expect(screen.getByTestId('search-loading')).toBeInTheDocument();

      // Wait for results
      await waitFor(
        () => {
          expect(screen.getByTestId('search-results')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      performanceMetrics.searchEndTime = performance.now();

      // Verify results structure
      const resultsContainer = screen.getByTestId('search-results');
      const resultCards = within(resultsContainer).getAllByTestId('result-card');
      
      expect(resultCards).toHaveLength.greaterThan(0);
      expect(resultCards).toHaveLength.lessThanOrEqual(20);

      // Verify result content
      const firstResult = resultCards[0];
      expect(within(firstResult).getByTestId('result-title')).toBeInTheDocument();
      expect(within(firstResult).getByTestId('result-snippet')).toBeInTheDocument();
      expect(within(firstResult).getByTestId('result-source')).toBeInTheDocument();
      expect(within(firstResult).getByTestId('evidence-badge')).toBeInTheDocument();

      // Test result interaction
      await user.click(firstResult);

      // Verify detail panel opens
      await waitFor(() => {
        expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
      });

      // Verify detail panel content
      expect(screen.getByTestId('detail-content')).toBeInTheDocument();
      expect(screen.getByTestId('bookmark-button')).toBeInTheDocument();
      expect(screen.getByTestId('share-button')).toBeInTheDocument();

      // Test bookmark functionality
      const bookmarkButton = screen.getByTestId('bookmark-button');
      await user.click(bookmarkButton);

      await waitFor(() => {
        expect(screen.getByTestId('bookmark-success')).toBeInTheDocument();
      });

      // Performance assertions
      const totalTime = performanceMetrics.searchEndTime - performanceMetrics.searchStartTime;
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify search history
      expect(localStorage.getItem('medisearch-history')).toContain('atrial fibrillation');
    });

    test('should handle OB/GYN specialty search with different filters', async () => {
      mockServer.use(
        mockExaResponse('preeclampsia management'),
        mockBraveResponse('preeclampsia management')
      );

      const user = userEvent.setup();
      renderMediSearch('obgyn');

      // Verify specialty context
      expect(screen.getByText(/ob\/gyn/i)).toBeInTheDocument();

      // Search for OB/GYN specific content  
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'preeclampsia management');

      // Apply content type filter
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      const guidelinesFilter = screen.getByLabelText(/clinical guidelines/i);
      await user.click(guidelinesFilter);

      // Execute search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for and verify results
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      const results = screen.getAllByTestId('result-card');
      expect(results).toHaveLength.greaterThan(0);

      // Verify OB/GYN specific result classification
      const firstResult = results[0];
      const contentTypeBadge = within(firstResult).getByTestId('content-type-badge');
      expect(contentTypeBadge).toHaveTextContent(/guideline/i);
    });

    test('should handle search failures with graceful fallback', async () => {
      // Mock API failures
      mockServer.use(
        // Brave fails
        rest.get('/api/brave/web/search', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Service unavailable' }));
        }),
        // Exa succeeds
        mockExaResponse('diabetes mellitus type 2'),
        // Perplexity fails
        rest.post('/api/perplexity/chat/completions', (req, res, ctx) => {
          return res(ctx.status(429), ctx.json({ error: 'Rate limit exceeded' }));
        })
      );

      const user = userEvent.setup();
      renderMediSearch();

      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'diabetes mellitus type 2');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Should still show results from successful provider
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Should show provider status
      expect(screen.getByTestId('provider-status')).toBeInTheDocument();
      expect(screen.getByText(/some providers unavailable/i)).toBeInTheDocument();

      const results = screen.getAllByTestId('result-card');
      expect(results).toHaveLength.greaterThan(0);
    });

    test('should handle complete API failure gracefully', async () => {
      // Mock all APIs to fail
      mockServer.use(
        rest.get('/api/brave/web/search', (req, res, ctx) => {
          return res(ctx.status(500));
        }),
        rest.post('/api/exa/search', (req, res, ctx) => {
          return res(ctx.status(500));
        }),
        rest.post('/api/perplexity/chat/completions', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      const user = userEvent.setup();
      renderMediSearch();

      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'medical search query');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByTestId('search-error')).toBeInTheDocument();
      });

      expect(screen.getByText(/search temporarily unavailable/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();

      // Test retry functionality
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(screen.getByTestId('search-loading')).toBeInTheDocument();
    });

    test('should maintain search state across navigation', async () => {
      mockServer.use(mockBraveResponse('hypertension guidelines'));

      const user = userEvent.setup();
      const { rerender } = renderMediSearch();

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'hypertension guidelines');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Simulate navigation away and back
      rerender(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthContextProvider initialUser={createTestUser()}>
              <SpecialtyContextProvider initialSpecialty="cardiology">
                <LanguageProvider>
                  <div>Different Page</div>
                </LanguageProvider>
              </SpecialtyContextProvider>
            </AuthContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Navigate back to search
      rerender(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthContextProvider initialUser={createTestUser()}>
              <SpecialtyContextProvider initialSpecialty="cardiology">
                <LanguageProvider>
                  <SearchContextProvider>
                    <MediSearchPage />
                  </SearchContextProvider>
                </LanguageProvider>
              </SpecialtyContextProvider>
            </AuthContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Should restore previous search results
      expect(screen.getByDisplayValue('hypertension guidelines')).toBeInTheDocument();
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle rapid consecutive searches', async () => {
      mockServer.use(
        mockBraveResponse('query 1'),
        mockBraveResponse('query 2'),
        mockBraveResponse('query 3')
      );

      const user = userEvent.setup();
      renderMediSearch();

      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      // Rapid fire searches
      const searches = ['heart failure', 'diabetes', 'hypertension'];
      
      for (const query of searches) {
        await user.clear(searchInput);
        await user.type(searchInput, query);
        await user.click(searchButton);
        
        // Small delay to simulate rapid user interaction
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should handle the last search properly
      await waitFor(() => {
        expect(screen.getByDisplayValue('hypertension')).toBeInTheDocument();
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Should not show loading for cancelled searches
      expect(screen.queryByTestId('search-loading')).not.toBeInTheDocument();
    });

    test('should handle large result sets efficiently', async () => {
      // Mock large result set
      const largeResultSet = Array.from({ length: 100 }, (_, i) => ({
        id: `result-${i}`,
        title: `Medical Research Article ${i}`,
        url: `https://example.com/article-${i}`,
        snippet: `Research snippet for article ${i}. This contains relevant medical information about the query topic.`,
        source: 'Medical Journal',
        provider: 'brave',
        relevanceScore: 0.9 - (i * 0.01),
        confidence: 0.8,
        evidenceLevel: 'journal-article',
        contentType: 'systematic-review'
      }));

      mockServer.use(
        rest.get('/api/brave/web/search', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              web: {
                results: largeResultSet
              }
            })
          );
        })
      );

      const user = userEvent.setup();
      const renderStart = performance.now();
      renderMediSearch();
      const renderEnd = performance.now();

      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'comprehensive medical search');

      const searchStart = performance.now();
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      const searchEnd = performance.now();

      // Performance assertions
      expect(renderEnd - renderStart).toBeLessThan(1000); // Initial render < 1s
      expect(searchEnd - searchStart).toBeLessThan(3000); // Search < 3s

      // Should show pagination or virtualization for large sets
      expect(screen.getByTestId('results-container')).toBeInTheDocument();
      
      // Should limit displayed results for performance
      const visibleResults = screen.getAllByTestId('result-card');
      expect(visibleResults.length).toBeLessThanOrEqual(20);
    });

    test('should optimize memory usage during extended sessions', async () => {
      mockServer.use(mockBraveResponse('memory test'));

      const user = userEvent.setup();
      renderMediSearch();

      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      const searchButton = screen.getByRole('button', { name: /search/i });

      // Simulate extended search session
      for (let i = 0; i < 10; i++) {
        await user.clear(searchInput);
        await user.type(searchInput, `medical query ${i}`);
        await user.click(searchButton);

        await waitFor(() => {
          expect(screen.getByTestId('search-results')).toBeInTheDocument();
        });

        // Clear previous results to test memory cleanup
        const clearButton = screen.getByRole('button', { name: /clear/i });
        await user.click(clearButton);
      }

      // Memory should be managed efficiently
      // Check that search history doesn't grow unbounded
      const historyItems = JSON.parse(localStorage.getItem('medisearch-history') || '[]');
      expect(historyItems.length).toBeLessThanOrEqual(50); // Reasonable history limit
    });
  });

  describe('Accessibility and User Experience', () => {
    test('should be fully keyboard navigable', async () => {
      mockServer.use(mockBraveResponse('keyboard navigation test'));

      renderMediSearch();

      // Tab through interface
      await userEvent.tab(); // Search input
      expect(screen.getByPlaceholderText(/search medical literature/i)).toHaveFocus();

      await userEvent.tab(); // Search button
      expect(screen.getByRole('button', { name: /search/i })).toHaveFocus();

      await userEvent.tab(); // Filters button
      expect(screen.getByRole('button', { name: /filters/i })).toHaveFocus();

      // Type search query and execute with Enter
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      searchInput.focus();
      await userEvent.type(searchInput, 'accessibility test');
      await userEvent.keyboard('{Enter}');

      // Wait for results
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Tab through results
      const results = screen.getAllByTestId('result-card');
      results[0].focus();
      
      // Should be able to activate with keyboard
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
      });
    });

    test('should provide proper ARIA labels and descriptions', async () => {
      renderMediSearch();

      // Check search form accessibility
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      expect(searchInput).toHaveAttribute('aria-label');
      expect(searchInput).toHaveAttribute('aria-describedby');

      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toHaveAttribute('aria-label');

      // Check filter controls
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      expect(filtersButton).toHaveAttribute('aria-expanded');
      expect(filtersButton).toHaveAttribute('aria-controls');
    });

    test('should announce search status to screen readers', async () => {
      mockServer.use(mockBraveResponse('screen reader test'));

      const user = userEvent.setup();
      renderMediSearch();

      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'screen reader test');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Should announce loading state
      expect(screen.getByRole('status')).toHaveTextContent(/searching/i);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Should announce results
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveTextContent(/found \d+ results/i);
    });

    test('should support high contrast and reduced motion preferences', async () => {
      // Mock high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderMediSearch();

      // Should apply high contrast styles
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      expect(searchInput).toHaveClass(/high-contrast/);

      // Should respect reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      // Animations should be disabled or reduced
      const loadingElement = screen.getByTestId('search-interface');
      expect(loadingElement).toHaveClass(/reduced-motion/);
    });
  });
});