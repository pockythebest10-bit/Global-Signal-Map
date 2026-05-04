import { NormalizedArticle } from '../models/NormalizedArticle';
import { CanonicalEvent } from '../models/CanonicalEvent';

export class EventExtractionPipeline {
  
  public extractEvent(article: NormalizedArticle): CanonicalEvent {
    // A real system would use an LLM here to summarize, categorize,
    // generate impact vectors, and score materiality.
    
    const cat = article.extractedEntities.length > 0 ? (article.extractedEntities[0].type === 'sector' ? 'Technology & Infrastructure' : 'Trade & Supply Chain') : 'Macro & Markets';
    const materiality = Math.floor(Math.random() * 60) + 30; // 30-90
    const confs = ['High', 'High', 'Medium', 'Medium', 'Low'];
    const confidence = confs[Math.floor(Math.random() * confs.length)] as any;
    
    return {
      id: `evt-canon-${article.id}`,
      title: article.title,
      summary: article.content,
      category: cat,
      eventType: 'Emerging Signal',
      materialityScore: materiality,
      confidence: confidence,
      originLocation: { lat: (Math.random() * 100) - 50, lng: (Math.random() * 200) - 100, name: 'Detected Origin', precision: 'exact' },
      impactLocations: [],
      timestamp: article.timestamp,
      primaryEntities: article.extractedEntities,
      secondaryEntities: [],
      whyItMatters: 'Detected abnormal deviation from standard operational baselines in this vector.',
      sourceArticleIds: [article.id],
      sourceStack: [{ name: 'Global Intel Stream', url: article.url, tier: Math.random() > 0.5 ? 'Tier 1' : 'Tier 2' }],
      sourceTier: Math.random() > 0.5 ? 'Tier 1' : 'Tier 2',
      relatedEventIds: [],
      watchlistRelevance: 0,
      lastProcessedAt: Date.now(),
      impacts: [
        {
          target: article.extractedEntities[0]?.name || 'Global Market',
          entityType: 'Sector',
          type: Math.random() > 0.5 ? 'Direct impact' : 'Likely impact',
          explanation: 'Based on semantic similarity to historic disruptions.',
          confidence: 'Medium'
        }
      ]
    };
  }
}
