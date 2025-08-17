import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Language } from '../types/i18n';
import { DEFAULT_LANGUAGE } from '../i18n/config';
import { changeLanguage as asyncChangeLanguage, getCurrentLanguage } from '../i18n/i18n';
import { preloadLanguage } from '../i18n/languageLoader';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  preloadLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize language from getCurrentLanguage which reads from i18n
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getCurrentLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const setLanguage = useCallback(async (lang: Language): Promise<boolean> => {
    if (lang === currentLanguage) {
      return true; // Already the current language
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Use the async language changer
      const success = await asyncChangeLanguage(lang);
      
      if (success) {
        setCurrentLanguage(lang);
        
        // Dispatch custom event to trigger re-renders
        window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
        
        return true;
      } else {
        setError('Failed to change language');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  const handlePreloadLanguage = useCallback((lang: Language) => {
    preloadLanguage(lang);
  }, []);

  // Update document language attribute when language changes
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Handle route-based re-renders when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render of current route
      navigate(location.pathname + location.search + location.hash, { replace: true });
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, [navigate, location]);

  // Preload non-current languages in the background for better UX
  useEffect(() => {
    const languagesToPreload: Language[] = ['en', 'ka', 'ru'].filter(
      lang => lang !== currentLanguage
    ) as Language[];
    
    // Preload after a short delay to not interfere with initial load
    const timer = setTimeout(() => {
      languagesToPreload.forEach(lang => {
        handlePreloadLanguage(lang);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentLanguage, handlePreloadLanguage]);

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      isLoading, 
      error,
      preloadLanguage: handlePreloadLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};