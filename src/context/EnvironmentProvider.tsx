import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getEnvironments,
  addEnvironment as addEnvironmentToDB,
  renameEnvironment,
  deleteEnvironment,
  getEnvironmentById,
  addEnvironmentValue,
  updateEnvironmentValue,
  deleteEnvironmentValue,
  updateEnvironment
} from '../services/database';
import type { Environment, EnvironmentValue } from '../types/environment.types';

interface EnvironmentContextProps {
  environments: Environment[];
  activeEnvironment: Environment | null;
  refreshEnvironments: () => Promise<void>;
  setActiveEnvironment: (environment: Environment | null) => void;
  addNewEnvironment: (name: string) => Promise<void>;
  addFullEnvironment: (environment: Environment) => Promise<void>;
  updateEnvironmentName: (id: string, newName: string) => Promise<void>;
  removeEnvironment: (id: string) => Promise<void>;
  addValueToEnvironment: (environmentId: string, key: string, value: string, type?: 'default' | 'secret' | 'any', enabled?: boolean) => Promise<void>;
  updateValueInEnvironment: (environmentId: string, key: string, updatedValue: Partial<EnvironmentValue>) => Promise<void>;
  removeValueFromEnvironment: (environmentId: string, key: string) => Promise<void>;
  saveEnvironment: (environment: Environment) => Promise<void>;
}

const EnvironmentContext = createContext<EnvironmentContextProps | undefined>(undefined);

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvironment, setActiveEnvironmentState] = useState<Environment | null>(null);

  const fetchEnvironments = async () => {
    const fetchedEnvironments = await getEnvironments();
    setEnvironments(fetchedEnvironments);
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  useEffect(() => {
    const handleRefreshEnvironments = async () => {
      await fetchEnvironments();
    };

    window.addEventListener('refreshEnvironments', handleRefreshEnvironments);

    return () => {
      window.removeEventListener('refreshEnvironments', handleRefreshEnvironments);
    };
  }, [fetchEnvironments]);

  const setActiveEnvironment = (environment: Environment | null) => {
    setActiveEnvironmentState(environment);
  };

  const addNewEnvironment = async (name: string): Promise<void> => {
    await addEnvironmentToDB(name);
    await fetchEnvironments(); // Refresh environments after adding a new one
  };

  const addFullEnvironment = async (environment: Environment): Promise<void> => {
    await addEnvironmentToDB(environment);
    await fetchEnvironments(); // Refresh environments
  };

  const updateEnvironmentName = async (id: string, newName: string): Promise<void> => {
    await renameEnvironment(id, newName);
    await fetchEnvironments();
    
    // Update active environment if it's the one being renamed
    if (activeEnvironment && activeEnvironment.id === id) {
      setActiveEnvironmentState({ ...activeEnvironment, name: newName });
    }
  };

  const removeEnvironment = async (id: string): Promise<void> => {
    await deleteEnvironment(id);
    await fetchEnvironments();
    
    // Clear active environment if it's the one being deleted
    if (activeEnvironment && activeEnvironment.id === id) {
      setActiveEnvironmentState(null);
    }
  };

  const addValueToEnvironment = async (
    environmentId: string,
    key: string,
    value: string,
    type: 'default' | 'secret' | 'any' = 'default',
    enabled: boolean = true
  ): Promise<void> => {
    await addEnvironmentValue(environmentId, key, value, type, enabled);
    await fetchEnvironments();
    
    // Update active environment if it's the one being modified
    if (activeEnvironment && activeEnvironment.id === environmentId) {
      const updatedEnvironment = await getEnvironmentById(environmentId);
      if (updatedEnvironment) {
        setActiveEnvironmentState(updatedEnvironment);
      }
    }
  };

  const updateValueInEnvironment = async (
    environmentId: string,
    key: string,
    updatedValue: Partial<EnvironmentValue>
  ): Promise<void> => {
    await updateEnvironmentValue(environmentId, key, updatedValue);
    await fetchEnvironments();
    
    // Update active environment if it's the one being modified
    if (activeEnvironment && activeEnvironment.id === environmentId) {
      const updatedEnvironment = await getEnvironmentById(environmentId);
      if (updatedEnvironment) {
        setActiveEnvironmentState(updatedEnvironment);
      }
    }
  };

  const removeValueFromEnvironment = async (environmentId: string, key: string): Promise<void> => {
    await deleteEnvironmentValue(environmentId, key);
    await fetchEnvironments();
    
    // Update active environment if it's the one being modified
    if (activeEnvironment && activeEnvironment.id === environmentId) {
      const updatedEnvironment = await getEnvironmentById(environmentId);
      if (updatedEnvironment) {
        setActiveEnvironmentState(updatedEnvironment);
      }
    }
  };

  const saveEnvironment = async (environment: Environment): Promise<void> => {
    await updateEnvironment(environment);
    await fetchEnvironments();
    
    // Update active environment if it's the one being saved
    if (activeEnvironment && activeEnvironment.id === environment.id) {
      setActiveEnvironmentState(environment);
    }
  };

  return (
    <EnvironmentContext.Provider value={{
      environments,
      activeEnvironment,
      refreshEnvironments: fetchEnvironments,
      setActiveEnvironment,
      addNewEnvironment,
      addFullEnvironment,
      updateEnvironmentName,
      removeEnvironment,
      addValueToEnvironment,
      updateValueInEnvironment,
      removeValueFromEnvironment,
      saveEnvironment
    }}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironmentContext = (): EnvironmentContextProps => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironmentContext must be used within an EnvironmentProvider');
  }
  return context;
};