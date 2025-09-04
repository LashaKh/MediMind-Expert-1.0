import React, { useEffect, useState } from 'react';
import { useAuth } from '../../stores/useAppStore';
import { debugUserAccess, forceUserSessionRefresh, testRLSEnforcement, forceReloadCases, clearLocalStorageAndReload, inspectLocalStorage, nuclearReset } from '../../lib/api/debugUserAccess';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { isLoading: authLoading, user, refreshProfile } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize app when auth finishes loading
    if (!authLoading) {
      const initializeApp = async () => {
        if (user) {
          // Refresh profile and specialty for authenticated users
          await refreshProfile();
        }
        
        // Add a small delay to ensure all state updates have propagated
        setTimeout(() => {
          setIsInitialized(true);
        }, 100);
      };
      
      initializeApp();
    }
  }, [authLoading, user, refreshProfile]);

  // Add debug functions to window for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).debugUserAccess = debugUserAccess;
      (window as any).forceUserSessionRefresh = forceUserSessionRefresh;
      (window as any).testRLSEnforcement = testRLSEnforcement;
      (window as any).forceReloadCases = forceReloadCases;
      (window as any).clearLocalStorageAndReload = clearLocalStorageAndReload;
      (window as any).inspectLocalStorage = inspectLocalStorage;
      (window as any).nuclearReset = nuclearReset;
      console.log('🔧 Debug functions available: debugUserAccess(), forceUserSessionRefresh(), testRLSEnforcement(), forceReloadCases(), clearLocalStorageAndReload(), inspectLocalStorage(), nuclearReset()');
    }
  }, []);

  // Show loading screen until everything is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing MediMind...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};