import Parser from 'rss-parser';
import { ISourceFetcher } from '../interfaces';
import { RawSourceItem } from '../types';
import { logger } from '../../lib/logger';

interface RssProviderConfig {
  id: string;
  url: string;
  providerName: string;
  sourceType: 'rss';
}

export class RssFetcher implements ISourceFetcher {
  private parser: Parser;

  constructor(private config: RssProviderConfig) {
    this.parser = new Parser({
      customFields: {
        item: ['description']
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1'
      }
    });
  }

  async fetch(): Promise<RawSourceItem[]> {
    logger.info(`[RssFetcher] Fetching data from ${this.config.providerName} (${this.config.url})...`);
    
    try {
      const feed = await this.parser.parseURL(this.config.url);
      
      return (feed.items || []).slice(0, 15).map(item => ({
        id: `rss-${this.config.id}-${item.guid || item.id || Date.now() + Math.random()}`,
        sourceType: 'rss',
        provider: this.config.providerName,
        fetchedAt: new Date(),
        rawPayload: {
          headline: item.title || '',
          bodyText: item.contentSnippet || item.content || item.summary || '',
          url: item.link || '',
          time: item.pubDate || item.isoDate || new Date().toISOString()
        }
      }));
    } catch (error: any) {
      logger.error(`[RssFetcher] Error fetching from ${this.config.providerName}: ${error.message}`);
      return [];
    }
  }
}
