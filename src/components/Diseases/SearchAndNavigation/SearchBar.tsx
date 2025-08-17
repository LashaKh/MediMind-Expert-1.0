import React from 'react';
import { Search, X } from 'lucide-react';
import { SearchProps } from '../../../types/markdown-viewer';

/**
 * Search Bar Component
 * Provides search functionality for markdown content
 */
export const SearchBar: React.FC<SearchProps> = ({ 
  searchTerm, 
  onSearchChange, 
  isSearchActive 
}) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search content..."
          value={searchTerm}
          onChange={(E) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
      
      {isSearchActive && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <p className="text-sm text-blue-700">
            Searching for: <span className="font-semibold">"{searchTerm}"</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;