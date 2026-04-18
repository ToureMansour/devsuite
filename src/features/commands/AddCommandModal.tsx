import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Command, CATEGORIES, Category } from '../../core/types';

interface AddCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (command: Command) => void;
}

export const AddCommandModal: React.FC<AddCommandModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    command: '',
    description: '',
    example: '',
    category: 'Other' as Category,
    tagsString: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.command || !formData.description) return;

    const newCommand: Command = {
      id: `custom-${Date.now()}`,
      command: formData.command,
      description: formData.description,
      example: formData.example || undefined,
      category: formData.category,
      tags: formData.tagsString.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== ''),
      isCustom: true
    };

    onAdd(newCommand);
    setFormData({
      command: '',
      description: '',
      example: '',
      category: 'Other',
      tagsString: ''
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-lg bg-white dark:bg-bg-dark shadow-2xl overflow-hidden border border-zinc-200 dark:border-border-dark"
            id="add-command-modal"
          >
            <div className="p-10 border-b border-zinc-200 dark:border-border-dark flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex flex-col gap-1">
                <span className="tech-label text-brand">Add_Record //</span>
                <h2 className="text-3xl font-bold tracking-tighter uppercase dark:text-white leading-none">New_Command</h2>
              </div>
              <button 
                onClick={onClose} 
                className="p-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black hover:bg-brand hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div>
                <label className="tech-label block mb-3">Buffer_Input [Command]</label>
                <input
                  required
                  type="text"
                  value={formData.command}
                  onChange={e => setFormData({ ...formData, command: e.target.value })}
                  placeholder="EX: GIT PUSH..."
                  className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-border-dark dark:text-white mono-text focus:border-brand outline-none transition-all uppercase font-bold"
                />
              </div>

              <div>
                <label className="tech-label block mb-3">Buffer_Input [Description]</label>
                <input
                  required
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="META_DATA_DESCRIPTION..."
                  className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-border-dark dark:text-white focus:border-brand outline-none transition-all uppercase text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="tech-label block mb-3">Categorize</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-border-dark dark:text-white focus:border-brand outline-none transition-all text-xs appearance-none uppercase font-bold"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="tech-label block mb-3">Indexing [Tags]</label>
                  <input
                    type="text"
                    value={formData.tagsString}
                    onChange={e => setFormData({ ...formData, tagsString: e.target.value })}
                    placeholder="TAG_1, TAG_2..."
                    className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-border-dark dark:text-white focus:border-brand outline-none transition-all text-xs uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black uppercase tracking-widest transition-all hover:bg-brand hover:text-black dark:hover:bg-brand active:scale-[0.98] mt-4"
              >
                Compile_&_Save_Record
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
