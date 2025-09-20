import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowUp } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { UserDropdown } from './UserDropdown';
import { LanguageSelector } from '../ui/LanguageSelector';
import { useTour } from '../../stores/useAppStore';
import { useSmartPullToRefresh } from '../../hooks/useSmartPullToRefresh';

interface HeaderProps {
  isOnboardingPage?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isOnboardingPage = false }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isCondensed, setIsCondensed] = useState(false);
  const { openTour } = useTour();
  const headerRef = useRef<HTMLElement>(null);

  // Smart pull-to-refresh (only in header area, doesn't interfere with scrolling)
  const { bindToElement } = useSmartPullToRefresh({
    onRefresh: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload();
    },
    enabled: isMobile && !isOnboardingPage
  });

  // Detect mobile and scroll behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrolled = scrollTop > 10;
      const shouldCondense = scrollTop > 100;
      const shouldShowBackToTop = scrollTop > 300;

      setIsScrolled(scrolled);
      setIsCondensed(shouldCondense);
      setShowBackToTop(shouldShowBackToTop);
    };

    checkMobile();
    handleScroll();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Bind pull-to-refresh to header element
  useEffect(() => {
    const element = headerRef.current;
    if (element) {
      const cleanup = bindToElement(element);
      return cleanup;
    }
  }, [bindToElement]);

  // Back to top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Header - hidden on mobile */}
      <header 
        ref={headerRef}
        className={`
          ${isMobile ? 'hidden' : 'fixed top-0 left-0 right-0 z-50'}
          bg-white border-b border-gray-200 transition-all duration-300 ease-in-out safe-top
          ${isScrolled ? 'shadow-lg' : 'shadow-sm'}
          ${isCondensed ? 'h-14' : 'h-18'}
        `}
      >
        <div className={`
          flex items-center justify-between px-4 sm:px-6 lg:px-8 safe-left safe-right transition-all duration-300
          ${isCondensed ? 'h-14 py-2' : 'h-20 py-5'}
        `}>
          {/* Left side: Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Logo with responsive sizing */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-primary dark:text-white focus-enhanced rounded-lg p-1 -m-1 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center">
                {/* Enhanced Medical Icon with Gradient Background */}
                <div className={`
                  relative bg-gradient-to-br from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] 
                  rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                  ${isCondensed ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'}
                  hover:shadow-xl hover:scale-110 group
                `}>
                  <Stethoscope className={`
                    text-white transition-all duration-300 group-hover:rotate-12
                    ${isCondensed ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'}
                  `} />
                  {/* Subtle Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2b6cb0] to-[#63b3ed] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm scale-110"></div>
                </div>
                
                {/* Enhanced Typography */}
                <div className={`
                  ml-3 flex flex-col transition-all duration-300
                  ${isCondensed ? 'opacity-0 w-0 overflow-hidden ml-0' : ''}
                `}>
                  <div className="flex items-baseline space-x-1">
                    <span className={`
                      font-bold bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] 
                      dark:from-[#63b3ed] dark:via-[#2b6cb0] dark:to-[#90cdf4] 
                      bg-clip-text text-transparent transition-all duration-200
                      ${isCondensed ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}
                    `}>
                      MediMind
                    </span>
                    <span className={`
                      font-medium text-[#2b6cb0] dark:text-[#63b3ed] transition-all duration-200
                      ${isCondensed ? 'text-sm' : 'text-sm sm:text-base lg:text-lg'}
                    `}>
                      Expert
                    </span>
                  </div>
                  <span className={`
                    text-gray-500 dark:text-gray-400 font-medium tracking-wide transition-all duration-200
                    ${isCondensed ? 'hidden' : 'text-xs hidden xs:block'}
                  `}>
                    AI Medical Co-Pilot
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right side: Language selector and user dropdown or auth buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3" data-tour="header-tour-launcher">
            {/* Start Tour Button - Desktop */}
            {user && !isOnboardingPage && (
              <button
                onClick={() => openTour('selector')}
                className="hidden md:inline-flex items-center px-4 py-2 h-10 rounded-lg text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 focus-enhanced hover:scale-105 bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] hover:from-[#1a365d]/90 hover:via-[#2b6cb0]/90 hover:to-[#63b3ed]/90"
                aria-label="Start Tour"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Tour
              </button>
            )}

            {/* Start Tour Button - Mobile */}
            {user && !isOnboardingPage && (
              <button
                onClick={() => openTour('selector')}
                className="md:hidden inline-flex items-center justify-center p-2 h-10 w-10 rounded-lg text-white shadow-lg active:scale-95 transition-all duration-300 touch-target bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] hover:from-[#1a365d]/90 hover:via-[#2b6cb0]/90 hover:to-[#63b3ed]/90"
                aria-label="Start Tour"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            )}
            {/* Language Selector */}
            <LanguageSelector 
              variant={isMobile ? 'icon-only' : 'compact'} 
              className="flex-shrink-0"
            />

            {user ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/signin"
                  className={`
                    touch-target px-3 sm:px-4 py-2 text-gray-600 hover:text-[#2b6cb0] 
                    transition-all duration-200 focus-enhanced rounded-lg active:scale-95
                    ${isCondensed && isMobile ? 'text-xs px-2 py-1' : 'text-sm sm:text-base'}
                  `}
                >
                  <span className={isCondensed && isMobile ? 'block' : 'hidden sm:inline'}>
                    {t('auth.signIn')}
                  </span>
                  <span className={isCondensed && isMobile ? 'hidden' : 'sm:hidden'}>
                    {t('auth.signIn')}
                  </span>
                </Link>
                <Link
                  to="/signup"
                  className={`
                    touch-target bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] hover:from-[#1a365d]/90 hover:to-[#2b6cb0]/90 text-white rounded-lg 
                    transition-all duration-200 focus-enhanced active:scale-95 shadow-md hover:shadow-lg
                    ${isCondensed && isMobile ? 'text-xs px-2 py-1' : 'px-3 sm:px-4 py-2 text-sm sm:text-base'}
                  `}
                >
                  <span className={isCondensed && isMobile ? 'block' : 'hidden sm:inline'}>
                    {t('auth.signUp')}
                  </span>
                  <span className={isCondensed && isMobile ? 'hidden' : 'sm:hidden'}>
                    {t('auth.signUp')}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={`
            fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white 
            rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
            focus-enhanced active:scale-95 group
            ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}
          `}
          aria-label="Back to top"
          style={{
            transform: showBackToTop ? 'translateY(0)' : 'translateY(100px)',
          }}
        >
          <ArrowUp className={`
            transition-transform duration-200 group-hover:-translate-y-0.5
            ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}
          `} />
        </button>
      )}
    </>
  );
};