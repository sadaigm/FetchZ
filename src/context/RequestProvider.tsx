import React, { createContext, useContext, useState } from 'react';
import type { WebRsRequest, Collection } from '../types/request.types';
import type { Environment } from '../types/environment.types';
import { useCollectionContext } from './CollectionProvider';

export interface OpenedWindowInstance {
  type: "WebRsRequest" | "Environment";
  data: WebRsRequest | Environment;
  id: string; // for removal & adding
}

interface RequestContextProps {
  openedRequests: OpenedWindowInstance[];
  addRequest: (request: WebRsRequest, collectionId?: string) => void;
  addEnvironment: (environment: Environment) => void;
  removeRequest: (requestId: string) => void;
  selectedRequestId?: string;
  setSelectedRequestId?: (requestId: string) => void;
  requestCollections: Record<string, Collection | undefined>;
  dirtyRequests: Array<string>;
  setDirtyRequests: React.Dispatch<React.SetStateAction<string[]>>;
}

const RequestContext = createContext<RequestContextProps | undefined>(undefined);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openedRequests, setOpenedRequests] = useState<OpenedWindowInstance[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>(undefined);
  const [requestCollections, setRequestCollections] = useState<Record<string, Collection | undefined>>({});
  const [ dirtyRequests, setDirtyRequests ] = useState<Array<string>>([] as Array<string>);
  const { collections } = useCollectionContext();

  const addRequest = (request: WebRsRequest, collectionId?: string) => {
    setOpenedRequests((prevRequests) => {
      if (!prevRequests.some((r) => r.id === request.id)) {
        const newWindow: OpenedWindowInstance = {
          type: "WebRsRequest",
          data: request,
          id: request.id
        };
        return [...prevRequests, newWindow];
      }
      return prevRequests;
    });

    if (collectionId) {
      const collection = collections.find((col) => col.id === collectionId);
      if (collection) {
        setRequestCollections((prevCollections) => ({
          ...prevCollections,
          [request.id]: collection,
        }));
      }
    } else {
      const collection = collections.find((col) => col.requests.some((req) => req.id === request.id));
      if (collection) {
        setRequestCollections((prevCollections) => ({
          ...prevCollections,
          [request.id]: collection,
        }));
      }
    }
  };

  const addEnvironment = (environment: Environment) => {
    setOpenedRequests((prevRequests) => {
      if (!prevRequests.some((r) => r.id === environment.id)) {
        const newWindow: OpenedWindowInstance = {
          type: "Environment",
          data: environment,
          id: environment.id
        };
        return [...prevRequests, newWindow];
      }
      return prevRequests;
    });
    setSelectedRequestId && setSelectedRequestId(environment.id);
  };


  const removeRequest = (requestId: string) => {
    setOpenedRequests((prevRequests) => prevRequests.filter((r) => r.id !== requestId));
  };

  return (
    <RequestContext.Provider
      value={{
        openedRequests,
        addRequest,
        addEnvironment,
        removeRequest,
        selectedRequestId,
        setSelectedRequestId,
        requestCollections,
        dirtyRequests,
        setDirtyRequests,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequestContext = (): RequestContextProps => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequestContext must be used within a RequestProvider');
  }
  return context;
};
