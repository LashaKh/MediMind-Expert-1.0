export type LanguageCode = 'en' | 'ka' | 'ru';

// Enhanced language loading cache with loaded status tracking
const languageCache = new Map<LanguageCode, Promise<any>>();
const loadedLanguages = new Set<LanguageCode>();

/**
 * Dynamically loads translation resources for a specific language
 * Uses dynamic imports to enable code splitting and lazy loading
 */
export const loadLanguageResources = async (language: LanguageCode) => {
  // Return immediately if already fully loaded
  if (loadedLanguages.has(language)) {
    return languageCache.get(language);
  }

  // Check if currently loading
  if (languageCache.has(language)) {
    return languageCache.get(language);
  }

  // Create loading promise with optimized logging
  const loadingPromise = async () => {
    try {
      // Only log in development to reduce console noise
      if (import.meta.env.DEV) {

      }
      
      // Use Promise.resolve to prevent blocking the main thread
      const translationModule = await Promise.resolve().then(() => 
        import(`./translations/${language}/index.ts`)
      );
      const translations = translationModule.default;
      
      // Mark as fully loaded
      loadedLanguages.add(language);
      
      if (import.meta.env.DEV) {

      }
      
      return translations;
    } catch (error) {

      // Remove from cache on failure so we can retry
      languageCache.delete(language);
      loadedLanguages.delete(language);
      throw error;
    }
  };

  // Cache the promise
  const promise = loadingPromise();
  languageCache.set(language, promise);
  
  return promise;
};

/**
 * Preloads translation resources for better UX
 * Can be called to warm up the cache for non-active languages
 */
export const preloadLanguage = (language: LanguageCode) => {
  if (!languageCache.has(language)) {
    // Preload in background without waiting
    loadLanguageResources(language).catch(console.warn);
  }
};

/**
 * Clears the enhanced language cache (useful for development/testing)
 */
export const clearLanguageCache = () => {
  languageCache.clear();
  loadedLanguages.clear();
};

/**
 * Gets available languages that are currently loaded in cache
 */
export const getLoadedLanguages = (): LanguageCode[] => {
  return Array.from(languageCache.keys());
};

/**
 * Checks if a language is currently loaded
 */
export const isLanguageLoaded = (language: LanguageCode): boolean => {
  return loadedLanguages.has(language);
}; 