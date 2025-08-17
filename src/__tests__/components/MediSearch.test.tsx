/**
 * Unit tests for MediSearch components
 * Tests search functionality, provider integration, and medical news features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MediSearchIntegrated from '../../components/MediSearch/MediSearchIntegrated';
import NewsCard from '../../components/MediSearch/NewsCard';
import { AdvancedNewsFilters } from '../../components/MediSearch/AdvancedNewsFilters';

// Mock the utils
vi.mock('../../utils/caching');
vi.mock('../../utils/errorHandling');
vi.mock('../../utils/performanceMonitoring');

// Mock search providers
vi.mock('../../lib/api', () => ({
  searchBrave: vi.fn(),
  searchExa: vi.fn(),
  searchPerplexity: vi.fn(),
  searchClinicalTrials: vi.fn()
}));

const mockSearchResults = [
  {
    id: '1',
    title: 'New Cardiac Treatment Guidelines',
    summary: 'Latest ACC/AHA guidelines for cardiac treatment',
    url: 'https://example.com/cardiac-guidelines',
    publishedAt: '2024-01-15T10:00:00Z',
    source: 'American College of Cardiology',
    category: 'guidelines',
    specialty: 'cardiology',
    readingTime: 8,
    complexity: 'advanced',
    evidenceLevel: 'Level I'
  },
  {
    id: '2',
    title: 'Pregnancy Risk Assessment Update',
    summary: 'New tools for assessing pregnancy complications',
    url: 'https://example.com/pregnancy-risk',
    publishedAt: '2024-01-14T15:30:00Z',
    source: 'ACOG',
    category: 'research',
    specialty: 'obgyn',
    readingTime: 12,
    complexity: 'intermediate',
    evidenceLevel: 'Level II'
  }
];

const MockWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('MediSearchIntegrated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render search interface correctly', () => {
    render(
      <MockWrapper>
        <MediSearchIntegrated />
      </MockWrapper>
    );

    expect(screen.getByPlaceholderText(/search medical news/i)).toBeInTheDocument();
    expect(screen.getByText(/provider/i)).toBeInTheDocument();
  });

  it('should handle search input and submission', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: mockSearchResults,
        total: 2,
        provider: 'brave'
      })
    });

    render(
      <MockWrapper>
        <MediSearchIntegrated />
      </MockWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search medical news/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'cardiac treatment');
    await user.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/search-orchestrator'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('cardiac treatment')
        })
      );
    });
  });

  it('should display search results correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: mockSearchResults,
        total: 2,
        provider: 'brave'
      })
    });

    render(
      <MockWrapper>
        <MediSearchIntegrated />
      </MockWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search medical news/i);
    await userEvent.type(searchInput, 'cardiac');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('New Cardiac Treatment Guidelines')).toBeInTheDocument();
      expect(screen.getByText('Pregnancy Risk Assessment Update')).toBeInTheDocument();
    });
  });

  it('should handle search errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(
      <MockWrapper>
        <MediSearchIntegrated />
      </MockWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search medical news/i);
    await userEvent.type(searchInput, 'test query');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });
  });

  it('should handle provider switching', async () => {
    const user = userEvent.setup();
    
    render(
      <MockWrapper>
        <MediSearchIntegrated />
      </MockWrapper>
    );

    // Find and click provider selector
    const providerButton = screen.getByText(/provider/i);
    await user.click(providerButton);

    // Should show provider options
    await waitFor(() => {
      expect(screen.getByText(/brave/i)).toBeInTheDocument();
      expect(screen.getByText(/exa/i)).toBeInTheDocument();
      expect(screen.getByText(/perplexity/i)).toBeInTheDocument();
    });
  });
});

describe('NewsCard', () => {
  const mockArticle = mockSearchResults[0];

  it('should render article information correctly', () => {
    render(
      <MockWrapper>
        <NewsCard article={mockArticle} />
      </MockWrapper>
    );

    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.summary)).toBeInTheDocument();
    expect(screen.getByText(mockArticle.source)).toBeInTheDocument();
    expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
  });

  it('should display evidence level and complexity', () => {
    render(
      <MockWrapper>
        <NewsCard article={mockArticle} />
      </MockWrapper>
    );

    expect(screen.getByText('Level I')).toBeInTheDocument();
    expect(screen.getByText(/advanced/i)).toBeInTheDocument();
  });

  it('should show reading time estimation', () => {
    render(
      <MockWrapper>
        <NewsCard article={mockArticle} />
      </MockWrapper>
    );

    expect(screen.getByText(/8 min read/i)).toBeInTheDocument();
  });

  it('should handle like/save actions', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(
      <MockWrapper>
        <NewsCard article={mockArticle} />
      </MockWrapper>
    );

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/liked-results'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  it('should handle read later functionality', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(
      <MockWrapper>
        <NewsCard article={mockArticle} />
      </MockWrapper>
    );

    const readLaterButton = screen.getByRole('button', { name: /read later/i });
    await user.click(readLaterButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/read-later'),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });
});

describe('AdvancedNewsFilters', () => {
  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter categories', () => {
    render(
      <AdvancedNewsFilters
        onFiltersChange={mockOnFiltersChange}
        filters={{}}
      />
    );

    expect(screen.getByText(/medical domain/i)).toBeInTheDocument();
    expect(screen.getByText(/content format/i)).toBeInTheDocument();
    expect(screen.getByText(/publication access/i)).toBeInTheDocument();
    expect(screen.getByText(/authority & quality/i)).toBeInTheDocument();
  });

  it('should handle specialty filtering', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedNewsFilters
        onFiltersChange={mockOnFiltersChange}
        filters={{}}
      />
    );

    // Find and click cardiology filter
    const cardiologyButton = screen.getByRole('button', { name: /cardiology/i });
    await user.click(cardiologyButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        medicalDomain: expect.objectContaining({
          specialty: ['cardiology']
        })
      })
    );
  });

  it('should handle evidence level filtering', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedNewsFilters
        onFiltersChange={mockOnFiltersChange}
        filters={{}}
      />
    );

    // Find and click Level I evidence filter
    const levelIButton = screen.getByRole('button', { name: /level i/i });
    await user.click(levelIButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        authorityQuality: expect.objectContaining({
          evidenceLevel: ['Level I']
        })
      })
    );
  });

  it('should handle content format filtering', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedNewsFilters
        onFiltersChange={mockOnFiltersChange}
        filters={{}}
      />
    );

    // Find and click research papers filter
    const researchButton = screen.getByRole('button', { name: /research papers/i });
    await user.click(researchButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        contentFormat: expect.objectContaining({
          type: ['research']
        })
      })
    );
  });

  it('should clear filters correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <AdvancedNewsFilters
        onFiltersChange={mockOnFiltersChange}
        filters={{
          medicalDomain: { specialty: ['cardiology'] },
          contentFormat: { type: ['research'] }
        }}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({});
  });
});

describe('Medical News Search Integration', () => {
  it('should integrate with performance monitoring', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: mockSearchResults,
        total: 2,
        provider: 'brave'
      })
    });

    render(
      <MockWrapper>
        <MediSearchIntegrated />
      </MockWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search medical news/i);
    await userEvent.type(searchInput, 'cardiology');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    // Should track search performance
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should handle error recovery during search', async () => {
    // First call fails, second succeeds (simulating retry)
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: mockSearchResults,
          total: 2,
          provider: 'brave'
        })
      });

    render(
      <MockWrapper>
        <MediSearchIntegrated />
      </MockWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search medical news/i);
    await userEvent.type(searchInput, 'cardiology');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    // Should eventually show results after retry
    await waitFor(() => {
      expect(screen.getByText('New Cardiac Treatment Guidelines')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should save articles to read later', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(
      <MockWrapper>
        <NewsCard article={mockSearchResults[0]} />
      </MockWrapper>
    );

    const readLaterButton = screen.getByRole('button', { name: /read later/i });
    await userEvent.click(readLaterButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/read-later'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New Cardiac Treatment Guidelines')
        })
      );
    });
  });
});

describe('Medical News Performance Integration', () => {
  it('should track medical content load times', async () => {
    const performanceTrackSpy = vi.fn();
    vi.doMock('../../utils/performanceMonitoring', () => ({
      performanceMonitor: {
        trackMedicalContentPerformance: performanceTrackSpy,
        trackPageLoad: vi.fn(),
        trackApiResponse: vi.fn()
      }
    }));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: mockSearchResults,
        total: 2,
        provider: 'brave'
      })
    });

    render(
      <MockWrapper>
        <MediSearchIntegrated />
      </MockWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search medical news/i);
    await userEvent.type(searchInput, 'medical news');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should handle cached results with performance indicators', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: mockSearchResults,
        total: 2,
        provider: 'brave',
        fromCache: true,
        cacheWarning: 'Data may be outdated'
      })
    });

    render(
      <MockWrapper>
        <MediSearchIntegrated />
      </MockWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search medical news/i);
    await userEvent.type(searchInput, 'cached search');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/may be outdated/i)).toBeInTheDocument();
    });
  });
});