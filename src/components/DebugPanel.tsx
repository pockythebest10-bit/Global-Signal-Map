import React, { useEffect, useState } from 'react';
import { Activity, Server, AlertCircle } from 'lucide-react';

export function DebugPanel({ dataMode }: { dataMode: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const [debugData, setDebugData] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen) {
      const fetchDebug = async () => {
        try {
          const res = await fetch('/api/system/debug');
          if (res.ok) {
            setDebugData(await res.json());
          }
        } catch (err) {
          console.error("Failed to fetch debug data", err);
        }
      };
      fetchDebug();
      interval = setInterval(fetchDebug, 5000); // 5s refresh
    }

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] p-2 bg-black/60 backdrop-blur border border-white/10 rounded-full hover:bg-white/10 transition-colors text-white/50"
        title="Open System Status Debug"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] w-96 bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col text-xs font-mono">
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5 rounded-t-xl">
        <div className="flex items-center gap-2 text-white/80 font-semibold tracking-tight font-sans">
          <Server className="w-4 h-4 text-brand-500" />
          System Status (Debug)
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white px-2">
          ✕
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
        {/* Environment */}
        <div>
          <div className="text-white/40 mb-1">Environment</div>
          <div className="grid grid-cols-2 gap-2 text-white/80">
            <div>App Mode:</div>
            <div className="text-right text-brand-400 capitalize">{dataMode}</div>
            
            <div>GNEWS_API_KEY:</div>
            <div className="text-right">
              {debugData?.env?.GNEWS_API_KEY_LOADED ? <span className="text-green-400">Loaded</span> : <span className="text-red-400 font-bold">Missing</span>}
            </div>
            
            <div>REAL_SOURCE_RSS:</div>
            <div className="text-right">
              {debugData?.env?.REAL_SOURCE_RSS_URL_LOADED ? <span className="text-green-400">Loaded</span> : <span className="text-yellow-400">Missing (Optional)</span>}
            </div>
          </div>
        </div>

        {/* Pipeline Stats */}
        {debugData?.stats && (
          <div>
            <div className="text-white/40 mb-1">Pipeline Stats</div>
            <div className="grid grid-cols-2 gap-2 text-white/80 border border-white/5 bg-white/5 p-2 rounded">
               <div>Raw Ingested:</div>
               <div className="text-right text-white">{debugData.stats.totalRawIngested}</div>
               
               <div>Normalized Generated:</div>
               <div className="text-right text-white">{debugData.stats.totalNormalizedGenerated}</div>
               
               <div>Canonical Generated:</div>
               <div className="text-right text-white">{debugData.stats.totalCanonicalGenerated}</div>
               
               <div>Feed Items Rendered:</div>
               <div className="text-right text-blue-400">{debugData.stats.feedItemsRendered} (via API)</div>
               
               <div>Search Index Avail:</div>
               <div className="text-right text-blue-400">{debugData.stats.searchIndexAvailable}</div>
            </div>
          </div>
        )}

        {/* Providers */}
        {debugData?.providers && (
          <div>
             <div className="text-white/40 mb-1">Provider Links</div>
             <div className="space-y-2">
               {debugData.providers.map((p: any) => (
                 <div key={p.id} className="border border-white/5 bg-black/40 p-2 rounded flex flex-col gap-1">
                   <div className="flex justify-between items-center text-white/70">
                     <span>{p.name} ({p.type})</span>
                     <span className={p.status === 'ok' ? 'text-green-400' : p.status === 'error' ? 'text-red-400' : 'text-yellow-400'}>{p.status || 'unknown'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/40">Last Fetch:</span>
                     <span className="text-white/60">{p.lastFetchTime ? new Date(p.lastFetchTime).toLocaleTimeString() : 'Never'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/40">Records Processed:</span>
                     <span className="text-white/90">{p.numIngested || 0}</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Latest Records Logs */}
        {debugData?.latestCanonical && debugData.latestCanonical.length > 0 && (
          <div>
            <div className="text-white/40 mb-1">Latest Canonical Output</div>
            <div className="space-y-1">
               {debugData.latestCanonical.map((title: string, i: number) => (
                 <div key={i} className="text-white/70 truncate border-l-2 border-brand-500 pl-2 text-[10px]">
                   {title}
                 </div>
               ))}
            </div>
          </div>
        )}
        
        {(!debugData) && (
           <div className="flex items-center gap-2 text-white/40">
             <AlertCircle className="w-3 h-3" /> Fetching pipeline status...
           </div>
        )}
      </div>
    </div>
  );
}
