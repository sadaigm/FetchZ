import { getEnvironments, deleteEnvironment, renameEnvironment } from '../services/database';
import type { Environment, EnvironmentValue } from '../types/environment.types';

/**
 * Fetches and formats environments for use in the UI.
 * @returns {Promise<any[]>} A promise that resolves to formatted environment data.
 */
export const fetchAndFormatEnvironments = async (): Promise<any[]> => {
  const environments = await getEnvironments();
  return environments.map((environment) => ({
    title: environment.name,
    key: environment.id,
    isLeaf: false,
  }));
};

/**
 * Renames an environment and triggers a refresh event.
 * @param {string} environmentId - The ID of the environment to rename.
 * @param {string} newName - The new name for the environment.
 */
export const renameEnvironmentAndRefresh = async (environmentId: string, newName: string): Promise<void> => {
  await renameEnvironment(environmentId, newName);
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new Event('refreshEnvironments'));
  }
};

/**
 * Deletes an environment and triggers a refresh event.
 * @param {string} environmentId - The ID of the environment to delete.
 */
export const deleteEnvironmentAndRefresh = async (environmentId: string): Promise<void> => {
  await deleteEnvironment(environmentId);
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new Event('refreshEnvironments'));
  }
};

/**
 * Prepares an empty environment object with default values.
 * @param {string} name - The name for the new environment.
 * @returns {Environment} A new empty environment object.
 */
export const prepareEmptyEnvironment = (name: string): Environment => {
  return {
    id: `env-${Date.now()}`,
    name: name,
    values: []
  };
};

/**
 * Prepares an empty environment value object with default values.
 * @param {string} key - The key for the environment value.
 * @returns {EnvironmentValue} A new empty environment value object.
 */
export const prepareEmptyEnvironmentValue = (key: string): EnvironmentValue => {
  return {
    key,
    value: '',
    type: 'default',
    enabled: true
  };
};

/**
 * Replaces variables in a string with values from the environment.
 * @param {string} text - The text containing variables to replace.
 * @param {Environment} environment - The environment containing variable values.
 * @returns {string} The text with variables replaced by their values.
 */
export const replaceEnvironmentVariables = (text: string, environment: Environment): string => {
  if (!environment || !environment.values) {
    return text;
  }

  let result = text;
  
  environment.values.forEach((envValue: EnvironmentValue) => {
    if (envValue.enabled) {
      // Replace {{variable}} format
      const regex = new RegExp(`\\{\\{\\s*${envValue.key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, envValue.value);
      
      // Replace {{variable}} format with optional spaces
      const regexWithSpaces = new RegExp(`\\{\\{\\s*${envValue.key}\\s*\\}\\}`, 'g');
      result = result.replace(regexWithSpaces, envValue.value);
    }
  });
  
  return result;
};

/**
 * Finds all variables in a string that could be replaced with environment values.
 * @param {string} text - The text to search for variables.
 * @returns {string[]} An array of variable names found in the text.
 */
export const findEnvironmentVariables = (text: string): string[] => {
  const regex = /\{\{\s*([^}]+)\s*\}\}/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1].trim());
  }
  
  return [...new Set(matches)]; // Remove duplicates
};