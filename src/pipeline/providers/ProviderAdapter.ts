import { RawArticle } from '../models/RawArticle';

export interface ProviderAdapter {
  id: string;
  name: string;
  fetchLatest(limit?: number): Promise<RawArticle[]>;
  fetchByKeyword?(keyword: string, limit?: number): Promise<RawArticle[]>;
}
