/**
 * Cross-Feature Integration Tests
 * Tests integration between MediSearch and other platform features:
 * AI Copilot, Medical Calculators, and Knowledge Base
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Component imports
import { MediSearchPage } from '@/components/MediSearch/MediSearchPage';
import { AICopilot } from '@/components/AICopilot/AICopilot';
import { CalculatorsPage } from '@/components/Calculators/CalculatorsPage';

// Context providers
import { AuthContextProvider } from '@/contexts/AuthContext';
import { SpecialtyContextProvider } from '@/contexts/SpecialtyContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SearchContextProvider } from '@/components/MediSearch/contexts/SearchContextProvider';
import { ChatContextProvider } from '@/contexts/ChatContext';

// Test utilities
import { createTestUser, createMockSearchResults, createMockChatResponse } from '../utils/testUtils';
import { setupMockServer } from '../utils/mockServer';

// Feature integration interfaces
interface FeatureIntegrationContext {
  searchResults: any[];
  chatHistory: any[];
  calculatorInputs: Record<string, any>;
  knowledgeBaseDocuments: any[];
  currentSpecialty: string;
  userId: string;
}

interface CrossFeatureAction {
  type: 'search-to-chat' | 'search-to-calculator' | 'chat-to-search' | 'calculator-to-search' | 'knowledge-to-search';
  source: string;
  target: string;
  data: any;
}

describe('Cross-Feature Integration Tests', () => {
  let mockServer: any;
  let queryClient: QueryClient;
  let integrationContext: FeatureIntegrationContext;

  beforeAll(async () => {
    mockServer = setupMockServer();
    
    // Mock WebSocket for real-time chat
    global.WebSocket = vi.fn().mockImplementation(() => ({
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      readyState: 1
    }));
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    integrationContext = {
      searchResults: [],
      chatHistory: [],
      calculatorInputs: {},
      knowledgeBaseDocuments: [],
      currentSpecialty: 'cardiology',
      userId: 'test-user-123'
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  afterAll(() => {
    mockServer?.close();
  });

  const renderIntegratedWorkspace = (specialty = 'cardiology', user = createTestUser()) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthContextProvider initialUser={user}>
            <SpecialtyContextProvider initialSpecialty={specialty}>
              <LanguageProvider>
                <ChatContextProvider>
                  <SearchContextProvider>
                    <div data-testid="integrated-workspace">
                      <MediSearchPage />
                      <AICopilot />
                    </div>
                  </SearchContextProvider>
                </ChatContextProvider>
              </LanguageProvider>
            </SpecialtyContextProvider>
          </AuthContextProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('MediSearch to AI Copilot Integration', () => {
    test('should transfer search results to AI chat context', async () => {
      // Mock search API
      mockServer.use(
        rest.get('/api/brave/web/search', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              web: {
                results: createMockSearchResults('atrial fibrillation management', 5)
              }
            })
          );
        })
      );

      // Mock chat API
      mockServer.use(
        rest.post('/.netlify/functions/flowise-fixed', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json(createMockChatResponse('Based on the search results about atrial fibrillation management...'))
          );
        })
      );

      const user = userEvent.setup();
      renderIntegratedWorkspace('cardiology');

      // Perform search first
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'atrial fibrillation management guidelines');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      const searchResults = screen.getAllByTestId('result-card');
      expect(searchResults).toHaveLength.greaterThan(0);

      // Select first result
      await user.click(searchResults[0]);

      // Should open detail panel
      await waitFor(() => {
        expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
      });

      // Click "Ask AI about this" button
      const askAIButton = screen.getByRole('button', { name: /ask ai about this/i });
      await user.click(askAIButton);

      // Should transfer to AI chat with context
      await waitFor(() => {
        expect(screen.getByTestId('ai-chat-interface')).toBeInTheDocument();
      });

      // Verify chat has context from search result
      const chatInput = screen.getByPlaceholderText(/ask about this medical information/i);
      expect(chatInput).toHaveAttribute('data-context', 'search-result');

      // Send a follow-up question
      await user.type(chatInput, 'What are the latest recommendations for anticoagulation?');
      
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      // Wait for AI response
      await waitFor(() => {
        expect(screen.getByTestId('chat-message')).toBeInTheDocument();
      });

      // Verify response references search context
      const chatResponse = screen.getByTestId('chat-message');
      expect(within(chatResponse).getByText(/based on the search results/i)).toBeInTheDocument();
    });

    test('should maintain search context across chat sessions', async () => {
      mockServer.use(
        rest.get('/api/exa/search', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              results: createMockSearchResults('preeclampsia diagnosis', 3)
            })
          );
        })
      );

      const user = userEvent.setup();
      renderIntegratedWorkspace('obgyn');

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'preeclampsia diagnosis criteria');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Start AI chat with search context
      const chatToggle = screen.getByRole('button', { name: /ai copilot/i });
      await user.click(chatToggle);

      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 'Based on my search, what are the diagnostic criteria?');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      // Verify context persists in localStorage
      const chatContext = JSON.parse(localStorage.getItem('chat-context') || '{}');
      expect(chatContext.searchQuery).toBe('preeclampsia diagnosis criteria');
      expect(chatContext.searchResults).toHaveLength(3);
    });

    test('should handle search-to-chat handoff with complex medical queries', async () => {
      // Mock complex cardiology search
      mockServer.use(
        rest.post('/api/perplexity/chat/completions', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              choices: [{
                message: {
                  content: 'Recent studies on HCM risk stratification include: [1] 2023 AHA guidelines...'
                }
              }]
            })
          );
        })
      );

      const user = userEvent.setup();
      renderIntegratedWorkspace('cardiology');

      // Search for complex cardiology topic
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'hypertrophic cardiomyopathy risk stratification sudden cardiac death');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Select result and transfer to chat
      const firstResult = screen.getAllByTestId('result-card')[0];
      await user.click(firstResult);

      const discussWithAIButton = screen.getByRole('button', { name: /discuss with ai/i });
      await user.click(discussWithAIButton);

      // Should open chat with rich medical context
      await waitFor(() => {
        expect(screen.getByTestId('ai-chat-interface')).toBeInTheDocument();
      });

      // Verify medical terminology and context preservation
      const contextIndicator = screen.getByTestId('chat-context-indicator');
      expect(within(contextIndicator).getByText(/cardiology/i)).toBeInTheDocument();
      expect(within(contextIndicator).getByText(/hypertrophic cardiomyopathy/i)).toBeInTheDocument();
    });
  });

  describe('MediSearch to Calculator Integration', () => {
    test('should suggest relevant calculators based on search results', async () => {
      // Mock search for ASCVD-related content
      mockServer.use(
        rest.get('/api/brave/web/search', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              web: {
                results: [
                  {
                    title: 'ASCVD Risk Assessment Guidelines',
                    url: 'https://heart.org/ascvd-guidelines',
                    description: 'Guidelines for atherosclerotic cardiovascular disease risk calculation...'
                  }
                ]
              }
            })
          );
        })
      );

      const user = userEvent.setup();
      renderIntegratedWorkspace('cardiology');

      // Search for ASCVD content
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'ASCVD risk assessment cardiovascular');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Should show calculator suggestions
      await waitFor(() => {
        expect(screen.getByTestId('calculator-suggestions')).toBeInTheDocument();
      });

      const calculatorSuggestions = within(screen.getByTestId('calculator-suggestions'));
      expect(calculatorSuggestions.getByText(/ascvd risk calculator/i)).toBeInTheDocument();

      // Click on suggested calculator
      const ascvdCalculatorLink = calculatorSuggestions.getByRole('button', { name: /ascvd risk calculator/i });
      await user.click(ascvdCalculatorLink);

      // Should navigate to calculator with context
      await waitFor(() => {
        expect(screen.getByTestId('ascvd-calculator')).toBeInTheDocument();
      });

      // Verify calculator has search context
      const calculatorContext = screen.getByTestId('calculator-context');
      expect(within(calculatorContext).getByText(/based on your search/i)).toBeInTheDocument();
    });

    test('should pre-populate calculator with search-derived parameters', async () => {
      // Mock search for specific patient scenario
      mockServer.use(
        rest.get('/api/exa/search', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              results: [
                {
                  title: 'Bishop Score Assessment in Labor Management',
                  text: 'Patient case: 38-year-old G2P1, 39 weeks gestation, cervical dilation 2cm, effacement 60%...'
                }
              ]
            })
          );
        })
      );

      const user = userEvent.setup();
      renderIntegratedWorkspace('obgyn');

      // Search for Bishop Score case
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'Bishop Score cervical assessment labor');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Select result with patient parameters
      const resultCard = screen.getAllByTestId('result-card')[0];
      await user.click(resultCard);

      // Should suggest Bishop Score calculator
      const calculateButton = screen.getByRole('button', { name: /calculate bishop score/i });
      await user.click(calculateButton);

      // Should open calculator with extracted parameters
      await waitFor(() => {
        expect(screen.getByTestId('bishop-score-calculator')).toBeInTheDocument();
      });

      // Verify parameters are pre-populated from search context
      const dilationInput = screen.getByLabelText(/cervical dilation/i);
      expect(dilationInput).toHaveValue('2');

      const effacementInput = screen.getByLabelText(/effacement/i);
      expect(effacementInput).toHaveValue('60');
    });

    test('should maintain calculator results for AI discussion', async () => {
      const user = userEvent.setup();
      renderIntegratedWorkspace('cardiology');

      // Navigate to GRACE calculator
      const calculatorButton = screen.getByRole('button', { name: /calculators/i });
      await user.click(calculatorButton);

      // Fill out GRACE calculator
      const ageInput = screen.getByLabelText(/age/i);
      await user.type(ageInput, '65');

      const systolicBPInput = screen.getByLabelText(/systolic blood pressure/i);
      await user.type(systolicBPInput, '140');

      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);

      // Get calculation results
      await waitFor(() => {
        expect(screen.getByTestId('grace-results')).toBeInTheDocument();
      });

      // Click "Discuss with AI"
      const discussButton = screen.getByRole('button', { name: /discuss with ai/i });
      await user.click(discussButton);

      // Should transfer calculator context to AI
      await waitFor(() => {
        expect(screen.getByTestId('ai-chat-interface')).toBeInTheDocument();
      });

      const chatContext = screen.getByTestId('chat-context-indicator');
      expect(within(chatContext).getByText(/grace score/i)).toBeInTheDocument();
    });
  });

  describe('Knowledge Base Integration', () => {
    test('should incorporate knowledge base documents in search results', async () => {
      // Mock user's uploaded documents
      const mockDocuments = [
        {
          id: 'doc-1',
          title: 'Personal Guidelines: Heart Failure Management',
          content: 'Clinical guidelines for heart failure management in my practice...',
          category: 'guidelines',
          specialty: 'cardiology'
        }
      ];

      // Mock Supabase query for user documents
      mockServer.use(
        rest.get('/api/supabase/documents', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockDocuments));
        })
      );

      const user = userEvent.setup();
      renderIntegratedWorkspace('cardiology');

      // Search with "Include my documents" enabled
      const includeDocsToggle = screen.getByLabelText(/include my documents/i);
      await user.click(includeDocsToggle);

      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'heart failure treatment guidelines');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Should show knowledge base results separately
      expect(screen.getByTestId('knowledge-base-results')).toBeInTheDocument();

      const kbResults = within(screen.getByTestId('knowledge-base-results'));
      expect(kbResults.getByText(/personal guidelines: heart failure/i)).toBeInTheDocument();
    });

    test('should allow search within user knowledge base only', async () => {
      const user = userEvent.setup();
      renderIntegratedWorkspace('obgyn');

      // Switch to "My Documents Only" mode
      const searchModeSelect = screen.getByLabelText(/search mode/i);
      await user.click(searchModeSelect);

      const myDocsOption = screen.getByRole('option', { name: /my documents only/i });
      await user.click(myDocsOption);

      const searchInput = screen.getByPlaceholderText(/search my documents/i);
      await user.type(searchInput, 'preeclampsia protocols');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Should only search in knowledge base
      await waitFor(() => {
        expect(screen.getByTestId('kb-search-results')).toBeInTheDocument();
      });

      // Should not show external search results
      expect(screen.queryByTestId('external-search-results')).not.toBeInTheDocument();
    });

    test('should sync search insights to knowledge base', async () => {
      mockServer.use(
        rest.get('/api/brave/web/search', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              web: {
                results: [
                  {
                    title: 'New Hypertension Guidelines 2023',
                    url: 'https://acc.org/guidelines/hypertension-2023',
                    description: 'Updated clinical practice guidelines for hypertension management...'
                  }
                ]
              }
            })
          );
        })
      );

      const user = userEvent.setup();
      renderIntegratedWorkspace('cardiology');

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'hypertension guidelines 2023');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Select important result
      const firstResult = screen.getAllByTestId('result-card')[0];
      await user.click(firstResult);

      // Save to knowledge base
      const saveToKBButton = screen.getByRole('button', { name: /save to knowledge base/i });
      await user.click(saveToKBButton);

      // Fill out knowledge base entry
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Hypertension Guidelines 2023 - Key Updates');

      const categorySelect = screen.getByLabelText(/category/i);
      await user.click(categorySelect);
      
      const guidelinesOption = screen.getByRole('option', { name: /guidelines/i });
      await user.click(guidelinesOption);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should confirm saved to knowledge base
      await waitFor(() => {
        expect(screen.getByTestId('kb-save-success')).toBeInTheDocument();
      });

      // Should appear in future knowledge base searches
      expect(localStorage.getItem('knowledge-base-cache')).toContain('Hypertension Guidelines 2023');
    });
  });

  describe('Workflow Continuity', () => {
    test('should maintain context across feature transitions', async () => {
      const user = userEvent.setup();
      renderIntegratedWorkspace('cardiology');

      // Start with search
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'acute coronary syndrome management');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Move to AI chat
      const chatButton = screen.getByRole('button', { name: /ai copilot/i });
      await user.click(chatButton);

      // Ask follow-up question
      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 'What are the risk factors for this condition?');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      // Move to calculator
      const calculatorButton = screen.getByRole('button', { name: /calculators/i });
      await user.click(calculatorButton);

      // Should show relevant calculators
      expect(screen.getByText(/grace score/i)).toBeInTheDocument();
      expect(screen.getByText(/timi risk/i)).toBeInTheDocument();

      // Context should be preserved across transitions
      const contextBreadcrumb = screen.getByTestId('context-breadcrumb');
      expect(within(contextBreadcrumb).getByText(/acute coronary syndrome/i)).toBeInTheDocument();
    });

    test('should handle complex multi-feature workflows', async () => {
      const user = userEvent.setup();
      renderIntegratedWorkspace('obgyn');

      // Complex workflow: Search → Calculator → AI → Knowledge Base
      
      // 1. Search for Bishop Score information
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'Bishop Score induction of labor');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // 2. Use Bishop Score calculator
      const calculatorSuggestion = screen.getByRole('button', { name: /bishop score calculator/i });
      await user.click(calculatorSuggestion);

      // Fill calculator
      const dilationInput = screen.getByLabelText(/dilation/i);
      await user.type(dilationInput, '3');

      const calculateButton = screen.getByRole('button', { name: /calculate/i });
      await user.click(calculateButton);

      // 3. Discuss results with AI
      const discussButton = screen.getByRole('button', { name: /discuss with ai/i });
      await user.click(discussButton);

      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 'Should I proceed with induction given this score?');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      // 4. Save insights to knowledge base
      const saveInsightButton = screen.getByRole('button', { name: /save insight/i });
      await user.click(saveInsightButton);

      // Should maintain full workflow context
      const workflowSummary = screen.getByTestId('workflow-summary');
      expect(within(workflowSummary).getByText(/search: bishop score/i)).toBeInTheDocument();
      expect(within(workflowSummary).getByText(/calculated: score 6/i)).toBeInTheDocument();
      expect(within(workflowSummary).getByText(/ai consultation/i)).toBeInTheDocument();
    });

    test('should restore interrupted workflows on session resume', async () => {
      const user = userEvent.setup();
      
      // Simulate interrupted workflow state in localStorage
      const workflowState = {
        type: 'search-to-calculator',
        searchQuery: 'ASCVD risk factors',
        searchResults: createMockSearchResults('ASCVD risk factors', 3),
        calculatorType: 'ascvd',
        timestamp: Date.now() - 5000, // 5 seconds ago
        specialty: 'cardiology'
      };
      
      localStorage.setItem('workflow-state', JSON.stringify(workflowState));

      renderIntegratedWorkspace('cardiology');

      // Should show workflow restoration prompt
      await waitFor(() => {
        expect(screen.getByTestId('workflow-restore-prompt')).toBeInTheDocument();
      });

      const restoreButton = screen.getByRole('button', { name: /continue where you left off/i });
      await user.click(restoreButton);

      // Should restore to calculator with search context
      await waitFor(() => {
        expect(screen.getByTestId('ascvd-calculator')).toBeInTheDocument();
      });

      const contextIndicator = screen.getByTestId('calculator-context');
      expect(within(contextIndicator).getByText(/ascvd risk factors/i)).toBeInTheDocument();
    });
  });

  describe('Data Synchronization', () => {
    test('should sync bookmarks across all features', async () => {
      const user = userEvent.setup();
      renderIntegratedWorkspace('cardiology');

      // Bookmark from search
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'cardiac imaging guidelines');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      const firstResult = screen.getAllByTestId('result-card')[0];
      await user.click(firstResult);

      const bookmarkButton = screen.getByRole('button', { name: /bookmark/i });
      await user.click(bookmarkButton);

      // Navigate to AI chat
      const chatButton = screen.getByRole('button', { name: /ai copilot/i });
      await user.click(chatButton);

      // Should be able to reference bookmarked content
      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, '/bookmarks cardiac imaging');

      // Should show bookmarked content in suggestions
      await waitFor(() => {
        expect(screen.getByTestId('bookmark-suggestions')).toBeInTheDocument();
      });

      const bookmarkSuggestion = screen.getByTestId('bookmark-suggestions');
      expect(within(bookmarkSuggestion).getByText(/cardiac imaging guidelines/i)).toBeInTheDocument();
    });

    test('should sync preferences across features', async () => {
      const user = userEvent.setup();
      renderIntegratedWorkspace('cardiology');

      // Set search preferences
      const filtersButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filtersButton);

      const evidenceFilter = screen.getByLabelText(/systematic reviews/i);
      await user.click(evidenceFilter);

      const applyButton = screen.getByRole('button', { name: /apply filters/i });
      await user.click(applyButton);

      // Navigate to AI chat
      const chatButton = screen.getByRole('button', { name: /ai copilot/i });
      await user.click(chatButton);

      // AI should respect search preferences
      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 'Find me research about heart failure');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      // AI should prioritize systematic reviews based on search preferences
      await waitFor(() => {
        expect(screen.getByTestId('chat-message')).toBeInTheDocument();
      });

      const chatResponse = screen.getByTestId('chat-message');
      expect(within(chatResponse).getByText(/systematic review/i)).toBeInTheDocument();
    });

    test('should maintain session state across browser refresh', async () => {
      const user = userEvent.setup();
      const { rerender } = renderIntegratedWorkspace('cardiology');

      // Establish multi-feature session
      const searchInput = screen.getByPlaceholderText(/search medical literature/i);
      await user.type(searchInput, 'diabetes management');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Start AI conversation
      const chatButton = screen.getByRole('button', { name: /ai copilot/i });
      await user.click(chatButton);

      const chatInput = screen.getByPlaceholderText(/message/i);
      await user.type(chatInput, 'What are the key management principles?');

      // Simulate browser refresh
      rerender(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthContextProvider initialUser={createTestUser()}>
              <SpecialtyContextProvider initialSpecialty="cardiology">
                <LanguageProvider>
                  <ChatContextProvider>
                    <SearchContextProvider>
                      <div data-testid="integrated-workspace">
                        <MediSearchPage />
                        <AICopilot />
                      </div>
                    </SearchContextProvider>
                  </ChatContextProvider>
                </LanguageProvider>
              </SpecialtyContextProvider>
            </AuthContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Should restore previous session state
      expect(screen.getByDisplayValue('diabetes management')).toBeInTheDocument();
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
      
      // Chat context should be restored
      const chatHistory = JSON.parse(sessionStorage.getItem('chat-history') || '[]');
      expect(chatHistory.some((msg: any) => msg.text.includes('management principles'))).toBe(true);
    });
  });
});