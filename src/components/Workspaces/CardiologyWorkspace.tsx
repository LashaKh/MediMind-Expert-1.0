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
  TestTube2
} from 'lucide-react';
import '../../styles/advanced-workspace.css';
import '../../styles/medical-utilities.css';
import '../../styles/force-light-mode.css';
import '../../styles/premium-typography.css';

// Particle system for floating medical elements
const ParticleSystem: React.FC = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 10
  }));

  return (
    <div className="particles-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
    </div>
  );
};

// Advanced Stats Counter Component
const StatsCounter: React.FC<{ value: string; label: string; trend: string; icon: React.ComponentType }> = ({ 
  value, label, trend, icon: Icon 
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate counter with staggered effect
          const finalValue = parseInt(value) || 0;
          let start = 0;
          const duration = 2500;
          const increment = finalValue / (duration / 16);
          
          setTimeout(() => {
            const timer = setInterval(() => {
              start += increment;
              if (start >= finalValue) {
                setDisplayValue(value);
                clearInterval(timer);
              } else {
                setDisplayValue(Math.floor(start).toString());
              }
            }, 16);
          }, 200);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div 
      ref={ref}
      className={`premium-card hover-lift group cursor-pointer p-8 transform transition-all duration-600 ${
        isVisible ? 'slide-in-bottom' : 'opacity-0'
      } ${isHovered ? 'focused-card' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-rose-600 flex items-center justify-center shadow-elevated group-hover:shadow-floating transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
              <Icon className="w-8 h-8 text-white health-icon" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 w-16 h-16 rounded-3xl bg-red-500/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50/80 backdrop-blur-sm rounded-2xl border border-emerald-200/50 group-hover:bg-emerald-100/80 transition-colors duration-300">
            <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-bold text-emerald-700" style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '700',
              letterSpacing: '0.02em',
              textShadow: '0 1px 2px rgba(5, 150, 105, 0.1)'
            }}>{trend}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="premium-metric-value text-6xl font-black text-gray-900 gradient-text group-hover:scale-105 transition-transform duration-300" style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: '900',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
            fontFeatureSettings: '"tnum" on, "lnum" on'
          }}>
            {displayValue}
          </div>
          <div className="premium-metric-label text-lg font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300" style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: '500',
            letterSpacing: '0.01em',
            lineHeight: '1.3'
          }}>
            {label}
          </div>
          
          {/* Progress indicator */}
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: isVisible ? '100%' : '0%',
                transitionDelay: isVisible ? '500ms' : '0ms'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CardiologyWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { isTourOpen, tourType, openTour, closeTour } = useTour();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  const [focusedFeature, setFocusedFeature] = useState<string | null>(null);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Loading state
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Mouse tracking for magnetic effects
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

  const goToDiseases = () => navigate('/diseases');

  // Premium feature cards with sophisticated design
  const premiumFeatures = [
    {
      id: 'ai-copilot',
      title: 'AI Co-Pilot',
      subtitle: 'Intelligent Medical Assistant',
      description: 'Advanced AI-powered medical intelligence with real-time literature integration, evidence-based recommendations, and comprehensive diagnostic support for complex cardiac cases.',
      icon: MessageSquare,
      primaryColor: '#dc2626',
      secondaryColor: '#ef4444',
      accentColor: '#f87171',
      onClick: goToAICopilot,
      stats: { value: '24/7', label: 'Available' },
      badge: 'AI Powered',
      features: ['Evidence-Based', 'Real-Time', 'Literature Integration'],
      tourId: 'ai-copilot',
      metrics: {
        accuracy: '99.2%',
        responseTime: '<500ms',
        coverage: '50K+ Studies'
      },
      capabilities: [
        'Differential diagnosis assistance',
        'Treatment recommendation engine',
        'Risk stratification analysis',
        'Drug interaction checking'
      ]
    },
    {
      id: 'calculators',
      title: 'Medical Calculators',
      subtitle: 'Precision Risk Assessment',
      description: 'Comprehensive suite of 16+ clinically validated cardiac risk calculators with real-time validation, automated interpretation, and seamless integration with patient records.',
      icon: Calculator,
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      accentColor: '#34d399',
      onClick: goToCalculators,
      stats: { value: '16+', label: 'Calculators' },
      badge: 'Validated',
      features: ['ACC/AHA Guidelines', 'Auto-Interpretation', 'EHR Integration'],
      tourId: 'calculators',
      metrics: {
        accuracy: '100%',
        validation: 'Clinical',
        compliance: 'ACC/AHA'
      },
      capabilities: [
        'ASCVD Risk Calculator',
        'GRACE Score Assessment', 
        'HCM Risk-SCD Prediction',
        'CHA2DS2-VASc Scoring'
      ]
    },
    {
      id: 'knowledge-base',
      title: 'Knowledge Base',
      subtitle: 'Medical Literature & Guidelines',
      description: 'Expertly curated medical knowledge repository with AI-powered search, personalized recommendations, and seamless integration with current guidelines and latest research.',
      icon: BookOpen,
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      accentColor: '#8b5cf6',
      onClick: goToKnowledgeBase,
      stats: { value: '2.5K+', label: 'Resources' },
      badge: 'AI-Curated',
      features: ['Smart Search', 'Personalized', 'Always Updated'],
      tourId: 'knowledge-base',
      metrics: {
        coverage: '2,500+',
        updates: 'Daily',
        relevance: 'AI-Scored'
      },
      capabilities: [
        'Intelligent literature search',
        'Personalized recommendations',
        'Guideline compliance checking',
        'Research trend analysis'
      ]
    },
    {
      id: 'abg-analysis',
      title: 'Blood Gas Analysis',
      subtitle: 'AI-Powered ABG Intelligence',
      description: 'Revolutionary blood gas analysis platform with machine learning interpretation, predictive analytics, automated alerts, and comprehensive clinical decision support.',
      icon: TestTube2,
      primaryColor: '#dc2626',
      secondaryColor: '#ef4444',
      accentColor: '#f87171',
      onClick: goToABGAnalysis,
      stats: { value: 'AI', label: 'Powered' },
      badge: 'Smart Analysis',
      features: ['ML Interpretation', 'Predictive Alerts', 'Decision Support'],
      tourId: 'abg-analysis',
      metrics: {
        accuracy: '98.7%',
        speed: 'Instant',
        integration: 'Seamless'
      },
      capabilities: [
        'Automated ABG interpretation',
        'Acid-base disorder detection',
        'Compensation analysis',
        'Clinical action recommendations'
      ]
    },
    {
      id: 'case-management',
      title: 'Case Intelligence',
      subtitle: 'Clinical Collaboration Platform',
      description: 'Next-generation case management with AI-driven insights, multi-disciplinary collaboration tools, predictive analytics, and comprehensive workflow automation.',
      icon: FileText,
      primaryColor: '#ea580c',
      secondaryColor: '#f97316',
      accentColor: '#fb923c',
      onClick: () => {},
      stats: { value: 'Team', label: 'Ready' },
      badge: 'AI-Driven',
      features: ['Predictive Analytics', 'Team Workflows', 'Smart Documentation'],
      tourId: 'case-management',
      metrics: {
        efficiency: '+40%',
        collaboration: 'Real-time',
        security: 'HIPAA'
      },
      capabilities: [
        'Multi-disciplinary collaboration',
        'AI-powered case insights',
        'Automated documentation',
        'Outcome prediction modeling'
      ]
    },

  ];

  // Advanced analytics data
  const analyticsData = [
    { value: '0', label: 'Active Cardiac Cases', trend: '+0%', icon: Heart },
    { value: '0', label: 'AI Consultations', trend: '+0%', icon: Brain },
    { value: '0', label: 'Risk Calculations', trend: '+0%', icon: Calculator },
    { value: '0', label: 'Knowledge Queries', trend: '+0%', icon: BookOpen }
  ];

  // Quick action items
  const quickActions = [
    { 
      label: 'Emergency Cardiac Protocol', 
      icon: Heart, 
      color: 'from-red-500 to-red-600',
      action: () => navigate('/calculators')
    },
    { 
      label: 'Blood Gas Analysis', 
      icon: TestTube2, 
      color: 'from-orange-500 to-orange-600',
      action: goToABGAnalysis
    },
    { 
      label: 'AI Clinical Consult', 
      icon: Brain, 
      color: 'from-blue-500 to-blue-600',
      action: goToAICopilot
    },
    { 
      label: 'ASCVD Risk Calculator', 
      icon: Calculator, 
      color: 'from-emerald-500 to-emerald-600',
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
      
      {/* Floating Particle System */}
      <ParticleSystem aria-hidden="true" />

      {/* Revolutionary Luxury Header - World-Class Design */}
      <div className="relative bg-gradient-to-br from-slate-50/95 via-white to-gray-50/80 border-b border-gray-200/50 overflow-hidden backdrop-blur-3xl">
        {/* Premium Multi-Layer Background System */}
        <div className="absolute inset-0">
          {/* Sophisticated Gradient Mesh */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-gradient-to-bl from-red-500/12 via-rose-400/8 to-pink-300/4 blur-3xl opacity-80" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-blue-500/8 via-indigo-400/6 to-cyan-300/4 blur-3xl opacity-70" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] bg-gradient-to-r from-emerald-400/6 via-teal-300/4 to-blue-400/6 blur-3xl opacity-60" />
            
            {/* Premium Glass Layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/50 backdrop-blur-sm" />
            
            {/* Subtle Noise Texture */}
            <div className="absolute inset-0 opacity-[0.025]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.6'/%3E%3C/svg%3E")`,
              mixBlendMode: 'multiply'
            }} />
          </div>
          
          {/* Ultra-Premium Grid System */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="h-full w-full" style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)
              `,
              backgroundSize: '60px 60px'
            }} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between space-y-6 lg:space-y-0">
            {/* Revolutionary Brand Architecture */}
            <div className="flex items-start space-x-6 lg:space-x-8 w-full lg:w-auto">
              {/* Ultra-Premium Logo System */}
              <div className="relative flex-shrink-0 group">
                {/* Outer Glow Ring */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/15 via-rose-400/12 to-red-600/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                
                {/* Main Logo Container */}
                <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-red-600 shadow-2xl shadow-red-500/30 flex items-center justify-center backdrop-blur-sm border border-white/15 group-hover:scale-105 transition-all duration-700 transform-gpu">
                  {/* Inner Glass Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/25 via-white/10 to-transparent" />
                  
                  {/* Heart Icon */}
                  <Heart className="w-12 h-12 lg:w-14 lg:h-14 text-white relative z-10 drop-shadow-lg" />
                  
                  {/* Sophisticated ECG Animation */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-1500" />
                  </div>
                  
                  {/* Subtle Inner Shadow */}
                  <div className="absolute inset-1 rounded-2xl shadow-inner shadow-black/10" />
                </div>
                
                {/* Premium Floating Ring */}
                <div className="absolute inset-0 w-28 h-28 rounded-3xl border border-red-400/25 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                <div className="absolute -inset-1 w-30 h-30 rounded-3xl border border-red-300/15 opacity-0 group-hover:opacity-100 group-hover:scale-115 transition-all duration-1200 delay-100" />
              </div>
              
              {/* Revolutionary Typography Architecture */}
              <div className="space-y-5 flex-1 min-w-0">
                {/* Hero Title System */}
                <div className="space-y-2">
                  <div className="flex items-end space-x-6">
                    <h1 className="luxury-hero-title text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-[0.82] tracking-tight transform hover:scale-105 transition-all duration-700 cursor-default" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: '900',
                      letterSpacing: '-0.05em',
                      textShadow: '0 12px 24px rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.05)',
                      WebkitTextStroke: '0.5px rgba(0,0,0,0.08)',
                      fontFeatureSettings: '"ss01" on, "ss02" on, "cv01" on, "cv02" on, "kern" on, "liga" on',
                      textRendering: 'optimizeLegibility',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale'
                    }}>
                      Cardiology
                    </h1>
                    
                    {/* Ultra-Premium Badge */}
                    <div className="relative mb-3 group">
                      <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 via-rose-500/15 to-red-600/20 rounded-2xl blur-lg opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative px-5 py-3 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-2xl shadow-2xl shadow-red-500/25 border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-500">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-white/10 to-transparent" />
                        <span className="relative text-sm font-bold text-white tracking-wider" style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontWeight: '700',
                          letterSpacing: '0.08em',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          textTransform: 'uppercase'
                        }}>Professional</span>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="luxury-subtitle text-2xl sm:text-3xl lg:text-4xl font-extralight text-gray-600/90 tracking-wide" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '200',
                    letterSpacing: '0.03em',
                    textShadow: '0 4px 8px rgba(0,0,0,0.04)',
                    lineHeight: '1.1'
                  }}>Workspace</h2>
                </div>
                
                {/* Premium Description Architecture */}
                <div className="space-y-2 max-w-4xl">
                  <p className="luxury-primary-desc text-lg sm:text-xl lg:text-2xl text-gray-700 font-medium leading-tight" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '500',
                    letterSpacing: '-0.015em',
                    lineHeight: '1.25',
                    textShadow: '0 4px 8px rgba(0,0,0,0.06)'
                  }}>
                    Advanced Cardiac Care Intelligence Platform
                  </p>
                  
                  <p className="luxury-secondary-desc text-sm sm:text-base lg:text-lg text-gray-500/85 font-normal leading-relaxed" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '400',
                    letterSpacing: '0.01em',
                    lineHeight: '1.6',
                    textShadow: '0 2px 4px rgba(0,0,0,0.03)'
                  }}>
                    AI-Powered Medical Excellence for Healthcare Professionals
                  </p>
                </div>
                
                {/* Revolutionary User Status System */}
                <div className="space-y-3 mt-5">
                  {/* Premium Welcome Section */}
                  <div className="flex items-center space-x-5">
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/12 via-indigo-500/8 to-blue-600/12 backdrop-blur-sm border border-blue-200/40 flex items-center justify-center shadow-lg shadow-blue-500/10 group hover:scale-105 transition-all duration-500">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-white/10 to-transparent" />
                      <Stethoscope className="w-6 h-6 text-blue-600/90 relative z-10" />
                    </div>
                    <div className="space-y-1">
                      <div className="luxury-welcome text-base sm:text-lg text-gray-800 font-medium" style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: '500',
                        letterSpacing: '-0.01em'
                      }}>
                        Welcome back, <span className="font-semibold bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent">{profile?.full_name || 'Dr. Physician'}</span>
                      </div>
                      <div className="text-sm text-gray-500/80 font-normal" style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        letterSpacing: '0.01em'
                      }}>
                        Certified Cardiologist
                      </div>
                    </div>
                  </div>
                  
                  {/* Ultra-Premium Status Indicator */}
                  <div className="inline-flex items-center space-x-3 px-5 py-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-emerald-50/90 backdrop-blur-sm rounded-2xl border border-emerald-200/50 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/15 transition-all duration-500 group">
                    <div className="relative">
                      <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm" />
                      <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-70" />
                      <div className="absolute -inset-1 w-5 h-5 bg-emerald-400/30 rounded-full animate-pulse opacity-50" />
                    </div>
                    <span className="text-sm font-medium text-emerald-700/90 tracking-wide" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: '500',
                      letterSpacing: '0.015em'
                    }}>All Systems Operational</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600/90 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ultra-Premium Time Portal */}
            <div className="relative group">
              {/* Ambient Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/8 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
              
              {/* Main Time Container */}
              <div className="relative bg-gradient-to-br from-white/90 via-gray-50/80 to-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-2xl shadow-gray-500/15 border border-white/50 group-hover:shadow-3xl group-hover:shadow-gray-500/20 transition-all duration-700 transform group-hover:scale-105">
                {/* Glass Overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/40 via-white/20 to-transparent" />
                
                {/* Inner Shadow */}
                <div className="absolute inset-1 rounded-2xl shadow-inner shadow-gray-200/50" />
                
                {/* Content */}
                <div className="relative z-10 text-right space-y-1">
                  {/* Live Indicator */}
                  <div className="flex items-center justify-end space-x-2 mb-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                      <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
                    </div>
                    <span className="text-xs font-medium text-emerald-700 tracking-wider uppercase" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      letterSpacing: '0.1em'
                    }}>Live</span>
                  </div>
                  
                  {/* Time Display */}
                  <div className="luxury-time text-2xl font-bold text-gray-900 tracking-tight" style={{
                    fontFamily: 'JetBrains Mono, SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
                    fontWeight: '700',
                    letterSpacing: '0.02em',
                    fontFeatureSettings: '"tnum" on, "lnum" on, "ss01" on, "ss02" on',
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    lineHeight: '1'
                  }}>
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  {/* Date Display */}
                  <div className="luxury-date text-sm text-gray-600/80 font-medium tracking-wide" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '500',
                    letterSpacing: '0.03em',
                    textShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  
                  {/* Timezone */}
                  <div className="text-xs text-gray-500/60 font-normal tracking-widest" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    letterSpacing: '0.1em'
                  }}>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.toUpperCase()}
                  </div>
                </div>
                
                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 rounded-3xl opacity-[0.02]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-8 py-16 bg-white" tabIndex="-1">
        {/* Clinical Intelligence Dashboard */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-6 py-3 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-bold text-blue-800 tracking-[0.15em] uppercase" style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '700',
                letterSpacing: '0.15em',
                textShadow: '0 1px 2px rgba(37, 99, 235, 0.1)'
              }}>CLINICAL INTELLIGENCE</span>
            </div>
            <h2 className="premium-section-title text-3xl sm:text-4xl lg:text-5xl font-light text-gray-800 mb-8 tracking-tight transform hover:scale-105 transition-all duration-500" style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '300',
              letterSpacing: '0.01em',
              textShadow: '0 2px 4px rgba(0,0,0,0.05)',
              lineHeight: '1.2'
            }}>
              Real-Time Analytics Dashboard
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light" style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: '300',
              letterSpacing: '0.01em',
              lineHeight: '1.6'
            }}>
              Advanced performance metrics and clinical insights powered by AI for evidence-based cardiology excellence
            </p>
          </div>
          
          {/* Premium Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {analyticsData.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 p-8 transform hover:scale-105 hover:-rotate-1 transition-all duration-500 cursor-pointer animate-delay-${index * 100}`}
                >
                  {/* Background Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                  
                  {/* Top Section with Icon and Trend */}
                  <div className="relative z-10 flex items-start justify-between mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-red-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <IconComponent className="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-300" />
                        
                        {/* Pulse Effect */}
                        <div className="absolute inset-0 rounded-2xl bg-red-400 opacity-0 group-hover:opacity-30 animate-ping transition-opacity duration-300" />
                      </div>
                    </div>
                    
                    {/* Trend Indicator */}
                    <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 group-hover:bg-emerald-100 transition-colors duration-300">
                      <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-sm font-bold text-emerald-700" style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: '700',
                        letterSpacing: '0.02em',
                        textShadow: '0 1px 2px rgba(5, 150, 105, 0.1)'
                      }}>{stat.trend}</span>
                    </div>
                  </div>
                  
                  {/* Main Statistics */}
                  <div className="relative z-10 space-y-4">
                    <div className="premium-metric-value text-6xl font-black text-gray-900 group-hover:text-red-600 transition-colors duration-300 tracking-tight" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: '900',
                      letterSpacing: '-0.02em',
                      textShadow: '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
                      fontFeatureSettings: '"tnum" on, "lnum" on'
                    }}>
                      {stat.value}
                    </div>
                    <div className="premium-metric-label text-xl font-semibold text-gray-600 group-hover:text-gray-700 transition-colors duration-300" style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: '600',
                      letterSpacing: '0.01em',
                      lineHeight: '1.3'
                    }}>
                      {stat.label}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600 rounded-full transition-all duration-1000 ease-out transform group-hover:scale-x-110" 
                           style={{ width: '100%' }} />
                    </div>
                    
                    {/* Additional Insights */}
                    <div className="flex items-center justify-between text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                      <span className="font-medium">Last 24h</span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="font-semibold">Live</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                </div>
              );
            })}
          </div>
          
          {/* Additional Dashboard Insights */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Performance */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="premium-card-title text-2xl font-bold text-gray-900" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '700',
                    letterSpacing: '-0.01em',
                    textShadow: '0 2px 4px rgba(0,0,0,0.08)'
                  }}>System Performance</h3>
                  <p className="text-base text-gray-500" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '400',
                    letterSpacing: '0.01em'
                  }}>Real-time monitoring</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-600" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '500',
                    letterSpacing: '0.01em'
                  }}>Response Time</span>
                  <span className="text-base font-bold text-green-600" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '700',
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 2px rgba(34, 197, 94, 0.1)'
                  }}>&lt;200ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '95%' }} />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-600" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '500',
                    letterSpacing: '0.01em'
                  }}>Uptime</span>
                  <span className="text-base font-bold text-green-600" style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: '700',
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 2px rgba(34, 197, 94, 0.1)'
                  }}>99.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '99%' }} />
                </div>
              </div>
            </div>
            
            {/* AI Intelligence */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI Intelligence</h3>
                  <p className="text-sm text-gray-500">Machine learning insights</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Accuracy Rate</span>
                  <span className="text-sm font-bold text-blue-600">98.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '98%' }} />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Learning Rate</span>
                  <span className="text-sm font-bold text-blue-600">+15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
            
            {/* Quality Metrics */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Quality Assurance</h3>
                  <p className="text-sm text-gray-500">Clinical excellence</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Compliance</span>
                  <span className="text-sm font-bold text-emerald-600">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Validation</span>
                  <span className="text-sm font-bold text-emerald-600">Certified</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revolutionary Medical Tools Suite */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl px-6 py-3 mb-6">
              <Zap className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800 tracking-[0.15em] uppercase" style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: '700',
                letterSpacing: '0.15em',
                textShadow: '0 1px 2px rgba(5, 150, 105, 0.1)'
              }}>PROFESSIONAL SUITE</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Next-Generation Medical Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Industry-leading cardiology platform featuring AI-powered clinical intelligence, validated risk calculators, 
              and comprehensive diagnostic support trusted by healthcare professionals worldwide
            </p>
          </div>

          {/* Premium Medical Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              const isHovered = hoveredCard === feature.id;
              const isFocused = focusedFeature === feature.id;
              
              return (
                <div
                  key={feature.id}
                  data-tour={feature.tourId}
                  className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 cursor-pointer transform hover:scale-105 hover:-rotate-1 transition-all duration-500 overflow-hidden ${isFocused ? 'ring-4 ring-red-200' : ''} animate-delay-${index * 100}`}
                  onMouseEnter={() => {
                    setHoveredCard(feature.id);
                    setFocusedFeature(feature.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredCard(null);
                    setFocusedFeature(null);
                  }}
                  onFocus={() => setFocusedFeature(feature.id)}
                  onBlur={() => setFocusedFeature(null)}
                  onClick={feature.onClick}
                  style={{
                    minHeight: '520px'
                  }}
                >
                  {/* Sophisticated Background Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 via-white to-gray-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Animated Border Glow */}
                  <div 
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${feature.primaryColor}15, ${feature.secondaryColor}15)`,
                      filter: 'blur(1px)'
                    }}
                  />
                  
                  {/* Card Content */}
                  <div className="relative z-10 p-8 h-full flex flex-col">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-8">
                      {/* Icon with Advanced Animations */}
                      <div className="relative">
                        <div 
                          className="w-20 h-20 rounded-3xl shadow-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${feature.primaryColor}, ${feature.secondaryColor})`
                          }}
                        >
                          <IconComponent className="w-10 h-10 text-white relative z-10 transform group-hover:scale-110 transition-transform duration-500" />
                          
                          {/* Shimmer Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12" />
                          
                          {/* Pulse Ring */}
                          <div 
                            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"
                            style={{
                              background: `linear-gradient(135deg, ${feature.primaryColor}40, ${feature.secondaryColor}40)`
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Status Badge and Stats */}
                      <div className="flex flex-col items-end space-y-3">
                        <span 
                          className="px-4 py-2 text-white text-xs font-bold rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${feature.primaryColor}, ${feature.secondaryColor})`
                          }}
                        >
                          {feature.badge}
                        </span>
                        <div className="text-right">
                          <div className="text-3xl font-black text-gray-900 group-hover:scale-105 transition-transform duration-300">{feature.stats.value}</div>
                          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{feature.stats.label}</div>
                        </div>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300 leading-tight">
                          {feature.title}
                        </h3>
                        <p 
                          className="text-base font-bold mb-3 transition-colors duration-300" 
                          style={{ color: feature.primaryColor }}
                        >
                          {feature.subtitle}
                        </p>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>

                    {/* Performance Metrics */}
                    {feature.metrics && (
                      <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gray-900 rounded-2xl border border-gray-800 group-hover:bg-gray-800 transition-colors duration-300">
                        {Object.entries(feature.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-lg font-bold text-white">{value}</div>
                            <div className="text-xs text-gray-300 capitalize font-medium">{key}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feature Tags */}
                    {feature.features && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {feature.features.map((tag, tagIndex) => (
                          <span 
                            key={tag}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transform group-hover:scale-105 transition-all duration-300"
                            style={{ 
                              animationDelay: `${(index * 100) + (tagIndex * 50)}ms`,
                              transitionDelay: `${tagIndex * 25}ms`
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expandable Capabilities */}
                    {isHovered && feature.capabilities && (
                      <div className="mb-6 space-y-3 animate-fade-in">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                          <Target className="w-4 h-4 text-emerald-600" />
                          <span>Key Capabilities</span>
                        </h4>
                        <div className="space-y-2">
                          {feature.capabilities.map((capability, capIndex) => (
                            <div 
                              key={capability} 
                              className="flex items-center space-x-3 text-sm text-gray-600 animate-slide-in-right"
                              style={{ animationDelay: `${capIndex * 75}ms` }}
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              <span className="leading-relaxed">{capability}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Call to Action Button */}
                    <div className="mt-auto pt-6">
                      <button
                        className="group/btn relative w-full px-6 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          feature.onClick();
                        }}
                        style={{
                          background: `linear-gradient(135deg, ${feature.primaryColor}, ${feature.secondaryColor})`
                        }}
                      >
                        {/* Button Background Animation */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${feature.primaryColor}CC, ${feature.secondaryColor}CC)`
                          }}
                        />
                        
                        <div className="relative z-10 flex items-center justify-center space-x-3">
                          <span>Launch {feature.title}</span>
                          <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                        </div>
                        
                        {/* Shine Effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Emergency Response Command Center */}
        <div className="relative bg-white rounded-3xl shadow-2xl border border-red-100 p-12 mb-20 overflow-hidden">
          {/* Sophisticated Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-50 via-rose-25 to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-50 via-amber-25 to-transparent opacity-80" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-red-25 via-transparent to-orange-25 opacity-40 blur-3xl" />
          </div>
          
          {/* Emergency Alert Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="emergency-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#dc2626" strokeWidth="2"/>
                  <circle cx="30" cy="30" r="2" fill="#dc2626"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#emergency-grid)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            {/* Command Center Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl px-6 py-3 shadow-lg">
                    <Zap className="w-6 h-6 text-white animate-pulse" />
                    <span className="text-sm font-bold text-white tracking-wider">EMERGENCY RESPONSE</span>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl border-2 border-red-200">
                    <span className="text-sm font-black text-red-700">CRITICAL ACCESS</span>
                  </div>
                </div>
                
                <h3 className="premium-section-title text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight transform hover:scale-105 transition-all duration-500" style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: '900',
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 8px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)',
                  lineHeight: '1.1'
                }}>
                  Emergency Command Center
                </h3>
                
                <p className="text-xl text-gray-600 font-medium max-w-3xl leading-relaxed">
                  Instant access to critical cardiology protocols and life-saving diagnostic tools. 
                  <span className="block text-lg text-gray-500 mt-1 font-normal">
                    Evidence-based emergency response with one-click activation for time-critical patient care
                  </span>
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-red-500" />
                    <span className="font-semibold">One-click response</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold">Evidence-based protocols</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">Real-time results</span>
                  </div>
                </div>
              </div>
              
              {/* Emergency Status Indicators */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <HeartHandshake className="w-16 h-16 text-red-600 transform hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -inset-3 bg-red-500/20 rounded-full animate-ping" />
                  <div className="absolute -inset-1 bg-red-400/30 rounded-full animate-pulse" />
                </div>
                
                <div className="flex items-center space-x-3 px-6 py-4 bg-red-50 rounded-2xl border-2 border-red-200 hover:bg-red-100 transition-colors duration-300 group cursor-pointer shadow-lg">
                  <div className="w-5 h-5 bg-red-500 rounded-full relative">
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75" />
                  </div>
                  <span className="text-sm font-bold text-red-700 group-hover:text-red-800 transition-colors">EMERGENCY READY</span>
                  <Shield className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>
            
            {/* Emergency Action Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className={`group relative p-8 bg-gradient-to-br ${action.color} text-white rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-rotate-2 transition-all duration-400 focus:outline-none focus:ring-4 focus:ring-white/50 animate-delay-${(index + 8) * 100} overflow-hidden`}
                    style={{
                      minHeight: '200px'
                    }}
                  >
                    {/* Emergency Pulse Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Advanced Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 group-hover:animate-pulse" />
                    
                    <div className="relative z-10 h-full flex flex-col justify-center items-center space-y-6">
                      {/* Icon Container with Advanced Effects */}
                      <div className="relative">
                        <div className="w-24 h-24 bg-white/25 backdrop-blur-lg rounded-3xl flex items-center justify-center group-hover:bg-white/35 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 shadow-2xl">
                          <IconComponent className="w-12 h-12 group-hover:scale-125 transition-transform duration-500" />
                        </div>
                        
                        {/* Multiple Pulse Rings */}
                        <div className="absolute inset-0 w-24 h-24 rounded-3xl border-2 border-white/40 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" />
                        <div className="absolute -inset-2 w-28 h-28 rounded-3xl border border-white/20 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
                        <div className="absolute -inset-4 w-32 h-32 rounded-3xl border border-white/10 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-700" style={{ animationDelay: '0.2s' }} />
                      </div>
                      
                      {/* Action Text */}
                      <div className="text-center space-y-3">
                        <div className="font-black text-xl leading-tight group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontWeight: '900',
                          letterSpacing: '-0.01em',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          lineHeight: '1.2'
                        }}>
                          {action.label}
                        </div>
                        <div className="text-base opacity-90 font-semibold group-hover:opacity-100 transition-opacity duration-300" style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontWeight: '600',
                          letterSpacing: '0.01em'
                        }}>
                          Emergency Protocol
                        </div>
                      </div>
                      
                      {/* Emergency Activation Indicator */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                        <div className="text-sm font-bold tracking-wider" style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontWeight: '700',
                          letterSpacing: '0.15em',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>ACTIVATE</div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                    
                    {/* Emergency Border Glow */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
                  </button>
                );
              })}
            </div>
            
            {/* Emergency Contact Info */}
            <div className="mt-12 flex items-center justify-center space-x-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Emergency Support</div>
                  <div className="text-xs text-gray-500">24/7 Clinical Assistance</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Protocol Compliance</div>
                  <div className="text-xs text-gray-500">ACC/AHA Guidelines</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Response Time</div>
                  <div className="text-xs text-gray-500">&lt; 3 seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Banner */}
        <div className="premium-card bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-emerald-200/50 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-elevated">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-1">Production Excellence Achieved</h4>
                <p className="text-gray-600">100% calculator validation • Mobile-first design • AI-powered intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}; 