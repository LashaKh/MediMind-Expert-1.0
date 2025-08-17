import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Clock,
  FileText,
  MoreVertical,
  Trash2,
  Download,
  Share2,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Heart,
  RefreshCw,
  AudioWaveform,
  Sparkles,
  ChevronRight,
  Mic,
  Volume2,
  Star,
  Zap,
  Radio
} from 'lucide-react';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface PodcastCardProps {
  podcast: {
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
  };
  onPlay: () => void;
  onDelete: () => void;
  onRetry: () => void;
}

const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  onPlay,
  onDelete,
  onRetry
}) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          text: t('podcast.status.completed'),
          color: 'text-emerald-400',
          bg: 'from-emerald-500/20 to-green-500/30',
          glow: 'from-emerald-400 to-green-500',
          iconBg: 'from-emerald-400 to-green-500'
        };
      case 'generating':
        return {
          icon: RefreshCw,
          text: t('podcast.status.generating'),
          color: 'text-cyan-400',
          bg: 'from-cyan-500/20 to-blue-500/30',
          glow: 'from-cyan-400 to-blue-500',
          iconBg: 'from-cyan-400 to-blue-500'
        };
      case 'pending':
        return {
          icon: Clock,
          text: t('podcast.status.pending'),
          color: 'text-amber-400',
          bg: 'from-amber-500/20 to-orange-500/30',
          glow: 'from-amber-400 to-orange-500',
          iconBg: 'from-amber-400 to-orange-500'
        };
      case 'failed':
        return {
          icon: XCircle,
          text: t('podcast.status.failed'),
          color: 'text-red-400',
          bg: 'from-red-500/20 to-pink-500/30',
          glow: 'from-red-400 to-pink-500',
          iconBg: 'from-red-400 to-pink-500'
        };
      default:
        return {
          icon: Clock,
          text: status,
          color: 'text-gray-400',
          bg: 'from-gray-500/20 to-slate-500/30',
          glow: 'from-gray-400 to-slate-500',
          iconBg: 'from-gray-400 to-slate-500'
        };
    }
  };

  const statusInfo = getStatusInfo(podcast.status);
  const StatusIcon = statusInfo.icon;

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '—';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownload = () => {
    if (podcast.audio_url) {
      const link = document.createElement('a');
      link.href = podcast.audio_url;
      link.download = `${podcast.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowMenu(false);
  };

  const handleShare = async () => {
    if (navigator.share && podcast.audio_url) {
      const [, error] = await safeAsync(
        async () => {
          await navigator.share({
            title: podcast.title,
            text: podcast.description || t('podcast.share.defaultText'),
            url: podcast.audio_url
          });
        },
        {
          context: 'share podcast via native sharing',
          severity: ErrorSeverity.LOW
        }
      );
      // Share cancellation is expected behavior, so we don't need to handle the error
    } else if (podcast.audio_url) {
      await navigator.clipboard.writeText(podcast.audio_url);
    }
    setShowMenu(false);
  };

  const canPlay = podcast.status === 'completed' && podcast.audio_url;
  const canRetry = podcast.status === 'failed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ 
        scale: 1.02, 
        y: -8,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group overflow-hidden cursor-pointer"
    >
      {/* Revolutionary Glass Morphism Card */}
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.05] via-white/[0.08] to-white/[0.05] border border-white/10 rounded-3xl shadow-2xl shadow-black/20">
        {/* Dynamic Status Glow */}
        <div className={`absolute inset-0 rounded-3xl opacity-20 bg-gradient-to-r ${statusInfo.bg} blur-xl transition-all duration-700 group-hover:opacity-40`} />
        
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 rounded-3xl">
          <div className={`absolute inset-[1px] rounded-3xl bg-gradient-to-r ${statusInfo.glow} opacity-0 group-hover:opacity-30 transition-all duration-500`} />
        </div>

        {/* Premium Audio Wave Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 overflow-hidden rounded-3xl">
          <AudioWaveform className="w-full h-full text-white transform rotate-12 scale-150" />
        </div>

        {/* Sparkle Animation */}
        <motion.div 
          className="absolute top-6 right-6 text-white/20"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>

        {/* Main Content Container */}
        <div className="relative z-10 p-6">
          {/* Revolutionary Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              {/* Premium Status Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`relative p-2 rounded-xl bg-gradient-to-r ${statusInfo.iconBg} shadow-lg`}>
                  <StatusIcon className="w-4 h-4 text-white" />
                  {podcast.status === 'generating' && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-white/30"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0, 0.3]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    />
                  )}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${statusInfo.color}`}>
                    {statusInfo.text}
                  </div>
                  <div className="text-xs text-white/60">
                    {formatDate(podcast.created_at)}
                  </div>
                </div>
              </div>

              {/* Revolutionary Title with Glow Effect */}
              <motion.h3 
                className="text-lg font-bold text-white mb-2 group-hover:text-white/90 transition-all duration-300 line-clamp-2"
                whileHover={{ scale: 1.01 }}
              >
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {podcast.title}
                </span>
              </motion.h3>
              
              {podcast.description && (
                <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">
                  {podcast.description}
                </p>
              )}
            </div>
            
            {/* Ultra-Premium Actions Menu */}
            <div className="relative ml-4">
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 group/btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreVertical className="w-4 h-4" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 mt-2 w-56 backdrop-blur-xl bg-black/80 border border-white/20 rounded-2xl shadow-2xl z-20 overflow-hidden"
                  >
                    <div className="py-2">
                      {canPlay && (
                        <>
                          <motion.button
                            onClick={handleDownload}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-all duration-200 group/item"
                            whileHover={{ x: 4 }}
                          >
                            <div className="p-2 bg-blue-500/20 rounded-lg group-hover/item:bg-blue-500/30 transition-colors duration-200">
                              <Download className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="font-medium">{t('podcast.actions.download')}</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-white/50 group-hover/item:text-white/80 transition-colors duration-200" />
                          </motion.button>
                          <motion.button
                            onClick={handleShare}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-all duration-200 group/item"
                            whileHover={{ x: 4 }}
                          >
                            <div className="p-2 bg-green-500/20 rounded-lg group-hover/item:bg-green-500/30 transition-colors duration-200">
                              <Share2 className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="font-medium">{t('podcast.actions.share')}</span>
                            <ChevronRight className="w-4 h-4 ml-auto text-white/50 group-hover/item:text-white/80 transition-colors duration-200" />
                          </motion.button>
                          <div className="mx-4 my-2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </>
                      )}
                      
                      {canRetry && (
                        <motion.button
                          onClick={() => {
                            onRetry();
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-white/90 hover:bg-white/10 transition-all duration-200 group/item"
                          whileHover={{ x: 4 }}
                        >
                          <div className="p-2 bg-yellow-500/20 rounded-lg group-hover/item:bg-yellow-500/30 transition-colors duration-200">
                            <RefreshCw className="w-4 h-4 text-yellow-400" />
                          </div>
                          <span className="font-medium">{t('podcast.actions.retry')}</span>
                          <ChevronRight className="w-4 h-4 ml-auto text-white/50 group-hover/item:text-white/80 transition-colors duration-200" />
                        </motion.button>
                      )}
                      
                      <motion.button
                        onClick={() => {
                          onDelete();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-white/90 hover:bg-red-500/20 transition-all duration-200 group/item"
                        whileHover={{ x: 4 }}
                      >
                        <div className="p-2 bg-red-500/20 rounded-lg group-hover/item:bg-red-500/30 transition-colors duration-200">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="font-medium">{t('podcast.actions.delete')}</span>
                        <ChevronRight className="w-4 h-4 ml-auto text-white/50 group-hover/item:text-white/80 transition-colors duration-200" />
                      </motion.button>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Revolutionary Metadata Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5 px-6">
          {/* Duration Card */}
          <motion.div 
            className="relative p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl group/meta"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover/meta:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mb-1 mx-auto">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <div className="text-[10px] text-white/60 text-center mb-0.5 font-medium">
                {t('podcast.card.duration')}
              </div>
              <div className="text-xs font-bold text-white text-center">
                {formatDuration(podcast.duration)}
              </div>
            </div>
          </motion.div>

          {/* Sources Card */}
          <motion.div 
            className="relative p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl group/meta"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl opacity-0 group-hover/meta:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg mb-1 mx-auto">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <div className="text-[10px] text-white/60 text-center mb-0.5 font-medium">
                {t('podcast.card.sources')}
              </div>
              <div className="text-xs font-bold text-white text-center">
                {podcast.source_documents?.length || 1}
              </div>
            </div>
          </motion.div>

          {/* Quality Card */}
          <motion.div 
            className="relative p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl group/meta"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover/meta:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg mb-1 mx-auto">
                <Star className="w-3 h-3 text-white" />
              </div>
              <div className="text-[10px] text-white/60 text-center mb-0.5 font-medium">
                Quality
              </div>
              <div className="text-xs font-bold text-white text-center">
                HD
              </div>
            </div>
          </motion.div>
        </div>

        {/* Premium Style Badge */}
        <div className="mb-5 px-6">
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-violet-500/30 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Radio className="w-3 h-3 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300 capitalize">
              {t(`podcast.styles.${podcast.synthesis_style}`)}
            </span>
            <Zap className="w-2.5 h-2.5 text-violet-400" />
          </motion.div>
        </div>

        {/* Revolutionary Action Button */}
        <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          {canPlay ? (
            <motion.button
              key="play"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onPlay}
              className="relative w-full group/btn overflow-hidden"
            >
              {/* Button Background */}
              <div className="relative px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-xl shadow-emerald-500/25">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                
                {/* Content */}
                <div className="relative flex items-center justify-center space-x-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-sm">{t('podcast.actions.play')}</span>
                  <Volume2 className="w-3.5 h-3.5 text-white/80" />
                </div>
              </div>
            </motion.button>
          ) : canRetry ? (
            <motion.button
              key="retry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="relative w-full group/btn overflow-hidden"
            >
              <div className="relative px-6 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 rounded-xl shadow-xl shadow-red-500/25">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <div className="relative flex items-center justify-center space-x-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-bold text-sm">{t('podcast.actions.retry')}</span>
                </div>
              </div>
            </motion.button>
          ) : podcast.status === 'generating' ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative w-full"
            >
              <div className="relative px-6 py-3 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-xl">
                <div className="flex items-center justify-center space-x-2">
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    <div className="absolute inset-0 w-5 h-5 border border-cyan-400/20 rounded-full animate-pulse" />
                  </div>
                  <span className="text-cyan-300 font-bold text-sm">
                    {t('podcast.status.generating')}
                  </span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mic className="w-4 h-4 text-cyan-400" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative w-full"
            >
              <div className="relative px-6 py-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl">
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                  </motion.div>
                  <span className="text-amber-300 font-bold text-sm">
                    {t('podcast.status.pending')}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
        </div>

        {/* Floating Orbs Background Animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <motion.div
            className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"
            animate={{
              x: [0, -25, 0],
              y: [0, 15, 0],
              scale: [1.2, 1, 1.2]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PodcastCard;