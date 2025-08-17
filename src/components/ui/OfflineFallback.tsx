import React from 'react';
import { safe, safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

// Offline detection hook
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

// Offline status indicator
export const OfflineIndicator: React.FC<{ className?: string }> = ({ className = "" }) => {
  const isOnline = useOnlineStatus();
  
  if (isOnline) return null;
  
  return (
    <div className={`fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm z-50 ${className}`}>
      <div className="flex items-center justify-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
        </svg>
        You are currently offline. Some features may not be available.
      </div>
    </div>
  );
};

// Main offline fallback page
export const OfflineFallbackPage: React.FC = () => {
  const isOnline = useOnlineStatus();
  
  React.useEffect(() => {
    if (isOnline) {
      // Optionally reload or redirect when connection is restored
    }
  }, [isOnline]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Don't worry - you can still browse previously loaded content.
        </p>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">What you can do:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Review previously loaded medical calculators</li>
              <li>• Browse cached patient cases</li>
              <li>• Access offline documentation</li>
              <li>• Use local calculation tools</li>
            </ul>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try to Reconnect
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Go Back
          </button>
        </div>
        
        {isOnline && (
          <div className="mt-6 p-3 bg-green-100 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 text-sm">Connection restored! The page will reload automatically.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Offline-aware wrapper component
export interface OfflineWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showIndicator?: boolean;
}

export const OfflineWrapper: React.FC<OfflineWrapperProps> = ({
  children,
  fallback,
  showIndicator = true
}) => {
  const isOnline = useOnlineStatus();
  
  return (
    <>
      {showIndicator && <OfflineIndicator />}
      {isOnline ? children : (fallback || <OfflineFallbackPage />)}
    </>
  );
};

// Offline queue for actions
export interface ActionData {
  calculationData?: Record<string, unknown>;
  patientCaseData?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface QueuedAction {
  id: string;
  type: string;
  data: ActionData;
  timestamp: number;
  retryCount: number;
}

class OfflineActionQueue {
  private queue: QueuedAction[] = [];
  private maxRetries = 3;
  private storageKey = 'medimind_offline_queue';
  
  constructor() {
    this.loadFromStorage();
    this.setupOnlineListener();
  }
  
  private loadFromStorage() {
    const [result, error] = safe(
      () => {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
        return [];
      },
      { 
        context: 'load offline queue from storage',
        severity: ErrorSeverity.LOW
      }
    );

    if (!error && result) {
      this.queue = result;
    }
  }
  
  private saveToStorage() {
    safe(
      () => localStorage.setItem(this.storageKey, JSON.stringify(this.queue)),
      { 
        context: 'save offline queue to storage',
        severity: ErrorSeverity.LOW
      }
    );
  }
  
  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }
  
  public enqueue(type: string, data: ActionData): string {
    const action: QueuedAction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    this.queue.push(action);
    this.saveToStorage();
    
    return action.id;
  }
  
  public async processQueue() {
    if (!navigator.onLine || this.queue.length === 0) {
      return;
    }

    const actionsToProcess = [...this.queue];
    this.queue = [];
    this.saveToStorage();
    
    for (const action of actionsToProcess) {
      const [_, error] = await safeAsync(
        () => this.processAction(action),
        { 
          context: `process queued action: ${action.type}`,
          severity: ErrorSeverity.MEDIUM
        }
      );

      if (error) {
        if (action.retryCount < this.maxRetries) {
          action.retryCount++;
          this.queue.push(action);
        }
        // Max retries exceeded - action will be dropped
      }
    }
    
    this.saveToStorage();
  }
  
  private async processAction(action: QueuedAction): Promise<void> {
    // This would be implemented based on the specific action types
    // For now, just log the action
    
    // Example implementation for different action types:
    switch (action.type) {
      case 'save_calculation':
        // Implement actual API call to save calculation
        break;
      case 'sync_patient_case':
        // Implement actual API call to sync patient case
        break;
      default:

    }
  }
  
  public getQueueSize(): number {
    return this.queue.length;
  }
  
  public clearQueue() {
    this.queue = [];
    this.saveToStorage();
  }
}

// Singleton instance
export const offlineQueue = new OfflineActionQueue();

// Hook for using offline queue
export const useOfflineQueue = () => {
  const [queueSize, setQueueSize] = React.useState(offlineQueue.getQueueSize());
  
  const enqueueAction = React.useCallback((type: string, data: ActionData) => {
    const id = offlineQueue.enqueue(type, data);
    setQueueSize(offlineQueue.getQueueSize());
    return id;
  }, []);
  
  const processQueue = React.useCallback(async () => {
    await offlineQueue.processQueue();
    setQueueSize(offlineQueue.getQueueSize());
  }, []);
  
  React.useEffect(() => {
    const handleOnline = () => {
      processQueue();
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [processQueue]);
  
  return {
    enqueueAction,
    processQueue,
    queueSize,
    clearQueue: () => {
      offlineQueue.clearQueue();
      setQueueSize(0);
    }
  };
};

export default OfflineFallbackPage; 