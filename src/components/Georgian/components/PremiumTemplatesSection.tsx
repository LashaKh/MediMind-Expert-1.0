import React, { useState, useMemo, useCallback } from 'react';
import {
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Heart,
  Stethoscope,
  Activity,
  HeartHandshake,
  Zap,
  FileText
} from 'lucide-react';
import { MyTemplatesSection } from './MyTemplatesSection';

// Import template data from existing component
// import { QuickActionTemplates } from './QuickActionTemplates';

interface Template {
  id: string;
  category: string;
  title: string;
  instruction: string;
  description: string;
  icon: React.ElementType;
  color: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  isFeatured?: boolean;
  isSpecialDiagnosis?: boolean;
}

interface PremiumTemplatesSectionProps {
  onSelectTemplate: (instruction: string) => void;
  disabled?: boolean;
  hasTranscript: boolean;
  transcript: string;
  onAddToHistory?: (instruction: string, response: string, model: string, tokensUsed?: number, processingTime?: number) => void;
}

// Enhanced template data with featured flag - Cardiology Consults Only
const PREMIUM_TEMPLATES: Template[] = [
  // FEATURED - Cardiology Consults Section
  {
    id: 'diagnosis-heart-failure',
    category: 'Cardiologist Consults',
    title: 'Initial Diagnosis - (I50.0) გულის შეგუბებითი უკმარისობა',
    instruction: 'Generate a comprehensive Cardiologist Emergency Room consultation report for Heart Failure diagnosis (I50.0 - Congestive Heart Failure / გულის შეგუბებითი უკმარისობა). Include clinical summary, diagnostic assessment, treatment plan, risk stratification, and disposition recommendations based on this medical transcript.',
    description: 'ER Cardiologist consultation report for heart failure diagnosis with comprehensive clinical analysis',
    icon: HeartHandshake,
    color: 'from-[#2b6cb0] via-[#1a365d] to-[#2b6cb0]',
    priority: 'high',
    estimatedTime: '45s',
    isFeatured: true
  },
  {
    id: 'diagnosis-nstemi',
    category: 'Cardiologist Consults',
    title: 'Initial Diagnosis - (I24.9) გულის მწვავე იშემიური ავადმყოფობა, დაუზუსტებელი',
    instruction: 'Generate a comprehensive NSTEMI diagnosis report (I24.9 - Non-ST elevation myocardial infarction / გულის მწვავე იშემიური ავადმყოფობა, დაუზუსტებელი) including clinical presentation, diagnostic criteria, risk stratification, treatment protocol, and disposition recommendations based on this medical transcript.',
    description: 'Specialized NSTEMI diagnosis and management protocol with ICD-10 coding to I24.9 - გულის მწვავე იშემიური ავადმყოფობა, დაუზუსტებელი',
    icon: HeartHandshake,
    color: 'from-[#1a365d] via-[#2b6cb0] to-[#1a365d]',
    priority: 'high',
    estimatedTime: '45s',
    isFeatured: true,
    isSpecialDiagnosis: true
  },
  {
    id: 'diagnosis-pulmonary-embolism',
    category: 'Cardiologist Consults',
    title: 'Initial Diagnosis - (I26.0) ფილტვის არტერიის ემბოლია მწვავე ფილტვისმიერი გულის დროს',
    instruction: 'Generate a comprehensive pulmonary embolism diagnosis report (I26.0 - Pulmonary embolism with acute cor pulmonale / ფილტვის არტერიის ემბოლია მწვავე ფილტვისმიერი გულის დროს) including clinical presentation, diagnostic criteria, severity assessment, treatment protocol, and disposition recommendations based on this medical transcript.',
    description: 'Specialized pulmonary embolism diagnosis with acute cor pulmonale assessment',
    icon: HeartHandshake,
    color: 'from-[#2b6cb0] via-[#1a365d] to-[#2b6cb0]',
    priority: 'high',
    estimatedTime: '45s',
    isFeatured: true,
    isSpecialDiagnosis: true
  },
  {
    id: 'diagnosis-stemi',
    category: 'Cardiologist Consults',
    title: 'Initial Diagnosis - (I21.0) ST ელევაციური მიოკარდიუმის ინფარქტი',
    instruction: 'Generate a comprehensive STEMI diagnosis report (I21.0 - ST elevation myocardial infarction / ST ელევაციური მიოკარდიუმის ინფარქტი) including clinical presentation, diagnostic criteria, ECG findings, emergency intervention protocols, treatment plan, and disposition recommendations based on this medical transcript.',
    description: 'Emergency STEMI diagnosis and management protocol with rapid intervention guidelines',
    icon: HeartHandshake,
    color: 'from-[#dc2626] via-[#991b1b] to-[#dc2626]',
    priority: 'high',
    estimatedTime: '45s',
    isFeatured: true,
    isSpecialDiagnosis: true
  }
];

