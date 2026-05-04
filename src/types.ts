export type EventCategory = 
  | 'Politics & Policy' 
  | 'Macro & Markets' 
  | 'Corporate Actions' 
  | 'Technology & Infrastructure' 
  | 'Trade & Supply Chain';

export type SourceTier = 'Tier 1' | 'Tier 2' | 'Tier 3';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type ImpactType = 'Direct impact' | 'Likely impact' | 'Thematic relevance';

export interface Location {
  lat?: number;
  lng?: number;
  name: string;
  precision?: 'exact' | 'city' | 'country' | 'region' | 'none';
}

export interface Entity {
  id: string;
  name: string;
  type: string;
}

export interface SourceArticle {
  name: string;
  url: string;
  tier?: SourceTier;
  timestamp?: Date;
}

export interface EventImpact {
  target: string; // The entity or region affected
  entityType?: string;
  type: ImpactType;
  explanation: string;
  confidence?: ConfidenceLevel;
  evidenceType?: string;
}

export interface SignalEvent {
  id: string;
  title: string;
  summary: string;
  category: EventCategory;
  eventType: string;
  timestamp: Date;
  sourceStack: SourceArticle[];
  sourceTier: SourceTier;
  originLocation: Location;
  impactLocations: Location[];
  primaryEntities: Entity[];
  secondaryEntities: Entity[];
  confidence: ConfidenceLevel;
  relatedEventIds: string[];
  materialityScore: number;
  watchlistRelevance: number;
  impacts: EventImpact[];
  whyItMatters: string;
  whatToWatchNext?: string[];
  provenance?: 'real' | 'demo' | 'hybrid';
}

export interface WatchlistItem {
  id: string;
  keyword: string;
  type: 'country' | 'city' | 'company' | 'sector' | 'person' | 'commodity' | 'theme' | 'event_type' | 'keyword';
  addedAt: Date;
  sensitivity?: 'muted' | 'normal' | 'high';
  isPinned?: boolean;
}

export interface Alert {
  id: string;
  eventId: string;
  title: string;
  message: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  isRead: boolean;
  timestamp: Date;
}

export interface UserPreference {
  userId: string;
  theme: 'dark' | 'light' | 'system';
  emailNotifications: boolean;
  watchlist: WatchlistItem[];
}
