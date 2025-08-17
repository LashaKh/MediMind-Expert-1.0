import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useSpring, useTransform, useMotionValue } from 'framer-motion';

// Sophisticated Loading Animation
export const PremiumLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-1 rounded-full bg-white dark:bg-gray-900"
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1, 0.8] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-60"
        animate={{
          scale: [0.6, 0.8, 0.6],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

// Floating Action Button with Advanced Animations
export const FloatingActionButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left';
  variant?: 'primary' | 'secondary';
  tooltip?: string;
}> = ({ icon, onClick, position = 'bottom-right', variant = 'primary', tooltip }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <motion.button
        className={`
          ${variantClasses[variant]}
          w-14 h-14 rounded-full shadow-2xl text-white
          flex items-center justify-center
          backdrop-blur-sm border border-white/20
        `}
        whileHover={{
          scale: 1.1,
          rotate: 5,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        whileTap={{
          scale: 0.95,
          rotate: -5
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          if (tooltip) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
        onClick={onClick}
        animate={{
          y: isHovered ? -2 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.div
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 10 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {icon}
        </motion.div>
      </motion.button>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className={`
            absolute mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
            shadow-lg whitespace-nowrap
            ${position === 'bottom-right' ? 'bottom-full right-0' : 'bottom-full left-0'}
          `}
        >
          {tooltip}
          <div className={`
            absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4
            border-transparent border-t-gray-900
            ${position === 'bottom-right' ? 'right-4' : 'left-4'}
          `} />
        </motion.div>
      )}
    </div>
  );
};

// Advanced Progress Ring
export const ProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  animated?: boolean;
}> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showValue = true,
  animated = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: animated ? strokeDashoffset : circumference - (progress / 100) * circumference
          }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: "easeOut"
          }}
        />
      </svg>
      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: animated ? 0.5 : 0, type: "spring", stiffness: 200 }}
        >
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(progress)}%
          </span>
        </motion.div>
      )}
    </div>
  );
};

// Staggered Grid Animation
export const StaggeredGrid: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className = "" }) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: index * staggerDelay,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

// Magnetic Button Effect
export const MagneticButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  intensity?: number;
}> = ({ children, className = "", onClick, intensity = 20 }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    x.set(deltaX * 0.1);
    y.set(deltaY * 0.1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.button>
  );
};

// Parallax Scroll Effect
export const ParallaxContainer: React.FC<{
  children: React.ReactNode;
  speed?: number;
  className?: string;
}> = ({ children, speed = 0.5, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const y = useTransform(
    useMotionValue(0),
    [0, 1],
    ["0%", `${speed * 100}%`]
  );

  useEffect(() => {
    const updateY = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const rate = scrolled * -speed;
      y.set(rate);
    };

    window.addEventListener('scroll', updateY);
    return () => window.removeEventListener('scroll', updateY);
  }, [speed, y]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
};

// Morphing Icon Animation
export const MorphingIcon: React.FC<{
  icon1: React.ReactNode;
  icon2: React.ReactNode;
  isToggled: boolean;
  className?: string;
}> = ({ icon1, icon2, isToggled, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={false}
        animate={{
          scale: isToggled ? 0 : 1,
          rotate: isToggled ? 180 : 0,
          opacity: isToggled ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        {icon1}
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: isToggled ? 1 : 0,
          rotate: isToggled ? 0 : -180,
          opacity: isToggled ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        {icon2}
      </motion.div>
    </div>
  );
};

// Liquid Loading Animation
export const LiquidLoader: React.FC<{
  progress: number;
  color?: string;
  height?: number;
}> = ({ progress, color = "#3B82F6", height = 4 }) => {
  return (
    <div 
      className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
      style={{ height }}
    >
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}CC, ${color}FF, ${color}CC)`,
          backgroundSize: "200% 100%",
        }}
        initial={{ width: "0%" }}
        animate={{ 
          width: `${progress}%`,
          backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"]
        }}
        transition={{
          width: { duration: 0.8, ease: "easeOut" },
          backgroundPosition: { 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear" 
          }
        }}
      />
      <motion.div
        className="absolute right-0 top-0 h-full w-8 rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${color}80, transparent)`,
          filter: "blur(1px)"
        }}
        animate={{
          x: progress > 90 ? [0, 4, 0] : 0,
          scale: progress > 90 ? [1, 1.1, 1] : 1
        }}
        transition={{
          duration: 0.5,
          repeat: progress > 90 ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

// Premium Card Hover Effects
export const PremiumCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}> = ({ children, className = "", glowColor = "blue", onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const glowColors = {
    blue: "shadow-blue-500/25",
    purple: "shadow-purple-500/25",
    green: "shadow-green-500/25",
    red: "shadow-red-500/25",
    pink: "shadow-pink-500/25"
  };

  return (
    <motion.div
      className={`
        relative cursor-pointer transition-all duration-300
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow Effect */}
      <motion.div
        className={`
          absolute -inset-1 bg-gradient-to-r from-${glowColor}-500 to-${glowColor}-600 
          rounded-xl blur opacity-0 transition-opacity duration-300
          ${glowColors[glowColor as keyof typeof glowColors]}
        `}
        animate={{
          opacity: isHovered ? 0.3 : 0,
        }}
      />
      
      {/* Card Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {children}
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={{
            x: isHovered ? "100%" : "-100%"
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
};

// Floating Particles Background
export const FloatingParticles: React.FC<{
  count?: number;
  speed?: number;
  color?: string;
}> = ({ count = 50, speed = 20, color = "#3B82F6" }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * speed + 10
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-20"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default {
  PremiumLoader,
  FloatingActionButton,
  ProgressRing,
  StaggeredGrid,
  MagneticButton,
  ParallaxContainer,
  MorphingIcon,
  LiquidLoader,
  PremiumCard,
  FloatingParticles
};