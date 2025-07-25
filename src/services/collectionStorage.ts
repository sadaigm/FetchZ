import { openDB, type IDBPDatabase } from 'idb';

interface Collection {
  id: number;
  name: string;
}

const DB_NAME = 'WebRS';
const DB_VERSION = 1;
const STORE_NAME = 'collections';

let dbPromise: Promise<IDBPDatabase>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
};

export const addCollection = async (name: string): Promise<IDBValidKey> => {
  const db = await initDB();
  const id = await db.add(STORE_NAME, { name });
  return id;
};

export const renameCollection = async (id: number, newName: string): Promise<void> => {
  const db = await initDB();
  const collection = await db.get(STORE_NAME, id);
  if (collection) {
    collection.name = newName;
    await db.put(STORE_NAME, collection);
  } else {
    throw new Error('Collection not found');
  }
};

export const deleteCollection = async (id: number): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

export const getCollections = async (): Promise<Collection[]> => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};
