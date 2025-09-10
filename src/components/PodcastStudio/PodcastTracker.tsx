import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  AlertTriangle,
  Info,
  Zap,
  Terminal,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../stores/useAppStore';
import { supabase } from '../../lib/supabase';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface PodcastTracker {
  podcastId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  title: string;
  progress: number;
  currentStep: string;
  logs: LogEntry[];
  estimatedTimeRemaining?: number;
  playnoteId?: string;
  queuePosition?: number;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
}

interface PodcastTrackerProps {
  podcastId?: string;
  onComplete?: (podcast: any) => void;
}

const PodcastTracker: React.FC<PodcastTrackerProps> = ({ podcastId, onComplete }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tracker, setTracker] = useState<PodcastTracker | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout>();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (podcastId && user?.id) {
      startTracking(podcastId);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [podcastId, user?.id]);

  const addLog = (level: LogEntry['level'], message: string, details?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      details
    };

    setTracker(prev => {
      if (!prev) return null;
      const updatedLogs = [...prev.logs, newLog];
      // Keep only last 50 logs for performance
      return {
        ...prev,
        logs: updatedLogs.slice(-50)
      };
    });

    // Auto-scroll logs to bottom
    setTimeout(() => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    }, 100);
  };

  const startTracking = async (id: string) => {
    setIsTracking(true);
    
    setTracker({
      podcastId: id,
      status: 'pending',
      title: 'Initializing...',
      progress: 0,
      currentStep: 'Starting podcast generation',
      logs: []
    });

    addLog('info', '🚀 Starting podcast generation tracking');
    addLog('info', `📋 Tracking podcast ID: ${id}`);

    // Start polling for status updates
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(() => {
      checkPodcastStatus(id);
    }, 2000); // Poll every 2 seconds

    // Initial status check
    await checkPodcastStatus(id);
  };

  const checkPodcastStatus = async (id: string) => {
    addLog('info', '🔍 Checking podcast status...');

    const [statusData, error] = await safeAsync(
      async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication required');
        }

        const { data, error } = await supabase.functions.invoke('podcast-status', {
          body: { podcastId: id, userId: user?.id }
        });
        if (error) {
          throw new Error(error.message || 'Failed to get podcast status');
        }
        return data;
      },
      {
        context: 'check podcast generation status',
        severity: ErrorSeverity.MEDIUM
      }
    );

    if (error) {
      addLog('error', `❌ Status check error: ${error.userMessage}`);
      return;
    }

    addLog('success', '✅ Status retrieved successfully');

    // Validate response data before processing
    if (!statusData) {
      addLog('error', '❌ Empty response from status API');
      return;
    }

    updateTrackerFromStatus(statusData);

    // If completed or failed, stop polling
    if (statusData.status === 'completed' || statusData.status === 'failed') {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      setIsTracking(false);

      if (statusData.status === 'completed' && onComplete) {
        onComplete(statusData);
      }
    }
  };

  const updateTrackerFromStatus = (statusData: any) => {
    // Defensive programming - handle different response formats
    if (!statusData) {
      addLog('error', '❌ Received empty status data');
      return;
    }

    const podcast = statusData.podcast || statusData;
    const queue = statusData.queue;

    if (!podcast || !podcast.status) {
      addLog('error', '❌ Invalid status data structure', statusData);
      return;
    }

    let progress = 0;
    let currentStep = 'Initializing';
    let estimatedTime: number | undefined;

    // Calculate progress based on status
    switch (podcast.status) {
      case 'pending':
        progress = 10;
        currentStep = queue?.status === 'waiting' 
          ? `In queue (position ${queue.position || 1})` 
          : 'Preparing for generation';
        estimatedTime = queue?.position ? queue.position * 300 : 120; // 5min per queue position
        addLog('info', `📍 Queue position: ${queue?.position || 'Unknown'}`);
        break;
        
      case 'generating':
        progress = 60;
        currentStep = 'Synthesizing audio with ElevenLabs...';
        estimatedTime = 180;
        addLog('info', '🎬 Generation in progress (ElevenLabs TTS)');
        break;
        
      case 'completed':
        progress = 100;
        currentStep = 'Podcast ready!';
        addLog('success', '🎉 Podcast generation completed!');
        break;
        
      case 'failed':
        progress = 100;
        currentStep = `Failed: ${podcast.error_message || 'Unknown error'}`;
        addLog('error', `💥 Generation failed: ${podcast.error_message || 'Unknown error'}`);
        break;
    }

    setTracker(prev => ({
      podcastId: podcast.id,
      status: podcast.status,
      title: podcast.title || 'Medical Document Review',
      progress,
      currentStep,
      logs: prev?.logs || [],
      estimatedTimeRemaining: estimatedTime,
      playnoteId: podcast.playnote_id,
      queuePosition: queue?.position
    }));
  };

  const retryGeneration = async () => {
    if (!tracker) return;

    addLog('info', '🔄 Retrying generation...');

    const [result, error] = await safeAsync(
      async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication required');
        }

        const { data, error } = await supabase.functions.invoke('podcast-queue-processor', {
          method: 'POST'
        } as any);
        if (error) {
          throw new Error(error.message || 'Failed to restart generation');
        }
        return data;
      },
      {
        context: 'retry podcast generation',
        severity: ErrorSeverity.MEDIUM
      }
    );

    if (error) {
      addLog('error', `❌ Retry error: ${error.userMessage}`);
    } else {
      addLog('success', '✅ Queue processor triggered');
      startTracking(tracker.podcastId);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    if (!tracker) return <Activity className="w-5 h-5 animate-spin" />;

    switch (tracker.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'generating':
        return <Zap className="w-5 h-5 text-[var(--cardiology-accent-blue)] animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 animate-spin" />;
    }
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-[var(--cardiology-accent-blue)]" />;
    }
  };

  if (!tracker) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--component-card)] rounded-lg border border-[var(--glass-border-light)] p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">{tracker.title}</h3>
            <p className="text-sm text-[var(--foreground-tertiary)]">{tracker.currentStep}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {tracker.estimatedTimeRemaining && (
            <span className="text-sm text-[var(--foreground-secondary)]">
              ~{formatTime(tracker.estimatedTimeRemaining)}
            </span>
          )}
          
          {tracker.status === 'failed' && (
            <button
              onClick={retryGeneration}
              className="flex items-center space-x-1 px-3 py-1 bg-[var(--cardiology-accent-blue-dark)] text-[var(--foreground)] text-sm rounded-lg hover:bg-[var(--cardiology-accent-blue-dark)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
          
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-lg transition-colors ${
              showLogs 
                ? 'bg-[var(--component-surface-tertiary)] text-[var(--foreground-tertiary)]' 
                : 'bg-[var(--component-surface-secondary)] text-[var(--foreground-tertiary)] hover:bg-[var(--component-surface-tertiary)]'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Logs</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--foreground-tertiary)]">Progress</span>
          <span className="text-sm text-[var(--foreground-secondary)]">{tracker.progress}%</span>
        </div>
        <div className="w-full bg-[var(--component-surface-tertiary)] rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full transition-all duration-500 ${
              tracker.status === 'failed' 
                ? 'bg-red-500' 
                : tracker.status === 'completed' 
                ? 'bg-green-500' 
                : 'bg-[var(--cardiology-accent-blue)]'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${tracker.progress}%` }}
          />
        </div>
      </div>

      {/* Queue Info */}
      {tracker.queuePosition && tracker.queuePosition > 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Position {tracker.queuePosition} in queue
            </span>
          </div>
        </div>
      )}

      {/* Logs */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--glass-border-light)] pt-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <Terminal className="w-4 h-4 text-[var(--foreground-secondary)]" />
              <span className="text-sm font-medium text-[var(--foreground-tertiary)]">
                Generation Logs ({tracker.logs.length})
              </span>
            </div>
            
            <div
              ref={logRef}
              className="bg-[var(--component-surface-primary)] rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-xs"
            >
              {tracker.logs.length === 0 ? (
                <p className="text-[var(--foreground-secondary)]">No logs yet...</p>
              ) : (
                tracker.logs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2 mb-1">
                    <span className="text-[var(--foreground-secondary)]">[{log.timestamp}]</span>
                    {getLogIcon(log.level)}
                    <span className={`flex-1 ${
                      log.level === 'error' ? 'text-red-600' :
                      log.level === 'warning' ? 'text-yellow-600' :
                      log.level === 'success' ? 'text-green-600' :
                      'text-[var(--foreground-tertiary)]'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PodcastTracker;