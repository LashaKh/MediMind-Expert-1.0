import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  FileText, 
  Clock,
  Sparkles,
  List,
  Bug,
  Headphones,
  Brain,
  Zap,
  ChevronRight,
  ArrowRight,
  Star,
  Radio,
  Volume2,
  Layers,
  AudioWaveform,
  Play,
  Pause,
  Settings,
  Magic
} from 'lucide-react';
import { useAuth, useSpecialty } from '../../stores/useAppStore';
import DocumentSelector from './DocumentSelector';
import PodcastGenerator from './PodcastGenerator';
import GenerationProgress from './GenerationProgress';
import PodcastHistory from './PodcastHistory';
import PodcastPlayer from './PodcastPlayer';
import PodcastDebug from './PodcastDebug';
import DebugTracker from './DebugTracker';
import type { Podcast, QueueStatus } from '../../types/podcast';

interface PodcastStudioProps {}

const PodcastStudio: React.FC<PodcastStudioProps> = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { specialty } = useSpecialty();
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'debug'>('generate');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any | null>(null);
  const [showDebugTracker, setShowDebugTracker] = useState(false);

  const tabs = [
    {
      id: 'generate' as const,
      label: t('podcast.tabs.generate'),
      icon: Sparkles,
      gradient: 'from-violet-600 to-purple-600'
    },
    {
      id: 'history' as const,
      label: t('podcast.tabs.history'),
      icon: List,
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'debug' as const,
      label: 'Debug',
      icon: Bug,
      gradient: 'from-gray-600 to-gray-700'
    }
  ];

  // Dismiss welcome after first interaction
  useEffect(() => {
    if (selectedDocuments.length > 0 || currentPodcast) {
      setShowWelcome(false);
    }
  }, [selectedDocuments, currentPodcast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-pink-900/70" />
        
        {/* Floating orbs */}
        <motion.div
          animate={{ 
            x: [0, 200, -100, 0],
            y: [0, -150, 100, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.4, 0.8, 0.3, 0.4]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/30 to-blue-600/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -150, 200, 0],
            y: [0, 200, -100, 0],
            scale: [0.8, 1.3, 0.9, 0.8],
            opacity: [0.3, 0.6, 0.4, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-purple-400/25 to-pink-600/35 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [100, -100, 150, 100],
            y: [-50, 100, -80, -50],
            scale: [1.1, 0.7, 1.2, 1.1],
            opacity: [0.2, 0.5, 0.3, 0.2]
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/20 to-indigo-600/30 rounded-full blur-3xl"
        />
        
        {/* Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
              x: [Math.random() * 50, Math.random() * -50, Math.random() * 50],
              opacity: [0, 1, 0],
              scale: [0, Math.random() * 0.5 + 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        
        {/* Mesh gradient overlay */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Revolutionary Header */}
      <div className="relative z-40">
        {/* Header background with glass morphism */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-2xl border-b border-white/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo and branding */}
            <div className="flex items-center space-x-6">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                className="relative group"
              >
                {/* Multiple glowing layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 rounded-3xl shadow-2xl border border-white/20">
                  <Radio className="w-9 h-9 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
                </div>
              </motion.div>
              
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight"
                >
                  AI Podcast Studio
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-white/80 font-medium tracking-wide"
                >
                  Transform your {specialty} knowledge into engaging audio experiences
                </motion.p>
              </div>
            </div>

            {/* Revolutionary Tab Navigation with Debug Toggle */}
            <div className="relative flex items-center space-x-4">
              {/* Debug Toggle Button */}
              <motion.button
                onClick={() => setShowDebugTracker(!showDebugTracker)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative p-3 rounded-2xl font-bold text-sm transition-all duration-300 overflow-hidden
                  ${showDebugTracker || debugInfo
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/20'
                  }
                `}
                title={showDebugTracker ? "Hide Debug Tracker" : "Show Debug Tracker"}
              >
                <Bug className="w-5 h-5" />
                {debugInfo && !showDebugTracker && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full"
                  />
                )}
              </motion.button>

              {/* Test Debug Data Button */}
              <motion.button
                onClick={() => {
                  console.log('🧪 Test Debug Data clicked');
                  const testDebugData = {
                    step1_extraction: {
                      queries: ["Test query 1", "Test query 2"],
                      responses: [
                        {
                          query: "Test query 1",
                          content: "Test content for query 1",
                          medicalTerms: ["test", "medical", "terms"],
                          success: true,
                          timing: 1000
                        }
                      ],
                      totalSections: 2,
                      timing: 2000
                    },
                    step2_topics: {
                      rawContent: "Test raw content",
                      identifiedTopics: {
                        primaryCondition: "Test Condition",
                        secondaryConditions: ["Test Secondary"],
                        symptoms: ["Test Symptom"],
                        treatments: ["Test Treatment"],
                        diagnostics: ["Test Diagnostic"],
                        clinicalFindings: ["Test Finding"],
                        keyMedicalTerms: ["Test Term"]
                      },
                      timing: 1500,
                      success: true
                    },
                    step3_outline: {
                      inputTopics: {},
                      generatedOutline: {
                        title: "Test Outline",
                        chapters: [
                          {
                            title: "Test Chapter",
                            keyPoints: ["Test Point"],
                            medicalDetails: ["Test Detail"],
                            discussionPoints: ["Test Discussion"]
                          }
                        ]
                      },
                      timing: 2500,
                      success: true
                    },
                    step4_script: {
                      inputOutline: {},
                      finalScript: {
                        chapters: [
                          {
                            title: "Test Script Chapter",
                            segments: [
                              {
                                speaker: "host",
                                text: "Test script content"
                              }
                            ]
                          }
                        ]
                      },
                      timing: 3000,
                      success: true
                    },
                    validation: {
                      documentTopicMatch: true,
                      topicConsistency: true,
                      outlineCompleteness: true,
                      scriptQuality: true
                    }
                  };
                  setDebugInfo(testDebugData);
                  setShowDebugTracker(true);
                  console.log('🧪 Test debug data set:', testDebugData);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 rounded-2xl font-bold text-sm transition-all duration-300 overflow-hidden bg-green-500 text-white hover:bg-green-600"
                title="Load Test Debug Data"
              >
                🧪
              </motion.button>

              {/* Tab Navigation */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl" />
                
                <div className="relative flex items-center p-2 space-x-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group"
                    >
                      {/* Active background */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabBg"
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl shadow-lg"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      
                      {/* Hover glow */}
                      <motion.div
                        initial={false}
                        animate={{ opacity: isActive ? 0 : 0 }}
                        whileHover={{ opacity: isActive ? 0 : 0.5 }}
                        className="absolute inset-0 bg-white/20 rounded-2xl"
                      />
                      
                      <div className={`
                        relative flex items-center space-x-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300
                        ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}
                      `}>
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </div>
                    </motion.button>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'generate' ? (
            <motion.div
              key="generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              {/* Revolutionary Hero Section */}
              {showWelcome && !isGenerating && !currentPodcast && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center mb-20 relative"
                >
                  {/* Prismatic floating elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                      animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 360, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -left-32 top-16"
                    >
                      <div className="w-32 h-32 bg-gradient-to-br from-cyan-400/40 to-blue-600/50 rounded-[2rem] blur-2xl rotate-45" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        y: [0, 15, 0],
                        rotate: [0, -360, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -right-28 top-8"
                    >
                      <div className="w-40 h-40 bg-gradient-to-br from-purple-400/40 to-pink-600/50 rounded-[2.5rem] blur-3xl -rotate-12" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        y: [10, -10, 10],
                        x: [0, 20, 0],
                        rotate: [0, 180, 0]
                      }}
                      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-1/2 -top-16 transform -translate-x-1/2"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-violet-400/30 to-indigo-600/40 rounded-2xl blur-xl rotate-45" />
                    </motion.div>
                  </div>
                  
                  {/* Main Hero Icon with prismatic effect */}
                  <div className="relative mb-12">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 200 }}
                      className="relative inline-block"
                    >
                      {/* Multiple glowing layers */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-[3rem] blur-3xl opacity-60 scale-150" />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-[3rem] blur-2xl opacity-50 scale-125" />
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-blue-600 rounded-[3rem] blur-xl opacity-40 scale-110" />
                      
                      {/* Main icon container */}
                      <div className="relative w-40 h-40 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 rounded-[3rem] shadow-2xl flex items-center justify-center border border-white/20">
                        <Headphones className="w-20 h-20 text-white drop-shadow-lg" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 rounded-[3rem]" />
                        
                        {/* Prismatic edge highlights */}
                        <div className="absolute top-2 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
                        <div className="absolute bottom-2 left-2 right-2 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Typography with cinematic reveal */}
                  <motion.h2
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-6xl lg:text-7xl font-black mb-8 tracking-tight"
                  >
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Create Stunning
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                      AI Podcasts
                    </span>
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto mb-10 font-medium"
                  >
                    Transform your medical documents into captivating, professional podcasts 
                    with revolutionary AI technology and studio-quality natural voices.
                  </motion.p>

                  {/* Revolutionary Feature Pills */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex flex-wrap justify-center gap-4 mb-12"
                  >
                    {[
                      { icon: Brain, label: "Neural Analysis", gradient: "from-cyan-500 to-purple-600" },
                      { icon: AudioWaveform, label: "Studio Quality", gradient: "from-purple-500 to-pink-600" },
                      { icon: Zap, label: "Lightning Fast", gradient: "from-pink-500 to-orange-500" }
                    ].map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="group relative"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300`} />
                          <div className="relative flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                            <Icon className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">{feature.label}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  {/* Animated scroll indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex justify-center"
                  >
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="flex flex-col items-center space-y-2"
                    >
                      <span className="text-white/60 text-sm font-medium">Get Started</span>
                      <ChevronRight className="w-6 h-6 text-white/60 rotate-90" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* Revolutionary Generation Flow */}
              {!isGenerating && !currentPodcast ? (
                <div className="space-y-12">
                  {/* Revolutionary Step Indicators */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative mb-16"
                  >
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
                    
                    <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                      <div className="flex items-center justify-center space-x-8">
                        {[
                          { number: 1, label: "Select Documents", icon: FileText, active: selectedDocuments.length > 0 },
                          { number: 2, label: "Configure & Generate", icon: Settings, active: selectedDocuments.length > 0 },
                          { number: 3, label: "Listen & Share", icon: Headphones, active: false }
                        ].map((step, index) => {
                          const Icon = step.icon;
                          const isCompleted = step.active;
                          const isNext = index === 1 && selectedDocuments.length > 0;
                          
                          return (
                            <React.Fragment key={step.number}>
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="flex flex-col items-center space-y-3"
                              >
                                {/* Step circle with prismatic effect */}
                                <div className="relative">
                                  {(isCompleted || isNext) && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl blur-lg opacity-60 scale-125" />
                                  )}
                                  <div className={`
                                    relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500
                                    ${isCompleted || isNext
                                      ? 'bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-600 text-white shadow-xl border border-white/20'
                                      : 'bg-white/10 backdrop-blur-sm text-white/60 border border-white/20'
                                    }
                                  `}>
                                    <Icon className="w-7 h-7" />
                                  </div>
                                </div>
                                
                                {/* Step label */}
                                <div className="text-center">
                                  <div className={`text-sm font-bold transition-colors duration-300 ${
                                    isCompleted || isNext ? 'text-white' : 'text-white/60'
                                  }`}>
                                    {step.label}
                                  </div>
                                  <div className={`text-xs transition-colors duration-300 ${
                                    isCompleted ? 'text-cyan-400' : isNext ? 'text-purple-400' : 'text-white/40'
                                  }`}>
                                    Step {step.number}
                                  </div>
                                </div>
                              </motion.div>
                              
                              {/* Arrow connector */}
                              {index < 2 && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.4 + index * 0.1 }}
                                  className="flex items-center"
                                >
                                  <ChevronRight className={`w-6 h-6 transition-colors duration-300 ${
                                    isCompleted ? 'text-cyan-400' : 'text-white/40'
                                  }`} />
                                </motion.div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* Revolutionary Linear Content Layout */}
                  <div className="space-y-8 max-w-6xl mx-auto">
                    {/* Document Selection Card - Top Priority */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="relative group"
                    >
                      {/* Multiple glowing layers */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-purple-600/40 rounded-[2rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-600/30 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                      
                      {/* Main card with enhanced width */}
                      <div className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        {/* Prismatic edge highlights */}
                        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        
                        {/* Enhanced floating decorative elements */}
                        <div className="absolute top-6 right-6 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-xl" />
                        <div className="absolute bottom-6 left-6 w-40 h-40 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-2xl" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-pink-400/15 to-transparent rounded-full blur-xl" />
                        
                        <DocumentSelector
                          selectedDocuments={selectedDocuments}
                          onSelectionChange={setSelectedDocuments}
                          specialty={specialty}
                        />
                      </div>
                    </motion.div>

                    {/* Generation Settings Card - Secondary Priority */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      className="relative group"
                    >
                      {/* Multiple glowing layers */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-600/40 rounded-[2rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-orange-600/30 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                      
                      {/* Main card with enhanced width */}
                      <div className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        {/* Prismatic edge highlights */}
                        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        
                        {/* Enhanced floating decorative elements */}
                        <div className="absolute top-8 left-8 w-28 h-28 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-xl" />
                        <div className="absolute bottom-8 right-8 w-36 h-36 bg-gradient-to-tl from-pink-400/20 to-transparent rounded-full blur-2xl" />
                        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-orange-400/15 to-transparent rounded-full blur-lg" />
                        
                        <PodcastGenerator
                          selectedDocuments={selectedDocuments}
                          onGenerationStart={(podcastData) => {
                            setIsGenerating(true);
                            setCurrentPodcast(podcastData);
                            setShowWelcome(false);
                          }}
                          onQueueUpdate={setQueueStatus}
                          onGenerationComplete={(completedPodcast) => {
                            setIsGenerating(false);
                            setCurrentPodcast(completedPodcast);
                          }}
                          debugInfo={debugInfo}
                          setDebugInfo={setDebugInfo}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              ) : isGenerating ? (
                /* Premium Generation Progress */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex items-center justify-center py-16"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-3xl blur-2xl" />
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100/50 p-12 max-w-2xl">
                      <GenerationProgress
                        podcast={currentPodcast}
                        queueStatus={queueStatus}
                        onComplete={(completedPodcast) => {
                          setIsGenerating(false);
                          setCurrentPodcast(completedPodcast);
                        }}
                        onCancel={() => {
                          setIsGenerating(false);
                          setCurrentPodcast(null);
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Premium Completed Podcast View */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Success Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 p-8 text-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-50" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="relative z-10"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Podcast Generated Successfully!</h3>
                      <p className="text-gray-600">Your AI-powered podcast is ready to play</p>
                    </motion.div>
                  </motion.div>

                  {/* Player Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-3xl blur-xl" />
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden">
                      <PodcastPlayer
                        podcast={currentPodcast}
                        onNewGeneration={() => {
                          setCurrentPodcast(null);
                          setSelectedDocuments([]);
                          setShowWelcome(false);
                        }}
                      />
                    </div>
                  </motion.div>
                  
                  {/* Premium Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row justify-center items-center gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('history')}
                      className="group relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center space-x-3">
                        <List className="w-5 h-5" />
                        <span>View All Podcasts</span>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentPodcast(null);
                        setSelectedDocuments([]);
                        setShowWelcome(false);
                      }}
                      className="group relative px-8 py-4 rounded-2xl font-semibold overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl bg-white border-2 border-gray-200 hover:border-purple-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center space-x-3 text-gray-700">
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Another</span>
                      </div>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            activeTab === 'history' ? (
              /* Premium Podcast History */
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-3xl blur-3xl" />
                <div className="relative">
                  <PodcastHistory
                    specialty={specialty}
                    onPlayPodcast={(podcast) => {
                      setCurrentPodcast(podcast);
                      setActiveTab('generate');
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              /* Premium Debug Panel */
              <motion.div
                key="debug"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-600/5 to-gray-700/5 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-8">
                  <PodcastDebug />
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Premium Features Showcase */}
      {activeTab === 'generate' && !isGenerating && !currentPodcast && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative mt-24 mb-16"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center mb-16"
            >
              <h3 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Why Choose AI Podcast Studio?
                </span>
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the future of medical content creation with our advanced AI technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: 'Intelligent Content Analysis',
                  description: 'Advanced AI comprehends complex medical documents and creates coherent narratives',
                  gradient: 'from-purple-500 to-pink-500',
                  delay: 0.8
                },
                {
                  icon: Headphones,
                  title: 'Natural Voice Synthesis',
                  description: 'Professional medical experts voices with natural intonation and clarity',
                  gradient: 'from-blue-500 to-cyan-500',
                  delay: 0.9
                },
                {
                  icon: Zap,
                  title: 'Lightning Fast Generation',
                  description: 'Get your podcast ready in minutes, not hours or days',
                  gradient: 'from-green-500 to-emerald-500',
                  delay: 1.0
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: feature.delay }}
                    whileHover={{ y: -5 }}
                    className="group relative"
                  >
                    {/* Card Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg group-hover:shadow-2xl transition-all duration-300" />
                    
                    {/* Gradient Border */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative p-8">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="inline-block mb-6"
                      >
                        <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                      </motion.div>
                      
                      {/* Text */}
                      <h4 className="text-xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { label: 'AI Models', value: '3+', gradient: 'from-purple-600 to-pink-600' },
                { label: 'Voice Options', value: '2', gradient: 'from-blue-600 to-cyan-600' },
                { label: 'Generation Time', value: '<10min', gradient: 'from-green-600 to-emerald-600' },
                { label: 'Audio Quality', value: 'HD', gradient: 'from-orange-600 to-red-600' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}
      
      {/* Global Debug Tracker - Persistent Across All Tabs */}
      <DebugTracker 
        debugInfo={debugInfo}
        isVisible={showDebugTracker}
        onToggle={() => setShowDebugTracker(!showDebugTracker)}
      />
    </div>
  );
};

export default PodcastStudio;