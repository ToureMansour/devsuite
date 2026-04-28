import React, { useState } from 'react';
import { Copy, Check, Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Command } from '../../core/types';

interface CommandCardProps {
  command: Command;
  onFavorite: (id: string) => void;
  isFavorite: boolean;
  onDelete?: (id: string) => void;
}

export const CommandCard: React.FC<CommandCardProps> = ({ command, onFavorite, isFavorite, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 sm:p-6 lg:p-8 h-full flex flex-col relative group"
      id={`command-${command.id}`}
    >
      {/* Category Tag (Top Right) */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2">
        <span className="tech-label text-[8px] sm:text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">
          {command.category}
        </span>
        {command.isCustom && (
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" title="Custom Command" />
        )}
      </div>

      <div className="flex-grow space-y-6">
        {/* Command Body */}
        <div className="space-y-4">
          <div className="flex items-start gap-2 sm:gap-4">
            <span className="mono-text text-brand text-[8px] sm:text-[10px] font-bold leading-none py-2 shrink-0">CMD:</span>
            <code className="text-sm sm:text-base md:text-lg lg:text-xl font-mono font-bold tracking-tight break-all dark:text-zinc-100 leading-tight">
              {command.command}
            </code>
          </div>
          
          <div className="flex items-start gap-2 sm:gap-4">
            <span className="tech-label text-[8px] sm:text-[10px] leading-[1.8] shrink-0">INFO:</span>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-lg">
              {command.description}
            </p>
          </div>
        </div>

        {/* Example if exists */}
        {command.example && (
          <div className="p-2 sm:p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-border-dark font-mono text-[8px] sm:text-[10px] text-zinc-400 overflow-x-auto">
            <span className="text-brand uppercase mr-2 opacity-50"># Example:</span>
            {command.example}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-2 pt-2">
          {command.tags.map(tag => (
            <span 
              key={tag} 
              className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 border border-zinc-200 dark:border-border-dark tech-label text-[7px] sm:text-[9px] hover:border-brand hover:text-brand cursor-default transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions (Bottom) */}
      <div className="mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-6 border-t border-zinc-100 dark:border-border-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={copyToClipboard}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-2 sm:px-4 py-2 bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy_Command'}</span>
            <span className="sm:hidden">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          
          <button
            onClick={() => onFavorite(command.id)}
            className={`p-1.5 sm:p-2 transition-all ${isFavorite ? 'text-amber-500 scale-125' : 'text-zinc-400 hover:text-amber-500 hover:scale-110'}`}
          >
            <Star size={14} sm:size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {onDelete && command.isCustom && (
          <button
            onClick={() => onDelete(command.id)}
            className="p-1.5 sm:p-2 text-zinc-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={12} sm:size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
