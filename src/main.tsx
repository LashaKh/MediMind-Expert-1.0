import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lib/supabase';
import { I18nInitializer } from './components/I18nInitializer';
import { supabase } from './lib/supabase';
import { useAppStore } from './stores/useAppStore';
import { getI18n } from './i18n/i18n';

// Import debug utilities in development
if (import.meta.env.DEV) {
  import('./utils/debugABG');
}

// Stagewise toolbar removed

// Force light theme and clear any dark mode setting
localStorage.setItem('theme', 'light');

// Force reset language to English to fix Georgian language issue
localStorage.removeItem('selectedLanguage'); // Clear old language setting
localStorage.removeItem('language'); // Clear the other key too
localStorage.removeItem('i18nextLng'); // Clear i18next's own language cache
localStorage.setItem('selectedLanguage', 'en'); // Use the correct key that i18next expects
localStorage.setItem('language', 'en'); // Keep both for compatibility
const language = localStorage.getItem('language') || 'en';

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
    <I18nInitializer>
      <App />
    </I18nInitializer>
  </StrictMode>
);