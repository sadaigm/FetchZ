import type { Collection, WebRsRequest, CollectionFolder } from '../../../types/request.types';
import { STORE_NAMES } from '../types';
import { getDB } from '../index';

const mapToCollectionType = (rawCollection: any): Collection => {
  return {
    id: rawCollection.id,
    name: rawCollection.name,
    requests: rawCollection.requests || [],
    folders: rawCollection.folders || []
  };
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const addCollection = async (nameOrCollection: string | Collection): Promise<IDBValidKey> => {
  const db = await getDB();
  
  if (typeof nameOrCollection === 'string') {
    // Just add a collection with name
    const id = await db.add(STORE_NAMES.COLLECTIONS, { name: nameOrCollection });
    return id;
  } else {
    // Add a full collection with all its requests
    const id = await db.add(STORE_NAMES.COLLECTIONS, nameOrCollection);
    return id;
  }
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

// Folder operations
export const addFolderToCollection = async (
  collectionId: string,
  folderName: string
): Promise<string> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection) {
    const newFolder: CollectionFolder = {
      id: generateId(),
      name: folderName,
      requests: []
    };
    
    if (!collection.folders) {
      collection.folders = [];
    }
    
    collection.folders.push(newFolder);
    await db.put(STORE_NAMES.COLLECTIONS, collection);
    return newFolder.id;
  } else {
    throw new Error('Collection not found');
  }
};

export const deleteFolderFromCollection = async (
  collectionId: string,
  folderId: string
): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection && collection.folders) {
    collection.folders = collection.folders.filter((folder: CollectionFolder) => folder.id !== folderId);
    await db.put(STORE_NAMES.COLLECTIONS, collection);
  } else {
    throw new Error('Collection or folder not found');
  }
};

export const renameFolderInCollection = async (
  collectionId: string,
  folderId: string,
  newName: string
): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection && collection.folders) {
    const folder = collection.folders.find((f: CollectionFolder) => f.id === folderId);
    if (folder) {
      folder.name = newName;
      await db.put(STORE_NAMES.COLLECTIONS, collection);
    } else {
      throw new Error('Folder not found');
    }
  } else {
    throw new Error('Collection or folder not found');
  }
};

export const addRequestToFolder = async (
  collectionId: string,
  folderId: string,
  request: WebRsRequest
): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection && collection.folders) {
    const folder = collection.folders.find((f: CollectionFolder) => f.id === folderId);
    if (folder) {
      folder.requests.push(request);
      await db.put(STORE_NAMES.COLLECTIONS, collection);
    } else {
      throw new Error('Folder not found');
    }
  } else {
    throw new Error('Collection not found');
  }
};

export const removeRequestFromFolder = async (
  collectionId: string,
  folderId: string,
  requestId: string
): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection && collection.folders) {
    const folder = collection.folders.find((f: CollectionFolder) => f.id === folderId);
    if (folder) {
      folder.requests = folder.requests.filter((req: WebRsRequest) => req.id !== requestId);
      await db.put(STORE_NAMES.COLLECTIONS, collection);
    } else {
      throw new Error('Folder not found');
    }
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

export const findRequestInCollection = async (
  collectionId: string,
  requestId: string
): Promise<WebRsRequest | null> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection) {
    return collection.requests.find((req: WebRsRequest) => req.id === requestId) || null;
  }
  return null;
};

export const updateRequestInCollection = async (
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

export const findAndUpdateFolderRequest = async (collectionId: string,
  folderId: string,
  request: WebRsRequest)  => {
   const db = await getDB();
  const collection: Collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection && collection.folders) {
    // find folder
    const found = findAndUpdateFolder(collection.folders, folderId, request);
    if (!found) {
      throw new Error('Folder not found');
    }
    await db.put(STORE_NAMES.COLLECTIONS, collection);
  } else {
    throw new Error('Collection not found');
  }
}

const findAndUpdateFolder = (
  parentFolders: CollectionFolder[],
  folderId: string,
  request: WebRsRequest
): boolean => {
  if (parentFolders && parentFolders.length > 0) {
    const foundFolder = parentFolders.find((f: CollectionFolder) => f.id === folderId);
    if (foundFolder) {
      const foundRequestIndex = foundFolder.requests.findIndex(r => r.id === request.id);
      // If request exists, replace it, otherwise add it to the folder
      if (foundRequestIndex > -1) {
        foundFolder.requests[foundRequestIndex] = request;
      } else {
        foundFolder.requests.push(request);
      }
      return true; // Found and updated
    }
    
    // Recursively search in nested folders
    for (const folder of parentFolders) {
      if (folder.folders && folder.folders.length > 0) {
        const found = findAndUpdateFolder(folder.folders, folderId, request);
        if (found) return true;
      }
    }
  }
  return false; // Not found
}