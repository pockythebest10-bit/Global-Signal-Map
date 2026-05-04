import { EventImpactsResponse, ImpactNodeDto, ImpactEdgeDto } from '../lib/apiContracts';
import { eventRepository, EventRepository } from './EventRepository';

export class EventImpactService {
  constructor(private repo: EventRepository) {}

  async getEventImpacts(eventId: string): Promise<EventImpactsResponse | null> {
    const event = await this.repo.getEventById(eventId);
    if (!event) return null;

    const nodes: ImpactNodeDto[] = [];
    const edges: ImpactEdgeDto[] = [];

    // Map origin location
    nodes.push({ id: `loc-${event.originLocation.name}`, label: event.originLocation.name, group: 'Location' });

    // Map primary entities
    event.primaryEntities.forEach(ent => {
        nodes.push({ id: `ent-${ent.name}`, label: ent.name, group: 'Entity' });
        edges.push({ source: `loc-${event.originLocation.name}`, target: `ent-${ent.name}`, type: 'Direct' });
    });

    event.impacts.forEach((imp, i) => {
        const id = `imp-${i}`;
        // Determine group roughly based on target type
        const group = imp.target.includes('Sector') || imp.target.includes('Industry') ? 'Sector' : 'Entity';
        nodes.push({ id, label: imp.target, group });
        
        let edgeType: 'Direct' | 'Likely' | 'Thematic' = 'Thematic';
        if (imp.type === 'Direct impact') edgeType = 'Direct';
        else if (imp.type === 'Likely impact') edgeType = 'Likely';

        edges.push({
            source: event.primaryEntities.length > 0 ? `ent-${event.primaryEntities[0].name}` : `loc-${event.originLocation.name}`,
            target: id,
            type: edgeType,
            description: imp.explanation
        });
    });

    return { nodes, edges };
  }
}

export const eventImpactService = new EventImpactService(eventRepository);
