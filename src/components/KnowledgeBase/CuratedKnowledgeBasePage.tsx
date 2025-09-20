import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Search, BookOpen, FileText, ChevronDown, ChevronRight, Filter, Grid, List,
  Star, Clock, TrendingUp, Eye, Bookmark, Download, Share2, Calendar,
  Users, Building, Tag, Sparkles, Brain, Zap, Target, Award, ArrowRight,
  BarChart3, PieChart, Activity, Layers, Globe, Shield, Heart, Stethoscope,
  ChevronLeft, X, ArrowUpRight, Check, Plus
} from 'lucide-react';
import { useSpecialty, MedicalSpecialty } from '../../stores/useAppStore';

// Enhanced Knowledge base data structure
interface KnowledgeBaseResource {
  id: string;
  title: string;
  category: 'book' | 'guideline';
  year?: number;
  authors?: string[];
  organization?: string;
  description?: string;
  tags?: string[];
  rating?: number;
  citations?: number;
  views?: number;
  lastUpdated?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  readTime?: number;
  featured?: boolean;
  trending?: boolean;
  bookmarked?: boolean;
  downloadUrl?: string;
}

// Enhanced Cardiology Knowledge Base Data with additional metadata
const cardiologyResources: KnowledgeBaseResource[] = [
  // Books
  {
    id: 'cardio-book-1',
    title: "Braunwald's Heart Disease: A Textbook of Cardiovascular Medicine, Eleventh Edition",
    category: 'book',
    authors: ['Douglas L. Mann', 'Douglas P. Zipes', 'Peter Libby', 'Robert O. Bonow'],
    description: 'The definitive textbook on cardiovascular medicine with comprehensive coverage of all aspects of heart disease.',
    tags: ['comprehensive', 'textbook', 'reference', 'cardiology', 'heart disease'],
    rating: 4.9,
    citations: 15420,
    views: 89300,
    lastUpdated: '2024-01-15',
    difficulty: 'advanced',
    readTime: 2400,
    featured: true,
    trending: true
  },
  {
    id: 'cardio-book-2',
    title: 'Clinical Cardiology: Current Practice Guidelines',
    category: 'book',
    description: 'Current practice guidelines for clinical cardiology with evidence-based approaches',
    tags: ['guidelines', 'clinical', 'practice', 'evidence-based'],
    rating: 4.7,
    citations: 8900,
    views: 34500,
    lastUpdated: '2024-01-10',
    difficulty: 'intermediate',
    readTime: 180,
    trending: true
  },
  {
    id: 'cardio-book-3',
    title: 'The ESC Textbook of Intensive and Acute Cardiovascular Care THIRD EDITION',
    category: 'book',
    organization: 'European Society of Cardiology',
    description: 'Comprehensive guide to intensive and acute cardiovascular care with latest protocols',
    tags: ['intensive care', 'acute care', 'ESC', 'emergency', 'protocols'],
    rating: 4.8,
    citations: 5600,
    views: 28700,
    lastUpdated: '2023-12-20',
    difficulty: 'advanced',
    readTime: 320,
    featured: true
  },
  {
    id: 'cardio-book-4',
    title: 'Practical Cardiovascular Medicine',
    category: 'book',
    authors: ['Elias B. Hanna'],
    year: 2022,
    description: 'Practical approach to cardiovascular medicine with real-world case studies',
    tags: ['practical', 'clinical', 'case studies'],
    rating: 4.6,
    citations: 3200,
    views: 19800,
    lastUpdated: '2024-01-05',
    difficulty: 'intermediate',
    readTime: 240,
    bookmarked: true
  },
  {
    id: 'cardio-book-5',
    title: 'Manual of Cardiovascular Medicine First edition',
    category: 'book',
    year: 2021,
    description: 'Concise manual of cardiovascular medicine for quick reference',
    tags: ['manual', 'reference', 'quick guide'],
    rating: 4.5,
    citations: 2100,
    views: 15600,
    lastUpdated: '2023-11-30',
    difficulty: 'beginner',
    readTime: 120
  },
  {
    id: 'cardio-book-6',
    title: 'Hurst\'s The Heart Manual of Cardiology',
    category: 'book',
    authors: ['Valentin Fuster', 'Richard A. Walsh', 'Robert A. Harrington'],
    year: 2023,
    description: 'Comprehensive manual covering all aspects of cardiovascular medicine',
    tags: ['comprehensive', 'manual', 'clinical'],
    rating: 4.7,
    citations: 4800,
    views: 23400,
    lastUpdated: '2024-01-12',
    difficulty: 'intermediate',
    readTime: 280,
    trending: true
  },
  {
    id: 'cardio-book-7',
    title: 'Topol\'s Textbook of Interventional Cardiology',
    category: 'book',
    authors: ['Eric J. Topol'],
    year: 2022,
    description: 'Leading textbook on interventional cardiology procedures and techniques',
    tags: ['interventional', 'procedures', 'catheterization'],
    rating: 4.8,
    citations: 6700,
    views: 31200,
    lastUpdated: '2023-12-15',
    difficulty: 'advanced',
    readTime: 450,
    featured: true
  },
  {
    id: 'cardio-book-8',
    title: 'Echocardiography: A Practical Guide for Reporting',
    category: 'book',
    authors: ['Catherine M. Otto'],
    year: 2023,
    description: 'Practical guide for echocardiography interpretation and reporting',
    tags: ['echocardiography', 'imaging', 'reporting'],
    rating: 4.6,
    citations: 2900,
    views: 18500,
    lastUpdated: '2024-01-08',
    difficulty: 'intermediate',
    readTime: 200
  },
  {
    id: 'cardio-book-9',
    title: 'Heart Failure: A Comprehensive Guide to Diagnosis and Treatment',
    category: 'book',
    authors: ['Douglas L. Mann', 'Michael R. Bristow'],
    year: 2024,
    description: 'Complete guide to heart failure management and treatment strategies',
    tags: ['heart failure', 'treatment', 'management'],
    rating: 4.7,
    citations: 3400,
    views: 21800,
    lastUpdated: '2024-01-18',
    difficulty: 'advanced',
    readTime: 320,
    trending: true,
    bookmarked: true
  },
  {
    id: 'cardio-book-10',
    title: 'Cardiac Electrophysiology: From Cell to Bedside',
    category: 'book',
    authors: ['Douglas P. Zipes', 'José Jalife'],
    year: 2023,
    description: 'Comprehensive textbook on cardiac electrophysiology and arrhythmias',
    tags: ['electrophysiology', 'arrhythmias', 'cellular'],
    rating: 4.9,
    citations: 8900,
    views: 42300,
    lastUpdated: '2023-12-22',
    difficulty: 'advanced',
    readTime: 560,
    featured: true
  },
  {
    id: 'cardio-book-11',
    title: 'Cardiovascular Magnetic Resonance Imaging',
    category: 'book',
    authors: ['Warren J. Manning', 'Dudley J. Pennell'],
    year: 2022,
    description: 'Advanced imaging techniques in cardiovascular magnetic resonance',
    tags: ['MRI', 'imaging', 'diagnosis'],
    rating: 4.5,
    citations: 2800,
    views: 16900,
    lastUpdated: '2023-11-28',
    difficulty: 'advanced',
    readTime: 380
  },
  {
    id: 'cardio-book-12',
    title: 'Pediatric Cardiology for Practitioners',
    category: 'book',
    authors: ['Myung K. Park'],
    year: 2023,
    description: 'Essential guide to pediatric cardiovascular conditions and treatments',
    tags: ['pediatric', 'congenital', 'children'],
    rating: 4.6,
    citations: 3100,
    views: 19700,
    lastUpdated: '2024-01-14',
    difficulty: 'intermediate',
    readTime: 290
  },

  // Guidelines
  {
    id: 'cardio-guideline-1',
    title: '2020 ESC Guidelines for the diagnosis and management of atrial fibrillation developed in collaboration with the European Association for Cardio-Thoracic Surgery (EACTS)',
    category: 'guideline',
    year: 2020,
    organization: 'European Society of Cardiology',
    description: 'Comprehensive guidelines for atrial fibrillation management with latest evidence',
    tags: ['atrial fibrillation', 'ESC', 'EACTS', 'arrhythmia', 'management'],
    rating: 4.9,
    citations: 12800,
    views: 156000,
    lastUpdated: '2024-01-18',
    difficulty: 'intermediate',
    readTime: 90,
    featured: true,
    trending: true
  },
  {
    id: 'cardio-guideline-2',
    title: '2021 ESC Guidelines on cardiac pacing and cardiac resynchronization therapy',
    category: 'guideline',
    year: 2021,
    organization: 'European Society of Cardiology',
    description: 'Guidelines for cardiac pacing and CRT with implementation strategies',
    tags: ['pacing', 'CRT', 'ESC', 'device therapy', 'implantable devices'],
    rating: 4.8,
    citations: 7200,
    views: 89000,
    lastUpdated: '2024-01-12',
    difficulty: 'advanced',
    readTime: 75,
    featured: true
  },
  {
    id: 'cardio-guideline-3',
    title: '2023 ESC Guidelines for the management of cardiomyopathies',
    category: 'guideline',
    year: 2023,
    organization: 'European Society of Cardiology',
    description: 'Updated guidelines for cardiomyopathy management and treatment protocols',
    tags: ['cardiomyopathies', 'ESC', 'heart muscle disease'],
    rating: 4.7,
    citations: 4100,
    views: 67000,
    lastUpdated: '2024-01-08',
    difficulty: 'intermediate',
    readTime: 85,
    trending: true,
    bookmarked: true
  },
  {
    id: 'cardio-guideline-4',
    title: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure',
    category: 'guideline',
    year: 2022,
    organization: 'American Heart Association',
    description: 'Comprehensive guidelines for heart failure diagnosis and management',
    tags: ['heart failure', 'AHA', 'ACC', 'HFSA', 'management'],
    rating: 4.8,
    citations: 9500,
    views: 124000,
    lastUpdated: '2024-01-16',
    difficulty: 'intermediate',
    readTime: 110,
    featured: true,
    trending: true
  },
  {
    id: 'cardio-guideline-5',
    title: '2021 ACC/AHA/SCAI Guideline for Coronary Artery Revascularization',
    category: 'guideline',
    year: 2021,
    organization: 'American College of Cardiology',
    description: 'Guidelines for coronary revascularization procedures and patient selection',
    tags: ['revascularization', 'PCI', 'CABG', 'coronary', 'ACC'],
    rating: 4.7,
    citations: 6800,
    views: 78500,
    lastUpdated: '2024-01-11',
    difficulty: 'advanced',
    readTime: 95,
    featured: true
  },
  {
    id: 'cardio-guideline-6',
    title: '2020 ESC Guidelines for the diagnosis and management of acute coronary syndromes without persistent ST-segment elevation',
    category: 'guideline',
    year: 2020,
    organization: 'European Society of Cardiology',
    description: 'Management of non-ST elevation acute coronary syndromes',
    tags: ['NSTEMI', 'ACS', 'acute', 'coronary', 'ESC'],
    rating: 4.8,
    citations: 11200,
    views: 145000,
    lastUpdated: '2024-01-14',
    difficulty: 'intermediate',
    readTime: 85,
    trending: true
  },
  {
    id: 'cardio-guideline-7',
    title: '2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension',
    category: 'guideline',
    year: 2022,
    organization: 'European Society of Cardiology',
    description: 'Comprehensive guidelines for pulmonary hypertension management',
    tags: ['pulmonary hypertension', 'ESC', 'ERS', 'treatment'],
    rating: 4.6,
    citations: 5400,
    views: 67800,
    lastUpdated: '2024-01-09',
    difficulty: 'advanced',
    readTime: 100,
    bookmarked: true
  },
  {
    id: 'cardio-guideline-8',
    title: '2021 ESC Guidelines on cardiovascular disease prevention in clinical practice',
    category: 'guideline',
    year: 2021,
    organization: 'European Society of Cardiology',
    description: 'Prevention strategies for cardiovascular disease in clinical practice',
    tags: ['prevention', 'CVD', 'risk factors', 'lifestyle'],
    rating: 4.7,
    citations: 8700,
    views: 98500,
    lastUpdated: '2024-01-13',
    difficulty: 'beginner',
    readTime: 70,
    trending: true
  },
  {
    id: 'cardio-guideline-9',
    title: '2020 ACC/AHA Guideline for the Management of Patients With Valvular Heart Disease',
    category: 'guideline',
    year: 2020,
    organization: 'American College of Cardiology',
    description: 'Comprehensive management of valvular heart disease',
    tags: ['valvular', 'heart disease', 'ACC', 'AHA', 'valve'],
    rating: 4.8,
    citations: 7900,
    views: 89600,
    lastUpdated: '2024-01-17',
    difficulty: 'intermediate',
    readTime: 105,
    featured: true
  },
  {
    id: 'cardio-guideline-10',
    title: '2023 ESC Guidelines for the management of endocarditis',
    category: 'guideline',
    year: 2023,
    organization: 'European Society of Cardiology',
    description: 'Updated guidelines for infective endocarditis diagnosis and treatment',
    tags: ['endocarditis', 'infection', 'ESC', 'antibiotic'],
    rating: 4.6,
    citations: 3200,
    views: 45600,
    lastUpdated: '2024-01-19',
    difficulty: 'advanced',
    readTime: 80,
    trending: true,
    bookmarked: true
  },
  {
    id: 'cardio-guideline-11',
    title: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure in Children and Adults With Congenital Heart Disease',
    category: 'guideline',
    year: 2022,
    organization: 'American Heart Association',
    description: 'Specialized guidelines for heart failure in congenital heart disease',
    tags: ['congenital', 'pediatric', 'heart failure', 'AHA'],
    rating: 4.5,
    citations: 2800,
    views: 34500,
    lastUpdated: '2024-01-06',
    difficulty: 'advanced',
    readTime: 90
  },
  {
    id: 'cardio-guideline-12',
    title: '2021 ESC Guidelines on Sports Cardiology and Exercise in Patients with Cardiovascular Disease',
    category: 'guideline',
    year: 2021,
    organization: 'European Society of Cardiology',
    description: 'Guidelines for exercise and sports participation in cardiac patients',
    tags: ['sports', 'exercise', 'cardiology', 'rehabilitation'],
    rating: 4.4,
    citations: 4200,
    views: 56700,
    lastUpdated: '2024-01-04',
    difficulty: 'intermediate',
    readTime: 65
  }
];

