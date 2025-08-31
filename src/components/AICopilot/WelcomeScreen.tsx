import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Calculator, 
  BookOpen, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  Zap,
  FileText,
  TrendingUp,
  Activity,
  Globe,
  User,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks/useTranslation';

interface WelcomeScreenProps {
  onQuickAction?: (action: string) => void;
  specialty?: string;
  caseHistory?: any[];
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onQuickAction,
  specialty = 'general',
  caseHistory = []
}) => {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second - major battery improvement
    return () => clearInterval(timer);
  }, []);

  const getSpecialtyConfig = (specialty: string) => {
    switch (specialty) {
      case 'cardiology':
        return {
          icon: Heart,
          gradient: 'from-red-500 to-pink-600',
          color: 'text-red-600',
          bg: 'from-red-500/10 to-pink-500/10',
          title: t('chat.specialtyTitles.cardiologyExpert', 'Cardiology AI Expert'),
          subtitle: t('chat.specialtySubtitles.cardiology', 'Advanced cardiovascular care assistance')
        };
      case 'obgyn':
        return {
          icon: User,
          gradient: 'from-purple-500 to-pink-600',
          color: 'text-purple-600',
          bg: 'from-purple-500/10 to-pink-500/10',
          title: t('chat.specialtyTitles.obgynExpert', 'OB/GYN AI Expert'),
          subtitle: t('chat.specialtySubtitles.obgyn', "Women's health & reproductive medicine")
        };
      default:
        return {
          icon: Stethoscope,
          gradient: 'from-blue-500 to-indigo-600',
          color: 'text-blue-600',
          bg: 'from-blue-500/10 to-indigo-500/10',
          title: t('chat.specialtyTitles.medicalExpert', 'Medical AI Expert'),
          subtitle: t('chat.specialtySubtitles.medical', 'Comprehensive healthcare assistance')
        };
    }
  };

  const specialtyConfig = getSpecialtyConfig(specialty);
  const SpecialtyIcon = specialtyConfig.icon;

  const quickActions = [
    {
      id: 'case',
      title: 'Create New Case',
      description: t('chat.quickActions.caseDesc', 'Start analyzing a patient case with AI assistance'),
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-600',
      action: () => onQuickAction?.('case')
    },
    {
      id: 'calculator',
      title: 'Medical Calculators',
      description: t('chat.quickActions.calculatorsDesc', 'Access clinical calculators and risk assessments'),
      icon: Calculator,
      gradient: 'from-emerald-500 to-teal-600',
      action: () => onQuickAction?.('calculator')
    },
    {
      id: 'guidelines',
      title: 'Clinical Guidelines',
      description: t('chat.quickActions.guidelinesDesc', 'Search evidence-based medical protocols'),
      icon: BookOpen,
      gradient: 'from-purple-500 to-violet-600',
      action: () => onQuickAction?.('guidelines')
    },
    {
      id: 'chat',
      title: 'Start Discussion',
      description: t('chat.quickActions.discussionDesc', 'Begin a medical consultation with AI'),
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-600',
      action: () => onQuickAction?.('chat')
    }
  ];

  const features = [
    {
      icon: Brain,
      title: t('chat.features.aiPoweredAnalysis', 'AI-Powered Analysis'),
      description: t('chat.features.aiPoweredAnalysisDesc', 'Advanced medical reasoning and decision support')
    },
    {
      icon: Globe,
      title: t('chat.features.evidenceBased', 'Evidence-Based'),
      description: t('chat.features.evidenceBasedDesc', 'Curated from 2.5M+ medical sources and guidelines')
    },
    {
      icon: Zap,
      title: t('chat.features.realTime', 'Real-Time Assistance'),
      description: t('chat.features.realTimeDesc', 'Instant responses for clinical decision making')
    },
    {
      icon: Star,
      title: t('chat.features.specialtyFocused', 'Specialty Focused'),
      description: t('chat.features.specialtyFocusedDesc', 'Tailored expertise for your medical specialty')
    }
  ];

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/5 to-transparent rounded-full animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-radial from-purple-500/5 to-transparent rounded-full animate-float" style={{ animationDelay: '-1s' }} />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-radial from-emerald-500/5 to-transparent rounded-full animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col items-center justify-start pt-8 px-8 pb-96 space-y-6 overflow-y-auto">
        {/* Header Section */}
        <div className="text-center space-y-6 max-w-2xl">
          {/* Main Icon */}
          <div className={`
            relative mx-auto w-24 h-24 rounded-3xl
            bg-gradient-to-br ${specialtyConfig.gradient}
            shadow-2xl shadow-blue-500/20 backdrop-blur-xl
            flex items-center justify-center
            animate-pulse-glow
          `}>
            <SpecialtyIcon className="w-12 h-12 text-white" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
          </div>

          {/* Welcome Text */}
          <div className="space-y-4">
            <h1 className={`
              text-4xl font-black tracking-tight
              bg-gradient-to-r ${specialtyConfig.gradient} bg-clip-text text-transparent
            `}>
              {t('chat.welcomeTo')} {specialtyConfig.title}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              {specialtyConfig.subtitle}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>{t('chat.liveAt', 'Live at')} {currentTime.toLocaleTimeString()}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>{t('chat.aiReady', 'AI Ready')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              const isHovered = hoveredCard === action.id;
              
              return (
                <div
                  key={action.id}
                  className={`
                    group relative p-6 rounded-2xl cursor-pointer
                    backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70
                    border border-white/30 shadow-xl shadow-slate-500/10
                    transition-all duration-500 ease-out
                    ${isHovered ? 'scale-105 shadow-2xl shadow-blue-500/20 border-white/50' : ''}
                  `}
                  onMouseEnter={() => setHoveredCard(action.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={action.action}
                >
                  {/* Background Gradient Effect */}
                  <div className={`
                    absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500
                    bg-gradient-to-br ${action.gradient.replace('to-', 'to-')}
                    ${isHovered ? 'opacity-5' : ''}
                  `} />
                  
                  <div className="relative flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`
                      p-3 rounded-xl bg-gradient-to-br ${action.gradient.replace('500', '500/10')}
                      border border-white/20 backdrop-blur-sm
                      transition-all duration-300
                      ${isHovered ? 'scale-110 rotate-3 shadow-lg' : ''}
                    `}>
                      <ActionIcon className={`w-6 h-6 bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className={`
                      w-5 h-5 text-slate-400 transition-all duration-300
                      ${isHovered ? 'translate-x-1 text-slate-600' : ''}
                    `} />
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`
                    absolute -bottom-2 left-1/2 transform -translate-x-1/2
                    w-3/4 h-4 bg-gradient-to-r ${action.gradient.replace('500', '400/20')}
                    blur-xl rounded-full transition-opacity duration-500
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                  `} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Cases Section */}
        {caseHistory && caseHistory.length > 0 && (
          <div className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {t('chat.recentCases', 'Recent Cases')} ({caseHistory.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuickAction?.('cases')}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                {t('chat.viewAllCases')}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseHistory.slice(0, 3).map((caseItem: any, index: number) => (
                <div
                  key={caseItem.id || index}
                  className="p-4 rounded-xl backdrop-blur-sm bg-white/40 border border-white/20 hover:bg-white/60 transition-all duration-300 cursor-pointer"
                  onClick={() => onQuickAction?.(`selectCase:${caseItem.id}`)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/10">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 truncate text-sm">
                        {caseItem.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {caseItem.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {caseItem.metadata?.complexity && (
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${caseItem.metadata.complexity === 'low' 
                              ? 'bg-green-100 text-green-700' 
                              : caseItem.metadata.complexity === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }
                          `}>
                            {caseItem.metadata.complexity}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(caseItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              
              return (
                <div
                  key={index}
                  className={`
                    text-center p-4 rounded-xl
                    backdrop-blur-sm bg-white/30 border border-white/20
                    transition-all duration-300 hover:scale-105 hover:bg-white/50
                  `}
                >
                  <div className="mb-3 flex justify-center">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500/10 to-gray-500/10">
                      <FeatureIcon className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">
            {t('chat.startTypingOrSelectAction', 'Start by typing a message below or selecting an action above')}
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
              {t('chat.aiAssistantReady', 'AI Assistant Ready')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 