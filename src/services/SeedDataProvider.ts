import { MOCK_EVENTS } from '../data/mockData';
import { SignalEvent } from '../types';

export class SeedDataProvider {
  getSeedEvents(): SignalEvent[] {
    return MOCK_EVENTS;
  }
}

export const seedDataProvider = new SeedDataProvider();
