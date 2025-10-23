import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Layers,
  FileText,
  Eye,
  Trash2,
  CheckCircle,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { DocumentWithMetadata } from '../../../../lib/api/knowledgeBase';
import { ViewMode, DisplayDensity, DocumentGroup } from '../types';
import { formatFileSize } from '../documentUtils';

interface ChunkedDocumentCardProps {
  group: DocumentGroup;
  viewMode: ViewMode;
  displayDensity: DisplayDensity;
  isExpanded: boolean;
  selectedDocuments: Set<string>;
  onToggle: () => void;
  onView: (document: DocumentWithMetadata) => void;
  onDelete: (documentId: string, title: string) => void;
  onDeleteAll?: (documentIds: string[], title: string) => void;
  onSelect: (id: string) => void;
  index: number;
}

export const ChunkedDocumentCard: React.FC<ChunkedDocumentCardProps> = ({
  group,
  viewMode,
  isExpanded,
  selectedDocuments,
  onToggle,
  onView,
  onDelete,
  onDeleteAll,
  onSelect,
  index
}) => {
  const prefersReducedMotion = useReducedMotion();

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        delay: prefersReducedMotion ? 0 : index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={!prefersReducedMotion ? "hover" : undefined}
        whileTap={!prefersReducedMotion ? "tap" : undefined}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
      >
        {/* Group Header */}
        <div
          className="p-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors truncate">
                {group.baseTitle}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  📚 {group.documents.length}/{group.totalParts} parts
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  Chunked Document
                </span>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onView(group.documents[0]); }}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800"
              title="View first part"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expanded Parts */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 dark:bg-gray-800/50 border-t border-blue-200 dark:border-blue-800"
            >
              <div className="p-2 space-y-1">
                {group.documents.map((document, partIndex) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors border-l-4 border-blue-200 dark:border-blue-700"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`
                        w-4 h-4 rounded border transition-all duration-200
                        ${selectedDocuments.has(document.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 hover:border-blue-400'
                        }
                        flex items-center justify-center cursor-pointer
                      `}
                      onClick={() => onSelect(document.id)}>
                        {selectedDocuments.has(document.id) && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Part {partIndex + 1} • {formatFileSize(document.file_size || 0)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onView(document)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800"
                        title="View this part"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(document.id, document.title)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                        title="Delete this part"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Grid View - Standardized with single document cards
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
        cursor-pointer overflow-hidden
      `}
      onClick={onToggle}
    >
      {/* Selection Badge */}
      <div className={`
        absolute top-3 left-3 z-10 transition-all duration-200
        scale-100 opacity-100
      `}>
        <div className="w-6 h-6 rounded-full border-2 bg-blue-500 border-blue-500 flex items-center justify-center shadow-lg">
          <Layers className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Document Preview Area - Standardized */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
        {/* Group Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Layers className="w-8 h-8 text-gray-600 dark:text-gray-300" />
          </div>
        </div>

        {/* Parts Count Overlay */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {group.documents.length}/{group.totalParts}
            </span>
          </div>
        </div>

        {/* Hover Actions */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center transition-opacity"
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); onView(group.documents[0]); }}
                className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:scale-110 transition-transform shadow-lg"
                title="View first part"
              >
                <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              {onDeleteAll && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteAll(group.documents.map(d => d.id), group.baseTitle); }}
                  className="p-2 bg-red-500/90 rounded-full hover:scale-110 transition-transform shadow-lg"
                  title="Delete all parts"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Document Info - Standardized */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">
          {group.baseTitle}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
          Chunked Document • {group.documents.length} parts
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              📚 {group.documents.length} parts
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(group.documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0))}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(group.documents[0]?.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Expanded parts list */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700 space-y-2"
            >
              {group.documents.map((document, partIndex) => (
                <div key={document.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                    Part {partIndex + 1} • {formatFileSize(document.file_size || 0)}
                  </span>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onView(document); }}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="View this part"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(document.id, document.title); }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete this part"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
