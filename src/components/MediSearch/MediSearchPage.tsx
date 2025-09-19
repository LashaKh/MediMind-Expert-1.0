/**
 * MediSearchPage - Main container component for medical literature search
 * Integrates with MainLayout and provides state management for search sessions
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../Layout/PageContainer';
import MediSearch from './MediSearch';
import { SearchContextProvider } from './contexts/SearchContextProvider';
import { useSpecialty } from '../../stores/useAppStore';
import type { SearchQuery } from '@/utils/search/apiOrchestration';

interface MediSearchPageProps {
  className?: string;
}

export const MediSearchPage: React.FC<MediSearchPageProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { specialty } = useSpecialty();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialQuery, setInitialQuery] = useState<SearchQuery | null>(null);
  
  // Track the current URL params to prevent redundant updates
  const currentParamsRef = useRef<string>('');

  // Extract search parameters from URL on component mount
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlSpecialty = searchParams.get('specialty');
    const urlEvidenceLevel = searchParams.get('evidence');
    const urlContentType = searchParams.get('type');
    const urlRecency = searchParams.get('recency');
    const urlTab = searchParams.get('tab');

    // Initialize current params ref with existing URL params
    currentParamsRef.current = searchParams.toString();

    if (urlQuery || urlSpecialty || urlEvidenceLevel || urlContentType || urlRecency || urlTab) {
      const query: SearchQuery = {
        query: urlQuery || '',
        specialty: urlSpecialty || specialty?.toLowerCase(),
        evidenceLevel: urlEvidenceLevel ? urlEvidenceLevel.split(',') : undefined,
        contentType: urlContentType ? urlContentType.split(',') : undefined,
        recency: urlRecency || undefined,
        tab: urlTab || undefined,
      };

      setInitialQuery(query);
    }
  }, [searchParams, specialty]);

  // Update URL when search parameters change - memoized to prevent infinite loops
  const updateSearchParams = useCallback((query: SearchQuery) => {
    const params = new URLSearchParams();
    
    if (query.query) {
      params.set('q', query.query);
    }
    
    if (query.specialty && query.specialty !== specialty?.toLowerCase()) {
      params.set('specialty', query.specialty);
    }
    
    if (query.evidenceLevel && query.evidenceLevel.length > 0) {
      params.set('evidence', query.evidenceLevel.join(','));
    }
    
    if (query.contentType && query.contentType.length > 0) {
      params.set('type', query.contentType.join(','));
    }
    
    if (query.recency) {
      params.set('recency', query.recency);
    }
    
    if (query.tab) {
      params.set('tab', query.tab);
    }

    const newParamsString = params.toString();
    const newUrl = newParamsString ? `?${newParamsString}` : '';
    
    // Only update URL if parameters have actually changed
    if (currentParamsRef.current !== newParamsString) {
      currentParamsRef.current = newParamsString;
      navigate(`/search${newUrl}`, { replace: true });
    }
  }, [navigate, specialty]);

  return (
    <SearchContextProvider 
      initialQuery={initialQuery}
      onQueryChange={updateSearchParams}
      initialTab={searchParams.get('tab') as any}
    >
      <div className={`w-full min-h-screen bg-gray-50 ${className}`}>
        {/* Main Search Interface */}
        <div className="w-full">
          <MediSearch />
        </div>
      </div>
    </SearchContextProvider>
  );
};

export default MediSearchPage;