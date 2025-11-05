import type { Environment } from '../types/environment.types';

/**
 * Replaces environment variables in a string using the {{variable_name}} syntax
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
      const value = envVar.currentValue !== undefined ? envVar.currentValue : envVar.value;
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
 * Updates a URL string by replacing environment variables
 * @param url The URL string with variables
 * @param environment The environment with variable values
 * @returns The URL with variables replaced
 */
export const updateUrl = (url: string, environment: Environment | null): string => {
  return replaceVariables(url, environment);
};

/**
 * Updates headers by replacing environment variables in header values
 * @param headers Array of header objects with key and value
 * @param environment The environment with variable values
 * @returns Array of headers with variables replaced
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
 * Updates request parameters by replacing environment variables in parameter values
 * @param params Record of parameter key-value pairs
 * @param environment The environment with variable values
 * @returns Record of parameters with variables replaced
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
 * Updates request body by replacing environment variables
 * @param body The request body (can be string or object)
 * @param environment The environment with variable values
 * @returns The body with variables replaced
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
 * Updates all request components (URL, headers, params, body) with environment variables
 * @param request The request object containing url, headers, params, and body
 * @param environment The environment with variable values
 * @returns The request object with all variables replaced
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