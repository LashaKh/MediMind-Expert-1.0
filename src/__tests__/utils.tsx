import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { SpecialtyProvider } from '../contexts/SpecialtyContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ChatProvider } from '../contexts/ChatContext'
import { vi } from 'vitest'

// Mock auth user for testing
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    specialty: 'cardiology'
  }
}

// Mock auth context values
const mockAuthContext = {
  user: mockUser,
  profile: {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    specialty: 'cardiology',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  loading: false,
  signIn: vi.fn().mockResolvedValue({}),
  signUp: vi.fn().mockResolvedValue({}),
  signOut: vi.fn().mockResolvedValue({}),
  updateProfile: vi.fn().mockResolvedValue({}),
  refreshProfile: vi.fn().mockResolvedValue({})
}

// Mock specialty context values
const mockSpecialtyContext = {
  specialty: 'cardiology' as const,
  setSpecialty: vi.fn(),
  isSpecialtyLocked: true,
  canChangeSpecialty: false
}

// Mock language context values
const mockLanguageContext = {
  language: 'en' as const,
  setLanguage: vi.fn(),
  isLoading: false
}

// Mock chat context values
const mockChatContext = {
  messages: [],
  addMessage: vi.fn(),
  clearMessages: vi.fn(),
  isLoading: false,
  setIsLoading: vi.fn(),
  selectedDocuments: [],
  setSelectedDocuments: vi.fn(),
  currentCase: null,
  setCurrentCase: vi.fn(),
  cases: [],
  createCase: vi.fn(),
  updateCase: vi.fn(),
  deleteCase: vi.fn(),
  loadCases: vi.fn()
}

// All providers wrapper
const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider value={mockAuthContext}>
        <SpecialtyProvider value={mockSpecialtyContext}>
          <LanguageProvider value={mockLanguageContext}>
            <ChatProvider value={mockChatContext}>
              {children}
            </ChatProvider>
          </LanguageProvider>
        </SpecialtyProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

// Custom render function with all providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: AllProvidersWrapper,
    ...options,
  })
}

// Custom render for components that only need routing
export const renderWithRouter = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: BrowserRouter,
    ...options,
  })
}

// Mock medical search API responses
export const mockSearchResponse = {
  brave: {
    web: {
      results: [
        {
          title: 'Cardiovascular Disease Prevention Guidelines',
          url: 'https://example.com/cvd-prevention',
          description: 'Latest guidelines for cardiovascular disease prevention from ACC/AHA',
          date_published: '2024-01-15',
          extra_snippets: ['Key recommendations for primary prevention']
        }
      ]
    }
  },
  exa: {
    results: [
      {
        title: 'Meta-analysis of Statin Therapy in Primary Prevention',
        url: 'https://pubmed.ncbi.nlm.nih.gov/example',
        text: 'Comprehensive meta-analysis showing benefits of statin therapy',
        publishedDate: '2024-02-01',
        author: 'Smith et al.'
      }
    ]
  },
  perplexity: {
    choices: [
      {
        message: {
          content: 'PICO Analysis: Population - Adults with cardiovascular risk factors...',
          citations: ['https://example.com/citation1', 'https://example.com/citation2']
        }
      }
    ]
  }
}

// Mock medical classification results
export const mockClassificationResult = {
  evidenceLevel: 'High' as const,
  contentType: 'Guidelines' as const,
  specialtyRelevance: 0.95,
  readingTime: 8,
  citationCount: 25,
  impactFactor: 15.2
}

// Mock user preferences
export const mockUserPreferences = {
  preferredSpecialties: ['cardiology'],
  defaultEvidenceLevels: ['High', 'Moderate'],
  defaultRecencyFilter: '5years',
  savedFilters: [
    {
      id: 'filter-1',
      name: 'Cardiology High Evidence',
      filters: {
        evidenceLevels: ['High'],
        specialties: ['cardiology'],
        contentTypes: ['Guidelines', 'Meta-Analysis']
      }
    }
  ]
}

// Mock search history
export const mockSearchHistory = [
  {
    id: 'search-1',
    query: 'hypertension guidelines',
    timestamp: new Date().toISOString(),
    resultCount: 15,
    clickedResults: ['result-1', 'result-2']
  },
  {
    id: 'search-2',
    query: 'atrial fibrillation management',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    resultCount: 23,
    clickedResults: ['result-3']
  }
]

// Helper to create mock intersection observer entries
export const createMockIntersectionObserverEntry = (
  isIntersecting: boolean,
  target: Element
) => ({
  isIntersecting,
  target,
  boundingClientRect: {} as DOMRectReadOnly,
  intersectionRatio: isIntersecting ? 1 : 0,
  intersectionRect: {} as DOMRectReadOnly,
  rootBounds: {} as DOMRectReadOnly,
  time: Date.now()
})

// Helper to simulate user interactions
export const simulateUserInteraction = {
  typeInSearchBar: async (searchInput: HTMLElement, query: string) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(searchInput, { target: { value: query } })
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })
  },
  
  clickFilter: async (filterElement: HTMLElement) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.click(filterElement)
  },
  
  selectTab: async (tabElement: HTMLElement) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.click(tabElement)
  }
}

// Medical accuracy validation helpers
export const medicalValidationHelpers = {
  validateEvidenceLevel: (level: string) => {
    const validLevels = ['High', 'Moderate', 'Low', 'Expert Opinion']
    return validLevels.includes(level)
  },
  
  validateContentType: (type: string) => {
    const validTypes = ['Guidelines', 'Meta-Analysis', 'RCT', 'Cohort Study', 'Case Series', 'Review']
    return validTypes.includes(type)
  },
  
  validateSpecialty: (specialty: string) => {
    const validSpecialties = ['cardiology', 'obgyn', 'internal-medicine', 'emergency-medicine']
    return validSpecialties.includes(specialty)
  },
  
  validateCitation: (citation: string) => {
    // Basic citation format validation
    const citationPattern = /^.+\.\s+.+\.\s+\d{4}(;|\.).*$/
    return citationPattern.test(citation)
  }
}

// Performance testing helpers
export const performanceHelpers = {
  measureSearchResponseTime: async (searchFunction: () => Promise<any>) => {
    const startTime = performance.now()
    await searchFunction()
    const endTime = performance.now()
    return endTime - startTime
  },
  
  simulateNetworkDelay: (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  
  mockSlowApiResponse: (delay: number = 3000) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockSearchResponse)
      }, delay)
    })
  }
}

export * from '@testing-library/react'