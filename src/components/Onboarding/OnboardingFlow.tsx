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
      const onboardingComplete = {
        userId: user.id,
        specialty: finalData.specialty,
        aboutMe: finalData.aboutMe,
        completedAt: new Date().toISOString()
      };
      localStorage.setItem('medimind_onboarding', JSON.stringify(onboardingComplete));
      
      if (finalData.specialty || finalData.aboutMe) {
        const updateData: any = {};
        
        if (finalData.specialty) {
          const dbSpecialty = finalData.specialty === 'ob-gyn' ? 'obstetrics_gynecology' : finalData.specialty;
          updateData.medical_specialty = dbSpecialty;
        }
        
        if (finalData.aboutMe) {
          updateData.about_me_context = finalData.aboutMe;
        }
        
        updateUserProfile(user.id, updateData)
          .then(() => {
            refreshProfile().catch(console.warn);
          })
          .catch((error) => {
          });
      }

      let targetRoute;
      if (finalData.specialty) {
        const dbSpecialty = finalData.specialty === 'ob-gyn' ? 'obstetrics_gynecology' : finalData.specialty;
        const medicalSpecialty = dbSpecialty === 'obstetrics_gynecology' ? MedicalSpecialty.OBGYN : MedicalSpecialty.CARDIOLOGY;
        targetRoute = getSpecialtyRoute(medicalSpecialty);
      } else {
        targetRoute = '/workspace';
      }
      
      navigate(targetRoute, { replace: true });
      setIsLoading(false);
      
    } catch (error) {
      setError(t('onboarding.genericError', 'Something went wrong. Proceeding to workspace...'));
      
      setTimeout(() => {
        navigate('/workspace', { replace: true });
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleSkipAboutMe = () => {
    handleComplete(onboardingData);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100svh] flex items-center justify-center p-4 safe-area-inset">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: '#1a365d' }}></div>
          <p className="text-gray-600 text-sm sm:text-base px-2">{t('onboarding.settingUpWorkspace')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100svh] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-100 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight" style={{
              background: 'linear-gradient(to right, #1a365d, #2b6cb0, #1a365d)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              {t('onboarding.welcome')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-light max-w-2xl mx-auto px-2" style={{ color: '#2b6cb0' }}>
              {t('onboarding.setupMessage')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">
        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
              <div className="flex items-center">
                <div className={`
                  relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold transition-all duration-300 touch-target-md
                  ${index <= currentStep 
                    ? 'text-white shadow-lg' 
                    : 'bg-slate-200 text-slate-500'
                  }
                `} style={index <= currentStep ? {
                  background: 'linear-gradient(to right, #1a365d, #2b6cb0)',
                  boxShadow: '0 10px 25px -5px rgba(26, 54, 93, 0.25)'
                } : {}}>
                  <span className="relative z-10">{index + 1}</span>
                  {index <= currentStep && (
                    <div className="absolute inset-0 rounded-full animate-pulse opacity-75" style={{
                      background: 'linear-gradient(to right, #1a365d, #2b6cb0)'
                    }}></div>
                  )}
                </div>
                <span className={`ml-3 sm:ml-4 text-base sm:text-lg font-semibold transition-colors duration-300 text-center sm:text-left`} style={{
                  color: index <= currentStep ? '#1a365d' : '#6c757d'
                }}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-8 sm:w-16 lg:w-24 sm:h-0.5 mx-0 my-2 sm:mx-6 lg:mx-8 sm:my-0 transition-colors duration-300 ${
                  index < currentStep ? '' : 'bg-slate-200'
                }`} style={index < currentStep ? {
                  background: 'linear-gradient(to bottom, #1a365d, #2b6cb0)'
                } : {}} />
              )}
            </div>
          ))}
        </div>

        <div className={`
          transition-all duration-500 transform
          ${currentStep === 0 ? 'bg-transparent' : 'bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8'}
        `}>
          {currentStep === 0 && (
            <SpecialtySelection 
              onSelect={handleSpecialtySelect}
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