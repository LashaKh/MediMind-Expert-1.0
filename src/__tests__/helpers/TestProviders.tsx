/**
 * Test Providers - Wrapper for components that need context providers
 */

import React from 'react';

interface TestProvidersProps {
  children: React.ReactNode;
}

export function TestProviders({ children }: TestProvidersProps) {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
}