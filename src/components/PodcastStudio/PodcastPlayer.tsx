import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Share2,
  FileText,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface PodcastPlayerProps {
  podcast: any;
  onNewGeneration: () => void;
}

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  podcast,
  onNewGeneration
}) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(event.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(event.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (podcast?.audioUrl) {
      const link = document.createElement('a');
      link.href = podcast.audioUrl;
      link.download = `${podcast.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (navigator.share && podcast?.audioUrl) {
      const [, error] = await safeAsync(
        async () => {
          await navigator.share({
            title: podcast.title,
            text: podcast.description || t('podcast.player.share.defaultText'),
            url: podcast.audioUrl
          });
        },
        {
          context: 'share podcast via native sharing',
          severity: ErrorSeverity.LOW
        }
      );
      // Share cancellation is expected behavior, so we don't need to handle the error
    } else {
      // Fallback: copy to clipboard
      if (podcast?.audioUrl) {
        await navigator.clipboard.writeText(podcast.audioUrl);
        // Could show a toast notification here
      }
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {podcast?.title}
                </h2>
                <p className="text-purple-100 text-sm">
                  {podcast?.description || t('podcast.player.defaultDescription')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Heart className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="p-8">
          <audio
            ref={audioRef}
            src={podcast?.audioUrl}
            preload="metadata"
          />

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progressPercentage}%, #e5e7eb ${progressPercentage}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Main Controls */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </motion.button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Speed Control */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {t('podcast.player.speed')}:
              </span>
              <select
                value={playbackSpeed}
                onChange={(e) => changePlaybackSpeed(parseFloat(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {playbackSpeeds.map(speed => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {t('podcast.player.duration')}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatTime(podcast?.duration || duration)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {t('podcast.player.style')}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900 capitalize">
                {t(`podcast.styles.${podcast?.synthesisStyle || 'podcast'}`)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {t('podcast.player.sources')}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {podcast?.source_documents?.length || 1} {t('podcast.player.documents')}
              </div>
            </div>
          </div>

          {/* Transcript Toggle */}
          {podcast?.transcript && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors duration-200"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">
                  {showTranscript ? t('podcast.player.hideTranscript') : t('podcast.player.showTranscript')}
                </span>
              </button>

              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto"
                  >
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {podcast.transcript}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewGeneration}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow duration-200"
            >
              <Sparkles className="w-5 h-5" />
              <span>{t('podcast.player.createNew')}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Custom Slider Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default PodcastPlayer;