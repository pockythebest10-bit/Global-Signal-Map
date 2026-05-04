import { RawSourceItem, NormalizedCandidate } from './models';
import { EventCategory, Entity, Location } from '../types';

const GEO_KNOWLEDGE: Record<string, { lat?: number, lng?: number, precision: 'exact' | 'city' | 'country' | 'region' | 'none' }> = {
  // Region
  'Europe': { lat: 54.5260, lng: 15.2551, precision: 'region' },
  'EU': { lat: 50.8503, lng: 4.3517, precision: 'region' },
  'Middle East': { lat: 29.2985, lng: 42.5510, precision: 'region' },
  'Asia': { lat: 34.0479, lng: 100.6197, precision: 'region' },
  'Africa': { lat: 8.7832, lng: 34.5085, precision: 'region' },
  'Global': { precision: 'none'},
  // Country
  'USA': { lat: 37.0902, lng: -95.7129, precision: 'country' },
  'US': { lat: 37.0902, lng: -95.7129, precision: 'country' },
  'United States': { lat: 37.0902, lng: -95.7129, precision: 'country' },
  'China': { lat: 35.8617, lng: 104.1954, precision: 'country' },
  'Russia': { lat: 61.5240, lng: 105.3188, precision: 'country' },
  'Ukraine': { lat: 48.3794, lng: 31.1656, precision: 'country' },
  'Taiwan': { lat: 23.6978, lng: 120.9605, precision: 'country' },
  'Japan': { lat: 36.2048, lng: 138.2529, precision: 'country' },
  'Israel': { lat: 31.0461, lng: 34.8516, precision: 'country' },
  'Iran': { lat: 32.4279, lng: 53.6880, precision: 'country' },
  'Gaza': { lat: 31.4167, lng: 34.3333, precision: 'region' },
  'UK': { lat: 55.3781, lng: -3.4360, precision: 'country' },
  'United Kingdom': { lat: 55.3781, lng: -3.4360, precision: 'country' },
  'Germany': { lat: 51.1657, lng: 10.4515, precision: 'country' },
  'France': { lat: 46.2276, lng: 2.2137, precision: 'country' },
  'India': { lat: 20.5937, lng: 78.9629, precision: 'country' },
  'South Korea': { lat: 35.9078, lng: 127.7669, precision: 'country' },
  'North Korea': { lat: 40.3399, lng: 127.5101, precision: 'country' },
  'Canada': { lat: 56.1304, lng: -106.3468, precision: 'country' },
  'Australia': { lat: -25.2744, lng: 133.7751, precision: 'country' },
  'Brazil': { lat: -14.2350, lng: -51.9253, precision: 'country' },
  'Mexico': { lat: 23.6345, lng: -102.5528, precision: 'country' },
  'Saudi Arabia': { lat: 23.8859, lng: 45.0792, precision: 'country' },
  'Lebanon': { lat: 33.8547, lng: 35.8623, precision: 'country' },
  'Syria': { lat: 34.8021, lng: 38.9968, precision: 'country' },
  'Yemen': { lat: 15.5527, lng: 48.5164, precision: 'country' },
  // City
  'Washington': { lat: 38.8951, lng: -77.0364, precision: 'city' },
  'New York': { lat: 40.7128, lng: -74.0060, precision: 'city' },
  'Beijing': { lat: 39.9042, lng: 116.4074, precision: 'city' },
  'Moscow': { lat: 55.7558, lng: 37.6173, precision: 'city' },
  'Kyiv': { lat: 50.4501, lng: 30.5234, precision: 'city' },
  'Tokyo': { lat: 35.6762, lng: 139.6503, precision: 'city' },
  'Jerusalem': { lat: 31.7683, lng: 35.2137, precision: 'city' },
  'Tehran': { lat: 35.6892, lng: 51.3890, precision: 'city' },
  'London': { lat: 51.5074, lng: -0.1278, precision: 'city' },
  'Berlin': { lat: 52.5200, lng: 13.4050, precision: 'city' },
  'Paris': { lat: 48.8566, lng: 2.3522, precision: 'city' },
  'New Delhi': { lat: 28.6139, lng: 77.2090, precision: 'city' },
  'Seoul': { lat: 37.5665, lng: 126.9780, precision: 'city' },
  'Pyongyang': { lat: 39.0392, lng: 125.7625, precision: 'city' },
  'Riyadh': { lat: 24.7136, lng: 46.6753, precision: 'city' },
  'Beirut': { lat: 33.8938, lng: 35.5018, precision: 'city' },
  'Damascus': { lat: 33.5138, lng: 36.2765, precision: 'city' },
};

