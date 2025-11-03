import type { IDBPDatabase } from 'idb';
import { DB_CONFIG, STORE_NAMES } from './types';

/**
 * Creates and initializes the database schema
 * @param db The database instance
 * @param oldVersion The previous version number (for upgrades)
 */
export const createSchema = (db: IDBPDatabase, oldVersion: number): void => {
  // For new installations (no existing database)
  if (oldVersion === 0) {
    // Create collections store
    db.createObjectStore(STORE_NAMES.COLLECTIONS, {
      keyPath: 'id',
      autoIncrement: true
    });
    
    // Create requestHistory store
    db.createObjectStore(STORE_NAMES.REQUEST_HISTORY, {
      keyPath: 'id'
    });
    
    // Create environments store
    db.createObjectStore(STORE_NAMES.ENVIRONMENTS, {
      keyPath: 'id'
    });
    
    // Create configuration store
    db.createObjectStore(STORE_NAMES.CONFIGURATION, {
      keyPath: 'id'
    });
  }
  
  // For database upgrades, add environments store if it doesn't exist
  if (oldVersion > 0 && !db.objectStoreNames.contains(STORE_NAMES.ENVIRONMENTS)) {
    db.createObjectStore(STORE_NAMES.ENVIRONMENTS, {
      keyPath: 'id'
    });
  }
  
  // For database upgrades, add configuration store if it doesn't exist
  if (oldVersion > 0 && !db.objectStoreNames.contains(STORE_NAMES.CONFIGURATION)) {
    db.createObjectStore(STORE_NAMES.CONFIGURATION, {
      keyPath: 'id'
    });
  }
  
  // For existing databases, both stores should already exist
  // No migration needed since we're just consolidating the initialization code
};

/**
 * Database upgrade handler
 * @param db The database instance
 * @param oldVersion The previous version number
 */
export const upgradeHandler = (db: IDBPDatabase, oldVersion: number): void => {
  console.log(`Upgrading database from version ${oldVersion} to version ${DB_CONFIG.VERSION}`);
  createSchema(db, oldVersion);
};