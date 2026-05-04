import { logger } from '../lib/logger';
import { 
  INormalizationStage, 
  IEntityExtractionStage, 
  ICategorizationStage, 
  IDeduplicationStage, 
  IImpactGenerationStage, 
  IPersistenceStage, 
  IAlertCandidateStage 
} from './interfaces';
import { 
  RawSourceItem, 
  NormalizedArticle, 
  ExtractedEntities, 
  CanonicalEvent, 
  EventImpactResult, 
  SearchableEventRecord, 
  AlertCandidate 
} from './types';

export class NormalizationStage implements INormalizationStage {
  async normalize(raw: RawSourceItem): Promise<NormalizedArticle> {
    logger.info(`[Normalization] Normalizing item ${raw.id} from ${raw.provider}`);
    return {
      id: `norm-${raw.id}`,
      title: raw.rawPayload.headline || raw.rawPayload.title || 'Untitled',
      content: raw.rawPayload.bodyText || raw.rawPayload.content || '',
      url: raw.rawPayload.url || '',
      publisher: raw.provider,
      publishedAt: raw.rawPayload.time ? new Date(raw.rawPayload.time) : new Date()
    };
  }
}

export class EntityExtractionStage implements IEntityExtractionStage {
  async extractEntities(article: NormalizedArticle): Promise<ExtractedEntities> {
    logger.info(`[EntityExtraction] Extracting entities for article ${article.id}`);
    // Mock extraction
    return {
      primaryEntities: [{ id: 'ent-1', name: 'Port of Hamburg', type: 'Infrastructure' }],
      secondaryEntities: [{ id: 'ent-2', name: 'Logistics Sector', type: 'Sector' }],
      originLocation: { name: 'Hamburg, Germany', lat: 53.5511, lng: 9.9937 }
    };
  }
}

export class CategorizationStage implements ICategorizationStage {
  async categorize(article: NormalizedArticle): Promise<Partial<CanonicalEvent>> {
    logger.info(`[Categorization] Categorizing article ${article.id}`);
    return {
      category: 'Labor & Supply Chain',
      eventType: 'Labor Strike',
      materialityScore: 75,
      summary: `Analyzed: ${article.title.substring(0, 50)}...`
    };
  }
}

import { Deduplicator } from './deduplication/Deduplicator';
import { CandidateContext } from './interfaces';

export class DeduplicationStage implements IDeduplicationStage {
  private deduplicator = new Deduplicator();
  private mockStore: Map<string, CanonicalEvent> = new Map();

  async findDuplicate(context: CandidateContext): Promise<string | null> {
    logger.info(`[Deduplication] Checking existing events for overlap with ${context.article.id}`);
    
    let bestMatchId: string | null = null;
    let highestScore = 0;

    for (const [id, event] of this.mockStore.entries()) {
      // Create a mocked ExistingEventContext since we don't have a real DB 
      // where we could fetch primary/secondary entities right now.
      // In a real system, you'd query the DB for candidates by time/geography, then score.
      const existingContext = {
        event,
        primaryEntities: [], // mocked for now
        secondaryEntities: [], // mocked for now
        originLocation: { name: 'Unknown', precision: 'none' }
      };

      const score = this.deduplicator.computeSimilarity(context, existingContext);
      if (this.deduplicator.isMatch(score) && score > highestScore) {
        highestScore = score;
        bestMatchId = id;
      }
    }

    if (bestMatchId) {
      logger.info(`[Deduplication] Found duplicate! Merging into ${bestMatchId} (Score: ${highestScore.toFixed(2)})`);
    }

    return bestMatchId;
  }

  async merge(existingId: string, context: CandidateContext): Promise<CanonicalEvent> {
    const existing = this.mockStore.get(existingId);
    if (!existing) throw new Error("Merging into missing event");

    logger.info(`[Deduplication] Merging ${context.article.id} into existing event ${existingId}`);
    const merged = this.deduplicator.merge(context, existing);
    this.mockStore.set(existingId, merged);
    return merged;
  }

  async createNew(context: CandidateContext): Promise<CanonicalEvent> {
    logger.info(`[Deduplication] Minting new Canonical Event`);
    const newEvent = this.deduplicator.createCanonical(context);
    this.mockStore.set(newEvent.id, newEvent);
    return newEvent;
  }
}

import { ImpactEngine } from './impacts/ImpactEngine';

export class ImpactGenerationStage implements IImpactGenerationStage {
  private engine = new ImpactEngine();

  async generateImpacts(event: CanonicalEvent, extracted: ExtractedEntities): Promise<EventImpactResult> {
    logger.info(`[ImpactGeneration] Generating ripple effects for event ${event.id}`);
    return this.engine.generateImpacts(event, extracted);
  }
}

export class PersistenceStage implements IPersistenceStage {
  private store: SearchableEventRecord[] = [];
  private rawStore: Map<string, RawSourceItem> = new Map();
  private normalizedStore: Map<string, NormalizedArticle> = new Map();

  async saveRawItem(raw: RawSourceItem): Promise<void> {
    logger.info(`[Persistence] Saving raw item ${raw.id} from ${raw.provider}`);
    this.rawStore.set(raw.id, raw);
  }

  async saveNormalizedArticle(normalized: NormalizedArticle): Promise<void> {
    logger.info(`[Persistence] Saving normalized article ${normalized.id}`);
    this.normalizedStore.set(normalized.id, normalized);
  }

  async saveEventRecord(record: SearchableEventRecord): Promise<void> {
    logger.info(`[Persistence] Saving event record ${record.id} to vector and relational DBs...`);
    const existingIndex = this.store.findIndex(r => r.id === record.id);
    if (existingIndex >= 0) {
      this.store[existingIndex] = record;
    } else {
      this.store.push(record);
    }
  }

  getEvents(): SearchableEventRecord[] {
    return this.store;
  }
}

export class AlertCandidateStage implements IAlertCandidateStage {
  async generateAlerts(record: SearchableEventRecord): Promise<AlertCandidate[]> {
    logger.info(`[AlertCandidate] Matching Event ${record.id} against millions of user watchlists...`);
    return [
      {
        eventId: record.id,
        userId: 'mock-user-123',
        relevanceScore: 92,
        matchReasons: ['Follows Logistics Sector', 'Follows Germany']
      }
    ];
  }
}
