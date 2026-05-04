import { CanonicalEvent } from '../models/CanonicalEvent';
import { WatchlistItem } from '../../types';

export class FeedRankingPipeline {
  
  public rankEvents(events: CanonicalEvent[], watchlist: WatchlistItem[]): CanonicalEvent[] {
    // Base sorting by timestamp
    let ranked = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Compute watchlist relevance
    ranked = ranked.map(event => {
       let score = event.materialityScore;
       let watchlistBoost = 0;
       
       const matches = watchlist.filter(w => {
         const k = w.keyword.toLowerCase();
         return event.title.toLowerCase().includes(k) || 
                event.summary.toLowerCase().includes(k) || 
                event.primaryEntities.some(e => e.name.toLowerCase().includes(k));
       });

       const matchReasons: string[] = [];

       if (matches.length > 0) {
         matches.forEach(m => {
            if (m.sensitivity === 'high') watchlistBoost += 30;
            else if (m.sensitivity === 'muted') watchlistBoost -= 30;
            else watchlistBoost += 15;

            const baseReason = m.type === 'keyword' ? `Keyword: ${m.keyword}` : `${m.type.replace('_', ' ')}: ${m.keyword}`;
            matchReasons.push(m.isPinned ? `[PINNED] ${baseReason}` : baseReason);
         });
       }

       return {
         ...event,
         computedRelevanceScore: score + watchlistBoost,
         matchReasons
       };
    });

    // Secondary sort by relevance
    return ranked.sort((a, b) => (b.computedRelevanceScore || 0) - (a.computedRelevanceScore || 0));
  }
}
