import React, { useState, useMemo } from 'react';
import { Search, User, Activity, Network, ShieldAlert, Plus, Building, ArrowRight, GitBranch, MapPin, Briefcase, Zap, SearchCode } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { MOCK_EVENTS } from '../data/mockData';
import { searchService, SearchGroup, SuggestedFollow } from '../services/SearchService';

export const TopNavigation: React.FC<{
  query: string;
  setQuery: (q: string) => void;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  onEventSelect?: (id: string) => void;
  onAddWatchlist?: (keyword: string, type: 'country' | 'city' | 'company' | 'sector' | 'person' | 'commodity' | 'theme' | 'event_type' | 'keyword') => void;
  dataMode: 'demo' | 'hybrid' | 'live';
  setDataMode: (mode: 'demo' | 'hybrid' | 'live') => void;
  isFetching: boolean;
  events: any[]; // Use any[] temporarily or import DisplayEvent
}> = ({ query, setQuery, activeFilter, setActiveFilter, onEventSelect, onAddWatchlist, dataMode, setDataMode, isFetching, events }) => {
  const [isFocused, setIsFocused] = useState(false);

  const filters = ['Global Feed', 'Geopolitics', 'Markets', 'Technology', 'Supply Chain'];

  // Prevent map drag/click when interacting with search
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const { searchGroups, suggestions } = useMemo(() => {
     if (!query.trim()) return { searchGroups: [], suggestions: [] };
     const results = searchService.performSearch(query, events.length > 0 ? events : MOCK_EVENTS);
     return {
       searchGroups: results.groups,
       suggestions: results.suggestions
     };
  }, [query, events]);

  return (
    <div className="absolute top-0 left-0 w-full h-[64px] px-5 z-40 flex items-center justify-between border-b border-white/[0.05] bg-[#0a0a0c]/80 backdrop-blur-xl pointer-events-auto">
      {/* Left section: Logo and Nav */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="font-serif text-[20px] tracking-tight text-white leading-none flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-[0_0_15px_rgba(212,175,55,0.15)] relative">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(212,175,55,0.8)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
             <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping opacity-50 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          Global Signal
        </div>

        <div className="w-px h-5 bg-white/10 hidden lg:block mx-1" />

        <div className="hidden lg:flex items-center gap-1">
          {filters.map(filter => (
             <button 
               key={filter}
               onClick={(e) => {
                 e.stopPropagation();
                 setActiveFilter(filter);
               }}
               className={cn(
                 "px-2.5 py-1.5 rounded-[4px] text-[9px] uppercase tracking-[0.1em] font-mono transition-colors",
                 activeFilter === filter 
                   ? "bg-white/10 text-white" 
                   : "text-text-tertiary hover:text-text-secondary hover:bg-white/5"
               )}
             >
               {filter}
             </button>
          ))}
        </div>
      </div>

      {/* Center section: Search */}
      <div 
        className={cn(
          "flex-1 max-w-[340px] lg:max-w-[400px] mx-6 relative",
          isFocused ? "z-[100]" : ""
        )}
        onClick={handleContainerClick}
      >
        <div className={cn(
          "relative flex items-center bg-black/40 border border-white/5 rounded-[4px] px-3 transition-all duration-300 w-full h-[32px]",
          isFocused && "border-brand-500/30 bg-[#0f0f12] shadow-[0_0_0_1px_rgba(212,175,55,0.2)]"
        )}>
          <Search className={cn("w-3.5 h-3.5 mr-2.5 transition-colors", isFocused ? "text-brand-500" : "text-text-tertiary")} />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search intelligence..."
            className="flex-1 bg-transparent border-none outline-none text-[12px] text-white placeholder:text-text-tertiary font-sans tracking-wide"
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
          />
          {query.length > 0 && (
            <button 
              onClick={() => setQuery('')}
              className="text-[8px] uppercase font-mono text-text-tertiary hover:text-white transition-colors px-1.5 py-0.5 mr-1.5 bg-white/5 rounded-[2px]"
            >
              CLEAR
            </button>
          )}
          <div className="hidden sm:flex items-center justify-center px-1.5 py-0.5 rounded-[3px] bg-white/5 border border-white/10 text-[8px] text-text-tertiary font-mono ml-1">
            ⌘K
          </div>
        </div>
        
        <AnimatePresence>
          {isFocused && query.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-full min-w-[700px] lg:min-w-[800px] bg-[#0a0a0c]/98 backdrop-blur-[32px] border border-white/10 rounded-[12px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
            >
              {/* Top Context Bar / Autocomplete Suggestions */}
              {suggestions.length > 0 && (
                <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-3 overflow-x-auto custom-scrollbar">
                  <div className="text-[9px] font-mono uppercase text-text-tertiary tracking-widest flex items-center gap-1.5 shrink-0">
                    <SearchCode className="w-3.5 h-3.5" />
                    Tracking Targets
                  </div>
                  <div className="flex gap-2">
                     {suggestions.map((sug, idx) => {
                       let Icon = Building;
                       if (sug.type === 'country' || sug.type === 'city') Icon = MapPin;
                       else if (sug.type === 'company' || sug.type === 'sector') Icon = Briefcase;
                       else if (sug.type === 'theme' || sug.type === 'event_type') Icon = Zap;

                       return (
                         <button 
                           key={idx} 
                           onClick={() => {
                             if (onAddWatchlist) onAddWatchlist(sug.name, sug.type);
                             setQuery('');
                             setIsFocused(false);
                           }}
                           className="flex items-center gap-2 pr-2 pl-1 py-1 rounded bg-black/40 border border-white/10 hover:bg-white/10 hover:border-brand-500/30 transition-all text-white text-[11px] group shrink-0"
                         >
                           <div className="w-5 h-5 rounded flex items-center justify-center bg-white/5 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
                             <Icon className="w-3 h-3" />
                           </div>
                           {sug.name}
                           <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-brand-400 uppercase tracking-widest text-[9px] font-mono flex items-center">
                             <Plus className="w-3 h-3 mr-0.5" /> Track
                           </span>
                         </button>
                       );
                     })}
                  </div>
                </div>
              )}

              <div className="flex-1 max-h-[70vh] overflow-y-auto custom-scrollbar flex flex-col lg:flex-row">
                {/* Left Column: Result Types */}
                <div className="w-full lg:w-[240px] shrink-0 border-r border-white/5 bg-white/[0.01] p-4 flex flex-col gap-1.5">
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest mb-3 pt-1 px-2">Intelligence Scope</div>
                  {[
                    { icon: Activity, label: 'Direct Content', count: searchGroups.find(g => g.type === 'Direct Content')?.items.length || 0 },
                    { icon: Network, label: 'Likely Impact', count: searchGroups.find(g => g.type === 'Likely Impact')?.items.length || 0 },
                    { icon: ShieldAlert, label: 'Thematic Relevance', count: searchGroups.find(g => g.type === 'Thematic Relevance')?.items.length || 0 },
                  ].map((scope, idx) => (
                    <div key={idx} className={cn(
                      "flex items-center justify-between p-2 rounded-md transition-colors",
                      scope.count > 0 ? "text-text-primary bg-white/5 border border-white/5" : "text-text-tertiary opacity-40"
                    )}>
                      <div className="flex items-center gap-2.5">
                         <scope.icon className={cn("w-3.5 h-3.5", scope.count > 0 ? "text-brand-400 opacity-80" : "opacity-40")} />
                         <span className="text-[12px] font-medium">{scope.label}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded-sm border border-white/5 flex items-center justify-center min-w-[20px]">{scope.count}</span>
                    </div>
                  ))}
                </div>

                {/* Right Column: Results */}
                <div className="flex-1 p-5 min-w-0 bg-[#050505]">
                    <div className="space-y-8">
                        {searchGroups.length === 0 ? (
                           <div className="flex items-center justify-center py-12 text-text-tertiary text-[13px] italic font-serif">
                             No matching intelligence found for this signature.
                           </div>
                        ) : null}

                        {searchGroups.map(group => {
                            let GroupIcon = ShieldAlert;
                            let groupColor = 'text-brand-400';
                            let shadowColor = 'rgba(212,175,55,0.2)';
                            
                            if (group.type === 'Direct Content') {
                               GroupIcon = Activity;
                               groupColor = 'text-[#ef4444]';
                               shadowColor = 'rgba(239,68,68,0.2)';
                            } else if (group.type === 'Likely Impact') {
                               GroupIcon = Network;
                               groupColor = 'text-[#f59e0b]';
                               shadowColor = 'rgba(245,158,11,0.2)';
                            }

                            return (
                               <div key={group.type}>
                                 <div className={`text-[11px] font-mono ${groupColor} flex items-center gap-2 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-white/5`} style={{ textShadow: `0 0 10px ${shadowColor}` }}>
                                    <GroupIcon className="w-3.5 h-3.5" />
                                    {group.type}
                                    <span className="ml-auto text-text-tertiary text-[9px]">{group.items.length} MATCHES</span>
                                 </div>
                                 <div className="space-y-3">
                                    {group.items.slice(0, 6).map(({ event, matchReason, score }, idx) => (
                                      <div 
                                        key={event.id + idx} 
                                        className="group cursor-pointer p-3.5 rounded-lg border border-white/5 bg-[#121214] hover:border-white/15 hover:bg-white/[0.04] transition-all flex flex-col gap-2.5"
                                        onClick={() => {
                                          if (onEventSelect) onEventSelect(event.id);
                                          setQuery(query);
                                          setIsFocused(false);
                                        }}
                                      >
                                        {/* Context Header */}
                                        <div className="flex items-center gap-2 text-[9px] font-mono uppercase flex-wrap">
                                           <div className={cn("px-1.5 py-0.5 rounded-[3px] bg-black/40 border border-white/5", groupColor)}>
                                              {matchReason}
                                           </div>
                                           <div className="flex-1" />
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
                                             "px-1.5 py-0.5 rounded-[3px] border",
                                             event.confidence === 'High' ? "text-brand-400 bg-brand-500/10 border-brand-500/20" : "text-text-tertiary bg-white/5 border-white/10"
                                           )}>
                                             {event.confidence} CONF
                                           </span>
                                           <span className="px-1.5 py-0.5 rounded-[3px] text-text-tertiary bg-white/5 border border-white/10">
                                              SCORE {score}
                                           </span>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="text-[14px] text-white leading-[1.3] font-medium mb-1.5 pr-8">{event.title}</div>
                                          <div className="text-[12px] text-text-secondary leading-[1.5] line-clamp-2">{event.summary}</div>
                                        </div>
                                        
                                        {/* Footer Information */}
                                        <div className="flex items-center gap-2 text-[10px] text-text-tertiary mt-0.5">
                                           <span>{event.originLocation.name}</span>
                                           <span className="w-1 h-1 rounded-full bg-white/10" />
                                           <span>{event.category.split(' & ')[0]}</span>
                                           
                                           <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                              <button 
                                                className="flex items-center justify-center w-6 h-6 rounded-[4px] border border-transparent hover:bg-white/10 text-white transition-colors"
                                                title="Track Context"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (onAddWatchlist && event.primaryEntities[0]) {
                                                    onAddWatchlist(event.primaryEntities[0].name, event.primaryEntities[0].type as any || 'keyword');
                                                  }
                                                }}
                                              >
                                                <Plus className="w-3.5 h-3.5" />
                                              </button>
                                              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white/5 hover:bg-white/10 text-white font-mono uppercase tracking-widest text-[9px]">
                                                View Intelligence <ArrowRight className="w-3 h-3" />
                                              </button>
                                           </div>
                                        </div>
                                      </div>
                                    ))}
                                 </div>
                               </div>
                            );
                        })}
                    </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right section: System Mode & User Status */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-2.5 bg-black/40 border border-white/5 px-2.5 h-[28px] rounded uppercase font-mono text-[9px] tracking-wider text-text-tertiary shadow-inner">
          <span className="text-green-400" title="Real events">R: {events.filter((e: any) => e.provenance === 'real').length}</span>
          <span className="w-[1px] h-3 bg-white/10" />
          <span className="text-white/40" title="Demo events">D: {events.filter((e: any) => e.provenance === 'demo').length}</span>
          <span className="w-[1px] h-3 bg-white/10" />
          <span className="text-blue-400" title="Hybrid events">H: {events.filter((e: any) => e.provenance === 'hybrid').length}</span>
        </div>

        <div className="hidden sm:flex items-center rounded bg-white/5 border border-white/5 overflow-hidden h-[28px] p-0.5">
          {(['demo', 'hybrid', 'live'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setDataMode(mode)}
              className={cn(
                "px-2 h-full flex items-center justify-center text-[9px] uppercase font-mono tracking-wider transition-all rounded-[2px]",
                dataMode === mode 
                  ? "bg-[#1f1f23] text-white shadow-sm" 
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
        
        {isFetching && (
          <div className="hidden sm:flex items-center gap-1.5 ml-1">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
             <span className="text-[9px] font-mono text-brand-500 uppercase tracking-widest">Sync</span>
          </div>
        )}

        <div className="w-px h-4 bg-white/10 hidden sm:block mx-1.5" />

        <div className="w-[28px] h-[28px] rounded-full bg-[#1a1a1c] border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors shadow-sm">
           <User className="w-3.5 h-3.5 text-text-secondary" />
        </div>
      </div>
    </div>
  );
};

