import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Brain, 
  Stethoscope, 
  Activity, 
  Target, 
  Zap, 
  ArrowUpRight,
  ChevronRight,
  Loader2,
  Star,
  Shield,
  MessageSquare,
  Lightbulb,
  Users,
  TrendingUp,
  CheckCircle,
  Atom,
  Microscope,
  Heart
} from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ABGResult } from '../../../types/abg';

interface PremiumAIClinicalConsultationButtonProps {
  /** ABG result to provide as context */
  result: ABGResult;
  /** Mode determines the button's appearance and functionality */
  mode?: 'interpretation' | 'action-plan' | 'complete';
  /** Callback when consultation starts */
  onConsultationStart?: () => void;
  /** Selected action plan items for focused consultation */
  actionPlanItems?: string[];
  /** Custom className */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'default' | 'large';
}

export const PremiumAIClinicalConsultationButton: React.FC<PremiumAIClinicalConsultationButtonProps> = ({
  result,
  mode = 'complete',
  onConsultationStart,
  actionPlanItems = [],
  className,
  disabled = false,
  size = 'default'
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const buttonRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  // Enhanced animation sequence on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic glow effect
  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setGlowIntensity(prev => Math.min(prev + 0.1, 1));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setGlowIntensity(0);
    }
  }, [isHovered]);

  // Advanced ripple effect
  const createRipple = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleIdRef.current++;
    
    setRipples(prev => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  // Get sophisticated content configuration based on mode
  const getContent = () => {
    switch (mode) {
      case 'interpretation':
        return {
          title: '🧠 AI Clinical Consultation',
          subtitle: 'Expert interpretation powered by advanced medical AI',
          description: 'Connect with our AI clinical expert to discuss your ABG interpretation. Get evidence-based insights, differential diagnoses, and clinical reasoning from our curated medical knowledge base.',
          contextInfo: 'Your ABG values and interpretation will be shared with our AI specialist for comprehensive discussion.',
          icon: Brain,
          accentIcon: Lightbulb,
          gradient: 'from-indigo-600 via-purple-600 to-pink-600',
          glowGradient: 'from-indigo-400 via-purple-400 to-pink-400',
          accentColor: 'from-purple-400 to-pink-400',
          features: ['Expert interpretation review', 'Evidence-based insights', 'Clinical reasoning', 'Differential diagnosis']
        };
      case 'action-plan':
        return {
          title: '🎯 AI Clinical Consultation',
          subtitle: actionPlanItems.length > 0 
            ? `Strategic consultation for ${actionPlanItems.length} selected intervention${actionPlanItems.length > 1 ? 's' : ''}` 
            : 'Comprehensive action plan consultation',
          description: 'Discuss your treatment strategy with our AI clinical expert. Get personalized recommendations, implementation guidance, and evidence-based treatment protocols.',
          contextInfo: actionPlanItems.length > 0 
            ? `Selected interventions: ${actionPlanItems.join(', ')} will be discussed in detail.`
            : 'Your complete action plan will be reviewed with clinical recommendations.',
          icon: Target,
          accentIcon: TrendingUp,
          gradient: 'from-blue-600 via-indigo-600 to-purple-600',
          glowGradient: 'from-blue-400 via-indigo-400 to-purple-400',
          accentColor: 'from-blue-400 to-indigo-400',
          features: ['Strategic guidance', 'Implementation protocols', 'Expert recommendations', 'Risk assessment']
        };
      case 'complete':
      default:
        return {
          title: '💡 AI Clinical Consultation',
          subtitle: 'Comprehensive consultation with expert medical insights',
          description: 'Launch an in-depth consultation with our AI clinical expert about your complete ABG analysis. Discuss interpretation, treatment plans, and get personalized medical insights.',
          contextInfo: 'Your complete ABG analysis including values, interpretation, and action plan will be available for comprehensive discussion.',
          icon: Stethoscope,
          accentIcon: Atom,
          gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
          glowGradient: 'from-emerald-400 via-teal-400 to-cyan-400',
          accentColor: 'from-emerald-400 to-teal-400',
          features: ['Complete case review', 'Clinical expertise', 'Personalized insights', 'Treatment optimization']
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;
  const AccentIconComponent = content.accentIcon;

  const handleConsultation = (e: React.MouseEvent) => {
    if (disabled) return;
    
    createRipple(e);
    onConsultationStart?.();
    
    // Determine context type
    let contextType = 'abg-analysis';
    if (mode === 'interpretation') {
      contextType = 'interpretation-only';
    } else if (mode === 'action-plan') {
      contextType = actionPlanItems.length > 0 ? 'selective-action-plan' : 'complete-action-plan';
    }

    // Create enhanced result with selected action plan items if applicable
    let consultationResult = result;
    if (mode === 'action-plan' && actionPlanItems.length > 0 && result.action_plan) {
      consultationResult = {
        ...result,
        action_plan: result.action_plan + 
          `\n\n=== SELECTED FOR AI CONSULTATION ===\n` +
          `Selected Action Plans: ${actionPlanItems.join(', ')}\n` +
          `(Note: Full action plan available, consultation focused on selected items)`
      };
    }
    
    // Navigate to AI Copilot with context
    navigate('/ai-copilot', { 
      state: { 
        abgContext: consultationResult,
        contextType: contextType,
        startNewSession: true
      } 
    });
  };

  if (size === 'large') {
    return (
      <div className={cn(
        "relative group transition-all duration-700 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className
      )}>
        {/* Advanced glow effect */}
        <div 
          className={cn(
            "absolute -inset-1 bg-gradient-to-r rounded-3xl blur-sm transition-opacity duration-500",
            content.glowGradient,
            glowIntensity > 0 ? "opacity-30" : "opacity-0"
          )}
          style={{ opacity: glowIntensity * 0.3 }}
        />

        {/* Main sophisticated button container */}
        <div 
          ref={buttonRef}
          className={cn(
            "relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer select-none",
            "bg-gradient-to-br backdrop-blur-xl border transition-all duration-500 ease-out",
            content.gradient,
            "border-white/20 hover:border-white/30",
            "transform-gpu hover:scale-[1.01] active:scale-[0.99]",
            isPressed && "scale-[0.98]",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={handleConsultation}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
        >
          {/* Sophisticated overlay patterns */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10" />
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent",
            "transition-opacity duration-500",
            isHovered ? "opacity-100" : "opacity-0"
          )} />

          {/* Ripple effects */}
          {ripples.map(ripple => (
            <div
              key={ripple.id}
              className="absolute rounded-full bg-white/20 animate-ping pointer-events-none"
              style={{
                left: ripple.x - 20,
                top: ripple.y - 20,
                width: 40,
                height: 40,
                animationDuration: '600ms'
              }}
            />
          ))}

          <div className="relative p-8 sm:p-10">
            {/* Prominent header section */}
            <div className="mb-8">
              <div className="flex items-start gap-6 mb-6">
                {/* Enhanced primary icon */}
                <div className="relative group/icon flex-shrink-0">
                  <div className={cn(
                    "w-20 h-20 bg-gradient-to-br rounded-3xl flex items-center justify-center",
                    "shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-500",
                    "bg-white/10",
                    isHovered && "scale-110 rotate-6 shadow-2xl"
                  )}>
                    <IconComponent className={cn(
                      "h-10 w-10 text-white transition-all duration-500",
                      isHovered && "scale-125"
                    )} />
                  </div>
                  
                  {/* Enhanced floating accent icon */}
                  <div className={cn(
                    "absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br rounded-full",
                    "flex items-center justify-center shadow-lg transition-all duration-500",
                    content.accentColor,
                    isHovered && "scale-125 -translate-y-1 rotate-12"
                  )}>
                    <AccentIconComponent className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                {/* Enhanced content area */}
                <div className="text-white flex-1 min-w-0">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight leading-tight">
                    {content.title}
                  </h3>
                  <p className="text-white/95 text-base sm:text-lg leading-relaxed mb-3 font-medium">
                    {content.subtitle}
                  </p>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-4">
                    {content.description}
                  </p>
                  
                  {/* Context information panel */}
                  <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Heart className="h-2.5 w-2.5 text-white" />
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-medium mb-1">What to expect:</p>
                        <p className="text-white/75 text-xs leading-relaxed">
                          {content.contextInfo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced floating action indicator */}
                <div className={cn(
                  "flex flex-col items-center gap-2 text-white/80 transition-all duration-500",
                  isHovered && "text-white transform translate-x-1 -translate-y-1"
                )}>
                  <ArrowUpRight className="h-8 w-8" />
                  <span className="text-xs font-medium">Launch</span>
                </div>
              </div>
            </div>

            {/* Enhanced feature highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {content.features.map((feature, index) => (
                <div 
                  key={feature}
                  className={cn(
                    "flex items-center gap-2 text-white/80 text-sm transition-all duration-500",
                    "bg-white/5 rounded-lg p-3 border border-white/10",
                    isHovered && "text-white/95 bg-white/10 border-white/20 transform scale-105"
                  )}
                  style={{ 
                    transitionDelay: `${index * 100}ms` 
                  }}
                >
                  <CheckCircle className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Enhanced action section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Enhanced trust indicators */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Shield className="h-4 w-4 text-emerald-300" />
                  <span className="font-medium">Medical Grade AI</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Users className="h-4 w-4 text-blue-300" />
                  <span className="font-medium">Expert Curated</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Microscope className="h-4 w-4 text-purple-300" />
                  <span className="font-medium">Evidence Based</span>
                </div>
              </div>
              
              {/* Enhanced primary action button */}
              <div className={cn(
                "bg-white/15 hover:bg-white/25 border border-white/30 rounded-2xl px-8 py-4",
                "flex items-center gap-4 text-white font-bold text-base",
                "transition-all duration-500 backdrop-blur-sm shadow-xl",
                "hover:border-white/40 hover:shadow-2xl",
                isHovered && "bg-white/25 border-white/40 transform scale-110 shadow-2xl"
              )}>
                <MessageSquare className="h-5 w-5" />
                <span>Start Clinical Consultation</span>
                <ChevronRight className={cn(
                  "h-5 w-5 transition-transform duration-500",
                  isHovered && "translate-x-2"
                )} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sophisticated default size button
  return (
    <div className={cn(
      "relative group transition-all duration-700 ease-out",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      className
    )}>
      {/* Advanced glow effect for default button */}
      <div 
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r rounded-2xl blur-sm transition-opacity duration-500",
          content.glowGradient,
          glowIntensity > 0 ? "opacity-20" : "opacity-0"
        )}
        style={{ opacity: glowIntensity * 0.2 }}
      />

      <div
        ref={buttonRef}
        className={cn(
          "relative overflow-hidden rounded-2xl shadow-xl cursor-pointer select-none",
          "bg-gradient-to-br backdrop-blur-xl border transition-all duration-500 ease-out",
          content.gradient,
          "border-white/20 hover:border-white/30",
          "h-18 sm:h-20 px-6 flex items-center gap-3",
          "transform-gpu hover:scale-105 active:scale-95",
          isPressed && "scale-95",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={handleConsultation}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
      >
        {/* Sophisticated overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Ripple effects for default button */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="absolute rounded-full bg-white/20 animate-ping pointer-events-none"
            style={{
              left: ripple.x - 15,
              top: ripple.y - 15,
              width: 30,
              height: 30,
              animationDuration: '600ms'
            }}
          />
        ))}
        
        {/* Enhanced content with sophisticated layout */}
        <div className="relative flex items-center gap-4 text-white w-full">
          {/* Enhanced icon with advanced styling */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              "w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center",
              "transition-all duration-500 backdrop-blur-sm border border-white/20",
              isHovered && "scale-125 rotate-12 bg-white/25 border-white/30 shadow-lg"
            )}>
              <IconComponent className={cn(
                "h-5 w-5 transition-all duration-500",
                isHovered && "scale-110"
              )} />
            </div>
            
            {/* Enhanced floating accent */}
            <div className={cn(
              "absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-br rounded-full",
              "flex items-center justify-center transition-all duration-500 shadow-md",
              content.accentColor,
              isHovered && "scale-125 -translate-y-0.5 rotate-12"
            )}>
              <AccentIconComponent className="h-2 w-2 text-white" />
            </div>
          </div>
          
          {/* Enhanced text content */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base sm:text-lg mb-1">{content.title}</div>
            <div className="text-white/80 text-xs sm:text-sm font-medium truncate">
              {content.subtitle.length > 60 ? content.subtitle.substring(0, 60) + '...' : content.subtitle}
            </div>
          </div>
          
          {/* Enhanced action indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={cn(
              "bg-white/15 rounded-xl px-3 py-2 transition-all duration-500 border border-white/20",
              "flex items-center gap-2 backdrop-blur-sm",
              isHovered && "bg-white/25 border-white/30 scale-105 shadow-lg"
            )}>
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Launch</span>
            </div>
            <ArrowUpRight className={cn(
              "h-5 w-5 transition-all duration-500 opacity-70",
              isHovered && "opacity-100 translate-x-1 -translate-y-1 scale-110"
            )} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Export default for easy importing
export default PremiumAIClinicalConsultationButton;