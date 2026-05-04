export interface ApiError {
  error: {
    code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'INTERNAL_ERROR';
    message: string;
    details?: any;
  }
}

export interface MapEventDto {
  id: string;
  lat?: number;
  lng?: number;
  title: string;
  category: string;
  materialityScore: number;
}

export interface MapEventsResponse {
  events: MapEventDto[];
}

export interface SearchResultDto {
  eventId: string;
  title: string;
  category: string;
  matchReason: string;
}

export interface SearchGroupDto {
  type: 'Direct Exposure' | 'Likely Impact' | 'Thematic Relevance';
  items: SearchResultDto[];
}

export interface SearchResponse {
  groups: SearchGroupDto[];
}

export interface RelatedEventDto {
  eventId: string;
  title: string;
  category: string;
  timestamp: string;
  relationType: 'Temporal' | 'Temporal & Entity' | 'Geographic';
}

export interface RelatedEventsResponse {
  related: RelatedEventDto[];
}

export interface ImpactNodeDto {
  id: string;
  label: string;
  group: 'Entity' | 'Location' | 'Sector';
}

export interface ImpactEdgeDto {
  source: string;
  target: string;
  type: 'Direct' | 'Likely' | 'Thematic';
  description?: string;
}

export interface EventImpactsResponse {
  nodes: ImpactNodeDto[];
  edges: ImpactEdgeDto[];
}

export interface TrendingSignalDto {
  keyword: string;
  type: 'Company' | 'Location' | 'Theme';
  velocityScore: number;
  relatedEventIds: string[];
}

export interface TrendingSignalsResponse {
  trending: TrendingSignalDto[];
}
