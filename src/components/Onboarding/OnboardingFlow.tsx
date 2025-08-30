import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, MedicalSpecialty, getSpecialtyRoute } from '../../stores/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { SpecialtySelection } from './SpecialtySelection';
import { AboutMeForm } from './AboutMeForm';
import { updateUserProfile } from '../../lib/api/user';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

interface OnboardingData {
  specialty: 'cardiology' | 'ob-gyn' | null;
  aboutMe: string;
}

export const OnboardingFlow: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    specialty: null,
    aboutMe: ''
  });
  
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const steps = [
    { title: t('onboarding.steps.selectSpecialty'), component: 'specialty' },
    { title: t('onboarding.steps.aboutYou'), component: 'about' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSpecialtySelect = (specialty: 'cardiology' | 'ob-gyn') => {
    setOnboardingData(prev => ({ ...prev, specialty }));
    handleNext();
  };

  const handleAboutMeSubmit = (aboutMe: string) => {
    setOnboardingData(prev => ({ ...prev, aboutMe }));
    handleComplete({ ...onboardingData, aboutMe });
  };

  const handleComplete = async (finalData: OnboardingData) => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Store onboarding data in localStorage as backup
      const onboardingComplete = {
        userId: user.id,
        specialty: finalData.specialty,
        aboutMe: finalData.aboutMe,
        completedAt: new Date().toISOString()
      };
      localStorage.setItem('medimind_onboarding', JSON.stringify(onboardingComplete));
      
      // Try to update the database in the background, but don't block navigation
      if (finalData.specialty || finalData.aboutMe) {
        const updateData: any = {};
        
        if (finalData.specialty) {
          const dbSpecialty = finalData.specialty === 'ob-gyn' ? 'obstetrics_gynecology' : finalData.specialty;
          updateData.medical_specialty = dbSpecialty;
        }
        
        if (finalData.aboutMe) {
          updateData.about_me_context = finalData.aboutMe;
        }
        
        // Update in background - don't await
        updateUserProfile(user.id, updateData)
          .then(() => {

            // Refresh profile in background
            refreshProfile().catch(console.warn);
          })
          .catch((error) => {

            // Could show a non-blocking toast here in the future
          });
      }

      // Navigate immediately without waiting for database operations
      let targetRoute;
      if (finalData.specialty) {
        const dbSpecialty = finalData.specialty === 'ob-gyn' ? 'obstetrics_gynecology' : finalData.specialty;
        const medicalSpecialty = dbSpecialty === 'obstetrics_gynecology' ? MedicalSpecialty.OBGYN : MedicalSpecialty.CARDIOLOGY;
        targetRoute = getSpecialtyRoute(medicalSpecialty);
      } else {
        targetRoute = '/workspace';
      }
      
      // Navigate immediately
      navigate(targetRoute, { replace: true });
      setIsLoading(false);
      
    } catch (error) {

      setError('Something went wrong. Proceeding to workspace...');
      
      // Even if there's an error, still navigate to workspace after a short delay
      setTimeout(() => {
        navigate('/workspace', { replace: true });
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleSkipAboutMe = () => {
    handleComplete(onboardingData);
  };

  const handleSkipSpecialty = () => {
    // Skip specialty selection and go directly to workspace
    handleComplete({ ...onboardingData, specialty: null });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100svh] flex items-center justify-center p-4 safe-area-inset">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base px-2">{t('onboarding.settingUpWorkspace')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100svh] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-100 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-3 leading-tight">
              {t('onboarding.welcome')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 font-light max-w-2xl mx-auto px-2">
              {t('onboarding.setupMessage')}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Error Display */}
        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          </div>
        )}

        {/* Mobile-Optimized Progress Steps */}
        <div className="flex flex-col sm:flex-row items-center justify-center mb-8 sm:mb-16 space-y-4 sm:space-y-0">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
              <div className="flex items-center">
                <div className={`
                  relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold transition-all duration-300 touch-target-md
                  ${index <= currentStep 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-slate-200 text-slate-500'
                  }
                `}>
                  <span className="relative z-10">{index + 1}</span>
                  {index <= currentStep && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse opacity-75"></div>
                  )}
                </div>
                <span className={`ml-3 sm:ml-4 text-base sm:text-lg font-semibold transition-colors duration-300 ${
                  index <= currentStep ? 'text-blue-700' : 'text-slate-500'
                } text-center sm:text-left`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-8 sm:w-16 lg:w-24 sm:h-0.5 mx-0 my-2 sm:mx-6 lg:mx-8 sm:my-0 transition-colors duration-300 ${
                  index < currentStep ? 'bg-gradient-to-b sm:bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className={`
          transition-all duration-500 transform
          ${currentStep === 0 ? 'bg-transparent' : 'bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8'}
        `}>
          {currentStep === 0 && (
            <SpecialtySelection 
              onSelect={handleSpecialtySelect}
              onSkip={handleSkipSpecialty}
              selectedSpecialty={onboardingData.specialty}
            />
          )}
          
          {currentStep === 1 && (
            <AboutMeForm
              onSubmit={handleAboutMeSubmit}
              onSkip={handleSkipAboutMe}
              onBack={handleBack}
              initialValue={onboardingData.aboutMe}
            />
          )}
        </div>
      </div>
    </div>
  );
}; 