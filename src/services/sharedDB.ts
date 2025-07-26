import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'WebRS';
const DB_VERSION = 2; // Incremented version to ensure all stores are created

export const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('collections', { keyPath: 'id', autoIncrement: true });
      }
      if (oldVersion < 2) {
        db.createObjectStore('requestHistory', { keyPath: 'id' });
      }
    },
  });
};