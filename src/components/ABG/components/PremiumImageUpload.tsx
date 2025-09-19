import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Button } from '../../ui/button';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';

interface PremiumImageUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile?: File | null;
  isProcessing?: boolean;
  error?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  // Optional: allow parent to open a dedicated camera capture UI
  onRequestCamera?: () => void;
}

export const PremiumImageUpload: React.FC<PremiumImageUploadProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isProcessing = false,
  error,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSizeMB = 10,
  className,
  onRequestCamera
}) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Create preview URL when file is selected
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setIsAnimating(true);
      
      // Simulate upload progress for visual effect
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(progress);
      }, 100);

      return () => {
        URL.revokeObjectURL(url);
        clearInterval(interval);
      };
    } else {
      setPreviewUrl(null);
      setUploadProgress(0);
      setIsAnimating(false);
    }
  }, [selectedFile]);

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isValidType) {
      return t('abg.upload.errors.invalidType', 'Please select a valid image file ({{types}})', { types: acceptedTypes.join(', ') });
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return t('abg.upload.errors.maxSize', 'File size must be less than {{size}}MB', { size: maxSizeMB });
    }

    return null;
  }, [accept, maxSizeMB]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      return;
    }

    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag events
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    // Only set drag over to false if leaving the drop zone itself
    if (!dropZoneRef.current?.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle click to select file
  const handleClick = useCallback(() => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  }, [isProcessing]);

  // Keyboard accessibility for the dropzone
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isProcessing) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  }, [isProcessing]);

  const handleRequestCamera = useCallback(() => {
    if (onRequestCamera) {
      onRequestCamera();
      return;
    }
    // Fallback: use capture attribute on mobile-capable browsers
    if (!isProcessing) {
      cameraInputRef.current?.click();
    }
  }, [onRequestCamera, isProcessing]);

  // Handle file removal
  const handleRemove = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileRemove]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile && previewUrl) {
    return (
      <div className={cn("abg-premium", className)} data-debug-id="abg-upload-compact" data-tour="abg-file-preview">
        <div className={cn(
          "relative overflow-hidden rounded-2xl border bg-white/90 backdrop-blur transition-all duration-500",
          isAnimating ? "opacity-100" : "opacity-0",
          error ? "border-red-200" : "border-slate-200"
        )}>
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="h-5 w-5 text-[#63b3ed]" />
                <h3 className="font-semibold">{t('abg.upload.fileReady', 'File ready for analysis')}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-slate-600 hover:bg-slate-100 h-8 w-8 p-0"
                aria-label={t('abg.upload.removeAria', 'Remove file')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* File Preview */}
          <div className="p-5">
            <div className="flex gap-5">
              {/* Image Preview */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#63b3ed] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* File Info */}
              <div className="flex-1 space-y-3.5">
                <div>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#2b6cb0]" />
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>

                {/* Upload Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{t('abg.upload.progress', 'Upload Progress')}</span>
                    <span className="font-medium text-[#63b3ed]">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden" aria-hidden>
                    <div 
                      className="h-full bg-[#63b3ed] rounded-full transition-all duration-300 relative"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 opacity-30 animate-pulse" />
                    </div>
                  </div>
                  <span className="sr-only" aria-live="polite">{t('abg.upload.progressSr', '{{percent}} percent uploaded', { percent: Math.round(uploadProgress) })}</span>
                </div>

                {/* File Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClick}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Replace
                  </Button>
                </div>
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="mt-6 p-4 bg-[#90cdf4]/20 rounded-xl border border-[#63b3ed]/30">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#63b3ed]/30 border-t-[#2b6cb0] rounded-full animate-spin" />
                  <div>
                    <p className="font-medium text-[#1a365d]">{t('abg.upload.processing.title', 'Processing image…')}</p>
                    <p className="text-sm text-[#2b6cb0]">{t('abg.upload.processing.subtitle', 'AI is analyzing the blood gas report')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800">Upload error</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
          {/* Camera input for mobile capture fallback */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            capture="environment"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("abg-premium", className)} data-tour="abg-image-upload">
      <div
        ref={dropZoneRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        role="button"
          aria-label={t('abg.upload.aria.dropzone', 'Upload blood gas report')}
        tabIndex={0}
        data-tour="abg-dropzone"
        className={cn(
          "relative cursor-pointer transition-colors duration-200",
          "rounded-2xl border-2 border-dashed overflow-hidden",
          "min-h-[140px] flex flex-col items-center justify-center",
          "bg-white/80 backdrop-blur",
          isDragOver ? "border-[#2b6cb0] ring-2 ring-[#2b6cb0]/20" : "border-slate-300 hover:border-[#63b3ed]",
          isProcessing && "pointer-events-none opacity-50"
        )}
      >
        {/* Content */}
        <div className="relative z-10 text-center space-y-4 p-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] text-white flex items-center justify-center shadow-sm">
            {isDragOver ? (
              <Download className="h-6 w-6" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-slate-900">
              {isDragOver ? t('abg.upload.drop.title', 'Drop to upload') : t('abg.upload.title', 'Upload blood gas report')}
            </h3>
            <p className="text-slate-600 max-w-md mx-auto leading-relaxed text-sm">
              {isDragOver 
                ? t('abg.upload.drop.subtitle', 'Release to upload for AI analysis')
                : t('abg.upload.subtitle', 'Drag and drop an image here, or choose a file')
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              className="bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] text-white hover:from-[#1a365d] hover:to-[#2b6cb0]"
              size="sm"
            >
              <Upload className="h-5 w-5 mr-2" />
              {t('abg.upload.chooseFile', 'Choose file')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 hover:border-[#63b3ed] hover:bg-[#90cdf4]/20"
              onClick={(e) => { e.stopPropagation(); handleRequestCamera(); }}
            >
              <Camera className="h-5 w-5 mr-2" />
              {t('abg.upload.takePhoto', 'Take photo')}
            </Button>
          </div>

          <div className="text-xs text-slate-500">
            {t('abg.upload.formats', 'JPEG, PNG, WebP • up to {{size}}MB', { size: maxSizeMB })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        {/* Camera input for mobile capture fallback */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          capture="environment"
        />
      </div>
    </div>
  );
};