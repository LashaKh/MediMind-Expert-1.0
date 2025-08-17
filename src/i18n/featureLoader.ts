import { LanguageCode } from './languageLoader';

export type FeatureModule = 
  | 'common'
  | 'auth' 
  | 'navigation'
  | 'chat'
  | 'documents'
  | 'medical'
  | 'validation'
  | 'knowledgeBase'
  | 'search'
  | 'calculators'
  | 'diseases'
  | 'podcast';

// Cache for feature-specific translations
const featureCache = new Map<string, Promise<any>>();

/**
 * Creates a cache key for feature translations
 */
const createCacheKey = (language: LanguageCode, feature: FeatureModule): string => {
  return `${language}-${feature}`;
};

/**
 * Loads specific feature translations for a language
 * This enables even more granular code splitting
 */
export const loadFeatureTranslations = async (
  language: LanguageCode, 
  feature: FeatureModule
): Promise<any> => {
  const cacheKey = createCacheKey(language, feature);
  
  // Check if already loading or loaded
  if (featureCache.has(cacheKey)) {
    return featureCache.get(cacheKey);
  }

  const loadingPromise = async () => {
    try {

      let translations;
      
      // Handle special cases for complex features
      if (feature === 'calculators') {
        // For calculators, load main file first
        const mainTranslations = await import(`./translations/${language}/calculators/index.ts`);
        
        // Optionally load sub-features on demand
        return mainTranslations.default;
      } else if (feature === 'diseases') {
        const diseaseTranslations = await import(`./translations/${language}/diseases/index.ts`);
        return diseaseTranslations.default;
      } else {
        // Standard feature loading
        translations = await import(`./translations/${language}/${feature}.ts`);
        return translations.default;
      }
    } catch (error) {

      featureCache.delete(cacheKey);
      
      // Return empty object as fallback to prevent app crashes
      return {};
    }
  };

  const promise = loadingPromise();
  featureCache.set(cacheKey, promise);
  
  return promise;
};

/**
 * Preloads multiple features for a language
 */
export const preloadFeatures = async (
  language: LanguageCode, 
  features: FeatureModule[]
): Promise<void> => {
  const loadPromises = features.map(feature => 
    loadFeatureTranslations(language, feature).catch(console.warn)
  );
  
  await Promise.allSettled(loadPromises);
};

/**
 * Critical features that should be loaded immediately
 */
export const CRITICAL_FEATURES: FeatureModule[] = [
  'common',
  'navigation', 
  'auth',
  'validation'
];

/**
 * Features to preload after critical features are loaded
 */
export const SECONDARY_FEATURES: FeatureModule[] = [
  'chat',
  'medical',
  'documents',
  'search'
];

/**
 * On-demand features (loaded when accessed)
 */
export const ON_DEMAND_FEATURES: FeatureModule[] = [
  'calculators',
  'diseases',
  'podcast',
  'knowledgeBase'
];

/**
 * Gets all loaded features for a language
 */
export const getLoadedFeatures = (language: LanguageCode): FeatureModule[] => {
  const loadedFeatures: FeatureModule[] = [];
  
  for (const [cacheKey] of featureCache.entries()) {
    if (cacheKey.startsWith(`${language}-`)) {
      const feature = cacheKey.split('-')[1] as FeatureModule;
      loadedFeatures.push(feature);
    }
  }
  
  return loadedFeatures;
};

/**
 * Clears feature cache for a specific language or all languages
 */
export const clearFeatureCache = (language?: LanguageCode): void => {
  if (language) {
    // Clear only for specific language
    for (const [cacheKey] of featureCache.entries()) {
      if (cacheKey.startsWith(`${language}-`)) {
        featureCache.delete(cacheKey);
      }
    }
  } else {
    // Clear all
    featureCache.clear();
  }
};

/**
 * Progressive loading strategy for optimal performance
 */
export const loadTranslationsProgressively = async (language: LanguageCode) => {
  // 1. Load critical features first

  await preloadFeatures(language, CRITICAL_FEATURES);
  
  // 2. Load secondary features in background
  setTimeout(() => {

    preloadFeatures(language, SECONDARY_FEATURES).catch(console.warn);
  }, 1000);
  
  // 3. On-demand features will be loaded when needed

}; 