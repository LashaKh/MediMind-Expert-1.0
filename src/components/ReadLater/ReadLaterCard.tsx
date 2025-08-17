/**
 * ReadLaterCard - Individual article card component for read later functionality
 * Features reading progress, notes, highlights, and collection management
 */

import React, { useState } from 'react';
import { ReadLaterCardProps } from '../../types/readLater';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Textarea } from '../ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  BookOpen,
  Clock,
  ExternalLink,
  Heart,
  MoreVertical,
  StickyNote,
  Highlighter,
  Share2,
  Trash2,
  FolderOpen,
  CheckCircle,
  Circle,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

export function ReadLaterCard({
  article,
  selected,
  viewMode,
  onSelect,
  onRemove,
  onUpdateProgress,
  onAddNote,
  onMoveToCollection
}: ReadLaterCardProps) {
  const { t } = useTranslation();
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState(article.personal_notes || '');
  const [isReading, setIsReading] = useState(false);

  // Handle reading session
  const handleStartReading = () => {
    if (article.source_url) {
      window.open(article.source_url, '_blank');
      // Update reading status
      if (article.reading_status === 'unread') {
        onUpdateProgress(article.id, Math.max(article.reading_progress, 0.1), 'reading');
      }
    }
  };

  // Handle progress update
  const handleProgressUpdate = (progress: number) => {
    const status = progress >= 1.0 ? 'completed' : 'reading';
    onUpdateProgress(article.id, progress, status);
  };

  // Handle note save
  const handleNoteSave = () => {
    onAddNote(article.id, noteText);
    setShowNotes(false);
  };

  // Get priority color
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-100 text-red-800 border-red-200';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (article.reading_status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'reading':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get evidence level color
  const getEvidenceLevelColor = (level?: string) => {
    switch (level) {
      case 'systematic_review':
      case 'rct':
        return 'bg-green-100 text-green-800';
      case 'cohort_study':
      case 'case_control':
        return 'bg-blue-100 text-blue-800';
      case 'case_series':
      case 'expert_opinion':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cardContent = (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      selected && "ring-2 ring-blue-500 ring-opacity-50",
      viewMode === 'list' ? "flex-row" : ""
    )}>
      <CardHeader className={cn(
        "pb-3",
        viewMode === 'list' ? "flex-row items-start space-y-0 space-x-4 flex-1" : ""
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Selection Checkbox */}
            <button
              onClick={(e) => {
                e.preventDefault();
                onSelect(article.id);
              }}
              className={cn(
                "flex-shrink-0 w-4 h-4 rounded border-2 border-gray-300 flex items-center justify-center",
                selected && "bg-blue-600 border-blue-600"
              )}
            >
              {selected && <CheckCircle className="h-3 w-3 text-white" />}
            </button>

            {/* Status Icon */}
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 leading-5">
                {article.title}
              </h3>

              {/* Source and Date */}
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {article.source_name}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(article.published_date), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleStartReading}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('readLater.openArticle', 'Open article')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowNotes(true)}>
                <StickyNote className="h-4 w-4 mr-2" />
                {t('readLater.addNote', 'Add note')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Highlighter className="h-4 w-4 mr-2" />
                {t('readLater.highlight', 'Highlight')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                {t('readLater.share', 'Share')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FolderOpen className="h-4 w-4 mr-2" />
                {t('readLater.moveToCollection', 'Move to collection')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onRemove(article.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('readLater.remove', 'Remove')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Summary */}
        {viewMode === 'grid' && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mt-2">
            {article.summary}
          </p>
        )}
      </CardHeader>

      <CardContent className={cn(
        "pt-0",
        viewMode === 'list' ? "flex-shrink-0 w-64" : ""
      )}>
        {/* Summary for list view */}
        {viewMode === 'list' && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {article.summary}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Priority Badge */}
          {article.priority > 0 && (
            <Badge
              variant="outline"
              className={cn("text-xs", getPriorityColor(article.priority))}
            >
              {t('readLater.priority', 'Priority')} {article.priority}
            </Badge>
          )}

          {/* Category Badge */}
          <Badge variant="outline" className="text-xs capitalize">
            {article.category.replace('_', ' ')}
          </Badge>

          {/* Evidence Level Badge */}
          {article.evidence_level && (
            <Badge
              variant="outline"
              className={cn("text-xs capitalize", getEvidenceLevelColor(article.evidence_level))}
            >
              {article.evidence_level.replace('_', ' ')}
            </Badge>
          )}

          {/* Custom Tags */}
          {article.custom_tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Reading Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {t('readLater.progress', 'Progress')}
            </span>
            <span className="font-medium">
              {Math.round(article.reading_progress * 100)}%
            </span>
          </div>
          
          <Progress 
            value={article.reading_progress * 100} 
            className="h-2"
          />

          {/* Reading Time */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>
                {article.estimated_read_time 
                  ? `${article.estimated_read_time} min read`
                  : t('readLater.unknownReadTime', 'Unknown read time')
                }
              </span>
            </div>
            
            {article.actual_read_time > 0 && (
              <span>
                {article.actual_read_time}m {t('readLater.spent', 'spent')}
              </span>
            )}
          </div>
        </div>

        {/* Notes Preview */}
        {article.personal_notes && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-2">
              <StickyNote className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200 line-clamp-2">
                {article.personal_notes}
              </p>
            </div>
          </div>
        )}

        {/* Highlights Count */}
        {article.highlights.length > 0 && (
          <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Highlighter className="h-3 w-3" />
            <span>{article.highlights.length} highlights</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartReading}
            className="flex-1 mr-2"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {article.reading_status === 'completed' 
              ? t('readLater.reread', 'Re-read')
              : t('readLater.continueReading', 'Continue reading')
            }
          </Button>

          {/* Quick Progress Buttons */}
          <div className="flex space-x-1">
            {[0.25, 0.5, 0.75, 1.0].map((progress) => (
              <Button
                key={progress}
                variant="ghost"
                size="sm"
                onClick={() => handleProgressUpdate(progress)}
                className={cn(
                  "w-8 h-8 p-0 text-xs",
                  article.reading_progress >= progress && "bg-blue-100 text-blue-600"
                )}
                disabled={article.reading_progress >= progress}
              >
                {Math.round(progress * 100)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Notes Dialog */}
      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('readLater.addNote', 'Add Note')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">{article.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
            </div>
            
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t('readLater.notePlaceholder', 'Add your thoughts, insights, or questions about this article...')}
              rows={6}
            />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNotes(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleNoteSave}>
                {t('common.save', 'Save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );

  return cardContent;
}