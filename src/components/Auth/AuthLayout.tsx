import React from 'react';
import { Stethoscope } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {

  return (
    <div className="min-h-screen min-h-[100svh] flex flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary safe-area-inset">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="w-full relative z-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 max-w-sm sm:max-w-md lg:max-w-lg">
        {/* Logo and Brand */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 touch-target-md">
              <Stethoscope className="text-white transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent text-2xl sm:text-3xl lg:text-4xl">
              MediMind Expert
            </h1>
            <p className="text-blue-100/80 font-medium text-sm sm:text-base lg:text-lg">
              Your AI Medical Co-Pilot
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 transition-all duration-300">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 tracking-tight text-xl sm:text-2xl lg:text-3xl">
              {title}
            </h2>
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 space-y-2 px-2">
          <p className="text-blue-100/60 text-xs sm:text-sm">
            Secure • HIPAA Compliant • AI-Powered
          </p>
          <p className="text-blue-100/40 text-xs sm:text-sm leading-relaxed">
            © 2024 MediMind Expert. Professional medical assistance.
          </p>
        </div>
      </div>
    </div>
  );
};
