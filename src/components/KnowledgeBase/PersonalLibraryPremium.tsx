import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useSpring, useTransform, useScroll, useMotionValue } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  RefreshCw, 
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  File,
  FileText,
  FileImage,
  FileSpreadsheet,
  Tag,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader,
  Sparkles,
  Archive,
  Zap,
  Eye,
  Download,
  Trash2,
  Heart,
  Star,
  Bookmark,
  FolderOpen,
  Layers,
  BarChart3,
  Cloud,
  Shield,
  Users,
  Share2,
  Settings,
  SortDesc,
  SortAsc,
  Layout,
  Grid3X3,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight as ChevronRightIcon,
  ArrowUpDown,
  MoreHorizontal,
  FilterX,
  Infinity,
  Gauge,
  Activity,
  Command,
  MousePointer,
  Cpu,
  Wifi,
  Database
} from 'lucide-react';
import { 
  PremiumLoader, 
  FloatingActionButton, 
  ProgressRing, 
  StaggeredGrid, 
  MagneticButton, 
  MorphingIcon, 
  LiquidLoader, 
  PremiumCard,
  FloatingParticles
} from './PremiumAnimations';
import { useTranslation } from '../../hooks/useTranslation';
import { safeAsync, safe, ErrorSeverity } from '../../lib/utils/errorHandling';
import { useAuth, useSpecialty, MedicalSpecialty, useAppStore } from '../../stores/useAppStore';
import { DocumentUpload } from './DocumentUpload';
import { DocumentSearch, SearchFilters } from './DocumentSearch';
import { DocumentDetails } from './DocumentDetails';
import { CommandPalette, useCommandPalette } from './CommandPalette';
import { AdvancedSearch } from './AdvancedSearch';
import { 
  listUserDocuments, 
  deleteUserDocument,
  getUserDocument
} from '../../lib/api/vectorStore';
import { 
  DocumentListParams,
  DocumentListResponse,
  UserDocument,
  DocumentDeleteRequest
} from '../../types/openai-vector-store';
import { DocumentWithMetadata } from '../../lib/api/knowledgeBase';

// Advanced Types
type ViewMode = 'grid' | 'list' | 'masonry' | 'timeline';
type SortBy = 'name' | 'date' | 'size' | 'type' | 'relevance' | 'category';
type SortOrder = 'asc' | 'desc';
type DisplayDensity = 'comfortable' | 'compact' | 'spacious';

interface PersonalLibraryState {
  documents: DocumentWithMetadata[];
  documentGroups: DocumentGroup[];
  expandedGroups: Set<string>;
  selectedDocuments: Set<string>;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  displayDensity: DisplayDensity;
  showMetadata: boolean;
  showPreview: boolean;
}

// Group chunked documents together
interface DocumentGroup {
  id: string;
  isChunked: boolean;
  baseTitle: string;
  documents: DocumentWithMetadata[];
  totalParts?: number;
  isExpanded?: boolean;
}

