import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Moon, 
  Sun,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

export const UserDropdown: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = async () => {
    const [_, error] = await safeAsync(
      () => signOut(),
      { 
        context: 'user sign out',
        severity: ErrorSeverity.MEDIUM,
        showToast: true
      }
    );

    if (!error) {
      navigate('/signin');
    }
  };

  // Calculate smart positioning to prevent viewport overflow
  const calculatePosition = () => {
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = 256; // w-64 = 16rem = 256px
    const dropdownHeight = 280; // estimated height
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Check horizontal positioning
    const hasRightSpace = buttonRect.right + dropdownWidth <= viewport.width;
    const hasLeftSpace = buttonRect.left - dropdownWidth >= 0;
    
    // Check vertical positioning
    const hasBottomSpace = buttonRect.bottom + dropdownHeight <= viewport.height;
    const hasTopSpace = buttonRect.top - dropdownHeight >= 0;
    
    // Determine position based on available space
    let position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right';
    
    if (hasBottomSpace) {
      position = hasRightSpace ? 'bottom-right' : 'bottom-left';
    } else if (hasTopSpace) {
      position = hasRightSpace ? 'top-right' : 'top-left';  
    } else {
      // Fallback to position with most space
      position = hasRightSpace ? 'bottom-right' : 'bottom-left';
    }
    
    setDropdownPosition(position);
  };

  // Close dropdown when clicking outside and handle positioning
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Calculate position when opening
  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (!user) return null;

  // Get position-specific styles with premium design - always right-aligned
  const getDropdownStyles = () => {
    const baseStyles = "absolute mt-3 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-600/20 py-2 z-50 transition-all duration-500 ease-out";
    const compactWidth = "w-56"; // Smaller, more compact width
    
    // Always position from the right edge to prevent overflow
    return `${baseStyles} ${compactWidth} right-0`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative group flex items-center gap-2 px-4 py-0 h-11 rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-500 ease-out border border-white/20 backdrop-blur-xl overflow-hidden touch-target-md"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(6, 182, 212, 0.8) 25%, rgba(59, 130, 246, 0.7) 50%, rgba(37, 99, 235, 0.8) 75%, rgba(6, 182, 212, 0.7) 100%)',
          backgroundSize: '300% 300%',
          boxShadow: '0 8px 25px -8px rgba(59, 130, 246, 0.25), 0 4px 15px -4px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          animation: 'gradient-shift 6s ease-in-out infinite'
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Account Menu"
      >
        {/* Animated background layers */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
             style={{
               background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 25%, #2563eb 50%, #06b6d4 75%, #3b82f6 100%)',
               backgroundSize: '400% 400%',
               animation: 'gradient-shift 6s ease-in-out infinite'
             }} />
        
        {/* Inner glow */}
        <div className="absolute inset-0.5 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-600"
             style={{
               background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
               backgroundSize: '200% 200%',
               animation: 'shimmer 2s ease-in-out infinite'
             }} />
        
        <div className="relative z-10 flex items-center gap-2">
          {/* Menu icon with premium design */}
          <div className="relative p-2 rounded-xl bg-white/25 backdrop-blur-sm group-hover:bg-white/35 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110"
               style={{
                 boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
               }}>
            <svg 
              className="w-5 h-5 drop-shadow-lg transition-all duration-500 group-hover:drop-shadow-xl" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
            {/* Multi-layer icon glow */}
            <div className="absolute inset-0 rounded-xl bg-white/50 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-700" />
            <div className="absolute inset-0 rounded-xl bg-blue-300/30 opacity-0 group-hover:opacity-100 blur-md transition-all duration-700 delay-100" />
          </div>
          
          {/* Menu text */}
          <span className="relative font-extrabold text-white drop-shadow-lg tracking-wide group-hover:translate-x-1 transition-all duration-500 ease-out text-sm"
                style={{
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.2)'
                }}>
            Menu
            {/* Enhanced text depth */}
            <span className="absolute inset-0 text-black/30 blur-sm -z-10">Menu</span>
            <span className="absolute inset-0 text-white/20 blur-lg -z-20">Menu</span>
          </span>
          
          {/* Animated trailing elements */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-white/70 opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500 delay-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50 opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500 delay-400" />
            <div className="w-1 h-1 rounded-full bg-white/30 opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500 delay-600" />
          </div>
        </div>
        
        {/* Sophisticated pulse rings with staggered animation */}
        <div className="absolute inset-0 rounded-2xl border-2 border-white/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-800 ease-out" />
        <div className="absolute inset-0 rounded-2xl border-2 border-white/30 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-1200 ease-out delay-200" />
        <div className="absolute inset-0 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 group-hover:scale-140 transition-all duration-1600 ease-out delay-400" />
        
        {/* Magical floating particles effect */}
        <div className="absolute top-1 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-300"
             style={{ animation: 'floating-particles 4s ease-in-out infinite 0.5s' }} />
        <div className="absolute top-2 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500"
             style={{ animation: 'floating-particles 4s ease-in-out infinite 1s' }} />
        <div className="absolute bottom-2 left-1/2 w-0.5 h-0.5 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-700"
             style={{ animation: 'floating-particles 4s ease-in-out infinite 1.5s' }} />
        
        {/* Floating particles */}
        <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-300"
             style={{ animation: 'floating-particles 4s ease-in-out infinite 0.5s' }} />
        <div className="absolute bottom-2 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500"
             style={{ animation: 'floating-particles 4s ease-in-out infinite 1s' }} />
      </button>

      {isOpen && (
        <div className={getDropdownStyles()}
             style={{
               background: 'rgba(255, 255, 255, 0.95)',
               backdropFilter: 'blur(20px)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
             }}>

          {/* Enhanced Menu items */}
          <div className="py-3">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="relative group flex items-center px-6 py-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-md min-h-[48px] touch-target-md overflow-hidden"
            >
              {/* Icon container with gradient */}
              <div className="relative p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-all duration-300 mr-4 group-hover:scale-110">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              </div>
              <span className="font-medium truncate group-hover:translate-x-1 transition-transform duration-300">{t('navigation.profile')}</span>
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              to="/help"
              onClick={() => setIsOpen(false)}
              className="relative group flex items-center px-6 py-4 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 dark:hover:from-green-900/20 dark:hover:to-teal-900/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-md min-h-[48px] touch-target-md overflow-hidden"
            >
              {/* Icon container with gradient */}
              <div className="relative p-2 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-all duration-300 mr-4 group-hover:scale-110">
                <HelpCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              </div>
              <span className="font-medium truncate group-hover:translate-x-1 transition-transform duration-300">{t('navigation.helpCenter')}</span>
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Theme toggle - hidden since we force light mode only */}
            {/* 
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 mr-3" />
              ) : (
                <Moon className="w-4 h-4 mr-3" />
              )}
              {theme === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}
            </button>
            */}

            <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-3"></div>

            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="relative group w-full flex items-center px-6 py-4 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-md min-h-[48px] touch-target-md overflow-hidden"
            >
              {/* Enhanced logout icon with warning styling */}
              <div className="relative p-2 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/40 transition-all duration-300 mr-4 group-hover:scale-110">
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              </div>
              <span className="font-bold truncate group-hover:translate-x-1 transition-transform duration-300">{t('auth.signOut')}</span>
              {/* Warning hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 