import { useState, useEffect } from 'react';
import { isMobile } from '../lib/utils/device';

interface MobileOptimizationConfig {
  isMobile: boolean;
  isReducedMotion: boolean;
  shouldOptimize: boolean;
  animationClasses: {
    blur: string;
    backdropBlur: string;
    gradients: string;
    animations: string;
    orbCount: number;
    animationDuration: string;
  };
}

/**
 * Hook for managing mobile-specific performance optimizations
 * Reduces GPU-intensive visual effects on mobile devices and respects user preferences
 */
export const useMobileOptimization = (): MobileOptimizationConfig => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check mobile device status
    setIsMobileDevice(isMobile());

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    // Listen for changes in motion preference
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    // Listen for viewport changes (mobile/desktop transitions)
    const handleResize = () => {
      setIsMobileDevice(isMobile());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Determine if we should optimize (mobile device OR reduced motion preference)
  const shouldOptimize = isMobileDevice || isReducedMotion;

  // Generate optimized CSS classes based on device capabilities
  const animationClasses = {
    // Blur effects - reduce intensity on mobile
    blur: shouldOptimize ? 'blur-sm' : 'blur-2xl',
    
    // Backdrop blur - significantly reduced on mobile
    backdropBlur: shouldOptimize ? 'backdrop-blur-sm' : 'backdrop-blur-xl',
    
    // Gradient complexity - simpler on mobile
    gradients: shouldOptimize 
      ? 'bg-gradient-to-br from-white/90 to-slate-50/70'
      : 'bg-gradient-to-br from-white via-slate-50/30 to-transparent',
    
    // Animation controls - disable or reduce on mobile
    animations: shouldOptimize ? '' : 'animate-float',
    
    // Number of floating orbs - reduce count on mobile
    orbCount: shouldOptimize ? 1 : 3,
    
    // Animation duration - slower on mobile for efficiency
    animationDuration: shouldOptimize ? '12s' : '6s'
  };

  return {
    isMobile: isMobileDevice,
    isReducedMotion,
    shouldOptimize,
    animationClasses
  };
};

/**
 * Utility function to conditionally apply classes based on optimization settings
 */
export const optimizeClasses = (
  defaultClasses: string,
  mobileClasses: string,
  shouldOptimize: boolean
): string => {
  return shouldOptimize ? mobileClasses : defaultClasses;
};

/**
 * Utility for creating performance-aware animation delays
 */
export const getOptimizedDelay = (
  baseDelay: string,
  shouldOptimize: boolean
): React.CSSProperties => {
  if (shouldOptimize) {
    return {}; // No animation delay on mobile
  }
  return { animationDelay: baseDelay };
};