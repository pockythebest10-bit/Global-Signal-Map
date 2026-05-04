import { SourceProvider } from '../Provider';
import { RawSourceItem } from '../models';

export class MockProvider implements SourceProvider {
  id = 'mock-provider-01';
  name = 'Mock News Network';
  type = 'manual' as const;

  async initialize(): Promise<void> {}

  async fetchLatest(): Promise<RawSourceItem[]> {
    return [
      {
        sourceId: `mock-${Date.now()}-1`,
        sourceName: this.name,
        sourceType: this.type,
        title: 'Global Supply Chain Disruptions Expected in Q3',
        body: 'Analysts predict that new tariffs and ongoing port congestion will create significant bottlenecks in the global supply chain by the third quarter of this year.',
        url: 'https://example.com/mock-1',
        publishedAt: new Date().toISOString(),
        geography: 'Global',
        rawPayload: {}
      },
      {
        sourceId: `mock-${Date.now()}-2`,
        sourceName: this.name,
        sourceType: this.type,
        title: 'Tech Giant Announces Breakthrough in Solid-State Batteries',
        body: 'A leading technology company has successfully tested a solid-state battery that doubles the range of current EVs while halving the charging time.',
        url: 'https://example.com/mock-2',
        publishedAt: new Date().toISOString(),
        geography: 'Asia',
        rawPayload: {}
      }
    ];
  }
}
