import type { Collection, RequestHistory, WebRsRequest } from '../../types/request.types';

// Re-export types from the main types file for convenience
export type { Collection, RequestHistory, WebRsRequest };

// Database-specific types
export interface DatabaseSchema {
  collections: Collection;
  requestHistory: RequestHistory;
}

// Store names
export const STORE_NAMES = {
  COLLECTIONS: 'collections',
  REQUEST_HISTORY: 'requestHistory',
} as const;

// Database configuration
export const DB_CONFIG = {
  NAME: 'WebRS',
  VERSION: Date.now(), // Use current timestamp to ensure it's always greater than existing version
} as const;