import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../../i18n/config';
import { useLanguage } from '../../stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import type { Language } from '../../types/i18n';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const { currentLanguage, setLanguage, isLoading, error } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<Language | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage === currentLanguage || isLoading) {
      setIsOpen(false);
      return;
    }

    // Check if Georgian or Russian is selected - show coming soon message
    if (newLanguage === 'ka') {
      setIsOpen(false);
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('notification', { 
          detail: { 
            type: 'info', 
            message: 'Georgian language support is coming soon! 🇬🇪' 
          } 
        }));
      }
      return;
    }

    if (newLanguage === 'ru') {
      setIsOpen(false);
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('notification', { 
          detail: { 
            type: 'info', 
            message: 'Russian language support is coming soon! 🇷🇺' 
          } 
        }));
      }
      return;
    }

    setSwitchingTo(newLanguage);
    
    const [success, error] = await safeAsync(
      () => setLanguage(newLanguage),
      { 
        context: 'change application language',
        severity: ErrorSeverity.MEDIUM,
        showToast: true
      }
    );

    if (error) {
      // Show error feedback
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('notification', { 
          detail: { 
            type: 'error', 
            message: 'Failed to change language. Please try again.' 
          } 
        }));
      }
    } else if (success) {
      setIsOpen(false);
      // Show brief success feedback
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('notification', { 
          detail: { 
            type: 'success', 
            message: `Language changed to ${SUPPORTED_LANGUAGES[newLanguage].nativeName}` 
          } 
        }));
      }
    }
    
    setSwitchingTo(null);
  };

  const currentLang = SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES];

  // Loading indicator component
  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#2b6cb0] rounded-full animate-spin"></div>
  );

  const renderLanguageOption = (code: string, lang: typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES], isCompact: boolean = false) => {
    const isCurrentLanguage = currentLanguage === code;
    const isSwitchingToThis = switchingTo === code;
    const isDisabled = isLoading && !isSwitchingToThis;
    const isComingSoon = code === 'ka' || code === 'ru'; // Georgian and Russian are coming soon

    return (
      <button
        key={code}
        onClick={() => handleLanguageChange(code as Language)}
        disabled={isDisabled}
        className={`w-full flex items-center gap-${isCompact ? '2' : '3'} px-${isCompact ? '3' : '4'} py-${isCompact ? '2' : '3'} text-left transition-colors duration-200 ${
          isDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : isComingSoon
            ? 'hover:bg-[#90cdf4]/10 dark:hover:bg-[#90cdf4]/5'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
        } ${
          isCurrentLanguage
            ? 'bg-[#63b3ed]/10 dark:bg-[#2b6cb0]/20 text-[#1a365d] dark:text-[#63b3ed]'
            : isComingSoon
            ? 'text-[#2b6cb0] dark:text-[#63b3ed]'
            : 'text-gray-700 dark:text-gray-300'
        }`}
        title={isDisabled ? 'Loading...' : isComingSoon ? 'Coming Soon!' : lang.nativeName}
      >
        <span className={`${isCompact ? 'text-sm' : 'text-xl'}`} role="img" aria-label={lang.name}>
          {lang.flag}
        </span>
        {!isCompact && (
          <div className="flex-1">
            <div className="font-medium flex items-center gap-2">
              {lang.nativeName}
              {isComingSoon && (
                <span className="text-xs bg-[#90cdf4]/20 dark:bg-[#90cdf4]/10 text-[#2b6cb0] dark:text-[#63b3ed] px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
          </div>
        )}
        {isCompact && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium whitespace-nowrap">{lang.nativeName}</span>
            {isComingSoon && (
              <span className="text-xs bg-[#90cdf4]/20 dark:bg-[#90cdf4]/10 text-[#2b6cb0] dark:text-[#63b3ed] px-1 py-0.5 rounded text-[10px]">
                Soon
              </span>
            )}
          </div>
        )}
        
        {/* Enhanced status indicators */}
        {isSwitchingToThis ? (
          <div className="w-5 h-5 border-2 border-[#90cdf4] border-t-[#2b6cb0] rounded-full animate-spin" />
        ) : isComingSoon ? (
          <div className="relative p-1 rounded-full bg-gradient-to-r from-[#90cdf4] to-[#63b3ed] shadow-md">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : (
          isCurrentLanguage && (
            <div className="relative p-1 rounded-full bg-gradient-to-r from-[#2b6cb0] to-[#63b3ed] shadow-md">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                strokeWidth={2.5}
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )
        )}
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/10 to-[#63b3ed]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      </button>
    );
  };

  const renderDefault = () => (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#63b3ed] ${
          isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
        aria-label={t('profile.language')}
        aria-expanded={isOpen}
        title={isLoading ? 'Loading translations...' : undefined}
      >
        <span className="text-xl" role="img" aria-label={currentLang.name}>
          {currentLang.flag}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLang.nativeName}
        </span>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => 
            renderLanguageOption(code, lang, false)
          )}
        </div>
      )}
    </div>
  );

  const renderCompact = () => (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 h-11 rounded-2xl text-white border border-white/20 backdrop-blur-xl transition-colors duration-200 ${
          isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-[#1a365d]'
        }`}
        style={{
          background: '#2b6cb0'
        }}
        aria-label={t('profile.language')}
        aria-expanded={isOpen}
        title={isLoading ? 'Loading translations...' : currentLang.nativeName}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label={currentLang.name}>
            {currentLang.flag}
          </span>
          
          <span className="text-sm font-medium">
            {currentLang.code.toUpperCase()}
          </span>
          
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          )}
        </div>
      </button>

      {isOpen && !isLoading && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => 
            renderLanguageOption(code, lang, true)
          )}
        </div>
      )}
    </div>
  );

  const renderIconOnly = () => (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#63b3ed] ${
          isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
        aria-label={t('profile.language')}
        aria-expanded={isOpen}
        title={isLoading ? 'Loading translations...' : currentLang.nativeName}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <span className="text-lg" role="img" aria-label={currentLang.name}>
            {currentLang.flag}
          </span>
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50 overflow-hidden">
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => 
            renderLanguageOption(code, lang, true)
          )}
        </div>
      )}
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompact();
    case 'icon-only':
      return renderIconOnly();
    default:
      return renderDefault();
  }
};

export default LanguageSelector; 