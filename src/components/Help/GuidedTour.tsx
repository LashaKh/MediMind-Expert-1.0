import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ArrowLeft, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../stores/useAppStore';
import { useTranslation } from 'react-i18next';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  allowSkip?: boolean;
  path?: string;
  waitAfterNavigateMs?: number;
}

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  tourType: 'workspace' | 'chat' | 'calculators' | 'knowledge-base' | 'full';
}

const tourSteps: Record<string, TourStep[]> = {
  workspace: [
    {
      id: 'welcome',
      title: 'Welcome to your workspace',
      content: 'This quick tour shows you where to chat with the AI, run clinical calculators, manage documents, and organize cases. You can skip anytime and revisit from the header.',
      target: 'body',
      position: 'bottom'
    },
    {
      id: 'tour-launcher',
      title: 'Start this tour anytime',
      content: 'Use the header actions to re-open this tour later. Look for the help/tour entry near your profile and language controls.',
      target: '[data-tour="header-tour-launcher"]',
      position: 'left'
    },
    {
      id: 'ai-copilot',
      title: 'AI Co-Pilot',
      content: 'Chat with your medical AI assistant. Ask questions, discuss cases, and get evidence-based recommendations. The AI is specialized for your medical field.',
      target: '[data-tour="ai-copilot"]',
      position: 'right'
    },
    {
      id: 'calculators',
      title: 'Medical Calculators',
      content: 'Access professional-grade medical calculators for clinical decision support. Results can be shared directly with the AI for further analysis.',
      target: '[data-tour="calculators"]',
      position: 'right'
    },
    {
      id: 'knowledge-base',
      title: 'Knowledge Base',
      content: 'Upload and manage your medical documents. The AI can reference these documents in conversations for personalized responses.',
      target: '[data-tour="knowledge-base"]',
      position: 'right'
    },
    {
      id: 'case-management',
      title: 'Case Management',
      content: 'Create anonymized patient cases for structured discussions with the AI. Perfect for complex clinical scenarios.',
      target: '[data-tour="case-management"]',
      position: 'left'
    }
  ],
  chat: [
    {
      id: 'chat-welcome',
      title: 'AI Chat Interface',
      content: 'This is your AI Co-Pilot chat interface. Ask medical questions, discuss cases, and get intelligent responses.',
      target: '[data-tour="chat-window"]',
      position: 'top'
    },
    {
      id: 'message-input',
      title: 'Message Input',
      content: 'Type your questions here. You can also upload files, images, and documents by dragging them into the chat or clicking the attachment icon.',
      target: '[data-tour="message-input"]',
      position: 'top'
    },
    {
      id: 'file-upload',
      title: 'File Upload',
      content: 'Upload medical images, ECGs, lab results, or documents. The AI can analyze and discuss these files with you.',
      target: '[data-tour="file-upload"]',
      position: 'top'
    },
    {
      id: 'calculator-suggestions',
      title: 'Calculator Suggestions',
      content: 'The AI may suggest relevant medical calculators based on your conversation. Click to use them directly.',
      target: '[data-tour="calculator-suggestions"]',
      position: 'left'
    }
  ],
  calculators: [
    {
      id: 'calculator-welcome',
      title: 'Medical Calculators',
      content: 'Professional-grade calculators for clinical decision support. All calculations are validated and follow medical guidelines.',
      target: '[data-tour="calculator-tabs"]',
      position: 'bottom'
    },
    {
      id: 'calculator-categories',
      title: 'Calculator Categories',
      content: 'Calculators are organized by clinical use. Browse categories to find the tools you need for specific scenarios.',
      target: '[data-tour="calculator-categories"]',
      position: 'bottom'
    },
    {
      id: 'calculator-form',
      title: 'Calculator Input',
      content: 'Enter patient parameters carefully. All inputs are validated for clinical accuracy with helpful error messages.',
      target: '[data-tour="calculator-form"]',
      position: 'left'
    },
    {
      id: 'calculator-results',
      title: 'Results & AI Integration',
      content: 'View detailed results with clinical interpretation. Use "Share with AI" to discuss the results with your AI Co-Pilot.',
      target: '[data-tour="calculator-results"]',
      position: 'left'
    }
  ],
  'knowledge-base': [
    {
      id: 'kb-welcome',
      title: 'Knowledge Base',
      content: 'Build your personal medical knowledge base by uploading relevant documents and literature.',
      target: '[data-tour="knowledge-base-header"]',
      position: 'bottom'
    },
    {
      id: 'document-upload',
      title: 'Document Upload',
      content: 'Upload PDFs, Word documents, and text files. Documents are processed with AI for intelligent search and reference.',
      target: '[data-tour="document-upload"]',
      position: 'bottom'
    },
    {
      id: 'document-processing',
      title: 'AI Processing',
      content: 'Uploaded documents are analyzed and indexed. This enables the AI to reference and cite your documents in conversations.',
      target: '[data-tour="processing-status"]',
      position: 'left'
    },
    {
      id: 'document-library',
      title: 'Document Library',
      content: 'View and manage your uploaded documents. Search through your personal knowledge base and organize your medical literature.',
      target: '[data-tour="document-library"]',
      position: 'top'
    }
  ]
  ,
  full: [
    {
      id: 'welcome',
      title: 'Welcome to your workspace',
      content: 'A production tour across the app: AI chat, calculators, documents, ABG analysis, diseases, and profile. Use Next to advance; we will auto-navigate as needed.',
      target: 'body',
      position: 'bottom'
    },
    {
      id: 'ws-ai',
      title: 'AI Co‑Pilot',
      content: 'Your specialty AI assistant. Start clinical conversations, analyze files, and get guideline‑based answers.',
      target: '[data-tour="ai-copilot"]',
      position: 'right',
      path: '/workspace/cardiology',
      waitAfterNavigateMs: 300
    },
    {
      id: 'ws-calcs',
      title: 'Validated calculators',
      content: 'Open the calculator suite for ACC/AHA‑compliant tools. We\'ll visit the calculators page next.',
      target: '[data-tour="calculators"]',
      position: 'right',
      path: '/workspace/cardiology',
      waitAfterNavigateMs: 300
    },
    {
      id: 'chat-window',
      title: 'AI Chat',
      content: 'Type questions, attach PDFs/images, and choose knowledge base scope for answers.',
      target: '[data-tour="chat-window"]',
      position: 'top',
      path: '/ai-copilot',
      waitAfterNavigateMs: 400
    },
    {
      id: 'chat-input',
      title: 'Compose & upload',
      content: 'Use the input area and the paperclip to attach files. Extracted text is included for better answers.',
      target: '[data-tour="message-input"]',
      position: 'top',
      path: '/ai-copilot',
      waitAfterNavigateMs: 200
    },
    {
      id: 'calc-tabs',
      title: 'Calculator categories',
      content: 'Browse categories, then select a tool. Inputs are strictly validated.',
      target: '[data-tour="calculator-tabs"]',
      position: 'bottom',
      path: '/calculators',
      waitAfterNavigateMs: 400
    },
    {
      id: 'calc-categories',
      title: 'Pick a tool',
      content: 'Cards show brief descriptions and validation badges.',
      target: '[data-tour="calculator-categories"]',
      position: 'bottom',
      path: '/calculators'
    },
    {
      id: 'kb-header',
      title: 'Knowledge Base',
      content: 'Curated guidelines or your personal library. AI cites documents in answers.',
      target: '[data-tour="knowledge-base-header"]',
      position: 'bottom',
      path: '/knowledge-base',
      waitAfterNavigateMs: 400
    },
    {
      id: 'kb-upload',
      title: 'Upload documents',
      content: 'Use the Personal tab to upload PDFs, Word, or TXT. Processing runs automatically.',
      target: '[data-tour="document-upload"]',
      position: 'bottom',
      path: '/knowledge-base'
    },
    {
      id: 'abg',
      title: 'ABG analysis',
      content: 'AI‑powered arterial/venous blood gas interpretation with action plans.',
      target: '[data-tour="abg-analysis"]',
      position: 'right',
      path: '/abg-analysis'
    },
    {
      id: 'diseases',
      title: 'Diseases library',
      content: 'Structured pages with clinical sections, references, and reading progress.',
      target: '[data-tour="diseases"]',
      position: 'right',
      path: '/diseases'
    },
    {
      id: 'profile',
      title: 'Profile & preferences',
      content: 'Manage specialty, security, and app preferences here. You can re‑open this tour from the header.',
      target: '[data-tour="profile"]',
      position: 'left',
      path: '/profile'
    }
  ]
};

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  tourType
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const steps = tourSteps[tourType] || [];
  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const tryHighlight = () => {
      const el = document.querySelector(currentStepData.target) as HTMLElement;
      if (el) {
        setHighlightedElement(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else {
        setHighlightedElement(null);
      }
    };

    // Navigate if step requires a specific route
    if (currentStepData.path && location.pathname !== currentStepData.path) {
      navigate(currentStepData.path);
      const delay = currentStepData.waitAfterNavigateMs ?? 350;
      const navTimer = setTimeout(tryHighlight, delay);
      // Prevent body scroll when tour is open
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(navTimer);
        document.body.style.overflow = 'unset';
      };
    }

    // Same-page highlight
    const timer = setTimeout(tryHighlight, 50);

    // Prevent body scroll when tour is open
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentStep, currentStepData, location.pathname, navigate]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault();
        handleNext();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark tour as completed for this user
    localStorage.setItem(`tour-completed-${tourType}`, 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem(`tour-completed-${tourType}`, 'true');
    onClose();
  };

  const getTooltipPosition = () => {
    // Always center the tooltip for maximum reliability
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      maxWidth: '90vw',
      maxHeight: '90vh'
    };
  };

  const getHighlightStyle = () => {
    if (!highlightedElement) return {};

    const rect = highlightedElement.getBoundingClientRect();
    const computed = window.getComputedStyle(highlightedElement);
    const radius = parseFloat(computed.borderRadius || '8');
    return {
      position: 'fixed' as const,
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
      zIndex: 9999,
      border: '2px solid rgba(59, 130, 246, 0.9)',
      borderRadius: `${Math.max(8, radius)}px`,
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      boxShadow: '0 0 0 6px rgba(59,130,246,0.15), 0 8px 30px rgba(2,6,23,0.35)',
      pointerEvents: 'none' as const
    };
  };

  if (!isOpen || !currentStepData) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998]"
        style={{
          background:
            'radial-gradient(1200px 600px at 20% 10%, rgba(59,130,246,0.18), transparent 40%), radial-gradient(800px 400px at 80% 90%, rgba(147,51,234,0.18), transparent 45%), rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)'
        }}
        onClick={onClose}
      />

      {/* Highlight */}
      {highlightedElement && (
        <div style={getHighlightStyle()} />
      )}

      {/* Tooltip */}
      <div
        style={getTooltipPosition()}
        className="relative max-w-md w-full mx-4 rounded-2xl shadow-2xl bg-white/80 border border-white/30 backdrop-blur-xl ring-1 ring-black/5"
        id="guided-tour-tooltip"
      >
        {/* Accent glow */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 40px 120px rgba(59,130,246,0.25)' }} />

        <div className="p-6 relative">
          {/* Top meta */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-700 ring-1 ring-inset ring-blue-600/20">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{t('tour.tooltip.title', { defaultValue: 'Medical Tour Guide' })}</span>
              <span className="text-gray-500">• {t('tour.tooltip.stepCounter', { defaultValue: 'Step {{current}} of {{total}}', current: currentStep + 1, total: steps.length })}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1.5 hover:bg-black/5"
              aria-label={t('tour.tooltip.close', { defaultValue: 'Close tour' })}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-2">{t(`tour.steps.${tourType}.${currentStepData.id}.title`, { defaultValue: currentStepData.title })}</h3>

          {/* Content */}
          <p className="text-gray-700/90 mb-5 leading-relaxed">
            {t(`tour.steps.${tourType}.${currentStepData.id}.content`, { defaultValue: currentStepData.content })}
          </p>

          {/* Progress */}
          <div className="mb-5">
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-gray-200 to-gray-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(((currentStep + 1) / steps.length) * 100)}
                role="progressbar"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{t('tour.tooltip.progressLabel', { defaultValue: 'Progress' })}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
          </div>

          {/* Step dots */}
          <div className="mb-4 flex items-center gap-1.5" aria-hidden>
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('tour.tooltip.previous', { defaultValue: 'Previous' })}
                </button>
              )}
              <button
                onClick={() => navigate('/help')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-black/5 transition-colors"
              >
                {t('tour.tooltip.allTours', { defaultValue: 'All Tours' })}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {(currentStepData.allowSkip !== false) && (
                <button
                  onClick={handleSkip}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-black/5 transition-colors"
                >
                  {t('tour.tooltip.skip', { defaultValue: 'Skip Tour' })}
                </button>
              )}

              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow hover:shadow-md transition-shadow"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    {t('tour.tooltip.next', { defaultValue: 'Next' })}
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {t('tour.tooltip.finish', { defaultValue: 'Complete' })}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Shortcuts hint */}
          <div className="mt-4 text-[11px] text-gray-500 flex items-center justify-end gap-3">
            <span className="hidden sm:inline">{t('tour.tooltip.press', { defaultValue: 'Press' })}</span>
            <span className="font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">←</span>
            <span className="hidden sm:inline">{t('tour.tooltip.or', { defaultValue: 'or' })}</span>
            <span className="font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">→</span>
            <span className="hidden sm:inline">{t('tour.tooltip.toNavigate', { defaultValue: 'to navigate' })} •</span>
            <span className="font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">Esc</span>
            <span className="hidden sm:inline">{t('tour.tooltip.toClose', { defaultValue: 'to close' })}</span>
          </div>
        </div>
      </div>
    </>
  );
}; 