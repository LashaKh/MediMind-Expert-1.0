/**
 * Feature Flag Context and Provider
 * Enables A/B testing and feature toggling for medical content
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from '../stores/useAppStore';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  specialty?: string;
  userSegment?: 'all' | 'medical_professional' | 'admin' | 'new_users' | 'returning_users';
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, any>;
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100, percentage of users who see this variant
  config: Record<string, any>;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  feature: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  startDate?: string;
  endDate?: string;
  specialty?: string;
  userSegment?: string;
  successMetric: string;
  minimumSampleSize: number;
  confidenceLevel: number;
}

interface FeatureFlagContextType {
  // Feature flags
  flags: Record<string, FeatureFlag>;
  isFeatureEnabled: (flagName: string) => boolean;
  getFeatureConfig: (flagName: string) => any;
  
  // A/B testing
  abTests: Record<string, ABTest>;
  getTestVariant: (testName: string) => ABTestVariant | null;
  isInTestGroup: (testName: string, variantName: string) => boolean;
  trackTestEvent: (testName: string, eventType: string, metadata?: any) => void;
  
  // User context
  userSegment: string;
  userHash: string;
  
  // Loading state
  loading: boolean;
  error: string | null;
  
  // Admin functions
  refreshFlags: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({});
  const [abTests, setAbTests] = useState<Record<string, ABTest>>({});
  const [userSegment, setUserSegment] = useState<string>('all');
  const [userHash, setUserHash] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate consistent user hash for A/B testing
  const generateUserHash = (userId: string): string => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  };

  // Determine user segment
  const determineUserSegment = (): string => {
    if (!user) return 'anonymous';
    
    if (user.medical_specialty === 'admin') return 'admin';
    if (user.medical_specialty) return 'medical_professional';
    
    // Check if new or returning user based on account creation
    const accountAge = user.created_at ? 
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24) : 0;
    
    return accountAge < 7 ? 'new_users' : 'returning_users';
  };

  // Check if user should see a feature based on rollout percentage
  const shouldShowFeature = (flag: FeatureFlag): boolean => {
    if (!flag.enabled) return false;
    
    // Check user segment eligibility
    if (flag.userSegment && flag.userSegment !== 'all' && flag.userSegment !== userSegment) {
      return false;
    }
    
    // Check specialty eligibility
    if (flag.specialty && user?.medical_specialty !== flag.specialty) {
      return false;
    }
    
    // Check date range
    const now = new Date();
    if (flag.startDate && new Date(flag.startDate) > now) return false;
    if (flag.endDate && new Date(flag.endDate) < now) return false;
    
    // Check rollout percentage using consistent user hash
    const hashNum = parseInt(userHash) % 100;
    return hashNum < flag.rolloutPercentage;
  };

  // Get A/B test variant for user
  const getVariantForUser = (test: ABTest): ABTestVariant | null => {
    if (test.status !== 'running') return null;
    
    // Check user segment eligibility
    if (test.userSegment && test.userSegment !== 'all' && test.userSegment !== userSegment) {
      return null;
    }
    
    // Check specialty eligibility
    if (test.specialty && user?.medical_specialty !== test.specialty) {
      return null;
    }
    
    // Consistent variant assignment based on user hash
    const hashNum = parseInt(userHash) % 100;
    let cumulativeWeight = 0;
    
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (hashNum < cumulativeWeight) {
        return variant;
      }
    }
    
    return null;
  };

  // Fetch feature flags and A/B tests
  const fetchFeatureFlags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - replace with actual API calls to Supabase
      const mockFlags: Record<string, FeatureFlag> = {
        'enhanced_news_layout': {
          id: 'enhanced_news_layout',
          name: 'Enhanced News Layout',
          description: 'New card-based layout for medical news',
          enabled: true,
          rolloutPercentage: 50,
          specialty: undefined,
          userSegment: 'all',
          metadata: {
            layoutVersion: 'v2',
            cardStyle: 'elevated'
          }
        },
        'ai_content_recommendations': {
          id: 'ai_content_recommendations',
          name: 'AI Content Recommendations',
          description: 'AI-powered content recommendations in news feed',
          enabled: true,
          rolloutPercentage: 75,
          specialty: 'cardiology',
          userSegment: 'medical_professional',
          metadata: {
            modelVersion: 'v1.2',
            recommendationEngine: 'collaborative'
          }
        },
        'advanced_search_filters': {
          id: 'advanced_search_filters',
          name: 'Advanced Search Filters',
          description: 'Additional filtering options for medical search',
          enabled: true,
          rolloutPercentage: 100,
          userSegment: 'medical_professional',
          metadata: {
            filterTypes: ['evidence_level', 'publication_date', 'study_type']
          }
        }
      };

      const mockAbTests: Record<string, ABTest> = {
        'news_card_design': {
          id: 'news_card_design',
          name: 'News Card Design Test',
          description: 'Testing different news card layouts for engagement',
          feature: 'news_layout',
          status: 'running',
          specialty: undefined,
          userSegment: 'all',
          successMetric: 'click_through_rate',
          minimumSampleSize: 1000,
          confidenceLevel: 95,
          variants: [
            {
              id: 'control',
              name: 'Control (Current)',
              description: 'Current news card layout',
              weight: 50,
              config: { layout: 'current', showImages: true }
            },
            {
              id: 'enhanced',
              name: 'Enhanced Layout',
              description: 'New enhanced card layout with better visual hierarchy',
              weight: 50,
              config: { layout: 'enhanced', showImages: true, showEngagement: true }
            }
          ]
        },
        'content_recommendation_algorithm': {
          id: 'content_recommendation_algorithm',
          name: 'Content Recommendation Algorithm',
          description: 'Testing different recommendation algorithms',
          feature: 'recommendations',
          status: 'running',
          specialty: 'cardiology',
          userSegment: 'medical_professional',
          successMetric: 'engagement_rate',
          minimumSampleSize: 500,
          confidenceLevel: 90,
          variants: [
            {
              id: 'collaborative',
              name: 'Collaborative Filtering',
              description: 'Recommendations based on similar users',
              weight: 40,
              config: { algorithm: 'collaborative', weights: { user_similarity: 0.7, content_similarity: 0.3 } }
            },
            {
              id: 'content_based',
              name: 'Content-Based Filtering',
              description: 'Recommendations based on content similarity',
              weight: 40,
              config: { algorithm: 'content_based', weights: { specialty_match: 0.8, keyword_match: 0.2 } }
            },
            {
              id: 'hybrid',
              name: 'Hybrid Approach',
              description: 'Combination of collaborative and content-based',
              weight: 20,
              config: { 
                algorithm: 'hybrid', 
                weights: { 
                  collaborative: 0.6, 
                  content_based: 0.4,
                  specialty_boost: 0.1
                } 
              }
            }
          ]
        }
      };

      setFlags(mockFlags);
      setAbTests(mockAbTests);

    } catch (err) {
      console.error('Failed to fetch feature flags:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize user context and fetch flags
  useEffect(() => {
    if (user) {
      const hash = generateUserHash(user.id);
      const segment = determineUserSegment();
      
      setUserHash(hash);
      setUserSegment(segment);
    }
    
    fetchFeatureFlags();
  }, [user]);

  // Memoized feature flag functions to prevent unnecessary re-renders
  const isFeatureEnabled = useCallback((flagName: string): boolean => {
    const flag = flags[flagName];
    if (!flag) return false;
    return shouldShowFeature(flag);
  }, [flags, userSegment, userHash, user]);

  const getFeatureConfig = useCallback((flagName: string): any => {
    const flag = flags[flagName];
    if (!flag || !shouldShowFeature(flag)) return null;
    return flag.metadata || {};
  }, [flags, userSegment, userHash, user]);

  // Memoized A/B testing functions
  const getTestVariant = useCallback((testName: string): ABTestVariant | null => {
    const test = abTests[testName];
    if (!test) return null;
    return getVariantForUser(test);
  }, [abTests, userSegment, userHash, user]);

  const isInTestGroup = useCallback((testName: string, variantName: string): boolean => {
    const variant = getTestVariant(testName);
    return variant?.name === variantName;
  }, [getTestVariant]);

  const trackTestEvent = useCallback(async (testName: string, eventType: string, metadata?: any) => {
    const variant = getTestVariant(testName);
    if (!variant || !user) return;

    try {
      // Track A/B test event - replace with actual API call
      const eventData = {
        testId: testName,
        variantId: variant.id,
        userId: user.id,
        eventType,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userSegment,
          specialty: user.medical_specialty
        }
      };

      console.log('A/B Test Event:', eventData);
      
      // In production, send to analytics API
      // await fetch('/.netlify/functions/ab-test-tracking', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${user.session?.access_token}`
      //   },
      //   body: JSON.stringify(eventData)
      // });

    } catch (err) {
      console.error('Failed to track A/B test event:', err);
    }
  }, [getTestVariant, user, userSegment]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue: FeatureFlagContextType = useMemo(() => ({
    flags,
    isFeatureEnabled,
    getFeatureConfig,
    abTests,
    getTestVariant,
    isInTestGroup,
    trackTestEvent,
    userSegment,
    userHash,
    loading,
    error,
    refreshFlags: fetchFeatureFlags
  }), [
    flags,
    isFeatureEnabled,
    getFeatureConfig,
    abTests,
    getTestVariant,
    isInTestGroup,
    trackTestEvent,
    userSegment,
    userHash,
    loading,
    error,
    fetchFeatureFlags
  ]);

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Hook for using feature flags
export const useFeatureFlag = () => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }
  return context;
};

// Hook for A/B testing
export const useABTest = (testName: string) => {
  const { getTestVariant, isInTestGroup, trackTestEvent } = useFeatureFlag();
  
  const variant = getTestVariant(testName);
  const config = variant?.config || {};
  
  const track = (eventType: string, metadata?: any) => {
    trackTestEvent(testName, eventType, metadata);
  };
  
  return {
    variant,
    config,
    isInVariant: (variantName: string) => isInTestGroup(testName, variantName),
    track
  };
};

// HOC for feature flag protection
export const withFeatureFlag = <P extends object>(
  Component: React.ComponentType<P>,
  flagName: string,
  fallback?: React.ComponentType<P>
) => {
  return (props: P) => {
    const { isFeatureEnabled } = useFeatureFlag();
    
    if (isFeatureEnabled(flagName)) {
      return <Component {...props} />;
    }
    
    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent {...props} />;
    }
    
    return null;
  };
};

export default FeatureFlagProvider;