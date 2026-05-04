import { SignalEvent, WatchlistItem } from '../types';
import { WatchlistMatchingService, watchlistMatchingService } from './WatchlistMatchingService';

export interface ScoredEvent extends SignalEvent {
  computedRelevanceScore: number;
  matchReasons: string[];
}

export class AlertScoringService {
  constructor(private matcher: WatchlistMatchingService) {}

  scoreEvents(events: SignalEvent[], watchlist: WatchlistItem[]): ScoredEvent[] {
    const now = new Date();

    return events.map(evt => {
       const match = this.matcher.computeMatch(evt, watchlist);
       
       // Materiality (1-100)
       const materiality = evt.materialityScore || 0;
       
       // Time decay (hours ago)
       const eventTime = new Date(evt.timestamp);
       const hoursAgo = Math.max(0, (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60));
       // Give a small boost for very recent, penalize if very old
       const recencyBoost = Math.max(0, 24 - hoursAgo) * 0.5;
       
       // Confidence
       const confidenceMultiplier = evt.confidence === 'High' ? 1.2 : evt.confidence === 'Medium' ? 1.0 : 0.8;
       
       // Final Score Calculation:
       // Base materiality + big boost for watchlist matches + small recency boost
       let finalScore = (match.score * 1.5 + materiality * 0.5 + recencyBoost) * confidenceMultiplier;
       
       // If tracking muted an item and score became very low
       if (match.score === 0 && match.reasons.some(r => r.includes('(Muted)'))) {
          finalScore = finalScore * 0.1; // Squelch it heavily
       }
       
       // Ensure there's a score
       finalScore = Math.max(0, Math.round(finalScore));

       return {
         ...evt,
         computedRelevanceScore: finalScore,
         matchReasons: match.reasons
       };
    });
  }
}

export const alertScoringService = new AlertScoringService(watchlistMatchingService);
