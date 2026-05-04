import React from 'react';
import { cn } from '../lib/utils';
import { Activity, Radio, Landmark, TrendingUp, Briefcase, Cpu, Ship, Info, Eye } from 'lucide-react';
import { SignalEvent, WatchlistItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export type DisplayEvent = SignalEvent & {
  computedRelevanceScore?: number;
  matchReasons?: string[];
};

interface AlertsSidebarProps {
  events: DisplayEvent[];
  selectedEventId: string | null;
  onEventSelect: (id: string | null) => void;
  isMobile?: boolean;
  userWatchlist?: WatchlistItem[];
  onOpenWatchlistManager?: () => void;
}

const CategoryIcon = ({ category, className }: { category: string, className?: string }) => {
  switch (category) {
    case 'Politics & Policy': return <Landmark className={className} />;
    case 'Macro & Markets': return <TrendingUp className={className} />;
    case 'Corporate Actions': return <Briefcase className={className} />;
    case 'Technology & Infrastructure': return <Cpu className={className} />;
    case 'Trade & Supply Chain': return <Ship className={className} />;
    default: return <Activity className={className} />;
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

function formatShortTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const mins = Math.floor((new Date().getTime() - d.getTime()) / 60000);
  if (mins < 1) return 'NOW';
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}

export const AlertsSidebar: React.FC<AlertsSidebarProps> = ({ events, selectedEventId, onEventSelect, isMobile = false, userWatchlist = [], onOpenWatchlistManager }) => {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
     const timer = setInterval(() => setTick(t => t + 1), 10000); // 10s tick for relative times & heartbeats
     return () => clearInterval(timer);
  }, []);

  // Sort by computedRelevanceScore (importance to me based on watchlist) or fall back to mock data's watchlistRelevance
  // then sort by timestamp if scores are equal
  const sortedEvents = [...events].sort((a, b) => {
    const scoreA = a.computedRelevanceScore ?? a.watchlistRelevance ?? 0;
    const scoreB = b.computedRelevanceScore ?? b.watchlistRelevance ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className={cn(
      "flex flex-col pointer-events-auto transition-all",
      isMobile 
        ? "w-full h-full bg-[#0a0a0c] backdrop-blur-[12px] border-t border-white/5" 
        : "hidden md:flex absolute left-0 top-[64px] bottom-0 w-[280px] lg:w-[320px] z-30 bg-[#0a0a0c]/90 backdrop-blur-xl border-r border-white/5"
    )}>
      <div className="py-2.5 px-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
        <div className="text-[10px] font-mono text-white/90 uppercase tracking-widest flex items-center gap-2">
           <Radio className="w-3 h-3 text-brand-500 animate-pulse" />
           Priority Intel
        </div>
        <div className="text-[8px] font-mono tracking-widest text-[#10b981] flex items-center gap-1.5 opacity-80">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          SYNCED
        </div>
      </div>

      <div 
        role="button"
        onClick={onOpenWatchlistManager}
        className="px-4 py-2.5 border-b border-white/5 bg-black/40 hover:bg-white/[0.02] transition-colors cursor-pointer group"
        title="Manage intelligence tracking array"
      >
         <div className="flex justify-between items-center mb-1.5">
           <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="w-2.5 h-2.5" />
              Calibrated Array
           </div>
           {onOpenWatchlistManager && (
             <div className="text-[8px] font-mono text-brand-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
               Manage
             </div>
           )}
         </div>
         {userWatchlist.length > 0 ? (
           <div className="flex flex-wrap gap-1">
             {userWatchlist.slice(0, 5).map(item => (
                <span key={item.id} className={cn(
                  "text-[8px] font-mono px-1.5 py-[1px] rounded-[3px] border uppercase tracking-wider flex items-center gap-1 font-medium",
                  item.sensitivity === 'high' ? "bg-red-500/5 text-red-400 border-red-500/20" :
                  item.sensitivity === 'muted' ? "bg-white/[0.02] text-text-tertiary/50 border-white/5" :
                  "bg-brand-500/5 text-brand-400 border-brand-500/20"
                )}>
                   {item.isPinned && <span className="text-[8px] leading-none mb-px text-brand-400">★</span>}
                   {item.keyword}
                </span>
             ))}
             {userWatchlist.length > 5 && (
                <span className="text-[8px] font-mono bg-white/5 border border-white/10 text-text-tertiary px-1.5 py-[1px] rounded uppercase tracking-wider">
                  +{userWatchlist.length - 5}
                </span>
             )}
           </div>
         ) : (
           <div className="text-[10px] text-text-tertiary">No tracking parameters configured. Click to add.</div>
         )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#020202]">
        {sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-tertiary text-center px-4 mt-8">
             <div className="w-8 h-8 rounded-full bg-white/5 border border-[rgba(212,175,55,0.1)] flex items-center justify-center mb-4 relative">
               <Radio className="w-4 h-4 opacity-50 text-brand-500 animate-pulse relative z-10" />
               <div className="absolute inset-0 rounded-full border border-brand-500/30 animate-ping" />
             </div>
             <p className="text-[10px] font-medium text-text-secondary uppercase tracking-[0.2em] font-mono mb-2">Scanning Node Arrays...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-[1px] bg-white/5">
            <AnimatePresence initial={false}>
              {sortedEvents.map(event => {
                const isSelected = event.id === selectedEventId;
                const matchScore = event.computedRelevanceScore || 0;
                
                // Determine severity label purely for visual layout
                let severityLabel = 'EMERGING';
                let isMajor = false;
                if (matchScore >= 40 || event.confidence === 'High') {
                   severityLabel = 'MAJOR';
                   isMajor = true;
                } else if (matchScore >= 20 || event.confidence === 'Medium') {
                   severityLabel = 'MEDIUM';
                }

                // Heartbeat cue for fresh events
                const ageMs = new Date().getTime() - new Date(event.timestamp).getTime();
                const isFresh = ageMs < 45000; // < 45s old

                return (
                  <motion.div 
                    key={event.id}
                    layout="position"
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={() => onEventSelect(event.id)}
                    className={cn(
                      "cursor-pointer group flex gap-3 transition-colors px-4 py-3 relative bg-[#0a0a0c]",
                      isSelected ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                    )}
                  >
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand-400 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />}
                    
                    {/* Left Timeline rail */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 pt-1">
                       <div className="text-[9px] font-mono text-text-tertiary w-8 text-right shrink-0 group-hover:text-white/50 transition-colors relative">
                         {formatShortTime(event.timestamp)}
                         {isFresh && <div className="absolute -left-2 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-80 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                       </div>
                       {/* Line indicator */}
                       <div className={cn(
                         "flex-1 w-px rounded-full relative", 
                         isMajor ? "bg-risk-high/30" : "bg-white/10 group-hover:bg-brand-500/20 transition-colors"
                       )}>
                          {isMajor && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-risk-high animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                       </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex items-center gap-2">
                           <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", `bg-cat-${getCategorySlug(event.category)}`)} />
                           <div className={cn("text-[9px] uppercase font-mono tracking-widest truncate", `text-cat-${getCategorySlug(event.category)}`)}>
                             {event.category.split(' & ')[0]}
                           </div>
                           {(isMajor || matchScore > 0) && (
                             <>
                              <div className="w-px h-2.5 bg-white/20" />
                              <div className={cn(
                                "text-[8px] font-mono uppercase tracking-widest px-1.5 py-[1px] rounded-[3px] border",
                                isMajor ? "text-risk-high border-risk-high/20 bg-risk-high/10" : "text-brand-400 border-brand-500/20 bg-brand-400/10"
                              )}>
                                {severityLabel}
                              </div>
                             </>
                           )}
                           {event.provenance && (
                             <>
                               <div className="w-px h-2.5 bg-white/20" />
                               <div className={cn(
                                 "text-[8px] font-mono uppercase tracking-widest px-1 py-[0px] rounded-[2px] border",
                                 event.provenance === 'real' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                 event.provenance === 'hybrid' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                 'border-white/20 text-white/50 bg-white/5'
                               )}>
                                 {event.provenance}
                               </div>
                             </>
                           )}
                        </div>
                      </div>

                      <div className={cn(
                        "text-[13px] font-medium leading-[1.3] text-white/90 group-hover:text-white transition-colors tracking-tight",
                        !isMajor && "font-normal text-text-primary group-hover:text-white/90"
                      )}>
                        {event.title}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                         {/* Source stack preview */}
                         {event.sourceStack && event.sourceStack.length > 0 && (
                            <div className="text-[9px] font-mono text-text-tertiary flex items-center gap-1.5 group-hover:text-text-secondary transition-colors">
                               <div className="w-3 h-3 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                                 <Radio className="w-2 h-2 opacity-70" />
                               </div>
                               <span className="truncate max-w-[100px]">{event.sourceStack[0].name}</span>
                               {event.sourceStack.length > 1 && <span>+{event.sourceStack.length - 1}</span>}
                            </div>
                         )}

                         <div className="flex-1 border-t border-dashed border-white/10 mx-2" />

                         <div className="text-[9px] text-text-tertiary font-serif italic truncate flex items-center shrink-0">
                           {event.originLocation?.name?.split(',')[0]}
                         </div>
                      </div>

                      {/* Calibrated matches - shown clearly but not bulky */}
                      {event.matchReasons && event.matchReasons.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {event.matchReasons.map((reason, idx) => {
                            const isPinned = reason.includes('[PINNED]');
                            const cleanReason = reason.replace(/\[PINNED\]\s*/g, '');
                            return (
                              <div key={idx} className={cn(
                                "text-[9px] font-mono px-1.5 py-0.5 rounded-[3px] border uppercase truncate max-w-full flex items-center gap-1 select-none",
                                isPinned ? "bg-brand-500/10 text-brand-400 border-brand-500/20" : "bg-white/5 text-text-tertiary border-white/10"
                              )}>
                                {isPinned && <span className="text-[8px] leading-none mb-px">★</span>}
                                {cleanReason}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

