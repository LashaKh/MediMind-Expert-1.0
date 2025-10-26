import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  AlertTriangle,
  Trash2,
  FileText,
  Image,
  Shield,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ABGResult } from '../../../types/abg';
import { ABGDeletionService, DeletionResult } from '../../../services/abgDeletionService';

interface DeletionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  resultIds: string[];
  results?: ABGResult[];
  title?: string;
  message?: string;
  dangerLevel?: 'low' | 'medium' | 'high';
}

export const DeletionConfirmDialog: React.FC<DeletionConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  resultIds,
  
  title,
  message,
  dangerLevel = 'medium'
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [deletionPreview, setDeletionPreview] = useState<any>(null);
  const [safetyCheck, setSafetyCheck] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [deletionResult, setDeletionResult] = useState<DeletionResult | null>(null);

  // Load deletion preview and safety check
  useEffect(() => {
    if (isOpen && resultIds.length > 0) {
      loadDeletionInfo();
    }
  }, [isOpen, resultIds]);

  // Handle modal focus and scroll lock
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Focus the modal after a short delay to ensure it's rendered
      setTimeout(() => {
        const modal = document.querySelector('[role="dialog"]');
        if (modal instanceof HTMLElement) {
          modal.focus();
        }
      }, 100);
      
      // Handle keyboard events
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        // Restore body scroll
        document.body.style.overflow = originalStyle;
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const loadDeletionInfo = async () => {
    try {
      const [preview, safety] = await Promise.all([
        ABGDeletionService.getDeletionPreview(resultIds),
        ABGDeletionService.checkDeletionSafety(resultIds)
      ]);
      
      setDeletionPreview(preview);
      setSafetyCheck(safety);
    } catch (error) {

    }
  };

  const handleConfirm = async () => {
    if (!safetyCheck?.safe) return;
    
    setLoading(true);
    setShowProgress(true);
    setProgress(0);
    
    try {
      let result: DeletionResult;
      
      if (resultIds.length === 1) {
        result = await ABGDeletionService.deleteSingle(resultIds[0]);
        setProgress(100);
      } else {
        result = await ABGDeletionService.deleteBulk(resultIds, (completed, total) => {
          setProgress((completed / total) * 100);
        });
      }
      
      setDeletionResult(result);
      
      if (result.success) {
        setTimeout(() => {
          onConfirm();
          handleClose();
        }, 1500);
      }
    } catch (error) {

      setDeletionResult({
        success: false,
        deletedCount: 0,
        errors: [{ id: 'unknown', error: 'An unexpected error occurred' }],
        duration: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDeletionPreview(null);
    setSafetyCheck(null);
    setProgress(0);
    setShowProgress(false);
    setDeletionResult(null);
    setLoading(false);
    onClose();
  };

  const getDangerConfig = () => {
    // Light, clean appearance with excellent contrast
    return {
      bgColor: 'from-white to-slate-50',
      borderColor: 'border-[#e2e8f0]',
      iconColor: 'text-[#1a365d]',
      buttonColor: 'bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] hover:from-[#2b6cb0] hover:to-[#1a365d]',
      iconBg: 'bg-[#f8f9fa]'
    };
  };

  const config = getDangerConfig();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="min-h-full flex items-center justify-center py-8">
        <Card 
          role="dialog"
          aria-modal="true"
          aria-labelledby="deletion-dialog-title"
          tabIndex={-1}
          className={cn(
            "w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto",
            "bg-gradient-to-br", config.bgColor,
            "border", config.borderColor,
            "shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300",
            "mx-auto my-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          )}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl border-2 border-[#e2e8f0]", config.iconBg)}>
                <AlertTriangle className={cn("h-6 w-6", config.iconColor)} />
              </div>
              <div>
                <h2 id="deletion-dialog-title" className="text-xl font-bold text-slate-900">
                  {title || (resultIds.length > 1
                    ? t('abg.delete.titleMany', 'Delete {{count}} ABG Results?', { count: resultIds.length })
                    : t('abg.delete.titleOne', 'Delete ABG Result?'))}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {t('abg.delete.cannotUndo', 'This action cannot be undone')}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-white/60"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar (when deleting) */}
          {showProgress && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#1a365d]">
                  {deletionResult?.success ? t('abg.delete.complete', 'Deletion Complete') : t('abg.delete.deleting', 'Deleting...')}
                </span>
                <span className="text-sm font-mono text-[#2b6cb0]">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-out rounded-full",
                    deletionResult?.success
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Deletion Result */}
          {deletionResult && (
            <div className={cn(
              "mb-6 p-4 rounded-xl border",
              deletionResult.success 
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {deletionResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {deletionResult.success 
                    ? t('abg.delete.successMany', 'Successfully deleted {{count}} results', { count: deletionResult.deletedCount })
                    : t('abg.delete.failed', 'Deletion failed')
                  }
                </span>
              </div>
              
              {deletionResult.errors.length > 0 && (
                <div className="text-sm">
                  <p className="mb-1">{t('abg.delete.errorsTitle', 'Errors encountered:')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    {deletionResult.errors.map((error, index) => (
                      <li key={index}>{error.error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="text-xs mt-2 opacity-75">
                {t('abg.delete.completedIn', 'Completed in {{ms}}ms', { ms: Math.round(deletionResult.duration) })}
              </div>
            </div>
          )}

          {/* Safety Blockers Only (Critical Issues) */}
          {safetyCheck && safetyCheck.blockers.length > 0 && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">{t('abg.delete.cannotDelete', 'Cannot Delete')}</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {safetyCheck.blockers.map((blocker: string, index: number) => (
                    <li key={index}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Simple Result List (if 5 or fewer) */}
          {deletionPreview && deletionPreview.results.length <= 5 && (
            <div className="mb-6 bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">{t('abg.delete.preview.listTitle', 'Results to be deleted:')}</h4>
              <div className="space-y-2">
                {deletionPreview.results.map((result: ABGResult) => (
                  <div key={result.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <FileText className="h-4 w-4 text-[#2b6cb0]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {result.type || 'Arterial Blood Gas'}
                      </div>
                      <div className="text-xs text-slate-600">
                        {new Date(result.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {result.image_url && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-[#2b6cb0] to-[#63b3ed] text-white border-none">
                        <Image className="h-3 w-3 mr-1" />
                        {t('abg.delete.preview.imageTag', 'Image')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {message && !showProgress && (
            <p className="text-gray-700 mb-6">{message}</p>
          )}

          {/* Actions */}
          {!showProgress && (
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="bg-white/80 hover:bg-white"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              
              <Button
                onClick={handleConfirm}
                disabled={loading || !safetyCheck?.safe}
                className={cn(
                  "text-white font-medium px-6",
                  config.buttonColor,
                  !safetyCheck?.safe && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('abg.delete.deleting', 'Deleting...')}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {resultIds.length > 1 
                      ? t('abg.delete.deleteMany', 'Delete {{count}} Results', { count: resultIds.length })
                      : t('abg.delete.deleteOne', 'Delete Result')}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        </Card>
      </div>
    </div>
  );
};

export default DeletionConfirmDialog;