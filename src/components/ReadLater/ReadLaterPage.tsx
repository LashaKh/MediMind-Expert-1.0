/**
 * ReadLaterPage - Main component for the read later functionality
 * Features collections, filtering, reading progress, and bulk actions
 */

import React, { useState, useEffect } from 'react';
import { useReadLater } from '../../hooks/useReadLater';
import { CollectionSelector } from './CollectionSelector';
import { ReadLaterFilters } from './ReadLaterFilters';
import { ReadLaterCard } from './ReadLaterCard';
import { BulkActions } from './BulkActions';
import { ReadingProgress } from './ReadingProgress';
import { CollectionForm } from './CollectionForm';
import { EmptyState } from './EmptyState';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Grid, 
  List, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  BookOpen,
  Clock,
  CheckCircle,
  Archive,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

export function ReadLaterPage() {
  const { t } = useTranslation();
  const { state, actions } = useReadLater();
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== state.filters.search) {
        actions.setFilters({ search: searchQuery, offset: 0 });
        actions.loadArticles();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, state.filters.search, actions]);

  // Load more articles when scrolling
  const handleLoadMore = async () => {
    if (state.pagination.hasMore && !state.loading) {
      setIsLoading(true);
      await actions.loadArticles({
        ...state.filters,
        offset: state.pagination.offset + state.pagination.limit
      });
      setIsLoading(false);
    }
  };

  // Handle collection selection
  const handleCollectionSelect = async (collectionName: string) => {
    actions.setCurrentCollection(collectionName);
    await actions.loadArticles({ offset: 0 });
  };

  // Handle view mode toggle
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    actions.setViewMode(mode);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [any, 'asc' | 'desc'];
    actions.setSortOrder(sortBy, sortOrder);
    actions.loadArticles({ sort: sortBy, order: sortOrder, offset: 0 });
  };

  // Get current collection info
  const currentCollection = state.collections.find(c => c.name === state.currentCollection);
  const totalUnreadCount = state.collections.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('readLater.title', 'Read Later')}
              </h1>
              {totalUnreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalUnreadCount} {t('readLater.unread', 'unread')}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('readLater.searchPlaceholder', 'Search articles...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-blue-50 text-blue-600")}
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('readLater.filters', 'Filters')}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
                <Button
                  variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            {/* Collections */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('readLater.collections', 'Collections')}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCollectionForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CollectionSelector
                collections={state.collections}
                currentCollection={state.currentCollection}
                onSelect={handleCollectionSelect}
                onCreate={() => setShowCollectionForm(true)}
                onEdit={(id, data) => actions.updateCollection(id, data)}
                onDelete={(id) => actions.deleteCollection(id)}
              />
            </div>

            {/* Reading Progress Summary */}
            <ReadingProgress
              collections={state.collections}
              currentCollection={state.currentCollection}
            />

            {/* Filters */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
                <ReadLaterFilters
                  filters={state.filters}
                  onFiltersChange={actions.setFilters}
                  onApply={() => actions.loadArticles({ offset: 0 })}
                />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Status Tabs */}
            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <span>{t('readLater.all', 'All')}</span>
                  <Badge variant="secondary" className="ml-1">
                    {state.articles.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('readLater.unread', 'Unread')}</span>
                </TabsTrigger>
                <TabsTrigger value="reading" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{t('readLater.reading', 'Reading')}</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t('readLater.completed', 'Completed')}</span>
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex items-center space-x-2">
                  <Archive className="h-4 w-4" />
                  <span>{t('readLater.archived', 'Archived')}</span>
                </TabsTrigger>
              </TabsList>

              {(['all', 'unread', 'reading', 'completed', 'archived'] as const).map((status) => (
                <TabsContent key={status} value={status} className="mt-6">
                  <ArticlesList
                    status={status === 'all' ? undefined : status}
                    state={state}
                    actions={actions}
                    onLoadMore={handleLoadMore}
                    isLoadingMore={isLoading}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>

      {/* Collection Form Modal */}
      {showCollectionForm && (
        <CollectionForm
          onClose={() => setShowCollectionForm(false)}
          onSubmit={(data) => {
            actions.createCollection(data);
            setShowCollectionForm(false);
          }}
        />
      )}
    </div>
  );
}

interface ArticlesListProps {
  status?: 'unread' | 'reading' | 'completed' | 'archived';
  state: ReturnType<typeof useReadLater>['state'];
  actions: ReturnType<typeof useReadLater>['actions'];
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

function ArticlesList({ status, state, actions, onLoadMore, isLoadingMore }: ArticlesListProps) {
  const { t } = useTranslation();
  
  // Filter articles by status
  const filteredArticles = status 
    ? state.articles.filter(article => article.reading_status === status)
    : state.articles;

  // Handle selection
  const handleSelectAll = () => {
    const allIds = filteredArticles.map(article => article.id);
    const allSelected = allIds.every(id => state.selectedArticles.includes(id));
    
    if (allSelected) {
      actions.clearSelection();
    } else {
      actions.setSelectedArticles([...state.selectedArticles, ...allIds.filter(id => !state.selectedArticles.includes(id))]);
    }
  };

  if (state.loading && filteredArticles.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <EmptyState
        status={status}
        onAddArticle={() => {
          // Navigate to news section or show add dialog

        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {state.selectedArticles.length > 0 && (
        <BulkActions
          selectedCount={state.selectedArticles.length}
          collections={state.collections}
          onBulkAction={(action, options) => 
            actions.bulkAction(action, state.selectedArticles, options)
          }
          onClearSelection={actions.clearSelection}
        />
      )}

      {/* Articles Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filteredArticles.length > 0 && filteredArticles.every(article => 
                state.selectedArticles.includes(article.id)
              )}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('readLater.selectAll', 'Select all')}
            </span>
          </label>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredArticles.length} {t('readLater.articles', 'articles')}
          </span>
        </div>

        {/* Sort Dropdown */}
        <select
          value={`${state.sortBy}-${state.sortOrder}`}
          onChange={(e) => handleSelectAll()}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800"
        >
          <option value="created_at-desc">{t('readLater.sortNewest', 'Newest first')}</option>
          <option value="created_at-asc">{t('readLater.sortOldest', 'Oldest first')}</option>
          <option value="priority-desc">{t('readLater.sortPriority', 'Priority')}</option>
          <option value="reading_progress-asc">{t('readLater.sortProgress', 'Reading progress')}</option>
          <option value="title-asc">{t('readLater.sortTitle', 'Title A-Z')}</option>
        </select>
      </div>

      {/* Articles Grid/List */}
      <div className={cn(
        state.viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          : "space-y-4"
      )}>
        {filteredArticles.map((article) => (
          <ReadLaterCard
            key={article.id}
            article={article}
            selected={state.selectedArticles.includes(article.id)}
            viewMode={state.viewMode}
            onSelect={actions.toggleArticleSelection}
            onRemove={actions.removeFromReadLater}
            onUpdateProgress={actions.updateProgress}
            onAddNote={actions.updateNotes}
            onMoveToCollection={(id, collection) => 
              actions.bulkAction('move_to_collection', [id], { collection_name: collection })
            }
          />
        ))}
      </div>

      {/* Load More */}
      {state.pagination.hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="min-w-32"
          >
            {isLoadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                {t('readLater.loading', 'Loading...')}
              </>
            ) : (
              t('readLater.loadMore', 'Load more')
            )}
          </Button>
        </div>
      )}
    </div>
  );
}