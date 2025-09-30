import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

interface DialogDescriptionProps {
  children: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = '', style }) => {
  return (
    <div 
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg shadow-xl",
        // Only apply default sizing if no custom className is provided
        !className && "p-6 w-full max-w-md mx-4",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return (
    <div className="space-y-2 mb-4">
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return (
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
      {children}
    </h2>
  );
};

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  return (
    <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
      {children}
    </p>
  );
};

// Close Button Component
interface DialogCloseProps {
  onClose: () => void;
  className?: string;
}

export const DialogClose: React.FC<DialogCloseProps> = ({ onClose, className = '' }) => {
  return (
    <button
      onClick={onClose}
      className={cn(
        "absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        "min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center",
        className
      )}
      aria-label="Close dialog"
    >
      <X className="h-5 w-5" />
    </button>
  );
};

// Dialog Footer Component
interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-3 sm:gap-0 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6",
      className
    )}>
      {children}
    </div>
  );
};