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
          ${isCondensed && isMobile ? 'h-14' : 'h-20'}
        `}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className={`
          flex items-center justify-between px-4 sm:px-6 lg:px-8 safe-left safe-right transition-all duration-300
          ${isCondensed && isMobile ? 'h-14 py-2' : 'h-20 py-5'}
        `}>
          {/* Left side: Logo and mobile menu button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button with enhanced touch target */}
            {user && !isOnboardingPage && (
              <button
                onClick={onMenuToggle}
                className={`
                  touch-target-md medical-touch-target medical-mobile-touch-md md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
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
                className="hidden md:inline-flex items-center relative group px-4 py-0 h-11 rounded-2xl text-sm font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-500 ease-out border border-white/20 backdrop-blur-xl overflow-hidden"
                aria-label="Start Premium Tour"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(6, 182, 212, 0.8) 25%, rgba(59, 130, 246, 0.7) 50%, rgba(37, 99, 235, 0.8) 75%, rgba(6, 182, 212, 0.7) 100%)',
                  backgroundSize: '300% 300%',
                  boxShadow: '0 8px 25px -8px rgba(59, 130, 246, 0.25), 0 4px 15px -4px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  animation: 'gradient-shift 6s ease-in-out infinite'
                }}
              >
                {/* Dynamic animated background layers */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out"
                     style={{
                       background: 'conic-gradient(from 0deg, #3b82f6, #06b6d4, #3b82f6, #2563eb, #06b6d4, #3b82f6)',
                       backgroundSize: '300% 300%',
                       animation: 'gradient-shift 6s linear infinite'
                     }} />
                
                {/* Sophisticated inner glow with breathing effect */}
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/25 to-white/5 opacity-70 group-hover:opacity-90 transition-all duration-700"
                     style={{
                       animation: 'tour-button-glow 3s ease-in-out infinite'
                     }} />
                
                {/* Multi-layered shimmer effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-800"
                     style={{
                       background: 'linear-gradient(45deg, transparent 20%, rgba(255, 255, 255, 0.4) 40%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.4) 60%, transparent 80%)',
                       backgroundSize: '300% 300%',
                       animation: 'shimmer 2.5s ease-in-out infinite'
                     }} />
                
                {/* Prismatic light refraction effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-30 transition-all duration-1000 delay-200"
                     style={{
                       background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                       transform: 'skewX(-15deg)',
                       animation: 'shimmer 1.5s ease-in-out infinite 0.5s'
                     }} />
                
                {/* Content container with enhanced spacing */}
                <div className="relative z-10 flex items-center space-x-3">
                  {/* Ultra-enhanced icon with complex animation */}
                  <div className="relative p-2 rounded-2xl bg-white/25 backdrop-blur-sm group-hover:bg-white/35 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110"
                       style={{
                         boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
                       }}>
                    <svg 
                      className="w-5 h-5 drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-xl" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      strokeWidth={2.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {/* Multi-layer icon glow */}
                    <div className="absolute inset-0 rounded-2xl bg-white/50 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-700" />
                    <div className="absolute inset-0 rounded-2xl bg-blue-300/30 opacity-0 group-hover:opacity-100 blur-md transition-all duration-700 delay-100" />
                  </div>
                  
                  {/* Premium text with layered effects */}
                  <span className="relative font-extrabold text-white drop-shadow-lg tracking-wide group-hover:translate-x-1 transition-all duration-500 ease-out"
                        style={{
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.2)'
                        }}>
                    Start Tour
                    {/* Enhanced text depth */}
                    <span className="absolute inset-0 text-black/30 blur-sm -z-10">Start Tour</span>
                    <span className="absolute inset-0 text-white/20 blur-lg -z-20">Start Tour</span>
                  </span>
                  
                </div>
                
                {/* Sophisticated pulse rings with staggered animation */}
                <div className="absolute inset-0 rounded-3xl border-2 border-white/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-800 ease-out" />
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-1200 ease-out delay-200" />
                <div className="absolute inset-0 rounded-3xl border border-white/20 opacity-0 group-hover:opacity-100 group-hover:scale-140 transition-all duration-1600 ease-out delay-400" />
                
                {/* Magical floating particles effect */}
                <div className="absolute top-1 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-300"
                     style={{ animation: 'floating-particles 4s ease-in-out infinite 0.5s' }} />
                <div className="absolute top-2 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500"
                     style={{ animation: 'floating-particles 4s ease-in-out infinite 1s' }} />
                <div className="absolute bottom-2 left-1/2 w-0.5 h-0.5 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-700"
                     style={{ animation: 'floating-particles 4s ease-in-out infinite 1.5s' }} />
              </button>
            )}

            {/* Premium Tour Button - Mobile */}
            {user && !isOnboardingPage && (
              <button
                onClick={() => openTour('selector')}
                className="md:hidden inline-flex items-center justify-center relative group p-0 h-11 w-11 rounded-2xl text-white shadow-lg active:scale-95 transition-all duration-300 ease-out border border-white/20 backdrop-blur-xl overflow-hidden touch-target"
                aria-label="Start Premium Tour"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(6, 182, 212, 0.8) 25%, rgba(59, 130, 246, 0.7) 50%, rgba(37, 99, 235, 0.8) 75%, rgba(6, 182, 212, 0.7) 100%)',
                  backgroundSize: '300% 300%',
                  boxShadow: '0 8px 25px -8px rgba(59, 130, 246, 0.25), 0 4px 15px -4px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  animation: 'gradient-shift 6s ease-in-out infinite'
                }}
              >
                {/* Dynamic animated background for mobile */}
                <div className="absolute inset-0 rounded-3xl opacity-0 active:opacity-100 transition-opacity duration-600"
                     style={{
                       background: 'conic-gradient(from 180deg, #06b6d4, #3b82f6, #2563eb, #06b6d4, #3b82f6)',
                       backgroundSize: '300% 300%',
                       animation: 'gradient-shift 4s linear infinite'
                     }} />
                
                {/* Sophisticated inner glow for mobile */}
                <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/25 to-white/5 opacity-70 active:opacity-90 transition-all duration-500" />
                
                {/* Mobile shimmer effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 active:opacity-100 transition-opacity duration-600"
                     style={{
                       background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%)',
                       backgroundSize: '200% 200%',
                       animation: 'shimmer 2s ease-in-out infinite'
                     }} />
                
                {/* Enhanced mobile icon container */}
                <div className="relative z-10 p-2 rounded-2xl bg-white/25 backdrop-blur-sm active:bg-white/35 transition-all duration-500 active:rotate-12 active:scale-110"
                     style={{
                       boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
                     }}>
                  <svg 
                    className="w-6 h-6 drop-shadow-lg transition-all duration-300 active:drop-shadow-xl" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2.8}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {/* Multi-layer mobile icon glow */}
                  <div className="absolute inset-0 rounded-2xl bg-white/50 opacity-0 active:opacity-100 blur-sm transition-all duration-500" />
                  <div className="absolute inset-0 rounded-2xl bg-blue-300/30 opacity-0 active:opacity-100 blur-md transition-all duration-500 delay-100" />
                </div>
                
                {/* Mobile pulse rings with enhanced feedback */}
                <div className="absolute inset-0 rounded-3xl border-2 border-white/50 opacity-0 active:opacity-100 scale-110 transition-all duration-600 ease-out" />
                <div className="absolute inset-0 rounded-3xl border border-white/30 opacity-0 active:opacity-100 scale-125 transition-all duration-800 ease-out delay-100" />
                
                {/* Mobile touch ripple effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 active:opacity-30 transition-all duration-300"
                     style={{
                       background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                       animation: 'mobile-touch-ripple 0.6s ease-out'
                     }} />
                
                {/* Mobile floating particles */}
                <div className="absolute top-1 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-0 active:opacity-100 transition-all duration-600 delay-200" />
                <div className="absolute bottom-1 right-1/4 w-0.5 h-0.5 bg-white/40 rounded-full opacity-0 active:opacity-100 transition-all duration-600 delay-400" />
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