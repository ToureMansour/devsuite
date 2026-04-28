import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Terminal, Coffee, Github, Star, Sparkles, Wand2, Menu, X, ChevronDown, ChevronRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_COMMANDS } from './core/data';
import { Command, CATEGORIES, Category } from './core/types';
import { CommandCard } from './features/commands/CommandCard';
import { SearchBar } from './features/commands/SearchBar';
import { AddCommandModal } from './features/commands/AddCommandModal';
import { ChatDrawer } from './features/chat/ChatDrawer';
import { aiService } from './services/ai';

export default function App() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All' | 'Favorites'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [aiResults, setAiResults] = useState<Command[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLibraryMenuOpen, setIsLibraryMenuOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize data from localStorage or initial constants
  useEffect(() => {
    const savedCommands = localStorage.getItem('devcommande_custom_commands');
    const customCmds: Command[] = savedCommands ? JSON.parse(savedCommands) : [];
    setCommands([...INITIAL_COMMANDS, ...customCmds]);

    const savedFavs = localStorage.getItem('devcommande_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('devcommande_dark_mode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Apply dark mode to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('devcommande_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // AI search logic when no local results
  useEffect(() => {
    let timeout: any;
    const triggerAiSearch = async () => {
      if (searchQuery.length >= 3 && filteredLocalCommands.length === 0) {
        setIsAiLoading(true);
        const results = await aiService.searchDynamicCommand(searchQuery);
        setAiResults(results);
        setIsAiLoading(false);
      } else {
        setAiResults([]);
      }
    };

    if (searchQuery.length >= 3) {
      timeout = setTimeout(triggerAiSearch, 800);
    } else {
      setAiResults([]);
    }

    return () => clearTimeout(timeout);
  }, [searchQuery]);


  // Filtering local logic
  const filteredLocalCommands = useMemo(() => {
    return commands.filter(cmd => {
      const matchesSearch = 
        cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        (selectedCategory === 'Favorites' ? favorites.includes(cmd.id) : cmd.category === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [commands, searchQuery, selectedCategory, favorites]);

  // Combine local and AI results
  const allFilteredCommands = [...filteredLocalCommands, ...aiResults];

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('devcommande_favorites', JSON.stringify(newFavs));
  };

  const addCustomCommand = (cmd: Command) => {
    const newCommands = [...commands, cmd];
    setCommands(newCommands);
    
    const existingCustom = JSON.parse(localStorage.getItem('devcommande_custom_commands') || '[]');
    localStorage.setItem('devcommande_custom_commands', JSON.stringify([...existingCustom, cmd]));
  };

  const deleteCommand = (id: string) => {
    setCommands(commands.filter(c => c.id !== id));
    const existingCustom = JSON.parse(localStorage.getItem('devcommande_custom_commands') || '[]');
    localStorage.setItem('devcommande_custom_commands', JSON.stringify(existingCustom.filter((c: any) => c.id !== id)));
    setFavorites(favorites.filter(fav => fav !== id));
  };

  return (
    <div className="bg-zinc-50 dark:bg-bg-dark font-sans transition-colors duration-300">
      <div className="grid-container">
        
        {/* Sidebar Toggle Button - Discrete like ChatGPT when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-6 left-2 z-50 p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            title="Ouvrir la barre latérale"
          >
            <Menu size={16} />
          </button>
        )}

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`sidebar-container ${isSidebarOpen ? 'visible' : 'hidden'} sticky top-0 h-screen flex flex-col transition-transform duration-300`}>
          {/* Toggle Button - Positioned on sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 right-4 z-50 p-2 bg-brand text-bg-dark rounded-lg shadow-lg hover:scale-105 transition-all"
            title="Ouvrir/Fermer la barre latérale"
          >
            {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          
          {/* Logo Area - Fixed */}
          <div className="p-8 tech-border flex flex-col gap-1 flex-shrink-0">
            <span className="serif-italic text-sm text-brand opacity-80">DevSuite /</span>
            <h1 className="text-3xl font-bold tracking-tighter uppercase dark:text-white leading-none">
              Dev<br/>Commande
            </h1>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-grow overflow-y-auto custom-scrollbar p-0">
            <div className="tech-border">
              <button
                onClick={() => setIsLibraryMenuOpen(!isLibraryMenuOpen)}
                className="w-full p-4 sm:p-6 lg:p-8 flex justify-between items-center text-left hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors group"
              >
                <span className="tech-label text-brand text-xs sm:text-[10px]">Bibliothèque</span>
                <motion.div
                  animate={{ rotate: isLibraryMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-zinc-400 group-hover:text-brand"
                >
                  <ChevronRight size={14} className="sm:size-16" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isLibraryMenuOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 space-y-1">
                      {[
                        { id: 'All', label: 'Dashboard', count: commands.length },
                        { id: 'Favorites', label: 'Favoris', count: favorites.length }
                      ].map((item) => (
                        <li 
                          key={item.id}
                          onClick={() => {
                            setSelectedCategory(item.id as any);
                            setIsSidebarOpen(false);
                          }}
                          className={`flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 cursor-pointer text-xs sm:text-sm font-medium transition-all ${
                            selectedCategory === item.id 
                              ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900' 
                              : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-card-dark'
                          }`}
                        >
                          {item.label}
                          <span className="font-mono text-[8px] sm:text-[10px] opacity-40">{item.count}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <span className="tech-label block mb-4 sm:mb-6 text-xs sm:text-[10px]">Expertise</span>
              <ul className="space-y-1">
                {CATEGORIES.map(cat => (
                  <li 
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex justify-between items-center px-3 sm:px-4 py-2 cursor-pointer text-xs sm:text-sm transition-all border-l-2 ${
                      selectedCategory === cat 
                        ? 'border-brand text-brand bg-brand/5 font-bold' 
                        : 'border-transparent text-zinc-500 hover:bg-zinc-200 dark:hover:bg-card-dark'
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    <span className="font-mono text-[8px] sm:text-[10px] opacity-30 shrink-0">
                      {commands.filter(c => c.category === cat).length}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* User - Fixed at bottom */}
          <div className="p-8 border-t border-zinc-200 dark:border-border-dark flex-shrink-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors rounded-lg group"
              title="Basculer entre mode sombre et clair"
            >
              <span className="tech-label text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-brand">
                {isDarkMode ? 'MODE_CLAIR' : 'MODE_SOMBRE'}
              </span>
              <div className="text-zinc-400 group-hover:text-brand transition-colors">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </div>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`main-content-container relative ${isSidebarOpen ? 'compressed' : 'expanded'} transition-all duration-300`}>
          {/* Top Bar */}
          <header className="tech-border bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md sticky top-0 z-40 p-0 overflow-hidden">
            <div className="grid grid-cols-[1fr_min-content] items-stretch">
              <div className="p-0 border-r border-zinc-200 dark:border-border-dark">
                <SearchBar 
                  onSearch={setSearchQuery} 
                  suggestions={commands.filter(c => c.command.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0)} 
                />
              </div>
              <div className="flex items-center px-8 bg-zinc-100 dark:bg-card-dark text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                v1.0
              </div>
            </div>
          </header>

          {/* Results Grid */}
          <section className="flex-grow p-4 sm:p-8 lg:p-12 custom-scrollbar overflow-y-auto">
            <div className="mb-8 sm:mb-16 flex items-baseline gap-2 sm:gap-4">
              <span className="serif-italic text-2xl sm:text-4xl text-brand font-light italic">#</span>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight dark:text-white uppercase leading-none">
                {selectedCategory === 'All' ? 'INDEX' : selectedCategory.slice(0, 10)}
              </h2>
              {isAiLoading && (
                <div className="ml-4 sm:ml-8 px-2 sm:px-4 py-1 sm:py-2 bg-brand/10 text-brand text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] border border-brand/20 flex items-center gap-1 sm:gap-2">
                  <Sparkles size={10} className="animate-spin" /> <span className="hidden sm:inline">Fetching_AI_Data</span><span className="sm:hidden">AI</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-0 border-t border-l border-zinc-200 dark:border-border-dark">
              <AnimatePresence mode="popLayout">
                {allFilteredCommands.length > 0 ? (
                  allFilteredCommands.map(cmd => (
                    <div key={cmd.id} className="border-r border-b border-zinc-200 dark:border-border-dark hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-colors">
                      <CommandCard
                        command={cmd}
                        onFavorite={toggleFavorite}
                        isFavorite={favorites.includes(cmd.id)}
                        onDelete={deleteCommand}
                      />
                    </div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-40 border-r border-b border-zinc-200 dark:border-border-dark text-center"
                  >
                    {!isAiLoading && (
                      <div className="flex flex-col items-center gap-6">
                        <Terminal size={48} className="text-zinc-300" />
                        <h3 className="text-2xl font-bold uppercase italic text-zinc-500">No_Matches_Found</h3>
                        <p className="text-zinc-400 max-w-sm font-mono text-xs uppercase tracking-widest leading-loose">
                          Search query returned zero local entries. Initiating AI search sequence...
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Footer Info */}
          <footer className="p-4 sm:p-6 lg:p-8 tech-border mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 tech-label bg-white dark:bg-bg-dark">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
              <div className="flex gap-2">COMMANDS_LOCAL<span className="dark:text-white">{commands.length}</span></div>
              <div className="flex gap-2">CATEGORIES_LOADED<span className="dark:text-white">{CATEGORIES.length}</span></div>
            </div>
            <div className="flex items-center gap-4">
              <span>DESIGNED_FOR_PRECISION</span>
              <Github size={12} className="opacity-50" />
            </div>
          </footer>
        </main>
      </div>

      {/* Overlays */}
      <ChatDrawer isSidebarOpen={isSidebarOpen} />
      {/* Bouton ajouter - toujours visible sur tablette et grand écran, seulement si sidebar fermée sur mobile */}
      {(!isSidebarOpen || window.innerWidth >= 768) && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-4 left-4 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 lg:bottom-12 lg:right-12 lg:left-auto bg-brand text-bg-dark hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center z-50 rounded-none group"
        >
          <Plus size={20} className="sm:size-24 lg:size-32 group-hover:rotate-90 transition-transform" />
        </button>
      )}

      <AddCommandModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addCustomCommand}
      />
    </div>
  );
}
