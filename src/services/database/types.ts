import type { Collection, RequestHistory, WebRsRequest } from '../../types/request.types';
import type { Environment } from '../../types/environment.types';

// Re-export types from the main types file for convenience
export type { Collection, RequestHistory, WebRsRequest };
export type { Environment };

// Configuration type
export interface Configuration {
  id: string;
  activeEnvironmentId?: string;
}

// Database-specific types
export interface DatabaseSchema {
  collections: Collection;
  requestHistory: RequestHistory;
  environments: Environment;
  configuration: Configuration;
}

// Store names
export const STORE_NAMES = {
  COLLECTIONS: 'collections',
  REQUEST_HISTORY: 'requestHistory',
  ENVIRONMENTS: 'environments',
  CONFIGURATION: 'configuration',
} as const;

// Database configuration
export const DB_CONFIG = {
  NAME: 'WebRS',
  VERSION: Date.now(), // Use current timestamp to ensure it's always greater than existing version
} as const;