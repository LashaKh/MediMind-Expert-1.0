import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        relative group p-3 rounded-2xl
        bg-gradient-to-br from-card via-muted/50 to-card
        border border-border/50 hover:border-border
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        focus-enhanced active:scale-95 hover:scale-105
        backdrop-blur-xl overflow-hidden
        touch-target
      "
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Animated background layers */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           style={{
             background: `linear-gradient(135deg, 
               oklch(from var(--primary) l c h / 0.1), 
               oklch(from var(--accent) l c h / 0.15)
             )`
           }} />
      
      {/* Icon container with smooth transitions */}
      <div className="relative z-10 w-5 h-5 transition-all duration-300">
        {/* Sun icon for light mode */}
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 text-primary
            transform transition-all duration-500 ease-out
            ${isDark 
              ? 'opacity-0 rotate-90 scale-50' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `} 
        />
        
        {/* Moon icon for dark mode */}
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 text-accent
            transform transition-all duration-500 ease-out
            ${isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-50'
            }
          `}
        />
      </div>
      
      {/* Subtle glow effect */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 
        transition-all duration-500 blur-sm scale-110
        ${isDark 
          ? 'bg-gradient-to-br from-accent/80 to-secondary/80'
          : 'bg-gradient-to-br from-primary/80 to-accent/80'
        }
      `} />
      
      {/* Pulse rings on hover */}
      <div className="absolute inset-0 rounded-2xl border-2 border-primary/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-800 ease-out" />
      <div className="absolute inset-0 rounded-2xl border border-accent/30 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-1200 ease-out delay-200" />
    </button>
  );
};