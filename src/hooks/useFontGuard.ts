import { useEffect } from 'react';

const INTER_FONT_FAMILY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif";

export const useFontGuard = () => {
  useEffect(() => {
    // PREMIUM DESIGN FONT PROTECTION WITH SOPHISTICATED WEIGHTS
    const enforcePremiumFonts = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (htmlElement.style) {
          htmlElement.style.fontFamily = INTER_FONT_FAMILY;
          
          // Apply sophisticated typography rules
          htmlElement.style.fontOpticalSizing = 'auto';
          htmlElement.style.fontFeatureSettings = '"cv02", "cv03", "cv04", "cv11", "ss01", "ss02"';
          htmlElement.style.fontVariantLigatures = 'contextual';
          htmlElement.style.textRendering = 'optimizeLegibility';
          htmlElement.style.webkitFontSmoothing = 'antialiased';
          (htmlElement.style as any).mozOsxFontSmoothing = 'grayscale';
          
          // Set premium default weight (no more thin fonts!)
          if (!htmlElement.style.fontWeight || htmlElement.style.fontWeight === '400' || htmlElement.style.fontWeight === 'normal') {
            htmlElement.style.fontWeight = '500';
          }
          
          // Enhance letter spacing for better readability
          if (!htmlElement.style.letterSpacing) {
            htmlElement.style.letterSpacing = '-0.005em';
          }
        }
      });
    };

    // Enforce premium fonts immediately on mount
    enforcePremiumFonts();

    // Re-enforce premium typography on every React render cycle
    const intervalId = setInterval(enforcePremiumFonts, 50);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);
};