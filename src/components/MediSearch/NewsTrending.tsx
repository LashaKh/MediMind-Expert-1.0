/**
 * NewsTrending Component
 * Displays trending news sidebar/section with high-engagement content
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FireIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { MedicalNewsArticle } from '../../types/medicalNews';
import { cn } from '../../lib/utils';

interface NewsTrendingProps {
  articles: MedicalNewsArticle[];
  isLoading: boolean;
  error: string | null;
  specialty?: string;
  timeframe?: string;
  className?: string;
  onArticleClick?: (article: MedicalNewsArticle) => void;
  onRefresh?: () => void;
  compact?: boolean;
}

export const NewsTrending: React.FC<NewsTrendingProps> = ({
  articles,
  isLoading,
  error,
  specialty,
  timeframe = '24h',
  className = '',
  onArticleClick,
  onRefresh,
  compact = false
}) => {
  const { t } = useTranslation();

  const handleArticleClick = useCallback((article: MedicalNewsArticle) => {
    onArticleClick?.(article);
    window.open(article.sourceUrl, '_blank', 'noopener,noreferrer');
  }, [onArticleClick]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 90) return { label: 'Viral', color: 'from-red-500 to-pink-500', icon: FireIcon };
    if (score >= 70) return { label: 'Hot', color: 'from-orange-500 to-red-500', icon: ArrowTrendingUpIcon };
    if (score >= 50) return { label: 'Rising', color: 'from-yellow-500 to-orange-500', icon: TrophyIcon };
    return { label: 'Trending', color: 'from-blue-500 to-indigo-500', icon: SparklesIcon };
  };

  const getTrendingRank = (index: number) => {
    const rankEmojis = ['🥇', '🥈', '🥉'];
    return index < 3 ? rankEmojis[index] : `#${index + 1}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("bg-white/95 backdrop-blur-xl", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-5 h-5 border border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              {t('news.trending.title', 'Trending Now')}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {timeframe}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: compact ? 3 : 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("bg-white/95 backdrop-blur-xl", className)}>
        <CardContent className="text-center py-8">
          <FireIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('news.trending.error', 'Unable to Load Trending')}
          </h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              {t('news.error.retry', 'Try Again')}
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <Card className={cn("bg-white/95 backdrop-blur-xl", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FireIcon className="w-5 h-5 text-orange-500" />
            {t('news.trending.title', 'Trending Now')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('news.trending.empty', 'No Trending News')}
          </h3>
          <p className="text-gray-600 text-sm">
            {t('news.trending.emptyDesc', 'Check back soon for trending medical news')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white/95 backdrop-blur-xl border border-gray-200/50", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FireIcon className="w-5 h-5 text-orange-500" />
            {t('news.trending.title', 'Trending Now')}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {timeframe}
            </Badge>
            {specialty && (
              <Badge variant="outline" className="text-xs capitalize">
                {specialty}
              </Badge>
            )}
          </div>
        </div>
        
        {articles.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {t('news.trending.subtitle', 'Most engaging medical news right now')}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {articles.slice(0, compact ? 5 : 10).map((article, index) => {
          const engagement = getEngagementBadge(article.engagementScore);
          const EngagementIcon = engagement.icon;
          
          return (
            <div
              key={article.id}
              className="group cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
              onClick={() => handleArticleClick(article)}
            >
              <div className="flex gap-3">
                {/* Trending rank */}
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center text-sm font-bold">
                  {getTrendingRank(index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-indigo-900 transition-colors">
                    {article.title}
                  </h4>
                  
                  {/* Engagement indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${engagement.color} text-white rounded-full text-xs font-semibold`}>
                      <EngagementIcon className="w-3 h-3" />
                      <span>{engagement.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ChartBarIcon className="w-3 h-3" />
                      <span>{Math.round(article.engagementScore)}</span>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  {!compact && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-24">
                        {article.sourceName}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{formatDate(article.publishedDate)}</span>
                      </div>
                    </div>
                    
                    {article.clickCount > 0 && (
                      <div className="flex items-center gap-1">
                        <EyeIcon className="w-3 h-3" />
                        <span>{article.clickCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* View all trending link */}
        {articles.length > (compact ? 5 : 10) && (
          <div className="pt-4 border-t border-gray-100 text-center">
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              {t('news.trending.viewAll', `View all ${articles.length} trending articles`)}
            </button>
          </div>
        )}
        
        {/* Real-time update indicator */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{t('news.trending.liveUpdate', 'Live updates')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsTrending;