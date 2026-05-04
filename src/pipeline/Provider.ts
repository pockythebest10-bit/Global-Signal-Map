import { RawSourceItem } from './models';

export interface SourceProvider {
  id: string;
  name: string;
  type: RawSourceItem['sourceType'];
  
  /**
   * Initializes the provider (e.g. auth, handshakes)
   */
  initialize(): Promise<void>;

  /**
   * Fetches the latest items from the source
   */
  fetchLatest(): Promise<RawSourceItem[]>;
}
