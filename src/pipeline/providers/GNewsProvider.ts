import { SourceProvider } from '../Provider';
import { RawSourceItem } from '../models';

export class GNewsProvider implements SourceProvider {
  id = 'gnews-01';
  name = 'GNews API';
  type = 'api' as const;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GNEWS_API_KEY;
  }

  async initialize() {
    if (!this.apiKey) {
      console.warn('[GNewsProvider] GNEWS_API_KEY environment variable is missing.');
    }
  }

  async fetchLatest(): Promise<RawSourceItem[]> {
    if (!this.apiKey) {
       // Return empty array to gracefully handle missing config
       return [];
    }

    try {
      const url = `https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=10&token=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`GNews response was not ok: ${response.status}`);
      }

      const data = await response.json();
      const articles = data.articles || [];

      return articles.map((article: any, index: number) => {
        return {
          sourceId: `gnews-${Date.now()}-${index}`,
          sourceName: 'GNews (Business)',
          sourceType: 'api',
          title: article.title,
          body: article.content || article.description || '',
          url: article.url,
          publishedAt: article.publishedAt,
          rawPayload: article
        };
      });
    } catch (err) {
      console.error('[GNewsProvider] Fetch failed:', err);
      return [];
    }
  }
}
