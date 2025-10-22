import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/adaptive-animations.css';
import './lib/supabase';
import { I18nInitializer } from './components/I18nInitializer';
import { supabase } from './lib/supabase';
import { useAppStore } from './stores/useAppStore';
import { getI18n } from './i18n/i18n';
import { PerformanceModeProvider } from './contexts/PerformanceModeContext';
import { performanceMonitor } from './services/performanceMonitoring';

// Import debug utilities in development
if (import.meta.env.DEV) {
  import('./utils/debugABG');
}

// Initialize performance monitoring
// The performanceMonitor singleton automatically starts tracking Web Vitals (LCP, FID, CLS, TTFB)
// and resource metrics (memory) upon import. No explicit initialization required.

// Stagewise toolbar removed

// Force light theme and clear any dark mode setting
localStorage.setItem('theme', 'light');

// Get the saved language (defaults to 'en' if not set)
const language = localStorage.getItem('selectedLanguage') || 'en';

// Ensure dark class is removed and light theme is applied
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');

// NUCLEAR FONT LOADING GUARANTEE - Wait for fonts before continuing
document.fonts.ready.then(() => {
  document.documentElement.setAttribute('data-font-loaded', 'true');

}).catch(() => {
  // Force set attribute even if fonts fail to load
  document.documentElement.setAttribute('data-font-loaded', 'true');

});

document.documentElement.lang = language;

// Initialize Supabase auth session
supabase.auth.getSession().then(({ data: { session } }) => {
  useAppStore.getState().setSession(session);
  useAppStore.getState().setUser(session?.user ?? null);
  useAppStore.getState().setLoading(false);
});

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  useAppStore.getState().setSession(session);
  useAppStore.getState().setUser(session?.user ?? null);
  useAppStore.getState().setLoading(false);
});

// Initialize language - sync store with i18next after i18n is loaded  
getI18n().then(async (i18n: any) => {
  const currentLang = i18n.language || 'en';
  const store = useAppStore.getState();
  // Only update store state, don't call changeLanguage to avoid loops
  store.setLanguageLoading(false);
  if (currentLang !== store.currentLanguage) {
    // Force sync by directly setting store state to match i18next
    useAppStore.setState({ currentLanguage: currentLang as any });
  }
}).catch((error) => {
  // Language initialization error - use default language
});

// Stagewise initialization removed

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PerformanceModeProvider>
      <I18nInitializer>
        <App />
      </I18nInitializer>
    </PerformanceModeProvider>
  </StrictMode>
);