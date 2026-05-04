import { LatLngTuple } from 'leaflet';

export type LayerType = 'shipping' | 'energy' | 'kinetic' | 'chokepoints';

export interface MacroOverlay {
  id: LayerType;
  label: string;
  color: string;
  paths?: { id: string; name: string; positions: LatLngTuple[] }[];
  points?: { id: string; name: string; center: LatLngTuple; radius: number }[];
  areas?: { id: string; name: string; center: LatLngTuple; radius: number }[];
}

export const MACRO_LAYERS: MacroOverlay[] = [
  {
    id: 'shipping',
    label: 'Shipping Lanes',
    color: '#0284c7', // light blue
    paths: [
      {
        id: 'asia-eu',
        name: 'Asia-EU Maritime Route',
        positions: [
          [31.23, 121.47], // Shanghai
          [22.3, 114.1], // HK
          [1.29, 103.85], // Singapore
          [5.89, 80.58], // Sri Lanka south
          [12.59, 43.34], // Bab-el-Mandeb
          [27.91, 34.33], // Red Sea
          [31.2, 32.3], // Suez
          [35.9, 14.3], // Malta
          [36.1, -5.3], // Gibraltar
          [51.9, 4.1] // Rotterdam
        ]
      },
      {
        id: 'asia-us-west',
        name: 'Transpacific Route',
        positions: [
          [31.23, 121.47], // Shanghai
          [35.0, 140.0], // Japan south
          [48.0, 170.0], // Pacific North
          [45.0, -130.0], // NE Pacific
          [33.7, -118.2] // Long Beach
        ]
      },
      {
         id: 'us-eu',
         name: 'Transatlantic Route',
         positions: [
            [40.7, -74.0], // NY
            [45.0, -40.0], // Mid Atlantic
            [49.5, -5.0], // English Channel
            [51.9, 4.1] // Rotterdam
         ]
      },
      {
         id: 'good-hope',
         name: 'Cape of Good Hope Route',
         positions: [
            [1.29, 103.85], // Singapore
            [-20.0, 60.0], // Indian Ocean
            [-35.0, 20.0], // South Africa
            [-10.0, -10.0], // South Atlantic
            [36.1, -5.3], // Gibraltar
            [51.9, 4.1] // Rotterdam
         ]
      }
    ]
  },
  {
    id: 'energy',
    label: 'Energy Corridors',
    color: '#d97706', // amber
    paths: [
      {
        id: 'druzhba',
        name: 'Druzhba Pipeline System',
        positions: [
          [53.2, 50.1], // Samara
          [52.0, 23.0], // Belarus
          [51.0, 15.0], // Poland/Germany border
          [51.3, 12.3] // Leuna
        ]
      },
      {
         id: 'hormuz-route',
         name: 'Hormuz Maritime Corridor',
         positions: [
            [26.5, 50.0], // Saudi East Coast
            [26.5, 56.2], // Strait of Hormuz
            [23.0, 59.0], // Gulf of Oman
            [15.0, 65.0] // Arabian Sea
         ]
      },
      {
         id: 'nord-stream-offline',
         name: 'Baltic Sea Corridors',
         positions: [
            [60.5, 28.0], // Vyborg
            [55.0, 15.0], // Baltic Sea
            [54.1, 13.6] // Greifswald
         ]
      }
    ]
  },
  {
    id: 'kinetic',
    label: 'Kinetic Conflict Zones',
    color: '#e11d48', // rose
    areas: [
      {
        id: 'ukraine',
        name: 'Eastern Europe Conflict Zone',
        center: [48.3794, 34.1656],
        radius: 350000 // meters
      },
      {
        id: 'levant',
        name: 'Levant Conflict Zone',
        center: [32.5, 35.0],
        radius: 120000
      },
      {
        id: 'red-sea',
        name: 'Red Sea Operational Area',
        center: [16.0, 41.0],
        radius: 200000
      },
      {
        id: 'sahel',
        name: 'Sahel Instability Belt',
        center: [15.0, 0.0],
        radius: 400000
      }
    ]
  },
  {
    id: 'chokepoints',
    label: 'Supply Chain Chokepoints',
    color: '#8b5cf6', // violet
    points: [
      { id: 'suez', name: 'Suez Canal', center: [30.5852, 32.2654], radius: 8 },
      { id: 'panama', name: 'Panama Canal', center: [9.1438, -79.7304], radius: 8 },
      { id: 'malacca', name: 'Strait of Malacca', center: [2.8, 101.3], radius: 8 },
      { id: 'hormuz', name: 'Strait of Hormuz', center: [26.5667, 56.2500], radius: 8 },
      { id: 'bab-el-mandeb', name: 'Bab-el-Mandeb', center: [12.5833, 43.3333], radius: 8 },
      { id: 'taiwan-strait', name: 'Taiwan Strait', center: [24.8, 119.8], radius: 8 },
      { id: 'bosphorus', name: 'Bosphorus Strait', center: [41.0, 29.0], radius: 8 }
    ]
  }
];
