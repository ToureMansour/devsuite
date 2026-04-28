import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Command } from '../../core/types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions: Command[];
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, suggestions }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
    setShowSuggestions(val.length > 0);
  };

  const handleSelectSuggestion = (cmd: Command) => {
    setQuery(cmd.command);
    onSearch(cmd.command);
    setShowSuggestions(false);
    
    // Smooth scroll to selected
    const el = document.getElementById(`command-${cmd.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative w-full z-10">
      <div className="relative group">
        <div className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 flex items-center gap-2 tech-label pointer-events-none">
          <Search size={14} className="text-brand" />
          <span className="hidden sm:inline opacity-40">SEARCH_IO /</span>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          placeholder="ENTER_QUERY_FOR_ANALYSIS..."
          className="w-full pl-12 sm:pl-44 pr-12 py-6 sm:py-8 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none text-lg sm:text-xl font-bold tracking-tighter uppercase placeholder:text-zinc-400 dark:placeholder:text-zinc-500 placeholder:opacity-60 transition-all"
          id="search-input"
        />
        <AnimatePresence>
          {query.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={clearSearch}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-brand transition-colors"
            >
              <X size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-card-dark border border-zinc-200 dark:border-border-dark shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50 tech-border custom-scrollbar"
            id="search-suggestions"
          >
            {suggestions.slice(0, 10).map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => handleSelectSuggestion(cmd)}
                className="w-full px-8 py-4 text-left hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-black transition-colors border-b border-zinc-100 dark:border-border-dark last:border-0 group flex items-center justify-between"
              >
                <div className="flex-grow min-w-0">
                  <div className="font-mono text-sm leading-tight truncate uppercase tracking-tight">{cmd.command}</div>
                  <div className="text-[10px] opacity-40 truncate uppercase tracking-[0.1em] mt-1">{cmd.description}</div>
                </div>
                <div className="tech-label opacity-0 group-hover:opacity-100 transition-opacity">
                  {cmd.category}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
