/**
 * Intelligent preloading strategy for medical calculator components
 * Based on specialty and usage patterns
 */

import { MedicalSpecialty } from '../stores/useAppStore';

// Calculator preloading priorities based on usage analytics
const CARDIOLOGY_PRELOAD_PRIORITY = [
  'ASCVDCalculator',
  'TIMIRiskCalculator',
  'DAPTCalculator',
  'AtrialFibrillationCalculators',
  'GRACERiskCalculator'
];

const OBGYN_PRELOAD_PRIORITY = [
  'EDDCalculator',
  'GestationalAgeCalculator',
  'BishopScoreCalculator',
  'ApgarScoreCalculator',
  'PreeclampsiaRiskCalculator'
];

// Preload calculators based on specialty
export const preloadCalculatorsBySpecialty = async (specialty: MedicalSpecialty) => {
  const calculatorsToPreload = specialty === MedicalSpecialty.OBGYN 
    ? OBGYN_PRELOAD_PRIORITY 
    : CARDIOLOGY_PRELOAD_PRIORITY;

  // Preload top 3 calculators for immediate availability
  const preloadPromises = calculatorsToPreload.slice(0, 3).map(async (calculatorName) => {
    try {
      // Use requestIdleCallback for non-blocking preloading
      if ('requestIdleCallback' in window) {
        return new Promise<void>((resolve) => {
          window.requestIdleCallback(async () => {
            await preloadSingleCalculator(calculatorName);
            resolve();
          });
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        return setTimeout(() => preloadSingleCalculator(calculatorName), 100);
      }
    } catch (error) {

    }
  });

  return Promise.allSettled(preloadPromises);
};

// Preload individual calculator component
const preloadSingleCalculator = async (calculatorName: string) => {
  try {
    switch (calculatorName) {
      case 'ASCVDCalculator':
        await import('../components/Calculators/ASCVDCalculator');
        break;
      case 'TIMIRiskCalculator':
        await import('../components/Calculators/TIMIRiskCalculator');
        break;
      case 'DAPTCalculator':
        await import('../components/Calculators/DAPTCalculator');
        break;
      case 'AtrialFibrillationCalculators':
        await import('../components/Calculators/AtrialFibrillationCalculators');
        break;
      case 'GRACERiskCalculator':
        await import('../components/Calculators/GRACERiskCalculator');
        break;
      case 'EDDCalculator':
        await import('../components/Calculators/EDDCalculator');
        break;
      case 'GestationalAgeCalculator':
        await import('../components/Calculators/GestationalAgeCalculator');
        break;
      case 'BishopScoreCalculator':
        await import('../components/Calculators/BishopScoreCalculator');
        break;
      case 'ApgarScoreCalculator':
        await import('../components/Calculators/ApgarScoreCalculator');
        break;
      case 'PreeclampsiaRiskCalculator':
        await import('../components/Calculators/PreeclampsiaRiskCalculator');
        break;
      default:

    }
  } catch (error) {

  }
};

// Preload calculators on user hover (optimistic loading)
export const preloadCalculatorOnHover = (calculatorId: string) => {
  // Debounce to prevent excessive preloading
  let timeoutId: number;
  
  return {
    onMouseEnter: () => {
      timeoutId = window.setTimeout(() => {
        preloadSingleCalculator(calculatorId);
      }, 100); // 100ms delay to ensure intentional hover
    },
    onMouseLeave: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };
};

// Network-aware preloading
export const isSlowConnection = (): boolean => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType === 'slow-2g' || 
           connection?.effectiveType === '2g' ||
           connection?.saveData === true;
  }
  return false;
};

// Smart preloading based on network conditions
export const smartPreloadCalculators = async (specialty: MedicalSpecialty) => {
  if (isSlowConnection()) {
    // On slow connections, only preload the most critical calculator
    const topCalculator = specialty === MedicalSpecialty.OBGYN 
      ? 'EDDCalculator' 
      : 'ASCVDCalculator';
    
    await preloadSingleCalculator(topCalculator);
  } else {
    // On fast connections, preload top calculators
    await preloadCalculatorsBySpecialty(specialty);
  }
};