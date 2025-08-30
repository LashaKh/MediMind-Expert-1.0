import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Calculator, 
  BookOpen, 
  TestTube2, 
  Newspaper,
  Database,
  FileText,
  X,
  Clock,
  Users,
  CheckCircle2,
  Star,
  ChevronRight,
  Sparkles,
  Award,
  Target,
  PlayCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TourSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType;
  stepCount: number;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryColor: string;
  secondaryColor: string;
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
  completedAt?: string | null;
}

interface TourSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onTourSelect: (tourId: string) => void;
}

const tourSections: TourSection[] = [
  {
    id: 'ai-copilot',
    title: 'AI Medical Co-Pilot',
    subtitle: 'Master Intelligent Medical Assistance',
    description: 'Comprehensive tour of our advanced AI system. Learn to upload medical files, analyze patient data, create cases, and leverage AI for clinical decision support.',
    icon: MessageSquare,
    stepCount: 15,
    duration: '8-10 min',
    difficulty: 'Beginner',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    features: ['File Upload & Analysis', 'Medical Image Processing', 'Case Management', 'AI Citations', 'Calculator Integration'],
    isPopular: true,
    completedAt: null
  },
  {
    id: 'calculators',
    title: 'Medical Calculators',
    subtitle: 'Clinical Decision Support Tools',
    description: 'Deep dive into our 16+ validated cardiac calculators. Master ASCVD, GRACE, HCM Risk, and more with AI-powered insights and clinical interpretations.',
    icon: Calculator,
    stepCount: 12,
    duration: '6-8 min',
    difficulty: 'Intermediate',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    features: ['Calculator Categories', 'Result Interpretation', 'AI Integration', 'Clinical Guidelines', 'Validation Process'],
    completedAt: null
  },
  {
    id: 'knowledge-base',
    title: 'Complete Knowledge Base',
    subtitle: 'Curated Literature & Personal Documents',
    description: 'Master both our curated medical literature AND your personal document system. Navigate between both knowledge bases to understand the complete AI-powered medical intelligence platform.',
    icon: BookOpen,
    stepCount: 8,
    duration: '6-8 min',
    difficulty: 'Intermediate',
    primaryColor: '#3b82f6',
    secondaryColor: '#6366f1',
    features: ['Curated Literature', 'Personal Documents', 'AI Integration', 'Cross-System Search', 'Unified Citations'],
    completedAt: null
  },
  {
    id: 'abg-analysis',
    title: 'Blood Gas Analysis',
    subtitle: 'AI-Powered ABG Intelligence',
    description: 'Master our advanced blood gas analysis engine. Learn AI interpretation, action plans, and comprehensive workflow management for arterial blood gases.',
    icon: TestTube2,
    stepCount: 8,
    duration: '4-6 min',
    difficulty: 'Advanced',
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    features: ['ABG Input Methods', 'AI Interpretation', 'Clinical Insights', 'Action Plans', 'Results History'],
    isNew: true,
    completedAt: null
  },
  {
    id: 'medical-news',
    title: 'Medical News Hub',
    subtitle: 'Stay Updated with AI Curation',
    description: 'Explore our intelligent medical news platform. Learn about AI curation, personalized alerts, reading progress tracking, and professional sharing.',
    icon: Newspaper,
    stepCount: 6,
    duration: '3-5 min',
    difficulty: 'Beginner',
    primaryColor: '#7c3aed',
    secondaryColor: '#8b5cf6',
    features: ['News Curation', 'Personalization', 'Save & Share', 'Reading Progress', 'Professional Templates'],
    completedAt: null
  },
  {
    id: 'disease-guidelines',
    title: 'Disease Guidelines',
    subtitle: 'Medical Knowledge & Clinical Pathways',
    description: 'Explore our comprehensive medical knowledge base with evidence-based disease guidelines, clinical pathways, and treatment protocols for healthcare professionals.',
    icon: FileText,
    stepCount: 7,
    duration: '4-6 min',
    difficulty: 'Intermediate',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    features: ['Evidence-Based Guidelines', 'Clinical Pathways', 'Disease Categories', 'Severity Classification', 'Medical References'],
    completedAt: null
  }
];

