import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../stores/useAppStore';
import { SpecialtyIndicator } from '../ui/SpecialtyIndicator';
import { useTour } from '../../stores/useAppStore';
import { 
  MessageSquare, 
  Calculator, 
  BookOpen, 
  Database, 
  FileText,
  Activity,
  Users,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Heart,
  Brain,
  TrendingUp,
  Stethoscope,
  HeartHandshake,
  Sparkles,
  Clock,
  Award,
  Target,
  BarChart3,
  CheckCircle2,
  ArrowUpRight,
  TestTube2,
  User
} from 'lucide-react';

// Mobile-first responsive hook
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return { isMobile };
};

// Simple Mobile Layout Component
const MobileLayout: React.FC<{ navigate: any; profile: any; currentTime: Date; t: any }> = ({ navigate, profile, currentTime, t }) => {
  // Core medical tools
  const medicalTools = [
    {
      id: 'ai-copilot',
      title: t('workspace.mobile.tools.aiAssistant.title'),
      description: t('workspace.mobile.tools.aiAssistant.description'),
      icon: MessageSquare,
      color: 'from-[#1a365d] to-[#2b6cb0]',
      onClick: () => navigate('/ai-copilot')
    },
    {
      id: 'calculators',
      title: t('workspace.mobile.tools.calculators.title'),
      description: t('workspace.mobile.tools.calculators.description'),
      icon: Calculator,
      color: 'from-[#2b6cb0] to-[#63b3ed]',
      onClick: () => navigate('/calculators')
    },
    {
      id: 'knowledge-base',
      title: t('workspace.mobile.tools.knowledgeBase.title'),
      description: t('workspace.mobile.tools.knowledgeBase.description'),
      icon: BookOpen,
      color: 'from-[#63b3ed] to-[#90cdf4]',
      onClick: () => navigate('/knowledge-base')
    },
    {
      id: 'abg-analysis',
      title: t('workspace.mobile.tools.abgAnalysis.title'),
      description: t('workspace.mobile.tools.abgAnalysis.description'),
      icon: TestTube2,
      color: 'from-[#1a365d] to-[#63b3ed]',
      onClick: () => navigate('/abg-analysis')
    }
  ];

  // Emergency quick actions
  const emergencyActions = [
    {
      label: t('workspace.mobile.emergencyActions.emergencyProtocol'),
      icon: Heart,
      color: 'from-[#1a365d] to-[#2b6cb0]',
      action: () => navigate('/calculators')
    },
    {
      label: t('workspace.mobile.emergencyActions.abgAnalysis'),
      icon: TestTube2,
      color: 'from-[#2b6cb0] to-[#63b3ed]',
      action: () => navigate('/abg-analysis')
    },
    {
      label: t('workspace.mobile.emergencyActions.aiConsult'),
      icon: MessageSquare,
      color: 'from-[#63b3ed] to-[#90cdf4]',
      action: () => navigate('/ai-copilot')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" role="main" aria-label="Cardiology Workspace">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('workspace.mobile.headerTitle')}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{profile?.full_name || t('workspace.mobile.drPhysician')}</span>
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="text-right">
            <div className="flex items-center space-x-2 text-sm text-[#63b3ed] mb-1">
              <div className="w-2 h-2 bg-[#63b3ed] rounded-full animate-pulse" />
              <span className="font-medium">{t('workspace.mobile.online')}</span>
            </div>
            <div className="text-lg font-mono font-bold text-gray-900">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-gray-500">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Tools Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('workspace.mobile.medicalTools')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {medicalTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={tool.onClick}
                className="group relative p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {tool.description}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-[#1a365d] rounded-full animate-pulse" />
          <h2 className="text-lg font-semibold text-gray-900">{t('workspace.mobile.emergencyAccess')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {emergencyActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`p-4 bg-gradient-to-r ${action.color} text-white rounded-lg hover:shadow-lg transition-all duration-200 group`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">{action.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/20 border border-[#63b3ed]/30 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-[#2b6cb0]" />
          <div>
            <h3 className="font-semibold text-[#1a365d]">{t('workspace.mobile.systemReady')}</h3>
            <p className="text-sm text-[#2b6cb0]">{t('workspace.mobile.allToolsOperational')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CardiologyWorkspace: React.FC = () => {
  // ALL HOOKS MUST BE DECLARED FIRST BEFORE ANY CONDITIONAL LOGIC
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { isTourOpen, tourType, openTour, closeTour } = useTour();
  
  // All useState hooks
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [focusedFeature, setFocusedFeature] = useState<string | null>(null);

  // All useEffect hooks
  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Loading state
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Mouse tracking for magnetic effects (only needed for desktop)
  useEffect(() => {
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

  // If mobile, show streamlined layout (after all hooks are declared)
  if (isMobile) {
    return <MobileLayout navigate={navigate} profile={profile} currentTime={currentTime} t={t} />;
  }

  // Navigation handlers
  const goToAICopilot = () => navigate('/ai-copilot');
  const goToCalculators = () => navigate('/calculators');
  const goToKnowledgeBase = () => navigate('/knowledge-base');
  const goToABGAnalysis = () => navigate('/abg-analysis');
  const goToDiseases = () => navigate('/diseases');

  // Navigation handler for MediScribe
  const goToMediScribe = () => navigate('/mediscribe');

  // Navigation handler for Case Intelligence - opens case creation modal
  const goToCaseCreation = () => navigate('/ai-copilot?createCase=true');

  // Premium feature cards with sophisticated design
  const premiumFeatures = [
    {
      id: 'ai-copilot',
      title: t('workspace.cardiology.featureCards.aiCoPilot.title'),
      icon: MessageSquare,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToAICopilot,
      stats: { value: t('workspace.cardiology.featureCards.aiCoPilot.statsValue'), label: t('workspace.cardiology.featureCards.aiCoPilot.statsLabel') },
      badge: t('workspace.cardiology.featureCards.aiCoPilot.badge'),
      tourId: 'ai-copilot'
    },
    {
      id: 'mediscribe',
      title: t('workspace.cardiology.featureCards.mediscribe.title'),
      icon: Activity,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToMediScribe,
      stats: { value: t('workspace.cardiology.featureCards.mediscribe.statsValue'), label: t('workspace.cardiology.featureCards.mediscribe.statsLabel') },
      badge: t('workspace.cardiology.featureCards.mediscribe.badge'),
      tourId: 'mediscribe'
    },
    {
      id: 'calculators',
      title: t('workspace.cardiology.featureCards.calculators.title'),
      icon: Calculator,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToCalculators,
      stats: { value: t('workspace.cardiology.featureCards.calculators.statsValue'), label: t('workspace.cardiology.featureCards.calculators.statsLabel') },
      badge: t('workspace.cardiology.featureCards.calculators.badge'),
      tourId: 'calculators'
    },
    {
      id: 'knowledge-base',
      title: t('workspace.cardiology.featureCards.knowledgeBase.title'),
      icon: BookOpen,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToKnowledgeBase,
      stats: { value: t('workspace.cardiology.featureCards.knowledgeBase.statsValue'), label: t('workspace.cardiology.featureCards.knowledgeBase.statsLabel') },
      badge: t('workspace.cardiology.featureCards.knowledgeBase.badge'),
      tourId: 'knowledge-base'
    },
    {
      id: 'abg-analysis',
      title: t('workspace.cardiology.featureCards.abgAnalysis.title'),
      icon: TestTube2,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToABGAnalysis,
      stats: { value: t('workspace.cardiology.featureCards.abgAnalysis.statsValue'), label: t('workspace.cardiology.featureCards.abgAnalysis.statsLabel') },
      badge: t('workspace.cardiology.featureCards.abgAnalysis.badge'),
      tourId: 'abg-analysis'
    },
    {
      id: 'case-management',
      title: t('workspace.cardiology.featureCards.caseIntelligence.title'),
      subtitle: t('workspace.cardiology.featureCards.caseIntelligence.subtitle'),
      description: t('workspace.cardiology.featureCards.caseIntelligence.description'),
      icon: FileText,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToCaseCreation,
      stats: { value: t('workspace.cardiology.featureCards.caseIntelligence.statsValue'), label: t('workspace.cardiology.featureCards.caseIntelligence.statsLabel') },
      badge: t('workspace.cardiology.featureCards.caseIntelligence.badge'),
      features: t('workspace.cardiology.featureCards.caseIntelligence.features', { returnObjects: true }) as string[],
      tourId: 'case-management',
      metrics: {
        efficiency: '+40%',
        collaboration: 'Real-time',
        security: 'HIPAA'
      }
    }
  ];

  // Quick action items
  const quickActions = [
    {
      label: t('workspace.cardiology.quickActions.emergencyCardiacProtocol'),
      icon: Heart,
      color: 'from-[#1a365d] to-[#2b6cb0]',
      action: () => navigate('/calculators')
    },
    {
      label: t('workspace.cardiology.quickActions.bloodGasAnalysis'),
      icon: TestTube2,
      color: 'from-[#2b6cb0] to-[#63b3ed]',
      action: goToABGAnalysis
    },
    {
      label: t('workspace.cardiology.quickActions.aiClinicalConsult'),
      icon: Brain,
      color: 'from-[#63b3ed] to-[#2b6cb0]',
      action: goToAICopilot
    },
    {
      label: t('workspace.cardiology.quickActions.ascvdRiskCalculator'),
      icon: Calculator,
      color: 'from-[#2b6cb0] to-[#1a365d]',
      action: () => navigate('/calculators')
    }
  ];

  return (
    <div className="min-h-screen bg-white" role="main" aria-label="Cardiology Workspace - Professional Medical Intelligence Platform">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:z-50"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      
      {/* Premium Production-Ready Header - Left Aligned */}
      <div className="relative bg-white border-b border-gray-200/80">
        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-8 py-6">
          {/* All Content Left-Aligned */}
          <div className="flex items-center space-x-6">
            {/* Premium Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] flex items-center justify-center shadow-lg shadow-[#1a365d]/15">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title and Meta Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-3 mb-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                  {t('workspace.cardiology.headerTitle')}
                </h1>
                <span className="text-base font-semibold text-gray-400">{t('workspace.cardiology.workspace')}</span>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#2b6cb0]" />
                  <span className="font-medium text-gray-700">{t('workspace.cardiology.welcomeBack', { name: profile?.full_name || 'Dr. Physician' })}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-gray-500 font-medium">{t('workspace.cardiology.certifiedCardiologist')}</span>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-gray-500 font-medium">{t('workspace.cardiology.live')}</span>
                </div>
                <span className="text-gray-400 font-mono font-medium">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main id="main-content" className="max-w-7xl mx-auto px-8 py-10">
        {/* Premium Feature Cards Grid - Production Ready */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {premiumFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredCard === feature.id;

            return (
              <div
                key={feature.id}
                className={`group relative bg-white hover:bg-blue-50/30 border border-gray-100 rounded-xl hover:border-blue-200/50 hover:shadow-md transition-all duration-200 cursor-pointer ${
                  isHovered ? 'shadow-md border-blue-200/50 bg-blue-50/30' : 'shadow-sm'
                }`}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={feature.onClick}
              >
                {/* Content */}
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#4a90e2]/10 to-[#63b3ed]/10 flex items-center justify-center group-hover:from-[#4a90e2]/15 group-hover:to-[#63b3ed]/15 transition-colors duration-200">
                      <Icon className="w-6 h-6 text-[#4a90e2]" />
                    </div>

                    {/* Title */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-0.5">
                        {feature.title}
                      </h3>
                      <div className="flex items-center space-x-1.5">
                        <div className="w-1 h-1 rounded-full bg-green-400" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                          {feature.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button className="w-full bg-gray-50 hover:bg-[#4a90e2] text-gray-700 hover:text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2">
                    <span>{t('workspace.cardiology.activate')}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Production Excellence Banner */}
        <section className="bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-3xl p-8 text-white max-w-7xl mx-auto mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CheckCircle2 className="w-12 h-12 text-[#90cdf4]" />
              <div>
                <h4 className="text-2xl font-bold mb-2">{t('workspace.cardiology.productionExcellence')}</h4>
                <p className="text-[#90cdf4]">{t('workspace.cardiology.productionDescription')}</p>
              </div>
            </div>
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-[#90cdf4]" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};