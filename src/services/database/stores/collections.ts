import type { Collection, WebRsRequest, CollectionFolder, SavedResponse } from '../../../types/request.types';
import { STORE_NAMES } from '../types';
import { getDB } from '../index';

const mapToCollectionType = (rawCollection: any): Collection => {
  // Ensure all requests have the savedResponses field
  const ensureSavedResponses = (requests: any[]): WebRsRequest[] => {
    return (requests || []).map((req: any) => ({
      ...req,
      savedResponses: req.savedResponses || []
    }));
  };

  // Process folders recursively
  const processFolders = (folders: any[]): CollectionFolder[] => {
    return (folders || []).map((folder: any) => ({
      ...folder,
      requests: ensureSavedResponses(folder.requests),
      folders: folder.folders ? processFolders(folder.folders) : undefined
    }));
  };

  return {
    id: rawCollection.id,
    name: rawCollection.name,
    requests: ensureSavedResponses(rawCollection.requests),
    folders: processFolders(rawCollection.folders)
  };
};

export const generateId = (): string => {
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

export const saveResponseToRequest = async (
  collectionId: string,
  requestId: string,
  responseName: string,
  responseContent: string
): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection) {
    // Check if request is in the main collection
    const requestIndex = collection.requests.findIndex((req: WebRsRequest) => req.id === requestId);
    if (requestIndex !== -1) {
      const request = collection.requests[requestIndex];
      const newSavedResponse = {
        id: generateId(),
        name: responseName,
        content: responseContent,
        timestamp: new Date().toISOString()
      };
      
      if (!request.savedResponses) {
        request.savedResponses = [];
      }
      request.savedResponses.push(newSavedResponse);
      
      await db.put(STORE_NAMES.COLLECTIONS, collection);
      return;
    }
    
    // If not in main collection, check in folders
    if (collection.folders) {
      const found = saveResponseToFolder(collection.folders, requestId, responseName, responseContent);
      if (found) {
        await db.put(STORE_NAMES.COLLECTIONS, collection);
        return;
      }
    }
    
    throw new Error('Request not found in collection or folders');
  } else {
    throw new Error('Collection not found');
  }
};

const saveResponseToFolder = (
  folders: CollectionFolder[],
  requestId: string,
  responseName: string,
  responseContent: string
): boolean => {
  for (const folder of folders) {
    const requestIndex = folder.requests.findIndex((req: WebRsRequest) => req.id === requestId);
    if (requestIndex !== -1) {
      const request = folder.requests[requestIndex];
      const newSavedResponse = {
        id: generateId(),
        name: responseName,
        content: responseContent,
        timestamp: new Date().toISOString()
      };
      
      if (!request.savedResponses) {
        request.savedResponses = [];
      }
      request.savedResponses.push(newSavedResponse);
      return true;
    }
    
    // Recursively search in nested folders
    if (folder.folders && folder.folders.length > 0) {
      const found = saveResponseToFolder(folder.folders, requestId, responseName, responseContent);
      if (found) return true;
    }
  }
  return false;
};

export const deleteSavedResponse = async (
  collectionId: string,
  requestId: string,
  responseId: string
): Promise<void> => {
  const db = await getDB();
  const collection = await db.get(STORE_NAMES.COLLECTIONS, collectionId);
  if (collection) {
    // Check if request is in the main collection
    const requestIndex = collection.requests.findIndex((req: WebRsRequest) => req.id === requestId);
    if (requestIndex !== -1) {
      const request = collection.requests[requestIndex];
      if (request.savedResponses) {
        request.savedResponses = request.savedResponses.filter(
          (response: SavedResponse) => response.id !== responseId
        );
      }
      
      await db.put(STORE_NAMES.COLLECTIONS, collection);
      return;
    }
    
    // If not in main collection, check in folders
    if (collection.folders) {
      const found = deleteSavedResponseFromFolder(collection.folders, requestId, responseId);
      if (found) {
        await db.put(STORE_NAMES.COLLECTIONS, collection);
        return;
      }
    }
    
    throw new Error('Request not found in collection or folders');
  } else {
    throw new Error('Collection not found');
  }
};

const deleteSavedResponseFromFolder = (
  folders: CollectionFolder[],
  requestId: string,
  responseId: string
): boolean => {
  for (const folder of folders) {
    const requestIndex = folder.requests.findIndex((req: WebRsRequest) => req.id === requestId);
    if (requestIndex !== -1) {
      const request = folder.requests[requestIndex];
      if (request.savedResponses) {
        request.savedResponses = request.savedResponses.filter(
          (response: SavedResponse) => response.id !== responseId
        );
      }
      return true;
    }
    
    // Recursively search in nested folders
    if (folder.folders && folder.folders.length > 0) {
      const found = deleteSavedResponseFromFolder(folder.folders, requestId, responseId);
      if (found) return true;
    }
  }
  return false;
};