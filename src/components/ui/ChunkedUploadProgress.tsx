import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Zap,
  Server,
  Database,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface ChunkProgress {
  currentChunk: number;
  totalChunks: number;
  chunkProgress: number;
}

interface ChunkedUploadProgressProps {
  fileName: string;
  fileSize: number;
  overallProgress: number;
  chunkProgress?: ChunkProgress;
  status: 'preparing' | 'chunking' | 'uploading' | 'reassembling' | 'processing' | 'complete' | 'error';
  error?: string;
  isChunked: boolean;
  estimatedTime?: string;
  uploadSpeed?: string;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatFileName = (fileName: string, maxLength: number = 30): string => {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);
  return `${truncatedName}...${extension}`;
};

const statusConfig = {
  preparing: {
    icon: Clock,
    title: 'Preparing Upload',
    description: 'Analyzing file and preparing for upload...',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  chunking: {
    icon: Zap,
    title: 'Chunking File',
    description: 'Splitting large file into manageable pieces...',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  uploading: {
    icon: Upload,
    title: 'Uploading',
    description: 'Uploading file chunks to secure storage...',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  reassembling: {
    icon: Server,
    title: 'Reassembling',
    description: 'Reconstructing file on secure servers...',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  processing: {
    icon: Database,
    title: 'Processing',
    description: 'Analyzing content and creating knowledge base...',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800'
  },
  complete: {
    icon: CheckCircle2,
    title: 'Complete',
    description: 'File uploaded and processed successfully!',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  error: {
    icon: AlertCircle,
    title: 'Upload Failed',
    description: 'An error occurred during upload',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800'
  }
};

export const ChunkedUploadProgress: React.FC<ChunkedUploadProgressProps> = ({
  fileName,
  fileSize,
  overallProgress,
  chunkProgress,
  status,
  error,
  isChunked,
  estimatedTime,
  uploadSpeed,
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const config = statusConfig[status];
  const IconComponent = config.icon;

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(overallProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [overallProgress]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative overflow-hidden rounded-xl border ${config.borderColor} ${config.bgColor} p-6 shadow-sm backdrop-blur-sm ${className}`}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          background: [
            'linear-gradient(45deg, transparent, transparent)',
            'linear-gradient(45deg, rgba(59, 130, 246, 0.1), transparent)',
            'linear-gradient(45deg, transparent, transparent)'
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <motion.div
              animate={status === 'uploading' || status === 'processing' ? {
                rotate: [0, 360]
              } : {}}
              transition={{
                duration: 2,
                repeat: status === 'uploading' || status === 'processing' ? Infinity : 0,
                ease: "linear"
              }}
            >
              <IconComponent className={`w-5 h-5 ${config.color}`} />
            </motion.div>
          </div>
          <div>
            <h4 className={`font-semibold ${config.color}`}>
              {config.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {error || config.description}
            </p>
          </div>
        </div>

        {/* File info */}
        <div className="text-right text-sm text-gray-500">
          <div className="font-medium">
            {formatFileName(fileName)}
          </div>
          <div className="text-xs">
            {formatFileSize(fileSize)}
            {isChunked && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                Chunked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {Math.round(animatedProgress)}%
          </span>
        </div>
        
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Background shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: status === 'uploading' || status === 'processing' ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          
          {/* Main progress bar */}
          <motion.div
            className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm`}
            initial={{ width: 0 }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{
              duration: 0.5,
              ease: "easeOut"
            }}
          />
          
          {/* Animated glow effect */}
          <motion.div
            className="absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-white/30 to-transparent rounded-full"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: status === 'uploading' ? Infinity : 0,
              ease: "easeInOut"
            }}
            style={{ right: `${100 - animatedProgress}%` }}
          />
        </div>
      </div>

      {/* Chunked Progress Details */}
      <AnimatePresence>
        {isChunked && chunkProgress && status === 'uploading' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 mb-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Chunk Progress
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {chunkProgress.currentChunk} / {chunkProgress.totalChunks}
              </span>
            </div>
            
            {/* Individual chunk indicators */}
            <div className="flex space-x-1">
              {Array.from({ length: chunkProgress.totalChunks }, (_, i) => (
                <motion.div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < chunkProgress.currentChunk
                      ? 'bg-green-500'
                      : i === chunkProgress.currentChunk
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                />
              ))}
            </div>
            
            {/* Current chunk progress */}
            {chunkProgress.currentChunk < chunkProgress.totalChunks && (
              <div className="mt-2 text-xs text-gray-500">
                <motion.div
                  className="flex items-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Uploading chunk {chunkProgress.currentChunk + 1}...
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Details */}
      <div className="relative z-10 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          {uploadSpeed && (
            <div className="flex items-center">
              <ArrowRight className="w-3 h-3 mr-1" />
              {uploadSpeed}
            </div>
          )}
          {estimatedTime && status !== 'complete' && status !== 'error' && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {estimatedTime} remaining
            </div>
          )}
        </div>
        
        {status === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center text-green-600 dark:text-green-400"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Upload Complete
          </motion.div>
        )}
      </div>

      {/* Process Flow Visualization */}
      <AnimatePresence>
        {isChunked && (status === 'reassembling' || status === 'processing') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10 mt-4 p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200/30 dark:border-gray-700/30"
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="flex items-center space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Server className="w-5 h-5 text-purple-500" />
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <Database className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-center mt-2 text-xs text-gray-600 dark:text-gray-400">
              {status === 'reassembling' ? 'Reconstructing file from chunks' : 'Creating knowledge base'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};