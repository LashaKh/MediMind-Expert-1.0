import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../stores/useAppStore';
import { TourSpotlight } from './TourSpotlight';
import { TourTooltip } from './TourTooltip';
import { TourTooltipPortal } from './TourTooltipPortal';
import { TooltipPositionTest } from './TooltipPositionTest';
import { TourSelector } from './TourSelector';
import comprehensiveTourSteps from './comprehensiveTourSteps';
import '../../styles/tour-animations.css';
import { useTranslation } from 'react-i18next';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  allowSkip?: boolean;
  path?: string;
  waitAfterNavigateMs?: number;
  beforeStep?: () => void;
  afterStep?: () => void;
}

interface PremiumTourProps {
  isOpen: boolean;
  onClose: () => void;
  tourType: 'workspace' | 'chat' | 'calculators' | 'knowledge-base' | 'full' | 'selector' | 'ai-copilot' | 'abg-analysis' | 'medical-news' | 'vector-store';
  autoStart?: boolean;
  onComplete?: () => void;
}

// Import comprehensive tour steps
const allTourSteps = { 
  ...comprehensiveTourSteps,
  // Add simple test tours that should always work
  'test-ai-copilot': [
    {
      id: 'test-welcome',
      title: '🤖 Welcome to AI Medical Co-Pilot',
      content: '<p>This is a test tour to ensure the system works properly. You should see this tooltip with a spotlight effect.</p>',
      target: 'body',
      position: 'auto' as const
    },
    {
      id: 'test-header',
      title: '🎯 Header Tour Button',
      content: '<p>This is the tour button you clicked to start this experience.</p>',
      target: '[data-tour="header-tour-launcher"]',
      position: 'auto' as const
    }
  ]
};

