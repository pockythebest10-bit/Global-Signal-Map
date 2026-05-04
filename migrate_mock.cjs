const fs = require('fs');

let content = fs.readFileSync('src/data/mockData.ts', 'utf-8');

// Replace the type definitions at the top with imports
content = content.replace(
  /^export type EventCategory[\s\S]*?export interface SignalEvent \{[\s\S]*?\}\n/m,
  `import {
  SignalEvent,
  EventCategory,
  SourceTier,
  ConfidenceLevel,
  ImpactType,
  Location,
  EventImpact
} from '../types';\n`
);

// We also need to add materialityScore: 85 (or something) to each event
// Change 'time' to 'timestamp'
content = content.replace(/time: /g, 'timestamp: ');

// Change 'sources' to 'sourceStack'
content = content.replace(/sources: /g, 'sourceStack: ');

// Change 'reason' to 'explanation'
content = content.replace(/reason: /g, 'explanation: ');

// Change 'primaryEntities: ['Apple', 'Nvidia']' to `primaryEntities: [{ id: 'ent-apple', name: 'Apple', type: 'Company' }, ...]`
// For simplicity we can regex replace the string arrays
content = content.replace(/primaryEntities: \[([^\]]+)\]/g, (match, inner) => {
  if (inner.trim() === '') return match;
  const names = inner.split(',').map(s => s.trim().replace(/^'|'$/g, ''));
  const objs = names.map(n => `{ id: 'ent-${n.toLowerCase().replace(/[^a-z0-9]/g, '-')}', name: '${n}', type: 'Entity' }`);
  return `primaryEntities: [${objs.join(', ')}]`;
});

content = content.replace(/secondaryEntities: \[([^\]]+)\]/g, (match, inner) => {
  if (inner.trim() === '') return match;
  const names = inner.split(',').map(s => s.trim().replace(/^'|'$/g, ''));
  const objs = names.map(n => `{ id: 'ent-${n.toLowerCase().replace(/[^a-z0-9]/g, '-')}', name: '${n}', type: 'Entity' }`);
  return `secondaryEntities: [${objs.join(', ')}]`;
});

content = content.replace(/watchlistRelevance: (\d+),/g, 'watchlistRelevance: $1,\n    materialityScore: Math.floor(Math.random() * 40) + 60,');

fs.writeFileSync('src/data/mockData.ts', content, 'utf-8');
console.log("Migration script complete");
