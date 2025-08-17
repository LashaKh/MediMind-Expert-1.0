/**
 * NewsList Component
 * Medical news list with grid/list view toggle and infinite scroll
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import NewsCard from './NewsCard';
import type { MedicalNewsArticle, NewsFilters } from '../../types/medicalNews';
import { cn } from '../../lib/utils';

interface NewsListProps {
  articles: MedicalNewsArticle[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  filters: NewsFilters;
  className?: string;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onArticleInteraction?: (article: MedicalNewsArticle, type: 'click' | 'view' | 'share' | 'bookmark' | 'like') => void;
  bookmarkedArticles?: Set<string>;
  likedArticles?: Set<string>;
}

export const NewsList: React.FC<NewsListProps> = ({
  articles,
  isLoading,
  error,
  hasMore,
  totalCount,
  className = '',
  onLoadMore,
  onRefresh,
  onArticleInteraction,
  bookmarkedArticles = new Set(),
  likedArticles = new Set()
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll implementation
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading && !loadingMore) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadingMore]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoading || loadingMore) return;
    
    setLoadingMore(true);
    try {
      await onLoadMore?.();
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, isLoading, loadingMore, onLoadMore]);

  const handleArticleClick = useCallback((article: MedicalNewsArticle) => {
    onArticleInteraction?.(article, 'click');
  }, [onArticleInteraction]);

  const handleArticleShare = useCallback((article: MedicalNewsArticle) => {
    onArticleInteraction?.(article, 'share');
  }, [onArticleInteraction]);

  const handleArticleBookmark = useCallback((article: MedicalNewsArticle) => {
    onArticleInteraction?.(article, 'bookmark');
  }, [onArticleInteraction]);

  const handleArticleLike = useCallback((article: MedicalNewsArticle) => {
    onArticleInteraction?.(article, 'like');
  }, [onArticleInteraction]);

  // Loading state
  if (isLoading && articles.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header with loading */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-gray-900">{t('news.loading', 'Loading medical news...')}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-2"
            >
              <Squares2X2Icon className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-2"
            >
              <ListBulletIcon className="w-4 h-4" />
              List
            </Button>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-6"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {t('news.error.title', 'Unable to Load News')}
          </h3>
          <p className="text-red-700 mb-4">
            {error}
          </p>
          <Button
            onClick={onRefresh}
            variant="outline"
            className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {t('news.error.retry', 'Try Again')}
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && articles.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {t('news.empty.title', 'No Medical News Found')}
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {t('news.empty.description', 'No news articles match your current filters. Try adjusting your search criteria or check back later for new content.')}
        </p>
        
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 max-w-md mx-auto">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {t('news.empty.suggestions.title', 'Search Tips')}
          </h4>
          <div className="space-y-2 text-left text-sm text-gray-600">
            <p>• Try different medical specialties</p>
            <p>• Adjust date range filters</p>
            <p>• Remove category restrictions</p>
            <p>• Check back for breaking news</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with view controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('news.title', 'Medical News')}
          </h2>
          
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-sm">
              {totalCount.toLocaleString()} {totalCount === 1 ? t('news.article', 'article') : t('news.articles', 'articles')}
            </Badge>
          )}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span>{t('news.updating', 'Updating...')}</span>
            </div>
          )}
        </div>
        
        {/* View mode toggle */}
        <div className="flex items-center gap-2">
            <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="gap-2"
          >
            <Squares2X2Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('news.view.grid', 'Grid')}</span>
          </Button>
            <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <ListBulletIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('news.view.list', 'List')}</span>
          </Button>
          
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <ArrowPathIcon className={cn("w-4 h-4", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">{t('news.refresh', 'Refresh')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* News Grid/List */}
      <div className={cn(
        "transition-all duration-300",
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}>
        {articles.map((article, index) => (
          <NewsCard
            key={article.id}
            article={article}
            viewMode={viewMode}
            isBookmarked={bookmarkedArticles.has(article.id)}
            isLiked={likedArticles.has(article.id)}
            onShare={handleArticleShare}
            onBookmark={handleArticleBookmark}
            onLike={handleArticleLike}
            onInteraction={handleArticleClick}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>

      {/* Load More Section */}
      {hasMore && (
        <div ref={loadMoreRef} className="text-center py-8">
          {loadingMore ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-gray-600">
                {t('news.loadingMore', 'Loading more articles...')}
              </span>
            </div>
          ) : (
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="gap-2 px-6 py-3"
              disabled={isLoading}
            >
              <ArrowPathIcon className="w-4 h-4" />
              {t('news.loadMore', 'Load More Articles')}
            </Button>
          )}
        </div>
      )}

      {/* End of results message */}
      {!hasMore && articles.length > 0 && (
        <div className="text-center py-8 border-t border-gray-200">
          <div className="text-gray-500 text-sm">
            {t('news.endOfResults', 'You\'ve reached the end of the news feed')}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {totalCount} {totalCount === 1 ? t('news.article', 'article') : t('news.articles', 'articles')} {t('news.total', 'total')}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;