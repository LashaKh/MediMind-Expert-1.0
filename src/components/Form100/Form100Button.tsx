// Premium Form 100 Generation Button Component
// World-class medical interface with stunning animations and interactions
// Mobile-optimized with 44px touch targets and premium visual effects

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Sparkles, Loader2, AlertCircle, Zap, Heart, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Form100ButtonProps } from '../../types/form100';

// Premium button variants using theme colors
const form100ButtonVariants = {
  primary: `
    relative overflow-hidden
    bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#1a365d]
    hover:from-[#2b6cb0] hover:via-[#1a365d] hover:to-[#2b6cb0]
    text-white font-bold
    shadow-2xl shadow-[#2b6cb0]/25
    hover:shadow-3xl hover:shadow-[#1a365d]/40
    transition-all duration-500 ease-out
    transform hover:scale-105 hover:-translate-y-1
    active:scale-98 active:translate-y-0
    before:absolute before:inset-0 before:bg-gradient-to-r 
    before:from-[#63b3ed]/20 before:via-transparent before:to-[#63b3ed]/20
    before:opacity-0 hover:before:opacity-100
    before:transition-opacity before:duration-300
    after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_50%,rgba(99,179,237,0.1),transparent_70%)]
    after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500
  `,
  secondary: `
    relative overflow-hidden
    bg-white/90 backdrop-blur-xl
    hover:bg-gradient-to-r hover:from-[#90cdf4]/10 hover:to-[#63b3ed]/10
    text-[#1a365d] hover:text-[#2b6cb0] font-semibold
    border-2 border-[#63b3ed]/30 hover:border-[#2b6cb0]/50
    shadow-lg shadow-[#63b3ed]/10
    hover:shadow-xl hover:shadow-[#2b6cb0]/20
    transition-all duration-400 ease-out
    transform hover:scale-102 hover:-translate-y-0.5
    active:scale-99
    before:absolute before:inset-0 before:bg-gradient-to-r 
    before:from-transparent before:via-[#63b3ed]/5 before:to-transparent
    before:opacity-0 hover:before:opacity-100
    before:transition-opacity before:duration-300
  `,
  disabled: `
    relative overflow-hidden
    bg-gradient-to-r from-gray-300/50 to-gray-400/50
    text-gray-500 cursor-not-allowed
    shadow-none border-none
    opacity-60
  `
};

