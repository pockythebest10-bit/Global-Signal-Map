import { SignalEvent } from '../../types';

export interface CanonicalEvent extends SignalEvent {
  // Extending SignalEvent with pipeline-specific internal metadata
  sourceArticleIds: string[];
  lastProcessedAt: number;
  // AI inferred vector confidence
  vectorConfidence?: number;
  computedRelevanceScore?: number;
  matchReasons?: string[];
}
