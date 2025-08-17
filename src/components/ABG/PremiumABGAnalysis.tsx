// This component has been refactored for better maintainability
// Import the new clean version
import { PremiumABGAnalysisClean } from './PremiumABGAnalysisClean';
import React from 'react';
import { ABGType } from '../../types/abg';

interface PremiumABGAnalysisProps {
  onComplete?: (resultId: string) => void;
  initialType?: ABGType;
  className?: string;
}

/**
 * This component has been refactored for better maintainability.
 * The new implementation uses custom hooks, extracted components,
 * and service modules to reduce complexity while preserving all functionality.
 */
export const PremiumABGAnalysis: React.FC<PremiumABGAnalysisProps> = (props) => {
  return <PremiumABGAnalysisClean {...props} />;
};