import { addHours, subHours, subDays } from 'date-fns';

import type {
  SignalEvent,
  EventCategory,
  SourceTier,
  ConfidenceLevel,
  ImpactType,
  Location,
  EventImpact
} from '../types';

export type {
  SignalEvent,
  EventCategory,
  SourceTier,
  ConfidenceLevel,
  ImpactType,
  Location,
  EventImpact
};

const now = new Date();

export const MOCK_EVENTS: SignalEvent[] = [
  {
    id: 'evt-1',
    title: 'TSMC Confirms Deferral of 2nm Equipment Installation at Arizona Facility',
    summary: 'Taiwan Semiconductor Manufacturing Co. confirms that specialized labor shortages and delayed federal CHIPS Act disbursements will push structural completion of its second Phoenix fab back by 8-10 months, deferring volume 2nm production.',
    category: 'Technology & Infrastructure',
    eventType: 'Capital Expenditure Revision',
    timestamp: subHours(now, 2),
    sourceStack: [
      { name: 'Financial Times', url: '#' },
      { name: 'Corporate Earnings Call (Transcript)', url: '#' }
    ],
    sourceTier: 'Tier 1',
    originLocation: { lat: 33.4484, lng: -112.0740, name: 'Phoenix, AZ, USA' },
    impactLocations: [
      { lat: 25.0330, lng: 121.5654, name: 'Taipei, Taiwan' },
      { lat: 37.3382, lng: -121.8863, name: 'San Jose, CA, USA' }
    ],
    primaryEntities: [{ id: 'ent-tsmc', name: 'TSMC', type: 'Entity' }],
    secondaryEntities: [{ id: 'ent-apple', name: 'Apple', type: 'Entity' }, { id: 'ent-nvidia', name: 'Nvidia', type: 'Entity' }, { id: 'ent-applied-materials', name: 'Applied Materials', type: 'Entity' }],
    confidence: 'High',
    relatedEventIds: ['evt-4'],
    watchlistRelevance: 95,
    materialityScore: Math.floor(Math.random() * 40) + 60,
    impacts: [
      {
        target: 'Apple',
        entityType: 'Corporate - Client',
        type: 'Likely impact',
        explanation: 'Forces continued reliance on Taiwanese geographic concentration for M5 silicon generation.',
        confidence: 'High'
      },
      {
        target: 'Applied Materials',
        entityType: 'Corporate - Supplier',
        type: 'Direct impact',
        explanation: 'Pushes revenue recognition for $400M in lithography equipment orders into FY26.',
        confidence: 'High'
      },
      {
        target: 'US Domestic Semiconductor Strategy',
        entityType: 'Policy/Thematic',
        type: 'Thematic relevance',
        explanation: 'Highlights enduring structural friction in re-shoring complex logic manufacturing ecosystems.',
        confidence: 'Medium'
      }
    ],
    whyItMatters: 'The delay underscores the fragility of geographically shifting advanced manufacturing. It forces major fabless designers to adjust their node roadmaps and highlights that capital expenditure allocation alone cannot instantly overcome local labor and supply chain immaturity.',
    whatToWatchNext: [
      'Nvidia and Apple forward-guidance adjustments on next-gen silicon delivery timelines.',
      'Responses from the US Commerce Department regarding CHIPS Act disbursement milestones.',
      'Equipment order cancellations impacting ASML and Applied Materials over the next 2 quarters.'
    ]
  },
  {
    id: 'evt-2',
    title: 'EU Commission Ratifies 28% Retroactive Tariff on Chinese EV Supply Chain',
    summary: 'The European Commission formally adopts a stringent framework targeting Chinese-manufactured EVs, implementing retroactive variable tariffs up to 28%. Critically, the mandate explicitly targets downstream battery components and chassis subsidiaries.',
    category: 'Politics & Policy',
    eventType: 'Regulatory Action / Trade Friction',
    timestamp: subHours(now, 5),
    sourceStack: [
      { name: 'EU Official Journal (Directive 2024/EC)', url: '#' },
      { name: 'Customs Declaration Log Snippet', url: '#' }
    ],
    sourceTier: 'Tier 1',
    originLocation: { lat: 50.8503, lng: 4.3517, name: 'Brussels, Belgium' },
    impactLocations: [
      { lat: 22.5431, lng: 114.0579, name: 'Shenzhen, China' },
      { lat: 48.7758, lng: 9.1829, name: 'Stuttgart, Germany' }
    ],
    primaryEntities: [{ id: 'ent-european-commission', name: 'European Commission', type: 'Entity' }, { id: 'ent-byd', name: 'BYD', type: 'Entity' }, { id: 'ent-catl', name: 'CATL', type: 'Entity' }],
    secondaryEntities: [{ id: 'ent-mercedes-benz', name: 'Mercedes-Benz', type: 'Entity' }, { id: 'ent-volkswagen-group', name: 'Volkswagen Group', type: 'Entity' }],
    confidence: 'High',
    relatedEventIds: [],
    watchlistRelevance: 88,
    materialityScore: Math.floor(Math.random() * 40) + 60,
    impacts: [
      {
        target: 'BYD European Expansion',
        entityType: 'Corporate - Target',
        type: 'Direct impact',
        explanation: 'Instantly degrades margin on seaborne EU exports, forcing acceleration of structural localization (Hungary plant).',
        confidence: 'High'
      },
      {
        target: 'German Auto OEMs',
        entityType: 'Corporate - Collateral',
        type: 'Likely impact',
        explanation: 'High probability of targeted retaliatory action by Beijing against German ICE exports to Chinese markets.',
        confidence: 'Medium'
      }
    ],
    whyItMatters: 'Moves the regulatory perimeter beyond final vehicle assembly into the deep supply chain (cells and platforms). This forces a bifurcation where automakers must establish completely localized manufacturing islands to maintain global market access.',
    whatToWatchNext: [
      'Retaliatory tariffs from Beijing targeting European luxury auto exports.',
      'Acceleration of Chinese OEM direct investments in Eastern European manufacturing facilities (e.g., Hungary).',
      'Volkswagen and Mercedes-Benz earnings call commentary on revised domestic market share projections.'
    ]
  },
  {
    id: 'evt-3',
    title: 'Unexpected 25bps Rate Hike by Bank of Japan Initiates Unwind of Carry Trade',
    summary: 'The Bank of Japan abruptly increased its overnight uncollateralized call rate to 0.25% and announced an aggressive tapering of JGB purchases. The hawkish pivot shocked markets positioned for gradual normalization.',
    category: 'Macro & Markets',
    eventType: 'Central Bank Policy',
    timestamp: subHours(now, 12),
    sourceStack: [
      { name: 'Bank of Japan Node (Automated Translation)', url: '#' },
      { name: 'Bloomberg Terminal (FX Volatility Alert)', url: '#' }
    ],
    sourceTier: 'Tier 1',
    originLocation: { lat: 35.6828, lng: 139.759, name: 'Tokyo, Japan' },
    impactLocations: [
      { lat: 40.7128, lng: -74.0060, name: 'New York, NY, USA' },
      { lat: 39.9042, lng: 116.4074, name: 'Beijing, China' }
    ],
    primaryEntities: [{ id: 'ent-bank-of-japan', name: 'Bank of Japan', type: 'Entity' }, { id: 'ent-usd-jpy', name: 'USD/JPY', type: 'Entity' }],
    secondaryEntities: [{ id: 'ent-us-treasuries', name: 'US Treasuries', type: 'Entity' }, { id: 'ent-global-hedge-funds', name: 'Global Hedge Funds', type: 'Entity' }],
    confidence: 'High',
    relatedEventIds: [],
    watchlistRelevance: 98,
    materialityScore: Math.floor(Math.random() * 40) + 60,
    impacts: [
      {
        target: 'USD/JPY Cross',
        entityType: 'Market Instrument',
        type: 'Direct impact',
        explanation: 'Yen appreciates 3.2% within 4 hours. Forces margin calls on institutional short-Yen positions.',
        confidence: 'High'
      },
      {
        target: 'US Treasury Yields',
        entityType: 'Market Instrument',
        type: 'Likely impact',
        explanation: 'Repatriation of Japanese domestic capital puts upward pressure on the belly of the US Treasury curve.',
        confidence: 'Medium'
      },
      {
        target: 'Global Risk Assets',
        entityType: 'Macro Category',
        type: 'Thematic relevance',
        explanation: 'Removes the primary source of cheap liquidity that structurally funded leveraged equity positions for a decade.',
        confidence: 'Low'
      }
    ],
    whyItMatters: 'Japan was the last anchor of zero-interest-rate policy. A rapid, untelegraphed shift forces the violent liquidation of trillions of dollars in accumulated global carry trades, acting as a massive systemic liquidity drain.'
  },
  {
    id: 'evt-4',
    title: 'Ransomware Group Paralyzes Major Asian Logistics Hub Tracking Network',
    summary: 'A sophisticated cyber-intrusion attributed to state-backed actors has crippled the proprietary cargo-tracking API of a top-3 maritime freight forwarder in Singapore. Terminal operations are forced into manual reconciliation.',
    category: 'Technology & Infrastructure',
    eventType: 'Cyber Intrusion / Infrastructure Failure',
    timestamp: subDays(now, 1),
    sourceStack: [
      { name: 'AIS Signals // Network Anomaly Detection', url: '#' },
      { name: 'CISA Security Bulletin', url: '#' },
      { name: 'Lloyds Loading List', url: '#' }
    ],
    sourceTier: 'Tier 2',
    originLocation: { lat: 1.3521, lng: 103.8198, name: 'Singapore (Port Authority Focus)' },
    impactLocations: [
      { lat: 33.7490, lng: -84.3880, name: 'Atlanta, GA, USA' },
      { lat: 51.9490, lng: 4.1485, name: 'Rotterdam, Netherlands' }
    ],
    primaryEntities: [{ id: 'ent-psa-international', name: 'PSA International', type: 'Entity' }, { id: 'ent-logistics-infrastructure', name: 'Logistics Infrastructure', type: 'Entity' }],
    secondaryEntities: [{ id: 'ent-us-retail-importers', name: 'US Retail Importers', type: 'Entity' }, { id: 'ent-automotive-jit-supply-chains', name: 'Automotive JIT Supply Chains', type: 'Entity' }],
    confidence: 'Medium',
    relatedEventIds: [],
    watchlistRelevance: 77,
    materialityScore: Math.floor(Math.random() * 40) + 60,
    impacts: [
      {
        target: 'Asian/European Lane Capacity',
        entityType: 'Operations / Logistics',
        type: 'Direct impact',
        explanation: 'Vessels anchored off-port waiting for berth clearances. Ripple effect causes 3-day delays on intercontinental cargo routes.',
        confidence: 'High'
      },
      {
        target: 'US Seasonal Retail Inventory',
        entityType: 'Sector / Retail',
        type: 'Likely impact',
        explanation: 'Inventory velocity drops materially; downstream stock-outs possible for major US importers if not resolved in 96 hours.',
        confidence: 'Medium'
      }
    ],
    whyItMatters: 'Exposes single points of failure in digitized harbor orchestration. Modern supply chains run on "just-in-time" tolerances, meaning software downtime directly translates to hard physical capital bottlenecks.'
  },
  {
    id: 'evt-5',
    title: 'Elliot Management Submits Aggressive Breakup Proposal for Cloud Titan',
    summary: 'Activist hedge fund Elliot Management reveals a $4B stake in Salesforce, submitting an aggressive private letter demanding the spin-off of recent acquisitions (MuleSoft, Slack) to focus strictly on core CRM margins.',
    category: 'Corporate Actions',
    eventType: 'Activist Campaign',
    timestamp: addHours(subDays(now, 2), 4),
    sourceStack: [
      { name: 'SEC 13D Filing parsing', url: '#' },
      { name: 'Darkpool Flow Monitor', url: '#' }
    ],
    sourceTier: 'Tier 1',
    originLocation: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA, USA' },
    impactLocations: [
      { lat: 40.7128, lng: -74.0060, name: 'New York, NY, USA' }
    ],
    primaryEntities: [{ id: 'ent-salesforce', name: 'Salesforce', type: 'Entity' }, { id: 'ent-elliot-management', name: 'Elliot Management', type: 'Entity' }],
    secondaryEntities: [{ id: 'ent-enterprise-software-sector', name: 'Enterprise Software Sector', type: 'Entity' }],
    confidence: 'High',
    relatedEventIds: [],
    watchlistRelevance: 82,
    materialityScore: Math.floor(Math.random() * 40) + 60,
    impacts: [
      {
        target: 'CRM Equity Value',
        entityType: 'Corporate Equity',
        type: 'Direct impact',
        explanation: 'Shares jump 7% pre-market as investors anticipate margin expansion protocols.',
        confidence: 'High'
      },
      {
        target: 'SaaS M&A Landscape',
        entityType: 'Market Theme',
        type: 'Thematic relevance',
        explanation: 'Signals the definitive end of the "growth-at-all-costs" software era. Activist pressure deters future mega-cap tech acquisitions.',
        confidence: 'Medium'
      }
    ],
    whyItMatters: 'This represents a structural shift in how hyperscale tech companies are valued. The focus has violently shifted from total addressable market (TAM) landgrabs to rigorous capital allocation and free cash flow generation.'
  },
  {
    id: 'evt-6',
    title: 'India Imposes Immediate Export Ban on 15 Active Pharmaceutical Ingredients (APIs)',
    summary: 'India’s Directorate General of Foreign Trade passes an emergency measure banning the export of 15 critical APIs, pointing to domestic shortage risks. The list includes base inputs for paracetamol, generic broad-spectrum antibiotics, and vital blood pressure medications.',
    category: 'Trade & Supply Chain',
    eventType: 'Export Constraint / Protectionism',
    timestamp: subHours(now, 18),
    sourceStack: [
      { name: 'Ministry of Commerce and Industry (India)', url: '#' },
      { name: 'STAT News', url: '#' }
    ],
    sourceTier: 'Tier 1',
    originLocation: { lat: 28.6139, lng: 77.2090, name: 'New Delhi, India' },
    impactLocations: [
      { lat: 47.3769, lng: 8.5417, name: 'Zurich, Switzerland' },
      { lat: 38.9072, lng: -77.0369, name: 'Washington D.C., USA' }
    ],
    primaryEntities: [{ id: 'ent-indian-ministry-of-commerce', name: 'Indian Ministry of Commerce', type: 'Entity' }, { id: 'ent-global-generic-pharma', name: 'Global Generic Pharma', type: 'Entity' }],
    secondaryEntities: [{ id: 'ent-novartis', name: 'Novartis', type: 'Entity' }, { id: 'ent-teva-pharmaceuticals', name: 'Teva Pharmaceuticals', type: 'Entity' }, { id: 'ent-us-fda', name: 'US FDA', type: 'Entity' }],
    confidence: 'High',
    relatedEventIds: [],
    watchlistRelevance: 91,
    materialityScore: Math.floor(Math.random() * 40) + 60,
    impacts: [
      {
        target: 'Generic Drug Manufacturers (EU/US)',
        entityType: 'Corporate Layer',
        type: 'Direct impact',
        explanation: 'Cost of goods sold (COGS) will spike immediately as producers are forced to source constrained alternative APIs from domestic or European pipelines.',
        confidence: 'High'
      },
      {
        target: 'US Hospital Procurement Networks',
        entityType: 'Healthcare Infrastructure',
        type: 'Likely impact',
        explanation: 'Potential rolling shortages of basic surgical antibiotics within 6-8 weeks as current buffer stockpiles deplete.',
        confidence: 'High'
      }
    ],
    whyItMatters: 'Pharmaceutical supply chains are dangerously fragmented. India manufactures roughly 20% of global generic drugs but relies on China for up to 70% of its raw materials. This action exposes the severe vulnerability of Western healthcare systems to Asian geopolitical and domestic policy mandates.'
  },
  {
    id: 'evt-7',
    title: 'OPEC+ Unscheduled Virtual Summit Hints at Accelerated Production Cuts',
    summary: 'A leaked diplomatic cable indicates Saudi Arabia and Russia have requested an emergency OPEC+ technical committee meeting prior to the scheduled monthly summit, citing "destabilizing macro-economic anomalies".',
    category: 'Macro & Markets',
    eventType: 'Commodity Supply Disruption',
    timestamp: subHours(now, 2),
    sourceStack: [
      { name: 'Energy Intelligence Network', url: '#' }
    ],
    sourceTier: 'Tier 2',
    originLocation: { lat: 24.7136, lng: 46.6753, name: 'Riyadh, Saudi Arabia' },
    impactLocations: [
      { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
      { lat: 29.7604, lng: -95.3698, name: 'Houston, TX, USA' }
    ],
    primaryEntities: [{ id: 'ent-opec-plus', name: 'OPEC+', type: 'Entity' }, { id: 'ent-saudi-aramco', name: 'Saudi Aramco', type: 'Entity' }],
    secondaryEntities: [{ id: 'ent-brent-crude', name: 'Brent Crude', type: 'Entity' }],
    confidence: 'Medium',
    relatedEventIds: [],
    watchlistRelevance: 85,
    materialityScore: Math.floor(Math.random() * 40) + 60,
    impacts: [
      {
        target: 'Global Crude Benchmarks',
        entityType: 'Commodities',
        type: 'Direct impact',
        explanation: 'Brent spikes 2.1% on rumor anticipation, pricing in a 500k bpd preemptive trim.',
        confidence: 'High'
      },
      {
        target: 'Emerging Market Forex',
        entityType: 'Currencies',
        type: 'Likely impact',
        explanation: 'Energy-importing EM currencies (INR, THB) face immediate downside pressure against USD.',
        confidence: 'Medium'
      }
    ],
    whyItMatters: 'OPEC+ is signaling zero tolerance for Brent dipping below fiscal breakeven points. The urgency of this unscheduled call suggests internal cartel data sees severe demand degradation in major Asian import markets.'
  },
  {
    id: 'evt-8',
    title: 'Anomalous Military Buildup Spotted via SAR Satellite Near Latin American Border Dispute',
    summary: 'Commercial Synthetic Aperture Radar (SAR) imagery reveals a sudden deployment of armored divisions and forward-operating logistics hubs 15 miles from the disputed Essequibo border region.',
    category: 'Politics & Policy',
    eventType: 'Geopolitical Escalation',
    timestamp: subHours(now, 24),
    sourceStack: [
      { name: 'Private SAR Provider Analysis', url: '#' }
    ],
    sourceTier: 'Tier 2',
    originLocation: { lat: 6.8045, lng: -58.1553, name: 'Georgetown, Guyana' },
    impactLocations: [
      { lat: 10.4806, lng: -66.9036, name: 'Caracas, Venezuela' }
    ],
    primaryEntities: [{ id: 'ent-guyana-govt', name: 'Guyana Government', type: 'Entity' }, { id: 'ent-venezuela-military', name: 'Venezuela Armed Forces', type: 'Entity' }],
    secondaryEntities: [{ id: 'ent-exxonmobil', name: 'ExxonMobil', type: 'Entity' }],
    confidence: 'Medium',
    relatedEventIds: [],
    watchlistRelevance: 72,
    materialityScore: Math.floor(Math.random() * 40) + 60,
    impacts: [
      {
        target: 'Offshore Drilling Operations',
        entityType: 'Corporate Assets',
        type: 'Direct impact',
        explanation: 'Triggers security clause activating immediate evacuation protocols for non-essential offshore drilling personnel in the Stabroek block.',
        confidence: 'Medium'
      },
      {
        target: 'Regional Risk Premium',
        entityType: 'Sovereign Debt',
        type: 'Thematic relevance',
        explanation: 'Spikes yields on local sovereign bonds over fears of kinetic inter-state friction.',
        confidence: 'Medium'
      }
    ],
    whyItMatters: 'While kinetic conflict remains low probability, the positioning forces international oil majors operating in the contested maritime zone to price in a massive, sustained geopolitical risk premium, stalling final investment decisions on future extraction phases.'
  }
];

// Mock Watchlist Data
export const WATCHLIST = [
  'Taiwan Semiconductor (TSMC)',
  'Semiconductor Capital Equipment',
  'Macro Rates & Central Banks',
  'Yen (Currency Dynamics)',
  'Global Logistics & Freight'
];
