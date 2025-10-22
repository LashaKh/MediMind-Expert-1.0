import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface SpecialtySelectionProps {
  onSelect: (specialty: 'cardiology' | 'ob-gyn') => void;
  selectedSpecialty: 'cardiology' | 'ob-gyn' | null;
}

export const SpecialtySelection: React.FC<SpecialtySelectionProps> = ({
  onSelect,
  selectedSpecialty
}) => {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const cardiologyFeaturesRaw = t('onboarding.specialty.cardiology.features', { returnObjects: true });
  const obgynFeaturesRaw = t('onboarding.specialty.obgyn.features', { returnObjects: true });

  const cardiologyFeatures = Array.isArray(cardiologyFeaturesRaw) 
    ? cardiologyFeaturesRaw 
    : ['AI Diagnostics', 'Risk Assessment', 'Clinical Guidelines', 'Treatment Plans'];
    
  const obgynFeatures = Array.isArray(obgynFeaturesRaw)
    ? obgynFeaturesRaw
    : ['Prenatal Care', 'Risk Monitoring', 'Specialized Tools', 'Care Plans'];

  const specialties = [
    {
      id: 'cardiology',
      name: t('onboarding.specialty.cardiology.name', 'Cardiology'),
      subtitle: t('onboarding.specialty.cardiology.subtitle', 'Cardiovascular Excellence'),
      description: t('onboarding.specialty.cardiology.description', 'Advanced AI-powered cardiovascular medicine platform with clinical intelligence and evidence-based diagnostics'),
      keyFeatures: cardiologyFeatures,
      available: true,
      gradient: 'from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]',
      accentColor: '#63b3ed',
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7">
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a365d" />
              <stop offset="50%" stopColor="#2b6cb0" />
              <stop offset="100%" stopColor="#63b3ed" />
            </linearGradient>
          </defs>
          <path
            fill="url(#heartGradient)"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      )
    },
    {
      id: 'ob-gyn',
      name: t('onboarding.specialty.obgyn.name', 'OB/GYN'),
      subtitle: t('onboarding.specialty.obgyn.subtitle', "Women's Health Innovation"),
      description: t('onboarding.specialty.obgyn.description', 'Comprehensive obstetrics and gynecology platform with specialized tools for maternal and reproductive care'),
      keyFeatures: obgynFeatures,
      available: false,
      gradient: 'from-slate-400 via-slate-500 to-slate-600',
      accentColor: '#94a3b8',
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7">
          <defs>
            <linearGradient id="obgynGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <path
            fill="url(#obgynGradient)"
            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7.5L13.5 7L12 8.5L10.5 7L9 7.5V5.5L3 7V9L9 10.5V16C9 18.21 10.79 20 13 20H15C17.21 20 19 18.21 19 16V10.5L21 9Z"
          />
        </svg>
      )
    }
  ] as const;

  const handleCardClick = (specialtyId: 'cardiology' | 'ob-gyn') => {
    const specialty = specialties.find(s => s.id === specialtyId);
    if (specialty?.available) {
      onSelect(specialtyId);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="absolute inset-0 opacity-40">
          <div 
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/10 to-indigo-400/10 blur-3xl"
            style={{
              left: `${mousePosition.x * 0.02}px`,
              top: `${mousePosition.y * 0.02}px`,
              transition: 'all 0.3s ease-out'
            }}
          />
          <div 
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-2xl"
            style={{
              right: `${mousePosition.x * 0.01}px`,
              bottom: `${mousePosition.y * 0.01}px`,
              transition: 'all 0.5s ease-out'
            }}
          />
        </div>
        
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className={`text-center mb-20 transition-all duration-1200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="relative inline-block mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
              <span className="bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] bg-clip-text text-transparent">
                {t('onboarding.specialtySelection.title', 'Choose Your Specialty')}
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed">
            {t('onboarding.specialtySelection.subtitle', 'Select your medical specialty to unlock personalized AI tools and evidence-based resources')}
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>{t('onboarding.specialtySelection.evidenceBased', 'Evidence-Based Medicine')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span>{t('onboarding.specialtySelection.clinicallyValidated', 'Clinically Validated')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <span>{t('onboarding.specialtySelection.hipaaCompliant', 'HIPAA Compliant')}</span>
            </div>
          </div>
        </div>

        <div className={`max-w-6xl mx-auto transition-all duration-1200 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {specialties.map((specialty, index) => (
              <div
                key={specialty.id}
                onClick={() => handleCardClick(specialty.id)}
                onMouseEnter={() => specialty.available && setHoveredCard(specialty.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`
                  group relative cursor-pointer transition-all duration-700 transform-gpu
                  ${!specialty.available ? 'cursor-not-allowed' : ''}
                  ${selectedSpecialty === specialty.id && specialty.available
                    ? 'scale-105'
                    : hoveredCard === specialty.id && specialty.available
                      ? 'scale-102'
                      : ''
                  }
                `}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className="relative group/card">
                  <div className={`
                    relative overflow-hidden rounded-3xl backdrop-blur-xl border transition-all duration-700
                    ${specialty.available
                      ? selectedSpecialty === specialty.id
                        ? 'bg-gradient-to-br from-white/95 to-white/80 border-blue-200/50 shadow-2xl shadow-blue-500/20'
                        : hoveredCard === specialty.id
                          ? 'bg-gradient-to-br from-white/90 to-white/70 border-blue-200/40 shadow-xl shadow-blue-500/10'
                          : 'bg-gradient-to-br from-white/80 to-white/60 border-slate-200/40 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-br from-slate-100/80 to-slate-200/60 border-slate-300/40 shadow-lg opacity-75'
                    }
                  `}>
                    
                    <div className="absolute inset-0 overflow-hidden">
                      <div className={`
                        absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20 blur-3xl transition-all duration-1000 bg-gradient-to-br
                        ${specialty.available 
                          ? `${specialty.gradient}` 
                          : 'from-slate-400 to-slate-500'
                        }
                        ${hoveredCard === specialty.id ? 'scale-150 opacity-30' : 'scale-100'}
                      `} />
                      
                      <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: specialty.available 
                          ? `radial-gradient(circle at 20px 20px, ${specialty.accentColor}15 1px, transparent 1px)`
                          : 'radial-gradient(circle at 20px 20px, #94a3b815 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                      }} />
                    </div>

                    <div className="relative p-8 h-auto min-h-[480px] flex flex-col">
                      <div className="absolute top-6 right-6 z-10">
                        {specialty.available ? (
                          selectedSpecialty === specialty.id ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-bold">{t('onboarding.specialtySelection.status.selected', 'Selected')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              <span className="text-xs font-bold">{t('onboarding.specialtySelection.status.available', 'Available')}</span>
                            </div>
                          )
                        ) : (
                          <div className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
                            <span className="text-xs font-bold">{t('onboarding.specialtySelection.status.comingSoon', 'Coming Soon')}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-8">
                        <div className={`
                          inline-flex p-4 rounded-2xl transition-all duration-500
                          ${specialty.available
                            ? hoveredCard === specialty.id || selectedSpecialty === specialty.id
                              ? `bg-gradient-to-br ${specialty.gradient} text-white shadow-xl scale-110 rotate-3`
                              : 'bg-white/60 border border-slate-200/60 text-slate-700 shadow-lg'
                            : 'bg-slate-200/60 border border-slate-300/60 text-slate-500'
                          }
                        `}>
                          {specialty.icon}
                        </div>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div>
                          <h3 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
                            {specialty.name}
                          </h3>
                          <p className="text-lg font-medium text-slate-600 mb-4">
                            {specialty.subtitle}
                          </p>
                          <p className="text-slate-600 leading-relaxed">
                            {specialty.description}
                          </p>
                        </div>

                        {specialty.available && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{t('onboarding.specialty.keyFeatures', 'Key Features')}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {specialty.keyFeatures.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${specialty.gradient}`} />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-8">
                        {specialty.available ? (
                          <button className={`
                            w-full group/btn relative overflow-hidden rounded-2xl py-4 px-6 font-bold text-lg transition-all duration-500 transform-gpu
                            ${selectedSpecialty === specialty.id
                              ? `bg-gradient-to-r ${specialty.gradient} text-white shadow-2xl scale-105`
                              : hoveredCard === specialty.id
                                ? `bg-gradient-to-r ${specialty.gradient} text-white shadow-xl hover:scale-105`
                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-300 shadow-lg hover:shadow-xl'
                            }
                          `}>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                            
                            <div className="relative flex items-center justify-between">
                              <span>{t('onboarding.specialtySelection.launchButton', 'Launch Workspace')}</span>
                              <svg className={`
                                w-6 h-6 transition-all duration-300
                                ${hoveredCard === specialty.id ? 'translate-x-2 scale-110' : ''}
                              `} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </button>
                        ) : (
                          <button className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-slate-200 text-slate-500 cursor-not-allowed border-2 border-slate-300">
                            {t('onboarding.specialtySelection.status.comingSoon', 'Coming Soon')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes bounce-in {
          0% { transform: scale(0.3) translateY(50px); opacity: 0; }
          50% { transform: scale(1.05) translateY(-10px); }
          70% { transform: scale(0.9) translateY(0px); }
          100% { transform: scale(1) translateY(0px); opacity: 1; }
        }

        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }

        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }

        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 3s infinite;
        }

        .gradient-background {
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }

        .bounce-in-animation {
          animation: bounce-in 0.8s ease-out forwards;
        }

        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 2px solid #63b3ed;
          border-radius: 50%;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        /* Advanced hover effects */
        .premium-card:hover .gradient-orb {
          transform: scale(1.2) rotate(10deg);
          opacity: 0.4;
        }

        .premium-card:hover .mesh-pattern {
          opacity: 0.5;
          transform: scale(1.1);
        }

        /* Glass morphism enhancement */
        .glass-effect {
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Micro-interactions */
        .micro-bounce:hover {
          animation: micro-bounce 0.3s ease-in-out;
        }

        @keyframes micro-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Premium shadow effects */
        .premium-shadow {
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .premium-shadow-lg {
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};