// Utility function to group documents
const groupDocuments = (documents: DocumentWithMetadata[]): DocumentGroup[] => {
  console.log('🔍 PREMIUM GROUPING DEBUG: Starting to group documents:', documents.length);
  
  const chunkedGroups = new Map<string, DocumentWithMetadata[]>();
  const regularDocuments: DocumentWithMetadata[] = [];

  // Separate chunked and regular documents
  documents.forEach(doc => {
    console.log('📄 Checking document:', doc.title, 'Tags:', doc.tags);
    const isChunked = doc.tags?.includes('chunked-document');
    console.log('🧩 Is chunked?', isChunked);
    
    if (isChunked) {
      // Extract base title by removing " - Part X/Y"
      const baseTitle = doc.title.replace(/ - Part \d+\/\d+$/, '');
      console.log('📝 Base title extracted:', baseTitle);
      
      if (!chunkedGroups.has(baseTitle)) {
        chunkedGroups.set(baseTitle, []);
      }
      chunkedGroups.get(baseTitle)!.push(doc);
      console.log('✅ Added to chunked group:', baseTitle);
    } else {
      regularDocuments.push(doc);
      console.log('📋 Added to regular documents');
    }
  });

  const groups: DocumentGroup[] = [];

  // Add regular documents as individual groups
  regularDocuments.forEach(doc => {
    groups.push({
      id: doc.id,
      isChunked: false,
      baseTitle: doc.title,
      documents: [doc]
    });
  });

  // Add chunked document groups
  chunkedGroups.forEach((chunks, baseTitle) => {
    // Sort chunks by part number
    chunks.sort((a, b) => {
      const aPartMatch = a.title.match(/Part (\d+)\/\d+$/);
      const bPartMatch = b.title.match(/Part (\d+)\/\d+$/);
      const aPart = aPartMatch ? parseInt(aPartMatch[1]) : 0;
      const bPart = bPartMatch ? parseInt(bPartMatch[1]) : 0;
      return aPart - bPart;
    });

    const totalPartsMatch = chunks[0]?.title.match(/Part \d+\/(\d+)$/);
    const totalParts = totalPartsMatch ? parseInt(totalPartsMatch[1]) : chunks.length;

    groups.push({
      id: `chunked-${baseTitle}`,
      isChunked: true,
      baseTitle,
      documents: chunks,
      totalParts,
      isExpanded: false
    });
  });

  const sortedGroups = groups.sort((a, b) => {
    // Sort by latest document date in each group
    const aLatest = Math.max(...a.documents.map(d => new Date(d.created_at).getTime()));
    const bLatest = Math.max(...b.documents.map(d => new Date(d.created_at).getTime()));
    return bLatest - aLatest;
  });
  
  console.log('🎯 PREMIUM FINAL GROUPS:', sortedGroups.map(g => ({
    id: g.id,
    isChunked: g.isChunked,
    baseTitle: g.baseTitle,
    documentCount: g.documents.length
  })));
  
  return sortedGroups;
};

// Convert UserDocument to DocumentWithMetadata for compatibility
const convertUserDocumentToLegacy = (doc: UserDocument): DocumentWithMetadata => {
  const uploadDate = new Date(doc.created_at);
  const size = doc.file_size || 0;
  
  return {
    id: doc.id,
    file_name: doc.file_name,
    title: doc.title,
    description: doc.description || '',
    file_type: doc.file_type,
    file_size: size,
    category: doc.category || 'other',
    tags: doc.tags || [],
    upload_status: doc.upload_status,
    processing_status: doc.processing_status,
    error_message: doc.error_message || null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    is_private: doc.is_private,
    user_id: doc.user_id,
    vector_store_id: doc.vector_store_id,
    openai_file_id: doc.openai_file_id,
    storage_path: '',
    formattedSize: formatFileSize(size),
    formattedDate: uploadDate.toLocaleDateString(),
    statusColor: getStatusColor(doc.upload_status),
    canDelete: true,
    canEdit: doc.upload_status === 'completed'
  };
};

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'green';
    case 'failed': return 'red';
    case 'uploading': 
    case 'pending': return 'yellow';
    default: return 'gray';
  }
};

// Premium File Icon with sophisticated styling
const PremiumFileIcon: React.FC<{ fileType: string; className?: string; showGradient?: boolean }> = ({ 
  fileType, 
  className = "w-8 h-8", 
  showGradient = false 
}) => {
  const getFileIcon = (type: string) => {
    const normalizedType = type.toLowerCase();
    
    if (normalizedType.includes('pdf')) {
      return { Icon: FileText, color: 'from-red-500 to-red-600', solid: 'text-red-500' };
    } else if (normalizedType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(normalizedType)) {
      return { Icon: FileImage, color: 'from-purple-500 to-pink-500', solid: 'text-purple-500' };
    } else if (normalizedType.includes('excel') || normalizedType.includes('csv') || normalizedType.includes('spreadsheet')) {
      return { Icon: FileSpreadsheet, color: 'from-green-500 to-emerald-500', solid: 'text-green-500' };
    } else if (normalizedType.includes('word') || normalizedType.includes('doc')) {
      return { Icon: FileText, color: 'from-blue-500 to-indigo-500', solid: 'text-blue-500' };
    } else {
      return { Icon: File, color: 'from-gray-500 to-gray-600', solid: 'text-gray-500' };
    }
  };

  const { Icon, color, solid } = getFileIcon(fileType);
  
  if (showGradient) {
    return (
      <div className={`${className} rounded-lg bg-gradient-to-br ${color} p-2 text-white shadow-lg`}>
        <Icon className="w-full h-full" />
      </div>
    );
  }
  
  return <Icon className={`${className} ${solid}`} />;
};

