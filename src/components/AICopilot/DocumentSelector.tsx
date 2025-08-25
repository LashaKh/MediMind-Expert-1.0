import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, FileText, Image, Download, Eye, Check, Plus, Filter, Grid, List, Star, Clock, ArrowRight, ChevronDown, Sparkles, FileImage, FileVideo, FileAudio, File, Calendar, Tag, Folder, CheckCircle2, XCircle, SortAsc, SortDesc, LayoutGrid, LayoutList, Zap, Brain, FileCode, FileSpreadsheet, Presentation, Archive, BookOpen, Activity, Files } from 'lucide-react';
import { CaseAttachmentData } from '../../types/chat';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/button';
import '../../styles/responsive.css';

interface DocumentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  documents: CaseAttachmentData[];
  selectedDocuments: string[];
  onDocumentToggle: (documentId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'size' | 'date' | 'type';

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  isOpen,
  onClose,
  documents,
  selectedDocuments,
  onDocumentToggle,
  onSelectAll,
  onClearAll
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState<CaseAttachmentData[]>([]);
  const [previewDocument, setPreviewDocument] = useState<CaseAttachmentData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.category).filter(Boolean)))];

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!documents) return;
    
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.extractedText?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort documents
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fileName.localeCompare(b.fileName);
        case 'size':
          return b.fileSize - a.fileSize;
        case 'type':
          return a.fileType.localeCompare(b.fileType);
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, selectedCategory, sortBy]);

  const getFileIcon = (fileType: string) => {
    const iconClass = "w-5 h-5";
    if (fileType.startsWith('image/')) return <FileImage className={iconClass} />;
    if (fileType.startsWith('video/')) return <FileVideo className={iconClass} />;
    if (fileType.startsWith('audio/')) return <FileAudio className={iconClass} />;
    if (fileType.includes('pdf')) return <FileText className={iconClass} />;
    if (fileType.includes('word') || fileType.includes('doc')) return <BookOpen className={iconClass} />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FileSpreadsheet className={iconClass} />;
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <Presentation className={iconClass} />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <Archive className={iconClass} />;
    if (fileType.includes('code') || fileType.includes('json') || fileType.includes('xml')) return <FileCode className={iconClass} />;
    return <File className={iconClass} />;
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getFileTypeStyles = (fileType: string) => {
    if (fileType.includes('pdf')) return {
      bg: 'from-red-500 to-rose-600',
      text: 'text-red-600',
      lightBg: 'bg-red-50',
      border: 'border-red-200',
      glow: 'shadow-red-500/20'
    };
    if (fileType.includes('image')) return {
      bg: 'from-purple-500 to-pink-600',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50',
      border: 'border-purple-200',
      glow: 'shadow-purple-500/20'
    };
    if (fileType.includes('word') || fileType.includes('doc')) return {
      bg: 'from-blue-500 to-indigo-600',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200',
      glow: 'shadow-blue-500/20'
    };
    if (fileType.includes('excel') || fileType.includes('sheet')) return {
      bg: 'from-green-500 to-emerald-600',
      text: 'text-green-600',
      lightBg: 'bg-green-50',
      border: 'border-green-200',
      glow: 'shadow-green-500/20'
    };
    return {
      bg: 'from-gray-500 to-slate-600',
      text: 'text-gray-600',
      lightBg: 'bg-gray-50',
      border: 'border-gray-200',
      glow: 'shadow-gray-500/20'
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Use React Portal to render modal at document body level
  return createPortal(
    <>
      {/* Premium Overlay with Animated Gradient */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={onClose}
      >
        {/* Modal Container - World-Class Design */}
        <div 
          className="relative w-full max-w-4xl max-h-[85vh] min-h-[600px] overflow-hidden
                     transform transition-all duration-500 ease-out
                     rounded-3xl shadow-2xl"
          style={{
            background: `
              linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%),
              radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 50%),
              radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.1), transparent 50%)
            `,
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.5),
              inset 0 0 0 1px rgba(255, 255, 255, 0.9),
              0 0 120px -20px rgba(59, 130, 246, 0.4)
            `,
            transform: 'scale(1)',
            animation: 'modalSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Premium Header with Glass Effect */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
            <div className="relative px-8 py-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Animated Icon Container */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-white shadow-lg">
                      <Files className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Title Section */}
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Document Library
                    </h2>
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      Enhance your AI conversation with relevant medical documents
                    </p>
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex items-center gap-4">
                  {/* Selection Counter */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      {selectedDocuments.length} of {documents.length} selected
                    </span>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="group p-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 
                             hover:bg-white/70 hover:border-gray-300/50 hover:shadow-lg
                             transition-all duration-300 ease-out"
                  >
                    <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Section - Premium Design */}
          <div className="px-8 py-6 bg-gradient-to-b from-gray-50/50 to-white/50 border-b border-gray-200/20">
            {/* Search Bar */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400" />
                  <div className="absolute inset-0 w-5 h-5 bg-blue-500/20 blur-xl" />
                </div>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, type, or content..."
                value={searchTerm}
                onChange={(E) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200/50 rounded-2xl 
                         focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300
                         bg-white/80 backdrop-blur-sm hover:border-gray-300/50 hover:shadow-lg
                         placeholder-gray-400 font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                           hover:bg-gray-100 transition-all duration-200 group"
                >
                  <XCircle className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Advanced Controls */}
            <div className="flex items-center justify-between gap-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onSelectAll}
                  className="group relative px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                           rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25
                           hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105
                           transition-all duration-300 ease-out overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Select All
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                
                {selectedDocuments.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="group px-4 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 
                             text-gray-700 rounded-xl font-medium text-sm shadow-sm
                             hover:bg-gray-50 hover:border-gray-300/50 hover:shadow-md hover:scale-105
                             transition-all duration-300 ease-out"
                  >
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Clear All
                    </span>
                  </button>
                )}
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm 
                             border-2 border-gray-200/50 rounded-xl hover:border-gray-300/50
                             hover:shadow-md transition-all duration-300 group"
                  >
                    <SortAsc className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      Sort by {sortBy}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Stats */}
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-600">
                  {filteredDocuments.length} documents found
                </span>
              </div>
              {searchTerm && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Filtered by "{searchTerm}"
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Documents Grid/List - Premium Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar" 
               style={{ 
                 maxHeight: 'calc(85vh - 320px)',
                 scrollbarWidth: 'thin',
                 scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
               }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {filteredDocuments.map((doc, index) => {
                  const fileStyles = getFileTypeStyles(doc.fileType);
                  const isSelected = selectedDocuments.includes(doc.id);
                  
                  return (
                    <div
                      key={doc.id}
                      className={`group relative cursor-pointer transition-all duration-500 ease-out
                                 transform hover:scale-105 hover:-translate-y-1`}
                      onClick={() => onDocumentToggle(doc.id)}
                      style={{
                        animation: `fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`
                      }}
                    >
                      {/* Card Container */}
                      <div className={`relative h-full p-6 rounded-2xl border-2 overflow-hidden
                                      ${isSelected 
                                        ? 'border-blue-500/50 bg-gradient-to-br from-blue-50 to-indigo-50' 
                                        : 'border-gray-200/50 bg-white hover:border-gray-300/50'
                                      }
                                      shadow-lg hover:shadow-2xl transition-all duration-500`}
                      >
                        {/* Selection Checkmark */}
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 
                                       flex items-center justify-center transition-all duration-300
                                       ${isSelected 
                                         ? 'border-blue-500 bg-blue-500 scale-110' 
                                         : 'border-gray-300 bg-white group-hover:border-blue-400'
                                       }`}>
                          {isSelected && (
                            <Check className="w-3 h-3 text-white animate-checkIn" />
                          )}
                        </div>

                        {/* File Icon with Gradient Background */}
                        <div className="relative mb-4">
                          <div className={`absolute inset-0 bg-gradient-to-br ${fileStyles.bg} 
                                         rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 
                                         transition-opacity duration-500`} />
                          <div className={`relative w-14 h-14 bg-gradient-to-br ${fileStyles.bg} 
                                         rounded-2xl flex items-center justify-center text-white
                                         shadow-lg ${fileStyles.glow} group-hover:shadow-xl
                                         transition-all duration-500`}>
                            {getFileIcon(doc.fileType)}
                          </div>
                        </div>

                        {/* Document Info */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 text-base line-clamp-2 
                                       group-hover:text-gray-800 transition-colors duration-300">
                            {doc.fileName}
                          </h4>
                          
                          {/* Meta Info */}
                          <div className="flex items-center gap-3 text-sm">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 
                                           ${fileStyles.lightBg} ${fileStyles.text} 
                                           rounded-lg font-medium`}>
                              {doc.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                            <span className="text-gray-500 font-medium">
                              {getFileSize(doc.fileSize)}
                            </span>
                          </div>

                          {/* Extract Preview if available */}
                          {doc.extractedText && (
                            <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                              {doc.extractedText.slice(0, 100)}...
                            </p>
                          )}
                        </div>

                        {/* Hover Effect Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${fileStyles.bg} 
                                       opacity-0 group-hover:opacity-5 rounded-2xl
                                       transition-opacity duration-500 pointer-events-none`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {filteredDocuments.map((doc, index) => {
                  const fileStyles = getFileTypeStyles(doc.fileType);
                  const isSelected = selectedDocuments.includes(doc.id);
                  
                  return (
                    <div
                      key={doc.id}
                      className={`group relative cursor-pointer transition-all duration-300 ease-out
                                 transform hover:translate-x-1`}
                      onClick={() => onDocumentToggle(doc.id)}
                      style={{
                        animation: `fadeInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.03}s both`
                      }}
                    >
                      <div className={`relative flex items-center gap-4 p-5 rounded-2xl border-2
                                      ${isSelected 
                                        ? 'border-blue-500/50 bg-gradient-to-r from-blue-50 to-indigo-50' 
                                        : 'border-gray-200/50 bg-white hover:border-gray-300/50'
                                      }
                                      shadow-md hover:shadow-xl transition-all duration-300`}
                      >
                        {/* File Icon */}
                        <div className="relative flex-shrink-0">
                          <div className={`absolute inset-0 bg-gradient-to-br ${fileStyles.bg} 
                                         rounded-xl blur-xl opacity-20 group-hover:opacity-30`} />
                          <div className={`relative w-12 h-12 bg-gradient-to-br ${fileStyles.bg} 
                                         rounded-xl flex items-center justify-center text-white
                                         shadow-lg ${fileStyles.glow}`}>
                            {getFileIcon(doc.fileType)}
                          </div>
                        </div>

                        {/* Document Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-base truncate
                                           group-hover:text-gray-800 transition-colors">
                                {doc.fileName}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 
                                               ${fileStyles.lightBg} ${fileStyles.text} 
                                               rounded-md text-xs font-medium`}>
                                  {doc.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {getFileSize(doc.fileSize)}
                                </span>
                                {doc.category && (
                                  <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <Folder className="w-3 h-3" />
                                    {doc.category}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Selection Checkbox */}
                            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0
                                           flex items-center justify-center transition-all duration-300
                                           ${isSelected 
                                             ? 'border-blue-500 bg-blue-500 scale-110' 
                                             : 'border-gray-300 bg-white group-hover:border-blue-400'
                                           }`}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-white animate-checkIn" />
                              )}
                            </div>
                          </div>
                          
                          {/* Preview Text */}
                          {doc.extractedText && (
                            <p className="text-sm text-gray-600 line-clamp-1 mt-2">
                              {doc.extractedText.slice(0, 150)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Premium Footer with Actions */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50/80 to-white/50" />
            <div className="relative px-8 py-6 border-t border-gray-200/20">
              <div className="flex items-center justify-between gap-6">
                {/* Selection Summary */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <div className="absolute inset-0 w-5 h-5 bg-blue-600/20 blur-lg" />
                    </div>
                    <span className="text-base font-semibold text-gray-800">
                      {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  
                  {selectedDocuments.length > 0 && (
                    <div className="h-4 w-px bg-gray-300" />
                  )}
                  
                  {selectedDocuments.length > 0 && (
                    <div className="flex -space-x-2">
                      {selectedDocuments.slice(0, 3).map((docId, idx) => {
                        const doc = documents.find(d => d.id === docId);
                        if (!doc) return null;
                        const styles = getFileTypeStyles(doc.fileType);
                        return (
                          <div
                            key={docId}
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${styles.bg} 
                                       flex items-center justify-center text-white text-xs
                                       border-2 border-white shadow-md`}
                            style={{ zIndex: 3 - idx }}
                          >
                            {doc.fileType.split('/')[1]?.charAt(0).toUpperCase() || 'F'}
                          </div>
                        );
                      })}
                      {selectedDocuments.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center 
                                       justify-center text-white text-xs font-bold
                                       border-2 border-white shadow-md">
                          +{selectedDocuments.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="group px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 
                             text-gray-700 rounded-2xl font-semibold text-sm shadow-sm
                             hover:bg-gray-50 hover:border-gray-300/50 hover:shadow-md
                             transition-all duration-300 ease-out"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={onClose}
                    disabled={selectedDocuments.length === 0}
                    className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                             text-white rounded-2xl font-semibold text-sm shadow-lg
                             shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30
                             hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:shadow-lg
                             transition-all duration-300 ease-out overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Enhance AI Context
                      {selectedDocuments.length > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-lg text-xs">
                          {selectedDocuments.length}
                        </span>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 
                                   opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <h4 className="font-medium text-gray-900 mb-1 text-sm">{previewDocument.fileName}</h4>
              <p className="text-xs text-gray-600 mb-3">
                {getFileSize(previewDocument.fileSize)}
              </p>
              <div className="text-xs text-gray-700 leading-relaxed">
                {previewDocument.extractedText ? (
                  <p className="whitespace-pre-wrap">{previewDocument.extractedText.slice(0, 500)}...</p>
                ) : (
                  <p className="text-gray-500 italic">No preview available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes checkIn {
          from {
            opacity: 0;
            transform: scale(0) rotate(-45deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        .animate-checkIn {
          animation: checkIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(156, 163, 175, 0.1);
          border-radius: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }

        /* Line clamp utilities */
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </>,
    document.getElementById('modal-root') || document.body
  );
};