import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Settings, 
  Target, 
  Brain, 
  Users, 
  ChevronDown,
  Check,
  Sparkles,
  Cpu,
  Gauge,
  Activity,
  Shield
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
  selectedSTTModel?: 'STT1' | 'STT2' | 'STT3';
  onModelChange?: (model: 'STT1' | 'STT2' | 'STT3') => void;
  recordingState: RecordingState;
  
  // Speaker diarization
  enableSpeakerDiarization?: boolean;
  onToggleSpeakerDiarization?: (enabled: boolean) => void;
  speakerCount?: number;
  onSpeakerCountChange?: (count: number) => void;
}

// Engine configuration with unified blue theme
const ENGINE_CONFIGS = {
  STT1: {
    name: 'Fast',
    description: 'Lightning-fast processing',
    icon: Zap,
    features: ['Ultra-fast transcription', 'Real-time processing', 'Low latency']
  },
  STT2: {
    name: 'Balanced',
    description: 'Perfect accuracy-speed balance',
    icon: Settings,
    features: ['Balanced performance', 'Good accuracy', 'Optimal for most cases']
  },
  STT3: {
    name: 'Accurate',
    description: 'Maximum precision transcription',
    icon: Target,
    features: ['Highest accuracy', 'Advanced processing', 'Medical terminology']
  }
} as const;

