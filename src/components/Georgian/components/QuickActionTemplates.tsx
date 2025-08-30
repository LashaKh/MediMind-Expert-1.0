import React, { useState } from 'react';
import {
  Stethoscope,
  Shield,
  FileText,
  Activity,
  User,
  Heart,
  Pill,
  AlertTriangle,
  Clock,
  Search,
  TrendingUp,
  BookOpen,
  Microscope,
  Brain,
  Zap,
  Target,
  CheckSquare,
  Calendar,
  FileCheck
} from 'lucide-react';
import { MedicalButton } from '../../ui/MedicalDesignSystem';

interface QuickActionTemplate {
  id: string;
  category: string;
  title: string;
  instruction: string;
  description: string;
  icon: React.ElementType;
  color: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

interface QuickActionTemplatesProps {
  onSelectTemplate: (instruction: string) => void;
  disabled?: boolean;
  hasTranscript: boolean;
}

const MEDICAL_TEMPLATES: QuickActionTemplate[] = [
  // High Priority - Clinical Assessment
  {
    id: 'clinical-summary',
    category: 'Clinical Assessment',
    title: 'Clinical Summary',
    instruction: 'Create a comprehensive clinical summary of this medical consultation including chief complaint, history of present illness, assessment, and plan (SOAP format)',
    description: 'Structured clinical summary in SOAP format',
    icon: Stethoscope,
    color: 'from-red-500 to-pink-600',
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
    color: 'from-orange-500 to-red-600',
    priority: 'high',
    estimatedTime: '25s'
  },
  {
    id: 'diagnosis-assessment',
    category: 'Clinical Assessment',
    title: 'Diagnosis & DDx',
    instruction: 'Identify primary and differential diagnoses discussed, including ICD-10 codes where applicable and clinical reasoning',
    description: 'Diagnosis identification with differential',
    icon: Target,
    color: 'from-purple-500 to-indigo-600',
    priority: 'high',
    estimatedTime: '35s'
  },

  // High Priority - Medication Management
  {
    id: 'medication-review',
    category: 'Medication Management',
    title: 'Medication Review',
    instruction: 'Extract all medications mentioned including drug names, dosages, frequencies, routes of administration, and any drug interactions or side effects discussed',
    description: 'Complete medication analysis with interactions',
    icon: Pill,
    color: 'from-blue-500 to-indigo-600',
    priority: 'high',
    estimatedTime: '40s'
  },
  {
    id: 'prescription-analysis',
    category: 'Medication Management',
    title: 'Prescription Analysis',
    instruction: 'Analyze prescription changes, new medications started, discontinued medications, and dosage adjustments with clinical rationale',
    description: 'Track prescription changes and rationale',
    icon: FileCheck,
    color: 'from-cyan-500 to-blue-600',
    priority: 'medium',
    estimatedTime: '30s'
  },

  // Medium Priority - Treatment Planning
  {
    id: 'treatment-plan',
    category: 'Treatment Planning',
    title: 'Treatment Plan',
    instruction: 'Summarize the treatment plan including immediate interventions, follow-up care, referrals, and patient instructions',
    description: 'Comprehensive treatment planning summary',
    icon: CheckSquare,
    color: 'from-green-500 to-emerald-600',
    priority: 'medium',
    estimatedTime: '35s'
  },
  {
    id: 'procedure-summary',
    category: 'Treatment Planning',
    title: 'Procedures & Tests',
    instruction: 'List all medical procedures, diagnostic tests, and laboratory investigations mentioned, including indications and results if available',
    description: 'Track procedures and diagnostic tests',
    icon: Microscope,
    color: 'from-teal-500 to-green-600',
    priority: 'medium',
    estimatedTime: '25s'
  },

  // Medium Priority - Patient Management
  {
    id: 'patient-history',
    category: 'Patient Management',
    title: 'Patient Demographics',
    instruction: 'Extract patient demographics, past medical history, family history, social history, and allergies mentioned in the consultation',
    description: 'Comprehensive patient background',
    icon: User,
    color: 'from-amber-500 to-orange-600',
    priority: 'medium',
    estimatedTime: '30s'
  },
  {
    id: 'risk-assessment',
    category: 'Patient Management',
    title: 'Risk Assessment',
    instruction: 'Identify and assess clinical risk factors, safety concerns, red flags, and urgent issues that require immediate attention',
    description: 'Clinical risk and safety evaluation',
    icon: AlertTriangle,
    color: 'from-red-600 to-rose-600',
    priority: 'high',
    estimatedTime: '40s'
  },

  // Low Priority - Documentation
  {
    id: 'follow-up-plan',
    category: 'Documentation',
    title: 'Follow-up Instructions',
    instruction: 'Extract follow-up appointments, monitoring requirements, when to return if symptoms worsen, and patient education provided',
    description: 'Patient follow-up and education summary',
    icon: Calendar,
    color: 'from-violet-500 to-purple-600',
    priority: 'low',
    estimatedTime: '20s'
  },
  {
    id: 'quality-metrics',
    category: 'Documentation',
    title: 'Quality Metrics',
    instruction: 'Assess documentation quality, identify missing information, and suggest improvements for clinical completeness',
    description: 'Clinical documentation quality assessment',
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-600',
    priority: 'low',
    estimatedTime: '45s'
  },

  // Specialty Templates
  {
    id: 'cardiology-focused',
    category: 'Cardiology Specific',
    title: 'Cardiovascular Assessment',
    instruction: 'Focus on cardiovascular symptoms, risk factors, ECG findings, cardiac medications, and cardiovascular examination findings',
    description: 'Specialized cardiovascular analysis',
    icon: Heart,
    color: 'from-rose-500 to-red-600',
    priority: 'medium',
    estimatedTime: '40s'
  }
];

const getCategoryIcon = (category: string): React.ElementType => {
  switch (category) {
    case 'Clinical Assessment': return Stethoscope;
    case 'Medication Management': return Shield;
    case 'Treatment Planning': return Activity;
    case 'Patient Management': return User;
    case 'Documentation': return FileText;
    case 'Cardiology Specific': return Heart;
    default: return Brain;
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Clinical Assessment': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    case 'Medication Management': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    case 'Treatment Planning': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'Patient Management': return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30';
    case 'Documentation': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
    case 'Cardiology Specific': return 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30';
    default: return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-900/30';
  }
};

export const QuickActionTemplates: React.FC<QuickActionTemplatesProps> = ({
  onSelectTemplate,
  disabled = false,
  hasTranscript
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', ...Array.from(new Set(MEDICAL_TEMPLATES.map(t => t.category)))];
  
  const filteredTemplates = MEDICAL_TEMPLATES
    .filter(template => {
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.instruction.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  if (!hasTranscript) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
          No Transcript Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm">
          Start recording or upload an audio file to access our medical analysis templates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Medical Analysis Templates
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose from clinical analysis templates designed for medical professionals
          </p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const CategoryIcon = getCategoryIcon(category);
          const isActive = selectedCategory === category;
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CategoryIcon className="w-4 h-4" />
              <span>{category}</span>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const IconComponent = template.icon;
          const priorityColor = {
            high: 'border-red-200 dark:border-red-800',
            medium: 'border-amber-200 dark:border-amber-800',
            low: 'border-slate-200 dark:border-slate-700'
          };

          return (
            <div
              key={template.id}
              className={`group relative bg-white dark:bg-slate-800 rounded-xl border ${priorityColor[template.priority]} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
                disabled ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02]'
              }`}
              onClick={() => !disabled && onSelectTemplate(template.instruction)}
            >
              {/* Priority Indicator */}
              <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                template.priority === 'high' ? 'bg-red-500' :
                template.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`bg-gradient-to-r ${template.color} rounded-lg p-2.5 shadow-sm group-hover:shadow-md transition-shadow`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate">
                      {template.title}
                    </h4>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>~{template.estimatedTime}</span>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    template.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    template.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-900/50 dark:text-slate-400'
                  }`}>
                    {template.priority.toUpperCase()}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700 pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
            No templates found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Try adjusting your search or category filter
          </p>
        </div>
      )}
    </div>
  );
};