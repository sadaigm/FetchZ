import type { Environment, EnvironmentValue } from '../../../types/environment.types';
import { STORE_NAMES } from '../types';
import { getDB } from '../index';

const mapToEnvironmentType = (rawEnvironment: any): Environment => {
  return {
    id: rawEnvironment.id,
    name: rawEnvironment.name,
    values: rawEnvironment.values || []
  };
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const addEnvironment = async (nameOrEnvironment: string | Environment): Promise<IDBValidKey> => {
  const db = await getDB();
  
  if (typeof nameOrEnvironment === 'string') {
    // Just add an environment with name
    const id = await db.add(STORE_NAMES.ENVIRONMENTS, {
      id: generateId(),
      name: nameOrEnvironment,
      values: []
    });
    return id;
  } else {
    // Add a full environment with all its values
    // Strip out any currentValue before saving to database
    const cleanEnvironment: Environment = {
      ...nameOrEnvironment,
      values: nameOrEnvironment.values.map(({ key, value, type, enabled }) => ({
        key,
        value,
        type,
        enabled
      }))
    };
    const id = await db.add(STORE_NAMES.ENVIRONMENTS, cleanEnvironment);
    return id;
  }
};

export const renameEnvironment = async (id: string, newName: string): Promise<void> => {
  const db = await getDB();
  const environment = await db.get(STORE_NAMES.ENVIRONMENTS, id);
  if (environment) {
    environment.name = newName;
    await db.put(STORE_NAMES.ENVIRONMENTS, environment);
  } else {
    throw new Error('Environment not found');
  }
};

export const deleteEnvironment = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete(STORE_NAMES.ENVIRONMENTS, id);
};

export const getEnvironments = async (): Promise<Environment[]> => {
  const db = await getDB();
  const rawEnvironments = await db.getAll(STORE_NAMES.ENVIRONMENTS);
  return rawEnvironments.map(mapToEnvironmentType);
};

export const getEnvironmentById = async (id: string): Promise<Environment | null> => {
  const db = await getDB();
  const environment = await db.get(STORE_NAMES.ENVIRONMENTS, id);
  return environment ? mapToEnvironmentType(environment) : null;
};

export const addEnvironmentValue = async (
  environmentId: string,
  key: string,
  value: string,
  type: 'default' | 'secret' | 'any' = 'default',
  enabled: boolean = true
): Promise<void> => {
  const db = await getDB();
  const environment = await db.get(STORE_NAMES.ENVIRONMENTS, environmentId);
  if (environment) {
    const newEnvironmentValue: EnvironmentValue = {
      key,
      value,
      type,
      enabled
    };
    
    if (!environment.values) {
      environment.values = [];
    }
    
    environment.values.push(newEnvironmentValue);
    await db.put(STORE_NAMES.ENVIRONMENTS, environment);
  } else {
    throw new Error('Environment not found');
  }
};

export const updateEnvironmentValue = async (
  environmentId: string,
  key: string,
  updatedValue: Partial<EnvironmentValue>
): Promise<void> => {
  const db = await getDB();
  const environment = await db.get(STORE_NAMES.ENVIRONMENTS, environmentId);
  if (environment && environment.values) {
    const valueIndex = environment.values.findIndex((v: EnvironmentValue) => v.key === key);
    if (valueIndex !== -1) {
      environment.values[valueIndex] = { ...environment.values[valueIndex], ...updatedValue };
      await db.put(STORE_NAMES.ENVIRONMENTS, environment);
    } else {
      throw new Error('Environment value not found');
    }
  } else {
    throw new Error('Environment not found');
  }
};

export const deleteEnvironmentValue = async (environmentId: string, key: string): Promise<void> => {
  const db = await getDB();
  const environment = await db.get(STORE_NAMES.ENVIRONMENTS, environmentId);
  if (environment && environment.values) {
    environment.values = environment.values.filter((v: EnvironmentValue) => v.key !== key);
    await db.put(STORE_NAMES.ENVIRONMENTS, environment);
  } else {
    throw new Error('Environment not found');
  }
};

export const updateEnvironment = async (environment: Environment): Promise<void> => {
  const db = await getDB();
  
  // Strip out any currentValue before saving to database
  const cleanEnvironment: Environment = {
    ...environment,
    values: environment.values.map(({ key, value, type, enabled }) => ({
      key,
      value,
      type,
      enabled
    }))
  };
  
  await db.put(STORE_NAMES.ENVIRONMENTS, cleanEnvironment);
};