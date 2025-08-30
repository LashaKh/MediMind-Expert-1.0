import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Check,
  AlertTriangle,
  Folder,
  Clock,
  Upload,
  Plus,
  X,
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../stores/useAppStore';
import { supabase } from '../../lib/supabase';
import SimplePodcastUpload from './SimplePodcastUpload';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface PodcastDocument {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  description?: string;
  tags: string[];
  openai_file_id: string | null;
  openai_upload_status: string;
  openai_upload_error: string | null;
  is_processed: boolean;
  supabase_public_url: string;
}

interface DocumentSelectorProps {
  selectedDocuments: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  specialty: string;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  selectedDocuments,
  onSelectionChange,
  specialty
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PodcastDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string>('');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [user?.id]);

  const fetchDocuments = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    const [data, error] = await safeAsync(
      async () => {
        const { data, error: fetchError } = await supabase
          .from('podcast_documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        return data || [];
      },
      {
        context: 'fetch podcast documents',
        severity: ErrorSeverity.MEDIUM
      }
    );

    if (error) {
      setError(error.userMessage || 'Failed to fetch documents');
    } else {
      setDocuments(data);
    }

    setLoading(false);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    return matchesSearch;
  });

  const handleDocumentToggle = (documentId: string) => {
    // Find the document to check its processing status
    const document = documents.find(doc => doc.id === documentId);
    
    // Only allow selection of completed documents
    if (document && document.openai_upload_status !== 'completed') {

      return;
    }
    
    const newSelection = selectedDocuments.includes(documentId)
      ? selectedDocuments.filter(id => id !== documentId)
      : [...selectedDocuments, documentId];
    
    onSelectionChange(newSelection);
  };

  const handleUploadComplete = async (documentId: string, publicUrl: string) => {
    
    // Add to selection
    onSelectionChange([...selectedDocuments, documentId]);
    
    // Refresh document list
    await fetchDocuments();
    
    // Close upload modal
    setShowUpload(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Compact Revolutionary Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: [0, -10, 10, 0] }}
            className="relative group"
          >
            {/* Compact glowing layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl blur-lg opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 rounded-xl shadow-xl border border-white/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          <div>
            <h3 className="text-lg font-black text-white">
              Select Documents
            </h3>
            <p className="text-xs text-white/60 font-medium">
              Choose files for your podcast
            </p>
          </div>
        </div>
        
        {/* Compact Upload Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUpload(!showUpload)}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          <div className="relative px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl shadow-lg border border-white/20">
            <div className="relative flex items-center space-x-2 text-white font-bold text-sm">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Simple Upload Modal */}
      {showUpload && (
        <SimplePodcastUpload
          key="upload-modal-v2"
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Compact Search */}
      <div className="mb-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-600/40 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Search className="w-4 h-4 text-white/60 group-focus-within:text-white transition-colors duration-300" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 placeholder-white/40 text-white font-medium text-sm"
          />
        </div>
      </div>

      {/* Compact Selection Summary */}
      {selectedDocuments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 to-purple-600/50 rounded-xl blur-lg opacity-70" />
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg blur-md opacity-60" />
                  <div className="relative w-8 h-8 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg border border-white/20">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-bold text-white">
                    {selectedDocuments.length} selected
                  </span>
                  <p className="text-xs text-white/60">Ready to generate</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectionChange([])}
                className="group relative px-3 py-1 rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300 rounded-lg" />
                <div className="relative flex items-center space-x-1 text-white/70 group-hover:text-white transition-colors duration-300">
                  <X className="w-3 h-3" />
                  <span className="text-xs font-medium">Clear</span>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Compact Documents List */}
      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-pink-600/10 rounded-2xl blur-lg" />
              <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4">
                <div className="flex items-center space-x-3 text-red-300">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            </motion.div>
          ) : filteredDocuments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Folder className="w-16 h-16 text-white/30 mx-auto mb-4" />
              </motion.div>
              <p className="text-white/70 font-medium">
                {documents.length === 0 
                  ? 'No documents uploaded yet'
                  : 'No documents match your search'
                }
              </p>
              <p className="text-white/50 text-sm mt-1">
                {documents.length === 0 
                  ? 'Click "Upload" to add your first document'
                  : 'Try adjusting your search terms'
                }
              </p>
            </motion.div>
          ) : (
            filteredDocuments.map((document, index) => {
              const isSelected = selectedDocuments.includes(document.id);
              
              return (
                <motion.div
                  key={document.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="relative group"
                  onClick={() => handleDocumentToggle(document.id)}
                >
                  {/* Revolutionary Selection Glow */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/40 to-purple-600/50 rounded-2xl blur-xl opacity-80" />
                  )}
                  
                  {/* Hover glow effect */}
                  <motion.div
                    initial={false}
                    animate={{ opacity: isSelected ? 0 : 0 }}
                    whileHover={{ opacity: isSelected ? 0 : 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/40 rounded-2xl blur-lg"
                  />
                  
                  {/* Compact Card */}
                  <div className={`
                    relative p-4 rounded-xl cursor-pointer transition-all duration-300 border group-hover:scale-[1.01]
                    ${isSelected
                      ? 'bg-white/15 backdrop-blur-xl border-white/30 shadow-xl'
                      : 'bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                  `}>
                    {/* Prismatic edge highlights */}
                    <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`} />
                    <div className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    }`} />
                    <div className="flex items-start space-x-4">
                      {/* Revolutionary Checkbox with Processing State */}
                      <motion.div
                        whileHover={{ scale: document.openai_upload_status === 'completed' ? 1.1 : 1, rotate: document.openai_upload_status === 'completed' ? [0, -5, 5, 0] : [0] }}
                        whileTap={{ scale: document.openai_upload_status === 'completed' ? 0.9 : 1 }}
                        className="relative mt-1"
                      >
                        {/* Checkbox glow */}
                        {isSelected && document.openai_upload_status === 'completed' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl blur-md opacity-60 scale-125" />
                        )}
                        
                        <div className={`
                          relative w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-500 border
                          ${document.openai_upload_status === 'completed'
                            ? isSelected
                              ? 'bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 shadow-xl border-white/20'
                              : 'bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20'
                            : document.openai_upload_status === 'processing'
                              ? 'bg-yellow-500/20 border-yellow-400/40 cursor-not-allowed'
                              : document.openai_upload_status === 'failed'
                                ? 'bg-red-500/20 border-red-400/40 cursor-not-allowed'
                                : 'bg-gray-500/20 border-gray-400/40 cursor-not-allowed'
                          }
                        `}>
                          {/* Prismatic inner highlight */}
                          {isSelected && document.openai_upload_status === 'completed' && (
                            <div className="absolute top-1 left-1 right-1 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
                          )}
                          
                          <AnimatePresence>
                            {document.openai_upload_status === 'completed' ? (
                              isSelected ? (
                                <motion.div
                                  key="selected"
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 180 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                  <Check className="w-4 h-4 text-white drop-shadow-sm" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="ready"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2 h-2 bg-green-400 rounded-full"
                                />
                              )
                            ) : document.openai_upload_status === 'processing' ? (
                              <motion.div
                                key="processing"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full"
                              />
                            ) : document.openai_upload_status === 'failed' ? (
                              <X className="w-3 h-3 text-red-400" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>

                      {/* Compact Document Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                          isSelected ? 'text-white' : 'text-white/90'
                        }`}>
                          {document.title}
                        </h4>
                        <p className={`text-xs truncate transition-colors duration-300 ${
                          isSelected ? 'text-white/70' : 'text-white/60'
                        }`}>
                          {document.file_name}
                        </p>
                        
                        {/* OpenAI Processing Status */}
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center space-x-1">
                            {document.openai_upload_status === 'completed' && document.openai_file_id ? (
                              <>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-green-400 font-medium">OpenAI Ready</span>
                              </>
                            ) : document.openai_upload_status === 'processing' ? (
                              <>
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-yellow-400 font-medium">Processing...</span>
                              </>
                            ) : document.openai_upload_status === 'failed' ? (
                              <>
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className="text-xs text-red-400 font-medium">Processing Failed</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className="text-xs text-gray-400 font-medium">Pending Upload</span>
                              </>
                            )}
                          </div>
                          {document.openai_file_id && (
                            <>
                              <span className="text-white/40">•</span>
                              <span className="text-xs text-white/60 font-mono">
                                {document.openai_file_id.slice(0, 12)}...
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Tags */}
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {document.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="relative inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {document.tags.length > 2 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 text-white/60">
                                +{document.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Compact Metadata */}
                        <div className="flex items-center space-x-3 mt-2">
                          <div className={`flex items-center space-x-1 text-xs transition-colors duration-300 ${
                            isSelected ? 'text-white/70' : 'text-white/60'
                          }`}>
                            <FileText className="w-3 h-3 text-purple-400" />
                            <span className="font-medium">{formatFileSize(document.file_size)}</span>
                          </div>
                          <span className="text-white/40">•</span>
                          <div className={`flex items-center space-x-1 text-xs transition-colors duration-300 ${
                            isSelected ? 'text-white/70' : 'text-white/60'
                          }`}>
                            <Clock className="w-3 h-3 text-purple-400" />
                            <span className="font-medium">{formatDate(document.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Revolutionary Hover Arrow */}
                      <div className={`
                        transition-all duration-500 relative
                        ${isSelected
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-3 group-hover:opacity-70 group-hover:translate-x-0'
                        }
                      `}>
                        {/* Arrow glow */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-md opacity-0 transition-opacity duration-300 ${
                          isSelected ? 'opacity-40' : 'group-hover:opacity-30'
                        }`} />
                        <ChevronRight className={`relative w-6 h-6 transition-colors duration-300 ${
                          isSelected ? 'text-purple-400' : 'text-white/40'
                        }`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Compact Footer Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-3 flex items-center justify-center space-x-2 text-xs text-white/50"
      >
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span>Select documents for your podcast</span>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default DocumentSelector;