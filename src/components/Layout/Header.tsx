import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Menu, ArrowUp } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { UserDropdown } from './UserDropdown';
import { LanguageSelector } from '../ui/LanguageSelector';
import { useTour } from '../../stores/useAppStore';

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

  // Back to top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Header with smart condensing on scroll */}
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
          border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out safe-top
          ${isScrolled ? 'shadow-lg' : 'shadow-md'}
          ${isCondensed && isMobile ? 'h-12' : 'h-16'}
        `}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className={`
          flex items-center justify-between px-4 sm:px-6 lg:px-8 safe-left safe-right transition-all duration-300
          ${isCondensed && isMobile ? 'h-12' : 'h-16'}
        `}>
          {/* Left side: Logo and mobile menu button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button with enhanced touch target */}
            {user && !isOnboardingPage && (
              <button
                onClick={onMenuToggle}
                className={`
                  touch-target-md md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                  transition-all duration-200 focus-enhanced active:scale-95
                  ${isCondensed ? 'p-1' : 'p-2'}
                `}
                aria-label={t('navigation.toggleMenu')}
                aria-expanded="false"
              >
                <Menu className={`text-gray-600 dark:text-gray-300 ${isCondensed ? 'w-4 h-4' : 'w-5 h-5'}`} />
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
                  ${isCondensed && isMobile ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'}
                  hover:shadow-xl hover:scale-110 group
                `}>
                  <Stethoscope className={`
                    text-white transition-all duration-300 group-hover:rotate-12
                    ${isCondensed && isMobile ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'}
                  `} />
                  {/* Subtle Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm scale-110"></div>
                </div>
                
                {/* Enhanced Typography */}
                <div className={`
                  ml-3 flex flex-col transition-all duration-300
                  ${isCondensed && isMobile ? 'opacity-0 w-0 overflow-hidden ml-0' : ''}
                `}>
                  <div className="flex items-baseline space-x-1">
                    <span className={`
                      font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 
                      dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500 
                      bg-clip-text text-transparent transition-all duration-200
                      ${isCondensed && isMobile ? 'text-base' : 'text-lg sm:text-xl lg:text-2xl'}
                    `}>
                      MediMind
                    </span>
                    <span className={`
                      font-medium text-cyan-600 dark:text-cyan-400 transition-all duration-200
                      ${isCondensed && isMobile ? 'text-sm' : 'text-sm sm:text-base lg:text-lg'}
                    `}>
                      Expert
                    </span>
                  </div>
                  <span className={`
                    text-gray-500 dark:text-gray-400 font-medium tracking-wide transition-all duration-200
                    ${isCondensed && isMobile ? 'hidden' : 'text-xs hidden xs:block'}
                  `}>
                    AI Medical Co-Pilot
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right side: Language selector and user dropdown or auth buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3" data-tour="header-tour-launcher">
            {/* Premium Tour Button - Desktop */}
            {user && !isOnboardingPage && (
              <button
                onClick={() => openTour('selector')}
                className="hidden md:inline-flex items-center relative px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-500/20 overflow-hidden"
                aria-label="Start Premium Tour"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Tour
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}

            {/* Premium Tour Button - Mobile */}
            {user && !isOnboardingPage && (
              <button
                onClick={() => openTour('selector')}
                className="md:hidden inline-flex items-center relative p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg active:scale-95 transition-all duration-200 border border-blue-500/20 overflow-hidden touch-target"
                aria-label="Start Premium Tour"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 active:opacity-100 transition-opacity duration-300" />
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
                    touch-target px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-300 
                    hover:text-primary dark:hover:text-white transition-all duration-200 
                    focus-enhanced rounded-lg active:scale-95
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
                    touch-target bg-primary hover:bg-primary/90 text-white rounded-lg 
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
            fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-white 
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