import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Menu, ArrowUp } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { UserDropdown } from './UserDropdown';
import { LanguageSelector } from '../ui/LanguageSelector';
import { useTour } from '../../stores/useAppStore';
import { useSmartPullToRefresh } from '../../hooks/useSmartPullToRefresh';

interface HeaderProps {
  onMenuToggle: () => void;
  isOnboardingPage?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isOnboardingPage = false }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isCondensed, setIsCondensed] = useState(false);
  const { openTour } = useTour();
  const headerRef = useRef<HTMLElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

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

  // Bind pull-to-refresh to header element (desktop) or mobile button
  useEffect(() => {
    const element = isMobile ? mobileButtonRef.current : headerRef.current;
    if (element) {
      const cleanup = bindToElement(element);
      return cleanup;
    }
  }, [bindToElement, isMobile]);

  // Back to top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Floating Menu Button for Mobile - Edge Tab Style */}
      {isMobile && user && !isOnboardingPage && (
        <button
          ref={mobileButtonRef}
          onClick={onMenuToggle}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl border border-blue-500 transition-all duration-200 focus-enhanced active:scale-95 rounded-r-2xl"
          aria-label={t('navigation.toggleMenu')}
          aria-expanded="false"
          style={{
            width: '24px',
            height: '48px',
            transform: 'translateX(-8px) translateY(-50%)',
            borderLeft: 'none',
          }}
        >
          <div className="flex items-center justify-center h-full pl-2">
            <svg 
              className="w-3 h-3 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      )}

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
          {/* Left side: Logo and desktop menu button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop menu button - only shown on desktop when sidebar exists */}
            {user && !isOnboardingPage && (
              <button
                onClick={onMenuToggle}
                className="hidden lg:flex touch-target-md rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-all duration-200 focus-enhanced active:scale-95 p-2"
                aria-label={t('navigation.toggleMenu')}
                aria-expanded="false"
              >
                <Menu className="w-5 h-5 text-blue-600" />
              </button>
            )}

            {/* Logo with responsive sizing */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-primary dark:text-white focus-enhanced rounded-lg p-1 -m-1 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center">
                {/* Enhanced Medical Icon with Gradient Background */}
                <div className={`
                  relative bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 
                  rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                  ${isCondensed ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'}
                  hover:shadow-xl hover:scale-110 group
                `}>
                  <Stethoscope className={`
                    text-white transition-all duration-300 group-hover:rotate-12
                    ${isCondensed ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'}
                  `} />
                  {/* Subtle Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm scale-110"></div>
                </div>
                
                {/* Enhanced Typography */}
                <div className={`
                  ml-3 flex flex-col transition-all duration-300
                  ${isCondensed ? 'opacity-0 w-0 overflow-hidden ml-0' : ''}
                `}>
                  <div className="flex items-baseline space-x-1">
                    <span className={`
                      font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 
                      dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500 
                      bg-clip-text text-transparent transition-all duration-200
                      ${isCondensed ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}
                    `}>
                      MediMind
                    </span>
                    <span className={`
                      font-medium text-cyan-600 dark:text-cyan-400 transition-all duration-200
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
                className="hidden md:inline-flex items-center px-4 py-2 h-10 rounded-lg text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 focus-enhanced hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #0ea5e9 100%)',
                }}
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
                className="md:hidden inline-flex items-center justify-center p-2 h-10 w-10 rounded-lg text-white shadow-lg active:scale-95 transition-all duration-300 touch-target"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #0ea5e9 100%)',
                }}
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
                    touch-target px-3 sm:px-4 py-2 text-gray-600 hover:text-blue-600 
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
                    touch-target bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                    transition-all duration-200 focus-enhanced active:scale-95
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