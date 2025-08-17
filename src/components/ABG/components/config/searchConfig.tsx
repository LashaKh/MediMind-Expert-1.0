import React from 'react';
import {
  Stethoscope,
  User,
  Brain,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wind,
  TrendingUp,
  Droplets,
  Thermometer,
  Layers,
  Calendar,
  BarChart3
} from 'lucide-react';

export interface SearchSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
  accent: string;
}

export interface InterpretationOption {
  value: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

export interface SeverityLevel {
  value: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

export interface QuickDateRange {
  label: string;
  days: number;
  icon: React.ReactNode;
}

export interface ProcessingTimeRange {
  value: number;
  label: string;
  description: string;
  color: string;
}

export const searchSections: SearchSection[] = [
  {
    id: 'clinical',
    label: 'Clinical Values',
    icon: <Stethoscope className="h-5 w-5" />,
    color: 'blue',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-sky-500/20',
    description: 'pH, gases, and clinical parameters',
    accent: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  },
  {
    id: 'patient',
    label: 'Patient Context',
    icon: <User className="h-5 w-5" />,
    color: 'emerald',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-green-500/20',
    description: 'Demographics and identifiers',
    accent: 'bg-gradient-to-r from-emerald-500 to-teal-500'
  },
  {
    id: 'analysis',
    label: 'AI Analysis',
    icon: <Brain className="h-5 w-5" />,
    color: 'purple',
    gradient: 'from-purple-500/20 via-violet-500/10 to-indigo-500/20',
    description: 'Interpretations and AI insights',
    accent: 'bg-gradient-to-r from-purple-500 to-violet-500'
  },
  {
    id: 'temporal',
    label: 'Time & Quality',
    icon: <Clock3 className="h-5 w-5" />,
    color: 'amber',
    gradient: 'from-amber-500/20 via-orange-500/10 to-yellow-500/20',
    description: 'Date ranges and quality metrics',
    accent: 'bg-gradient-to-r from-amber-500 to-orange-500'
  }
];

export const interpretationOptions: InterpretationOption[] = [
  { 
    value: 'normal', 
    label: 'Normal ABG', 
    color: 'emerald', 
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Balanced acid-base status'
  },
  { 
    value: 'respiratory-acidosis', 
    label: 'Respiratory Acidosis', 
    color: 'red', 
    icon: <Wind className="h-4 w-4" />,
    description: 'Elevated CO2, decreased pH'
  },
  { 
    value: 'respiratory-alkalosis', 
    label: 'Respiratory Alkalosis', 
    color: 'blue', 
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Decreased CO2, elevated pH'
  },
  { 
    value: 'metabolic-acidosis', 
    label: 'Metabolic Acidosis', 
    color: 'orange', 
    icon: <Droplets className="h-4 w-4" />,
    description: 'Decreased HCO3, low pH'
  },
  { 
    value: 'metabolic-alkalosis', 
    label: 'Metabolic Alkalosis', 
    color: 'purple', 
    icon: <Thermometer className="h-4 w-4" />,
    description: 'Elevated HCO3, high pH'
  },
  { 
    value: 'mixed-disorder', 
    label: 'Mixed Disorder', 
    color: 'slate', 
    icon: <Layers className="h-4 w-4" />,
    description: 'Complex combined imbalance'
  }
];

export const severityLevels: SeverityLevel[] = [
  { value: 'normal', label: 'Normal', color: 'emerald', icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: 'warning', label: 'Warning', color: 'amber', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'critical', label: 'Critical', color: 'red', icon: <XCircle className="h-4 w-4" /> }
];

export const quickDateRanges: QuickDateRange[] = [
  { label: 'Today', days: 0, icon: <Clock3 className="h-4 w-4" /> },
  { label: 'Last 7 days', days: 7, icon: <Calendar className="h-4 w-4" /> },
  { label: 'Last 30 days', days: 30, icon: <Calendar className="h-4 w-4" /> },
  { label: 'Last 90 days', days: 90, icon: <BarChart3 className="h-4 w-4" /> }
];

export const processingTimeRanges: ProcessingTimeRange[] = [
  { value: 5000, label: 'Under 5s', description: 'Ultra-fast analysis', color: 'emerald' },
  { value: 10000, label: 'Under 10s', description: 'Fast processing', color: 'green' },
  { value: 30000, label: 'Under 30s', description: 'Standard speed', color: 'yellow' },
  { value: 60000, label: 'Under 1m', description: 'Detailed analysis', color: 'orange' }
];

export const quickSearchSuggestions = [
  'respiratory acidosis',
  'high pH', 
  'critical values',
  'recent analyses'
];