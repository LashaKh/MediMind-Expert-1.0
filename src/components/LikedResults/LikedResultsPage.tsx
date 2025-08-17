/**
 * Liked Results Page - Dedicated space for managing saved search results
 * Provides persistent storage and management of user's liked results
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Search, Filter, Trash2, Eye, ExternalLink, Tag, Calendar, Globe, FileText, AlertCircle, BookOpen, Loader, X } from 'lucide-react';
import { useLikedResults } from '../../hooks/useLikedResults';
import { useAuth } from '../../stores/useAppStore';
import { Button } from '../ui/button';
import { MobileInput, MobileSelect, MobileTextarea } from '../ui/mobile-form';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { safe, safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';
import { formatDistanceToNow } from 'date-fns';
import type { LikedResult } from '../../lib/api/likedResults';

interface LikedResultsPageProps {
  className?: string;
}

export const LikedResultsPage: React.FC<LikedResultsPageProps> = ({ className }) => {
  const { user } = useAuth();
  const [likedState, likedActions] = useLikedResults({ autoLoad: true });
  
  // Local state for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'relevance' | 'title'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  
  // Dialog state for editing notes/tags
  const [editingResult, setEditingResult] = useState<LikedResult | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Load liked results on mount
  useEffect(() => {
    likedActions.loadLikedResults();
  }, []);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    const results = likedState.likedResults.filter(result => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = result.title.toLowerCase().includes(query);
        const matchesSnippet = result.snippet?.toLowerCase().includes(query);
        const matchesNotes = result.notes?.toLowerCase().includes(query);
        const matchesTags = result.tags?.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesTitle && !matchesSnippet && !matchesNotes && !matchesTags) {
          return false;
        }
      }
      
      // Provider filter
      if (selectedProvider !== 'all' && result.provider !== selectedProvider) {
        return false;
      }
      
      // Content type filter
      if (selectedContentType !== 'all' && result.content_type !== selectedContentType) {
        return false;
      }
      
      // Evidence level filter
      if (selectedEvidenceLevel !== 'all' && result.evidence_level !== selectedEvidenceLevel) {
        return false;
      }
      
      return true;
    });

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'relevance':
          return (b.relevance_score || 0) - (a.relevance_score || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return results;
  }, [likedState.likedResults, searchQuery, selectedProvider, selectedContentType, selectedEvidenceLevel, sortBy]);

  // Get unique values for filters
  const availableProviders = useMemo(() => {
    const providers = [...new Set(likedState.likedResults.map(r => r.provider))];
    return providers.sort();
  }, [likedState.likedResults]);

  const availableContentTypes = useMemo(() => {
    const types = [...new Set(likedState.likedResults.map(r => r.content_type).filter(Boolean))];
    return types.sort();
  }, [likedState.likedResults]);

  const availableEvidenceLevels = useMemo(() => {
    const levels = [...new Set(likedState.likedResults.map(r => r.evidence_level).filter(Boolean))];
    return levels.sort();
  }, [likedState.likedResults]);

  // Handle bulk operations
  const handleSelectAll = () => {
    if (selectedResults.size === filteredResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(filteredResults.map(r => `${r.result_id}-${r.provider}`)));
    }
  };

  const handleSelectResult = (result: LikedResult) => {
    const key = `${result.result_id}-${result.provider}`;
    const newSelected = new Set(selectedResults);
    
    if (selectedResults.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    
    setSelectedResults(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedResults.size === 0) return;
    
    const confirmed = window.confirm(`Delete ${selectedResults.size} selected results?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const key of selectedResults) {
      const [resultId, provider] = key.split('-');
      const [, error] = await safeAsync(async () => {
        return await likedActions.unlikeResult(resultId, provider);
      }, {
        context: 'bulk deleting liked results',
        severity: ErrorSeverity.LOW,
        showToast: false
      });
      
      if (error) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    setSelectedResults(new Set());
    
    // Show final result using error handling system
    if (errorCount === 0) {
      // Success case - the individual operations already show success messages
    } else {
      // Some failures occurred - let the error handling system handle it
    }
  };

  // Handle individual result actions
  const handleUnlikeResult = async (result: LikedResult) => {
    const confirmed = window.confirm('Remove this result from your liked results?');
    if (!confirmed) return;
    
    await safeAsync(async () => {
      return await likedActions.unlikeResult(result.result_id, result.provider);
    }, {
      context: 'removing liked result',
      severity: ErrorSeverity.MEDIUM,
      showToast: true
    });
  };

  const handleEditResult = (result: LikedResult) => {
    setEditingResult(result);
    setEditNotes(result.notes || '');
    setEditTags(result.tags || []);
  };

  const handleSaveEdit = async () => {
    if (!editingResult) return;
    
    const [, error] = await safeAsync(async () => {
      return await likedActions.updateLikedResult(editingResult.result_id, editingResult.provider, {
        notes: editNotes,
        tags: editTags
      });
    }, {
      context: 'updating liked result notes and tags',
      severity: ErrorSeverity.MEDIUM,
      showToast: true
    });
    
    if (!error) {
      setEditingResult(null);
      setEditNotes('');
      setEditTags([]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  // Format evidence level for display
  const formatEvidenceLevel = (level?: string) => {
    if (!level) return 'Unknown';
    return level.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format provider name
  const formatProviderName = (provider: string) => {
    const providerNames: Record<string, string> = {
      'brave': 'Brave Search',
      'exa': 'Exa AI',
      'perplexity': 'Perplexity',
      'clinicaltrials': 'Clinical Trials'
    };
    return providerNames[provider] || provider;
  };

  // Show authentication message if user is not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Please Log In
            </h3>
            <p className="text-gray-600 mb-4">
              You need to be logged in to view your saved search results.
            </p>
            <Button 
              onClick={() => window.location.href = '/search'}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Go to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (likedState.loading && likedState.likedResults.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your liked results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            Liked Results
          </h1>
          <p className="text-gray-600 mt-1">
            Your saved medical research results ({likedState.stats.totalCount} total)
          </p>
        </div>
        
        {selectedResults.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedResults.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {likedState.stats.totalCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Results</p>
                  <p className="text-2xl font-bold">{likedState.stats.totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Providers</p>
                  <p className="text-2xl font-bold">{Object.keys(likedState.stats.byProvider).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Content Types</p>
                  <p className="text-2xl font-bold">{Object.keys(likedState.stats.byContentType).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Evidence Levels</p>
                  <p className="text-2xl font-bold">{Object.keys(likedState.stats.byEvidenceLevel).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <MobileInput
                placeholder="Search in liked results..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            
            <MobileSelect
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              options={[
                { value: 'all', label: 'All Providers' },
                ...availableProviders.map(provider => ({
                  value: provider,
                  label: formatProviderName(provider)
                }))
              ]}
              placeholder="All Providers"
            />
            
            <MobileSelect
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                ...availableContentTypes.map(type => ({
                  value: type,
                  label: formatEvidenceLevel(type)
                }))
              ]}
              placeholder="All Types"
            />
            
            <MobileSelect
              value={selectedEvidenceLevel}
              onChange={(e) => setSelectedEvidenceLevel(e.target.value)}
              options={[
                { value: 'all', label: 'All Evidence' },
                ...availableEvidenceLevels.map(level => ({
                  value: level,
                  label: formatEvidenceLevel(level)
                }))
              ]}
              placeholder="All Evidence"
            />
            
            <MobileSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'relevance' | 'title')}
              options={[
                { value: 'date', label: 'Sort by Date' },
                { value: 'relevance', label: 'Sort by Relevance' },
                { value: 'title', label: 'Sort by Title' }
              ]}
            />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-1"
              >
                <input
                  type="checkbox"
                  checked={selectedResults.size === filteredResults.length && filteredResults.length > 0}
                  onChange={() => {}}
                  className="rounded"
                />
                Select All ({filteredResults.length})
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">
              Showing {filteredResults.length} of {likedState.likedResults.length} results
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredResults.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {likedState.likedResults.length === 0 ? 'No liked results yet' : 'No results match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {likedState.likedResults.length === 0 
                ? 'Start searching and click the heart icon to save results here.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {likedState.likedResults.length === 0 && (
              <Button 
                onClick={() => window.location.href = '/search'}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Go to Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => {
            const resultKey = `${result.result_id}-${result.provider}`;
            const isSelected = selectedResults.has(resultKey);
            
            return (
              <Card key={resultKey} className={`transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectResult(result)}
                      className="mt-1 rounded"
                    />
                    
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            <a 
                              href={result.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              {result.title}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {result.source} • {formatProviderName(result.provider)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditResult(result)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlikeResult(result)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                      
                      {/* Snippet */}
                      {result.snippet && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {result.snippet}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {result.content_type && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {formatEvidenceLevel(result.content_type)}
                          </Badge>
                        )}
                        
                        {result.evidence_level && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formatEvidenceLevel(result.evidence_level)}
                          </Badge>
                        )}
                        
                        {result.relevance_score && (
                          <span className="flex items-center gap-1">
                            <span className="text-xs">Relevance:</span>
                            <span className="font-medium">{(result.relevance_score * 100).toFixed(0)}%</span>
                          </span>
                        )}
                        
                        {result.created_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Saved {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Notes */}
                      {result.notes && (
                        <div className="bg-gray-50 rounded-md p-3">
                          <p className="text-sm text-gray-700">
                            <strong>Your notes:</strong> {result.notes}
                          </p>
                        </div>
                      )}
                      
                      {/* Original query */}
                      <div className="text-xs text-gray-500">
                        Original search: "{result.original_query}"
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingResult} onOpenChange={() => setEditingResult(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Notes and Tags</DialogTitle>
          </DialogHeader>
          
          {editingResult && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{editingResult.title}</h4>
                <p className="text-sm text-gray-600">{editingResult.source}</p>
              </div>
              
              <div>
                <MobileTextarea
                  label="Notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add your notes about this result..."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <MobileInput
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingResult(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LikedResultsPage;