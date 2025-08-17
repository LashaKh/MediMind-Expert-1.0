import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader,
  X,
  Sparkles,
  FileCode,
  FileImage,
  Star,
  Zap,
  ChevronRight,
  Cloud,
  Shield,
  Clock,
  Layers,
  Brain
} from 'lucide-react';
import { uploadDocumentForPodcast } from '../../lib/api/podcastUpload';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface SimplePodcastUploadProps {
  onUploadComplete: (documentId: string, publicUrl: string) => void;
  onClose: () => void;
}

const SimplePodcastUpload: React.FC<SimplePodcastUploadProps> = ({
  onUploadComplete,
  onClose
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ];

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return FileImage;
    if (type.includes('word')) return FileText;
    if (type.includes('text')) return FileCode;
    return FileText;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    // Validate file type
    if (!supportedTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Please upload PDF, DOC, DOCX, TXT, or MD files.');
      return;
    }

    // Validate file size (50MB for PDF, 25MB for others)
    const maxSize = selectedFile.type === 'application/pdf' ? 50 * 1024 * 1024 : 25 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setFile(selectedFile);
    setError('');
    
    // Auto-generate title from filename if empty
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError('Please select a file and provide a title');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    const [result, error] = await safeAsync(
      async () => {
        const result = await uploadDocumentForPodcast({
          file,
          title: title.trim(),
          description: description.trim() || undefined,
          category: 'podcast_temp',
          tags: ['podcast', 'uploaded']
        });

        return result;
      },
      {
        context: 'upload document for podcast generation',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setError(error.userMessage || 'Upload failed');
    } else {
      setSuccess(result.message);
      onUploadComplete(result.documentId, result.publicUrl);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    }

    setIsUploading(false);
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setError('');
    setSuccess('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
        onClick={onClose}
      >
        {/* Revolutionary Backdrop with Depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-xl" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              x: [0, 100, -50, 0],
              y: [0, -50, 100, 0],
              scale: [1, 1.2, 0.8, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/20 to-pink-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, -100, 50, 0],
              y: [0, 100, -50, 0],
              scale: [0.8, 1.1, 0.9, 0.8]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/20 to-blue-500/30 rounded-full blur-3xl"
          />
        </div>
        
        {/* Modal Container with proper centering and constraints */}
        <div className="flex items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm"
            style={{ maxHeight: 'calc(100vh - 32px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-full overflow-y-auto custom-scrollbar">
          {/* Revolutionary Glass Morphism Modal */}
          <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.12] to-white/[0.08] border border-white/20 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Premium Glow Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10 opacity-50" />
            
            {/* Prismatic Top Border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            {/* Compact Header */}
            <div className="relative p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg shadow-lg border border-white/20">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-white">
                    Upload Document
                  </h2>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white/60 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Content with reduced padding */}
            <div className="relative px-3 pb-3 space-y-3">
              {/* Revolutionary File Upload Zone */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Select Your Document
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                  />
                  
                  <motion.div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    whileHover={{ scale: 1.01 }}
                    className={`
                      relative overflow-hidden rounded-2xl transition-all duration-500
                      ${isDragging ? 'scale-[1.02]' : ''}
                      ${file ? '' : 'cursor-pointer'}
                      ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {/* Dynamic Background Glow */}
                    <div className={`
                      absolute inset-0 transition-all duration-500
                      ${file 
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/30' 
                        : isDragging
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/40'
                        : 'bg-gradient-to-r from-purple-500/10 to-pink-500/20'
                      } blur-xl
                    `} />
                    
                    {/* Upload Area Content */}
                    <div className={`
                      relative border-2 border-dashed rounded-lg p-3 text-center backdrop-blur-sm transition-all duration-500
                      ${file 
                        ? 'border-emerald-400/50 bg-emerald-500/10' 
                        : isDragging
                        ? 'border-purple-400/70 bg-purple-500/20'
                        : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
                      }
                    `}>
                      <AnimatePresence mode="wait">
                        {file ? (
                          <motion.div
                            key="file-selected"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="space-y-1"
                          >
                            <div className="flex items-center justify-center space-x-2">
                              {(() => {
                                const Icon = getFileIcon(file.type);
                                return <Icon className="w-5 h-5 text-emerald-400" />;
                              })()}
                              <p className="text-xs font-medium text-white truncate max-w-[150px]">
                                {file.name}
                              </p>
                            </div>
                            <p className="text-xs text-emerald-300">
                              {(file.size / 1024 / 1024).toFixed(1)} MB • Ready
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="no-file"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="space-y-1"
                          >
                            <Cloud className="w-6 h-6 text-white/60 mx-auto mb-1" />
                            <p className="text-xs font-medium text-white">
                              {isDragging ? 'Drop your file here' : 'Choose or drag document'}
                            </p>
                            <p className="text-xs text-white/50">
                              PDF, DOC, DOCX, TXT, MD • Max 50MB
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-1 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all placeholder-white/40 text-white text-sm"
                  placeholder="Enter title..."
                  disabled={isUploading}
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-1 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all resize-none placeholder-white/40 text-white text-sm"
                  placeholder="Add context..."
                  disabled={isUploading}
                />
              </div>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <p className="text-xs text-red-200">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs text-emerald-200">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Compact Footer */}
            <div className="relative p-3 pt-2">
              <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex gap-2 mt-2">
                {/* Reset Button */}
                <button
                  onClick={resetForm}
                  disabled={isUploading}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white/80 hover:text-white font-medium text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!file || !title.trim() || isUploading}
                  className={`
                    flex-1 px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center justify-center space-x-1
                    ${!file || !title.trim() || isUploading 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    }
                  `}
                >
                  {isUploading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3" />
                      <span>Upload & Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
    </AnimatePresence>
  );
};

export default SimplePodcastUpload;