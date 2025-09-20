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
        className="flex items-center gap-2 px-3 py-2 h-10 rounded-lg text-white bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] hover:from-[#1a365d]/90 hover:via-[#2b6cb0]/90 hover:to-[#63b3ed]/90 shadow-sm hover:shadow-md transition-all duration-200 focus-enhanced"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Account Menu"
      >
        {/* Menu icon */}
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
        
        {/* Menu text */}
        <span className="text-sm font-medium">
          Menu
        </span>
      </button>

      {isOpen && (
        <div className={getDropdownStyles()}
             style={{
               background: 'white',
               boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
             }}>

          {/* Menu items */}
          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#63b3ed]/10 transition-all duration-200 min-h-[44px] touch-target-md"
            >
              <div className="p-2 rounded-lg bg-[#63b3ed]/20 mr-3">
                <User className="w-4 h-4 text-[#2b6cb0]" />
              </div>
              <span className="font-medium">{t('navigation.profile')}</span>
            </Link>

            <Link
              to="/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#63b3ed]/10 transition-all duration-200 min-h-[44px] touch-target-md"
            >
              <div className="p-2 rounded-lg bg-[#63b3ed]/20 mr-3">
                <HelpCircle className="w-4 h-4 text-[#2b6cb0]" />
              </div>
              <span className="font-medium">{t('navigation.helpCenter')}</span>
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

            <div className="border-t border-gray-200 my-2"></div>

            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 min-h-[44px] touch-target-md"
            >
              <div className="p-2 rounded-lg bg-red-100 mr-3">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium">{t('auth.signOut')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 