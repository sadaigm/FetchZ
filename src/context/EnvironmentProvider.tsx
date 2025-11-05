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
  updateEnvironment,
  getConfiguration,
  toggleActiveEnvironment as toggleActiveEnvironmentInDB
} from '../services/database';
import type { Environment, EnvironmentValue, EnvironmentValueWithCurrent } from '../types/environment.types';

interface EnvironmentContextProps {
  environments: Environment[];
  activeEnvironment: Environment | null;
  activeEnvironmentWithCurrentValues: Environment | null;
  refreshEnvironments: () => Promise<void>;
  toggleEnvironmentActive: (environment: Environment) => Promise<boolean>;
  addNewEnvironment: (name: string) => Promise<void>;
  addFullEnvironment: (environment: Environment) => Promise<void>;
  updateEnvironmentName: (id: string, newName: string) => Promise<void>;
  removeEnvironment: (id: string) => Promise<void>;
  addValueToEnvironment: (environmentId: string, key: string, value: string, type?: 'default' | 'secret' | 'any', enabled?: boolean) => Promise<void>;
  updateValueInEnvironment: (environmentId: string, key: string, updatedValue: Partial<EnvironmentValue>) => Promise<void>;
  removeValueFromEnvironment: (environmentId: string, key: string) => Promise<void>;
  saveEnvironment: (environment: Environment) => Promise<void>;
  updateCurrentValue: (environmentId: string, key: string, currentValue: string) => void;
  currentValues:  Map<string, Map<string, string>>;
}

const EnvironmentContext = createContext<EnvironmentContextProps | undefined>(undefined);

// Function to load current values from localStorage
const loadCurrentValuesFromStorage = (): Map<string, Map<string, string>> => {
  const storedCurrentValues = localStorage.getItem('environmentCurrentValues');
  if (!storedCurrentValues) {
    return new Map();
  }
  
  try {
    const parsed = JSON.parse(storedCurrentValues);
    const currentValuesMap = new Map<string, Map<string, string>>();
    
    Object.keys(parsed).forEach(envId => {
      currentValuesMap.set(envId, new Map(Object.entries(parsed[envId])));
    });
    
    return currentValuesMap;
  } catch (error) {
    console.error('Failed to parse current values from localStorage:', error);
    return new Map();
  }
};


export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvironment, setActiveEnvironmentState] = useState<Environment | null>(null);
  const [currentValues, setCurrentValues] = useState<Map<string, Map<string, string>>>(loadCurrentValuesFromStorage()); // environmentId -> key -> currentValue
  const [isLoading, setIsLoading] = useState(true);
  
  // Computed state that combines active environment with current values
  const activeEnvironmentWithCurrentValues = React.useMemo(() => {
    if (!activeEnvironment) return null;
    
    const envCurrentValues = currentValues.get(activeEnvironment.id);
    if (!envCurrentValues || envCurrentValues.size === 0) {
      return activeEnvironment;
    }
    
    // Create a new environment object with current values merged in
    const updatedValues = activeEnvironment.values.map(envValue => {
      const currentValue = envCurrentValues.get(envValue.key);
      if (currentValue !== undefined) {
        return { ...envValue, currentValue };
      }
      return envValue;
    });
    
    return {
      ...activeEnvironment,
      values: updatedValues
    };
  }, [activeEnvironment, currentValues]);
  
  // Save current values to localStorage whenever they change
  React.useEffect(() => {
    const currentValuesObj: Record<string, Record<string, string>> = {};
    
    currentValues.forEach((envValues, envId) => {
      currentValuesObj[envId] = {};
      envValues.forEach((value, key) => {
        currentValuesObj[envId][key] = value;
      });
    });
    
    localStorage.setItem('environmentCurrentValues', JSON.stringify(currentValuesObj));
  }, [currentValues]);

  const fetchEnvironments = async () => {
    const fetchedEnvironments = await getEnvironments();
    setEnvironments(fetchedEnvironments);
    
    // Load active environment from configuration
    const config = await getConfiguration();
    if (config?.activeEnvironmentId) {
      const activeEnv = fetchedEnvironments.find(env => env.id === config.activeEnvironmentId);
      if (activeEnv) {
        setActiveEnvironmentState(activeEnv);
      }
    }
    
    setIsLoading(false);
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
  
  const toggleEnvironmentActive = async (environment: Environment): Promise<boolean> => {
    const isActive = await toggleActiveEnvironmentInDB(environment.id);
    
    if (isActive) {
      setActiveEnvironmentState(environment);
    } else {
      setActiveEnvironmentState(null);
    }
    
    return isActive;
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
    
    // Clear current values for this environment
    setCurrentValues(prev => {
      const newValues = new Map(prev);
      newValues.delete(id);
      return newValues;
    });
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
    
    // Remove current value for this key
    setCurrentValues(prev => {
      const newValues = new Map(prev);
      const envValues = newValues.get(environmentId);
      if (envValues) {
        envValues.delete(key);
        if (envValues.size === 0) {
          newValues.delete(environmentId);
        }
      }
      return newValues;
    });
  };

  const saveEnvironment = async (environment: Environment): Promise<void> => {
    await updateEnvironment(environment);
    await fetchEnvironments();
    
    // Update active environment if it's the one being saved
    if (activeEnvironment && activeEnvironment.id === environment.id) {
      setActiveEnvironmentState(environment);
    }
  };
  
  const updateCurrentValue = (environmentId: string, key: string, currentValue: string): void => {
    console.log({environmentId, key, currentValue })
    setCurrentValues(prev => {
      const newValues = new Map(prev);
      let envValues = newValues.get(environmentId);
      
      if (!envValues) {
        envValues = new Map();
        newValues.set(environmentId, envValues);
      }
      
      envValues.set(key, currentValue);
      return newValues;
    });
  };

  return (
    <EnvironmentContext.Provider value={{
      environments,
      activeEnvironment,
      activeEnvironmentWithCurrentValues,
      refreshEnvironments: fetchEnvironments,
      toggleEnvironmentActive,
      addNewEnvironment,
      addFullEnvironment,
      updateEnvironmentName,
      removeEnvironment,
      addValueToEnvironment,
      updateValueInEnvironment,
      removeValueFromEnvironment,
      saveEnvironment,
      updateCurrentValue,
      currentValues
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