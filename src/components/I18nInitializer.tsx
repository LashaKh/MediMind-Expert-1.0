import React, { useEffect, useState } from 'react';
import { getI18n } from '../i18n/i18n';
import { safeAsync, ErrorSeverity } from '../lib/utils/errorHandling';

interface I18nInitializerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that ensures i18n is properly initialized before rendering children
 * Shows a loading state while translations are being loaded
 */
export const I18nInitializer: React.FC<I18nInitializerProps> = ({ 
  children, 
  fallback 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeI18n = async () => {
      const [_, initError] = await safeAsync(
        () => getI18n(),
        { 
          context: 'initialize i18n translation system',
          severity: ErrorSeverity.HIGH,
          showToast: true
        }
      );

      if (initError) {
        setError(initError.userMessage);
      } else {
        setIsInitialized(true);
      }
    };

    initializeI18n();
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Translation System Error
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load translations: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  // Show loading state or custom fallback
  if (!isInitialized) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            MediMind Expert
          </h2>
          <p className="text-gray-600">
            Loading translations...
          </p>
        </div>
      </div>
    );
  }

  // Render children when initialized
  return <>{children}</>;
}; 