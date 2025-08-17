/**
 * CollectionSelector - Component for managing and selecting read later collections
 * Features collection creation, editing, deletion, and statistics display
 */

import React, { useState } from 'react';
import { CollectionSelectorProps } from '../../types/readLater';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Folder,
  FolderOpen,
  MoreVertical,
  Edit3,
  Trash2,
  BookOpen,
  Clock,
  CheckCircle,
  Plus,
  Hash
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

// Icon mapping for collections
const collectionIcons = {
  bookmark: BookOpen,
  clock: Clock,
  flask: Hash, // Using Hash as placeholder for flask
  shield: CheckCircle,
  folder: Folder,
  heart: Hash, // Using Hash as placeholder for heart
  star: Hash, // Using Hash as placeholder for star
  tag: Hash
};

export function CollectionSelector({
  collections,
  currentCollection,
  onSelect,
  onCreate,
  onEdit,
  onDelete
}: CollectionSelectorProps) {
  const { t } = useTranslation();
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    color_theme: 'blue' as const,
    icon: 'bookmark'
  });

  // Handle edit collection
  const handleEditClick = (collection: any) => {
    setEditForm({
      name: collection.name,
      description: collection.description || '',
      color_theme: collection.color_theme,
      icon: collection.icon
    });
    setEditingCollection(collection.id);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (editingCollection) {
      onEdit(editingCollection, editForm);
      setEditingCollection(null);
    }
  };

  // Handle delete collection
  const handleDeleteClick = (collectionId: string, collectionName: string) => {
    if (window.confirm(t('readLater.confirmDeleteCollection', 'Are you sure you want to delete this collection? All articles will be moved to the default collection.'))) {
      onDelete(collectionId);
    }
  };

  // Get theme classes
  const getThemeClasses = (theme: string, isActive: boolean) => {
    const themes = {
      blue: isActive ? 'bg-blue-100 text-blue-800 border-blue-200' : 'hover:bg-blue-50',
      green: isActive ? 'bg-green-100 text-green-800 border-green-200' : 'hover:bg-green-50',
      purple: isActive ? 'bg-purple-100 text-purple-800 border-purple-200' : 'hover:bg-purple-50',
      red: isActive ? 'bg-red-100 text-red-800 border-red-200' : 'hover:bg-red-50',
      yellow: isActive ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'hover:bg-yellow-50',
      gray: isActive ? 'bg-gray-100 text-gray-800 border-gray-200' : 'hover:bg-gray-50'
    };
    return themes[theme as keyof typeof themes] || themes.blue;
  };

  return (
    <div className="space-y-1">
      {/* All Articles */}
      <button
        onClick={() => onSelect('all')}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left",
          currentCollection === 'all' 
            ? "bg-blue-100 text-blue-800 border border-blue-200"
            : "hover:bg-gray-50 dark:hover:bg-gray-700"
        )}
      >
        <div className="flex items-center space-x-3">
          <FolderOpen className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{t('readLater.allArticles', 'All Articles')}</span>
        </div>
        <Badge variant="secondary" className="ml-2">
          {collections.reduce((sum, c) => sum + c.article_count, 0)}
        </Badge>
      </button>

      {/* Collections */}
      {collections
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((collection) => {
          const IconComponent = collectionIcons[collection.icon as keyof typeof collectionIcons] || Folder;
          const isActive = currentCollection === collection.name;
          
          return (
            <div
              key={collection.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors border",
                getThemeClasses(collection.color_theme, isActive),
                isActive ? "border" : "border-transparent hover:border-gray-200"
              )}
            >
              <button
                onClick={() => onSelect(collection.name)}
                className="flex items-center space-x-3 flex-1 text-left"
              >
                <IconComponent className={cn(
                  "h-4 w-4",
                  isActive ? "text-current" : "text-gray-500 dark:text-gray-400"
                )} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "font-medium truncate",
                      isActive ? "text-current" : "text-gray-900 dark:text-white"
                    )}>
                      {collection.name}
                    </span>
                    {collection.is_default && (
                      <Badge variant="outline" className="text-xs">
                        {t('readLater.default', 'Default')}
                      </Badge>
                    )}
                  </div>
                  
                  {collection.description && (
                    <p className={cn(
                      "text-xs truncate mt-0.5",
                      isActive ? "text-current opacity-80" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {collection.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Unread count */}
                  {collection.unread_count > 0 && (
                    <Badge 
                      variant={isActive ? "secondary" : "outline"} 
                      className="text-xs"
                    >
                      {collection.unread_count}
                    </Badge>
                  )}
                  
                  {/* Total count */}
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className="text-xs"
                  >
                    {collection.article_count}
                  </Badge>
                </div>
              </button>

              {/* Collection Actions */}
              {!collection.is_default && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleEditClick(collection)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      {t('readLater.editCollection', 'Edit collection')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClick(collection.id, collection.name)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('readLater.deleteCollection', 'Delete collection')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}

      {/* Add Collection Button */}
      <button
        onClick={onCreate}
        className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-600 dark:text-gray-300 font-medium">
          {t('readLater.addCollection', 'Add Collection')}
        </span>
      </button>

      {/* Edit Collection Dialog */}
      <Dialog open={editingCollection !== null} onOpenChange={() => setEditingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('readLater.editCollection', 'Edit Collection')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Collection Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('readLater.collectionName', 'Collection Name')}
              </label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder={t('readLater.collectionNamePlaceholder', 'Enter collection name')}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('readLater.description', 'Description')} ({t('common.optional', 'Optional')})
              </label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder={t('readLater.descriptionPlaceholder', 'Brief description of this collection')}
                rows={2}
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('readLater.icon', 'Icon')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(collectionIcons).map(([iconKey, IconComponent]) => (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, icon: iconKey })}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-colors flex items-center justify-center",
                      editForm.icon === iconKey
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('readLater.colorTheme', 'Color Theme')}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {['blue', 'green', 'purple', 'red', 'yellow', 'gray'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, color_theme: color as any })}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 transition-colors",
                      editForm.color_theme === color
                        ? "border-gray-800 dark:border-white"
                        : "border-gray-200 hover:border-gray-300",
                      {
                        blue: "bg-blue-200",
                        green: "bg-green-200",
                        purple: "bg-purple-200",
                        red: "bg-red-200",
                        yellow: "bg-yellow-200",
                        gray: "bg-gray-200"
                      }[color]
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setEditingCollection(null)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={!editForm.name.trim()}
              >
                {t('common.save', 'Save Changes')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}