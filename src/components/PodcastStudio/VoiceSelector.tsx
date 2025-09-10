import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Voice {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  accent: string;
  specialty?: string;
  previewUrl?: string;
  voiceUrl: string;
}

interface VoiceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSelect: (voice1: Voice, voice2: Voice) => void;
  currentVoices?: { voice1?: Voice; voice2?: Voice };
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  isOpen,
  onClose,
  onVoiceSelect,
  currentVoices
}) => {
  const { t } = useTranslation();
  const [selectedVoice1, setSelectedVoice1] = useState<Voice | null>(
    currentVoices?.voice1 || null
  );
  const [selectedVoice2, setSelectedVoice2] = useState<Voice | null>(
    currentVoices?.voice2 || null
  );
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  // Medical professional voices
  const medicalVoices: Voice[] = [
    {
      id: 'dr-sarah',
      name: 'Dr. Sarah Chen',
      description: 'Professional, clear articulation, medical expertise',
      gender: 'female',
      accent: 'American',
      specialty: 'Cardiology',
      voiceUrl: 's3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json'
    },
    {
      id: 'dr-michael',
      name: 'Dr. Michael Rodriguez',
      description: 'Authoritative, warm tone, clinical experience',
      gender: 'male',
      accent: 'American',
      specialty: 'Internal Medicine',
      voiceUrl: 's3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json'
    },
    {
      id: 'dr-emma',
      name: 'Dr. Emma Thompson',
      description: 'Analytical, precise pronunciation, research-focused',
      gender: 'female',
      accent: 'British',
      specialty: 'Research',
      voiceUrl: 's3://voice-cloning-zero-shot/d9ff2c6c-8b93-47fb-9b6c-7b2b4e8a1d5c/original/manifest.json'
    },
    {
      id: 'dr-james',
      name: 'Dr. James Wilson',
      description: 'Experienced, reassuring, educational tone',
      gender: 'male',
      accent: 'American',
      specialty: 'Education',
      voiceUrl: 's3://voice-cloning-zero-shot/a1b2c3d4-e5f6-7890-abcd-ef1234567890/original/manifest.json'
    }
  ];

  const handleVoicePreview = async (voice: Voice) => {
    if (playingVoice === voice.id) {
      // Stop playing
      setPlayingVoice(null);
      return;
    }

    if (voice.previewUrl) {
      setPlayingVoice(voice.id);
      
      // Simulate audio preview
      setTimeout(() => {
        setPlayingVoice(null);
      }, 3000);
    }
  };

  const handleSave = () => {
    if (selectedVoice1 && selectedVoice2) {
      onVoiceSelect(selectedVoice1, selectedVoice2);
      onClose();
    }
  };

  const canSave = selectedVoice1 && selectedVoice2 && selectedVoice1.id !== selectedVoice2.id;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--component-card)] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border-light)]">
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  {t('podcast.voiceSelector.title')}
                </h2>
                <p className="text-[var(--foreground-tertiary)] mt-1">
                  {t('podcast.voiceSelector.subtitle')}
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground-tertiary)] transition-colors duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Voice Selection */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Host 1 */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                    {t('podcast.voiceSelector.host1')}
                  </h3>
                  
                  <div className="space-y-3">
                    {medicalVoices.map((voice) => {
                      const isSelected = selectedVoice1?.id === voice.id;
                      const isPlaying = playingVoice === voice.id;
                      
                      return (
                        <motion.div
                          key={voice.id}
                          layout
                          className={`
                            p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                            ${isSelected
                              ? 'border-purple-200 bg-purple-50'
                              : 'border-[var(--glass-border-light)] hover:border-[var(--glass-border-medium)] hover:bg-[var(--component-surface-primary)]'
                            }
                          `}
                          onClick={() => setSelectedVoice1(voice)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-[var(--foreground)]">
                                  {voice.name}
                                </h4>
                                
                                <div className="flex items-center space-x-2">
                                  <span className={`
                                    px-2 py-0.5 rounded-full text-xs font-medium
                                    ${voice.gender === 'female' 
                                      ? 'bg-pink-100 text-pink-700' 
                                      : 'bg-[var(--cardiology-accent-blue-light)] text-[var(--cardiology-accent-blue-dark)]'
                                    }
                                  `}>
                                    {voice.gender === 'female' ? '♀' : '♂'}
                                  </span>
                                  
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--component-surface-secondary)] text-[var(--foreground-tertiary)]">
                                    {voice.accent}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-[var(--foreground-tertiary)] mb-2">
                                {voice.description}
                              </p>
                              
                              {voice.specialty && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[var(--cardiology-accent-blue-light)] text-[var(--cardiology-accent-blue-dark)]">
                                  {voice.specialty}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {/* Preview Button */}
                              {voice.previewUrl && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVoicePreview(voice);
                                  }}
                                  className="p-2 text-[var(--foreground-secondary)] hover:text-purple-600 transition-colors duration-200"
                                >
                                  {isPlaying ? (
                                    <PauseIcon className="w-4 h-4" />
                                  ) : (
                                    <PlayIcon className="w-4 h-4" />
                                  )}
                                </button>
                              )}

                              {/* Selection indicator */}
                              <div className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                ${isSelected
                                  ? 'border-purple-600 bg-purple-600'
                                  : 'border-[var(--glass-border-medium)]'
                                }
                              `}>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-[var(--component-card)] rounded-full"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Host 2 */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                    {t('podcast.voiceSelector.host2')}
                  </h3>
                  
                  <div className="space-y-3">
                    {medicalVoices.map((voice) => {
                      const isSelected = selectedVoice2?.id === voice.id;
                      const isPlaying = playingVoice === voice.id;
                      const isDisabled = selectedVoice1?.id === voice.id;
                      
                      return (
                        <motion.div
                          key={voice.id}
                          layout
                          className={`
                            p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                            ${isDisabled
                              ? 'border-[var(--glass-border-light)] bg-[var(--component-surface-primary)] opacity-50 cursor-not-allowed'
                              : isSelected
                                ? 'border-purple-200 bg-purple-50'
                                : 'border-[var(--glass-border-light)] hover:border-[var(--glass-border-medium)] hover:bg-[var(--component-surface-primary)]'
                            }
                          `}
                          onClick={() => !isDisabled && setSelectedVoice2(voice)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-[var(--foreground)]">
                                  {voice.name}
                                </h4>
                                
                                <div className="flex items-center space-x-2">
                                  <span className={`
                                    px-2 py-0.5 rounded-full text-xs font-medium
                                    ${voice.gender === 'female' 
                                      ? 'bg-pink-100 text-pink-700' 
                                      : 'bg-[var(--cardiology-accent-blue-light)] text-[var(--cardiology-accent-blue-dark)]'
                                    }
                                  `}>
                                    {voice.gender === 'female' ? '♀' : '♂'}
                                  </span>
                                  
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--component-surface-secondary)] text-[var(--foreground-tertiary)]">
                                    {voice.accent}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-[var(--foreground-tertiary)] mb-2">
                                {voice.description}
                              </p>
                              
                              {voice.specialty && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[var(--cardiology-accent-blue-light)] text-[var(--cardiology-accent-blue-dark)]">
                                  {voice.specialty}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {/* Preview Button */}
                              {voice.previewUrl && !isDisabled && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVoicePreview(voice);
                                  }}
                                  className="p-2 text-[var(--foreground-secondary)] hover:text-purple-600 transition-colors duration-200"
                                >
                                  {isPlaying ? (
                                    <PauseIcon className="w-4 h-4" />
                                  ) : (
                                    <PlayIcon className="w-4 h-4" />
                                  )}
                                </button>
                              )}

                              {/* Selection indicator */}
                              <div className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                ${isSelected
                                  ? 'border-purple-600 bg-purple-600'
                                  : 'border-[var(--glass-border-medium)]'
                                }
                              `}>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-[var(--component-card)] rounded-full"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isDisabled && (
                            <div className="mt-2 text-xs text-[var(--foreground-secondary)]">
                              {t('podcast.voiceSelector.alreadySelected')}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Preview Info */}
              <div className="mt-8 p-4 bg-[var(--cardiology-accent-blue-light)] border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <SpeakerWaveIcon className="w-5 h-5 text-[var(--cardiology-accent-blue-dark)] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      {t('podcast.voiceSelector.preview.title')}
                    </h4>
                    <p className="text-xs text-[var(--cardiology-accent-blue-dark)]">
                      {t('podcast.voiceSelector.preview.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[var(--glass-border-light)] bg-[var(--component-surface-primary)]">
              <div className="text-sm text-[var(--foreground-tertiary)]">
                {selectedVoice1 && selectedVoice2 ? (
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    <span>
                      {t('podcast.voiceSelector.selected', {
                        voice1: selectedVoice1.name,
                        voice2: selectedVoice2.name
                      })}
                    </span>
                  </div>
                ) : (
                  t('podcast.voiceSelector.selectBoth')
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-[var(--foreground-tertiary)] border border-[var(--glass-border-medium)] rounded-lg hover:bg-[var(--component-surface-primary)] transition-colors duration-200"
                >
                  {t('common.cancel')}
                </button>
                
                <motion.button
                  whileHover={{ scale: canSave ? 1.02 : 1 }}
                  whileTap={{ scale: canSave ? 0.98 : 1 }}
                  disabled={!canSave}
                  onClick={handleSave}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all duration-200
                    ${canSave
                      ? 'bg-purple-600 text-[var(--foreground)] hover:bg-purple-700 shadow-sm hover:shadow-md'
                      : 'bg-[var(--component-panel)] text-[var(--foreground-secondary)] cursor-not-allowed'
                    }
                  `}
                >
                  {t('common.save')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceSelector;