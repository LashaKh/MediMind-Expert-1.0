import { useEffect } from 'react';

/**
 * Enhanced mobile viewport management with keyboard detection
 * 
 * Solves mobile keyboard issues:
 * - Keeps header visible when keyboard opens
 * - Moves floating buttons above keyboard
 * - Prevents viewport shifting on input focus
 */
export const useViewportHeight = () => {
  useEffect(() => {
    let initialHeight = window.innerHeight;
    let isKeyboardOpen = false;

    const updateViewportAndButtons = () => {
      // Use Visual Viewport API for accurate keyboard detection
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate if keyboard is open
      const heightDifference = initialHeight - currentHeight;
      const keyboardDetected = heightDifference > 50;
      
      // Set CSS variables for dynamic positioning
      document.documentElement.style.setProperty('--window-height', `${windowHeight}px`);
      document.documentElement.style.setProperty('--viewport-height', `${currentHeight}px`);
      document.documentElement.style.setProperty('--keyboard-height', `${Math.max(0, heightDifference)}px`);
      
      // Handle keyboard state change
      if (keyboardDetected !== isKeyboardOpen) {
        isKeyboardOpen = keyboardDetected;
        
        // Update floating buttons position
        const floatingButtons = document.querySelectorAll('.mediscribe-mobile-fab, .mediscribe-mobile-floating-upload');
        
        if (isKeyboardOpen) {
          document.body.classList.add('keyboard-open');
          // Move buttons above keyboard with safe padding
          const buttonBottom = heightDifference + 20;
          document.documentElement.style.setProperty('--floating-button-bottom', `${buttonBottom}px`);
          
          floatingButtons.forEach(button => {
            (button as HTMLElement).style.bottom = `${buttonBottom}px`;
            (button as HTMLElement).style.transition = 'bottom 0.3s ease';
          });
        } else {
          document.body.classList.remove('keyboard-open');
          // Reset buttons to normal position
          document.documentElement.style.setProperty('--floating-button-bottom', '24px');
          
          floatingButtons.forEach(button => {
            (button as HTMLElement).style.bottom = '24px';
            (button as HTMLElement).style.transition = 'bottom 0.3s ease';
          });
        }
        
        console.log('🎯 Keyboard state:', { isKeyboardOpen, heightDifference, currentHeight });
      }
    };

    // Simple input focus detection
    const handleInputFocus = () => {
      setTimeout(updateViewportAndButtons, 150);
    };

    // Initialize
    updateViewportAndButtons();

    // Visual Viewport API listeners (iOS Safari and modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportAndButtons);
      window.visualViewport.addEventListener('scroll', updateViewportAndButtons);
    }

    // Fallback listeners
    window.addEventListener('resize', updateViewportAndButtons);
    window.addEventListener('orientationchange', () => {
      // Reset initial height on orientation change
      setTimeout(() => {
        initialHeight = window.innerHeight;
        updateViewportAndButtons();
      }, 500);
    });

    // Input focus management
    document.addEventListener('focusin', handleInputFocus);

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportAndButtons);
        window.visualViewport.removeEventListener('scroll', updateViewportAndButtons);
      }
      window.removeEventListener('resize', updateViewportAndButtons);
      window.removeEventListener('orientationchange', updateViewportAndButtons);
      document.removeEventListener('focusin', handleInputFocus);
    };
  }, []);
};