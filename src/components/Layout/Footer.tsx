import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, ExternalLink, HelpCircle, Mail, Stethoscope, Sparkles, Globe2 } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../stores/useAppStore';
import { useFooterVisibility } from '../../hooks/useFooterVisibility';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  className = ''
}) => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const currentYear = new Date().getFullYear();
  
  // Use the footer visibility hook
  const { isVisible } = useFooterVisibility({
    threshold: 1, // Show when within 1px of bottom (almost exactly at bottom)
    debounceMs: 16 // ~60fps for smooth response
  });

  return (
    <footer className={`
      ${isVisible ? 'block' : 'hidden'}
      relative overflow-hidden mt-auto
      bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50
      dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950
      border-t border-gradient-to-r from-blue-200/30 via-indigo-200/30 to-purple-200/30
      dark:from-blue-800/30 dark:via-indigo-800/30 dark:to-purple-800/30
      ${className}
    `}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-400/5 to-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/3 to-blue-600/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          
          {/* Left: Compact Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-75 blur-sm animate-pulse" />
              <div className="relative w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                MediMind Expert
              </h3>
              <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
            </div>
            <span className="hidden sm:flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
              <span>•</span>
              <span>&copy; {currentYear}</span>
              <Heart className="w-3 h-3 text-red-500" />
            </span>
          </div>

          {/* Center: Compact Links */}
          <div className="flex items-center space-x-1">
            {user && (
              <>
                <Link
                  to="/help"
                  className="group px-3 py-1.5 rounded-full backdrop-blur-md bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-700/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-1 text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Help</span>
                  </div>
                </Link>
                <a
                  href="mailto:support@medimindexpert.com"
                  className="group px-3 py-1.5 rounded-full backdrop-blur-md bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-700/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-1 text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Support</span>
                  </div>
                </a>
                <Link
                  to="/privacy"
                  className="group px-3 py-1.5 rounded-full backdrop-blur-md bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-700/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-1 text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Privacy</span>
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Right: Compact Status */}
          <div className="flex items-center space-x-2">
            {profile?.medical_specialty && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <Globe2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300 capitalize">
                  {profile.medical_specialty}
                </span>
              </div>
            )}
            <a
              href="https://medimindexpert.com/status"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20 hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
              </div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Online</span>
              <ExternalLink className="w-3 h-3 text-green-600 dark:text-green-400 group-hover:rotate-12 transition-transform duration-300" />
            </a>
            <div className="hidden md:flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Educational use only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Animation Overlay */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </footer>
  );
};