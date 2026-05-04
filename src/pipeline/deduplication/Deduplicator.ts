import { CanonicalEvent } from '../types';
import { stringJaccardIndex, arrayOverlapRatio, timeProximityHours } from './SimilarityMetrics';
import { CandidateContext, ExistingEventContext } from '../interfaces';

const MATCH_THRESHOLD = 0.65;
const MAX_TIME_DIFF_HOURS = 72; // Events separated by more than 72 hours are likely distinct

export class Deduplicator {

  /**
   * Compares an incoming item against an existing CanonicalEvent.
   * Returns a match score between 0.0 and 1.0.
   */
  public computeSimilarity(incoming: CandidateContext, existing: ExistingEventContext): number {
    // 1. Time Check - if outside the delta, hard fail or heavily penalize
    const hoursDiff = timeProximityHours(incoming.article.publishedAt, existing.event.timestamp);
    if (hoursDiff > MAX_TIME_DIFF_HOURS) {
      return 0.0;
    }
    
    // 2. Title & Content Similarity
    const incomingText = incoming.article.title + ' ' + (incoming.categorization.summary || '');
    const existingText = existing.event.title + ' ' + existing.event.summary;
    const textScore = stringJaccardIndex(incomingText, existingText);

    // 3. Entity Overlap
    const incomingEntities = [
      ...incoming.extracted.primaryEntities.map(e => e.name),
      ...incoming.extracted.secondaryEntities.map(e => e.name)
    ];
    const existingEntities = [
      ...existing.primaryEntities.map(e => e.name),
      ...existing.secondaryEntities.map(e => e.name)
    ];
    const entityScore = arrayOverlapRatio(incomingEntities, existingEntities);
    
    // 4. Geography Overlap
    const geoScore = stringJaccardIndex(incoming.extracted.originLocation.name, existing.originLocation.name);

    // 5. Category Match
    const incomingCat = incoming.categorization.eventType || incoming.categorization.category || '';
    const existingCat = existing.event.eventType || existing.event.category || '';
    const catScore = incomingCat === existingCat ? 1.0 : 0.0;

    // Weighted Final Score
    let finalScore = 
      (textScore * 0.3) +
      (entityScore * 0.4) +
      (geoScore * 0.2) +
      (catScore * 0.1);

    // Minor decay over time
    const timeDecay = Math.max(0, 1 - (hoursDiff / (MAX_TIME_DIFF_HOURS * 2)));
    return finalScore * timeDecay;
  }

  /**
   * Evaluates if the score implies a match.
   */
  public isMatch(score: number): boolean {
    return score >= MATCH_THRESHOLD;
  }

  /**
   * Merges an incoming item into a matched existing CanonicalEvent.
   */
  public merge(incoming: CandidateContext, existing: CanonicalEvent): CanonicalEvent {
    const updatedSourceIds = Array.from(new Set([...existing.sourceArticleIds, incoming.article.id]));
    const newSourceCount = updatedSourceIds.length;
    
    // Increase confidence log-linearly with source count
    const newConfidence = Math.min(100, existing.confidence + (10 / Math.max(1, Math.log2(newSourceCount))));

    return {
      ...existing,
      // If the incoming article is from a highly credible source or has a better title, we might conditionally update title/summary.
      // For now, keep the original canonical fields but bump metadata.
      sourceArticleIds: updatedSourceIds,
      sourceCount: newSourceCount,
      confidence: newConfidence,
      lastUpdatedAt: new Date(), // It was bumped by new intake
      // If the incoming article is older, perhaps it shifts the canonical timestamp
      timestamp: incoming.article.publishedAt < existing.timestamp ? incoming.article.publishedAt : existing.timestamp
    };
  }

  /**
   * Creates a net-new CanonicalEvent record.
   */
  public createCanonical(incoming: CandidateContext): CanonicalEvent {
    return {
      id: `evt-can-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      title: incoming.article.title,
      summary: incoming.categorization.summary || incoming.article.content.substring(0, 200),
      category: incoming.categorization.category || 'Uncategorized',
      eventType: incoming.categorization.eventType || 'Unknown',
      materialityScore: incoming.categorization.materialityScore || 50,
      confidence: 50, // base confidence for single source
      timestamp: incoming.article.publishedAt,
      lastUpdatedAt: new Date(),
      sourceArticleIds: [incoming.article.id],
      sourceCount: 1
    };
  }

}
