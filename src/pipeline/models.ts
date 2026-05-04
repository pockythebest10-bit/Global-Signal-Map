import { EventCategory, ConfidenceLevel, Entity, Location, SignalEvent } from '../types';

export interface RawSourceItem {
  sourceId: string;
  sourceName: string;
  sourceType: 'rss' | 'api' | 'scrape' | 'manual';
  title: string;
  body: string;
  url: string;
  publishedAt: string;
  geography?: string;
  entities?: string[];
  rawPayload: any;
}

export interface NormalizedCandidate {
  candidateId: string;
  sourceItem: RawSourceItem;
  title: string;
  summary: string;
  category: EventCategory;
  eventType: string;
  originLocation: Location;
  impactLocations: Location[];
  confidence: ConfidenceLevel;
  extractedEntities: Entity[];
  themes: string[];
  timestamp: Date;
}

export interface CanonicalEvent extends SignalEvent {
  sourceItems: RawSourceItem[];
  lastUpdated: Date;
  computedRelevanceScore?: number;
}
