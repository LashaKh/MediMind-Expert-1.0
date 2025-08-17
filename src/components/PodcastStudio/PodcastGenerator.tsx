import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  Mic,
  Clock,
  FileText,
  ChevronRight,
  Bug
} from 'lucide-react';
import { useAuth } from '../../stores/useAppStore';
import { generatePodcast } from '../../lib/api/podcastUpload';
import { getPodcastStatus } from '../../lib/api/podcastStatus';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';
import { supabase } from '../../lib/supabase';

interface PodcastGeneratorProps {
  selectedDocuments: string[];
  onGenerationStart: (podcastData: any) => void;
  onQueueUpdate: (queueStatus: any) => void;
  onGenerationComplete?: (podcastData: any) => void;
  debugInfo: any | null;
  setDebugInfo: (debugInfo: any) => void;
}

type SynthesisStyle = 'podcast' | 'executive-briefing' | 'debate';

interface GenerationSettings {
  title: string;
  description: string;
  synthesisStyle: SynthesisStyle;
}

const PodcastGenerator: React.FC<PodcastGeneratorProps> = ({
  selectedDocuments,
  onGenerationStart,
  onQueueUpdate,
  onGenerationComplete,
  debugInfo,
  setDebugInfo
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [settings, setSettings] = useState<GenerationSettings>({
    title: '',
    description: '',
    synthesisStyle: 'podcast'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(10);
  const [generationStatus, setGenerationStatus] = useState<any | null>(null);
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);

  // Debug logging helper
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const logEntry = `[${timestamp}] ${message}${data ? ': ' + JSON.stringify(data, null, 2) : ''}`;
    console.log(`[PodcastDebug] ${logEntry}`);
    setDebugInfo(prev => ({
      ...prev,
      logs: [...(prev?.logs || []).slice(-10), logEntry] // Keep last 10 logs
    }));
  };

  const synthesisStyles = [
    {
      value: 'podcast' as const,
      label: t('podcast.generator.styles.podcast.title'),
      description: t('podcast.generator.styles.podcast.description'),
      icon: Mic,
      duration: '8-12 min',
      color: 'blue'
    },
    {
      value: 'executive-briefing' as const,
      label: t('podcast.generator.styles.briefing.title'),
      description: t('podcast.generator.styles.briefing.description'),
      icon: FileText,
      duration: '5-8 min',
      color: 'green'
    },
    {
      value: 'debate' as const,
      label: t('podcast.generator.styles.debate.title'),
      description: t('podcast.generator.styles.debate.description'),
      icon: Sparkles,
      duration: '10-15 min',
      color: 'purple'
    }
  ];

  useEffect(() => {
    // Auto-generate title based on selected documents
    if (selectedDocuments.length > 0) {
      const baseTitle = selectedDocuments.length === 1 
        ? t('podcast.generator.autoTitle.single')
        : t('podcast.generator.autoTitle.multiple', { count: selectedDocuments.length });
      
      if (!settings.title) {
        setSettings(prev => ({ ...prev, title: baseTitle }));
      }
    }
  }, [selectedDocuments, t]);

  useEffect(() => {
    // Update estimated duration based on style
    const style = synthesisStyles.find(s => s.value === settings.synthesisStyle);
    if (style) {
      const duration = style.value === 'podcast' ? 10 : 
                      style.value === 'executive-briefing' ? 6 : 12;
      setEstimatedDuration(duration);
    }
  }, [settings.synthesisStyle]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (stopPolling) {
        stopPolling();
      }
    };
  }, [stopPolling]);

  const handleDebugGenerate = async () => {
    console.log('🧪 Debug Script Only clicked!', { userId: user?.id, documents: selectedDocuments.length });
    
    if (!user?.id || selectedDocuments.length === 0) {
      console.warn('🧪 Debug cancelled - missing user or documents');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGenerationStatus(null);

    addDebugLog('🧪 DEBUG SCRIPT ONLY: Testing 4-step debug data capture...');

    try {
      // Call the debug-script-only function to test 4-step debug capture
      const { data, error } = await supabase.functions.invoke('debug-script-only', {
        body: {
          userId: user.id,
          documentIds: selectedDocuments,
          title: settings.title,
          synthesisStyle: settings.synthesisStyle,
          specialty: (user as any).medical_specialty || 'general'
        }
      });

      if (error) {
        addDebugLog(`❌ Debug script function error: ${error.message}`);
        throw error;
      }

      addDebugLog(`✅ Debug script function completed successfully`);
      
      // Check if data has the debug structure (either wrapped or direct)
      const debugInfo = data?.debugInfo || (data?.step1_document_overview ? data : null);
      
      if (debugInfo) {
        console.log('🔍 Real debug info received from debug-script-only:', debugInfo);
        setDebugInfo(debugInfo);
        addDebugLog('🔍 Real 3-step debug data captured', {
          step1: !!debugInfo.step1_document_overview,
          step2: !!debugInfo.step2_content_mapping,
          step3: !!debugInfo.step3_comprehensive_outline,
          validation: !!debugInfo.validation
        });
      } else {
        addDebugLog('⚠️ No debug info in response - using simulation');
        // Keep simulated data as fallback
        const simulatedDebugInfo = {
          step1_extraction: {
            queries: [
              "What is the main medical condition or topic discussed in this document?",
              "What are the symptoms, signs, or clinical presentations mentioned?", 
              "What diagnostic procedures, tests, or criteria are described?",
              "What treatments, medications, or interventions are discussed?",
              "What are the key clinical findings, outcomes, or prognosis mentioned?",
              "What are the important medical terms, definitions, or concepts explained?"
            ],
            responses: [
              {
                query: "What is the main medical condition or topic discussed in this document?",
                content: "The document discusses hyponatremia, a condition characterized by low sodium levels in the blood (typically below 135 mEq/L). This electrolyte imbalance can range from mild to severe and requires careful clinical assessment and management.",
                medicalTerms: ["hyponatremia", "electrolyte", "sodium", "mEq/L"],
                success: true,
                timing: 1250
              }
            ],
            totalSections: 6,
            timing: 7200
          },
          step2_topics: {
            rawContent: "Combined content from all sections...",
            identifiedTopics: {
              primaryCondition: "Hyponatremia",
              secondaryConditions: ["SIADH", "Heart failure", "Liver disease"],
              symptoms: ["Nausea", "Headache", "Confusion", "Fatigue", "Muscle cramps", "Seizures"],
              treatments: ["Fluid restriction", "Hypertonic saline", "Loop diuretics", "Vaptans"]
            },
            timing: 2100,
            success: true
          },
          step3_outline: {
            inputTopics: {},
            generatedOutline: {
              title: settings.title,
              chapters: [
                {
                  title: "Understanding Hyponatremia",
                  keyPoints: ["Definition and classification", "Pathophysiology", "Clinical significance"]
                }
              ]
            },
            timing: 3400,
            success: true
          },
          step4_script: {
            inputOutline: {},
            finalScript: {
              chapters: [
                {
                  title: "Understanding Hyponatremia",
                  segments: [
                    {
                      speaker: "host",
                      text: "Welcome to today's medical discussion on hyponatremia, a critical electrolyte disorder."
                    }
                  ]
                }
              ]
            },
            timing: 4800,
            success: true
          },
          validation: {
            documentTopicMatch: true,
            topicConsistency: true,
            outlineCompleteness: true,
            scriptQuality: true
          }
        };
        setDebugInfo(simulatedDebugInfo);
      }
      
    } catch (err: any) {
      addDebugLog(`❌ Debug script generation failed: ${err.message}`);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!user?.id || selectedDocuments.length === 0) return;

    setIsGenerating(true);
    setError('');
    setGenerationStatus(null);

    // Enhanced debug logging
    addDebugLog('Generation started', {
      userId: user.id,
      docs: selectedDocuments.length,
      selectedDocuments,
      title: settings.title,
      style: settings.synthesisStyle,
      specialty: (user as any).medical_specialty || 'general'
    });

    try {
      console.log('[Podcast] generate:start', {
        userId: user.id,
        docs: selectedDocuments.length,
        title: settings.title,
        style: settings.synthesisStyle,
        specialty: (user as any).medical_specialty || 'general'
      });
    } catch {}

    const [result, error] = await safeAsync(
      async () => {
        const result = await generatePodcast({
          userId: user.id,
          documentIds: selectedDocuments,
          title: settings.title,
          description: settings.description,
          synthesisStyle: settings.synthesisStyle,
          specialty: (user as any).medical_specialty || 'general'
        });

        // Debug the generation response
        addDebugLog('Generation response received', {
          status: result?.status,
          podcastId: result?.podcastId,
          vectorStoreId: result?.podcastVectorStoreId,
          queuePosition: result?.queuePosition,
          eta: result?.estimatedWaitTime
        });

        try {
          console.log('[Podcast] generate:response', {
            status: result?.status,
            podcastId: result?.podcastId,
            vectorStoreId: result?.podcastVectorStoreId,
            queuePosition: result?.queuePosition,
            eta: result?.estimatedWaitTime
          });
        } catch {}

        if (result.status === 'queued') {
          onQueueUpdate(result);
        }

        // No need to store locally; tracker consumes id via props

        onGenerationStart({
          id: result.podcastId,
          status: result.status,
          title: settings.title,
          description: settings.description,
          synthesisStyle: settings.synthesisStyle,
          queuePosition: result.queuePosition,
          estimatedWaitTime: result.estimatedWaitTime
        });

        // vector store id is included in status logs; no local state needed

        // Trigger queue processor once to move from queued -> processing (uses user JWT)
        try {
          console.log('[Podcast] processor:kick:request');
          await supabase.functions.invoke('podcast-queue-processor', { method: 'POST' } as any);
          console.log('[Podcast] processor:kick:ok');
        } catch {}

        // DB-driven polling
        let cancelled = false;
        const poll = async () => {
          try {
            const status = await getPodcastStatus(result.podcastId, user!.id);
            
            // Enhanced debug logging with AI agent outputs
            addDebugLog('Status poll response', {
              status: status?.podcast?.status,
              queue: status?.queue,
              vectorStoreId: status?.podcast?.podcast_vector_store_id,
              script: status?.script,
              hasScript: !!status?.script,
              scriptChapters: status?.script?.chapters?.length || 0,
              debugInfo: status?.debugInfo,
              hasDebugInfo: !!status?.debugInfo,
              error: status?.podcast?.error_message
            });

            // Update debug info with AI outputs from 4-step medical script generation
            if (status?.debugInfo) {
              // Use the new 4-step debug information from medical-script-writer
              console.log('🔍 Debug info received from status:', status.debugInfo);
              setDebugInfo(status.debugInfo);
            } else if (status?.script) {
              // Fallback: Check if debug info is nested in script (backward compatibility)
              const scriptDebugInfo = status.script.debugInfo;
              
              if (scriptDebugInfo) {
                console.log('🔍 Debug info found in script:', scriptDebugInfo);
                setDebugInfo(scriptDebugInfo);
              } else {
                // Legacy debug format for old podcasts
                setDebugInfo(prev => ({
                  ...prev,
                  scriptGeneration: status.script,
                  aiAgentOutputs: {
                    scriptStyle: status.script?.style,
                    speakers: status.script?.speakers,
                    chapters: status.script?.chapters,
                    citations: status.script?.citations
                  },
                  vectorStore: {
                    id: status.podcast.podcast_vector_store_id,
                    expiresAt: status.podcast.vector_store_expires_at
                  }
                }));
              }
            }

            try {
              console.log('[Podcast] status', {
                status: status?.podcast?.status,
                queue: status?.queue,
                vectorStoreId: status?.podcast?.podcast_vector_store_id
              });
            } catch {}
            if (cancelled) return;
            if (status.podcast.status === 'completed') {
              setIsGenerating(false);
              setGenerationStatus({ status: 'completed', audioUrl: status.podcast.audio_url, duration: status.podcast.duration });
              if (onGenerationComplete) {
                onGenerationComplete({ id: result.podcastId, status: 'completed', title: settings.title, audioUrl: status.podcast.audio_url, duration: status.podcast.duration });
              }
              try { console.log('[Podcast] complete', { podcastId: result.podcastId, audioUrl: status.podcast.audio_url }); } catch {}
            } else if (status.podcast.status === 'failed') {
              setIsGenerating(false);
              setError(status.podcast.error_message || 'Generation failed');
              setGenerationStatus({ status: 'failed', error: status.podcast.error_message });
              try { console.log('[Podcast] failed', { error: status.podcast.error_message }); } catch {}
            } else {
              setGenerationStatus({ status: 'generating' });
              setTimeout(poll, 3000);
            }
          } catch (e: any) {
            if (cancelled) return;
            setIsGenerating(false);
            setError(e.message || 'Status check failed');
            try { console.log('[Podcast] status:error', { error: e?.message }); } catch {}
          }
        };
        poll();
        setStopPolling(() => () => { cancelled = true; });

        return result;
      },
      {
        context: 'generate AI podcast from documents',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setError(error.userMessage || 'Failed to start generation');
      setIsGenerating(false);
    }
  };

  const canGenerate = selectedDocuments.length > 0 && 
                     settings.title.trim().length > 0 && 
                     !isGenerating;

  const getStyleColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="p-8">
      {/* Revolutionary Header */}
      <div className="flex items-center space-x-5 mb-8">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: [0, -10, 10, 0] }}
          className="relative group"
        >
          {/* Multiple glowing layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-orange-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-600 rounded-2xl shadow-2xl border border-white/20">
            <Sparkles className="w-7 h-7 text-white" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
          </div>
        </motion.div>
        <div>
          <h3 className="text-2xl font-black text-white mb-1">
            Configure Your Podcast
          </h3>
          <p className="text-sm text-white/70 font-medium">
            Customize the style and content of your revolutionary AI podcast
          </p>
        </div>
      </div>

      {/* Revolutionary Wide Settings Layout */}
      <div className="space-y-8">
        {/* Wide Title and Description Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revolutionary Title Field */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-lg font-bold text-white mb-4">
              Podcast Title
            </label>
            <div className="relative group">
              {/* Input glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/40 to-pink-600/50 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
              
              {/* Input container */}
              <div className="relative">
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a compelling title..."
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 placeholder-white/40 text-white font-medium"
                  maxLength={100}
                />
                
                {/* Input highlight effect */}
                <div className="absolute top-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-white/60 font-medium">
                Captivating title for your content
              </p>
              <p className={`text-xs font-bold transition-colors ${
                settings.title.length > 80 ? 'text-orange-400' : 'text-white/60'
              }`}>
                {settings.title.length}/100
              </p>
            </div>
          </motion.div>

          {/* Revolutionary Description Field */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-lg font-bold text-white mb-4">
              Description
              <span className="text-white/50 font-medium ml-2 text-sm">
                (Optional)
              </span>
            </label>
            <div className="relative group">
              {/* Textarea glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/40 to-orange-600/50 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
              
              {/* Textarea container */}
              <div className="relative">
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add context or topics to focus on..."
                  rows={3}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all duration-300 resize-none placeholder-white/40 text-white font-medium"
                  maxLength={500}
                />
                
                {/* Textarea highlight effect */}
                <div className="absolute top-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            <p className={`text-xs font-bold mt-2 text-right transition-colors ${
              settings.description.length > 400 ? 'text-orange-400' : 'text-white/60'
            }`}>
              {settings.description.length}/500
            </p>
          </motion.div>
        </div>

        {/* Revolutionary Synthesis Style Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-lg font-bold text-white mb-6">
            Podcast Style
          </label>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {synthesisStyles.map((style, index) => {
              const Icon = style.icon;
              const isSelected = settings.synthesisStyle === style.value;
              
              return (
                <motion.div
                  key={style.value}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                  onClick={() => setSettings(prev => ({ ...prev, synthesisStyle: style.value }))}
                >
                  {/* Revolutionary Selection Glow */}
                  {isSelected && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${getStyleColor(style.color)} rounded-2xl blur-xl opacity-60`} />
                  )}
                  
                  {/* Hover glow effect */}
                  <motion.div
                    initial={false}
                    animate={{ opacity: isSelected ? 0 : 0 }}
                    whileHover={{ opacity: isSelected ? 0 : 0.4 }}
                    className={`absolute inset-0 bg-gradient-to-r ${getStyleColor(style.color)} rounded-2xl blur-lg`}
                  />
                  
                  {/* Compact Card */}
                  <div className={`
                    relative p-6 rounded-2xl cursor-pointer transition-all duration-500 border
                    ${isSelected
                      ? 'bg-white/15 backdrop-blur-xl border-white/30 shadow-2xl'
                      : 'bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                  `}>
                    {/* Prismatic edge highlights */}
                    <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`} />
                    <div className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-300 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                    }`} />
                    
                    <div className="text-center">
                      {/* Revolutionary Icon with prismatic effect */}
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.6 }}
                        className="relative mx-auto mb-4"
                      >
                        {/* Icon glow layers */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${getStyleColor(style.color)} rounded-xl blur-lg opacity-60 scale-110`} />
                        
                        <div className={`
                          relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getStyleColor(style.color)} shadow-xl border border-white/20
                          ${isSelected ? 'shadow-2xl scale-105' : 'shadow-lg'}
                          transition-all duration-300
                        `}>
                          <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                        </div>
                      </motion.div>
                      
                      <div className="space-y-2">
                        <h4 className={`font-black text-lg transition-colors duration-300 ${
                          isSelected ? 'text-gray-900' : 'text-gray-800'
                        }`}>
                          {style.label}
                        </h4>
                        
                        <div className="relative mx-auto w-fit">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 rounded-lg blur-sm" />
                          <div className="relative flex items-center space-x-2 px-3 py-1 bg-gray-100/80 backdrop-blur-sm border border-gray-200/50 rounded-lg">
                            <Clock className="w-3 h-3 text-gray-600" />
                            <span className="text-xs font-bold text-gray-700">{style.duration}</span>
                          </div>
                        </div>
                        
                        <p className={`text-xs leading-relaxed transition-colors duration-300 font-medium ${
                          isSelected ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          {style.description}
                        </p>
                      </div>

                      {/* Revolutionary Radio Button */}
                      <div className="relative mt-4 mx-auto w-fit">
                        {/* Radio glow */}
                        {isSelected && (
                          <div className={`absolute inset-0 bg-gradient-to-br ${getStyleColor(style.color)} rounded-full blur-md opacity-60 scale-150`} />
                        )}
                        
                        <div className={`
                          relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500
                          ${isSelected
                            ? `border-white/40 bg-gradient-to-br ${getStyleColor(style.color)} shadow-lg`
                            : 'border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20'
                          }
                        `}>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className="w-2.5 h-2.5 bg-white rounded-full drop-shadow-sm"
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Horizontal Duration and Generate Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Premium Estimated Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative lg:col-span-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-lg" />
            <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Estimated Duration</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ~{estimatedDuration} min
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Premium Generate Button - Horizontal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative lg:col-span-2"
          >
            {canGenerate && (
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur-xl"
              />
            )}
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: canGenerate ? 1.02 : 1 }}
                whileTap={{ scale: canGenerate ? 0.98 : 1 }}
                disabled={!canGenerate}
                onClick={handleGenerate}
                className={`
                  relative flex-1 flex items-center justify-center space-x-3 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 overflow-hidden
                  ${canGenerate
                    ? 'text-white shadow-2xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
              {/* Animated Background */}
              {canGenerate && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 animate-gradient" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </>
              )}
              
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Your Podcast...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="generate"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative flex items-center space-x-3"
                  >
                    <Sparkles className="w-6 h-6" />
                    <span>Generate AI Podcast</span>
                    {canGenerate && <ChevronRight className="w-5 h-5" />}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Debug Script Button */}
            <motion.button
              whileHover={{ scale: canGenerate ? 1.02 : 1 }}
              whileTap={{ scale: canGenerate ? 0.98 : 1 }}
              disabled={!canGenerate}
              onClick={handleDebugGenerate}
              className={`
                relative px-4 py-4 rounded-2xl font-bold text-sm transition-all duration-300 overflow-hidden
                ${canGenerate
                  ? 'bg-purple-700 text-white shadow-lg hover:bg-purple-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
              title="Debug Script Only - Test 4-step debug capture without TTS"
            >
              🧪
            </motion.button>
            </div>

            {/* Premium Requirements Message */}
            {!canGenerate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center mt-3"
              >
                <p className="text-xs text-white/60 font-medium">
                  {selectedDocuments.length === 0 
                    ? '📄 Please select at least one document to continue'
                    : '✏️ Please enter a title for your podcast'
                  }
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Debug Panel */}
        <AnimatePresence>
          {debugInfo?.logs?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-900 border border-gray-600 rounded-lg p-4 text-xs font-mono"
            >
              <h4 className="text-cyan-400 font-bold mb-3 flex items-center">
                🤖 AI Agent Debug Output
                <button 
                  onClick={() => setDebugInfo(prev => ({ ...prev || {}, logs: [] }))}
                  className="ml-auto text-gray-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {debugInfo?.logs?.slice(-10).map((log, index) => (
                  <div key={index} className="text-gray-300 border-l-2 border-cyan-500 pl-2">
                    {log}
                  </div>
                ))}
              </div>

              {debugInfo.aiAgentOutputs && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <h5 className="text-yellow-400 font-bold mb-2">📜 Script Generation:</h5>
                  <div className="text-gray-300 space-y-1">
                    <div>Style: <span className="text-cyan-400">{debugInfo.aiAgentOutputs.scriptStyle}</span></div>
                    <div>Chapters: <span className="text-cyan-400">{debugInfo.aiAgentOutputs.chapters?.length || 0}</span></div>
                    <div>Host Voice: <span className="text-green-400">{debugInfo.aiAgentOutputs.speakers?.host?.voiceId}</span></div>
                    <div>Expert Voice: <span className="text-green-400">{debugInfo.aiAgentOutputs.speakers?.expert?.voiceId}</span></div>
                    {debugInfo.vectorStore?.id && (
                      <div>Vector Store: <span className="text-purple-400">{debugInfo.vectorStore.id.slice(0, 20)}...</span></div>
                    )}
                  </div>
                </div>
              )}

              {debugInfo.vectorStore && !debugInfo.vectorStore.id && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="text-orange-400">⚠️ No documents processed - using fallback script</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generation Progress */}
        <AnimatePresence>
          {isGenerating && generationStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    {generationStatus.status === 'generating' ? 'Generating Podcast...' : 
                     generationStatus.status === 'completed' ? 'Generation Complete!' : 
                     'Generation Failed'}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {generationStatus.status === 'generating' && generationStatus.progress 
                      ? `Progress: ${Math.round(generationStatus.progress)}%`
                      : generationStatus.status === 'generating' 
                      ? 'Processing your documents with AI...'
                      : generationStatus.status === 'completed'
                      ? `Audio ready! Duration: ${generationStatus.duration ? Math.round(generationStatus.duration / 60) : '~'}min`
                      : generationStatus.error || 'Unknown error occurred'
                    }
                  </p>
                </div>
              </div>
              
              {generationStatus.progress && (
                <div className="mt-3">
                  <div className="bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationStatus.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {generationStatus.status === 'completed' && generationStatus.audioUrl && (
                <div className="mt-3">
                  <audio 
                    controls 
                    className="w-full"
                    src={generationStatus.audioUrl}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Debug Tracker removed - now handled at PodcastStudio level */}

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .bg-size-200 {
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
};

export default PodcastGenerator;