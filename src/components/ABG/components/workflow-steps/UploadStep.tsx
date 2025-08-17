import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  Brain,
  Settings,
  FileText
} from 'lucide-react';
import { ABGType } from '../../../../types/abg';
import { PremiumImageUpload } from '../PremiumImageUpload';
import { CameraCapture } from '../CameraCapture';
import { NewCaseButton } from '../../../AICopilot/NewCaseButton';
import { Button } from '../../../ui/button';
import { cn } from '../../../../lib/utils';

interface UploadStepProps {
  // ABG type selection
  abgType: ABGType;
  onAbgTypeChange: (type: ABGType) => void;
  
  // File handling
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  
  // Camera handling
  showCamera: boolean;
  onShowCamera: (show: boolean) => void;
  onCameraCapture: (file: File) => void;
  
  // Processing state
  isProcessing: boolean;
  error?: string;
  
  // Progress info
  unifiedProgress?: {
    currentTask?: string;
    overallProgress: number;
    phase: string;
    stageDescription: string;
  } | null;
  
  // Case management
  activeCase?: any;
  onCaseCreateOpen: () => void;
  onCaseListOpen: () => void;
  
  // Actions
  onProcessAnalysis: () => void;
}

const ABG_TYPES: { value: ABGType; labelKey: string; descriptionKey: string; color: string }[] = [
  {
    value: 'Arterial Blood Gas',
    labelKey: 'abg.results.filters.types.arterial',
    descriptionKey: 'abg.upload.types.arterialDesc',
    color: 'blue'
  },
  {
    value: 'Venous Blood Gas',
    labelKey: 'abg.results.filters.types.venous', 
    descriptionKey: 'abg.upload.types.venousDesc',
    color: 'purple'
  }
];

export const UploadStep: React.FC<UploadStepProps> = ({
  abgType,
  onAbgTypeChange,
  selectedFile,
  onFileSelect,
  onFileRemove,
  showCamera,
  onShowCamera,
  onCameraCapture,
  isProcessing,
  error,
  unifiedProgress,
  activeCase,
  onCaseCreateOpen,
  onCaseListOpen,
  onProcessAnalysis
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="space-y-6" data-tour="abg-upload-step">
      {/* ABG Type Selection */}
      <div className="abg-card abg-glass p-6" data-tour="abg-type-selection">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{t('abg.upload.type.title', 'Blood Gas Type')}</h3>
            <p className="text-slate-600 text-sm">{t('abg.upload.type.subtitle', 'Select the type of analysis')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ABG_TYPES.map((type) => (
            <label 
              key={type.value}
              className={cn(
                "relative cursor-pointer group",
                "p-4 rounded-xl border-2 transition-all duration-300",
                "hover:shadow-lg",
                type.color === 'blue' ? "hover:border-blue-400" : "hover:border-purple-400",
                abgType === type.value 
                  ? type.color === 'blue' 
                    ? "border-blue-500 bg-blue-50 shadow-md" 
                    : "border-purple-500 bg-purple-50 shadow-md"
                  : "border-slate-200 bg-white"
              )}
            >
              <input
                type="radio"
                name="abgType"
                value={type.value}
                checked={abgType === type.value}
                onChange={(e) => onAbgTypeChange(e.target.value as ABGType)}
                className="absolute opacity-0"
              />
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "w-3.5 h-3.5 rounded-full border-2 transition-colors",
                  abgType === type.value 
                    ? type.color === 'blue' 
                      ? "border-blue-500 bg-blue-500" 
                      : "border-purple-500 bg-purple-500"
                    : "border-slate-300"
                )}>
                  {abgType === type.value && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
                <span className="font-medium text-slate-800 text-sm sm:text-base">{t(type.labelKey)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 ml-7">{t(type.descriptionKey)}</p>
            </label>
          ))}
        </div>
      </div>

      {/* Case Context */}
      <div className="abg-card abg-glass p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{t('abg.upload.caseContext.title', 'Case Context (Optional)')}</h3>
            <p className="text-slate-600 text-sm">{t('abg.upload.caseContext.subtitle', 'Link BG analysis to a patient case')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-2.5">
          <NewCaseButton onClick={onCaseCreateOpen} />
          <Button variant="outline" onClick={onCaseListOpen} className="w-full sm:w-auto">
            {t('case.selectExistingCase', 'Select Existing Case')}
          </Button>
          {activeCase && (
            <div className="text-sm text-slate-600 self-center">
              {t('case.activeCase', 'Active Case')}: <span className="font-medium">{activeCase.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-6">
        {!showCamera ? (
          <div className="space-y-6">
            <PremiumImageUpload
              onFileSelect={onFileSelect}
              onFileRemove={onFileRemove}
              selectedFile={selectedFile}
              isProcessing={isProcessing}
              error={error}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              maxSizeMB={10}
            />
            
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="h-px bg-slate-300 flex-1 w-16" />
                <span className="text-sm text-slate-500 font-medium">{t('common.or', 'or')}</span>
                <div className="h-px bg-slate-300 flex-1 w-16" />
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => onShowCamera(true)}
                className="bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                size="md"
              >
                <Camera className="h-5 w-5 mr-2" />
                {t('abg.upload.takePhoto', 'Take photo')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="abg-card p-6">
            <CameraCapture
              onCapture={onCameraCapture}
              onCancel={() => onShowCamera(false)}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="border-slate-300 hover:border-slate-400"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t('common.cancel', 'Cancel')}
        </Button>
        
        <Button
          onClick={onProcessAnalysis}
          disabled={!selectedFile || isProcessing}
          className={cn(
            "abg-btn-primary relative overflow-hidden",
            !selectedFile && "opacity-50 cursor-not-allowed"
          )}
          size="md"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {unifiedProgress?.currentTask || t('common.processing', 'Processing...')}
            </>
          ) : (
            <>
              <Brain className="h-5 w-5 mr-2" />
              {t('abg.upload.actions.startAIAnalysis', 'Start AI Analysis')}
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Unified Progress Display */}
      {isProcessing && unifiedProgress && (
        <div className="abg-card abg-glass p-5 mt-6">
          <div className="flex items-center gap-4 mb-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <div className="flex-1">
              <div className="text-base font-semibold text-slate-800">{unifiedProgress.currentTask}</div>
              <div className="text-xs text-slate-600">{unifiedProgress.stageDescription}</div>
            </div>
            <div className="text-base font-mono font-bold text-blue-600">{unifiedProgress.overallProgress}%</div>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${unifiedProgress.overallProgress}%` }}
            />
          </div>
          
          <div className="flex gap-4 justify-center">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              unifiedProgress.phase === 'extraction' ? "bg-blue-100 text-blue-800 shadow-md" : "bg-slate-100 text-slate-600"
            )}>
              <FileText className="h-4 w-4" />
              Text Extraction
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              unifiedProgress.phase === 'interpretation' ? "bg-green-100 text-green-800 shadow-md" : "bg-slate-100 text-slate-600"
            )}>
              <Brain className="h-4 w-4" />
              Clinical Analysis
            </div>
          </div>
        </div>
      )}
    </div>
  );
};