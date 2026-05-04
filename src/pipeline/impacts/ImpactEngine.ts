import { CanonicalEvent, ExtractedEntities, EventImpactResult } from '../types';
import { EventImpact } from '../../types';

// Mock Knowledge Graph for relationships
const KNOWN_RELATIONSHIPS: Record<string, string[]> = {
  'TSMC': ['Apple', 'NVIDIA', 'AMD', 'Semiconductor Supply Chain'],
  'Port of Hamburg': ['European Automotive Shipping', 'Logistics Sector'],
  'Taiwan': ['Semiconductor Supply Chain', 'Global Electronics'],
};

// Mock Geography mappings (Country/Region -> Macro Region)
const MACRO_REGIONS: Record<string, string> = {
  'Taiwan': 'East Asia',
  'Germany': 'Europe',
  'Hamburg, Germany': 'Europe',
  'United States': 'North America'
};

export class ImpactEngine {
  
  public async generateImpacts(event: CanonicalEvent, extracted: ExtractedEntities): Promise<EventImpactResult> {
    const impacts: EventImpact[] = [];
    
    // 1. Direct Mentions (from secondary entities extracted from text)
    for (const entity of extracted.secondaryEntities) {
      impacts.push({
        target: entity.name,
        entityType: entity.type,
        type: 'Likely impact',
        explanation: `Directly mentioned in the event context.`,
        confidence: 'High',
        evidenceType: 'direct_mention'
      });
    }

    // 2. Structured Known Relationships
    for (const entity of extracted.primaryEntities) {
      const related = KNOWN_RELATIONSHIPS[entity.name];
      if (related) {
        for (const target of related) {
          // Check if not already added
          if (!impacts.some(i => i.target === target)) {
            impacts.push({
              target: target,
              type: 'Likely impact',
              explanation: `Known structured relationship with ${entity.name}.`,
              confidence: 'Medium',
              evidenceType: 'known_relationship'
            });
          }
        }
      }
    }

    // 3. Geography Rules
    if (extracted.originLocation) {
      const locName = extracted.originLocation.name;
      const macroRegion = MACRO_REGIONS[locName];
      if (macroRegion) {
        impacts.push({
          target: `${macroRegion} Regional Operations`,
          type: 'Thematic relevance',
          explanation: `Event occurred in ${locName}, which borders or affects the broader ${macroRegion} macro-region.`,
          confidence: 'Low',
          evidenceType: 'geography_rule'
        });
      }
    }

    // 4. Thematic Rules (based on category or event type)
    if (event.category === 'Technology & Infrastructure' || event.eventType === 'Cyberattack') {
       impacts.push({
         target: 'Digital Infrastructure Sector',
         type: 'Thematic relevance',
         explanation: `System-level category rules flag broader sector exposure for ${event.category} events.`,
         confidence: 'Low',
         evidenceType: 'thematic_rule'
       });
    }

    if (event.category === 'Labor & Supply Chain' || event.eventType === 'Labor Strike') {
       impacts.push({
         target: 'Global Supply Chain Continuity',
         type: 'Thematic relevance',
         explanation: `System-level category rules flag broader exposure for supply chain disruptions.`,
         confidence: 'Medium',
         evidenceType: 'thematic_rule'
       });
    }
    
    return { impacts };
  }
}
