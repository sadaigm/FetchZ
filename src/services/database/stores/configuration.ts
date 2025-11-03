import { getDB } from '../index';
import { STORE_NAMES } from '../types';
import type { Configuration } from '../types';

/**
 * Gets the configuration from the database
 * @returns Promise<Configuration | undefined> The configuration object or undefined if not found
 */
export const getConfiguration = async (): Promise<Configuration | undefined> => {
  const db = await getDB();
  return await db.get(STORE_NAMES.CONFIGURATION, 'app-config');
};

/**
 * Saves the configuration to the database
 * @param config The configuration object to save
 * @returns Promise<void>
 */
export const saveConfiguration = async (config: Configuration): Promise<void> => {
  const db = await getDB();
  await db.put(STORE_NAMES.CONFIGURATION, config);
};

/**
 * Updates the active environment ID in the configuration
 * @param environmentId The ID of the environment to set as active
 * @returns Promise<void>
 */
export const updateActiveEnvironment = async (environmentId: string): Promise<void> => {
  const db = await getDB();
  
  // Get existing configuration or create a new one
  const existingConfig = await getConfiguration();
  const config: Configuration = existingConfig || {
    id: 'app-config'
  };
  
  // Update the active environment ID
  config.activeEnvironmentId = environmentId;
  
  // Save the updated configuration
  await db.put(STORE_NAMES.CONFIGURATION, config);
};

/**
 * Removes the active environment ID from configuration
 * @returns Promise<void>
 */
export const removeActiveEnvironment = async (): Promise<void> => {
  const db = await getDB();
  
  // Get existing configuration or create a new one
  const existingConfig = await getConfiguration();
  const config: Configuration = existingConfig || {
    id: 'app-config'
  };
  
  // Remove the active environment ID
  config.activeEnvironmentId = undefined;
  
  // Save the updated configuration
  await db.put(STORE_NAMES.CONFIGURATION, config);
};

/**
 * Toggles the active environment ID in configuration
 * @param environmentId The ID of the environment to toggle
 * @returns Promise<boolean> Returns true if the environment is now active, false if it's now inactive
 */
export const toggleActiveEnvironment = async (environmentId: string): Promise<boolean> => {
  const db = await getDB();
  
  // Get existing configuration or create a new one
  const existingConfig = await getConfiguration();
  const config: Configuration = existingConfig || {
    id: 'app-config'
  };
  
  // Toggle the active environment ID
  if (config.activeEnvironmentId === environmentId) {
    // Environment is currently active, deactivate it
    config.activeEnvironmentId = undefined;
    await db.put(STORE_NAMES.CONFIGURATION, config);
    return false;
  } else {
    // Environment is not active, activate it
    config.activeEnvironmentId = environmentId;
    await db.put(STORE_NAMES.CONFIGURATION, config);
    return true;
  }
};