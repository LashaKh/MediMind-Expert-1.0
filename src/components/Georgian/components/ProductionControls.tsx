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
    <div className="flex flex-row gap-3 w-full">
      
      {/* Compact Engine Selection */}
      {onModelChange && (
        <div className="relative flex-1" ref={engineRef}>
          
          {/* Compact Button */}
          <button
            onClick={() => !recordingState.isRecording && setEngineDropdownOpen(!engineDropdownOpen)}
            disabled={recordingState.isRecording}
            title={recordingState.isRecording ? "Cannot change transcription quality during recording" : `Select transcription quality: ${currentEngine.name} - ${currentEngine.description}`}
            className={`
              relative w-full group overflow-hidden h-12
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
            <div className="relative px-3 py-2 flex items-center justify-between h-full">
              
              {/* Left: Icon and Text */}
              <div className="flex items-center space-x-2">
                
                {/* Icon */}
                <div className={`
                  w-8 h-8 rounded-lg bg-gradient-to-br ${currentEngine.gradient}
                  flex items-center justify-center shadow-sm
                  transition-all duration-200
                `}>
                  <CurrentEngineIcon className="w-4 h-4 text-white" />
                </div>
                
                {/* Text */}
                <div className="text-left">
                  <h3 className={`
                    text-sm font-bold text-${currentEngine.textColor} dark:text-${currentEngine.darkTextColor}
                  `}>
                    {currentEngine.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
          
          {/* Premium Dropdown */}
          {engineDropdownOpen && !recordingState.isRecording && (
            <div className="absolute top-full mt-2 left-0 right-0 z-50 animate-in slide-in-from-top-2 duration-200">
              
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
        </div>
      )}
      
      {/* Compact Speaker Detection */}
      {onToggleSpeakerDiarization && (
        <div className="relative flex-1" ref={speakerRef}>
          
          {/* Compact Toggle Button */}
          <button
            onClick={() => !recordingState.isRecording && onToggleSpeakerDiarization(!enableSpeakerDiarization)}
            disabled={recordingState.isRecording}
            title={recordingState.isRecording ? "Cannot change speaker settings during recording" : enableSpeakerDiarization ? `Speaker separation is ON (detecting ${speakerCount} voices) - Click to turn OFF` : "Speaker separation is OFF - Click to turn ON and separate different voices (doctor/patient)"}
            className={`
              relative w-full group overflow-hidden h-12
              ${recordingState.isRecording ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
            `}
          >
            {/* Background */}
            <div className={`
              absolute inset-0 bg-gradient-to-r transition-all duration-300
              ${enableSpeakerDiarization 
                ? 'from-violet-500 to-purple-600' 
                : 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20'
              }
            `} />
            
            {/* Glass Effect */}
            <div className="absolute inset-0 bg-white/40 dark:bg-white/10 backdrop-blur-sm" />
            
            {/* Border */}
            <div className={`
              absolute inset-0 border rounded-xl transition-all duration-200
              ${enableSpeakerDiarization 
                ? 'border-violet-300 dark:border-violet-500' 
                : 'border-violet-200 dark:border-violet-700 group-hover:border-violet-300 dark:group-hover:border-violet-600'
              }
            `} />
            
            {/* Glow */}
            <div className={`
              absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl 
              transition-all duration-300 blur-sm
              ${enableSpeakerDiarization ? 'opacity-15 animate-pulse' : 'opacity-0 group-hover:opacity-10'}
            `} />
            
            {/* Content */}
            <div className="relative px-3 py-2 flex items-center justify-between h-full">
              
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!recordingState.isRecording) {
                        setSpeakerDropdownOpen(!speakerDropdownOpen);
                      }
                    }}
                    className="px-2 py-1 rounded-lg bg-white/20 border border-white/30 text-white text-xs font-semibold flex items-center space-x-1 hover:bg-white/30 transition-all duration-200"
                  >
                    <Users className="w-3 h-3" />
                    <span>{speakerCount}</span>
                    <ChevronDown className={`w-3 h-3 transition-all duration-200 ${speakerDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>
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
          </button>
          
          {/* Speaker Count Dropdown */}
          {enableSpeakerDiarization && speakerDropdownOpen && !recordingState.isRecording && onSpeakerCountChange && (
            <div className="absolute top-full mt-2 right-0 z-50 animate-in slide-in-from-top-2 duration-200">
              
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
                
                {/* Options */}
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
    </div>
  );
};