// Chunked Document Group Component
const ChunkedDocumentCard: React.FC<{
  group: DocumentGroup;
  viewMode: ViewMode;
  displayDensity: DisplayDensity;
  isExpanded: boolean;
  selectedDocuments: Set<string>;
  onToggle: () => void;
  onView: (document: DocumentWithMetadata) => void;
  onDelete: (documentId: string, title: string) => void;
  onSelect: (id: string) => void;
  index: number;
}> = ({ group, viewMode, displayDensity, isExpanded, selectedDocuments, onToggle, onView, onDelete, onSelect, index }) => {
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

  // Grid View
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={!prefersReducedMotion ? "hover" : undefined}
      whileTap={!prefersReducedMotion ? "tap" : undefined}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-2 line-clamp-2">
              {group.baseTitle}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                📚 {group.documents.length}/{group.totalParts} parts
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
            🧩 Chunked Document
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(group.documents[0])}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
          >
            View Document
          </button>
          <button
            onClick={onToggle}
            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600"
            title={isExpanded ? 'Hide parts' : 'Show all parts'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
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
                      onClick={() => onView(document)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="View this part"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(document.id, document.title)}
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

// Sophisticated Document Card Component
const DocumentCard: React.FC<{
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
}> = ({ document, viewMode, displayDensity, isSelected, showMetadata, onSelect, onView, onDelete, onDownload, index }) => {
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
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDownload(); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
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
                >
                  <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload(); }}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:scale-110 transition-transform shadow-lg"
                >
                  <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-2 bg-red-500/90 rounded-full hover:scale-110 transition-transform shadow-lg"
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

