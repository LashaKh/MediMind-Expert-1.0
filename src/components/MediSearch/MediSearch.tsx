/**
 * MediSearch Component
 * Revolutionary medical literature and clinical trials search with premium UI
 */

import React from 'react';
import MediSearchIntegrated from './MediSearchIntegrated';
import '../../styles/medisearch-revolutionary.css';

interface MediSearchProps {
  className?: string;
}

const MediSearch: React.FC<MediSearchProps> = ({ className = '' }) => {
  // Using MediSearchIntegrated which now has the revolutionary UI
  return <MediSearchIntegrated className={className} />;
};

export default MediSearch;