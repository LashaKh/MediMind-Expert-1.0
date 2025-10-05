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
const MobileLayout: React.FC<{ navigate: any; profile: any; currentTime: Date }> = ({ navigate, profile, currentTime }) => {
  const { t } = useTranslation();
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" role="main" aria-label={t('workspace.mobile.ariaLabel')}>
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
    return <MobileLayout navigate={navigate} profile={profile} currentTime={currentTime} />;
  }

  // Navigation handlers
  const goToAICopilot = () => navigate('/ai-copilot');
  const goToCalculators = () => navigate('/calculators');
  const goToKnowledgeBase = () => navigate('/knowledge-base');
  const goToABGAnalysis = () => navigate('/abg-analysis');
  const goToDiseases = () => navigate('/diseases');

  // Premium feature cards with sophisticated design
  const premiumFeatures = [
    {
      id: 'ai-copilot',
      title: t('workspace.cardiology.featureCards.aiCoPilot.title'),
      subtitle: t('workspace.cardiology.featureCards.aiCoPilot.subtitle'),
      description: t('workspace.cardiology.featureCards.aiCoPilot.description'),
      icon: MessageSquare,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToAICopilot,
      stats: { value: t('workspace.cardiology.featureCards.aiCoPilot.statsValue'), label: t('workspace.cardiology.featureCards.aiCoPilot.statsLabel') },
      badge: t('workspace.cardiology.featureCards.aiCoPilot.badge'),
      features: Object.values(t('workspace.cardiology.featureCards.aiCoPilot.features', { returnObjects: true })) as string[],
      tourId: 'ai-copilot',
      metrics: {
        [t('workspace.cardiology.metrics.accuracy')]: '99.2%',
        [t('workspace.cardiology.metrics.responseTime')]: '<500ms',
        [t('workspace.cardiology.metrics.coverage')]: '50K+ Studies'
      }
    },
    {
      id: 'calculators',
      title: t('workspace.cardiology.featureCards.calculators.title'),
      subtitle: t('workspace.cardiology.featureCards.calculators.subtitle'),
      description: t('workspace.cardiology.featureCards.calculators.description'),
      icon: Calculator,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToCalculators,
      stats: { value: t('workspace.cardiology.featureCards.calculators.statsValue'), label: t('workspace.cardiology.featureCards.calculators.statsLabel') },
      badge: t('workspace.cardiology.featureCards.calculators.badge'),
      features: Object.values(t('workspace.cardiology.featureCards.calculators.features', { returnObjects: true })) as string[],
      tourId: 'calculators',
      metrics: {
        [t('workspace.cardiology.metrics.accuracy')]: '100%',
        [t('workspace.cardiology.metrics.validation')]: 'Clinical',
        [t('workspace.cardiology.metrics.compliance')]: 'ACC/AHA'
      }
    },
    {
      id: 'knowledge-base',
      title: t('workspace.cardiology.featureCards.knowledgeBase.title'),
      subtitle: t('workspace.cardiology.featureCards.knowledgeBase.subtitle'),
      description: t('workspace.cardiology.featureCards.knowledgeBase.description'),
      icon: BookOpen,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToKnowledgeBase,
      stats: { value: t('workspace.cardiology.featureCards.knowledgeBase.statsValue'), label: t('workspace.cardiology.featureCards.knowledgeBase.statsLabel') },
      badge: t('workspace.cardiology.featureCards.knowledgeBase.badge'),
      features: Object.values(t('workspace.cardiology.featureCards.knowledgeBase.features', { returnObjects: true })) as string[],
      tourId: 'knowledge-base',
      metrics: {
        [t('workspace.cardiology.metrics.coverage')]: '2,500+',
        [t('workspace.cardiology.metrics.updates')]: 'Daily',
        [t('workspace.cardiology.metrics.relevance')]: 'AI-Scored'
      }
    },
    {
      id: 'abg-analysis',
      title: t('workspace.cardiology.featureCards.abgAnalysis.title'),
      subtitle: t('workspace.cardiology.featureCards.abgAnalysis.subtitle'),
      description: t('workspace.cardiology.featureCards.abgAnalysis.description'),
      icon: TestTube2,
      primaryColor: '#1a365d',
      secondaryColor: '#2b6cb0',
      accentColor: '#63b3ed',
      onClick: goToABGAnalysis,
      stats: { value: t('workspace.cardiology.featureCards.abgAnalysis.statsValue'), label: t('workspace.cardiology.featureCards.abgAnalysis.statsLabel') },
      badge: t('workspace.cardiology.featureCards.abgAnalysis.badge'),
      features: Object.values(t('workspace.cardiology.featureCards.abgAnalysis.features', { returnObjects: true })) as string[],
      tourId: 'abg-analysis',
      metrics: {
        [t('workspace.cardiology.metrics.accuracy')]: '98.7%',
        [t('workspace.cardiology.metrics.speed')]: 'Instant',
        [t('workspace.cardiology.metrics.integration')]: 'Seamless'
      }
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
      onClick: () => {},
      stats: { value: t('workspace.cardiology.featureCards.caseIntelligence.statsValue'), label: t('workspace.cardiology.featureCards.caseIntelligence.statsLabel') },
      badge: t('workspace.cardiology.featureCards.caseIntelligence.badge'),
      features: Object.values(t('workspace.cardiology.featureCards.caseIntelligence.features', { returnObjects: true })) as string[],
      tourId: 'case-management',
      metrics: {
        [t('workspace.cardiology.metrics.efficiency')]: '+40%',
        [t('workspace.cardiology.metrics.collaboration')]: 'Real-time',
        [t('workspace.cardiology.metrics.security')]: 'HIPAA'
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
    <div className="min-h-screen bg-white" role="main" aria-label={t('workspace.cardiology.ariaLabel')}>
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:z-50"
        aria-label={t('workspace.cardiology.skipToMain')}
      >
        {t('workspace.cardiology.skipToMain')}
      </a>
      
      {/* Revolutionary Luxury Header - World-Class Design */}
      <div className="relative bg-gradient-to-br from-slate-50/95 via-white to-gray-50/80 border-b border-gray-200/50 overflow-hidden backdrop-blur-3xl">
        {/* Premium Multi-Layer Background System */}
        <div className="absolute inset-0">
          {/* Base gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/20" />
          
          {/* Medical mesh pattern overlay with ultra-subtle opacity */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" className="w-full h-full">
              <defs>
                <pattern id="medical-mesh" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="#1a365d" opacity="0.4"/>
                  <circle cx="60" cy="30" r="1" fill="#2b6cb0" opacity="0.3"/>
                  <circle cx="30" cy="70" r="1.2" fill="#63b3ed" opacity="0.2"/>
                  <circle cx="90" cy="90" r="0.8" fill="#90cdf4" opacity="0.25"/>
                  <path d="M20,20 Q40,10 60,20 T100,20" stroke="#1a365d" strokeWidth="0.5" fill="none" opacity="0.15"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#medical-mesh)" />
            </svg>
          </div>
          
          {/* Radial glow effect from center */}
          <div className="absolute inset-0 bg-gradient-radial from-blue-50/30 via-transparent to-transparent" />
        </div>

        {/* Main Header Container */}
        <div className="relative z-10 px-8 py-8 sm:px-12 lg:px-16">
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-8">
            {/* Live Status Indicator */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#63b3ed] rounded-full animate-pulse shadow-sm shadow-[#63b3ed]/50" />
                <span className="text-sm font-semibold text-[#1a365d] tracking-wide">{t('workspace.cardiology.live')}</span>
              </div>
              <div className="text-sm font-bold text-gray-900 font-mono tracking-wider">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-gray-500 font-medium tracking-wide">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <span className="text-xs font-semibold text-[#2b6cb0] uppercase tracking-widest">{t('workspace.cardiology.tbilisi')}</span>
            </div>

            {/* Professional Verification Badge */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#1a365d]/10 to-[#2b6cb0]/10 backdrop-blur-md rounded-2xl border border-[#63b3ed]/20">
                <CheckCircle2 className="w-4 h-4 text-[#2b6cb0]" />
                <span className="text-sm font-semibold text-[#1a365d]">{t('workspace.cardiology.allSystemsOperational')}</span>
                <div className="w-2 h-2 bg-[#63b3ed] rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Main Hero Section */}
          <div className="flex items-center justify-between">
            {/* Left: Branding & Identity */}
            <div className="flex items-center space-x-6">
              {/* Premium Medical Logo */}
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] flex items-center justify-center shadow-2xl shadow-[#1a365d]/30 ring-4 ring-white/50 backdrop-blur-sm">
                  <Heart className="w-10 h-10 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl" />
                </div>
                {/* Floating accent rings */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#63b3ed]/20 to-[#90cdf4]/20 blur-md animate-pulse" />
              </div>

              {/* Title & Specialty Information */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-4">
                  <div className="space-y-1">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] bg-clip-text text-transparent tracking-tight leading-none">
                      {t('workspace.cardiology.headerTitle')}
                    </h1>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-[#2b6cb0] tracking-wide">{t('workspace.cardiology.professional')}</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t('workspace.cardiology.workspace')}</h2>
                </div>
                
                {/* User Welcome Section */}
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{t('workspace.cardiology.welcomeBack', { name: profile?.full_name || t('workspace.cardiology.medicalProfessional') })}</div>
                      <div className="text-xs font-medium text-[#2b6cb0]">{t('workspace.cardiology.certifiedCardiologist')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main id="main-content" className="container mx-auto px-8 py-12 space-y-16">
        {/* Hero Section with Professional Suite Branding */}
        <section className="text-center space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-[#2b6cb0] uppercase tracking-wider">{t('workspace.cardiology.professionalSuite')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              {t('workspace.cardiology.nextGenTools')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t('workspace.cardiology.platformDescription')}
            </p>
          </div>
        </section>

        {/* Premium Feature Cards Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {premiumFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredCard === feature.id;

            return (
              <div
                key={feature.id}
                className={`group relative p-8 bg-white border border-gray-200 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                  isHovered ? 'scale-[1.02] border-[#63b3ed]/50' : ''
                }`}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={feature.onClick}
              >
                {/* Feature Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[${feature.primaryColor}] to-[${feature.secondaryColor}] flex items-center justify-center shadow-xl`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs font-bold text-[#2b6cb0] uppercase tracking-wider px-2 py-1 bg-[#90cdf4]/20 rounded-full">
                          {feature.badge}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className="text-2xl font-black text-gray-900">{feature.stats.value}</span>
                          <span className="text-sm font-medium text-gray-600">{feature.stats.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-lg font-semibold text-[#2b6cb0] mb-3">{feature.subtitle}</p>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 py-4">
                    {Object.entries(feature.metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold text-gray-900">{value}</div>
                        <div className="text-xs font-medium text-gray-500 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {feature.features.map((feat, i) => (
                      <span key={i} className="text-xs font-medium text-[#1a365d] bg-[#63b3ed]/10 px-3 py-1 rounded-full">
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-6 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-center justify-center space-x-2">
                      <span>{t('workspace.cardiology.featureCards.aiCoPilot.launch', { title: feature.title })}</span>
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Emergency Command Center */}
        <section className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-3xl p-8 border border-gray-200">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#1a365d] rounded-full animate-pulse" />
                      <span className="text-sm font-bold text-[#1a365d] uppercase tracking-wider">{t('workspace.cardiology.emergencyResponse')}</span>
                    </div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{t('workspace.cardiology.criticalAccess')}</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">{t('workspace.cardiology.emergencyCommandCenter')}</h3>
                  <p className="text-lg text-gray-600">
                    {t('workspace.cardiology.emergencyDescription')}
                    <span className="block mt-2 font-semibold text-[#2b6cb0]">{t('workspace.cardiology.emergencySubDescription')}</span>
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#2b6cb0]" />
                      <span className="text-sm font-semibold text-gray-700">{t('workspace.cardiology.oneClickResponse')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-[#2b6cb0]" />
                      <span className="text-sm font-semibold text-gray-700">{t('workspace.cardiology.evidenceBasedProtocols')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#2b6cb0]" />
                      <span className="text-sm font-semibold text-gray-700">{t('workspace.cardiology.realTimeResults')}</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Ready Badge */}
                <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-[#1a365d] uppercase tracking-wider">{t('workspace.cardiology.emergencyReady')}</span>
                    <div className="w-2 h-2 bg-[#63b3ed] rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`group p-6 bg-gradient-to-br ${action.color} text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Icon className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                        <ArrowUpRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">{action.label.split(' ')[0]}</h4>
                        <p className="text-sm opacity-90 font-medium">{action.label.split(' ').slice(1).join(' ')}</p>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-80">{t('workspace.cardiology.activate')}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Support Information */}
            <div className="lg:col-span-2 grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
              <div className="flex items-center space-x-3">
                <HeartHandshake className="w-6 h-6 text-[#2b6cb0]" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t('workspace.cardiology.emergencySupport')}</div>
                  <div className="text-xs text-gray-600">{t('workspace.cardiology.clinicalAssistance')}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-[#2b6cb0]" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t('workspace.cardiology.protocolCompliance')}</div>
                  <div className="text-xs text-gray-600">{t('workspace.cardiology.accAhaGuidelines')}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-[#2b6cb0]" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t('workspace.cardiology.responseTime')}</div>
                  <div className="text-xs text-gray-600">{t('workspace.cardiology.lessThan3Seconds')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Production Excellence Banner */}
        <section className="bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-3xl p-8 text-white">
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