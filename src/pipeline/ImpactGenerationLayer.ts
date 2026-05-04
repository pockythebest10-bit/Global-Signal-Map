import { CanonicalEvent } from './models';
import { EventImpact } from '../types';

export class ImpactGenerationLayer {
  
  public generateImpacts(event: CanonicalEvent): CanonicalEvent {
    // Wait until event has stable initial configuration
    if (event.impacts && event.impacts.length > 0) {
      // Impacts already generated, might want to re-eval if massive shift, 
      // but for now skip if already exists.
      return event;
    }

    const newImpacts: EventImpact[] = [];
    const textContext = (event.title + ' ' + (event.summary || '')).toLowerCase();
    
    // 1. Entity-based Direct Impacts
    if (event.primaryEntities && event.primaryEntities.length > 0) {
      // Pick up to 2 primary entities directly involved
      const primaryDirect = event.primaryEntities.slice(0, 2);
      for (const entity of primaryDirect) {
        let explanation = '';
        if (textContext.match(/invest|acquir|merg|buy|sell|stake/)) {
          explanation = `Direct exposure to equity valuation and strategic structural changes following the corporate action.`;
        } else if (textContext.match(/attack|strike|breach|hack|vulnerab/)) {
          explanation = `Operational disruption and immediate security remediation risk due to reported incidents.`;
        } else if (textContext.match(/regulat|sue|court|lawsuit|fine|ban/)) {
          explanation = `Regulatory scrutiny and potential compliance costs directly targeting operations.`;
        } else {
          explanation = `Direct situational exposure to the unfolding changes reported in the event.`;
        }

        newImpacts.push({
          target: entity.name,
          entityType: entity.type || 'Entity',
          type: 'Direct impact',
          explanation,
        });
      }
    }

    // 2. Geography/Category-based Likely Impacts
    if (event.category === 'Trade & Supply Chain' && event.impactLocations && event.impactLocations.length > 0) {
      newImpacts.push({
        target: `Regional Supply Chains (${event.impactLocations[0].name})`,
        entityType: 'Logistics Network',
        type: 'Likely impact',
        explanation: `Friction at key nodes in ${event.originLocation.name} typically triggers 5-15% delays affecting throughput in ${event.impactLocations[0].name}.`,
      });
    } else if (event.category === 'Trade & Supply Chain') {
      newImpacts.push({
        target: `Global Logistics Routes`,
        entityType: 'Infrastructure',
        type: 'Likely impact',
        explanation: `Disruptions in ${event.originLocation.name} create localized capacity constraints and re-routing premiums.`,
      });
    } else if (event.category === 'Macro & Markets') {
      if (textContext.match(/rate|inflation|fed|bank/)) {
        newImpacts.push({
          target: 'Regional Credit Markets',
          entityType: 'Market Sector',
          type: 'Likely impact',
          explanation: `Changes to benchmark metrics rapidly re-price local debt yields and borrowing costs.`,
        });
      } else if (textContext.match(/oil|gas|energy|fuel/)) {
        newImpacts.push({
          target: 'Energy Spot Prices',
          entityType: 'Commodity',
          type: 'Likely impact',
          explanation: `Supply-side shocks or quota changes introduce volatility premiums in near-term commodity futures.`,
        });
      }
    } else if (event.category === 'Politics & Policy') {
       if (textContext.match(/tariff|trade war|sanction/)) {
           newImpacts.push({
             target: 'Cross-border Equities',
             entityType: 'Market Sector',
             type: 'Likely impact',
             explanation: `Increased compliance costs and retaliatory tariffs threaten regional market access.`,
           });
       }
    } else if (event.category === 'Technology & Infrastructure') {
       if (textContext.match(/ai|artificial intelligence/)) {
           newImpacts.push({
             target: 'AI Compute & Semiconductor Supply',
             entityType: 'Industry Domain',
             type: 'Thematic relevance',
             explanation: `Strategic investments and regulatory focus reflect persistent demand-side pressure on upstream hardware.`,
           });
       }
    }

    // 3. Fallback Impact if none generated
    if (newImpacts.length === 0) {
      newImpacts.push({
        target: `${event.originLocation.name} Local Markets`,
        entityType: 'Regional Economy',
        type: 'Thematic relevance',
        explanation: 'Broader sentiment shifts often percolate across domestic sectors following material inflection points.',
      });
    }

    event.impacts = newImpacts;

    // Set Why It Matters tailored to Category
    if (!event.whyItMatters) {
      if (event.category === 'Trade & Supply Chain') {
         event.whyItMatters = `Disruptions in this node often cascade, threatening inventory buffers and increasing spot freight rates.`;
      } else if (event.category === 'Macro & Markets') {
         event.whyItMatters = `Systemic financial shifts quickly alter capital allocation strategies and force reassessment of risk premiums.`;
      } else if (event.category === 'Technology & Infrastructure') {
         event.whyItMatters = `Technological inflection points accelerate competitive divergence and force rapid capital expenditure adjustments.`;
      } else {
         event.whyItMatters = `This represents a material inflection point in the structural dynamics of ${event.originLocation.name}'s ongoing evolution.`;
      }
    }

    // Set What To Watch Next
    if (!event.whatToWatchNext || event.whatToWatchNext.length === 0) {
      const actions: string[] = [];
      if (textContext.match(/election|vote|parliament|congress/)) {
         actions.push(`Watch for initial legislative proposals or cabinet appointments in the coming weeks.`);
      }
      if (event.category === 'Corporate Actions') {
         actions.push(`Monitor competitor responses and potential regulatory antitrust scrutiny.`);
         actions.push(`Assess forward-looking guidance in upcoming earnings prints.`);
      }
      if (event.impactLocations && event.impactLocations.length > 0) {
         actions.push(`Track secondary policy or market reactions emerging from ${event.impactLocations[0].name}.`);
      }
      if (actions.length === 0) {
         actions.push(`Monitor related sector peer equity reactions over next 48h.`);
      }
      event.whatToWatchNext = actions;
    }

    // Calculate Materiality based on sources and entities
    const baseScore = 40;
    const sourcesBoost = Math.min(30, (event.sourceItems?.length || 1) * 8);
    const entitiesBoost = Math.min(20, (event.primaryEntities?.length || 0) * 4);
    const typeBoost = event.category.includes('Macro') || event.category.includes('Politics') ? 10 : 5;
    
    event.materialityScore = Math.min(99, baseScore + sourcesBoost + entitiesBoost + typeBoost);

    return event;
  }
}
