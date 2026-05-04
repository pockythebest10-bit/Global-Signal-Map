export interface NormalizedArticle {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  url: string;
  timestamp: Date;
  extractedEntities: {
    id: string;
    name: string;
    type: string;
  }[];
  language: string;
}
