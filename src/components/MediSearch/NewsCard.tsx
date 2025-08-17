/**
 * NewsCard Component
 * Medical news article card with revolutionary design following MediSearch patterns
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarIcon,
  EyeIcon,
  ShareIcon,
  BookmarkIcon,
  HeartIcon,
  LinkIcon,
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon,
  TrophyIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import ShareModal from './ShareModal';
import type { MedicalNewsArticle } from '../../types/medicalNews';
import { useAuth } from '../../stores/useAppStore';
import { cn } from '../../lib/utils';

interface NewsCardProps {
  article: MedicalNewsArticle;
  className?: string;
  onShare?: (article: MedicalNewsArticle) => void;
  onBookmark?: (article: MedicalNewsArticle) => void;
  onLike?: (article: MedicalNewsArticle) => void;
  onInteraction?: (article: MedicalNewsArticle, type: 'click' | 'view') => void;
  isBookmarked?: boolean;
  isLiked?: boolean;
  viewMode?: 'grid' | 'list';
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  className = '',
  onShare,
  onBookmark,
  onLike,
  onInteraction,
  isBookmarked = false,
  isLiked = false,
  viewMode = 'grid'
}) => {
  const { user } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleClick = useCallback(() => {
    onInteraction?.(article, 'click');
    window.open(article.sourceUrl, '_blank', 'noopener,noreferrer');
  }, [article, onInteraction]);

  const handleShare = useCallback((article: MedicalNewsArticle, platform?: string, template?: string) => {
    onShare?.(article);
    setShareModalOpen(false);
  }, [onShare]);

  const handleBookmark = useCallback(() => {
    onBookmark?.(article);
  }, [article, onBookmark]);

  const handleLike = useCallback(() => {
    onLike?.(article);
  }, [article, onLike]);

  const getEvidenceLevel = useCallback((score: number, evidenceLevel: string | null) => {
    if (score >= 0.95 || evidenceLevel === 'systematic_review') return { 
      level: 'High Impact Study', 
      class: 'evidence-high-impact',
      icon: TrophyIcon,
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      glow: 'shadow-orange-500/50'
    };
    if (score >= 0.9 || evidenceLevel === 'rct') return { 
      level: 'Quality Research', 
      class: 'evidence-quality',
      icon: ArrowTrendingUpIcon,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      glow: 'shadow-emerald-500/50'
    };
    if (score >= 0.8 || evidenceLevel === 'cohort_study') return { 
      level: 'Clinical Evidence', 
      class: 'evidence-clinical',
      icon: BeakerIcon,
      gradient: 'from-blue-400 via-indigo-500 to-purple-500',
      glow: 'shadow-blue-500/50'
    };
    return { 
      level: 'Medical News', 
      class: 'evidence-news',
      icon: SparklesIcon,
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      glow: 'shadow-gray-500/50'
    };
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case 'research': return BeakerIcon;
      case 'drug_approvals': return SparklesIcon;
      case 'clinical_trials': return TrophyIcon;
      case 'guidelines': return AcademicCapIcon;
      case 'breaking_news': return FireIcon;
      default: return SparklesIcon;
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const evidence = getEvidenceLevel(article.relevanceScore, article.evidenceLevel);
  const EvidenceIcon = evidence.icon;
  const CategoryIcon = getCategoryIcon(article.category);

  // List view layout for mobile/compact display
  if (viewMode === 'list') {
    return (
      <Card 
        className={cn(
          "group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 touch-manipulation active:scale-98",
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-3 sm:gap-4">
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2 mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-900 transition-colors">
                  {article.title}
                </h3>
                <div className="flex gap-1 justify-end flex-shrink-0">
                  {user && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleLike(); }}
                        className={cn(
                          "p-1.5 h-auto min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center",
                          isLiked ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
                        )}
                      >
                        {isLiked ? <HeartSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
                        className={cn(
                          "p-1.5 h-auto min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center",
                          isBookmarked ? "text-blue-500 hover:text-blue-600" : "text-gray-400 hover:text-blue-500"
                        )}
                      >
                        {isBookmarked ? <BookmarkSolid className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setShareModalOpen(true); }}
                    className="p-1.5 h-auto min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center text-gray-400 hover:text-gray-600"
                    title="Share article"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed text-base">
                {article.summary}
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium truncate">{article.sourceName}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="whitespace-nowrap">{formatDate(article.publishedDate)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {article.category.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view layout for desktop and larger screens
  return (
    <Card 
      className={cn(
        "group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden touch-manipulation active:scale-98",
        className
      )}
      onClick={handleClick}
    >
      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${evidence.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <CardHeader className="relative z-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-4">
          <div className="flex-1 w-full">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-indigo-900 transition-colors duration-200 line-clamp-3">
              {article.title}
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 mb-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${evidence.gradient} text-white rounded-full text-sm font-semibold shadow-lg ${evidence.glow}`}>
                <EvidenceIcon className="w-4 h-4" />
                <span>{evidence.level}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {Math.round(article.relevanceScore * 100)}%
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(article.publishedDate)}</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0 w-full lg:w-auto justify-end">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleLike(); }}
                  className={cn(
                    "p-2 transition-all duration-200 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center",
                    isLiked 
                      ? "text-red-500 bg-red-50 hover:bg-red-100" 
                      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  )}
                  title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isLiked ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleBookmark(); }}
                  className={cn(
                    "p-2 transition-all duration-200 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center",
                    isBookmarked 
                      ? "text-blue-500 bg-blue-50 hover:bg-blue-100" 
                      : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                  )}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                >
                  {isBookmarked ? <BookmarkSolid className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setShareModalOpen(true); }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
              title="Share article"
            >
              <ShareIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 pt-0">
        {/* Content */}
        <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base line-clamp-3">
          {article.summary}
        </p>
        
        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="outline" className="text-xs">
            <CategoryIcon className="w-3 h-3 mr-1" />
            {article.category.replace('_', ' ')}
          </Badge>
          
          {article.specialty && (
            <Badge variant="outline" className="text-xs">
              <BeakerIcon className="w-3 h-3 mr-1" />
              {article.specialty}
            </Badge>
          )}
          
          {article.contentType && (
            <Badge variant="outline" className="text-xs">
              <AcademicCapIcon className="w-3 h-3 mr-1" />
              {article.contentType.replace('_', ' ')}
            </Badge>
          )}
          
          {article.engagementScore > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ArrowTrendingUpIcon className="w-3 h-3" />
              <span>{Math.round(article.engagementScore)} engagement</span>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 text-gray-600 text-sm min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <LinkIcon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-gray-900 truncate">{article.sourceName}</span>
              </div>
              
              {article.clickCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <EyeIcon className="w-3 h-3" />
                  <span>{article.clickCount}</span>
                </div>
              )}
            </div>
            
            <button
              className="sm:ml-3 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 flex-shrink-0 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); handleClick(); }}
              title="Read full article"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
      
      {/* Enhanced Share Modal */}
      <ShareModal
        article={article}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onShare={handleShare}
      />
    </Card>
  );
};

export default NewsCard;