import { CanonicalEvent } from './models';
import { WatchlistItem } from '../types';

export class RankingPipeline {
  
  public calculateRelevance(event: CanonicalEvent, watchlist: WatchlistItem[]): CanonicalEvent {
    let score = event.materialityScore || 50;
    
    // Core materiality constraints
    if (event.confidence === 'High') score += 10;
    if (event.confidence === 'Low') score -= 10;
    
    // Watchlist relevance
    let arrayBoost = 0;
    
    const terms = new Set([
      event.title.toLowerCase(),
      event.summary.toLowerCase(),
      ...event.primaryEntities.map(e => e.name.toLowerCase())
    ]);
    
    const termStr = Array.from(terms).join(' ');

    watchlist.forEach(w => {
      const target = w.keyword.toLowerCase();
      if (termStr.includes(target)) {
        if (w.sensitivity === 'high') arrayBoost += 35;
        else if (w.sensitivity === 'muted') arrayBoost -= 25;
        else arrayBoost += 15;
      }
    });

    event.watchlistRelevance = arrayBoost;
    event.computedRelevanceScore = score + arrayBoost;

    // Cap at 100 max theoretical
    if (event.computedRelevanceScore > 100) event.computedRelevanceScore = 100;
    if (event.computedRelevanceScore < 0) event.computedRelevanceScore = 0;

    return event;
  }
}
