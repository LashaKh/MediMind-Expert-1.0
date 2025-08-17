import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { MobileButton } from '../ui/mobile-form';
import { Clock, AlertTriangle } from 'lucide-react';

interface SessionWarningModalProps {
  isOpen: boolean;
  minutesRemaining: number;
  onExtendSession: () => void;
  onSignOut: () => void;
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  isOpen,
  minutesRemaining,
  onExtendSession,
  onSignOut,
}) => {
  const [timeLeft, setTimeLeft] = useState(minutesRemaining * 60); // Convert to seconds
  
  useEffect(() => {
    setTimeLeft(minutesRemaining * 60);
  }, [minutesRemaining]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onSignOut(); // Auto sign out when timer reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onSignOut]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-4">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <DialogTitle className="text-lg text-center">Session Expiring Soon</DialogTitle>
          </div>
          <DialogDescription className="text-center text-base">
            Your session will expire automatically for security reasons.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          <div className="flex items-center justify-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl w-full">
            <Clock className="h-6 w-6 text-red-500" />
            <span className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center px-2">
            Would you like to extend your session?
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <MobileButton
            variant="outline"
            size="lg"
            onClick={onSignOut}
            className="w-full order-2 sm:order-1"
          >
            Sign Out
          </MobileButton>
          <MobileButton
            variant="primary"
            size="lg"
            onClick={onExtendSession}
            className="w-full order-1 sm:order-2"
          >
            Extend Session
          </MobileButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};