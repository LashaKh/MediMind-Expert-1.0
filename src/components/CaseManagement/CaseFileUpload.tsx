import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { processFileForUpload } from '../../utils/fileUpload';
import { supabase } from '../../lib/supabase';

export interface CaseAttachment {
  id: string;
  file: File;
  base64Data: string;
  uploadType: 'image' | 'pdf' | 'document';
  status: 'processing' | 'ready' | 'error';
  preview?: string;
  error?: string;
  extractedText?: string;
  category?: string;
}

interface CaseFileUploadProps {
  caseId?: string;
  onFilesSelected: (attachments: CaseAttachment[]) => void;
  initialAttachments?: CaseAttachment[];
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

const defaultAcceptedTypes = [
  'image/*',
  'application/pdf',
  '.doc',
  '.docx',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const CaseFileUpload: React.FC<CaseFileUploadProps> = ({
  caseId,
  onFilesSelected,
  initialAttachments = [],
  maxFiles = 10,
  maxSizeMB = 50,
  acceptedTypes = defaultAcceptedTypes,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState<CaseAttachment[]>(initialAttachments);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update attachments when initialAttachments change
  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return {
        isValid: false,
        error: t('documents.fileSizeError', { size: maxSizeMB })
      };
    }

    // Check file count
    if (attachments.length >= maxFiles) {
      return {
        isValid: false,
        error: t('documents.maxFiles', { count: maxFiles })
      };
    }

    return { isValid: true };
  };

  const getFileCategory = (file: File): string => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) {
      if (type.includes('dicom')) return 'medical-images';
      return 'medical-images';
    }
    if (type === 'application/pdf') {
      return 'diagnostic-reports';
    }
    if (type.includes('word') || type.includes('document')) {
      return 'referral-letters';
    }
    return 'other';
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    const newAttachments: CaseAttachment[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        newAttachments.push({
          id: crypto.randomUUID(),
          file,
          base64Data: '',
          uploadType: 'document',
          status: 'error',
          error: validation.error
        });
        continue;
      }

      try {
        const processed = await processFileForUpload(file);
        const uploadType = file.type.startsWith('image/') ? 'image' : 
                          file.type === 'application/pdf' ? 'pdf' : 'document';

        const attachment: CaseAttachment = {
          id: processed.id,
          file,
          base64Data: processed.base64Data!,
          uploadType,
          status: 'ready',
          preview: processed.preview,
          category: getFileCategory(file)
        };

        newAttachments.push(attachment);
      } catch (error) {
        newAttachments.push({
          id: crypto.randomUUID(),
          file,
          base64Data: '',
          uploadType: 'document',
          status: 'error',
          error: error instanceof Error ? error.message : t('documents.modal.upload.failed')
        });
      }
    }

    const updatedAttachments = [...attachments, ...newAttachments];
    setAttachments(updatedAttachments);
    onFilesSelected(updatedAttachments);
    setIsProcessing(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(a => a.id !== id);
    setAttachments(updatedAttachments);
    onFilesSelected(updatedAttachments);
  };

  const getFileIcon = (attachment: CaseAttachment) => {
    switch (attachment.uploadType) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category?: string): string => {
    const categoryLabels: Record<string, string> = {
      'medical-images': 'Medical Images',
      'diagnostic-reports': 'Diagnostic Reports',
      'lab-results': 'Lab Results',
      'referral-letters': 'Referral Letters',
      'other': 'Other Documents'
    };
    
    return categoryLabels[category || 'other'] || 'Other Documents';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-3">
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragging ? t('documents.dropFiles') : t('documents.dragDropText')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t('documents.supportedFormats')} ({t('documents.maxFileSize', { size: maxSizeMB })})
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isProcessing}
            className="mt-2"
          >
            {t('documents.selectFiles')}
          </Button>
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {t('documents.selectedFiles', { count: attachments.length })} ({attachments.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${attachment.status === 'error' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}
                `}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(attachment)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.file.name}
                      </p>
                      {attachment.id.startsWith('existing-') && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          Existing
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      {attachment.file.size > 0 && (
                        <>
                          <span>{(attachment.file.size / 1024 / 1024).toFixed(2)}MB</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{getCategoryLabel(attachment.category)}</span>
                      {attachment.status === 'error' && (
                        <>
                          <span>•</span>
                          <span className="text-red-600">{attachment.error}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {attachment.status === 'processing' && (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {attachment.status === 'ready' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {attachment.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment.id)}
                    className="p-1 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Type Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">{t('documents.modal.select.supportedTypes')}:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>{t('documents.categories.medical-images')}: JPEG, PNG, DICOM</li>
          <li>{t('documents.fileTypes.pdf')}: PDF, {t('documents.fileTypes.word-docx')}</li>
          <li>{t('documents.categories.lab-results')}: PDF preferred</li>
        </ul>
      </div>
    </div>
  );
};