import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  X, 
  Lightbulb, 
  FileText, 
  Search, 
  MessageSquare,
  CheckCircle,
  Info,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../stores/useAppStore';

interface PersonalKBGuidanceProps {
  isPersonalKBActive: boolean;
  documentCount: number;
  onDismiss?: () => void;
  className?: string;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  examples?: string[];
}

const ONBOARDING_STORAGE_KEY = 'medimind_personal_kb_onboarding_completed';
const TIPS_VIEWED_STORAGE_KEY = 'medimind_personal_kb_tips_viewed';

export const PersonalKBGuidance: React.FC<PersonalKBGuidanceProps> = ({
  isPersonalKBActive,
  documentCount,
  onDismiss,
  className = ''
}) => {
  const { profile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTipsPanel, setShowTipsPanel] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if onboarding has been completed
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    setOnboardingCompleted(completed);
    
    // Show onboarding tooltip when Personal KB is first selected
    if (isPersonalKBActive && !completed && documentCount > 0) {
      setShowOnboarding(true);
    }
  }, [isPersonalKBActive, documentCount]);

  // Onboarding steps
  const onboardingSteps: GuideStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Personal Knowledge Base!',
      description: `You now have access to ${documentCount} personal documents. Your AI Co-Pilot can now provide answers based on your uploaded medical documents.`,
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
    },
    {
      id: 'query-tips',
      title: 'How to Query Effectively',
      description: 'For best results, be specific about what you\'re looking for. Reference document types, patient conditions, or specific topics.',
      icon: <Target className="w-6 h-6 text-blue-600" />,
      examples: [
        'What does my cardiology protocol say about hypertension?',
        'Find information about diabetes management in my guidelines',
        'What are the contraindications mentioned in my drug reference?'
      ]
    },
    {
      id: 'citations',
      title: 'Document Citations',
      description: 'Responses will include citations from your personal documents, showing exactly where the information came from.',
      icon: <FileText className="w-6 h-6 text-purple-600" />,
    },
    {
      id: 'ready',
      title: 'You\'re All Set!',
      description: 'Start asking questions about your documents. Click the help icon anytime for more tips.',
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
    }
  ];

  // Tips and best practices
  const queryTips: GuideStep[] = [
    {
      id: 'be-specific',
      title: 'Be Specific in Your Queries',
      description: 'The more specific your question, the better the AI can find relevant information in your documents.',
      icon: <Target className="w-5 h-5 text-blue-600" />,
      examples: [
        'What does my protocol say about ACE inhibitor dosing?',
        'Find the contraindications for beta-blockers in my guidelines',
        'What are the diagnostic criteria for heart failure in my documents?'
      ]
    },
    {
      id: 'document-types',
      title: 'Reference Document Types',
      description: 'Mention specific document types to help narrow down the search scope.',
      icon: <FileText className="w-5 h-5 text-purple-600" />,
      examples: [
        'According to my clinical guidelines...',
        'What does my drug reference say about...',
        'Find this information in my patient protocols...'
      ]
    },
    {
      id: 'medical-context',
      title: 'Provide Medical Context',
      description: 'Include patient demographics, conditions, or clinical scenarios for more relevant results.',
      icon: <MessageSquare className="w-5 h-5 text-green-600" />,
      examples: [
        'For a 65-year-old patient with diabetes, what does my protocol recommend?',
        'What are the pediatric dosing guidelines in my documents?',
        'Find contraindications for pregnant patients in my drug guide'
      ]
    },
    {
      id: 'follow-up',
      title: 'Ask Follow-up Questions',
      description: 'Build on previous responses to dive deeper into specific topics.',
      icon: <Zap className="w-5 h-5 text-orange-600" />,
      examples: [
        'Can you explain that dosing calculation in more detail?',
        'What are the side effects mentioned for this medication?',
        'Are there any drug interactions noted in my documents?'
      ]
    }
  ];

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setOnboardingCompleted(true);
    setShowOnboarding(false);
    setCurrentStep(0);
    onDismiss?.();
  };

  const handleNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleOnboardingComplete();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleShowTips = () => {
    setShowTipsPanel(true);
    localStorage.setItem(TIPS_VIEWED_STORAGE_KEY, 'true');
  };

  const getPlaceholderHint = () => {
    if (!isPersonalKBActive) return '';
    
    const hints = [
      'Ask about your uploaded medical documents...',
      'What does your protocol say about...',
      'Find information in your guidelines about...',
      'Search your documents for...'
    ];
    
    return hints[Math.floor(Math.random() * hints.length)];
  };

  // Onboarding Tooltip
  if (showOnboarding && isPersonalKBActive) {
    const currentStepData = onboardingSteps[currentStep];
    
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4 border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {currentStepData.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {currentStepData.description}
              </p>
              
              {currentStepData.examples && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Example queries:
                  </p>
                  <ul className="space-y-1">
                    {currentStepData.examples.map((example, index) => (
                      <li key={index} className="text-sm text-emerald-600 dark:text-emerald-400 italic">
                        "{example}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep
                          ? 'bg-emerald-600'
                          : index < currentStep
                          ? 'bg-emerald-300'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousStep}
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleNextStep}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tips Panel
  if (showTipsPanel) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Personal Knowledge Base Tips
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTipsPanel(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Get the most out of your personal medical documents with these expert tips.
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {queryTips.map((tip, index) => (
              <div key={tip.id} className="border-l-4 border-emerald-200 pl-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {tip.description}
                    </p>
                    
                    {tip.examples && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Examples:
                        </p>
                        <ul className="space-y-1">
                          {tip.examples.map((example, exampleIndex) => (
                            <li key={exampleIndex} className="text-sm text-emerald-600 dark:text-emerald-400 italic">
                              "{example}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Pro Tip
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Your personal knowledge base contains {documentCount} documents. 
                    The AI will automatically cite which documents it used to answer your questions, 
                    so you can verify the source and get more context if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <Button
              onClick={() => setShowTipsPanel(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Got it, thanks!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Help Icon (always visible when Personal KB is active)
  if (isPersonalKBActive && onboardingCompleted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShowTips}
        className={`flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 ${className}`}
        title="Personal Knowledge Base Tips"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="text-xs">Tips</span>
      </Button>
    );
  }

  return null;
};

// Hook for getting contextual placeholder hints
export const usePersonalKBPlaceholder = (isPersonalKBActive: boolean) => {
  const [placeholder, setPlaceholder] = useState('');
  
  useEffect(() => {
    if (isPersonalKBActive) {
      const hints = [
        'Ask about your uploaded medical documents...',
        'What does your protocol say about...',
        'Find information in your guidelines about...',
        'Search your documents for...',
        'According to my clinical guidelines...',
        'What does my drug reference mention about...'
      ];
      
      setPlaceholder(hints[Math.floor(Math.random() * hints.length)]);
    } else {
      setPlaceholder('');
    }
  }, [isPersonalKBActive]);
  
  return placeholder;
};

export default PersonalKBGuidance; 