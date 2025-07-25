import React, { createContext, useContext, useState } from 'react';
import type { WebRsRequest } from '../types/request.types';

interface RequestContextProps {
  openedRequests: WebRsRequest[];
  addRequest: (request: WebRsRequest) => void;
  removeRequest: (requestId: string) => void;
    selectedRequestId?: string;
    setSelectedRequestId?: (requestId: string) => void;
}

const RequestContext = createContext<RequestContextProps | undefined>(undefined);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openedRequests, setOpenedRequests] = useState<WebRsRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>(undefined);

  const addRequest = (request: WebRsRequest) => {
    setOpenedRequests((prevRequests) => {
      if (!prevRequests.some((r) => r.id === request.id)) {
        return [...prevRequests, request];
      }
      return prevRequests;
    });
  };

  const removeRequest = (requestId: string) => {
    setOpenedRequests((prevRequests) => prevRequests.filter((r) => r.id !== requestId));
  };

  return (
    <RequestContext.Provider value={{ openedRequests, addRequest, removeRequest, selectedRequestId, setSelectedRequestId }}>
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
