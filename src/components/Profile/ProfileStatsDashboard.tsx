import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  Clock, 
  Target,
  Stethoscope,
  Brain,
  Heart,
  Calendar,
  BarChart3,
  Zap,
  Star,
  ChevronUp,
  ChevronDown,
  Minus,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { 
  useAnimatedCounter,
  useProgressRing,
  useCardEntranceAnimation,
  useMagneticHover,
  useStaggeredAnimation
} from '../../hooks/useAdvancedAnimations';

interface ProfileStatsData {
  profileCompletion: number;
  accountAge: number;
  lastActiveDate: string;
  calculationsUsed: number;
  aiConsultations: number;
  documentsProcessed: number;
  specialtyScore: number;
  weeklyActivity: number[];
  achievements: number;
  professionalLevel: 'Resident' | 'Attending' | 'Fellow' | 'Specialist' | 'Expert';
}

export const ProfileStatsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStatsData>({
    profileCompletion: 85,
    accountAge: 45,
    lastActiveDate: new Date().toISOString(),
    calculationsUsed: 124,
    aiConsultations: 67,
    documentsProcessed: 23,
    specialtyScore: 92,
    weeklyActivity: [12, 19, 8, 15, 22, 18, 14],
    achievements: 8,
    professionalLevel: 'Attending'
  });

  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use mock data with some randomization for demo
    const mockData: ProfileStatsData = {
      profileCompletion: Math.floor(Math.random() * 30) + 70,
      accountAge: Math.floor(Math.random() * 100) + 20,
      lastActiveDate: new Date().toISOString(),
      calculationsUsed: Math.floor(Math.random() * 200) + 50,
      aiConsultations: Math.floor(Math.random() * 100) + 30,
      documentsProcessed: Math.floor(Math.random() * 50) + 10,
      specialtyScore: Math.floor(Math.random() * 20) + 80,
      weeklyActivity: Array.from({ length: 7 }, () => Math.floor(Math.random() * 25) + 5),
      achievements: Math.floor(Math.random() * 15) + 5,
      professionalLevel: 'Attending'
    };
    setStats(mockData);
  }, []);

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getProfessionalLevelColor = (level: string) => {
    const colors = {
      'Resident': 'from-blue-500 to-cyan-500',
      'Fellow': 'from-green-500 to-emerald-500',
      'Attending': 'from-purple-500 to-violet-500',
      'Specialist': 'from-orange-500 to-red-500',
      'Expert': 'from-yellow-500 to-amber-500'
    };
    return colors[level as keyof typeof colors] || colors.Attending;
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    gradient: string;
    delay: number;
    statKey: string;
    isAnimating?: boolean;
  }> = ({ icon, title, value, subtitle, trend, trendValue, gradient, delay, statKey, isAnimating = false }) => {
    const { elementRef } = useCardEntranceAnimation(delay);
    const magneticRef = useMagneticHover();
    const { elementRef: counterRef, currentValue } = useAnimatedCounter(
      typeof value === 'number' ? value : parseInt(value.toString()) || 0,
      2000
    );

    return (
    <div
          ref={elementRef as React.RefObject<HTMLDivElement>}
          className={`group relative overflow-hidden rounded-3xl medical-glass animate-magnetic-hover hw-accelerate transform-style-preserve`}
      onMouseEnter={() => setHoveredStat(statKey)}
      onMouseLeave={() => setHoveredStat(null)}
    >
        {/* Enhanced Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-500 animate-professional-gradient`} />
        
        {/* Glass Morphism Layer */}
        <div className="relative h-full w-full rounded-3xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-6 hover:bg-white/15 dark:hover:bg-gray-900/25 transition-all duration-500">
          
          {/* Medical Particle Effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-white/20 rounded-full animate-medical-particle`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${8 + i * 2}s`
                }}
              />
            ))}
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out animate-loading-shimmer" />
        
        {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
              <div 
                ref={magneticRef as React.RefObject<HTMLDivElement>}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 filter-glow-blue"
              >
              {icon}
            </div>
            {trend && trendValue && (
                <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-300 ${
                  trend === 'up' ? 'bg-emerald-500/30 text-emerald-100 shadow-medical-glow-success' :
                  trend === 'down' ? 'bg-red-500/30 text-red-100' :
                  'bg-gray-500/30 text-gray-100'
                } group-hover:scale-110`}>
                  {trend === 'up' ? (
                    <ChevronUp className="w-3 h-3 animate-bounce" />
                  ) : trend === 'down' ? (
                    <ChevronDown className="w-3 h-3 animate-bounce" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  <span className="font-semibold">{trendValue}</span>
              </div>
            )}
          </div>
          
            <div className="space-y-3">
              <h3 className="text-white/90 text-sm font-medium leading-tight group-hover:text-white transition-colors duration-300">
                {title}
              </h3>
              <div ref={counterRef as React.RefObject<HTMLDivElement>}>
                <p className="text-white text-3xl font-bold tracking-tight group-hover:scale-110 transition-transform duration-300 animate-stats-counter">
                  {typeof value === 'number' ? currentValue.toLocaleString() : value}
                  {isAnimating && <Sparkles className="inline w-4 h-4 ml-1 text-yellow-300 animate-pulse" />}
                </p>
              </div>
            {subtitle && (
                <p className="text-white/70 text-xs leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                  {subtitle}
                </p>
            )}
          </div>
        </div>

          {/* Enhanced Hover Glow */}
          <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            hoveredStat === statKey ? 'animate-glass-morphism-pulse shadow-medical-glow-blue' : ''
        }`} />
          
          {/* Professional Verification Badge */}
          {statKey === 'completion' && (
            <div className="absolute top-3 right-3">
              <ShieldCheck className="w-4 h-4 text-green-400 animate-live-pulse" />
            </div>
          )}
      </div>
    </div>
  );
  };

  const ActivityGraph: React.FC = () => {
    const { elementRef } = useCardEntranceAnimation(600);
    const { containerRef, triggeredItems } = useStaggeredAnimation(stats.weeklyActivity, 100, 'animate-chart-bar');

    return (
      <div 
        ref={elementRef as React.RefObject<HTMLDivElement>}
        className="col-span-2 lg:col-span-4 relative overflow-hidden rounded-3xl medical-glass animate-magnetic-hover hw-accelerate"
      >
        {/* Enhanced Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-purple-800 to-indigo-900 opacity-90 animate-professional-gradient" />
        
        {/* Glass Morphism Layer */}
        <div className="relative h-full w-full rounded-3xl bg-white/5 dark:bg-gray-900/10 backdrop-blur-xl border border-white/10 dark:border-gray-700/20 p-6 hover:bg-white/10 transition-all duration-500">
          
          {/* Medical Activity Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-medical-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 1.5}s`,
                  animationDuration: `${10 + i * 2}s`
                }}
              />
            ))}
          </div>

          {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-semibold flex items-center space-x-3 group">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="group-hover:text-purple-200 transition-colors duration-300">Weekly Activity</span>
          </h3>
            <div className="flex items-center space-x-3">
          <div className="text-white/70 text-sm">Last 7 days</div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-live-pulse" />
            </div>
        </div>
        
          {/* Enhanced Chart */}
          <div 
            ref={containerRef as React.RefObject<HTMLDivElement>}
            className="flex items-end justify-between h-40 space-x-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm"
          >
          {stats.weeklyActivity.map((value, index) => (
              <div key={index} className="flex flex-col items-center space-y-3 flex-1 group">
                <div className="relative w-full">
                  {/* Bar */}
              <div 
                    className="relative w-full bg-gradient-to-t from-purple-600 via-violet-500 to-indigo-400 rounded-lg transition-all duration-700 hover:scale-110 group shadow-lg animate-chart-bar filter-glow-blue"
                style={{ 
                      height: `${(value / Math.max(...stats.weeklyActivity)) * 120}px`,
                      minHeight: '12px',
                      transformOrigin: 'bottom',
                      animationDelay: `${index * 100}ms`
                }}
              >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-loading-shimmer" />
                    
                    {/* Value Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-white/10">
                      <span className="font-semibold">{value}</span>
                      <div className="text-xs text-gray-300">sessions</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90" />
                    </div>

                    {/* Peak Activity Indicator */}
                    {value === Math.max(...stats.weeklyActivity) && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <Star className="w-4 h-4 text-yellow-400 animate-pulse" fill="currentColor" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Day Labels */}
                <span className="text-white/60 text-xs font-medium group-hover:text-white/80 transition-colors duration-300">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </span>
            </div>
          ))}
        </div>

          {/* Summary Stats */}
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-white/70">Avg: {Math.round(stats.weeklyActivity.reduce((a, b) => a + b, 0) / 7)} sessions</span>
      </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-medium">+15% vs last week</span>
              </div>
            </div>
            <div className="text-white/50">
              Total: {stats.weeklyActivity.reduce((a, b) => a + b, 0)} sessions
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfessionalLevel: React.FC = () => {
    const { elementRef } = useCardEntranceAnimation(700);
    const { elementRef: ringRef, strokeDasharray, strokeDashoffset } = useProgressRing(stats.specialtyScore, 35);
    
    return (
      <div 
        ref={elementRef as React.RefObject<HTMLDivElement>}
        className="col-span-2 lg:col-span-2 relative overflow-hidden rounded-3xl medical-glass animate-magnetic-hover hw-accelerate"
      >
        {/* Enhanced Professional Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getProfessionalLevelColor(stats.professionalLevel)} opacity-80 animate-professional-gradient`} />
        
        {/* Glass Morphism Layer */}
        <div className="relative h-full w-full rounded-3xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-6 hover:bg-white/15 transition-all duration-500">
          
          {/* Professional Achievement Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-medical-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${12 + i * 2}s`
                }}
              >
                <Award className="w-2 h-2 text-yellow-300/30" />
              </div>
            ))}
          </div>
          
          <div className="text-center space-y-6 relative z-10">
            {/* Professional Level Avatar with Progress Ring */}
            <div className="relative group">
              {/* Animated Progress Ring */}
              <div 
                ref={ringRef as React.RefObject<HTMLDivElement>}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 80 80">
                  {/* Background Ring */}
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="4"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Professional Avatar */}
              <div className={`relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getProfessionalLevelColor(stats.professionalLevel)} p-1 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
                  <Stethoscope className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-loading-shimmer rounded-full" />
                </div>
              </div>
              
              {/* Achievement Badge */}
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg animate-medical-badge-glow">
                <Star className="w-4 h-4 text-white fill-current" />
              </div>

              {/* Professional Score */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold mt-1">
                  {stats.specialtyScore}%
                </span>
              </div>
            </div>
            
            {/* Professional Information */}
            <div className="space-y-2">
              <h3 className="text-white text-xl font-bold group-hover:text-yellow-200 transition-colors duration-300">
                {stats.professionalLevel}
              </h3>
              <p className="text-white/70 text-sm font-medium">Medical Professional</p>
            </div>
            
            {/* Enhanced Score Display */}
            <div className="space-y-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                <div className="text-white text-sm font-semibold mb-1">Specialty Score</div>
                <div className="flex items-center justify-between">
                  <div className="text-white/80 text-xs">Professional Rating</div>
                  <div className="flex items-center space-x-2">
                    <div className="text-white text-lg font-bold">{stats.specialtyScore}%</div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-live-pulse" />
                  </div>
                </div>
              </div>

              {/* Professional Badges */}
              <div className="flex items-center justify-center space-x-2">
                <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-medium border border-white/10">
                  <ShieldCheck className="w-3 h-3 inline mr-1" />
                  Verified
                </div>
                <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-medium border border-white/10">
                  <Award className="w-3 h-3 inline mr-1" />
                  Expert
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={<Target className="w-5 h-5 text-white animate-live-pulse" />}
          title="Profile Complete"
          value={`${stats.profileCompletion}%`}
          subtitle="Almost there! Add more details"
          trend="up"
          trendValue="+5%"
          gradient="from-blue-600 to-cyan-600"
          delay={0}
          statKey="completion"
          isAnimating={true}
        />
        
        <StatCard
          icon={<Calendar className="w-5 h-5 text-white animate-pulse" />}
          title="Member Since"
          value={`${stats.accountAge} days`}
          subtitle={`Last active ${formatLastActive(stats.lastActiveDate)}`}
          gradient="from-green-600 to-emerald-600"
          delay={100}
          statKey="member"
          isAnimating={false}
        />
        
        <StatCard
          icon={<Zap className="w-5 h-5 text-white animate-bounce" />}
          title="Calculations Used"
          value={stats.calculationsUsed}
          subtitle="Medical calculators accessed"
          trend="up"
          trendValue="+12"
          gradient="from-purple-600 to-violet-600"
          delay={200}
          statKey="calculations"
          isAnimating={true}
        />
        
        <StatCard
          icon={<Brain className="w-5 h-5 text-white animate-pulse" />}
          title="AI Consultations"
          value={stats.aiConsultations}
          subtitle="Expert AI conversations"
          trend="up"
          trendValue="+8"
          gradient="from-orange-600 to-red-600"
          delay={300}
          statKey="ai"
          isAnimating={true}
        />
      </div>

      {/* Extended Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-white animate-float" />}
          title="Documents"
          value={stats.documentsProcessed}
          subtitle="Files processed"
          gradient="from-teal-600 to-cyan-600"
          delay={400}
          statKey="documents"
          isAnimating={false}
        />
        
        <StatCard
          icon={<Award className="w-5 h-5 text-white animate-medical-badge-glow" />}
          title="Achievements"
          value={stats.achievements}
          subtitle="Professional badges"
          gradient="from-yellow-600 to-amber-600"
          delay={500}
          statKey="achievements"
          isAnimating={true}
        />

        <ActivityGraph />
        <ProfessionalLevel />
      </div>
    </div>
  );
};