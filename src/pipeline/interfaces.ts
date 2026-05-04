import { 
  RawSourceItem, 
  NormalizedArticle, 
  ExtractedEntities, 
  CanonicalEvent, 
  EventImpactResult, 
  SearchableEventRecord, 
  AlertCandidate 
} from './types';

export interface ISourceFetcher {
  fetch(): Promise<RawSourceItem[]>;
}

export interface INormalizationStage {
  normalize(raw: RawSourceItem): Promise<NormalizedArticle>;
}

export interface IEntityExtractionStage {
  extractEntities(article: NormalizedArticle): Promise<ExtractedEntities>;
}

export interface ICategorizationStage {
  categorize(article: NormalizedArticle): Promise<Partial<CanonicalEvent>>;
}

export interface CandidateContext {
  article: NormalizedArticle;
  extracted: ExtractedEntities;
  categorization: Partial<CanonicalEvent>;
}

export interface ExistingEventContext {
  event: CanonicalEvent;
  primaryEntities: any[];
  secondaryEntities: any[];
  originLocation: any;
}

export interface IDeduplicationStage {
  // Returns existing CanonicalEvent ID if duplicate, or null if novel
  findDuplicate(context: CandidateContext): Promise<string | null>;
  merge(existingId: string, context: CandidateContext): Promise<CanonicalEvent>;
  createNew(context: CandidateContext): Promise<CanonicalEvent>;
}

export interface IImpactGenerationStage {
  generateImpacts(event: CanonicalEvent, extracted: ExtractedEntities): Promise<EventImpactResult>;
}

export interface IPersistenceStage {
  saveRawItem(raw: RawSourceItem): Promise<void>;
  saveNormalizedArticle(normalized: NormalizedArticle): Promise<void>;
  saveEventRecord(record: SearchableEventRecord): Promise<void>;
}

export interface IAlertCandidateStage {
  generateAlerts(record: SearchableEventRecord): Promise<AlertCandidate[]>;
}
