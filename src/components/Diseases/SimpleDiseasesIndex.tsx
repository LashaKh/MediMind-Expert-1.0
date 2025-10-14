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
import { useTranslation } from '../../hooks/useTranslation';

export const SimpleDiseasesIndex: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('title');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => [
    { id: 'all', name: t('diseases.indexPage.filters.allCategories'), icon: Database, color: 'text-slate-600', gradient: 'from-slate-500 to-gray-600' },
    { id: 'cardiomyopathy', name: t('diseases.indexPage.filters.cardiomyopathy'), icon: Heart, color: 'text-[#1a365d]', gradient: 'from-[#1a365d] to-[#2b6cb0]' },
    { id: 'electrophysiology', name: t('diseases.indexPage.filters.electrophysiology'), icon: Zap, color: 'text-[#2b6cb0]', gradient: 'from-[#2b6cb0] to-[#63b3ed]' },
    { id: 'heart-failure', name: t('diseases.indexPage.filters.heartFailure'), icon: Activity, color: 'text-[#2b6cb0]', gradient: 'from-[#2b6cb0] to-[#63b3ed]' },
    { id: 'valvular', name: t('diseases.indexPage.filters.valvular'), icon: Layers, color: 'text-[#1a365d]', gradient: 'from-[#1a365d] to-[#2b6cb0]' },
    { id: 'emergency', name: t('diseases.indexPage.filters.emergency'), icon: Stethoscope, color: 'text-[#63b3ed]', gradient: 'from-[#63b3ed] to-[#90cdf4]' },
    { id: 'electrolyte', name: t('diseases.indexPage.filters.electrolyte'), icon: Target, color: 'text-[#2b6cb0]', gradient: 'from-[#2b6cb0] to-[#90cdf4]' }
  ], [t]);

  const sortOptions = useMemo(() => [
    { id: 'title', name: t('diseases.indexPage.sort.title'), icon: SortDesc },
    { id: 'severity', name: t('diseases.indexPage.sort.severity'), icon: AlertTriangle },
    { id: 'readTime', name: t('diseases.indexPage.sort.readTime'), icon: Clock },
    { id: 'updated', name: t('diseases.indexPage.sort.updated'), icon: Calendar }
  ], [t]);

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
  }, [searchTerm, selectedCategory, sortBy, t]);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high': 
        return { 
          color: 'bg-gradient-to-r from-[#1a365d] to-[#2b6cb0]', 
          textColor: 'text-white',
          bgColor: 'bg-[#90cdf4]/20',
          borderColor: 'border-[#2b6cb0]/40',
          icon: AlertTriangle, 
          label: t('diseases.indexPage.severityLabels.critical'),
          pulse: 'animate-pulse'
        };
      case 'medium': 
        return { 
          color: 'bg-gradient-to-r from-[#2b6cb0] to-[#63b3ed]', 
          textColor: 'text-white',
          bgColor: 'bg-[#90cdf4]/20',
          borderColor: 'border-[#63b3ed]/30',
          icon: Activity, 
          label: t('diseases.indexPage.severityLabels.moderate'),
          pulse: ''
        };
      case 'low': 
        return { 
          color: 'bg-gradient-to-r from-[#63b3ed] to-[#90cdf4]', 
          textColor: 'text-white',
          bgColor: 'bg-[#90cdf4]/10',
          borderColor: 'border-[#63b3ed]/20',
          icon: Shield, 
          label: t('diseases.indexPage.severityLabels.stable'),
          pulse: ''
        };
      default: 
        return { 
          color: 'bg-gradient-to-r from-gray-500 to-slate-600', 
          textColor: 'text-white',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: BookOpen, 
          label: t('diseases.indexPage.severityLabels.unknown'),
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
    const CategoryIcon = getCategoryIcon(t(`diseases.registry.${disease.id}.category`));
    const tags = t(`diseases.registry.${disease.id}.tags`, { returnObjects: true }) as string[];

    return (
      <div
        onClick={() => handleDiseaseClick(disease)}
        className="group bg-white rounded-2xl border border-gray-200 hover:border-[#63b3ed] hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
      >
        {/* Card Header with Gradient */}
        <div className={`h-2 ${severityConfig.color}`}></div>
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-3 rounded-xl ${severityConfig.bgColor} ${severityConfig.borderColor} border group-hover:scale-110 transition-transform`}>
                <CategoryIcon className={`w-5 h-5 ${
                  disease.severity === 'high' ? 'text-red-600' :
                  disease.severity === 'medium' ? 'text-[#2b6cb0]' :
                  disease.severity === 'low' ? 'text-[#63b3ed]' :
                  'text-gray-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#2b6cb0] transition-colors mb-1 line-clamp-2">
                  {t(`diseases.registry.${disease.id}.title`)}
                </h3>
                <p className="text-sm font-medium text-gray-600">{t(`diseases.registry.${disease.id}.category`)}</p>
              </div>
            </div>
            
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${severityConfig.color} ${severityConfig.textColor} flex items-center space-x-1 ${severityConfig.pulse}`}>
              <SeverityIcon className="w-3 h-3" />
              <span>{severityConfig.label}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
            {t(`diseases.registry.${disease.id}.description`)}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(tags) && tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gradient-to-r from-[#90cdf4]/20 to-[#63b3ed]/10 text-[#1a365d] text-xs rounded-lg flex items-center space-x-1 border border-[#63b3ed]/30"
              >
                <Tag className="w-3 h-3" />
                <span className="font-medium">{tag}</span>
              </span>
            ))}
            {Array.isArray(tags) && tags.length > 3 && (
              <span className="text-xs text-gray-500 font-medium">{t('diseases.indexPage.card.more_other', { count: tags.length - 3 })}</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{t(`diseases.registry.${disease.id}.readTime`, disease.readTime)}</span>
              </div>
              {disease.prevalence && (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium text-xs">{t(`diseases.registry.${disease.id}.prevalence`, disease.prevalence)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 font-medium">{t(`diseases.registry.${disease.id}.lastUpdated`, disease.lastUpdated)}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#2b6cb0] group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DiseaseListItem: React.FC<{ disease: MarkdownDiseaseItem }> = ({ disease }) => {
    const severityConfig = getSeverityConfig(disease.severity);
    const SeverityIcon = severityConfig.icon;
    const CategoryIcon = getCategoryIcon(t(`diseases.registry.${disease.id}.category`));

    return (
      <div
        onClick={() => handleDiseaseClick(disease)}
        className="group bg-white rounded-xl border border-gray-200 hover:border-[#63b3ed] hover:shadow-lg transition-all duration-300 cursor-pointer p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className={`p-3 rounded-xl ${severityConfig.bgColor} ${severityConfig.borderColor} border group-hover:scale-110 transition-transform`}>
              <CategoryIcon className={`w-5 h-5 ${
                disease.severity === 'high' ? 'text-[#1a365d]' :
                disease.severity === 'medium' ? 'text-[#2b6cb0]' :
                disease.severity === 'low' ? 'text-[#63b3ed]' :
                'text-gray-600'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#2b6cb0] transition-colors">
                  {t(`diseases.registry.${disease.id}.title`)}
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${severityConfig.color} ${severityConfig.textColor} flex items-center space-x-1`}>
                  <SeverityIcon className="w-3 h-3" />
                  <span>{severityConfig.label}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">{t(`diseases.registry.${disease.id}.category`)}</p>
              <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                {t(`diseases.registry.${disease.id}.description`)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500 ml-6">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{t(`diseases.registry.${disease.id}.readTime`, disease.readTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{t(`diseases.registry.${disease.id}.lastUpdated`, disease.lastUpdated)}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#2b6cb0] group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#90cdf4]/10 to-[#63b3ed]/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="text-center mb-12" data-tour="disease-header">
          <div className="inline-flex items-center space-x-3 bg-white px-6 py-3 rounded-full shadow-lg border border-[#63b3ed]/30 mb-6">
            <div className="p-2 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] rounded-full">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-600">{t('diseases.indexPage.hero.knowledgeBase')}</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] bg-clip-text text-transparent mb-4">
            {t('diseases.indexPage.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('diseases.indexPage.hero.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8" data-tour="disease-filters">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1" data-tour="disease-search">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('diseases.indexPage.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#63b3ed] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
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
                  className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-[#63b3ed] focus:border-transparent transition-all text-gray-900 font-medium"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-[#63b3ed] focus:border-transparent transition-all text-gray-900 font-medium"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <SortDesc className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
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
            <h2 className="text-2xl font-bold text-gray-900">
              {t('diseases.indexPage.results.found', { count: filteredDiseases.length })}
            </h2>
            {selectedCategory !== 'all' && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-[#90cdf4]/20 text-[#1a365d] rounded-full">
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
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t('diseases.indexPage.results.clearSearch')}
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 max-w-md mx-auto">
              <div className="bg-gray-100 p-6 rounded-full w-fit mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('diseases.indexPage.empty.title')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('diseases.indexPage.empty.message')}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-[#1a365d] text-white rounded-xl hover:bg-[#2b6cb0] transition-colors font-medium"
              >
                {t('diseases.indexPage.empty.button')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDiseasesIndex; 