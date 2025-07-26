import React, { createContext, useContext, useState, useEffect } from 'react';
import { addRequestHistory as addHistory, getAllRequestHistory } from '../services/requestHistoryStorage';
import type { RequestHistory } from '../types/request.types';

interface RequestHistoryContextProps {
  requestHistory: RequestHistory[];
  addRequestHistory: (history: RequestHistory) => Promise<void>;
  fetchRequestHistory: () => Promise<void>;
}

const RequestHistoryContext = createContext<RequestHistoryContextProps | undefined>(undefined);

export const RequestHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requestHistory, setRequestHistory] = useState<RequestHistory[]>([]);

  const fetchRequestHistory = async () => {
    const history = await getAllRequestHistory();
    setRequestHistory(history);
  };

  const addRequestHistory = async (history: RequestHistory) => {
    await addHistory(history);
    await fetchRequestHistory();
  };

  useEffect(() => {
    fetchRequestHistory();
  }, []);

  return (
    <RequestHistoryContext.Provider value={{ requestHistory, addRequestHistory, fetchRequestHistory }}>
      {children}
    </RequestHistoryContext.Provider>
  );
};

export const useRequestHistoryContext = (): RequestHistoryContextProps => {
  const context = useContext(RequestHistoryContext);
  if (!context) {
    throw new Error('useRequestHistoryContext must be used within a RequestHistoryProvider');
  }
  return context;
};
