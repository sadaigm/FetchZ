import type { Environment, EnvironmentValueWithCurrent } from '../types/environment.types';

/**
 * Replaces environment variables in a string using the {{variable_name}} syntax
 * Uses currentValue if available, otherwise falls back to the default value
 * @param text The text containing variables to replace
 * @param environment The environment with variable values
 * @returns The text with variables replaced by their current values
 */
export const replaceVariables = (text: string, environment: Environment | null): string => {
  if (!environment || !text) return text;
  
  // Create a map of variable key to current value (or default value if current is not set)
  const variableMap = new Map<string, string>();
  
  environment.values.forEach(envVar => {
    if (envVar.enabled) {
      // Use currentValue if available, otherwise use the default value
      const envVarWithCurrent = envVar as EnvironmentValueWithCurrent;
      const value = envVarWithCurrent.currentValue !== undefined
        ? envVarWithCurrent.currentValue
        : envVar.value || '';
      variableMap.set(envVar.key, value);
    }
  });
  
  // Replace all occurrences of {{variable_name}} with their values
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedVarName = variableName.trim();
    return variableMap.get(trimmedVarName) || match; // Return original if variable not found
  });
};

/**
 * Updates a URL string by replacing environment variables with current values
 * @param url The URL string with variables
 * @param environment The active environment with variable values
 * @returns The URL with variables replaced by current values
 */
export const updateUrl = (url: string, environment: Environment | null): string => {
  return replaceVariables(url, environment);
};

/**
 * Updates a URL string by adding a protocol if missing
 * @param url The URL string that might be missing a protocol
 * @param defaultProtocol The default protocol to add (default: 'http://')
 * @returns The URL with a protocol
 */
export const updateProtocol = (url: string, defaultProtocol: string = 'http://'): string => {
  if (!url) return url;
  
  // Check if the URL already has a protocol (http://, https://, ftp://, etc.)
  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url);
  
  // If no protocol, add the default one
  return hasProtocol ? url : `${defaultProtocol}${url}`;
};

/**
 * Updates headers by replacing environment variables in header values with current values
 * @param headers Array of header objects with key and value
 * @param environment The active environment with variable values
 * @returns Array of headers with variables replaced by current values
 */
export const updateHeaders = (
  headers: Array<{ key: string; value: string }>, 
  environment: Environment | null
): Array<{ key: string; value: string }> => {
  if (!headers || !environment) return headers;
  
  return headers.map(header => ({
    ...header,
    value: replaceVariables(header.value, environment)
  }));
};

/**
 * Updates request parameters by replacing environment variables in parameter values with current values
 * @param params Record of parameter key-value pairs
 * @param environment The active environment with variable values
 * @returns Record of parameters with variables replaced by current values
 */
export const updateParams = (
  params: Record<string, string>, 
  environment: Environment | null
): Record<string, string> => {
  if (!params || !environment) return params;
  
  const updatedParams: Record<string, string> = {};
  
  Object.keys(params).forEach(key => {
    updatedParams[key] = replaceVariables(params[key], environment);
  });
  
  return updatedParams;
};

/**
 * Updates request body by replacing environment variables with current values
 * @param body The request body (can be string or object)
 * @param environment The active environment with variable values
 * @returns The body with variables replaced by current values
 */
export const updateBody = (
  body: any, 
  environment: Environment | null
): any => {
  if (!body || !environment) return body;
  
  // If body is a string, directly replace variables
  if (typeof body === 'string') {
    return replaceVariables(body, environment);
  }
  
  // If body is an object, recursively replace variables in all string values
  if (typeof body === 'object' && body !== null) {
    if (Array.isArray(body)) {
      // Handle arrays
      return body.map(item => updateBody(item, environment));
    } else {
      // Handle objects
      const updatedBody: any = {};
      Object.keys(body).forEach(key => {
        updatedBody[key] = updateBody(body[key], environment);
      });
      return updatedBody;
    }
  }
  
  // For other types (number, boolean, etc.), return as-is
  return body;
};

/**
 * Updates all request components (URL, headers, params, body) with environment variables using current values
 * @param request The request object containing url, headers, params, and body
 * @param environment The active environment with variable values
 * @returns The request object with all variables replaced by current values
 */
export const updateRequestWithEnvironment = (
  request: {
    url?: string;
    headers?: Array<{ key: string; value: string }>;
    params?: Record<string, string>;
    body?: any;
  },
  environment: Environment | null
) => {
  return {
    url: request.url ? updateUrl(request.url, environment) : request.url,
    headers: request.headers ? updateHeaders(request.headers, environment) : request.headers,
    params: request.params ? updateParams(request.params, environment) : request.params,
    body: request.body !== undefined ? updateBody(request.body, environment) : request.body
  };
};