// Enhanced OB/GYN Knowledge Base Data
const obgynResources: KnowledgeBaseResource[] = [
  {
    id: 'obgyn-guideline-1',
    title: 'Systemic Treatment of Patients with Metastatic Breast Cancer: ASCO Resource-Stratified Guideline',
    category: 'guideline',
    authors: ['Al-Sukhun et al.'],
    year: 2024,
    organization: 'ASCO',
    description: 'Evidence-based guidelines for metastatic breast cancer treatment strategies',
    tags: ['breast cancer', 'metastatic', 'ASCO', 'oncology', 'treatment'],
    rating: 4.8,
    citations: 2400,
    views: 45000,
    lastUpdated: '2024-01-20',
    difficulty: 'advanced',
    readTime: 60,
    featured: true,
    trending: true
  },
  {
    id: 'obgyn-guideline-2',
    title: 'ACOG Practice Bulletin: Hypertensive Disorders of Pregnancy',
    category: 'guideline',
    year: 2024,
    organization: 'ACOG',
    description: 'Comprehensive management of hypertensive disorders in pregnancy',
    tags: ['hypertension', 'pregnancy', 'ACOG', 'preeclampsia', 'maternal health'],
    rating: 4.9,
    citations: 8900,
    views: 123000,
    lastUpdated: '2024-01-15',
    difficulty: 'intermediate',
    readTime: 45,
    featured: true,
    bookmarked: true
  },
  {
    id: 'obgyn-guideline-3',
    title: 'WHO Recommendations on Antenatal Care for a Positive Pregnancy Experience',
    category: 'guideline',
    year: 2024,
    organization: 'WHO',
    description: 'Global recommendations for quality antenatal care and maternal wellness',
    tags: ['antenatal care', 'WHO', 'pregnancy', 'maternal health', 'guidelines'],
    rating: 4.7,
    citations: 6700,
    views: 89000,
    lastUpdated: '2024-01-10',
    difficulty: 'beginner',
    readTime: 40,
    trending: true
  }
];

