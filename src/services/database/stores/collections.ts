import type { Collection, WebRsRequest } from '../../../types/request.types';
import { STORE_NAMES } from '../types';
import { getDB } from '../index';

const mapToCollectionType = (rawCollection: any): Collection => {
  return {
    id: rawCollection.id,
    name: rawCollection.name,
    requests: rawCollection.requests || [],
  };
};

export const addCollection = async (name: string): Promise<IDBValidKey> => {
  const db = await getDB();
  const id = await db.add(STORE_NAMES.COLLECTIONS, { name });
  return id;
};

export const renameCollection = async (id: string, newName: string): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, id);
  if (collection) {
    collection.name = newName;
    await db.put(STORE_NAMES.COLLECTIONS, collection);
  } else {
    throw new Error('Collection not found');
  }
};

export const deleteCollection = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete(STORE_NAMES.COLLECTIONS, id);
};

export const getCollections = async (): Promise<Collection[]> => {
  const db = await getDB();
  const rawCollections = await db.getAll(STORE_NAMES.COLLECTIONS);
  return rawCollections.map(mapToCollectionType);
};

export const addRequestToCollection = async (collectionId: string, request: WebRsRequest): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection) {
    collection.requests = [...(collection.requests || []), request];
    await db.put(STORE_NAMES.COLLECTIONS, collection);
  } else {
    throw new Error('Collection not found');
  }
};

export const modifyRequestInCollection = async (
  collectionId: string,
  requestId: string,
  updatedRequest: WebRsRequest
): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection) {
    collection.requests = collection.requests.map((req: WebRsRequest) =>
      req.id === requestId ? updatedRequest : req
    );
    await db.put(STORE_NAMES.COLLECTIONS, collection);
  } else {
    throw new Error('Collection not found');
  }
};

export const removeRequestFromCollection = async (
  collectionId: string,
  requestId: string
): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection) {
    collection.requests = collection.requests.filter((req: WebRsRequest) => req.id !== requestId);
    await db.put(STORE_NAMES.COLLECTIONS, collection);
  } else {
    throw new Error('Collection not found');
  }
};