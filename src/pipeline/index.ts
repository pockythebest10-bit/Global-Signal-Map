import { ingestionEngine } from './IngestionEngine';
import { CanonicalEvent, RawSourceItem } from './models';
import { GNewsProvider } from './providers/GNewsProvider';
import { RssFetcher } from './fetchers/RssFetcher';

// Provide a mock provider for initial data
import { SourceProvider } from './Provider';

class MockAppProvider implements SourceProvider {
  id = 'mock-1';
  name = 'Mock Integration Provider';
  type = 'api' as const;

  async initialize() {}

  async fetchLatest(): Promise<RawSourceItem[]> {
    return [
      {
        sourceId: 'mock-source-id-' + Date.now(),
        sourceName: 'Simulated Feed Network',
        sourceType: 'api',
        title: 'Global Supply Chain Disruptions Expected in Q3',
        body: 'Analysts predict that new tariffs and ongoing port congestion will create significant bottlenecks in the global supply chain by the third quarter of this year.',
        url: 'https://example.com/mock-1',
        publishedAt: new Date().toISOString(),
        rawPayload: {}
      }
    ];
  }
}

class RssProviderAdapter implements SourceProvider {
  id: string;
  name: string;
  type: 'rss' = 'rss';
  private fetcher: RssFetcher;

  constructor(id: string, name: string, url: string) {
    this.id = id;
    this.name = name;
    this.fetcher = new RssFetcher({ id, url, providerName: name, sourceType: 'rss' });
  }

  async initialize() {}

  async fetchLatest(): Promise<RawSourceItem[]> {
    const items = await this.fetcher.fetch();
    return items.map(i => ({
       sourceId: i.id,
       sourceName: i.provider,
       sourceType: i.sourceType as any,
       title: i.rawPayload.headline,
       body: i.rawPayload.bodyText,
       url: i.rawPayload.url,
       publishedAt: i.rawPayload.time,
       rawPayload: i.rawPayload
    }));
  }
}

export function initializePipeline() {
  ingestionEngine.registerProvider(new MockAppProvider());
  
  const gnews = new GNewsProvider();
  gnews.initialize();
  ingestionEngine.registerProvider(gnews);
  
  if (process.env.REAL_SOURCE_RSS_URL) {
    const rssParams = process.env.REAL_SOURCE_RSS_URL.split(',');
    for (const url of rssParams) {
       const rssProv = new RssProviderAdapter(`rss-${Math.random().toString(36).substring(7)}`, 'RSS Feed', url);
       rssProv.initialize();
       ingestionEngine.registerProvider(rssProv);
    }
  }

  let currentEvents: CanonicalEvent[] = [];

  return {
    runCycle: async () => {
      // Dummy watchlist for now, since it relies on user state which server doesn't have easily
      const watchlist = [{ id: '1', keyword: 'supply chain', sensitivity: 'high' as const, addedAt: new Date(), type: 'keyword' as const }];
      const batched = await ingestionEngine.tick(watchlist);
      
      // Upsert into memory store
      const map = new Map<string, CanonicalEvent>();
      currentEvents.forEach(e => map.set(e.id, e));
      batched.forEach(e => map.set(e.id, e));
      currentEvents = Array.from(map.values()).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Update memory deduplication
      ingestionEngine.hydrate(currentEvents);
      return batched;
    },
    getEvents: () => {
      return currentEvents;
    }
  };
}
