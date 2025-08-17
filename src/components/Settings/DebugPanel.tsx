import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useChat } from '../../stores/useAppStore';

const DebugPanel: React.FC = () => {
  const { t } = useTranslation();
  const { clearCachedData } = useChat();
  const [isClearing, setIsClearing] = useState(false);
  const [clearResult, setClearResult] = useState<'success' | 'error' | null>(null);

  const handleClearCache = async () => {
    setIsClearing(true);
    setClearResult(null);
    
    try {
      const success = clearCachedData();
      setClearResult(success ? 'success' : 'error');
      
      if (success) {
        // Reload the page after successful cache clear
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {

      setClearResult('error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Debug Tools</h3>
        </div>
        
        {/* Translation Issues Section */}
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-2">
                  Translation Issues with PPH Risk Calculator
                </h4>
                <p className="text-sm text-amber-700 mb-3">
                  If you see Georgian text appearing when using Russian language, or English text 
                  when using other languages in the PPH Risk Calculator, this is likely due to 
                  cached old translations stored in your browser.
                </p>
                <p className="text-sm text-amber-700 mb-4">
                  Click the button below to clear all cached data and fix translation issues. 
                  The page will automatically reload after clearing the cache.
                </p>
              </div>
            </div>
          </div>

          {/* Clear Cache Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                ${isClearing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
                }
                transition-colors duration-200
              `}
            >
              <Trash2 className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
              {isClearing ? 'Clearing Cache...' : 'Clear All Cached Data'}
            </button>

            {/* Status Messages */}
            {clearResult === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Cache cleared! Reloading...</span>
              </div>
            )}
            
            {clearResult === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Error clearing cache. Try again.</span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">What gets cleared:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Conversation history with old translations</li>
              <li>• Cached calculator results</li>
              <li>• OB/GYN specific cached data</li>
              <li>• Any other MediMind cached information</li>
            </ul>
            <p className="text-sm text-blue-700 mt-3">
              <strong>Note:</strong> Your account settings and preferences will be preserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel; 