const getCategoryIcon = (category: string): React.ElementType => {
  switch (category) {
    case 'Cardiologist Consults': return HeartHandshake;
    default: return Activity;
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Cardiologist Consults': return 'from-[#2b6cb0] to-[#1a365d]';
    default: return 'from-[#63b3ed] to-[#90cdf4]';
  }
};

export const PremiumTemplatesSection: React.FC<PremiumTemplatesSectionProps> = ({
  onSelectTemplate,
  disabled = false,
  hasTranscript,
  transcript,
  onAddToHistory
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Cardiologist Consults']) // Cardiology consults expanded by default
  );

  // Separate featured and regular templates
  const { featuredTemplates, categorizedTemplates } = useMemo(() => {
    const featured = PREMIUM_TEMPLATES.filter(t => t.isFeatured);
    
    const regular = PREMIUM_TEMPLATES.filter(t => !t.isFeatured);
    const categories = Array.from(new Set(regular.map(t => t.category)));
    
    const categorized = categories.reduce((acc, category) => {
      acc[category] = regular
        .filter(t => t.category === category)
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      return acc;
    }, {} as Record<string, Template[]>);
    
    return { featuredTemplates: featured, categorizedTemplates: categorized };
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const [processingCards, setProcessingCards] = useState<Set<string>>(new Set());

  const handleTemplateSelect = useCallback((template: Template) => {
    if (!disabled && !processingCards.has(template.id) && hasTranscript) {
      // Add brief visual feedback before triggering processing
      setProcessingCards(prev => new Set(prev).add(template.id));
      
      // Immediately call the template selection (no delay)
      onSelectTemplate(template.instruction);
      
      // Clear the card processing state after a brief moment
      setTimeout(() => {
        setProcessingCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(template.id);
          return newSet;
        });
      }, 500);
    }
  }, [onSelectTemplate, disabled, processingCards, hasTranscript]);

  // Show empty state message when no transcript, but still show templates below
  const showEmptyMessage = !hasTranscript;


  return (
    <div className="space-y-6">
      {/* My Templates Section - User's Custom Templates */}
      <MyTemplatesSection
        onSelectTemplate={onSelectTemplate}
        disabled={disabled} // Template creation is always enabled, only usage might be disabled
        hasTranscript={hasTranscript}
        transcript={transcript}
        onAddToHistory={onAddToHistory}
      />
      
      {/* Empty State Message */}
      {showEmptyMessage && (
        <div className="flex flex-col items-center justify-center py-8 px-6 text-center bg-gradient-to-br from-[#90cdf4]/10 to-[#63b3ed]/5 dark:from-[#1a365d]/20 dark:to-[#2b6cb0]/10 rounded-2xl border border-[#63b3ed]/20 dark:border-[#2b6cb0]/30">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#90cdf4]/30 via-[#63b3ed]/20 to-[#90cdf4]/30 dark:from-[#1a365d]/60 dark:via-[#2b6cb0]/40 dark:to-[#1a365d]/60 rounded-2xl flex items-center justify-center shadow-lg">
              <Stethoscope className="w-8 h-8 text-[#2b6cb0] dark:text-[#63b3ed]" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#63b3ed] to-[#2b6cb0] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="max-w-sm">
            <h3 className="text-lg font-bold bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#1a365d] dark:from-[#90cdf4] dark:via-[#63b3ed] dark:to-[#90cdf4] bg-clip-text text-transparent mb-3">
              Premium Medical Templates
            </h3>
            <p className="text-[#2b6cb0] dark:text-[#63b3ed] leading-relaxed text-sm mb-4">
              Start recording, upload an audio file, or attach medical documents to activate these professional medical analysis templates.
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-[#1a365d] dark:text-[#90cdf4]">
              <Heart className="w-3 h-3" />
              <span>Specialized for Cardiology Practice</span>
            </div>
          </div>
        </div>
      )}
      

      {/* Featured Cardiology Section - Always Show for Testing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-xl flex items-center justify-center shadow-lg">
              <HeartHandshake className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
              Cardiologist Consults
            </h3>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
            <Star className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">FEATURED</span>
          </div>
        </div>

          {/* Featured Templates Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <div
                  key={template.id}
                  className={`group relative bg-gradient-to-br ${template.color} rounded-2xl p-6 shadow-lg transition-all duration-300 min-h-[180px] flex flex-col justify-between ${
                    disabled || !hasTranscript ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Subtle Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none rounded-2xl" />
                  
                  {/* Standardized Content Layout */}
                  <div className="relative text-white flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {template.isSpecialDiagnosis && (
                            <div className="flex items-center space-x-1 text-xs font-semibold bg-white/25 backdrop-blur-sm rounded-md px-2 py-0.5">
                              <Sparkles className="w-3 h-3" />
                              <span>AI DIAGNOSIS</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 text-xs font-medium bg-white/15 backdrop-blur-sm rounded-md px-2 py-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{template.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-lg leading-tight mb-2 line-clamp-2 text-white">
                        {template.title}
                      </h4>
                    </div>
                    
                    <p className="text-white/85 text-sm leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  
                  {/* Disabled State Overlay */}
                  {!hasTranscript && (
                    <div className="absolute inset-0 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white/70" />
                        </div>
                        <span className="text-xs text-white/80 font-medium">Needs Content</span>
                      </div>
                    </div>
                  )}

                  {/* Processing Indicator for Special Diagnosis Cards */}
                  {processingCards.has(template.id) && template.isSpecialDiagnosis && (
                    <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-xs text-white/90 font-medium">Initiating...</span>
                      </div>
                    </div>
                  )}

                  {/* Simplified Hover Action */}
                  <div className={`absolute bottom-3 right-3 w-6 h-6 bg-white/15 backdrop-blur-sm rounded-md flex items-center justify-center transition-all duration-200 ${
                    processingCards.has(template.id) ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Other Categories */}
      <div className="space-y-3">
        {Object.entries(categorizedTemplates).map(([category, templates]) => {
          if (templates.length === 0) return null;
          
          const isExpanded = expandedCategories.has(category);
          const CategoryIcon = getCategoryIcon(category);
          const categoryColor = getCategoryColor(category);

          return (
            <div
              key={category}
              className="bg-white dark:bg-gray-800 rounded-xl border border-blue-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${categoryColor} rounded-lg flex items-center justify-center shadow-sm`}>
                    <CategoryIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200">
                      {category}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {templates.length} template{templates.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {templates.filter(t => t.priority === 'high').length > 0 && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                    {templates.filter(t => t.priority === 'medium').length > 0 && (
                      <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    )}
                  </div>
                  
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-blue-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="border-t border-blue-200/50 dark:border-slate-700/50 bg-blue-50/30 dark:bg-slate-800/30">
                  <div className="p-4 space-y-2">
                    {templates.map((template) => {
                      const IconComponent = template.icon;
                      const priorityColors = {
                        high: 'border-blue-200 dark:border-slate-600 bg-blue-50 dark:bg-slate-800',
                        medium: 'border-blue-150 dark:border-slate-650 bg-blue-25 dark:bg-slate-825',
                        low: 'border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-850'
                      };

                      return (
                        <div
                          key={template.id}
                          className={`group flex items-center justify-between p-3 rounded-lg border ${priorityColors[template.priority]} transition-all duration-200 ${
                            disabled || !hasTranscript ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
                          }`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 bg-gradient-to-br ${template.color} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-slate-700 dark:text-slate-200 truncate">
                                {template.title}
                              </h5>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                                {template.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                            <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{template.estimatedTime}</span>
                            </div>
                            
                            <div className="w-6 h-6 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};