const Form100Button: React.FC<Form100ButtonProps> = ({
  sessionId,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className,
  onClick
}) => {
  // State for premium interactions
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);

  // Determine button state and styling
  const isDisabled = disabled || !sessionId;
  const buttonVariant = isDisabled ? 'disabled' : variant;
  
  // Premium size configurations with enhanced touch targets
  const sizeStyles = {
    sm: "h-11 px-5 text-sm min-w-[130px] rounded-xl",
    md: "h-12 px-6 text-base min-w-[160px] rounded-xl", // Premium medical touch target
    lg: "h-14 px-8 text-lg min-w-[200px] rounded-2xl"
  };

  // Premium particle effect on click
  const createParticles = (event: React.MouseEvent) => {
    if (isDisabled) return;
    
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }));
    
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  };

  // Handle premium button click with animations
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling to parent card

    if (isDisabled) return;

    if (!sessionId) {
      return;
    }

    createParticles(event);
    setIsPressed(true);

    // Success animation
    setTimeout(() => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 100);

    setTimeout(() => setIsPressed(false), 150);
    onClick?.();
  };

  // Render premium icon with animations
  const renderPremiumIcon = () => {
    if (showSuccess) {
      return <Heart className="w-4 h-4 mr-2 text-white animate-pulse" />;
    }
    
    if (isDisabled && !sessionId) {
      return <AlertCircle className="w-4 h-4 mr-2 opacity-60" />;
    }
    
    return (
      <div className="relative">
        <FileText className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
        {sessionId && !isDisabled && (
          <Crown className="absolute -top-1 -right-1 w-2 h-2 text-[#90cdf4] animate-pulse" />
        )}
      </div>
    );
  };

  // Premium button text with context
  const getButtonText = () => {
    if (showSuccess) {
      return "Ready!";
    }
    if (!sessionId) {
      return "Record Voice";
    }
    return "Form 100";
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isDisabled}
      className={cn(
        // Base premium styles
        "group relative inline-flex items-center justify-center font-bold",
        "transition-all duration-500 ease-out will-change-transform",
        // Size styles
        sizeStyles[size],
        // Variant styles
        form100ButtonVariants[buttonVariant],
        // Premium medical styling
        "overflow-hidden isolate",
        // Mobile optimizations
        "touch-manipulation select-none",
        // Premium focus states
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#63b3ed]/50 focus-visible:ring-offset-2",
        // Animation performance
        "transform-gpu backface-hidden",
        className
      )}
      style={{
        willChange: isHovered ? 'transform, box-shadow' : 'auto'
      }}
      aria-label={sessionId ? "Generate Form 100 medical report" : "Record voice first to enable Form 100 generation"}
      role="button"
    >
      {/* Premium animated background layers */}
      {!isDisabled && (
        <>
          {/* Primary shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#90cdf4]/20 to-transparent 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
          
          {/* Secondary glow effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,179,237,0.15),transparent_50%)]
                          scale-0 group-hover:scale-150 transition-transform duration-700 ease-out" />
          
          {/* Success state overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e]/20 via-[#22c55e]/30 to-[#22c55e]/20
                            animate-pulse" />
          )}
        </>
      )}
      
      {/* Premium particle effects */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-[#90cdf4] rounded-full pointer-events-none
                     animate-ping opacity-75"
          style={{
            left: particle.x,
            top: particle.y,
            animationDuration: '1s',
            animationFillMode: 'forwards'
          }}
        />
      ))}
      
      {/* Premium button content */}
      <div className="relative flex items-center z-10">
        {renderPremiumIcon()}
        
        {/* Premium text with micro-animations */}
        <span className={cn(
          "font-bold tracking-wide transition-all duration-300",
          showSuccess && "animate-pulse",
          isPressed && "scale-95"
        )}>
          {getButtonText()}
        </span>
        
        {/* Premium sparkle indicators */}
        {sessionId && !isDisabled && !showSuccess && (
          <div className="ml-2 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-all duration-300 
                                 group-hover:rotate-12 group-hover:scale-110" />
            <Zap className="w-2 h-2 opacity-50 group-hover:opacity-80 transition-all duration-500 
                           animate-pulse group-hover:animate-bounce" />
          </div>
        )}
        
        {/* Success celebration */}
        {showSuccess && (
          <div className="ml-2 flex items-center space-x-1">
            <Heart className="w-3 h-3 text-[#22c55e] animate-bounce" />
            <Sparkles className="w-3 h-3 text-[#90cdf4] animate-spin" />
          </div>
        )}
      </div>
      
      {/* Premium press feedback */}
      <div className={cn(
        "absolute inset-0 bg-white/10 rounded-xl transition-opacity duration-100",
        isPressed ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Enhanced accessibility indicator */}
      <div className="absolute -inset-1 rounded-xl border-2 border-[#63b3ed]/0 
                      group-focus-visible:border-[#63b3ed]/50 transition-colors duration-200" />
    </button>
  );
};

// Premium Form100Button with loading state
export const Form100ButtonWithLoading: React.FC<Form100ButtonProps & {
  isLoading?: boolean;
  loadingText?: string;
}> = ({
  isLoading = false,
  loadingText = "Creating Form 100...",
  disabled,
  ...props
}) => {
  const [loadingParticles, setLoadingParticles] = useState<number[]>([]);

  useEffect(() => {
    if (isLoading) {
      const particles = Array.from({ length: 3 }, (_, i) => i);
      setLoadingParticles(particles);
    } else {
      setLoadingParticles([]);
    }
  }, [isLoading]);

  return (
    <Form100Button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        props.className,
        isLoading && "cursor-wait relative overflow-hidden"
      )}
    >
      {isLoading && (
        <>
          {/* Premium loading shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#90cdf4]/30 to-transparent 
                          animate-pulse" />
          
          {/* Loading content */}
          <div className="relative flex items-center z-10">
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
            <span className="font-medium tracking-wide">{loadingText}</span>
            
            {/* Premium loading particles */}
            <div className="ml-2 flex space-x-1">
              {loadingParticles.map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-[#90cdf4] rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </Form100Button>
  );
};

// Premium Compact Form100Button for mobile/card layouts
export const Form100ButtonCompact: React.FC<Form100ButtonProps> = (props) => {
  return (
    <Form100Button
      {...props}
      size="sm"
      variant="secondary"
      className={cn(
        // Compact premium styling
        "min-w-[120px] h-10 text-sm font-semibold",
        "shadow-md hover:shadow-lg",
        "bg-white/95 backdrop-blur-md",
        "border border-[#63b3ed]/40 hover:border-[#2b6cb0]/60",
        "text-[#1a365d] hover:text-[#2b6cb0]",
        "transition-all duration-300 ease-out",
        "transform hover:scale-105 active:scale-98",
        props.className
      )}
    />
  );
};

export default Form100Button;