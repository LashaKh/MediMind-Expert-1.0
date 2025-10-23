import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Loader,
  Clock,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { DocumentWithMetadata } from '../../../../lib/api/knowledgeBase';
import { ViewMode, DisplayDensity } from '../types';
import { PremiumFileIcon } from './PremiumFileIcon';

interface RegularDocumentCardProps {
  document: DocumentWithMetadata;
  viewMode: ViewMode;
  displayDensity: DisplayDensity;
  isSelected: boolean;
  showMetadata: boolean;
  onSelect: (id: string) => void;
  onView: () => void;
  onDelete: () => void;
  onDownload: () => void;
  index: number;
}

export const RegularDocumentCard: React.FC<RegularDocumentCardProps> = ({
  document,
  viewMode,
  displayDensity,
  isSelected,
  showMetadata,
  onSelect,
  onView,
  onDelete,
  onDownload,
  index
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        delay: prefersReducedMotion ? 0 : index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  const getStatusIndicator = () => {
    switch (document.upload_status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
      case 'pending':
        return <Loader className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const densityClasses = {
    compact: 'p-3',
    comfortable: 'p-4',
    spacious: 'p-6'
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={!prefersReducedMotion ? "hover" : undefined}
        whileTap={!prefersReducedMotion ? "tap" : undefined}
        className={`
          group bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl shadow-sm hover:shadow-lg
          transition-all duration-300 ease-out
          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
          ${densityClasses[displayDensity]}
          cursor-pointer
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect(document.id)}
      >
        <div className="flex items-center space-x-4">
          {/* Selection Checkbox */}
          <div className="flex-shrink-0">
            <div className={`
              w-5 h-5 rounded border-2 transition-all duration-200
              ${isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 group-hover:border-blue-400'
              }
              flex items-center justify-center
            `}>
              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
          </div>

          {/* File Icon */}
          <div className="flex-shrink-0">
            <PremiumFileIcon fileType={document.file_type} showGradient />
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">
                  {document.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {document.file_name}
                </p>
                {showMetadata && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                    <span>{document.formattedSize}</span>
                    <span>{document.formattedDate}</span>
                    <span className="capitalize">{document.category}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2 ml-4">
                {getStatusIndicator()}
                <div className={`
                  opacity-0 group-hover:opacity-100 transition-opacity
                  flex items-center space-x-1
                `}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="View document"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDownload(); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Download document"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tags */}
            {document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {document.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {document.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">
                    +{document.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={!prefersReducedMotion ? "hover" : undefined}
      whileTap={!prefersReducedMotion ? "tap" : undefined}
      className={`
        group relative bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
        ${densityClasses[displayDensity]}
        cursor-pointer overflow-hidden
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(document.id)}
    >
      {/* Selection Badge */}
      <div className={`
        absolute top-3 left-3 z-10 transition-all duration-200
        ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}
      `}>
        <div className={`
          w-6 h-6 rounded-full border-2 transition-all duration-200
          ${isSelected
            ? 'bg-blue-500 border-blue-500'
            : 'bg-white/80 backdrop-blur border-gray-300'
          }
          flex items-center justify-center shadow-lg
        `}>
          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
        </div>
      </div>

      {/* Document Preview Area */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
        {/* File Type Indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <PremiumFileIcon fileType={document.file_type} className="w-16 h-16" showGradient />
        </div>

        {/* Status Overlay */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1.5">
            {getStatusIndicator()}
          </div>
        </div>

        {/* Hover Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center"
            >
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onView(); }}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:scale-110 transition-transform shadow-lg"
                  title="View document"
                >
                  <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload(); }}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:scale-110 transition-transform shadow-lg"
                  title="Download document"
                >
                  <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-2 bg-red-500/90 rounded-full hover:scale-110 transition-transform shadow-lg"
                  title="Delete document"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Document Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">
          {document.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
          {document.file_name}
        </p>

        {showMetadata && (
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <span>{document.formattedSize}</span>
            <span>{document.formattedDate}</span>
          </div>
        )}

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {document.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">
                +{document.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
