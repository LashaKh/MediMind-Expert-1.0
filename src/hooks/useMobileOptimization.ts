import { useState, useEffect } from 'react';
import { isMobile } from '../lib/utils/device';

interface MobileOptimizationConfig {
  isMobile: boolean;
  isReducedMotion: boolean;
  shouldOptimize: boolean;
  isSlowConnection: boolean;
  shouldDisableRealtimeSubscriptions: boolean;
  realtimeThrottleDelay: number;
  animationClasses: {
    blur: string;
    backdropBlur: string;
    gradients: string;
    animations: string;
    orbCount: number;
    animationDuration: string;
    gpuIntensiveEffects: string;
    simpleAlternatives: string;
  };
}

/**
 * Hook for managing mobile-specific performance optimizations
 * Reduces GPU-intensive visual effects on mobile devices and respects user preferences
 */
export const useMobileOptimization = (): MobileOptimizationConfig => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // Check mobile device status
    setIsMobileDevice(isMobile());

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    // Detect slow network connection
    const connection = (navigator as any)?.connection;
    if (connection) {
      const checkConnection = () => {
        const isSlowConn = connection.effectiveType === 'slow-2g' || 
                          connection.effectiveType === '2g' || 
                          connection.effectiveType === '3g' ||
                          connection.downlink < 1.5; // Less than 1.5 Mbps
        setIsSlowConnection(isSlowConn);
      };
      
      checkConnection();
      connection.addEventListener('change', checkConnection);
      
      return () => connection.removeEventListener('change', checkConnection);
    }

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
  
  // Determine if real-time subscriptions should be disabled (extreme optimization)
  const shouldDisableRealtimeSubscriptions = isMobileDevice && isSlowConnection;
  
  // Calculate optimal real-time throttle delay based on device and connection
  const realtimeThrottleDelay = shouldDisableRealtimeSubscriptions ? 30000 : // 30s for slow mobile
                               isMobileDevice && isSlowConnection ? 20000 :   // 20s for slow mobile
                               isMobileDevice ? 15000 :                       // 15s for mobile
                               3000;                                          // 3s for desktop

  // Generate optimized CSS classes based on device capabilities
  const animationClasses = {
    // Blur effects - completely disabled on mobile for GPU performance
    blur: shouldOptimize ? '' : 'blur-2xl',
    
    // Backdrop blur - disabled on mobile, causes severe GPU usage
    backdropBlur: shouldOptimize ? '' : 'backdrop-blur-xl',
    
    // Gradient complexity - simple solid colors on mobile
    gradients: shouldOptimize 
      ? 'bg-white/95 border border-slate-200/50'
      : 'bg-gradient-to-br from-white via-slate-50/30 to-transparent',
    
    // Animation controls - completely disabled on mobile
    animations: shouldOptimize ? '' : 'animate-float',
    
    // Number of floating orbs - none on mobile to save GPU
    orbCount: shouldOptimize ? 0 : 3,
    
    // Animation duration - no animations on mobile
    animationDuration: shouldOptimize ? '0s' : '6s',
    
    // GPU-intensive effects - disabled on mobile
    gpuIntensiveEffects: shouldOptimize ? '' : 'backdrop-blur-xl backdrop-saturate-150 drop-shadow-2xl',
    
    // Simple alternatives for mobile
    simpleAlternatives: shouldOptimize ? 'bg-white/95 shadow-lg border border-slate-200/50' : ''
  };

  return {
    isMobile: isMobileDevice,
    isReducedMotion,
    shouldOptimize,
    isSlowConnection,
    shouldDisableRealtimeSubscriptions,
    realtimeThrottleDelay,
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

/**
 * Utility for applying GPU-safe classes on mobile devices
 */
export const getGPUSafeClasses = (
  desktopClasses: string,
  mobileAlternative: string,
  shouldOptimize: boolean
): string => {
  return shouldOptimize ? mobileAlternative : desktopClasses;
};

/**
 * Check if component should use real-time features based on device capabilities
 */
export const shouldUseRealtime = (
  isMobile: boolean,
  isSlowConnection: boolean,
  isVisible: boolean = true
): boolean => {
  if (!isVisible) return false; // Don't use real-time when not visible
  if (isMobile && isSlowConnection) return false; // Disable on slow mobile connections
  return true;
};

/**
 * Get optimal update frequency based on device and connection
 */
export const getOptimalUpdateFrequency = (
  isMobile: boolean,
  isSlowConnection: boolean
): number => {
  if (isMobile && isSlowConnection) return 30000; // 30 seconds
  if (isMobile) return 15000; // 15 seconds
  return 3000; // 3 seconds for desktop
};