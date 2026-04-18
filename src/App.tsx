import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Terminal, Coffee, Github, Star, Sparkles, Wand2 } from 'lucide-react';
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

  // Initialize data from localStorage or initial constants
  useEffect(() => {
    const savedCommands = localStorage.getItem('devcommande_custom_commands');
    const customCmds: Command[] = savedCommands ? JSON.parse(savedCommands) : [];
    setCommands([...INITIAL_COMMANDS, ...customCmds]);

    const savedFavs = localStorage.getItem('devcommande_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

  }, []);

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
        
        {/* Sidebar */}
        <aside className="sidebar-container sticky top-0 h-screen overflow-hidden">
          {/* Logo Area */}
          <div className="p-8 tech-border flex flex-col gap-1">
            <span className="serif-italic text-sm text-brand opacity-80">DevSuite /</span>
            <h1 className="text-3xl font-bold tracking-tighter uppercase dark:text-white leading-none">
              Dev<br/>Commande
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-grow overflow-y-auto custom-scrollbar p-0">
            <div className="p-8 tech-border">
              <span className="tech-label block mb-6">Bibliothèque</span>
              <ul className="space-y-1">
                {[
                  { id: 'All', label: 'Dashboard', count: commands.length },
                  { id: 'Favorites', label: 'Favoris', count: favorites.length }
                ].map((item) => (
                  <li 
                    key={item.id}
                    onClick={() => setSelectedCategory(item.id as any)}
                    className={`flex justify-between items-center px-4 py-3 cursor-pointer text-sm font-medium transition-all ${
                      selectedCategory === item.id 
                        ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900' 
                        : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-card-dark'
                    }`}
                  >
                    {item.label}
                    <span className="font-mono text-[10px] opacity-40">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8">
              <span className="tech-label block mb-6">Expertise</span>
              <ul className="space-y-1">
                {CATEGORIES.map(cat => (
                  <li 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex justify-between items-center px-4 py-2 cursor-pointer text-sm transition-all border-l-2 ${
                      selectedCategory === cat 
                        ? 'border-brand text-brand bg-brand/5 font-bold' 
                        : 'border-transparent text-zinc-500 hover:bg-zinc-200 dark:hover:bg-card-dark'
                    }`}
                  >
                    {cat}
                    <span className="font-mono text-[10px] opacity-30">
                      {commands.filter(c => c.category === cat).length}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* User */}
          <div className="p-8 mt-auto border-t border-zinc-200 dark:border-border-dark">
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content-container relative">
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
          <section className="flex-grow p-12 custom-scrollbar overflow-y-auto">
            <div className="mb-16 flex items-baseline gap-4">
              <span className="serif-italic text-4xl text-brand font-light italic">#</span>
              <h2 className="text-7xl font-light tracking-tight dark:text-white uppercase leading-none">
                {selectedCategory === 'All' ? 'INDEX' : selectedCategory.slice(0, 10)}
              </h2>
              {isAiLoading && (
                <div className="ml-8 px-4 py-2 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-[0.2em] border border-brand/20 flex items-center gap-2">
                  <Sparkles size={12} className="animate-spin" /> Fetching_AI_Data
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 border-t border-l border-zinc-200 dark:border-border-dark">
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
          <footer className="p-8 tech-border mt-auto flex justify-between items-center tech-label bg-white dark:bg-bg-dark">
            <div className="flex gap-12">
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
      <ChatDrawer />
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-12 right-12 w-20 h-20 bg-brand text-bg-dark hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center z-50 rounded-none group"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform" />
      </button>

      <AddCommandModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addCustomCommand}
      />
    </div>
  );
}
