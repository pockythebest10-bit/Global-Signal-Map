import { RawArticle } from '../models/RawArticle';
import { NormalizedArticle } from '../models/NormalizedArticle';

export class NormalizationPipeline {
  
  public normalize(raw: RawArticle): NormalizedArticle {
    // In a real system, this might involve NLP/NER for entity extraction
    // and standardizing dates/formats.
    return {
      id: `norm-${raw.id}`,
      sourceId: raw.id,
      title: raw.originalTitle.trim(),
      content: raw.originalText.trim(),
      url: raw.url,
      timestamp: new Date(raw.publishedAt),
      language: 'en',
      extractedEntities: this.mockExtractEntities(raw.originalText)
    };
  }

  private mockExtractEntities(text: string) {
    const defaultEntities: { id: string; name: string; type: string }[] = [];
    if (text.toLowerCase().includes('supply chain')) {
      defaultEntities.push({ id: 'ent-1', name: 'Supply Chain', type: 'theme' });
    }
    if (text.toLowerCase().includes('battery') || text.toLowerCase().includes('ev')) {
       defaultEntities.push({ id: 'ent-2', name: 'Electric Vehicles', type: 'sector' });
    }
    return defaultEntities;
  }
}
