import { openDB, type IDBPDatabase } from 'idb';
import type { Collection, WebRsRequest } from '../types/request.types';

const mapToCollectionType = (rawCollection: any): Collection => {
  return {
    id: rawCollection.id,
    name: rawCollection.name,
    requests: rawCollection.requests || [],
  };
};

const DB_NAME = 'WebRS';
const DB_VERSION = 2; // Updated to match the current database version
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

export const renameCollection = async (id: string, newName: string): Promise<void> => {
  const db = await initDB();
  const collection = await db.get(STORE_NAME, id);
  if (collection) {
    collection.name = newName;
    await db.put(STORE_NAME, collection);
  } else {
    throw new Error('Collection not found');
  }
};

export const deleteCollection = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

export const getCollections = async (): Promise<Collection[]> => {
  const db = await initDB();
  const rawCollections = await db.getAll(STORE_NAME);
  return rawCollections.map(mapToCollectionType);
};

export const addRequestToCollection = async (collectionId: string, request: WebRsRequest): Promise<void> => {
  const db = await initDB();
  const collection = await db.get(STORE_NAME, collectionId);
  if (collection) {
    collection.requests = [...(collection.requests || []), request];
    await db.put(STORE_NAME, collection);
  } else {
    throw new Error('Collection not found');
  }
};

export const modifyRequestInCollection = async (
  collectionId: string,
  requestId: string,
  updatedRequest: WebRsRequest
): Promise<void> => {
  const db = await initDB();
  const collection = await db.get(STORE_NAME, collectionId);
  if (collection) {
    collection.requests = collection.requests.map((req: WebRsRequest) =>
      req.id === requestId ? updatedRequest : req
    );
    await db.put(STORE_NAME, collection);
  } else {
    throw new Error('Collection not found');
  }
};

export const removeRequestFromCollection = async (
  collectionId: string,
  requestId: string
): Promise<void> => {
  const db = await initDB();
  const collection = await db.get(STORE_NAME, collectionId);
  if (collection) {
    collection.requests = collection.requests.filter((req: WebRsRequest) => req.id !== requestId);
    await db.put(STORE_NAME, collection);
  } else {
    throw new Error('Collection not found');
  }
};
