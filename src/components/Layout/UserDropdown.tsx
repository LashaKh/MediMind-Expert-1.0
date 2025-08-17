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

  // Get position-specific styles
  const getDropdownStyles = () => {
    const baseStyles = "absolute mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-50 transition-all duration-200";
    const mobileStyles = "w-full max-w-xs";
    const desktopStyles = "w-64";
    
    // Use mobile width on small screens, desktop width on larger screens
    const widthStyles = window.innerWidth < 640 ? mobileStyles : desktopStyles;
    
    switch (dropdownPosition) {
      case 'bottom-left':
        return `${baseStyles} ${widthStyles} left-0`;
      case 'top-right':
        return `${baseStyles} ${widthStyles} right-0 -mt-2 mb-2 bottom-full`;
      case 'top-left':
        return `${baseStyles} ${widthStyles} left-0 -mt-2 mb-2 bottom-full`;
      default: // bottom-right
        return `${baseStyles} ${widthStyles} right-0`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] touch-target-md"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
          {getUserInitials()}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {profile?.full_name || user?.email}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {profile?.medical_specialty || t('common.account')}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={getDropdownStyles()}>
          {/* User info section */}
          <div className="px-4 py-3 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {profile?.full_name || user?.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {profile?.medical_specialty ? `${profile.medical_specialty} • ${t('common.signedIn')}` : t('common.signedIn')}
                </div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] touch-target-md"
            >
              <User className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">{t('navigation.profile')}</span>
            </Link>

            <Link
              to="/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] touch-target-md"
            >
              <HelpCircle className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">{t('navigation.helpCenter')}</span>
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

            <div className="border-t border-border my-2"></div>

            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] touch-target-md"
            >
              <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">{t('auth.signOut')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 