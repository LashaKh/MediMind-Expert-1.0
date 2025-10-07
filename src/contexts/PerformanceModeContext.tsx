import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  DeviceCapabilities,
  PerformanceMode,
  initializeDeviceCapabilities,
  saveDeviceCapabilities
} from '../utils/deviceCapabilities';

interface PerformanceModeContextType {
  capabilities: DeviceCapabilities | null;
  performanceMode: PerformanceMode;
  setPerformanceMode: (mode: PerformanceMode) => void;
  isLoading: boolean;
}

const PerformanceModeContext = createContext<PerformanceModeContextType | undefined>(
  undefined
);

export interface PerformanceModeProviderProps {
  children: ReactNode;
}

export const PerformanceModeProvider: React.FC<PerformanceModeProviderProps> = ({
  children
}) => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [performanceMode, setPerformanceModeState] = useState<PerformanceMode>('balanced');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize device capabilities on mount
    const initCapabilities = () => {
      try {
        const caps = initializeDeviceCapabilities();
        setCapabilities(caps);
        setPerformanceModeState(caps.performanceMode);

        // Apply performance mode class to document element
        document.documentElement.classList.remove('perf-full', 'perf-balanced', 'perf-lite');
        document.documentElement.classList.add(`perf-${caps.performanceMode}`);

        // Apply GPU fallback class if needed
        if (caps.gpuTier === 'low' || caps.prefersReducedMotion) {
          document.documentElement.classList.add('gpu-fallback');
        }

        setIsLoading(false);
      } catch (error) {
        // Fallback to balanced mode
        setPerformanceModeState('balanced');
        document.documentElement.classList.add('perf-balanced');
        setIsLoading(false);
      }
    };

    initCapabilities();
  }, []);

  const setPerformanceMode = (mode: PerformanceMode) => {
    setPerformanceModeState(mode);

    // Update document class
    document.documentElement.classList.remove('perf-full', 'perf-balanced', 'perf-lite');
    document.documentElement.classList.add(`perf-${mode}`);

    // Update localStorage
    localStorage.setItem('performanceMode', mode);

    // Update capabilities if available
    if (capabilities) {
      const updatedCapabilities: DeviceCapabilities = {
        ...capabilities,
        performanceMode: mode
      };
      setCapabilities(updatedCapabilities);
      saveDeviceCapabilities(updatedCapabilities);
    }
  };

  const value: PerformanceModeContextType = {
    capabilities,
    performanceMode,
    setPerformanceMode,
    isLoading
  };

  return (
    <PerformanceModeContext.Provider value={value}>
      {children}
    </PerformanceModeContext.Provider>
  );
};

/**
 * Hook to access performance mode context
 */
export const usePerformanceMode = (): PerformanceModeContextType => {
  const context = useContext(PerformanceModeContext);
  if (context === undefined) {
    throw new Error('usePerformanceMode must be used within a PerformanceModeProvider');
  }
  return context;
};

/**
 * Hook to check if a specific feature should be enabled based on performance mode
 */
export const useFeatureEnabled = (feature: keyof FeatureMatrix): boolean => {
  const { performanceMode } = usePerformanceMode();
  return FEATURE_ENABLEMENT[feature][performanceMode];
};

// Feature enablement matrix
interface FeatureMatrix {
  animations: boolean;
  realTimeUpdates: boolean;
  highQualityImages: boolean;
  backgroundProcesses: boolean;
  complexTransitions: boolean;
}

const FEATURE_ENABLEMENT: Record<keyof FeatureMatrix, Record<PerformanceMode, boolean>> = {
  animations: {
    lite: false,
    balanced: true,
    full: true
  },
  realTimeUpdates: {
    lite: false,
    balanced: true,
    full: true
  },
  highQualityImages: {
    lite: false,
    balanced: true,
    full: true
  },
  backgroundProcesses: {
    lite: false,
    balanced: true,
    full: true
  },
  complexTransitions: {
    lite: false,
    balanced: false,
    full: true
  }
};
