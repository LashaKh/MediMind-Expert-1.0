import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Award,
  Shield,
  Activity,
  AlertTriangle,
  Users,
  BookOpen,
  Stethoscope,
  Heart,
  Star,
  Globe,
  Target,
  Zap,
  Eye,
  Share2,
  Bookmark
} from 'lucide-react';
import { getDiseaseById, MarkdownDiseaseItem } from './MarkdownDiseaseRegistry';
import { InteractiveMarkdownViewer } from './InteractiveMarkdownViewer';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';

export const SimpleDiseasePage: React.FC = () => {
  const { diseaseId } = useParams<{ diseaseId: string }>();
  const navigate = useNavigate();
  const [disease, setDisease] = useState<MarkdownDiseaseItem | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const loadDisease = async () => {
      if (!diseaseId) {
        setError('Disease ID not provided');
        setLoading(false);
        return;
      }

      // Get disease metadata from registry
      const diseaseData = getDiseaseById(diseaseId);
      if (!diseaseData) {
        setError('Disease not found');
        setLoading(false);
        return;
      }

      setDisease(diseaseData);

      const [content, markdownError] = await safeAsync(
        async () => {
          const response = await fetch(diseaseData.markdownFile);
          if (!response.ok) {
            throw new Error(`Failed to load markdown file: ${response.statusText}`);
          }
          return await response.text();
        },
        { 
          context: 'load disease markdown content',
          severity: ErrorSeverity.MEDIUM,
          showToast: true
        }
      );

      if (markdownError) {
        setError(`Failed to load disease content: ${markdownError.userMessage}`);
      } else {
        setMarkdownContent(content);
      }
      
      setLoading(false);
    };

    loadDisease();
  }, [diseaseId]);

  const handleBackClick = () => {
    navigate('/diseases');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: disease?.title || 'Medical Document',
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high': 
        return { 
          color: 'bg-gradient-to-r from-red-500 to-pink-600', 
          textColor: 'text-white',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle, 
          label: 'Critical Condition',
          description: 'Requires immediate medical attention',
          pulse: 'animate-pulse'
        };
      case 'medium': 
        return { 
          color: 'bg-gradient-to-r from-amber-500 to-orange-600', 
          textColor: 'text-white',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: Activity, 
          label: 'Moderate Severity',
          description: 'Requires careful monitoring',
          pulse: ''
        };
      case 'low': 
        return { 
          color: 'bg-gradient-to-r from-green-500 to-emerald-600', 
          textColor: 'text-white',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: Shield, 
          label: 'Stable Condition',
          description: 'Generally manageable',
          pulse: ''
        };
      default: 
        return { 
          color: 'bg-gradient-to-r from-gray-500 to-slate-600', 
          textColor: 'text-white',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: BookOpen, 
          label: 'Unknown',
          description: 'Severity not specified',
          pulse: ''
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryMap: { [key: string]: any } = {
      'cardiomyopathy': Heart,
      'electrophysiology': Zap,
      'heart failure': Activity,
      'valvular': Target,
      'emergency': Stethoscope,
      'electrolyte': Globe
    };
    
    const categoryKey = Object.keys(categoryMap).find(key => 
      category.toLowerCase().includes(key)
    );
    
    return categoryMap[categoryKey || ''] || BookOpen;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border border-blue-100">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <Stethoscope className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Medical Document</h3>
              <p className="text-gray-600 mb-2">Preparing clinical content...</p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !disease) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Diseases</span>
          </button>

          <div className="bg-white rounded-3xl shadow-2xl border border-red-200 p-12 text-center max-w-md mx-auto">
            <div className="bg-red-100 p-6 rounded-full w-fit mx-auto mb-8">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disease Not Found</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {error || 'The requested disease could not be found in our medical database.'}
            </p>
            <button
              onClick={handleBackClick}
              className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg"
            >
              Return to Disease List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const severityConfig = getSeverityConfig(disease.severity);
  const SeverityIcon = severityConfig.icon;
  const CategoryIcon = getCategoryIcon(disease.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full px-4 py-8">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="mb-8 flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-all group bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100 hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Diseases</span>
        </button>

        {/* Enhanced Disease Header */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mb-8">
          {/* Header Gradient Bar */}
          <div className={`h-2 ${severityConfig.color}`}></div>
          
          <div className="p-8">
            {/* Main Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-6 flex-1">
                {/* Category Icon */}
                <div className={`p-4 rounded-2xl ${severityConfig.bgColor} ${severityConfig.borderColor} border-2 shadow-sm`}>
                  <CategoryIcon className={`w-8 h-8 ${severityConfig.color.replace('bg-gradient-to-r', 'text').split(' ')[1].replace('to-pink-600', 'red-600').replace('to-orange-600', 'amber-600').replace('to-emerald-600', 'green-600').replace('to-slate-600', 'gray-600')}`} />
                </div>
                
                {/* Title and Category */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                    {disease.title}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl font-semibold text-sm border border-blue-200">
                      {disease.category}
                    </span>
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm">
                      {disease.specialty.charAt(0).toUpperCase() + disease.specialty.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Severity Badge */}
              <div className={`px-6 py-3 rounded-xl ${severityConfig.color} ${severityConfig.textColor} flex items-center space-x-3 shadow-lg ${severityConfig.pulse}`}>
                <SeverityIcon className="w-5 h-5" />
                <div className="text-right">
                  <div className="font-bold text-sm">{severityConfig.label}</div>
                  <div className="text-xs opacity-90">{severityConfig.description}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-lg leading-relaxed mb-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
              {disease.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
              {disease.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-sm rounded-xl flex items-center space-x-2 border border-indigo-200 font-medium hover:shadow-md transition-shadow"
                >
                  <Star className="w-4 h-4" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Read Time</span>
                </div>
                <p className="text-xl font-bold text-blue-900">{disease.readTime}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Last Updated</span>
                </div>
                <p className="text-xl font-bold text-green-900">{disease.lastUpdated}</p>
              </div>
              
              {disease.prevalence && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-800">Prevalence</span>
                  </div>
                  <p className="text-xl font-bold text-purple-900">{disease.prevalence}</p>
                </div>
              )}
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">Evidence Level</span>
                </div>
                <p className="text-xl font-bold text-amber-900">Grade A</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`px-6 py-3 rounded-xl transition-all flex items-center space-x-2 font-medium ${
                  bookmarked 
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>Professional medical content</span>
              </div>
            </div>
          </div>
        </div>

        {/* Markdown Content */}
        {markdownContent ? (
          <InteractiveMarkdownViewer 
            markdownContent={markdownContent}
            title={disease.title}
          />
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full w-fit mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Content Not Available</h3>
            <p className="text-gray-600 leading-relaxed">
              The clinical content for this disease is not yet available. Please check back later or contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDiseasePage; 