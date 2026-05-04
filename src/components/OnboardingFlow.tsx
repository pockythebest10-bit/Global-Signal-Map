import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

import { WatchlistItem } from '../types';

interface SuggestedItem {
  keyword: string;
  type: WatchlistItem['type'];
}

const SUGGESTED_TOPICS: { category: string; items: SuggestedItem[] }[] = [
  {
    category: 'Geopolitics & Regions',
    items: [
      { keyword: 'Taiwan', type: 'country' },
      { keyword: 'Eurozone', type: 'theme' },
      { keyword: 'Japan', type: 'country' },
      { keyword: 'Indo-Pacific', type: 'theme' },
      { keyword: 'Washington D.C.', type: 'city' }
    ]
  },
  {
    category: 'Sectors & Corporate',
    items: [
      { keyword: 'Semiconductors', type: 'sector' },
      { keyword: 'Apple', type: 'company' },
      { keyword: 'TSMC', type: 'company' },
      { keyword: 'Automotive', type: 'sector' },
      { keyword: 'Generic Pharma', type: 'sector' },
      { keyword: 'Enterprise Software', type: 'sector' }
    ]
  },
  {
    category: 'Macro & Themes',
    items: [
      { keyword: 'Interest Rates', type: 'theme' },
      { keyword: 'Supply Chain Vulnerability', type: 'theme' },
      { keyword: 'Trade Tariffs', type: 'theme' },
      { keyword: 'Cyber Warfare', type: 'theme' },
      { keyword: 'Currency Volatility', type: 'theme' }
    ]
  }
];

interface OnboardingFlowProps {
  onComplete: (watchlist: WatchlistItem[]) => void;
  isVisible: boolean;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, isVisible }) => {
  // Pre-select a few highly relevant ones to guide the user
  const [selected, setSelected] = useState<Set<string>>(new Set(['TSMC', 'Trade Tariffs', 'Interest Rates']));

  const toggleSelection = (item: string) => {
    const next = new Set(selected);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setSelected(next);
  };

  const handleComplete = () => {
    const watchlist: WatchlistItem[] = [];
    for (const group of SUGGESTED_TOPICS) {
      for (const item of group.items) {
        if (selected.has(item.keyword)) {
          watchlist.push({
            id: `wl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            keyword: item.keyword,
            type: item.type,
            addedAt: new Date()
          });
        }
      }
    }
    // Might be possible that TSMC, etc. are not loopable if missing from SUGGESTED_TOPICS but they are there.
    onComplete(watchlist);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
      >
        {/* Backdrop Blur overlay */}
        <div className="absolute inset-0 bg-[rgba(3,3,4,0.85)] backdrop-blur-xl" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 0.3, delay: 0.1 }}
          className="relative w-full max-w-[720px] bg-bg-panel border border-border-visible rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col mx-4 max-h-[90vh]"
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
          
          <div className="p-8 pb-6 border-b border-border-subtle">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                 <Settings className="w-4 h-4 text-brand-500" />
               </div>
               <span className="text-[12px] font-mono text-brand-500 uppercase tracking-widest">Calibration Sequence</span>
            </div>
            <h1 className="text-[32px] font-serif font-semibold text-white tracking-tight leading-tight mb-2">
              Configure Intelligence Parameters
            </h1>
            <p className="text-[15px] text-text-secondary leading-relaxed max-w-xl">
              Select the entities, sectors, and themes you are actively monitoring. These preferences will calibrate your global feed and prioritize critical vectors.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-8 py-6 space-y-8 custom-scrollbar">
            {SUGGESTED_TOPICS.map((group) => (
              <div key={group.category}>
                <h3 className="text-[11px] font-mono text-text-tertiary uppercase tracking-widest mb-4 flex items-center gap-2">
                   {group.category}
                   <div className="flex-1 h-[1px] bg-border-subtle" />
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {group.items.map((item) => {
                    const isSelected = selected.has(item.keyword);
                    return (
                      <button
                        key={item.keyword}
                        onClick={() => toggleSelection(item.keyword)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 border",
                          isSelected 
                            ? "bg-brand-500/15 border-brand-500/40 text-brand-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                            : "bg-white/5 border-white/5 text-text-secondary hover:bg-white/10 hover:border-white/15 hover:text-white"
                        )}
                      >
                        {item.keyword}
                        {isSelected && <Check className="w-3.5 h-3.5 inline-block ml-2 -mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-black/40 border-t border-border-visible flex flex-col sm:flex-row items-center justify-between gap-4">
             <button 
               onClick={() => onComplete([])}
               className="text-[12px] font-mono text-text-tertiary hover:text-text-secondary transition-colors tracking-wider uppercase px-4 py-2"
             >
               Skip Calibration
             </button>
             <button
                onClick={handleComplete}
                className="w-full sm:w-auto px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors group"
             >
                Initialize Workspace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
