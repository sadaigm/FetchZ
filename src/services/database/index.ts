import { openDB, type IDBPDatabase } from 'idb';
import { DB_CONFIG } from './types';
import { upgradeHandler } from './schema';

// Re-export all store operations for convenience
export * from './stores';

// Singleton instance for the database
let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Initializes the database with a singleton pattern
 * @returns Promise<IDBPDatabase> The database instance
 */
export const initDB = (): Promise<IDBPDatabase> => {
  // Return existing promise if already initialized
  if (dbPromise) {
    return dbPromise;
  }

  // Create new database connection
  dbPromise = openDB(DB_CONFIG.NAME, DB_CONFIG.VERSION, {
    upgrade: upgradeHandler,
  });

  return dbPromise;
};

/**
 * Gets the database instance, initializing it if necessary
 * @returns Promise<IDBPDatabase> The database instance
 */
export const getDB = (): Promise<IDBPDatabase> => {
  return initDB();
};

/**
 * Closes the database connection and resets the singleton
 * Useful for testing or when reinitializing the database is needed
 */
export const closeDB = async (): Promise<void> => {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
};

/**
 * Resets the database by deleting it and reinitializing
 * WARNING: This will delete all data!
 * @returns Promise<IDBPDatabase> The new database instance
 */
export const resetDB = async (): Promise<IDBPDatabase> => {
  // Close existing connection
  await closeDB();
  
  // Delete the database
  await indexedDB.deleteDatabase(DB_CONFIG.NAME);
  
  // Reinitialize
  return initDB();
};