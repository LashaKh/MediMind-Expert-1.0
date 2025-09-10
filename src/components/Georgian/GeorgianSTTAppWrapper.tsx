import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useGeorgianTTS } from '../../hooks/useGeorgianTTS';
import { GeorgianSTTApp } from './GeorgianSTTApp';

/**
 * Wrapper component that checks browser support before rendering the main app
 * This prevents hook order issues by doing the support check separately
 */
export const GeorgianSTTAppWrapper: React.FC = () => {
  // Only check browser support here
  const { isSupported } = useGeorgianTTS({
    language: 'ka-GE',
    autocorrect: true,
    punctuation: true,
    digits: true,
    maxDuration: 0, // No limit - use chunked processing
    chunkDuration: 12000 // 12 second chunks for processing
  });

  // Handle browser support check
  if (!isSupported) {
    return (
      <div className="min-h-screen theme-surface p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto theme-card rounded-2xl shadow-xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--foreground)] dark:text-[var(--foreground)] mb-2">
            Browser Not Supported
          </h1>
          <p className="text-[var(--foreground-tertiary)] dark:text-[var(--foreground-secondary)] mb-4">
            Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  // If supported, render the main app
  return <GeorgianSTTApp />;
};