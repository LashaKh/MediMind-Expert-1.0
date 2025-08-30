/**
 * Real-time Analytics Hook
 * Provides real-time updates for analytics dashboards using Supabase subscriptions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../stores/useAppStore';

interface RealtimeConfig {
  table: string;
  filter?: string;
  refreshInterval?: number;
  enableSubscription?: boolean;
}

interface AnalyticsData {
  engagement: any[];
  userBehavior: any[];
  systemHealth: any[];
  lastUpdated: Date;
}

export const useRealtimeAnalytics = (
  config: RealtimeConfig,
  dependencies: any[] = []
) => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    engagement: [],
    userBehavior: [],
    systemHealth: [],
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch engagement data
      let engagementQuery = supabase
        .from('news_user_interactions')
        .select(`
          *,
          medical_news (
            id,
            title,
            category,
            specialty,
            engagement_score,
            published_date
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (config.filter) {
        engagementQuery = engagementQuery.filter('specialty', 'eq', config.filter);
      }

      const { data: engagementData, error: engagementError } = await engagementQuery;
      
      if (engagementError) {
        throw new Error(`Failed to fetch engagement data: ${engagementError.message}`);
      }

      // Fetch user behavior data
      const { data: userBehaviorData, error: behaviorError } = await supabase
        .from('performance_sessions')
        .select(`
          *,
          performance_page_load_metrics (*),
          performance_api_metrics (*),
          performance_web_vitals (*)
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (behaviorError) {

      }

      // Fetch system health data
      const { data: healthData, error: healthError } = await supabase
        .from('performance_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (healthError) {

      }

      setData({
        engagement: engagementData || [],
        userBehavior: userBehaviorData || [],
        systemHealth: healthData || [],
        lastUpdated: new Date()
      });

      setConnected(true);
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [config.filter]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: any) => {

    setData(prevData => {
      const newData = { ...prevData };
      
      switch (payload.table) {
        case 'news_user_interactions':
          if (payload.eventType === 'INSERT') {
            newData.engagement = [payload.new, ...prevData.engagement.slice(0, 99)];
          } else if (payload.eventType === 'UPDATE') {
            newData.engagement = prevData.engagement.map(item => 
              item.id === payload.new.id ? payload.new : item
            );
          }
          break;
          
        case 'performance_sessions':
          if (payload.eventType === 'INSERT') {
            newData.userBehavior = [payload.new, ...prevData.userBehavior.slice(0, 49)];
          }
          break;
          
        case 'medical_news':
          // Update engagement data when news articles are updated
          if (payload.eventType === 'UPDATE') {
            newData.engagement = prevData.engagement.map(interaction => 
              interaction.medical_news?.id === payload.new.id 
                ? { ...interaction, medical_news: payload.new }
                : interaction
            );
          }
          break;
      }
      
      newData.lastUpdated = new Date();
      return newData;
    });
  }, []);

  // Setup real-time subscription with consolidated channel and throttling
  useEffect(() => {
    if (!config.enableSubscription || !user) return;

    let updateBuffer: any[] = [];
    let throttleTimeout: NodeJS.Timeout | null = null;
    let isVisible = !document.hidden; // Track visibility state
    const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Network-aware subscription control for mobile
    const isSlowConnection = isMobile && (
      (navigator as any)?.connection?.effectiveType === 'slow-2g' ||
      (navigator as any)?.connection?.effectiveType === '2g' ||
      (navigator as any)?.connection?.effectiveType === '3g'
    );

    // Enhanced visibility changes with mobile optimization
    const handleVisibilityChange = () => {
      const wasVisible = isVisible;
      isVisible = !document.hidden;
      
      if (!isVisible && subscriptionRef.current) {
        // Pause subscriptions when not visible
        console.log('Pausing analytics subscriptions (tab hidden)');
        
        // On mobile, also clear the update buffer to save memory
        if (isMobile) {
          updateBuffer = [];
          if (throttleTimeout) {
            clearTimeout(throttleTimeout);
            throttleTimeout = null;
          }
        }
      } else if (isVisible && subscriptionRef.current && !wasVisible) {
        // Resume with mobile-aware refresh strategy
        console.log('Resuming analytics subscriptions (tab visible)');
        
        // On mobile with slow connection, use longer delay before refresh
        const refreshDelay = (isMobile && isSlowConnection) ? 2000 : 500;
        setTimeout(() => {
          fetchInitialData(); // Refresh data to catch up
        }, refreshDelay);
      }
    };

    // Throttled update handler to batch multiple updates
    const processBufferedUpdates = () => {
      if (updateBuffer.length === 0) return;

      const updates = [...updateBuffer];
      updateBuffer = [];

      setData(prevData => {
        let newData = { ...prevData };
        
        // Process all buffered updates
        updates.forEach(payload => {
          switch (payload.table) {
            case 'news_user_interactions':
              if (payload.eventType === 'INSERT') {
                newData.engagement = [payload.new, ...newData.engagement.slice(0, 99)];
              } else if (payload.eventType === 'UPDATE') {
                newData.engagement = newData.engagement.map(item => 
                  item.id === payload.new.id ? payload.new : item
                );
              }
              break;
              
            case 'performance_sessions':
              if (payload.eventType === 'INSERT') {
                newData.userBehavior = [payload.new, ...newData.userBehavior.slice(0, 49)];
              }
              break;
              
            case 'medical_news':
              if (payload.eventType === 'UPDATE') {
                newData.engagement = newData.engagement.map(interaction => 
                  interaction.medical_news?.id === payload.new.id 
                    ? { ...interaction, medical_news: payload.new }
                    : interaction
                );
              }
              break;
          }
        });
        
        newData.lastUpdated = new Date();
        return newData;
      });

    };

    // Enhanced real-time handler with mobile-aware throttling
    const handleThrottledRealtimeUpdate = (payload: any) => {
      // Skip updates if tab is not visible to save resources
      if (!isVisible) return;
      
      // On mobile with slow connection, limit update frequency further
      if (isMobile && isSlowConnection && updateBuffer.length > 5) {
        // Drop older updates to prevent buffer overflow on slow connections
        updateBuffer = updateBuffer.slice(-3);
      }

      // Add to buffer instead of immediate processing
      updateBuffer.push(payload);
      
      // Adaptive throttling based on device and connection
      let throttleDelay = 3000; // Default desktop
      if (isMobile) {
        throttleDelay = isSlowConnection ? 20000 : 15000; // 20s on slow connections, 15s on normal mobile
      }
      
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      
      throttleTimeout = setTimeout(processBufferedUpdates, throttleDelay);
    };

    const setupSubscription = async () => {
      try {
        // Single consolidated channel for all analytics subscriptions
        const analyticsChannel = supabase
          .channel('analytics-master')
          // News interactions subscription
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'news_user_interactions'
            },
            handleThrottledRealtimeUpdate
          )
          // Performance sessions subscription  
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'performance_sessions'
            },
            handleThrottledRealtimeUpdate
          )
          // Medical news updates subscription
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'medical_news'
            },
            handleThrottledRealtimeUpdate
          );

        await analyticsChannel.subscribe();

        subscriptionRef.current = {
          master: analyticsChannel
        };

        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        console.log('Consolidated analytics subscription established (3→1 channels)');
        setConnected(true);
        
      } catch (err) {

        setConnected(false);
      }
    };

    setupSubscription();

    return () => {
      // Cleanup throttle timeout
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      
      // Process any remaining buffered updates before cleanup
      if (updateBuffer.length > 0) {
        processBufferedUpdates();
      }

      // Remove visibility listener
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup subscription
      if (subscriptionRef.current?.master) {
        supabase.removeChannel(subscriptionRef.current.master);
        subscriptionRef.current = null;
      }
    };
  }, [user, config.enableSubscription, handleRealtimeUpdate, fetchInitialData]);

  // Setup periodic refresh fallback
  useEffect(() => {
    if (!config.refreshInterval) return;

    const interval = setInterval(fetchInitialData, config.refreshInterval);
    intervalRef.current = interval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchInitialData, config.refreshInterval]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData, ...dependencies]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    return fetchInitialData();
  }, [fetchInitialData]);

  // Connection status check for consolidated subscription
  const checkConnection = useCallback(() => {
    if (subscriptionRef.current?.master) {
      const masterChannel = subscriptionRef.current.master;
      setConnected(masterChannel.state === 'joined');
    } else {
      setConnected(false);
    }
  }, []);

  // Periodic connection check
  useEffect(() => {
    if (config.enableSubscription) {
      const connectionCheckInterval = setInterval(checkConnection, 10000); // Check every 10 seconds
      return () => clearInterval(connectionCheckInterval);
    }
  }, [config.enableSubscription, checkConnection]);

  return {
    data,
    loading,
    error,
    connected,
    refresh,
    lastUpdated: data.lastUpdated,
    
    // Analytics-specific data accessors
    engagement: data.engagement,
    userBehavior: data.userBehavior,
    systemHealth: data.systemHealth,
    
    // Real-time status
    isRealtime: config.enableSubscription && connected,
    subscriptionCount: subscriptionRef.current?.master ? 1 : 0
  };
};

// Hook specifically for engagement analytics
export const useEngagementAnalytics = (specialty?: string, timeRange: string = '7d') => {
  return useRealtimeAnalytics({
    table: 'news_user_interactions',
    filter: specialty,
    refreshInterval: 60000, // 1 minute
    enableSubscription: true
  }, [specialty, timeRange]);
};

// Hook specifically for user behavior analytics
export const useUserBehaviorAnalytics = (specialty?: string) => {
  return useRealtimeAnalytics({
    table: 'performance_sessions',
    filter: specialty,
    refreshInterval: 120000, // 2 minutes
    enableSubscription: true
  }, [specialty]);
};

// Hook specifically for system health monitoring
export const useSystemHealthMonitoring = () => {
  return useRealtimeAnalytics({
    table: 'performance_analytics',
    refreshInterval: 30000, // 30 seconds
    enableSubscription: false // System health doesn't need real-time subscriptions
  });
};