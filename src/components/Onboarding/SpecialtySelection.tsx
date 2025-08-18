import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface SpecialtySelectionProps {
  onSelect: (specialty: 'cardiology' | 'ob-gyn') => void;
  onSkip?: () => void;
  selectedSpecialty: 'cardiology' | 'ob-gyn' | null;
}

export const SpecialtySelection: React.FC<SpecialtySelectionProps> = ({
  onSelect,
  onSkip,
  selectedSpecialty
}) => {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cardAnimations, setCardAnimations] = useState({ cardiology: false, 'ob-gyn': false });
  const [focusedCard, setFocusedCard] = useState<string | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<string | null>(null);

  // Stagger animation entrance
  useEffect(() => {
    setIsVisible(true);
    const timer1 = setTimeout(() => {
      setCardAnimations(prev => ({ ...prev, cardiology: true }));
    }, 300);
    const timer2 = setTimeout(() => {
      setCardAnimations(prev => ({ ...prev, 'ob-gyn': true }));
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const specialties = [
    {
      id: 'cardiology',
      name: t('onboarding.specialty.cardiology.name'),
      description: 'Revolutionary AI-powered cardiovascular medicine platform with advanced clinical intelligence for modern healthcare professionals',
      subtitle: 'World-Class Cardiac Care Intelligence',
      tagline: 'Transform Your Practice with AI Excellence',
      available: true,
      icon: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      ),
      featureCards: [
        {
          icon: '🤖',
          title: 'AI Co-Pilot',
          description: 'Advanced AI medical intelligence with real-time literature integration and evidence-based recommendations',
          gradient: 'from-blue-500 to-cyan-500',
          badge: '24/7 Available',
          badgeColor: 'bg-blue-100 text-blue-800',
          metrics: { accuracy: '99.2%', responseTime: '<500ms', coverage: '50K+ Studies' },
          capabilities: ['Differential diagnosis assistance', 'Treatment recommendations', 'Risk stratification', 'Drug interactions']
        },
        {
          icon: '🧮',
          title: 'Medical Calculators',
          description: 'Comprehensive suite of 16+ clinically validated cardiac risk calculators with automated interpretation',
          gradient: 'from-emerald-500 to-teal-500',
          badge: '100% Validated',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          metrics: { calculators: '16+', validation: 'Clinical', compliance: 'ACC/AHA' },
          capabilities: ['ASCVD Risk Calculator', 'GRACE Score Assessment', 'HCM Risk-SCD Prediction', 'CHA2DS2-VASc Scoring']
        },
        {
          icon: '🔍',
          title: 'Knowledge Base',
          description: 'AI-powered medical knowledge repository with intelligent search and personalized recommendations',
          gradient: 'from-purple-500 to-violet-500',
          badge: 'AI-Curated',
          badgeColor: 'bg-purple-100 text-purple-800',
          metrics: { coverage: '2.5K+', updates: 'Daily', relevance: 'AI-Scored' },
          capabilities: ['Smart literature search', 'Personalized recommendations', 'Guideline compliance', 'Research trends']
        },
        {
          icon: '🩺',
          title: 'Blood Gas Analysis',
          description: 'Revolutionary ABG analysis with machine learning interpretation and predictive analytics',
          gradient: 'from-red-500 to-pink-500',
          badge: 'Smart Analysis',
          badgeColor: 'bg-red-100 text-red-800',
          metrics: { accuracy: '98.7%', speed: 'Instant', integration: 'Seamless' },
          capabilities: ['Automated interpretation', 'Acid-base detection', 'Compensation analysis', 'Clinical recommendations']
        },
        {
          icon: '🏥',
          title: 'Case Intelligence',
          description: 'Next-generation case management with AI-driven insights and collaborative workflows',
          gradient: 'from-orange-500 to-red-500',
          badge: 'AI-Driven',
          badgeColor: 'bg-orange-100 text-orange-800',
          metrics: { efficiency: '+40%', collaboration: 'Real-time', security: 'HIPAA' },
          capabilities: ['Multi-disciplinary collaboration', 'AI case insights', 'Automated documentation', 'Outcome prediction']
        }
      ],
      metrics: undefined
    },
    {
      id: 'ob-gyn',
      name: t('onboarding.specialty.obgyn.name'),
      description: 'Coming Soon - Advanced OB/GYN tools and resources',
      subtitle: undefined,
      tagline: undefined,
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      hoverGradient: 'from-gray-300 via-gray-400 to-gray-500',
      iconGradient: 'from-gray-400 to-gray-500',
      shadowColor: 'shadow-gray-500/25',
      hoverShadowColor: 'shadow-gray-500/40',
      available: false,
      icon: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <defs>
            <linearGradient id="babyGradientDisabled" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="50%" stopColor="#6b7280" />
              <stop offset="100%" stopColor="#4b5563" />
            </linearGradient>
          </defs>
          <path
            fill="url(#babyGradientDisabled)"
            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 5.5V7.5L13.5 7L12 8.5L10.5 7L9 7.5V5.5L3 7V9L9 10.5V16C9 18.21 10.79 20 13 20H15C17.21 20 19 18.21 19 16V10.5L21 9Z"
          />
        </svg>
      ),
      featureCards: undefined,
      metrics: undefined,
      features: [
        { icon: '🤱', text: 'Prenatal Care & Monitoring' },
        { icon: '🔬', text: 'Gynecological Assessments' },
        { icon: '📈', text: 'Obstetric Risk Calculations' },
        { icon: '💡', text: 'Reproductive Health Tools' }
      ],
      stats: { calculators: 'Soon', guidelines: 'Soon', studies: 'Soon' }
    }
  ] as const;

  const handleCardClick = (specialtyId: 'cardiology' | 'ob-gyn') => {
    const specialty = specialties.find(s => s.id === specialtyId);
    if (specialty?.available) {
      onSelect(specialtyId);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-2">
      {/* Header Section with Mobile-Optimized Animation */}
      <div className={`text-center mb-4 md:mb-6 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="relative inline-block mb-2 md:mb-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent leading-tight">
            {t('onboarding.specialty.title')}
          </h1>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 sm:w-12 md:w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-light px-2">
          {t('onboarding.specialty.subtitle')}
        </p>
        
        {/* Floating Elements - Hidden on mobile for performance */}
        <div className="hidden md:block absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-32 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-40 animation-delay-1000"></div>
          <div className="absolute top-16 right-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-50 animation-delay-2000"></div>
        </div>
      </div>

      {/* Specialty Cards - Minimalistic Excellence */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-5 max-w-4xl mx-auto">
        {specialties.map((specialty, index) => (
          <div
            key={specialty.id}
            className={`group relative transition-all duration-500 transform ${
              cardAnimations[specialty.id as keyof typeof cardAnimations]
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            {/* Card Container - World-Class Design */}
            <div
              onClick={() => handleCardClick(specialty.id)}
              onMouseEnter={() => {
                if (specialty.available) {
                  setHoveredCard(specialty.id);
                  setFocusedCard(specialty.id);
                }
              }}
              onMouseLeave={() => {
                setHoveredCard(null);
                setFocusedCard(null);
                setExpandedFeatures(null);
              }}
              onFocus={() => specialty.available && setFocusedCard(specialty.id)}
              onBlur={() => setFocusedCard(null)}
              className={`
                relative p-4 md:p-5 lg:p-6 rounded-2xl transition-all duration-700 cursor-pointer overflow-hidden backdrop-blur-sm
                ${!specialty.available ? 'cursor-not-allowed opacity-70' : ''}
                ${selectedSpecialty === specialty.id && specialty.available
                  ? 'bg-gradient-to-br from-red-50/90 via-white/95 to-rose-50/90 border-2 border-red-300/50 shadow-2xl shadow-red-200/30 scale-[1.03] transform-gpu'
                  : hoveredCard === specialty.id && specialty.available
                    ? 'bg-gradient-to-br from-white/95 via-gray-50/90 to-white/95 shadow-2xl shadow-gray-300/20 scale-[1.02] transform-gpu border border-red-200/30'
                    : 'bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl hover:shadow-gray-200/20 hover:scale-[1.01] transform-gpu'
                }
              `}
            >
              {/* Enhanced Floating Particles Effect */}
              {hoveredCard === specialty.id && specialty.available && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full animate-ping opacity-30 ${
                        i % 3 === 0 ? 'bg-red-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-purple-400'
                      }`}
                      style={{
                        left: `${10 + (i * 8) % 80}%`,
                        top: `${10 + (i * 12) % 80}%`,
                        animationDelay: `${i * 150}ms`,
                        animationDuration: `${2 + (i % 3)}s`
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Progressive Enhancement Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-red-500/5 opacity-0 transition-opacity duration-500 rounded-3xl pointer-events-none ${
                hoveredCard === specialty.id && specialty.available ? 'opacity-100' : ''
              }`} />
              
              {/* Enhanced Background Gradient Animation */}
              <div className={`
                absolute inset-0 bg-gradient-to-br from-red-500/8 via-blue-500/3 to-purple-500/8 
                opacity-0 transition-all duration-700
                ${hoveredCard === specialty.id && specialty.available ? 'opacity-100' : ''}
              `} />
              
              {/* Shimmer Effect */}
              <div className={`
                absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                opacity-0 transition-opacity duration-500 transform -skew-x-12
                ${hoveredCard === specialty.id && specialty.available ? 'opacity-100 animate-shimmer' : ''}
              `} style={{
                animation: hoveredCard === specialty.id ? 'shimmer 2s infinite' : 'none'
              }} />
              
              {/* Subtle Border Glow */}
              <div className={`
                absolute inset-0 rounded-2xl transition-all duration-500
                ${selectedSpecialty === specialty.id && specialty.available
                  ? 'shadow-[inset_0_0_0_1px_rgba(239,68,68,0.3)]'
                  : hoveredCard === specialty.id && specialty.available
                    ? 'shadow-[inset_0_0_0_1px_rgba(239,68,68,0.1)]'
                    : ''
                }
              `} />
              {/* Selection Indicator */}
              {selectedSpecialty === specialty.id && specialty.available && (
                <div className="absolute top-6 right-6">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Coming Soon Badge */}
              {!specialty.available && (
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Enhanced Header */}
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5 relative z-10">
                <div className="relative group">
                  <div className={`
                    w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden
                    ${specialty.available 
                      ? (selectedSpecialty === specialty.id 
                          ? 'bg-gradient-to-br from-red-500 via-rose-500 to-red-600 text-white shadow-2xl shadow-red-500/30' 
                          : hoveredCard === specialty.id 
                            ? 'bg-gradient-to-br from-red-500 via-rose-500 to-red-600 text-white shadow-2xl shadow-red-500/30 scale-110 rotate-3' 
                            : 'bg-gradient-to-br from-red-50 via-red-100 to-rose-50 text-red-500 shadow-lg'
                        )
                      : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 text-gray-400'
                    }
                  `}>
                    {specialty.icon}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                  </div>
                  {/* Pulse ring */}
                  <div className={`absolute inset-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-red-400/30 opacity-0 transition-opacity duration-300 ${
                    hoveredCard === specialty.id && specialty.available ? 'opacity-100 animate-ping' : ''
                  }`} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-lg md:text-xl font-bold transition-all duration-300 ${
                        hoveredCard === specialty.id && specialty.available 
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent scale-105' 
                          : 'text-gray-900'
                      }`}>
                        {specialty.name}
                      </h3>
                      {specialty.available && (
                        <div className="px-2 py-1 bg-gradient-to-r from-red-500/10 to-rose-500/10 backdrop-blur-sm rounded-lg border border-red-200/50">
                          <span className="text-xs font-bold text-red-600">PRO</span>
                        </div>
                      )}
                    </div>
                    
                    {specialty.subtitle && (
                      <p className={`text-sm md:text-base font-semibold transition-colors duration-300 ${
                        hoveredCard === specialty.id && specialty.available ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {specialty.subtitle}
                      </p>
                    )}
                  </div>
                  
                  <p className={`text-gray-600 leading-relaxed text-xs md:text-sm transition-colors duration-300 ${
                    hoveredCard === specialty.id && specialty.available ? 'text-gray-700' : ''
                  }`}>
                    {specialty.description}
                  </p>
                  
                  {specialty.tagline && hoveredCard === specialty.id && specialty.available && (
                    <p className="text-sm font-medium text-red-600 animate-fade-in">
                      {specialty.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              {specialty.metrics && (
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {Object.entries(specialty.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {value as string}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced Feature Showcase Cards */}
              {specialty.featureCards && (
                <div className="space-y-2 md:space-y-3 mb-4 md:mb-5 relative z-10">
                  {specialty.featureCards.map((feature: any, idx: number) => (
                    <div
                      key={idx}
                      className={`
                        relative overflow-hidden rounded-lg p-3 md:p-4 transition-all duration-500 group cursor-pointer backdrop-blur-sm
                        ${hoveredCard === specialty.id 
                          ? 'bg-white/95 shadow-xl transform translate-x-2 scale-[1.02] border border-red-100/50' 
                          : 'bg-gray-50/80 hover:bg-white/90 hover:shadow-lg border border-gray-100/50'
                        }
                      `}
                      style={{ transitionDelay: `${idx * 100}ms` }}
                      onMouseEnter={() => {
                        if (hoveredCard === specialty.id) {
                          setExpandedFeatures(feature.title);
                        }
                      }}
                      onMouseLeave={() => setExpandedFeatures(null)}
                    >
                      {/* Enhanced Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className={`w-full h-full bg-gradient-to-r ${feature.gradient}`}></div>
                      </div>
                      
                      {/* Shimmer effect for individual cards */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12
                      `} />
                      
                      {/* Content */}
                      <div className="relative space-y-2">
                        <div className="flex items-start gap-3">
                          <div className={`
                            w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg relative overflow-hidden
                            bg-gradient-to-r ${feature.gradient}
                            group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
                          `}>
                            {feature.icon}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-gray-800 transition-colors">
                                {feature.title}
                              </h4>
                              {feature.badge && (
                                <span className={`
                                  inline-flex items-center px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm
                                  ${feature.badgeColor || 'bg-blue-100 text-blue-800'}
                                  group-hover:scale-105 transition-transform duration-300
                                `}>
                                  {feature.badge}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Metrics Display */}
                        {feature.metrics && hoveredCard === specialty.id && (
                          <div className="grid grid-cols-3 gap-1 p-2 bg-gray-50/80 backdrop-blur-sm rounded-md border border-gray-200/50 animate-fade-in">
                            {Object.entries(feature.metrics).map(([key, value]) => (
                              <div key={key} className="text-center">
                                <div className="text-xs font-bold text-gray-900">{value as string}</div>
                                <div className="text-xs text-gray-500 capitalize font-medium">{key}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Expandable Capabilities */}
                        {feature.capabilities && expandedFeatures === feature.title && (
                          <div className="space-y-2 animate-fade-in">
                            <h5 className="text-sm font-bold text-gray-800 mb-3">Key Capabilities</h5>
                            {feature.capabilities.map((capability: string, capIndex: number) => (
                              <div 
                                key={capability} 
                                className="flex items-center space-x-3 text-xs text-gray-600 animate-slide-in-right"
                                style={{ animationDelay: `${capIndex * 100}ms` }}
                              >
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span>{capability}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Enhanced Hover Effect */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 
                        group-hover:opacity-10 transition-opacity duration-300 rounded-2xl
                      `}></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced CTA */}
              <div className="pt-3 md:pt-4 border-t border-gray-200/50 relative z-10">
                {specialty.available ? (
                  <button className={`
                    w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold text-sm md:text-base transition-all duration-400 relative overflow-hidden group/btn
                    ${selectedSpecialty === specialty.id
                      ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white shadow-2xl shadow-red-500/30 scale-105'
                      : hoveredCard === specialty.id
                        ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white shadow-2xl shadow-red-500/30 hover:scale-105'
                        : 'bg-gradient-to-r from-red-50 via-red-100 to-rose-50 text-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-600 hover:text-white border border-red-200/50'
                    }
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center space-x-3">
                      <span>Launch Cardiology Workspace</span>
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                ) : (
                  <button className="w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold text-sm md:text-base bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 text-gray-400 cursor-not-allowed">
                    Available Soon - Stay Tuned
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section - Mobile-Optimized */}
      <div className={`
        text-center mt-4 md:mt-6 transition-all duration-1000 delay-700 transform
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      `}>
        <div className="max-w-xl mx-auto px-2">
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
            {t('onboarding.specialty.note')}
          </p>
          
          {/* Trust Indicators - Mobile Stack Layout */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3 md:space-x-4 mt-3 md:mt-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{t('common.evidenceBased')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>{t('common.clinicallyValidated')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>{t('common.hipaaCompliant')}</span>
            </div>
          </div>
          
          {/* Skip for now option */}
          {onSkip && (
            <div className="mt-6 md:mt-8">
              <button
                onClick={onSkip}
                className="mx-auto block px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-300 hover:border-slate-400 rounded-lg bg-white/80 hover:bg-white/90 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
              >
                Skip for now - I'll choose later
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.4s ease-out forwards;
          opacity: 0;
        }
        
        /* Enhanced focus styles for accessibility */
        button:focus {
          outline: 3px solid rgba(220, 38, 38, 0.3);
          outline-offset: 2px;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}; 