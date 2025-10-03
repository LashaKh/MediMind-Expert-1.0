import React, { useEffect } from 'react';
import { AlertTriangle, ArrowUp, FileText, X } from 'lucide-react';

interface TitleRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusTitle: () => void;
}

export const TitleRequiredModal: React.FC<TitleRequiredModalProps> = ({
  isOpen,
  onClose,
  onFocusTitle
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoToTitle = () => {
    onClose();
    onFocusTitle();
  };

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 z-[9998] bg-[#1a365d]/40 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
        style={{
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Medical gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 group"
            aria-label="Close"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* Content */}
          <div className="p-8 pt-10">
            {/* Icon with pulse animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full bg-[#63b3ed]/20 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-[#63b3ed]/30 animate-pulse" />

                {/* Icon container */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] flex items-center justify-center shadow-lg shadow-[#2b6cb0]/30">
                  <FileText className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-[#1a365d] text-center mb-3">
              Session Title Required
            </h3>

            {/* Message */}
            <p className="text-[#2b6cb0] text-center leading-relaxed mb-8">
              Please enter a session title before starting the recording. This helps you organize and find your medical transcriptions later.
            </p>

            {/* Alert info box */}
            <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-900 leading-relaxed">
                    <span className="font-bold">Quick tip:</span> Use descriptive titles like "Patient Consultation - Smith, J." or "Daily Rounds - Cardiology Ward"
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Primary action - Go to title input */}
              <button
                onClick={handleGoToTitle}
                className="w-full sm:flex-1 group relative px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] hover:from-[#2b6cb0] hover:to-[#1a365d] text-white font-bold transition-all duration-300 shadow-lg shadow-[#2b6cb0]/30 hover:shadow-xl hover:shadow-[#2b6cb0]/40 transform hover:scale-105 active:scale-95"
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Go to Title Field</span>
                </div>
              </button>

              {/* Secondary action - Just close */}
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-gray-200 hover:border-[#63b3ed] bg-white hover:bg-[#63b3ed]/5 text-gray-700 hover:text-[#2b6cb0] font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#90cdf4]/10 to-transparent rounded-tl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#63b3ed]/10 to-transparent rounded-br-2xl pointer-events-none" />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};
