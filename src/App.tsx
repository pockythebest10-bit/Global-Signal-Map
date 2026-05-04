import React, { useState } from 'react';
import { MapCanvas } from './components/MapCanvas';
import { TopNavigation } from './components/TopNavigation';
import { AlertsSidebar } from './components/AlertsSidebar';
import { EventDetailDrawer } from './components/EventDetailDrawer';
import { OnboardingFlow } from './components/OnboardingFlow';
import { WatchlistManager } from './components/WatchlistManager';
import { MOCK_EVENTS } from './data/mockData';
import { alertScoringService, ScoredEvent } from './services/AlertScoringService';
import { searchService } from './services/SearchService';
import { WatchlistItem, SignalEvent } from './types';
import { cn } from './lib/utils';
import { DebugPanel } from './components/DebugPanel';

// Extended type for UI
type DisplayEvent = ScoredEvent;

export default function App() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [mobileFeedOpen, setMobileFeedOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Global Feed');
  
  // Data Modes
  const [dataMode, setDataMode] = useState<'demo' | 'hybrid' | 'live'>('demo');
  const [liveEvents, setLiveEvents] = useState<SignalEvent[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userWatchlist, setUserWatchlist] = useState<WatchlistItem[]>(() => {
    const saved = localStorage.getItem('userWatchlist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem('userWatchlist', JSON.stringify(userWatchlist));
  }, [userWatchlist]);
  const [watchlistManagerOpen, setWatchlistManagerOpen] = useState(false);

  const [localDemoEvents, setLocalDemoEvents] = useState<SignalEvent[]>(MOCK_EVENTS);

  // Simulated live event insertion (demo mode)
  React.useEffect(() => {
    if (dataMode !== 'demo') return;
    const interval = setInterval(() => {
      setLocalDemoEvents(prev => {
        const source = prev[Math.floor(Math.random() * prev.length)];
        const newEvent = { ...source, id: 'evt-' + Date.now(), timestamp: new Date() };
        newEvent.confidence = Math.random() > 0.8 ? 'High' : (Math.random() > 0.4 ? 'Medium' : 'Low');
        newEvent.materialityScore = Math.floor(Math.random() * 80) + 20;
        // Keep list size bounded
        return [newEvent, ...prev].slice(0, 100);
      });
    }, 12000); // 12s insertion rate
    return () => clearInterval(interval);
  }, [dataMode]);

  // Fetch live events from API
  React.useEffect(() => {
    if (dataMode === 'demo') {
       setIsFetching(false);
       return;
    }

    const fetchEvents = async () => {
      setIsFetching(true);
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
           const events = await response.json();
           // Convert string dates to Date objects like the pipeline generated
           const parsedEvents = events.map((e: any) => ({
             ...e,
             timestamp: new Date(e.timestamp),
             lastUpdated: new Date(e.lastUpdated)
           }));
           setLiveEvents(parsedEvents);
        }
      } catch (err) {
        console.error("Failed to fetch live events:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [dataMode, userWatchlist]);

  // Dynamically sort and filter events based on user's calibrated watchlist, search query, and top nav filter
  const displayEvents = React.useMemo(() => {
    let sourceEvents: DisplayEvent[] = [];
    if (dataMode === 'demo') {
      sourceEvents = localDemoEvents.map(e => ({...e, provenance: 'demo'}));
    } else if (dataMode === 'live') {
      sourceEvents = liveEvents.map(e => ({...e, provenance: 'real'}));
    } else {
      // In hybrid mode, we don't want duplicates if a live event is basically the same as a demo event
      const realEvs = liveEvents.map(e => ({...e, provenance: 'real' as const}));
      const realTokens = realEvs.map(r => new Set(r.title.toLowerCase().split(/\W+/).filter(t => t.length > 4)));
      
      const filteredDemo = localDemoEvents.filter(d => {
         const dTokens = new Set(d.title.toLowerCase().split(/\W+/).filter(t => t.length > 4));
         // if Jaccard similarity > 0.3, it's a duplicate of a real one, suppress it
         for (const rt of realTokens) {
            const intersection = [...rt].filter(x => dTokens.has(x)).length;
            const union = new Set([...rt, ...dTokens]).size;
            if (union > 0 && intersection / union > 0.25) return false;
         }
         return true;
      });

      sourceEvents = [
        ...realEvs,
        ...filteredDemo.map(e => ({...e, provenance: 'hybrid' as const}))
      ];
    }

    let filtered = [...sourceEvents];

    // Compute watchlist matches for all events
    filtered = alertScoringService.scoreEvents(filtered, userWatchlist) as DisplayEvent[];

    // 1. Top Nav Filter
    if (activeFilter !== 'Global Feed') {
       const categoryMap: Record<string, string> = {
         'Geopolitics': 'Politics & Policy',
         'Markets': 'Macro & Markets',
         'Technology': 'Technology & Infrastructure',
         'Supply Chain': 'Trade & Supply Chain'
       };
       const mappedCat = categoryMap[activeFilter];
       if (mappedCat) {
         filtered = filtered.filter(e => e.category === mappedCat);
       }
    }

    // 2. Search Query
    if (query.trim()) {
      const searchResults = searchService.performSearch(query, filtered);
      // Flatten the events from groups
      filtered = searchResults.groups.flatMap(group => group.items.map(res => res.event as DisplayEvent));
    }

    // 3. User Calibration Match Logic
    return filtered.sort((a, b) => {
      // Sort by relevance score first (if watchlist has items)
      if (userWatchlist.length > 0 && (a.computedRelevanceScore || 0) !== (b.computedRelevanceScore || 0)) {
        return (b.computedRelevanceScore || 0) - (a.computedRelevanceScore || 0);
      }
      
      // Fallback to recent events and materiality
      const aTime = a.timestamp.getTime();
      const bTime = b.timestamp.getTime();
      
      // Compute a base priority score factoring time and materiality
      // 1 hour diff = 10 materiality points
      const HOUR = 1000 * 60 * 60;
      const bScore = (b.materialityScore || 0) + (bTime / HOUR) * 10;
      const aScore = (a.materialityScore || 0) + (aTime / HOUR) * 10;
      
      return bScore - aScore;
    });
  }, [liveEvents, dataMode, userWatchlist, activeFilter, query]);

  const selectedEvent = displayEvents.find(e => e.id === selectedEventId) || null;

  // Sync mobile states
  React.useEffect(() => {
    if (selectedEventId) {
      setMobileFeedOpen(false);
    }
  }, [selectedEventId]);

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden flex font-sans text-text-primary">
      {/* 0. Calibration Overlay */}
      <OnboardingFlow 
        isVisible={showOnboarding} 
        onComplete={(watchlist) => {
          setUserWatchlist(watchlist);
          setShowOnboarding(false);
        }} 
      />

      {/* 1. Map Layer */}
      <MapCanvas 
        events={displayEvents} 
        selectedEventId={selectedEventId} 
        onEventSelect={setSelectedEventId} 
      />

      {/* 2. Top Navigation (Search & Filters) */}
      <TopNavigation 
        query={query}
        setQuery={setQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onEventSelect={(id: string) => setSelectedEventId(id)}
        onAddWatchlist={(keyword, type) => {
          if (!userWatchlist.find(w => w.keyword.toLowerCase() === keyword.toLowerCase())) {
            const newItem = {
              id: Math.random().toString(36).substring(7),
              keyword,
              type,
              addedAt: new Date(),
              sensitivity: 'normal' as const,
              isPinned: true
            };
            setUserWatchlist([...userWatchlist, newItem]);
          }
        }}
        dataMode={dataMode}
        setDataMode={setDataMode}
        isFetching={isFetching}
        events={displayEvents}
      />

      {/* 3. Left Sidebar (Alerts) */}
      <AlertsSidebar 
        events={displayEvents}
        selectedEventId={selectedEventId}
        onEventSelect={setSelectedEventId}
        userWatchlist={userWatchlist}
        onOpenWatchlistManager={() => setWatchlistManagerOpen(true)}
      />

      {/* 4. Right Drawer (Event Details) */}
      <EventDetailDrawer 
        event={selectedEvent}
        onClose={() => setSelectedEventId(null)}
      />

      {/* Watchlist Manager Modal */}
      <WatchlistManager 
        isOpen={watchlistManagerOpen}
        onClose={() => setWatchlistManagerOpen(false)}
        watchlist={userWatchlist}
        onUpdateWatchlist={setUserWatchlist}
      />

      {/* Mobile Feed Drawer */}
      {mobileFeedOpen && (
        <div className="md:hidden absolute inset-0 z-20 pointer-events-none flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setMobileFeedOpen(false)} />
          <div className="relative bg-[#0a0a0c] border-t border-white/5 shadow-2xl h-[70vh] rounded-t-3xl flex flex-col pointer-events-auto mt-auto">
             <div className="flex justify-center p-3">
               <div className="w-12 h-1.5 bg-white/10 rounded-full" />
             </div>
             <div className="flex-1 overflow-visible relative">
               <div className="absolute inset-0">
                  <AlertsSidebar 
                    events={displayEvents}
                    selectedEventId={selectedEventId}
                    onEventSelect={setSelectedEventId}
                    isMobile={true}
                    userWatchlist={userWatchlist}
                    onOpenWatchlistManager={() => setWatchlistManagerOpen(true)}
                  />
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Feed Toggle - only visible on small screens when drawer is closed */}
      {!selectedEventId && !mobileFeedOpen && !showOnboarding && (
        <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <button 
            onClick={() => setMobileFeedOpen(true)}
            className="px-6 py-3 bg-[#0a0a0c]/90 backdrop-blur-md border border-brand-500/30 rounded-full shadow-lg text-sm font-medium text-white flex items-center gap-2 hover:bg-white/5 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Priority Intelligence ({displayEvents.length})
          </button>
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel dataMode={dataMode} />
    </div>
  );
}
