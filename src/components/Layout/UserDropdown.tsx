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

  // Get position-specific styles with premium design
  const getDropdownStyles = () => {
    const baseStyles = "absolute mt-3 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-600/20 py-2 z-50 transition-all duration-500 ease-out";
    const mobileStyles = "w-full max-w-sm";
    const desktopStyles = "w-72";
    
    // Use mobile width on small screens, desktop width on larger screens
    const widthStyles = window.innerWidth < 640 ? mobileStyles : desktopStyles;
    
    switch (dropdownPosition) {
      case 'bottom-left':
        return `${baseStyles} ${widthStyles} left-0`;
      case 'top-right':
        return `${baseStyles} ${widthStyles} right-0 -mt-3 mb-3 bottom-full`;
      case 'top-left':
        return `${baseStyles} ${widthStyles} left-0 -mt-3 mb-3 bottom-full`;
      default: // bottom-right
        return `${baseStyles} ${widthStyles} right-0`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative group flex items-center space-x-3 px-4 py-3 rounded-2xl text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 ease-out border border-white/30 backdrop-blur-xl overflow-hidden min-h-[48px] touch-target-md"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 25%, #3b82f6 50%, #2563eb 75%, #06b6d4 100%)',
          backgroundSize: '300% 300%',
          boxShadow: '0 12px 32px -8px rgba(59, 130, 246, 0.4), 0 4px 20px -4px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          animation: 'gradient-shift 8s ease-in-out infinite'
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
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
        
        <div className="relative z-10 flex items-center space-x-3">
          {/* Enhanced avatar with premium design */}
          <div className="relative w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-sm text-white flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300"
               style={{
                 boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)'
               }}>
            <span className="drop-shadow-lg">{getUserInitials()}</span>
            {/* Avatar glow */}
            <div className="absolute inset-0 rounded-2xl bg-white/30 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
          </div>
          
          {/* Enhanced user info */}
          <div className="hidden md:block text-left group-hover:translate-x-1 transition-transform duration-300">
            <div className="text-sm font-bold text-white drop-shadow-sm"
                 style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
              {profile?.full_name || user?.email}
            </div>
            <div className="text-xs text-white/80 drop-shadow-sm font-medium">
              {profile?.medical_specialty || t('common.account')}
            </div>
          </div>
          
          {/* Enhanced chevron */}
          <div className="relative p-1 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
            <ChevronDown className={`w-4 h-4 text-white drop-shadow-sm transition-all duration-300 ${
              isOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'
            }`} />
          </div>
        </div>
        
        {/* Pulse ring on hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-white/40 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" />
        
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
          {/* Enhanced User info section */}
          <div className="relative px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-xl"
                   style={{
                     boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3), 0 6px 20px rgba(79, 70, 229, 0.3)'
                   }}>
                <span className="drop-shadow-lg">{getUserInitials()}</span>
                {/* Avatar decorative ring */}
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-20 blur-sm animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-gray-900 dark:text-gray-100 truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {profile?.full_name || user?.email}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {profile?.medical_specialty ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>{profile.medical_specialty} • {t('common.signedIn')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>{t('common.signedIn')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-t-2xl" />
          </div>

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