type ViewMode = 'grid' | 'list' | 'cards';
type SortBy = 'title' | 'year' | 'rating' | 'citations' | 'views' | 'trending' | 'relevance';
type FilterBy = 'all' | 'featured' | 'trending' | 'bookmarked' | 'recent';

export const CuratedKnowledgeBasePage: React.FC = () => {
  const { specialty } = useSpecialty();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'book' | 'guideline'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedFilter, setSelectedFilter] = useState<FilterBy>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState<KnowledgeBaseResource | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Animation states
  const [animationDelay, setAnimationDelay] = useState(0);

  // Get resources based on specialty
  const resources = specialty === MedicalSpecialty.CARDIOLOGY ? cardiologyResources : obgynResources;

  // Enhanced filtering with search history
  const filteredResources = useMemo(() => {
    const filtered = resources.filter(resource => {
      // Search filter with enhanced matching
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description?.toLowerCase().includes(searchLower) ||
        resource.organization?.toLowerCase().includes(searchLower) ||
        resource.authors?.some(author => author.toLowerCase().includes(searchLower)) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchLower));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;

      // Special filters
      const matchesFilter = selectedFilter === 'all' ||
        (selectedFilter === 'featured' && resource.featured) ||
        (selectedFilter === 'trending' && resource.trending) ||
        (selectedFilter === 'bookmarked' && resource.bookmarked) ||
        (selectedFilter === 'recent' && resource.year && resource.year >= 2023);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesFilter;
    });

    // Enhanced sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'citations':
          return (b.citations || 0) - (a.citations || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'trending':
          return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
        case 'relevance':
        default:
          // Complex relevance scoring
          const scoreA = (a.rating || 0) * 0.3 + (a.citations || 0) * 0.0001 + (a.views || 0) * 0.00001 + (a.featured ? 10 : 0) + (a.trending ? 5 : 0);
          const scoreB = (b.rating || 0) * 0.3 + (b.citations || 0) * 0.0001 + (b.views || 0) * 0.00001 + (b.featured ? 10 : 0) + (b.trending ? 5 : 0);
          return scoreB - scoreA;
      }
    });

    return filtered;
  }, [resources, searchTerm, selectedCategory, selectedDifficulty, selectedFilter, sortBy]);

  // Statistics for data visualization
  const stats = useMemo(() => {
    const totalResources = resources.length;
    const totalBooks = resources.filter(r => r.category === 'book').length;
    const totalGuidelines = resources.filter(r => r.category === 'guideline').length;
    const featuredCount = resources.filter(r => r.featured).length;
    const trendingCount = resources.filter(r => r.trending).length;
    const avgRating = resources.reduce((sum, r) => sum + (r.rating || 0), 0) / resources.filter(r => r.rating).length;
    const totalCitations = resources.reduce((sum, r) => sum + (r.citations || 0), 0);
    const totalViews = resources.reduce((sum, r) => sum + (r.views || 0), 0);

    return {
      totalResources,
      totalBooks,
      totalGuidelines,
      featuredCount,
      trendingCount,
      avgRating: Math.round(avgRating * 10) / 10,
      totalCitations,
      totalViews
    };
  }, [resources]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const suggestions = new Set<string>();
    resources.forEach(resource => {
      // Add tag suggestions
      resource.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm.toLowerCase()) && tag.toLowerCase() !== searchTerm.toLowerCase()) {
          suggestions.add(tag);
        }
      });
      // Add organization suggestions
      if (resource.organization?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          resource.organization.toLowerCase() !== searchTerm.toLowerCase()) {
        suggestions.add(resource.organization);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [searchTerm, resources]);

  // Debounced search for better performance
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev].slice(0, 10));
    }
  }, [searchHistory]);

  const specialtyName = specialty === MedicalSpecialty.CARDIOLOGY ? 'Cardiology' : 'OB/GYN';
  // Updated to use consistent blue theme colors for all specialties
  const specialtyColors = specialty === MedicalSpecialty.CARDIOLOGY ? 
    { primary: '#1a365d', secondary: '#2b6cb0', accent: '#63b3ed' } : 
    { primary: '#2b6cb0', secondary: '#63b3ed', accent: '#90cdf4' };

  // Simulate loading for dramatic effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [specialty]);

  if (isLoading) {
    return <LoadingState specialtyColors={specialtyColors} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 lg:px-4 py-4">
        {/* Compact Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-102' : ''}`}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Search ${specialtyName.toLowerCase()} resources, authors, organizations...`}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full pl-12 pr-4 py-4 min-h-[48px] text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#63b3ed] transition-all duration-300 placeholder-gray-500"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#63b3ed]" />
            </div>
          </div>

          {/* Search Suggestions */}
          {searchTerm && searchSuggestions.length > 0 && searchFocused && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-colors text-sm"
                >
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Compact Filter Controls - Mobile Optimized */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {['all', 'featured', 'trending', 'bookmarked', 'recent'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter as FilterBy)}
                  className={`px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
                    selectedFilter === filter
                      ? 'bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  }`}
                >
                  {filter === 'featured' && <Star className="w-3 h-3" />}
                  {filter === 'trending' && <TrendingUp className="w-3 h-3" />}
                  {filter === 'bookmarked' && <Bookmark className="w-3 h-3" />}
                  {filter === 'recent' && <Clock className="w-3 h-3" />}
                  <span className="capitalize">{filter}</span>
                  {filter !== 'all' && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {filteredResources.filter(r => {
                        switch(filter) {
                          case 'featured': return r.featured;
                          case 'trending': return r.trending;
                          case 'bookmarked': return r.bookmarked;
                          case 'recent': return r.year && r.year >= 2023;
                          default: return true;
                        }
                      }).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* View Controls - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full sm:w-auto px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#63b3ed]/20 focus:border-[#63b3ed] cursor-pointer appearance-none pr-8 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="citations">Most Cited</option>
                  <option value="views">Most Viewed</option>
                  <option value="year">Newest</option>
                  <option value="trending">Trending</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 min-h-[44px]">
                {[
                  { mode: 'cards', icon: Layers },
                  { mode: 'grid', icon: Grid },
                  { mode: 'list', icon: List }
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as ViewMode)}
                    className={`p-3 min-h-[40px] min-w-[40px] rounded-md transition-all duration-200 flex items-center justify-center ${
                      viewMode === mode 
                        ? 'bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white shadow-sm' 
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredResources.length} Resources Found
            </h2>
            {searchTerm && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-[#63b3ed]/10 rounded-full">
                <Search className="w-3 h-3 text-[#1a365d]" />
                <span className="text-sm text-[#1a365d] font-medium">
                  <strong>"{searchTerm}"</strong>
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-0.5 hover:bg-[#63b3ed]/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-[#1a365d]" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Avg {stats.avgRating}/5.0</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>{stats.trendingCount} trending</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bookmark className="w-4 h-4 text-[#2b6cb0]" />
              <span>{resources.filter(r => r.bookmarked).length} bookmarked</span>
            </div>
          </div>
        </div>

        {/* Resources Display - 5 per row */}
        {filteredResources.length > 0 ? (
          <ResourcesGrid 
            resources={filteredResources} 
            viewMode={viewMode}
            specialtyColors={specialtyColors}
            onResourceSelect={setSelectedResource}
          />
        ) : (
          <EmptyState 
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
            specialtyColors={specialtyColors}
          />
        )}
      </div>

      {/* Resource Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
          specialtyColors={specialtyColors}
        />
      )}
    </div>
  );
};

// Loading State Component
interface LoadingStateProps {
  specialtyColors: { primary: string; secondary: string; accent: string };
}

const LoadingState: React.FC<LoadingStateProps> = ({ specialtyColors }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-12 h-12 border-4 border-[#63b3ed]/30 rounded-full animate-spin">
            <div className="w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#1a365d] animate-pulse" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Loading Knowledge Base</h2>
        <p className="text-gray-600 text-sm">Preparing your medical resources...</p>
      </div>
    </div>
  );
};

// Resources Grid Component
interface ResourcesGridProps {
  resources: KnowledgeBaseResource[];
  viewMode: ViewMode;
  specialtyColors: { primary: string; secondary: string; accent: string };
  onResourceSelect: (resource: KnowledgeBaseResource) => void;
}

const ResourcesGrid: React.FC<ResourcesGridProps> = ({ 
  resources, 
  viewMode, 
  specialtyColors, 
  onResourceSelect 
}) => {
  return (
    <div className={
      viewMode === 'cards' 
        ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
        : viewMode === 'grid'
        ? 'grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
        : 'space-y-3'
    }>
      {resources.map((resource, index) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          viewMode={viewMode}
          specialtyColors={specialtyColors}
          onSelect={() => onResourceSelect(resource)}
          animationDelay={index * 50}
        />
      ))}
    </div>
  );
};

// Enhanced Resource Card Component
interface ResourceCardProps {
  resource: KnowledgeBaseResource;
  viewMode: ViewMode;
  specialtyColors: { primary: string; secondary: string; accent: string };
  onSelect: () => void;
  animationDelay: number;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  viewMode, 
  specialtyColors, 
  onSelect,
  animationDelay 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === 'list') {
    return (
      <div 
        className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.01]"
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className={resource.category === 'book' ? 'p-1.5 rounded-md bg-[#63b3ed]/20' : 'p-1.5 rounded-md bg-[#2b6cb0]/20'}>
                {resource.category === 'book' ? (
                  <BookOpen className="w-4 h-4 text-[#1a365d]" />
                ) : (
                  <FileText className="w-4 h-4 text-[#2b6cb0]" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={resource.category === 'book' ? 'px-2 py-1 bg-[#63b3ed]/20 text-[#1a365d] rounded-full text-xs font-medium' : 'px-2 py-1 bg-[#2b6cb0]/20 text-[#1a365d] rounded-full text-xs font-medium'}>
                  {resource.category === 'book' ? 'Book' : 'Guideline'}
                </span>
                {resource.featured && (
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-medium flex items-center space-x-1">
                    <Star className="w-2.5 h-2.5" />
                    <span>Featured</span>
                  </span>
                )}
                {resource.trending && (
                  <span className="px-2 py-1 bg-gradient-to-r from-[#2b6cb0] to-[#63b3ed] text-white rounded-full text-xs font-medium flex items-center space-x-1">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>Trending</span>
                  </span>
                )}
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 text-sm group-hover:text-[#1a365d] transition-colors line-clamp-2">
              {resource.title}
            </h3>
            
            <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
              {resource.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="font-medium">{resource.rating}</span>
                </div>
              )}
              {resource.citations && (
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-3 h-3 text-[#2b6cb0]" />
                  <span>{resource.citations.toLocaleString()} citations</span>
                </div>
              )}
              {resource.views && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3 text-green-500" />
                  <span>{resource.views.toLocaleString()} views</span>
                </div>
              )}
            </div>

            {resource.description && (
              <p className="text-gray-600 mb-2 line-clamp-2 text-xs">{resource.description}</p>
            )}

            {resource.tags && (
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                    +{resource.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end space-y-2">
            {resource.year && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {resource.year}
              </span>
            )}
            <button 
              className={`p-1.5 rounded-md bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white hover:shadow-lg transition-all duration-200 ${isHovered ? 'scale-110' : ''}`}
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
        viewMode === 'cards' 
          ? 'h-full hover:scale-105 hover:-translate-y-1' 
          : 'hover:scale-[1.02]'
      }`}
      style={{ 
        animationDelay: `${animationDelay}ms`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0px)'
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header */}
      <div className={`h-16 relative overflow-hidden ${
        resource.category === 'book' 
          ? 'bg-gradient-to-r from-[#1a365d] to-[#63b3ed]' 
          : 'bg-gradient-to-r from-[#2b6cb0] to-[#1a365d]'
      }`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative p-3 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              {resource.category === 'book' ? (
                <BookOpen className="w-4 h-4 text-white" />
              ) : (
                <FileText className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <span className="text-white/90 text-xs font-medium">
                {resource.category === 'book' ? 'Medical Book' : 'Clinical Guideline'}
              </span>
              {resource.year && (
                <div className="text-white/70 text-xs">{resource.year}</div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {resource.featured && (
              <div className="p-1 bg-yellow-500/20 rounded-md backdrop-blur-sm">
                <Star className="w-3 h-3 text-yellow-200 fill-current" />
              </div>
            )}
            {resource.trending && (
              <div className="p-1 bg-pink-500/20 rounded-md backdrop-blur-sm">
                <TrendingUp className="w-3 h-3 text-pink-200" />
              </div>
            )}
            {resource.bookmarked && (
              <div className="p-1 bg-[#2b6cb0]/20 rounded-md backdrop-blur-sm">
                <Bookmark className="w-3 h-3 text-white fill-current" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-[#1a365d] transition-colors line-clamp-2">
            {resource.title}
          </h3>
          
          <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
            {resource.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="font-semibold text-sm">{resource.rating}/5.0</span>
              </div>
            )}
            {resource.citations && (
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-3 h-3 text-[#2b6cb0]" />
                <span className="font-semibold text-sm">{resource.citations.toLocaleString()}</span>
              </div>
            )}
            {resource.views && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3 text-green-500" />
                <span className="font-semibold text-sm">{resource.views.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {resource.authors && (
          <div className="mb-2">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Authors:</span> {resource.authors.slice(0, 1).join(', ')}{resource.authors.length > 1 && '...'}
            </p>
          </div>
        )}

        {resource.organization && (
          <div className="mb-2">
            <div className="flex items-center space-x-1">
              <Building className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600 font-medium">{resource.organization}</span>
            </div>
          </div>
        )}

        {resource.description && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-2">{resource.description}</p>
        )}

        {/* Difficulty Badge */}
        {resource.difficulty && (
          <div className="mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              resource.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {resource.difficulty}
            </span>
          </div>
        )}

        {/* Tags */}
        {resource.tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                {tag}
              </span>
            ))}
            {resource.tags.length > 2 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                +{resource.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {resource.readTime && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{resource.readTime} min</span>
              </div>
            )}
            {resource.lastUpdated && (
              <div className="text-xs text-gray-400">
                Updated {new Date(resource.lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
          
          <button className={`p-1.5 rounded-lg bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white hover:shadow-lg transition-all duration-300 ${
            isHovered ? 'scale-110 rotate-12' : ''
          }`}>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  searchTerm: string;
  onClearSearch: () => void;
  specialtyColors: { primary: string; secondary: string; accent: string };
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchTerm, onClearSearch, specialtyColors }) => {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3">No resources found</h3>
      
      {searchTerm ? (
        <div>
          <p className="text-gray-600 mb-4">
            We couldn't find any resources matching <strong>"{searchTerm}"</strong>
          </p>
          <div className="space-y-3">
            <button
              onClick={onClearSearch}
              className="px-6 py-2 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-sm"
            >
              Clear search and browse all resources
            </button>
            <div className="text-sm text-gray-500">
              <p>Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {['guidelines', 'cardiology', 'ESC', 'ACOG', 'textbook'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => onClearSearch()}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors text-xs"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">
          No resources match your current filters. Try adjusting your search criteria.
        </p>
      )}
    </div>
  );
};

// Resource Detail Modal Component
interface ResourceDetailModalProps {
  resource: KnowledgeBaseResource;
  onClose: () => void;
  specialtyColors: { primary: string; secondary: string; accent: string };
}

const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({ 
  resource, 
  onClose, 
  specialtyColors 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className={`h-32 relative overflow-hidden ${
          resource.category === 'book' 
            ? 'bg-gradient-to-r from-[#1a365d] to-[#63b3ed]' 
            : 'bg-gradient-to-r from-[#2b6cb0] to-[#1a365d]'
        }`}>
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative p-6 h-full flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {resource.category === 'book' ? (
                  <BookOpen className="w-6 h-6 text-white" />
                ) : (
                  <FileText className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white mb-1 line-clamp-2">
                  {resource.title}
                </h1>
                <div className="flex items-center space-x-3 text-white/80">
                  <span className="text-sm">
                    {resource.category === 'book' ? 'Medical Book' : 'Clinical Guideline'}
                  </span>
                  {resource.year && <span className="text-sm">{resource.year}</span>}
                  {resource.organization && (
                    <span className="text-sm">{resource.organization}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-128px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Description */}
              {resource.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{resource.description}</p>
                </div>
              )}

              {/* Authors */}
              {resource.authors && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Authors</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.authors.map(author => (
                      <span key={author} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                        {author}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {resource.tags && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-[#63b3ed]/20 text-[#1a365d] rounded-md text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Resource Stats</h3>
                <div className="space-y-3">
                  {resource.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-sm">{resource.rating}/5.0</span>
                      </div>
                    </div>
                  )}
                  {resource.citations && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Citations</span>
                      <span className="font-semibold text-sm">{resource.citations.toLocaleString()}</span>
                    </div>
                  )}
                  {resource.views && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Views</span>
                      <span className="font-semibold text-sm">{resource.views.toLocaleString()}</span>
                    </div>
                  )}
                  {resource.difficulty && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Difficulty</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        resource.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {resource.difficulty}
                      </span>
                    </div>
                  )}
                  {resource.readTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Read Time</span>
                      <span className="font-semibold text-sm">{resource.readTime} min</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button className="w-full py-2 px-3 bg-gradient-to-r from-[#1a365d] to-[#2b6cb0] text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>Open Resource</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 px-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1 text-sm">
                    <Bookmark className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                  <button className="py-2 px-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1 text-sm">
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Last Updated */}
              {resource.lastUpdated && (
                <div className="text-xs text-gray-500 text-center">
                  Last updated: {new Date(resource.lastUpdated).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratedKnowledgeBasePage;