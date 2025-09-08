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

// Engine configuration with premium visual design
const ENGINE_CONFIGS = {
  STT1: {
    name: 'Fast',
    description: 'Lightning-fast processing',
    icon: Zap,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
    darkBgGradient: 'from-emerald-900/20 to-teal-900/20',
    borderColor: 'emerald-200',
    darkBorderColor: 'emerald-700',
    textColor: 'emerald-700',
    darkTextColor: 'emerald-300',
    glowColor: 'emerald-500/20',
    features: ['Ultra-fast transcription', 'Real-time processing', 'Low latency']
  },
  STT2: {
    name: 'Balanced',
    description: 'Perfect accuracy-speed balance',
    icon: Settings,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-50 to-indigo-50',
    darkBgGradient: 'from-blue-900/20 to-indigo-900/20',
    borderColor: 'blue-200',
    darkBorderColor: 'blue-700',
    textColor: 'blue-700',
    darkTextColor: 'blue-300',
    glowColor: 'blue-500/20',
    features: ['Balanced performance', 'Good accuracy', 'Optimal for most cases']
  },
  STT3: {
    name: 'Accurate',
    description: 'Maximum precision transcription',
    icon: Target,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-50 to-violet-50',
    darkBgGradient: 'from-purple-900/20 to-violet-900/20',
    borderColor: 'purple-200',
    darkBorderColor: 'purple-700',
    textColor: 'purple-700',
    darkTextColor: 'purple-300',
    glowColor: 'purple-500/20',
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
    <div className="flex flex-row gap-3 w-full lg:gap-3 md:mediscribe-mobile-controls">
      
      {/* Compact Engine Selection */}
      {onModelChange && (
        <div className="relative flex-1 md:mediscribe-mobile-control-container" ref={engineRef}>
          
          {/* Compact Button */}
          <button
            onClick={() => !recordingState.isRecording && setEngineDropdownOpen(!engineDropdownOpen)}
            disabled={recordingState.isRecording}
            title={recordingState.isRecording ? "Cannot change transcription quality during recording" : `Select transcription quality: ${currentEngine.name} - ${currentEngine.description}`}
            className={`
              relative w-full group overflow-hidden h-12 md:min-h-[44px] md:h-[44px] mediscribe-mobile-control-button mediscribe-touch-target mediscribe-haptic-feedback
              ${recordingState.isRecording ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
            `}
          >
            {/* Background */}
            <div className={`
              absolute inset-0 bg-gradient-to-r ${currentEngine.bgGradient} dark:${currentEngine.darkBgGradient}
              transition-all duration-300
            `} />
            
            {/* Glass Effect */}
            <div className="absolute inset-0 bg-white/40 dark:bg-white/10 backdrop-blur-sm" />
            
            {/* Border */}
            <div className={`
              absolute inset-0 border border-${currentEngine.borderColor} dark:border-${currentEngine.darkBorderColor}
              rounded-xl transition-all duration-200
              group-hover:border-${currentEngine.color}-400 dark:group-hover:border-${currentEngine.color}-500
            `} />
            
            {/* Glow */}
            <div className={`
              absolute -inset-0.5 bg-gradient-to-r ${currentEngine.gradient} rounded-xl 
              opacity-0 group-hover:opacity-10 transition-all duration-300 blur-sm
            `} />
            
            {/* Content */}
            <div className="relative px-3 py-2 md:px-2 md:py-2 flex items-center justify-between h-full">
              
              {/* Left: Icon and Text */}
              <div className="flex items-center space-x-2">
                
                {/* Icon */}
                <div className={`
                  w-8 h-8 md:w-6 md:h-6 rounded-lg bg-gradient-to-br ${currentEngine.gradient}
                  flex items-center justify-center shadow-sm mediscribe-mobile-control-icon
                  transition-all duration-200
                `}>
                  <CurrentEngineIcon className="w-4 h-4 text-white" />
                </div>
                
                {/* Text */}
                <div className="text-left">
                  <h3 className={`
                    text-sm font-bold text-${currentEngine.textColor} dark:text-${currentEngine.darkTextColor} mediscribe-mobile-control-text
                  `}>
                    {currentEngine.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mediscribe-mobile-control-subtext">
                    Transcription Quality
                  </p>
                </div>
              </div>
              
              {/* Right: Indicator */}
              <div className="flex items-center space-x-1">
                <div className={`
                  w-2 h-2 rounded-full bg-gradient-to-r ${currentEngine.gradient}
                  ${recordingState.isRecording ? 'animate-pulse' : ''}
                `} />
                <ChevronDown className={`
                  w-4 h-4 text-${currentEngine.textColor} dark:text-${currentEngine.darkTextColor}
                  ${engineDropdownOpen ? 'rotate-180' : 'rotate-0'}
                  transition-all duration-200
                `} />
              </div>
            </div>
          </button>
          
          {/* Desktop Dropdown - Hidden on Mobile */}
          {engineDropdownOpen && !recordingState.isRecording && (
            <div className="hidden md:block absolute top-full mt-2 left-0 right-0 z-50 animate-in slide-in-from-top-2 duration-200">
              
              {/* Backdrop */}
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10" />
              
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
                        w-full p-4 rounded-2xl text-left transition-all duration-200 ease-out
                        ${isSelected 
                          ? `bg-gradient-to-r ${engine.bgGradient} dark:${engine.darkBgGradient} border-2 border-${engine.borderColor} dark:border-${engine.darkBorderColor}` 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                        }
                        group/item
                      `}
                    >
                      <div className="flex items-center space-x-4">
                        
                        {/* Icon */}
                        <div className={`
                          w-10 h-10 rounded-xl bg-gradient-to-br ${engine.gradient}
                          flex items-center justify-center shadow-md
                          group-hover/item:scale-110 transition-all duration-200
                        `}>
                          <EngineIcon className="w-5 h-5 text-white" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`
                              font-bold text-${engine.textColor} dark:text-${engine.darkTextColor}
                            `}>
                              {engine.name}
                            </h4>
                            
                            {isSelected && (
                              <div className={`
                                w-6 h-6 rounded-full bg-gradient-to-r ${engine.gradient}
                                flex items-center justify-center shadow-md
                              `}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <p className={`
                            text-sm text-${engine.textColor}/70 dark:text-${engine.darkTextColor}/70
                          `}>
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
              
              {/* Mobile Bottom Sheet */}
              <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 md:hidden">
                <div className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-gray-700 p-6">
                  
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
                              ? `bg-gradient-to-br ${engine.gradient}` 
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
      
      {/* Speaker Detection - Responsive */}
      {onToggleSpeakerDiarization && (
        <div className="relative flex-1 mediscribe-mobile-control-container" ref={speakerRef}>
            
            {/* Responsive Speaker Toggle Button */}
            <div
              onClick={() => !recordingState.isRecording && onToggleSpeakerDiarization(!enableSpeakerDiarization)}
              role="button"
              tabIndex={recordingState.isRecording ? -1 : 0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!recordingState.isRecording) {
                    onToggleSpeakerDiarization(!enableSpeakerDiarization);
                  }
                }
              }}
              aria-disabled={recordingState.isRecording}
              title={recordingState.isRecording ? "Cannot change speaker settings during recording" : enableSpeakerDiarization ? `Speaker separation is ON (detecting ${speakerCount} voices) - Click to turn OFF` : "Speaker separation is OFF - Click to turn ON and separate different voices (doctor/patient)"}
              className={`
                relative w-full group overflow-hidden mediscribe-mobile-control-button mediscribe-touch-target mediscribe-haptic-feedback
                ${recordingState.isRecording ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                min-h-[44px] h-12 flex
              `}
            >
              {/* Background */}
              <div className={`
                absolute inset-0 bg-gradient-to-r transition-all duration-300 z-0
                ${enableSpeakerDiarization 
                  ? 'from-violet-500 to-purple-600' 
                  : 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20'
                }
              `} />
              
              {/* Glass Effect */}
              <div className="absolute inset-0 bg-white/40 dark:bg-white/10 backdrop-blur-sm z-[1]" />
              
              {/* Border */}
              <div className={`
                absolute inset-0 border rounded-xl transition-all duration-200 z-[2]
                ${enableSpeakerDiarization 
                  ? 'border-violet-300 dark:border-violet-500' 
                  : 'border-violet-200 dark:border-violet-700 group-hover:border-violet-300 dark:group-hover:border-violet-600'
                }
              `} />
              
              {/* Glow */}
              <div className={`
                absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl 
                transition-all duration-300 blur-sm z-[3]
                ${enableSpeakerDiarization ? 'opacity-15 animate-pulse' : 'opacity-0 group-hover:opacity-10'}
              `} />
              
              {/* Responsive Content - Desktop Layout */}
              <div className="relative px-3 py-2 flex items-center justify-between h-full hidden md:flex z-10">
                
                {/* Left: Icon and Text */}
                <div className="flex items-center space-x-2">
                  
                  {/* Icon */}
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shadow-sm
                    transition-all duration-200
                    ${enableSpeakerDiarization 
                      ? 'bg-white/20 border border-white/30' 
                      : 'bg-gradient-to-br from-violet-500 to-purple-500'
                    }
                  `}>
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Text */}
                  <div className="text-left">
                    <h3 className={`
                      text-sm font-bold transition-all duration-200
                      ${enableSpeakerDiarization 
                        ? 'text-white' 
                        : 'text-violet-700 dark:text-violet-300'
                      }
                    `}>
                      Speakers
                    </h3>
                    <p className={`
                      text-xs transition-all duration-200
                      ${enableSpeakerDiarization 
                        ? 'text-white/70' 
                        : 'text-gray-500 dark:text-gray-400'
                      }
                    `}>
                      {enableSpeakerDiarization ? `${speakerCount} voices` : 'Voice separation'}
                    </p>
                  </div>
                </div>
                
                {/* Right: Controls */}
                <div className="flex items-center space-x-2">
                  
                  {/* Speaker Count */}
                  {enableSpeakerDiarization && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!recordingState.isRecording) {
                          setSpeakerDropdownOpen(!speakerDropdownOpen);
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
                      className="px-2 py-1 rounded-lg bg-white/20 border border-white/30 text-white text-xs font-semibold flex items-center space-x-1 hover:bg-white/30 transition-all duration-200 cursor-pointer"
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
                      : 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500'
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
              </div>
              
              {/* Mobile Content - All Contained */}
              <div className="absolute inset-0 flex items-center justify-between px-3 z-[100] md:hidden">
                
                {/* Left Side: Icon and Text */}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200
                    ${enableSpeakerDiarization 
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600' 
                      : 'bg-gray-400 dark:bg-gray-600'
                    }`}>
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex flex-col items-start">
                    <div className={`text-xs font-bold leading-tight transition-all duration-200
                      ${enableSpeakerDiarization 
                        ? 'text-violet-700 dark:text-violet-300' 
                        : 'text-gray-600 dark:text-gray-400'
                      }`}>
                      Speakers
                    </div>
                    <div className={`text-[10px] leading-tight transition-all duration-200
                      ${enableSpeakerDiarization 
                        ? 'text-violet-600 dark:text-violet-400' 
                        : 'text-gray-500 dark:text-gray-500'
                      }`}>
                      {enableSpeakerDiarization ? `${speakerCount} voices` : 'OFF'}
                    </div>
                  </div>
                </div>
                
                {/* Right Side: Number Selector only when enabled */}
                {enableSpeakerDiarization && onSpeakerCountChange && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Mobile speaker count button clicked');
                      if (!recordingState.isRecording) {
                        setSpeakerDropdownOpen(!speakerDropdownOpen);
                      }
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-sm font-bold">{speakerCount}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${speakerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Desktop Speaker Count Dropdown */}
            {enableSpeakerDiarization && speakerDropdownOpen && !recordingState.isRecording && onSpeakerCountChange && (
              <div className="hidden md:block absolute top-full mt-2 right-0 z-50 animate-in slide-in-from-top-2 duration-200">
                
                {/* Backdrop */}
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-2 min-w-48">
                  
                  {/* Header */}
                  <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Speaker Count</span>
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Number of speakers to detect
                    </p>
                  </div>
                  
                  {/* Desktop Options - List Layout */}
                  <div className="p-1">
                    {[2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          onSpeakerCountChange(count);
                          setSpeakerDropdownOpen(false);
                        }}
                        className={`
                          w-full p-3 rounded-xl text-left transition-all duration-200
                          flex items-center justify-between
                          ${speakerCount === count 
                            ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-300 dark:border-violet-600' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-2 border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            {Array.from({ length: count }).map((_, i) => (
                              <div
                                key={i}
                                className={`
                                  w-2 h-2 rounded-full
                                  ${speakerCount === count 
                                    ? 'bg-violet-500' 
                                    : 'bg-gray-400 dark:bg-gray-600'
                                  }
                                `}
                              />
                            ))}
                          </div>
                          
                          <span className={`
                            font-medium
                            ${speakerCount === count 
                              ? 'text-violet-700 dark:text-violet-300' 
                              : 'text-gray-700 dark:text-gray-300'
                            }
                          `}>
                            {count} Speakers
                          </span>
                        </div>
                        
                        {speakerCount === count && (
                          <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
      )}

      {/* Mobile Speaker Count Dropdown - Bottom Sheet Style */}
      {enableSpeakerDiarization && speakerDropdownOpen && !recordingState.isRecording && onSpeakerCountChange && (
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
          
          {/* Mobile Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 md:hidden">
            <div 
              className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-gray-700 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Handle */}
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
              
              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Select Voice Count</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
                      console.log('🔢 Speaker count selected:', count, 'current:', speakerCount);
                      if (onSpeakerCountChange) {
                        console.log('📞 Calling onSpeakerCountChange with:', count);
                        onSpeakerCountChange(count);
                      } else {
                        console.log('❌ onSpeakerCountChange is not available');
                      }
                      // Small delay before closing to ensure state update
                      setTimeout(() => {
                        setSpeakerDropdownOpen(false);
                      }, 100);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('👆 Mouse down on speaker count:', count);
                    }}
                    type="button"
                    className={`
                      relative p-6 rounded-2xl transition-all duration-200
                      flex flex-col items-center justify-center
                      border-2 min-h-[80px] cursor-pointer active:scale-95 touch-manipulation select-none
                      ${speakerCount === count 
                        ? 'bg-violet-100 dark:bg-violet-900/40 border-violet-400 dark:border-violet-500 shadow-lg' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300'
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
                              ? 'bg-violet-500' 
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
                        ? 'text-violet-700 dark:text-violet-300' 
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {count}
                    </span>
                    
                    {/* Label */}
                    <span className={`
                      text-xs font-medium mt-1
                      ${speakerCount === count 
                        ? 'text-violet-600 dark:text-violet-400' 
                        : 'text-gray-500 dark:text-gray-500'
                      }
                    `}>
                      {count === 2 ? 'Doctor + Patient' : 'Voices'}
                    </span>
                    
                    {/* Selected Indicator */}
                    {speakerCount === count && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
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
  );
};