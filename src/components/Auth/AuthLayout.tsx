import React, { useEffect, useState } from 'react';
import { Stethoscope, Shield, Award, Heart, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen min-h-[100svh] relative bg-gradient-to-br from-[#63b3ed]/10 via-[#90cdf4]/8 to-[#2b6cb0]/12 dark:from-[#1a365d]/20 dark:via-[#2b6cb0]/15 dark:to-[#63b3ed]/10 safe-area-inset overflow-hidden">
      {/* Enhanced Gradient Background Layers */}
      <div className="absolute inset-0">
        {/* Multi-layered Gradient Orbs */}
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-gradient-to-br from-[#63b3ed]/15 via-[#90cdf4]/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-tl from-[#2b6cb0]/12 via-[#1a365d]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"
             style={{ animationDelay: '2s', animationDuration: '10s' }} />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#90cdf4]/8 via-[#63b3ed]/6 to-transparent rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse"
             style={{ animationDelay: '4s', animationDuration: '12s' }} />
        
        {/* Floating Medical Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute text-[#2b6cb0]/8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 16}px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${Math.random() * 10 + 15}s`,
              }}
            >
              {i % 4 === 0 && <Heart className="w-4 h-4 animate-pulse" />}
              {i % 4 === 1 && <Shield className="w-4 h-4 animate-pulse" />}
              {i % 4 === 2 && <Award className="w-4 h-4 animate-pulse" />}
              {i % 4 === 3 && <CheckCircle2 className="w-4 h-4 animate-pulse" />}
            </div>
          ))}
        </div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232b6cb0' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '40px 40px'
             }} />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-lg transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Premium Auth Card */}
          <div className="group">
            {/* Enhanced Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#63b3ed]/20 via-[#90cdf4]/15 to-[#2b6cb0]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60 group-hover:opacity-100" />
            
            {/* Main card with enhanced backdrop */}
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-white/30 dark:border-gray-700/30 rounded-3xl shadow-2xl shadow-[#2b6cb0]/10 dark:shadow-black/30 transition-all duration-500 group-hover:shadow-3xl group-hover:shadow-[#63b3ed]/20 group-hover:scale-[1.02]">
              
              {/* Enhanced Card border gradient */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#63b3ed]/15 via-[#90cdf4]/10 to-[#2b6cb0]/15 opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              <div className="relative p-8 sm:p-10">
                {/* Title Section Only */}
                <div className="text-center mb-8">
                  {/* Enhanced Title */}
                  <div className="space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {title}
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] rounded-full mx-auto opacity-80" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                      MediMind Expert
                    </p>
                  </div>
                </div>

                {/* Content with mobile-optimized spacing */}
                <div className="space-y-6 sm:space-y-8">
                  {children}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center mt-6 space-y-3">
            {/* Security badges */}
            <div className="flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-1 text-[#2b6cb0]">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Secure</span>
              </div>
              <div className="flex items-center space-x-1 text-[#2b6cb0]">
                <CheckCircle2 className="w-3 h-3" />
                <span className="font-medium">HIPAA</span>
              </div>
            </div>
            
            {/* Copyright */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 MediMind Expert
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
