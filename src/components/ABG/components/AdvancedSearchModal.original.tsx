import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { 
  Search, 
  X, 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Users,
  Calendar as CalendarIcon,
  Hash,
  Layers,
  Brain,
  Stethoscope,
  Clock3,
  BarChart3,
  Lightbulb,
  Gauge,
  Heart,
  Droplets,
  Wind,
  Thermometer
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { 
  ABGSearchFilters, 
  ABGType, 
  PatientInfo,
  ABGSortOption 
} from '../../../types/abg';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: ABGSearchFilters) => void;
  onReset: () => void;
  initialFilters?: ABGSearchFilters;
  patients?: PatientInfo[];
  className?: string;
}

interface SearchSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
  accent: string;
}

const searchSections: SearchSection[] = [
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

const interpretationOptions = [
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

const severityLevels = [
  { value: 'normal', label: 'Normal', color: 'emerald', icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: 'warning', label: 'Warning', color: 'amber', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'critical', label: 'Critical', color: 'red', icon: <XCircle className="h-4 w-4" /> }
];

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  onReset,
  initialFilters = {},
  patients = [],
  className
}) => {
  const [filters, setFilters] = useState<ABGSearchFilters>(initialFilters);
  const [activeSection, setActiveSection] = useState<string>('clinical');
  const [searchQuery, setSearchQuery] = useState(filters.keyword || '');
  const [isSearching, setIsSearching] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Spring animations for smooth interactions
  const searchProgress = useSpring(0, { stiffness: 300, damping: 30 });
  const searchScale = useTransform(searchProgress, [0, 100], [1, 1.02]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSearch();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const changed = JSON.stringify(filters) !== JSON.stringify(initialFilters) || searchQuery.length > 0;
    setHasChanges(changed);
  }, [filters, initialFilters, searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    searchProgress.set(100);
    
    const searchFilters = { ...filters, keyword: searchQuery || undefined };
    
    // Simulate search delay for smooth UX
    setTimeout(() => {
      onSearch(searchFilters);
      setIsSearching(false);
      searchProgress.set(0);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setFilters({});
    setSearchQuery('');
    setHasChanges(false);
    onReset();
  };

  const updateFilter = (key: keyof ABGSearchFilters, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value === '' || value === undefined || value === null ? undefined : value 
    }));
  };

  const removeFilter = (key: keyof ABGSearchFilters) => {
    setFilters(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof ABGSearchFilters];
    return value !== undefined && value !== null && value !== '';
  }).length + (searchQuery ? 1 : 0);

  const currentSection = searchSections.find(s => s.id === activeSection)!;

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Invisible backdrop for click-to-close */}
        <div
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.1 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          style={{ scale: searchScale }}
        >
          <Card className="bg-white/98 backdrop-blur-3xl border-0 shadow-2xl ring-1 ring-white/20">
            {/* Header */}
            <div className="relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-blue-50" />
                <div className="absolute inset-0 opacity-60">
                  <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 rounded-full blur-3xl -translate-x-32 -translate-y-32" />
                  <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-400/30 to-pink-400/20 rounded-full blur-3xl translate-x-32 -translate-y-32" />
                </div>
              </div>
              
              <div className="relative px-6 py-4 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-30 scale-110" />
                      <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                        <Search className="h-5 w-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-pulse" />
                    </motion.div>
                    <div>
                      <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent"
                      >
                        Advanced Search
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-600 flex items-center gap-2 mt-1"
                      >
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Intelligent ABG filtering with AI-powered insights
                      </motion.p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Active Filters Badge */}
                    <AnimatePresence>
                      {activeFiltersCount > 0 && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-md">
                            <Filter className="h-3 w-3 mr-1" />
                            {activeFiltersCount} active
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="rounded-full h-12 w-12 p-0 hover:bg-slate-100/70 transition-all duration-200"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Intelligent Search Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 relative"
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2">
                        <Search className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <Input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search across all ABG results, interpretations, and analyses..."
                        className="pl-14 pr-12 h-12 text-base bg-transparent border-0 focus:ring-0 placeholder:text-slate-400 font-medium"
                      />
                      <AnimatePresence>
                        {searchQuery && (
                          <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100/70 transition-colors"
                          >
                            <X className="h-4 w-4 text-slate-400" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Search Suggestions */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500 font-medium">Quick searches:</span>
                    {['respiratory acidosis', 'high pH', 'critical values', 'recent analyses'].map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        onClick={() => setSearchQuery(suggestion)}
                        className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 hover:text-slate-800 transition-all duration-200"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[500px]">
              {/* Sidebar Navigation */}
              <div className="w-64 border-r border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white/60 backdrop-blur-xl">
                <div className="p-4 space-y-2">
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-800 mb-1">Search Categories</h3>
                    <p className="text-xs text-slate-600">Explore different aspects of your ABG data</p>
                  </div>
                  
                  {searchSections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index + 0.3 }}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                        activeSection === section.id
                          ? "bg-white shadow-lg border border-slate-200/60 scale-[1.02]"
                          : "hover:bg-white/70 hover:shadow-md hover:scale-[1.01]"
                      )}
                    >
                      {/* Background gradient when active */}
                      {activeSection === section.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn("absolute inset-0 bg-gradient-to-r opacity-10 rounded-xl", section.gradient)}
                        />
                      )}
                      
                      <div className="relative flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg transition-all duration-300 shadow-sm",
                          activeSection === section.id
                            ? `${section.accent} text-white shadow-md`
                            : `bg-${section.color}-50 text-${section.color}-600 group-hover:shadow-md`
                        )}>
                          {section.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 mb-1 text-sm">{section.label}</div>
                          <div className="text-xs text-slate-600 leading-relaxed">{section.description}</div>
                        </div>
                        {activeSection === section.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Active Filters Summary */}
                <AnimatePresence>
                  {activeFiltersCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="mx-4 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/60"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Active Filters
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReset}
                          className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {searchQuery && (
                          <div className="flex items-center justify-between text-xs p-2 bg-white/70 rounded-lg">
                            <span className="text-slate-600 font-medium">Search Query</span>
                            <Badge variant="outline" className="text-xs max-w-32 truncate">
                              "{searchQuery}"
                            </Badge>
                          </div>
                        )}
                        {Object.entries(filters).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs p-2 bg-white/70 rounded-lg">
                            <span className="text-slate-600 font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFilter(key as keyof ABGSearchFilters)}
                              className="h-5 w-5 p-0 hover:bg-red-100 text-red-500 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    {/* Clinical Values */}
                    {activeSection === 'clinical' && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-3">
                            <Stethoscope className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-xl font-bold text-slate-900 mb-2">Clinical Parameters</h2>
                          <p className="text-slate-600 text-sm max-w-md mx-auto">
                            Search by pH levels, gas concentrations, and other clinical values with precision ranges
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* pH Range */}
                          <Card className="p-4 bg-gradient-to-br from-red-50 to-blue-50 border border-red-200/60">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
                                <Droplets className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <Label className="text-sm font-bold text-slate-800">pH Range</Label>
                                <p className="text-xs text-slate-600">Normal: 7.35-7.45</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Minimum</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="6.8"
                                  max="7.8"
                                  placeholder="7.35"
                                  value={filters.phMin || ''}
                                  onChange={(e) => updateFilter('phMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="bg-white/80 border-red-200 focus:border-red-300 focus:ring-red-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Maximum</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="6.8"
                                  max="7.8"
                                  placeholder="7.45"
                                  value={filters.phMax || ''}
                                  onChange={(e) => updateFilter('phMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="bg-white/80 border-red-200 focus:border-red-300 focus:ring-red-200"
                                />
                              </div>
                            </div>
                          </Card>

                          {/* PaCO2 Range */}
                          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/60">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                                <Wind className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <Label className="text-sm font-bold text-slate-800">PaCO2 (mmHg)</Label>
                                <p className="text-xs text-slate-600">Normal: 35-45</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Minimum</label>
                                <Input
                                  type="number"
                                  placeholder="35"
                                  value={filters.paco2Min || ''}
                                  onChange={(e) => updateFilter('paco2Min', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Maximum</label>
                                <Input
                                  type="number"
                                  placeholder="45"
                                  value={filters.paco2Max || ''}
                                  onChange={(e) => updateFilter('paco2Max', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
                                />
                              </div>
                            </div>
                          </Card>

                          {/* HCO3 Range */}
                          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                                <Heart className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <Label className="text-sm font-bold text-slate-800">HCO3 (mEq/L)</Label>
                                <p className="text-xs text-slate-600">Normal: 22-26</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Minimum</label>
                                <Input
                                  type="number"
                                  placeholder="22"
                                  value={filters.hco3Min || ''}
                                  onChange={(e) => updateFilter('hco3Min', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="bg-white/80 border-emerald-200 focus:border-emerald-300 focus:ring-emerald-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Maximum</label>
                                <Input
                                  type="number"
                                  placeholder="26"
                                  value={filters.hco3Max || ''}
                                  onChange={(e) => updateFilter('hco3Max', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="bg-white/80 border-emerald-200 focus:border-emerald-300 focus:ring-emerald-200"
                                />
                              </div>
                            </div>
                          </Card>

                          {/* PaO2 Range */}
                          <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                                <Gauge className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <Label className="text-sm font-bold text-slate-800">PaO2 (mmHg)</Label>
                                <p className="text-xs text-slate-600">Normal: 80-100</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Minimum</label>
                                <Input
                                  type="number"
                                  placeholder="80"
                                  value={filters.pao2Min || ''}
                                  onChange={(e) => updateFilter('pao2Min', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="bg-white/80 border-amber-200 focus:border-amber-300 focus:ring-amber-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Maximum</label>
                                <Input
                                  type="number"
                                  placeholder="100"
                                  value={filters.pao2Max || ''}
                                  onChange={(e) => updateFilter('pao2Max', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="bg-white/80 border-amber-200 focus:border-amber-300 focus:ring-amber-200"
                                />
                              </div>
                            </div>
                          </Card>
                        </div>

                        {/* ABG Type Selection */}
                        <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                              <Activity className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <Label className="text-sm font-bold text-slate-800">ABG Type</Label>
                              <p className="text-xs text-slate-600">Filter by blood gas type</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'Arterial Blood Gas', label: 'Arterial', icon: <TrendingUp className="h-4 w-4" /> },
                              { value: 'Venous Blood Gas', label: 'Venous', icon: <TrendingDown className="h-4 w-4" /> }
                            ].map((type) => (
                              <button
                                key={type.value}
                                onClick={() => updateFilter('type', filters.type === type.value ? undefined : type.value as ABGType)}
                                className={cn(
                                  "p-4 rounded-xl border transition-all duration-200 text-left group",
                                  filters.type === type.value
                                    ? "bg-purple-100 border-purple-300 text-purple-800"
                                    : "bg-white/70 border-purple-200/60 hover:bg-purple-50 hover:border-purple-300"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    filters.type === type.value
                                      ? "bg-purple-500 text-white"
                                      : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                                  )}>
                                    {type.icon}
                                  </div>
                                  <span className="font-medium">{type.label}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Patient Context */}
                    {activeSection === 'patient' && (
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient Context</h2>
                          <p className="text-slate-600 max-w-md mx-auto">
                            Filter by patient demographics and medical record information
                          </p>
                        </div>

                        {/* Patient Selection */}
                        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <Label className="text-lg font-bold text-slate-800">Patient Selection</Label>
                              <p className="text-sm text-slate-600">Filter results by specific patient</p>
                            </div>
                          </div>
                          
                          <select
                            value={filters.patientId || ''}
                            onChange={(e) => updateFilter('patientId', e.target.value || undefined)}
                            className="w-full p-4 bg-white/80 border border-emerald-200 rounded-xl focus:border-emerald-300 focus:ring-emerald-200 text-slate-800"
                          >
                            <option value="">All Patients ({patients.length} total)</option>
                            {patients.map((patient) => (
                              <option key={patient.id} value={patient.id}>
                                {patient.last_name}, {patient.first_name}
                                {patient.medical_record_number && ` • MRN: ${patient.medical_record_number}`}
                              </option>
                            ))}
                          </select>

                          {filters.patientId && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-200"
                            >
                              <div className="flex items-center gap-2 text-emerald-800">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-semibold">Patient-Specific Search Active</span>
                              </div>
                              <p className="text-sm text-emerald-700 mt-1">
                                Results filtered to selected patient's ABG records only
                              </p>
                            </motion.div>
                          )}
                        </Card>

                        {/* Additional Patient Filters */}
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                                <Hash className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Label className="text-base font-bold text-slate-800">Age Range</Label>
                                <p className="text-xs text-slate-600">Filter by patient age</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Min Age</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="150"
                                  placeholder="0"
                                  value={filters.ageMin || ''}
                                  onChange={(e) => updateFilter('ageMin', e.target.value ? parseInt(e.target.value) : undefined)}
                                  className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-700">Max Age</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="150"
                                  placeholder="150"
                                  value={filters.ageMax || ''}
                                  onChange={(e) => updateFilter('ageMax', e.target.value ? parseInt(e.target.value) : undefined)}
                                  className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
                                />
                              </div>
                            </div>
                          </Card>

                          <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/60">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Label className="text-base font-bold text-slate-800">Gender</Label>
                                <p className="text-xs text-slate-600">Filter by gender</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {['Male', 'Female'].map((gender) => (
                                <button
                                  key={gender}
                                  onClick={() => updateFilter('gender', filters.gender === gender ? undefined : gender)}
                                  className={cn(
                                    "p-4 rounded-xl border transition-all text-center group",
                                    filters.gender === gender
                                      ? "bg-pink-100 border-pink-300 text-pink-800"
                                      : "bg-white/70 border-pink-200/60 hover:bg-pink-50 hover:border-pink-300"
                                  )}
                                >
                                  <Users className={cn(
                                    "h-6 w-6 mx-auto mb-2 transition-colors",
                                    filters.gender === gender
                                      ? "text-pink-600"
                                      : "text-pink-400 group-hover:text-pink-500"
                                  )} />
                                  <div className="font-medium">{gender}</div>
                                </button>
                              ))}
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* AI Analysis */}
                    {activeSection === 'analysis' && (
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl mb-4">
                            <Brain className="h-8 w-8 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Analysis Results</h2>
                          <p className="text-slate-600 max-w-md mx-auto">
                            Filter by AI interpretations, confidence levels, and clinical assessments
                          </p>
                        </div>

                        {/* Interpretation Types */}
                        <div className="space-y-6">
                          <div>
                            <Label className="text-lg font-bold text-slate-800 mb-4 block flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-amber-500" />
                              Primary Interpretation
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              {interpretationOptions.map((option) => (
                                <motion.button
                                  key={option.value}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => updateFilter('interpretation', 
                                    filters.interpretation === option.value ? undefined : option.value
                                  )}
                                  className={cn(
                                    "p-5 rounded-2xl border transition-all text-left group relative overflow-hidden",
                                    filters.interpretation === option.value
                                      ? `bg-${option.color}-50 border-${option.color}-300 shadow-lg scale-105`
                                      : "bg-white/70 border-slate-200/60 hover:bg-slate-50 hover:shadow-md"
                                  )}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={cn(
                                      "p-3 rounded-xl transition-all",
                                      filters.interpretation === option.value
                                        ? `bg-${option.color}-500 text-white shadow-lg`
                                        : `bg-${option.color}-50 text-${option.color}-600 group-hover:bg-${option.color}-100`
                                    )}>
                                      {option.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold text-sm text-slate-900 mb-1">{option.label}</div>
                                      <div className="text-xs text-slate-600 leading-relaxed">{option.description}</div>
                                    </div>
                                  </div>
                                  {filters.interpretation === option.value && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                                    />
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          {/* Severity Levels */}
                          <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200/60">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="p-3 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <Label className="text-lg font-bold text-slate-800">Severity Classification</Label>
                                <p className="text-sm text-slate-600">Filter by clinical severity level</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              {severityLevels.map((severity) => (
                                <button
                                  key={severity.value}
                                  onClick={() => updateFilter('severity', 
                                    filters.severity === severity.value ? undefined : severity.value
                                  )}
                                  className={cn(
                                    "p-4 rounded-xl border transition-all text-center group",
                                    filters.severity === severity.value
                                      ? `bg-${severity.color}-50 border-${severity.color}-300 text-${severity.color}-800 shadow-lg`
                                      : "bg-white/70 border-slate-200/60 hover:bg-slate-50 hover:shadow-md"
                                  )}
                                >
                                  <div className={cn(
                                    "p-2 rounded-lg mx-auto mb-2 w-fit transition-colors",
                                    filters.severity === severity.value
                                      ? `bg-${severity.color}-500 text-white`
                                      : `bg-${severity.color}-50 text-${severity.color}-600 group-hover:bg-${severity.color}-100`
                                  )}>
                                    {severity.icon}
                                  </div>
                                  <div className="font-bold text-sm">{severity.label}</div>
                                </button>
                              ))}
                            </div>
                          </Card>

                          {/* Analysis Quality Filters */}
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                  </div>
                                  <Label className="text-base font-bold text-slate-800">Analysis Features</Label>
                                </div>
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100/50 transition-colors cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={filters.hasInterpretation || false}
                                      onChange={(e) => updateFilter('hasInterpretation', e.target.checked || undefined)}
                                      className="rounded border-green-300 text-green-600 focus:ring-green-200"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Brain className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium">Has AI Interpretation</span>
                                    </div>
                                  </label>
                                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100/50 transition-colors cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={filters.hasActionPlan || false}
                                      onChange={(e) => updateFilter('hasActionPlan', e.target.checked || undefined)}
                                      className="rounded border-green-300 text-green-600 focus:ring-green-200"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Target className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium">Has Action Plan</span>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </Card>

                            {/* Confidence Range */}
                            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/60">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                                  <Gauge className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <Label className="text-base font-bold text-slate-800">AI Confidence</Label>
                                  <p className="text-xs text-slate-600">Analysis certainty level</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-slate-700">Min %</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    value={filters.confidenceMin ? (filters.confidenceMin * 100).toFixed(0) : ''}
                                    onChange={(e) => updateFilter('confidenceMin', 
                                      e.target.value ? parseFloat(e.target.value) / 100 : undefined
                                    )}
                                    className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-slate-700">Max %</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="100"
                                    value={filters.confidenceMax ? (filters.confidenceMax * 100).toFixed(0) : ''}
                                    onChange={(e) => updateFilter('confidenceMax', 
                                      e.target.value ? parseFloat(e.target.value) / 100 : undefined
                                    )}
                                    className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
                                  />
                                </div>
                              </div>
                            </Card>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Time & Quality */}
                    {activeSection === 'temporal' && (
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4">
                            <Clock3 className="h-8 w-8 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">Time & Quality Metrics</h2>
                          <p className="text-slate-600 max-w-md mx-auto">
                            Filter by date ranges, processing times, and system performance metrics
                          </p>
                        </div>

                        {/* Date Range Selection */}
                        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                              <CalendarIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <Label className="text-lg font-bold text-slate-800">Date Range</Label>
                              <p className="text-sm text-slate-600">Filter results by analysis date</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">Start Date</label>
                              <Input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
                                className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">End Date</label>
                              <Input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
                                className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
                              />
                            </div>
                          </div>

                          {/* Quick Date Ranges */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700">Quick Select</Label>
                            <div className="grid grid-cols-4 gap-3">
                              {[
                                { label: 'Today', days: 0, icon: <Clock className="h-4 w-4" /> },
                                { label: 'Last 7 days', days: 7, icon: <Calendar className="h-4 w-4" /> },
                                { label: 'Last 30 days', days: 30, icon: <CalendarIcon className="h-4 w-4" /> },
                                { label: 'Last 90 days', days: 90, icon: <BarChart3 className="h-4 w-4" /> }
                              ].map((range) => (
                                <Button
                                  key={range.label}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const endDate = new Date().toISOString().split('T')[0];
                                    const startDate = new Date(Date.now() - range.days * 24 * 60 * 60 * 1000)
                                      .toISOString().split('T')[0];
                                    updateFilter('startDate', range.days === 0 ? endDate : startDate);
                                    updateFilter('endDate', endDate);
                                  }}
                                  className="bg-white/70 border-blue-200 hover:bg-blue-50 hover:border-blue-300 flex-col h-auto py-3"
                                >
                                  {range.icon}
                                  <span className="text-xs mt-1">{range.label}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </Card>

                        {/* Processing Performance */}
                        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                              <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <Label className="text-lg font-bold text-slate-800">Processing Performance</Label>
                              <p className="text-sm text-slate-600">Filter by AI processing time</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { value: 5000, label: 'Under 5s', description: 'Ultra-fast analysis', color: 'emerald' },
                              { value: 10000, label: 'Under 10s', description: 'Fast processing', color: 'green' },
                              { value: 30000, label: 'Under 30s', description: 'Standard speed', color: 'yellow' },
                              { value: 60000, label: 'Under 1m', description: 'Detailed analysis', color: 'orange' }
                            ].map((range) => (
                              <button
                                key={range.value}
                                onClick={() => updateFilter('processingTimeMax', 
                                  filters.processingTimeMax === range.value ? undefined : range.value
                                )}
                                className={cn(
                                  "p-4 rounded-xl border transition-all text-left group",
                                  filters.processingTimeMax === range.value
                                    ? `bg-${range.color}-50 border-${range.color}-300 text-${range.color}-800 shadow-lg`
                                    : "bg-white/70 border-emerald-200/60 hover:bg-emerald-50 hover:shadow-md"
                                )}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-bold text-sm">{range.label}</div>
                                  {filters.processingTimeMax === range.value && (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  )}
                                </div>
                                <div className="text-xs text-slate-600">{range.description}</div>
                              </button>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/60 backdrop-blur-xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className="bg-white/70 border-slate-200 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset All Filters
                  </Button>
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    {activeFiltersCount > 0 ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Filter className="h-4 w-4" />
                          <span className="font-semibold">{activeFiltersCount}</span>
                        </div>
                        <span>filter{activeFiltersCount > 1 ? 's' : ''} active</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        No filters applied
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={onClose}
                    className="hover:bg-slate-100/70"
                  >
                    Cancel
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-6 py-2 h-auto"
                    >
                      {isSearching ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-3"
                          >
                            <Target className="h-5 w-5" />
                          </motion.div>
                          <span className="font-semibold">Searching...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-3" />
                          <span className="font-semibold">Apply Search</span>
                          <ArrowRight className="h-5 w-5 ml-3" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="mt-3 pt-3 border-t border-slate-200/60">
                <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-medium">⌘</kbd>
                      <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-medium">⏎</kbd>
                    </div>
                    <span>Quick Search</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-medium">Esc</kbd>
                    <span>Close Modal</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Sparkles className="h-3 w-3" />
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// Custom scrollbar styles
const customScrollbarStyles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #7c3aed);
}
`;