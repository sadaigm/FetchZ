import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCollections, addRequestToCollection, modifyRequestInCollection, addCollection } from '../services/collectionStorage';
import type { Collection, WebRsRequest } from '../types/request.types';

interface CollectionContextProps {
  collections: Collection[];
  refreshCollections: () => Promise<void>;
  saveRequestToCollection: (collectionId: string, request: WebRsRequest) => Promise<void>;
  addNewCollection: (name: string) => Promise<void>;
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
    await addCollection(name);
    await fetchCollections(); // Refresh collections after adding a new one
  };

  return (
    <CollectionContext.Provider value={{ collections, refreshCollections: fetchCollections, saveRequestToCollection, addNewCollection }}>
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
