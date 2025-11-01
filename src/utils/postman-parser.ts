import type { Collection, WebRsRequest } from '../types/request.types';

export interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema?: string;
    _postman_id?: string;
  };
  item: PostmanItem[];
  variable?: Array<{
    key: string;
    value: string;
    type?: string;
  }>;
}

export interface PostmanItem {
  name: string;
  request?: PostmanRequest;
  item?: PostmanItem[]; // For folders
  description?: string;
}

export interface PostmanRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  header?: Array<{
    key: string;
    value: string;
    type?: string;
    disabled?: boolean;
  }>;
  body?: {
    mode: 'raw' | 'urlencoded' | 'formdata' | 'file' | 'graphql';
    raw?: string;
    urlencoded?: Array<{
      key: string;
      value: string;
    }>;
    formdata?: Array<{
      key: string;
      value: string;
      type?: string;
    }>;
  };
  url: {
    raw: string;
    host?: string[];
    path?: string[];
    query?: Array<{
      key: string;
      value: string;
    }>;
  } | string;
}

export interface ParsedCollection {
  name: string;
  description?: string;
  variables: Array<{
    key: string;
    value: string;
  }>;
  folders: Array<{
    name: string;
    requests: WebRsRequest[];
  }>;
  totalRequests: number;
  sampleMethods: string[];
}

/**
 * Validates if the given JSON is a valid Postman collection
 */
export function validatePostmanCollection(json: any): { isValid: boolean; error?: string } {
  if (!json || typeof json !== 'object') {
    return { isValid: false, error: 'Invalid JSON format' };
  }

  if (!json.info || !json.info.name) {
    return { isValid: false, error: 'Missing collection name in info object' };
  }

  if (!json.item || !Array.isArray(json.item)) {
    return { isValid: false, error: 'Missing or invalid items array' };
  }

  // Check if it follows Postman collection schema
  if (json.info.schema && !json.info.schema.includes('postman.com/json/collection')) {
    return { isValid: false, error: 'Not a valid Postman collection schema' };
  }

  return { isValid: true };
}

/**
 * Converts Postman headers to WebRsRequest headers format
 */
function convertHeaders(postmanHeaders?: Array<{ key: string; value: string }>): { key: string; value: string }[] {
  if (!postmanHeaders) return [];
  
  return postmanHeaders
    .filter(header => header.key && header.value)
    .map(header => ({
      key: header.key,
      value: header.value
    }));
}

/**
 * Converts Postman query params to WebRsRequest query params format
 */
function convertQueryParams(postmanQuery?: Array<{ key: string; value: string }>): { key: string; value: string }[] {
  if (!postmanQuery) return [];
  
  return postmanQuery
    .filter(param => param.key !== undefined)
    .map(param => ({
      key: param.key,
      value: param.value || ''
    }));
}

/**
 * Converts Postman request body to WebRsRequest body format
 */
function convertBody(postmanBody?: PostmanRequest['body']): string {
  if (!postmanBody) return '';
  
  switch (postmanBody.mode) {
    case 'raw':
      return postmanBody.raw || '';
    case 'urlencoded':
      if (postmanBody.urlencoded) {
        return postmanBody.urlencoded
          .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
          .join('&');
      }
      return '';
    case 'formdata':
      if (postmanBody.formdata) {
        const formData = new FormData();
        postmanBody.formdata.forEach(param => {
          formData.append(param.key, param.value);
        });
        // Note: FormData can't be easily converted to string for storage
        // This is a simplified approach
        return postmanBody.formdata
          .map(param => `${param.key}=${param.value}`)
          .join('&');
      }
      return '';
    default:
      return '';
  }
}

/**
 * Converts Postman URL to WebRsRequest URL format
 */
function convertUrl(postmanUrl: PostmanRequest['url']): string {
  if (typeof postmanUrl === 'string') {
    return postmanUrl;
  }
  
  if (postmanUrl && typeof postmanUrl === 'object' && postmanUrl.raw) {
    return postmanUrl.raw;
  }
  
  return '';
}

