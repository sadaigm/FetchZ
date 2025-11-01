import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getCollections,
  addRequestToCollection,
  modifyRequestInCollection,
  addCollection as addCollectionToDB
} from '../services/database';
import {
  addFolderToCollection,
  deleteFolderFromCollection,
  addRequestToFolder,
  removeRequestFromFolder
} from '../services/database/stores/collections';
import type { Collection, WebRsRequest, CollectionFolder } from '../types/request.types';

interface CollectionContextProps {
  collections: Collection[];
  refreshCollections: () => Promise<void>;
  saveRequestToCollection: (collectionId: string, request: WebRsRequest) => Promise<void>;
  addNewCollection: (name: string) => Promise<void>;
  addFullCollection: (collection: Collection) => Promise<void>;
  addFolder: (collectionId: string, folderName: string) => Promise<string>;
  deleteFolder: (collectionId: string, folderId: string) => Promise<void>;
  addRequestToFolder: (collectionId: string, folderId: string, request: WebRsRequest) => Promise<void>;
  removeRequestFromFolder: (collectionId: string, folderId: string, requestId: string) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextProps | undefined>(undefined);

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collection[]>([]);

  const fetchCollections = async () => {
    const fetchedCollections = await getCollections();
    setCollections(fetchedCollections);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    const handleRefreshCollections = async () => {
      await fetchCollections();
    };

    window.addEventListener('refreshCollections', handleRefreshCollections);

    return () => {
      window.removeEventListener('refreshCollections', handleRefreshCollections);
    };
  }, [fetchCollections]);

  const saveRequestToCollection = async (
    collectionId: string,
    request: WebRsRequest
  ): Promise<void> => {
    const collection = collections.find((col) => col.id === collectionId);
    if (collection) {
      const existingRequest = collection.requests.find((req) => req.id === request.id);
      if (existingRequest) {
        await modifyRequestInCollection(collectionId, request.id, request);
      } else {
        await addRequestToCollection(collectionId, request);
      }
      await fetchCollections();
    } else {
      throw new Error('Collection not found');
    }
  };

  const addNewCollection = async (name: string): Promise<void> => {
    await addCollectionToDB(name);
    await fetchCollections(); // Refresh collections after adding a new one
  };

  const addFullCollection = async (collection: Collection): Promise<void> => {
    await addCollectionToDB(collection.name);
    // Get the newly created collection ID
    const collections = await getCollections();
    const newCollection = collections.find(c => c.name === collection.name);
    if (newCollection) {
      // Add all requests to the new collection
      for (const request of collection.requests) {
        await addRequestToCollection(newCollection.id, request);
      }
    }
    await fetchCollections(); // Refresh collections
  };

  return (
    <CollectionContext.Provider value={{
      collections,
      refreshCollections: fetchCollections,
      saveRequestToCollection,
      addNewCollection,
      addFullCollection,
      addFolder: addFolderToCollection,
      deleteFolder: deleteFolderFromCollection,
      addRequestToFolder,
      removeRequestFromFolder
    }}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollectionContext = (): CollectionContextProps => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollectionContext must be used within a CollectionProvider');
  }
  return context;
};
