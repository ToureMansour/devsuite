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
      className="p-8 h-full flex flex-col relative group"
      id={`command-${command.id}`}
    >
      {/* Category Tag (Top Right) */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <span className="tech-label opacity-40 group-hover:opacity-100 transition-opacity">
          {command.category}
        </span>
        {command.isCustom && (
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" title="Custom Command" />
        )}
      </div>

      <div className="flex-grow space-y-6">
        {/* Command Body */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="mono-text text-brand text-[10px] font-bold leading-none py-2 shrink-0">CMD:</span>
            <code className="text-lg md:text-xl font-mono font-bold tracking-tight break-all dark:text-zinc-100 leading-tight">
              {command.command}
            </code>
          </div>
          
          <div className="flex items-start gap-4">
            <span className="tech-label leading-[1.8] shrink-0">INFO:</span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-lg">
              {command.description}
            </p>
          </div>
        </div>

        {/* Example if exists */}
        {command.example && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-border-dark font-mono text-[10px] text-zinc-400 overflow-x-auto">
            <span className="text-brand uppercase mr-2 opacity-50"># Example:</span>
            {command.example}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {command.tags.map(tag => (
            <span 
              key={tag} 
              className="px-2 py-0.5 border border-zinc-200 dark:border-border-dark tech-label text-[9px] hover:border-brand hover:text-brand cursor-default transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions (Bottom) */}
      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy_Command'}
          </button>
          
          <button
            onClick={() => onFavorite(command.id)}
            className={`p-2 transition-all ${isFavorite ? 'text-amber-500 scale-125' : 'text-zinc-400 hover:text-amber-500 hover:scale-110'}`}
          >
            <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {onDelete && command.isCustom && (
          <button
            onClick={() => onDelete(command.id)}
            className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
