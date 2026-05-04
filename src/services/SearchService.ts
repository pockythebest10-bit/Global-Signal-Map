import { SignalEvent } from '../types';
import { eventRepository, EventRepository } from './EventRepository';

export interface SearchResultItem {
  event: SignalEvent;
  matchType: 'Direct' | 'Likely Impact' | 'Thematic';
  matchReason: string;
  score: number;
}

export interface SearchGroup {
  type: string;
  items: SearchResultItem[];
}

export interface SuggestedFollow {
  name: string;
  type: 'country' | 'city' | 'company' | 'sector' | 'person' | 'commodity' | 'theme' | 'event_type' | 'keyword';
  reason: string;
}

export interface SearchResponse {
  groups: SearchGroup[];
  suggestions: SuggestedFollow[];
}

export interface SearchServiceInterface {
  performSearch(query: string, events: SignalEvent[]): SearchResponse;
}

export class SearchService implements SearchServiceInterface {
  constructor(private repository: EventRepository) {}

  async searchAndGroupAsync(query: string): Promise<SearchResponse> {
    const events = await this.repository.getAllEvents();
    return this.performSearch(query, events);
  }

  performSearch(query: string, events: SignalEvent[]): SearchResponse {
    if (!query.trim()) return { groups: [], suggestions: [] };

    const rawQuery = query.toLowerCase().trim();
    
    // Basic synonyms logic
    const synonyms: Record<string, string[]> = {
      'apple': ['aapl', 'cupertino'],
      'tsmc': ['taiwan semiconductor', '2330'],
      'semiconductors': ['chips', 'semi', 'semis', 'foundry', 'silicon'],
      'iran': ['tehran'],
      'ai': ['artificial intelligence', 'genai', 'llm'],
      'us': ['usa', 'united states', 'america', 'washington'],
      'oil': ['crude', 'petroleum', 'brent', 'wti'],
      'rare earths': ['minerals', 'lithium', 'cobalt', 'mining'],
      'tariffs': ['trade war', 'duties', 'export controls', 'sanctions'],
      'india': ['new delhi', 'modi']
    };

    let expandedQueries = [rawQuery];
    for (const [key, values] of Object.entries(synonyms)) {
      if (rawQuery === key || values.includes(rawQuery)) {
        expandedQueries = [key, ...values];
        break;
      }
    }

    const results: SearchResultItem[] = [];
    const entityCandidates = new Map<string, SuggestedFollow>();

    for (const event of events) {
      let score = 0;
      let matchType: 'Direct' | 'Likely Impact' | 'Thematic' | null = null;
      let matchReason = '';

      const tokens = expandedQueries.flatMap(q => q.split(' ')).filter(t => t.length > 2);
      
      const matchesQuery = (text: string) => {
         if (!text) return false;
         const t = text.toLowerCase();
         if (expandedQueries.some(q => t.includes(q))) return true;
         // Match if all search tokens are found in the text
         return tokens.length > 0 && tokens.every(tk => t.includes(tk));
      };

      const exactMatchQuery = (text: string) => {
        if (!text) return false;
        const t = text.toLowerCase();
        return expandedQueries.some(q => t === q);
      };

      // Direct match (Entity or title exactly matches or contains strongly)
      const exactEntityMatch = event.primaryEntities.find(e => exactMatchQuery(e.name));
      const partialEntityMatch = event.primaryEntities.find(e => matchesQuery(e.name));
      const titleMatch = matchesQuery(event.title);
      const originMatch = matchesQuery(event.originLocation.name);

      if (exactEntityMatch) {
        score += 150;
        matchType = 'Direct';
        matchReason = `Direct Match: Primary Entity (${exactEntityMatch.name})`;
        entityCandidates.set(exactEntityMatch.name, { name: exactEntityMatch.name, type: exactEntityMatch.type as any || 'company', reason: 'Primary Entity Match' });
      } else if (partialEntityMatch) {
        score += 100;
        matchType = 'Direct';
        matchReason = `Related Entity: ${partialEntityMatch.name}`;
      } else if (originMatch) {
        score += 90;
        matchType = 'Direct';
        matchReason = `Origin Location: ${event.originLocation.name}`;
        entityCandidates.set(event.originLocation.name, { name: event.originLocation.name, type: 'country', reason: 'Origin Location Match' });
      } else if (titleMatch) {
        score += 85;
        matchType = 'Direct';
        matchReason = `Explicit mention in signal title`;
      }

      // Likely Impact match (secondary entities, impact locations, or explicit impacts)
      if (!matchType) {
        const secondaryEntityMatch = event.secondaryEntities.find(e => matchesQuery(e.name));
        const impactLocationMatch = event.impactLocations.find(l => matchesQuery(l.name));
        const targetImpactMatch = event.impacts.find(imp => matchesQuery(imp.target) && imp.type === 'Likely impact');

        if (secondaryEntityMatch) {
          score += 70;
          matchType = 'Likely Impact';
          matchReason = `Secondary Exposure: ${secondaryEntityMatch.name}`;
          entityCandidates.set(secondaryEntityMatch.name, { name: secondaryEntityMatch.name, type: secondaryEntityMatch.type as any || 'company', reason: 'Secondary Exposure Match' });
        } else if (targetImpactMatch) {
           score += 65;
           matchType = 'Likely Impact';
           matchReason = `Impact Pathway: ${targetImpactMatch.target}`;
           entityCandidates.set(targetImpactMatch.target, { name: targetImpactMatch.target, type: 'theme', reason: 'Impact Pathway Target' });
        } else if (impactLocationMatch) {
           score += 60;
           matchType = 'Likely Impact';
           matchReason = `Impact Location: ${impactLocationMatch.name}`;
           entityCandidates.set(impactLocationMatch.name, { name: impactLocationMatch.name, type: 'country', reason: 'Impact Location' });
        }
      }

      // Thematic match (summary, category, thematic impacts)
      if (!matchType) {
        const summaryMatch = matchesQuery(event.summary);
        const categoryMatch = matchesQuery(event.category);
        const thematicImpact = event.impacts.find(imp => matchesQuery(imp.target) && imp.type === 'Thematic relevance');

        if (categoryMatch) {
          score += 50;
          matchType = 'Thematic';
          matchReason = `Thematic Overlap: ${event.category}`;
          entityCandidates.set(event.category, { name: event.category, type: 'sector', reason: 'Sector / Category Match' });
        } else if (thematicImpact) {
          score += 45;
          matchType = 'Thematic';
          matchReason = `Thematic Relevance: ${thematicImpact.target}`;
        } else if (summaryMatch) {
          score += 30;
          matchType = 'Thematic';
          matchReason = `Keyword match in intelligence brief`;
        }
      }

      // If still no match but keyword in reason
      if (!matchType) {
         const insideImpactReason = event.impacts.find(imp => matchesQuery(imp.explanation));
         if (insideImpactReason) {
           score += 20;
           matchType = 'Thematic';
           matchReason = `Mentioned within impact analysis`;
         }
      }

      // Boost by materiality and confidence
      if (matchType && score > 0) {
        if (event.confidence === 'High') score *= 1.2;
        if (event.confidence === 'Low') score *= 0.8;
        score += event.materialityScore * 0.2; // slight boost

        // If the event is prioritizing by Calibrated Array, boost it in search results!
        if ((event as any).computedRelevanceScore) {
          score += (event as any).computedRelevanceScore * 0.5; // Inject Calibrated Array priority
        }

        results.push({
          event,
          matchType,
          matchReason,
          score: Math.round(score)
        });
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    // Build unique suggestions
    const suggestions = Array.from(entityCandidates.values()).slice(0, 4);

    // Grouping
    const groups: Record<string, SearchResultItem[]> = {
      'Direct': [],
      'Likely Impact': [],
      'Thematic': []
    };

    for (const item of results) {
       if (groups[item.matchType]) {
          groups[item.matchType].push(item);
       }
    }

    const filteredGroups = [
      { type: 'Direct Content', items: groups['Direct'] },
      { type: 'Likely Impact', items: groups['Likely Impact'] },
      { type: 'Thematic Relevance', items: groups['Thematic'] }
    ].filter(g => g.items.length > 0) as SearchGroup[];

    return {
      groups: filteredGroups,
      suggestions
    };
  }
}

export const searchService = new SearchService(eventRepository);
