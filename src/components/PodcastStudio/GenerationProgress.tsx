import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Check,
  X,
  List,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useAuth } from '../../stores/useAppStore';
import PodcastTracker from './PodcastTracker';
import { supabase } from '../../lib/supabase';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface GenerationProgressProps {
  podcast: any;
  queueStatus: any;
  onComplete: (completedPodcast: any) => void;
  onCancel: () => void;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({
  podcast,
  queueStatus,
  onComplete,
  onCancel
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(podcast?.status || 'pending');
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(
    queueStatus?.estimatedWaitTime || 5
  );
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  useEffect(() => {
    if (!podcast?.id) return;

    const checkStatus = async () => {
      setError('');

      const [result, error] = await safeAsync(
        async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Authentication required');
          }

          const { data, error } = await supabase.functions.invoke('podcast-status', {
            body: { podcastId: podcast.id, userId: user?.id }
          });
          if (error) {
            throw new Error(error.message || 'Failed to check podcast status');
          }
          return data;
        },
        {
          context: 'check podcast generation status',
          severity: ErrorSeverity.MEDIUM
        }
      );

      if (error) {
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(checkStatus, 2000); // Retry after 2 seconds
        } else {
          setError(error.userMessage || 'Network error - please check your connection');
        }
        return;
      }

      // Handle successful result
      setCurrentStatus(result.status);

      if (result.status === 'completed') {
        onComplete({
          ...podcast,
          ...result
        });
      } else if (result.status === 'failed') {
        setError(result.error || 'Generation failed');
      } else if (result.status === 'queued') {
        setEstimatedTimeRemaining(result.estimatedWaitTime || 5);
      }
    };

    // Check status immediately
    checkStatus();

    // Set up polling
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [podcast?.id, user?.id, onComplete]);

  useEffect(() => {
    // Update time elapsed
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Update progress based on status and time
    if (currentStatus === 'queued') {
      setProgress(10);
    } else if (currentStatus === 'generating') {
      // Simulate progress during generation (5-10 minutes typical)
      const maxTime = 10 * 60; // 10 minutes in seconds
      const progressPercent = Math.min(90, 20 + (timeElapsed / maxTime) * 70);
      setProgress(progressPercent);
    } else if (currentStatus === 'completed') {
      setProgress(100);
    }
  }, [currentStatus, timeElapsed]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    switch (currentStatus) {
      case 'queued':
        return {
          title: t('podcast.progress.queued.title'),
          message: queueStatus?.queuePosition 
            ? t('podcast.progress.queued.position', { position: queueStatus.queuePosition })
            : t('podcast.progress.queued.waiting'),
          icon: List,
          color: 'blue'
        };
      case 'generating':
        return {
          title: t('podcast.progress.generating.title'),
          message: t('podcast.progress.generating.message'),
          icon: Sparkles,
          color: 'purple'
        };
      case 'completed':
        return {
          title: t('podcast.progress.completed.title'),
          message: t('podcast.progress.completed.message'),
          icon: Check,
          color: 'green'
        };
      case 'failed':
        return {
          title: t('podcast.progress.failed.title'),
          message: t('podcast.progress.failed.message'),
          icon: AlertTriangle,
          color: 'red'
        };
      default:
        return {
          title: t('podcast.progress.pending.title'),
          message: t('podcast.progress.pending.message'),
          icon: Clock,
          color: 'gray'
        };
    }
  };

  const statusInfo = getStatusMessage();
  const StatusIcon = statusInfo.icon;

  const getColorClasses = (color: string) => {
    const classes = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        progress: 'bg-blue-600'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        icon: 'text-purple-600',
        progress: 'bg-purple-600'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: 'text-green-600',
        progress: 'bg-green-600'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: 'text-red-600',
        progress: 'bg-red-600'
      },
      gray: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: 'text-gray-600',
        progress: 'bg-gray-600'
      }
    };
    return classes[color as keyof typeof classes] || classes.gray;
  };

  const colorClasses = getColorClasses(statusInfo.color);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Enhanced Podcast Tracker */}
      <PodcastTracker
        podcastId={podcast?.id}
        onComplete={onComplete}
      />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900">Generation Controls</h4>
              <p className="text-sm text-gray-600">Monitor and manage your podcast generation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentStatus !== 'completed' && currentStatus !== 'failed' && (
              <button
                onClick={onCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
            
            {(timeElapsed > 300 && currentStatus === 'queued') || currentStatus === 'failed' && (
              <button
                onClick={async () => {
                  const [, error] = await safeAsync(
                    async () => {
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) {
                        throw new Error('Authentication required');
                      }

                      await supabase.functions.invoke('podcast-queue-processor', { method: 'POST' } as any);

                      setError('');
                      setRetryCount(0);
                    },
                    {
                      context: 'restart podcast queue processor',
                      showToast: true,
                      severity: ErrorSeverity.MEDIUM
                    }
                  );

                  if (error) {
                    setError(error.userMessage || 'Failed to restart queue processor');
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restart</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GenerationProgress;