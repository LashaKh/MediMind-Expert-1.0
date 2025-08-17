import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Upload,
  Grid,
  List,
  Settings,
  Command,
  ArrowRight,
  Filter,
  SortAsc,
  SortDesc,
  Trash2,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  Zap,
  Archive,
  Clock,
  Calendar,
  Tag,
  FileText,
  Bookmark,
  Star,
  Heart,
  CheckCircle
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  category: 'navigation' | 'actions' | 'view' | 'search' | 'settings';
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    
    const normalizedQuery = query.toLowerCase();
    return commands.filter(command => 
      command.label.toLowerCase().includes(normalizedQuery) ||
      command.description?.toLowerCase().includes(normalizedQuery) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(normalizedQuery))
    );
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev === 0 ? filteredCommands.length - 1 : prev - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Actions',
    view: 'View',
    search: 'Search & Filter',
    settings: 'Settings'
  };

  const categoryIcons = {
    navigation: <ArrowRight className="w-4 h-4" />,
    actions: <Zap className="w-4 h-4" />,
    view: <Eye className="w-4 h-4" />,
    search: <Search className="w-4 h-4" />,
    settings: <Settings className="w-4 h-4" />
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands or type to filter..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded border">
                    ESC
                  </kbd>
                </div>
              </div>
            </div>

            {/* Commands List */}
            <div className="max-h-96 overflow-y-auto" ref={listRef}>
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No commands found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search query
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                    <div key={category} className="mb-4 last:mb-0">
                      <div className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {categoryIcons[category as keyof typeof categoryIcons]}
                        <span>{categoryLabels[category as keyof typeof categoryLabels]}</span>
                      </div>
                      <div className="space-y-1">
                        {categoryCommands.map((command, index) => {
                          const globalIndex = filteredCommands.findIndex(c => c.id === command.id);
                          const isSelected = globalIndex === selectedIndex;
                          
                          return (
                            <motion.div
                              key={command.id}
                              className={`
                                flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200
                                ${isSelected 
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                }
                              `}
                              onClick={() => {
                                command.action();
                                onClose();
                              }}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`
                                  p-2 rounded-lg transition-colors
                                  ${isSelected 
                                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' 
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                  }
                                `}>
                                  {command.icon}
                                </div>
                                <div>
                                  <div className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {command.label}
                                  </div>
                                  {command.description && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {command.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {command.shortcut && (
                                <div className="flex items-center space-x-1">
                                  {command.shortcut.split('+').map((key, i) => (
                                    <React.Fragment key={i}>
                                      {i > 0 && <span className="text-gray-400">+</span>}
                                      <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded border">
                                        {key}
                                      </kbd>
                                    </React.Fragment>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">↑↓</kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Enter</kbd>
                    <span>Select</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">ESC</kbd>
                    <span>Close</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Command className="w-3 h-3" />
                  <span>Command Palette</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for command palette functionality
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    openCommandPalette: () => setIsOpen(true),
    closeCommandPalette: () => setIsOpen(false)
  };
};

export default CommandPalette;