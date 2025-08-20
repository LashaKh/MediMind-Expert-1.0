import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { logger } from '../lib/logger';

// Define the supported medical specialties
export enum MedicalSpecialty {
  CARDIOLOGY = 'cardiology',
  OBGYN = 'obstetrics_gynecology',
}

// Specialty context type definition
interface SpecialtyContextType {
  specialty: MedicalSpecialty | null;
  isLoading: boolean;
  error: Error | null;
  isSpecialtyVerified: boolean;
  clearSpecialty: () => void;
  refreshSpecialty: () => Promise<void>;
  setSpecialty: (specialty: MedicalSpecialty) => void;
}

// Create the context
const SpecialtyContext = createContext<SpecialtyContextType | undefined>(undefined);

// Storage keys for persistence
const STORAGE_KEYS = {
  SPECIALTY: 'medimind_user_specialty',
  VERIFIED: 'medimind_specialty_verified',
} as const;

interface SpecialtyProviderProps {
  children: ReactNode;
}

export const SpecialtyProvider: React.FC<SpecialtyProviderProps> = ({ children }) => {
  const { profile, user, isLoading: authLoading } = useAuth();
  const [specialty, setSpecialtyState] = useState<MedicalSpecialty | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSpecialtyVerified, setIsSpecialtyVerified] = useState<boolean>(false);

  // Load specialty from storage on mount
  useEffect(() => {
    try {
      const storedSpecialty = localStorage.getItem(STORAGE_KEYS.SPECIALTY);
      const storedVerified = localStorage.getItem(STORAGE_KEYS.VERIFIED);
      
      if (storedSpecialty && Object.values(MedicalSpecialty).includes(storedSpecialty as MedicalSpecialty)) {
        setSpecialtyState(storedSpecialty as MedicalSpecialty);
        setIsSpecialtyVerified(storedVerified === 'true');
      }
    } catch (e) {
      logger.warn('Failed to load specialty from storage', e, { component: 'SpecialtyContext', action: 'loadFromStorage' });
    }
  }, []);

  // Update specialty when profile changes
  useEffect(() => {
    if (!authLoading && profile) {
      updateSpecialtyFromProfile(profile.medical_specialty);
    } else if (!authLoading && !user) {
      // Clear specialty when user logs out
      clearSpecialty();
    }
  }, [profile, user, authLoading]);

  // Update specialty from profile data
  const updateSpecialtyFromProfile = (medicalSpecialty: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!medicalSpecialty) {
        setError(new Error('No medical specialty found in user profile'));
        setSpecialtyState(null);
        setIsSpecialtyVerified(false);
        return;
      }

      // Validate that the specialty is supported
      const normalizedSpecialty = medicalSpecialty.toLowerCase().replace(/[^a-z]/g, '_');
      let mappedSpecialty: MedicalSpecialty | null = null;

      switch (normalizedSpecialty) {
        case 'cardiology':
          mappedSpecialty = MedicalSpecialty.CARDIOLOGY;
          break;
        case 'obstetrics_gynecology':
        case 'obgyn':
        case 'ob_gyn':
          mappedSpecialty = MedicalSpecialty.OBGYN;
          break;
        default:
          setError(new Error(`Unsupported medical specialty: ${medicalSpecialty}`));
          setSpecialtyState(null);
          setIsSpecialtyVerified(false);
          return;
      }

      setSpecialtyState(mappedSpecialty);
      setIsSpecialtyVerified(true);

      // Persist to storage
      localStorage.setItem(STORAGE_KEYS.SPECIALTY, mappedSpecialty);
      localStorage.setItem(STORAGE_KEYS.VERIFIED, 'true');

    } catch (e: unknown) {
      logger.error('Error updating specialty from profile', e, { component: 'SpecialtyContext', action: 'updateFromProfile' });
      setError(e instanceof Error ? e : new Error('Error updating specialty from profile'));
      setSpecialtyState(null);
      setIsSpecialtyVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized clear specialty function
  const clearSpecialty = useCallback(() => {
    setSpecialtyState(null);
    setIsSpecialtyVerified(false);
    setError(null);
    setIsLoading(false);

    // Clear from storage
    try {
      localStorage.removeItem(STORAGE_KEYS.SPECIALTY);
      localStorage.removeItem(STORAGE_KEYS.VERIFIED);
    } catch (e) {
      logger.warn('Failed to clear specialty from storage', e, { component: 'SpecialtyContext', action: 'clearSpecialty' });
    }
  }, []);

  // Memoized refresh specialty function
  const refreshSpecialty = useCallback(async (): Promise<void> => {
    if (profile) {
      updateSpecialtyFromProfile(profile.medical_specialty);
    }
  }, [profile]);

  // Memoized set specialty function
  const setSpecialty = useCallback((newSpecialty: MedicalSpecialty) => {
    setSpecialtyState(newSpecialty);
    setIsSpecialtyVerified(true);
    setError(null);

    // Persist to storage
    try {
      localStorage.setItem(STORAGE_KEYS.SPECIALTY, newSpecialty);
      localStorage.setItem(STORAGE_KEYS.VERIFIED, 'true');
    } catch (e) {
      logger.warn('Failed to persist specialty to storage', e, { component: 'SpecialtyContext', action: 'persistToStorage' });
    }
  }, []);

  // Set initial loading state based on auth loading
  useEffect(() => {
    if (!authLoading && !profile && !user) {
      setIsLoading(false);
    }
  }, [authLoading, profile, user]);

  // Memoized context value to prevent unnecessary re-renders
  const value: SpecialtyContextType = useMemo(() => ({
    specialty,
    isLoading: isLoading || authLoading,
    error,
    isSpecialtyVerified,
    clearSpecialty,
    refreshSpecialty,
    setSpecialty,
  }), [specialty, isLoading, authLoading, error, isSpecialtyVerified, clearSpecialty, refreshSpecialty, setSpecialty]);

  return (
    <SpecialtyContext.Provider value={value}>
      {children}
    </SpecialtyContext.Provider>
  );
};

// Custom hook for using the specialty context
export const useSpecialty = (): SpecialtyContextType => {
  const context = useContext(SpecialtyContext);
  if (context === undefined) {
    throw new Error('useSpecialty must be used within a SpecialtyProvider');
  }
  return context;
};

// Helper functions
export const getSpecialtyDisplayName = (specialty: MedicalSpecialty | null): string => {
  switch (specialty) {
    case MedicalSpecialty.CARDIOLOGY:
      return 'Cardiology';
    case MedicalSpecialty.OBGYN:
      return 'Obstetrics & Gynecology';
    default:
      return 'Unknown Specialty';
  }
};

export const getSpecialtyRoute = (specialty: MedicalSpecialty | null): string => {
  switch (specialty) {
    case MedicalSpecialty.CARDIOLOGY:
      return '/workspace/cardiology';
    case MedicalSpecialty.OBGYN:
      return '/workspace/obgyn';
    default:
      return '/';
  }
}; 