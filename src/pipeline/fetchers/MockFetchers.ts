import { ISourceFetcher } from '../interfaces';
import { RawSourceItem } from '../types';
import { logger } from '../../lib/logger';

export class MockFinancialNewsFetcher implements ISourceFetcher {
  async fetch(): Promise<RawSourceItem[]> {
    logger.info('[Fetcher] Polling Mock Financial News API...');
    return [
      {
        id: `raw-${Date.now()}-1`,
        sourceType: 'news_api',
        provider: 'MockNews',
        fetchedAt: new Date(),
        rawPayload: {
          headline: "Major port strike authorized in Germany",
          bodyText: "Workers have voted to authorize a major strike at the Port of Hamburg...",
          url: "https://example.com/news/1",
          time: new Date().toISOString()
        }
      }
    ];
  }
}

export class MockRegulatoryFetcher implements ISourceFetcher {
  async fetch(): Promise<RawSourceItem[]> {
    logger.info('[Fetcher] Polling Mock Regulatory API...');
    return [];
  }
}
