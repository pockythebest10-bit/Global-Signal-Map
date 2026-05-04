export interface RawArticle {
  id: string;
  providerId: string;
  originalTitle: string;
  originalText: string;
  url: string;
  publishedAt: string;
  author?: string;
  rawMetadata?: Record<string, any>;
}
