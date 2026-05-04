export function stringJaccardIndex(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;
  
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  
  return intersection / (setA.size + setB.size - intersection);
}

export function arrayOverlapRatio(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;

  const setA = new Set(a.map(x => x.toLowerCase()));
  const setB = new Set(b.map(x => x.toLowerCase()));
  
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  // Use the smaller set to ensure that subset inclusion scores high
  const minSize = Math.min(setA.size, setB.size);
  return intersection / minSize;
}

export function timeProximityHours(a: Date, b: Date): number {
  const diffMs = Math.abs(a.getTime() - b.getTime());
  return diffMs / (1000 * 60 * 60);
}
