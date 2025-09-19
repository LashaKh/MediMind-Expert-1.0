import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Heart,
  Stethoscope,
  Activity,
  Shield,
  User,
  FileText,
  HeartHandshake,
  AlertTriangle,
  Zap
} from 'lucide-react';

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
}

// Enhanced template data with featured flag
const PREMIUM_TEMPLATES: Template[] = [
  // FEATURED - Cardiology Consults Section
  {
    id: 'diagnosis-heart-failure',
    category: 'Cardiologist Consults',
    title: 'Diagnosis - (I50.0) გულის შეგუბებითი უკმარისობა',
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
    title: 'Diagnosis - I24.9 NSTEMI (გულის მწვავე იშემიური ავადმყოფობა)',
    instruction: 'Generate a comprehensive NSTEMI diagnosis report (I24.9 - Non-ST elevation myocardial infarction / გულის მწვავე იშემიური ავადმყოფობა, დაუზუსტებელი) including clinical presentation, diagnostic criteria, risk stratification, treatment protocol, and disposition recommendations based on this medical transcript.',
    description: 'Specialized NSTEMI diagnosis and management protocol with ICD-10 coding',
    icon: HeartHandshake,
    color: 'from-[#1a365d] via-[#2b6cb0] to-[#1a365d]',
    priority: 'high',
    estimatedTime: '45s',
    isFeatured: true,
    isSpecialDiagnosis: true
  },

  // Clinical Assessment Category
  {
    id: 'clinical-summary',
    category: 'Clinical Assessment',
    title: 'Clinical Summary',
    instruction: 'Create a comprehensive clinical summary of this medical consultation including chief complaint, history of present illness, assessment, and plan (SOAP format)',
    description: 'Structured clinical summary in SOAP format',
    icon: Stethoscope,
    color: 'from-[#63b3ed] to-[#2b6cb0]',
    priority: 'high',
    estimatedTime: '30s'
  },
  {
    id: 'symptom-extraction',
    category: 'Clinical Assessment',
    title: 'Symptoms & Signs',
    instruction: 'Extract and categorize all symptoms, signs, and clinical findings mentioned in this consultation, organized by body system',
    description: 'Systematic symptom and sign extraction',
    icon: Activity,
    color: 'from-[#90cdf4] to-[#63b3ed]',
    priority: 'high',
    estimatedTime: '25s'
  },
  {
    id: 'diagnosis-assessment',
    category: 'Clinical Assessment',
    title: 'Diagnosis & DDx',
    instruction: 'Identify primary and differential diagnoses discussed, including ICD-10 codes where applicable and clinical reasoning',
    description: 'Diagnosis identification with differential',
    icon: Zap,
    color: 'from-[#1a365d] to-[#63b3ed]',
    priority: 'high',
    estimatedTime: '35s'
  },

  // Medication Management Category
  {
    id: 'medication-review',
    category: 'Medication Management',
    title: 'Medication Review',
    instruction: 'Extract all medications mentioned including drug names, dosages, frequencies, routes of administration, and any drug interactions or side effects discussed',
    description: 'Complete medication analysis with interactions',
    icon: Shield,
    color: 'from-[#2b6cb0] to-[#1a365d]',
    priority: 'high',
    estimatedTime: '40s'
  },

  // Patient Management Category
  {
    id: 'risk-assessment',
    category: 'Patient Management',
    title: 'Risk Assessment',
    instruction: 'Identify and assess clinical risk factors, safety concerns, red flags, and urgent issues that require immediate attention',
    description: 'Clinical risk and safety evaluation',
    icon: AlertTriangle,
    color: 'from-[#63b3ed] to-[#90cdf4]',
    priority: 'high',
    estimatedTime: '40s'
  },
  {
    id: 'patient-history',
    category: 'Patient Management',
    title: 'Patient Demographics',
    instruction: 'Extract patient demographics, past medical history, family history, social history, and allergies mentioned in the consultation',
    description: 'Comprehensive patient background',
    icon: User,
    color: 'from-[#90cdf4] to-[#2b6cb0]',
    priority: 'medium',
    estimatedTime: '30s'
  },

  // Documentation Category
  {
    id: 'follow-up-plan',
    category: 'Documentation',
    title: 'Follow-up Instructions',
    instruction: 'Extract follow-up appointments, monitoring requirements, when to return if symptoms worsen, and patient education provided',
    description: 'Patient follow-up and education summary',
    icon: FileText,
    color: 'from-[#2b6cb0] to-[#90cdf4]',
    priority: 'low',
    estimatedTime: '20s'
  }
];

