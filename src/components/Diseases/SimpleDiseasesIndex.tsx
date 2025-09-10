import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Clock, 
  BookOpen,
  Tag,
  Grid3X3,
  List,
  ChevronRight,
  Stethoscope,
  Zap,
  Shield,
  Target,
  Layers,
  Globe,
  Database,
  Award,
  TrendingUp,
  Users,
  Star,
  Filter,
  SortDesc,
  Eye,
  Bookmark,
  Calendar,
  Microscope,
  Pill,
  Brain,
  Thermometer
} from 'lucide-react';
import { getAllDiseases, searchDiseases, getDiseasesByCategory, MarkdownDiseaseItem } from './MarkdownDiseaseRegistry';
import EvidenceLevelsTable from './EvidenceLevel/EvidenceLevelsTable';

const categories = [
  { id: 'all', name: 'All Categories', icon: Database, color: 'text-[var(--foreground-tertiary)]', gradient: 'from-slate-500 to-gray-600' },
  { id: 'cardiomyopathy', name: 'Cardiomyopathy', icon: Heart, color: 'text-red-600', gradient: 'from-red-500 to-pink-600' },
  { id: 'electrophysiology', name: 'Electrophysiology', icon: Zap, color: 'text-yellow-600', gradient: 'from-yellow-500 to-orange-600' },
  { id: 'heart-failure', name: 'Heart Failure', icon: Activity, color: 'text-[var(--cardiology-accent-blue-dark)]', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'valvular', name: 'Valvular Disease', icon: Layers, color: 'text-indigo-600', gradient: 'from-indigo-500 to-purple-600' },
  { id: 'emergency', name: 'Emergency', icon: Stethoscope, color: 'text-pink-600', gradient: 'from-pink-500 to-rose-600' },
  { id: 'electrolyte', name: 'Electrolyte Disorders', icon: Target, color: 'text-green-600', gradient: 'from-green-500 to-emerald-600' }
];

const sortOptions = [
  { id: 'title', name: 'Title A-Z', icon: SortDesc },
  { id: 'severity', name: 'Severity', icon: AlertTriangle },
  { id: 'readTime', name: 'Read Time', icon: Clock },
  { id: 'updated', name: 'Last Updated', icon: Calendar }
];

