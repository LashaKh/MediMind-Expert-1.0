import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, FileText, Search, Calendar, Filter, Trash2, Eye, Star, Clock, 
  Activity, Brain, Heart, Stethoscope, ArrowRight, MoreHorizontal,
  Download, Share2, Archive, Copy, Tag, Users, TrendingUp, Zap,
  Grid3X3, List, SortAsc, SortDesc, Plus, Sparkles, ChevronDown,
  AlertTriangle, CheckCircle, Clock4, User, Shield, MessageSquare
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { PatientCase } from '../../types/chat';
import { useTranslation } from '../../hooks/useTranslation';
import { useChat } from '../../stores/useAppStore';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface CaseListModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: PatientCase[];
  onCaseSelect: (caseItem: PatientCase) => void;
  activeCase?: PatientCase | null;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'title' | 'complexity' | 'status';
type FilterStatus = 'all' | 'active' | 'archived' | 'review';

export const CaseListModal: React.FC<CaseListModalProps> = ({
  isOpen,
  onClose,
  cases,
  onCaseSelect,
  activeCase,
  className = ''
}) => {
  const { t } = useTranslation();
  const { deleteCase } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ case: PatientCase } | null>(null);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Filter and sort cases with advanced logic
  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(caseItem =>
        caseItem.title.toLowerCase().includes(searchLower) ||
        caseItem.description.toLowerCase().includes(searchLower) ||
        caseItem.anonymizedInfo.toLowerCase().includes(searchLower) ||
        caseItem.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ) ||
        caseItem.metadata?.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(caseItem => caseItem.status === filter);
    }

    // Apply sorting with sophisticated logic
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'complexity':
          const complexityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
          const aComplexity = a.metadata?.complexity || 'medium';
          const bComplexity = b.metadata?.complexity || 'medium';
          return (complexityOrder[bComplexity] || 2) - (complexityOrder[aComplexity] || 2);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [cases, searchTerm, filter, sortBy]);

  const handleCaseClick = (caseItem: PatientCase) => {
    onCaseSelect(caseItem);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent, caseItem: PatientCase) => {
    e.stopPropagation();
    setShowDeleteConfirm({ case: caseItem });
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;
    
    const caseToDelete = showDeleteConfirm.case;
    setIsDeleting(caseToDelete.id);
    
    const [, error] = await safeAsync(
      async () => await deleteCase(caseToDelete.id),
      {
        context: 'delete patient case',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      // Error is already handled by the standardized system
      // Just ensure we reset the deletion state
    } else {
      setShowDeleteConfirm(null);
    }
    
    setIsDeleting(null);
  };

  const getComplexityConfig = (complexity: 'low' | 'medium' | 'high') => {
    switch (complexity) {
      case 'low':
        return {
          color: 'emerald',
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-700',
          icon: CheckCircle,
          gradient: 'from-emerald-400 to-green-500'
        };
      case 'medium':
        return {
          color: 'amber',
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-700',
          icon: Clock4,
          gradient: 'from-amber-400 to-orange-500'
        };
      case 'high':
        return {
          color: 'red',
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-700',
          icon: AlertTriangle,
          gradient: 'from-red-400 to-rose-500'
        };
      default:
        return {
          color: 'gray',
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-700',
          icon: Clock4,
          gradient: 'from-gray-400 to-slate-500'
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'blue', icon: Activity, label: 'Active' };
      case 'archived':
        return { color: 'gray', icon: Archive, label: 'Archived' };
      case 'review':
        return { color: 'amber', icon: Eye, label: 'In Review' };
      default:
        return { color: 'gray', icon: Clock, label: status };
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Revolutionary Backdrop with Gradient Animation */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15), rgba(0, 0, 0, 0.4)),
            linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6))
          `,
          backdropFilter: 'blur(24px) saturate(180%) contrast(120%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%) contrast(120%)',
          animation: 'backdropFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={onClose}
      >
        {/* World-Class Modal Container */}
        <div 
          ref={modalRef}
          className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden
                     transform transition-all duration-700 ease-out"
          style={{
            background: `
              linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%),
              radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 60%),
              radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.06), transparent 60%)
            `,
            borderRadius: '32px',
            boxShadow: `
              0 32px 64px -12px rgba(0, 0, 0, 0.35),
              0 0 0 1px rgba(255, 255, 255, 0.8),
              inset 0 1px 0 rgba(255, 255, 255, 1),
              0 0 200px -40px rgba(59, 130, 246, 0.3)
            `,
            animation: 'modalSlideIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Prismatic Border Effects */}
          <div className="absolute inset-0 rounded-[32px] p-px bg-gradient-to-br from-white via-blue-100 to-purple-100 opacity-60" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          
          {/* Revolutionary Header */}
          <div className="relative z-10 p-8 pb-6 border-b border-white/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-500" />
                  <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
                    Case Study Library
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span className="text-lg font-medium">
                      {filteredAndSortedCases.length} of {cases.length} cases
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm">Real-time sync</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={onClose}
                variant="ghost"
                size="lg"
                className="p-3 rounded-2xl hover:bg-gray-100/80 transition-all duration-300 hover:scale-105 hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Revolutionary Search and Filters */}
            <div className="mt-8 space-y-6">
              {/* Premium Search Bar */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search cases by title, patient, diagnosis, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 text-lg border-0 rounded-2xl
                             bg-white/70 backdrop-blur-xl shadow-lg
                             focus:outline-none focus:ring-4 focus:ring-blue-500/20
                             transition-all duration-300 placeholder-gray-400
                             hover:shadow-xl hover:bg-white/80"
                    style={{
                      boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.03), 0 8px 32px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                </div>
              </div>

              {/* Premium Filters and Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as FilterStatus)}
                      className="appearance-none bg-white/80 backdrop-blur-xl border-0 rounded-xl px-6 py-3 pr-12
                               text-gray-700 font-medium shadow-lg hover:shadow-xl transition-all duration-300
                               focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.02), 0 6px 20px rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Cases</option>
                      <option value="archived">Archived</option>
                      <option value="review">In Review</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>

                  {/* Sort Filter */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="appearance-none bg-white/80 backdrop-blur-xl border-0 rounded-xl px-6 py-3 pr-12
                               text-gray-700 font-medium shadow-lg hover:shadow-xl transition-all duration-300
                               focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.02), 0 6px 20px rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Alphabetical</option>
                      <option value="complexity">By Complexity</option>
                      <option value="status">By Status</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-xl rounded-xl p-1 shadow-lg">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Cases Display */}
                     <div className="flex-1 overflow-y-auto p-8 case-library-scrollbar">
            {filteredAndSortedCases.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl opacity-60" />
                  <div className="relative w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                    <FileText className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm || filter !== 'all' ? 'No Cases Found' : 'No Cases Yet'}
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                    : 'Start building your case library by creating your first medical case study.'
                  }
                </p>
              </div>
            ) : (
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-4'
                }
              `}>
                                 {filteredAndSortedCases.map((caseItem) => {
                   const complexityConfig = getComplexityConfig(caseItem.metadata?.complexity || 'medium');
                   const statusConfig = getStatusConfig(caseItem.status);
                   const isActive = activeCase?.id === caseItem.id;
                   const isHovered = hoveredCase === caseItem.id;
                  
                  return (
                    <div
                      key={caseItem.id}
                      onClick={() => handleCaseClick(caseItem)}
                      onMouseEnter={() => setHoveredCase(caseItem.id)}
                      onMouseLeave={() => setHoveredCase(null)}
                      className={`
                        group relative cursor-pointer transition-all duration-500 ease-out
                        ${viewMode === 'grid' ? 'aspect-[4/3]' : 'h-auto'}
                        ${isActive 
                          ? 'scale-105 z-10' 
                          : isHovered 
                            ? 'scale-102 z-5' 
                            : 'scale-100'
                        }
                      `}
                      style={{
                        transform: isActive 
                          ? 'scale(1.02) translateY(-8px)' 
                          : isHovered 
                            ? 'scale(1.01) translateY(-4px)' 
                            : 'scale(1) translateY(0px)',
                        filter: isActive ? 'brightness(1.05)' : 'brightness(1)'
                      }}
                    >
                      {/* Premium Card Container */}
                      <div className={`
                        relative h-full p-6 rounded-3xl overflow-hidden
                        transition-all duration-500 ease-out
                        ${isActive 
                          ? 'ring-4 ring-blue-500/40 shadow-2xl shadow-blue-500/25' 
                          : 'shadow-lg hover:shadow-2xl'
                        }
                      `}
                      style={{
                        background: `
                          linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%),
                          radial-gradient(circle at top right, rgba(${complexityConfig.color === 'emerald' ? '16, 185, 129' : complexityConfig.color === 'amber' ? '245, 158, 11' : '239, 68, 68'}, 0.05), transparent 50%)
                        `,
                        border: `1px solid rgba(255, 255, 255, ${isActive ? '0.8' : '0.4'})`,
                        boxShadow: isActive 
                          ? `0 25px 50px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)`
                          : `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
                      }}>
                        {/* Gradient Orbs */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${complexityConfig.gradient} opacity-10 rounded-full blur-2xl`} />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-5 rounded-full blur-xl" />
                        
                        {/* Card Header */}
                        <div className="relative z-10 flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${complexityConfig.gradient} shadow-lg`}>
                              <complexityConfig.icon className="w-4 h-4 text-white" />
                            </div>
                                                         <div className={`px-3 py-1 rounded-full text-xs font-semibold ${complexityConfig.bg} ${complexityConfig.text} border`}>
                               {(caseItem.metadata?.complexity || 'medium').toUpperCase()}
                             </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={(e) => handleDeleteClick(e, caseItem)}
                              variant="ghost"
                              size="sm"
                              className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Case Content */}
                        <div className="relative z-10 space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                              {caseItem.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                              {caseItem.description}
                            </p>
                          </div>

                                                     {/* Case Info */}
                           {caseItem.metadata?.category && (
                             <div className="flex items-center space-x-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                               <Activity className="w-4 h-4 text-blue-500" />
                               <span className="text-sm font-medium text-blue-700 capitalize">
                                 {caseItem.metadata.category}
                               </span>
                             </div>
                           )}

                          {/* Tags */}
                          {caseItem.metadata?.tags && caseItem.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {caseItem.metadata.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 text-xs font-medium bg-white/80 text-gray-700 rounded-full border border-gray-200 backdrop-blur-sm"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {caseItem.metadata.tags.length > 3 && (
                                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                                  +{caseItem.metadata.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="relative z-10 mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`flex items-center space-x-1 text-xs font-medium text-${statusConfig.color}-600`}>
                              <statusConfig.icon className="w-3 h-3" />
                              <span>{statusConfig.label}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(caseItem.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                        </div>

                        {/* Active Case Indicator */}
                        {isActive && (
                          <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span>ACTIVE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revolutionary Delete Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-lg"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[10001]">
            <div className="relative overflow-hidden rounded-3xl"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                   boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.8)',
                   animation: 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                 }}>
              
              {/* Header */}
              <div className="p-8 border-b border-red-100/60">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-60" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Trash2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      Delete Case Study
                    </h3>
                    <p className="text-gray-600">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 space-y-6">
                <div className="p-6 bg-red-50/80 border border-red-200/60 rounded-2xl backdrop-blur-sm">
                  <p className="text-gray-700 leading-relaxed">
                    You're about to permanently delete{' '}
                    <span className="font-bold text-red-700">
                      "{showDeleteConfirm.case.title}"
                    </span>
                    . All case data, conversations, and associated files will be removed from your library.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4">
                  <Button
                    onClick={() => setShowDeleteConfirm(null)}
                    variant="outline"
                    disabled={isDeleting === showDeleteConfirm.case.id}
                    className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-white/80 hover:bg-white border-gray-300 font-medium transition-all duration-300"
                  >
                    Keep Case
                  </Button>
                  <Button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting === showDeleteConfirm.case.id}
                    className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isDeleting === showDeleteConfirm.case.id ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Deleting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Permanently
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

    </>,
    document.body
  );
}; 