import { SignalEvent } from '../types';
import { seedDataProvider } from './SeedDataProvider';

export class EventRepository {
  async getAllEvents(): Promise<SignalEvent[]> {
    return seedDataProvider.getSeedEvents();
  }

  async getEventById(id: string): Promise<SignalEvent | undefined> {
    const events = seedDataProvider.getSeedEvents();
    return events.find(e => e.id === id);
  }
}

export const eventRepository = new EventRepository();