export const ProductionControls: React.FC<ProductionControlsProps> = ({
  selectedSTTModel = 'STT3',
  onModelChange,
  recordingState,
  enableSpeakerDiarization = false,
  onToggleSpeakerDiarization,
  speakerCount = 2,
  onSpeakerCountChange
}) => {
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);
  const [speakerDropdownOpen, setSpeakerDropdownOpen] = useState(false);
  const engineRef = useRef<HTMLDivElement>(null);
  const speakerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (engineRef.current && !engineRef.current.contains(event.target as Node)) {
        setEngineDropdownOpen(false);
      }
      if (speakerRef.current && !speakerRef.current.contains(event.target as Node)) {
        setSpeakerDropdownOpen(false);
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
    <div className="w-full lg:gap-3" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem'}}>
      
      {/* Compact Engine Selection - LEFT SIDE */}
      {onModelChange && (
        <div ref={engineRef} style={{width: 'calc(50% - 0.375rem)'}}>
          
          {/* Compact Button */}
          <button
            onClick={() => !recordingState.isRecording && setEngineDropdownOpen(!engineDropdownOpen)}
            disabled={recordingState.isRecording}
            title={recordingState.isRecording ? "Cannot change transcription quality during recording" : `Select transcription quality: ${currentEngine.name} - ${currentEngine.description}`}
            className={`
              transcription-btn-primary w-full h-12 md:min-h-[44px] md:h-[44px] mediscribe-mobile-control-button mediscribe-touch-target mediscribe-haptic-feedback flex items-center justify-between px-3 py-2 md:px-2 md:py-2
              ${recordingState.isRecording ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
            `}
          >
            {/* Left: Icon and Text */}
            <div className="flex items-center space-x-2">
              {/* Icon */}
              <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-white/20 flex items-center justify-center shadow-sm mediscribe-mobile-control-icon">
                <CurrentEngineIcon className="w-4 h-4 text-white" />
              </div>
              
              {/* Text */}
              <div className="text-left">
                <h3 className="text-sm md:text-xs font-bold text-white mediscribe-mobile-control-text">
                  {currentEngine.name}
                </h3>
                <p className="text-xs md:text-[10px] font-medium text-white/90 mediscribe-mobile-control-subtext">
                  Transcription Quality
                </p>
              </div>
            </div>
            
            {/* Right: Indicator */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full bg-white/70 ${recordingState.isRecording ? 'animate-pulse' : ''}`} />
              <ChevronDown className={`w-4 h-4 text-white/90 ${engineDropdownOpen ? 'rotate-180' : 'rotate-0'} transition-all duration-200`} />
            </div>
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
                  <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
                  
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Select Transcription Quality</span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Choose the quality mode for medical transcription
                    </p>
                  </div>
                  
                  {/* Mobile Options - Large Touch Targets */}
                  <div className="space-y-3 mb-6">
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
                            w-full p-4 rounded-2xl transition-all duration-200 flex items-center space-x-4
                            ${isSelected
                              ? 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-500'
                              : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-violet-300'
                            }
                          `}
                        >
                          {/* Icon */}
                          <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center shadow-sm
                            ${isSelected 
                              ? 'bg-gradient-to-br from-[#1a365d] to-[#2b6cb0]' 
                              : 'bg-gray-200 dark:bg-gray-700'
                            }
                          `}>
                            <EngineIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                          </div>
                          
                          {/* Text */}
                          <div className="flex-1 text-left">
                            <div className="font-bold text-gray-800 dark:text-gray-200">
                              {engine.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {engine.description}
                            </div>
                          </div>
                          
                          {/* Checkmark */}
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setEngineDropdownOpen(false)}
                    className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Speaker Detection - RIGHT SIDE */}
      {onToggleSpeakerDiarization && (
        <div ref={speakerRef} style={{width: 'calc(50% - 0.375rem)'}}>
            
            {/* Responsive Speaker Toggle Button */}
            <div
              onClick={(e) => {
                if (!recordingState.isRecording) {
                  // On mobile, open dropdown for speaker count selection
                  // On desktop, toggle speaker diarization
                  if (window.innerWidth < 768 && onSpeakerCountChange) {
                    e.preventDefault();
                    e.stopPropagation();
                    setSpeakerDropdownOpen(!speakerDropdownOpen);
                  } else {
                    onToggleSpeakerDiarization(!enableSpeakerDiarization);
                  }
                }
              }}
              role="button"
              tabIndex={recordingState.isRecording ? -1 : 0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!recordingState.isRecording) {
                    if (window.innerWidth < 768 && onSpeakerCountChange) {
                      setSpeakerDropdownOpen(!speakerDropdownOpen);
                    } else {
                      onToggleSpeakerDiarization(!enableSpeakerDiarization);
                    }
                  }
                }
              }}
              aria-disabled={recordingState.isRecording}
              title={recordingState.isRecording ? "Cannot change speaker settings during recording" : enableSpeakerDiarization ? `Speaker separation is ON (detecting ${speakerCount} voices) - Click to turn OFF` : "Speaker separation is OFF - Click to turn ON and separate different voices (doctor/patient)"}
              className={`
                ${enableSpeakerDiarization ? 'transcription-btn-primary' : 'transcription-btn-secondary'} w-full group mediscribe-mobile-control-button mediscribe-touch-target mediscribe-haptic-feedback
                ${recordingState.isRecording ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                min-h-[44px] h-12 flex items-center justify-between px-3 py-2
              `}
            >
              {/* Left: Icon and Text */}
              <div className="flex items-center space-x-2 md:space-x-2">
                {/* Icon */}
                <div className={`w-8 h-8 md:w-6 md:h-6 rounded-lg flex items-center justify-center shadow-sm mediscribe-mobile-control-icon ${
                  enableSpeakerDiarization 
                    ? 'bg-white/20' 
                    : 'bg-[#1a365d]/10'
                }`}>
                  <Brain className={`w-4 h-4 ${
                    enableSpeakerDiarization 
                      ? 'text-white' 
                      : 'text-[#1a365d]'
                  }`} />
                </div>
                
                {/* Text - Responsive visibility */}
                <div className="text-left">
                  {/* Mobile: Compact single line */}
                  <div className="sm:hidden">
                    <h3 className={`text-xs font-bold mediscribe-mobile-control-text ${
                      enableSpeakerDiarization 
                        ? 'text-white' 
                        : 'text-[#1a365d]'
                    }`}>
                      {enableSpeakerDiarization ? `${speakerCount}x` : 'Spk'}
                    </h3>
                  </div>
                  
                  {/* Desktop: Full text */}
                  <div className="hidden sm:block">
                    <h3 className={`text-sm md:text-xs font-bold mediscribe-mobile-control-text ${
                      enableSpeakerDiarization 
                        ? 'text-white' 
                        : 'text-[#1a365d]'
                    }`}>
                      Speakers
                    </h3>
                    <p className={`text-xs md:text-[10px] font-medium mediscribe-mobile-control-subtext ${
                      enableSpeakerDiarization 
                        ? 'text-white' 
                        : 'text-[#2b6cb0]'
                    }`}>
                      {enableSpeakerDiarization ? `${speakerCount} voices` : 'Voice separation'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right: Controls */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Desktop Speaker Count - Hidden on Mobile */}
                {enableSpeakerDiarization && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Desktop speaker count clicked, current state:', speakerDropdownOpen);
                      if (!recordingState.isRecording) {
                        setSpeakerDropdownOpen(!speakerDropdownOpen);
                        console.log('Setting desktop speaker dropdown to:', !speakerDropdownOpen);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!recordingState.isRecording) {
                          setSpeakerDropdownOpen(!speakerDropdownOpen);
                        }
                      }
                    }}
                    className="hidden md:flex px-2 py-1 rounded-lg bg-white/20 border border-white/30 text-white text-xs font-semibold items-center space-x-1 hover:bg-white/30 transition-all duration-200 cursor-pointer"
                  >
                    <Users className="w-3 h-3" />
                    <span>{speakerCount}</span>
                    <ChevronDown className={`w-3 h-3 transition-all duration-200 ${speakerDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </div>
                )}
                
                {/* Compact Toggle Switch */}
                <div className={`
                  w-10 h-5 rounded-full border p-0.5 transition-all duration-200 
                  ${enableSpeakerDiarization 
                    ? 'bg-white/20 border-white/30' 
                    : 'bg-gray-200 border-gray-300'
                  }
                `}>
                  <div className={`
                    w-4 h-4 rounded-full shadow-sm transition-all duration-200
                    ${enableSpeakerDiarization 
                      ? 'bg-white translate-x-4' 
                      : 'bg-white dark:bg-gray-300 translate-x-0'
                    }
                  `} />
                </div>
              </div>
              
              {/* Mobile Speaker Count Button - Always available for configuration */}
              {onSpeakerCountChange && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!recordingState.isRecording) {
                      setSpeakerDropdownOpen(!speakerDropdownOpen);
                    }
                  }}
                  className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all duration-200 cursor-pointer text-xs font-semibold"
                >
                  <Users className="w-3 h-3" />
                  <span>{speakerCount}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${speakerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            
            {/* Desktop Speaker Count Dropdown */}
            {speakerDropdownOpen && (
              <div className="hidden md:block absolute top-full mt-2 left-0 right-0 z-[9999] animate-in slide-in-from-top-2 duration-200">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-[#63b3ed]/30" />
                
                {/* Content */}
                <div className="relative p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          if (onSpeakerCountChange) {
                            onSpeakerCountChange(count);
                          }
                          setSpeakerDropdownOpen(false);
                        }}
                        className={`
                          p-3 rounded-xl text-center transition-all duration-200 border-2
                          ${speakerCount === count 
                            ? 'bg-[#1a365d] text-white border-[#1a365d]' 
                            : 'bg-white text-[#1a365d] border-[#63b3ed] hover:bg-[#63b3ed]/10'
                          }
                        `}
                      >
                        <div className="font-bold text-lg">{count}</div>
                        <div className="text-xs opacity-80">
                          {count === 2 ? 'Doctor + Patient' : 'Voices'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Speaker Count Dropdown - Bottom Sheet Style */}
            {speakerDropdownOpen && (
              <>
          {/* Mobile Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSpeakerDropdownOpen(false);
            }}
          />
          
          {/* Mobile Centered Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 md:hidden">
            <div 
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-h-[56vh] overflow-y-auto w-4/5 max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Handle */}
              <div className="w-12 h-1 bg-[#63b3ed] dark:bg-[#2b6cb0] rounded-full mx-auto mb-6" />
              
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-[#1a365d] dark:text-[#63b3ed] flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5 text-[#2b6cb0] dark:text-[#63b3ed]" />
                  <span>Select Voice Count</span>
                </h3>
                <p className="text-sm text-[#2b6cb0] dark:text-[#90cdf4] mt-2">
                  Choose how many speakers to detect in the conversation
                </p>
              </div>
              
              {/* Mobile Options - Large Touch Targets */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onSpeakerCountChange) {
                        onSpeakerCountChange(count);
                      } else {
                      }
                      // Small delay before closing to ensure state update
                      setTimeout(() => {
                        setSpeakerDropdownOpen(false);
                      }, 100);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    type="button"
                    className={`
                      relative p-6 rounded-2xl transition-all duration-200
                      flex flex-col items-center justify-center
                      border-2 min-h-[80px] cursor-pointer active:scale-95 touch-manipulation select-none
                      ${speakerCount === count 
                        ? 'bg-[#63b3ed]/20 dark:bg-[#1a365d]/40 border-[#2b6cb0] dark:border-[#63b3ed] shadow-lg' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-[#63b3ed]/10 dark:hover:bg-[#1a365d]/20 hover:border-[#63b3ed]'
                      }
                    `}
                  >
                    {/* Visual Dots */}
                    <div className="flex space-x-1 mb-3">
                      {Array.from({ length: count }).map((_, i) => (
                        <div
                          key={i}
                          className={`
                            w-2 h-2 rounded-full
                            ${speakerCount === count 
                              ? 'bg-[#2b6cb0]' 
                              : 'bg-gray-400 dark:bg-gray-600'
                            }
                          `}
                        />
                      ))}
                    </div>
                    
                    {/* Number */}
                    <span className={`
                      text-2xl font-bold
                      ${speakerCount === count 
                        ? 'text-[#1a365d] dark:text-[#63b3ed]' 
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {count}
                    </span>
                    
                    {/* Label */}
                    <span className={`
                      text-xs font-medium mt-1
                      ${speakerCount === count 
                        ? 'text-[#2b6cb0] dark:text-[#63b3ed]' 
                        : 'text-gray-500 dark:text-gray-500'
                      }
                    `}>
                      {count === 2 ? 'Dr+Pt' : `${count} Voices`}
                    </span>
                    
                    {/* Selected Indicator */}
                    {speakerCount === count && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#2b6cb0] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setSpeakerDropdownOpen(false)}
                className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
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