/**
 * Recursively processes Postman items to extract folders and requests
 */
function processItems(items: PostmanItem[], parentFolder = ''): Array<{ name: string; requests: WebRsRequest[] }> {
  const folders: Array<{ name: string; requests: WebRsRequest[] }> = [];
  
  items.forEach(item => {
    if (item.item && Array.isArray(item.item)) {
      // This is a folder
      const folderName = item.name;
      const subFolders = processItems(item.item, folderName);
      
      // Add the folder with its requests
      const folderRequests = item.item
        .filter(subItem => subItem.request)
        .map(subItem => convertPostmanRequest(subItem.request!));
      
      if (folderRequests.length > 0) {
        folders.push({
          name: folderName,
          requests: folderRequests
        });
      }
      
      // Add any sub-folders
      folders.push(...subFolders);
    } else if (item.request) {
      // This is a request at the root level
      if (!parentFolder) {
        // Create a default folder for root-level requests
        let rootFolder = folders.find(f => f.name === 'Root');
        if (!rootFolder) {
          rootFolder = { name: 'Root', requests: [] };
          folders.push(rootFolder);
        }
        rootFolder.requests.push(convertPostmanRequest(item.request));
      }
    }
  });
  
  return folders;
}

/**
 * Converts a Postman request to WebRsRequest format
 */
function convertPostmanRequest(postmanRequest: PostmanRequest): WebRsRequest {
  const url = convertUrl(postmanRequest.url);
  
  // Extract query parameters from URL if they exist in the URL object
  let queryParams: { key: string; value: string }[] = [];
  if (typeof postmanRequest.url === 'object' && postmanRequest.url.query) {
    queryParams = convertQueryParams(postmanRequest.url.query);
  }
  
  // Also try to extract query params from the raw URL
  if (queryParams.length === 0 && url.includes('?')) {
    const urlObj = new URL(url, 'http://localhost'); // Base URL for parsing
    urlObj.searchParams.forEach((value, key) => {
      queryParams.push({ key, value });
    });
  }
  
  return {
    id: generateId(),
    name: '', // Will be set from the item name
    url,
    method: (postmanRequest.method === 'PATCH' || postmanRequest.method === 'HEAD' || postmanRequest.method === 'OPTIONS') ? 'GET' : (postmanRequest.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE',
    headers: convertHeaders(postmanRequest.header),
    queryParams,
    body: convertBody(postmanRequest.body)
  };
}

/**
 * Generates a simple unique ID for requests
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Parses a Postman collection and converts it to the app's format
 */
export function parsePostmanCollection(postmanCollection: PostmanCollection): ParsedCollection {
  const folders = processItems(postmanCollection.item);
  
  // Extract all requests to get sample methods
  const allRequests: WebRsRequest[] = [];
  folders.forEach(folder => {
    folder.requests.forEach(request => {
      allRequests.push(request);
    });
  });
  
  // Get unique methods
  const sampleMethods = Array.from(new Set(allRequests.map(req => req.method)));
  
  // Extract variables
  const variables = (postmanCollection.variable || []).map(v => ({
    key: v.key,
    value: v.value
  }));
  
  return {
    name: postmanCollection.info.name,
    description: postmanCollection.info.description,
    variables,
    folders,
    totalRequests: allRequests.length,
    sampleMethods
  };
}

/**
 * Converts parsed collection to the app's Collection format
 */
export function convertToAppCollection(parsedCollection: ParsedCollection): Collection {
  const allRequests: WebRsRequest[] = [];
  
  // Set request names based on their folder context
  parsedCollection.folders.forEach(folder => {
    folder.requests.forEach((request, index) => {
      // Create a copy with a proper name
      const namedRequest: WebRsRequest = {
        ...request,
        name: request.name || `${folder.name} Request ${index + 1}`
      };
      allRequests.push(namedRequest);
    });
  });
  
  return {
    id: generateId(),
    name: parsedCollection.name,
    requests: allRequests
  };
}