const getCategoryIcon = (category: string): React.ElementType => {
  switch (category) {
    case 'Cardiologist Consults': return HeartHandshake;
    case 'Clinical Assessment': return Stethoscope;
    case 'Medication Management': return Shield;
    case 'Patient Management': return User;
    case 'Documentation': return FileText;
    default: return Activity;
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Cardiologist Consults': return 'from-[#2b6cb0] to-[#1a365d]';
    case 'Clinical Assessment': return 'from-[#63b3ed] to-[#2b6cb0]';
    case 'Medication Management': return 'from-[#90cdf4] to-[#63b3ed]';
    case 'Patient Management': return 'from-[#1a365d] to-[#90cdf4]';
    case 'Documentation': return 'from-[#2b6cb0] to-[#90cdf4]';
    default: return 'from-[#63b3ed] to-[#90cdf4]';
  }
};

export const PremiumTemplatesSection: React.FC<PremiumTemplatesSectionProps> = ({
  onSelectTemplate,
  disabled = false,
  hasTranscript
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Cardiologist Consults']) // Cardiology consults expanded by default
  );
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Separate featured and regular templates
  const { featuredTemplates, categorizedTemplates } = useMemo(() => {
    const featured = PREMIUM_TEMPLATES.filter(t => t.isFeatured);
    
    const regular = PREMIUM_TEMPLATES.filter(t => !t.isFeatured);
    const categories = Array.from(new Set(regular.map(t => t.category)));
    
    const categorized = categories.reduce((acc, category) => {
      acc[category] = regular
        .filter(t => t.category === category)
        .filter(t => {
          const matchesSearch = searchQuery === '' || 
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
          return matchesSearch && matchesPriority;
        })
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      return acc;
    }, {} as Record<string, Template[]>);
    
    return { featuredTemplates: featured, categorizedTemplates: categorized };
  }, [searchQuery, priorityFilter]);

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
    if (!disabled && !processingCards.has(template.id)) {
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
  }, [onSelectTemplate, disabled, processingCards]);

  if (!hasTranscript) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#90cdf4]/30 via-[#63b3ed]/20 to-[#90cdf4]/30 dark:from-[#1a365d]/60 dark:via-[#2b6cb0]/40 dark:to-[#1a365d]/60 rounded-3xl flex items-center justify-center shadow-xl">
            <Stethoscope className="w-10 h-10 text-[#2b6cb0] dark:text-[#63b3ed]" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-[#63b3ed] to-[#2b6cb0] rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="max-w-md">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#1a365d] dark:from-[#90cdf4] dark:via-[#63b3ed] dark:to-[#90cdf4] bg-clip-text text-transparent mb-4">
            Premium Medical Templates
          </h3>
          <p className="text-[#2b6cb0] dark:text-[#63b3ed] leading-relaxed mb-6">
            Start recording or upload an audio file to access our comprehensive suite of medical analysis templates designed for healthcare professionals.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-[#1a365d] dark:text-[#90cdf4]">
            <Heart className="w-4 h-4" />
            <span>Specialized for Cardiology Practice</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#63b3ed] dark:text-[#63b3ed]" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 rounded-xl text-sm placeholder-[#2b6cb0]/60 dark:placeholder-[#63b3ed]/60 focus:outline-none focus:ring-2 focus:ring-[#2b6cb0] focus:border-transparent transition-all duration-200 text-[#1a365d] dark:text-[#90cdf4]"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              showFilters 
                ? 'bg-[#90cdf4]/30 text-[#1a365d] dark:bg-[#2b6cb0]/30 dark:text-[#90cdf4]' 
                : 'bg-[#90cdf4]/10 text-[#2b6cb0] dark:bg-[#1a365d]/30 dark:text-[#63b3ed] hover:bg-[#63b3ed]/20 dark:hover:bg-[#2b6cb0]/30'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#1a365d] dark:text-[#90cdf4]">Priority Level</h4>
            <button
              onClick={() => setPriorityFilter('all')}
              className="text-xs text-[#2b6cb0] dark:text-[#63b3ed] hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  priorityFilter === priority
                    ? 'bg-[#90cdf4]/30 text-[#1a365d] dark:bg-[#2b6cb0]/30 dark:text-[#90cdf4]'
                    : 'bg-[#90cdf4]/10 text-[#2b6cb0] dark:bg-[#1a365d]/30 dark:text-[#63b3ed] hover:bg-[#63b3ed]/20 dark:hover:bg-[#2b6cb0]/20'
                }`}
              >
                {priority === 'all' ? 'All Priorities' : `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Cardiology Section */}
      {featuredTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#2b6cb0] to-[#1a365d] rounded-xl flex items-center justify-center shadow-lg">
                <HeartHandshake className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1a365d] dark:text-[#90cdf4]">
                Cardiologist Consults
              </h3>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-[#90cdf4]/30 to-[#63b3ed]/30 dark:from-[#1a365d]/30 dark:to-[#2b6cb0]/30 rounded-lg">
              <Star className="w-3 h-3 text-[#2b6cb0] dark:text-[#90cdf4]" />
              <span className="text-xs font-semibold text-[#1a365d] dark:text-[#63b3ed]">FEATURED</span>
            </div>
          </div>

          {/* Featured Templates Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <div
                  key={template.id}
                  className={`group relative bg-gradient-to-br ${template.color} rounded-2xl p-6 shadow-lg hover:shadow-2xl premium-shimmer scale-hover premium-transition cursor-pointer stagger-item ${
                    template.isSpecialDiagnosis ? 'diagnosis-pulse' : template.priority === 'high' ? 'medical-pulse-high' : ''
                  } ${template.isSpecialDiagnosis ? 'transform hover:scale-105' : ''} ${
                    processingCards.has(template.id) ? 'diagnosis-processing' : ''
                  } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Premium Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700 pointer-events-none rounded-2xl" />
                  
                  {/* Content */}
                  <div className="relative text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {template.isSpecialDiagnosis && (
                          <div className="flex items-center space-x-1 text-xs font-bold bg-white/30 backdrop-blur-sm rounded-lg px-2 py-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI DIAGNOSIS</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                          <Clock className="w-3 h-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-lg leading-tight mb-2">
                      {template.title}
                    </h4>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                  
                  {/* Processing Indicator for Special Diagnosis Cards */}
                  {processingCards.has(template.id) && template.isSpecialDiagnosis && (
                    <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-xs text-white/90 font-medium">Initiating...</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Action */}
                  <div className={`absolute bottom-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-300 transform ${
                    processingCards.has(template.id) ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                  }`}>
                    {template.isSpecialDiagnosis ? (
                      <Sparkles className="w-4 h-4 text-white" />
                    ) : (
                      <Zap className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              className="bg-white dark:bg-gray-800 rounded-xl border border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#90cdf4]/10 dark:hover:bg-[#1a365d]/30 premium-transition premium-focus"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${categoryColor} rounded-lg flex items-center justify-center shadow-sm`}>
                    <CategoryIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-[#1a365d] dark:text-[#90cdf4]">
                      {category}
                    </h4>
                    <p className="text-xs text-[#2b6cb0] dark:text-[#63b3ed]">
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
                    <ChevronUp className="w-4 h-4 text-[#63b3ed]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#63b3ed]" />
                  )}
                </div>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="border-t border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 bg-[#90cdf4]/10 dark:bg-[#1a365d]/30 accordion-content accordion-expand">
                  <div className="p-4 space-y-2">
                    {templates.map((template) => {
                      const IconComponent = template.icon;
                      const priorityColors = {
                        high: 'border-[#63b3ed]/50 dark:border-[#2b6cb0]/50 bg-[#90cdf4]/20 dark:bg-[#1a365d]/20',
                        medium: 'border-[#90cdf4]/50 dark:border-[#63b3ed]/50 bg-[#90cdf4]/10 dark:bg-[#2b6cb0]/10',
                        low: 'border-[#90cdf4]/30 dark:border-[#63b3ed]/30 bg-white dark:bg-[#1a365d]/10'
                      };

                      return (
                        <div
                          key={template.id}
                          className={`group flex items-center justify-between p-3 rounded-lg border ${priorityColors[template.priority]} hover:shadow-md premium-transition cursor-pointer scale-hover premium-focus stagger-item ${
                            disabled ? 'opacity-50 pointer-events-none' : ''
                          }`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 bg-gradient-to-br ${template.color} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-[#1a365d] dark:text-[#90cdf4] truncate">
                                {template.title}
                              </h5>
                              <p className="text-xs text-[#2b6cb0] dark:text-[#63b3ed] line-clamp-1">
                                {template.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                            <div className="flex items-center space-x-1 text-xs text-[#2b6cb0]/60 dark:text-[#63b3ed]/60">
                              <Clock className="w-3 h-3" />
                              <span>{template.estimatedTime}</span>
                            </div>
                            
                            <div className="w-6 h-6 bg-[#90cdf4]/20 dark:bg-[#1a365d]/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Zap className="w-3 h-3 text-[#2b6cb0] dark:text-[#63b3ed]" />
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

      {/* No Results State */}
      {Object.values(categorizedTemplates).every(templates => templates.length === 0) && searchQuery && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#90cdf4]/20 dark:bg-[#1a365d]/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[#63b3ed]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1a365d] dark:text-[#90cdf4] mb-2">
            No templates found
          </h3>
          <p className="text-sm text-[#2b6cb0] dark:text-[#63b3ed] mb-4">
            Try adjusting your search terms or filters
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-[#2b6cb0] dark:text-[#63b3ed] hover:underline text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};