import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../stores/useAppStore';
import PodcastCard from './PodcastCard';
import { supabase } from '../../lib/supabase';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface PodcastHistoryProps {
  specialty: string;
  onPlayPodcast: (podcast: any) => void;
}

interface Podcast {
  id: string;
  title: string;
  description?: string;
  status: string;
  synthesis_style: string;
  audio_url?: string;
  duration?: number;
  created_at: string;
  source_documents: any[];
  transcript?: any;
}

const PodcastHistory: React.FC<PodcastHistoryProps> = ({
  specialty,
  onPlayPodcast
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: 'all', label: t('podcast.history.filters.all') },
    { value: 'completed', label: t('podcast.history.filters.completed') },
    { value: 'generating', label: t('podcast.history.filters.generating') },
    { value: 'pending', label: t('podcast.history.filters.pending') },
    { value: 'failed', label: t('podcast.history.filters.failed') }
  ];

  useEffect(() => {
    fetchPodcasts();
  }, [user?.id, statusFilter, currentPage]);

  const fetchPodcasts = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    const [result, error] = await safeAsync(
      async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication required');
        }

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12'
        });

        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        if (specialty) {
          params.append('specialty', specialty);
        }

        // Call Supabase Edge Function
        const { data: result, error } = await supabase.functions.invoke('podcast-list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to fetch podcasts');
        }

        return result;
      },
      {
        context: 'fetch podcast history',
        severity: ErrorSeverity.MEDIUM
      }
    );

    if (error) {
      setError(error.userMessage || 'Failed to load podcasts');
    } else {
      setPodcasts(result.podcasts || []);
      setTotalPages(result.pagination?.totalPages || 1);
    }

    setLoading(false);
  };

  const filteredPodcasts = podcasts.filter(podcast => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      podcast.title.toLowerCase().includes(searchLower) ||
      podcast.description?.toLowerCase().includes(searchLower) ||
      podcast.source_documents.some(doc => 
        doc.title?.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleDelete = async (podcastId: string) => {
    // Implement delete functionality
    setPodcasts(prev => prev.filter(p => p.id !== podcastId));
  };

  const handleRetry = async (podcastId: string) => {
    setError('');

    const [, error] = await safeAsync(
      async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication required');
        }

        // Call Supabase Edge Function to restart the queue processor
        const { data, error } = await supabase.functions.invoke('podcast-queue-processor', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to restart generation');
        }

        // Refresh the podcasts list to see updated status
        await fetchPodcasts();
      },
      {
        context: 'retry podcast generation',
        showToast: true,
        severity: ErrorSeverity.MEDIUM
      }
    );

    if (error) {
      setError(error.userMessage || 'Failed to restart generation. Please check your connection.');
    }
  };

  if (loading && podcasts.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-10 bg-white/10 rounded-xl w-1/4 mb-4 mx-auto"></div>
          <div className="h-6 bg-white/10 rounded-lg w-1/2 mx-auto"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('podcast.history.title')}
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/80 text-lg"
        >
          {t('podcast.history.subtitle')}
        </motion.p>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500" />
          <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              placeholder={t('podcast.history.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 text-base font-medium"
            />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500" />
          <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-10 py-4 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 appearance-none text-base font-medium cursor-pointer"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-400 text-sm p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={fetchPodcasts}
              className="ml-auto text-red-300 hover:text-red-200 font-medium"
            >
              {t('common.retry')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Podcasts Grid */}
      <AnimatePresence mode="wait">
        {filteredPodcasts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Clock className="w-12 h-12 text-white/60" />
            </div>
            <h3 className="text-lg font-medium text-white/90 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? t('podcast.history.empty.noResults')
                : t('podcast.history.empty.noPodcasts')
              }
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? t('podcast.history.empty.tryDifferentFilter')
                : t('podcast.history.empty.createFirst')
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-purple-500/30 font-semibold"
              >
                {t('podcast.history.empty.createButton')}
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredPodcasts.map((podcast, index) => (
              <motion.div
                key={podcast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PodcastCard
                  podcast={podcast}
                  onPlay={() => onPlayPodcast(podcast)}
                  onDelete={() => handleDelete(podcast.id)}
                  onRetry={() => handleRetry(podcast.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center space-x-3 mt-12"
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            {t('common.previous')}
          </button>

          <div className="flex items-center space-x-2">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;
              
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            {t('common.next')}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PodcastHistory;