export const TourSelector: React.FC<TourSelectorProps> = ({
  isOpen,
  onClose,
  onTourSelect
}) => {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());

  // Load completed tours from localStorage
  useEffect(() => {
    const completed = new Set<string>();
    tourSections.forEach(section => {
      const isCompleted = localStorage.getItem(`premium-tour-completed-${section.id}`);
      if (isCompleted) {
        completed.add(section.id);
      }
    });
    setCompletedTours(completed);
  }, []);

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  const handleStartTour = (sectionId: string) => {

    console.log('🎯 TourSelector: Calling onTourSelect callback only (NOT closing)');
    onTourSelect(sectionId);
    // DON'T call onClose() here - that closes the entire tour system!
    // The PremiumTour component will handle closing the selector via setShowSelector(false)

  };

  const handleTakeFullTour = () => {
    onTourSelect('full');
    // Don't call onClose() - let PremiumTour handle the selector closure
  };

  const totalCompleted = completedTours.size;
  const completionPercentage = Math.round((totalCompleted / tourSections.length) * 100);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 text-white">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              aria-label="Close tour selector"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">{t('tour.selector.title', { defaultValue: 'Choose Your Learning Path' })}</h2>
                <p className="text-blue-100">{t('tour.selector.subtitle', { defaultValue: 'Select a feature to explore in detail with our premium guided tours' })}</p>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">{t('tour.selector.progress', { percent: completionPercentage, defaultValue: 'Progress: {{percent}}%' })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t('tour.selector.completed', { done: totalCompleted, total: tourSections.length, defaultValue: '{{done}} of {{total}} completed' })}</span>
                </div>
              </div>
              <button
                onClick={handleTakeFullTour}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors duration-200"
              >
                <PlayCircle className="w-4 h-4" />
                <span className="font-medium">{t('tour.selector.takeFullTour', { defaultValue: 'Take Full Tour' })}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tourSections.map((section, index) => {
                const isCompleted = completedTours.has(section.id);
                const isSelected = selectedSection === section.id;
                
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      relative group cursor-pointer rounded-2xl border-2 transition-all duration-300
                      ${isSelected 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/25 scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-lg'
                      }
                      ${isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'}
                    `}
                    onClick={() => handleSectionSelect(section.id)}
                  >
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      {section.isPopular && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                          {t('tour.selector.popular', { defaultValue: 'Popular' })}
                        </span>
                      )}
                      {section.isNew && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          {t('tour.selector.new', { defaultValue: 'New' })}
                        </span>
                      )}
                      {isCompleted && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {/* Icon and Title */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${section.primaryColor}, ${section.secondaryColor})`
                          }}
                        >
                          <section.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {t(`tour.cards.${section.id}.title`, { defaultValue: section.title })}
                          </h3>
                          <p className="text-sm font-medium" style={{ color: section.primaryColor }}>
                            {t(`tour.cards.${section.id}.subtitle`, { defaultValue: section.subtitle })}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                        {t(`tour.cards.${section.id}.description`, { defaultValue: section.description })}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Target className="w-3 h-3" />
                            <span>{section.stepCount} {t('tour.selector.steps', { defaultValue: 'steps' })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{t(`tour.cards.${section.id}.duration`, { defaultValue: section.duration })}</span>
                          </div>
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${section.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                            ${section.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                            ${section.difficulty === 'Advanced' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                          `}>
                            {t(`tour.common.${section.difficulty.toLowerCase()}`, { defaultValue: section.difficulty })}
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {section.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            <span>{t(`tour.cards.${section.id}.features.${idx}`, { defaultValue: feature })}</span>
                          </div>
                        ))}
                        {section.features.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            +{section.features.length - 3} {t('tour.selector.moreFeatures', { defaultValue: 'more features' })}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartTour(section.id);
                        }}
                        className={`
                          w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2
                          ${isCompleted 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                            : 'text-white hover:shadow-lg transform hover:scale-105'
                          }
                        `}
                        style={!isCompleted ? {
                          background: `linear-gradient(135deg, ${section.primaryColor}, ${section.secondaryColor})`
                        } : {}}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t('tour.selector.retakeTour', { defaultValue: 'Retake Tour' })}</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4" />
                            <span>{t('tour.selector.startTour', { defaultValue: 'Start Tour' })}</span>
                          </>
                        )}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Achievement Section */}
            {totalCompleted > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t('tour.selector.greatProgress', { defaultValue: 'Great Progress! 🎉' })}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('tour.selector.completedCount', { count: totalCompleted, defaultValue: "You've completed {{count}} tours." })}
                      {' '}
                      {totalCompleted === tourSections.length
                        ? t('tour.selector.youAreExpert', { defaultValue: "You're a MediMind Expert!" })
                        : t('tour.selector.moreToGo', { remaining: tourSections.length - totalCompleted, defaultValue: '{{remaining}} more to go!' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};