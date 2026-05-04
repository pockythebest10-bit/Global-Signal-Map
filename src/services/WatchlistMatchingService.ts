import { SignalEvent, WatchlistItem } from '../types';

export interface WatchlistMatchResult {
  score: number;
  reasons: string[];
}

export class WatchlistMatchingService {
  computeMatch(event: SignalEvent, watchlist: WatchlistItem[]): WatchlistMatchResult {
    let totalScore = 0;
    const reasons: string[] = [];

    for (const item of watchlist) {
      const kw = item.keyword.toLowerCase();
      let hasMatched = false;
      let itemScore = 0;
      let primaryReason = '';

      // 1. Direct entity match
      const primaryMatch = event.primaryEntities.find(e => e.name.toLowerCase().includes(kw));
      if (primaryMatch) {
        itemScore += 50;
        primaryReason = `Direct match on ${item.type} target: ${item.keyword}`;
        hasMatched = true;
      } else {
        const secondaryMatch = event.secondaryEntities.find(e => e.name.toLowerCase().includes(kw));
        if (secondaryMatch) {
          itemScore += 30;
          primaryReason = `Secondary impact on ${item.keyword}`;
          hasMatched = true;
        }
      }

      // 2. Impact location match
      const originLocationMatch = event.originLocation.name.toLowerCase().includes(kw);
      if (originLocationMatch) {
        itemScore += 40;
        if (!hasMatched) primaryReason = `Event originated in tracked location: ${item.keyword}`;
        hasMatched = true;
      }

      const impactLocationMatch = event.impactLocations.find(l => l.name.toLowerCase().includes(kw));
      if (impactLocationMatch) {
        itemScore += 35;
        if (!hasMatched) primaryReason = `Impact vector targets tracked location: ${item.keyword}`;
        hasMatched = true;
      }

      // 3. Category / Event Type match
      if (event.category.toLowerCase().includes(kw) || event.eventType.toLowerCase().includes(kw)) {
        itemScore += 25;
        if (!hasMatched) primaryReason = `Matched tracked category/type: ${item.keyword}`;
        hasMatched = true;
      }

      // 4. Thematic match (impacts, summary, title)
      const themeMatch = 
        event.title.toLowerCase().includes(kw) || 
        event.summary.toLowerCase().includes(kw) ||
        event.impacts.some(imp => imp.explanation.toLowerCase().includes(kw) || imp.target.toLowerCase().includes(kw));
        
      if (themeMatch) {
         itemScore += 20;
         if (!hasMatched) {
           primaryReason = `Thematic resonance with tracked vector: ${item.keyword}`;
         }
         hasMatched = true;
      }
      
      if (hasMatched) {
         // Apply sensitivity modifiers
         if (item.sensitivity === 'muted') {
           itemScore = 0; // Does not bump score, just tags reason
           primaryReason = `(Muted) ${primaryReason}`;
         } else if (item.sensitivity === 'high') {
           itemScore *= 1.5;
         }
         
         if (item.isPinned && item.sensitivity !== 'muted') {
           itemScore += 100;
           primaryReason = `[PINNED] ${primaryReason}`;
         }
         
         totalScore += itemScore;
         if (primaryReason && !reasons.includes(primaryReason)) {
           reasons.push(primaryReason);
         }
      }
    }

    return {
      score: Math.min(Math.round(totalScore), 200), // higher cap physically for pinned items
      reasons: Array.from(new Set(reasons)),
    };
  }
}

export const watchlistMatchingService = new WatchlistMatchingService();
