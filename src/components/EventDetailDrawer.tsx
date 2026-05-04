import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Activity, Network, ShieldAlert, Share2, Bookmark, TerminalSquare, Target, Eye, SearchCode } from 'lucide-react';
import { SignalEvent, EventImpact } from '../data/mockData';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

export type DisplayEvent = SignalEvent & {
  computedRelevanceScore?: number;
  matchReasons?: string[];
};

interface EventDetailProps {
  event: DisplayEvent | null;
  onClose: () => void;
}

const ImpactIcon = ({ type, className }: { type: EventImpact['type'], className?: string }) => {
  switch (type) {
    case 'Direct impact': return <Activity className={cn("w-3.5 h-3.5", className)} />;
    case 'Likely impact': return <Network className={cn("w-3.5 h-3.5", className)} />;
    case 'Thematic relevance': return <ShieldAlert className={cn("w-3.5 h-3.5", className)} />;
  }
};

const impactBorderClass = (type: EventImpact['type']) => {
   switch (type) {
      case 'Direct impact': return 'border-l-[3px] border-l-risk-critical border-white/5 bg-white/[0.01]';
      case 'Likely impact': return 'border-l-[3px] border-l-risk-high border-white/5 bg-white/[0.01]';
      case 'Thematic relevance': return 'border-l-[3px] border-l-brand-500 border-white/5 bg-white/[0.01]';
   }
};

const getCategorySlug = (category: string) => {
  switch (category) {
    case 'Politics & Policy': return 'politics';
    case 'Macro & Markets': return 'macro';
    case 'Corporate Actions': return 'corporate';
    case 'Technology & Infrastructure': return 'tech';
    case 'Trade & Supply Chain': return 'trade';
    default: return 'tech';
  }
};

