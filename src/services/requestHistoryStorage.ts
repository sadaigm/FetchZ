import { openDB, type IDBPDatabase } from 'idb';
import type { RequestHistory } from '../types/request.types';

const DB_NAME = 'WebRS';
const DB_VERSION = 2;
const STORE_NAME = 'requestHistory';

let dbPromise: Promise<IDBPDatabase>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const addRequestHistory = async (history: RequestHistory): Promise<void> => {
  const db = await initDB();
  await db.add(STORE_NAME, history);
};

export const removeRequestHistory = async (historyId: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, historyId);
};

export const getAllRequestHistory = async (): Promise<RequestHistory[]> => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const getRequestHistoryById = async (historyId: string): Promise<RequestHistory | undefined> => {
  const db = await initDB();
  return await db.get(STORE_NAME, historyId);
};
