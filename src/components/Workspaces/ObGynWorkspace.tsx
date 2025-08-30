import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../stores/useAppStore';
import { SpecialtyIndicator } from '../ui/SpecialtyIndicator';
import { 
  MessageSquare, 
  Calculator, 
  BookOpen, 
  Database, 
  FileText, 
  ClipboardList, 
  Clock, 
  TrendingUp,
  Sparkles,
  Heart,
  Brain,
  Activity,
  Users,
  Calendar,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Globe,
  TestTube2
} from 'lucide-react';

export const ObGynWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Mouse movement effect for gradient following
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Navigation handlers
  const goToAICopilot = () => navigate('/ai-copilot');
  const goToCalculators = () => navigate('/calculators');
  const goToKnowledgeBase = () => navigate('/knowledge-base');
  const goToABGAnalysis = () => navigate('/abg-analysis');

  // Dashboard features with enhanced styling
  const dashboardFeatures = [
    {
      id: 'ai-copilot',
      title: 'AI Co-Pilot',
      subtitle: 'Intelligent Medical Assistant',
      description: 'Get instant answers to OB/GYN questions with evidence-based recommendations and case discussions',
      icon: MessageSquare,
      gradient: 'from-blue-500 via-purple-500 to-indigo-600',
      bgGradient: 'from-blue-50/80 via-purple-50/60 to-indigo-50/80',
      glowColor: 'shadow-blue-500/25',
      buttonText: 'Start AI Chat',
      onClick: goToAICopilot,
      stats: '24/7 Available',
      badge: 'AI Powered'
    },
    {
      id: 'calculators',
      title: 'Medical Calculators',
      subtitle: 'Clinical Decision Tools',
      description: 'Due Date Calculator, Bishop Score, Risk Assessment tools and comprehensive OB/GYN calculators',
      icon: Calculator,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      bgGradient: 'from-emerald-50/80 via-teal-50/60 to-cyan-50/80',
      glowColor: 'shadow-emerald-500/25',
      buttonText: 'View Calculators',
      onClick: goToCalculators,
      stats: '25+ Tools',
      badge: 'Validated'
    },
    {
      id: 'knowledge-base',
      title: 'Knowledge Base',
      subtitle: 'Medical Resources Hub',
      description: 'Access curated OB/GYN guidelines, research papers, and your personal medical documents',
      icon: BookOpen,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
      bgGradient: 'from-violet-50/80 via-purple-50/60 to-fuchsia-50/80',
      glowColor: 'shadow-violet-500/25',
      buttonText: 'Browse Resources',
      onClick: goToKnowledgeBase,
      stats: '1000+ Articles',
      badge: 'Curated'
    },
    {
      id: 'abg-analysis',
      title: 'Blood Gas Analysis',
      subtitle: 'AI-Powered ABG Intelligence',
      description: 'Advanced blood gas analysis with AI-powered interpretation and automated action plans',
      icon: TestTube2,
      gradient: 'from-red-500 via-rose-500 to-pink-600',
      bgGradient: 'from-red-50/80 via-rose-50/60 to-pink-50/80',
      glowColor: 'shadow-red-500/25',
      buttonText: 'Analyze Blood Gas',
      onClick: goToABGAnalysis,
      stats: 'AI Enhanced',
      badge: 'Smart'
    },
    {
      id: 'case-management',
      title: 'Case Management',
      subtitle: 'Patient Case Collaboration',
      description: 'Create, manage and discuss complex patient cases with AI-assisted clinical insights',
      icon: FileText,
      gradient: 'from-orange-500 via-amber-500 to-yellow-600',
      bgGradient: 'from-orange-50/80 via-amber-50/60 to-yellow-50/80',
      glowColor: 'shadow-orange-500/25',
      buttonText: 'Manage Cases',
      onClick: () => {},
      stats: 'Collaborative',
      badge: 'Secure'
    },

  ];

  // Analytics cards
  const analyticsCards = [
    {
      title: 'Active Cases',
      value: '0',
      change: '+0%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Calculations Today',
      value: '0',
      change: '+0%',
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: 'up'
    },
    {
      title: 'AI Interactions',
      value: '0',
      change: '+0%',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'up'
    },
    {
      title: 'Documents Processed',
      value: '0',
      change: '+0%',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'up'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Animated Background Elements - Removed */}

      {/* Modern Header Section */}
      <div className="relative">
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-gray-900/5">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                    <Heart className="w-8 h-8 text-white group-hover:animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
                      Obstetrics & Gynecology
                    </h1>
                    <p className="text-xl text-gray-600 font-medium">
                      Advanced Medical Workspace
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <p className="text-lg text-gray-700">
                    Welcome back, <span className="font-semibold text-purple-700">{profile?.full_name || 'Dr. Lasha'}</span>
                  </p>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">{t('common.workspace.status.systemOnline')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Current Time</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <SpecialtyIndicator variant="badge" size="lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {dashboardFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            const isHovered = hoveredCard === feature.id;
            
            return (
              <div
                key={feature.id}
                className={`group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-700 ${isHovered ? feature.glowColor : ''}`}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                {/* Gradient Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Card Content */}
                <div className="relative p-8 h-full flex flex-col">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold rounded-full shadow-sm`}>
                        {feature.badge}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{feature.stats}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-600 mt-1">
                        {feature.subtitle}
                      </p>
                    </div>
                    <p className="text-gray-600 leading-relaxed flex-1">
                      {feature.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={feature.onClick}
                    className={`w-full mt-6 bg-gradient-to-r ${feature.gradient} text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group/btn`}
                  >
                    <span>{feature.buttonText}</span>
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* Analytics Dashboard */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Overview</h2>
              <p className="text-gray-600">Monitor your clinical workflow and AI interaction metrics</p>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-green-600">All systems operational</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6 group hover:scale-105 animate-in slide-in-from-bottom-4 fade-in duration-700"
                  style={{
                    animationDelay: `${(index + 6) * 100}ms`,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <div className="flex items-center space-x-1 text-xs font-medium text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>{card.change}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{card.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-12 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
              <p className="text-gray-600">Frequently used tools and shortcuts</p>
            </div>
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'New Patient Case', icon: Users, color: 'from-blue-500 to-indigo-600' },
              { label: 'Calculate Due Date', icon: Calendar, color: 'from-emerald-500 to-teal-600' },
              { label: 'AI Consultation', icon: Brain, color: 'from-purple-500 to-violet-600' },
              { label: 'Upload Document', icon: FileText, color: 'from-orange-500 to-amber-600' }
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.label}
                  className={`p-4 bg-gradient-to-br ${action.color} text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group`}
                >
                  <IconComponent className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-sm font-semibold">{action.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 