export const PremiumTour: React.FC<PremiumTourProps> = ({
  isOpen,
  onClose,
  tourType,
  autoStart = false,
  onComplete
}) => {
  const { t } = useTranslation();
  // Access auth lazily if needed in future for personalization
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedTourType, setSelectedTourType] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [showPositionTest, setShowPositionTest] = useState(false);
  const [usePortalTooltip, setUsePortalTooltip] = useState(false); // EMERGENCY: Use direct DOM manipulation

  // Track highlighted element changes
  useEffect(() => {
    // Element highlighting state tracking
  }, [highlightedElement]);
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle tour selector mode
  useEffect(() => {
    if (tourType === 'selector' && isOpen) {

      // Reset all state when opening in selector mode
      setSelectedTourType(null);
      setCurrentStep(0);
      setIsInitialized(false);
      setHighlightedElement(null);
      setShowSelector(true);
    } else {
      setShowSelector(false);
    }
  }, [tourType, isOpen]);

  const steps = (allTourSteps as Record<string, TourStep[]>)[selectedTourType || tourType] || [];
  const currentStepData = steps[currentStep];

  // Debug logging
  useEffect(() => {
    if (selectedTourType) {

    }
  }, [selectedTourType, steps, currentStepData]);

  // Enhanced element finding with retries
  const findAndHighlightElement = useCallback((selector: string, retries = 5): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
      const attempt = (retriesLeft: number) => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {

          // Set the element in state
          setHighlightedElement(element);
          
          // Smooth scroll with better positioning
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center', 
            inline: 'center' 
          });
          
          resolve(element);
        } else if (retriesLeft > 0) {
          console.log(`⏳ Element ${selector} not found, retrying... (${retriesLeft} attempts left)`);
          setTimeout(() => attempt(retriesLeft - 1), 200);
        } else {

          setHighlightedElement(null);
          resolve(null);
        }
      };
      
      attempt(retries);
    });
  }, []);

  // Enhanced step navigation
  useEffect(() => {
    if (!isOpen || !currentStepData || !isInitialized) return;

    const executeStep = async () => {

      // CRITICAL: Clear previous highlighted element and force a render cycle

      setHighlightedElement(null);
      
      // Force React to process the state update before continuing
      await new Promise(resolve => {
        setTimeout(() => {
          requestAnimationFrame(resolve);
        }, 150);
      });
      
      // Execute before step callback
      if (currentStepData.beforeStep) {
        currentStepData.beforeStep();
      }

      // Handle navigation if required
      if (currentStepData.path && location.pathname !== currentStepData.path) {

        navigate(currentStepData.path);
        
        // Wait for navigation to complete
        const waitTime = currentStepData.waitAfterNavigateMs ?? 400;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Find and highlight target element

      const element = await findAndHighlightElement(currentStepData.target);

      // Execute after step callback
      if (currentStepData.afterStep) {
        currentStepData.afterStep();
      }
    };

    executeStep();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [isOpen, currentStep, currentStepData, location.pathname, navigate, findAndHighlightElement, isInitialized]);

  // Initialize tour
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setIsInitialized(true);
      if (autoStart) {
        setCurrentStep(0);
      }
    }
  }, [isOpen, isInitialized, autoStart]);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          if (currentStep > 0) {
            event.preventDefault();
            handlePrevious();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleCloseToSelector = useCallback(() => {

    // Return to tour selector instead of closing entire system
    setSelectedTourType(null);
    setShowSelector(true);
    setCurrentStep(0);
    setIsInitialized(true);
    setHighlightedElement(null);
    document.body.style.overflow = 'unset';
  }, []);

  const handleComplete = useCallback(() => {
    // Mark tour as completed
    const completedTourType = selectedTourType || tourType;
    localStorage.setItem(`premium-tour-completed-${completedTourType}`, 'true');
    localStorage.setItem(`premium-tour-completed-at-${completedTourType}`, new Date().toISOString());

    // FIXED: Use shared close-to-selector logic
    handleCloseToSelector();
    
    // Only call onComplete for specific integration needs, but don't close
    if (onComplete) {
      onComplete();
    }
  }, [tourType, selectedTourType, onComplete, handleCloseToSelector]);

  const handleClose = useCallback(() => {
    setHighlightedElement(null);
    setCurrentStep(0);
    setIsInitialized(false);
    document.body.style.overflow = 'unset';
    onClose();
  }, [onClose]);

  const handleSkip = useCallback(() => {
    const activeTourType = selectedTourType || tourType;
    localStorage.setItem(`premium-tour-skipped-${activeTourType}`, 'true');
    handleCloseToSelector(); // FIXED: Use selector close instead of full close
  }, [tourType, selectedTourType, handleCloseToSelector]);

  const handleBackToTours = useCallback(() => {

    handleCloseToSelector(); // Use the shared logic
  }, [handleCloseToSelector]);

  const handleOverlayClick = useCallback(() => {
    // Optional: close on overlay click or keep it disabled for better UX
    // handleClose();
  }, []);

  // Handle tour selection from TourSelector
  const handleTourSelect = useCallback((selectedTour: string) => {

    setSelectedTourType(selectedTour);
    setShowSelector(false);
    setCurrentStep(0);
    setIsInitialized(false);
    setHighlightedElement(null);

    // Small delay to allow state to update
    setTimeout(() => {

      setIsInitialized(true);
    }, 200);
  }, [selectedTourType, showSelector, currentStep, isInitialized, highlightedElement]);

  const handleSelectorClose = useCallback(() => {

    // When user closes the selector, they want to close the entire tour
    // This allows the tour to be reopened fresh from the outside
    setShowSelector(false);
    setSelectedTourType(null);
    setCurrentStep(0);
    setIsInitialized(false);
    setHighlightedElement(null);
    // Close the entire tour system so it can be reopened fresh
    onClose();
  }, [onClose]);

  // Show selector if in selector mode
  if (showSelector) {
    return (
      <TourSelector
        isOpen={showSelector}
        onClose={handleSelectorClose}
        onTourSelect={handleTourSelect}
      />
    );
  }

  if (!isOpen) {
    return null;
  }

  if (!currentStepData || !isInitialized) {

    return null;
  }

  // Validate that highlightedElement matches the current target
  const isElementValid = highlightedElement && currentStepData.target !== 'body' ? 
    highlightedElement.matches(currentStepData.target) : true;

  // For body target, use document.body directly if highlightedElement is null
  // For other targets, only use highlightedElement if it matches the current target
  const effectiveTargetElement = (isElementValid ? highlightedElement : null) || 
    (currentStepData.target === 'body' ? document.body : null);

  // Don't render until we have an effective target element
  if (!effectiveTargetElement) {

    return (
      <>
        <TourSpotlight
          targetElement={null}
          isVisible={false}
          onOverlayClick={handleOverlayClick}
        />
      </>
    );
  }

  return (
    <>
      {/* Spotlight and Highlight */}
      <TourSpotlight
        targetElement={effectiveTargetElement}
        isVisible={isOpen && !showSelector}
        onOverlayClick={handleOverlayClick}
      />

      {/* Debug Controls - Hidden in production */}
      {process.env.NODE_ENV === 'development' && false && (
        <div 
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 999998,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minWidth: '200px'
          }}
        >
          <div style={{ fontWeight: 'bold', borderBottom: '1px solid #444', paddingBottom: '4px' }}>
            🐛 Debug Controls
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={usePortalTooltip}
              onChange={(e) => setUsePortalTooltip(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Use Portal Tooltip
          </label>
          
          <button
            onClick={() => setShowPositionTest(!showPositionTest)}
            style={{
              padding: '6px 12px',
              backgroundColor: showPositionTest ? '#ff4444' : '#4444ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {showPositionTest ? 'Hide Position Test' : 'Show Position Test'}
          </button>
          
          <div style={{ fontSize: '10px', opacity: '0.7', marginTop: '4px' }}>
            <div>Target: {currentStepData.target}</div>
            <div>Element: {effectiveTargetElement?.tagName || 'null'}</div>
            <div>Step: {currentStep + 1}/{steps.length}</div>
          </div>
        </div>
      )}

      {/* Position Test Component */}
      <TooltipPositionTest
        isVisible={showPositionTest}
        onClose={() => setShowPositionTest(false)}
      />

      {/* Conditional Tooltip Rendering */}
      {usePortalTooltip ? (
        /* Portal Version with Advanced Debugging */
        <TourTooltipPortal
          targetElement={effectiveTargetElement}
          isVisible={isOpen && !showSelector}
          title={t(`tour.steps.${selectedTourType || tourType}.${currentStepData.id}.title`, { defaultValue: currentStepData.title })}
          content={t(`tour.steps.${selectedTourType || tourType}.${currentStepData.id}.content`, { defaultValue: currentStepData.content })}
          currentStep={currentStep}
          totalSteps={steps.length}
          position={currentStepData.position}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onClose={handleClose}
          onSkip={handleSkip}
          showPrevious={currentStep > 0}
          isLastStep={currentStep === steps.length - 1}
          allowSkip={currentStepData.allowSkip !== false}
          debugMode={false}
        />
      ) : (
        /* Original Version for Comparison */
        <TourTooltip
          targetElement={effectiveTargetElement}
          isVisible={isOpen && !showSelector}
          title={t(`tour.steps.${selectedTourType || tourType}.${currentStepData.id}.title`, { defaultValue: currentStepData.title })}
          content={t(`tour.steps.${selectedTourType || tourType}.${currentStepData.id}.content`, { defaultValue: currentStepData.content })}
          currentStep={currentStep}
          totalSteps={steps.length}
          position={currentStepData.position}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onClose={handleCloseToSelector}
          onSkip={handleSkip}
          onBackToTours={handleBackToTours}
          showPrevious={currentStep > 0}
          isLastStep={currentStep === steps.length - 1}
          allowSkip={currentStepData.allowSkip !== false}
          debugMode={false}
        />
      )}
    </>
  );
};