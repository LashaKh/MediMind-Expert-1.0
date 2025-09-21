import { useEffect } from 'react';

/**
 * Custom hook that manages dynamic viewport height for mobile keyboard interactions.
 * 
 * This hook sets a CSS custom property `--viewport-height` that can be used
 * in CSS calculations instead of the problematic `100vh` on mobile devices.
 * 
 * Mobile browsers often change the viewport height when the keyboard appears,
 * but `100vh` doesn't update accordingly, causing layout issues.
 * 
 * Usage in CSS:
 * ```css
 * .mobile-container {
 *   height: calc(var(--viewport-height, 100vh) - 48px);
 * }
 * ```
 */
export const useViewportHeight = () => {
  useEffect(() => {
    const updateViewportHeight = () => {
      // Calculate 1% of the current inner height
      const vh = window.innerHeight * 0.01;
      
      // Set the custom property on the document root
      document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      
      // Also set the legacy vh unit custom property for compatibility
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Development logging (only in development mode)
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 Viewport height updated:', {
          innerHeight: window.innerHeight,
          viewportHeightPx: `${window.innerHeight}px`,
          vhUnit: `${vh}px`
        });
      }
    };

    // Set initial viewport height
    updateViewportHeight();

    // Update on resize (keyboard show/hide triggers resize)
    window.addEventListener('resize', updateViewportHeight);
    
    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure orientation change is complete
      setTimeout(updateViewportHeight, 100);
    });

    // Cleanup event listeners
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);
};