export class NormalizationLayer {
  public normalize(raw: RawSourceItem): NormalizedCandidate | null {
    // 1. Basic Cleaning
    const title = this.cleanTitle(raw.title);
    if (title.length < 15 || title.split(' ').length < 3) {
      // Too short, low-information
      return null;
    }

    const rawSummary = (raw as any).summary || '';
    const summary = this.cleanSummary(raw.body || rawSummary);
    if (summary.length < 30) {
      // Weak or low-information event
      return null;
    }

    // Drop purely navigational noise like "Read more", "Click here", "Subscribe"
    const noiseWords = ['subscribe', 'read more', 'click here', 'advertisement', 'sign up', 'newsletter'];
    if (noiseWords.some(w => title.toLowerCase().includes(w) || summary.toLowerCase().includes(w))) {
       if (summary.length < 100) return null; // Likely an ad stub
    }

    // 2. Entity Extraction Heuristics
    const extractedEntities: Entity[] = this.extractEntities(title, summary, raw.entities);

    // 3. Category & Event Type Heuristics
    const rawCategories = (raw as any).categories;
    const category = this.inferCategory(title, summary, rawCategories);

    // 4. Location Extraction
    const originLocation: Location = this.inferLocation(title, summary, raw.geography);
    const impactLocations: Location[] = this.extractImpactLocations(title, summary, originLocation.name);

    return {
      candidateId: `cand-${raw.sourceId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceItem: raw,
      title: title,
      summary: summary,
      category: category,
      eventType: 'Signal', // Keep basic for now
      originLocation,
      impactLocations,
      confidence: 'Low', // Start low, wait for deduplication/impacts to boost
      extractedEntities,
      themes: rawCategories && rawCategories.length > 0 ? rawCategories.slice(0, 3) : [],
      timestamp: raw.publishedAt ? new Date(raw.publishedAt) : new Date()
    };
  }

  private cleanTitle(title: string): string {
    if (!title) return '';
    let cleaned = title.trim();
    // Remove " - Publisher", " | Publisher"
    cleaned = cleaned.replace(/\s+[-|]\s+([A-Z][a-zA-Z\s]+)$/, '');
    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]*>?/gm, '');
    // Decode basic entities
    cleaned = cleaned.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    return cleaned;
  }

  private cleanSummary(summary: string): string {
    if (!summary) return '';
    let cleaned = summary.trim();
    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]*>?/gm, '');
    // Decode basic entities
    cleaned = cleaned.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    // Ensure reasonable length snippet
    const sentences = cleaned.split(/(?<=[.?!])\s+/);
    // Take first 1-2 sentences that provide good context
    let snippet = '';
    for (const s of sentences) {
      if (snippet.length + s.length > 250) break;
      snippet += (snippet ? ' ' : '') + s.trim();
    }
    return snippet || cleaned.substring(0, 250).trim() + (cleaned.length > 250 ? '...' : '');
  }

  private extractEntities(title: string, summary: string, existing?: string[]): Entity[] {
    const rawList = [...(existing || [])];
    
    // Capitalized N-grams in title (naive Named Entity Recognition)
    const titleWords = title.split(/\s+/);
    for (let i = 0; i < titleWords.length; i++) {
       if (titleWords[i].match(/^[A-Z][a-z]+/)) {
         let entity = titleWords[i];
         if (i + 1 < titleWords.length && titleWords[i+1].match(/^[A-Z][a-z]+/)) {
            entity += ' ' + titleWords[i+1];
            i++;
         }
         rawList.push(entity.replace(/[^a-zA-Z\s]/g, ''));
       }
    }

    const uniqueEntities = Array.from(new Set(rawList.filter(e => e.length > 3)));
    return uniqueEntities.slice(0, 5).map((e, idx) => ({
      id: `ent-${Date.now()}-${idx}-${e.replace(/\s+/g, '')}`,
      name: e,
      type: 'keyword'
    }));
  }

  private inferCategory(title: string, summary: string, rawCategories?: string[]): EventCategory {
    const text = (title + ' ' + summary).toLowerCase();
    
    // Map to the actual allowed EventCategory strings:
    // 'Politics & Policy' | 'Macro & Markets' | 'Corporate Actions' | 'Technology & Infrastructure' | 'Trade & Supply Chain'
    
    if (text.match(/\b(military|drone|missile|attack|troops|war|navy|base|election|vote|parliament|congress|president|minister)\b/)) return 'Politics & Policy';
    if (text.match(/\b(ai|cyber|hack|breach|vulnerability|software|tech|data)\b/)) return 'Technology & Infrastructure';
    if (text.match(/\b(market|stocks|inflation|bank|fed|economy|rates)\b/)) return 'Macro & Markets';
    if (text.match(/\b(climate|weather|storm|hurricane|flood|wildfire|earthquake|trade|supply chain|tariff|port)\b/)) return 'Trade & Supply Chain';
    if (text.match(/\b(merger|acquisition|bankruptcy|ceo|earnings)\b/)) return 'Corporate Actions';
    
    if (rawCategories && rawCategories.length > 0) {
        // loose mapping
        const cat = rawCategories[0].toLowerCase();
        if (cat.includes('politics') || cat.includes('world')) return 'Politics & Policy';
        if (cat.includes('tech')) return 'Technology & Infrastructure';
        if (cat.includes('business') || cat.includes('market')) return 'Macro & Markets';
    }
    
    return 'Macro & Markets'; // fallback
  }

  private inferLocation(title: string, summary: string, rawGeo?: string): Location {
    // Try to guess from text if rawGeo is missing
    const text = title + ' ' + summary;
    
    const sortedKeys = Object.keys(GEO_KNOWLEDGE).sort((a, b) => b.length - a.length);

    if (rawGeo) {
      if (GEO_KNOWLEDGE[rawGeo]) return { ...GEO_KNOWLEDGE[rawGeo], name: rawGeo };
      
      for (const key of sortedKeys) {
         const regex = new RegExp(`\\b${key}\\b`, 'i');
         if (regex.test(rawGeo)) {
            return { ...GEO_KNOWLEDGE[key], name: rawGeo };
         }
      }
      return { name: rawGeo, precision: 'none' }; // unknown coords
    }

    // Try finding the most specific matching location by checking text
    // Sorting GEO_KNOWLEDGE keys by length descending to match specific regions first (e.g., 'New York' before 'New')
    for (const key of sortedKeys) {
      // Use word boundaries for better matching
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(text)) {
         return { ...GEO_KNOWLEDGE[key], name: key };
      }
    }

    // Fallback best approximation
    if (text.match(/asia/i)) return { lat: 34.0479, lng: 100.6197, name: 'Asia', precision: 'region' };
    if (text.match(/africa/i)) return { lat: 8.7832, lng: 34.5085, name: 'Africa', precision: 'region' };

    return { name: 'Global / Unspecified', precision: 'none' };
  }

  public extractImpactLocations(title: string, summary: string, originName: string): Location[] {
     const text = title + ' ' + summary;
     const impacts: Location[] = [];
     const added = new Set<string>();
     added.add(originName);
     
     const sortedKeys = Object.keys(GEO_KNOWLEDGE).sort((a, b) => b.length - a.length);
     for (const key of sortedKeys) {
        if (!added.has(key)) {
           const regex = new RegExp(`\\b${key}\\b`, 'i');
           if (regex.test(text)) {
              impacts.push({ ...GEO_KNOWLEDGE[key], name: key });
              added.add(key);
           }
        }
     }
     
     return impacts.slice(0, 3); // max 3 credible additional locations
  }
}

