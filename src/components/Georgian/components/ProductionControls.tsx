import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  ChevronDown,
  Check,
  Brain
} from 'lucide-react';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  isProcessingChunks: boolean;
  processedChunks: number;
  totalChunks: number;
}

interface ProductionControlsProps {
  // Engine selection
  selectedSTTModel?: 'Fast' | 'GoogleChirp';
  onModelChange?: (model: 'Fast' | 'GoogleChirp') => void;
  recordingState: RecordingState;
}

// Engine configuration with unified blue theme
const ENGINE_CONFIGS = {
  Fast: {
    name: 'Fast',
    description: 'Lightning-fast Enagram STT1',
    icon: Zap,
    features: ['Ultra-fast transcription', 'Real-time processing', 'Low latency']
  },
  GoogleChirp: {
    name: 'Google Chirp',
    description: 'Advanced Google Speech v2',
    icon: Brain,
    features: ['Highest accuracy', 'Advanced processing', 'Medical terminology']
  }
} as const;

export const ProductionControls: React.FC<ProductionControlsProps> = ({
  selectedSTTModel = 'Fast',
  onModelChange,
  recordingState
}) => {
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);
  const engineRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (engineRef.current && !engineRef.current.contains(event.target as Node)) {
        setEngineDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentEngine = ENGINE_CONFIGS[selectedSTTModel];
  const CurrentEngineIcon = currentEngine.icon;

  return (
    <div className="w-auto" style={{width: 'fit-content'}}>

      {/* Compact Engine Selection */}
      {onModelChange && (
        <div ref={engineRef} style={{width: 'auto'}}>

          {/* Compact Button - Narrow Width */}
          <button
            onClick={() => !recordingState.isRecording && setEngineDropdownOpen(!engineDropdownOpen)}
            disabled={recordingState.isRecording}
            title={recordingState.isRecording ? "Cannot change transcription quality during recording" : `Select transcription quality: ${currentEngine.name} - ${currentEngine.description}`}
            className={`
              transcription-btn-primary flex items-center space-x-1.5 px-3 py-2.5 rounded-lg min-h-[44px]
              ${recordingState.isRecording ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
            `}
            style={{ width: 'auto' }}
          >
            {/* Icon */}
            <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center shadow-sm">
              <CurrentEngineIcon className="w-3.5 h-3.5 text-white" />
            </div>

            {/* Text - Compact */}
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {currentEngine.name}
            </span>

            {/* Dropdown Icon */}
            <ChevronDown className={`w-3.5 h-3.5 text-white/90 ${engineDropdownOpen ? 'rotate-180' : 'rotate-0'} transition-all duration-200`} />
          </button>

          {/* Desktop Dropdown - Hidden on Mobile */}
          {engineDropdownOpen && !recordingState.isRecording && (
            <div className="hidden md:block absolute top-full mt-2 left-0 right-0 z-50 animate-in slide-in-from-top-2 duration-200">

              {/* Backdrop */}
              <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-[#63b3ed]/30" />

              {/* Content */}
              <div className="relative p-2">
                {(Object.keys(ENGINE_CONFIGS) as Array<keyof typeof ENGINE_CONFIGS>).map((engineKey) => {
                  const engine = ENGINE_CONFIGS[engineKey];
                  const EngineIcon = engine.icon;
                  const isSelected = selectedSTTModel === engineKey;

                  return (
                    <button
                      key={engineKey}
                      onClick={() => {
                        onModelChange(engineKey);
                        setEngineDropdownOpen(false);
                      }}
                      className={`
                        w-full p-4 rounded-2xl text-left transition-all duration-200 ease-out group/item
                        ${isSelected
                          ? 'bg-white border-2 border-[#63b3ed] shadow-lg'
                          : 'hover:bg-white/90 border-2 border-transparent hover:border-[#63b3ed]/50 bg-white/80'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-4">

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-[#1a365d] flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all duration-200">
                          <EngineIcon className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-[#1a365d]">
                              {engine.name}
                            </h4>

                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#1a365d] flex items-center justify-center shadow-md">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-[#1a365d]/70">
                            {engine.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile Model Selection - Bottom Sheet */}
          {engineDropdownOpen && !recordingState.isRecording && (
            <>
              {/* Mobile Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setEngineDropdownOpen(false)}
              />

              {/* Mobile Centered Modal */}
              <div className="fixed inset-0 flex items-center justify-center p-4 z-50 md:hidden">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-h-[56vh] overflow-y-auto w-4/5 max-w-xs">

                  {/* Handle */}
                  <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3" />

                  {/* Header */}
                  <div className="text-center mb-3">
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Select STT Engine</span>
                    </h3>
                  </div>

                  {/* Mobile Options - Compact */}
                  <div className="space-y-2 mb-3">
                    {(Object.keys(ENGINE_CONFIGS) as Array<keyof typeof ENGINE_CONFIGS>).map((engineKey) => {
                      const engine = ENGINE_CONFIGS[engineKey];
                      const EngineIcon = engine.icon;
                      const isSelected = selectedSTTModel === engineKey;

                      return (
                        <button
                          key={engineKey}
                          onClick={() => {
                            onModelChange(engineKey);
                            setEngineDropdownOpen(false);
                          }}
                          className={`
                            w-full p-3 rounded-xl transition-all duration-200 flex items-center space-x-3 min-h-[60px]
                            ${isSelected
                              ? 'bg-gradient-to-r from-[#63b3ed]/10 to-[#90cdf4]/10 dark:from-[#1a365d]/20 dark:to-[#2b6cb0]/20 border-2 border-[#2b6cb0]'
                              : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#63b3ed]'
                            }
                          `}
                        >
                          {/* Icon */}
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center shadow-sm
                            ${isSelected
                              ? 'bg-gradient-to-br from-[#1a365d] to-[#2b6cb0]'
                              : 'bg-gray-200 dark:bg-gray-700'
                            }
                          `}>
                            <EngineIcon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                          </div>

                          {/* Text */}
                          <div className="flex-1 text-left">
                            <div className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                              {engine.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {engine.description}
                            </div>
                          </div>

                          {/* Checkmark */}
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#2b6cb0] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setEngineDropdownOpen(false)}
                    className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
};
