import { NormalizedCandidate, CanonicalEvent } from './models';

export class DeduplicationLayer {
  private activeEvents: CanonicalEvent[] = [];

  /**
   * Evaluates a candidate against active canonical events to see if it should merge
   */
  public mergeOrYield(candidate: NormalizedCandidate): CanonicalEvent {
    // 1. First-pass similarity check against activeEvents
    const match = this.findMatch(candidate);

    if (match) {
      // Merge into existing event
      match.sourceItems.push(candidate.sourceItem);
      // Might upgrade confidence, append to sourceStack, adjust materiality
      match.confidence = match.sourceItems.length > 2 ? 'High' : 'Medium';
      match.lastUpdated = candidate.timestamp > match.lastUpdated ? candidate.timestamp : match.lastUpdated;
      
      // Merge entities uniquely
      const existingEntities = new Set(match.primaryEntities.map(e => e.name.toLowerCase()));
      for (const ent of candidate.extractedEntities) {
         if (!existingEntities.has(ent.name.toLowerCase())) {
            match.primaryEntities.push(ent);
            existingEntities.add(ent.name.toLowerCase());
         }
      }

      // Merge impact locations uniquely
      if (candidate.impactLocations) {
         const existingImpacts = new Set(match.impactLocations.map(l => l.name.toLowerCase()));
         for (const loc of candidate.impactLocations) {
            if (!existingImpacts.has(loc.name.toLowerCase()) && match.impactLocations.length < 4) {
               match.impactLocations.push(loc);
               existingImpacts.add(loc.name.toLowerCase());
            }
         }
      }

      // Merge themes uniquely (simplified since we rely on strict EventCategory list)
      if (candidate.category !== match.category) {
         // Keep existing category to satisfy strict typings
         // Avoid string concatenation which breaks EventCategory typing
      }

      const existsInStack = match.sourceStack.find(s => s.name === candidate.sourceItem.sourceName);
      if (!existsInStack) {
         match.sourceStack.push({
           name: candidate.sourceItem.sourceName,
           url: candidate.sourceItem.url,
           tier: match.sourceStack.length === 0 ? 'Tier 1' : 'Tier 2'
         });
      }

      return match;
    } else {
      // Yield new canonical event
      const newEvent: CanonicalEvent = {
        id: `evt-${candidate.candidateId}`,
        title: candidate.title,
        summary: candidate.summary,
        category: candidate.category,
        eventType: candidate.eventType,
        originLocation: candidate.originLocation,
        impactLocations: candidate.impactLocations || [],
        timestamp: candidate.timestamp,
        lastUpdated: candidate.timestamp,
        confidence: candidate.confidence,
        materialityScore: 50, // default baseline
        primaryEntities: candidate.extractedEntities,
        secondaryEntities: [],
        impacts: [],
        whyItMatters: '',
        whatToWatchNext: [],
        sourceStack: [{
          name: candidate.sourceItem.sourceName,
          url: candidate.sourceItem.url,
          tier: 'Tier 1' // Default new source tier
        }],
        sourceTier: 'Tier 1',
        relatedEventIds: [],
        sourceItems: [candidate.sourceItem],
        watchlistRelevance: 0
      };

      this.activeEvents.push(newEvent);
      // Keep purely active window (e.g. 1000 events) to prevent memory leak in memory implementation
      if (this.activeEvents.length > 2000) this.activeEvents.shift();

      return newEvent;
    }
  }

  private findMatch(candidate: NormalizedCandidate): CanonicalEvent | null {
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    
    // Convert to tokens for fast Jaccard similarity
    const candTokens = new Set(candidate.title.toLowerCase().split(/\W+/).filter(t => t.length > 3));
    const candEntities = new Set(candidate.extractedEntities.map(e => e.name.toLowerCase()));

    for (const evt of this.activeEvents) {
      const timeDiff = Math.abs(evt.timestamp.getTime() - candidate.timestamp.getTime());
      
      // Stop checking if event is too old
      if (timeDiff > TWELVE_HOURS) {
         continue;
      }

      // Check title similarity (Jaccard index)
      const evtTokens = new Set(evt.title.toLowerCase().split(/\W+/).filter(t => t.length > 3));
      const titleIntersection = [...evtTokens].filter(x => candTokens.has(x)).length;
      const titleUnion = new Set([...evtTokens, ...candTokens]).size;
      const titleSim = titleUnion > 0 ? titleIntersection / titleUnion : 0;

      // Check summary similarity
      const candSummaryTokens = new Set(candidate.summary.toLowerCase().split(/\W+/).filter(t => t.length > 4));
      const evtSummaryTokens = new Set(evt.summary.toLowerCase().split(/\W+/).filter(t => t.length > 4));
      const summaryIntersection = [...evtSummaryTokens].filter(x => candSummaryTokens.has(x)).length;
      const summaryUnion = new Set([...evtSummaryTokens, ...candSummaryTokens]).size;
      const summarySim = summaryUnion > 0 ? summaryIntersection / summaryUnion : 0;

      // Check entity overlap
      const currentEntities = new Set(evt.primaryEntities.map(e => e.name.toLowerCase()));
      const entityIntersection = [...currentEntities].filter(x => candEntities.has(x)).length;
      
      // Geography overlap
      const geoMatch = evt.originLocation.name === candidate.originLocation.name && evt.originLocation.name !== 'Global / Unspecified';

      // Match criteria:
      // 1. High title similarity OR
      // 2. High summary similarity OR
      // 3. High entity overlap + Geography match + decent title/summary similarity
      if (titleSim > 0.45 || summarySim > 0.35 || (entityIntersection >= 2 && geoMatch && (titleSim > 0.2 || summarySim > 0.2)) || (titleSim > 0.35 && geoMatch)) {
         return evt;
      }
    }
    return null;
  }

  // Load existing DB state
  public hydrate(events: CanonicalEvent[]) {
    this.activeEvents = [...events];
  }
}