// Main Component
export const PersonalLibraryPremium: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { specialty } = useSpecialty();
  const { setPersonalDocumentCount } = useAppStore();
  const [state, setState] = useState<PersonalLibraryState>({
    documents: [],
    documentGroups: [],
    expandedGroups: new Set(),
    selectedDocuments: new Set(),
    viewMode: 'grid',
    sortBy: 'date',
    sortOrder: 'desc',
    displayDensity: 'comfortable',
    showMetadata: true,
    showPreview: false
  });
  
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithMetadata | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Command palette
  const { isOpen: isCommandPaletteOpen, openCommandPalette, closeCommandPalette } = useCommandPalette();

  // Advanced search filters
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    status: 'all',
    category: 'all',
    tags: [],
    dateRange: { from: '', to: '' },
    fileTypes: [],
    sizeRange: { min: 0, max: 100 },
    favorites: false,
    recent: false
  });

  // Get specialty theme with enhanced colors
  const getSpecialtyTheme = () => {
    switch (specialty) {
      case MedicalSpecialty.CARDIOLOGY:
        return {
          primary: 'text-red-600',
          primaryBg: 'bg-red-600',
          primaryLight: 'bg-red-50',
          primaryGradient: 'from-red-500 to-red-600',
          border: 'border-red-200',
          accent: 'bg-red-100'
        };
      case MedicalSpecialty.OBGYN:
        return {
          primary: 'text-pink-600',
          primaryBg: 'bg-pink-600',
          primaryLight: 'bg-pink-50',
          primaryGradient: 'from-pink-500 to-pink-600',
          border: 'border-pink-200',
          accent: 'bg-pink-100'
        };
      default:
        return {
          primary: 'text-blue-600',
          primaryBg: 'bg-blue-600',
          primaryLight: 'bg-blue-50',
          primaryGradient: 'from-blue-500 to-blue-600',
          border: 'border-blue-200',
          accent: 'bg-blue-100'
        };
    }
  };

  const theme = getSpecialtyTheme();

  // Load documents
  const loadDocuments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const queryOptions: DocumentListParams = {
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      if (filters.searchTerm.trim()) {
        queryOptions.search = filters.searchTerm.trim();
      }

      if (filters.category !== 'all') {
        queryOptions.category = filters.category;
      }

      if (filters.tags.length > 0) {
        queryOptions.tags = filters.tags;
      }

      const [result, loadError] = await safeAsync(async () => {
        return await listUserDocuments(queryOptions);
      }, {
        context: 'loading user documents from knowledge base',
        severity: ErrorSeverity.MEDIUM,
        showToast: true
      });

      if (loadError) {
        setError(loadError.userMessage || 'Failed to load documents');
      } else {
        const convertedDocs = result.documents.map(convertUserDocumentToLegacy);
        console.log('🔍 PREMIUM CONVERTED DOCUMENTS FOR GROUPING:', convertedDocs.map(d => ({
          id: d.id,
          title: d.title,
          tags: d.tags,
          isChunked: d.tags?.includes('chunked-document')
        })));
        
        const documentGroups = groupDocuments(convertedDocs);
        
        setState(prev => ({
          ...prev,
          documents: convertedDocs,
          documentGroups: documentGroups
        }));
        setTotal(result.total);
        setHasMore(result.hasMore);
        setPersonalDocumentCount(result.total);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents when filters change
  useEffect(() => {
    loadDocuments();
  }, [user, filters]);

  // Filtered and sorted document groups
  const processedDocumentGroups = useMemo(() => {
    let filteredGroups = [...state.documentGroups];

    // Apply filters to groups
    filteredGroups = filteredGroups.filter(group => {
      // Check if any document in the group matches date range filters
      const matchesDateRange = group.documents.some(doc => {
        let matches = true;
        
        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          matches = matches && new Date(doc.created_at) >= fromDate;
        }
        
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          matches = matches && new Date(doc.created_at) <= toDate;
        }
        
        return matches;
      });
      
      return matchesDateRange;
    });

    // Sort groups
    filteredGroups.sort((a, b) => {
      let comparison = 0;
      
      // For sorting, use the primary document (first for chunked, only for regular)
      const aPrimary = a.documents[0];
      const bPrimary = b.documents[0];
      
      switch (state.sortBy) {
        case 'name':
          comparison = a.baseTitle.localeCompare(b.baseTitle);
          break;
        case 'date':
          const aLatest = Math.max(...a.documents.map(d => new Date(d.created_at).getTime()));
          const bLatest = Math.max(...b.documents.map(d => new Date(d.created_at).getTime()));
          comparison = aLatest - bLatest;
          break;
        case 'size':
          const aTotalSize = a.documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
          const bTotalSize = b.documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
          comparison = aTotalSize - bTotalSize;
          break;
        case 'type':
          comparison = aPrimary.file_type.localeCompare(bPrimary.file_type);
          break;
        case 'category':
          comparison = aPrimary.category.localeCompare(bPrimary.category);
          break;
        default:
          const aDefaultLatest = Math.max(...a.documents.map(d => new Date(d.created_at).getTime()));
          const bDefaultLatest = Math.max(...b.documents.map(d => new Date(d.created_at).getTime()));
          comparison = aDefaultLatest - bDefaultLatest;
      }
      
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredGroups;
  }, [state.documentGroups, filters, state.sortBy, state.sortOrder]);

  // Get flattened documents for stats
  const processedDocuments = useMemo(() => {
    return processedDocumentGroups.flatMap(group => group.documents);
  }, [processedDocumentGroups]);

  // Document stats
  const documentStats = useMemo(() => {
    const stats = {
      total: processedDocuments.length,
      completed: processedDocuments.filter(doc => doc.upload_status === 'completed').length,
      pending: processedDocuments.filter(doc => doc.upload_status === 'pending' || doc.upload_status === 'uploading').length,
      failed: processedDocuments.filter(doc => doc.upload_status === 'failed').length,
      totalSize: processedDocuments.reduce((acc, doc) => acc + (doc.file_size || 0), 0),
      categories: {} as Record<string, number>,
      recentUploads: processedDocuments.filter(doc => {
        const uploadDate = new Date(doc.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return uploadDate > weekAgo;
      }).length
    };
    
    // Calculate category distribution
    processedDocuments.forEach(doc => {
      stats.categories[doc.category] = (stats.categories[doc.category] || 0) + 1;
    });
    
    return stats;
  }, [processedDocuments]);

  // Handle document actions
  const handleUploadSuccess = async () => {
    setShowUpload(false);
    await loadDocuments();
  };

  const handleDocumentSelect = (documentId: string) => {
    setState(prev => ({
      ...prev,
      selectedDocuments: prev.selectedDocuments.has(documentId)
        ? new Set([...prev.selectedDocuments].filter(id => id !== documentId))
        : new Set([...prev.selectedDocuments, documentId])
    }));
  };

  const handleSelectAll = () => {
    setState(prev => ({
      ...prev,
      selectedDocuments: prev.selectedDocuments.size === processedDocuments.length
        ? new Set()
        : new Set(processedDocuments.map(doc => doc.id))
    }));
  };

  const toggleGroup = (groupId: string) => {
    setState(prev => ({
      ...prev,
      expandedGroups: prev.expandedGroups.has(groupId)
        ? new Set([...prev.expandedGroups].filter(id => id !== groupId))
        : new Set([...prev.expandedGroups, groupId])
    }));
  };

  const handleDeleteDocument = async (documentId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    const [result, deleteError] = await safeAsync(async () => {
      return await deleteUserDocument({ documentId, deleteFromOpenAI: true });
    }, {
      context: `deleting document "${title}" from knowledge base`,
      severity: ErrorSeverity.HIGH,
      showToast: true
    });

    if (deleteError) {
      setError(deleteError.userMessage || 'Failed to delete document');
      return;
    }
      
    if (result.partialSuccess) {
      const warningDetails = [];
      if (result.cleanupResults?.vectorStoreRemoval?.attempted && !result.cleanupResults.vectorStoreRemoval.success) {
        warningDetails.push('- Failed to remove from OpenAI Vector Store');
      }
      if (result.cleanupResults?.openaiFileDeletion?.attempted && !result.cleanupResults.openaiFileDeletion.success) {
        warningDetails.push('- Failed to delete from OpenAI Files');
      }
      if (result.cleanupResults?.storageDeletion?.attempted && !result.cleanupResults.storageDeletion.success) {
        warningDetails.push('- Failed to remove from storage');
      }
      
      const warningMessage = `Document "${title}" was removed, but some cleanup operations failed:\n\n${warningDetails.join('\n')}`;
      alert(warningMessage);
    }
    
    await loadDocuments();
    if (selectedDocument && selectedDocument.id === documentId) {
      setSelectedDocument(null);
    }
  };

  const handleViewDocument = async (document: DocumentWithMetadata) => {
    setSelectedDocument(document);
  };

  const handleDownloadDocument = (document: DocumentWithMetadata) => {
    // Implement download functionality
  };

  const handleRefresh = () => {
    loadDocuments();
  };

  // Command palette commands
  const commandPaletteCommands = useMemo(() => [
    {
      id: 'upload',
      label: 'Upload Documents',
      description: 'Add new documents to your library',
      icon: <Upload className="w-4 h-4" />,
      action: () => setShowUpload(true),
      keywords: ['upload', 'add', 'new', 'document'],
      category: 'actions' as const,
      shortcut: 'Cmd+U'
    },
    {
      id: 'search',
      label: 'Advanced Search',
      description: 'Open advanced search and filters',
      icon: <Search className="w-4 h-4" />,
      action: () => setShowAdvancedSearch(true),
      keywords: ['search', 'filter', 'find'],
      category: 'search' as const,
      shortcut: 'Cmd+F'
    },
    {
      id: 'refresh',
      label: 'Refresh Library',
      description: 'Reload all documents',
      icon: <RefreshCw className="w-4 h-4" />,
      action: handleRefresh,
      keywords: ['refresh', 'reload', 'update'],
      category: 'actions' as const,
      shortcut: 'Cmd+R'
    },
    {
      id: 'grid-view',
      label: 'Grid View',
      description: 'Switch to grid layout',
      icon: <Grid className="w-4 h-4" />,
      action: () => setState(prev => ({ ...prev, viewMode: 'grid' })),
      keywords: ['grid', 'view', 'layout'],
      category: 'view' as const,
      shortcut: 'G'
    },
    {
      id: 'list-view',
      label: 'List View',
      description: 'Switch to list layout',
      icon: <List className="w-4 h-4" />,
      action: () => setState(prev => ({ ...prev, viewMode: 'list' })),
      keywords: ['list', 'view', 'layout'],
      category: 'view' as const,
      shortcut: 'L'
    },
    {
      id: 'select-all',
      label: 'Select All Documents',
      description: 'Select all visible documents',
      icon: <CheckCircle className="w-4 h-4" />,
      action: handleSelectAll,
      keywords: ['select', 'all', 'documents'],
      category: 'actions' as const,
      shortcut: 'Cmd+A'
    },
    {
      id: 'sort-name',
      label: 'Sort by Name',
      description: 'Sort documents alphabetically',
      icon: <SortAsc className="w-4 h-4" />,
      action: () => setState(prev => ({ ...prev, sortBy: 'name', sortOrder: 'asc' })),
      keywords: ['sort', 'name', 'alphabetical'],
      category: 'view' as const
    },
    {
      id: 'sort-date',
      label: 'Sort by Date',
      description: 'Sort documents by upload date',
      icon: <Calendar className="w-4 h-4" />,
      action: () => setState(prev => ({ ...prev, sortBy: 'date', sortOrder: 'desc' })),
      keywords: ['sort', 'date', 'time'],
      category: 'view' as const
    }
  ], [handleRefresh, handleSelectAll]);

  // Available categories for advanced search
  const availableCategories = useMemo(() => [
    { value: 'research-papers', label: 'Research Papers', count: documentStats.categories['research-papers'] || 0 },
    { value: 'clinical-guidelines', label: 'Clinical Guidelines', count: documentStats.categories['clinical-guidelines'] || 0 },
    { value: 'case-studies', label: 'Case Studies', count: documentStats.categories['case-studies'] || 0 },
    { value: 'protocols', label: 'Protocols', count: documentStats.categories['protocols'] || 0 },
    { value: 'reference-materials', label: 'Reference Materials', count: documentStats.categories['reference-materials'] || 0 },
    { value: 'personal-notes', label: 'Personal Notes', count: documentStats.categories['personal-notes'] || 0 },
    { value: 'other', label: 'Other', count: documentStats.categories['other'] || 0 }
  ], [documentStats.categories]);

  const availableFileTypes = useMemo(() => [
    { value: 'pdf', label: 'PDF', count: processedDocuments.filter(d => d.file_type.includes('pdf')).length },
    { value: 'image', label: 'Images', count: processedDocuments.filter(d => d.file_type.includes('image')).length },
    { value: 'doc', label: 'Documents', count: processedDocuments.filter(d => d.file_type.includes('doc')).length },
    { value: 'spreadsheet', label: 'Spreadsheets', count: processedDocuments.filter(d => d.file_type.includes('sheet')).length }
  ], [processedDocuments]);

  const availableTags = useMemo(() => {
    const allTags = new Set<string>();
    processedDocuments.forEach(doc => {
      doc.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }, [processedDocuments]);

  // View mode configurations
  const getGridClasses = () => {
    switch (state.displayDensity) {
      case 'compact':
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3';
      case 'comfortable':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 'spacious':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access your personal knowledge base.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Hero Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {/* Total Documents */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Library</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{documentStats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">documents</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.primaryGradient} shadow-lg`}>
                  <Archive className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Ready</p>
                  <p className="text-3xl font-bold text-green-600">{documentStats.completed}</p>
                  <p className="text-xs text-green-500 mt-1">processed</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Processing */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Processing</p>
                  <p className="text-3xl font-bold text-amber-600">{documentStats.pending}</p>
                  <p className="text-xs text-amber-500 mt-1">in queue</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                  <Activity className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>
            </div>

            {/* Storage Used */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg backdrop-blur-sm col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Storage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatFileSize(documentStats.totalSize)}</p>
                  <p className="text-xs text-gray-500 mt-1">total used</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Advanced Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-4"
          >
            {/* Primary Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpload(true)}
                className={`
                  px-6 py-3 rounded-xl font-semibold text-white shadow-lg
                  bg-gradient-to-r ${theme.primaryGradient}
                  hover:shadow-xl hover:scale-105 transition-all duration-300
                  flex items-center space-x-2
                `}
              >
                <Upload className="w-5 h-5" />
                <span>Upload Documents</span>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your knowledge base..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2">
              {/* Advanced Search Toggle */}
              <div className="relative">
                <MagneticButton
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className={`
                    p-3 rounded-xl border transition-all duration-200
                    ${showAdvancedSearch 
                      ? `${theme.primaryBg} text-white border-transparent shadow-lg` 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <MorphingIcon
                    icon1={<Filter className="w-5 h-5" />}
                    icon2={<Sparkles className="w-5 h-5" />}
                    isToggled={showAdvancedSearch}
                    className="w-5 h-5"
                  />
                </MagneticButton>
              </div>

              {/* Sort Options */}
              <div className="relative">
                <button
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <ArrowUpDown className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showSortOptions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-2">
                        <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sort By</p>
                        {['name', 'date', 'size', 'type', 'category'].map((sortOption) => (
                          <button
                            key={sortOption}
                            onClick={() => {
                              setState(prev => ({ 
                                ...prev, 
                                sortBy: sortOption as SortBy,
                                sortOrder: prev.sortBy === sortOption && prev.sortOrder === 'asc' ? 'desc' : 'asc'
                              }));
                              setShowSortOptions(false);
                            }}
                            className={`
                              w-full px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                              flex items-center justify-between
                              ${state.sortBy === sortOption ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
                            `}
                          >
                            <span className="capitalize">{sortOption}</span>
                            {state.sortBy === sortOption && (
                              <div className="flex items-center">
                                {state.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Mode */}
              <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-1">
                <button
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${state.viewMode === 'grid'
                      ? `${theme.primaryBg} text-white`
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${state.viewMode === 'list'
                      ? `${theme.primaryBg} text-white`
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Display Options */}
              <div className="relative">
                <button
                  onClick={() => setShowViewOptions(!showViewOptions)}
                  className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showViewOptions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute top-full mt-2 right-0 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-4 space-y-4">
                        {/* Display Density */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Display Density</p>
                          <div className="space-y-1">
                            {(['compact', 'comfortable', 'spacious'] as DisplayDensity[]).map((density) => (
                              <button
                                key={density}
                                onClick={() => setState(prev => ({ ...prev, displayDensity: density }))}
                                className={`
                                  w-full px-3 py-2 rounded-lg text-left text-sm transition-colors
                                  ${state.displayDensity === density 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }
                                `}
                              >
                                <span className="capitalize">{density}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Toggle Options */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Show Metadata</span>
                            <button
                              onClick={() => setState(prev => ({ ...prev, showMetadata: !prev.showMetadata }))}
                              className={`
                                w-10 h-6 rounded-full transition-colors relative
                                ${state.showMetadata ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                              `}
                            >
                              <div className={`
                                w-4 h-4 rounded-full bg-white transition-transform absolute top-1
                                ${state.showMetadata ? 'translate-x-5' : 'translate-x-1'}
                              `} />
                            </button>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Selection Controls */}
          <AnimatePresence>
            {state.selectedDocuments.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {state.selectedDocuments.size} document{state.selectedDocuments.size !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                    >
                      {state.selectedDocuments.size === processedDocuments.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={() => setState(prev => ({ ...prev, selectedDocuments: new Set() }))}
                      className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced Search */}
          <AdvancedSearch
            filters={filters}
            onFiltersChange={setFilters}
            availableTags={availableTags}
            availableCategories={availableCategories}
            availableFileTypes={availableFileTypes}
            totalDocuments={total}
            filteredDocuments={processedDocuments.length}
            isOpen={showAdvancedSearch}
            onToggle={() => setShowAdvancedSearch(!showAdvancedSearch)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Error Loading Documents</h3>
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="mb-8">
                <PremiumLoader size="lg" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading your library...</h3>
              <p className="text-gray-600 dark:text-gray-400">Fetching your documents and organizing your knowledge base.</p>
              <div className="mt-6 max-w-xs mx-auto">
                <LiquidLoader progress={75} color="#3B82F6" />
              </div>
            </motion.div>
          </div>
        ) : processedDocumentGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {filters.searchTerm || filters.category !== 'all' || filters.tags.length > 0
                ? 'No documents match your search'
                : 'Your knowledge base awaits'
              }
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {filters.searchTerm || filters.category !== 'all' || filters.tags.length > 0
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Start building your personal medical knowledge library by uploading your first document.'
              }
            </p>
            {(!filters.searchTerm && filters.category === 'all' && filters.tags.length === 0) && (
              <button
                onClick={() => setShowUpload(true)}
                className={`
                  px-8 py-4 rounded-xl font-semibold text-white shadow-lg
                  bg-gradient-to-r ${theme.primaryGradient}
                  hover:shadow-xl hover:scale-105 transition-all duration-300
                  flex items-center space-x-2 mx-auto
                `}
              >
                <Upload className="w-5 h-5" />
                <span>Upload Your First Document</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {processedDocumentGroups.length} item{processedDocumentGroups.length !== 1 ? 's' : ''} 
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({processedDocuments.length} document{processedDocuments.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                {total > processedDocuments.length && (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm rounded-full">
                    Showing first {processedDocuments.length} of {total} documents
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Documents Grid/List */}
            {state.viewMode === 'grid' ? (
              <StaggeredGrid
                className={`grid ${getGridClasses()}`}
                staggerDelay={0.05}
              >
                {processedDocumentGroups.map((group, index) => (
                  group.isChunked ? (
                    <ChunkedDocumentCard
                      key={group.id}
                      group={group}
                      viewMode={state.viewMode}
                      displayDensity={state.displayDensity}
                      isExpanded={state.expandedGroups.has(group.id)}
                      selectedDocuments={state.selectedDocuments}
                      onToggle={() => toggleGroup(group.id)}
                      onView={handleViewDocument}
                      onDelete={handleDeleteDocument}
                      onSelect={handleDocumentSelect}
                      index={index}
                    />
                  ) : (
                    <DocumentCard
                      key={group.documents[0].id}
                      document={group.documents[0]}
                      viewMode={state.viewMode}
                      displayDensity={state.displayDensity}
                      isSelected={state.selectedDocuments.has(group.documents[0].id)}
                      showMetadata={state.showMetadata}
                      onSelect={handleDocumentSelect}
                      onView={() => handleViewDocument(group.documents[0])}
                      onDelete={() => handleDeleteDocument(group.documents[0].id, group.documents[0].title)}
                      onDownload={() => handleDownloadDocument(group.documents[0])}
                      index={index}
                    />
                  )
                ))}
              </StaggeredGrid>
            ) : (
              <div className="space-y-3">
                {processedDocumentGroups.map((group, index) => (
                  group.isChunked ? (
                    <ChunkedDocumentCard
                      key={group.id}
                      group={group}
                      viewMode={state.viewMode}
                      displayDensity={state.displayDensity}
                      isExpanded={state.expandedGroups.has(group.id)}
                      selectedDocuments={state.selectedDocuments}
                      onToggle={() => toggleGroup(group.id)}
                      onView={handleViewDocument}
                      onDelete={handleDeleteDocument}
                      onSelect={handleDocumentSelect}
                      index={index}
                    />
                  ) : (
                    <DocumentCard
                      key={group.documents[0].id}
                      document={group.documents[0]}
                      viewMode={state.viewMode}
                      displayDensity={state.displayDensity}
                      isSelected={state.selectedDocuments.has(group.documents[0].id)}
                      showMetadata={state.showMetadata}
                      onSelect={handleDocumentSelect}
                      onView={() => handleViewDocument(group.documents[0])}
                      onDelete={() => handleDeleteDocument(group.documents[0].id, group.documents[0].title)}
                      onDownload={() => handleDownloadDocument(group.documents[0])}
                      index={index}
                    />
                  )
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Documents</h2>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <DocumentUpload 
                  onClose={() => setShowUpload(false)}
                  onUploadSuccess={handleUploadSuccess}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Details Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              <DocumentDetails
                document={selectedDocument}
                isOpen={true}
                onClose={() => setSelectedDocument(null)}
                onDelete={async () => {
                  await handleDeleteDocument(selectedDocument.id, selectedDocument.title);
                }}
                onDownload={() => handleDownloadDocument(selectedDocument)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        commands={commandPaletteCommands}
      />

      {/* Floating Action Buttons */}
      <FloatingActionButton
        icon={<Upload className="w-6 h-6" />}
        onClick={() => setShowUpload(true)}
        position="bottom-right"
        variant="primary"
        tooltip="Upload Documents (⌘+U)"
      />
      
      <FloatingActionButton
        icon={<Command className="w-6 h-6" />}
        onClick={openCommandPalette}
        position="bottom-left"
        variant="secondary"
        tooltip="Command Palette (⌘+K)"
      />

      {/* Floating Particles Background */}
      <FloatingParticles count={30} speed={15} color={theme.primaryBg.replace('bg-', '#')} />
    </div>
  );
};