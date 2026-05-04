import { SignalEvent, Entity, Location, EventImpact } from '../types';

export interface RawSourceItem {
  id: string;
  sourceType: 'news_api' | 'rss' | 'twitter_firehose' | 'regulatory_dump';
  rawPayload: any;
  provider: string;
  fetchedAt: Date;
}

export interface NormalizedArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  publisher: string;
  publishedAt: Date;
}

export interface ExtractedEntities {
  primaryEntities: Entity[];
  secondaryEntities: Entity[];
  originLocation: Location;
}

export interface CanonicalEvent {
  id: string;
  title: string;
  summary: string;
  category: string;
  eventType: string;
  materialityScore: number;
  confidence: number;
  timestamp: Date;
  lastUpdatedAt: Date;
  sourceArticleIds: string[];
  sourceCount: number;
}

export interface EventImpactResult {
  impacts: EventImpact[];
}

export interface SearchableEventRecord extends SignalEvent {
  // A complete event model ready for elasticsearch/postgres full text search
  ftsTokens: string[];
  lastIndexedAt: Date;
}

export interface AlertCandidate {
  eventId: string;
  userId: string;
  relevanceScore: number;
  matchReasons: string[];
}
