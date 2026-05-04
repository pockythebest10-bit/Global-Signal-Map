import { CanonicalEvent } from '../models/CanonicalEvent';

export class SearchIndexingPipeline {
  private index: Map<string, CanonicalEvent> = new Map();

  public indexEvents(events: CanonicalEvent[]) {
    events.forEach(e => {
       this.index.set(e.id, e);
    });
  }

  public search(query: string): CanonicalEvent[] {
    const q = query.toLowerCase();
    const results: CanonicalEvent[] = [];
    
    this.index.forEach(event => {
      if (
        event.title.toLowerCase().includes(q) ||
        event.summary.toLowerCase().includes(q) ||
        event.primaryEntities.some(entity => entity.name.toLowerCase().includes(q))
      ) {
         results.push(event);
      }
    });

    return results;
  }
}
