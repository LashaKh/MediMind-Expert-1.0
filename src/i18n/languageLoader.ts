export type LanguageCode = 'en' | 'ka' | 'ru';
export type Namespace = 'common' | 'calculators' | 'chat' | 'documents' | 'navigation' | 'medical' | 'auth' | 'validation' | 'knowledgeBase' | 'filters' | 'abg' | 'news' | 'search' | 'podcast';

// Enhanced language loading cache with namespace support
const languageCache = new Map<string, Promise<any>>();
const loadedLanguages = new Map<LanguageCode, Set<Namespace>>();

/**
 * Dynamically loads translation resources for a specific language
 * Uses dynamic imports to enable code splitting and lazy loading
 */
export const loadLanguageResources = async (language: LanguageCode) => {
  const cacheKey = `${language}:full`;
  
  // Return immediately if already fully loaded
  if (languageCache.has(cacheKey)) {
    return languageCache.get(cacheKey);
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
      
      // Mark all namespaces as loaded for this language
      if (!loadedLanguages.has(language)) {
        loadedLanguages.set(language, new Set());
      }
      
      if (import.meta.env.DEV) {

      }
      
      return translations;
    } catch (error) {

      // Remove from cache on failure so we can retry
      languageCache.delete(cacheKey);
      loadedLanguages.delete(language);
      throw error;
    }
  };

  // Cache the promise
  const promise = loadingPromise();
  languageCache.set(cacheKey, promise);
  
  return promise;
};

/**
 * Load specific namespace for a language (for future optimization)
 */
export const loadLanguageNamespace = async (language: LanguageCode, namespace: Namespace) => {
  const cacheKey = `${language}:${namespace}`;
  
  if (languageCache.has(cacheKey)) {
    return languageCache.get(cacheKey);
  }
  
  // For now, load the full language (future enhancement could load individual modules)
  const fullTranslations = await loadLanguageResources(language);
  
  // Cache the specific namespace
  const namespaceData = fullTranslations[namespace];
  languageCache.set(cacheKey, Promise.resolve(namespaceData));
  
  return namespaceData;
};

/**
 * Preloads essential namespaces for better UX
 * Loads only core UI translations to minimize initial bundle
 */
export const preloadEssentialNamespaces = (language: LanguageCode) => {
  const essentialNamespaces: Namespace[] = ['common', 'navigation', 'auth'];
  
  essentialNamespaces.forEach(namespace => {
    const cacheKey = `${language}:${namespace}`;
    if (!languageCache.has(cacheKey)) {
      loadLanguageNamespace(language, namespace).catch(console.warn);
    }
  });
};

/**
 * Preloads translation resources for better UX
 * Can be called to warm up the cache for non-active languages
 */
export const preloadLanguage = (language: LanguageCode) => {
  const cacheKey = `${language}:full`;
  if (!languageCache.has(cacheKey)) {
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
  return Array.from(loadedLanguages.keys());
};

/**
 * Checks if a language is currently loaded
 */
export const isLanguageLoaded = (language: LanguageCode): boolean => {
  const cacheKey = `${language}:full`;
  return languageCache.has(cacheKey);
};

/**
 * Checks if a specific namespace is loaded for a language
 */
export const isNamespaceLoaded = (language: LanguageCode, namespace: Namespace): boolean => {
  const cacheKey = `${language}:${namespace}`;
  return languageCache.has(cacheKey) || isLanguageLoaded(language);
};

/**
 * Get cache statistics for monitoring
 */
export const getCacheStats = () => {
  return {
    totalCachedItems: languageCache.size,
    loadedLanguages: Array.from(loadedLanguages.keys()),
    cacheKeys: Array.from(languageCache.keys())
  };
}; 