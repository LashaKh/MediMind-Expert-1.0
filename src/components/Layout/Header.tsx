import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Menu, ArrowUp } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { UserDropdown } from './UserDropdown';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeToggle } from '../ui/ThemeToggle';
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
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-br from-primary via-secondary to-primary/90 shadow-lg hover:shadow-xl border border-primary/50 transition-all duration-300 focus-enhanced active:scale-95 rounded-r-2xl hover:scale-105"
          aria-label={t('navigation.toggleMenu')}
          aria-expanded="false"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            width: '24px',
            height: '48px',
            transform: 'translateX(-8px) translateY(-50%)',
            borderLeft: 'none',
          }}
        >
          <div className="flex items-center justify-center h-full pl-2">
            <svg 
              className="w-3 h-3 text-[var(--foreground)]" 
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
          theme-surface
          border-b border-[var(--glass-border-light)] dark:border-[var(--border-strong)] transition-all duration-300 ease-in-out safe-top
          ${isScrolled ? 'shadow-lg' : 'shadow-md'}
          ${isCondensed ? 'h-14' : 'h-20'}
        `}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
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
                className="hidden lg:flex touch-target-md rounded-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 hover:from-primary/20 hover:via-secondary/20 hover:to-primary/20 border border-primary/20 hover:border-primary/40 transition-all duration-200 focus-enhanced active:scale-95 p-2"
                aria-label={t('navigation.toggleMenu')}
                aria-expanded="false"
              >
                <Menu className="w-5 h-5 text-[var(--cardiology-accent-blue-dark)] dark:text-blue-400" />
              </button>
            )}

            {/* Logo with responsive sizing */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-primary dark:text-[var(--foreground)] focus-enhanced rounded-lg p-1 -m-1 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center">
                {/* Enhanced Medical Icon with Gradient Background */}
                <div className={`
                  relative bg-gradient-to-br from-primary via-secondary to-primary 
                  rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                  ${isCondensed ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'}
                  hover:shadow-xl hover:scale-110 group
                `}>
                  <Stethoscope className={`
                    text-[var(--foreground)] transition-all duration-300 group-hover:rotate-12
                    ${isCondensed ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'}
                  `} />
                  {/* Subtle Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm scale-110"></div>
                </div>
                
                {/* Enhanced Typography */}
                <div className={`
                  ml-3 flex flex-col transition-all duration-300
                  ${isCondensed ? 'opacity-0 w-0 overflow-hidden ml-0' : ''}
                `}>
                  <div className="flex items-baseline space-x-1">
                    <span className={`
                      font-bold bg-gradient-to-r from-primary via-secondary to-primary 
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
                    text-[var(--foreground-secondary)] dark:text-[var(--foreground-secondary)] font-medium tracking-wide transition-all duration-200
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
            {/* Premium Tour Button - Desktop */}
            {user && !isOnboardingPage && (
              <button
                onClick={() => openTour('selector')}
                className="hidden md:inline-flex items-center relative group px-4 py-0 h-11 rounded-2xl text-sm font-bold text-[var(--foreground)] shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-500 ease-out border border-white/20 backdrop-blur-xl overflow-hidden"
                aria-label="Start Premium Tour"
                style={{
                  background: 'var(--gradient-blue)',
                  backgroundSize: '300% 300%',
                  boxShadow: 'var(--shadow-primary), var(--shadow-secondary), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  animation: 'gradient-shift 6s ease-in-out infinite'
                }}
              >
                {/* Dynamic animated background layers */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out"
                     style={{
                       background: 'conic-gradient(from 0deg, var(--brand-primary-500), var(--brand-secondary-500), var(--brand-primary-500), var(--brand-primary-600), var(--brand-secondary-500), var(--brand-primary-500))',
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
                  <div className="relative p-2 rounded-2xl bg-[var(--component-card)]/25 backdrop-blur-sm group-hover:bg-[var(--component-card)]/35 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110"
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
                    <div className="absolute inset-0 rounded-2xl bg-[var(--component-card)]/50 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-700" />
                    <div className="absolute inset-0 rounded-2xl bg-[var(--cardiology-accent-blue-medium)]/30 opacity-0 group-hover:opacity-100 blur-md transition-all duration-700 delay-100" />
                  </div>
                  
                  {/* Premium text with layered effects */}
                  <span className="relative font-extrabold text-[var(--foreground)] drop-shadow-lg tracking-wide group-hover:translate-x-1 transition-all duration-500 ease-out"
                        style={{
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.2)'
                        }}>
                    Start Tour
                    {/* Enhanced text depth */}
                    <span className="absolute inset-0 text-black/30 blur-sm -z-10">Start Tour</span>
                    <span className="absolute inset-0 text-[var(--foreground)]/20 blur-lg -z-20">Start Tour</span>
                  </span>
                  
                </div>
                
                {/* Sophisticated pulse rings with staggered animation */}
                <div className="absolute inset-0 rounded-3xl border-2 border-white/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-800 ease-out" />
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-1200 ease-out delay-200" />
                <div className="absolute inset-0 rounded-3xl border border-white/20 opacity-0 group-hover:opacity-100 group-hover:scale-140 transition-all duration-1600 ease-out delay-400" />
                
                {/* Magical floating particles effect */}
                <div className="absolute top-1 left-1/4 w-1 h-1 bg-[var(--component-card)]/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-300"
                     style={{ animation: 'floating-particles 4s ease-in-out infinite 0.5s' }} />
                <div className="absolute top-2 right-1/3 w-0.5 h-0.5 bg-[var(--component-card)]/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500"
                     style={{ animation: 'floating-particles 4s ease-in-out infinite 1s' }} />
                <div className="absolute bottom-2 left-1/2 w-0.5 h-0.5 bg-[var(--component-card)]/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-700"
                     style={{ animation: 'floating-particles 4s ease-in-out infinite 1.5s' }} />
              </button>
            )}

            {/* Premium Tour Button - Mobile */}
            {user && !isOnboardingPage && (
              <button
                onClick={() => openTour('selector')}
                className="md:hidden inline-flex items-center justify-center relative group p-0 h-11 w-11 rounded-2xl text-[var(--foreground)] shadow-lg active:scale-95 transition-all duration-300 ease-out border border-white/20 backdrop-blur-xl overflow-hidden touch-target"
                aria-label="Start Premium Tour"
                style={{
                  background: 'var(--gradient-blue)',
                  backgroundSize: '300% 300%',
                  boxShadow: 'var(--shadow-primary), var(--shadow-secondary), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  animation: 'gradient-shift 6s ease-in-out infinite'
                }}
              >
                {/* Dynamic animated background for mobile */}
                <div className="absolute inset-0 rounded-3xl opacity-0 active:opacity-100 transition-opacity duration-600"
                     style={{
                       background: 'conic-gradient(from 180deg, var(--brand-secondary-500), var(--brand-primary-500), var(--brand-primary-600), var(--brand-secondary-500), var(--brand-primary-500))',
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
                <div className="relative z-10 p-2 rounded-2xl bg-[var(--component-card)]/25 backdrop-blur-sm active:bg-[var(--component-card)]/35 transition-all duration-500 active:rotate-12 active:scale-110"
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
                  <div className="absolute inset-0 rounded-2xl bg-[var(--component-card)]/50 opacity-0 active:opacity-100 blur-sm transition-all duration-500" />
                  <div className="absolute inset-0 rounded-2xl bg-[var(--cardiology-accent-blue-medium)]/30 opacity-0 active:opacity-100 blur-md transition-all duration-500 delay-100" />
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
                <div className="absolute top-1 left-1/4 w-1 h-1 bg-[var(--component-card)]/60 rounded-full opacity-0 active:opacity-100 transition-all duration-600 delay-200" />
                <div className="absolute bottom-1 right-1/4 w-0.5 h-0.5 bg-[var(--component-card)]/40 rounded-full opacity-0 active:opacity-100 transition-all duration-600 delay-400" />
              </button>
            )}
            {/* Theme Toggle */}
            <ThemeToggle />
            
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
                    touch-target px-3 sm:px-4 py-2 text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] 
                    hover:text-primary dark:hover:text-[var(--foreground)] transition-all duration-200 
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
                    touch-target bg-primary hover:bg-primary/90 text-[var(--foreground)] rounded-lg 
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
            fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-[var(--foreground)] 
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