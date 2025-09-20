import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface AboutMeFormProps {
  onSubmit: (aboutMe: string) => void;
  onSkip: () => void;
  onBack: () => void;
  initialValue: string;
}

export const AboutMeForm: React.FC<AboutMeFormProps> = ({
  onSubmit,
  onSkip,
  onBack,
  initialValue
}) => {
  const { t } = useTranslation();
  const [aboutMe, setAboutMe] = useState(initialValue);
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimatingSubmit, setIsAnimatingSubmit] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnimatingSubmit(true);
    
    setTimeout(() => {
      onSubmit(aboutMe);
    }, 800);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Dynamic gradient orbs that follow mouse */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle, ${isVisible ? 'rgba(26, 54, 93, 0.1)' : 'transparent'} 0%, transparent 70%)`,
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`,
            transform: `translate(-50%, -50%) scale(${isFocused ? 1.2 : 1})`
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-15 blur-2xl transition-all duration-700 ease-out"
          style={{
            background: `radial-gradient(circle, ${isVisible ? 'rgba(43, 108, 176, 0.1)' : 'transparent'} 0%, transparent 70%)`,
            left: `${mousePosition.x * -0.01 + 100}px`,
            top: `${mousePosition.y * -0.01 + 50}px`,
            transform: `translate(-50%, -50%) scale(${isFocused ? 1.3 : 1})`
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className={`transition-all duration-1200 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4" style={{
              background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #1a365d 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              Tell Us About Yourself
            </h1>
            
            {/* Premium underline animation */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full overflow-hidden" style={{
              background: 'linear-gradient(90deg, transparent, #2b6cb0, transparent)'
            }}>
              <div className="w-full h-full animate-pulse" style={{
                background: 'linear-gradient(90deg, #63b3ed, #2b6cb0, #63b3ed)',
                animation: 'shimmer 3s ease-in-out infinite'
              }} />
            </div>
          </div>
          
          <p className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto" style={{ color: '#2b6cb0' }}>
            Help our AI assistant provide personalized medical insights by sharing your background and expertise.
          </p>
          
          {/* Skip indicator */}
          <div className={`mt-6 transition-all duration-500 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full" style={{
              background: 'rgba(99, 179, 237, 0.1)',
              border: '1px solid rgba(99, 179, 237, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <svg className="w-4 h-4 mr-2" style={{ color: '#63b3ed' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium" style={{ color: '#1a365d' }}>
                Optional - You can skip this step if you prefer
              </span>
            </div>
          </div>
        </div>

        {/* Premium Form Section */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className={`transition-all duration-800 delay-400 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            
            {/* Glassmorphism textarea container */}
            <div className="relative group">
              <div 
                className="absolute inset-0 rounded-2xl transition-all duration-500"
                style={{
                  background: isFocused 
                    ? 'linear-gradient(135deg, rgba(26, 54, 93, 0.1), rgba(43, 108, 176, 0.05))' 
                    : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: isFocused 
                    ? '2px solid rgba(43, 108, 176, 0.3)' 
                    : '1px solid rgba(26, 54, 93, 0.1)',
                  boxShadow: isFocused 
                    ? '0 20px 60px rgba(26, 54, 93, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                    : '0 10px 40px rgba(26, 54, 93, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              />
              
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Share your medical specialty, years of experience, practice setting, or areas of clinical interest that would help personalize your AI assistant..."
                rows={6}
                className="relative w-full px-6 py-6 text-base leading-relaxed resize-none bg-transparent border-0 outline-none placeholder-opacity-60 transition-all duration-300"
                style={{
                  color: '#1a365d',
                  fontSize: '16px',
                  fontWeight: '400',
                  lineHeight: '1.7'
                }}
              />

              {/* Character count indicator */}
              <div className={`absolute bottom-4 right-4 transition-all duration-300 ${
                isFocused ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="px-3 py-1 rounded-full text-xs font-medium" style={{
                  background: 'rgba(26, 54, 93, 0.1)',
                  color: '#1a365d',
                  backdropFilter: 'blur(10px)'
                }}>
                  {aboutMe.length} characters
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`transition-all duration-1000 delay-600 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
              
              {/* Back Button */}
              <button
                type="button"
                onClick={onBack}
                className="group px-6 py-3 font-semibold rounded-xl transition-all duration-300 border-2 flex items-center justify-center space-x-2 min-h-[48px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(26, 54, 93, 0.2)',
                  color: '#1a365d',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(26, 54, 93, 0.4)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(26, 54, 93, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(26, 54, 93, 0.2)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Skip Button */}
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-6 py-3 font-semibold rounded-xl transition-all duration-300 min-h-[48px]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(26, 54, 93, 0.2)',
                    color: '#64748b',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(26, 54, 93, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 54, 93, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Skip for now
                </button>

                {/* Continue Button */}
                <button
                  type="submit"
                  disabled={isAnimatingSubmit}
                  className="relative overflow-hidden px-8 py-3 font-bold text-white rounded-xl transition-all duration-300 min-h-[48px] min-w-[140px]"
                  style={{
                    background: isAnimatingSubmit
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #1a365d, #2b6cb0)',
                    boxShadow: isAnimatingSubmit
                      ? '0 15px 40px rgba(16, 185, 129, 0.4)'
                      : '0 10px 30px rgba(26, 54, 93, 0.3)',
                    transform: isAnimatingSubmit ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAnimatingSubmit) {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(26, 54, 93, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAnimatingSubmit) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(26, 54, 93, 0.3)';
                    }
                  }}
                >
                  {isAnimatingSubmit ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Setting up...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Continue</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Animated success overlay */}
                  <div className={`absolute inset-0 transition-all duration-500 ${
                    isAnimatingSubmit 
                      ? 'bg-gradient-to-r from-emerald-400/20 to-green-400/20 animate-pulse' 
                      : 'opacity-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Success Animation Overlay */}
      {isAnimatingSubmit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(26, 54, 93, 0.1)',
              boxShadow: '0 25px 80px rgba(26, 54, 93, 0.15)'
            }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)'
                }}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: '#1a365d' }}>Setting up your workspace</h3>
                  <p className="text-sm" style={{ color: '#64748b' }}>Personalizing your MediMind experience...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        textarea::placeholder {
          color: #64748b;
          opacity: 0.7;
        }
        
        textarea:focus::placeholder {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}; 