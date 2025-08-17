import { useCallback } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useLanguage } from '../stores/useAppStore'; // Updated to use store-based language management
import type { Language } from '../types/i18n';

export const useTranslation = () => {
  const { currentLanguage, setLanguage, isLoading } = useLanguage();
  const { t: i18nT, ready } = useI18nextTranslation();

  const t = useCallback((key: string, params?: Record<string, any>): any => {
    // If translations are not ready yet, return the key to prevent crashes
    if (!ready || isLoading) {

      return key;
    }

    try {
      // Handle returnObjects parameter for arrays/objects
      if (params?.returnObjects === true) {
        const result = i18nT(key, { returnObjects: true, ...params });
        
        // If it's an object or array, return it directly
        if (Array.isArray(result) || (typeof result === 'object' && result !== null)) {
          return result;
        }
        
        // If returnObjects was requested but result is not an object, return empty array
        if (typeof result === 'string' && result === key) {

          return [];
        }
        
        return result;
      }

      // Standard string translation
      const result = i18nT(key, params);
      
      // If translation is missing, i18next returns the key
      if (result === key && process.env.NODE_ENV === 'development') {

      }
      
      return result;
    } catch (error) {

      // Return appropriate fallback based on returnObjects flag
      if (params?.returnObjects === true) {
        return [];
      }
      
      return key;
    }
  }, [i18nT, ready, isLoading, currentLanguage]);

  const handleLanguageChange = useCallback(async (newLanguage: Language) => {
    try {
      const success = await setLanguage(newLanguage);
      if (!success) {

      }
      return success;
    } catch (error) {

      return false;
    }
  }, [setLanguage]);

  return { 
    t, 
    handleLanguageChange, 
    currentLanguage,
    isLoading: isLoading || !ready,
    ready: ready && !isLoading
  };
};