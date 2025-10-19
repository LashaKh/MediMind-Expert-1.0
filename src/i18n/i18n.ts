import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from './config';
import { loadLanguageResources, preloadEssentialNamespaces, LanguageCode } from './languageLoader';

// Helper function to get initial language
const getInitialLanguage = (): LanguageCode => {
  const savedLanguage = localStorage.getItem('selectedLanguage');
  if (savedLanguage && ['en', 'ka', 'ru'].includes(savedLanguage)) {
    return savedLanguage as LanguageCode;
  }
  return DEFAULT_LANGUAGE as LanguageCode;
};

// Language loading function for i18next
const loadLanguage = async (language: LanguageCode) => {
  try {
    const translations = await loadLanguageResources(language);

    // Debug: Log what we're loading
    if (import.meta.env.DEV) {
      console.log(`🌍 Loading ${language} translations:`, {
        hasProfile: !!translations.profile,
        profileKeys: translations.profile ? Object.keys(translations.profile).slice(0, 10) : []
      });
    }

    // Add the translations to i18next
    i18n.addResourceBundle(language, 'translation', translations, true, true);

    return translations;
  } catch (error) {
    console.error(`❌ Failed to load ${language}:`, error);
    throw error;
  }
};

// Initialize i18n with lazy loading support
const initI18n = async () => {
  const initialLanguage = getInitialLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {}, // Start with empty resources - will be loaded dynamically
      lng: initialLanguage,
      fallbackLng: DEFAULT_LANGUAGE,
      debug: import.meta.env.DEV,
      
      interpolation: {
        escapeValue: false, // React already does escaping
      },
      
      // Namespace configuration
      defaultNS: 'translation',
      ns: ['translation', 'help', 'mediscribe'],
      
      // Key separator (use dot notation for nested keys)
      keySeparator: '.',
      
      // React-specific options
      react: {
        useSuspense: false, // Disable suspense to handle loading manually
      },

      // Handle missing translations gracefully
      saveMissing: false,
      missingKeyHandler: (lng, ns, key) => {
        if (import.meta.env.DEV) {

        }
      }
    });

  // Load initial language
  try {
    await loadLanguage(initialLanguage);
  } catch (error) {

    if (initialLanguage !== DEFAULT_LANGUAGE) {
      await loadLanguage(DEFAULT_LANGUAGE as LanguageCode);
      await i18n.changeLanguage(DEFAULT_LANGUAGE);
    }
  }

  // Background preload essential namespaces for other languages
  setTimeout(() => {
    const allLanguages: LanguageCode[] = ['en', 'ka', 'ru'];
    allLanguages.forEach(lang => {
      if (lang !== initialLanguage) {
        preloadEssentialNamespaces(lang);
      }
    });
  }, 2000); // Delay to avoid blocking initial load

  return i18n;
};

/**
 * Changes language with lazy loading support
 */
export const changeLanguage = async (language: LanguageCode) => {
  try {
    // Load the language if not already loaded
    await loadLanguage(language);
    
    // Change the language in i18next
    await i18n.changeLanguage(language);
    
    // Save to localStorage
    localStorage.setItem('selectedLanguage', language);
    
    return true;
  } catch (error) {

    return false;
  }
};

/**
 * Gets the current language
 */
export const getCurrentLanguage = (): LanguageCode => {
  return i18n.language as LanguageCode || DEFAULT_LANGUAGE as LanguageCode;
};

// Initialize and export with singleton pattern
let i18nInitialized = false;
let initializationPromise: Promise<typeof i18n> | null = null;

export const getI18n = async () => {
  if (i18nInitialized) {
    return i18n;
  }
  
  // Prevent multiple simultaneous initializations
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = initI18n().then(() => {
    i18nInitialized = true;
    initializationPromise = null;
    return i18n;
  });
  
  return initializationPromise;
};

// Export the instance for immediate use (will be populated after init)
export default i18n; 