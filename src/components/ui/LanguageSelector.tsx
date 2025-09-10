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
    <div className="w-4 h-4 border-2 border-input border-t-[var(--ring)] rounded-full animate-spin"></div>
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
            ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
            : 'hover:bg-[var(--component-surface-primary)] dark:hover:bg-[var(--card)]'
        } ${
          isCurrentLanguage
            ? 'bg-[var(--cardiology-accent-blue-light)] dark:bg-[var(--cardiology-accent-blue-darker)]/20 text-[var(--cardiology-accent-blue-dark)] dark:text-blue-400'
            : isComingSoon
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)]'
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
                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)]">{lang.name}</div>
          </div>
        )}
        {isCompact && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium whitespace-nowrap">{lang.nativeName}</span>
            {isComingSoon && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1 py-0.5 rounded text-[10px]">
                Soon
              </span>
            )}
          </div>
        )}
        
        {/* Enhanced status indicators */}
        {isSwitchingToThis ? (
          <div className="w-5 h-5 border-2 border-[var(--cardiology-accent-blue)] border-t-blue-600 rounded-full animate-spin" />
        ) : isComingSoon ? (
          <div className="relative p-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-md">
            <svg className="w-3 h-3 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : (
          isCurrentLanguage && (
            <div className="relative p-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md">
              <svg
                className="w-3 h-3 text-[var(--foreground)]"
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      </button>
    );
  };

  const renderDefault = () => (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-2 bg-[var(--component-card)] dark:bg-[var(--background)] border border-[var(--glass-border-medium)] dark:border-[var(--border-strong)] rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--cardiology-accent-blue)] ${
          isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-[var(--component-surface-primary)] dark:hover:bg-[var(--card)]'
        }`}
        aria-label={t('profile.language')}
        aria-expanded={isOpen}
        title={isLoading ? 'Loading translations...' : undefined}
      >
        <span className="text-xl" role="img" aria-label={currentLang.name}>
          {currentLang.flag}
        </span>
        <span className="text-sm font-medium text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)]">
          {currentLang.nativeName}
        </span>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <svg
            className={`w-4 h-4 text-[var(--foreground-secondary)] transition-transform duration-200 ${
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
        <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-[var(--component-card)] dark:bg-[var(--background)] border border-[var(--glass-border-medium)] dark:border-[var(--border-strong)] rounded-lg shadow-lg z-50 overflow-hidden">
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
        className={`relative group flex items-center gap-2 px-4 py-0 h-11 rounded-2xl text-[var(--foreground)] shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-500 ease-out border border-white/20 backdrop-blur-xl overflow-hidden ${
          isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : ''
        }`}
        style={{
          background: 'var(--gradient-blue)',
          backgroundSize: '300% 300%',
          boxShadow: 'var(--shadow-primary), var(--shadow-secondary), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          animation: 'gradient-shift 6s ease-in-out infinite'
        }}
        aria-label={t('profile.language')}
        aria-expanded={isOpen}
        title={isLoading ? 'Loading translations...' : currentLang.nativeName}
      >
        {/* Animated background layers */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
             style={{
               background: 'var(--gradient-cyan)',
               backgroundSize: '400% 400%',
               animation: 'gradient-shift 4s ease-in-out infinite'
             }} />
        
        {/* Inner glow */}
        <div className="absolute inset-0.5 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-600"
             style={{
               background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
               backgroundSize: '200% 200%',
               animation: 'shimmer 2s ease-in-out infinite'
             }} />
        
        <div className="relative z-10 flex items-center gap-2">
          {/* Enhanced flag with container */}
          <div className="relative p-1 rounded-xl bg-[var(--component-card)]/20 backdrop-blur-sm group-hover:bg-[var(--component-card)]/30 transition-all duration-500 group-hover:scale-110">
            <span className="text-lg drop-shadow-sm" role="img" aria-label={currentLang.name}>
              {currentLang.flag}
            </span>
          </div>
          
          {/* Enhanced text */}
          <span className="text-sm font-bold drop-shadow-sm tracking-wide group-hover:translate-x-0.5 transition-transform duration-300"
                style={{ textShadow: 'var(--medical-shadow-black-medium)' }}>
            {currentLang.code.toUpperCase()}
          </span>
          
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          )}
        </div>
        
        {/* Pulse ring on hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-white/40 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" />
      </button>

      {isOpen && !isLoading && (
        <div className="absolute top-full right-0 mt-2 bg-[var(--component-card)]/95 dark:bg-[var(--background)]/95 border border-white/20 dark:border-[var(--border-strong)]/20 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
             style={{
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
             }}>
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
        className={`w-8 h-8 flex items-center justify-center bg-[var(--component-card)] dark:bg-[var(--background)] border border-[var(--glass-border-medium)] dark:border-[var(--border-strong)] rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--cardiology-accent-blue)] ${
          isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-[var(--component-surface-primary)] dark:hover:bg-[var(--card)]'
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
        <div className="absolute top-full right-0 mt-1 bg-[var(--component-card)] dark:bg-[var(--background)] border border-[var(--glass-border-medium)] dark:border-[var(--border-strong)] rounded shadow-lg z-50 overflow-hidden">
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