export const SimpleDiseasesIndex: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('title');
  const [showFilters, setShowFilters] = useState(false);

  // Get filtered and sorted diseases
  const filteredDiseases = useMemo(() => {
    let diseases = getAllDiseases();
    
    // Filter by category
    if (selectedCategory !== 'all') {
      diseases = getDiseasesByCategory(selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      diseases = searchDiseases(searchTerm);
    }
    
    // Sort diseases
    diseases.sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const severityOrder = { high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        case 'readTime':
          const getReadTimeNumber = (time: string) => parseInt(time.split(' ')[0]);
          return getReadTimeNumber(a.readTime) - getReadTimeNumber(b.readTime);
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return a.title.localeCompare(b.title);
      }
    });
    
    return diseases;
  }, [searchTerm, selectedCategory, sortBy]);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high': 
        return { 
          color: 'bg-gradient-to-r from-red-500 to-pink-600', 
          textColor: 'text-[var(--foreground)]',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle, 
          label: 'Critical',
          pulse: 'animate-pulse'
        };
      case 'medium': 
        return { 
          color: 'bg-gradient-to-r from-amber-500 to-orange-600', 
          textColor: 'text-[var(--foreground)]',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: Activity, 
          label: 'Moderate',
          pulse: ''
        };
      case 'low': 
        return { 
          color: 'bg-gradient-to-r from-green-500 to-emerald-600', 
          textColor: 'text-[var(--foreground)]',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: Shield, 
          label: 'Stable',
          pulse: ''
        };
      default: 
        return { 
          color: 'bg-gradient-to-r from-gray-500 to-slate-600', 
          textColor: 'text-[var(--foreground)]',
          bgColor: 'bg-[var(--component-surface-primary)]',
          borderColor: 'border-[var(--glass-border-light)]',
          icon: BookOpen, 
          label: 'Unknown',
          pulse: ''
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.name.toLowerCase().includes(category.toLowerCase()));
    return categoryData?.icon || BookOpen;
  };

  const handleDiseaseClick = (disease: MarkdownDiseaseItem) => {
    navigate(`/diseases/${disease.id}`);
  };

  const DiseaseCard: React.FC<{ disease: MarkdownDiseaseItem }> = ({ disease }) => {
    const severityConfig = getSeverityConfig(disease.severity);
    const SeverityIcon = severityConfig.icon;
    const CategoryIcon = getCategoryIcon(disease.category);

    return (
      <div
        onClick={() => handleDiseaseClick(disease)}
        className="group bg-[var(--component-card)] rounded-2xl border border-[var(--glass-border-light)] hover:border-[var(--cardiology-accent-blue)] hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
      >
        {/* Card Header with Gradient */}
        <div className={`h-2 ${severityConfig.color}`}></div>
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-3 rounded-xl ${severityConfig.bgColor} ${severityConfig.borderColor} border group-hover:scale-110 transition-transform`}>
                <CategoryIcon className={`w-5 h-5 ${severityConfig.color.replace('bg-gradient-to-r', 'text').split(' ')[1].replace('to-pink-600', 'red-600').replace('to-orange-600', 'amber-600').replace('to-emerald-600', 'green-600').replace('to-slate-600', 'gray-600')}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--cardiology-accent-blue-dark)] transition-colors mb-1 line-clamp-2">
                  {disease.title}
                </h3>
                <p className="text-sm font-medium text-[var(--foreground-tertiary)]">{disease.category}</p>
              </div>
            </div>
            
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${severityConfig.color} ${severityConfig.textColor} flex items-center space-x-1 ${severityConfig.pulse}`}>
              <SeverityIcon className="w-3 h-3" />
              <span>{severityConfig.label}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-[var(--foreground-tertiary)] text-sm mb-4 line-clamp-3 leading-relaxed">
            {disease.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {disease.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-[var(--cardiology-accent-blue-dark)] text-xs rounded-lg flex items-center space-x-1 border border-blue-100"
              >
                <Tag className="w-3 h-3" />
                <span className="font-medium">{tag}</span>
              </span>
            ))}
            {disease.tags.length > 3 && (
              <span className="text-xs text-[var(--foreground-secondary)] font-medium">+{disease.tags.length - 3} more</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-[var(--foreground-secondary)]">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{disease.readTime}</span>
              </div>
              {disease.prevalence && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium text-xs">{disease.prevalence}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-[var(--foreground-secondary)] font-medium">{disease.lastUpdated}</span>
              <ChevronRight className="w-4 h-4 text-[var(--foreground-secondary)] group-hover:text-[var(--cardiology-accent-blue-dark)] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DiseaseListItem: React.FC<{ disease: MarkdownDiseaseItem }> = ({ disease }) => {
    const severityConfig = getSeverityConfig(disease.severity);
    const SeverityIcon = severityConfig.icon;
    const CategoryIcon = getCategoryIcon(disease.category);

    return (
      <div
        onClick={() => handleDiseaseClick(disease)}
        className="group bg-[var(--component-card)] rounded-xl border border-[var(--glass-border-light)] hover:border-[var(--cardiology-accent-blue)] hover:shadow-lg transition-all duration-300 cursor-pointer p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className={`p-3 rounded-xl ${severityConfig.bgColor} ${severityConfig.borderColor} border group-hover:scale-110 transition-transform`}>
              <CategoryIcon className={`w-5 h-5 ${severityConfig.color.replace('bg-gradient-to-r', 'text').split(' ')[1].replace('to-pink-600', 'red-600').replace('to-orange-600', 'amber-600').replace('to-emerald-600', 'green-600').replace('to-slate-600', 'gray-600')}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--cardiology-accent-blue-dark)] transition-colors">
                  {disease.title}
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${severityConfig.color} ${severityConfig.textColor} flex items-center space-x-1`}>
                  <SeverityIcon className="w-3 h-3" />
                  <span>{severityConfig.label}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-[var(--foreground-tertiary)] mb-2">{disease.category}</p>
              <p className="text-[var(--foreground-tertiary)] text-sm line-clamp-2 leading-relaxed">
                {disease.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-[var(--foreground-secondary)] ml-6">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{disease.readTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{disease.lastUpdated}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--foreground-secondary)] group-hover:text-[var(--cardiology-accent-blue-dark)] group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="text-center mb-12" data-tour="disease-header">
          <div className="inline-flex items-center space-x-3 bg-[var(--component-card)] px-6 py-3 rounded-full shadow-lg border border-blue-100 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
              <Stethoscope className="w-5 h-5 text-[var(--foreground)]" />
            </div>
            <span className="text-sm font-semibold text-[var(--foreground-tertiary)]">Medical Knowledge Base</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Disease Guidelines & Pathways
          </h1>
          <p className="text-xl text-[var(--foreground-tertiary)] max-w-2xl mx-auto leading-relaxed">
            Comprehensive medical guidelines and clinical pathways for evidence-based practice
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-[var(--component-card)] rounded-2xl shadow-xl border border-[var(--glass-border-light)] p-6 mb-8" data-tour="disease-filters">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1" data-tour="disease-search">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)]" />
                <input
                  type="text"
                  placeholder="Search diseases, symptoms, treatments, or guidelines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-[var(--glass-border-medium)] rounded-xl focus:ring-2 focus:ring-[var(--cardiology-accent-blue)] focus:border-transparent transition-all text-[var(--foreground)] placeholder-gray-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-[var(--component-card)] border border-[var(--glass-border-medium)] rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-[var(--cardiology-accent-blue)] focus:border-transparent transition-all text-[var(--foreground)] font-medium"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)] pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[var(--component-card)] border border-[var(--glass-border-medium)] rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-[var(--cardiology-accent-blue)] focus:border-transparent transition-all text-[var(--foreground)] font-medium"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <SortDesc className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)] pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-[var(--component-surface-secondary)] rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[var(--component-card)] text-[var(--foreground)] shadow-sm'
                      : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-[var(--component-card)] text-[var(--foreground)] shadow-sm'
                      : 'text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              {filteredDiseases.length} Disease{filteredDiseases.length !== 1 ? 's' : ''} Found
            </h2>
            {selectedCategory !== 'all' && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-[var(--cardiology-accent-blue-light)] text-blue-800 rounded-full">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {categories.find(cat => cat.id === selectedCategory)?.name}
                </span>
              </div>
            )}
          </div>
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 text-sm font-medium text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Evidence Levels Reference */}
        <div className="mb-12" data-tour="evidence-levels">
          <EvidenceLevelsTable />
        </div>

        {/* Disease List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" data-tour="disease-cards">
            {filteredDiseases.map((disease) => (
              <DiseaseCard key={disease.id} disease={disease} />
            ))}
          </div>
        ) : (
          <div className="space-y-4" data-tour="disease-cards">
            {filteredDiseases.map((disease) => (
              <DiseaseListItem key={disease.id} disease={disease} />
            ))}
          </div>
        )}

        {filteredDiseases.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-[var(--component-card)] rounded-2xl shadow-xl border border-[var(--glass-border-light)] p-12 max-w-md mx-auto">
              <div className="bg-[var(--component-surface-secondary)] p-6 rounded-full w-fit mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-[var(--foreground-secondary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">No diseases found</h3>
              <p className="text-[var(--foreground-tertiary)] mb-6 leading-relaxed">
                Try adjusting your search terms or filters to find the medical guidelines you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-[var(--cardiology-accent-blue-dark)] text-[var(--foreground)] rounded-xl hover:bg-[var(--cardiology-accent-blue-dark)] transition-colors font-medium"
              >
                View All Diseases
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDiseasesIndex; 