export const EventDetailDrawer: React.FC<EventDetailProps> = ({ event, onClose }) => {
  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm pointer-events-auto sm:hidden"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="absolute right-4 top-[88px] w-full md:w-[320px] lg:w-[360px] max-h-[calc(100vh-104px)] z-50 bg-[#0a0a0c]/90 backdrop-blur-[20px] border border-white/5 rounded-xl shadow-2xl flex flex-col pointer-events-auto font-sans overflow-hidden"
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3 text-text-tertiary">
                <TerminalSquare className="w-4 h-4 text-brand-500/70" />
                <span className="text-[11px] font-mono text-brand-500/60 uppercase tracking-[0.2em] mt-0.5">Intel_Object // {event.id.split('-')[1].padStart(4, '0')}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-text-tertiary hover:text-white" title="Track Signal">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-text-tertiary hover:text-white" title="Export Intel">
                  <Share2 className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-3 bg-white/10 mx-2" />
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 hover:text-red-400 rounded transition-colors text-text-tertiary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-5 pb-8 custom-scrollbar">
              
              {/* 1. Header & Summary block (What Happened) */}
              <div className="px-5 space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase flex-wrap">
                  <div className={cn("flex items-center gap-1.5 text-text-secondary")}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", `text-cat-${getCategorySlug(event.category)}`, `bg-cat-${getCategorySlug(event.category)}`)} />
                    {event.category.split(' & ')[0]}
                  </div>

                  {(event as any).provenance && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-[3px] border",
                      (event as any).provenance === 'real' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                      (event as any).provenance === 'hybrid' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                      'border-white/20 text-white/50 bg-white/5'
                    )}>
                      {(event as any).provenance}
                    </span>
                  )}
                  
                  <span className={cn(
                    "font-medium flex items-center gap-1.5",
                    event.confidence.toLowerCase() === 'high' ? "text-emerald-400" :
                    event.confidence.toLowerCase() === 'medium' ? "text-brand-400" :
                    "text-text-tertiary"
                  )}>
                    <Target className="w-3 h-3" />
                    CONF: {event.confidence.toUpperCase()}
                  </span>

                  {event.computedRelevanceScore !== undefined && (
                    <span className={cn(
                      "font-medium",
                      event.computedRelevanceScore > 30 ? "text-brand-400" : "text-text-tertiary"
                    )}>
                      SCORE: {Math.round(event.computedRelevanceScore)}
                    </span>
                  )}
                  <span className="text-text-tertiary tracking-widest ml-auto">{formatDistanceToNow(event.timestamp, { addSuffix: false })} AGO</span>
                </div>

                {event.matchReasons && event.matchReasons.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2 mb-1">
                      <SearchCode className="w-3.5 h-3.5 text-brand-500/50" />
                      Relevance Vectors
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.matchReasons.map((reason, idx) => {
                        const isPinned = reason.includes('[PINNED]');
                        const cleanReason = reason.replace(/\[PINNED\]\s*/g, '');
                        return (
                          <div key={idx} className={cn(
                            "text-[10px] font-mono tracking-wide flex items-center gap-1.5",
                            isPinned ? "text-brand-400" : "text-text-secondary"
                          )}>
                            {isPinned ? <ShieldAlert className="w-3 h-3" /> : <div className="w-1 h-px bg-white/30" />}
                            {cleanReason}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <h1 className="text-[20px] font-serif font-medium text-white leading-[1.3] tracking-tight mt-3">
                  {event.title}
                </h1>

                <p className="text-[13px] text-text-secondary leading-[1.6]">
                  {event.summary}
                </p>
              </div>

              {/* 2. Structural Impact (Why it matters) */}
              {event.whyItMatters && (
                <div className="mt-5 px-5">
                  <div className="flex flex-col">
                     <div className="flex items-center gap-2 mb-2">
                       <Activity className="w-3.5 h-3.5 text-[#ef4444]" />
                       <span className="text-[10px] font-mono text-[#ef4444] uppercase tracking-widest">Assessment // Structural Implication</span>
                     </div>
                     <div className="pl-5 border-l border-white/5">
                       <div className="text-[13px] text-white/90 leading-[1.6] py-1">{event.whyItMatters}</div>
                     </div>
                  </div>
                </div>
              )}

              {/* 3. Affected Entities */}
              {event.impacts && event.impacts.length > 0 && (
                <div className="mt-6 px-5">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Network className="w-3.5 h-3.5" />
                    Target Impact Analysis
                  </div>
                  <div className="space-y-4">
                    {event.impacts.map((impact, idx) => (
                      <div key={idx} className={cn("flex flex-col gap-2 pl-3 border-l border-white/10", impact.type === 'Direct impact' ? "border-risk-critical/30" : impact.type === 'Likely impact' ? "border-risk-high/30" : "border-brand-500/30")}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-white tracking-tight mb-0.5">{impact.target}</div>
                            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">{impact.entityType}</div>
                          </div>
                          <div className={cn(
                             "text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 shrink-0",
                             impact.type === 'Direct impact' ? "text-risk-critical" :
                             impact.type === 'Likely impact' ? "text-risk-high" : "text-brand-400"
                          )}>
                            <ImpactIcon type={impact.type} />
                            {impact.type.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-[13px] text-text-secondary leading-[1.55]">
                          {impact.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. What to Watch Next */}
              {event.whatToWatchNext && event.whatToWatchNext.length > 0 ? (
                <div className="mt-8 px-5">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
                    <Eye className="w-3.5 h-3.5 text-brand-400" />
                    Predictive // What to Watch
                  </div>
                  <ul className="space-y-3">
                    {event.whatToWatchNext.map((watchItem, idx) => (
                      <li key={idx} className="flex gap-3 items-start group">
                        <div className="w-[3px] h-[3px] bg-brand-500 shrink-0 mt-[8px] group-hover:scale-150 transition-transform" />
                        <span className="text-[13px] text-text-secondary leading-[1.5] group-hover:text-white/90 transition-colors">{watchItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-8 px-5">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
                    <Eye className="w-3.5 h-3.5 text-brand-400" />
                    Predictive // What to Watch
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-3 items-start">
                      <div className="w-[3px] h-[3px] bg-brand-500 shrink-0 mt-[8px]" />
                      <span className="text-[13px] text-text-secondary leading-[1.5] italic">Monitoring trajectory based on {event.category.toLowerCase()} exposure...</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* 5. Source Stack */}
              {event.sourceStack && event.sourceStack.length > 0 && (
                <div className="mt-8 px-5">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.2em] mb-3 pb-2 w-full flex items-center gap-2 border-b border-white/5">
                    <Share2 className="w-3.5 h-3.5" />
                    Validated Sources
                  </div>
                  <div className="space-y-0.5">
                    {event.sourceStack.map((source, idx) => (
                      <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-2 rounded-md hover:bg-white/[0.02] transition-colors group -mx-2 px-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-text-tertiary text-[9px] font-mono shrink-0 opacity-50">
                            SRC_{String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[13px] text-white/50 group-hover:text-brand-400 transition-colors truncate">
                            {source.name}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-text-tertiary group-hover:text-brand-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

