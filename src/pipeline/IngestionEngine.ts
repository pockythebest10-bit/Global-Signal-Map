import { SourceProvider } from './Provider';
import { NormalizationLayer } from './NormalizationLayer';
import { DeduplicationLayer } from './DeduplicationLayer';
import { ImpactGenerationLayer } from './ImpactGenerationLayer';
import { RankingPipeline } from './RankingPipeline';
import { CanonicalEvent, RawSourceItem, NormalizedCandidate } from './models';
import { WatchlistItem } from '../types';

export class IngestionEngine {
  private providers: Map<string, SourceProvider> = new Map();
  private normalization = new NormalizationLayer();
  private deduplication = new DeduplicationLayer();
  private impacts = new ImpactGenerationLayer();
  private ranking = new RankingPipeline();

  // Output hooks
  public onEventCreated?: (event: CanonicalEvent) => void;
  public onEventUpdated?: (event: CanonicalEvent) => void;

  // Storage arrays to retain separated data
  public rawStorage: RawSourceItem[] = [];
  public normalizedStorage: NormalizedCandidate[] = [];

  public providerStats = new Map<string, { lastFetchTime: Date | null; status: 'ok' | 'error' | 'idle'; numIngested: number }>();

  public registerProvider(provider: SourceProvider) {
    this.providers.set(provider.id, provider);
    this.providerStats.set(provider.id, { lastFetchTime: null, status: 'idle', numIngested: 0 });
  }

  public getProviders() {
       return Array.from(this.providers.values());
  }

  public async ingestAndProcess(watchlist: WatchlistItem[]): Promise<CanonicalEvent[]> {
    return this.tick(watchlist);
  }

  /**
   * Mocked internal orchestrator:
   * 1. Fetches from all providers
   * 2. Normalizes
   * 3. Deduplicates
   * 4. Generates Impacts
   * 5. Ranks
   */
  public async tick(watchlist: WatchlistItem[]): Promise<CanonicalEvent[]> {
    const batchedEvents: CanonicalEvent[] = [];

    for (const provider of this.providers.values()) {
      const stats = this.providerStats.get(provider.id)!;
      try {
        const rawItems = await provider.fetchLatest();
        stats.lastFetchTime = new Date();
        stats.status = 'ok';
        stats.numIngested += rawItems.length;

        for (const raw of rawItems) {
          // Store raw version
          this.rawStorage.push(raw);

          // Normalize
          const candidate = this.normalization.normalize(raw);
          if (!candidate) continue; // Weak event dropped
          
          // Store normalized version
          this.normalizedStorage.push(candidate);

          // Deduplicate
          const canonical = this.deduplication.mergeOrYield(candidate);

          // Generate Impacts
          const enriched = this.impacts.generateImpacts(canonical);

          // Score & Rank
          const ranked = this.ranking.calculateRelevance(enriched, watchlist);

          batchedEvents.push(ranked);

          // Optional: fire events for UI
          if (this.onEventUpdated) {
             // Let's assume all pass through updated for simplicity
             this.onEventUpdated(ranked);
          }
        }
      } catch (err) {
        stats.status = 'error';
        console.error(`Provider [${provider.id}] tick failed:`, err);
      }
    }

    return batchedEvents;
  }

  // Support hydrating DB to deductive memory
  public hydrate(events: CanonicalEvent[]) {
    this.deduplication.hydrate(events);
  }
}

export const ingestionEngine = new IngestionEngine();
