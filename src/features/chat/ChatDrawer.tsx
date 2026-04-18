import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { aiService } from '../../services/ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis l\'assistant DevCommande. Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await aiService.askChat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-36 right-12 w-20 h-20 bg-zinc-900 dark:bg-zinc-100 text-brand dark:text-zinc-900 hover:scale-105 border border-zinc-200 dark:border-border-dark flex items-center justify-center transition-all z-40 group"
      >
        <MessageSquare size={32} className="group-hover:rotate-12" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-brand"></span>
        </span>
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="relative w-full max-w-lg h-full bg-white dark:bg-bg-dark flex flex-col border-l border-zinc-200 dark:border-border-dark"
            >
              {/* Header */}
              <div className="p-10 border-b border-zinc-200 dark:border-border-dark flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex flex-col gap-1">
                  <span className="tech-label text-brand">System_Channel //</span>
                  <h2 className="text-3xl font-bold tracking-tighter uppercase dark:text-white leading-none">AI_Assistant</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black hover:bg-brand hover:text-black transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-grow overflow-y-auto p-10 space-y-8 custom-scrollbar">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                       <span className="tech-label">{msg.role === 'user' ? 'LOCAL_USER' : 'REMOTE_CORE'}</span>
                    </div>
                    <div className={`p-6 border ${
                      msg.role === 'user' 
                        ? 'bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100' 
                        : 'bg-white dark:bg-card-dark text-zinc-700 dark:text-zinc-100 border-zinc-200 dark:border-border-dark'
                    } max-w-[90%] font-mono text-sm leading-relaxed`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex flex-col items-start px-2">
                    <span className="tech-label mb-2 animate-pulse">PROCESSING_REQUEST...</span>
                    <div className="w-12 h-1 bg-brand animate-[loading_1.5s_infinite]"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-10 border-t border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="WAITING_FOR_INPUT..."
                      className="w-full bg-transparent border-b-2 border-zinc-300 dark:border-border-dark py-4 px-2 focus:border-brand outline-none transition-all dark:text-white uppercase font-bold tracking-tight"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-brand hover:scale-110 transition-transform disabled:opacity-20"
                    >
                      <Send size={24} />
                    </button>
                  </div>
                                  </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
