import { logger } from '../lib/logger';
import { ISourceFetcher } from './interfaces';
import { 
  NormalizationStage, 
  EntityExtractionStage, 
  CategorizationStage, 
  DeduplicationStage, 
  ImpactGenerationStage, 
  PersistenceStage, 
  AlertCandidateStage 
} from './MockStages';
import { SearchableEventRecord } from './types';

export class IngestionPipeline {
  constructor(
    private fetchers: ISourceFetcher[],
    private normalizer: NormalizationStage,
    private extractor: EntityExtractionStage,
    private categorizer: CategorizationStage,
    private deduplicator: DeduplicationStage,
    private impactGenerator: ImpactGenerationStage,
    private persister: PersistenceStage,
    private alertGenerator: AlertCandidateStage
  ) {}

  async runCycle(): Promise<void> {
    logger.info('--- Starting Ingestion Pipeline Cycle ---');
    
    // 1. Fetching
    const allRawItems = [];
    for (const fetcher of this.fetchers) {
      const items = await fetcher.fetch();
      allRawItems.push(...items);
    }

    logger.info(`[Pipeline] Fetched ${allRawItems.length} new raw items.`);

    // Process each item
    for (const raw of allRawItems) {
      try {
        // Store Raw Version
        await this.persister.saveRawItem(raw);

        // 2. Normalize
        const article = await this.normalizer.normalize(raw);

        // Store Normalized Version
        await this.persister.saveNormalizedArticle(article);

        // 3. Extract Entities
        const extracted = await this.extractor.extractEntities(article);

        // 4. Categorize
        const categorization = await this.categorizer.categorize(article);

        // 5. Deduplicate
        const candidateContext = { article, extracted, categorization };
        const duplicateId = await this.deduplicator.findDuplicate(candidateContext);
        let canonicalEvent;
        
        if (duplicateId) {
          canonicalEvent = await this.deduplicator.merge(duplicateId, candidateContext);
          // Assuming impact/categorization might not need full regeneration for minor updates,
          // but for architecture's sake we will proceed to updates.
        } else {
          canonicalEvent = await this.deduplicator.createNew(candidateContext);
        }

        // 6. Impact Generation
        const impactGeneratorLayer = new (require('./ImpactGenerationLayer').ImpactGenerationLayer)();
        let impactResultCanonical = impactGeneratorLayer.generateImpacts(canonicalEvent);
        // Extract impacts array from the enriched canonicalEvent
        const generatedImpacts = impactResultCanonical.impacts || [];

        // Assemble Final Record
        const searchableRecord: SearchableEventRecord = {
          ...impactResultCanonical,
          category: impactResultCanonical.category as any, // Cast to avoid enum errors
          primaryEntities: extracted.primaryEntities,
          secondaryEntities: extracted.secondaryEntities,
          originLocation: extracted.originLocation,
          impactLocations: impactResultCanonical.impactLocations || [], 
          impacts: generatedImpacts,
          sourceCount: canonicalEvent.sourceItems ? canonicalEvent.sourceItems.length : 1,
          sourceStack: canonicalEvent.sourceStack,
          sourceTier: 'Tier 1' as const,
          confidence: 'High' as const,
          relatedEventIds: [],
          watchlistRelevance: 0,
          whyItMatters: '',
          ftsTokens: [canonicalEvent.title, canonicalEvent.summary, ...extracted.primaryEntities.map(e => e.name)],
          lastIndexedAt: new Date()
        };

        // 7. Persistence
        await this.persister.saveEventRecord(searchableRecord);

        // 8. Alerts
        const alertCandidates = await this.alertGenerator.generateAlerts(searchableRecord);
        logger.info(`[Pipeline] Dispatched ${alertCandidates.length} alerts for event ${canonicalEvent.id}.`);

      } catch (err) {
        logger.error(`[Pipeline] Failed to process raw item ${raw.id} -`, err);
      }
    }

    logger.info('--- Finished Ingestion Pipeline Cycle ---');
  }

  getEvents(): SearchableEventRecord[] {
    return this.persister.getEvents();
  }
}
