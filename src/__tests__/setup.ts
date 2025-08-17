import { beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock Speech Recognition APIs
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: window.SpeechRecognition,
})

// Mock Speech Synthesis API
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
})

// Mock fetch for API calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({
    results: [],
    total: 0,
    provider: 'mock'
  }),
  text: () => Promise.resolve(''),
  headers: new Headers(),
  redirected: false,
  statusText: 'OK',
  type: 'basic',
  url: ''
})

// Mock environment variables and API keys
process.env.VITE_BRAVE_API_KEY = 'mock-brave-key';
process.env.VITE_EXA_API_KEY = 'mock-exa-key';
process.env.VITE_PERPLEXITY_API_KEY = 'mock-perplexity-key';
process.env.VITE_SUPABASE_URL = 'https://mock.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'mock-supabase-key';

// Mock Supabase with authenticated session for tests
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ 
        data: { 
          session: { 
            access_token: 'mock-jwt-token',
            user: { id: 'test-user-id', email: 'test@example.com' }
          } 
        },
        error: null
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        download: vi.fn(),
        getPublicUrl: vi.fn(),
      })
    }
  }
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}))

// Mock React Router
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
}))

// Suppress console warnings in tests
const originalError = console.error
beforeEach(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterEach(() => {
  console.error = originalError
})

// Mock search orchestrator with proper authentication simulation
vi.mock('../../utils/search/apiOrchestration', () => ({
  SearchOrchestrator: vi.fn().mockImplementation(() => ({
    parallelSearch: vi.fn().mockResolvedValue({
      results: [],
      totalCount: 0,
      searchTime: 100,
      providers: ['mock'],
      query: 'test',
      successfulProviders: 1,
      failedProviders: []
    }),
    search: vi.fn().mockResolvedValue({
      results: [],
      totalCount: 0,
      provider: 'mock',
      searchTime: 100
    }),
    callBraveAPI: vi.fn().mockResolvedValue([]),
    callExaAPI: vi.fn().mockResolvedValue([]),
    callPerplexityAPI: vi.fn().mockResolvedValue([])
  })),
  searchOrchestrator: {
    parallelSearch: vi.fn().mockResolvedValue({
      results: [],
      totalCount: 0,
      searchTime: 100,
      providers: ['mock'],
      query: 'test',
      successfulProviders: 1,
      failedProviders: []
    })
  }
}))