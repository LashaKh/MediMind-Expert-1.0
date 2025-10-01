// Form 100 Generation Modal Component
// Multi-step medical form wizard for ER consultation reports
// HIPAA-compliant with mobile-optimized design

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, 
  FileText, 
  Stethoscope, 
  User, 
  Heart, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Download,
  Share2,
  Crown,
  Zap,
  Star,
  ChevronRight,
  Shield,
  Award,
  Mic,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Form100ModalProps, Form100Request } from '../../types/form100';
import DiagnosisCards from './DiagnosisCards';
import VoiceTranscriptField from './VoiceTranscriptField';
import AngiographyReportField from './AngiographyReportField';

// Multi-step wizard configuration
interface WizardStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  validation?: string[];
}

const Form100Modal: React.FC<Form100ModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  initialData,
  onSubmit,
  onGenerate,
  reportType
}) => {
  // Form state management
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Form100Request>>(initialData || {});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form validation
  const { formState: { errors }, trigger } = useForm();

  // localStorage keys for session recovery
  const STORAGE_KEY = `form100_draft_${sessionId}`;
  const STEP_KEY = `form100_step_${sessionId}`;

  // Auto-save to localStorage on form data changes
  useEffect(() => {
    if (isOpen && formData && Object.keys(formData).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(STEP_KEY, currentStep.toString());
        setHasUnsavedChanges(true);
      } catch (error) {
        console.warn('Failed to save form data to localStorage:', error);
      }
    }
  }, [formData, currentStep, isOpen, STORAGE_KEY, STEP_KEY]);

  // Recover form data on modal open
  useEffect(() => {
    if (isOpen && sessionId) {
      try {
        const savedFormData = localStorage.getItem(STORAGE_KEY);
        const savedStep = localStorage.getItem(STEP_KEY);
        
        if (savedFormData) {
          const parsedData = JSON.parse(savedFormData);
          // Only recover if we don't have initial data or if saved data is newer
          if (!initialData || Object.keys(initialData).length === 0) {
            setFormData(prev => ({ ...prev, ...parsedData }));
            if (savedStep) {
              setCurrentStep(parseInt(savedStep, 10));
            }
            console.log('✅ Recovered Form 100 draft from localStorage');
          }
        }
      } catch (error) {
        console.warn('Failed to recover form data from localStorage:', error);
      }
    }
  }, [isOpen, sessionId, STORAGE_KEY, STEP_KEY, initialData]);

  // Clean up localStorage on successful generation or modal close
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
      setHasUnsavedChanges(false);
      console.log('✅ Cleared Form 100 draft from localStorage');
    } catch (error) {
      console.warn('Failed to clear saved data:', error);
    }
  }, [STORAGE_KEY, STEP_KEY]);

  // Handle modal close without confirmation
  const handleClose = useCallback(() => {
    // Only clear saved data if form was successfully generated
    if (generatedForm) {
      clearSavedData();
    }
    
    onClose();
  }, [generatedForm, clearSavedData, onClose]);

  // Premium wizard steps configuration with enhanced icons
  const wizardSteps: WizardStep[] = [
    {
      id: 1,
      title: 'Clinical Data',
      subtitle: 'Diagnosis & symptoms',
      icon: Stethoscope,
      component: ClinicalDataStep,
      validation: ['primaryDiagnosis']
    },
    {
      id: 2,
      title: 'Documentation',
      subtitle: 'Voice & reports',
      icon: FileText,
      component: DocumentationStep
    },
    {
      id: 3,
      title: 'Generate',
      subtitle: 'Create Form 100',
      icon: Award,
      component: GenerationStep
    }
  ];

  const currentStepData = wizardSteps.find(step => step.id === currentStep);
  const isLastStep = currentStep === wizardSteps.length;
  const isFirstStep = currentStep === 1;

  // Handle step navigation
  const handleNextStep = useCallback(async () => {
    const current = wizardSteps[currentStep - 1];
    
    // Validate current step if validation rules exist
    if (current.validation) {
      const isValid = await trigger(current.validation);
      if (!isValid) return;
    }
    
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, trigger, wizardSteps]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Handle form generation
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      if (onGenerate) {
        const generatedContent = await onGenerate(formData as Form100Request);
        if (generatedContent) {
          setGeneratedForm(generatedContent);
          setGenerationError(null);
          // Clear saved draft data after successful generation
          clearSavedData();
        } else {
          throw new Error('No content generated');
        }
      }
    } catch (error) {
      console.error('Form generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      setGeneratedForm(null);
    } finally {
      setIsGenerating(false);
    }
  }, [formData, onGenerate]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(formData as Form100Request);
    }
    onClose();
  }, [formData, onSubmit, onClose]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<Form100Request>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsGenerating(false);
      setGeneratedForm(null);
      setGenerationError(null);
      if (sessionId) {
        updateFormData({ sessionId });
      }
    }
  }, [isOpen, sessionId, updateFormData]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-0 rounded-2xl 
                   shadow-[0_32px_64px_-12px_rgba(26,54,93,0.25)] 
                   data-[state=open]:animate-in data-[state=closed]:animate-out 
                   data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
                   data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        style={{
          width: window.innerWidth < 768 ? 'calc(100vw - 1rem)' : window.innerWidth < 1024 ? 'min(85vw, 900px)' : 'min(80vw, 1100px)',
          height: window.innerHeight < 600 ? 'calc(100vh - 2rem)' : 'min(80vh, 700px)',
          maxWidth: 'none',
          maxHeight: 'none',
          margin: window.innerWidth < 768 ? '1rem 0.5rem' : '3rem 2rem'
        }}>
        {/* Optimized responsive design system with Dialog overrides */}
        <style>{`
          /* Ensure proper modal sizing and spacing */
          .form100-modal-container {
            width: min(85vw, 1200px) !important;
            height: min(80vh, 800px) !important;
            max-width: none !important;
            max-height: none !important;
            margin: 2rem !important;
          }
          
          .glass-morphism {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .neural-gradient {
            background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #63b3ed 100%);
            position: relative;
          }
          .neural-gradient::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
            animation: shimmer 3s ease-in-out infinite;
          }
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
          .micro-interaction {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .micro-interaction:hover {
            transform: translateY(-1px);
            box-shadow: 0 20px 40px -8px rgba(26,54,93,0.3);
          }
        `}</style>
        
        <div className="form100-modal flex flex-col h-full">
        
          {/* World-Class Header with Neural Design */}
          <div className="relative neural-gradient overflow-hidden">
            {/* Floating geometric elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-6 left-12 w-3 h-3 bg-white/20 rounded-full animate-pulse" 
                   style={{ animationDelay: '0s', animationDuration: '4s' }} />
              <div className="absolute top-12 right-16 w-2 h-2 bg-[#90cdf4]/30 rotate-45" 
                   style={{ animationDelay: '1s', animationDuration: '6s' }} />
              <div className="absolute bottom-8 left-20 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" 
                   style={{ animationDelay: '2s', animationDuration: '5s' }} />
            </div>
            
            <div className="relative flex items-center justify-between p-4">
              <div className="flex items-center space-x-6">
                {/* Revolutionary icon design */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl blur-lg scale-110 opacity-60" />
                  <div className="relative p-2 glass-morphism rounded-2xl group-hover:scale-105 transition-transform duration-500">
                    <div className="relative">
                      <Award className="w-6 h-6 text-white drop-shadow-lg" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#90cdf4] rounded-full flex items-center justify-center">
                        <Sparkles className="w-2 h-2 text-[#1a365d] animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-white">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-white to-[#90cdf4] bg-clip-text text-transparent">
                      Form 100 Generation
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-[#90cdf4] rounded-full animate-pulse" />
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="w-1 h-1 bg-[#63b3ed] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                  </h1>
                  <p className="text-sm text-[#90cdf4]/90 font-medium mt-1 tracking-wide">
                    Emergency Consultation Report
                  </p>
                </div>
              </div>
              
              {/* Sophisticated close button */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <button
                  onClick={handleClose}
                  className="relative w-12 h-12 glass-morphism rounded-2xl group-hover:bg-white/20 
                             transition-all duration-500 touch-manipulation group-hover:scale-110 group-hover:rotate-45"
                >
                  <X className="w-6 h-6 text-white mx-auto transition-all duration-500 group-hover:rotate-90" />
                </button>
              </div>
            </div>
          </div>


          {/* Premium Content Area */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-6xl mx-auto">
              {currentStepData && (
                <currentStepData.component
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  sessionId={sessionId}
                  generatedForm={generatedForm}
                  isGenerating={isGenerating}
                  generationError={generationError}
                  onGenerate={handleGenerate}
                  reportType={reportType}
                />
              )}
            </div>
          </div>

          {/* Sophisticated Footer */}
          <div className="relative border-t border-[#63b3ed]/10">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50" />
            
            <div className="relative flex items-center justify-between px-6 py-3">
              {/* Advanced Previous Button */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#63b3ed]/20 to-[#2b6cb0]/20 rounded-2xl 
                                blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <button
                  onClick={handlePreviousStep}
                  disabled={isFirstStep}
                  className={cn(
                    "relative px-8 py-3.5 rounded-2xl font-semibold transition-all duration-500 micro-interaction",
                    isFirstStep 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "glass-morphism text-[#2b6cb0] hover:bg-[#90cdf4]/10 border border-[#63b3ed]/30"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Previous</span>
                  </div>
                </button>
              </div>

              {/* Neural Step Counter */}
              <div className="flex items-center space-x-4 px-6 py-3 glass-morphism rounded-2xl border border-[#63b3ed]/20">
                <div className="flex space-x-2">
                  {[...Array(wizardSteps.length)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-500",
                        i < currentStep 
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30" 
                          : i === currentStep - 1 
                          ? "bg-gradient-to-r from-[#2b6cb0] to-[#63b3ed] shadow-lg shadow-[#2b6cb0]/30 animate-pulse scale-125" 
                          : "bg-[#63b3ed]/20"
                      )}
                    />
                  ))}
                </div>
                <div className="w-px h-6 bg-[#63b3ed]/20" />
                <span className="text-sm font-bold text-[#1a365d] tracking-wide">
                  {currentStep} of {wizardSteps.length}
                </span>
              </div>

              {/* Revolutionary Action Buttons */}
              {isLastStep ? (
                <div className="flex space-x-4">
                  {/* Supreme Save Button */}
                  {generatedForm && (
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/30 to-emerald-600/30 rounded-2xl 
                                      blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <button
                        onClick={handleSubmit}
                        className="relative px-8 py-3.5 rounded-2xl font-bold text-white
                                   bg-gradient-to-r from-emerald-500 to-emerald-600
                                   shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40
                                   transition-all duration-500 micro-interaction"
                      >
                        <div className="flex items-center space-x-3">
                          <Download className="w-5 h-5" />
                          <span>Save Report</span>
                        </div>
                      </button>
                    </div>
                  )}
                  
                  {/* Ultimate Generate Button */}
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#2b6cb0]/40 to-[#1a365d]/40 rounded-2xl 
                                    blur-lg opacity-70 group-hover:opacity-100 transition-all duration-500" />
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !formData.primaryDiagnosis}
                      className={cn(
                        "relative px-10 py-3.5 rounded-2xl font-bold overflow-hidden transition-all duration-500",
                        isGenerating || !formData.primaryDiagnosis
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] text-white shadow-2xl shadow-[#2b6cb0]/40 micro-interaction"
                      )}
                    >
                      {!isGenerating && formData.primaryDiagnosis && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                        translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      )}
                      
                      <div className="relative flex items-center space-x-3">
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-5 h-5" />
                            <span>Generate Form</span>
                            <Sparkles className="w-4 h-4 animate-pulse" />
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                /* Supreme Next Button */
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#2b6cb0]/30 to-[#1a365d]/30 rounded-2xl 
                                  blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <button
                    onClick={handleNextStep}
                    className="relative px-10 py-3.5 rounded-2xl font-bold text-white overflow-hidden
                               bg-gradient-to-r from-[#2b6cb0] to-[#1a365d]
                               shadow-xl shadow-[#2b6cb0]/30 hover:shadow-2xl hover:shadow-[#2b6cb0]/40
                               transition-all duration-500 micro-interaction"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                    translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    
                    <div className="relative flex items-center space-x-3">
                      <span>Continue</span>
                      <ArrowRight className="w-5 h-5" />
                      <div className="w-2 h-2 bg-[#90cdf4] rounded-full animate-pulse" />
                    </div>
                  </button>
                </div>
              )}
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


// Step 1: Clinical Data - Advanced Medical Interface with Diagnosis Cards
const ClinicalDataStep: React.FC<any> = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      {/* Sophisticated section header */}
      <div className="text-center pb-4 border-b border-[#63b3ed]/10">
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-[#2b6cb0]/5 to-[#63b3ed]/5 rounded-2xl">
          <Stethoscope className="w-6 h-6 text-[#2b6cb0]" />
          <h3 className="text-lg font-bold text-[#1a365d]">Clinical Assessment</h3>
        </div>
      </div>
      
      {/* Diagnosis Cards Section */}
      <div className="max-w-6xl mx-auto">
        <DiagnosisCards
          selectedDiagnosis={formData.primaryDiagnosis}
          onDiagnosisSelect={(diagnosis) => updateFormData({ primaryDiagnosis: diagnosis })}
          className="mt-6"
        />
      </div>
    </div>
  );
};

// Step 2: Documentation - Premium Medical Documentation Interface
const DocumentationStep: React.FC<any> = ({ formData, updateFormData, sessionId }) => {
  return (
    <div className="space-y-6">
      {/* Premium section header */}
      <div className="text-center pb-4 border-b border-[#63b3ed]/10">
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-[#1a365d]/5 to-[#2b6cb0]/5 rounded-2xl">
          <FileText className="w-6 h-6 text-[#2b6cb0]" />
          <h3 className="text-lg font-bold text-[#1a365d]">Medical Documentation</h3>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Voice Transcript Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-base font-semibold text-[#1a365d] flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#1a365d] rounded-full" />
              <span>Voice Transcript</span>
            </label>
            <div className="flex items-center space-x-2 text-sm text-[#2b6cb0]/70">
              <Shield className="w-4 h-4" />
              <span>AI-Powered Transcription</span>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1a365d]/20 to-[#2b6cb0]/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
            <div className="relative">
              <VoiceTranscriptField
                value={formData.voiceTranscript}
                onChange={(transcript) => updateFormData({ voiceTranscript: transcript })}
                sessionId={sessionId}
                placeholder="Voice transcript will appear here automatically..."
              />
            </div>
          </div>
        </div>
        
        {/* Angiography Report Section */}
        <div className="space-y-4">
          <label className="block text-base font-semibold text-[#1a365d] flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#63b3ed] rounded-full" />
            <span>Specialized Medical Reports</span>
          </label>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#63b3ed]/20 to-[#90cdf4]/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
            <div className="relative">
              <AngiographyReportField
                value={formData.angiographyReport}
                onChange={(report) => updateFormData({ angiographyReport: report })}
                placeholder="Enter angiography report details, imaging findings, or other specialized medical documentation..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 3: Generation - Ultimate Medical Report Interface
interface GenerationStepProps {
  formData: any;
  generatedForm?: string;
  isGenerating: boolean;
  generationError?: string | null;
  onGenerate: () => void;
}

const GenerationStep: React.FC<GenerationStepProps> = ({ 
  formData, 
  generatedForm, 
  isGenerating, 
  generationError,
  onGenerate 
}) => {
  if (generatedForm) {
    return (
      <div className="space-y-8">
        {/* Success celebration */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-pulse" />
            <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#1a365d] mb-2">Report Generated Successfully!</h2>
          <p className="text-[#2b6cb0] font-medium">Your professional Form 100 consultation report is ready</p>
        </div>
        
        {/* Premium report display */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 rounded-2xl blur-lg opacity-50" />
          <div className="relative bg-white/95 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl p-8 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-800">Generated Medical Report</h3>
              <div className="flex items-center space-x-2 text-sm text-emerald-600">
                <Award className="w-4 h-4" />
                <span>Professional Grade</span>
              </div>
            </div>
            <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
              {generatedForm}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Error state display
  if (generationError) {
    return (
      <div className="space-y-8">
        {/* Error state */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-full opacity-80" />
            <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Generation Failed</h2>
          <p className="text-slate-600 font-medium">Please try again or check your data</p>
        </div>
        
        {/* Error details */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-red-400/20 to-red-600/20 rounded-2xl blur-lg opacity-50" />
          <div className="relative bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-red-200">
              <h3 className="text-lg font-bold text-red-800">Error Details</h3>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-red-700 leading-relaxed">
              {generationError}
            </p>
            
            {/* Retry button */}
            <div className="mt-6 text-center">
              <button
                onClick={onGenerate}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl
                           hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105
                           shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Sophisticated background with animated gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#2b6cb0]/10 to-[#63b3ed]/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-[#1a365d]/8 to-[#2b6cb0]/5 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      <div className="relative h-full overflow-y-auto p-2">
        {/* Compact diagnosis card */}
        {formData.primaryDiagnosis && (
          <div className="group relative">
            {/* Subtle glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#2b6cb0]/15 to-[#63b3ed]/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
            
            {/* Main diagnosis container */}
            <div className="relative bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg shadow-[#2b6cb0]/5">
              {/* Compact header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-[#2b6cb0] to-[#1a365d] p-2 rounded-lg">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1a365d]">Primary Diagnosis</h3>
                    <p className="text-[#2b6cb0]/70 text-sm">Clinical Assessment Complete</p>
                  </div>
                </div>
                
                {/* Compact status badge */}
                <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-full border border-emerald-200/50">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700">Confirmed</span>
                </div>
              </div>

              {/* Compact diagnosis display */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#63b3ed]/5 to-[#90cdf4]/5 rounded-lg blur" />
                <div className="relative bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-lg p-4 border border-[#e2e8f0]/50">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <div className="w-0.5 h-6 bg-gradient-to-b from-[#2b6cb0] to-[#63b3ed] rounded-full mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-[#1a365d] leading-tight">
                          {formData.primaryDiagnosis.name}
                        </h4>
                        <p className="text-[#475569] text-sm mt-1">
                          {formData.primaryDiagnosis.nameEn}
                        </p>
                      </div>
                    </div>
                    
                    {/* Compact ICD Code */}
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#2b6cb0]/10 border border-[#2b6cb0]/20">
                        <span className="text-xs font-bold text-[#2b6cb0]">ICD-10</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-[#1a365d]">
                        {formData.primaryDiagnosis.code}
                      </span>
                    </div>

                    {/* Compact description */}
                    {formData.primaryDiagnosis.description && (
                      <p className="text-[#64748b] text-xs leading-relaxed italic border-l border-[#e2e8f0] pl-3">
                        {formData.primaryDiagnosis.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Compact status indicators grid */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {/* Voice Transcript Indicator */}
                <div className="group/item relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100/50 to-blue-100/50 rounded-xl blur opacity-0 group-hover/item:opacity-100 transition-all duration-300" />
                  <div className="relative bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-white/30 hover:border-[#2b6cb0]/20 transition-all duration-300">
                    <div className="flex items-center space-x-1.5">
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center",
                        formData.voiceTranscript 
                          ? "bg-gradient-to-r from-[#2b6cb0] to-[#1a365d]" 
                          : "bg-slate-300"
                      )}>
                        <Mic className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-[#1a365d] text-xs truncate">Voice Transcript</h5>
                        <p className={cn(
                          "text-xs",
                          formData.voiceTranscript ? "text-[#2b6cb0]" : "text-slate-500"
                        )}>
                          {formData.voiceTranscript ? "Available" : "Not recorded"}
                        </p>
                      </div>
                      {formData.voiceTranscript && (
                        <CheckCircle className="w-3 h-3 text-[#2b6cb0]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Symptoms Indicator */}
                <div className="group/item relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#2b6cb0]/10 to-[#63b3ed]/10 rounded-lg blur opacity-0 group-hover/item:opacity-100 transition-all duration-300" />
                  <div className="relative bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-white/30 hover:border-[#2b6cb0]/20 transition-all duration-300">
                    <div className="flex items-center space-x-1.5">
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center",
                        (formData.symptoms?.length || 0) > 0
                          ? "bg-gradient-to-r from-[#2b6cb0] to-[#1a365d]" 
                          : "bg-slate-300"
                      )}>
                        <Activity className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-[#1a365d] text-xs truncate">Symptoms</h5>
                        <p className={cn(
                          "text-xs",
                          (formData.symptoms?.length || 0) > 0 ? "text-[#2b6cb0]" : "text-slate-500"
                        )}>
                          {formData.symptoms?.length || 0} documented
                        </p>
                      </div>
                      {(formData.symptoms?.length || 0) > 0 && (
                        <span className="bg-[#2b6cb0]/10 text-[#2b6cb0] text-xs font-bold px-1 py-0.5 rounded">
                          {formData.symptoms?.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Reports Indicator */}
                <div className="group/item relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#2b6cb0]/10 to-[#63b3ed]/10 rounded-lg blur opacity-0 group-hover/item:opacity-100 transition-all duration-300" />
                  <div className="relative bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-white/30 hover:border-[#2b6cb0]/20 transition-all duration-300">
                    <div className="flex items-center space-x-1.5">
                      <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center",
                        formData.angiographyReport 
                          ? "bg-gradient-to-r from-[#2b6cb0] to-[#1a365d]" 
                          : "bg-slate-300"
                      )}>
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-[#1a365d] text-xs truncate">Medical Reports</h5>
                        <p className={cn(
                          "text-xs",
                          formData.angiographyReport ? "text-[#2b6cb0]" : "text-slate-500"
                        )}>
                          {formData.angiographyReport ? "Available" : "None added"}
                        </p>
                      </div>
                      {formData.angiographyReport && (
                        <CheckCircle className="w-3 h-3 text-[#2b6cb0]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact completion progress */}
              <div className="mt-4 pt-3 border-t border-[#e2e8f0]/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#475569]">Consultation Readiness</span>
                  <span className="text-xs font-bold text-[#2b6cb0]">
                    {Math.round((
                      (formData.primaryDiagnosis ? 1 : 0) +
                      (formData.voiceTranscript ? 1 : 0) +
                      ((formData.symptoms?.length || 0) > 0 ? 1 : 0) +
                      (formData.angiographyReport ? 1 : 0)
                    ) / 4 * 100)}%
                  </span>
                </div>
                <div className="relative h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2b6cb0] to-[#63b3ed] rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${(
                        (formData.primaryDiagnosis ? 1 : 0) +
                        (formData.voiceTranscript ? 1 : 0) +
                        ((formData.symptoms?.length || 0) > 0 ? 1 : 0) +
                        (formData.angiographyReport ? 1 : 0)
                      ) / 4 * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for no diagnosis selected */}
        {!formData.primaryDiagnosis && (
          <div className="text-center py-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-[#2b6cb0]/10 to-[#63b3ed]/10 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-r from-[#e2e8f0] to-[#cbd5e1] rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-[#94a3b8]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#475569] mb-2">Diagnosis Required</h3>
            <p className="text-[#64748b]">Please select a primary diagnosis to continue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Form100Modal;